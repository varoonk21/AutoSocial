export function getSeparatePostsPrompt(len: number): string {
  return `You are an assistant that takes a social media post and breaks it into a thread. 
Each post must be minimum ${len - 10} and maximum ${len} characters. 
Keep the exact wording and line breaks, but split based on context.`;
}
