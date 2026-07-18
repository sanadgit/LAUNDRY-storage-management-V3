---
name: driver-dispatch
description: Dispatch pickup and delivery tasks to drivers for the In & Out Laundry project using customer location, service area, responsible branch, driver zones, driver availability, shift, workload, distance, task priority, and task type. Use when creating or editing driver assignment, acceptance, timeout, reassignment, pickup, delivery, or route workflows.
---

# Driver Dispatch

## Purpose

Use this skill when Codex needs to assign a pickup or delivery task to a driver.
The dispatch flow should be fair, branch-aware, area-aware, and easy to audit.

## Dispatch Flow

Apply this flow:

1. Customer location
2. Determine service area
3. Determine responsible branch
4. Find available drivers
5. Rank drivers
6. Assign driver
7. Request acceptance
8. Reassign if rejected or timed out

## Inputs

Use these dispatch inputs when available:

- customer location
- customer area
- responsible branch
- driver zones
- driver status
- driver shift
- current task count
- distance
- request priority
- task type: `Pickup` or `Delivery`

## Task Statuses

Use these canonical task statuses:

- `ASSIGNED`
- `ACCEPTED`
- `ON_THE_WAY`
- `ARRIVED`
- `PICKED_UP`
- `DELIVERED`
- `CUSTOMER_UNAVAILABLE`
- `FAILED`
- `CANCELLED`

## Candidate Filtering

A driver can be considered only when:

- assigned to the responsible branch or allowed service area
- currently on shift
- available for the task type
- not blocked or inactive
- not already over capacity

If no driver qualifies, escalate to the branch manager instead of assigning randomly.

## Driver Ranking

Rank drivers using:

- exact area match
- branch match
- active shift
- fewer current tasks
- shorter distance
- task priority compatibility
- recent rejection or timeout penalty

Do not always pick the first configured driver unless the project explicitly has no driver zone model yet.

## Acceptance Flow

After assignment:

1. send the task to the selected driver
2. set status to `ASSIGNED`
3. wait for driver response
4. if accepted, set status to `ACCEPTED`
5. if no response, remind driver
6. if still no response, notify branch manager and reassign
7. if rejected, request reason and reassign

Use project timing when configured.
The existing plan mentions a 10-minute reminder and branch notification/reassignment around 15 to 30 minutes depending on flow.

## Status Transitions

Allowed normal flow:

- `ASSIGNED` -> `ACCEPTED`
- `ACCEPTED` -> `ON_THE_WAY`
- `ON_THE_WAY` -> `ARRIVED`
- `ARRIVED` -> `PICKED_UP` for pickup tasks
- `ARRIVED` -> `DELIVERED` for delivery tasks

Exception flow:

- `ASSIGNED` -> `FAILED` when rejected or expired
- `ON_THE_WAY` -> `CUSTOMER_UNAVAILABLE`
- any active status -> `CANCELLED` with approved reason
- `CUSTOMER_UNAVAILABLE` -> `ASSIGNED` when rescheduled

## Customer Communication

Only notify the customer when the driver status is confirmed:

- `ACCEPTED`: driver accepted the task
- `ON_THE_WAY`: driver is heading to customer
- `ARRIVED`: driver arrived
- `PICKED_UP`: items collected
- `DELIVERED`: items delivered
- `CUSTOMER_UNAVAILABLE`: driver could not reach the customer

Do not promise exact arrival time unless route/distance and driver confirmation support it.

## Guardrails

- Do not assign a driver outside the responsible branch without approval.
- Do not assign to an off-shift driver unless explicitly overridden.
- Do not create duplicate active assignments for the same task.
- Do not mark delivered unless delivery workflow or driver confirmation supports it.
- Do not hide rejection, timeout, or failed delivery reasons.

## Reference Files

Read [references/driver-dispatch.md](references/driver-dispatch.md) for ranking details, timeout rules, and safe reassignment guidance.
