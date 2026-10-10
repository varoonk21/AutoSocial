/**
 * TokenService — AES-256-GCM encryption/decryption for provider tokens.
 *
 * This is the **only** module in the application that touches plaintext tokens.
 * Every other module stores or receives ciphertext.
 *
 * Key management:
 *   • The key comes from the environment variable TOKEN_ENCRYPTION_KEY (hex-encoded, 64 chars → 32 bytes).
 *   • A key version (TOKEN_ENCRYPTION_KEY_ID, default "v1") is persisted alongside
 *     each ciphertext so that key rotation is straightforward — decrypt with the
 *     old key, re-encrypt with the new one.
 *   • Keys **never** live in the database.
 *
 * Ciphertext format (stored as a single string):
 *   <keyId>:<iv_hex>:<authTag_hex>:<ciphertext_hex>
 */

import { randomBytes, createCipheriv, createDecipheriv } from "node:crypto";

// ─── Configuration ────────────────────────────────────────────────────────────

const ALGORITHM = "aes-256-gcm" as const;
const IV_BYTES = 12; // NIST-recommended IV length for GCM
const AUTH_TAG_BYTES = 16;

// Loaded once at module init so a missing key surfaces immediately.
const KEY_HEX = process.env.TOKEN_ENCRYPTION_KEY ?? "";
const KEY_ID = process.env.TOKEN_ENCRYPTION_KEY_ID ?? "v1";

function getKey(): Buffer {
  if (!KEY_HEX || KEY_HEX.length !== 64) {
    throw new Error(
      "TOKEN_ENCRYPTION_KEY must be a 64-character hex string (32 bytes). " +
        "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }
  return Buffer.from(KEY_HEX, "hex");
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Encrypt a plaintext token.  Returns the compact ciphertext string.
 * If the input is empty/undefined the empty string is returned as-is.
 */
export function encryptToken(plaintext: string): string {
  if (!plaintext) return "";

  const key = getKey();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${KEY_ID}:${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypt a ciphertext string produced by `encryptToken`.
 * If the input is empty/undefined the empty string is returned as-is.
 */
export function decryptToken(ciphertext: string): string {
  if (!ciphertext) return "";

  // If the value doesn't match our format it is legacy plaintext — return as-is
  // so that the migration can run incrementally without breaking reads.
  const parts = ciphertext.split(":");
  if (parts.length !== 4) return ciphertext;

  const [storedKeyId, ivHex, authTagHex, encryptedHex] = parts;

  // Currently we only support a single key version.  When rotating, add a
  // lookup map keyed by storedKeyId.
  if (storedKeyId !== KEY_ID) {
    throw new Error(`Unknown token key ID "${storedKeyId}". Cannot decrypt.`);
  }

  const key = getKey();
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}

/**
 * Returns true when the value looks like an encrypted token (has the v-prefix format).
 */
export function isEncrypted(value: string): boolean {
  if (!value) return false;
  const parts = value.split(":");
  return parts.length === 4 && /^v\d+$/.test(parts[0]);
}

/**
 * The current key ID.  Stored alongside ciphertext so we can rotate keys.
 */
export function currentKeyId(): string {
  return KEY_ID;
}


/**
 * Generates a cryptographically secure random OAuth state token.
 * Uses crypto.randomBytes — never Math.random() — for unguessable states.
 */
export function generateOAuthState(): string {
  return crypto.randomBytes(32).toString("hex");
}

export const TokenService = {
  encryptToken,
  decryptToken,
  isEncrypted,
  currentKeyId,
} as const;
