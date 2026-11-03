import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../middleware/errorHandler";
import { productRepository } from "../repositories/productRepository";
import { productQuerySchema } from "../validators/productQuery";

function readRouteId(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

export async function listCategories(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const categories = await productRepository.listCategories();
    res.status(200).json({ categories });
  } catch (error) {
    next(error);
  }
}

export async function listProducts(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const parsed = productQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    next(new HttpError(400, "Invalid product query.", "VALIDATION_ERROR"));
    return;
  }

  try {
    const products = await productRepository.listProducts(parsed.data);
    res.status(200).json({ products });
  } catch (error) {
    next(error);
  }
}

export async function getProduct(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const product = await productRepository.getProduct(readRouteId(req.params.id));
    if (!product) {
      next(new HttpError(404, "Product was not found.", "NOT_FOUND"));
      return;
    }

    res.status(200).json({ product });
  } catch (error) {
    next(error);
  }
}
