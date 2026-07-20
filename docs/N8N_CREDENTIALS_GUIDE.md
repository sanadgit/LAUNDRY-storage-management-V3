# n8n Credentials Guide

Prefer n8n credentials, environment variables, or the deployment secret manager. If the n8n plan does not support Variables, use the generated `Workflow Config` node placeholders and do not export/share workflows after entering real values.

## Required Credentials

- WhatsApp Cloud API credential for WhatsApp nodes.
- OpenAI credential for audio transcription and AI-assisted summary/classification nodes.
- Internal service API token exposed to workflows as `N8N_API_KEY`, either through n8n Variables or the local `Workflow Config` node.

## Required Values

- `SERVICE_API_BASE_URL`
- `SERVICE_API_TOKEN`
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

When Variables are unavailable, put workflow-facing values in the `Workflow Config` node instead of `Settings -> Variables`.

Do not put POS credentials in n8n. POS credentials stay only in the backend `.env`.

## Workflow ID Variables

- `N8N_WF_IDEMPOTENCY_CHECK_ID`
- `N8N_WF_PHONE_NORMALIZATION_ID`
- `N8N_WF_CUSTOMER_IDENTITY_ID`
- `N8N_WF_MEMORY_MANAGER_ID`
- `N8N_WF_AI_AGENT_ID`
- `N8N_WF_ORDER_TRACKING_ID`
- `N8N_WF_PICKUP_REQUEST_ID`
- `N8N_WF_AREA_BRANCH_RESOLVER_ID`
- `N8N_WF_DRIVER_DISPATCH_ID`
- `N8N_WF_DRIVER_NOTIFICATION_ID`
- `N8N_WF_DRIVER_REASSIGNMENT_ID`
- `N8N_WF_COMPLAINT_ID`
- `N8N_WF_NOTIFY_BRANCH_MANAGER_ID`
- `N8N_WF_HUMAN_HANDOFF_ID`
- `N8N_WF_VOICE_PROCESSING_ID`
- `N8N_WF_RESPONSE_SENDER_ID`
- `N8N_WF_SAVE_SUMMARY_ID`
- `N8N_WF_ERROR_HANDLER_ID`
- `N8N_WF_RETRY_QUEUE_ID`

## Rotation

Rotate WhatsApp, OpenAI, service API, and n8n API keys after suspected exposure. Re-run validation after any credential or variable change.

## Missing Values

Workflow exports intentionally do not fall back to production URLs when `SERVICE_API_BASE_URL` is missing. Configure this value explicitly in every n8n environment or in the local `Workflow Config` node.
