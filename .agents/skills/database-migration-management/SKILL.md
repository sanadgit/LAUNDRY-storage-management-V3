---
name: database-migration-management
description: Design, review, and implement database schema changes and migration files for the In & Out Laundry project across PostgreSQL, MySQL, SQLite, or the active project database. Covers migration files, indexes, foreign keys, transactions, soft delete, audit columns, rollback plans, seed data, production safety, and proposed AI operations tables such as ai_contacts, ai_conversations, ai_messages, customer_channel_links, pickup_requests, delivery_requests, driver_assignments, driver_service_areas, complaint_tickets, complaint_events, human_escalations, ai_tool_calls, notification_logs, knowledge_base_articles, and conversation_summaries. Use when Codex creates or modifies database schema, migrations, seeds, indexes, relations, or production database rollout plans.
---

# Database Migration Management

## Purpose

Use this skill when changing the In & Out Laundry database schema or preparing migrations for AI customer support, WhatsApp, POS, dispatch, complaints, notifications, or knowledge-base features.

## Core Rule

Never modify production directly.
Create reviewed migration files, test them locally or in staging, define rollback behavior, and verify data safety before deployment.

## Required Workflow

1. Identify the active database engine: PostgreSQL, MySQL, SQLite, Supabase Postgres, or project-specific DB.
2. Inspect existing migrations and schema before adding new tables or columns.
3. Create a timestamped migration file.
4. Include indexes for lookup paths used by APIs, webhooks, and dashboards.
5. Add foreign keys where relational integrity is required.
6. Use transactions when supported by the database and migration tool.
7. Add audit columns and soft-delete columns where business records must be preserved.
8. Add seed data only when it is safe, idempotent, and environment-appropriate.
9. Provide a rollback plan or down migration when the stack supports it.
10. Run migration validation or at least syntax checks before claiming completion.

## Schema Standards

Prefer these columns for operational tables:

- `id`
- `created_at`
- `updated_at`
- `deleted_at` for soft delete when records should be retained
- `created_by`
- `updated_by`
- `deleted_by` when staff/system actor tracking is needed
- `branch_id` for branch-scoped operational data
- `status` for workflow state
- `metadata` or `raw_payload` only when redacted and bounded

## Production Safety

Before writing migrations that affect existing data:

- check row counts and table size
- avoid long locks
- backfill in batches when needed
- create indexes concurrently where supported
- avoid destructive changes without backup and explicit approval
- avoid dropping columns until code no longer reads them
- preserve auditability for orders, complaints, and customer conversations

## Reference Files

Read [references/database-migration-management.md](references/database-migration-management.md) for table guidance, migration templates, index rules, relationship guidance, rollback patterns, seed rules, and production rollout checklist.
