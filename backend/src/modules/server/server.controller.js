import env from "../../config/env.config.js";

function getHealth(_req, res) {
  res.json({ status: "ok", timestamp: new Date() });
}

function getConfig(_req, res) {
  res.json({ s3PublicUrl: env.S3_PUBLIC_URL || "" });
}

export {
  getHealth,
  getConfig,
};
