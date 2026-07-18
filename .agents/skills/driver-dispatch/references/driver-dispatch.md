# Driver Dispatch Reference

## Project Context

This skill supports pickup and delivery driver assignment for In & Out Laundry.
The project already includes pickup and delivery requests, assigned driver phone fields, driver commands such as `ACCEPT`, and dispatch escalation when a driver does not respond.

## Dispatch Decision Data

Recommended driver candidate fields:

- driver id
- driver name
- driver phone
- branch id
- service zones
- shift status
- availability status
- current task count
- last assigned task time
- distance to customer
- supported task types

## Ranking Score Guidance

Prefer drivers with:

- same service area as customer
- same responsible branch
- active shift
- available status
- fewer current tasks
- lower distance
- no recent timeout
- no recent rejection for the same task type

When scores are close, prefer the lower workload.

## Timeout And Reassignment

Suggested behavior:

- send task and wait for acceptance
- remind after the configured reminder window
- reassign after timeout
- notify branch manager when no driver accepts
- store rejection or timeout reason

Project planning mentions:

- reminder after 10 minutes
- manager notification or reassignment if no response after the configured timeout
- reassignment if pickup is not accepted after 15 minutes

Use configured values when the system provides them.

## Pickup Status Mapping

Pickup tasks may map to:

- `ASSIGNED`
- `ACCEPTED`
- `ON_THE_WAY`
- `ARRIVED`
- `PICKED_UP`
- `FAILED`
- `CANCELLED`

## Delivery Status Mapping

Delivery tasks may map to:

- `ASSIGNED`
- `ACCEPTED`
- `ON_THE_WAY`
- `ARRIVED`
- `DELIVERED`
- `CUSTOMER_UNAVAILABLE`
- `FAILED`
- `CANCELLED`

## Safe Assignment Rules

- keep one active driver assignment per task
- record every reassignment
- preserve previous driver and reason
- never overwrite failed/rejected history
- notify customer only after confirmed driver state

## Branch Escalation

Escalate to branch manager when:

- no driver is available
- no driver accepts within timeout
- customer unavailable
- delivery fails
- task is urgent and driver capacity is low
- location is outside known service area

## Customer Message Safety

Use approximate language unless route and driver status are confirmed.
For example:

- `Your driver has accepted the pickup request.`
- `The driver is on the way.`
- `The driver could not reach you. Please confirm a suitable time.`

Avoid exact timing unless dispatch data supports it.
