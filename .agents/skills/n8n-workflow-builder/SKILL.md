---
name: n8n-workflow-builder
description: Build and edit n8n workflows for the In & Out Laundry project, including webhooks, scheduled jobs, HTTP requests, code nodes, integrations, and JSON workflow exports. Use when working on n8n workflow creation, modification, debugging, import/export, or orchestration for laundry operations, POS sync, WhatsApp, reports, alerts, and internal automation.
---

# n8n Workflow Builder

## Purpose

Use this skill when a change must be expressed as an n8n workflow rather than as app code.
Prefer workflow changes that are small, readable, and easy to import back into n8n.

## Core Rules

1. Preserve the existing workflow intent.
2. Do not rename nodes unless it improves readability or is required for correctness.
3. Do not introduce unnecessary complexity when a smaller workflow works.
4. Keep secrets in n8n credentials or environment variables, never in workflow JSON.
5. Use the exact webhook paths, field names, and status names required by the connected systems.
6. When a workflow touches POS, WhatsApp, reports, or approvals, verify the upstream and downstream data contract before editing.

## What This Skill Covers

- Creating new workflows from scratch
- Editing imported workflow JSON
- Repairing broken nodes or connections
- Adding Webhook, Cron, IF, Switch, Code, HTTP Request, Merge, Set, and Sticky Note nodes
- Wiring workflows for WhatsApp, POS, reports, driver tasks, complaints, and branch operations
- Structuring reusable subflows and report pipelines
- Preparing workflow JSON for import into n8n

## Workflow Approach

1. Identify the business goal.
2. Identify the trigger type.
3. Identify the source of truth.
4. Map the data through the workflow step by step.
5. Keep each node focused on one job.
6. Add comments or sticky notes for operators when the workflow is non-obvious.
7. Validate the JSON before handing it back.

## Trigger Selection

Use the smallest trigger that fits the use case:

- `Webhook` for external systems, WhatsApp, forms, or app callbacks
- `Cron` for daily, weekly, or monthly automation
- `Manual Trigger` for testing and debugging
- `Execute Workflow` for reusable subflows

## Preferred Node Patterns

- Use `Set` to normalize inbound data early.
- Use `Code` only for logic that cannot be done cleanly with built-in nodes.
- Use `IF` for a single branch decision.
- Use `Switch` for multi-path routing.
- Use `HTTP Request` for project APIs, POS adapter endpoints, or approved service calls.
- Avoid calling raw POS endpoints directly from n8n unless the workflow explicitly requires it and the risk is documented.
- Use `Merge` when two branches must recombine.
- Use `Sticky Note` to document purpose, secrets, and operator instructions.

## Laundry Project Constraints

For this project, workflows often involve:

- POS order lookup and sync
- WhatsApp inbound and outbound messages
- Branch-specific reporting
- Driver assignment and status updates
- Complaint capture and escalation
- Financial approvals and daily summaries

Keep these flows aligned with the project context and do not invent business behavior.

## Editing JSON Workflows

When editing workflow JSON:

- Preserve `id`, `name`, `type`, `typeVersion`, `position`, and `connections` unless a change requires updates.
- Keep node names descriptive and stable.
- Check expressions carefully after edits.
- Avoid hidden state in Code nodes when a Set node or a simple expression is enough.
- Remove dead nodes, orphan connections, and duplicate trigger paths.

## Validation Checklist

Before returning a workflow:

- Confirm the trigger works.
- Confirm every node has valid input/output wiring.
- Confirm required credentials and variables are documented.
- Confirm no secrets are embedded in JSON.
- Confirm expressions resolve against the actual payload shape.
- Confirm the workflow matches the branch, role, or report scope requested by the user.

## Reference Files

Read [references/n8n-guidelines.md](references/n8n-guidelines.md) for the project-specific workflow conventions, common nodes, and export/import rules.
