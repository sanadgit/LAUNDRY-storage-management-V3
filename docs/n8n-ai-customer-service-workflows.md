# In & Out Laundry AI Customer Service n8n Workflows

Deployment target: `https://service.inandoutuae.com`

Existing services that must not be interrupted:

- `https://inandoutuae.com`
- `https://inandoutuae.com/smart-storage-hub`
- `https://n8n.inandoutuae.com`

## Architecture

The n8n architecture is modular by design.

Use one main router workflow plus focused reusable sub-workflows. n8n orchestrates, while `service.inandoutuae.com` owns the sensitive business logic:

- WhatsApp webhook verification and `wamid` idempotency.
- OpenAI Responses API, structured outputs, and guardrails.
- POS-backed customer identity and order truth.
- Conversation memory and summaries.
- Pickup creation and driver dispatch.
- Complaint lifecycle and human escalation.
- WhatsApp notification logging.
- Retry and central error handling.

Do not put POS login, OpenAI calls, WhatsApp tokens, service prices, branch coverage, or customer identity decisions directly inside workflow JSON.

## Shared Contracts

All sub-workflows should accept this shared input envelope. Workflow-specific data belongs inside `payload`.

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

All sub-workflows should return this shared output envelope at the workflow boundary.

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

## MVP Package

Build and import these workflows first for the WhatsApp text order-status MVP:

- `01-whatsapp-customer-service-router.json`
- `02-message-idempotency-check.json`
- `03-uae-phone-normalization.json`
- `04-pos-customer-identity.json`
- `05-conversation-memory-manager.json`
- `06-ai-customer-service-agent.json`
- `10-order-tracking.json`
- `70-whatsapp-response-sender.json`
- `80-save-conversation-summary.json`
- `90-central-error-handler.json`

MVP flow:

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

The exact MVP specification is maintained in `docs/N8N_WORKFLOWS_IMPLEMENTATION_SPEC.md`.

## Pickup and Driver Package

After the order-tracking MVP is stable, import and validate the pickup/driver package:

- `20-create-pickup-request.json`
- `21-uae-area-branch-resolver.json`
- `30-driver-dispatch.json`
- `31-driver-whatsapp-notification.json`
- `32-driver-status-update.json`
- `33-driver-timeout-reassignment.json`

The package specification is maintained in `docs/N8N_PICKUP_DRIVER_WORKFLOWS_SPEC.md`.

Run `npm run validate:n8n-pickup-driver` before importing into staging.

## Complaint and Handoff Package

After pickup and driver workflows are stable, import and validate the complaint/handoff package:

- `40-complaint-management.json`
- `41-notify-branch-manager.json`
- `42-complaint-follow-up.json`
- `43-close-complaint.json`
- `50-human-handoff.json`
- `51-human-reply-return.json`

The package specification is maintained in `docs/N8N_COMPLAINT_HANDOFF_WORKFLOWS_SPEC.md`.

Run `npm run validate:n8n-complaint-handoff` before importing into staging.

## Workflow Files

The required exports under `workflows/` are:

- `01-whatsapp-customer-service-router.json`
- `02-message-idempotency-check.json`
- `03-uae-phone-normalization.json`
- `04-pos-customer-identity.json`
- `05-conversation-memory-manager.json`
- `06-ai-customer-service-agent.json`
- `10-order-tracking.json`
- `20-create-pickup-request.json`
- `21-uae-area-branch-resolver.json`
- `30-driver-dispatch.json`
- `31-driver-whatsapp-notification.json`
- `32-driver-status-update.json`
- `33-driver-timeout-reassignment.json`
- `40-complaint-management.json`
- `41-notify-branch-manager.json`
- `42-complaint-follow-up.json`
- `43-close-complaint.json`
- `50-human-handoff.json`
- `51-human-reply-return.json`
- `60-voice-message-processing.json`
- `70-whatsapp-response-sender.json`
- `80-save-conversation-summary.json`
- `90-central-error-handler.json`
- `91-retry-queue.json`

