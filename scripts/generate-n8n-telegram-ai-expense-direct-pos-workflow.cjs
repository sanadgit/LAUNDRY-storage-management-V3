const fs = require('fs');
const path = require('path');

const codeNode = String.raw`
const vars = (typeof $vars === 'object' && $vars) ? $vars : {};
const trim = (value, fallback = '') => String(value ?? fallback).trim();
const num = (value, fallback = 0) => {
  const parsed = Number(String(value ?? '').replace(/,/g, ''));
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : fallback;
};
const money = (value) => num(value, 0).toFixed(2);
const todayDubai = () => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Dubai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date());
const compact = (value, max = 3500) => {
  const text = trim(value);
  return text.length > max ? text.slice(0, max - 3) + '...' : text;
};

const TELEGRAM_BOT_TOKEN = trim(vars.TELEGRAM_BOT_TOKEN);
const OPENAI_API_KEY = trim(vars.OPENAI_API_KEY);
const OPENAI_MODEL = trim(vars.OPENAI_MODEL, 'gpt-4.1-mini');
const POS_USERNAME = trim(vars.POS_USERNAME);
const POS_PASSWORD = trim(vars.POS_PASSWORD);
const CLIENT_IDENTIFIER = trim(vars.AIPSOFT_CLIENT_IDENTIFIER, 'inout') || 'inout';
const POS_BASE_URL = trim(vars.AIPSOFT_API_BASE_URL, 'https://beta.aipsoft.com/inout').replace(/\/$/, '');
const POS_LOGIN_ENDPOINT = trim(vars.POS_LOGIN_ENDPOINT, POS_BASE_URL + '/login/check');
const POS_LOGIN_REFERER = trim(vars.POS_LOGIN_REFERER, POS_BASE_URL + '/accounts/expenses');
const POS_ORIGIN = trim(vars.POS_ORIGIN, 'https://beta.aipsoft.com');
const ALLOWED_CHAT_IDS = trim(vars.TELEGRAM_ALLOWED_CHAT_ID)
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);
const DEFAULT_BRANCH_ID = trim(vars.DEFAULT_BRANCH_ID, '1');
const DEFAULT_BRANCH_NAME = trim(vars.DEFAULT_BRANCH_NAME, 'AL FALAH');
const DEFAULT_PAY_ACCOUNT_ID = trim(vars.DEFAULT_PAY_ACCOUNT_ID);
const DEFAULT_PAY_ACCOUNT_NAME = trim(vars.DEFAULT_PAY_ACCOUNT_NAME, 'Credit');
const DEFAULT_PAID_BY_NAME = trim(vars.DEFAULT_PAID_BY_NAME, 'SAOOD');
const DEFAULT_PAID_BY_ID = trim(vars.DEFAULT_PAID_BY_ID || vars.AIPSOFT_API_USER_ID);
const AIPSOFT_API_USER_ID = trim(vars.AIPSOFT_API_USER_ID || DEFAULT_PAID_BY_ID);
const DEFAULT_EXPENSE_TYPE = trim(vars.DEFAULT_EXPENSE_TYPE, '2');

const required = [];
if (!TELEGRAM_BOT_TOKEN) required.push('TELEGRAM_BOT_TOKEN');
if (!OPENAI_API_KEY) required.push('OPENAI_API_KEY');
if (!POS_USERNAME) required.push('POS_USERNAME');
if (!POS_PASSWORD) required.push('POS_PASSWORD');
if (!DEFAULT_PAY_ACCOUNT_ID) required.push('DEFAULT_PAY_ACCOUNT_ID');
if (!DEFAULT_PAID_BY_ID) required.push('DEFAULT_PAID_BY_ID or AIPSOFT_API_USER_ID');
if (required.length) {
  throw new Error('Missing n8n Variables: ' + required.join(', '));
}

const update = $json.body && typeof $json.body === 'object' ? $json.body : $json;
const callback = update.callback_query;
const message = update.message || update.edited_message || callback?.message || {};
const callbackData = trim(callback?.data);
const chatId = trim(message.chat?.id);
const messageId = message.message_id;
const userName = trim(message.from?.username || callback?.from?.username || message.from?.first_name || callback?.from?.first_name, 'manager');

if (!chatId) return [{ json: { ok: true, ignored: 'missing_chat_id' } }];
if (ALLOWED_CHAT_IDS.length && !ALLOWED_CHAT_IDS.includes(chatId)) {
  return [{ json: { ok: true, ignored: 'unauthorized_chat', chat_id: chatId } }];
}

async function httpJSON(method, url, body, headers = {}) {
  return await this.helpers.httpRequest({
    method,
    url,
    headers,
    body,
    json: true,
    timeout: 120000,
  });
}

async function telegram(method, payload) {
  return await httpJSON.call(this, 'POST', 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/' + method, payload, {
    'Content-Type': 'application/json',
  });
}

async function sendMessage(text, extra = {}) {
  return await telegram.call(this, 'sendMessage', {
    chat_id: chatId,
    text: compact(text, 3900),
    disable_web_page_preview: true,
    ...extra,
  });
}

async function answerCallback(text) {
  if (!callback?.id) return;
  try {
    await telegram.call(this, 'answerCallbackQuery', {
      callback_query_id: callback.id,
      text: compact(text, 180),
      show_alert: false,
    });
  } catch {}
}

function getStore() {
  const data = $getWorkflowStaticData('global');
  if (!data.expenseDrafts || typeof data.expenseDrafts !== 'object') data.expenseDrafts = {};
  return data.expenseDrafts;
}

function parseJsonText(text, label) {
  const fence = String.fromCharCode(96).repeat(3);
  let raw = trim(text);
  if (raw.toLowerCase().startsWith(fence + 'json')) raw = raw.slice(7);
  else if (raw.startsWith(fence)) raw = raw.slice(3);
  if (raw.endsWith(fence)) raw = raw.slice(0, -3);
  raw = raw.trim();
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(label + ' returned invalid JSON: ' + raw.slice(0, 500));
  }
}

function responseText(response) {
  if (typeof response?.output_text === 'string') return response.output_text;
  const parts = [];
  for (const output of response?.output || []) {
    for (const content of output?.content || []) {
      if (typeof content?.text === 'string') parts.push(content.text);
    }
  }
  return parts.join('\n');
}

async function openaiExtract(input) {
  const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      supplier_name: { type: 'string' },
      invoice_no: { type: 'string' },
      invoice_date: { type: 'string' },
      currency: { type: 'string' },
      subtotal: { type: 'number' },
      vat_amount: { type: 'number' },
      total: { type: 'number' },
      description: { type: 'string' },
      suggested_account_query: { type: 'string' },
      suggested_account_name: { type: 'string' },
      confidence: { type: 'number' },
      needs_human_review: { type: 'boolean' },
      warnings: { type: 'array', items: { type: 'string' } },
    },
    required: [
      'supplier_name',
      'invoice_no',
      'invoice_date',
      'currency',
      'subtotal',
      'vat_amount',
      'total',
      'description',
      'suggested_account_query',
      'suggested_account_name',
      'confidence',
      'needs_human_review',
      'warnings',
    ],
  };
  const today = todayDubai();
  const prompt = [
    'You are an accounting assistant for IN AND OUT LAUNDRY UAE.',
    'Extract invoice expense data from the provided Telegram invoice.',
    'Return JSON only.',
    'Use AED unless another currency is clearly printed.',
    'UAE VAT is usually 5%. If total includes VAT, split subtotal and VAT when possible.',
    'If invoice number is missing, use an empty string.',
    'If date is missing, use ' + today + ' and add a warning.',
    'suggested_account_query must be short, such as petrol, chemicals, maintenance, rent, electricity, internet, insurance, visa, salary, software, delivery, miscellaneous.',
    'Never invent supplier TRN or invoice number.',
    'Telegram text/caption: ' + compact(input.text || '', 2500),
  ].join('\n');
  const content = [{ type: 'input_text', text: prompt }];
  if (input.file_url && input.input_type === 'image') {
    content.push({ type: 'input_image', image_url: input.file_url });
  }
  if (input.file_url && input.input_type === 'pdf') {
    content.push({ type: 'input_file', file_url: input.file_url });
  }
  const response = await httpJSON.call(this, 'POST', 'https://api.openai.com/v1/responses', {
    model: OPENAI_MODEL,
    input: [{ role: 'user', content }],
    text: {
      format: {
        type: 'json_schema',
        name: 'invoice_expense_extraction',
        strict: true,
        schema,
      },
    },
  }, {
    Authorization: 'Bearer ' + OPENAI_API_KEY,
    'Content-Type': 'application/json',
  });
  return parseJsonText(responseText(response), 'OpenAI extraction');
}

async function openaiEditPatch(instruction, draft) {
  const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      bill_no: { type: 'string' },
      date: { type: 'string' },
      bill_date: { type: 'string' },
      supplier_name: { type: 'string' },
      description: { type: 'string' },
      account_head: { type: 'string' },
      account_name: { type: 'string' },
      amount: { type: 'number' },
      tax_amount: { type: 'number' },
      total: { type: 'number' },
      remark: { type: 'string' },
      notes: { type: 'string' },
    },
    required: ['bill_no', 'date', 'bill_date', 'supplier_name', 'description', 'account_head', 'account_name', 'amount', 'tax_amount', 'total', 'remark', 'notes'],
  };
  const prompt = [
    'Convert the manager Arabic/English edit instruction into JSON patch for this POS expense draft.',
    'If a field is not mentioned, return an empty string for text fields and 0 for numeric fields.',
    'Current draft:',
    JSON.stringify(draft, null, 2),
    'Instruction:',
    instruction,
  ].join('\n');
  const response = await httpJSON.call(this, 'POST', 'https://api.openai.com/v1/responses', {
    model: OPENAI_MODEL,
    input: [{ role: 'user', content: [{ type: 'input_text', text: prompt }] }],
    text: { format: { type: 'json_schema', name: 'expense_edit_patch', strict: true, schema } },
  }, {
    Authorization: 'Bearer ' + OPENAI_API_KEY,
    'Content-Type': 'application/json',
  });
  return parseJsonText(responseText(response), 'OpenAI edit patch');
}

const formEncode = (params) => Object.entries(params || {})
  .flatMap(([key, value]) => Array.isArray(value) ? value.map((entry) => [key, entry]) : [[key, value]])
  .map(([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(String(value ?? '')))
  .join('&');

const parseCookieHeader = (cookieHeader) => {
  const map = new Map();
  for (const part of String(cookieHeader || '').split(';')) {
    const segment = part.trim();
    if (!segment) continue;
    const eq = segment.indexOf('=');
    if (eq <= 0) continue;
    map.set(segment.slice(0, eq).trim(), segment.slice(eq + 1).trim());
  }
  return map;
};

const normalizeHeaders = (headers = {}) => {
  const out = {};
  if (headers && typeof headers.forEach === 'function') {
    headers.forEach((value, key) => { out[String(key).toLowerCase()] = value; });
    if (typeof headers.getSetCookie === 'function') out['set-cookie'] = headers.getSetCookie();
    return out;
  }
  for (const [key, value] of Object.entries(headers || {})) out[String(key).toLowerCase()] = value;
  return out;
};

const getSetCookies = (headers = {}) => {
  const raw = normalizeHeaders(headers)['set-cookie'];
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return String(raw).split(/,(?=\s*[^;,\s]+=)/g).map((value) => value.trim()).filter(Boolean);
};

const mergeCookieHeaders = (baseCookieHeader, setCookies) => {
  const merged = parseCookieHeader(baseCookieHeader);
  for (const setCookie of setCookies || []) {
    const cookiePart = String(setCookie || '').split(';')[0]?.trim();
    const eq = cookiePart.indexOf('=');
    if (eq <= 0) continue;
    merged.set(cookiePart.slice(0, eq).trim(), cookiePart.slice(eq + 1).trim());
  }
  return Array.from(merged.entries()).map(([key, value]) => key + '=' + value).join('; ');
};

const hasMinimalCookie = (cookieHeader) => /ci_session_/i.test(String(cookieHeader || '')) && /\binout=/i.test(String(cookieHeader || ''));

const isLoginHtml = (text) => {
  const lower = String(text || '').toLowerCase();
  return lower.includes(':: login') || lower.includes('login/check') || lower.includes('name="password"') || lower.includes("name='password'");
};

async function requestFull(options) {
  const response = await this.helpers.httpRequest({
    method: options.method || 'POST',
    url: options.url,
    headers: options.headers || {},
    body: options.body,
    json: false,
    returnFullResponse: true,
    resolveWithFullResponse: true,
    simple: false,
    timeout: 120000,
  });
  if (response && typeof response === 'object' && (response.headers || Object.prototype.hasOwnProperty.call(response, 'body'))) {
    return {
      statusCode: response.statusCode || response.status || 0,
      headers: response.headers || {},
      body: typeof response.body === 'string' ? response.body : JSON.stringify(response.body ?? ''),
    };
  }
  return { statusCode: 0, headers: {}, body: typeof response === 'string' ? response : JSON.stringify(response ?? '') };
}

function parseJson(text, label) {
  try {
    return JSON.parse(String(text || ''));
  } catch {
    throw new Error(label + ' returned non-JSON response: ' + String(text || '').slice(0, 300));
  }
}

function posHeaders(cookieHeader) {
  return {
    Accept: 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8,ar;q=0.7',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    Origin: POS_ORIGIN,
    Referer: POS_LOGIN_REFERER,
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    Cookie: cookieHeader,
  };
}

async function createPosSession() {
  let cookieHeader = 'language=english; direction=ltr; dont_show_today=true';
  try {
    const preflight = await requestFull.call(this, {
      method: 'GET',
      url: POS_LOGIN_REFERER,
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        Cookie: cookieHeader,
      },
    });
    cookieHeader = mergeCookieHeaders(cookieHeader, getSetCookies(preflight.headers));
  } catch {}

  const usernameBeforeAt = POS_USERNAME.includes('@') ? POS_USERNAME.split('@')[0].trim() : POS_USERNAME;
  const usernames = Array.from(new Set([
    POS_USERNAME,
    POS_USERNAME.toLowerCase(),
    usernameBeforeAt,
    usernameBeforeAt.toLowerCase(),
    usernameBeforeAt ? usernameBeforeAt + '@' + CLIENT_IDENTIFIER : '',
    usernameBeforeAt ? usernameBeforeAt.toLowerCase() + '@' + CLIENT_IDENTIFIER : '',
  ].filter(Boolean)));

  let authed = false;
  let usedUsername = '';
  let lastLoginBody = '';
  for (const username of usernames) {
    const loginBody = formEncode({
      username,
      password: POS_PASSWORD,
      client_identifier: CLIENT_IDENTIFIER,
      auto_login: 'null',
      connection_path: 'null',
    });
    const loginResponse = await requestFull.call(this, {
      method: 'POST',
      url: POS_LOGIN_ENDPOINT,
      headers: posHeaders(cookieHeader),
      body: loginBody,
    });
    cookieHeader = mergeCookieHeaders(cookieHeader, getSetCookies(loginResponse.headers));
    lastLoginBody = String(loginResponse.body || '');
    const lower = lastLoginBody.toLowerCase();
    const ok = lower.includes('login_success') || lower.includes('password_ok') || ((loginResponse.statusCode >= 200 && loginResponse.statusCode < 400) && !isLoginHtml(lastLoginBody));
    if (ok && hasMinimalCookie(cookieHeader)) {
      authed = true;
      usedUsername = username;
      break;
    }
  }
  if (!authed) throw new Error('POS login failed. Last response: ' + lastLoginBody.slice(0, 240));

  async function postApi(path, data, label) {
    const response = await requestFull.call(this, {
      method: 'POST',
      url: POS_BASE_URL + path,
      headers: posHeaders(cookieHeader),
      body: formEncode(data || {}),
    });
    cookieHeader = mergeCookieHeaders(cookieHeader, getSetCookies(response.headers));
    if (isLoginHtml(response.body)) throw new Error(label + ' returned login page. Check POS permission.');
    return parseJson(response.body, label);
  }

  return { postApi: postApi.bind(this), usedUsername: () => usedUsername };
}

const fallbackAccounts = [
  { id: '44291', text: 'petrol exp', keys: ['petrol', 'fuel', 'adnoc', 'gasoline', 'diesel'] },
  { id: '36460', text: 'Chemicals Purchases', keys: ['chemical', 'chemicals', 'detergent', 'soap', 'laundry supplies'] },
  { id: '44337', text: 'Car Expenses', keys: ['car', 'vehicle', 'motorcycle', 'repair', 'garage', 'tyre'] },
  { id: '44775', text: 'maintenance machine', keys: ['maintenance', 'machine', 'spare', 'parts'] },
  { id: '46298', text: 'rents', keys: ['rent', 'rents'] },
  { id: '52253', text: 'Internet+Phone', keys: ['internet', 'phone', 'du', 'etisalat', 'telecom'] },
  { id: '54265', text: 'WATER-Electricity', keys: ['water', 'electricity', 'taqa', 'utility'] },
  { id: '61639', text: 'IT & Software', keys: ['software', 'computer', 'it', 'subscription'] },
  { id: '66287', text: 'Traffic Fines', keys: ['police', 'fine', 'traffic'] },
  { id: '33958', text: 'Miscellaneous Account', keys: ['misc', 'other', 'unknown', 'miscellaneous'] },
];

async function findAccount(extracted) {
  const query = trim(extracted.suggested_account_query || extracted.suggested_account_name || extracted.description || 'miscellaneous');
  let accounts = [];
  try {
    const session = await createPosSession.call(this);
    const result = await session.postApi('/purchase_api/accountHeadList/' + encodeURIComponent(CLIENT_IDENTIFIER) + '/' + encodeURIComponent(query), {}, 'accountHeadList');
    const data = Array.isArray(result?.data) ? result.data : [];
    accounts = data.map((item) => ({
      id: trim(item?.id),
      text: trim(item?.text || item?.acc_name1),
      raw: item,
    })).filter((item) => item.id && item.text);
  } catch {}
  if (accounts.length) {
    const q = query.toLowerCase();
    const exact = accounts.find((account) => trim(account.text).toLowerCase().includes(q));
    return { id: trim((exact || accounts[0]).id), text: trim((exact || accounts[0]).text), source: 'direct_pos_search', choices: accounts.slice(0, 5) };
  }
  const haystack = [query, extracted.supplier_name, extracted.description, extracted.suggested_account_name].join(' ').toLowerCase();
  const fallback = fallbackAccounts.find((account) => account.keys.some((key) => haystack.includes(key))) || fallbackAccounts[fallbackAccounts.length - 1];
  return { id: fallback.id, text: fallback.text, source: 'fallback_map', choices: [] };
}

function buildPayload(extracted, account) {
  const total = num(extracted.total);
  const tax = num(extracted.vat_amount);
  const subtotal = num(extracted.subtotal, Math.max(total - tax, 0));
  const date = /^\d{4}-\d{2}-\d{2}$/.test(trim(extracted.invoice_date)) ? trim(extracted.invoice_date) : todayDubai();
  const billNo = trim(extracted.invoice_no);
  const supplier = trim(extracted.supplier_name, 'Unknown supplier');
  const description = trim(extracted.description, 'Invoice expense');
  return {
    user_id: AIPSOFT_API_USER_ID,
    paid_by: DEFAULT_PAID_BY_NAME,
    paid_by_id: DEFAULT_PAID_BY_ID,
    paid_user_id: DEFAULT_PAID_BY_ID,
    branch_id: DEFAULT_BRANCH_ID,
    pay_account: DEFAULT_PAY_ACCOUNT_ID,
    date,
    bill_date: date,
    bill_no: billNo,
    remark: compact(supplier + (billNo ? ' - Bill #' + billNo : '') + ' - ' + description, 240),
    vendor_id: '',
    project_id: '',
    order_no: '',
    expense_type: DEFAULT_EXPENSE_TYPE,
    lines: [{
      account_head: account.id,
      notes: compact(supplier + (billNo ? ' - Bill #' + billNo : '') + ' - ' + description, 240),
      amount: subtotal,
      tax_amount: tax,
      total: total || num(subtotal + tax),
    }],
  };
}

function draftId() {
  const stamp = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dubai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date()).replace(/[^\d]/g, '');
  return 'EXP-' + stamp + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
}

function reviewMessage(id, draft) {
  const p = draft.payload;
  const line = p.lines[0];
  const warnings = (draft.extracted.warnings || []).filter(Boolean);
  return [
    'فاتورة جاهزة للمراجعة',
    '',
    'Draft: ' + id,
    'الفرع: ' + DEFAULT_BRANCH_NAME + ' (' + p.branch_id + ')',
    'Paid By: ' + p.paid_by + ' / ' + p.paid_by_id,
    'Pay Account: ' + DEFAULT_PAY_ACCOUNT_NAME + ' / ' + p.pay_account,
    '',
    'المورد: ' + draft.extracted.supplier_name,
    'رقم الفاتورة: ' + (p.bill_no || '-'),
    'التاريخ: ' + p.bill_date,
    'حساب المصروف: ' + draft.account.text + ' (' + line.account_head + ')',
    'الوصف: ' + line.notes,
    'المبلغ قبل الضريبة: AED ' + money(line.amount),
    'VAT: AED ' + money(line.tax_amount),
    'الإجمالي: AED ' + money(line.total),
    'الثقة: ' + Math.round(num(draft.extracted.confidence) * 100) + '%',
    warnings.length ? 'تنبيهات: ' + warnings.join(' | ') : '',
    '',
    'للموافقة اكتب: موافق ' + id,
    'للتعديل اكتب: تعديل ' + id + ' amount=100 tax_amount=5 total=105 account_head=44291',
    'للإلغاء اكتب: إلغاء ' + id,
  ].filter(Boolean).join('\n');
}

function applyPatchToDraft(draft, patch) {
  const line = draft.payload.lines[0];
  if (trim(patch.bill_no)) draft.payload.bill_no = trim(patch.bill_no);
  if (trim(patch.date)) draft.payload.date = trim(patch.date);
  if (trim(patch.bill_date)) draft.payload.bill_date = trim(patch.bill_date);
  if (trim(patch.remark)) draft.payload.remark = trim(patch.remark);
  if (trim(patch.notes)) line.notes = trim(patch.notes);
  if (trim(patch.account_head)) line.account_head = trim(patch.account_head);
  if (trim(patch.account_name)) draft.account.text = trim(patch.account_name);
  if (num(patch.amount) > 0) line.amount = num(patch.amount);
  if (String(patch.tax_amount ?? '').trim() !== '') line.tax_amount = num(patch.tax_amount);
  if (num(patch.total) > 0) line.total = num(patch.total);
  if (!line.total && (line.amount || line.tax_amount)) line.total = num(line.amount + line.tax_amount);
  if (trim(patch.supplier_name)) draft.extracted.supplier_name = trim(patch.supplier_name);
  if (trim(patch.description)) draft.extracted.description = trim(patch.description);
  draft.updated_at = new Date().toISOString();
}

function parseKeyValuePatch(text) {
  const patch = {};
  const regex = /([a-zA-Z_]+)=("[^"]*"|'[^']*'|\S+)/g;
  let match;
  while ((match = regex.exec(text))) {
    const key = match[1];
    let value = match[2];
    value = value.replace(/^["']|["']$/g, '');
    patch[key] = value;
  }
  return patch;
}

function commandFromText() {
  const text = callbackData || trim(message.text || '');
  if (callbackData.startsWith('approve:')) return { action: 'approve', id: callbackData.slice('approve:'.length).trim(), rest: '' };
  if (callbackData.startsWith('cancel:')) return { action: 'cancel', id: callbackData.slice('cancel:'.length).trim(), rest: '' };
  let match = text.match(/^(موافق|approve|ok)\s+([A-Z0-9-]+)/i);
  if (match) return { action: 'approve', id: match[2], rest: '' };
  match = text.match(/^(إلغاء|الغاء|cancel)\s+([A-Z0-9-]+)/i);
  if (match) return { action: 'cancel', id: match[2], rest: '' };
  match = text.match(/^(تعديل|edit)\s+([A-Z0-9-]+)\s*([\s\S]*)/i);
  if (match) return { action: 'edit', id: match[2], rest: trim(match[3]) };
  return { action: 'intake', id: '', rest: text };
}

async function registerExpense(draft) {
  if (!draft.payload.paid_by_id || !draft.payload.paid_user_id) throw new Error('paid_by_id is required before creating expense.');
  const session = await createPosSession.call(this);
  const payload = draft.payload;
  const header = {
    user_id: payload.user_id,
    paid_by: payload.paid_by,
    paid_by_id: payload.paid_by_id,
    paid_user_id: payload.paid_user_id,
    branch_id: payload.branch_id,
    pay_account: payload.pay_account,
    date: payload.date,
    remark: payload.remark,
    client_identifier: CLIENT_IDENTIFIER,
    bill_date: payload.bill_date,
    bill_no: payload.bill_no,
    account_segment_id: payload.account_segment_id || '',
    account_class_id: payload.account_class_id || '',
    project_id: payload.project_id || '',
    party_account: payload.party_account || payload.vendor_id || '',
    driver_id: payload.driver_id || '',
    expense_id: payload.expense_id || '',
    amount: payload.amount || 0,
  };
  const hold = await session.postApi('/purchase_api/hold_expense', header, 'hold_expense');
  if (Number(hold.status) !== 1 || !hold.expense_id) throw new Error('hold_expense failed: ' + JSON.stringify(hold));

  const expenseId = String(hold.expense_id);
  const detailResponses = [];
  let totalTax = 0;
  let totalAmount = 0;
  for (const line of payload.lines || []) {
    totalTax = num(totalTax + Number(line.tax_amount || 0));
    totalAmount = num(totalAmount + Number(line.total || 0));
    const detail = await session.postApi('/purchase_api/save_expense_details', {
      expense_id: expenseId,
      branch_id: payload.branch_id,
      account_head: line.account_head,
      account_segment_id: header.account_segment_id,
      account_class_id: header.account_class_id,
      amount: line.amount,
      tax_amount: line.tax_amount,
      total: line.total,
      notes: line.notes,
      client_identifier: CLIENT_IDENTIFIER,
      button_type: 'ADD',
      expense_details_id: '',
    }, 'save_expense_details');
    if (Number(detail.status) !== 1) throw new Error('save_expense_details failed: ' + JSON.stringify(detail));
    detailResponses.push(detail);
  }

  const approve = await session.postApi('/purchase_api/approve_expense_data', {
    expense_id: expenseId,
    client_identifier: CLIENT_IDENTIFIER,
    total_tax: totalTax,
    total_amount: totalAmount,
    images: Array.isArray(payload.images) ? payload.images : [],
    user_id: payload.user_id,
    paid_by: payload.paid_by,
    paid_by_id: payload.paid_by_id,
    paid_user_id: payload.paid_user_id,
  }, 'approve_expense_data');
  if (Number(approve.status) !== 1) throw new Error('approve_expense_data failed: ' + JSON.stringify(approve));

  return {
    ok: true,
    expense_id: expenseId,
    header,
    lines: payload.lines,
    total_tax: totalTax,
    total_amount: totalAmount,
    hold_response: hold,
    detail_responses: detailResponses,
    approve_response: approve,
    used_username: session.usedUsername(),
  };
}

function resultExpenseId(result) {
  return trim(result?.expense_id || result?.expenseId || result?.id || result?.data?.expense_id || result?.result?.expense_id || result?.hold_response?.expense_id || 'UNKNOWN');
}

const command = commandFromText();
const store = getStore();

if (command.action === 'approve') {
  const draft = store[command.id];
  if (!draft) {
    await answerCallback.call(this, 'Draft غير موجود');
    await sendMessage.call(this, 'لم أجد هذا الـ Draft: ' + command.id);
    return [{ json: { ok: true, action: 'approve_missing', draft_id: command.id } }];
  }
  if (draft.status === 'registered') {
    await sendMessage.call(this, 'هذا المصروف مسجل سابقاً.\nExpense ID: ' + resultExpenseId(draft.result));
    return [{ json: { ok: true, action: 'already_registered', draft_id: command.id } }];
  }
  await answerCallback.call(this, 'جاري التسجيل');
  const result = await registerExpense.call(this, draft);
  draft.status = 'registered';
  draft.result = result;
  draft.registered_at = new Date().toISOString();
  const id = resultExpenseId(result);
  await sendMessage.call(this, [
    'تم تسجيل المصروف بنجاح',
    'Expense ID: ' + id,
    'الإجمالي: AED ' + money(draft.payload.lines[0].total),
    'الحساب: ' + draft.account.text + ' (' + draft.payload.lines[0].account_head + ')',
    'Paid By: ' + draft.payload.paid_by,
  ].join('\n'));
  return [{ json: { ok: true, action: 'registered', draft_id: command.id, expense_id: id, result } }];
}

if (command.action === 'cancel') {
  const draft = store[command.id];
  if (draft) {
    draft.status = 'cancelled';
    draft.cancelled_at = new Date().toISOString();
  }
  await answerCallback.call(this, 'تم الإلغاء');
  await sendMessage.call(this, 'تم إلغاء تسجيل الفاتورة.\nDraft: ' + command.id);
  return [{ json: { ok: true, action: 'cancelled', draft_id: command.id } }];
}

if (command.action === 'edit') {
  const draft = store[command.id];
  if (!draft) {
    await sendMessage.call(this, 'لم أجد هذا الـ Draft: ' + command.id);
    return [{ json: { ok: true, action: 'edit_missing', draft_id: command.id } }];
  }
  let patch = parseKeyValuePatch(command.rest);
  if (!Object.keys(patch).length && command.rest) {
    patch = await openaiEditPatch.call(this, command.rest, draft);
  }
  applyPatchToDraft(draft, patch);
  await sendMessage.call(this, reviewMessage(command.id, draft), {
    reply_markup: {
      inline_keyboard: [[
        { text: 'موافق', callback_data: 'approve:' + command.id },
        { text: 'إلغاء', callback_data: 'cancel:' + command.id },
      ]],
    },
  });
  return [{ json: { ok: true, action: 'edited', draft_id: command.id, patch } }];
}

let inputType = 'text';
let fileId = '';
let text = trim(message.text || message.caption || command.rest);
if (Array.isArray(message.photo) && message.photo.length) {
  inputType = 'image';
  fileId = message.photo[message.photo.length - 1].file_id;
}
if (message.document?.file_id) {
  const mime = trim(message.document.mime_type);
  if (mime === 'application/pdf' || /\.pdf$/i.test(trim(message.document.file_name))) {
    inputType = 'pdf';
    fileId = message.document.file_id;
  }
}
if (!text && !fileId) {
  await sendMessage.call(this, 'أرسل فاتورة كنص أو صورة أو PDF، وبعدها سأرسل لك ملخص للموافقة.');
  return [{ json: { ok: true, action: 'help' } }];
}

let fileUrl = '';
if (fileId) {
  const fileInfo = await telegram.call(this, 'getFile', { file_id: fileId });
  const filePath = trim(fileInfo?.result?.file_path);
  if (!filePath) throw new Error('Telegram getFile did not return file_path.');
  fileUrl = 'https://api.telegram.org/file/bot' + TELEGRAM_BOT_TOKEN + '/' + filePath;
}

await sendMessage.call(this, 'استلمت الفاتورة. جاري التحليل وتجهيز المسودة...');
const extracted = await openaiExtract.call(this, { input_type: inputType, file_url: fileUrl, text });
const account = await findAccount.call(this, extracted);
const payload = buildPayload(extracted, account);
const id = draftId();
store[id] = {
  status: 'pending_approval',
  created_at: new Date().toISOString(),
  created_by: userName,
  telegram_chat_id: chatId,
  telegram_message_id: messageId,
  input_type: inputType,
  extracted,
  account,
  payload,
};
await sendMessage.call(this, reviewMessage(id, store[id]), {
  reply_markup: {
    inline_keyboard: [[
      { text: 'موافق', callback_data: 'approve:' + id },
      { text: 'إلغاء', callback_data: 'cancel:' + id },
    ]],
  },
});
return [{ json: { ok: true, action: 'draft_created', draft_id: id, input_type: inputType, extracted, account, payload } }];
`;

