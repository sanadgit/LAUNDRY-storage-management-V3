# Database Migration Management Reference

## Existing Project Context

The project already has AI operations migrations for both SQLite and PostgreSQL:

- `database/migrations/20260628_ai_operations_agent_phase1.sqlite.sql`
- `database/migrations/20260628_ai_operations_agent_phase1.postgres.sql`

Existing AI-related tables include:

- `ai_contacts`
- `ai_conversations`
- `ai_messages`
- `pickup_requests`
- `delivery_requests`
- `complaint_tickets`
- `ai_knowledge_base`

Before adding new tables, inspect these migrations and avoid duplicating tables with different meanings.

## Proposed AI Operations Tables

Use these tables as the target model for AI and operations workflows:

- `ai_contacts`: normalized identities for customers, drivers, managers, cashiers, accountants, and unknown senders.
- `ai_conversations`: one active support thread or operational conversation per contact/context.
- `ai_messages`: auditable inbound/outbound messages, WhatsApp IDs, message type, redacted text/media metadata.
- `customer_channel_links`: links POS customers to WhatsApp, phone, web, Telegram, or future channels.
- `pickup_requests`: customer pickup requests and lifecycle status.
- `delivery_requests`: customer delivery requests and lifecycle status.
- `driver_assignments`: assignment attempts and accepted/rejected/timed-out driver routing.
- `driver_service_areas`: branch/driver service area mapping.
- `complaint_tickets`: main complaint record.
- `complaint_events`: complaint timeline, updates, photos, staff actions, and follow-up events.
- `human_escalations`: handoffs from AI to staff or managers.
- `ai_tool_calls`: tool/function calls made by the AI, with input/output redaction and status.
- `notification_logs`: outbound WhatsApp/SMS/Telegram/email notification attempts and delivery state.
- `knowledge_base_articles`: approved operational knowledge and customer-facing content.
- `conversation_summaries`: compact AI memory summaries per conversation.

## Table Design Rules

Every operational table should have:

- primary key
- `created_at`
- `updated_at`
- status enum or constrained text where lifecycle exists
- `branch_id` when data is branch-scoped
- indexes matching real lookup patterns
- foreign keys for owned data when safe
- soft delete when records should not disappear from audit trails

Use soft delete for:

- contacts
- knowledge base articles
- conversation summaries
- operational requests when cancellation/history must remain

Avoid soft delete for:

- immutable event logs
- audit logs
- notification attempts
- tool-call history

## Audit Columns

Use audit columns when staff, drivers, or AI can change records:

```sql
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
deleted_at TIMESTAMP NULL,
created_by VARCHAR(80),
updated_by VARCHAR(80),
deleted_by VARCHAR(80)
```

For PostgreSQL, prefer `TIMESTAMPTZ` when the project standard allows it.
For MySQL, use `DATETIME` or `TIMESTAMP` consistently with the project.
For SQLite, use `DATETIME DEFAULT CURRENT_TIMESTAMP`.

## Foreign Key Guidance

Recommended relationships:

- `ai_conversations.contact_id` references `ai_contacts.id`
- `ai_messages.conversation_id` references `ai_conversations.id`
- `customer_channel_links.contact_id` references `ai_contacts.id`
- `pickup_requests.contact_id` references `ai_contacts.id` when contact linkage exists
- `delivery_requests.contact_id` references `ai_contacts.id` when contact linkage exists
- `driver_assignments.driver_contact_id` references `ai_contacts.id`
- `driver_assignments.pickup_request_id` references `pickup_requests.id` when task type is pickup
- `driver_assignments.delivery_request_id` references `delivery_requests.id` when task type is delivery
- `complaint_tickets.contact_id` references `ai_contacts.id`
- `complaint_events.complaint_id` references `complaint_tickets.id`
- `human_escalations.conversation_id` references `ai_conversations.id`
- `ai_tool_calls.conversation_id` references `ai_conversations.id`
- `notification_logs.conversation_id` references `ai_conversations.id`
- `conversation_summaries.conversation_id` references `ai_conversations.id`

Use `ON DELETE SET NULL` for optional historical links where deleting a parent should not erase history.
Use `ON DELETE CASCADE` only when child rows have no standalone audit value.

## Index Rules

Create indexes for:

- phone lookup
- normalized phone lookup
- WhatsApp `wamid` uniqueness
- conversation by contact and status
- messages by conversation and time
- order ID lookup
- branch plus status dashboards
- driver assignment by status and driver
- complaint by status, priority, branch
- notification delivery state
- tool calls by conversation and created time
- soft delete filters when frequently queried

Examples:

```sql
CREATE INDEX IF NOT EXISTS idx_ai_contacts_phone ON ai_contacts(phone);
CREATE INDEX IF NOT EXISTS idx_ai_contacts_normalized_phone ON ai_contacts(normalized_phone);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_contact_status ON ai_conversations(contact_id, status);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_created ON ai_messages(conversation_id, created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_messages_wamid_unique ON ai_messages(whatsapp_message_id);
CREATE INDEX IF NOT EXISTS idx_complaint_tickets_branch_status_priority ON complaint_tickets(branch_id, status, priority);
```

For PostgreSQL production tables with high traffic, consider `CREATE INDEX CONCURRENTLY`, but remember it cannot run inside a normal transaction.

