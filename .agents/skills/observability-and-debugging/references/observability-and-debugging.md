# Observability And Debugging Reference

## Trace Model

Use one `correlation_id` for the whole customer/business flow.
Attach component-specific IDs as the flow moves across systems.

Example chain:

```text
WhatsApp inbound wamid
-> webhook request_id
-> conversation_id
-> n8n workflow_execution_id
-> OpenAI response_id/tool_call_id
-> backend API request_id
-> POS request_id/session_id
-> database transaction/audit event
-> notification_id
```

If a new step starts without an existing `correlation_id`, generate one and propagate it forward.
Do not overwrite an existing correlation ID.

## Standard Structured Log Shape

Use JSON logs, not only plain strings.

```json
{
  "timestamp": "2026-07-17T10:30:00.000Z",
  "level": "info",
  "component": "whatsapp_webhook",
  "event": "message_received",
  "correlation_id": "corr_01J...",
  "request_id": "req_123",
  "whatsapp_message_id": "wamid.HBg...",
  "conversation_id": "conv_123",
  "customer_id": "cus_123",
  "customer_phone_masked": "97150****528",
  "order_id": "256719",
  "branch_id": "mbz",
  "status": "received",
  "duration_ms": 42
}
```

Required fields:

- `timestamp`
- `level`
- `component`
- `event`
- `correlation_id`

Add optional fields only when relevant.

## Component Names

Use stable `component` names:

- `whatsapp_webhook`
- `whatsapp_sender`
- `n8n_workflow`
- `openai_agent`
- `openai_tool_call`
- `pos_adapter`
- `database`
- `identity_resolution`
- `order_status`
- `driver_dispatch`
- `complaint_management`
- `branch_operations`
- `notification_service`
- `retry_worker`
- `dead_letter_worker`
- `health_check`

## Event Naming

Use consistent event names:

- `message_received`
- `message_deduplicated`
- `message_parsed`
- `conversation_loaded`
- `intent_classified`
- `tool_call_started`
- `tool_call_succeeded`
- `tool_call_failed`
- `pos_request_started`
- `pos_request_succeeded`
- `pos_request_failed`
- `db_query_failed`
- `driver_assignment_created`
- `driver_assignment_timeout`
- `complaint_escalated`
- `notification_send_started`
- `notification_send_failed`
- `retry_scheduled`
- `dead_letter_created`
- `health_check_failed`

## Correlation Propagation

### HTTP APIs

Accept and emit these headers:

```text
X-Correlation-Id
X-Request-Id
Idempotency-Key
```

If absent:

- generate `correlation_id`
- generate `request_id`
- require `Idempotency-Key` for writes

Return IDs in response metadata:

```json
{
  "ok": true,
  "data": {},
  "meta": {
    "correlation_id": "corr_01J...",
    "request_id": "req_123"
  }
}
```

### n8n

Every workflow should store/pass:

- `correlation_id`
- `workflow_execution_id`
- `workflow_name`
- `source_message_id`
- `conversation_id`
- `customer_id`
- `order_id` if known

If n8n exposes execution ID in context, map it to `workflow_execution_id`.
When building alert messages, include workflow name and execution ID.

### WhatsApp

Track:

- inbound `wamid`
- outbound message ID returned by WhatsApp
- status callbacks: `sent`, `delivered`, `read`, `failed`
- customer phone masked in logs
- conversation ID

Use `wamid` for deduplication and trace lookup.

### OpenAI

Track:

- model
- response ID if available
- tool call ID
- tool name
- tool arguments summary after redaction
- token usage when available
- latency
- outcome
- error code

Do not log full prompts if they contain customer private data.
Prefer prompt version, memory summary, and redacted tool args.

### POS

Track:

- POS endpoint/action
- normalized operation name
- order ID
- branch ID
- POS request ID if available
- session refresh event
- timeout/error status
- response category, not raw response when sensitive

If POS returns login HTML, log `POS_SESSION_EXPIRED` or `POS_UNEXPECTED_HTML`, not the raw HTML.

## Error Codes

Use stable machine-readable codes:

- `WHATSAPP_SIGNATURE_INVALID`
- `WHATSAPP_DUPLICATE_WAMID`
- `WHATSAPP_MEDIA_DOWNLOAD_FAILED`
- `N8N_WORKFLOW_FAILED`
- `OPENAI_TIMEOUT`
- `OPENAI_RATE_LIMITED`
- `OPENAI_TOOL_SCHEMA_ERROR`
- `POS_TIMEOUT`
- `POS_SESSION_EXPIRED`
- `POS_UNEXPECTED_RESPONSE`
- `DATABASE_TIMEOUT`
- `DATABASE_CONSTRAINT_ERROR`
- `ORDER_NOT_AUTHORIZED`
- `BRANCH_NO_RESPONSE`
- `DRIVER_UNAVAILABLE`
- `NOTIFICATION_SEND_FAILED`
- `RETRY_EXHAUSTED`

