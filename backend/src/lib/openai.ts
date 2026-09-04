import OpenAI from "openai";
import aiEnv from "../config/ai.config.js";

const openai = new OpenAI({
  baseURL: aiEnv.OPENAI_BASE_URL,
  apiKey: aiEnv.OPENAI_API_KEY,
});

export default openai;
