# In & Out Laundry Pickup and Driver Workflows

Deployment target: `https://service.inandoutuae.com`

Do not deploy these workflow exports directly to production. Import into staging first, configure n8n variables and credentials, then test with sample payloads only.

## Scope

This package implements the pickup creation and driver dispatch layer after the order-tracking MVP.

Required workflow exports:

- `workflows/20-create-pickup-request.json`
- `workflows/21-uae-area-branch-resolver.json`
- `workflows/30-driver-dispatch.json`
- `workflows/31-driver-whatsapp-notification.json`
- `workflows/32-driver-status-update.json`
- `workflows/33-driver-timeout-reassignment.json`

## Shared Contract

All workflows accept the shared input envelope:

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

All workflow outputs should preserve `correlationId` and follow the shared success/status/data/error/meta pattern defined in `docs/n8n-ai-customer-service-workflows.md`.

## Guardrails

- Do not invent service area, branch coverage, or driver coverage.
- Resolve service areas and branches from configurable service API records only.
- Prevent duplicate pickup requests before creating side effects.
- Prevent duplicate driver assignments through service API idempotency keys.
- Assign only active, available, on-shift drivers.
- Preserve complete assignment history before rejection, timeout, reassignment, or closure.
- Escalate no-driver cases instead of randomly assigning a driver.
- Send customer confirmation only after a valid pickup create or safe duplicate detection.
- Use no live driver phone numbers in exports, docs, or fixtures.

## Workflow Nodes

### 20 Create Pickup Request

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

### 21 UAE Area Branch Resolver

- `Workflow Input`
- `Normalize Area Name`
- `Search Area Aliases`
- `Coordinates Available?`
- `Match Coordinates to Area`
- `Area Match Router`
- `Find Responsible Branch`
- `Return Routing Result`

Statuses: `MATCHED`, `AMBIGUOUS`, `UNSUPPORTED`, `UNKNOWN`.

### 30 Driver Dispatch

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

Driver statuses: `AVAILABLE`, `BUSY`, `OFF_SHIFT`, `UNAVAILABLE`.

Assignment statuses: `PENDING`, `ASSIGNED`, `ACCEPTED`, `ON_THE_WAY`, `ARRIVED`, `COMPLETED`, `REJECTED`, `TIMED_OUT`, `CANCELLED`, `FAILED`.

### 31 Driver WhatsApp Notification

- `Workflow Input`
- `Load Safe Task Data`
- `Prepare Driver Message`
- `Validate Driver Phone`
- `Send Driver WhatsApp`
- `Save Notification Result`
- `Return Send Result`

Only safe driver task fields are sent: task type, display name, area, address, location, time window, task reference, accept action, and reject action.

### 32 Driver Status Update

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

### 33 Driver Timeout Reassignment

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

## Required n8n Variables and Credentials

- `SERVICE_API_BASE_URL`
- `SERVICE_API_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_ACCESS_TOKEN` or n8n WhatsApp credential
- `N8N_WF_AREA_BRANCH_RESOLVER_ID`
- `N8N_WF_DRIVER_DISPATCH_ID`
- `N8N_WF_DRIVER_NOTIFICATION_ID`
- `N8N_WF_DRIVER_REASSIGNMENT_ID`
- `N8N_WF_NOTIFY_BRANCH_MANAGER_ID`
- `DEFAULT_TIMEZONE=Asia/Dubai`

## Service API Dependencies

- `GET /api/v1/branches/resolve`
- `GET /api/v1/pickups/duplicate`
- `POST /api/v1/pickups`
- `GET /api/v1/pickups/:id/dispatch-details`
- `GET /api/v1/areas/aliases`
- `POST /api/v1/areas/match-coordinates`
- `GET /api/v1/drivers/available`
- `POST /api/v1/dispatch/assignments`
- `GET /api/v1/driver-assignments/:id/safe-notification-data`
- `GET /api/v1/driver-assignments/:id/verify-driver`
- `PATCH /api/v1/driver-assignments/:id/status`
- `PATCH /api/v1/drivers/:id/status`
- `GET /api/v1/dispatch/assignments/:id/next-candidate`
- `POST /api/v1/notifications/whatsapp`
- `POST /api/v1/audit/events`

## Validation

Run:

```bash
npm run generate:n8n-workflows
npm run validate:n8n-workflows
npm run validate:n8n-pickup-driver
```

Sample payloads are under `test-payloads/n8n-pickup-driver/`.
