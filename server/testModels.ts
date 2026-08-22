import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-3.6-flash'];
  for (const model of models) {
    try {
      console.log(`Testing model: ${model}`);
      const response = await ai.models.generateContent({
        model: model,
        contents: 'Say hi',
      });
      console.log(`✅ Success with ${model}: ${response.text}`);
    } catch (e: any) {
      console.log(`❌ Failed with ${model}: ${e.message}`);
    }
  }
}
main();
