/**
 * log.redaction.test.js
 *
 * Tests for central log redaction (utils/redact.util.ts + the pino logMethod
 * hook in utils/logger.util.ts):
 *   1. Tokens, Authorization headers, OAuth state, presigned query params and
 *      provider-prefixed tokens are scrubbed from strings and nested objects.
 *   2. Errors (BadBodyError / RefreshTokenError) are logged with redacted
 *      messages, stacks and provider error bodies — without mutating the
 *      original error.
 *   3. End-to-end: a provider error echoing a token in its response body is
 *      redacted in the actual log output.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Writable } from 'node:stream';

// Env must be set before importing modules that pull in env.config
process.env.NODE_ENV = 'test';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.DATABASE_URL = 'mongodb://localhost/autosocial-test';
process.env.BETTER_AUTH_SECRET = 'b'.repeat(32);
process.env.LOG_LEVEL = 'info';

const { createLogger } = await import('../dist/utils/logger.util.js');
const { redactString, redactLogValue, isSensitiveKey, REDACTED } =
  await import('../dist/utils/redact.util.js');
const { BadBodyError, RefreshTokenError } =
  await import('../dist/social/base/SocialProvider.js');

const FB_TOKEN = 'EAABwzIm9PlusSecretTokenXYZ12345';
const BEARER_TOKEN = 'ghp_ABCDEFGhijklmnopQRSTUVwx1234567890';
const JWT =
  'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';

function captureLogger() {
  const chunks = [];
  const stream = new Writable({
    write(chunk, _enc, cb) {
      chunks.push(chunk.toString());
      cb();
    },
  });
  return { logger: createLogger(stream), output: () => chunks.join('\n') };
}

// ─── redactString ────────────────────────────────────────────────────────────

describe('redactString', () => {
  test('redacts access_token / client_secret / refresh_token query params in URLs', () => {
    const url =
      `https://graph.facebook.com/v19.0/me/feed?access_token=${FB_TOKEN}` +
      `&client_secret=supersecret99&refresh_token=refreshtok123&fields=id,message`;
    const out = redactString(url);

    assert.ok(!out.includes(FB_TOKEN), 'access token must be redacted');
    assert.ok(!out.includes('supersecret99'), 'client secret must be redacted');
    assert.ok(!out.includes('refreshtok123'), 'refresh token must be redacted');
    assert.ok(out.includes('access_token=' + REDACTED), 'param name preserved');
    assert.ok(out.includes('fields=id,message'), 'benign params preserved');
  });

  test('redacts presigned (S3/R2) query string credentials', () => {
    const presigned =
      'https://cdn.example.com/media.mp4' +
      '?X-Amz-Algorithm=AWS4-HMAC-SHA256' +
      '&X-Amz-Credential=AKIASECRETKEY%2F20261010' +
      '&X-Amz-Date=20261010T000000Z' +
      '&X-Amz-Expires=900' +
      '&X-Amz-Signature=deadbeefcafebabe1234' +
      '&X-Amz-Security-Token=sessiontoken12345';
    const out = redactString(presigned);

    assert.ok(!out.includes('AKIASECRETKEY'), 'credential must be redacted');
    assert.ok(!out.includes('deadbeefcafebabe1234'), 'signature must be redacted');
    assert.ok(!out.includes('sessiontoken12345'), 'security token must be redacted');
    assert.ok(out.includes('X-Amz-Expires=900'), 'non-secret param preserved');
    assert.ok(out.includes('X-Amz-Algorithm=AWS4-HMAC-SHA256'), 'algorithm preserved');
  });

  test('redacts Authorization header values (Bearer / Basic / OAuth)', () => {
    const out = redactString(
      `fetch failed; headers: {"Authorization":"Bearer ${BEARER_TOKEN}"} ` +
      `and Authorization: Basic dXNlcjpwYXNzd29yZDEyMw==`
    );
    assert.ok(!out.includes(BEARER_TOKEN), 'bearer token must be redacted');
    assert.ok(!out.includes('dXNlcjpwYXNzd29yZDEyMw'), 'basic creds must be redacted');
    assert.ok(out.includes(REDACTED), 'redaction marker present');
  });

  test('redacts JWTs', () => {
    const out = redactString(`claims: ${JWT} end`);
    assert.ok(!out.includes(JWT), 'JWT must be redacted');
    assert.ok(out.includes(REDACTED));
  });

  test('redacts OAuth state in state= query params', () => {
    const out = redactString('https://app.example/callback?code=authcode1&state=oauth-state-abc123');
    assert.ok(!out.includes('oauth-state-abc123'), 'state must be redacted');
    assert.ok(out.includes('code=' + REDACTED), 'auth code must be redacted');
  });

  test('redacts provider-prefixed tokens (Facebook EAAB…, GitHub ghp_…)', () => {
    const out = redactString(`Invalid token ${FB_TOKEN} for user; also ${BEARER_TOKEN}`);
    assert.ok(!out.includes(FB_TOKEN));
    assert.ok(!out.includes(BEARER_TOKEN));
  });

  test('leaves ordinary log text untouched', () => {
    const msg = 'Token validation failed after 3 attempts (status=500)';
    assert.equal(redactString(msg), msg);
  });
});

// ─── redactLogValue ──────────────────────────────────────────────────────────

describe('redactLogValue', () => {
  test('redacts sensitive keys at any depth (Authorization headers, tokens, state)', () => {
    const record = {
      provider: 'facebook',
      state: 'oauth-state-abc123',
      accessToken: FB_TOKEN,
      headers: { authorization: `Bearer ${BEARER_TOKEN}`, Accept: 'application/json' },
      nested: { deep: { refreshToken: 'refresh123', keep: 'visible' } },
    };
    const out = redactLogValue(record);

    assert.equal(out.state, REDACTED);
    assert.equal(out.accessToken, REDACTED);
    assert.equal(out.headers.authorization, REDACTED);
    assert.equal(out.headers.Accept, 'application/json', 'benign header preserved');
    assert.equal(out.nested.deep.refreshToken, REDACTED);
    assert.equal(out.nested.deep.keep, 'visible');
    assert.equal(out.provider, 'facebook');
  });

  test('redacts secrets inside arrays', () => {
    const out = redactLogValue({ urls: [`https://x.example/p?access_token=${FB_TOKEN}`] });
    assert.ok(!JSON.stringify(out).includes(FB_TOKEN));
  });

  test('clones errors and redacts message, stack and responseBody without mutating the original', () => {
    const body = JSON.stringify({ error: { message: `bad token ${FB_TOKEN}` } });
    const err = new BadBodyError('facebook', body, 'Request failed');

    const out = redactLogValue({ err });
    assert.ok(out.err instanceof Error, 'clone keeps Error prototype');
    assert.ok(!JSON.stringify(out).includes(FB_TOKEN), 'body token redacted');
    assert.equal(err.responseBody, body, 'original error is not mutated');
  });

  test('handles circular references', () => {
    const obj = { name: 'loop' };
    obj.self = obj;
    const out = redactLogValue(obj);
    assert.equal(out.self, '[Circular]');
  });

  test('isSensitiveKey matches token/secret/authorization-like keys', () => {
    for (const key of ['token', 'accessToken', 'access_token', 'clientSecret',
      'Authorization', 'x-amz-signature', 'oauthState', 'password']) {
      assert.ok(isSensitiveKey(key), `${key} should be sensitive`);
    }
    for (const key of ['provider', 'status', 'durationMs', 'requestId', 'path']) {
      assert.ok(!isSensitiveKey(key), `${key} should NOT be sensitive`);
    }
  });
});

// ─── Logger integration (pino logMethod hook) ────────────────────────────────

describe('logger redaction (end-to-end)', () => {
  test('provider error echoing a token is redacted in logs', () => {
    const { logger, output } = captureLogger();

    // Simulates Graph API rejecting a request while echoing the token back in
    // both the error message and the request URL — exactly what lands in
    // BadBodyError.responseBody (SocialProvider.fetch).
    const responseBody = JSON.stringify({
      error: {
        message: `Invalid OAuth access token: ${FB_TOKEN}`,
        type: 'OAuthException',
        code: 190,
      },
      request_url: `https://graph.facebook.com/v19.0/me/posts?access_token=${FB_TOKEN}&fields=id`,
    });
    const err = new BadBodyError('facebook', responseBody, 'Failed to publish post');

    logger.error({ err, provider: 'facebook' }, 'Failed to publish to facebook');

    const log = output();
    assert.ok(log.includes('"level":"ERROR"'), 'log line emitted');
    assert.ok(log.includes('Failed to publish to facebook'), 'message preserved');
    assert.ok(!log.includes(FB_TOKEN), 'echoed token must NOT appear in logs');
    assert.ok(log.includes(REDACTED), 'redaction marker present');
    assert.ok(log.includes('OAuthException'), 'non-secret body context preserved');
    assert.equal(err.responseBody, responseBody, 'original error body untouched');
  });

  test('RefreshTokenError responseBody with Bearer token is redacted in logs', () => {
    const { logger, output } = captureLogger();
    const responseBody = JSON.stringify({
      error: 'invalid_token',
      error_description: `Token ${BEARER_TOKEN} expired`,
    });
    logger.error({ err: new RefreshTokenError('linkedin', responseBody) }, 'Token refresh needed');

    const log = output();
    assert.ok(!log.includes(BEARER_TOKEN), 'bearer token must NOT appear in logs');
    assert.ok(log.includes(REDACTED));
    assert.ok(log.includes('invalid_token'), 'error code preserved');
  });

  test('OAuth state logged as an object field is redacted', () => {
    const { logger, output } = captureLogger();
    logger.info({ state: 'oauth-state-abc123', provider: 'instagram' }, 'OAuth callback');

    const log = output();
    assert.ok(!log.includes('oauth-state-abc123'));
    assert.ok(log.includes(REDACTED));
    assert.ok(log.includes('"provider":"instagram"'));
  });

  test('Authorization headers logged as objects are redacted', () => {
    const { logger, output } = captureLogger();
    logger.warn(
      { headers: { Authorization: `Bearer ${BEARER_TOKEN}`, 'Content-Type': 'application/json' } },
      'provider call failed'
    );

    const log = output();
    assert.ok(!log.includes(BEARER_TOKEN));
    assert.ok(log.includes(REDACTED));
    assert.ok(log.includes('application/json'));
  });

  test('presigned URLs in log messages have query credentials redacted', () => {
    const { logger, output } = captureLogger();
    logger.info(
      `upload failed for https://cdn.example.com/v.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIASECRET%2F20261010&X-Amz-Expires=900&X-Amz-Signature=deadbeefcafebabe1234`
    );

    const log = output();
    assert.ok(!log.includes('AKIASECRET'));
    assert.ok(!log.includes('deadbeefcafebabe1234'));
    assert.ok(log.includes('X-Amz-Expires=900'), 'non-secret param preserved');
  });
});
