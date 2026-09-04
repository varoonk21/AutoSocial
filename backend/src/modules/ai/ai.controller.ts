import type { Request, Response } from "express";
import * as aiService from "./ai.service.js";
import { uploadToS3 } from "../../lib/s3.js";
import { saveMediaMetadata } from "../media/media.service.js";
import { sendSuccess } from "../../utils/response.util.js";
import type { GeneratePostsInput, SeparatePostsInput, GenerateImageInput, GenerateContentFromImageInput, EnhanceContentInput } from "./ai.validation.js";

interface AuthRequest extends Request {
  user?: { _id: string };
}

async function generatePostsHandler(req: AuthRequest, res: Response) {
  const { content, url } = req.body as GeneratePostsInput;
  const suggestions = url
    ? await aiService.generatePostsFromUrl(url, req.user!._id)
    : await aiService.generatePosts(content!, req.user!._id);
  sendSuccess(res, { suggestions });
}

async function separatePostsHandler(req: AuthRequest, res: Response) {
  const { content, len } = req.body as SeparatePostsInput;
  const result = await aiService.separatePosts(content, len);
  sendSuccess(res, result);
}

async function generateImageHandler(req: AuthRequest, res: Response) {
  const { prompt, vertical, referenceImageUrl } = req.body as GenerateImageInput;

  let base64: string;
  if (referenceImageUrl) {
    base64 = await aiService.generateImageWithReference(referenceImageUrl, prompt, vertical);
  } else {
    base64 = await aiService.generateImage(prompt, vertical);
  }

  const imageBuffer = Buffer.from(base64, "base64");
  const key = `users/${req.user!._id}/images/ai-${Date.now()}.png`;

  await uploadToS3(key, imageBuffer, "image/png");

  const media = await saveMediaMetadata(req.user!._id, {
    key,
    originalName: `ai-${prompt
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .slice(0, 20)}.png`,
    contentType: "image/png",
    fileSize: imageBuffer.length,
    source: "ai",
  });

  sendSuccess(res, { media: media.toObject() });
}

async function generateContentFromImageHandler(req: AuthRequest, res: Response) {
  const { imageUrl } = req.body as GenerateContentFromImageInput;
  const suggestions = await aiService.generateContentFromImage(imageUrl, req.user!._id);
  sendSuccess(res, { suggestions });
}

async function enhanceContentHandler(req: AuthRequest, res: Response) {
  const { content, enhanceType } = req.body as EnhanceContentInput;
  const suggestions = await aiService.enhanceContent(content, enhanceType, req.user!._id);
  sendSuccess(res, { suggestions });
}

export {
  generatePostsHandler,
  separatePostsHandler,
  generateImageHandler,
  generateContentFromImageHandler,
  enhanceContentHandler,
};
