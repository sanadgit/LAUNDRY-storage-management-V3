---
name: pos-integration
description: Integrate the In & Out Laundry AI agent with the POS system, including login/session handling, order lookup, packing and delivery APIs, report access, customer and branch data, and safe read/write boundaries. Use when building or editing POS-connected workflows, APIs, sync jobs, or agent tools that must read from or write to the POS without inventing data or bypassing the source of truth.
---

# POS Integration

## Purpose

Use this skill when Codex needs to connect an AI agent, workflow, or backend service to the POS system used by In & Out Laundry.
Treat the POS as the source of truth for orders, customer lookups, packing, delivery, and report data.

## Core Rules

1. Verify the POS flow before writing anything back.
2. Prefer read-only access unless the task explicitly requires a write action.
3. Preserve the exact endpoint, field, and status names from the source system.
4. Never invent POS records, invoice states, or payment states.
5. Never assume a write endpoint is safe without checking its side effects.
6. Keep credentials outside code and workflow JSON.

## What This Skill Covers

- POS login and session handling
- Order lookup and order details
- Packing-related endpoints
- Pickup and delivery endpoints
- Customer lookup from POS
- Branch-scoped reporting
- Safe writeback to POS
- Response normalization for agent use
- Mapping POS state to AI conversation state

## Known POS Routes From Project Files

Use the route names already discovered in the repo unless a newer source says otherwise:

- `purchase_api/login_action`
- `packing_api/searchOrder`
- `packing_api/getOrderDetails`
- `packing_api/getPackingData`
- `packing_api/findPackings`
- `packing_api/savePacking`
- `packing_api/deletePacking`
- `packing_api/resendNotification`
- `packing_api/searchjob`
- `packing_api/saveJobProcess`
- `packing_api/save_pickup`
- `packing_api/search_customers`
- `packing_api/get_shipping_addresses_by_customer`
- `packing_api/updatePickup`
- `packing_api/updatePickupLocation`
- `pos_api/getDeliveryData`
- `pos_api/fetchPendingDeliveries`
- `pos_api/findDeliveryOrderDetails`
- `pos_api/deliveryProcess`
- `pos_api/androidPrint`
- `pos_api/opencounterAction`
- `pos_api/closecounterAction`
- `pos_api/lastClosedCounterReport`
- `pos_api/rt_db_op_log`

## Read / Write Split

Use POS reads for:

- order status lookup
- customer lookup
- delivery queue lookup
- branch reporting
- packing status review
- reconciliation and validation

Use POS writes only when the business flow is confirmed and the side effects are understood:

- pickup creation
- pickup update
- delivery process update
- packing save/update
- notification resend

## Session Handling

When the POS requires login:

1. authenticate once
2. store the session token or cookies securely
3. reuse the session until it expires
4. refresh the session when the POS rejects a call

Do not hardcode usernames, passwords, or device identifiers.

## Data Normalization

Normalize POS data before passing it to the AI agent:

- order ids
- branch ids
- phone numbers
- currency values
- delivery dates
- status strings

Keep the original POS fields available for audit.

## Packing And Delivery Rules

The repo shows `savePacking` as a likely writeback point.
Treat it carefully because it may do more than update a remark.
Before using it, confirm:

- required payload fields
- whether it changes packing state
- whether it needs product lists
- whether it triggers notifications

For delivery-related flows, verify status transitions before marking anything completed.

## Branch Rules

Always scope POS queries by branch when branch context matters.
Do not assume all branches share the same prices, service availability, or area coverage.

## AI Agent Integration Pattern

When the AI agent needs POS data:

1. identify the intent
2. fetch the required POS record
3. normalize the result
4. attach minimal context to the model
5. let the model explain or route, not invent

## Guardrails

- Do not bypass POS by fabricating local state.
- Do not let the AI write POS data without validation.
- Do not send the same order update twice unless the workflow is explicitly idempotent.
- Do not convert unknown status values into assumed ones.
- Do not hide failed POS writes from the operator.

## Reference Files

Read [references/pos-integration.md](references/pos-integration.md) for the known endpoints, response handling notes, and safe workflow patterns discovered in this repo.
