import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const emptyToUndefined = (value: unknown) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }
  return value;
};

const databaseUrlSchema = z
  .string()
  .trim()
  .min(1, "DATABASE_URL is required")
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === "postgresql:" || url.protocol === "postgres:";
    } catch {
      return false;
    }
  }, "DATABASE_URL must be a postgresql:// connection string");

const envSchema = z.object({
  PORT: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(1).max(65535).default(4000),
  ),
  FRONTEND_ORIGIN: z.preprocess(
    emptyToUndefined,
    z.string().url().default("http://localhost:3000"),
  ),
  DATABASE_URL: z.preprocess(emptyToUndefined, databaseUrlSchema),
  GEMINI_API_KEY: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  LLM_MODEL: z.preprocess(
    emptyToUndefined,
    z.string().min(1).default("gemini-3.5-flash"),
  ),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables.");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = {
  port: parsed.data.PORT,
  frontendOrigin: parsed.data.FRONTEND_ORIGIN,
  databaseUrl: parsed.data.DATABASE_URL,
  geminiApiKey: parsed.data.GEMINI_API_KEY,
  llmModel: parsed.data.LLM_MODEL,
};
