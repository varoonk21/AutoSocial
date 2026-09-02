import express from "express";
import env from "../../config/env.config.js";

const router = express.Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

router.get("/config", (_req, res) => {
  res.json({ s3PublicUrl: env.S3_PUBLIC_URL || "" });
});

export default router;
