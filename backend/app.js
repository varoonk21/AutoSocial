import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./config/auth.js";

import integrationsRoutes from "./routes/integrations.routes.js";
import postsRoutes from "./routes/posts.routes.js";
import mediaRoutes from "./routes/media.routes.js";
import env from "./config/env.config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────

app.all("/api/auth/{*path}", toNodeHandler(auth));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use("/api/integrations", integrationsRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/media", mediaRoutes);

// Health check
app.get("/api/health", (_req, res) => res.json({ status: "ok", timestamp: new Date() }));

const frontendDist = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendDist));
app.get("/*splat", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }
  res.sendFile(path.join(frontendDist, "index.html"), (err) => {
    if (err) {
      next();
    }
  });
});
// ─── Error Handler ─────────────────────────────────────────────────────────────

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

export default app;
