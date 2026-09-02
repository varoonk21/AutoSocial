import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../config/auth.js";
import { User } from "../models/index.js";

export async function requireAuth(req, res, next) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    if (!session) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const user = await User.findById(session.user.id);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    req.user = user;
    req.session = session.session;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
