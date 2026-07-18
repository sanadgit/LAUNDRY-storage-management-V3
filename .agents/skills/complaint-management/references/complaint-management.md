# Complaint Management Reference

## Project Context

In & Out Laundry uses complaint tickets, branch assignment, manager follow-up, and escalation to operations for urgent complaints.
The AI agent should help collect facts and route the case, not judge responsibility before investigation.

## Category Guide

- `DELAY`: late pickup, late delivery, delayed processing
- `CLEANING_QUALITY`: stain not removed, smell, poor wash/press quality
- `DAMAGE`: tear, burn, color issue, shrinkage, broken accessory
- `LOST_ITEM`: entire item lost
- `MISSING_ITEM`: missing piece from order or missing accessory
- `WRONG_ITEM`: customer received another customer's item
- `BILLING`: price, payment, invoice, balance, refund question
- `STAFF_BEHAVIOR`: employee attitude, rude response, poor handling
- `DRIVER`: driver behavior, no-show, wrong location, late pickup
- `DELIVERY`: delivery failure, wrong address, delivered to wrong person
- `OTHER`: unclear or not covered

## Priority Assignment

Use `P1` when:

- expensive item damaged or lost
- VIP customer
- legal or public-review risk
- serious repeated complaint

Use `P2` when:

- severe delay
- repeated quality issue
- customer is very upset
- branch has not responded

Use `P3` when:

- billing issue
- delivery issue
- wrong item
- driver issue

Use `P4` when:

- simple note
- low-risk feedback
- clarification request

## Ticket Fields

Recommended fields:

- ticket id
- customer phone
- customer name
- order id
- branch id
- complaint category
- priority
- description
- photos or attachments
- assigned manager
- status
- resolution
- customer satisfaction
- created at
- updated at

## Status Flow

Use:

- `new`
- `assigned`
- `investigating`
- `waiting_customer`
- `resolved`
- `closed`

Do not close directly from `new` without manager action.

## Manager Routing

Default routing:

- branch-related complaint -> branch manager
- driver/delivery complaint -> branch manager and dispatch owner
- P1 or repeated complaint -> operations manager
- staff behavior -> branch manager plus operations manager if serious
- billing -> accountant/branch manager depending on source

## Photo Request Rules

Ask for photos when:

- visible damage exists
- cleaning quality is disputed
- wrong item needs identification
- receipt/payment proof is needed

Do not ask for photos when:

- customer is only asking status
- the complaint is about staff behavior with no visual evidence
- the customer already sent enough evidence

## Customer Follow-Up

After resolution:

- explain the outcome briefly
- confirm whether the customer is satisfied
- record satisfaction if available
- reopen or escalate if customer rejects the resolution

## Safe Message Examples

Initial acknowledgement:

`Sorry for the inconvenience. I will create a complaint ticket and send it to the responsible manager for review.`

Damage claim:

`Please send a clear photo of the item and the order number. We will check the item history and branch records before confirming the cause.`

Delay:

`I will check the branch status and update you. If the expected time has passed, I will escalate it for confirmation.`

Closure:

`The manager has updated the case with the resolution. Please confirm if this solves the issue for you.`
