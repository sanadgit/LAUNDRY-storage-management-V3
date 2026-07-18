# Automated Testing Reference

## Testing Philosophy

The system is operational and customer-facing.
Tests must protect against wrong order disclosure, duplicate WhatsApp handling, unsafe POS writes, driver misassignment, complaint mishandling, and Arabic misunderstanding.

Prefer small deterministic tests around business logic, then integration tests around API/webhook boundaries.
Do not rely on production POS, live WhatsApp, or live OpenAI for normal test runs.

## Recommended Test Pyramid

Use:

- unit tests for pure business logic
- integration tests for API routes, database repositories, webhook handlers, and adapters
- contract tests for n8n-to-backend and backend-to-POS payloads
- prompt/tool tests for AI routing, intent classification, and tool-call arguments
- end-to-end smoke tests only for safe staging flows

## Current Project Baseline

The root project currently exposes scripts such as:

- `npm run lint`
- `npm run build`
- `npm run migrate:ai`

There is no obvious root `test` script yet.
When adding real application tests, prefer adding a dedicated script:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:api": "vitest run tests/api",
    "test:webhooks": "vitest run tests/webhooks",
    "test:prompts": "vitest run tests/prompts"
  }
}
```

Adapt the runner to the project stack.
For TypeScript/Express, Vitest plus Supertest-style HTTP testing is usually a good fit.

## What To Mock

Mock these external systems:

- POS/AiPSoft API
- WhatsApp Cloud API
- OpenAI Responses API
- n8n workflow callbacks
- Google Maps/geocoding
- Telegram notifications
- Supabase/Postgres when testing pure logic

Use a fake database only when the test needs persistence behavior.
Use repository mocks for pure business decisions.

## Mock POS Server

A mock POS server should support:

- login/session success
- login/session expired
- search order by order ID
- search customer by normalized phone
- order belongs to phone
- order belongs to different phone
- no orders
- delayed order
- ready order
- POS timeout
- POS returns HTML login page
- POS returns malformed JSON
- POS write succeeds
- POS write fails after partial response

Example behavior table:

```text
GET /mock-pos/orders/256719 -> status IRONING, phone 971509998528
GET /mock-pos/orders/999999 -> 404 ORDER_NOT_FOUND
GET /mock-pos/orders/111111 -> phone mismatch
POST /mock-pos/pickups -> returns pickup_id when idempotency key is valid
```

## Unit Tests

Use unit tests for:

- UAE phone normalization
- area alias resolution
- branch routing
- intent classification post-processing
- order status transition validation
- driver ranking
- complaint severity mapping
- language detection decisions
- masking phone numbers
- idempotency key validation

Examples:

- `0509998528` normalizes to `971509998528`
- `MBZ`, `Mohammed Bin Zayed`, and `مدينة محمد بن زايد` route to the same area
- P1 complaint is assigned for lost/damaged expensive item
- phone mask returns `97150****528`

## API Integration Tests

Test API routes with real HTTP request handling and mocked dependencies.

Required checks:

- authentication required
- invalid payload rejected
- branch scope enforced
- customer ownership enforced
- consistent response envelope
- stable error codes
- audit event recorded for sensitive access
- idempotency works for write endpoints

Critical cases:

- existing customer with active order returns POS-backed status
- existing customer with no orders returns safe no-order response
- new customer can create pickup request after required fields
- invalid phone returns validation error
- order belongs to different phone returns `ORDER_NOT_AUTHORIZED`

## Webhook Tests

WhatsApp webhook tests must cover:

- GET verification succeeds with correct token
- GET verification fails with wrong token
- POST rejects invalid signature or invalid token when configured
- text message is parsed
- image/document message is routed to media flow
- voice message is routed to transcription or human flow
- location message extracts latitude/longitude
- interactive button/list reply is parsed
- delivered/read/failed statuses are handled separately from inbound messages
- duplicate `wamid` is ignored
- outbound mark-as-read is attempted only after valid inbound processing

Duplicate message test:

1. Send same inbound payload with same `wamid` twice.
2. First call creates message/conversation side effects.
3. Second call returns accepted/ignored result.
4. No duplicate OpenAI call, pickup, complaint, or notification is created.

## n8n Workflow Tests

For n8n JSON workflows:

- validate workflow JSON parses
- validate required nodes exist
- validate credentials are referenced, not hardcoded
- validate HTTP Request nodes call project API, not raw POS, unless explicitly approved
- validate error branches exist
- validate retry behavior is bounded
- validate webhook URLs and methods are correct
- validate no API keys are embedded in nodes

For generated workflows, snapshot the important node graph:

- trigger
- validation
- identity resolution
- POS/API request
- OpenAI routing
- branch/driver action
- response/notification
- error handling

## Prompt Tests

Prompt tests should check model-facing behavior with deterministic stubs or recorded expected decisions.

Test:

- intent classification
- language detection
- Arabic dialect handling
- ambiguous message handling
- refusal to reveal unauthorized order data
- escalation for complaints
- no promise of readiness without POS confirmation
- no admission of liability for damage/lost item

Arabic and mixed examples:

```text
order 256719 جاهز؟
عايز pickup اليوم
my abaya لسه ما وصلت
وين السواق؟
ضاعت كندورتي
```

Expected outputs should validate structured decisions, not exact natural language wording unless necessary.

## Tool-Calling Tests

Tool-calling tests must verify:

- correct tool selected for intent
- tool arguments match schema
- missing fields produce clarification instead of bad tool call
- tool result is verified before response
- tool errors produce safe fallback
- sensitive data is not sent to tools unnecessarily
- OpenAI outage routes to fallback or human escalation

Example:

Customer says:

```text
order 256719 جاهز؟
```

Expected:

- intent: `order_status`
- tool: `get_order_status`
- args include `order_id`
- args include verified normalized phone when available
- response does not claim ready unless tool result says ready

## Driver Assignment Tests

Test:

- primary driver unavailable
- driver outside service area is not selected
- driver has too many tasks
- driver rejects assignment
- driver acceptance timeout triggers reassignment
- customer unavailable status does not mark delivered
- branch scope prevents wrong-branch dispatch

Expected driver flow:

```text
Customer location
-> determine service area
-> determine branch
-> find available drivers
-> rank drivers
-> assign driver
-> request acceptance
-> reassign if rejected or timed out
```

## Permission Tests

Test that:

- unknown sender sees no private data
- customer sees only own orders
- driver sees only assigned tasks
- branch staff sees only branch records
- operations manager can see cross-branch data with audit logging
- order number alone is not enough to reveal order details
- phone mismatch blocks order status

Include negative tests first for sensitive endpoints.

## Failure And Retry Tests

Test:

- POS unavailable
- POS timeout
- POS session expired
- POS returns login HTML
- POS malformed response
- OpenAI API unavailable
- WhatsApp send fails
- branch does not respond
- driver assignment times out
- retry after transient error does not duplicate writes

Use idempotency assertions:

- same request and key returns same response
- same key with different payload returns conflict
- retry after timeout does not create duplicate pickup/delivery/notification

## Critical Scenario Matrix

### Existing Customer With Active Order

Assert:

- phone normalized
- customer verified
- POS queried
- only that customer's order returned
- status is POS-backed

### Existing Customer With No Orders

Assert:

- no fake order created
- safe response asks whether they need pickup or support
- no POS write occurs

### New Customer

Assert:

- contact can be created with normalized phone
- missing address/location is requested
- no order data is shown

### Invalid Phone

Assert:

- request rejected or clarification requested
- no POS lookup with invalid phone

### Order Belongs To Different Phone

Assert:

- return `ORDER_NOT_AUTHORIZED` or safe equivalent
- no status, address, branch, or item details exposed
- audit failed verification

### Primary Driver Unavailable

Assert:

- next ranked driver selected
- unavailable driver not assigned
- assignment event recorded

### Branch Does Not Respond

Assert:

- timeout handled
- escalation created
- customer receives safe waiting/escalation message

### Duplicate WhatsApp Message

Assert:

- same `wamid` processed once
- no duplicate OpenAI/tool/POS action

### OpenAI API Down

Assert:

- no crash
- fallback response or human escalation
- message recorded as pending/failed safely

### POS Unavailable

Assert:

- no invented status
- safe apology/follow-up
- retry or escalation scheduled

### Lost Item Complaint

Assert:

- complaint type `LOST_ITEM`
- severity P1/P2 depending value/context
- no liability admission
- photo/details requested when useful
- manager escalation created

### Voice Message

Assert:

- media type detected
- media download/transcription path called or human escalation created
- raw audio URL is not leaked
- customer gets a clear acknowledgement

## Completion Checklist

Before saying work is done:

- relevant tests were added or updated
- external systems are mocked
- success and failure paths are covered
- permission and phone mismatch cases are covered
- duplicate webhook/idempotency case is covered when relevant
- Arabic or mixed-language cases are covered for agent behavior
- tests were run, or inability to run them is stated clearly
- `npm run lint` or equivalent type check was run when TypeScript changed
