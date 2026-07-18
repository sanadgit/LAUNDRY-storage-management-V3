# n8n Deployment Checklist

Use this checklist before enabling any workflow in production.

## Pre-Deployment

- Run `npm run generate:n8n-workflows`.
- Run `npm run validate:n8n-workflows`.
- Run `npm run validate:n8n-strict`.
- Run package validators for the workflows being imported.
- Run `npm run test:ai`.
- Confirm no real secrets or production phone numbers exist in exports.
- Confirm `SERVICE_API_BASE_URL` is explicitly configured for the target environment.
- Confirm all `N8N_WF_*` variables point to imported workflow IDs.
- Confirm WhatsApp webhook verification works in staging.
- Confirm `wamid` idempotency works.
- Confirm OpenAI and WhatsApp credentials are stored in n8n credentials or environment variables.

## Production Safety

- Do not edit production workflow logic directly without exporting and validating.
- Do not modify production customer/POS data during tests.
- Keep router disabled until sub-workflows are active.
- Monitor central error handler and retry queue after activation.
- Keep backups of imported workflow JSON and n8n credentials metadata.

## Rollback

- Disable the router workflow first.
- Keep sub-workflows active only if they are used by other safe routes.
- Restore the previous workflow export from version control or n8n history.
- Review `notification_logs`, `ai_tool_calls`, and error logs for partial actions.
