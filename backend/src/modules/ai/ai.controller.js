import { BrandKit } from "../../models/index.js";
import { generatePosts, generatePostsFromUrl, separatePosts, generateImage, generateImageWithReference } from "./ai.service.js";
import { uploadToS3 } from "../../lib/s3.js";
import { saveMediaMetadata } from "../media/media.service.js";

async function generatePostsHandler(req, res) {
  const { content, url } = req.body;

  if (!content && !url) {
    return res.status(400).json({ error: "Provide either content text or a URL" });
  }

  const brandKit = await BrandKit.findOne({ userId: req.user._id });
  const suggestions = url ? await generatePostsFromUrl(url, brandKit) : await generatePosts(content, brandKit);

  res.json({ suggestions });
}

async function separatePostsHandler(req, res) {
  const { content, len = 280 } = req.body;
  if (!content) return res.status(400).json({ error: "content is required" });

  const result = await separatePosts(content, Number(len));
  res.json(result);
}

async function generateImageHandler(req, res) {
  const { prompt, vertical = false, referenceImageUrl } = req.body;
  if (!prompt) return res.status(400).json({ error: "prompt is required" });

  let base64;
  if (referenceImageUrl) {
    base64 = await generateImageWithReference(referenceImageUrl, prompt, !!vertical);
  } else {
    base64 = await generateImage(prompt, !!vertical);
  }

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

  res.json({ media: media.toObject() });
}

export { generatePostsHandler, separatePostsHandler, generateImageHandler };
