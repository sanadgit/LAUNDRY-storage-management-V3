---
name: observability-and-debugging
description: Design and enforce observability, structured logging, tracing, correlation IDs, debugging workflows, retry queues, dead-letter queues, health checks, and error monitoring for the In & Out Laundry AI, WhatsApp, n8n, OpenAI, POS, database, driver, branch, notification, and API systems. Covers WhatsApp message IDs, conversation IDs, workflow execution IDs, customer IDs, order IDs, tool-call logs, structured logs, root-cause isolation, and safe redaction. Use when building, reviewing, debugging, or operating customer-agent workflows, webhooks, n8n automations, POS integrations, dispatch, complaints, notifications, or API routes.
---

# Observability And Debugging

## Purpose

Use this skill to make every customer interaction traceable from WhatsApp through n8n, OpenAI, POS, database, driver dispatch, branch handling, and customer notification.
The goal is to answer: where did the failure happen, what was the input, what was attempted, what should be retried, and what must be escalated?

## Core Rule

Every workflow and API request must carry a `correlation_id`.
Every important external message, workflow execution, tool call, POS call, order, customer, and conversation should attach its own ID to that same trace.

## Required Trace Fields

Include relevant fields in structured logs and audit events:

- `correlation_id`
- `request_id`
- `whatsapp_message_id` or `wamid`
- `conversation_id`
- `workflow_execution_id`
- `customer_id`
- `customer_phone_masked`
- `order_id`
- `branch_id`
- `driver_id`
- `tool_call_id`
- `tool_name`
- `pos_request_id`
- `notification_id`
- `retry_count`
- `error_code`
- `component`

## Required Capabilities

Design or review systems for:

- structured logs
- correlation ID propagation
- WhatsApp message ID tracking
- conversation ID tracking
- n8n workflow execution ID tracking
- customer and order traceability
- OpenAI tool-call logs
- error monitoring
- retry queue
- dead-letter queue
- health checks
- redacted debugging views

## Root-Cause Isolation

When something fails, logs should make it clear whether the failure came from:

- WhatsApp
- n8n
- OpenAI
- POS
- database
- driver
- branch
- notification provider
- internal API

## Non-Negotiables

1. Do not log raw API keys, tokens, POS cookies, payment data, or full customer phone numbers.
2. Do not rely on free-text logs only; use structured JSON fields.
3. Do not create retries without idempotency keys.
4. Do not drop failed jobs silently; move exhausted jobs to a dead-letter queue.
5. Do not claim a production issue is understood without checking the full correlation chain.

## Reference Files

Read [references/observability-and-debugging.md](references/observability-and-debugging.md) for log schemas, trace propagation rules, retry/dead-letter patterns, health checks, dashboards, debugging playbooks, and component-specific failure signals.
