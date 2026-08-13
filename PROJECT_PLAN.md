# Grocery Store POS — Full Project Plan

## 1. Project Overview

A standalone, scalable Point-of-Sale system for a grocery store. Single checkout
terminal at launch, deployable in two modes from the same codebase:

- **Local mode** — runs fully offline on one machine (no internet dependency)
- **Cloud mode** — hosted, accessible remotely

Separate project from Mizan POS. Built feature-first, following clean layering
(presentation → logic → data) so business rules stay independent of Express/Prisma.

---

## 2. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | React + Vite + TypeScript + TailwindCSS | Local web app, opened via browser (not Electron/Tauri) |
| Backend | Node.js + Express | Feature-based, layered architecture |
| ORM | Prisma | Same schema for local and cloud Postgres |
| Database | PostgreSQL | Installed locally for local mode; hosted (Supabase/Render) for cloud mode |
| Validation | Zod | Request validation at the presentation boundary; doubles as TS types |
| Auth | JWT | Role-based: MANAGER / ACCOUNTANT / CASHIER |
| Receipt printing | node-thermal-printer (ESC/POS) | USB/serial connection |
| Barcode input | USB scanner, keyboard-wedge mode | No extra SDK — types into focused input |
| Cash drawer | ESC/POS kick command via printer | |
| Deployment | Docker (optional but recommended) | Same container definition for local PC or cloud VPS |
| Process management (local) | systemd (Linux) / node-windows (Windows) | Auto-start backend on boot |
| Error tracking | Sentry (cloud mode) | Optional for local mode |
| Logging | Pino | Both modes |

---

## 3. Architecture

**Pattern:** Feature-based + layered (vertical slice, clean architecture)

```
presentation → logic → data
   (routes)   (rules)  (Prisma)
```

- `presentation/` — Express routes + controllers. Parses requests, calls logic, returns responses. No business logic.
- `logic/` — entities, repository interfaces, service functions with business rules. Depends on interfaces, not Prisma directly.
- `data/` — repository implementations. Talks to Prisma. Swappable without touching business logic.

**Key architectural rules:**

1. **Atomic transactions for sales** — a checkout must decrement stock, write `SaleItem` rows, and write the `Sale` record in one Prisma `$transaction`, via a shared `runTransaction()` helper. Never split across separate calls.
2. **Dependency inversion** — `logic` depends on repository interfaces, `data` implements them. Enables swapping storage later without touching business rules.
3. **Config-driven deployment** — no `if (isCloud)` branching in code. A single `config/index.ts` loads `.env.local` or `.env.cloud`. Business logic never knows which mode it's running in.
4. **Sealed error types** — `shared/errors/AppError` base class with subclasses (`InsufficientStockError`, `DuplicateSkuError`, `ValidationError`), mapped to HTTP codes in one central error middleware.
5. **Records are never deleted** — sales are voided (flag), not deleted. Stock changes go through an audited `StockAdjustment` table, never a silent update.

### Folder Structure

```
grocery-pos/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/                 # env loading — single source of truth
│   │   ├── shared/
│   │   │   ├── database/           # Prisma client singleton, runTransaction()
│   │   │   ├── errors/             # AppError + subclasses, error middleware
│   │   │   ├── middleware/         # auth guard, validation
│   │   │   └── utils/
│   │   ├── features/
│   │   │   ├── auth/          (data / logic / presentation)
│   │   │   ├── products/      (data / logic / presentation)
│   │   │   ├── inventory/     (data / logic / presentation)
│   │   │   ├── sales/         (data / logic / presentation)
│   │   │   ├── reports/       (data / logic / presentation)
│   │   │   └── settings/      (data / logic / presentation)
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env.local.example
│   ├── .env.cloud.example
│   └── package.json
├── frontend/
│   ├── src/
│   ├── .env.local
│   ├── .env.cloud
│   └── package.json
└── docker-compose.yml
```

---

## 4. Database Schema (summary)

