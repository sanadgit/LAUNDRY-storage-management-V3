# In & Out Laundry Complaint and Human Handoff Workflows

Deployment target: `https://service.inandoutuae.com`

Do not deploy these workflow exports directly to production. Import into staging first and use mocked service API responses until the real endpoints are connected.

## Scope

This package implements complaint intake, manager notification, follow-up, closure controls, and human handoff.

Required workflow exports:

- `workflows/40-complaint-management.json`
- `workflows/41-notify-branch-manager.json`
- `workflows/42-complaint-follow-up.json`
- `workflows/43-close-complaint.json`
- `workflows/50-human-handoff.json`
- `workflows/51-human-reply-return.json`

## Shared Contract

All workflows accept the shared input envelope:

```json
{
  "correlationId": "",
  "messageId": "",
  "conversationId": "",
  "customerId": "",
  "customerPhone": "",
  "detectedLanguage": "",
  "intent": "",
  "payload": {}
}
```

All outputs must preserve `correlationId`, avoid exposing internal notes, and preserve audit history through service API events.

## Guardrails

- Verify customer identity before creating or exposing complaint data.
- Verify order ownership when an order number is provided.
- Preserve `originalComplaintWording` exactly for audit and manager review.
- Classify category and priority safely using allowed enums only.
- Never admit liability.
- Never promise compensation unless a manager-approved workflow explicitly provides approved wording.
- Escalate legal threats, lost valuable garments, serious damage, privacy concerns, repeated AI failure, and aggressive conversations.
- Do not allow AI to close critical complaints.
- Lock AI replies after human handoff until authorized staff closes the handoff.
- Preserve audit history for complaint creation, follow-up, closure, and human replies.

## Workflow Nodes

### 40 Complaint Management

- `Workflow Input`
- `Extract Complaint Details`
- `Verify Customer`
- `Order Number Provided?`
- `Verify Order Ownership`
- `Classify Complaint`
- `Validate Classification`
- `Priority Router`
- `Create Complaint Ticket`
- `Find Responsible Branch`
- `Notify Branch Manager`
- `Critical Complaint?`
- `Human Escalation`
- `Prepare Customer Acknowledgment`
- `Return Complaint Result`

Categories: `DELAY`, `CLEANING_QUALITY`, `DAMAGE`, `LOST_ITEM`, `MISSING_ITEM`, `WRONG_ITEM`, `BILLING`, `STAFF_BEHAVIOR`, `DRIVER`, `DELIVERY`, `OTHER`.

Priorities: `P1_CRITICAL`, `P2_HIGH`, `P3_NORMAL`, `P4_LOW`.

Statuses: `NEW`, `ACKNOWLEDGED`, `INVESTIGATING`, `WAITING_FOR_CUSTOMER`, `WAITING_FOR_BRANCH`, `RESOLUTION_PROPOSED`, `RESOLVED`, `CLOSED`, `ESCALATED`, `REOPENED`.

### 41 Notify Branch Manager

- `Workflow Input`
- `Load Complaint`
- `Get Branch Manager`
- `Prepare Manager Message`
- `Send WhatsApp Notification`
- `Save Notification`
- `Return Result`

### 42 Complaint Follow-up

- `Schedule Trigger`
- `Workflow Input`
- `Find Complaints Requiring Follow-up`
- `Loop Over Complaints`
- `Check Current Status`
- `Customer Follow-up Required?`
- `Prepare Customer Message`
- `Send WhatsApp Message`
- `Manager Escalation Required?`
- `Notify Manager`
- `Save Complaint Event`
- `Return Summary`

### 43 Close Complaint

- `Workflow Input`
- `Load Complaint`
- `Validate Closure Permission`
- `Critical Complaint?`
- `Manager Approval Present?`
- `Update Complaint Status`
- `Save Resolution`
- `Send Customer Resolution Message`
- `Request Satisfaction Rating`
- `Save Audit Event`
- `Return Result`

### 50 Human Handoff

- `Workflow Input`
- `Load Conversation`
- `Load Related Order`
- `Load Related Complaint`
- `Generate Handoff Summary`
- `Create Handoff Record`
- `Determine Human Queue`
- `Notify Responsible Staff`
- `Lock AI Conversation`
- `Return Handoff Confirmation`

### 51 Human Reply Return

- `Workflow Input`
- `Validate Staff Identity`
- `Load Active Handoff`
- `Prepare Human Reply`
- `Send WhatsApp Reply`
- `Save Staff Message`
- `Update Conversation`
- `Close or Continue Handoff?`
- `Update Handoff Status`
- `Return Result`

## Required n8n Variables and Credentials

- `SERVICE_API_BASE_URL`
- `SERVICE_API_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_ACCESS_TOKEN` or n8n WhatsApp credential
- `N8N_WF_NOTIFY_BRANCH_MANAGER_ID`
- `N8N_WF_HUMAN_HANDOFF_ID`
- `DEFAULT_TIMEZONE=Asia/Dubai`

## Service API Dependencies

- `GET /api/v1/customers/:id/verify`
- `GET /api/v1/pos/orders/:id/status`
- `POST /api/v1/ai/complaints/classify`
- `POST /api/v1/complaints`
- `GET /api/v1/complaints/:id/responsible-branch`
- `GET /api/v1/complaints/:id`
- `GET /api/v1/branches/:id/manager`
- `GET /api/v1/complaints/follow-up/due`
- `POST /api/v1/complaints/:id/events`
- `POST /api/v1/complaints/:id/validate-closure`
- `PATCH /api/v1/complaints/:id/status`
- `POST /api/v1/complaints/:id/resolution`
- `POST /api/v1/complaints/:id/satisfaction-request`
- `GET /api/v1/ai/conversations/:id`
- `POST /api/v1/ai/handoffs/summary`
- `POST /api/v1/human-handoffs`
- `PATCH /api/v1/ai/conversations/:id/lock`
- `POST /api/v1/staff/validate`
- `PATCH /api/v1/human-handoffs/:id/status`
- `POST /api/v1/audit/events`

## Validation

Run:

```bash
npm run generate:n8n-workflows
npm run validate:n8n-workflows
npm run validate:n8n-complaint-handoff
```

Sample payloads are under `test-payloads/n8n-complaint-handoff/`.
