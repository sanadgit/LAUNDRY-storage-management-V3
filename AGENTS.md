# In & Out Laundry AI Platform

## Project Rules

- Read the relevant skill before modifying a workflow, integration, API, prompt, database schema, deployment file, or customer-facing behavior.
- Never expose credentials, API keys, tokens, database passwords, POS cookies, n8n credentials, OpenAI keys, WhatsApp tokens, or customer data.
- Never invent service prices, order statuses, branch coverage, driver status, payment status, or customer records.
- POS is the source of truth for customers, orders, prices, payments, invoices, packing, delivery, and official order readiness.
- One WhatsApp Cloud API send request must contain one recipient only.
- Every inbound WhatsApp message must be processed idempotently using the WhatsApp message ID when available.
- Store and reuse `wamid`, `conversation_id`, `correlation_id`, and workflow execution identifiers for traceability.
- All customer-facing replies must use the customer's detected language unless the customer changes language.
- Do not reveal order, address, complaint, driver, or payment details until customer identity and authorization are verified.
- High-risk complaints such as lost item, damage, repeated quality issue, payment dispute, or angry customer must be escalated to a human.
- Do not modify production data during testing.
- Add tests for every business-critical workflow.
- Create database migrations instead of applying undocumented schema changes.
- Use structured logs and safe redaction for customer phones, secrets, and payment-related data.
- Update project documentation after implementing a feature.

## Required Workflow

1. Inspect the repository.
2. Read the relevant `SKILL.md` files.
3. Produce an implementation plan for non-trivial changes.
4. Implement the smallest complete feature.
5. Run validation and tests.
6. Report files changed, tests run, and remaining risks.

## MCP And Connectors

- Follow [CODEX_CONNECTORS.md](CODEX_CONNECTORS.md) before using PostgreSQL, Supabase, n8n, Browser/Playwright, Docker, or Sentry from Codex.
- Use Supabase connector or PostgreSQL tools for read-only schema inspection before changing database code.
- Use Filesystem access for project files, while preserving user changes.
- Use n8n MCP or n8n API for workflow creation, inspection, imports, exports, and execution debugging.
- Use Browser/Chrome connector or Playwright for dashboard and UI validation.
- Use Docker only after confirming the daemon is running and the target environment is not production, unless explicitly approved.
- Use Sentry only when configured, and never send secrets or full customer data to error monitoring.

## Relevant Skills

Use these project skills from `.agents/skills` when the task touches their area:

- `laundry-project-context`: business rules, branches, services, prices, POS table names, statuses, staff roles, terminology.
- `n8n-workflow-builder`: creating or modifying n8n workflows.
- `openai-customer-agent`: OpenAI Responses API, structured outputs, tool calling, prompts, conversation state, escalation.
- `whatsapp-cloud-api-webhooks`: WhatsApp webhook verification, inbound parsing, media, statuses, idempotency, outbound sends.
- `pos-integration`: POS login/session, order lookup, packing, delivery, customer data, safe read/write boundaries.
- `customer-identity-resolution`: UAE phone normalization, duplicate customer matching, identity verification.
- `order-status-orchestrator`: order lifecycle states, allowed transitions, ETA rules, late orders, POS-confirmed readiness.
- `driver-dispatch`: pickup/delivery assignment, driver availability, acceptance, rejection, timeout, reassignment.
- `uae-location-routing`: Abu Dhabi area aliases, Google Maps links, latitude/longitude, branch/driver routing.
- `complaint-management`: complaint classification, priority, liability-safe wording, photo requests, escalation, closure.
- `multilingual-laundry-support`: Arabic, Gulf Arabic, Sudanese Arabic, English, Urdu, Hindi, and Tagalog support.
- `ai-conversation-memory`: short-term state, structured customer context, summaries, privacy-safe memory.
- `security-and-privacy`: secrets, RBAC, webhook verification, SQL injection protection, rate limits, data retention.
- `database-migration-management`: migrations, indexes, foreign keys, soft delete, audit columns, rollback, seed data.
- `api-design`: clean APIs between n8n, backend, POS, and OpenAI tools.
- `automated-testing`: unit, API, webhook, n8n, prompt, tool-call, mock POS, permission, Arabic, retry tests.
- `observability-and-debugging`: structured logs, correlation IDs, retry queues, dead-letter queues, health checks.
- `deployment-devops`: Hostinger VPS, Docker Compose, n8n, PostgreSQL, Redis, Nginx, SSL, backups, PM2, staging/production.

## Safety Boundaries

- Never send secrets to OpenAI, logs, widgets, n8n execution notes, or customer-visible responses.
- Never commit real `.env` files or production credentials.
- Never run destructive database, filesystem, or deployment commands without explicit approval.
- Never bypass POS verification for order status, payment status, customer data, prices, or readiness.
- Never use WhatsApp Cloud API groups as if they were supported recipients.
- Never send a non-template WhatsApp message outside the 24-hour service window.
- Never send the same inbound message through the business workflow twice.

## Testing Expectations

- Use mocks for POS, WhatsApp, OpenAI, n8n, Telegram, Google Maps, and other external services unless a staging test is explicitly requested.
- Include negative tests for identity, permission, branch scope, phone mismatch, duplicate `wamid`, POS outage, OpenAI outage, and retry/idempotency behavior.
- Arabic and mixed Arabic/English customer conversations must be tested when prompts or customer-agent logic changes.
- If tests cannot be run, explain why and state the exact validation that was performed instead.

## Documentation Expectations

- Keep workflow, API, database, deployment, and prompt documentation aligned with the implemented behavior.
- Document new environment variables in `.env.example`.
- Document new database schema changes through migration files.
- Document operational risks, manual steps, and rollback notes for production-impacting changes.
