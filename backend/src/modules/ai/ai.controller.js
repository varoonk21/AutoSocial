import { BrandKit } from "../../models/index.js";
import { generatePosts, generatePostsFromUrl, separatePosts, generateImage } from "./ai.service.js";
import { uploadToS3 } from "../../lib/s3.js";
import { saveMediaMetadata } from "../media/media.service.js";
import fs from "fs";

async function generatePostsHandler(req, res) {
  try {
    const { content, url } = req.body;

    if (!content && !url) {
      return res.status(400).json({ error: "Provide either content text or a URL" });
    }

    const brandKit = await BrandKit.findOne({ userId: req.user._id });
    const suggestions = url ? await generatePostsFromUrl(url, brandKit) : await generatePosts(content, brandKit);

    res.json({ suggestions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function separatePostsHandler(req, res) {
  try {
    const { content, len = 280 } = req.body;
    if (!content) return res.status(400).json({ error: "content is required" });

    const result = await separatePosts(content, Number(len));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function generateImageHandler(req, res) {
  try {
    const { prompt, vertical = false } = req.body;
    if (!prompt) return res.status(400).json({ error: "prompt is required" });

    const base64 = await generateImage(prompt, !!vertical);

    const imageBuffer = Buffer.from(base64, "base64");
    const key = `users/${req.user._id}/images/ai-${Date.now()}.png`;

    await uploadToS3(key, imageBuffer, "image/png");

    const media = await saveMediaMetadata(req.user._id, {
      key,
      originalName: `ai-${prompt
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .slice(0, 20)}.png`,
      contentType: "image/png",
      fileSize: imageBuffer.length,
      source: "ai",
    });

    const { getS3Url } = await import("../../lib/s3.js");
    const path = await getS3Url(key);

    res.json({ media: { ...media.toObject(), path } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export { generatePostsHandler, separatePostsHandler, generateImageHandler };
