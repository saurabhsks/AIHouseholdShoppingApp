import { z } from "zod";

export const addCartItemSchema = z.object({
  variantId: z.string().trim().min(1).max(64),
  quantity: z.number().int().min(1).max(999),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(999),
});
