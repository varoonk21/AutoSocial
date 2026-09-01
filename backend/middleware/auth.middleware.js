import { getSession } from "better-auth/api";

async function requireAuth(req, res, next) {
  try {
    const session = getSession(req);
    if (!session) {
      return res.status(401).json({ error: "Authentication required" });
    }
    req.user = session.user;
    req.session = session.session;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

async function optionalAuth(req, res, next) {
  try {
    const session = getSession(req);
    if (session) {
      req.user = session.user;
      req.session = session.session;
    }
  } catch {
    // No user attached - public route continues
  }
  next();
}

export { requireAuth, optionalAuth };
