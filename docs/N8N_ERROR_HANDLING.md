# n8n Error Handling

Workflow `90-central-error-handler.json` is the central error workflow.

## Error Categories

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

## Required Behavior

- Preserve `correlationId`.
- Redact tokens, API keys, passwords, and raw customer data.
- Save structured error logs through `SERVICE_API_BASE_URL`.
- Retry only when `Retry Allowed?` confirms the error is temporary.
- Send one operations alert recipient only through `OPERATIONS_ALERT_PHONE`.
- Use `N8N_WF_RETRY_QUEUE_ID` for retry routing.
- Use safe customer-facing fallback messages only.

## Voice Errors

Workflow 60 must return `AUDIO_TRANSCRIPTION_UNCLEAR_OR_INVALID` for invalid MIME, oversized audio, untrusted media URL, missing binary audio, or unclear transcription.

It must not invent text for unclear audio. It should ask the customer to resend the message as text or send a clearer voice note.
