import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../middleware/errorHandler";
import { cartRepository, isCartFailure } from "../repositories/cartRepository";
import {
  addCartItemSchema,
  updateCartItemSchema,
} from "../validators/cart";

function readRouteId(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

function sendFailure(
  next: NextFunction,
  failure: { statusCode: number; code: string; message: string },
) {
  next(new HttpError(failure.statusCode, failure.message, failure.code));
}

export async function getCart(_req: Request, res: Response, next: NextFunction) {
  try {
    const cart = await cartRepository.getCart();
    res.status(200).json({ cart });
  } catch (error) {
    next(error);
  }
}

export async function addCartItem(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const parsed = addCartItemSchema.safeParse(req.body);
  if (!parsed.success) {
    next(new HttpError(400, "Invalid cart item.", "VALIDATION_ERROR"));
    return;
  }

  try {
    const result = await cartRepository.addItem(
      parsed.data.variantId,
      parsed.data.quantity,
    );
    if (isCartFailure(result)) {
      sendFailure(next, result);
      return;
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function updateCartItem(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const parsed = updateCartItemSchema.safeParse(req.body);
  if (!parsed.success) {
    next(new HttpError(400, "Invalid cart item.", "VALIDATION_ERROR"));
    return;
  }

  try {
    const result = await cartRepository.updateItem(
      readRouteId(req.params.itemId),
      parsed.data.quantity,
    );
    if (isCartFailure(result)) {
      sendFailure(next, result);
      return;
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function removeCartItem(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await cartRepository.removeItem(readRouteId(req.params.itemId));
    if (isCartFailure(result)) {
      sendFailure(next, result);
      return;
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
