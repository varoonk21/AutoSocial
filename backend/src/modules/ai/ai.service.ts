import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import aiEnv from "../../config/ai.config.js";
import openai from "../../lib/openai.js";
import { findByUserId } from "../brandkit/brandkit.repository.js";
import { getGenerateSinglePostFromImagePrompt, getEnhanceCaptionPrompt, getEnhanceHashtagsPrompt, getEnhanceGeneralPrompt } from "./prompts/index.js";

interface BrandKit {
  tones?: string[];
  fonts?: string[];
  styleNotes?: string;
  primaryColor?: string;
  accentColor?: string;
}

const suggestionSchema = z.object({
  post: z.string(),
});

const imageContentSchema = z.object({
  description: z.string(),
  hashtags: z.string(),
});

type Suggestion = z.infer<typeof suggestionSchema>;
type ImageContent = z.infer<typeof imageContentSchema>;

function buildBrandContext(brandKit: BrandKit | null): string {
  if (!brandKit) return "";
  const parts: string[] = [];
  if (brandKit.tones?.length) parts.push(`Tone/Voice: ${brandKit.tones.join(", ")}`);
  if (brandKit.fonts?.length) parts.push(`Preferred fonts: ${brandKit.fonts.join(", ")}`);
  if (brandKit.styleNotes) parts.push(`Style notes: ${brandKit.styleNotes}`);
  if (brandKit.primaryColor) parts.push(`Primary brand color: ${brandKit.primaryColor}`);
  if (brandKit.accentColor) parts.push(`Accent color: ${brandKit.accentColor}`);
  return parts.length ? `\nBrand guidelines: ${parts.join(". ")}.` : "";
}

export async function generateImage(prompt: string, isVertical: boolean = false): Promise<string> {
  const result = await openai.images.generate({
    prompt,
    model: aiEnv.models.image,
    size: isVertical ? "1024x1792" : "1024x1024",
    response_format: "b64_json",
  });

  return result.data[0].b64_json;
}

export async function generateImageWithReference(imageUrl: string, prompt: string, isVertical: boolean = false): Promise<string> {
  const result = await openai.images.edit({
    model: aiEnv.models.image,
    image: imageUrl as unknown as File,
    prompt,
    size: isVertical ? "1024x1792" : "1024x1024",
    response_format: "b64_json",
  });

  return result.data[0].b64_json;
}

export async function generateContentFromImage(imageUrl: string, userId: string): Promise<ImageContent | null> {
  const brandKit = await findByUserId(userId);
  const brandContext = buildBrandContext(brandKit as BrandKit | null);

  const result = await openai.chat.completions.parse({
    model: aiEnv.models.imageToText,
    messages: [
      {
        role: "system",
        content: getGenerateSinglePostFromImagePrompt(brandContext),
      },
      {
        role: "user",
        content: [
          { type: "text", text: "Generate a social media post for this image." },
          { type: "image_url", image_url: { url: imageUrl } },
        ],
      },
    ],
    n: 1,
    temperature: aiEnv.defaults.temperature,
    response_format: zodResponseFormat(imageContentSchema, "image_content"),
  });

  return result.choices[0].message.parsed || null;
}

export async function enhanceContent(content: string, enhanceType: string, userId: string): Promise<Suggestion | null> {
  const brandKit = await findByUserId(userId);
  const brandContext = buildBrandContext(brandKit as BrandKit | null);

  let systemPrompt: string;
  if (enhanceType === "caption") {
    systemPrompt = getEnhanceCaptionPrompt(brandContext);
  } else if (enhanceType === "hashtags") {
    systemPrompt = getEnhanceHashtagsPrompt(brandContext);
  } else {
    systemPrompt = getEnhanceGeneralPrompt(brandContext);
  }

  const result = await openai.chat.completions.parse({
    model: aiEnv.models.textToText,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content },
    ],
    n: 1,
    temperature: aiEnv.defaults.temperature,
    response_format: zodResponseFormat(suggestionSchema, "enhanced_content"),
  });

  return result.choices[0].message.parsed || null;
}
