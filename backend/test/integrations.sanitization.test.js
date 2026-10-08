import { test, mock } from 'node:test';
import assert from 'node:assert/strict';

// ─── Fixture secrets: must never appear in any response or log ───────────────

const USER_SECRET_TOKEN = 'USER_SECRET_TOKEN_FIXTURE';
const USER_SECRET_REFRESH = 'USER_SECRET_REFRESH_FIXTURE';
const PAGE_SECRET_TOKEN = 'PAGE_SECRET_TOKEN_FIXTURE';
const SECRETS = [USER_SECRET_TOKEN, USER_SECRET_REFRESH, PAGE_SECRET_TOKEN];

const DTO_KEYS = ['avatar', 'id', 'name', 'platform', 'status', 'targetId'];
const TOKEN_LIKE_KEY = /(token|secret|credential|authorization)/i;

// ─── Fakes ────────────────────────────────────────────────────────────────────

const calls = { create: [], find: [] };
const listDocs = [];
const logRecords = [];

function makeIntegrationDoc(overrides = {}) {
  return {
    _id: 'int_1',
    userId: 'user1',
    internalId: 'page1',
    providerIdentifier: 'facebook',
    name: 'My Page',
    picture: 'https://cdn.example/page.jpg',
    token: USER_SECRET_TOKEN,
    refreshToken: USER_SECRET_REFRESH,
    tokenExpiration: new Date('2030-01-01T00:00:00.000Z'),
    profile: 'mypage',
    disabled: false,
    refreshNeeded: false,
    inBetweenSteps: false,
    additionalSettings: '[]',
    postingTimes: '[]',
    ...overrides,
  };
}

const fakeIntegrationModel = {
  find() {
    return { select: () => Promise.resolve(listDocs.slice()) };
  },
  async findOne() {
    return null; // always take the create path
  },
  async create(doc) {
    calls.create.push(doc);
    return makeIntegrationDoc(doc);
  },
  findOneAndUpdate(filter, update) {
    return {
      select: () => Promise.resolve(makeIntegrationDoc({ disabled: !!update.disabled })),
    };
  },
  async findOneAndDelete() {
    return null;
  },
};

const fakeProviders = {
  facebook: {
    isBetweenSteps: true,
    async generateAuthUrl() {
      return { url: 'https://authorize.example/fb', codeVerifier: 'cv-fb', state: 'state-fb' };
    },
    async authenticate() {
      return {
        id: 'fb-user-1',
        accessToken: USER_SECRET_TOKEN,
        refreshToken: USER_SECRET_REFRESH,
        expiresIn: 3600,
        name: 'Test User',
        picture: 'https://cdn.example/user.jpg',
        username: 'testuser',
      };
    },
    async pages() {
      return [
        {
          id: 'page1',
          username: 'mypage',
          name: 'My Page',
          access_token: PAGE_SECRET_TOKEN,
          picture: { data: { url: 'https://cdn.example/page.jpg' } },
          category: 'Business',
        },
        {
          id: 'page2',
          name: 'Other Page',
          picture: { data: { url: 'https://cdn.example/other.jpg' } },
        },
      ];
    },
    async fetchPageInformation() {
      return null;
    },
  },
  linkedin: {
    isBetweenSteps: false,
    async generateAuthUrl() {
      return { url: 'https://authorize.example/li', codeVerifier: 'cv-li', state: 'state-li' };
    },
    async authenticate() {
      return {
        id: 'li-user-1',
        accessToken: USER_SECRET_TOKEN,
        refreshToken: USER_SECRET_REFRESH,
        expiresIn: 3600,
        name: 'Jane Doe',
        picture: '',
        username: 'jane-doe',
      };
    },
  },
};

const captureLog = (level) =>
  (...args) => logRecords.push({ level, args });
const fakeLogger = {
  info: captureLog('info'),
  warn: captureLog('warn'),
  error: captureLog('error'),
  debug: captureLog('debug'),
};

// ─── Mocks — registered before the controller module is loaded ────────────────

mock.module('../dist/models/index.js', {
  exports: { Integration: fakeIntegrationModel },
});
mock.module('../dist/services/scheduler.service.js', {
  exports: { getProvider: (name) => fakeProviders[name] },
});
mock.module('../dist/utils/logger.util.js', {
  exports: { logger: fakeLogger },
});

const controller = await import('../dist/controllers/integrations.controller.js');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeRes() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

function makeReq(overrides = {}) {
  return {
    user: { _id: { toString: () => 'user1' } },
    params: {},
    query: {},
    body: {},
    ...overrides,
  };
}

function assertNoTokenLikeFields(value, path = '$') {
  if (value === null || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    assert.ok(
      !TOKEN_LIKE_KEY.test(key),
      `token-like field "${key}" found at ${path}`
    );
    assertNoTokenLikeFields(child, `${path}.${key}`);
  }
}

function assertNoSecretValues(payload, label) {
  const json = JSON.stringify(payload);
  for (const secret of SECRETS) {
    assert.ok(!json.includes(secret), `secret value "${secret}" leaked in ${label}`);
  }
}

