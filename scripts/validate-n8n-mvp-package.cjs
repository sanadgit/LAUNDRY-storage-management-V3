const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const workflowsDir = path.join(root, 'workflows');
const payloadsDir = path.join(root, 'test-payloads', 'n8n-mvp');
const specPath = path.join(root, 'docs', 'N8N_WORKFLOWS_IMPLEMENTATION_SPEC.md');

const mvpWorkflows = [
  '01-whatsapp-customer-service-router.json',
  '02-message-idempotency-check.json',
  '03-uae-phone-normalization.json',
  '04-pos-customer-identity.json',
  '05-conversation-memory-manager.json',
  '06-ai-customer-service-agent.json',
  '10-order-tracking.json',
  '70-whatsapp-response-sender.json',
  '80-save-conversation-summary.json',
  '90-central-error-handler.json',
];

const requiredNodes = {
  '01-whatsapp-customer-service-router.json': [
    'WhatsApp Incoming Message',
    'Generate Correlation ID',
    'Extract Webhook Data',
    'Validate Payload',
    'Invalid Payload Response',
    'Check Message Type',
    'Normalize WhatsApp Message',
    'Check Duplicate Message',
    'Is Duplicate?',
    'Normalize Customer Phone',
    'Identify Customer',
    'Load Conversation Context',
    'Prepare Agent Input',
    'Customer Service AI Agent',
    'Validate Agent Response',
    'Safe Fallback Message',
    'Send WhatsApp Reply',
    'Save Conversation',
    'Mark Event Processed',
    'Error Handler',
  ],
  '02-message-idempotency-check.json': [
    'Workflow Input',
    'Extract WhatsApp Message ID',
    'Find Processed Event',
    'Message Already Exists?',
    'Return Duplicate Result',
    'Register Processing Lock',
  ],
  '03-uae-phone-normalization.json': [
    'Workflow Input',
    'Clean Phone Characters',
    'Convert UAE Format',
    'Validate Phone Number',
    'Return Normalized Phone',
  ],
  '04-pos-customer-identity.json': [
    'Workflow Input',
    'Prepare Phone Variants',
    'Find Customer in POS',
    'POS Request Successful?',
    'Check Customer Results',
    'Single Customer Found',
    'Ambiguous Customer Result',
    'Customer Not Found',
  ],
  '05-conversation-memory-manager.json': [
    'Workflow Input',
    'Find Active Conversation',
    'Conversation Exists?',
    'Create Conversation',
    'Load Recent Messages',
    'Load Conversation Summary',
    'Load Active Context',
    'Context Too Large?',
    'Summarize Old Messages',
    'Return Memory Context',
  ],
  '06-ai-customer-service-agent.json': [
    'Workflow Input',
    'Prepare Customer Context',
    'Load System Prompt',
    'Customer Service Agent',
    'OpenAI Chat Model',
    'Conversation Memory',
    'Search Knowledge Base Tool',
    'Find Customer Tool',
    'Get Active Orders Tool',
    'Get Order Status Tool',
    'Create Pickup Tool',
    'Create Complaint Tool',
    'Human Handoff Tool',
    'Validate AI Output',
    'Response Valid?',
    'Return Agent Response',
  ],
  '10-order-tracking.json': [
    'Workflow Input',
    'Validate Customer ID',
    'Order ID Provided?',
    'Get Specific Order',
    'Get Active Orders',
    'Verify Order Ownership',
    'Count Active Orders',
    'Order Result Router',
    'Map POS Status',
    'Return Order Result',
  ],
  '70-whatsapp-response-sender.json': [
    'Workflow Input',
    'Validate Recipient',
    'Determine Message Type',
    'Prepare Text Message',
    'Prepare Template Message',
    'Send WhatsApp Message',
    'Send Successful?',
    'Save Notification Status',
    'Return Provider Result',
  ],
  '80-save-conversation-summary.json': [
    'Workflow Input',
    'Redact Sensitive Data',
    'Save Customer Message',
    'Save Agent Response',
    'Save Tool Calls',
    'Summary Needed?',
    'Generate Summary',
    'Update Conversation',
  ],
  '90-central-error-handler.json': [
    'Workflow Error Trigger',
    'Extract Error Data',
    'Redact Secrets',
    'Classify Error',
    'Is Temporary Error?',
    'Save Error Log',
    'Retry Allowed?',
    'Add to Retry Queue',
    'Notify Operations',
    'Return Safe Failure Result',
  ],
};

const requiredPayloads = [
  '01-whatsapp-text-order-status.json',
  '02-message-idempotency-check.json',
  '03-uae-phone-normalization.json',
  '04-pos-customer-identity.json',
  '05-conversation-memory-manager.json',
  '06-ai-customer-service-agent.json',
  '10-order-tracking.json',
  '70-whatsapp-response-sender.json',
  '80-save-conversation-summary.json',
  '90-central-error-handler.json',
];

const errors = [];

if (!fs.existsSync(specPath)) {
  errors.push('Missing docs/N8N_WORKFLOWS_IMPLEMENTATION_SPEC.md.');
}

for (const workflowFile of mvpWorkflows) {
  const workflowPath = path.join(workflowsDir, workflowFile);
  if (!fs.existsSync(workflowPath)) {
    errors.push(`Missing MVP workflow: ${workflowFile}.`);
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
      errors.push(`${workflowFile}: missing MVP node ${requiredNode}.`);
    }
  }

  for (const marker of [
    'Shared Input Contract',
    'Shared Output Contract',
    'correlationId',
    'messageId',
    'conversationId',
    'customerId',
    'customerPhone',
    'detectedLanguage',
    'intent',
    'payload',
    'durationMs',
  ]) {
    if (!raw.includes(marker)) {
      errors.push(`${workflowFile}: missing shared contract marker ${marker}.`);
    }
  }

  if (/sk-[A-Za-z0-9_-]{20,}|EA[A-Za-z0-9]{20,}|xox[baprs]-/i.test(raw)) {
    errors.push(`${workflowFile}: possible embedded credential detected.`);
  }

  if (/purchase_api\/login_action|packing_api\/|pos_api\//i.test(raw)) {
    errors.push(`${workflowFile}: raw POS route detected; MVP workflows must use service API.`);
  }
}

for (const payloadFile of requiredPayloads) {
  const payloadPath = path.join(payloadsDir, payloadFile);
  if (!fs.existsSync(payloadPath)) {
    errors.push(`Missing MVP test payload: ${payloadFile}.`);
    continue;
  }

  try {
    const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));
    for (const field of ['correlationId', 'messageId', 'conversationId', 'customerId', 'customerPhone', 'detectedLanguage', 'intent', 'payload']) {
      if (!(field in payload)) {
        errors.push(`${payloadFile}: missing shared input field ${field}.`);
      }
    }
  } catch (error) {
    errors.push(`${payloadFile}: invalid JSON: ${error.message}`);
  }
}

if (errors.length) {
  console.error('n8n MVP workflow package validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validated ${mvpWorkflows.length} MVP n8n workflows and ${requiredPayloads.length} test payloads.`);
