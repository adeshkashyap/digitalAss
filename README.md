# DevAssets API

Node.js + Express + Prisma + PostgreSQL backend for the DevAssets marketplace frontend.

## Quick start

```bash
cp .env.example .env
npm install
npm run db:generate
npm run db:push    # or db:migrate when PostgreSQL is running
npm run db:seed
npm run dev
```

API runs at `http://localhost:4000`.

## Demo accounts

| Role     | Email                    | Password      |
|----------|--------------------------|---------------|
| Customer | demo@devassets.example   | password123   |
| Admin    | admin@devassets.example  | password123   |

## API routes

| Area     | Prefix              |
|----------|---------------------|
| Health   | `GET /health`       |
| Auth     | `POST /api/auth/login`, `/register` |
| Catalog  | `GET /api/products`, `/api/categories` |
| Account  | `GET/PATCH /api/me/*` |
| Support  | `GET/POST /api/support/tickets` |
| Checkout | `POST /api/checkout/session` |
| Admin    | `GET/POST/PATCH/DELETE /api/admin/*` |
| Stripe   | `POST /webhooks/stripe` |

## Stripe

Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in `.env`. Checkout creates a Stripe session; webhooks fulfill orders and grant purchases/licenses.
