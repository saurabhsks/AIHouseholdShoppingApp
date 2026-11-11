# GharCart API

Prices are integer paise. ₹99.00 is `9900`. The API does not return a floating-point rupee amount.

`GET /api/health` only checks that the API process is running. It does not query PostgreSQL.

## GET /api/categories

Returns every category.

```bash
curl http://localhost:4000/api/categories
```

```json
{
  "categories": [
    {
      "id": "cm...",
      "name": "Cooking oil",
      "slug": "cooking-oil"
    }
  ]
}
```

## GET /api/products

Returns active products and their active variants. An out-of-stock variant is included with `stockQuantity` of `0`. Inactive products are omitted.

Query parameters:

- `q` matches the product name or brand.
- `category` is the category slug, such as `laundry-detergent`.
- `brand` is an exact brand name. Matching ignores letter case.
- `inStock=true` keeps only variants with stock greater than zero, and drops products that then have no variants.

The list is capped at 50 products.

```bash
curl "http://localhost:4000/api/products?brand=Colgate"
```

```json
{
  "products": [
    {
      "id": "cm...",
      "slug": "colgate-strong-teeth",
      "name": "Colgate Strong Teeth",
      "brand": "Colgate",
      "description": "Calcium toothpaste for daily use.",
      "category": {
        "name": "Toothpaste and oral care",
        "slug": "oral-care"
      },
      "variants": [
        {
          "id": "cm...",
          "label": "100 g",
          "amount": 100,
          "unit": "G",
          "pricePaise": 5500,
          "stockQuantity": 48
        }
      ]
    }
  ]
}
```

`amount` is the package size in one base unit: millilitres (`ML`), grams (`G`), or a count (`PIECE`). `label` is the text a shopper reads. A 1 litre bottle is `amount: 1000` and `unit: "ML"`.

An invalid query returns `400`:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid product query."
  }
}
```

## GET /api/products/:id

Returns one active product in the same shape, wrapped as `{ "product": { ... } }`.

An unknown or inactive id returns `404`:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Product was not found."
  }
}
```

## Cart

There is one development cart. It is created the first time the cart is read, and every browser on this machine shares it. The cart stores quantity only. Prices and stock are read from the catalogue when the cart is returned. The browser does not send a total.

`available` is false when the pack is inactive or the saved quantity is greater than the current stock. That line is still returned, its `lineTotalPaise` is `0`, and it is left out of `totalPaise`.

### GET /api/cart

```bash
curl http://localhost:4000/api/cart
```

```json
{
  "cart": {
    "id": "cm...",
    "items": [
      {
        "id": "cm...",
        "quantity": 2,
        "available": true,
        "lineTotalPaise": 32000,
        "variant": {
          "id": "cm...",
          "label": "1 L",
          "amount": 1000,
          "unit": "ML",
          "pricePaise": 16000,
          "stockQuantity": 18,
          "productName": "Fortune Sunflower Oil",
          "brand": "Fortune",
          "productId": "cm...",
          "productSlug": "fortune-sunflower-oil",
          "categorySlug": "cooking-oil"
        }
      }
    ],
    "totalPaise": 32000
  }
}
```

### POST /api/cart/items

Sets the quantity for a pack. If that pack is already in the cart, the quantity is replaced. It is not added to the existing quantity, and a second line is not created.

```bash
curl -X POST http://localhost:4000/api/cart/items \
  -H "Content-Type: application/json" \
  -d '{"variantId":"cm...","quantity":2}'
```

The response is the same cart object as `GET /api/cart`. An unknown pack returns `404`. An out-of-stock pack returns `400` with code `OUT_OF_STOCK`. A quantity above the current stock returns `400` with code `INSUFFICIENT_STOCK`.

### PATCH /api/cart/items/:itemId

Replaces the quantity for one line.

```bash
curl -X PATCH http://localhost:4000/api/cart/items/cm... \
  -H "Content-Type: application/json" \
  -d '{"quantity":3}'
```

### DELETE /api/cart/items/:itemId

Removes one line and returns the updated cart.

```bash
curl -X DELETE http://localhost:4000/api/cart/items/cm...
```

## POST /api/ai/chat

Turns one shopping sentence into structured JSON. It does not search the catalogue and it does not change the cart. `cartChanged` is always `false`.

The Gemini key stays in `backend/.env` as `GEMINI_API_KEY`. Create it in Google AI Studio and do not attach billing. `LLM_MODEL` defaults to `gemini-3.5-flash` when it is empty. If the key is missing, the catalogue and cart still work, and this route returns `503`.

```bash
curl -X POST http://localhost:4000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"cheapest detergent and Colgate toothpaste under ₹1,500"}'
```

```json
{
  "interpretation": {
    "items": [
      {
        "text": "detergent",
        "brand": null,
        "amount": null,
        "unit": null,
        "selection": "cheapest"
      },
      {
        "text": "toothpaste",
        "brand": "Colgate",
        "amount": null,
        "unit": null,
        "selection": "specific"
      }
    ],
    "budgetPaise": 150000
  },
  "reply": "You want the cheapest detergent and Colgate toothpaste, with a budget of ₹1,500.",
  "cartChanged": false
}
```

An empty message returns `400` `VALIDATION_ERROR`. A model reply that is not the expected JSON returns `502` `MODEL_OUTPUT_INVALID`. A timeout or rate limit returns `503` `AI_UNAVAILABLE`. A missing key returns `503` `AI_NOT_CONFIGURED`.
