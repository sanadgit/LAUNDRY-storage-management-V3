const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const serverPath = path.join(root, 'server.ts');
const docsPath = path.join(root, 'docs', 'N8N_LIVE_INTEGRATION_READINESS.md');

const normalizeRoute = (route) =>
  String(route)
    .replace(/\/+$/g, '')
    .replace(/:([A-Za-z0-9_]+)/g, ':param')
    .replace(/\s+/g, ' ')
    .trim();

const serverSource = fs.readFileSync(serverPath, 'utf8');
const existingRoutes = [...serverSource.matchAll(/app\.(get|post|put|patch|delete)\(\s*['"`]([^'"`]+)/g)].map((match) => ({
  method: match[1].toUpperCase(),
  path: match[2],
  normalized: `${match[1].toUpperCase()} ${normalizeRoute(match[2])}`,
}));
const existingRouteSet = new Set(existingRoutes.map((route) => route.normalized));

const requiredContracts = [
  {
    group: 'Webhook Idempotency',
    method: 'GET',
    path: '/api/v1/webhook-events/:messageId',
    workflow: '02-message-idempotency-check',
    legacy: null,
    readiness: 'missing',
    note: 'Required to check duplicate inbound WhatsApp wamid before side effects.',
  },
  {
    group: 'Webhook Idempotency',
    method: 'POST',
    path: '/api/v1/webhook-events/lock',
    workflow: '02-message-idempotency-check',
    legacy: null,
    readiness: 'missing',
    note: 'Required to reserve processing lock for exactly-once behavior.',
  },
  {
    group: 'Webhook Idempotency',
    method: 'POST',
    path: '/api/v1/webhook-events/processed',
    workflow: '01-whatsapp-customer-service-router',
    legacy: 'POST /api/ai/router',
    readiness: 'needs_adapter',
    note: 'Router currently marks processing through /api/ai/router style behavior, not a dedicated event state route.',
  },
  {
    group: 'Customer Identity',
    method: 'GET',
    path: '/api/v1/customers/by-phone/:phone',
    workflow: '04-pos-customer-identity, 06-ai-customer-service-agent',
    legacy: null,
    readiness: 'missing',
    note: 'Needs POS-backed customer lookup and safe ambiguous-match handling.',
  },
  {
    group: 'Customer Orders',
    method: 'GET',
    path: '/api/v1/customers/:customerId/orders/active',
    workflow: '06-ai-customer-service-agent, 10-order-tracking',
    legacy: 'GET /api/customer/orders',
    readiness: 'needs_adapter',
    note: 'Customer portal route exists but requires customer/admin auth and does not match n8n service-token contract.',
  },
  {
    group: 'POS Orders',
    method: 'GET',
    path: '/api/v1/pos/orders/:orderId/status',
    workflow: '06-ai-customer-service-agent, 10-order-tracking, 40-complaint-management, 50-human-handoff',
    legacy: 'GET /api/pos/connect-order, GET /api/pos/order-details, GET /api/orders/track/:orderId',
    readiness: 'needs_adapter',
    note: 'POS lookup exists, but n8n needs a stable service-token endpoint that verifies phone/customer ownership.',
  },
  {
    group: 'Conversation Memory',
    method: 'GET',
    path: '/api/v1/ai/conversations/active',
    workflow: '05-conversation-memory-manager',
    legacy: 'GET /api/ai/conversations',
    readiness: 'needs_adapter',
    note: 'Conversation list exists for staff; n8n needs active conversation lookup by customer/message context.',
  },
  {
    group: 'Conversation Memory',
    method: 'POST',
    path: '/api/v1/ai/conversations',
    workflow: '05-conversation-memory-manager',
    legacy: null,
    readiness: 'missing',
    note: 'Needed when no active conversation exists.',
  },
  {
    group: 'Conversation Memory',
    method: 'GET',
    path: '/api/v1/ai/conversations/:conversationId/messages/recent',
    workflow: '05-conversation-memory-manager',
    legacy: 'GET /api/ai/conversations/:id/messages',
    readiness: 'needs_adapter',
    note: 'Legacy route exists with staff auth and different response envelope.',
  },
  {
    group: 'Conversation Memory',
    method: 'GET',
    path: '/api/v1/ai/conversations/:conversationId/summary',
    workflow: '05-conversation-memory-manager',
    legacy: null,
    readiness: 'missing',
    note: 'conversation_summaries table exists but dedicated API route is not exposed.',
  },
  {
    group: 'Conversation Memory',
    method: 'PATCH',
    path: '/api/v1/ai/conversations/:conversationId',
    workflow: '05-conversation-memory-manager, 50-human-handoff, 51-human-reply-return, 80-save-conversation-summary',
    legacy: 'PATCH /api/ai/conversations/:id',
    readiness: 'needs_adapter',
    note: 'Legacy route exists with staff auth; n8n needs service-token auth and v1 envelope.',
  },
  {
    group: 'AI Agent',
    method: 'GET',
    path: '/api/v1/ai/customer-service-agent/prompt',
    workflow: '06-ai-customer-service-agent',
    legacy: null,
    readiness: 'missing',
    note: 'Prompt can be file/static for now, but workflow expects a service API route.',
  },
  {
    group: 'AI Agent',
    method: 'POST',
    path: '/api/v1/ai/complaints/classify',
    workflow: '40-complaint-management',
    legacy: null,
    readiness: 'missing',
    note: 'Current AI service classifies complaint-like intents, but no complaint classifier API exists.',
  },
  {
    group: 'Knowledge Base',
    method: 'GET',
    path: '/api/v1/knowledge-base/search',
    workflow: '06-ai-customer-service-agent',
    legacy: null,
    readiness: 'missing',
    note: 'No knowledge base route exposed yet.',
  },
  {
    group: 'Pickup',
    method: 'GET',
    path: '/api/v1/pickups/duplicate',
    workflow: '20-create-pickup-request',
    legacy: null,
    readiness: 'missing',
    note: 'Required to prevent duplicate pickup creation.',
  },
  {
    group: 'Pickup',
    method: 'POST',
    path: '/api/v1/pickups',
    workflow: '20-create-pickup-request',
    legacy: 'POST /api/pickups',
    readiness: 'needs_adapter',
    note: 'Pickup creation exists but route/envelope do not match v1 n8n contract.',
  },
  {
    group: 'Pickup',
    method: 'GET',
    path: '/api/v1/pickups/:pickupId/dispatch-details',
    workflow: '30-driver-dispatch',
    legacy: 'GET /api/pickups',
    readiness: 'needs_adapter',
    note: 'Need a single safe dispatch-details route.',
  },
  {
    group: 'Routing',
    method: 'GET',
    path: '/api/v1/service-areas/aliases',
    workflow: '21-uae-area-branch-resolver',
    legacy: null,
    readiness: 'missing',
    note: 'Service areas exist in AI database config, but no public v1 alias route exists.',
  },
  {
    group: 'Routing',
    method: 'GET',
    path: '/api/v1/service-areas/resolve-coordinates',
    workflow: '21-uae-area-branch-resolver',
    legacy: null,
    readiness: 'missing',
    note: 'Needed for coordinate-to-area matching.',
  },
  {
    group: 'Routing',
    method: 'GET',
    path: '/api/v1/branches/resolve',
    workflow: '20-create-pickup-request, 21-uae-area-branch-resolver',
    legacy: 'GET /api/branches',
    readiness: 'needs_adapter',
    note: 'Branch list exists behind staff auth; n8n needs service-area-aware resolver.',
  },
  {
    group: 'Driver Dispatch',
    method: 'GET',
    path: '/api/v1/drivers/available',
    workflow: '30-driver-dispatch',
    legacy: null,
    readiness: 'missing',
    note: 'Driver ranking exists inside aiOperationsService, but no v1 available-drivers API route exists.',
  },
  {
    group: 'Driver Dispatch',
    method: 'POST',
    path: '/api/v1/dispatch/assignments',
    workflow: '30-driver-dispatch, 33-driver-timeout-reassignment',
    legacy: 'POST /api/pickups/:id/assign-driver',
    readiness: 'needs_adapter',
    note: 'Assignment exists for pickup id, but n8n contract expects generic dispatch assignments.',
  },
  {
    group: 'Driver Dispatch',
    method: 'GET',
    path: '/api/v1/driver-assignments/:assignmentId/safe-notification-data',
    workflow: '31-driver-whatsapp-notification',
    legacy: null,
    readiness: 'missing',
    note: 'Required to avoid exposing unsafe customer/driver data in notifications.',
  },
  {
    group: 'Driver Dispatch',
    method: 'PATCH',
    path: '/api/v1/driver-assignments/:assignmentId/status',
    workflow: '32-driver-status-update, 33-driver-timeout-reassignment',
    legacy: 'PATCH /api/driver-assignments/:id/status',
    readiness: 'needs_adapter',
    note: 'Status update exists but uses old route and status enum shape.',
  },
  {
    group: 'Complaints',
    method: 'POST',
    path: '/api/v1/complaints',
    workflow: '40-complaint-management',
    legacy: 'POST /api/complaints',
    readiness: 'needs_adapter',
    note: 'Complaint creation exists but v1 contract must preserve originalComplaintWording and ownership checks.',
  },
  {
    group: 'Complaints',
    method: 'GET',
    path: '/api/v1/complaints/:complaintId',
    workflow: '41-notify-branch-manager, 43-close-complaint, 50-human-handoff',
    legacy: 'GET /api/complaints',
    readiness: 'needs_adapter',
    note: 'List route exists; single complaint route and branch-safe envelope needed.',
  },
  {
    group: 'Complaints',
    method: 'PATCH',
    path: '/api/v1/complaints/:complaintId/status',
    workflow: '43-close-complaint',
    legacy: 'PATCH /api/complaints/:id',
    readiness: 'needs_adapter',
    note: 'Legacy update exists; critical closure rules need v1 enforcement.',
  },
  {
    group: 'Handoff',
    method: 'POST',
    path: '/api/v1/human-handoffs',
    workflow: '50-human-handoff',
    legacy: null,
    readiness: 'missing',
    note: 'human_escalations table exists; dedicated handoff route is not exposed.',
  },
  {
    group: 'Handoff',
    method: 'PATCH',
    path: '/api/v1/ai/conversations/:conversationId/lock',
    workflow: '50-human-handoff',
    legacy: 'PATCH /api/ai/conversations/:id',
    readiness: 'needs_adapter',
    note: 'Conversation update exists but explicit AI lock route is missing.',
  },
  {
    group: 'Notifications',
    method: 'POST',
    path: '/api/v1/notifications/whatsapp',
    workflow: '31-driver-whatsapp-notification, 41-notify-branch-manager, 70-whatsapp-response-sender',
    legacy: 'POST /api/whatsapp/send',
    readiness: 'needs_adapter',
    note: 'WhatsApp send exists but notification log/idempotency envelope route is missing.',
  },
  {
    group: 'Conversation Save',
    method: 'POST',
    path: '/api/v1/ai/messages',
    workflow: '51-human-reply-return, 80-save-conversation-summary',
    legacy: null,
    readiness: 'missing',
    note: 'AI messages are saved internally, but no direct service-token route exists.',
  },
  {
    group: 'Conversation Save',
    method: 'POST',
    path: '/api/v1/ai/tool-calls/batch',
    workflow: '80-save-conversation-summary',
    legacy: null,
    readiness: 'missing',
    note: 'ai_tool_calls table exists; batch logging route is missing.',
  },
  {
    group: 'Observability',
    method: 'POST',
    path: '/api/v1/observability/errors',
    workflow: '90-central-error-handler',
    legacy: null,
    readiness: 'missing',
    note: 'Needed for central n8n error handler.',
  },
  {
    group: 'Retry',
    method: 'GET',
    path: '/api/v1/retry-records/:retryRecordId',
    workflow: '91-retry-queue',
    legacy: null,
    readiness: 'missing',
    note: 'Retry queue storage routes are missing.',
  },
  {
    group: 'Retry',
    method: 'POST',
    path: '/api/v1/dead-letter',
    workflow: '91-retry-queue',
    legacy: null,
    readiness: 'missing',
    note: 'Dead-letter queue API is missing.',
  },
];

const withActualReadiness = requiredContracts.map((contract) => {
  const normalized = `${contract.method} ${normalizeRoute(contract.path)}`;
  if (existingRouteSet.has(normalized)) {
    return { ...contract, readiness: 'ready_exact', existing: normalized };
  }
  return {
    ...contract,
    existing: contract.legacy || '',
  };
});

const counts = withActualReadiness.reduce((acc, item) => {
  acc[item.readiness] = (acc[item.readiness] || 0) + 1;
  return acc;
}, {});
const remainingContracts = withActualReadiness.filter((item) => item.readiness !== 'ready_exact');
const remainingMissing = withActualReadiness.filter((item) => item.readiness === 'missing');
const remainingNeedsAdapter = withActualReadiness.filter((item) => item.readiness === 'needs_adapter');

const readinessLabel = {
  ready_exact: 'Ready exact',
  needs_adapter: 'Needs adapter/alias',
  missing: 'Missing',
};

const lines = [
  '# n8n Live Integration Readiness',
  '',
  `Generated by \`npm run audit:n8n-live\`.`,
  '',
  '## Executive Summary',
  '',
  `- Existing backend routes scanned: ${existingRoutes.length}.`,
  `- Required n8n service contracts checked: ${withActualReadiness.length}.`,
  `- Ready exact: ${counts.ready_exact || 0}.`,
  `- Needs adapter/alias: ${counts.needs_adapter || 0}.`,
  `- Missing: ${counts.missing || 0}.`,
  '',
  remainingContracts.length === 0
    ? 'The n8n workflow package and backend `/api/v1` route surface are aligned. Staging tests are still required before production tokens.'
    : 'The n8n workflow package is validated, and the backend now exposes part of the `/api/v1` contract surface. Installing Meta/POS tokens alone is not enough until the remaining contracts pass staging tests.',
  '',
  '## What Is Already Present',
  '',
  '- WhatsApp webhook verification and inbound processing exist at `/api/webhooks/whatsapp`.',
  '- AI router exists at `/api/ai/router`.',
  '- Local AI operations tables and service methods exist for conversations, pickups, complaints, driver assignments, and WhatsApp logging.',
  '- POS lookup routes exist under `/api/pos/...`, including order search and order details.',
  '- Customer portal order and tracking routes exist under `/api/customer/...`.',
  '',
  '## What Blocks Live n8n',
  '',
  remainingContracts.length
    ? `- ${remainingContracts.length} required n8n contracts still need exact backend support or deeper adapter work.`
    : '- No route-surface blockers remain in this audit.',
  remainingNeedsAdapter.length
    ? `- ${remainingNeedsAdapter.length} routes have legacy behavior available but still need v1-safe envelopes, ownership checks, or status mapping.`
    : '- No legacy adapter aliases remain in this audit.',
  remainingMissing.length
    ? `- ${remainingMissing.length} routes are still missing entirely.`
    : '- No required routes are missing in this audit.',
  '- Customer identity by phone has a v1 adapter, but POS customer-master behavior must still be verified in staging with safe duplicate/ambiguous handling.',
  '- Production Meta/POS tokens should wait until remaining pickup, driver, complaint, handoff, retry, and dead-letter contracts are implemented or intentionally disabled.',
  '',
  '## Contract Matrix',
  '',
  '| Group | Workflow | Method | Required endpoint | Readiness | Existing/legacy route | Notes |',
  '| --- | --- | --- | --- | --- | --- | --- |',
  ...withActualReadiness.map((item) =>
    `| ${item.group} | ${item.workflow} | ${item.method} | \`${item.path}\` | ${readinessLabel[item.readiness] || item.readiness} | ${item.existing ? `\`${item.existing}\`` : ''} | ${item.note} |`
  ),
  '',
  '## Recommended Next Build Order',
  '',
  '1. Configure a staging-only `SERVICE_API_TOKEN` and import the MVP workflows into n8n staging.',
  '2. Run staging API tests for duplicate `wamid`, phone mismatch, POS unavailable, and WhatsApp send idempotency.',
  '3. Implement the remaining pickup, driver, complaint, handoff, retry, and dead-letter v1 adapters.',
  '4. Configure `N8N_WF_*` workflow IDs after importing sub-workflows.',
  '5. Configure production Meta/OpenAI/POS secrets only after staging API tests pass.',
  '',
  '## Token Readiness Answer',
  '',
  'Do not add production Meta/POS tokens yet. Staging tokens can be configured after deploying the current `/api/v1` adapter layer and setting `SERVICE_API_TOKEN`; production tokens should wait until the remaining contracts and staging tests pass.',
  '',
];

fs.mkdirSync(path.dirname(docsPath), { recursive: true });
fs.writeFileSync(docsPath, `${lines.join('\n')}\n`, 'utf8');

console.log(`Scanned ${existingRoutes.length} backend routes.`);
console.log(`Checked ${withActualReadiness.length} n8n contracts.`);
console.log(`Ready exact: ${counts.ready_exact || 0}`);
console.log(`Needs adapter/alias: ${counts.needs_adapter || 0}`);
console.log(`Missing: ${counts.missing || 0}`);
console.log(`Wrote ${path.relative(root, docsPath)}`);
