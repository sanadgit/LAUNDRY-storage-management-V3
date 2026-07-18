---
name: security-and-privacy
description: Apply mandatory security and privacy controls for the In & Out Laundry project, including API key protection, secret encryption, input validation, SQL injection protection, rate limiting, webhook signature verification, role-based access, audit logs, data retention, phone masking, customer identity verification, branch data separation, and preventing customer data disclosure to unauthorized numbers. Use when building, reviewing, or modifying APIs, webhooks, POS integrations, database access, logs, customer order lookup, staff tools, or AI agent workflows that touch customer or operational data.
---

# Security And Privacy

## Purpose

Use this skill as a mandatory safety gate for any In & Out Laundry code or workflow that touches customer data, staff data, POS data, WhatsApp messages, orders, complaints, branches, drivers, or secrets.

## Core Rule

Never expose customer, order, complaint, branch, driver, staff, or payment-related data unless the caller is authenticated, authorized, and verified for that exact data scope.

## Required Controls

Apply these controls by default:

- protect API keys and tokens
- encrypt or store secrets only in approved secret stores or environment variables
- validate all inputs at every boundary
- use parameterized SQL or safe query builders
- enforce rate limits on public endpoints
- verify webhook signatures or verification tokens
- enforce role-based access control
- write audit logs for sensitive reads and writes
- define data retention and deletion behavior
- mask phone numbers in logs and UI where full numbers are not required
- prevent customer data disclosure across phone numbers
- separate branch-scoped data
- verify identity before showing order details

## Non-Negotiables

1. Never commit real secrets to the repository.
2. Never expose `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, WhatsApp tokens, POS credentials, or n8n API keys to frontend code.
3. Never trust WhatsApp sender text, order ID, branch ID, customer ID, or role without server-side validation.
4. Never build SQL by string concatenation from user input.
5. Never show an order just because someone knows the order number; verify phone/customer authorization first.
6. Never let one branch view or update another branch's data unless the role explicitly permits it.
7. Never log raw tokens, full phone numbers, payment details, or full webhook payloads unless a redaction policy is applied.

## Project-Specific Secrets

Treat these as sensitive:

- `AI_AGENT_API_KEY`
- `OPENAI_API_KEY`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_VERIFY_TOKEN`
- `META_WHATSAPP_ACCESS_TOKEN`
- `META_WHATSAPP_VERIFY_TOKEN`
- `N8N_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `POSTGRES_URL`
- `DB_PASSWORD`
- `TELEGRAM_BOT_TOKEN`
- `GOOGLE_MAPS_API_KEY`
- manager/admin phone environment variables when used for private routing

## Safe Design Pattern

Before returning customer or operational data:

1. Authenticate the caller or verify webhook origin.
2. Normalize and verify identity.
3. Check role and branch scope.
4. Check data ownership or authorization.
5. Fetch data using parameterized queries.
6. Redact logs and response fields.
7. Write an audit event for sensitive access.

## Reference Files

Read [references/security-and-privacy.md](references/security-and-privacy.md) for detailed implementation rules, checklists, examples, redaction patterns, RBAC matrix, webhook verification rules, and AI-agent privacy guardrails.
