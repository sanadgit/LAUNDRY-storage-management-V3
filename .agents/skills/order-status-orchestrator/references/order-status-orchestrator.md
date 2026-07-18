# Order Status Orchestrator Reference

## Project Context

This skill coordinates customer-visible order status for In & Out Laundry.
The project uses POS data, packing data, driver workflow, and customer messages, so status should be treated as a confirmed operational state, not a guess.

## Canonical Status Definitions

- `RECEIVED`: order exists and has been accepted into the system
- `SORTING`: items are being sorted or checked
- `WASHING`: items are in wash process
- `DRY_CLEANING`: items are in dry-cleaning process
- `IRONING`: items are being ironed
- `QUALITY_CONTROL`: items are being checked before packing
- `PACKING`: items are being packed
- `READY`: order is ready after POS or approved source confirms readiness
- `OUT_FOR_DELIVERY`: order is assigned and out with driver
- `DELIVERED`: delivery is confirmed
- `CANCELLED`: order is cancelled with reason
- `ON_HOLD`: order needs branch review before customer promise

## POS Status Mapping Notes

Project files show POS-style values such as:

- Active Order / Active Invoice
- Processing / Order Processing
- Completed
- Delivered
- Cancelled / Order Cancelled
- Partially Delivered
- Order Merged

Do not map `Completed` to `READY` blindly.
Use packing or branch confirmation when readiness affects a customer promise.

## Transition Guardrails

Allowed forward movement:

- `RECEIVED` to `SORTING`
- `SORTING` to one cleaning path
- cleaning path to `IRONING`
- `IRONING` to `QUALITY_CONTROL`
- `QUALITY_CONTROL` to `PACKING`
- `PACKING` to `READY`
- `READY` to `OUT_FOR_DELIVERY`
- `OUT_FOR_DELIVERY` to `DELIVERED`

Blocked movements unless verified:

- processing state directly to `DELIVERED`
- `READY` without POS or branch confirmation
- `DELIVERED` without delivery confirmation
- `CANCELLED` without cancellation reason

## Customer Message Style

Use reassurance without overpromising:

- Arabic: concise, polite, and clear.
- English: short and professional.
- Avoid exposing internal uncertainty in a messy way.
- When source data is incomplete, say the branch is checking the order.

## ETA Decision

Return one of these ETA modes:

- `exact`: only when confirmed by POS or branch
- `approximate`: when a branch or delivery workflow gives a reasonable window
- `unavailable`: when the system cannot safely estimate
- `branch_required`: when the branch must confirm

## Branch Contact Triggers

Contact branch when:

- status is unknown
- status is inconsistent between POS and local workflow
- customer says the status is wrong
- order is late
- order is on hold
- customer reports damage, missing item, or failed delivery
- readiness is not confirmed but customer asks if ready

## Late Order Signals

Late order detection should use:

- promised delivery time
- expected delivery time
- current status
- last status update time
- branch SLA
- driver assignment status

If SLA values are not configured, mark as `needs_branch_review` instead of inventing thresholds.

## Safe Customer Replies

If ready is confirmed:

`Your order is ready. We can arrange pickup or delivery.`

If ready is not confirmed:

`I am checking the branch status now. I will not mark it ready until the branch/POS confirms it.`

If late:

`Your order needs a branch check because the expected time has passed. I have escalated it for confirmation.`

If unknown:

`I need the order number or registered phone number to check the status.`