## Migration File Rules

Use timestamped names:

```text
YYYYMMDDHHMM_descriptive_name.postgres.sql
YYYYMMDDHHMM_descriptive_name.mysql.sql
YYYYMMDDHHMM_descriptive_name.sqlite.sql
```

If the project currently uses date-only migration names, follow the existing convention unless changing it intentionally.

Each migration should include:

- purpose comments
- schema changes
- indexes
- foreign keys
- data backfill if needed
- idempotent seed inserts if needed
- rollback notes or separate down migration

## PostgreSQL Pattern

```sql
BEGIN;

CREATE TABLE IF NOT EXISTS customer_channel_links (
  id BIGSERIAL PRIMARY KEY,
  contact_id BIGINT REFERENCES ai_contacts(id) ON DELETE SET NULL,
  channel VARCHAR(30) NOT NULL,
  channel_user_id VARCHAR(120) NOT NULL,
  normalized_phone VARCHAR(30),
  is_primary BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  UNIQUE (channel, channel_user_id)
);

CREATE INDEX IF NOT EXISTS idx_customer_channel_links_contact
  ON customer_channel_links(contact_id);

CREATE INDEX IF NOT EXISTS idx_customer_channel_links_phone
  ON customer_channel_links(normalized_phone);

COMMIT;
```

## MySQL Pattern

```sql
START TRANSACTION;

CREATE TABLE IF NOT EXISTS customer_channel_links (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  contact_id BIGINT NULL,
  channel VARCHAR(30) NOT NULL,
  channel_user_id VARCHAR(120) NOT NULL,
  normalized_phone VARCHAR(30),
  is_primary BOOLEAN DEFAULT FALSE,
  verified_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  UNIQUE KEY uq_customer_channel_links_channel_user (channel, channel_user_id),
  KEY idx_customer_channel_links_contact (contact_id),
  KEY idx_customer_channel_links_phone (normalized_phone),
  CONSTRAINT fk_customer_channel_links_contact
    FOREIGN KEY (contact_id) REFERENCES ai_contacts(id)
    ON DELETE SET NULL
);

COMMIT;
```

## SQLite Pattern

SQLite has limited `ALTER TABLE` support.
Prefer simple additive migrations, or rebuild tables carefully when changing existing columns.

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS customer_channel_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_id INTEGER,
  channel TEXT NOT NULL,
  channel_user_id TEXT NOT NULL,
  normalized_phone TEXT,
  is_primary INTEGER DEFAULT 0,
  verified_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  UNIQUE(channel, channel_user_id),
  FOREIGN KEY (contact_id) REFERENCES ai_contacts(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_customer_channel_links_contact
  ON customer_channel_links(contact_id);
```

## Transactions

Use transactions for migrations whenever supported.
Be careful with operations that cannot run in transactions:

- PostgreSQL `CREATE INDEX CONCURRENTLY`
- some MySQL DDL operations depending on engine/version
- external data backfills

If the migration cannot be fully transactional, split it into safe steps and document recovery.

## Rollback Guidance

Rollback should be possible and explicit.

Safe rollback examples:

- drop a new index
- drop a new table that has no production data yet
- remove seed data inserted by a migration using stable keys

Risky rollback examples:

- dropping columns with data
- changing data types
- merging/splitting tables
- deleting audit records

For risky changes, create a forward-fix plan and backup requirement instead of pretending rollback is harmless.

## Seed Data Rules

Seed data must be:

- environment-safe
- idempotent
- free of real customer personal data unless explicitly required and approved
- stable across repeated runs
- separate from test fixtures when possible

PostgreSQL example:

```sql
INSERT INTO knowledge_base_articles (slug, title, body, status)
VALUES ('pickup-policy', 'Pickup Policy', 'Approved customer-facing pickup policy.', 'published')
ON CONFLICT (slug) DO NOTHING;
```

MySQL example:

```sql
INSERT IGNORE INTO knowledge_base_articles (slug, title, body, status)
VALUES ('pickup-policy', 'Pickup Policy', 'Approved customer-facing pickup policy.', 'published');
```

## Production Rollout Checklist

Before production:

- confirm the active database engine
- run migration on a local copy or staging
- check syntax for the target engine
- verify indexes support expected queries
- verify foreign keys do not break existing data
- estimate lock time
- create backup or snapshot
- prepare rollback or forward-fix plan
- deploy app code in an order compatible with schema changes
- monitor errors, slow queries, and webhook failures after deployment

Do not run one-off manual SQL in production unless explicitly approved and recorded.

## AI Agent Data Model Notes

For AI workflows:

- use `ai_messages` for audit, not as the full prompt context every turn
- use `conversation_summaries` for compact memory
- use `ai_tool_calls` for traceability of function calls and tool outputs
- redact tool-call arguments/results when they contain secrets or personal data
- use `notification_logs` to track sent/read/delivered/failed messages
- use unique constraints for idempotency keys such as WhatsApp `wamid`

## Review Checklist

Before accepting a schema change, confirm:

- no duplicate table already exists
- names match project conventions
- columns have correct types for the active engine
- foreign keys are intentional
- indexes match real lookup paths
- soft delete is used where business history matters
- audit columns exist where staff/system changes occur
- migration is idempotent where appropriate
- rollback or forward-fix is documented
- seed data is safe
- production is not modified directly
