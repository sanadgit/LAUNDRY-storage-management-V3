# Security And Privacy Reference

## Threat Model For In & Out Laundry

Protect against:

- leaked API keys and service-role secrets
- fake WhatsApp webhook requests
- replayed webhooks
- SQL injection through order IDs, phone numbers, branch IDs, and search fields
- customer A seeing customer B's order
- branch staff viewing another branch's records
- drivers seeing unrelated customer addresses
- logs exposing full phone numbers, tokens, addresses, or payment details
- AI prompt or tool misuse that reveals private data
- accidental frontend exposure of backend-only credentials

## Secret Management

Store secrets only in environment variables, deployment secret managers, or approved encrypted stores.
Never place real values in source files, workflow exports, screenshots, examples, or logs.

Sensitive project variables include:

- `AI_AGENT_API_KEY`
- `OPENAI_API_KEY`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_VERIFY_TOKEN`
- `META_WHATSAPP_ACCESS_TOKEN`
- `META_WHATSAPP_VERIFY_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_BUSINESS_ACCOUNT_ID`
- `N8N_API_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `POSTGRES_URL`
- `DB_PASSWORD`
- `TELEGRAM_BOT_TOKEN`
- `GOOGLE_MAPS_API_KEY`

Rules:

- Use `VITE_` variables only for values safe to expose to the browser.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code.
- Rotate keys after suspected exposure.
- Redact secrets in errors, traces, request dumps, and n8n execution logs.
- Keep example env files empty or clearly fake.

## Input Validation

Validate at every external boundary:

- WhatsApp webhook body
- public API requests
- admin dashboard forms
- driver updates
- POS lookup requests
- n8n webhook inputs
- OpenAI tool arguments

Recommended validation:

- phone: normalize UAE phone and reject impossible formats
- order ID: allow only expected alphanumeric or numeric format
- branch ID: numeric or known branch identifier only
- complaint type: enum only
- status: enum only
- pagination: bounded integers
- text: max length and safe encoding
- media URL: trusted source or verified download flow only

Do not rely on client-side validation.

## SQL Injection Protection

Use parameterized queries, prepared statements, ORM query builders, or Supabase query APIs.
Never concatenate user input into SQL.

Unsafe:

```ts
const sql = `select * from customer_orders where order_id = '${orderId}'`;
```

Safe:

```ts
const result = await db.query(
  "select * from customer_orders where order_id = $1",
  [orderId]
);
```

For dynamic filters:

- whitelist column names
- whitelist sort directions
- limit page size
- avoid exposing arbitrary SQL to n8n or AI tools

## Webhook Security

For WhatsApp Cloud API:

- handle `GET` verification using the configured verify token
- reject invalid verify tokens
- verify request authenticity where signature headers are available
- validate payload shape before processing
- store `wamid` and skip duplicate messages
- reject or ignore unsupported message types safely
- use rate limits and body size limits
- do not log the full raw payload without redaction

If using Meta signature verification:

1. Read the raw body exactly as received.
2. Compute HMAC using the app secret.
3. Compare using constant-time comparison.
4. Reject mismatches before parsing or side effects.

For n8n webhooks:

- require an API key or signed token on private endpoints
- do not expose internal workflow URLs publicly unless they validate origin
- treat webhook input as untrusted
- avoid storing secrets in workflow nodes where execution logs can expose them

## Rate Limiting

Apply rate limits to:

- WhatsApp webhook endpoints
- order tracking endpoints
- customer lookup endpoints
- login endpoints
- OTP or verification endpoints
- AI response generation endpoints
- n8n trigger endpoints

Suggested keys:

- source IP for public HTTP endpoints
- normalized phone for WhatsApp/customer interactions
- user ID for authenticated staff actions
- branch ID plus user ID for branch dashboards

Use stricter limits for failed verification attempts and repeated order lookup attempts.

## Role-Based Access Control

Use server-side authorization for every sensitive read or write.

Suggested role boundaries:

- customer: only own verified orders, own pickup/delivery status, own complaints
- driver: assigned pickup/delivery tasks only, limited customer contact/location needed for the task
- cashier: branch-scoped orders and customer service actions
- branch_manager: branch-scoped operations, complaints, staff views
- accountant: billing/payment views, no unnecessary operational private notes
- operations_manager: cross-branch operational oversight
- general_manager: broad access with audit logging
- unknown: no private data

