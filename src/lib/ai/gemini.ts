import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export function getGeminiClient() {
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

export async function callAgent(prompt: string) {
  const ai = getGeminiClient();
  if (!ai) throw new Error("Gemini API key is not configured.");

  const modelName = "gemini-2.5-flash";

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty model response");
    return JSON.parse(text);
  } catch (e) {
    console.error("Gemini agent call failed:", e);
    throw e;
  }
}
