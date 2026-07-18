# API Design Reference

## Architecture Principle

Use this flow:

```text
n8n Workflow
-> In & Out Laundry Internal API
-> POS Adapter / AiPSoft Client
-> POS
```

Avoid this flow:

```text
n8n Workflow
-> raw POS endpoint
```

Direct POS calls inside every workflow create duplicated login logic, inconsistent error handling, and high risk of accidental production writes.

## Route Versioning

Use `/api/v1` for public or n8n-facing contracts:

- `/api/v1/pos/orders/:orderId/status`
- `/api/v1/pickups`
- `/api/v1/deliveries`
- `/api/v1/complaints`
- `/api/v1/notifications/whatsapp`
- `/api/v1/ai/router`
- `/api/v1/webhooks/whatsapp`

Use internal routes only for trusted backend-to-backend calls:

- `/internal/v1/pos/session`
- `/internal/v1/pos/search-order`
- `/internal/v1/audit/events`

Do not expose internal routes to browsers or untrusted clients.

## Standard Response Envelope

Successful response:

```json
{
  "ok": true,
  "data": {
    "order_id": "256719",
    "status": "IRONING"
  },
  "meta": {
    "request_id": "req_123",
    "source": "pos",
    "cached": false
  }
}
```

Error response:

```json
{
  "ok": false,
  "error": {
    "code": "ORDER_NOT_VERIFIED",
    "message": "Order cannot be shown for this customer.",
    "details": {
      "missing": ["verified_customer"]
    }
  },
  "meta": {
    "request_id": "req_123"
  }
}
```

Rules:

- always include `ok`
- use `data` only on success
- use `error.code` for workflow branching
- include `request_id` for audit and debugging
- keep `message` safe for logs and customer-facing use only when appropriate

## HTTP Status Codes

Use:

- `200`: successful read or idempotent repeated success
- `201`: resource created
- `202`: accepted for async processing
- `400`: invalid request shape
- `401`: unauthenticated
- `403`: authenticated but not authorized
- `404`: resource not found or not visible to caller
- `409`: duplicate/conflicting state
- `422`: valid JSON but business validation failed
- `429`: rate limited
- `500`: unexpected server error
- `502`: POS/upstream failed
- `503`: dependency unavailable
- `504`: POS/upstream timeout

Do not return `200` for failed business actions.

## Authentication

For n8n-to-backend calls:

- require `Authorization: Bearer <N8N_API_KEY>` or a signed request
- rotate keys when exposed
- never put API keys in query strings
- verify request timestamp if using signatures
- log only masked caller identity

For customer-facing routes:

- verify WhatsApp sender/customer identity before returning private data
- do not trust phone/order IDs from request body alone

## Validation

Validate all inputs with schemas.

Common fields:

- `phone`: normalize UAE phone numbers before lookup
- `order_id`: expected numeric/string order format only
- `branch_id`: must be allowed for caller
- `status`: enum only
- `task_type`: `pickup` or `delivery`
- `complaint_type`: enum only
- `language`: supported locale only
- `idempotency_key`: required for writes

Reject unknown or unexpected fields for sensitive writes.

## Idempotency

Require `Idempotency-Key` header for:

- create pickup
- create delivery
- assign driver
- send notification
- create complaint
- update POS
- create payment/accounting action

Store:

- key
- route
- caller
- request hash
- response
- status
- expiry

If the same key and same request hash repeats, return the same result.
If the same key is reused with different payload, return `409 IDEMPOTENCY_KEY_REUSED`.

## Pagination And Filtering

For list endpoints:

```text
GET /api/v1/complaints?branch_id=1&status=open&limit=50&cursor=abc
```

Rules:

- use bounded `limit`
- prefer cursor pagination for changing datasets
- whitelist filters and sort fields
- do not expose cross-branch records to branch-scoped roles

Response:

```json
{
  "ok": true,
  "data": [],
  "meta": {
    "next_cursor": null,
    "limit": 50,
    "request_id": "req_123"
  }
}
```

## POS Adapter Rules

The adapter owns:

- POS base URL
- login/session/cookies
- CSRF or headers if required
- raw POS endpoint mapping
- request form encoding
- timeout handling
- retries
- response parsing
- normalization into project contracts

The adapter must not expose:

- POS cookies
- raw login responses
- HTML login pages
- stack traces
- internal endpoint secrets

If POS returns login HTML or an unexpected page, return:

```json
{
  "ok": false,
  "error": {
    "code": "POS_SESSION_EXPIRED",
    "message": "POS session needs refresh."
  }
}
```

## n8n Contract Rules

n8n workflows should:

