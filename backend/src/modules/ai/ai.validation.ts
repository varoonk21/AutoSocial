import { z } from "zod";

export const generateImageSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  vertical: z.boolean().optional().default(false),
  referenceImageUrl: z.url("Invalid URL").optional(),
});

export const generateContentFromImageSchema = z.object({
  imageUrl: z.url("Invalid image URL"),
});

export const enhanceContentSchema = z.object({
  content: z.string().min(1, "Content is required"),
  enhanceType: z.enum(["caption", "hashtags", "general"]).optional().default("general"),
});

export type GenerateImageInput = z.infer<typeof generateImageSchema>;
export type GenerateContentFromImageInput = z.infer<typeof generateContentFromImageSchema>;
export type EnhanceContentInput = z.infer<typeof enhanceContentSchema>;
