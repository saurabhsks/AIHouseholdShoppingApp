import { Router } from "express";
import { listCategories } from "../controllers/productController";

export const categoryRouter = Router();

categoryRouter.get("/", listCategories);
