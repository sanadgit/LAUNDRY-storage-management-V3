# n8n Workflow Dependencies

This document lists workflow-to-workflow dependencies and environment variables used by exported n8n workflows.

## Execute Workflow Variables

- `N8N_WF_IDEMPOTENCY_CHECK_ID`: Workflow 02.
- `N8N_WF_PHONE_NORMALIZATION_ID`: Workflow 03.
- `N8N_WF_CUSTOMER_IDENTITY_ID`: Workflow 04.
- `N8N_WF_MEMORY_MANAGER_ID`: Workflow 05.
- `N8N_WF_AI_AGENT_ID`: Workflow 06.
- `N8N_WF_ORDER_TRACKING_ID`: Workflow 10.
- `N8N_WF_PICKUP_REQUEST_ID`: Workflow 20.
- `N8N_WF_AREA_BRANCH_RESOLVER_ID`: Workflow 21.
- `N8N_WF_DRIVER_DISPATCH_ID`: Workflow 30.
- `N8N_WF_DRIVER_NOTIFICATION_ID`: Workflow 31.
- `N8N_WF_DRIVER_REASSIGNMENT_ID`: Workflow 33.
- `N8N_WF_COMPLAINT_ID`: Workflow 40.
- `N8N_WF_NOTIFY_BRANCH_MANAGER_ID`: Workflow 41.
- `N8N_WF_HUMAN_HANDOFF_ID`: Workflow 50.
- `N8N_WF_VOICE_PROCESSING_ID`: Workflow 60.
- `N8N_WF_RESPONSE_SENDER_ID`: Workflow 70.
- `N8N_WF_SAVE_SUMMARY_ID`: Workflow 80.
- `N8N_WF_ERROR_HANDLER_ID`: Workflow 90.
- `N8N_WF_RETRY_QUEUE_ID`: Workflow 91.

## Router Dependencies

Workflow 01 calls:

- Workflow 02 for idempotency.
- Workflow 03 for UAE phone normalization.
- Workflow 04 for POS-backed identity resolution.
- Workflow 05 for conversation memory.
- Workflow 06 for AI customer-service response.
- Workflow 60 for WhatsApp voice/audio transcription.
- Workflow 70 for WhatsApp outbound replies.
- Workflow 80 for conversation persistence and summaries.
- Workflow 90 for central errors.

## Other Environment Variables

- `SERVICE_API_BASE_URL`
- `SERVICE_API_TOKEN`
- `N8N_WHATSAPP_WEBHOOK_URL`
- `N8N_WHATSAPP_FORWARD_TIMEOUT_MS`
- `N8N_API_KEY`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_BUSINESS_ACCOUNT_ID`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_VERIFY_TOKEN`
- `WHATSAPP_AUDIO_MAX_BYTES`
- `OPENAI_API_KEY`
- `OPENAI_CHAT_MODEL`
- `OPENAI_TRANSCRIPTION_MODEL`
- `N8N_ENCRYPTION_KEY`
- `DATABASE_URL`
- `REDIS_URL`
- `OPERATIONS_ALERT_PHONE`
- `DEFAULT_TIMEZONE`
- `CONVERSATION_SUMMARY_MESSAGE_THRESHOLD`
- `N8N_RETRY_MAX_ATTEMPTS`
- `N8N_RETRY_BASE_MS`
- `N8N_RETRY_MAX_BACKOFF_MS`
