---
name: openai-customer-agent
description: Build OpenAI-powered customer service agents for the In & Out Laundry project using Responses API, structured outputs, function calling, tool calling, conversation state, language detection, Arabic dialect handling, guardrails, summary memory, escalation, and ambiguous-message handling. Use when creating or editing customer-facing AI that must understand intent instead of relying on keywords or fixed replies.
---

# OpenAI Customer Agent

## Purpose

Use this skill when building a customer-service agent that must interpret the customer's intent, stay on-brand, and route actions through tools or workflows.
Prefer understanding over keyword matching.

## Core Behavior

1. Detect language first.
2. Classify intent before responding.
3. Keep conversation state explicit.
4. Use structured outputs for machine-readable decisions.
5. Use function calling or tool calling for any action that should not be invented by the model.
6. Escalate uncertain, risky, angry, or policy-sensitive cases to a human.

## What This Skill Covers

- Responses API
- Structured Outputs
- Function calling
- Tool calling
- Conversation state
- Intent classification
- Language detection
- Arabic dialect handling
- Guardrails
- Prompt design
- Token management
- Summary memory
- Human escalation
- Ambiguous message handling

## Operating Rules

1. Treat the model as a decision and language layer, not as the source of truth.
2. Never let the model invent prices, orders, branch coverage, policies, or POS data.
3. Keep the customer tone short, warm, and clear.
4. When the message is unclear, ask a focused clarification question instead of guessing.
5. When the message contains multiple intents, resolve the primary intent first and preserve the secondary intent in memory or escalation notes.
6. When the user asks for a human, provide a human handoff path without resistance.

## Conversation State

Track only the state needed to continue the conversation safely:

- detected language
- detected intent
- customer identity if verified
- order reference if verified
- branch if relevant
- open question or missing slot
- escalation flag
- summary memory

Keep memory compact.
Store summaries, not full transcripts, unless the workflow explicitly needs the transcript.

## Arabic Handling

Use the customer's dialect and writing style when possible.
If the message is Gulf Arabic, reply in a natural Gulf-friendly Arabic.
If the message is mixed Arabic/English, keep the reply mixed only when it improves clarity.
Do not force formal Arabic when the customer is clearly speaking casually.

## Guardrails

- Refuse or escalate if the request is outside the laundry domain.
- Refuse to guess sensitive account or order data.
- Refuse to confirm actions that were not actually executed by a tool.
- Refuse to claim a branch, driver, or order status unless the source data confirms it.
- Ask for missing data only once when possible, then escalate if still blocked.

## Prompt Design

Build prompts with this order:

1. Role and domain
2. What the assistant must do
3. What the assistant must not do
4. Available tools and their purpose
5. Required response format
6. Escalation rules

Keep the prompt compact and stable.
Separate long business context into references when needed.

## Token Management

To keep responses efficient:

- summarize older conversation state
- trim irrelevant history
- keep tool outputs compact
- avoid repeating static instructions in every turn
- return concise answers unless the user asks for detail

## Tool Usage Pattern

When the agent needs data or action:

1. Classify intent.
2. Decide whether a tool is needed.
3. Call the tool.
4. Verify tool output.
5. Respond with the tool-backed result.

Never skip the verification step for tool output that affects customer-facing truth.

## Escalation Triggers

Escalate when the message includes:

- damage or lost item
- payment dispute
- repeated failure
- angry or abusive language
- unclear identity with a sensitive request
- branch conflict
- ambiguous complaint
- anything that requires a manager decision

## Reference Files

Read [references/openai-customer-agent.md](references/openai-customer-agent.md) for the project-specific prompt structure, state model, routing rules, and safe response patterns.
