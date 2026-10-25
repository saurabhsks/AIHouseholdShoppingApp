import type { RequestHandler } from "express";
import { HttpError } from "./errorHandler";

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(
    new HttpError(
      404,
      `Route ${req.method} ${req.originalUrl} was not found.`,
      "NOT_FOUND",
    ),
  );
};
