---
name: api-design
description: Design clean, stable APIs between n8n workflows, the In & Out Laundry backend, and the POS/AiPSoft system. Covers endpoint naming, request and response contracts, validation, authentication, idempotency, pagination, error shape, versioning, rate limits, POS adapter boundaries, webhook-safe APIs, auditability, retries, timeouts, and avoiding direct POS coupling from n8n. Use when creating or reviewing API routes, n8n HTTP requests, POS integration endpoints, webhook handlers, customer/order/pickup/delivery/complaint APIs, or OpenAI tool schemas that call backend services.
---

# API Design

## Purpose

Use this skill to build a clean API layer between n8n and the POS instead of letting each workflow call POS endpoints directly with inconsistent payloads.
The API should hide POS complexity, normalize data, and give n8n stable contracts.

## Core Rule

n8n should call project-owned API endpoints with validated, documented contracts.
The backend/API adapter should handle POS login/session, raw POS payloads, retries, normalization, permissions, and audit logs.

## Required API Qualities

- stable endpoint names
- versioned routes when contracts may change
- consistent JSON request and response shapes
- explicit validation errors
- authentication for n8n and internal callers
- idempotency keys for create/update actions
- safe retries and timeouts
- rate limiting on public or webhook-facing routes
- audit logs for sensitive reads and writes
- normalized POS data before returning to agents or n8n
- minimal customer data exposure

## Endpoint Design Rules

1. Use nouns for resources and verbs only for explicit actions.
2. Keep routes predictable: `/api/v1/orders/:orderId/status`.
3. Separate read operations from write operations.
4. Put POS-specific details inside adapters, not in n8n workflows.
5. Return one canonical response format across endpoints.
6. Return machine-readable error codes, not only human text.
7. Do not leak raw POS HTML, cookies, stack traces, or internal credentials.
8. Design write APIs to be idempotent when called repeatedly by n8n.

## POS Boundary

Treat POS as an external system of record.
Do not let OpenAI or n8n invent, bypass, or directly mutate POS state without controlled backend validation.

For POS writes:

- require explicit action type
- validate all fields
- require idempotency key
- record request and result
- require human approval for risky accounting or irreversible actions

## Reference Files

Read [references/api-design.md](references/api-design.md) for endpoint patterns, response envelopes, error codes, idempotency rules, n8n integration contracts, POS adapter rules, and example APIs for orders, pickups, deliveries, complaints, and notifications.
