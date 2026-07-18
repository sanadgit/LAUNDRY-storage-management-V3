---
name: laundry-project-context
description: Project-specific context for In & Out Laundry operations, POS mapping, branches, services, statuses, complaints, driver flow, and bilingual Arabic/English terminology. Use when working on code, prompts, workflows, dashboards, APIs, database schemas, or AI behavior that must stay aligned to the laundry business and its POS-driven operations.
---

# Laundry Project Context

## Purpose

Use this skill to keep Codex anchored to the real In & Out Laundry domain instead of a generic retail or delivery model.
Always load the laundry business context before suggesting code, prompts, workflows, or data changes.

## Core Rule

Do not invent business rules, prices, branches, statuses, complaint types, or POS table names.
If a value is missing from the references, mark it as unknown and ask for the real value or inspect the source files.

## What To Apply

Use the project context for:

- Company and branch identity
- Services and pricing lookup
- Order and delivery status mapping
- Complaint classification
- Employee role permissions
- Branch zone / coverage rules
- Driver assignment and handoff logic
- Customer service rules
- POS table and endpoint names
- Arabic / English terminology normalization

## Working Rules

1. Prefer project-specific terms over generic ones.
2. Match the existing POS and workflow vocabulary used in the repo.
3. Keep customer-facing replies short, clear, and aligned with the business tone.
4. For prices, branch coverage, driver assignment, and order status, read from the project reference files or live source data only.
5. When a branch-specific rule conflicts with a general rule, the branch rule wins.
6. When a POS field or table name is referenced, preserve the exact casing and spelling used by the source system.

## Default Domain Model

Use this project model unless a source file says otherwise:

- Customer requests a service
- System looks up the correct branch and price
- Order is created or synced from POS
- Pickup or delivery is assigned to a driver when needed
- Updates are tracked by status
- Complaints are classified and escalated when urgent
- Internal staff use role-based views and actions

## Reference Files

Read [references/laundry-context.md](references/laundry-context.md) for the canonical business glossary, known statuses, known complaint groups, POS hints, and terminology map.

## Safety

- Never hallucinate unavailable services or prices.
- Never assume a branch serves every area.
- Never close a complaint without the required approval path.
- Never change POS behavior unless the source flow confirms it.
- Never rename business terms just to make them look cleaner.
