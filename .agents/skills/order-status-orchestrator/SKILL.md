---
name: order-status-orchestrator
description: Orchestrate In & Out Laundry order lifecycle states, allowed transitions, customer-facing status messages, ETA rules, branch escalation, late-order detection, and POS-confirmed readiness. Use when designing or editing order tracking, status updates, delivery workflows, customer notifications, dashboards, or AI replies about an order's progress.
---

# Order Status Orchestrator

## Purpose

Use this skill when Codex needs to reason about an order status, move an order between stages, notify a customer, or decide whether to contact the branch.
The goal is to keep customer communication honest and POS-backed.

## Canonical Statuses

Use these canonical operational statuses:

- `RECEIVED`
- `SORTING`
- `WASHING`
- `DRY_CLEANING`
- `IRONING`
- `QUALITY_CONTROL`
- `PACKING`
- `READY`
- `OUT_FOR_DELIVERY`
- `DELIVERED`
- `CANCELLED`
- `ON_HOLD`

## Core Rules

1. Do not tell the customer an order is `READY` unless POS or the approved source confirms it.
2. Do not promise an exact delivery time unless the workflow has verified delivery capacity.
3. Do not skip quality or packing stages when the source data says the order is still processing.
4. Contact the branch when the status is missing, inconsistent, late, on hold, or disputed.
5. Keep internal status transitions separate from customer-facing wording.
6. Treat POS as the confirmation source for readiness and delivery completion.

## Allowed Transition Model

Normal flow:

- `RECEIVED` -> `SORTING`
- `SORTING` -> `WASHING`
- `SORTING` -> `DRY_CLEANING`
- `WASHING` -> `IRONING`
- `DRY_CLEANING` -> `IRONING`
- `IRONING` -> `QUALITY_CONTROL`
- `QUALITY_CONTROL` -> `PACKING`
- `PACKING` -> `READY`
- `READY` -> `OUT_FOR_DELIVERY`
- `OUT_FOR_DELIVERY` -> `DELIVERED`

Exception flow:

- any active status -> `ON_HOLD`
- any active status -> `CANCELLED` only with approved cancellation reason
- `ON_HOLD` -> previous active status after branch resolution
- `OUT_FOR_DELIVERY` -> `READY` only when delivery failed and the order returned to branch

## Customer Messaging

Use short, clear messages:

- `RECEIVED`: We received your order and it is being prepared for processing.
- `SORTING`: Your items are being sorted and checked.
- `WASHING`: Your order is in washing.
- `DRY_CLEANING`: Your order is in dry cleaning.
- `IRONING`: Your order is being ironed.
- `QUALITY_CONTROL`: Your order is being checked before packing.
- `PACKING`: Your order is being packed.
- `READY`: Your order is ready for pickup or delivery.
- `OUT_FOR_DELIVERY`: Your order is out for delivery.
- `DELIVERED`: Your order has been delivered.
- `CANCELLED`: Your order has been cancelled.
- `ON_HOLD`: Your order needs branch review before we can confirm the next step.

Adjust language to Arabic or English based on the customer, but keep the meaning the same.

## ETA Rules

Give an estimated time only when:

- POS has an expected delivery date/time
- the branch confirmed the estimate
- a delivery workflow has assigned a driver and route
- the estimate is clearly phrased as approximate

Do not give an ETA when:

- the order status is unknown
- the order is on hold
- the order is late and not branch-confirmed
- POS data conflicts with local workflow state

## Late Order Detection

Flag an order as late when:

- expected delivery time has passed and status is not `DELIVERED`
- order stays too long in one processing stage
- customer asks repeatedly and source status has not advanced
- POS says completed but not delivered after the delivery SLA
- branch workflow has no update after a handoff

Late orders should trigger branch contact or escalation, not a guessed promise.

## POS Confirmation Rules

Before saying `READY`, verify:

- POS order status supports ready/completed state
- packing state is complete where required
- branch has no hold or quality issue

Before saying `DELIVERED`, verify:

- POS or delivery workflow confirms delivery
- driver delivery status is final
- no failed-delivery event is active

## Reference Files

Read [references/order-status-orchestrator.md](references/order-status-orchestrator.md) for detailed transition, messaging, ETA, and escalation guidance.
