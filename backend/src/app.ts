import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./config/auth.js";

import integrationsRoutes from "./routes/integrations.routes.js";
import postsRoutes from "./routes/posts.routes.js";
import mediaRoutes from "./modules/media/media.routes.js";
import brandKitRoutes from "./modules/brandkit/brandkit.routes.js";
import serverRoutes from "./modules/server/server.routes.js";
import settingsRoutes from "./modules/settings/settings.routes.js";
import { serveFrontend } from "./static/serveFrontend.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────

app.all("/api/v1/auth/{*path}", toNodeHandler(auth));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/", serverRoutes);
app.use("/api/v1/integrations", integrationsRoutes);
app.use("/api/v1/posts", postsRoutes);
app.use("/api/v1/media", mediaRoutes);
app.use("/api/v1/brand-kit", brandKitRoutes);
app.use("/api/v1/settings", settingsRoutes);

const frontendDist = path.join(__dirname, "../../frontend/dist");
serveFrontend(app, frontendDist);

app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

export default app;
