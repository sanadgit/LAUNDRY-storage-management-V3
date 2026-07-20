const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const workflowsDir = path.join(root, 'workflows');

const CONFIG_NODE_NAME = 'Workflow Config';
const CLEAN_NODE_NAME = 'Remove Config From Item';

const CONFIG_FIELDS = {
  SERVICE_API_BASE_URL: 'PASTE_SERVICE_API_BASE_URL_HERE',
  N8N_API_KEY: 'PASTE_SERVICE_API_TOKEN_HERE',
  WHATSAPP_PHONE_NUMBER_ID: 'PASTE_WHATSAPP_PHONE_NUMBER_ID_HERE',
  WHATSAPP_ACCESS_TOKEN: 'PASTE_WHATSAPP_ACCESS_TOKEN_HERE',
  WHATSAPP_AUDIO_MAX_BYTES: '16777216',
  OPENAI_CHAT_MODEL: 'gpt-4.1-mini',
  OPENAI_TRANSCRIPTION_MODEL: 'gpt-4o-mini-transcribe',
  OPERATIONS_ALERT_PHONE: 'PASTE_ONE_OPERATIONS_ALERT_PHONE_HERE',
  CONVERSATION_SUMMARY_MESSAGE_THRESHOLD: '20',
  N8N_RETRY_MAX_ATTEMPTS: '5',
  N8N_RETRY_BASE_MS: '60000',
  N8N_RETRY_MAX_BACKOFF_MS: '900000',
  N8N_WF_IDEMPOTENCY_CHECK_ID: 'PASTE_WORKFLOW_ID_02_HERE',
  N8N_WF_PHONE_NORMALIZATION_ID: 'PASTE_WORKFLOW_ID_03_HERE',
  N8N_WF_CUSTOMER_IDENTITY_ID: 'PASTE_WORKFLOW_ID_04_HERE',
  N8N_WF_MEMORY_MANAGER_ID: 'PASTE_WORKFLOW_ID_05_HERE',
  N8N_WF_AI_AGENT_ID: 'PASTE_WORKFLOW_ID_06_HERE',
  N8N_WF_ORDER_TRACKING_ID: 'PASTE_WORKFLOW_ID_10_HERE',
  N8N_WF_PICKUP_REQUEST_ID: 'PASTE_WORKFLOW_ID_20_HERE',
  N8N_WF_AREA_BRANCH_RESOLVER_ID: 'PASTE_WORKFLOW_ID_21_HERE',
  N8N_WF_DRIVER_DISPATCH_ID: 'PASTE_WORKFLOW_ID_30_HERE',
  N8N_WF_DRIVER_NOTIFICATION_ID: 'PASTE_WORKFLOW_ID_31_HERE',
  N8N_WF_DRIVER_REASSIGNMENT_ID: 'PASTE_WORKFLOW_ID_33_HERE',
  N8N_WF_COMPLAINT_ID: 'PASTE_WORKFLOW_ID_40_HERE',
  N8N_WF_NOTIFY_BRANCH_MANAGER_ID: 'PASTE_WORKFLOW_ID_41_HERE',
  N8N_WF_HUMAN_HANDOFF_ID: 'PASTE_WORKFLOW_ID_50_HERE',
  N8N_WF_VOICE_PROCESSING_ID: 'PASTE_WORKFLOW_ID_60_HERE',
  N8N_WF_RESPONSE_SENDER_ID: 'PASTE_WORKFLOW_ID_70_HERE',
  N8N_WF_SAVE_SUMMARY_ID: 'PASTE_WORKFLOW_ID_80_HERE',
  N8N_WF_ERROR_HANDLER_ID: 'PASTE_WORKFLOW_ID_90_HERE',
  N8N_WF_RETRY_QUEUE_ID: 'PASTE_WORKFLOW_ID_91_HERE',
};

const CONFIG_FIELD_NAMES = Object.keys(CONFIG_FIELDS);

const isTriggerNode = (node) => {
  const type = String(node?.type || '').toLowerCase();
  return (
    type.endsWith('.webhook') ||
    type.includes('trigger') ||
    type.endsWith('.manualtrigger') ||
    type.endsWith('.scheduletrigger')
  );
};

const expressionForVar = (name) => `$node["${CONFIG_NODE_NAME}"].json["${name}"]`;

const hasValidExpressionSyntax = (value) => {
  if (!value.startsWith('={{') || !value.endsWith('}}')) return true;
  try {
    new Function(`return (${value.slice(3, -2)});`);
    return true;
  } catch {
    return false;
  }
};

const repairTrailingQuoteExpression = (value) => {
  if (!value.startsWith('={{') || !value.endsWith("'}}")) return value;
  if (hasValidExpressionSyntax(value)) return value;

  const repaired = `${value.slice(0, -3)}}}`;
  return hasValidExpressionSyntax(repaired) ? repaired : value;
};

const replaceVarsInString = (value) =>
  repairTrailingQuoteExpression(value
    .replace(/\$vars\.([A-Z0-9_]+)/g, (_match, name) => expressionForVar(name))
    .replace(/\$\(['"]Workflow Config['"]\)\.first\(\)\.json\.([A-Z0-9_]+)/g, (_match, name) =>
      expressionForVar(name)
    ));

const replaceVars = (value) => {
  if (typeof value === 'string') return replaceVarsInString(value);
  if (Array.isArray(value)) return value.map(replaceVars);
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) value[key] = replaceVars(value[key]);
  }
  return value;
};

const makeConfigNode = (position) => ({
  id: 'workflow-config',
  name: CONFIG_NODE_NAME,
  type: 'n8n-nodes-base.set',
  typeVersion: 3.4,
  position,
  parameters: {
    assignments: {
      assignments: Object.entries(CONFIG_FIELDS).map(([name, value]) => ({
        id: name.toLowerCase(),
        name,
        type: 'string',
        value,
      })),
    },
    includeOtherFields: true,
    options: {
      dotNotation: false,
    },
  },
});

