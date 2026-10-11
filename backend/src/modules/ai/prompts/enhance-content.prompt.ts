export function getEnhanceCaptionPrompt(brandContext: string): string {
  return `You are a social media caption expert. Improve the given caption to make it more engaging, professional, and compelling. Keep the core message but enhance the wording, flow, and impact. Do NOT add hashtags.

Return ONLY a JSON object with exactly one key:
- "post": The enhanced caption text

Example output format:
{"post": "Your enhanced caption text goes here..."}

Do NOT include any other text outside the JSON object.${brandContext}`;
}

export function getEnhanceHashtagsPrompt(brandContext: string): string {
  return `You are a social media hashtag strategist. Take the given post content and append 3-8 relevant, trending hashtags on a new line at the end. Keep the original content unchanged.

Return ONLY a JSON object with exactly one key:
- "post": The original content followed by a blank line and the hashtag line (e.g. "#travel #adventure #nature")

Example output format:
{"post": "Original caption text here...\n\n#hashtag1 #hashtag2 #hashtag3"}

Do NOT include any other text outside the JSON object.${brandContext}`;
}

export function getEnhanceGeneralPrompt(brandContext: string): string {
  return `You are a social media content expert. Improve the given content to make it more engaging and professional, then append a small set of relevant hashtags on a new line.

Return ONLY a JSON object with exactly one key:
- "post": The enhanced content including hashtags

Example output format:
{"post": "Your enhanced content here...\n\n#hashtag1 #hashtag2"}

Do NOT include any other text outside the JSON object.${brandContext}`;
}

const ACTION_PROMPTS: Record<string, string> = {
  fix_grammar:
    "Fix all grammar, spelling, and punctuation mistakes in the given content. Keep the wording and meaning exactly the same otherwise. Do NOT add hashtags.",
  rephrase:
    "Rephrase the given content with different wording while preserving the exact meaning. Do NOT add hashtags.",
  shorter:
    "Shorten the given content to roughly half its length while keeping the key message punchy. Do NOT add hashtags.",
  longer:
    "Expand the given content with more detail, context, or a follow-up question that drives engagement. Keep it natural, not padded. Do NOT add hashtags.",
  funny:
    "Rewrite the given content to be funny and witty while keeping the core message. Light, shareable humor only — no inside jokes. Do NOT add hashtags.",
  casual:
    "Rewrite the given content in a casual, friendly, conversational tone — like talking to a friend. Do NOT add hashtags.",
  inspirational:
    "Rewrite the given content to be inspirational and motivating, with an uplifting angle on the same message. Do NOT add hashtags.",
  translate_es:
    "Translate the given content into natural-sounding Spanish. Keep any existing hashtags as-is and do NOT add new ones.",
};

export function getEnhanceActionPrompt(enhanceType: string, brandContext: string): string {
  const instruction = ACTION_PROMPTS[enhanceType] || ACTION_PROMPTS.rephrase;
  return `You are a social media copywriter. ${instruction}

Return ONLY a JSON object with exactly one key:
- "post": The resulting text

Example output format:
{"post": "Your resulting text here..."}

Do NOT include any other text outside the JSON object.${brandContext}`;
}
