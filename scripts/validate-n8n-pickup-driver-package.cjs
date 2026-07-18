const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const workflowsDir = path.join(root, 'workflows');
const payloadsDir = path.join(root, 'test-payloads', 'n8n-pickup-driver');
const docsPath = path.join(root, 'docs', 'N8N_PICKUP_DRIVER_WORKFLOWS_SPEC.md');

const workflows = [
  '20-create-pickup-request.json',
  '21-uae-area-branch-resolver.json',
  '30-driver-dispatch.json',
  '31-driver-whatsapp-notification.json',
  '32-driver-status-update.json',
  '33-driver-timeout-reassignment.json',
];

const requiredNodes = {
  '20-create-pickup-request.json': [
    'Workflow Input',
    'Extract Pickup Details',
    'Required Data Complete?',
    'Return Missing Fields',
    'Normalize Address',
    'Parse Google Maps Location',
    'Resolve Service Area',
    'Area Supported?',
    'Resolve Branch',
    'Check Duplicate Pickup',
    'Duplicate Exists?',
    'Create Pickup',
    'Dispatch Driver',
    'Return Pickup Confirmation',
  ],
  '21-uae-area-branch-resolver.json': [
    'Workflow Input',
    'Normalize Area Name',
    'Search Area Aliases',
    'Coordinates Available?',
    'Match Coordinates to Area',
    'Area Match Router',
    'Find Responsible Branch',
    'Return Routing Result',
  ],
  '30-driver-dispatch.json': [
    'Workflow Input',
    'Load Pickup Details',
    'Get Available Drivers',
    'Drivers Available?',
    'Filter Branch Drivers',
    'Filter Service Area',
    'Filter Active Shift',
    'Calculate Driver Score',
    'Sort Driver Candidates',
    'Create Assignment',
    'Notify Driver',
    'Wait for Acceptance',
    'Driver Accepted?',
    'Reassign or Escalate',
  ],
  '31-driver-whatsapp-notification.json': [
    'Workflow Input',
    'Load Safe Task Data',
    'Prepare Driver Message',
    'Validate Driver Phone',
    'Send Driver WhatsApp',
    'Save Notification Result',
    'Return Send Result',
  ],
  '32-driver-status-update.json': [
    'Workflow Input',
    'Validate Assignment',
    'Validate Driver Identity',
    'Parse Driver Action',
    'Status Router',
    'Update Assignment Status',
    'Update Driver Status',
    'Notify Operations if Needed',
    'Notify Customer if Allowed',
    'Save Audit Event',
    'Return Result',
  ],
  '33-driver-timeout-reassignment.json': [
    'Workflow Input',
    'Load Assignment',
    'Assignment Still Pending?',
    'Mark Timed Out',
    'Load Next Candidate',
    'Candidate Available?',
    'Create New Assignment',
    'Notify New Driver',
    'No Candidate Escalation',
    'Save Audit Event',
    'Return Result',
  ],
};

const requiredMarkers = {
  '20-create-pickup-request.json': [
    'Check duplicate pickup',
    '/api/v1/pickups/duplicate',
    '/api/v1/pickups',
    'N8N_WF_AREA_BRANCH_RESOLVER_ID',
    'N8N_WF_DRIVER_DISPATCH_ID',
    'valid pickup create or duplicate detection business action',
    'do not invent branch coverage',
  ],
  '21-uae-area-branch-resolver.json': [
    'configured service areas',
    'Do not invent actual coverage',
    'MATCHED',
    'AMBIGUOUS',
    'UNSUPPORTED',
    'UNKNOWN',
    'MBZ',
    'مدينة محمد بن زايد',
  ],
  '30-driver-dispatch.json': [
    'preventDuplicateAssignment',
    'preserveAssignmentHistory',
    'AVAILABLE',
    'OFF_SHIFT',
    'Filter Active Shift',
    'N8N_WF_DRIVER_NOTIFICATION_ID',
    'N8N_WF_DRIVER_REASSIGNMENT_ID',
    'Escalate instead of random assignment',
  ],
  '31-driver-whatsapp-notification.json': [
    'Safe driver data only',
    'one recipient only',
    'Use no live driver phone numbers',
    'WHATSAPP_PHONE_NUMBER_ID',
    '/api/v1/notifications/whatsapp',
  ],
  '32-driver-status-update.json': [
    'Validate Driver Identity',
    'Preserve complete assignment history',
    'REJECTED',
    'TIMED_OUT',
    'Notify Customer if Allowed',
    '/api/v1/audit/events',
  ],
  '33-driver-timeout-reassignment.json': [
    'TIMED_OUT',
    'complete assignment history',
    'next-candidate',
    'No Candidate Escalation',
    'N8N_WF_NOTIFY_BRANCH_MANAGER_ID',
    '/api/v1/audit/events',
  ],
};

