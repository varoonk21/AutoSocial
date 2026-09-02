import app from "./app.js";
import { connectDB } from "./config/db.js";
import env from "./config/env.config.js";
import { logger } from "./utils/logger.util.js";
import { startScheduler } from "./services/scheduler.service.js";

async function start(): Promise<void> {
  await connectDB();

  app.listen(env.PORT, () => {
    logger.info(`Server running on http://localhost:${env.PORT}`);
  });

  startScheduler(60 * 1000);
}

start().catch((err: Error) => {
  logger.error({ err }, "Failed to start");
  process.exit(1);
});
