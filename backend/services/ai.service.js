/**
 * AI Content Generation Service
 *
 * Extracted and simplified from:
 *   libraries/nestjs-libraries/src/openai/openai.service.ts
 *
 * Provides OpenAI-powered caption generation for social media posts.
 * Uses the same model (gpt-4.1) and prompts as the production service.
 *
 * npm install: openai
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-proj-',
  // To use with a different provider (Groq, Azure, etc.), add:
  // baseURL: process.env.OPENAI_BASE_URL,
});

// ─── Content Generation ────────────────────────────────────────────────────────

/**
 * Generates multiple social media post variations from a given piece of content.
 * Returns an array of post arrays (some are single tweets, some are threads).
 *
 * Source: openai.service.ts → generatePosts()
 *
 * @param {string} content - The source text to generate posts from
 * @returns {Promise<Array<Array<{post: string}>>>}
 */
async function generatePosts(content) {
  const [singlePosts, threads] = await Promise.all([
    openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Generate a social media post from the content without emojis in the following JSON format: [{ "post": string }] with one element',
        },
        { role: 'user', content },
      ],
      n: 3,
      temperature: 1,
    }),
    openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Generate a thread for social media in the following JSON format: Array<{ "post": string }> without emojis',
        },
        { role: 'user', content },
      ],
      n: 3,
      temperature: 1,
    }),
  ]);

  return [...singlePosts.choices, ...threads.choices]
    .map((choice) => {
      const text = choice.message.content || '';
      const start = text.indexOf('[');
      const end = text.lastIndexOf(']');
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        return [];
      }
    })
    .sort(() => Math.random() - 0.5); // shuffle
}

/**
 * Generates post suggestions from a URL.
 * Fetches the page, extracts the article text via AI, then generates post suggestions.
 *
 * Source: openai.service.ts → extractWebsiteText()
 *
 * @param {string} url
 */
async function generatePostsFromUrl(url) {
  const response = await fetch(url);
  const html = await response.text();

  // Strip HTML tags naively — for production consider @mozilla/readability
  const plainText = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 8000);

  const extracted = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Extract only the article content from this webpage text. Remove navigation, ads, and boilerplate.' },
      { role: 'user', content: plainText },
    ],
  });

  const articleContent = extracted.choices[0].message.content || '';
  return generatePosts(articleContent);
}

/**
 * Splits a long post into a thread, respecting platform character limits.
 * Each piece will be between (len-10) and len characters.
 *
 * Source: openai.service.ts → separatePosts()
 *
 * @param {string} content   - Full post text
 * @param {number} len       - Max characters per post (e.g., 280 for X)
 * @returns {{ posts: string[] }}
 */
async function separatePosts(content, len) {
  const { zodResponseFormat } = await import('openai/helpers/zod');
  const { z } = await import('zod');

  const schema = z.object({ posts: z.array(z.string()) });

  const result = await openai.chat.completions.parse({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are an assistant that takes a social media post and breaks it into a thread. 
Each post must be minimum ${len - 10} and maximum ${len} characters. 
Keep the exact wording and line breaks, but split based on context.`,
      },
      { role: 'user', content },
    ],
    response_format: zodResponseFormat(schema, 'separatePosts'),
  });

  return { posts: result.choices[0].message.parsed?.posts || [] };
}

/**
 * Generates an image from a text prompt.
 * Returns the base64-encoded image data.
 *
 * Source: openai.service.ts → generateImage()
 *
 * @param {string} prompt
 * @param {boolean} [isVertical=false]
 * @returns {string} base64 image data
 */
async function generateImage(prompt, isVertical = false) {
  const result = await openai.images.generate({
    prompt,
    model: 'dall-e-3', // or 'chatgpt-image-latest' if available in your account
    size: isVertical ? '1024x1792' : '1024x1024',
    response_format: 'b64_json',
  });

  return result.data[0].b64_json;
}

export { generatePosts, generatePostsFromUrl, separatePosts, generateImage };
