import env from "../../config/env.config.js";
import { sendSuccess } from "../../utils/response.util.js";

function getHealth(_req, res) {
  sendSuccess(res, { status: "ok", timestamp: new Date() });
}

function getConfig(_req, res) {
  sendSuccess(res, { s3PublicUrl: env.S3_PUBLIC_URL || "" });
}

export { getHealth, getConfig };
