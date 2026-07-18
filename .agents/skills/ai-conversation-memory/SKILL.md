---
name: ai-conversation-memory
description: Manage AI conversation memory for In & Out Laundry customer-service agents, including short-term conversation state, structured customer context, conversation summaries, retention boundaries, sensitive-data exclusions, escalation flags, open complaint tracking, and prompt context minimization. Use when designing or editing conversation logging, memory, OpenAI prompt context, agent state, or customer support continuity.
---

# AI Conversation Memory

## Purpose

Use this skill to keep the In & Out Laundry AI agent context-aware without sending the full old conversation to OpenAI on every turn.
Prefer compact, structured memory over raw transcript replay.

## Memory Model

Use three layers together:

1. Short-term conversation state for the current active task.
2. Structured customer context for verified customer facts.
3. Conversation summary for important history that still affects the next response.

Do not treat memory as truth unless the field is verified or backed by POS/customer records.

## Store

Track only useful support continuity fields:

- customer name
- customer phone and normalized UAE phone
- order being discussed
- current active order
- customer area
- responsible branch if known
- last intent
- detected language
- current missing fields or open question
- concise conversation summary
- human escalation status
- open complaint status or complaint ID

## Do Not Store

- full conversation forever
- API keys or tokens
- payment card data or sensitive payment details
- unnecessary personal information
- raw media content unless required by a complaint or operational workflow
- guesses presented as facts

## Operating Rules

1. Build model context from memory, current message, and relevant tool results.
2. Avoid passing all previous messages to OpenAI; pass a concise summary instead.
3. Preserve only the latest few messages when needed to resolve immediate ambiguity.
4. Update memory after each meaningful turn, not before tool results are verified.
5. If identity is unverified, never reveal order details from memory alone.
6. If a human escalation is active, avoid autonomous resolution unless the human handoff policy allows it.
7. If an open complaint exists, include it in context and avoid treating the conversation as a normal inquiry.
8. Redact secrets and sensitive payment details before logging or sending context to the model.

## Reference Files

Read [references/ai-conversation-memory.md](references/ai-conversation-memory.md) for the recommended schema, prompt-context assembly pattern, update rules, privacy boundaries, and examples.
