# Codex MCP And Connector Setup

## Purpose

This file defines how Codex should connect to project systems for In & Out Laundry work.
Do not place secrets in this file.

## Current Connector Status

- Filesystem: available in the current Codex workspace for reading and writing project files.
- Supabase: connector is available in this Codex session. It can list projects and inspect Supabase metadata when explicitly needed.
- PostgreSQL direct access: not configured as a direct MCP server in this repository. Use Supabase connector when the database is hosted in Supabase, or use `psql`/application database tools with environment variables when approved.
- n8n: no n8n MCP tool is currently exposed in this Codex session. Use the n8n API with `N8N_WEBHOOK_BASE_URL` and `N8N_API_KEY`, or configure a trusted n8n MCP server.
- Browser/Playwright: browser and Chrome plugins are enabled in the local Codex config. Add Playwright project tests only when the task requires repeatable dashboard testing.
- Docker: Docker CLI and Docker Compose are installed, but the daemon must be running before container inspection works.
- Sentry: no Sentry connector is currently configured. Use only after Sentry project, organization, auth token, and DSN are provided through secure environment variables or an approved connector.

## Supabase Projects Discovered

The Supabase connector can see these projects:

- `Laundry Warehouse Management`
- `Laundry Store`

Do not inspect schemas, run SQL, restore, pause, or modify projects unless the task explicitly requires it and the target project is confirmed.

## Required Connections By Task

### PostgreSQL Or Supabase

Use for:

- checking database schema
- reviewing migrations
- validating indexes and foreign keys
- inspecting RLS policies when Supabase is used
- checking Edge Functions when relevant

Rules:

- never expose `SUPABASE_SERVICE_ROLE_KEY`
- never run production writes without explicit approval
- prefer read-only inspection first
- use migrations for schema changes
- enable RLS on exposed Supabase tables

### Filesystem

Use for:

- reading project code
- writing migrations
- editing workflows
- updating docs
- adding tests

Rules:

- preserve user changes
- do not delete or reset unrelated files
- use `AGENTS.md` and relevant skills before changing code

### n8n MCP Or API

Use for:

- creating workflows
- validating workflow JSON
- inspecting executions
- checking failed runs
- exporting/importing workflows

Required environment variables:

- `N8N_WEBHOOK_BASE_URL`
- `N8N_API_KEY`

Rules:

- do not hardcode credentials inside workflow JSON
- use credentials nodes or n8n variables
- add error branches and retry limits
- include `correlation_id` and workflow execution ID in logs
- test workflows with mock POS/OpenAI/WhatsApp where possible

### Browser Or Playwright

Use for:

- testing dashboards
- checking admin pages
- validating customer portal flows
- verifying responsive UI
- testing login and permission gates

Rules:

- prefer Browser/Chrome connector for exploratory checks
- prefer Playwright tests for repeatable CI-style behavior
- do not use production customer data in UI tests

### Docker

Use for:

- checking running containers
- inspecting service health
- reading logs
- validating Docker Compose services
- testing PostgreSQL, Redis, n8n, and app containers

Rules:

- ensure Docker daemon is running before inspection
- avoid `docker compose down -v` on production
- do not remove volumes without explicit approval
- inspect logs before restarting services

### Sentry

Use for:

- error monitoring
- release health
- issue triage
- stack traces
- production regression investigation

Required environment variables when using API access:

- `SENTRY_AUTH_TOKEN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `SENTRY_DSN` for application runtime reporting

Rules:

- do not send secrets or full customer data to Sentry
- use release identifiers for deploy tracking
- include `correlation_id` where possible
- redact phone numbers and payment-related details

## Safe MCP Configuration Template

See [.mcp.example.json](.mcp.example.json) for a non-secret template.
Copy only the sections you need into your active Codex/MCP configuration.

Do not commit active config files that contain tokens.

## Operational Checklist

Before using an external connector:

1. Confirm the target system and environment: staging or production.
2. Confirm credentials are available through secure env vars or OAuth.
3. Confirm the task is read-only or has explicit approval for writes.
4. Confirm logs and outputs will not reveal secrets or customer data.
5. Use the relevant skill from `.agents/skills`.
6. Record files changed, tools used, validations run, and remaining risks.
