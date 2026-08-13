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

## Next: Phase 2 — Product Management

Copy the `auth` feature's structure (`data/logic/presentation`) for the `products`
feature: entity → repository interface → Prisma repository → service (with
`DuplicateSkuError` business rule) → Zod schemas → controller → routes, guarded by
`requireRole('MANAGER')` for write operations.
# grocery-pos
