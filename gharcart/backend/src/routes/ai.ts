import { Router } from "express";
import type { ShoppingModelClient } from "@gharcart/ai";
import { createChatHandler } from "../controllers/aiController";

export function createAiRouter(client?: ShoppingModelClient) {
  const router = Router();
  router.post("/chat", createChatHandler(client));
  return router;
}

export const aiRouter = createAiRouter();