function assertSanitized(body, label) {
  assertNoTokenLikeFields(body, label);
  assertNoSecretValues(body, label);
}

function assertDTO(integration, label) {
  assert.deepEqual(
    Object.keys(integration).sort(),
    DTO_KEYS.slice().sort(),
    `${label}: IntegrationDTO must expose exactly id/platform/name/avatar/status/targetId`
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test('OAuth page-selection flow never exposes tokens', async () => {
  calls.create.length = 0;

  // Step 1: OAuth URL
  let res = makeRes();
  await controller.getOAuthUrl(makeReq({ params: { provider: 'facebook' } }), res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.url, 'https://authorize.example/fb');
  assertSanitized(res.body, 'getOAuthUrl');

  // Step 2: OAuth callback (between-steps → page picker)
  res = makeRes();
  await controller.oauthCallback(
    makeReq({
      params: { provider: 'facebook' },
      query: { code: 'code-1', state: 'state-fb' },
    }),
    res
  );
  assert.equal(res.statusCode, 200);
  assert.deepEqual(
    Object.keys(res.body).sort(),
    ['inBetweenSteps', 'tempState'],
    'callback must not spread the auth result into the response'
  );
  assertSanitized(res.body, 'oauthCallback (between-steps)');
  const tempState = res.body.tempState;
  assert.ok(tempState, 'tempState is required for the page picker');

  // Step 3: page list
  res = makeRes();
  await controller.getPages(
    makeReq({ params: { provider: 'facebook' }, query: { tempState } }),
    res
  );
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.pages.length, 2);
  assertSanitized(res.body, 'getPages');
  const page = res.body.pages[0];
  assert.deepEqual(Object.keys(page).sort(), ['id', 'name', 'picture', 'username']);
  assert.deepEqual(page.picture, { data: { url: 'https://cdn.example/page.jpg' } });

  // Step 4: save the selected page — client echoes only the sanitized page back
  res = makeRes();
  await controller.savePage(
    makeReq({ params: { provider: 'facebook' }, body: { tempState, pageData: page } }),
    res
  );
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assertSanitized(res.body, 'savePage');
  assertDTO(res.body.integration, 'savePage');
  assert.equal(res.body.integration.platform, 'facebook');
  assert.equal(res.body.integration.targetId, 'page1');
  assert.equal(res.body.integration.status, 'active');

  // The stored token came from server-side pages, not from the client payload
  assert.equal(calls.create.length, 1);
  assert.equal(calls.create[0].token, PAGE_SECRET_TOKEN);

  // Logs must not carry raw page payloads / tokens either
  assertNoSecretValues(logRecords, 'logs');
});

test('direct OAuth callback returns a sanitized IntegrationDTO', async () => {
  calls.create.length = 0;

  let res = makeRes();
  await controller.getOAuthUrl(makeReq({ params: { provider: 'linkedin' } }), res);
  assert.equal(res.statusCode, 200);

  res = makeRes();
  await controller.oauthCallback(
    makeReq({
      params: { provider: 'linkedin' },
      query: { code: 'code-2', state: 'state-li' },
    }),
    res
  );
  assert.equal(res.statusCode, 200);
  assert.deepEqual(Object.keys(res.body).sort(), ['integration', 'success']);
  assertSanitized(res.body, 'oauthCallback (direct)');
  assertDTO(res.body.integration, 'oauthCallback (direct)');
  assert.equal(res.body.integration.platform, 'linkedin');
  assert.equal(res.body.integration.targetId, 'li-user-1');
  assert.equal(res.body.integration.status, 'active');

  assert.equal(calls.create.length, 1);
  assert.equal(calls.create[0].token, USER_SECRET_TOKEN);
  assertNoSecretValues(logRecords, 'logs');
});

test('GET /integrations/list returns only IntegrationDTO fields', async () => {
  listDocs.length = 0;
  listDocs.push(
    makeIntegrationDoc(),
    makeIntegrationDoc({ _id: 'int_2', disabled: true }),
    makeIntegrationDoc({ _id: 'int_3', refreshNeeded: true })
  );

  const res = makeRes();
  await controller.listIntegrations(makeReq(), res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.integrations.length, 3);
  assertSanitized(res.body, 'listIntegrations');
  for (const integration of res.body.integrations) assertDTO(integration, 'listIntegrations');

  const [active, disabled, reauth] = res.body.integrations;
  assert.equal(active.status, 'active');
  assert.equal(disabled.status, 'disabled');
  assert.equal(reauth.status, 'reauth_required');
  listDocs.length = 0;
});

test('PUT /integrations/:id/disable returns a sanitized IntegrationDTO', async () => {
  const res = makeRes();
  await controller.toggleDisable(
    makeReq({ params: { id: 'int_1' }, body: { disabled: true } }),
    res
  );

  assert.equal(res.statusCode, 200);
  assertSanitized(res.body, 'toggleDisable');
  assertDTO(res.body.integration, 'toggleDisable');
  assert.equal(res.body.integration.status, 'disabled');
  assertNoSecretValues(logRecords, 'logs');
});
