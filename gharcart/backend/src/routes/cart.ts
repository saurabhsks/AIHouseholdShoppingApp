import { Router } from "express";
import {
  addCartItem,
  getCart,
  removeCartItem,
  updateCartItem,
} from "../controllers/cartController";

export const cartRouter = Router();

cartRouter.get("/", getCart);
cartRouter.post("/items", addCartItem);
cartRouter.patch("/items/:itemId", updateCartItem);
cartRouter.delete("/items/:itemId", removeCartItem);
