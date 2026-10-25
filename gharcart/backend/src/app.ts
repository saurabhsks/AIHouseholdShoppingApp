import cors from "cors";
import express from "express";
import { config } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFound";
import { healthRouter } from "./routes/health";

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(
    cors({
      origin: config.frontendOrigin,
    }),
  );

  app.use("/api/health", healthRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