const makeCleanupNode = (position) => ({
  id: 'remove-config-from-item',
  name: CLEAN_NODE_NAME,
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position,
  parameters: {
    jsCode:
      `const configKeys = ${JSON.stringify(CONFIG_FIELD_NAMES)};\n` +
      'return $input.all().map((item) => {\n' +
      '  const json = { ...(item.json || {}) };\n' +
      '  for (const key of configKeys) delete json[key];\n' +
      '  return { ...item, json };\n' +
      '});',
  },
});

const mainRoute = (nodeName) => ({
  node: nodeName,
  type: 'main',
  index: 0,
});

const flattenMainRoutes = (outputs) => {
  const routes = [];
  for (const output of outputs || []) {
    for (const route of output || []) {
      if (route?.node) routes.push(route);
    }
  }
  return routes;
};

const uniqueRoutes = (routes) => {
  const seen = new Set();
  const result = [];
  for (const route of routes) {
    const key = `${route.node}:${route.type || 'main'}:${route.index || 0}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(route);
  }
  return result;
};

const getIncomingTargets = (connections) => {
  const targets = new Set();
  for (const outputs of Object.values(connections || {})) {
    for (const branch of Object.values(outputs || {})) {
      for (const routeList of branch || []) {
        for (const route of routeList || []) {
          if (route?.node) targets.add(route.node);
        }
      }
    }
  }
  return targets;
};

const inferFirstBusinessRoute = (workflow, triggerNodes) => {
  const incoming = getIncomingTargets(workflow.connections || {});
  const triggerNames = new Set(triggerNodes.map((node) => node.name));
  const [triggerX, triggerY] = Array.isArray(triggerNodes[0]?.position) ? triggerNodes[0].position : [-680, 20];
  const candidates = (workflow.nodes || [])
    .filter((node) => {
      if (triggerNames.has(node.name)) return false;
      if (node.name === CONFIG_NODE_NAME || node.name === CLEAN_NODE_NAME) return false;
      if (String(node.type || '').includes('stickyNote')) return false;
      if (incoming.has(node.name)) return false;
      return true;
    })
    .sort((a, b) => {
      const [ax, ay] = Array.isArray(a.position) ? a.position : [0, 0];
      const [bx, by] = Array.isArray(b.position) ? b.position : [0, 0];
      const aScore = Math.abs(ax - triggerX) + Math.abs(ay - triggerY) / 4;
      const bScore = Math.abs(bx - triggerX) + Math.abs(by - triggerY) / 4;
      return aScore - bScore;
    });
  return candidates[0] ? [mainRoute(candidates[0].name)] : [];
};

const applyLocalConfig = (workflow) => {
  const existingCleanupRoutes = flattenMainRoutes(workflow.connections?.[CLEAN_NODE_NAME]?.main);

  workflow.nodes = (workflow.nodes || []).filter(
    (node) => node.name !== CONFIG_NODE_NAME && node.name !== CLEAN_NODE_NAME
  );
  delete workflow.connections?.[CONFIG_NODE_NAME];
  delete workflow.connections?.[CLEAN_NODE_NAME];

  workflow = replaceVars(workflow);

  const triggerNodes = (workflow.nodes || []).filter(isTriggerNode);
  if (!triggerNodes.length) return workflow;

  workflow.connections = workflow.connections || {};

  const originalRoutes = [];
  for (const trigger of triggerNodes) {
    originalRoutes.push(
      ...flattenMainRoutes(workflow.connections[trigger.name]?.main).filter(
        (route) => route.node !== CONFIG_NODE_NAME && route.node !== CLEAN_NODE_NAME
      )
    );
  }

  if (!originalRoutes.length && existingCleanupRoutes.length) {
    originalRoutes.push(
      ...existingCleanupRoutes.filter((route) => route.node !== CONFIG_NODE_NAME && route.node !== CLEAN_NODE_NAME)
    );
  }

  if (!originalRoutes.length) {
    originalRoutes.push(...inferFirstBusinessRoute(workflow, triggerNodes));
  }

  if (!originalRoutes.length) return workflow;

  const firstTrigger = triggerNodes[0];
  const [x, y] = Array.isArray(firstTrigger.position) ? firstTrigger.position : [-680, 20];
  workflow.nodes.push(makeConfigNode([x + 240, y]));
  workflow.nodes.push(makeCleanupNode([x + 480, y]));

  for (const trigger of triggerNodes) {
    workflow.connections[trigger.name] = {
      ...(workflow.connections[trigger.name] || {}),
      main: [[mainRoute(CONFIG_NODE_NAME)]],
    };
  }

  workflow.connections[CONFIG_NODE_NAME] = {
    main: [[mainRoute(CLEAN_NODE_NAME)]],
  };
  workflow.connections[CLEAN_NODE_NAME] = {
    main: [uniqueRoutes(originalRoutes)],
  };

  return workflow;
};

if (!fs.existsSync(workflowsDir)) {
  throw new Error(`Missing workflows directory: ${workflowsDir}`);
}

let changed = 0;
for (const file of fs.readdirSync(workflowsDir).filter((name) => name.endsWith('.json')).sort()) {
  const fullPath = path.join(workflowsDir, file);
  const before = fs.readFileSync(fullPath, 'utf8');
  const workflow = JSON.parse(before);
  const next = `${JSON.stringify(applyLocalConfig(workflow), null, 2)}\n`;
  if (next !== before) {
    fs.writeFileSync(fullPath, next, 'utf8');
    changed += 1;
  }
}

console.log(`Applied local Workflow Config node to ${changed} workflow export(s).`);
