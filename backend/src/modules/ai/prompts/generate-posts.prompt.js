export function getGenerateSinglePostPrompt(brandContext) {
  return `Generate a social media post from the content without emojis in the following JSON format: [{ "post": string }] with one element.${brandContext}`;
}

export function getGenerateThreadPrompt(brandContext) {
  return `Generate a thread for social media in the following JSON format: Array<{ "post": string }> without emojis.${brandContext}`;
}
