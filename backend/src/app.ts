import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./config/auth.js";
import { serveFrontend } from "./static/serveFrontend.js";
import { requestLogger } from "./middleware/requestLogger.middleware.js";
import { logger } from "./utils/logger.util.js";
import apiRoutes from "./api.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(requestLogger);
app.all("/api/v1/auth/{*path}", toNodeHandler(auth));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/", apiRoutes);

const frontendDist = path.join(__dirname, "../../frontend/dist");
serveFrontend(app, frontendDist);

app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err }, "Unhandled error");
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

export default app;
