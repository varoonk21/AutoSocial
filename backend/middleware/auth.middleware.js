/**
 * Auth Middleware
 *
 * Extracted and simplified from:
 *   apps/backend/src/services/auth/auth.middleware.ts
 *
 * Verifies the JWT from:
 *   1. Cookie: 'auth'
 *   2. Authorization header: 'Bearer <token>'
 *
 * Attaches the authenticated user to req.user.
 *
 * Usage:
 *   const { requireAuth } = require('./middleware/auth.middleware');
 *   router.get('/protected', requireAuth, handler);
 */

const { verifyToken, getUserById } = require('../services/auth.service');

/**
 * Middleware that requires authentication.
 * Returns 401 if token is missing or invalid.
 */
async function requireAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = verifyToken(token);
    const user = await getUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Optional auth middleware - attaches user if token present, but doesn't block.
 */
async function optionalAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (token) {
      const decoded = verifyToken(token);
      const user = await getUserById(decoded.id);
      req.user = user;
    }
  } catch {
    // No user attached - public route continues
  }
  next();
}

function extractToken(req) {
  // Check Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // Fall back to cookie
  if (req.cookies && req.cookies.auth) {
    return req.cookies.auth;
  }

  return null;
}

module.exports = { requireAuth, optionalAuth };
