import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { after, beforeEach, describe, test } from "node:test";
import { createApp } from "./app";
import { prisma } from "./lib/prisma";
import type { CartResponse } from "./types/cart";
import type { CatalogueProduct } from "./types/catalogue";

let baseUrl = "";
let server: Server;

function listen(app: ReturnType<typeof createApp>) {
  const started = app.listen(0, "127.0.0.1");
  return new Promise<Server>((resolve) => {
    started.once("listening", () => resolve(started));
  });
}

async function variantByLabel(brand: string, label: string) {
  const response = await fetch(`${baseUrl}/api/products?brand=${encodeURIComponent(brand)}`);
  const body = (await response.json()) as { products: CatalogueProduct[] };
  for (const product of body.products) {
    const variant = product.variants.find((item) => item.label === label);
    if (variant) {
      return variant;
    }
  }
  throw new Error(`Missing ${brand} ${label}`);
}

describe("cart", { concurrency: 1 }, () => {
beforeEach(async () => {
  if (!server) {
    server = await listen(createApp());
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  }
  await prisma.cartItem.deleteMany();
});

after(async () => {
  await prisma.cartItem.deleteMany();
  if (server) {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
  await prisma.$disconnect();
});

test("adding a pack twice keeps one line and replaces the quantity", async () => {
  const pack = await variantByLabel("Fortune", "1 L");
  assert.equal(pack.pricePaise, 16000);

  const first = await fetch(`${baseUrl}/api/cart/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ variantId: pack.id, quantity: 2 }),
  });
  assert.equal(first.status, 200);
  const firstBody = (await first.json()) as { cart: CartResponse };
  assert.equal(firstBody.cart.items.length, 1);
  assert.equal(firstBody.cart.items[0]?.quantity, 2);
  assert.equal(firstBody.cart.items[0]?.lineTotalPaise, 32000);
  assert.equal(firstBody.cart.totalPaise, 32000);

  const second = await fetch(`${baseUrl}/api/cart/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ variantId: pack.id, quantity: 1 }),
  });
  const secondBody = (await second.json()) as { cart: CartResponse };
  assert.equal(secondBody.cart.items.length, 1);
  assert.equal(secondBody.cart.items[0]?.quantity, 1);
  assert.equal(secondBody.cart.totalPaise, 16000);
});

test("a quantity above stock is rejected and leaves the cart unchanged", async () => {
  const pack = await variantByLabel("Fortune", "1 L");
  await fetch(`${baseUrl}/api/cart/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ variantId: pack.id, quantity: 2 }),
  });

  const rejected = await fetch(`${baseUrl}/api/cart/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ variantId: pack.id, quantity: pack.stockQuantity + 1 }),
  });
  assert.equal(rejected.status, 400);
  const rejectedBody = (await rejected.json()) as { error: { code: string } };
  assert.equal(rejectedBody.error.code, "INSUFFICIENT_STOCK");

  const cart = await fetch(`${baseUrl}/api/cart`);
  const cartBody = (await cart.json()) as { cart: CartResponse };
  assert.equal(cartBody.cart.items.length, 1);
  assert.equal(cartBody.cart.items[0]?.quantity, 2);
  assert.equal(cartBody.cart.totalPaise, 32000);
});

test("updating and removing a line changes the backend total", async () => {
  const pack = await variantByLabel("Fortune", "1 L");
  const created = await fetch(`${baseUrl}/api/cart/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ variantId: pack.id, quantity: 2 }),
  });
  const createdBody = (await created.json()) as { cart: CartResponse };
  const itemId = createdBody.cart.items[0]?.id;
  assert.ok(itemId);

  const updated = await fetch(`${baseUrl}/api/cart/items/${itemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity: 3 }),
  });
  const updatedBody = (await updated.json()) as { cart: CartResponse };
  assert.equal(updated.status, 200);
  assert.equal(updatedBody.cart.totalPaise, 48000);

  const removed = await fetch(`${baseUrl}/api/cart/items/${itemId}`, {
    method: "DELETE",
  });
  const removedBody = (await removed.json()) as { cart: CartResponse };
  assert.equal(removed.status, 200);
  assert.deepEqual(removedBody.cart.items, []);
  assert.equal(removedBody.cart.totalPaise, 0);
});

test("an out-of-stock pack cannot be added", async () => {
  const pack = await variantByLabel("Tide", "1 kg");
  assert.equal(pack.stockQuantity, 0);

  const response = await fetch(`${baseUrl}/api/cart/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ variantId: pack.id, quantity: 1 }),
  });
  assert.equal(response.status, 400);
  const body = (await response.json()) as { error: { code: string } };
  assert.equal(body.error.code, "OUT_OF_STOCK");

  const cart = await fetch(`${baseUrl}/api/cart`);
  const cartBody = (await cart.json()) as { cart: CartResponse };
  assert.deepEqual(cartBody.cart.items, []);
});
});