## Required n8n Variables

Set these in n8n after importing workflows:

```env
SERVICE_API_BASE_URL=https://service.inandoutuae.com/api/v1
SERVICE_API_TOKEN=replace_with_backend_shared_key
N8N_API_KEY=replace_with_backend_shared_key
WHATSAPP_PHONE_NUMBER_ID=replace_with_meta_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=replace_with_meta_business_account_id
WHATSAPP_ACCESS_TOKEN=replace_with_n8n_credential_or_secret
WHATSAPP_VERIFY_TOKEN=replace_with_webhook_verify_token
OPENAI_API_KEY=replace_with_n8n_credential_or_secret
N8N_ENCRYPTION_KEY=replace_with_generated_secret
DATABASE_URL=replace_with_database_url
REDIS_URL=replace_with_redis_url
OPERATIONS_ALERT_PHONE=replace_with_single_operations_whatsapp_number
DEFAULT_TIMEZONE=Asia/Dubai
N8N_WF_IDEMPOTENCY_CHECK_ID=replace_after_import
N8N_WF_RESPONSE_SENDER_ID=replace_after_import
N8N_WF_VOICE_PROCESSING_ID=replace_after_import
N8N_WF_ERROR_HANDLER_ID=replace_after_import
```

Additional workflow IDs can be added as the router is expanded:

```env
N8N_WF_PHONE_NORMALIZATION_ID=replace_after_import
N8N_WF_CUSTOMER_IDENTITY_ID=replace_after_import
N8N_WF_MEMORY_MANAGER_ID=replace_after_import
N8N_WF_AI_AGENT_ID=replace_after_import
N8N_WF_ORDER_TRACKING_ID=replace_after_import
N8N_WF_PICKUP_REQUEST_ID=replace_after_import
N8N_WF_AREA_BRANCH_RESOLVER_ID=replace_after_import
N8N_WF_DRIVER_DISPATCH_ID=replace_after_import
N8N_WF_DRIVER_NOTIFICATION_ID=replace_after_import
N8N_WF_DRIVER_REASSIGNMENT_ID=replace_after_import
N8N_WF_NOTIFY_BRANCH_MANAGER_ID=replace_after_import
N8N_WF_COMPLAINT_ID=replace_after_import
N8N_WF_HUMAN_HANDOFF_ID=replace_after_import
N8N_WF_SAVE_SUMMARY_ID=replace_after_import
N8N_WF_RETRY_QUEUE_ID=replace_after_import
OPENAI_CHAT_MODEL=gpt-4.1-mini
```

Workflow `01-whatsapp-customer-service-router.json` contains 20 operational nodes matching the router specification, plus one sticky note contract node required by the project workflow standards.

Workflow `02-message-idempotency-check.json` contains 6 operational nodes:

- `Workflow Input`
- `Extract WhatsApp Message ID`
- `Find Processed Event`
- `Message Already Exists?`
- `Return Duplicate Result`
- `Register Processing Lock`

It uses the proposed service API contract:

- `GET /api/v1/webhook-events/:messageId`
- `POST /api/v1/webhook-events/lock`

Workflow `03-uae-phone-normalization.json` contains 5 operational nodes:

- `Workflow Input`
- `Clean Phone Characters`
- `Convert UAE Format`
- `Validate Phone Number`
- `Return Normalized Phone`

It supports safe sample formats such as `0500000000`, `+971500000000`, `00971500000000`, `971500000000`, `050 000 0000`, and `050-000-0000`, returning status values `VALID`, `INVALID`, `UNSUPPORTED_COUNTRY`, or `INCOMPLETE`.

Workflow `04-pos-customer-identity.json` contains 8 operational nodes:

- `Workflow Input`
- `Prepare Phone Variants`
- `Find Customer in POS`
- `POS Request Successful?`
- `Check Customer Results`
- `Single Customer Found`
- `Ambiguous Customer Result`
- `Customer Not Found`

