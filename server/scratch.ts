import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  try {
    const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'hello',
    });
    console.log(response.text);
  } catch(e) {
    console.error(e);
  }
}
run();
