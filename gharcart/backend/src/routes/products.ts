import { Router } from "express";
import { getProduct, listProducts } from "../controllers/productController";

export const productRouter = Router();

productRouter.get("/", listProducts);
productRouter.get("/:id", getProduct);