Never trust a role passed from the browser or WhatsApp message text.
Resolve roles from trusted tables such as `ai_contacts`, authenticated user records, or backend session claims.

## Branch Data Separation

Branch isolation is required for:

- orders
- pickups
- deliveries
- complaints
- drivers
- staff assignment
- branch reports
- knowledge base entries when branch-specific

Rules:

- Include `branch_id` in sensitive queries when the caller is branch-scoped.
- Do not accept `branch_id` from the client as proof of access.
- Derive allowed branch IDs from the authenticated role/session.
- For cross-branch roles, audit reads and writes.

Example branch-scoped condition:

```ts
where branch_id = allowedBranchId
```

Not:

```ts
where branch_id = request.body.branch_id
```

## Customer Data Disclosure Prevention

Before showing order details:

1. Normalize the requesting phone number.
2. Match it to a verified customer/contact record.
3. Confirm the order belongs to that customer or the customer is authorized.
4. If multiple customer records match, ask for safe verification.
5. Return only the fields required for the current intent.

Never disclose:

- full address to an unverified caller
- staff personal phone numbers
- another customer's orders
- complaint details to unrelated numbers
- driver location beyond what policy permits
- payment-sensitive details

If the customer knows an order number but the phone does not match, do not reveal status.
Ask for verification or escalate to staff.

## Phone Masking

Mask phones in logs, dashboards, and AI summaries unless full phone is required for the current operational task.

Recommended mask:

```text
97150****528
```

Implementation idea:

```ts
function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length <= 6) return "***";
  return `${digits.slice(0, 5)}****${digits.slice(-3)}`;
}
```

Use full phone numbers only in:

- verified customer identity matching
- WhatsApp send API `to` field
- driver/customer operational handoff when permitted
- manager-only tools with audit logging

## Audit Logs

Audit sensitive events:

- customer/order lookup
- complaint creation/update
- delivery/pickup assignment
- branch override
- role changes
- failed verification attempts
- webhook verification failures
- secret/config changes
- cross-branch reads
- manual POS updates

Audit log fields:

- actor type and ID
- actor role
- masked phone when applicable
- action
- target type and ID
- branch scope
- outcome
- timestamp
- request ID or correlation ID
- reason for escalation or override

Do not store raw secrets or payment details in audit logs.

## Data Retention

Define retention by data type:

- raw webhook payloads: short retention or redacted storage
- `ai_messages`: retain according to support/audit policy, with deletion/archive path
- conversation summaries: retain while useful for support continuity
- media files: retain only as long as needed for complaint/order workflow
- complaint evidence: retain according to business/legal policy
- operational audit logs: retain longer, but redacted

Design systems so raw message history can be expired without breaking the AI agent.

## AI Agent Privacy Guardrails

The AI agent must not:

- reveal data from memory without verification
- use a guessed phone or name to retrieve orders
- expose tool outputs containing other customers
- include secrets in prompts or summaries
- send raw full conversation history when a summary is sufficient
- make cross-branch decisions without authorized tool confirmation

Tool outputs passed to the model should be minimized:

```json
{
  "order_id": "256719",
  "status": "IRONING",
  "ready": false,
  "branch_id": "branch_mbz"
}
```

Avoid sending unrelated customer records, staff notes, full addresses, or raw database rows.

## Error Handling

Customer-facing errors should be safe and vague when needed:

- "I could not verify this order for this WhatsApp number."
- "I need a team member to confirm this before sharing details."
- "I cannot access that information from this number."

Internal logs can include diagnostic details after redaction.
Never expose stack traces, SQL queries with parameters, tokens, or internal IDs to customers.

## Review Checklist

Before approving code or workflow changes, confirm:

- secrets are not committed or exposed to frontend bundles
- inputs are validated server-side
- SQL is parameterized
- rate limits exist on public/sensitive endpoints
- WhatsApp/n8n webhooks are verified
- duplicate `wamid` handling exists for WhatsApp messages
- RBAC is enforced server-side
- branch scope is enforced server-side
- customer ownership is verified before order disclosure
- logs mask phone numbers and redact secrets
- audit logs exist for sensitive actions
- data retention behavior is defined
- AI prompt context excludes secrets and unrelated customer data
