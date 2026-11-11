import { buildInterpretPrompt } from "./prompts/interpretShoppingRequest";
import {
  parseShoppingInterpretation,
  type ShoppingInterpretation,
} from "./schemas/shoppingRequest";
import type { ShoppingModelClient } from "./geminiClient";

export class AiNotConfiguredError extends Error {
  readonly code = "AI_NOT_CONFIGURED";

  constructor() {
    super("The Gemini API key is not configured.");
    this.name = "AiNotConfiguredError";
  }
}

export class AiUnavailableError extends Error {
  readonly code = "AI_UNAVAILABLE";

  constructor(message: string) {
    super(message);
    this.name = "AiUnavailableError";
  }
}

export type InterpretShoppingResult = {
  interpretation: Omit<ShoppingInterpretation, "reply">;
  reply: string;
  cartChanged: false;
};

const DEFAULT_TIMEOUT_MS = 20_000;

export async function interpretShoppingRequest(options: {
  message: string;
  apiKey: string | undefined;
  model: string;
  client: ShoppingModelClient;
  timeoutMs?: number;
}): Promise<InterpretShoppingResult> {
  if (!options.apiKey) {
    throw new AiNotConfiguredError();
  }

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  let rejectTimeout: ((error: AiUnavailableError) => void) | undefined;
  const abortTimer = setTimeout(() => controller.abort(), timeoutMs);
  const raceTimer = setTimeout(() => {
    rejectTimeout?.(new AiUnavailableError("The model took too long. Try again later."));
  }, timeoutMs);

  let text: string;
  try {
    text = await Promise.race([
      options.client.generate({
        prompt: buildInterpretPrompt(options.message),
        model: options.model,
        signal: controller.signal,
      }),
      new Promise<string>((_resolve, reject) => {
        rejectTimeout = reject;
      }),
    ]);
  } catch (error) {
    if (error instanceof AiUnavailableError) {
      throw error;
    }
    if (isRateLimit(error) || controller.signal.aborted) {
      throw new AiUnavailableError("The model is busy. Try again later.");
    }
    throw new AiUnavailableError("The model could not be reached. Try again later.");
  } finally {
    clearTimeout(abortTimer);
    clearTimeout(raceTimer);
  }

  const parsed = parseShoppingInterpretation(text);
  return {
    interpretation: {
      items: parsed.items,
      budgetPaise: parsed.budgetPaise,
    },
    reply: parsed.reply,
    cartChanged: false,
  };
}

function isRateLimit(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }
  const record = error as { status?: number; message?: string };
  return (
    record.status === 429 ||
    (typeof record.message === "string" &&
      (record.message.includes("429") || record.message.includes("RESOURCE_EXHAUSTED")))
  );
}
