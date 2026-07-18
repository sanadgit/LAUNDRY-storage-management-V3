---
name: complaint-management
description: Manage In & Out Laundry complaints from intake to closure, including complaint classification, severity, responsible branch, manager assignment, required information, photo requests, liability-safe wording, response times, operations escalation, and customer follow-up. Use when creating or editing complaint workflows, customer support replies, escalation logic, complaint tickets, or complaint dashboards.
---

# Complaint Management

## Purpose

Use this skill when Codex needs to classify, route, escalate, update, or close a customer complaint.
The complaint flow must protect the customer experience while avoiding unsupported admissions of responsibility before investigation.

## Complaint Categories

Use these canonical categories:

- `DELAY`
- `CLEANING_QUALITY`
- `DAMAGE`
- `LOST_ITEM`
- `MISSING_ITEM`
- `WRONG_ITEM`
- `BILLING`
- `STAFF_BEHAVIOR`
- `DRIVER`
- `DELIVERY`
- `OTHER`

## Priority Levels

- `P1`: lost or damaged expensive item, high-value claim, VIP customer, serious repeated failure
- `P2`: severe delay, repeated quality complaint, strong customer anger, unresolved previous complaint
- `P3`: payment issue, delivery issue, wrong item, driver issue, missing detail that needs branch review
- `P4`: simple inquiry, minor note, low-risk feedback

## Core Rules

1. Create a complaint ticket for every real complaint.
2. Assign the responsible branch before routing to a manager.
3. Do not admit liability for damage, loss, wrong item, or billing error before investigation.
4. Ask for photos when visual evidence helps classify or verify the issue.
5. Escalate urgent or unresolved complaints to the operations manager.
6. Do not close a complaint without manager approval or a recorded resolution.
7. Follow up with the customer after the resolution is applied.

## Intake Flow

1. Identify complaint category.
2. Detect severity.
3. Collect required information.
4. Determine branch and order context.
5. Create complaint ticket.
6. Assign responsible manager.
7. Send customer acknowledgement.
8. Follow up with manager.
9. Escalate if response time is missed.
10. Confirm resolution with customer.
11. Close ticket only after approval and resolution notes.

## Required Information

Always collect:

- customer name or verified phone
- order number or invoice number if available
- branch or service area if known
- complaint description
- date/time of incident
- preferred contact language

For item complaints, collect:

- item type
- quantity
- photo if relevant
- whether the item is still with customer or branch

For delivery/driver complaints, collect:

- address or area
- driver name/phone if known
- delivery time
- what happened

For billing complaints, collect:

- invoice number
- amount disputed
- payment method
- receipt or screenshot if available

## When To Request A Photo

Request a photo for:

- `DAMAGE`
- `CLEANING_QUALITY`
- `WRONG_ITEM`
- `MISSING_ITEM` when item evidence or tag/receipt helps
- billing receipt or payment proof

Do not delay P1 escalation while waiting for photos.

## Liability-Safe Wording

Use:

- `I am sorry this happened. I will create a complaint ticket and send it to the responsible manager for review.`
- `We need to check the order record and item condition before confirming the cause.`

Avoid:

- `We damaged it.`
- `It is our fault.`
- `We will compensate you.`
- `The branch definitely lost it.`

Compensation or responsibility requires manager approval.

## Response Time Rules

Use these defaults unless the project has configured SLA values:

- `P1`: immediate escalation and manager acknowledgement as soon as possible
- `P2`: branch manager review urgently, escalate if no response within 1 hour
- `P3`: branch review within the same business day
- `P4`: normal support follow-up

## Escalation

Escalate to operations manager when:

- `P1` complaint
- branch manager does not respond within SLA
- repeated complaint from same customer
- customer is angry or threatens escalation
- lost/damaged expensive item
- complaint involves staff behavior or driver misconduct

## Reference Files

Read [references/complaint-management.md](references/complaint-management.md) for category details, required fields, escalation rules, and safe customer-message patterns.
