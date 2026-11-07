import assert from "node:assert/strict";
import test from "node:test";
import { formatInr } from "./money.ts";

test("formats paise as rupees with two digits", () => {
  assert.equal(formatInr(16000), "₹160.00");
  assert.equal(formatInr(9900), "₹99.00");
});
