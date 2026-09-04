import env from "../../config/env.config.js";
import openai from "../../lib/openai.js";
import * as aiRepository from "./ai.repository.js";
import {
  getGenerateSinglePostPrompt,
  getGenerateThreadPrompt,
  getExtractContentPrompt,
  getSeparatePostsPrompt,
  getGenerateSinglePostFromImagePrompt,
  getGenerateThreadFromImagePrompt,
  getEnhanceCaptionPrompt,
  getEnhanceHashtagsPrompt,
  getEnhanceGeneralPrompt,
} from "./prompts/index.js";

function buildBrandContext(brandKit) {
  if (!brandKit) return "";
  const parts = [];
  if (brandKit.tones?.length) parts.push(`Tone/Voice: ${brandKit.tones.join(", ")}`);
  if (brandKit.fonts?.length) parts.push(`Preferred fonts: ${brandKit.fonts.join(", ")}`);
  if (brandKit.styleNotes) parts.push(`Style notes: ${brandKit.styleNotes}`);
  if (brandKit.primaryColor) parts.push(`Primary brand color: ${brandKit.primaryColor}`);
  if (brandKit.accentColor) parts.push(`Accent color: ${brandKit.accentColor}`);
  return parts.length ? `\nBrand guidelines: ${parts.join(". ")}.` : "";
}

function parseSuggestions(choices) {
  return choices
    .map((choice) => {
      const text = choice.message.content || "";
      const start = text.indexOf("[");
      const end = text.lastIndexOf("]");
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        return [];
      }
    })
    .sort(() => Math.random() - 0.5);
}

async function generatePosts(content, userId) {
  const brandKit = await aiRepository.findBrandKitByUserId(userId);
  const brandContext = buildBrandContext(brandKit);

  const [singlePosts, threads] = await Promise.all([
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: getGenerateSinglePostPrompt(brandContext) },
        { role: "user", content },
      ],
      n: 3,
      temperature: 1,
    }),
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: getGenerateThreadPrompt(brandContext) },
        { role: "user", content },
      ],
      n: 3,
      temperature: 1,
    }),
  ]);

  return parseSuggestions([...singlePosts.choices, ...threads.choices]);
}

async function generatePostsFromUrl(url, userId) {
  const response = await fetch(url);
  const html = await response.text();
  const plainText = html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 8000);

  const extracted = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: getExtractContentPrompt() },
      { role: "user", content: plainText },
    ],
  });

  const articleContent = extracted.choices[0].message.content || "";
  return generatePosts(articleContent, userId);
}

async function separatePosts(content, len) {
  const { zodResponseFormat } = await import("openai/helpers/zod");
  const { z } = await import("zod");

  const schema = z.object({ posts: z.array(z.string()) });

  const result = await openai.chat.completions.parse({
    model: "gpt-4o",
    messages: [
      { role: "system", content: getSeparatePostsPrompt(len) },
      { role: "user", content },
    ],
    response_format: zodResponseFormat(schema, "separatePosts"),
  });

  return { posts: result.choices[0].message.parsed?.posts || [] };
}

async function generateImage(prompt, isVertical = false) {
  const result = await openai.images.generate({
    prompt,
    model: env.IMAGE_MODEL_NAME,
    size: isVertical ? "1024x1792" : "1024x1024",
    response_format: "b64_json",
  });

  return result.data[0].b64_json;
}

async function generateImageWithReference(imageUrl, prompt, isVertical = false) {
  const result = await openai.images.edit({
    model: env.IMAGE_MODEL_NAME,
    image: imageUrl,
    prompt,
    size: isVertical ? "1024x1792" : "1024x1024",
    response_format: "b64_json",
  });

  return result.data[0].b64_json;
}

async function generateContentFromImage(imageUrl, userId) {
  const brandKit = await aiRepository.findBrandKitByUserId(userId);
  const brandContext = buildBrandContext(brandKit);

  const [singlePosts, threads] = await Promise.all([
    openai.chat.completions.create({
      model: "gpt-4o",
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
      n: 3,
      temperature: 1,
    }),
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: getGenerateThreadFromImagePrompt(brandContext),
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Generate a social media thread for this image." },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      n: 3,
      temperature: 1,
    }),
  ]);

  return parseSuggestions([...singlePosts.choices, ...threads.choices]);
}

async function enhanceContent(content, enhanceType, userId) {
  const brandKit = await aiRepository.findBrandKitByUserId(userId);
  const brandContext = buildBrandContext(brandKit);

  let systemPrompt;
  if (enhanceType === "caption") {
    systemPrompt = getEnhanceCaptionPrompt(brandContext);
  } else if (enhanceType === "hashtags") {
    systemPrompt = getEnhanceHashtagsPrompt(brandContext);
  } else {
    systemPrompt = getEnhanceGeneralPrompt(brandContext);
  }

  const result = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content },
    ],
    n: 3,
    temperature: 1,
  });

  return parseSuggestions(result.choices);
}

export { generatePosts, generatePostsFromUrl, separatePosts, generateImage, generateImageWithReference, generateContentFromImage, enhanceContent };
