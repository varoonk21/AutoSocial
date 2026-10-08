/**
 * token.service.test.js
 *
 * Tests for the TokenService:
 *   1. encryptToken produces ciphertext that does NOT contain the plaintext.
 *   2. decryptToken round-trips back to the original plaintext.
 *   3. Empty/falsy inputs pass through unchanged.
 *   4. isEncrypted correctly identifies encrypted vs plaintext strings.
 *   5. Tampered ciphertext throws on decrypt.
 *   6. Wrong key ID throws on decrypt.
 *   7. Integration: simulates what DB stores is ciphertext, and decryption
 *      only happens through TokenService.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Ensure the test key is set before importing the service
process.env.TOKEN_ENCRYPTION_KEY = 'a'.repeat(64);    // 32 bytes of 0xAA
process.env.TOKEN_ENCRYPTION_KEY_ID = 'v1';

const { encryptToken, decryptToken, isEncrypted, currentKeyId } =
  await import('../dist/lib/token.service.js');

// ─── Basic Round-Trip ─────────────────────────────────────────────────────────

describe('TokenService', () => {

  test('encryptToken returns ciphertext that does NOT contain the plaintext', () => {
    const plaintext = 'EAALong0AuthToken12345XYZ';
    const ciphertext = encryptToken(plaintext);

    assert.ok(ciphertext.length > 0, 'ciphertext should not be empty');
    assert.ok(!ciphertext.includes(plaintext),
      'ciphertext must not contain the raw plaintext token');
  });

  test('decryptToken round-trips back to the original plaintext', () => {
    const plaintext = 'EAALong0AuthToken12345XYZ';
    const ciphertext = encryptToken(plaintext);
    const decrypted = decryptToken(ciphertext);

    assert.equal(decrypted, plaintext);
  });

  test('ciphertext format is keyId:iv:authTag:encrypted (4 hex-delimited parts)', () => {
    const ciphertext = encryptToken('some-token');
    const parts = ciphertext.split(':');
    assert.equal(parts.length, 4, 'must have exactly 4 colon-separated parts');
    assert.equal(parts[0], 'v1', 'first part must be the key ID');

    // iv = 12 bytes = 24 hex chars
    assert.equal(parts[1].length, 24, 'IV must be 24 hex chars (12 bytes)');
    // authTag = 16 bytes = 32 hex chars
    assert.equal(parts[2].length, 32, 'auth tag must be 32 hex chars (16 bytes)');
    // encrypted portion should be >0 hex chars
    assert.ok(parts[3].length > 0, 'encrypted payload must be non-empty');
  });

  test('each encryption produces a different ciphertext (random IV)', () => {
    const plaintext = 'same-token-value';
    const c1 = encryptToken(plaintext);
    const c2 = encryptToken(plaintext);
    assert.notEqual(c1, c2, 'two encryptions of the same value must differ (unique IV)');

    // But both decrypt to the same value
    assert.equal(decryptToken(c1), plaintext);
    assert.equal(decryptToken(c2), plaintext);
  });

  // ─── Edge Cases ───────────────────────────────────────────────────────────

  test('empty string passes through unchanged', () => {
    assert.equal(encryptToken(''), '');
    assert.equal(decryptToken(''), '');
  });

  test('undefined/null-ish input passes through unchanged', () => {
    assert.equal(encryptToken(undefined), '');
    assert.equal(encryptToken(null), '');
    assert.equal(decryptToken(undefined), '');
    assert.equal(decryptToken(null), '');
  });

  // ─── isEncrypted Detection ────────────────────────────────────────────────

  test('isEncrypted returns true for encrypted values', () => {
    const ciphertext = encryptToken('my-secret-token');
    assert.ok(isEncrypted(ciphertext));
  });

  test('isEncrypted returns false for plaintext strings', () => {
    assert.ok(!isEncrypted('EAALong0AuthToken12345XYZ'));
    assert.ok(!isEncrypted('some-plaintext'));
    assert.ok(!isEncrypted(''));
  });

  // ─── Tampering Detection ──────────────────────────────────────────────────

  test('tampered ciphertext throws on decrypt (GCM auth tag check)', () => {
    const ciphertext = encryptToken('sensitive-value');
    const parts = ciphertext.split(':');

    // Flip a character in the encrypted portion
    const tampered = parts[3][0] === 'a' ? 'b' : 'a';
    parts[3] = tampered + parts[3].slice(1);
    const tamperedCiphertext = parts.join(':');

    assert.throws(
      () => decryptToken(tamperedCiphertext),
      /Unsupported state|unable to authenticate/i,
      'decrypting tampered ciphertext must throw'
    );
  });

  test('wrong key ID throws on decrypt', () => {
    const ciphertext = encryptToken('my-token');
    const parts = ciphertext.split(':');
    parts[0] = 'v99'; // non-existent key version
    const modified = parts.join(':');

    assert.throws(
      () => decryptToken(modified),
      /Unknown token key ID/,
      'decrypting with unknown key ID must throw'
    );
  });

  // ─── currentKeyId ─────────────────────────────────────────────────────────

  test('currentKeyId returns the configured key ID', () => {
    assert.equal(currentKeyId(), 'v1');
  });

  // ─── Legacy Plaintext Passthrough ─────────────────────────────────────────

  test('decryptToken passes through legacy plaintext tokens (no colons)', () => {
    const legacyToken = 'EAAGalong_legacy_token_with_no_colons';
    assert.equal(decryptToken(legacyToken), legacyToken,
      'legacy plaintext should pass through for incremental migration');
  });

  // ─── Integration Simulation ───────────────────────────────────────────────

  test('DB simulation: stored value is ciphertext, only service can decrypt', () => {
    const rawAccessToken = 'EAAGm0PX4ZCpsBOxxxxxxYYYYYzzzzzz';
    const rawRefreshToken = 'REFRESH_abc123_secret';

    // Simulate what the controller does on save:
    const dbRecord = {
      token: encryptToken(rawAccessToken),
      refreshToken: encryptToken(rawRefreshToken),
      tokenKeyId: currentKeyId(),
    };

    // What is stored in DB must NOT contain raw tokens
    assert.ok(!dbRecord.token.includes(rawAccessToken),
      'DB token field must be ciphertext');
    assert.ok(!dbRecord.refreshToken.includes(rawRefreshToken),
      'DB refreshToken field must be ciphertext');
    assert.ok(isEncrypted(dbRecord.token),
      'DB token must pass isEncrypted check');
    assert.ok(isEncrypted(dbRecord.refreshToken),
      'DB refreshToken must pass isEncrypted check');

    // Simulate what publish job does to read:
    const usableToken = decryptToken(dbRecord.token);
    const usableRefresh = decryptToken(dbRecord.refreshToken);

    assert.equal(usableToken, rawAccessToken,
      'decrypted token must match original');
    assert.equal(usableRefresh, rawRefreshToken,
      'decrypted refreshToken must match original');
  });
});
