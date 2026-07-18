# In & Out Laundry AI Customer Service - MVP n8n Workflow Specification

Deployment target: `https://service.inandoutuae.com`

Do not deploy these workflows to production from this repository. Import and test in staging n8n first.

## Shared Input Contract

All MVP sub-workflows accept this envelope. Workflow-specific fields belong inside `payload`.

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

## Shared Output Contract

All MVP sub-workflows should return this envelope shape at their boundary.

```json
{
  "success": true,
  "status": "SUCCESS",
  "data": {},
  "error": null,
  "meta": {
    "correlationId": "",
    "workflow": "",
    "durationMs": 0
  }
}
```

## MVP Goal

```text
WhatsApp text message
-> Validate webhook
-> Deduplicate event
-> Normalize phone
-> Identify customer
-> Load memory
-> Understand order inquiry
-> Retrieve verified POS order
-> Reply in customer language
-> Save conversation
-> Log result
```

## MVP Workflow Files

Build and import these first:

1. `workflows/01-whatsapp-customer-service-router.json`
2. `workflows/02-message-idempotency-check.json`
3. `workflows/03-uae-phone-normalization.json`
4. `workflows/04-pos-customer-identity.json`
5. `workflows/05-conversation-memory-manager.json`
6. `workflows/06-ai-customer-service-agent.json`
7. `workflows/10-order-tracking.json`
8. `workflows/70-whatsapp-response-sender.json`
9. `workflows/80-save-conversation-summary.json`
10. `workflows/90-central-error-handler.json`

The repository may contain later-phase workflows, but the MVP import and validation path is scoped to the ten files above.

## Required Nodes

### 01 - WhatsApp Customer Service Router

- `WhatsApp Incoming Message`
- `Generate Correlation ID`
- `Extract Webhook Data`
- `Validate Payload`
- `Invalid Payload Response`
- `Check Message Type`
- `Normalize WhatsApp Message`
- `Check Duplicate Message`
- `Is Duplicate?`
- `Normalize Customer Phone`
- `Identify Customer`
- `Load Conversation Context`
- `Prepare Agent Input`
- `Customer Service AI Agent`
- `Validate Agent Response`
- `Safe Fallback Message`
- `Send WhatsApp Reply`
- `Save Conversation`
- `Mark Event Processed`
- `Error Handler`

### 02 - Message Idempotency Check

- `Workflow Input`
- `Extract WhatsApp Message ID`
- `Find Processed Event`
- `Message Already Exists?`
- `Return Duplicate Result`
- `Register Processing Lock`

### 03 - UAE Phone Normalization

- `Workflow Input`
- `Clean Phone Characters`
- `Convert UAE Format`
- `Validate Phone Number`
- `Return Normalized Phone`

### 04 - POS Customer Identity

- `Workflow Input`
- `Prepare Phone Variants`
- `Find Customer in POS`
- `POS Request Successful?`
- `Check Customer Results`
- `Single Customer Found`
- `Ambiguous Customer Result`
- `Customer Not Found`

### 05 - Conversation Memory Manager

- `Workflow Input`
- `Find Active Conversation`
- `Conversation Exists?`
- `Create Conversation`
- `Load Recent Messages`
- `Load Conversation Summary`
- `Load Active Context`
- `Context Too Large?`
- `Summarize Old Messages`
- `Return Memory Context`

### 06 - AI Customer Service Agent

- `Workflow Input`
- `Prepare Customer Context`
- `Load System Prompt`
- `Customer Service Agent`
- `OpenAI Chat Model`
- `Conversation Memory`
- `Search Knowledge Base Tool`
- `Find Customer Tool`
- `Get Active Orders Tool`
- `Get Order Status Tool`
- `Create Pickup Tool`
- `Create Complaint Tool`
- `Human Handoff Tool`
- `Validate AI Output`
- `Response Valid?`
- `Return Agent Response`

### 10 - Order Tracking

- `Workflow Input`
- `Validate Customer ID`
- `Order ID Provided?`
- `Get Specific Order`
- `Get Active Orders`
- `Verify Order Ownership`
- `Count Active Orders`
- `Order Result Router`
- `Map POS Status`
- `Return Order Result`

### 70 - WhatsApp Response Sender

- `Workflow Input`
- `Validate Recipient`
- `Determine Message Type`
- `Prepare Text Message`
- `Prepare Template Message`
- `Send WhatsApp Message`
- `Send Successful?`
- `Save Notification Status`
- `Return Provider Result`

### 80 - Save Conversation and Summary

- `Workflow Input`
- `Redact Sensitive Data`
- `Save Customer Message`
- `Save Agent Response`
- `Save Tool Calls`
- `Summary Needed?`
- `Generate Summary`
- `Update Conversation`

### 90 - Central Error Handler

- `Workflow Error Trigger`
- `Extract Error Data`
- `Redact Secrets`
- `Classify Error`
- `Is Temporary Error?`
- `Save Error Log`
- `Retry Allowed?`
- `Add to Retry Queue`
- `Notify Operations`
- `Return Safe Failure Result`

## Manual Credentials And Variables

Configure these in n8n or deployment secrets. Never place real values in workflow JSON.

