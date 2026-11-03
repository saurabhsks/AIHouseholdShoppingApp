import assert from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";
import { createApp } from "./app";
import { prisma } from "./lib/prisma";
import type { CatalogueProduct } from "./types/catalogue";

let server: Server;
let baseUrl = "";

before(async () => {
  const app = createApp();
  server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => {
    server.once("listening", () => resolve());
  });
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
  await prisma.$disconnect();
});

test("brand filter returns only Colgate and integer paise prices", async () => {
  const response = await fetch(`${baseUrl}/api/products?brand=Colgate`);
  assert.equal(response.status, 200);

  const body = (await response.json()) as { products: CatalogueProduct[] };
  assert.equal(body.products.length, 2);

  for (const product of body.products) {
    assert.equal(product.brand, "Colgate");
    assert.ok(product.variants.length > 0);
    for (const variant of product.variants) {
      assert.equal(Number.isInteger(variant.pricePaise), true);
    }
  }

  const slugs = body.products.map((product) => product.slug);
  assert.deepEqual(slugs.sort(), ["colgate-maxfresh", "colgate-strong-teeth"]);
});

test("an out-of-stock variant stays in the catalogue with zero stock", async () => {
  const response = await fetch(`${baseUrl}/api/products?brand=Tide`);
  assert.equal(response.status, 200);

  const body = (await response.json()) as { products: CatalogueProduct[] };
  const tide = body.products.find((product) => product.slug === "tide-nature-fresh");
  assert.ok(tide);

  const pack = tide.variants.find((variant) => variant.label === "1 kg");
  assert.ok(pack);
  assert.equal(pack.stockQuantity, 0);
  assert.equal(Number.isInteger(pack.pricePaise), true);
});

test("an unknown product id returns not found", async () => {
  const response = await fetch(`${baseUrl}/api/products/missing-product`);
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), {
    error: {
      code: "NOT_FOUND",
      message: "Product was not found.",
    },
  });
});

test("an inactive product is omitted from the list", async () => {
  const response = await fetch(`${baseUrl}/api/products?q=Retired`);
  assert.equal(response.status, 200);
  const body = (await response.json()) as { products: CatalogueProduct[] };
  assert.deepEqual(body.products, []);
});
