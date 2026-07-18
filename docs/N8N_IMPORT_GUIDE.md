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
2. Run `npm run validate:n8n-workflows`.
3. Run `npm run validate:n8n-strict`.
4. Import JSON exports from `workflows/`.
5. Create n8n credentials for WhatsApp Cloud API and OpenAI.
6. Copy each imported workflow id into the matching `N8N_WF_*` variable.
7. Keep all workflows inactive until staging credentials are configured.
8. Activate sub-workflows first, then the router.
9. Test with payloads under `test-payloads/`.

## Do Not

- Do not import directly into production first.
- Do not paste real API keys into workflow JSON.
- Do not replace `N8N_WF_*` variables with hardcoded workflow IDs in JSON.
- Do not activate the WhatsApp router until webhook verification and idempotency are confirmed.
