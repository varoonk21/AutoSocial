import { z } from "zod";

export const generatePostsSchema = z.object({
  content: z.string().min(1, "Content is required").optional(),
  url: z.string().url("Invalid URL").optional(),
}).refine((data) => data.content || data.url, {
  message: "Either content or url is required",
});

export const separatePostsSchema = z.object({
  content: z.string().min(1, "Content is required"),
  len: z.number().int().min(100).max(10000).optional().default(280),
});

export const generateImageSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  vertical: z.boolean().optional().default(false),
  referenceImageUrl: z.string().url("Invalid URL").optional(),
});

export const generateContentFromImageSchema = z.object({
  imageUrl: z.string().url("Invalid image URL"),
});

export const enhanceContentSchema = z.object({
  content: z.string().min(1, "Content is required"),
  enhanceType: z.enum(["caption", "hashtags", "general"]).optional().default("general"),
});
