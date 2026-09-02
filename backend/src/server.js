import app from "./app.js";
import { connectDB } from "./config/db.js";
import env from "./config/env.config.js";
import { startScheduler } from "./services/scheduler.service.js";

async function start() {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
  });

  startScheduler(60 * 1000);
}

start().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});