- `SERVICE_API_BASE_URL`
- `SERVICE_API_TOKEN`
- `N8N_API_KEY`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_BUSINESS_ACCOUNT_ID`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_VERIFY_TOKEN`
- `OPENAI_API_KEY`
- `N8N_ENCRYPTION_KEY`
- `DATABASE_URL`
- `REDIS_URL`
- `OPERATIONS_ALERT_PHONE`
- `DEFAULT_TIMEZONE`
- `N8N_WF_IDEMPOTENCY_CHECK_ID`
- `N8N_WF_PHONE_NORMALIZATION_ID`
- `N8N_WF_CUSTOMER_IDENTITY_ID`
- `N8N_WF_MEMORY_MANAGER_ID`
- `N8N_WF_AI_AGENT_ID`
- `N8N_WF_ORDER_TRACKING_ID`
- `N8N_WF_RESPONSE_SENDER_ID`
- `N8N_WF_SAVE_SUMMARY_ID`
- `N8N_WF_ERROR_HANDLER_ID`

## Unresolved API Dependencies

The MVP workflows assume these internal service API contracts exist behind `service.inandoutuae.com`:

- `GET /api/v1/webhook-events/:messageId`
- `POST /api/v1/webhook-events/lock`
- `POST /api/v1/webhook-events/processed`
- `GET /api/v1/customers/by-phone/:phone`
- `GET /api/v1/ai/conversations/active`
- `POST /api/v1/ai/conversations`
- `GET /api/v1/ai/conversations/:conversationId/messages/recent`
- `GET /api/v1/ai/conversations/:conversationId/summary`
- `GET /api/v1/ai/conversations/:conversationId/context`
- `POST /api/v1/ai/conversations/:conversationId/summarize`
- `PATCH /api/v1/ai/conversations/:conversationId`
- `GET /api/v1/ai/customer-service-agent/prompt`
- `GET /api/v1/customers/:customerId/orders/active`
- `GET /api/v1/pos/orders/:orderId/status`
- `POST /api/v1/ai/messages`
- `POST /api/v1/ai/tool-calls/batch`
- `POST /api/v1/notifications/whatsapp`
- `POST /api/v1/observability/errors`

The service API must handle POS login/session, raw POS endpoints, customer authorization, retry-safe idempotency, and response normalization.

## Test Payloads

Safe sample payloads live under:

```text
test-payloads/n8n-mvp/
```

They cover:

- WhatsApp text order-status inquiry.
- Duplicate message idempotency.
- UAE phone normalization.
- POS customer identity lookup.
- Conversation memory load.
- AI agent order-status intent.
- POS-backed order tracking.
- WhatsApp response send.
- Conversation save and summary.
- Central error handling.

## Validation

Generate all exports:

```bash
npm run generate:n8n-workflows
```

Validate the full workflow set:

```bash
npm run validate:n8n-workflows
```

Validate the MVP package only:

```bash
npm run validate:n8n-mvp
```

Run strict workflow validation:

```bash
npm run validate:n8n-strict
```

Run existing AI tests:

```bash
npm run test:ai
```

## Voice Processing Extension

Workflow `60-voice-message-processing.json` handles WhatsApp audio/voice messages before the customer-service AI agent path.

Required behavior:

- Get WhatsApp media URL through the WhatsApp Cloud API credential.
- Validate the download URL is HTTPS and belongs to trusted Meta media hosts.
- Download audio with `WHATSAPP_ACCESS_TOKEN` from n8n variables or credentials only.
- Validate MIME type and `WHATSAPP_AUDIO_MAX_BYTES`.
- Use temporary binary storage only.
- Drop binary audio before returning a workflow result.
- Transcribe with `OPENAI_TRANSCRIPTION_MODEL`.
- Preserve language when supplied and allow auto-detected Arabic, English, Urdu, Hindi, Tagalog, and mixed speech.
- Return `routeToWorkflow01: true` and a text-equivalent `normalizedMessage` when transcription is clear.
- Return `AUDIO_TRANSCRIPTION_UNCLEAR_OR_INVALID` with empty `normalizedText` when audio is unclear or invalid.
- Do not fabricate unclear audio content.

Workflow `01-whatsapp-customer-service-router.json` routes the Audio branch through Workflow 60 using `N8N_WF_VOICE_PROCESSING_ID`, then sends the normalized text back through the same duplicate-check, identity, memory, AI-agent, response, and save path used for text messages.

## Estimated Node Counts

| Workflow Group | Estimated Nodes |
| --- | ---: |
| Main Router | 20 |
| Idempotency | 6 |
| Phone Normalization | 5 |
| POS Identity | 8 |
| Conversation Memory | 9-10 |
| AI Agent | 12-16 |
| Order Tracking | 10 |
| Pickup | 14 |
| Area Resolver | 8 |
| Driver Dispatch | 14 |
| Driver Notification | 7 |
| Driver Status and Timeout | 18-22 combined |
| Complaint Management | 15 |
| Complaint Follow-up and Close | 18-22 combined |
| Human Handoff | 10 |
| Human Reply Return | 8-10 |
| Voice Processing | 9 |
| WhatsApp Sender | 9 |
| Conversation Save | 8 |
| Error Handler | 10 |
| Retry Queue | 8-10 |

Full system estimate: approximately 190-220 nodes across modular workflows.

Recommended MVP: approximately 90-105 nodes across 10 workflows.

When business logic is moved to `service.inandoutuae.com`, the actual n8n node count can be reduced substantially.
