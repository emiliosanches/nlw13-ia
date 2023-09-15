import 'dotenv/config'
import { OpenAI } from "openai";

export const openAi = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});