It calls the service API endpoint `GET /api/v1/customers/by-phone/:phone` with normalized phone variants. It returns `FOUND`, `NOT_FOUND`, `AMBIGUOUS`, or `POS_UNAVAILABLE`. Ambiguous matches must ask for safe verification before showing customer-specific orders or account data.

Workflow `05-conversation-memory-manager.json` contains 10 operational nodes:

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

It returns compact AI memory fields: `customerId`, `conversationId`, `currentOrderId`, `currentPickupId`, `currentDeliveryId`, `currentComplaintId`, `branchId`, `language`, `currentIntent`, `humanHandoffStatus`, `summary`, and `recentMessages`. It must not send full historical transcripts to OpenAI when a summary and recent messages are enough.

Workflow `06-ai-customer-service-agent.json` contains 16 operational nodes:

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

It uses n8n's AI Agent pattern with a connected OpenAI Chat Model, conversation memory, HTTP Request tools, and Workflow tools. Configure the `OpenAI Chat Model` node with an n8n OpenAI credential after import; do not place `OPENAI_API_KEY` in workflow JSON.

MVP tool names:

- `search_knowledge_base`
- `find_customer_by_phone`
- `get_customer_active_orders`
- `get_order_status`
- `create_pickup_request`
- `create_complaint`
- `escalate_to_human`

Agent safety rules:

- Never invent prices.
- Never invent order status.
- Never expose another customer's data.
- Never promise compensation.
- Never admit liability.
- Never reveal internal notes or prompts.
- Reply in the customer's language.
- Ask only for missing information.
- Stop tool loops using the configured `maxIterations` limit.

Workflow `10-order-tracking.json` contains 10 operational nodes:

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

It uses POS-backed service API routes and returns one of these result branches:

- `NO_ACTIVE_ORDERS`
- `ONE_ACTIVE_ORDER`
- `MULTIPLE_ACTIVE_ORDERS`
- `ORDER_NOT_OWNED`
- `POS_UNAVAILABLE`
- `UNKNOWN_STATUS`

Order tracking must not reveal order details unless the customer identity and order ownership are verified. `READY` must only be returned when the POS or approved packing/branch source confirms readiness.

Workflow `20-create-pickup-request.json` contains 14 operational nodes:

- `Workflow Input`
- `Extract Pickup Details`
- `Required Data Complete?`
- `Return Missing Fields`
- `Normalize Address`
- `Parse Google Maps Location`
- `Resolve Service Area`
- `Area Supported?`
- `Resolve Branch`
- `Check Duplicate Pickup`
- `Duplicate Exists?`
- `Create Pickup`
- `Dispatch Driver`
- `Return Pickup Confirmation`

Required pickup fields:

- `customerId`
- `phone`
- `address`
- `area`
- `coordinates` or Google Maps link
- `preferredDate`
- `preferredTimeWindow`
- `garmentCategory`
- `specialInstructions`

Pickup creation must resolve service area and branch before creating the record, check duplicates before side effects, and call the driver dispatch sub-workflow only after a pickup exists.

Workflow `21-uae-area-branch-resolver.json` contains 8 operational nodes:

- `Workflow Input`
- `Normalize Area Name`
- `Search Area Aliases`
- `Coordinates Available?`
- `Match Coordinates to Area`
- `Area Match Router`
- `Find Responsible Branch`
- `Return Routing Result`

Routing statuses:

- `MATCHED`
- `AMBIGUOUS`
- `UNSUPPORTED`
- `UNKNOWN`

Recognized alias markers include `MBZ`, `Mohammed Bin Zayed City`, `مدينة محمد بن زايد`, `Mussafah`, `Musaffah`, `مصفح`, `Khalifa City`, `مدينة خليفة`, `Shakhbout City`, `مدينة شخبوط`, `Riyadh City`, `مدينة الرياض`, `Al Falah`, and `الفلاح`. These are matching hints only; actual service coverage and branch ownership must come from configured API data.

