# n8n Workflow Guidelines

## Project Context

This project uses n8n as an automation layer around laundry operations, POS sync, WhatsApp messages, reporting, approvals, and branch management.

## Common Workflow Families

- WhatsApp inbox routing
- Owner summary reports
- Branch manager alerts
- Driver task assignment
- Complaint intake and escalation
- POS report sync
- Expense and purchase approvals
- Scheduled daily/weekly/monthly reports

## Common Nodes In The Project

- `n8n-nodes-base.webhook`
- `n8n-nodes-base.cron`
- `n8n-nodes-base.code`
- `n8n-nodes-base.httpRequest`
- `n8n-nodes-base.if`
- `n8n-nodes-base.switch`
- `n8n-nodes-base.set`
- `n8n-nodes-base.merge`
- `n8n-nodes-base.stickyNote`

## Design Conventions

- Put one workflow behind one clear business purpose.
- Start with a sticky note when the workflow depends on credentials, special formatting, or an external contract.
- Normalize incoming payloads immediately after the trigger.
- Route by intent, branch, or role only after normalization.
- Keep report workflows deterministic and date-bound.
- Keep approval workflows explicit and human-readable.

## Data Handling Rules

- Keep phone numbers normalized.
- Keep branch identifiers stable.
- Keep status strings identical to the upstream system.
- Keep amount fields numeric until the final message formatting step.
- Keep date ranges explicit and in the project timezone unless the workflow says otherwise.

## JSON Export Rules

- Export workflows in a format ready for import.
- Keep the node graph simple enough to review by eye.
- Avoid embedding API keys, passwords, or session cookies.
- Prefer environment variables for secrets.
- Prefer project-owned API or POS adapter endpoints over raw POS endpoints.
- Call raw POS endpoints directly only when explicitly approved, documented, and protected with retries, idempotency, and redacted logging.
- If a workflow depends on a custom helper or external report API, document it in a sticky note.

## Debugging Rules

When a workflow fails:

1. Check the trigger payload shape.
2. Check the Code node output.
3. Check expressions and field paths.
4. Check credentials and headers.
5. Check whether the upstream API changed its response.
6. Simplify the workflow until the failure is isolated.

## Recommended Workflow Content

Document these values in the workflow or its sticky note when relevant:

- webhook path
- required environment variables
- allowed sender phones
- branch scope
- report period
- approval owner
- fallback behavior
- retry policy
