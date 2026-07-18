# n8n Workflow Review

Review date: 2026-07-18

Scope: all JSON exports under `workflows/`.

Review role: senior automation engineer.

## Summary

The exported workflow package contains 24 workflow JSON files. Static validation confirms valid JSON, workflow names, node arrays, connections, documented Execute Workflow references, documented environment variables, no embedded secrets, no production phone numbers, no empty HTTP URLs, and no workflow cycles.

## Critical Findings

None confirmed.

## High Findings

### Fixed: Production Service API Fallback In Workflow Exports

Finding: HTTP helper expressions previously included a fallback to `https://service.inandoutuae.com` when `SERVICE_API_BASE_URL` was missing. In staging or local n8n, a missing variable could have routed test executions to production.

Risk: accidental production API calls from staging or local imports.

Fix: removed the production fallback from the workflow generator. Workflows now use `MISSING_SERVICE_API_BASE_URL` when `SERVICE_API_BASE_URL` is not configured, causing safe failure instead of production traffic.

Validation:

- `Select-String -Path workflows\*.json -Pattern "https://service.inandoutuae.com"` returned no matches.
- `npm run validate:n8n-strict` passed.

### Fixed: Voice Branch Did Not Explicitly Re-enter Router Text Path

Finding: Workflow 60 existed, but Workflow 01 did not explicitly route the Audio branch through Workflow 60 and then back into the normal text-equivalent processing path.

Risk: audio messages could be normalized as generic `[audio message]`, reducing AI understanding and making unclear speech handling weaker.

Fix: added `Process Voice Message` in Workflow 01 and routed the Audio branch through `N8N_WF_VOICE_PROCESSING_ID`, then back to `Normalize WhatsApp Message`. Workflow 60 now returns `routeToWorkflow01` and a text-equivalent `normalizedMessage`.

Validation:

- Workflow 01 includes `Process Voice Message`.
- Workflow 60 includes `routeToWorkflow01` and `normalizedMessage`.
- Mocked voice transcription tests pass.

## Medium Findings

### Service API Endpoint Contracts Must Be Implemented And Mocked

Finding: Workflows depend on internal service API routes for POS, identity, memory, dispatch, complaints, notifications, errors, and retry handling.

Risk: import can succeed while runtime calls fail if backend endpoints are incomplete.

Mitigation: dependencies are documented in `N8N_WORKFLOW_DEPENDENCIES.md`, package docs, and validation scripts. Staging mocks are required before activation.

### Sub-workflow Error Handling Relies On HTTP `neverError` And Central Router Handling

Finding: many HTTP Request nodes use timeout and `neverError`, but not every sub-workflow has a dedicated local error branch to Workflow 90.

Risk: some business errors may be returned as safe failure envelopes rather than routed centrally.

Mitigation: central error handling exists, all HTTP calls include timeouts, and workflow-specific docs require staging review. This remains a runtime design decision, not a blocking export defect.

### n8n Node Type Compatibility Requires Target Instance Smoke Test

Finding: exports use n8n nodes such as WhatsApp, OpenAI, Execute Workflow, Wait, Loop, and Error Trigger.

Risk: node type/version availability can differ by n8n installation version.

Mitigation: import guide requires staging import and credential setup before activation.

## Low Findings

### Documentation Contains Production Domain As Deployment Target

Finding: documentation and `.env.example` include `https://service.inandoutuae.com` as the intended deployment target or example value.

Risk: low, because workflow exports no longer hardcode the production fallback.

Mitigation: deployment checklist requires explicit `SERVICE_API_BASE_URL` per environment.

## Review Checklist

- Correct node types: checked by static inspection and validator.
- Correct node connections: checked by validator against node names and cycle detection.
- Missing branches: critical branches documented; audio branch fixed.
- Credential leakage: no embedded secret patterns detected.
- Duplicate message risk: idempotency workflow and router duplicate branch present.
- Duplicate send risk: response sender uses idempotency and notification logging markers.
- Missing correlation IDs: shared contract markers and validators check `correlationId`.
- Missing timeout handling: HTTP nodes checked for timeout warnings.
- Missing error routes: central error handler exists; sub-workflow local routing is a medium follow-up.
- Unsafe customer data exposure: ownership checks exist for POS order and complaints.
- Incorrect ownership validation: order and complaint ownership nodes present.
- Workflow cycles: none detected.
- Broken Execute Workflow references: none detected; all `N8N_WF_*` references documented.
- Invalid JSON: none detected.
- Hardcoded production URLs or phone numbers: production URL fallback removed from workflow exports; no production phone numbers detected.
- Missing documentation: required n8n docs created.

## Final Validation Evidence

Commands run:

```bash
npm run generate:n8n-workflows
npm run validate:n8n-workflows
npm run validate:n8n-strict
npm run test:ai
```

Results:

- 24 workflow exports generated.
- 24 workflow exports validated by the base validator.
- 24 workflow exports, 16 Execute Workflow references, and 30 environment variables validated by strict validator.
- 16 AI and mocked workflow tests passed.
