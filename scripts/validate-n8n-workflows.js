import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const workflowsDir = path.join(root, 'workflows');
const docsDir = path.join(root, 'docs');
const envExamplePath = path.join(root, '.env.example');

const requiredDocs = [
  'N8N_WORKFLOWS_IMPLEMENTATION_SPEC.md',
  'N8N_IMPORT_GUIDE.md',
  'N8N_CREDENTIALS_GUIDE.md',
  'N8N_TEST_PAYLOADS.md',
  'N8N_ERROR_HANDLING.md',
  'N8N_DEPLOYMENT_CHECKLIST.md',
  'N8N_WORKFLOW_DEPENDENCIES.md',
];

const secretPatterns = [
  { name: 'OpenAI key', pattern: /sk-[A-Za-z0-9_-]{20,}/ },
  { name: 'Meta token', pattern: /EAA[A-Za-z0-9]{20,}/ },
  { name: 'Slack token', pattern: /xox[baprs]-[A-Za-z0-9-]+/ },
  { name: 'JWT-like token', pattern: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/ },
  { name: 'database URL with password', pattern: /postgres(?:ql)?:\/\/[^:\s]+:[^@\s]+@/i },
  { name: 'hardcoded token assignment', pattern: /(access[_-]?token|api[_-]?key|password|secret)["']?\s*[:=]\s*["'][A-Za-z0-9._-]{16,}["']/i },
];

const errors = [];
const warnings = [];
const workflowFiles = fs.existsSync(workflowsDir)
  ? fs.readdirSync(workflowsDir).filter((file) => file.endsWith('.json')).sort()
  : [];

if (!workflowFiles.length) {
  errors.push('No workflow JSON exports found under workflows/.');
}

const docs = requiredDocs
  .map((file) => {
    const fullPath = path.join(docsDir, file);
    if (!fs.existsSync(fullPath)) {
      errors.push(`Missing required documentation file: docs/${file}.`);
      return '';
    }
    return fs.readFileSync(fullPath, 'utf8');
  })
  .join('\n\n');

const envExample = fs.existsSync(envExamplePath) ? fs.readFileSync(envExamplePath, 'utf8') : '';
if (!envExample) {
  errors.push('Missing .env.example for required environment variable documentation.');
}

const allWorkflowEnvVars = new Set();
const allExecuteRefs = new Set();

const collectStrings = (value, output = []) => {
  if (typeof value === 'string') {
    output.push(value);
    return output;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, output);
    return output;
  }
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) collectStrings(item, output);
  }
  return output;
};

const getConnectionTargets = (connections) => {
  const targets = [];
  for (const outputs of Object.values(connections || {})) {
    for (const branch of Object.values(outputs || {})) {
      for (const routeList of branch || []) {
        for (const route of routeList || []) {
          if (route?.node) targets.push(route.node);
        }
      }
    }
  }
  return targets;
};

const detectCycles = (workflow) => {
  const graph = new Map();
  for (const node of workflow.nodes || []) graph.set(node.name, []);
  for (const [from, outputs] of Object.entries(workflow.connections || {})) {
    for (const branch of Object.values(outputs || {})) {
      for (const routeList of branch || []) {
        for (const route of routeList || []) {
          if (route?.node) graph.get(from)?.push(route.node);
        }
      }
    }
  }

  const visiting = new Set();
  const visited = new Set();
  const cycles = [];

  const visit = (node, stack) => {
    if (visiting.has(node)) {
      cycles.push([...stack, node].join(' -> '));
      return;
    }
    if (visited.has(node)) return;
    visiting.add(node);
    for (const next of graph.get(node) || []) visit(next, [...stack, node]);
    visiting.delete(node);
    visited.add(node);
  };

  for (const node of graph.keys()) visit(node, []);
  return cycles;
};

