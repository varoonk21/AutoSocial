export function getGenerateSinglePostPrompt(brandContext: string): string {
  return `Generate a social media post from the content without emojis in the following JSON format: [{ "post": string }] with one element.${brandContext}`;
}

export function getGenerateThreadPrompt(brandContext: string): string {
  return `Generate a thread for social media in the following JSON format: Array<{ "post": string }> without emojis.${brandContext}`;
}