## Retry Queue

Use a retry queue for recoverable failures:

- WhatsApp send temporary failure
- POS timeout
- POS session expired after refresh
- OpenAI transient timeout
- branch notification temporary failure
- database transient connection issue

Retry job fields:

```json
{
  "job_id": "retry_123",
  "correlation_id": "corr_01J...",
  "component": "pos_adapter",
  "operation": "get_order_status",
  "payload_ref": "safe_ref_or_redacted_payload",
  "idempotency_key": "idem_123",
  "attempt": 2,
  "max_attempts": 5,
  "next_run_at": "2026-07-17T10:35:00.000Z",
  "last_error_code": "POS_TIMEOUT"
}
```

Rules:

- use exponential backoff
- cap max attempts
- require idempotency for writes
- log every retry attempt
- do not retry permanent authorization failures

## Dead-Letter Queue

Move jobs to dead-letter queue when:

- max retries exhausted
- payload is invalid and cannot be repaired
- authorization fails permanently
- POS response is repeatedly malformed
- message cannot be safely processed

Dead-letter fields:

- `dead_letter_id`
- `correlation_id`
- `source_component`
- `operation`
- `error_code`
- `error_message_redacted`
- `attempts`
- `payload_ref`
- `customer_phone_masked`
- `order_id`
- `branch_id`
- `created_at`
- `needs_human_review`

Dead-letter queue should be visible to operations/admin users with redaction.

## Health Checks

Create health checks for:

- API server
- database connection
- WhatsApp webhook verification endpoint
- WhatsApp send API
- n8n availability
- OpenAI availability or configured fallback
- POS login/session and a safe read-only POS endpoint
- retry worker
- dead-letter queue count
- notification provider

Health response example:

```json
{
  "ok": true,
  "status": "degraded",
  "checks": {
    "database": { "ok": true, "latency_ms": 12 },
    "pos": { "ok": false, "error_code": "POS_TIMEOUT" },
    "openai": { "ok": true, "latency_ms": 380 },
    "whatsapp": { "ok": true }
  },
  "meta": {
    "correlation_id": "corr_health_123"
  }
}
```

Do not expose health details publicly unless protected.
Public health can return simple status only.

## Debugging Playbooks

### Customer Says No Reply From WhatsApp

Check:

1. inbound `wamid` received?
2. webhook signature verified?
3. duplicate handling skipped it?
4. conversation created or loaded?
5. OpenAI/tool call succeeded?
6. outbound WhatsApp call attempted?
7. WhatsApp returned message ID?
8. status callback says delivered/read/failed?
9. notification retry or dead-letter exists?

### Wrong Order Status

Check:

1. customer phone normalized correctly?
2. identity verified?
3. order belongs to customer?
4. POS lookup response timestamp?
5. cached result used?
6. order-status mapping correct?
7. response generated after POS result, not before?

### n8n Workflow Failed

Check:

1. `workflow_execution_id`
2. input payload and `correlation_id`
3. failing node
4. API response error code
5. retry branch triggered?
6. dead-letter created?
7. alert sent to operations?

### POS Is Down

Check:

1. health check status
2. POS login/session events
3. timeout rate
4. retry queue depth
5. dead-letter queue growth
6. whether customer replies used safe fallback

### Driver Did Not Arrive

Check:

1. dispatch assignment created?
2. driver accepted?
3. assignment timeout?
4. driver status updates?
5. branch notified?
6. customer notification sent?
7. reassignment attempted?

### Branch Did Not Respond

Check:

1. branch notification ID
2. channel sent/delivered status
3. escalation timeout
4. operations manager escalation
5. dead-letter or retry entry

## Dashboards

Useful dashboards:

- WhatsApp inbound/outbound volume
- duplicate `wamid` count
- OpenAI failures and latency
- POS timeout/session-expired rate
- n8n workflow failures by workflow
- retry queue size by component
- dead-letter queue size by component
- unresolved complaints by priority
- driver assignment timeout rate
- branch response time
- order status lookup failures

## Redaction Rules

Do not log:

- API keys
- access tokens
- POS cookies
- payment details
- full phone numbers unless protected
- raw media URLs with secrets
- full prompts containing private data

Mask phones:

```text
97150****528
```

Log summaries instead of full payloads when possible.

## Implementation Checklist

Before accepting new workflow/API code:

- `correlation_id` is generated or propagated
- `request_id` exists for each API request
- WhatsApp `wamid` is stored and searchable
- `conversation_id` is logged after conversation load/create
- n8n `workflow_execution_id` is captured where possible
- OpenAI tool calls are logged with redacted args/results
- POS calls log operation, duration, and error category
- retryable failures go to retry queue
- exhausted failures go to dead-letter queue
- health check covers every dependency touched by the feature
- logs redact secrets and phone numbers
- error codes identify the failing component