Workflow `30-driver-dispatch.json` contains 14 operational nodes:

- `Workflow Input`
- `Load Pickup Details`
- `Get Available Drivers`
- `Drivers Available?`
- `Filter Branch Drivers`
- `Filter Service Area`
- `Filter Active Shift`
- `Calculate Driver Score`
- `Sort Driver Candidates`
- `Create Assignment`
- `Notify Driver`
- `Wait for Acceptance`
- `Driver Accepted?`
- `Reassign or Escalate`

Driver statuses:

- `AVAILABLE`
- `BUSY`
- `OFF_SHIFT`
- `UNAVAILABLE`

Assignment statuses:

- `PENDING`
- `ASSIGNED`
- `ACCEPTED`
- `ON_THE_WAY`
- `ARRIVED`
- `COMPLETED`
- `REJECTED`
- `TIMED_OUT`
- `CANCELLED`
- `FAILED`

Driver dispatch must filter by branch, service area, active shift, workload, and distance. If no eligible driver is available, it must escalate rather than assign randomly.

Workflow `31-driver-whatsapp-notification.json` contains 7 operational nodes:

- `Workflow Input`
- `Load Safe Task Data`
- `Prepare Driver Message`
- `Validate Driver Phone`
- `Send Driver WhatsApp`
- `Save Notification Result`
- `Return Send Result`

Safe driver notification data:

- `taskType`
- `customerDisplayName`
- `area`
- `address`
- `location`
- `timeWindow`
- `taskReference`
- `acceptAction`
- `rejectAction`

WhatsApp Cloud API sends must use one recipient per request. Do not put multiple phone numbers in `to`, do not send to groups, and log failed sends through notification records.

Workflow `32-driver-status-update.json` contains 11 operational nodes:

- `Workflow Input`
- `Validate Assignment`
- `Validate Driver Identity`
- `Parse Driver Action`
- `Status Router`
- `Update Assignment Status`
- `Update Driver Status`
- `Notify Operations if Needed`
- `Notify Customer if Allowed`
- `Save Audit Event`
- `Return Result`

Driver status updates must verify the assignment and driver identity before any write. The workflow maps driver actions such as accept, reject, on the way, arrived, picked up, delivered, cancelled, customer unavailable, and failed into controlled assignment statuses.

Allowed update statuses:

- `ASSIGNED`
- `ACCEPTED`
- `ON_THE_WAY`
- `ARRIVED`
- `COMPLETED`
- `REJECTED`
- `TIMED_OUT`
- `CANCELLED`
- `FAILED`

Customer notifications are allowed only for confirmed operational statuses such as `ACCEPTED`, `ON_THE_WAY`, `ARRIVED`, and `COMPLETED`. Exceptions such as `REJECTED`, `CANCELLED`, and `FAILED` notify operations instead and must be audit logged.

Workflow `33-driver-timeout-reassignment.json` contains 11 operational nodes:

- `Workflow Input`
- `Load Assignment`
- `Assignment Still Pending?`
- `Mark Timed Out`
- `Load Next Candidate`
- `Candidate Available?`
- `Create New Assignment`
- `Notify New Driver`
- `No Candidate Escalation`
- `Save Audit Event`
- `Return Result`

Timeout reassignment must only mark assignments as `TIMED_OUT` when the current status is still `PENDING` or `ASSIGNED`. If another eligible driver exists, create a new `PENDING` assignment and notify that driver. If no candidate exists, escalate to the branch manager instead of assigning randomly.

Workflow `40-complaint-management.json` contains 15 operational nodes:

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

Complaint categories:

- `DELAY`
- `CLEANING_QUALITY`
- `DAMAGE`
- `LOST_ITEM`
- `MISSING_ITEM`
- `WRONG_ITEM`
- `BILLING`
- `STAFF_BEHAVIOR`
- `DRIVER`
- `DELIVERY`
- `OTHER`

