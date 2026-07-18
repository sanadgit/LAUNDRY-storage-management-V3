const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const workflowsDir = path.join(root, 'workflows');
const payloadsDir = path.join(root, 'test-payloads', 'n8n-complaint-handoff');
const docsPath = path.join(root, 'docs', 'N8N_COMPLAINT_HANDOFF_WORKFLOWS_SPEC.md');

const workflows = [
  '40-complaint-management.json',
  '41-notify-branch-manager.json',
  '42-complaint-follow-up.json',
  '43-close-complaint.json',
  '50-human-handoff.json',
  '51-human-reply-return.json',
];

const requiredNodes = {
  '40-complaint-management.json': [
    'Workflow Input',
    'Extract Complaint Details',
    'Verify Customer',
    'Order Number Provided?',
    'Verify Order Ownership',
    'Classify Complaint',
    'Validate Classification',
    'Priority Router',
    'Create Complaint Ticket',
    'Find Responsible Branch',
    'Notify Branch Manager',
    'Critical Complaint?',
    'Human Escalation',
    'Prepare Customer Acknowledgment',
    'Return Complaint Result',
  ],
  '41-notify-branch-manager.json': [
    'Workflow Input',
    'Load Complaint',
    'Get Branch Manager',
    'Prepare Manager Message',
    'Send WhatsApp Notification',
    'Save Notification',
    'Return Result',
  ],
  '42-complaint-follow-up.json': [
    'Workflow Input',
    'Find Complaints Requiring Follow-up',
    'Loop Over Complaints',
    'Check Current Status',
    'Customer Follow-up Required?',
    'Prepare Customer Message',
    'Send WhatsApp Message',
    'Manager Escalation Required?',
    'Notify Manager',
    'Save Complaint Event',
    'Return Summary',
  ],
  '43-close-complaint.json': [
    'Workflow Input',
    'Load Complaint',
    'Validate Closure Permission',
    'Critical Complaint?',
    'Manager Approval Present?',
    'Update Complaint Status',
    'Save Resolution',
    'Send Customer Resolution Message',
    'Request Satisfaction Rating',
    'Save Audit Event',
    'Return Result',
  ],
  '50-human-handoff.json': [
    'Workflow Input',
    'Load Conversation',
    'Load Related Order',
    'Load Related Complaint',
    'Generate Handoff Summary',
    'Create Handoff Record',
    'Determine Human Queue',
    'Notify Responsible Staff',
    'Lock AI Conversation',
    'Return Handoff Confirmation',
  ],
  '51-human-reply-return.json': [
    'Workflow Input',
    'Validate Staff Identity',
    'Load Active Handoff',
    'Prepare Human Reply',
    'Send WhatsApp Reply',
    'Save Staff Message',
    'Update Conversation',
    'Close or Continue Handoff?',
    'Update Handoff Status',
    'Return Result',
  ],
};

const requiredMarkers = {
  '40-complaint-management.json': [
    'Verify Customer',
    'Verify Order Ownership',
    'originalComplaintWording',
    'Never admit liability',
    'promise compensation',
    'legal threats',
    'lost valuable garments',
    'serious damage',
    'privacy concerns',
    'N8N_WF_HUMAN_HANDOFF_ID',
  ],
  '41-notify-branch-manager.json': [
    'one manager phone only',
    'safe summary',
    '/api/v1/notifications/whatsapp',
  ],
  '42-complaint-follow-up.json': [
    'liability-safe',
    'Manager Escalation Required?',
    'Save Complaint Event',
    'N8N_WF_NOTIFY_BRANCH_MANAGER_ID',
  ],
  '43-close-complaint.json': [
    'Critical complaints require manager approval',
    'Manager Approval Present?',
    'Customer resolution messages must be liability-safe',
    '/api/v1/audit/events',
  ],
  '50-human-handoff.json': [
    'legal threat',
    'serious garment damage',
    'lost valuable garment',
    'privacy issue',
    'Lock AI Conversation',
    'aiLocked',
  ],
  '51-human-reply-return.json': [
    'Only verified staff',
    'unapproved draft',
    'aiLocked',
    'Update Handoff Status',
  ],
};

const sharedFields = ['correlationId', 'messageId', 'conversationId', 'customerId', 'customerPhone', 'detectedLanguage', 'intent', 'payload'];
const contractMarkers = ['Shared Input Contract', 'Shared Output Contract', ...sharedFields, 'durationMs'];
const errors = [];

if (!fs.existsSync(docsPath)) {
  errors.push('Missing docs/N8N_COMPLAINT_HANDOFF_WORKFLOWS_SPEC.md.');
}

for (const workflowFile of workflows) {
  const workflowPath = path.join(workflowsDir, workflowFile);
  if (!fs.existsSync(workflowPath)) {
    errors.push(`Missing complaint/handoff workflow: ${workflowFile}.`);
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
      errors.push(`${workflowFile}: missing complaint/handoff guardrail marker ${marker}.`);
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
    errors.push(`Missing complaint/handoff test payload: ${workflowFile}.`);
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

  if (payload.payload?.isSampleData !== true) {
    errors.push(`${workflowFile}: payload.payload.isSampleData must be true.`);
  }

  const rawPayload = JSON.stringify(payload).toLowerCase();
  if (workflowFile === '40-complaint-management.json' && !rawPayload.includes('originalcomplaintwording')) {
    errors.push(`${workflowFile}: payload must preserve originalComplaintWording.`);
  }

  if (/we are liable|refund guaranteed|تعويض مضمون|نحن مسؤولون/i.test(rawPayload)) {
    errors.push(`${workflowFile}: payload contains liability or compensation promise language.`);
  }
}

if (errors.length) {
  console.error('n8n complaint/handoff workflow package validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validated ${workflows.length} complaint/handoff n8n workflows and ${workflows.length} test payloads.`);
