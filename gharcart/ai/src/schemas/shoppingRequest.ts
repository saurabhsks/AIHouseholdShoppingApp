import { z } from "zod";

export const shoppingItemSchema = z
  .object({
    text: z.string().trim().min(1).max(200),
    brand: z.string().trim().min(1).max(80).nullable(),
    amount: z.number().positive().nullable(),
    unit: z.enum(["ml", "l", "g", "kg", "piece"]).nullable(),
    selection: z.enum(["cheapest", "specific", "any"]),
  })
  .strict();

export const shoppingInterpretationSchema = z
  .object({
    items: z.array(shoppingItemSchema).max(20),
    budgetPaise: z.number().int().nonnegative().nullable(),
    reply: z.string().trim().min(1).max(500),
  })
  .strict();

export type ShoppingInterpretation = z.infer<typeof shoppingInterpretationSchema>;

export function parseShoppingInterpretation(text: string): ShoppingInterpretation {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ModelOutputInvalidError("The model did not return JSON.");
  }

  const result = shoppingInterpretationSchema.safeParse(parsed);
  if (!result.success) {
    throw new ModelOutputInvalidError("The model returned JSON that does not match the shopping schema.");
  }

  return result.data;
}

export class ModelOutputInvalidError extends Error {
  readonly code = "MODEL_OUTPUT_INVALID";

  constructor(message: string) {
    super(message);
    this.name = "ModelOutputInvalidError";
  }
}
