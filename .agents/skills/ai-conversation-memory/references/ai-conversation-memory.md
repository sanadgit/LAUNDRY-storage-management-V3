# AI Conversation Memory Reference

## Goal

The memory layer should help the customer-service agent continue naturally while staying safe, compact, and accurate.
Use memory to remember the current service situation, not to replace POS, identity verification, complaint records, or branch confirmation.

## Recommended Stored Shape

```json
{
  "conversation_id": "conv_123",
  "customer": {
    "name": "Ahmed",
    "phone": "+971509998528",
    "normalized_phone": "971509998528",
    "verified": true,
    "language": "ar"
  },
  "active_order": {
    "order_id": "256719",
    "discussed_order_id": "256719",
    "branch_id": "branch_mbz",
    "area": "Mohammed Bin Zayed"
  },
  "state": {
    "last_intent": "order_status",
    "current_task": "waiting_for_pos_status",
    "missing_fields": []
  },
  "flags": {
    "escalated_to_human": false,
    "open_complaint": false,
    "open_complaint_id": null
  },
  "summary": "Customer asked about order 256719 status. Identity is verified. Waiting for POS-backed status before replying."
}
```

Keep unknown values as `null`, empty arrays, or explicit `unknown`.
Never invent branch, order, or complaint values to fill the schema.

## Memory Layers

### Short-Term Conversation State

Use for the current unresolved task.
Typical fields:

- `last_intent`
- `current_task`
- `missing_fields`
- `last_customer_message_type`
- `last_tool_called`
- `pending_action`
- `last_error`

Expire or reset this state when the conversation is resolved, closed, abandoned, or handed off according to workflow policy.

### Structured Customer Context

Use only for stable and verified facts:

- customer name
- normalized phone
- preferred language
- verified customer ID or POS customer reference
- usual area if confirmed
- responsible branch if confirmed

Do not use stored context to bypass identity checks.
If the customer asks about an order, verify that the WhatsApp number/customer identity is authorized before revealing details.

### Conversation Summary

Use a compact running summary instead of sending the full transcript.
The summary should include:

- what the customer wants
- verified identity status
- current order or complaint
- important promises made by staff or tools
- unresolved next step
- escalation status

Good summary:

```text
Customer asked for pickup today in MBZ. Phone normalized to 971509998528. Area is within MBZ branch coverage. Waiting for customer to share exact location.
```

Bad summary:

```text
Customer said many messages. They want something. Continue chatting.
```

## What To Send To OpenAI

Build every model call with the smallest useful context:

1. System/developer instructions for the agent.
2. Current customer message.
3. Structured memory object.
4. Short conversation summary.
5. Only the most recent messages needed to resolve pronouns or ambiguity.
6. Relevant verified tool or POS result.

Avoid this pattern:

```text
Send all ai_messages rows for this customer to OpenAI on every turn.
```

Prefer this pattern:

```text
Send current message + verified customer context + active task state + concise summary + latest POS result.
```

## Update Rules

After every turn:

1. Normalize and store the customer phone if present.
2. Update language only when the customer clearly changes language.
3. Update `last_intent` from the intent classifier output.
4. Store an order ID only after it is provided by the customer or found through authorized lookup.
5. Store branch and status only from POS or trusted operational data.
6. Update `open_complaint` when a complaint is created, linked, resolved, or closed.
7. Set `escalated_to_human` when a human handoff happens.
8. Rewrite the summary to include only durable, useful information.

If a tool call fails, store the failure as state, not as a customer-facing fact.

## Privacy And Safety Boundaries

Never store or send to the model:

- API keys
- access tokens
- webhook verification secrets
- payment card numbers
- CVV values
- bank credentials
- unrelated personal data
- internal staff-only notes unless required for handoff

Redact sensitive text before saving logs or summaries:

```text
Customer shared card ending 4242 and CVV [REDACTED].
```

If the customer sends payment-sensitive information, acknowledge safely and route to approved payment handling without repeating the sensitive value.

## Transcript Retention

It is acceptable to store `ai_messages` for audit and support review when the product requires it.
Do not confuse audit storage with model context.

Use:

- audit log: complete messages according to retention policy
- model context: compact structured context and summary

If retention is not defined, design the system so raw message history can be expired or archived without breaking the agent.

## Escalation Memory

When `escalated_to_human` is true:

- include the handoff reason in the summary
- avoid sending automated final decisions
- allow basic acknowledgements only if policy permits
- keep collecting helpful missing details if that does not interfere with staff

Example:

```json
{
  "flags": {
    "escalated_to_human": true,
    "open_complaint": true,
    "open_complaint_id": "cmp_8841"
  },
  "summary": "Complaint about missing kandora escalated to operations manager. Customer shared order 256719 and photo. Awaiting manager response."
}
```

## Open Complaint Memory

If a complaint is open, memory must change the agent behavior:

- prioritize complaint continuity over generic support
- do not ask the customer to repeat information already captured
- do not admit liability unless an approved human or policy confirms it
- request photos only when useful for the complaint type
- preserve promised follow-up times in the summary

## Ambiguous Message Handling

Use memory to resolve simple ambiguity:

- "هو جاهز؟" can refer to the active order if exactly one active order is in context and identity is verified.
- "وين السواق؟" can refer to the active pickup or delivery task if one active task exists.

Ask a clarification question when:

- more than one active order exists
- identity is not verified
- the message could refer to a complaint or a new request
- the memory conflicts with POS or tool output

## Implementation Notes For Existing Tables

The project already uses conversation-oriented tables such as `ai_contacts`, `ai_conversations`, and `ai_messages`.
Recommended mapping:

- `ai_contacts`: stable customer/staff identity, role, normalized phone, language preference.
- `ai_conversations`: active state, intent, priority, branch, assignment, status, summary, escalation flags.
- `ai_messages`: raw inbound/outbound message audit, WhatsApp message IDs, media metadata, model response metadata.

Do not overload `ai_messages` as the main memory prompt source.
Use `ai_conversations` and structured summary fields for current model context.

## Minimal Prompt Context Example

```json
{
  "memory": {
    "customer": {
      "phone": "971509998528",
      "verified": true,
      "language": "ar"
    },
    "active_order": {
      "order_id": "256719",
      "area": "MBZ"
    },
    "state": {
      "last_intent": "order_status",
      "current_task": "answer_status_from_pos"
    },
    "flags": {
      "escalated_to_human": false,
      "open_complaint": false
    },
    "summary": "Customer is asking whether order 256719 is ready. Must check POS before confirming readiness."
  },
  "current_message": "order 256719 جاهز؟",
  "tool_result": {
    "source": "POS",
    "status": "IRONING",
    "ready": false
  }
}
```

The response should say the order is still in ironing, not ready, because POS is the source of truth.
