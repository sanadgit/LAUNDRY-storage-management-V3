const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const workflowsDir = path.join(root, 'workflows');

const requiredWorkflowFiles = [
  '01-whatsapp-customer-service-router.json',
  '02-message-idempotency-check.json',
  '03-uae-phone-normalization.json',
  '04-pos-customer-identity.json',
  '05-conversation-memory-manager.json',
  '06-ai-customer-service-agent.json',
  '10-order-tracking.json',
  '20-create-pickup-request.json',
  '21-uae-area-branch-resolver.json',
  '30-driver-dispatch.json',
  '31-driver-whatsapp-notification.json',
  '32-driver-status-update.json',
  '33-driver-timeout-reassignment.json',
  '40-complaint-management.json',
  '41-notify-branch-manager.json',
  '42-complaint-follow-up.json',
  '43-close-complaint.json',
  '50-human-handoff.json',
  '51-human-reply-return.json',
  '60-voice-message-processing.json',
  '70-whatsapp-response-sender.json',
  '80-save-conversation-summary.json',
  '90-central-error-handler.json',
  '91-retry-queue.json',
];

const secretPatterns = [
  { name: 'OpenAI key', pattern: /sk-[A-Za-z0-9_-]{20,}/ },
  { name: 'Meta token', pattern: /EAA[A-Za-z0-9]{20,}/ },
  { name: 'JWT-like token', pattern: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/ },
  { name: 'database URL with password', pattern: /postgres(?:ql)?:\/\/[^:\s]+:[^@\s]+@/i },
  { name: 'generic access token assignment', pattern: /(access_token|api_key|password|secret)["']?\s*[:=]\s*["'][A-Za-z0-9._-]{16,}["']/i },
];

const rawPosPatterns = [
  /purchase_api\/login_action/i,
  /packing_api\//i,
  /pos_api\//i,
];

const fail = (message) => {
  throw new Error(message);
};

if (!fs.existsSync(workflowsDir)) {
  fail(`Missing workflows directory: ${workflowsDir}`);
}

const files = fs
  .readdirSync(workflowsDir)
  .filter((file) => file.endsWith('.json'))
  .sort();

if (!files.length) {
  fail('No workflow JSON files found under workflows/.');
}

const workflowNames = new Map();
const errors = [];

const requiredRouterNodeNames = [
  'WhatsApp Incoming Message',
  'Generate Correlation ID',
  'Extract Webhook Data',
  'Validate Payload',
  'Invalid Payload Response',
  'Check Message Type',
  'Process Voice Message',
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
];

