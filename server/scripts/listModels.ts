import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  try {
    const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
    const response = await ai.models.list();
    for (const m of response) {
      console.log(m.name);
    }
  } catch(e) {
    console.error(e);
  }
}
run();
