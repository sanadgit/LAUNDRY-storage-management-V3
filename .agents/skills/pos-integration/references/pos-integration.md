# POS Integration Reference

## Project Context

The project integrates with an external POS / AiPSoft Connect-style system.
The repo already contains evidence of login, order lookup, packing, delivery, and report endpoints.

## Discovered Connection Flow

1. Acquire or reuse a POS session.
2. Call the relevant POS or packing route.
3. Read the response.
4. Normalize the result.
5. Pass only the needed context to the AI or workflow.

## Important Login Route

- `purchase_api/login_action`

The project files indicate this route is used to create a working POS session.
Do not hardcode secrets in code or workflow JSON.

## Important Read Routes

- `packing_api/searchOrder`
- `packing_api/getOrderDetails`
- `packing_api/getPackingData`
- `packing_api/findPackings`
- `packing_api/search_customers`
- `packing_api/get_shipping_addresses_by_customer`
- `pos_api/getDeliveryData`
- `pos_api/fetchPendingDeliveries`
- `pos_api/findDeliveryOrderDetails`
- `pos_api/lastClosedCounterReport`
- `pos_api/rt_db_op_log`

## Important Write Routes

Treat these as writeback or side-effect routes:

- `packing_api/savePacking`
- `packing_api/deletePacking`
- `packing_api/resendNotification`
- `packing_api/saveJobProcess`
- `packing_api/save_pickup`
- `packing_api/updatePickup`
- `packing_api/updatePickupLocation`
- `pos_api/deliveryProcess`
- `pos_api/opencounterAction`
- `pos_api/closecounterAction`

## Known Payload Hints

The project files show these recurring fields:

- `order_id`
- `branch_id`
- `client_identifier`
- `remark`
- `packing_note`
- `file_ids`
- `time_zone`
- `user_id`
- `final_packed_product_list`
- `assigned_driver_phone`
- delivery status fields

## Safe Write Rule

Before calling a write route:

1. confirm the exact route
2. confirm the side effect
3. confirm whether the route needs supporting fields
4. confirm whether the route is idempotent
5. confirm whether the workflow should show a human approval step

## Normalization Rules

When returning POS data to the agent or UI:

- keep the source values
- map status to user-friendly labels separately
- preserve order and branch ids exactly
- keep money fields numeric until final formatting
- keep phone numbers normalized for external messages

## AI Handoff Pattern

When the agent uses POS data:

- fetch the POS record first
- build a small factual summary
- include only verified fields
- let the model respond based on facts

## Risk Notes

- `savePacking` may do more than update remarks.
- Order and delivery endpoints may require branch context.
- Some routes may change state even if they look like simple lookups.
- If a call fails, inspect the payload and the side effect before retrying.
