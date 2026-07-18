# OpenAI Customer Agent Reference

## Project Use

This skill supports customer-facing AI for In & Out Laundry.
The agent should understand intent, call tools when needed, and escalate when the message is unclear or sensitive.

## Recommended Agent Flow

1. Receive message.
2. Detect language and dialect.
3. Classify intent.
4. Check whether a tool or workflow is required.
5. Load only the minimum required conversation state.
6. Produce a short customer reply.
7. Escalate if the message is ambiguous, risky, or blocked.

## Intent Types

Typical intents for this project:

- booking pickup
- order tracking
- pricing question
- branch question
- complaint
- delivery update
- human handoff
- general support

## Structured Output Use

Use structured outputs when the next step depends on machine-readable fields such as:

- intent
- confidence
- language
- branch
- order reference
- escalation need
- missing slots
- next action

Keep schemas small and explicit.

## Tool Calling Use

Use tool calling when the model must:

- search orders
- fetch POS data
- create a ticket
- update a status
- send a WhatsApp reply
- log a conversation summary

Do not use the model alone for these actions.

## Conversation State Model

Keep state compact and reviewable:

```json
{
  "language": "ar",
  "intent": "complaint",
  "confidence": 0.92,
  "customer_name": "optional",
  "order_id": "optional",
  "branch": "optional",
  "summary": "short memory of the latest state",
  "needs_human": false,
  "missing_fields": ["order_id"]
}
```

## Arabic Dialect Guidance

- Use direct, polite Gulf Arabic when the customer writes in Arabic.
- Keep English replies natural and short.
- If the customer mixes both, mirror the mix only when it helps clarity.
- If a message is too short or vague, ask one simple clarifying question.

## Ambiguous Messages

If the message could mean more than one thing:

- pick the most likely customer intent
- mention the assumption briefly if needed
- ask for the missing detail
- escalate if the message affects payment, complaints, or identity

## Summary Memory

Store summaries like:

- customer asked about delayed delivery for order 1234
- customer prefers Arabic
- complaint escalated to branch manager

Do not store unnecessary transcript detail unless the workflow explicitly needs it.

## Response Style

- Short
- Helpful
- On-brand
- No keyword-heavy bot tone
- No unsupported claims
- No unnecessary technical details to the customer
