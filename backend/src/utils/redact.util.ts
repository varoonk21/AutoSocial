/**
 * redact.util.ts
 *
 * Central log redaction. Every log line emitted through the pino logger in
 * logger.util.ts is passed through redactLogValue() via a pino `logMethod`
 * hook, so secrets are scrubbed no matter where they enter the log pipeline:
 *
 *   - Tokens            (access/refresh/id tokens, JWTs, provider-prefixed tokens)
 *   - Authorization     headers ("Bearer …", "Basic …", "OAuth …", header objects)
 *   - OAuth state       (state keys and state=… query/form params)
 *   - Presigned strings (X-Amz-Signature / X-Amz-Credential / X-Amz-Security-Token,
 *                        AWSAccessKeyId, sig=… etc.)
 *   - Provider error bodies (BadBodyError/RefreshTokenError `responseBody` and any
 *                        echoed token inside error messages/stacks)
 */

export const REDACTED = "[REDACTED]";

const MAX_DEPTH = 25;

/** Object keys whose values are replaced wholesale (case-insensitive substring match). */
const SENSITIVE_KEY_PARTS = [
  "token",
  "secret",
  "password",
  "passwd",
  "authorization",
  "credential",
  "apikey",
  "api_key",
  "private_key",
  "client_secret",
  "signature",
  "cookie",
  "oauth",
  "x-amz-",
  "code_verifier",
];

/** Exact keys redacted on top of the substring rules. */
const SENSITIVE_KEYS_EXACT = new Set([
  "state",
  "sig",
  "auth",
  "pwd",
  "bearer",
  "session",
  "sessionid",
  "session_id",
]);

export function isSensitiveKey(key: string): boolean {
  if (typeof key !== "string") return false;
  const k = key.toLowerCase();
  if (SENSITIVE_KEYS_EXACT.has(k)) return true;
  return SENSITIVE_KEY_PARTS.some((part) => k.includes(part));
}

// ─── String patterns ─────────────────────────────────────────────────────────

/** JSON Web Tokens: header.payload.signature */
const JWT_RE = /\beyJ[A-Za-z0-9_-]{4,}\.[A-Za-z0-9_-]{4,}\.[A-Za-z0-9_-]{4,}/g;

/**
 * HTTP auth schemes: "Bearer xyz", "Basic xyz", "OAuth xyz", "Token xyz".
 * Value must be token-like (>=10 chars incl. at least one digit) so prose
 * like "Token validation failed" is left alone.
 */
const AUTH_SCHEME_RE =
  /\b(Bearer|Basic|OAuth|Token)\s+(?=[A-Za-z0-9._~+/=-]{8,}\d)[A-Za-z0-9._~+/=-]{10,}/gi;

/** authorization: <value> in dumped header strings (value may already be scheme-redacted). */
const AUTH_HEADER_RE =
  /\b(authorization\b["']?\s*[:=]\s*["']?)([^\s"',;&}\]]+)/gi;

/**
 * Sensitive query/form params in URLs and bodies:
 *   ?access_token=…&client_secret=…, X-Amz-Signature=…, state=…, sig=… etc.
 */
const SENSITIVE_PARAM_RE =
  /\b(access_token|refresh_token|id_token|client_secret|api[_-]?key|apikey|token|secret|password|signature|sig|code|state|oauth_token|oauth_verifier|code_verifier|AWSAccessKeyId|X-Amz-Signature|X-Amz-Credential|X-Amz-Security-Token)(\s*=\s*)([^&\s"'<>}\]]+)/gi;

/** Common provider/API token shapes echoed in error bodies. */
const TOKEN_PREFIX_RE =
  /\b(EAAB[A-Za-z0-9]{10,}|IGQVJ[A-Za-z0-9]{10,}|AQ[A-Za-z0-9]{20,}|gh[pousr]_[A-Za-z0-9]{16,}|sk-[A-Za-z0-9_-]{16,}|xox[baprs]-[A-Za-z0-9-]{10,}|AKIA[0-9A-Z]{16}|SG\.[A-Za-z0-9_-]{16,})/g;

/** Redacts secrets embedded anywhere inside a free-form string. */
export function redactString(input: string): string {
  if (typeof input !== "string" || input.length === 0) return input;
  return input
    .replace(JWT_RE, REDACTED)
    .replace(AUTH_SCHEME_RE, `$1 ${REDACTED}`)
    .replace(AUTH_HEADER_RE, `$1${REDACTED}`)
    .replace(SENSITIVE_PARAM_RE, `$1$2${REDACTED}`)
    .replace(TOKEN_PREFIX_RE, REDACTED);
}

// ─── Deep value redaction ────────────────────────────────────────────────────

function redactError(err: Error, seen: WeakSet<object>, depth: number): Error {
  // Clone with the original prototype so pino's err serializer still applies.
  const clone: any = Object.create(Object.getPrototypeOf(err));
  Object.defineProperty(clone, "message", {
    value: redactString(err.message),
    enumerable: false,
    writable: true,
    configurable: true,
  });
  if (typeof err.stack === "string") {
    Object.defineProperty(clone, "stack", {
      value: redactString(err.stack),
      enumerable: false,
      writable: true,
      configurable: true,
    });
  }
  clone.name = err.name;
  for (const key of Object.keys(err)) {
    clone[key] = isSensitiveKey(key)
      ? REDACTED
      : redactValue((err as any)[key], seen, depth + 1);
  }
  return clone;
}

function redactValue(value: any, seen: WeakSet<object>, depth: number): any {
  if (value === null || value === undefined) return value;
  const t = typeof value;
  if (t === "string") return redactString(value as string);
  if (t !== "object") return value;
  if (depth > MAX_DEPTH) return REDACTED;
  if (seen.has(value)) return "[Circular]";
  if (value instanceof Date) return value;
  if (Buffer.isBuffer(value)) return value;
  seen.add(value);

  if (value instanceof Error) return redactError(value, seen, depth);
  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item, seen, depth + 1));
  }

  const out: Record<string, any> = {};
  for (const [key, val] of Object.entries(value)) {
    out[key] = isSensitiveKey(key)
      ? REDACTED
      : redactValue(val, seen, depth + 1);
  }
  return out;
}

/**
 * Entry point used by the pino logMethod hook. Redacts a single log argument
 * (merging object, message string, or interpolated value) without mutating it.
 */
export function redactLogValue(value: any): any {
  if (typeof value === "string") return redactString(value);
  if (value === null || typeof value !== "object") return value;
  return redactValue(value, new WeakSet(), 0);
}
