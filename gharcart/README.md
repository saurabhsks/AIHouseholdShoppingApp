# GharCart

GharCart is an AI shopping assistant for household essentials. This repository currently runs two local programs. The database, catalogue, and Gemini assistant come in later phases.

## Programs and ports

| Program | Directory | URL | Responsibility |
| --- | --- | --- | --- |
| Frontend | `frontend/` | http://localhost:3000 | The website people see. It never holds the Gemini API key. |
| Backend | `backend/` | http://localhost:4000 | The API. It validates requests and will own prices, stock, and orders. |

The browser calls the backend directly. `GET /api/health` is the only route so far. It confirms the API process is running. It does not check the database.

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

Copy an example file only when you want to override a default. Empty values mean “use the default”.

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

| Variable | Used by | Default when empty |
| --- | --- | --- |
| `PORT` | Backend | `4000` |
| `FRONTEND_ORIGIN` | Backend, for CORS | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | Frontend | `http://localhost:4000` |

`.env` files are gitignored. Commit `.env.example` only, with the values left blank. When the Gemini key is added in a later phase, it belongs in a server `.env` file. The frontend must not receive it. A `NEXT_PUBLIC_` variable is visible in the browser, so it is the wrong place for a secret.

## Scripts

Backend:

- `npm run dev` starts the API with automatic reload.
- `npm run typecheck` checks TypeScript without starting the server.
- `npm run build` compiles to `dist/`.
- `npm start` runs the compiled server.

Frontend:

- `npm run dev` starts the Next.js development server.
- `npm run lint` runs ESLint.
- `npm run build` creates a production build.
