# GharCart

GharCart is an AI shopping assistant for household essentials. The website and the API run as two local programs. The API reads a seeded household catalogue from PostgreSQL. `POST /api/ai/chat` can interpret one shopping sentence with Gemini. It does not change the cart. The assistant screen comes later.

## Programs and ports

| Program | Directory | URL | Responsibility |
| --- | --- | --- | --- |
| Frontend | `frontend/` | http://localhost:3000 | The website people see. It never holds the Gemini API key. |
| Backend | `backend/` | http://localhost:4000 | The API. It validates requests, reads the catalogue, and calculates the cart total. |

The browser calls the backend directly. Open http://localhost:3000 and use Products to browse the catalogue. The cart is one shared development cart for this machine. Prices and stock are checked by the API. `GET /api/health` confirms the API process is running and does not query the database.

```bash
curl http://localhost:4000/api/categories
curl "http://localhost:4000/api/products?brand=Colgate"
```

Request and response examples are in [docs/API.md](docs/API.md).

## Database

PostgreSQL 17 runs locally. Create the two databases once:

```bash
brew services start postgresql@17
createdb gharcart
createdb gharcart_test
```

`gharcart` is the development catalogue. `gharcart_test` is used only by `npm test`.

From `gharcart/backend`, copy the example env file and set `DATABASE_URL`. Prisma's migration engine needs the macOS username and `127.0.0.1` in that URL. A URL with no username is rejected even when `psql` can connect.

```bash
cd gharcart/backend
cp .env.example .env
```

```text
DATABASE_URL="postgresql://YOUR_MAC_USERNAME@127.0.0.1:5432/gharcart"
```

Then create the tables and load the catalogue:

```bash
npx prisma@7 migrate dev
npx prisma@7 db seed
```

`npx prisma@7` stays on Prisma 7. A plain `npx prisma` can install the Prisma 8 release candidate, which does not use this schema. The local `npm` scripts already call the installed Prisma 7 binary.

Seed can be run again. It updates the same categories, products, and variants instead of inserting duplicates. Prices are stored as integer paise: ₹99.00 is `9900`.

## Run both

Use two terminals.

```bash
cd gharcart/backend
npm install
npm run dev
```

```bash
cd gharcart/frontend
npm install
npm run dev
```

Open http://localhost:3000. The home page should say the backend is running. You can also check the API itself:

```bash
curl http://localhost:4000/api/health
```

Expected JSON:

```json
{
  "status": "ok",
  "service": "gharcart-backend",
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

The timestamp will be the current time.

## Environment variables

`PORT` and `FRONTEND_ORIGIN` can stay empty and use their defaults. `DATABASE_URL` is required before the API will start.

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

| Variable | Used by | Default when empty |
| --- | --- | --- |
| `PORT` | Backend | `4000` |
| `FRONTEND_ORIGIN` | Backend, for CORS | `http://localhost:3000` |
| `DATABASE_URL` | Backend | Required. No default. |
| `GEMINI_API_KEY` | Backend only | Empty until you create a free Gemini key. |
| `LLM_MODEL` | Backend | `gemini-3.5-flash` |
| `NEXT_PUBLIC_API_URL` | Frontend | `http://localhost:4000` |

`.env` files are gitignored. Commit `.env.example` only, with the values left blank. Put `GEMINI_API_KEY` in `backend/.env` only. The frontend must not receive it. A `NEXT_PUBLIC_` variable is visible in the browser, so it is the wrong place for a secret.

## Scripts

Backend:

- `npm run dev` starts the API with automatic reload.
- `npm test` migrates and seeds `gharcart_test`, then checks the catalogue API.
- `npm run db:migrate` creates a development migration.
- `npm run db:seed` loads the catalogue.
- `npm run typecheck` checks TypeScript without starting the server.
- `npm run build` compiles to `dist/`.
- `npm start` runs the compiled server.

Frontend:

- `npm run dev` starts the Next.js development server.
- `npm run lint` runs ESLint.
- `npm run build` creates a production build.
