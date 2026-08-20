/**
 * Integrations Controller
 *
 * Handles OAuth flows and connected account management.
 * Extracted from: apps/backend/src/api/routes/integrations.controller.ts
 *
 * OAuth State Storage:
 *   The production system uses Redis. Here we use an in-memory Map with TTL.
 *   This works for single-server deployments. For multi-server, use Redis.
 */

const { Integration } = require('../models');
const { getProvider } = require('../services/scheduler.service');
const { makeId } = require('../utils/makeId');

// In-memory OAuth state store (TTL: 10 minutes)
// For production with multiple servers, replace with Redis
const oauthStateStore = new Map();
const STATE_TTL_MS = 10 * 60 * 1000;

function setOAuthState(state, data) {
  oauthStateStore.set(state, { ...data, expiresAt: Date.now() + STATE_TTL_MS });
}

function getOAuthState(state) {
  const entry = oauthStateStore.get(state);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    oauthStateStore.delete(state);
    return null;
  }
  return entry;
}

// Cleanup expired states every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of oauthStateStore.entries()) {
    if (now > value.expiresAt) oauthStateStore.delete(key);
  }
}, 5 * 60 * 1000);

// ─── GET /integrations/list ───────────────────────────────────────────────────

async function listIntegrations(req, res) {
  try {
    const integrations = await Integration.find({
      userId: req.user._id,
    }).select('-token -refreshToken');

    res.json({ integrations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ─── GET /integrations/social/:provider ────────────────────────────────────────
// Step 1: Get OAuth URL for a social provider

async function getOAuthUrl(req, res) {
  try {
    const { provider } = req.params;
    const socialProvider = getProvider(provider);

    const { url, codeVerifier, state } = await socialProvider.generateAuthUrl();

    // Store state and codeVerifier in memory for callback validation
    setOAuthState(state, {
      codeVerifier,
      userId: req.user._id.toString(),
      provider,
    });

    res.json({ url });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// ─── GET /integrations/social/:provider/callback ──────────────────────────────
// Step 2: Handle OAuth callback and save tokens

async function oauthCallback(req, res) {
  try {
    const { provider } = req.params;
    const { code, state, oauth_verifier } = req.query;

    const stateData = getOAuthState(state);
    if (!stateData) {
      return res.status(400).json({ error: 'Invalid or expired OAuth state. Please try again.' });
    }

    const socialProvider = getProvider(provider);
    oauthStateStore.delete(state); // One-time use

    // Exchange code for tokens
    const authResult = await socialProvider.authenticate({
      code: code || oauth_verifier, // OAuth1 uses oauth_verifier
      codeVerifier: stateData.codeVerifier,
    });

    // For providers that require an extra step (e.g., Facebook Page selection),
    // return the auth result with a flag so the frontend can show the picker
    if (socialProvider.isBetweenSteps) {
      // Save a temporary state for the page selection callback
      const tempState = makeId(20);
      setOAuthState(tempState, {
        userId: stateData.userId,
        provider,
        authResult,
      });
      return res.json({ inBetweenSteps: true, tempState, ...authResult });
    }

    // Save the integration directly
    const integration = await saveIntegration(stateData.userId, provider, authResult, {});
    res.json({ success: true, integration });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// ─── POST /integrations/social/:provider/page ─────────────────────────────────
// Step 3 (optional): Save selected page/account for providers that need it

async function savePage(req, res) {
  try {
    const { provider } = req.params;
    const { tempState, pageData } = req.body;

    const stateData = getOAuthState(tempState);
    if (!stateData) {
      return res.status(400).json({ error: 'Invalid or expired state. Please reconnect.' });
    }

    const socialProvider = getProvider(provider);
    oauthStateStore.delete(tempState);

    // Get page-specific token and details
    const pageInfo = await socialProvider.fetchPageInformation(stateData.authResult.accessToken, pageData);

    const integration = await saveIntegration(
      stateData.userId,
      provider,
      {
        ...pageInfo,
        accessToken: pageInfo.access_token,
      },
      {}
    );

    res.json({ success: true, integration });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// ─── GET /integrations/social/:provider/pages ─────────────────────────────────
// Gets list of pages/accounts for providers with isBetweenSteps

async function getPages(req, res) {
  try {
    const { provider } = req.params;
    const { tempState } = req.query;

    const stateData = getOAuthState(tempState);
    if (!stateData) {
      return res.status(400).json({ error: 'Invalid or expired state. Please reconnect.' });
    }

    const socialProvider = getProvider(provider);
    const pages = await socialProvider.pages(stateData.authResult.accessToken);

    res.json({ pages });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// ─── DELETE /integrations/:id ─────────────────────────────────────────────────

async function deleteIntegration(req, res) {
  try {
    await Integration.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// ─── PUT /integrations/:id/disable ────────────────────────────────────────────

async function toggleDisable(req, res) {
  try {
    const { disabled } = req.body;
    const integration = await Integration.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { disabled: !!disabled },
      { new: true }
    ).select('-token -refreshToken');
    res.json({ integration });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// ─── Helper: Save or Update Integration ───────────────────────────────────────

async function saveIntegration(userId, provider, authResult, extraData = {}) {
  const tokenExpiration = authResult.expiresIn
    ? new Date(Date.now() + authResult.expiresIn * 1000)
    : null;

  const existingIntegration = await Integration.findOne({ userId, internalId: authResult.id });

  if (existingIntegration) {
    return Integration.findByIdAndUpdate(
      existingIntegration._id,
      {
        token: authResult.accessToken,
        refreshToken: authResult.refreshToken || '',
        tokenExpiration,
        name: authResult.name,
        picture: authResult.picture,
        profile: authResult.username,
        refreshNeeded: false,
        ...extraData,
      },
      { new: true }
    ).select('-token -refreshToken');
  }

  return Integration.create({
    userId,
    internalId: authResult.id,
    providerIdentifier: provider,
    name: authResult.name,
    picture: authResult.picture || '',
    token: authResult.accessToken,
    refreshToken: authResult.refreshToken || '',
    tokenExpiration,
    profile: authResult.username,
    additionalSettings: JSON.stringify(authResult.additionalSettings || []),
    ...extraData,
  });
}

module.exports = {
  listIntegrations,
  getOAuthUrl,
  oauthCallback,
  getPages,
  savePage,
  deleteIntegration,
  toggleDisable,
};
