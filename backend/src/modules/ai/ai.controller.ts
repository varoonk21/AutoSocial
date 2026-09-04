import type { Request, Response } from "express";
import * as aiService from "./ai.service.js";
import { uploadToS3 } from "../../lib/s3.js";
import { saveMediaMetadata } from "../media/media.service.js";
import { sendSuccess } from "../../utils/response.util.js";
import type { GenerateImageInput, GenerateContentFromImageInput, EnhanceContentInput } from "./ai.validation.js";


async function generateImageHandler(req: Request, res: Response) {
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

async function generateContentFromImageHandler(req: Request, res: Response) {
  const { imageUrl } = req.body as GenerateContentFromImageInput;
  const content = await aiService.generateContentFromImage(imageUrl, req.user!._id);
  sendSuccess(res, content);
}

async function enhanceContentHandler(req: Request, res: Response) {
  const { content, enhanceType } = req.body as EnhanceContentInput;
  const suggestion = await aiService.enhanceContent(content, enhanceType, req.user!._id);
  sendSuccess(res, suggestion);
}

export {
  generateImageHandler,
  generateContentFromImageHandler,
  enhanceContentHandler,
};
