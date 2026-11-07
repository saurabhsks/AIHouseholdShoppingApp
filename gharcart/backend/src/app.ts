import cors from "cors";
import express from "express";
import { config } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFound";
import { cartRouter } from "./routes/cart";
import { categoryRouter } from "./routes/categories";
import { healthRouter } from "./routes/health";
import { productRouter } from "./routes/products";

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(
    cors({
      origin: config.frontendOrigin,
    }),
  );

  app.use("/api/health", healthRouter);
  app.use("/api/categories", categoryRouter);
  app.use("/api/products", productRouter);
  app.use("/api/cart", cartRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