const workflow = {
  name: 'Telegram AI Expense Approval - Direct POS Auto Login',
  nodes: [
    {
      id: 'note-setup',
      name: 'Setup Notes',
      type: 'n8n-nodes-base.stickyNote',
      typeVersion: 1,
      position: [-740, -360],
      parameters: {
        content: [
          '## Telegram AI Expense Approval',
          '',
          'Telegram group sends invoice as text, image, or PDF.',
          'AI extracts invoice fields, n8n sends approval message, then n8n logs in to POS and creates the expense directly.',
          '',
          'Required n8n Variables:',
          '- TELEGRAM_BOT_TOKEN',
          '- TELEGRAM_ALLOWED_CHAT_ID',
          '- OPENAI_API_KEY',
          '- OPENAI_MODEL optional, default gpt-4.1-mini',
          '- POS_USERNAME',
          '- POS_PASSWORD',
          '- AIPSOFT_CLIENT_IDENTIFIER optional, default inout',
          '- AIPSOFT_API_BASE_URL optional, default https://beta.aipsoft.com/inout',
          '- DEFAULT_BRANCH_ID',
          '- DEFAULT_BRANCH_NAME',
          '- DEFAULT_PAY_ACCOUNT_ID',
          '- DEFAULT_PAY_ACCOUNT_NAME',
          '- DEFAULT_PAID_BY_NAME',
          '- DEFAULT_PAID_BY_ID',
          '- AIPSOFT_API_USER_ID',
          '',
          'Telegram webhook URL after activating workflow:',
          'https://n8n.inandoutuae.com/webhook/telegram-ai-expense-direct-pos',
          '',
          'Set Telegram webhook:',
          'https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://n8n.inandoutuae.com/webhook/telegram-ai-expense-direct-pos',
        ].join('\n'),
      },
    },
    {
      id: 'telegram-webhook',
      name: 'Telegram Webhook',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2,
      position: [-700, 0],
      parameters: {
        httpMethod: 'POST',
        path: 'telegram-ai-expense-direct-pos',
        responseMode: 'onReceived',
        options: {},
      },
    },
    {
      id: 'telegram-expense-bot',
      name: 'Telegram AI Expense Bot',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [-420, 0],
      parameters: {
        jsCode: codeNode.trim(),
      },
    },
  ],
  connections: {
    'Telegram Webhook': {
      main: [[{ node: 'Telegram AI Expense Bot', type: 'main', index: 0 }]],
    },
  },
  pinData: {},
  settings: {
    timezone: 'Asia/Dubai',
    executionOrder: 'v1',
  },
  staticData: null,
  tags: [
    { name: 'laundry' },
    { name: 'telegram' },
    { name: 'ai' },
    { name: 'expenses' },
    { name: 'direct-pos' },
  ],
  triggerCount: 1,
  updatedAt: '2026-06-11T00:00:00.000Z',
  versionId: 'telegram-ai-expense-direct-pos-v1',
};

const outPath = path.resolve(__dirname, '..', 'n8n-telegram-ai-expense-approval-direct-pos.json');
fs.writeFileSync(outPath, JSON.stringify(workflow, null, 2) + '\n', 'utf8');
console.log(outPath);
