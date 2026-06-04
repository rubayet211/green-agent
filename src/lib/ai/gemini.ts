import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

export const GEMINI_MODEL = "gemini-3-flash-preview";

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

function getErrorStatus(error: unknown): number | undefined {
  return typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
    ? error.status
    : undefined;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function isExpectedGeminiFallback(error: unknown): boolean {
  const status = getErrorStatus(error);
  const message = getErrorMessage(error);
  return (
    status === 429 ||
    status === 500 ||
    status === 503 ||
    status === 504 ||
    message.includes("DEADLINE_EXCEEDED") ||
    message.includes("Deadline expired") ||
    message.includes("Empty model response")
  );
}

export function summarizeGeminiError(error: unknown): string {
  const status = getErrorStatus(error);
  const message = getErrorMessage(error);
  const statusText = status ? `status ${status}` : "unknown status";
  if (
    message.includes("DEADLINE_EXCEEDED") ||
    message.includes("Deadline expired")
  ) {
    return `${statusText}: Gemini deadline exceeded`;
  }
  return `${statusText}: ${message.slice(0, 180)}`;
}

export async function callAgent<T>(
  prompt: string,
  schema: z.ZodType<T>,
): Promise<T> {
  const ai = getGeminiClient();
  if (!ai) throw new Error("Gemini API key is not configured.");

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: z.toJSONSchema(schema, { target: "draft-07" }),
        httpOptions: {
          timeout: 20_000,
          retryOptions: { attempts: 2 },
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty model response");
    return schema.parse(JSON.parse(text));
  } catch (e) {
    throw e;
  }
}