const sharedFields = ['correlationId', 'messageId', 'conversationId', 'customerId', 'customerPhone', 'detectedLanguage', 'intent', 'payload'];
const contractMarkers = ['Shared Input Contract', 'Shared Output Contract', ...sharedFields, 'durationMs'];
const errors = [];

if (!fs.existsSync(docsPath)) {
  errors.push('Missing docs/N8N_PICKUP_DRIVER_WORKFLOWS_SPEC.md.');
}

for (const workflowFile of workflows) {
  const workflowPath = path.join(workflowsDir, workflowFile);
  if (!fs.existsSync(workflowPath)) {
    errors.push(`Missing pickup/driver workflow: ${workflowFile}.`);
    continue;
  }

  const raw = fs.readFileSync(workflowPath, 'utf8');
  let workflow;
  try {
    workflow = JSON.parse(raw);
  } catch (error) {
    errors.push(`${workflowFile}: invalid JSON: ${error.message}`);
    continue;
  }

  const nodeNames = new Set((workflow.nodes || []).map((node) => node.name));
  for (const requiredNode of requiredNodes[workflowFile] || []) {
    if (!nodeNames.has(requiredNode)) {
      errors.push(`${workflowFile}: missing node ${requiredNode}.`);
    }
  }

  for (const marker of contractMarkers) {
    if (!raw.includes(marker)) {
      errors.push(`${workflowFile}: missing shared contract marker ${marker}.`);
    }
  }

  for (const marker of requiredMarkers[workflowFile] || []) {
    if (!raw.toLowerCase().includes(marker.toLowerCase())) {
      errors.push(`${workflowFile}: missing pickup/driver guardrail marker ${marker}.`);
    }
  }

  if (/sk-[A-Za-z0-9_-]{20,}|EA[A-Za-z0-9]{20,}|xox[baprs]-/i.test(raw)) {
    errors.push(`${workflowFile}: possible embedded credential detected.`);
  }

  if (/purchase_api\/login_action|packing_api\/|pos_api\//i.test(raw)) {
    errors.push(`${workflowFile}: raw POS route detected; use service API.`);
  }
}

for (const workflowFile of workflows) {
  const payloadPath = path.join(payloadsDir, workflowFile);
  if (!fs.existsSync(payloadPath)) {
    errors.push(`Missing pickup/driver test payload: ${workflowFile}.`);
    continue;
  }

  let payload;
  try {
    payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));
  } catch (error) {
    errors.push(`${workflowFile}: invalid payload JSON: ${error.message}`);
    continue;
  }

  for (const field of sharedFields) {
    if (!(field in payload)) {
      errors.push(`${workflowFile}: payload missing shared input field ${field}.`);
    }
  }

  const payloadRaw = JSON.stringify(payload);
  if (/9715(?!0000000)\d{8}/.test(payloadRaw)) {
    errors.push(`${workflowFile}: payload appears to contain a non-sample UAE mobile number.`);
  }

  if (payload.payload?.isSampleData !== true) {
    errors.push(`${workflowFile}: payload.payload.isSampleData must be true.`);
  }
}

if (errors.length) {
  console.error('n8n pickup/driver workflow package validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validated ${workflows.length} pickup/driver n8n workflows and ${workflows.length} test payloads.`);
