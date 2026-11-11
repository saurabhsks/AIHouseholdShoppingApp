export function buildInterpretPrompt(message: string): string {
  return [
    "Convert one household shopping sentence into JSON.",
    "Return only the requested items, an optional budget in paise, and a short reply.",
    "One rupee is 100 paise, so ₹1,500 is 150000.",
    "Use selection cheapest when the shopper asks for the cheapest option.",
    "Use selection specific when they name a brand.",
    "Use selection any when they name a product without a brand or a cheapest rule.",
    "Use null for brand, amount, unit, or budgetPaise when the sentence does not say them.",
    "Units must be ml, l, g, kg, or piece.",
    "Do not invent a product id, a price, or a stock quantity.",
    "",
    `Shopper: ${message}`,
  ].join("\n");
}
