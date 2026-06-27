# Daily Operations Report - All Branches Implementation Plan

## Goal
Build an all-branches daily operations report that matches the supplied reference dashboard:
- Daily Operations Report header.
- All Branches scope with branch names.
- KPI strip for revenue, orders, new customers, average order value, and items processed.
- Revenue and orders trend for the last 7 days.
- Branch performance table.
- Expenses summary donut.
- Cash summary panel.
- Top services table.
- Highlights, alerts/notes, and today's tasks.

## Data Source
Use POS Counter Cash report as the primary source and request detailed sections where available:
- `expence_entry_details=1`
- `purchase_etnry_details=1`
- `received_payment_details=1`
- `order_billwise_details=1`
- `prod_details=1`
- `ord_prod_details=1`
- `cust_details=1`

## Backend
Add `GET/POST /api/reports/daily-operations`.

Backend responsibilities:
- Resolve branches from the local branches table.
- Fetch POS daily report per branch.
- Fetch previous-day report per branch for KPI deltas.
- Fetch last 7 days across all branches for charts.
- Aggregate totals:
  - total revenue
  - total orders
  - unique/new customers when POS detail is available
  - items processed from service/product detail when available
  - average order value
  - expenses
  - cash in/out and closing balance
- Build:
  - branch performance rows
  - revenue trend
  - orders trend
  - expenses categories
  - top services by revenue
  - highlights/alerts/tasks
  - data source labels

## Frontend
Add `src/pages/OperationsReport.tsx` and route `/operations-report`.

Frontend responsibilities:
- Render the supplied report layout as a code-native dashboard.
- Provide date and branch scope controls.
- Support `mode=image` for clean screenshot/export rendering.
- Use SVG/CSS-native charts.
- Keep text compact, no overlap, and responsive.

## Verification
- `npm run lint`
- Local server healthcheck on `http://localhost:3001`
- Manual visual check of:
  - `/operations-report`
  - `/operations-report?date=YYYY-MM-DD&mode=image`

## Known Limitations
If POS does not return product/customer details, the report falls back safely:
- items processed may use parsed service quantities or zero.
- new customers may use parsed customer rows or zero.
- top services may show empty state.
