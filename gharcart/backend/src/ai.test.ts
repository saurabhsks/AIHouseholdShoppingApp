import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { after, test } from "node:test";
import type { ShoppingModelClient } from "@gharcart/ai";
import { createApp } from "./app";
import { prisma } from "./lib/prisma";
import type { CartResponse } from "./types/cart";

const validReply = JSON.stringify({
  items: [
    {
      text: "detergent",
      brand: null,
      amount: null,
      unit: null,
      selection: "cheapest",
    },
    {
      text: "toothpaste",
      brand: "Colgate",
      amount: null,
      unit: null,
      selection: "specific",
    },
  ],
  budgetPaise: 150000,
  reply: "You want the cheapest detergent and Colgate toothpaste, with a budget of ₹1,500.",
});

const client: ShoppingModelClient = {
  async generate() {
    return validReply;
  },
};

let baseUrl = "";
let server: Server;

test("shopping interpretation does not change the cart", async () => {
  const app = createApp({ shoppingModelClient: client });
  server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => {
    server.once("listening", () => resolve());
  });
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;

  const before = await fetch(`${baseUrl}/api/cart`);
  const beforeBody = (await before.json()) as { cart: CartResponse };

  const empty = await fetch(`${baseUrl}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "   " }),
  });
  assert.equal(empty.status, 400);
  const emptyBody = (await empty.json()) as { error: { code: string } };
  assert.equal(emptyBody.error.code, "VALIDATION_ERROR");

  const interpreted = await fetch(`${baseUrl}/api/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: "cheapest detergent and Colgate toothpaste under ₹1,500",
    }),
  });
  assert.equal(interpreted.status, 200);
  const interpretedBody = (await interpreted.json()) as {
    cartChanged: boolean;
    interpretation: { budgetPaise: number };
  };
  assert.equal(interpretedBody.cartChanged, false);
  assert.equal(interpretedBody.interpretation.budgetPaise, 150000);

  const afterCart = await fetch(`${baseUrl}/api/cart`);
  const afterBody = (await afterCart.json()) as { cart: CartResponse };
  assert.deepEqual(afterBody.cart, beforeBody.cart);
});

after(async () => {
  if (server) {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
  await prisma.$disconnect();
});
