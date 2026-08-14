# Grocery POS — Frontend

React + Vite + TypeScript + TailwindCSS. A single-terminal POS UI: barcode
scan → cart → checkout → print receipt, plus product management and a
sales-analytics dashboard — all role-gated to match the backend
(`MANAGER` / `ACCOUNTANT` / `CASHIER`).

## Design

Not a generic dashboard template — built around a "grocer's shelf-tag"
identity:
- Deep pine-green sidebar (`#16302A`) instead of a plain white nav
- Mustard "shelf-tag" chips (with a die-cut notch) for prices, totals, and
  low-stock alerts — the one recurring accent, used sparingly
- A perforated "tear-line" divider above totals, echoing a paper receipt
- Space Grotesk for headings, IBM Plex Sans for UI text, IBM Plex Mono with
  tabular figures for every price/quantity — so numbers align like a
  register display
- Every input/button sized as a real touch target (48px min) for a kiosk
  browser with no mouse

## Setup

```bash
cp .env.local.example .env      # for local/offline deployment
# or
cp .env.cloud.example .env      # for hosted deployment, point VITE_API_URL at the hosted backend

npm install
npm run dev       # http://localhost:5173
```

Requires the backend running (see `../backend/README.md`) — checkout won't
find any products until at least a MANAGER account and some products exist
via the backend's `/api/auth/register` and `/api/products` endpoints.

## Pages

- `/login` — sign in
- `/` — Checkout (all roles) — scan/lookup by SKU, cart, checkout, print receipt
- `/products` — Products (all roles read; MANAGER can add/update/remove)
- `/reports` — Sales analytics (MANAGER, ACCOUNTANT only) — today/week/month
  summaries + top-selling products
