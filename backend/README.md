# Grocery POS — Backend (Phase 1: Foundation)

## What's included in this phase

- Feature-based, layered architecture (`presentation → logic → data`)
- Config module — dual-mode (local/cloud) via `.env`
- Shared: Prisma client singleton, transaction helper, sealed `AppError` hierarchy,
  central error handler, JWT auth middleware with role guard, Zod request validation
- **Auth feature, fully implemented end-to-end** — the template for every other feature:
  - `POST /api/auth/register` — creates a user (first user ever created becomes MANAGER automatically)
  - `POST /api/auth/login` — returns a JWT
  - `GET /api/auth/me` — returns the current user (requires `Authorization: Bearer <token>`)
- Roles: `MANAGER`, `ACCOUNTANT`, `CASHIER`

## Phase 2 — Product Management

- **Products** (`/api/products`) — CRUD (add/update/remove — soft delete), SKU/barcode
  lookup (`GET /api/products/sku/:sku`), manager-only writes, any-role reads
- **Categories** (`/api/categories`) — CRUD, manager-only writes
- **Suppliers** (`/api/suppliers`) — CRUD, manager-only writes

## Phase 3 — Core POS Flow (checkout + print bill)

- **Sales / checkout** (`/api/sales`):
  - `POST /api/sales/checkout` — the core POS transaction. Runs entirely inside
    one DB transaction: locks the relevant product rows (`SELECT ... FOR UPDATE`),
    validates stock and active status, computes totals **server-side** from the
    locked prices (client only sends productId + qty, never prices), decrements
    stock, and writes the `Sale` + `SaleItem` rows. Any failure rolls back the
    whole transaction — never a partial sale or stock decremented without a
    matching sale record.
  - `GET /api/sales/:id`, `GET /api/sales/receipt/:receiptNo` — look up a sale
  - `GET /api/sales?from=&to=` — list sales in a date range (manager/accountant only)
  - `POST /api/sales/:id/void` — void a sale (manager only; does not auto-restore
    stock — that should go through a deliberate inventory adjustment later)
  - `POST /api/sales/:id/print` — prints the receipt via ESC/POS thermal printer
    and triggers the cash-drawer kick. Printing failures never affect the already-
    completed sale — they're surfaced as a separate error.
- **Settings** (`/api/settings`) — store name, currency symbol, tax rate, receipt
  footer, printer interface. Any role can read, manager-only to update.

## Setup (run this on your own machine — not in this sandbox)

1. Install PostgreSQL locally (or point `DATABASE_URL` at a hosted instance for cloud mode).
2. Copy the right env file:
   ```bash
   cp .env.local.example .env      # for local/offline deployment
   # or
   cp .env.cloud.example .env      # for hosted deployment
   ```
   Fill in `DATABASE_URL` and a strong `JWT_SECRET`.
3. Install dependencies (already run once in this sandbox, but on a fresh machine):
   ```bash
   npm install
   ```
4. Generate the Prisma client and run the first migration:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```
5. Start the dev server:
   ```bash
   npm run dev
   ```
6. Test it:
   ```bash
   curl http://localhost:5000/health

   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"password123","fullName":"Store Manager"}'
   # first user -> automatically MANAGER

   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"password123"}'
   # copy the returned token

   curl http://localhost:5000/api/auth/me -H "Authorization: Bearer <token>"
   ```

## Known sandbox limitation (not a code issue)

`npx prisma generate` could not be run inside the build sandbox because it needs to
download engine binaries from `binaries.prisma.sh`, which isn't reachable from that
environment's network. The schema and all TypeScript code have been reviewed and
type-checked against everything except the Prisma-generated types themselves — it
will generate normally on a machine with regular internet access.

## Next: Phase 4 — Sales Analytics (later phase)

Add reporting endpoints for sales totals and top-selling products across
today / this week / this month, likely a new `reports` feature that reads
from the `Sale`/`SaleItem` tables with date-range aggregation queries.
# grocery-pos
