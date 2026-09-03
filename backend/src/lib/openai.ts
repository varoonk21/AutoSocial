import OpenAI from "openai";
import env from "../config/env.config.js";

const openai = new OpenAI({
  baseURL: env.OPENAI_BASE_URL,
  apiKey: env.OPENAI_API_KEY,
});

export default openai;