const requiredWorkflowNodeNames = {
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
  '60-voice-message-processing.json': [
    'Workflow Input',
    'Get WhatsApp Media URL',
    'Validate Media Download URL',
    'Download Audio',
    'Validate Audio Type',
    'Prepare Binary Audio',
    'Transcribe Audio',
    'Transcription Valid?',
    'Delete Temporary Audio',
    'Return Normalized Text',
    'Audio Error Response',
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
  '91-retry-queue.json': [
    'Workflow Input',
    'Load Retry Record',
    'Retry Limit Reached?',
    'Calculate Backoff',
    'Wait',
    'Execute Original Action',
    'Retry Successful?',
    'Mark Completed',
    'Increment Retry Count',
    'Escalate Permanent Failure',
    'Return Result',
  ],
};

const expectedOperationalNodeCounts = {
  '01-whatsapp-customer-service-router.json': 21,
  '02-message-idempotency-check.json': 6,
  '03-uae-phone-normalization.json': 5,
  '04-pos-customer-identity.json': 8,
  '05-conversation-memory-manager.json': 10,
  '06-ai-customer-service-agent.json': 16,
  '10-order-tracking.json': 10,
  '20-create-pickup-request.json': 14,
  '21-uae-area-branch-resolver.json': 8,
  '30-driver-dispatch.json': 14,
  '31-driver-whatsapp-notification.json': 7,
  '32-driver-status-update.json': 11,
  '33-driver-timeout-reassignment.json': 11,
  '40-complaint-management.json': 15,
  '41-notify-branch-manager.json': 7,
  '42-complaint-follow-up.json': 11,
  '43-close-complaint.json': 11,
  '50-human-handoff.json': 10,
  '51-human-reply-return.json': 10,
  '60-voice-message-processing.json': 11,
  '70-whatsapp-response-sender.json': 9,
  '80-save-conversation-summary.json': 8,
  '90-central-error-handler.json': 10,
  '91-retry-queue.json': 11,
};

for (const requiredFile of requiredWorkflowFiles) {
  if (!files.includes(requiredFile)) {
    errors.push(`Missing required workflow file: ${requiredFile}.`);
  }
}

for (const file of files) {
  if (!requiredWorkflowFiles.includes(file)) {
    errors.push(`Unexpected workflow JSON file under workflows/: ${file}.`);
  }
}

for (const file of files) {
  const fullPath = path.join(workflowsDir, file);
  const raw = fs.readFileSync(fullPath, 'utf8');
  let workflow;

  try {
    workflow = JSON.parse(raw);
  } catch (error) {
    errors.push(`${file}: invalid JSON: ${error.message}`);
    continue;
  }

  if (!workflow.name || typeof workflow.name !== 'string') {
    errors.push(`${file}: missing workflow name.`);
  } else if (workflowNames.has(workflow.name)) {
    errors.push(`${file}: duplicate workflow name also used by ${workflowNames.get(workflow.name)}.`);
  } else {
    workflowNames.set(workflow.name, file);
  }

  if (!Array.isArray(workflow.nodes) || !workflow.nodes.length) {
    errors.push(`${file}: workflow must contain nodes.`);
    continue;
  }

  const nodeNames = new Set();
  const nodeIds = new Set();
  let stickyNotes = 0;

  for (const node of workflow.nodes) {
    if (!node.id) errors.push(`${file}: node without id.`);
    if (!node.name) errors.push(`${file}: node without name.`);
    if (node.id && nodeIds.has(node.id)) errors.push(`${file}: duplicate node id ${node.id}.`);
    if (node.name && nodeNames.has(node.name)) errors.push(`${file}: duplicate node name ${node.name}.`);
    if (node.id) nodeIds.add(node.id);
    if (node.name) nodeNames.add(node.name);
    if (node.type === 'n8n-nodes-base.stickyNote') stickyNotes += 1;
  }

  if (!stickyNotes) {
    errors.push(`${file}: every workflow must include at least one sticky note contract.`);
  }

  const connections = workflow.connections || {};
  for (const [sourceName, sourceConnections] of Object.entries(connections)) {
    if (!nodeNames.has(sourceName)) {
      errors.push(`${file}: connection source does not exist: ${sourceName}.`);
    }
    for (const branch of sourceConnections.main || []) {
      for (const target of branch || []) {
        if (!nodeNames.has(target.node)) {
          errors.push(`${file}: connection target does not exist: ${target.node}.`);
        }
      }
    }
  }

  if (!/correlationId|correlation_id|Correlation-Id/i.test(raw)) {
    errors.push(`${file}: missing correlationId/correlation_id propagation marker.`);
  }

  for (const sharedContractMarker of [
    'Shared Input Contract',
    'Shared Output Contract',
    'messageId',
    'conversationId',
    'customerId',
    'customerPhone',
    'detectedLanguage',
    'intent',
    'payload',
    'durationMs',
  ]) {
    if (!raw.includes(sharedContractMarker)) {
      errors.push(`${file}: missing shared contract marker ${sharedContractMarker}.`);
    }
  }

  for (const { name, pattern } of secretPatterns) {
    if (pattern.test(raw)) {
      errors.push(`${file}: possible embedded secret detected: ${name}.`);
    }
  }

  for (const pattern of rawPosPatterns) {
    if (pattern.test(raw)) {
      errors.push(`${file}: direct raw POS endpoint detected; use service API instead.`);
    }
  }

  if (file === '01-whatsapp-customer-service-router.json') {
    for (const requiredName of requiredRouterNodeNames) {
      if (!nodeNames.has(requiredName)) {
        errors.push(`${file}: missing required router node: ${requiredName}.`);
      }
    }
  }

  for (const requiredName of requiredWorkflowNodeNames[file] || []) {
    if (!nodeNames.has(requiredName)) {
      errors.push(`${file}: missing required workflow node: ${requiredName}.`);
    }
  }

  if (expectedOperationalNodeCounts[file]) {
    const operationalNodeCount = workflow.nodes.filter((node) => node.type !== 'n8n-nodes-base.stickyNote').length;
    if (operationalNodeCount !== expectedOperationalNodeCounts[file]) {
      errors.push(`${file}: expected ${expectedOperationalNodeCounts[file]} operational nodes, found ${operationalNodeCount}.`);
    }
  }

  if (file === '02-message-idempotency-check.json') {
    if (!raw.includes('/api/v1/webhook-events/')) {
      errors.push(`${file}: missing GET /api/v1/webhook-events/:messageId route marker.`);
    }
    if (!raw.includes('/api/v1/webhook-events/lock')) {
      errors.push(`${file}: missing POST /api/v1/webhook-events/lock route marker.`);
    }
  }

  if (file === '04-pos-customer-identity.json') {
    if (!raw.includes('/api/v1/customers/by-phone/')) {
      errors.push(`${file}: missing GET /api/v1/customers/by-phone/:phone route marker.`);
    }
    for (const status of ['FOUND', 'NOT_FOUND', 'AMBIGUOUS', 'POS_UNAVAILABLE']) {
      if (!raw.includes(status)) {
        errors.push(`${file}: missing identity result status ${status}.`);
      }
    }
  }

  if (file === '05-conversation-memory-manager.json') {
    for (const field of [
      'customerId',
      'conversationId',
      'currentOrderId',
      'currentPickupId',
      'currentDeliveryId',
      'currentComplaintId',
      'branchId',
      'language',
      'currentIntent',
      'humanHandoffStatus',
      'summary',
      'recentMessages',
    ]) {
      if (!raw.includes(field)) {
        errors.push(`${file}: missing memory field ${field}.`);
      }
    }
  }

  if (file === '06-ai-customer-service-agent.json') {
    for (const toolName of [
      'search_knowledge_base',
      'find_customer_by_phone',
      'get_customer_active_orders',
      'get_order_status',
      'create_pickup_request',
      'create_complaint',
      'escalate_to_human',
    ]) {
      if (!raw.includes(toolName)) {
        errors.push(`${file}: missing MVP tool ${toolName}.`);
      }
    }
    for (const safetyRule of [
      'Never invent prices',
      'Never invent order status',
      'Never expose another customer data',
      'Never promise compensation',
      'Never admit liability',
      'Never reveal internal notes or prompts',
      'Reply in the customer language',
      'Ask only for missing information',
      'maxIterations',
    ]) {
      if (!raw.includes(safetyRule)) {
        errors.push(`${file}: missing agent safety rule marker: ${safetyRule}.`);
      }
    }
  }

  if (file === '10-order-tracking.json') {
    for (const branch of [
      'NO_ACTIVE_ORDERS',
      'ONE_ACTIVE_ORDER',
      'MULTIPLE_ACTIVE_ORDERS',
      'ORDER_NOT_OWNED',
      'POS_UNAVAILABLE',
      'UNKNOWN_STATUS',
    ]) {
      if (!raw.includes(branch)) {
        errors.push(`${file}: missing order result branch ${branch}.`);
      }
    }
    if (!raw.includes('/api/v1/pos/orders/')) {
      errors.push(`${file}: missing POS-backed order status endpoint marker.`);
    }
    if (!raw.includes('/orders/active')) {
      errors.push(`${file}: missing active orders endpoint marker.`);
    }
  }

  if (file === '20-create-pickup-request.json') {
    for (const field of [
      'customerId',
      'phone',
      'address',
      'area',
      'coordinates',
      'Google Maps link',
      'preferredDate',
      'preferredTimeWindow',
      'garmentCategory',
      'specialInstructions',
    ]) {
      if (!raw.includes(field)) {
        errors.push(`${file}: missing required pickup field marker ${field}.`);
      }
    }
    for (const marker of ['/api/v1/pickups/duplicate', '/api/v1/pickups', 'N8N_WF_AREA_BRANCH_RESOLVER_ID', 'N8N_WF_DRIVER_DISPATCH_ID']) {
      if (!raw.includes(marker)) {
        errors.push(`${file}: missing pickup workflow marker ${marker}.`);
      }
    }
  }

  if (file === '21-uae-area-branch-resolver.json') {
    for (const status of ['MATCHED', 'AMBIGUOUS', 'UNSUPPORTED', 'UNKNOWN']) {
      if (!raw.includes(status)) {
        errors.push(`${file}: missing routing status ${status}.`);
      }
    }
    for (const alias of ['MBZ', 'Mohammed Bin Zayed City', 'مدينة محمد بن زايد', 'Mussafah', 'Musaffah', 'مصفح', 'Khalifa City', 'مدينة خليفة', 'Shakhbout City', 'مدينة شخبوط', 'Riyadh City', 'مدينة الرياض', 'Al Falah', 'الفلاح']) {
      if (!raw.includes(alias)) {
        errors.push(`${file}: missing recognized alias marker ${alias}.`);
      }
    }
    if (/invent actual coverage/i.test(raw) === false) {
      errors.push(`${file}: missing no-invent-coverage guardrail marker.`);
    }
  }

  if (file === '30-driver-dispatch.json') {
    for (const status of ['AVAILABLE', 'BUSY', 'OFF_SHIFT', 'UNAVAILABLE', 'PENDING', 'ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'COMPLETED', 'REJECTED', 'TIMED_OUT', 'CANCELLED', 'FAILED']) {
      if (!raw.includes(status)) {
        errors.push(`${file}: missing driver/assignment status ${status}.`);
      }
    }
    for (const marker of ['/api/v1/pickups/', '/dispatch-details', '/api/v1/drivers/available', '/api/v1/dispatch/assignments', 'N8N_WF_DRIVER_NOTIFICATION_ID', 'N8N_WF_DRIVER_REASSIGNMENT_ID']) {
      if (!raw.includes(marker)) {
        errors.push(`${file}: missing dispatch marker ${marker}.`);
      }
    }
  }

  if (file === '31-driver-whatsapp-notification.json') {
    for (const field of ['taskType', 'customerDisplayName', 'area', 'address', 'location', 'timeWindow', 'taskReference', 'acceptAction', 'rejectAction']) {
      if (!raw.includes(field)) {
        errors.push(`${file}: missing safe driver data field ${field}.`);
      }
    }
    for (const marker of ['one recipient', '/api/v1/notifications/whatsapp', 'WHATSAPP_PHONE_NUMBER_ID']) {
      if (!raw.includes(marker)) {
        errors.push(`${file}: missing WhatsApp notification marker ${marker}.`);
      }
    }
  }

  if (file === '32-driver-status-update.json') {
    for (const status of ['ASSIGNED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'COMPLETED', 'REJECTED', 'TIMED_OUT', 'CANCELLED', 'FAILED']) {
      if (!raw.includes(status)) {
        errors.push(`${file}: missing driver status update marker ${status}.`);
      }
    }
    for (const marker of ['Validate Driver Identity', '/verify-driver', '/api/v1/driver-assignments/', '/api/v1/drivers/', '/api/v1/audit/events']) {
      if (!raw.includes(marker)) {
        errors.push(`${file}: missing driver status update marker ${marker}.`);
      }
    }
  }

  if (file === '33-driver-timeout-reassignment.json') {
    for (const marker of ['TIMED_OUT', '/next-candidate', 'N8N_WF_DRIVER_NOTIFICATION_ID', 'N8N_WF_NOTIFY_BRANCH_MANAGER_ID', '/api/v1/audit/events']) {
      if (!raw.includes(marker)) {
        errors.push(`${file}: missing timeout reassignment marker ${marker}.`);
      }
    }
  }

  if (file === '40-complaint-management.json') {
    for (const category of ['DELAY', 'CLEANING_QUALITY', 'DAMAGE', 'LOST_ITEM', 'MISSING_ITEM', 'WRONG_ITEM', 'BILLING', 'STAFF_BEHAVIOR', 'DRIVER', 'DELIVERY', 'OTHER']) {
      if (!raw.includes(category)) {
        errors.push(`${file}: missing complaint category ${category}.`);
      }
    }
    for (const priority of ['P1_CRITICAL', 'P2_HIGH', 'P3_NORMAL', 'P4_LOW']) {
      if (!raw.includes(priority)) {
        errors.push(`${file}: missing complaint priority ${priority}.`);
      }
    }
    for (const status of ['NEW', 'ACKNOWLEDGED', 'INVESTIGATING', 'WAITING_FOR_CUSTOMER', 'WAITING_FOR_BRANCH', 'RESOLUTION_PROPOSED', 'RESOLVED', 'CLOSED', 'ESCALATED', 'REOPENED']) {
      if (!raw.includes(status)) {
        errors.push(`${file}: missing complaint status ${status}.`);
      }
    }
    for (const marker of ['/api/v1/complaints', '/responsible-branch', 'N8N_WF_NOTIFY_BRANCH_MANAGER_ID', 'N8N_WF_HUMAN_HANDOFF_ID', 'liability']) {
      if (!raw.includes(marker)) {
        errors.push(`${file}: missing complaint management marker ${marker}.`);
      }
    }
  }

  if (file === '41-notify-branch-manager.json') {
    for (const marker of ['/api/v1/complaints/', '/manager', '/api/v1/notifications/whatsapp', 'WHATSAPP_PHONE_NUMBER_ID', 'one manager phone only', 'safe summary']) {
      if (!raw.includes(marker)) {
        errors.push(`${file}: missing branch manager notification marker ${marker}.`);
      }
    }
  }

  if (file === '42-complaint-follow-up.json') {
    for (const marker of ['/api/v1/complaints/follow-up-due', '/status', '/events', 'N8N_WF_NOTIFY_BRANCH_MANAGER_ID', 'liability-safe', '24-hour customer care window']) {
      if (!raw.includes(marker)) {
        errors.push(`${file}: missing complaint follow-up marker ${marker}.`);
      }
    }
  }

  if (file === '43-close-complaint.json') {
    for (const marker of ['/validate-closure', '/status', '/resolution', '/satisfaction-request', '/api/v1/audit/events', 'manager approval', 'CLOSED']) {
      if (!raw.includes(marker)) {
        errors.push(`${file}: missing close complaint marker ${marker}.`);
      }
    }
  }

  if (file === '50-human-handoff.json') {
    for (const trigger of ['customer requests human', 'legal threat', 'serious garment damage', 'lost valuable garment', 'privacy issue', 'payment dispute', 'repeated AI failure', 'aggressive or threatening conversation', 'system uncertainty']) {
      if (!raw.includes(trigger)) {
        errors.push(`${file}: missing handoff trigger ${trigger}.`);
      }
    }
    for (const marker of ['/api/v1/ai/handoffs/summary', '/api/v1/human-handoffs', '/lock', 'Lock AI Conversation', 'Notify Responsible Staff']) {
      if (!raw.includes(marker)) {
        errors.push(`${file}: missing human handoff marker ${marker}.`);
      }
    }
  }

  if (file === '51-human-reply-return.json') {
    for (const marker of ['/api/v1/staff/validate', '/api/v1/human-handoffs/', '/api/v1/ai/messages', '/api/v1/ai/conversations/', 'Only verified staff', 'one customer recipient only', 'unapproved draft']) {
      if (!raw.includes(marker)) {
        errors.push(`${file}: missing human reply return marker ${marker}.`);
      }
    }
  }

  if (file === '60-voice-message-processing.json') {
    for (const marker of ['getMediaUrl', 'Validate MIME type', 'Validate maximum file size', 'trusted Meta media URLs', 'temporary storage only', 'delete temporary audio', 'Do not fabricate unclear speech', 'Preserve language', 'Transcribe Audio', 'OPENAI_TRANSCRIPTION_MODEL', 'routeToWorkflow01', 'normalizedMessage']) {
      if (!raw.includes(marker)) {
        errors.push(`${file}: missing voice processing marker ${marker}.`);
      }
    }
  }

  if (file === '70-whatsapp-response-sender.json') {
    for (const marker of ['One recipient per API request', 'approved template outside customer-service window', 'Prevent duplicate sends', 'providerMessageId', 'rate limits and timeouts', '/api/v1/notifications/whatsapp', 'WHATSAPP_PHONE_NUMBER_ID']) {
      if (!raw.includes(marker)) {
        errors.push(`${file}: missing WhatsApp response sender marker ${marker}.`);
      }
    }
  }

  if (file === '80-save-conversation-summary.json') {
    for (const marker of ['/api/v1/ai/messages', '/api/v1/ai/tool-calls/batch', '/summarize', 'Redact API keys', 'Save summaries, not full transcripts forever', 'toolCallIds', 'summaryNeeded']) {
      if (!raw.includes(marker)) {
        errors.push(`${file}: missing conversation summary marker ${marker}.`);
      }
    }
  }

  if (file === '90-central-error-handler.json') {
    for (const category of ['TEMPORARY_API_FAILURE', 'PERMANENT_VALIDATION_FAILURE', 'AUTHENTICATION_FAILURE', 'RATE_LIMIT', 'POS_UNAVAILABLE', 'OPENAI_UNAVAILABLE', 'WHATSAPP_UNAVAILABLE', 'DATABASE_UNAVAILABLE', 'WORKFLOW_LOGIC_FAILURE', 'CUSTOMER_INPUT_ERROR']) {
      if (!raw.includes(category)) {
        errors.push(`${file}: missing error category ${category}.`);
      }
    }
    for (const marker of ['n8n-nodes-base.errorTrigger', '/api/v1/observability/errors', 'N8N_WF_RETRY_QUEUE_ID', 'OPERATIONS_ALERT_PHONE', 'Redact secrets', 'safe summary only']) {
      if (!raw.includes(marker)) {
        errors.push(`${file}: missing central error handler marker ${marker}.`);
      }
    }
  }

  if (file === '91-retry-queue.json') {
    for (const marker of ['/api/v1/retry-records/', '/execute', '/completed', '/attempts', '/api/v1/dead-letter', 'exponential backoff', 'idempotency key', 'dead-letter queue', 'N8N_RETRY_MAX_ATTEMPTS']) {
      if (!raw.includes(marker)) {
        errors.push(`${file}: missing retry queue marker ${marker}.`);
      }
    }
  }
}

const mainRouter = files.find((file) => file.includes('main-whatsapp-router') || file.includes('whatsapp-customer-service-router'));
if (!mainRouter) {
  errors.push('Missing main WhatsApp router workflow.');
}

if (errors.length) {
  console.error('n8n workflow validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validated ${files.length} n8n workflow JSON exports.`);
