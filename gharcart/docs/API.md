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