for (const file of workflowFiles) {
  const workflowPath = path.join(workflowsDir, file);
  const raw = fs.readFileSync(workflowPath, 'utf8');
  let workflow;

  try {
    workflow = JSON.parse(raw);
  } catch (error) {
    errors.push(`${file}: invalid JSON: ${error.message}`);
    continue;
  }

  if (!workflow.name || typeof workflow.name !== 'string') {
    errors.push(`${file}: workflow name is missing or invalid.`);
  }

  if (!Array.isArray(workflow.nodes) || workflow.nodes.length === 0) {
    errors.push(`${file}: nodes array is missing or empty.`);
  }

  if (!workflow.connections || typeof workflow.connections !== 'object') {
    errors.push(`${file}: connections object is missing.`);
  }

  for (const secret of secretPatterns) {
    if (secret.pattern.test(raw)) {
      errors.push(`${file}: possible embedded ${secret.name}.`);
    }
  }

  const strings = collectStrings(workflow);
  for (const value of strings) {
    for (const match of value.matchAll(/\$vars\.([A-Z0-9_]+)/g)) {
      allWorkflowEnvVars.add(match[1]);
    }
    for (const match of value.matchAll(/\$\(['"]Workflow Config['"]\)\.first\(\)\.json\.([A-Z0-9_]+)/g)) {
      allWorkflowEnvVars.add(match[1]);
    }

    if (/9715\d{8}/.test(value) && !value.includes('971500000000')) {
      errors.push(`${file}: possible production UAE mobile number found in workflow string.`);
    }
  }

  const nodeNames = new Set((workflow.nodes || []).map((node) => node.name));
  const nodeIds = new Set((workflow.nodes || []).map((node) => node.id));

  for (const node of workflow.nodes || []) {
    if (!node.id || !node.name || !node.type) {
      errors.push(`${file}: node is missing id, name, or type.`);
    }

    if (node.type === 'n8n-nodes-base.httpRequest') {
      const url = node.parameters?.url;
      if (typeof url !== 'string' || !url.trim() || url.trim() === '={{}}') {
        errors.push(`${file}: HTTP node "${node.name}" has an empty URL.`);
      }
      if (!node.parameters?.options?.timeout) {
        warnings.push(`${file}: HTTP node "${node.name}" has no explicit timeout.`);
      }
    }

    if (node.type === 'n8n-nodes-base.executeWorkflow') {
      const workflowId = String(node.parameters?.workflowId || '');
      const envMatch = workflowId.match(/\$vars\.([A-Z0-9_]+)/);
      const configMatch = workflowId.match(/\$\(['"]Workflow Config['"]\)\.first\(\)\.json\.([A-Z0-9_]+)/);
      if (!envMatch && !configMatch) {
        errors.push(`${file}: Execute Workflow node "${node.name}" does not reference an environment variable or Workflow Config field.`);
      } else {
        allExecuteRefs.add((envMatch || configMatch)[1]);
      }
    }
  }

  for (const source of Object.keys(workflow.connections || {})) {
    if (!nodeNames.has(source) && !nodeIds.has(source)) {
      errors.push(`${file}: connection source "${source}" does not match a node name or id.`);
    }
  }

  for (const target of getConnectionTargets(workflow.connections)) {
    if (!nodeNames.has(target) && !nodeIds.has(target)) {
      errors.push(`${file}: connection target "${target}" does not match a node name or id.`);
    }
  }

  for (const cycle of detectCycles(workflow)) {
    errors.push(`${file}: workflow cycle detected: ${cycle}.`);
  }

  if (!raw.includes('correlationId') && file !== '91-retry-queue.json') {
    warnings.push(`${file}: correlationId marker not found.`);
  }
}

for (const envVar of allExecuteRefs) {
  if (!docs.includes(envVar)) {
    errors.push(`Execute Workflow reference ${envVar} is not documented in required docs.`);
  }
}

for (const envVar of allWorkflowEnvVars) {
  if (!docs.includes(envVar) && !envExample.includes(envVar)) {
    errors.push(`Environment variable ${envVar} is not documented in docs or .env.example.`);
  }
}

for (const envVar of allWorkflowEnvVars) {
  if (!envExample.includes(envVar)) {
    warnings.push(`Environment variable ${envVar} is documented in docs but missing from .env.example.`);
  }
}

if (warnings.length) {
  console.warn('n8n strict validation warnings:');
  for (const warning of warnings) console.warn(`- ${warning}`);
}

if (errors.length) {
  console.error('n8n strict workflow validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Strictly validated ${workflowFiles.length} workflow exports, ${allExecuteRefs.size} Execute Workflow references, and ${allWorkflowEnvVars.size} environment variables.`
);
