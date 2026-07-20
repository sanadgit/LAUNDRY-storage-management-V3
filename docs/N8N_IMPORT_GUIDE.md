# n8n Import Guide

Use this guide to import the In & Out Laundry AI Customer Service workflow exports into n8n safely.

## Order

Import sub-workflows before router workflows:

1. `02-message-idempotency-check.json`
2. `03-uae-phone-normalization.json`
3. `04-pos-customer-identity.json`
4. `05-conversation-memory-manager.json`
5. `06-ai-customer-service-agent.json`
6. `10-order-tracking.json`
7. `20-create-pickup-request.json`
8. `21-uae-area-branch-resolver.json`
9. `30-driver-dispatch.json`
10. `31-driver-whatsapp-notification.json`
11. `32-driver-status-update.json`
12. `33-driver-timeout-reassignment.json`
13. `40-complaint-management.json`
14. `41-notify-branch-manager.json`
15. `42-complaint-follow-up.json`
16. `43-close-complaint.json`
17. `50-human-handoff.json`
18. `51-human-reply-return.json`
19. `60-voice-message-processing.json`
20. `70-whatsapp-response-sender.json`
21. `80-save-conversation-summary.json`
22. `90-central-error-handler.json`
23. `91-retry-queue.json`
24. `01-whatsapp-customer-service-router.json`

## Steps

1. Run `npm run generate:n8n-workflows`.
2. Run `npm run n8n:apply-local-config` when the n8n plan does not support Variables.
3. Run `npm run validate:n8n-workflows`.
4. Run `npm run validate:n8n-strict`.
5. Import JSON exports from `workflows/`.
6. Create n8n credentials for WhatsApp Cloud API and OpenAI.
7. Open the `Workflow Config` node in every imported workflow and replace the `PASTE_*_HERE` placeholders.
8. Copy each imported workflow id into the matching `N8N_WF_*` field inside `Workflow Config`.
9. Keep all workflows inactive until staging credentials are configured.
10. Activate sub-workflows first, then the router.
11. Test with payloads under `test-payloads/`.

## No Variables Plan

If n8n Variables are not available, use the generated `Workflow Config` node instead.

Each workflow contains:

- `Workflow Config`: local editable placeholders for service URL, service token, workflow IDs, retry settings, model names, and phone-number IDs.
- `Remove Config From Item`: removes those config fields from the item payload before business nodes run.

Minimum values for the MVP:

- `SERVICE_API_BASE_URL`: backend URL, for example the staging service API URL.
- `N8N_API_KEY`: same value as backend `SERVICE_API_TOKEN`.
- `N8N_WF_IDEMPOTENCY_CHECK_ID`: imported workflow 02 id.
- `N8N_WF_PHONE_NORMALIZATION_ID`: imported workflow 03 id.
- `N8N_WF_CUSTOMER_IDENTITY_ID`: imported workflow 04 id.
- `N8N_WF_MEMORY_MANAGER_ID`: imported workflow 05 id.
- `N8N_WF_AI_AGENT_ID`: imported workflow 06 id.
- `N8N_WF_ORDER_TRACKING_ID`: imported workflow 10 id.
- `N8N_WF_VOICE_PROCESSING_ID`: imported workflow 60 id.
- `N8N_WF_RESPONSE_SENDER_ID`: imported workflow 70 id.
- `N8N_WF_SAVE_SUMMARY_ID`: imported workflow 80 id.
- `N8N_WF_ERROR_HANDLER_ID`: imported workflow 90 id.

Security note: because local config values live inside n8n workflow nodes, disable or limit saved execution data for these workflows where possible, and do not export/share workflows after entering real secrets.

## Do Not

- Do not import directly into production first.
- Do not paste real API keys into workflow JSON.
- Do not commit exported workflows after entering real tokens into `Workflow Config`.
- Do not activate the WhatsApp router until webhook verification and idempotency are confirmed.
