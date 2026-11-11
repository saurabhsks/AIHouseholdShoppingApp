import {
  AiNotConfiguredError,
  AiUnavailableError,
  createGeminiClient,
  interpretShoppingRequest,
  ModelOutputInvalidError,
  type ShoppingModelClient,
} from "@gharcart/ai";
import type { NextFunction, Request, Response } from "express";
import { config } from "../config/env";
import { HttpError } from "../middleware/errorHandler";
import { chatMessageSchema } from "../validators/ai";

function defaultClient(): ShoppingModelClient | undefined {
  if (!config.geminiApiKey) {
    return undefined;
  }
  return createGeminiClient(config.geminiApiKey);
}

export function createChatHandler(client?: ShoppingModelClient) {
  return async function chat(req: Request, res: Response, next: NextFunction) {
    const parsed = chatMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      next(new HttpError(400, "Invalid shopping message.", "VALIDATION_ERROR"));
      return;
    }

    const modelClient = client ?? defaultClient();
    if (!modelClient) {
      next(new HttpError(503, "The Gemini API key is not configured.", "AI_NOT_CONFIGURED"));
      return;
    }

    try {
      const result = await interpretShoppingRequest({
        message: parsed.data.message,
        apiKey: config.geminiApiKey ?? "configured",
        model: config.llmModel,
        client: modelClient,
      });
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof AiNotConfiguredError) {
        next(new HttpError(503, error.message, error.code));
        return;
      }
      if (error instanceof AiUnavailableError) {
        next(new HttpError(503, error.message, error.code));
        return;
      }
      if (error instanceof ModelOutputInvalidError) {
        next(new HttpError(502, error.message, error.code));
        return;
      }
      next(error);
    }
  };
}
