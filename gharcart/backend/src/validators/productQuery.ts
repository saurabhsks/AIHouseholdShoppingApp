import { z } from "zod";

const emptyToUndefined = (value: unknown) => {
  if (Array.isArray(value)) {
    return emptyToUndefined(value[0]);
  }
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }
  return value;
};

const optionalText = z.preprocess(
  emptyToUndefined,
  z.string().trim().min(1).max(80).optional(),
);

export const productQuerySchema = z.object({
  q: optionalText,
  category: optionalText,
  brand: optionalText,
  inStock: z.preprocess(
    emptyToUndefined,
    z.enum(["true", "false"]).optional(),
  ),
});

export type ProductQuery = z.infer<typeof productQuerySchema>;