Already scaffolded in Prisma (`schema.prisma`). Core models:

- **User** — id, username, passwordHash, fullName, role (ADMIN/CASHIER), active
- **Category** — product grouping
- **Supplier** — name, contact info
- **Product** — sku (barcode), name, costPrice, sellPrice, unit, stockQty, reorderLevel, category, supplier
- **Sale** — receiptNo, cashier, subtotal, discount, tax, total, paymentMethod, amountPaid, changeDue, voided
- **SaleItem** — links Sale ↔ Product, stores qty and unitPrice *at time of sale*
- **StockAdjustment** — audit trail for restocks, damage, corrections, returns
- **Setting** — key/value store for store name, tax rate, currency, receipt footer

All money and quantity fields use `Decimal`, never `Float`.

---

## 5. Feature Scope

### Now (core)
1. **Auth with roles** — login, JWT
   - `MANAGER` — full access: products, users, reports, settings
   - `ACCOUNTANT` — view sales/reports only, no product/user management
   - `CASHIER` (saler) — checkout/POS screen only
2. **Product management** — add / update / remove (manager-only write access)
3. **Sales / checkout with print bill** — cart, checkout, atomic stock decrement, thermal receipt printing

### Later phase
4. **Sales analytics dashboard**
   - Sales totals: today / this week / this month
   - Top-selling products: today / this week / this month

---

## 6. Build Phases

### Phase 1 — Foundation
- Scaffold backend (done) and frontend folder structures
- Prisma schema + first migration (roles: MANAGER / ACCOUNTANT / CASHIER)
- Config module (`.env.local` / `.env.cloud` loading)
- Shared error handling + validation middleware
- Auth feature end-to-end (entity → repository → service → routes) — the template for all other features, with role-based route guards

### Phase 2 — Product Management
- Products feature: add / update / remove, SKU/barcode lookup
- Categories & Suppliers CRUD (supporting data)
- Manager-only write access; accountant/cashier read-only where relevant

### Phase 3 — Core POS Flow
- Sales feature: barcode scan → cart → checkout → atomic transaction (stock decrement + sale write)
- Payment handling: cash / card (manual entry), change calculation
- **Print bill** — receipt generation + thermal printer integration
- Cash drawer trigger

### Phase 4 — Sales Analytics (later phase)
- Sales summary: today / this week / this month
- Top-selling products: today / this week / this month
- (Optional stretch) profit margin view, low-stock report

### Phase 5 — Deployment Hardening
- Local mode: local Postgres install script, auto-start service (systemd/node-windows), scheduled DB backup script
- Cloud mode: hosted Postgres, HTTPS via reverse proxy, CORS locked to frontend domain, rate limiting, stricter JWT expiry
- Docker Compose file that works for both modes via env swap

### Phase 6 — Polish
- Kiosk-mode browser setup for the terminal (no address bar, full screen)
- Keyboard shortcuts for fast checkout (no mouse dependency)
- Settings screen (tax rate, currency, receipt footer, store name)
- User management screen (manager only)

---

## 7. Open Decisions / Questions for Later

- Tax handling: flat rate vs per-category tax rates
- Discounts: per-item vs whole-sale, percentage vs fixed amount
- Multi-currency: needed or single-currency only
- Returns/refunds workflow: separate feature or extension of Sales
- Backup destination for local mode: USB drive, local NAS, or optional cloud sync when internet is available

---

## 8. Status

- [x] Requirements clarified (offline/local + cloud-deployable, single terminal, scalable)
- [x] Tech stack finalized
- [x] Feature-based layered architecture defined
- [x] Prisma schema drafted (PostgreSQL)
- [x] Backend folder structure scaffolded
- [ ] Auth feature implementation
- [ ] Products feature implementation
- [ ] Sales feature implementation (atomic transaction)
- [ ] Frontend scaffold
- [ ] Hardware integration (printer, cash drawer, scanner)
- [ ] Deployment scripts (local + cloud)