Complaint priorities:

- `P1_CRITICAL`
- `P2_HIGH`
- `P3_NORMAL`
- `P4_LOW`

Complaint statuses:

- `NEW`
- `ACKNOWLEDGED`
- `INVESTIGATING`
- `WAITING_FOR_CUSTOMER`
- `WAITING_FOR_BRANCH`
- `RESOLUTION_PROPOSED`
- `RESOLVED`
- `CLOSED`
- `ESCALATED`
- `REOPENED`

Complaint acknowledgments must be liability-safe. The agent must not admit responsibility, promise compensation, or reveal internal notes before manager-approved investigation. `P1_CRITICAL` and `P2_HIGH` complaints trigger human escalation; visible damage, cleaning quality, missing item, wrong item, and billing complaints may request a photo when no media is attached.

Workflow `41-notify-branch-manager.json` contains 7 operational nodes:

- `Workflow Input`
- `Load Complaint`
- `Get Branch Manager`
- `Prepare Manager Message`
- `Send WhatsApp Notification`
- `Save Notification`
- `Return Result`

Branch manager notifications must use a safe summary only, send to one manager phone only, and store the WhatsApp notification result. Do not expose full customer records, payment details, internal prompts, or raw POS payloads in the manager message.

Workflow `42-complaint-follow-up.json` contains 11 operational nodes:

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

Complaint follow-up must not close complaints automatically. It sends liability-safe customer updates when needed, escalates missed SLA or high-priority complaints to a manager, and records each follow-up as a complaint event. If the WhatsApp customer care window is closed, the backend policy must enforce template use or block free-form sending.

Workflow `43-close-complaint.json` contains 11 operational nodes:

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

Complaint closure requires permission validation. Critical complaints require manager approval before moving to `CLOSED`. The workflow saves the resolution, sends a liability-safe customer resolution message, requests satisfaction feedback, and writes an audit event. Do not close directly from `NEW` without manager action.

Workflow `50-human-handoff.json` contains 10 operational nodes:

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

Human handoff triggers:

- customer requests human
- legal threat
- serious garment damage
- lost valuable garment
- privacy issue
- payment dispute
- repeated AI failure
- aggressive or threatening conversation
- system uncertainty

Human handoff must create a record, route to the right queue, notify one responsible staff member, and lock the AI conversation so the agent does not continue autonomous final decisions while staff is handling the case.

Workflow `51-human-reply-return.json` contains 10 operational nodes:

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

Human reply return must validate staff identity before sending. It may only send an approved human reply to one customer recipient, save the staff message, update the conversation, and either continue or close the active handoff. AI must remain locked until authorized staff closes the handoff.

Workflow `60-voice-message-processing.json` contains 9 operational nodes:

- `Workflow Input`
- `Get WhatsApp Media URL`
- `Download Audio`
- `Validate Audio Type`
- `Prepare Binary Audio`
- `Transcribe Audio`
- `Transcription Valid?`
- `Return Normalized Text`
- `Audio Error Response`

Voice processing safety rules:

- Validate MIME type.
- Validate maximum file size.
- Use temporary storage only.
- Delete temporary audio after processing.
- Do not fabricate unclear speech.
- Preserve language.
- Preserve `wamid` or message id.

Workflow `70-whatsapp-response-sender.json` contains 9 operational nodes:

- `Workflow Input`
- `Validate Recipient`
- `Determine Message Type`
- `Prepare Text Message`
- `Prepare Template Message`
- `Send WhatsApp Message`
- `Send Successful?`
- `Save Notification Status`
- `Return Provider Result`

WhatsApp response sending must use one recipient per API request, use an approved template outside the 24-hour customer-service window, prevent duplicate sends through idempotency and notification logs, store the provider message ID, and handle rate limits or timeouts as failed/queued notification states.

Workflow `80-save-conversation-summary.json` contains 8 operational nodes:

- `Workflow Input`
- `Redact Sensitive Data`
- `Save Customer Message`
- `Save Agent Response`
- `Save Tool Calls`
- `Summary Needed?`
- `Generate Summary`
- `Update Conversation`

Conversation saving must redact secrets, payment-like numbers, tokens, cookies, and unnecessary full phone numbers before persistence. It saves the customer message, agent response, and tool calls separately so debugging can trace `correlationId`, `wamid`, `conversationId`, `customerId`, `orderId`, and tool call IDs without storing unsafe raw transcripts forever. Generate a new summary only when the input explicitly requests it or message volume passes the configured threshold.

Workflow `90-central-error-handler.json` contains 10 operational nodes:

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

Error categories:

- `TEMPORARY_API_FAILURE`
- `PERMANENT_VALIDATION_FAILURE`
- `AUTHENTICATION_FAILURE`
- `RATE_LIMIT`
- `POS_UNAVAILABLE`
- `OPENAI_UNAVAILABLE`
- `WHATSAPP_UNAVAILABLE`
- `DATABASE_UNAVAILABLE`
- `WORKFLOW_LOGIC_FAILURE`
- `CUSTOMER_INPUT_ERROR`

The central error handler must redact secrets before logging or alerting. Temporary and idempotent failures can be queued for retry; permanent validation, authentication, and unsafe write failures must not be blindly retried. Operations alerts must include only a safe summary, workflow name, failed node, category, execution id, and correlation id.

Workflow `91-retry-queue.json` contains 11 operational nodes:

- `Workflow Input`
- `Load Retry Record`
- `Retry Limit Reached?`
- `Calculate Backoff`
- `Wait`
- `Execute Original Action`
- `Retry Successful?`
- `Mark Completed`
- `Increment Retry Count`
- `Escalate Permanent Failure`
- `Return Result`

Retry queue rules:

- Retry only idempotent actions with an idempotency key.
- Use exponential backoff.
- Cap maximum attempts.
- Mark successful retries as completed.
- Increment failed retry attempts with the last error code.
- Move exhausted or permanent failures to the dead-letter queue.
- Never retry authorization, validation, payment, or unsafe POS writes blindly.

Never store real OpenAI, WhatsApp, POS, database, Supabase, or n8n credentials inside exported workflow JSON.

## Import Order

1. Import sub-workflows first: `02` through `91`.
2. Copy generated n8n workflow IDs into the matching `N8N_WF_*` variables.
3. Import `01-whatsapp-customer-service-router.json`.
4. Configure Meta WhatsApp Cloud API webhook URL:

```text
https://n8n.inandoutuae.com/webhook/inout-ai-whatsapp
```

5. Keep workflows inactive until staging validation is complete.

## Service API Contracts

The workflows currently call approved project-owned service endpoints, including:

- `GET /api/webhooks/whatsapp`
- `GET /api/v1/customers/by-phone/:phone`
- `GET /api/v1/ai/conversations/active`
- `POST /api/v1/ai/conversations`
- `GET /api/v1/ai/conversations/:conversationId/messages/recent`
- `GET /api/v1/ai/conversations/:conversationId/summary`
- `GET /api/v1/ai/conversations/:conversationId/context`
- `POST /api/v1/ai/conversations/:conversationId/summarize`
- `GET /api/v1/ai/customer-service-agent/prompt`
- `GET /api/v1/knowledge-base/search`
- `GET /api/v1/customers/:customerId/orders/active`
- `GET /api/v1/pos/orders/:orderId/status`
- `GET /api/v1/branches/resolve`
- `GET /api/v1/pickups/duplicate`
- `POST /api/v1/pickups`
- `GET /api/v1/service-areas/aliases`
- `GET /api/v1/service-areas/resolve-coordinates`
- `GET /api/v1/pickups/:pickupId/dispatch-details`
- `GET /api/v1/drivers/available`
- `POST /api/v1/dispatch/assignments`
- `GET /api/v1/driver-assignments/:assignmentId/safe-notification-data`
- `GET /api/v1/driver-assignments/:assignmentId`
- `GET /api/v1/driver-assignments/:assignmentId/verify-driver`
- `PATCH /api/v1/driver-assignments/:assignmentId/status`
- `PATCH /api/v1/drivers/:driverId/status`
- `POST /api/v1/operations/dispatch-alerts`
- `POST /api/v1/notifications/customer-dispatch`
- `GET /api/v1/dispatch/assignments/:assignmentId/next-candidate`
- `POST /api/v1/audit/events`
- `GET /api/v1/customers/:customerId/verify`
- `POST /api/v1/ai/complaints/classify`
- `POST /api/v1/complaints`
- `GET /api/v1/complaints/:complaintId/responsible-branch`
- `GET /api/v1/complaints/:complaintId`
- `GET /api/v1/branches/:branchId/manager`
- `GET /api/v1/complaints/follow-up-due`
- `GET /api/v1/complaints/:complaintId/status`
- `POST /api/v1/complaints/:complaintId/events`
- `POST /api/v1/complaints/:complaintId/validate-closure`
- `PATCH /api/v1/complaints/:complaintId/status`
- `POST /api/v1/complaints/:complaintId/resolution`
- `POST /api/v1/complaints/:complaintId/satisfaction-request`
- `GET /api/v1/ai/conversations/:conversationId`
- `POST /api/v1/ai/handoffs/summary`
- `POST /api/v1/human-handoffs`
- `PATCH /api/v1/ai/conversations/:conversationId/lock`
- `POST /api/v1/staff/validate`
- `GET /api/v1/human-handoffs/:handoffId`
- `PATCH /api/v1/human-handoffs/:handoffId/status`
- `POST /api/v1/ai/messages`
- `POST /api/v1/ai/tool-calls/batch`
- `POST /api/v1/ai/conversations/:conversationId/summarize`
- `PATCH /api/v1/ai/conversations/:conversationId`
- `POST /api/v1/observability/errors`
- `GET /api/v1/retry-records/:retryRecordId`
- `POST /api/v1/retry-records/:retryRecordId/execute`
- `PATCH /api/v1/retry-records/:retryRecordId/completed`
- `PATCH /api/v1/retry-records/:retryRecordId/attempts`
- `POST /api/v1/dead-letter`
- `POST /api/v1/notifications/whatsapp`
- `POST /api/ai/router`
- `GET /api/orders/track/:orderId`
- `POST /api/ai/conversations/:id/create-pickup`
- `GET /api/customer/site-config`
- `POST /api/pickups/:id/assign-driver`
- `POST /api/whatsapp/send`
- `PATCH /api/driver-assignments/:id/status`
- `POST /api/ai/conversations/:id/create-complaint`
- `PATCH /api/complaints/:id`
- `PATCH /api/ai/conversations/:id`

If a future backend route uses `/api/v1`, update only the service API endpoint in the workflow, not raw POS endpoints.

## Validation

Generate the required exports:

```bash
npm run generate:n8n-workflows
```

Validate all workflow JSON exports:

```bash
npm run validate:n8n-workflows
```

Validate the MVP package and safe test payloads:

```bash
npm run validate:n8n-mvp
```

The validator checks:

- Valid JSON.
- Unique workflow and node names.
- Connection sources and targets.
- Sticky note contracts.
- `correlationId` propagation markers.
- Obvious embedded secret patterns.
- Accidental raw POS endpoint usage.

## Production Safety

These files are exports only. They do not deploy or activate production workflows.

Before production activation:

- Test in staging n8n first.
- Use fake WhatsApp payloads and non-production backend data.
- Confirm `wamid` duplicate handling.
- Confirm phone mismatch does not reveal order details.
- Confirm driver assignment is idempotent.
- Confirm complaint wording avoids liability admission.
- Confirm WhatsApp sends use one recipient per request.
