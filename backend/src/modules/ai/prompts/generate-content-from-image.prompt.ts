export function getGenerateSinglePostFromImagePrompt(brandContext: string): string {
  return `You are a social media content creator. Analyze the image provided and generate a engaging social media post based on what you see. Describe the image, capture its mood, and create compelling caption text. Return the result in the following JSON format: [{ "post": string }] with one element.${brandContext}`;
}

export function getGenerateThreadFromImagePrompt(brandContext: string): string {
  return `You are a social media content creator. Analyze the image provided and generate a social media thread (multiple posts) based on what you see. Each post should cover a different aspect of the image. Return the result in the following JSON format: Array<{ "post": string }> without emojis.${brandContext}`;
}