- call one project API endpoint per business action
- pass a `request_id` and `Idempotency-Key`
- branch on `ok` and `error.code`
- avoid parsing raw POS HTML
- avoid storing POS credentials in code nodes
- avoid sending full customer records when only an ID is needed
- implement retry only for safe errors and idempotent calls

Recommended n8n request headers:

```json
{
  "Authorization": "Bearer {{$vars.N8N_API_KEY}}",
  "Content-Type": "application/json",
  "Idempotency-Key": "{{$json.idempotency_key}}",
  "X-Request-Id": "{{$json.request_id}}"
}
```

## Example Endpoints

### Order Status

```text
GET /api/v1/pos/orders/:orderId/status?phone=971509998528
```

Rules:

- verify that the phone is authorized to view this order
- fetch current status from POS
- normalize POS status to project status
- never say `READY` unless POS confirms readiness

Response:

```json
{
  "ok": true,
  "data": {
    "order_id": "256719",
    "status": "IRONING",
    "ready": false,
    "eta": null,
    "branch_id": "mbz"
  },
  "meta": {
    "source": "pos",
    "request_id": "req_123"
  }
}
```

### Create Pickup

```text
POST /api/v1/pickups
```

Request:

```json
{
  "customer_phone": "971509998528",
  "customer_name": "Ahmed",
  "area": "MBZ",
  "address_text": "Villa 12",
  "location": {
    "lat": 24.33,
    "lng": 54.54
  },
  "preferred_time": "today evening",
  "source": "whatsapp"
}
```

Rules:

- normalize phone
- resolve area and branch
- create internal pickup request first
- write to POS only if the business flow requires it and data is complete
- return assigned branch and pickup ID

### Driver Assignment

```text
POST /api/v1/dispatch/assignments
```

Request:

```json
{
  "task_type": "pickup",
  "pickup_request_id": "pk_123",
  "branch_id": "mbz",
  "area": "MBZ",
  "priority": "normal"
}
```

Rules:

- rank eligible drivers server-side
- do not let n8n assign a driver outside service area without override permission
- track assignment attempts and timeouts

### Complaint

```text
POST /api/v1/complaints
```

Rules:

- classify complaint type
- set priority
- link order/customer only after verification
- create complaint event
- escalate P1/P2 automatically
- avoid admission of liability in API-generated customer text

## Error Code Examples

Use stable machine codes:

- `INVALID_REQUEST`
- `UNAUTHENTICATED`
- `FORBIDDEN`
- `RATE_LIMITED`
- `CUSTOMER_NOT_VERIFIED`
- `ORDER_NOT_FOUND`
- `ORDER_NOT_AUTHORIZED`
- `POS_SESSION_EXPIRED`
- `POS_TIMEOUT`
- `POS_UNEXPECTED_RESPONSE`
- `BRANCH_SCOPE_VIOLATION`
- `IDEMPOTENCY_KEY_REQUIRED`
- `IDEMPOTENCY_KEY_REUSED`
- `DRIVER_NOT_AVAILABLE`
- `HUMAN_APPROVAL_REQUIRED`

## Retry Rules

Retry only when safe:

- `POS_TIMEOUT`
- `POS_SESSION_EXPIRED` after session refresh
- `503`
- `504`

Do not blindly retry:

- payment creation
- POS writes without idempotency
- complaint creation without idempotency
- WhatsApp sends without notification idempotency

Use exponential backoff and a max attempt count.

## Logging And Audit

Log:

- route
- request ID
- caller type
- masked phone
- branch scope
- action
- result code
- latency
- upstream POS status

Do not log:

- raw POS cookies
- API keys
- access tokens
- full payment data
- full customer address unless necessary and protected

## OpenAI Tool Schema Guidance

If an OpenAI agent calls these APIs through tools:

- expose high-level business tools, not raw POS endpoints
- keep tool inputs minimal and typed
- return normalized results only
- never let the model choose arbitrary URLs
- never let the model pass raw SQL or raw POS form fields

Good tool:

```json
{
  "name": "get_order_status",
  "parameters": {
    "order_id": "256719",
    "customer_phone": "971509998528"
  }
}
```

Bad tool:

```json
{
  "name": "call_pos",
  "parameters": {
    "url": "/any/path",
    "body": {}
  }
}
```

## Review Checklist

Before accepting API work:

- endpoint name is stable and resource-oriented
- request schema is validated
- response envelope is consistent
- errors have machine-readable codes
- authentication is enforced
- branch/customer authorization is enforced
- idempotency exists for writes
- POS details are hidden behind an adapter
- n8n does not parse raw POS responses
- retries are safe
- audit logs exist for sensitive actions
- secrets are not exposed in payloads, logs, or frontend code
