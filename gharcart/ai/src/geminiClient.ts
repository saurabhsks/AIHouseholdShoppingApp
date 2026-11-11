import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { shoppingInterpretationSchema } from "./schemas/shoppingRequest";

export type ShoppingModelRequest = {
  prompt: string;
  model: string;
  signal: AbortSignal;
};

export type ShoppingModelClient = {
  generate(request: ShoppingModelRequest): Promise<string>;
};

export function shoppingResponseSchema(): Record<string, unknown> {
  return z.toJSONSchema(shoppingInterpretationSchema) as Record<string, unknown>;
}

export function createGeminiClient(apiKey: string): ShoppingModelClient {
  const ai = new GoogleGenAI({ apiKey });

  return {
    async generate({ prompt, model, signal }) {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseJsonSchema: shoppingResponseSchema(),
          abortSignal: signal,
        },
      });
      const text = response.text;
      if (!text) {
        throw new Error("The model returned an empty response.");
      }
      return text;
    },
  };
}
