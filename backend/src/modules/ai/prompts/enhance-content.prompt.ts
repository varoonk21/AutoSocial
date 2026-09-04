export function getEnhanceCaptionPrompt(brandContext: string): string {
  return `You are a social media caption expert. Improve the given caption to make it more engaging, professional, and compelling. Keep the core message but enhance the wording, flow, and impact. Return the result in the following JSON format: [{ "post": string }] with one element.${brandContext}`;
}

export function getEnhanceHashtagsPrompt(brandContext: string): string {
  return `You are a social media hashtag strategist. Generate relevant, trending, and effective hashtags for the given post content. Include a mix of popular and niche hashtags. Return the result in the following JSON format: [{ "post": string }] with one element containing only hashtags.${brandContext}`;
}

export function getEnhanceGeneralPrompt(brandContext: string): string {
  return `You are a social media content expert. Enhance the given content to make it more engaging and professional. Return the result in the following JSON format: [{ "post": string }] with one element.${brandContext}`;
}
