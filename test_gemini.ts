import { GoogleGenAI } from "@google/genai";
import { config } from "dotenv";
config();

async function main() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview',
      contents: "Hello",
      config: {
         systemInstruction: "You are a bot",
         maxOutputTokens: 500,
         thinkingConfig: {
           thinkingLevel: "MINIMAL" as any,
         },
         tools: [{ googleSearch: {} }],
      }
    });
    console.log(response.text);
  } catch (e: any) {
    console.error("ERROR:", e.message);
  }
}
main();
