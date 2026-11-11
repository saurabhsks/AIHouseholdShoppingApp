import assert from "node:assert/strict";
import test from "node:test";
import type { ShoppingModelClient } from "./geminiClient";
import {
  AiUnavailableError,
  interpretShoppingRequest,
} from "./interpretShoppingRequest";
import {
  ModelOutputInvalidError,
  parseShoppingInterpretation,
} from "./schemas/shoppingRequest";

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

function clientReturning(text: string): ShoppingModelClient {
  return {
    async generate() {
      return text;
    },
  };
}

test("a saved Colgate reply parses with a paise budget", () => {
  const parsed = parseShoppingInterpretation(validReply);
  assert.equal(parsed.budgetPaise, 150000);
  assert.equal(parsed.items[1]?.brand, "Colgate");
  assert.equal(parsed.items[0]?.selection, "cheapest");
});

test("a reply that includes a product id or a price is rejected", () => {
  const withPrice = JSON.stringify({
    items: [
      {
        text: "detergent",
        brand: null,
        amount: null,
        unit: null,
        selection: "cheapest",
        pricePaise: 4500,
      },
    ],
    budgetPaise: null,
    reply: "Cheapest detergent.",
  });

  assert.throws(() => parseShoppingInterpretation(withPrice), ModelOutputInvalidError);
  assert.throws(() => parseShoppingInterpretation("{"), ModelOutputInvalidError);
});

test("a client that never resolves becomes a timeout and does not return a cart", async () => {
  const hanging: ShoppingModelClient = {
    generate() {
      return new Promise(() => undefined);
    },
  };

  await assert.rejects(
    () =>
      interpretShoppingRequest({
        message: "cheapest detergent",
        apiKey: "test-key",
        model: "gemini-3.5-flash",
        client: hanging,
        timeoutMs: 20,
      }),
    (error: unknown) => error instanceof AiUnavailableError,
  );
});

test("a valid model reply is returned with cartChanged false", async () => {
  const result = await interpretShoppingRequest({
    message: "cheapest detergent and Colgate toothpaste under ₹1,500",
    apiKey: "test-key",
    model: "gemini-3.5-flash",
    client: clientReturning(validReply),
  });

  assert.equal(result.cartChanged, false);
  assert.equal(result.interpretation.budgetPaise, 150000);
  assert.match(result.reply, /Colgate/);
});
