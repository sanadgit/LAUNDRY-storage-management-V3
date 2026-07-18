# n8n Test Payloads

All payloads are safe fixtures and must keep `payload.isSampleData` set to `true`.

## Directories

- `test-payloads/n8n-mvp/`
- `test-payloads/n8n-pickup-driver/`
- `test-payloads/n8n-complaint-handoff/`
- `test-payloads/n8n-voice/`

## Voice Payloads

- `60-voice-message-processing-clear.json`: supported MIME, clear mocked Arabic transcription.
- `60-voice-message-processing-unsupported-mime.json`: invalid MIME must stop before transcription.
- `60-voice-message-processing-unclear.json`: unclear transcription must not fabricate text.

## Commands

```bash
npm run validate:n8n-workflows
npm run validate:n8n-strict
npm run validate:n8n-mvp
npm run validate:n8n-pickup-driver
npm run validate:n8n-complaint-handoff
npm run test:ai
```

## Rules

- Use `971500000000` only as a sample phone.
- Do not use live driver, manager, customer, or branch phone numbers.
- Do not include real WhatsApp `wamid`, media URLs, order IDs, complaint details, addresses, or tokens.
- Mock WhatsApp, POS, OpenAI, and service API behavior during tests.
