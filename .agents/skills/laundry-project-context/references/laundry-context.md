# In & Out Laundry Context

## Identity

- Company: In & Out Laundry
- Domain: laundry operations, pickup, delivery, storage/sorting, complaints, branch management, and POS sync
- Primary languages: Arabic and English, with some Urdu support in existing plans

## Known Project Intent

The project is built to stop Codex from generating a generic system.
All automation should stay aligned with In & Out Laundry rules, branch coverage, and POS-driven data.

## Roles

Known or planned roles from project files:

- customer
- driver
- branch_manager
- cashier
- accountant
- operations_manager
- general_manager
- unknown

## Complaint Groups

Known complaint types from the project plan:

- quality
- delay
- price
- delivery
- lost_item
- damage
- staff_behavior
- other

## Order and Workflow Statuses

Pickup status:

- new
- assigned
- accepted
- on_the_way
- picked_up
- cancelled
- completed

Delivery status:

- new
- assigned
- accepted
- out_for_delivery
- delivered
- failed
- cancelled

Complaint status:

- new
- assigned
- investigating
- waiting_customer
- resolved
- closed

Conversation status:

- open
- waiting_customer
- waiting_staff
- resolved
- closed

## Business Rules

- Never invent prices.
- Get prices from database or POS source only.
- If branch-specific pricing exists, use it over the general price.
- If a customer asks for service availability, confirm by branch and service type.
- Escalate urgent complaints instead of auto-closing them.
- Assign drivers only through the agreed workflow.
- Use the exact status names from the repo and POS mapping when updating records.

## Areas and Branch Logic

Branch coverage and customer area mapping are project-specific and may differ by branch.
Do not guess coverage zones.
Use the branch data source in the repo or ask for the approved branch list when missing.

## POS and System Terms

Source files in this repo mention POS sync, order lookup, pickup/delivery sync, and reporting.
Keep POS table names, endpoint names, and field names exactly as the source defines them.

Common project terms to preserve:

- POS
- branch
- driver
- pickup
- delivery
- complaint
- order
- service
- pricing
- customer care

## Arabic / English Vocabulary

Use the same bilingual vocabulary that the project already uses.
Prefer these stable mappings where relevant:

- طلب = order
- خدمة = service
- فرع = branch
- سائق = driver
- شكوى = complaint
- استلام = pickup
- توصيل = delivery
- سعر = price
- حالة = status
- عميل = customer
- موظف = staff
- مدير الفرع = branch manager
- مدير العمليات = operations manager
- محاسب = accountant

## What To Check Before Coding

1. Confirm whether the change touches customer-facing flow, internal operations, or POS sync.
2. Confirm which branch, service, or status model applies.
3. Confirm whether the source of truth is POS, database, or workflow state.
4. Keep the implementation constrained to the laundry domain.
