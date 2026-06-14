const fs = require('fs');
const path = require('path');

const normalizeUpdateCode = String.raw`
const vars = (typeof $vars === 'object' && $vars) ? $vars : {};
const trim = (v, f = '') => String(v ?? f).trim();
const update = $json.body && typeof $json.body === 'object' ? $json.body : $json;
const callback = update.callback_query;
const message = update.message || update.edited_message || callback?.message || {};
const text = trim(callback?.data || message.text || message.caption || '');
const chatId = trim(message.chat?.id);
const allowed = trim(vars.TELEGRAM_ALLOWED_CHAT_ID).split(',').map((v) => v.trim()).filter(Boolean);
if (!chatId) return [];
if (allowed.length && !allowed.includes(chatId)) return [];

let action = 'intake';
let draft_id = '';
let edit_text = '';
if (text.startsWith('approve:')) {
  action = 'approve';
  draft_id = text.slice('approve:'.length).trim();
} else if (text.startsWith('cancel:')) {
  action = 'cancel';
  draft_id = text.slice('cancel:'.length).trim();
} else {
  let m = text.match(/^(موافق|approve|ok)\s+([A-Z0-9-]+)/i);
  if (m) {
    action = 'approve';
    draft_id = m[2];
  }
  m = text.match(/^(إلغاء|الغاء|cancel)\s+([A-Z0-9-]+)/i);
  if (m) {
    action = 'cancel';
    draft_id = m[2];
  }
  m = text.match(/^(تعديل|edit)\s+([A-Z0-9-]+)\s*([\s\S]*)/i);
  if (m) {
    action = 'edit';
    draft_id = m[2];
    edit_text = trim(m[3]);
  }
}

let input_type = 'text';
let file_id = '';
if (Array.isArray(message.photo) && message.photo.length) {
  input_type = 'image';
  file_id = message.photo[message.photo.length - 1].file_id;
}
if (message.document?.file_id) {
  const mime = trim(message.document.mime_type);
  if (mime === 'application/pdf' || /\.pdf$/i.test(trim(message.document.file_name))) {
    input_type = 'pdf';
    file_id = message.document.file_id;
  }
}

return [{
  json: {
    action,
    draft_id,
    edit_text,
    input_type,
    file_id,
    message_text: trim(message.text || message.caption || ''),
    chat_id: chatId,
    message_id: message.message_id,
    callback_query_id: trim(callback?.id),
    from_name: trim(message.from?.username || callback?.from?.username || message.from?.first_name || callback?.from?.first_name, 'manager'),
  },
}];
`;

const intakePrepareCode = String.raw`
const vars = (typeof $vars === 'object' && $vars) ? $vars : {};
const trim = (v, f = '') => String(v ?? f).trim();
const compact = (v, max = 3500) => {
  const text = trim(v);
  return text.length > max ? text.slice(0, max - 3) + '...' : text;
};
const token = trim(vars.TELEGRAM_BOT_TOKEN);
const openaiModel = trim(vars.OPENAI_MODEL, 'gpt-4.1-mini');
if ($json.action !== 'intake') return [];
if (!token) throw new Error('Missing TELEGRAM_BOT_TOKEN n8n Variable.');
if (!trim(vars.OPENAI_API_KEY)) throw new Error('Missing OPENAI_API_KEY n8n Variable.');
if (!$json.message_text && !$json.file_id) {
  await this.helpers.httpRequest({
    method: 'POST',
    url: 'https://api.telegram.org/bot' + token + '/sendMessage',
    json: true,
    body: { chat_id: $json.chat_id, text: 'أرسل فاتورة كنص أو صورة أو PDF، وبعدها سأرسل لك ملخص للموافقة.' },
  });
  return [];
}
await this.helpers.httpRequest({
  method: 'POST',
  url: 'https://api.telegram.org/bot' + token + '/sendMessage',
  json: true,
  body: { chat_id: $json.chat_id, text: 'استلمت الفاتورة. جاري التحليل وتجهيز المسودة...' },
});
let file_url = '';
if ($json.file_id) {
  const fileInfo = await this.helpers.httpRequest({
    method: 'POST',
    url: 'https://api.telegram.org/bot' + token + '/getFile',
    json: true,
    body: { file_id: $json.file_id },
  });
  const filePath = trim(fileInfo?.result?.file_path);
  if (!filePath) throw new Error('Telegram getFile did not return file_path.');
  file_url = 'https://api.telegram.org/file/bot' + token + '/' + filePath;
}
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dubai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
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
  required: ['supplier_name','invoice_no','invoice_date','currency','subtotal','vat_amount','total','description','suggested_account_query','suggested_account_name','confidence','needs_human_review','warnings'],
};
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
  'Telegram text/caption: ' + compact($json.message_text || '', 2500),
].join('\n');
const content = [{ type: 'input_text', text: prompt }];
if (file_url && $json.input_type === 'image') content.push({ type: 'input_image', image_url: file_url });
if (file_url && $json.input_type === 'pdf') content.push({ type: 'input_file', file_url });
return [{
  json: {
    ...$json,
    file_url,
    openaiBody: {
      model: openaiModel,
      input: [{ role: 'user', content }],
      text: { format: { type: 'json_schema', name: 'invoice_expense_extraction', strict: true, schema } },
    },
  },
}];
`;

const parseOpenAiCode = String.raw`
const trim = (v) => String(v ?? '').trim();
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
function parseJsonText(text) {
  const fence = String.fromCharCode(96).repeat(3);
  let raw = trim(text);
  if (raw.toLowerCase().startsWith(fence + 'json')) raw = raw.slice(7);
  else if (raw.startsWith(fence)) raw = raw.slice(3);
  if (raw.endsWith(fence)) raw = raw.slice(0, -3);
  return JSON.parse(raw.trim());
}
const prepared = $('Intake - Prepare File And Prompt').first().json;
const extracted = parseJsonText(responseText($json));
return [{ json: { ...prepared, extracted } }];
`;

const posShared = String.raw`
const trim = (v, f = '') => String(v ?? f).trim();
const num = (v, f = 0) => {
  const parsed = Number(String(v ?? '').replace(/,/g, ''));
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : f;
};
const vars = (typeof $vars === 'object' && $vars) ? $vars : {};
const POS_USERNAME = trim(vars.POS_USERNAME);
const POS_PASSWORD = trim(vars.POS_PASSWORD);
const CLIENT_IDENTIFIER = trim(vars.AIPSOFT_CLIENT_IDENTIFIER, 'inout') || 'inout';
const POS_BASE_URL = trim(vars.AIPSOFT_API_BASE_URL, 'https://beta.aipsoft.com/inout').replace(/\/$/, '');
const POS_LOGIN_ENDPOINT = trim(vars.POS_LOGIN_ENDPOINT, POS_BASE_URL + '/login/check');
const POS_LOGIN_REFERER = trim(vars.POS_LOGIN_REFERER, POS_BASE_URL + '/accounts/expenses');
const POS_ORIGIN = trim(vars.POS_ORIGIN, 'https://beta.aipsoft.com');
if (!POS_USERNAME || !POS_PASSWORD) throw new Error('Missing POS_USERNAME or POS_PASSWORD n8n Variables.');
const formEncode = (params) => Object.entries(params || {}).flatMap(([key, value]) => Array.isArray(value) ? value.map((entry) => [key, entry]) : [[key, value]]).map(([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(String(value ?? ''))).join('&');
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
    return { statusCode: response.statusCode || response.status || 0, headers: response.headers || {}, body: typeof response.body === 'string' ? response.body : JSON.stringify(response.body ?? '') };
  }
  return { statusCode: 0, headers: {}, body: typeof response === 'string' ? response : JSON.stringify(response ?? '') };
}
function parseJson(text, label) {
  try { return JSON.parse(String(text || '')); }
  catch { throw new Error(label + ' returned non-JSON response: ' + String(text || '').slice(0, 300)); }
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
    const preflight = await requestFull.call(this, { method: 'GET', url: POS_LOGIN_REFERER, headers: { Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', Cookie: cookieHeader } });
    cookieHeader = mergeCookieHeaders(cookieHeader, getSetCookies(preflight.headers));
  } catch {}
  const usernameBeforeAt = POS_USERNAME.includes('@') ? POS_USERNAME.split('@')[0].trim() : POS_USERNAME;
  const usernames = Array.from(new Set([POS_USERNAME, POS_USERNAME.toLowerCase(), usernameBeforeAt, usernameBeforeAt.toLowerCase(), usernameBeforeAt ? usernameBeforeAt + '@' + CLIENT_IDENTIFIER : '', usernameBeforeAt ? usernameBeforeAt.toLowerCase() + '@' + CLIENT_IDENTIFIER : ''].filter(Boolean)));
  let authed = false;
  let usedUsername = '';
  let lastLoginBody = '';
  for (const username of usernames) {
    const loginResponse = await requestFull.call(this, { method: 'POST', url: POS_LOGIN_ENDPOINT, headers: posHeaders(cookieHeader), body: formEncode({ username, password: POS_PASSWORD, client_identifier: CLIENT_IDENTIFIER, auto_login: 'null', connection_path: 'null' }) });
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
    const response = await requestFull.call(this, { method: 'POST', url: POS_BASE_URL + path, headers: posHeaders(cookieHeader), body: formEncode(data || {}) });
    cookieHeader = mergeCookieHeaders(cookieHeader, getSetCookies(response.headers));
    if (isLoginHtml(response.body)) throw new Error(label + ' returned login page. Check POS permission.');
    return parseJson(response.body, label);
  }
  return { postApi: postApi.bind(this), usedUsername: () => usedUsername };
}
`;

const findAccountCode = posShared + String.raw`
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
const extracted = $json.extracted || {};
const query = trim(extracted.suggested_account_query || extracted.suggested_account_name || extracted.description || 'miscellaneous');
let accounts = [];
try {
  const session = await createPosSession.call(this);
  const result = await session.postApi('/purchase_api/accountHeadList/' + encodeURIComponent(CLIENT_IDENTIFIER) + '/' + encodeURIComponent(query), {}, 'accountHeadList');
  const data = Array.isArray(result?.data) ? result.data : [];
  accounts = data.map((item) => ({ id: trim(item?.id), text: trim(item?.text || item?.acc_name1), raw: item })).filter((item) => item.id && item.text);
} catch {}
let account;
if (accounts.length) {
  const q = query.toLowerCase();
  const exact = accounts.find((item) => trim(item.text).toLowerCase().includes(q));
  account = { id: trim((exact || accounts[0]).id), text: trim((exact || accounts[0]).text), source: 'direct_pos_search', choices: accounts.slice(0, 5) };
} else {
  const haystack = [query, extracted.supplier_name, extracted.description, extracted.suggested_account_name].join(' ').toLowerCase();
  const fallback = fallbackAccounts.find((item) => item.keys.some((key) => haystack.includes(key))) || fallbackAccounts[fallbackAccounts.length - 1];
  account = { id: fallback.id, text: fallback.text, source: 'fallback_map', choices: [] };
}
return [{ json: { ...$json, account } }];
`;

const saveDraftCode = String.raw`
const vars = (typeof $vars === 'object' && $vars) ? $vars : {};
const trim = (v, f = '') => String(v ?? f).trim();
const num = (v, f = 0) => {
  const parsed = Number(String(v ?? '').replace(/,/g, ''));
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : f;
};
const money = (v) => num(v, 0).toFixed(2);
const compact = (v, max = 3500) => {
  const text = trim(v);
  return text.length > max ? text.slice(0, max - 3) + '...' : text;
};
function todayDubai() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dubai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}
function draftId() {
  const stamp = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dubai', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(new Date()).replace(/[^\d]/g, '');
  return 'EXP-' + stamp + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
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
    user_id: trim(vars.AIPSOFT_API_USER_ID || vars.DEFAULT_PAID_BY_ID),
    paid_by: trim(vars.DEFAULT_PAID_BY_NAME, 'SAOOD'),
    paid_by_id: trim(vars.DEFAULT_PAID_BY_ID || vars.AIPSOFT_API_USER_ID),
    paid_user_id: trim(vars.DEFAULT_PAID_BY_ID || vars.AIPSOFT_API_USER_ID),
    branch_id: trim(vars.DEFAULT_BRANCH_ID, '1'),
    pay_account: trim(vars.DEFAULT_PAY_ACCOUNT_ID),
    date,
    bill_date: date,
    bill_no: billNo,
    remark: compact(supplier + (billNo ? ' - Bill #' + billNo : '') + ' - ' + description, 240),
    vendor_id: '',
    project_id: '',
    order_no: '',
    expense_type: trim(vars.DEFAULT_EXPENSE_TYPE, '2'),
    lines: [{ account_head: account.id, notes: compact(supplier + (billNo ? ' - Bill #' + billNo : '') + ' - ' + description, 240), amount: subtotal, tax_amount: tax, total: total || num(subtotal + tax) }],
  };
}
function reviewMessage(id, draft) {
  const branchName = trim(vars.DEFAULT_BRANCH_NAME, 'AL FALAH');
  const payAccountName = trim(vars.DEFAULT_PAY_ACCOUNT_NAME, 'Credit');
  const p = draft.payload;
  const line = p.lines[0];
  const warnings = (draft.extracted.warnings || []).filter(Boolean);
  return [
    'فاتورة جاهزة للمراجعة',
    '',
    'Draft: ' + id,
    'الفرع: ' + branchName + ' (' + p.branch_id + ')',
    'Paid By: ' + p.paid_by + ' / ' + p.paid_by_id,
    'Pay Account: ' + payAccountName + ' / ' + p.pay_account,
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
if (!trim(vars.DEFAULT_PAY_ACCOUNT_ID)) throw new Error('Missing DEFAULT_PAY_ACCOUNT_ID n8n Variable.');
if (!trim(vars.DEFAULT_PAID_BY_ID || vars.AIPSOFT_API_USER_ID)) throw new Error('Missing DEFAULT_PAID_BY_ID or AIPSOFT_API_USER_ID n8n Variable.');
const payload = buildPayload($json.extracted, $json.account);
const id = draftId();
const store = $getWorkflowStaticData('global');
if (!store.expenseDrafts || typeof store.expenseDrafts !== 'object') store.expenseDrafts = {};
store.expenseDrafts[id] = {
  status: 'pending_approval',
  created_at: new Date().toISOString(),
  created_by: $json.from_name,
  telegram_chat_id: $json.chat_id,
  telegram_message_id: $json.message_id,
  input_type: $json.input_type,
  extracted: $json.extracted,
  account: $json.account,
  payload,
};
await this.helpers.httpRequest({
  method: 'POST',
  url: 'https://api.telegram.org/bot' + trim(vars.TELEGRAM_BOT_TOKEN) + '/sendMessage',
  json: true,
  body: {
    chat_id: $json.chat_id,
    text: reviewMessage(id, store.expenseDrafts[id]),
    reply_markup: { inline_keyboard: [[{ text: 'موافق', callback_data: 'approve:' + id }, { text: 'إلغاء', callback_data: 'cancel:' + id }]] },
  },
});
return [{ json: { ok: true, action: 'draft_created', draft_id: id, payload, account: $json.account, extracted: $json.extracted } }];
`;

const approveLoadCode = String.raw`
if ($json.action !== 'approve') return [];
const store = $getWorkflowStaticData('global');
const draft = store.expenseDrafts?.[$json.draft_id];
if (!draft) {
  const token = String($vars.TELEGRAM_BOT_TOKEN || '').trim();
  await this.helpers.httpRequest({ method: 'POST', url: 'https://api.telegram.org/bot' + token + '/sendMessage', json: true, body: { chat_id: $json.chat_id, text: 'لم أجد هذا الـ Draft: ' + $json.draft_id } });
  return [];
}
return [{ json: { ...$json, draft } }];
`;

const registerPosCode = posShared + String.raw`
const draft = $json.draft;
if (!draft.payload.paid_by_id || !draft.payload.paid_user_id) throw new Error('paid_by_id is required before creating expense.');
if (draft.status === 'registered') return [{ json: { ...$json, already_registered: true, result: draft.result } }];
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
const result = { ok: true, expense_id: expenseId, header, lines: payload.lines, total_tax: totalTax, total_amount: totalAmount, hold_response: hold, detail_responses: detailResponses, approve_response: approve, used_username: session.usedUsername() };
const store = $getWorkflowStaticData('global');
store.expenseDrafts[$json.draft_id].status = 'registered';
store.expenseDrafts[$json.draft_id].result = result;
store.expenseDrafts[$json.draft_id].registered_at = new Date().toISOString();
return [{ json: { ...$json, result } }];
`;

const sendResultCode = String.raw`
const trim = (v) => String(v ?? '').trim();
const money = (v) => (Math.round((Number(v) || 0) * 100) / 100).toFixed(2);
const token = trim($vars.TELEGRAM_BOT_TOKEN);
const result = $json.result || {};
const draft = $json.draft || {};
const id = trim(result.expense_id || result.hold_response?.expense_id || 'UNKNOWN');
const line = draft.payload?.lines?.[0] || {};
await this.helpers.httpRequest({
  method: 'POST',
  url: 'https://api.telegram.org/bot' + token + '/sendMessage',
  json: true,
  body: {
    chat_id: $json.chat_id,
    text: ['تم تسجيل المصروف بنجاح', 'Expense ID: ' + id, 'الإجمالي: AED ' + money(line.total), 'الحساب: ' + (draft.account?.text || line.account_head), 'Paid By: ' + (draft.payload?.paid_by || '')].join('\n'),
  },
});
return [{ json: { ok: true, expense_id: id, result } }];
`;

const editPrepareCode = String.raw`
if ($json.action !== 'edit') return [];
const store = $getWorkflowStaticData('global');
const draft = store.expenseDrafts?.[$json.draft_id];
if (!draft) {
  const token = String($vars.TELEGRAM_BOT_TOKEN || '').trim();
  await this.helpers.httpRequest({ method: 'POST', url: 'https://api.telegram.org/bot' + token + '/sendMessage', json: true, body: { chat_id: $json.chat_id, text: 'لم أجد هذا الـ Draft: ' + $json.draft_id } });
  return [];
}
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
  required: ['bill_no','date','bill_date','supplier_name','description','account_head','account_name','amount','tax_amount','total','remark','notes'],
};
const prompt = ['Convert the manager Arabic/English edit instruction into JSON patch for this POS expense draft.', 'If a field is not mentioned, return an empty string for text fields and 0 for numeric fields.', 'Current draft:', JSON.stringify(draft, null, 2), 'Instruction:', $json.edit_text || ''].join('\n');
return [{ json: { ...$json, draft, openaiBody: { model: String($vars.OPENAI_MODEL || 'gpt-4.1-mini'), input: [{ role: 'user', content: [{ type: 'input_text', text: prompt }] }], text: { format: { type: 'json_schema', name: 'expense_edit_patch', strict: true, schema } } } } }];
`;

const applyEditCode = String.raw`
const trim = (v) => String(v ?? '').trim();
const num = (v, f = 0) => {
  const parsed = Number(String(v ?? '').replace(/,/g, ''));
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : f;
};
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
function parseJsonText(text) {
  const fence = String.fromCharCode(96).repeat(3);
  let raw = trim(text);
  if (raw.toLowerCase().startsWith(fence + 'json')) raw = raw.slice(7);
  else if (raw.startsWith(fence)) raw = raw.slice(3);
  if (raw.endsWith(fence)) raw = raw.slice(0, -3);
  return JSON.parse(raw.trim());
}
function money(v) { return num(v, 0).toFixed(2); }
function reviewMessage(id, draft) {
  const p = draft.payload;
  const line = p.lines[0];
  return ['تم تعديل المسودة. راجعها من جديد:', '', 'Draft: ' + id, 'الفرع: ' + String($vars.DEFAULT_BRANCH_NAME || 'AL FALAH'), 'Paid By: ' + p.paid_by + ' / ' + p.paid_by_id, 'المورد: ' + draft.extracted.supplier_name, 'رقم الفاتورة: ' + (p.bill_no || '-'), 'التاريخ: ' + p.bill_date, 'حساب المصروف: ' + draft.account.text + ' (' + line.account_head + ')', 'الوصف: ' + line.notes, 'المبلغ قبل الضريبة: AED ' + money(line.amount), 'VAT: AED ' + money(line.tax_amount), 'الإجمالي: AED ' + money(line.total), '', 'للموافقة اكتب: موافق ' + id].join('\n');
}
const original = $('Edit - Load Draft And Prepare AI').first().json;
const patch = parseJsonText(responseText($json));
const store = $getWorkflowStaticData('global');
const draft = store.expenseDrafts[original.draft_id];
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
await this.helpers.httpRequest({ method: 'POST', url: 'https://api.telegram.org/bot' + String($vars.TELEGRAM_BOT_TOKEN || '').trim() + '/sendMessage', json: true, body: { chat_id: original.chat_id, text: reviewMessage(original.draft_id, draft), reply_markup: { inline_keyboard: [[{ text: 'موافق', callback_data: 'approve:' + original.draft_id }, { text: 'إلغاء', callback_data: 'cancel:' + original.draft_id }]] } } });
return [{ json: { ok: true, action: 'edited', draft_id: original.draft_id, patch } }];
`;

const cancelCode = String.raw`
if ($json.action !== 'cancel') return [];
const token = String($vars.TELEGRAM_BOT_TOKEN || '').trim();
const store = $getWorkflowStaticData('global');
if (store.expenseDrafts?.[$json.draft_id]) {
  store.expenseDrafts[$json.draft_id].status = 'cancelled';
  store.expenseDrafts[$json.draft_id].cancelled_at = new Date().toISOString();
}
await this.helpers.httpRequest({ method: 'POST', url: 'https://api.telegram.org/bot' + token + '/sendMessage', json: true, body: { chat_id: $json.chat_id, text: 'تم إلغاء تسجيل الفاتورة.\nDraft: ' + $json.draft_id } });
return [{ json: { ok: true, action: 'cancelled', draft_id: $json.draft_id } }];
`;

function codeNode(id, name, position, jsCode) {
  return { id, name, type: 'n8n-nodes-base.code', typeVersion: 2, position, parameters: { jsCode: jsCode.trim() } };
}

function openAiHttpNode(id, name, position) {
  return {
    id,
    name,
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position,
    parameters: {
      method: 'POST',
      url: 'https://api.openai.com/v1/responses',
      sendHeaders: true,
      headerParameters: {
        parameters: [
          { name: 'Authorization', value: '=Bearer {{$vars.OPENAI_API_KEY}}' },
          { name: 'Content-Type', value: 'application/json' },
        ],
      },
      sendBody: true,
      specifyBody: 'json',
      jsonBody: '={{$json.openaiBody}}',
      options: {},
    },
  };
}

const workflow = {
  name: 'Telegram AI Expense Approval - Split Nodes Direct POS',
  nodes: [
    {
      id: 'note-setup',
      name: 'Setup Notes',
      type: 'n8n-nodes-base.stickyNote',
      typeVersion: 1,
      position: [-940, -520],
      parameters: {
        content: [
          '## Split Nodes Version',
          'Readable workflow with separate Telegram, OpenAI, Draft, and POS System nodes.',
          '',
          'Webhook:',
          'https://n8n.inandoutuae.com/webhook/telegram-ai-expense-split-pos',
          '',
          'Required Variables:',
          'TELEGRAM_BOT_TOKEN, TELEGRAM_ALLOWED_CHAT_ID, OPENAI_API_KEY, POS_USERNAME, POS_PASSWORD, DEFAULT_PAY_ACCOUNT_ID, DEFAULT_PAID_BY_ID or AIPSOFT_API_USER_ID',
        ].join('\n'),
      },
    },
    {
      id: 'telegram-webhook',
      name: 'Telegram Webhook',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2,
      position: [-900, 0],
      parameters: { httpMethod: 'POST', path: 'telegram-ai-expense-split-pos', responseMode: 'onReceived', options: {} },
    },
    codeNode('normalize-update', 'Telegram - Normalize And Route', [-660, 0], normalizeUpdateCode),
    codeNode('intake-prepare', 'Intake - Prepare File And Prompt', [-380, -220], intakePrepareCode),
    openAiHttpNode('openai-extract', 'OpenAI - Extract Invoice', [-120, -220]),
    codeNode('parse-openai', 'OpenAI - Parse Extraction JSON', [140, -220], parseOpenAiCode),
    codeNode('pos-find-account', 'System POS - Find Expense Account', [400, -220], findAccountCode),
    codeNode('save-draft', 'Draft - Save And Send Approval', [660, -220], saveDraftCode),
    codeNode('approve-load', 'Approve - Load Draft', [-380, 80], approveLoadCode),
    codeNode('pos-register', 'System POS - Register Expense', [-120, 80], registerPosCode),
    codeNode('send-result', 'Telegram - Send Registration Result', [140, 80], sendResultCode),
    codeNode('edit-prepare', 'Edit - Load Draft And Prepare AI', [-380, 320], editPrepareCode),
    openAiHttpNode('openai-edit', 'OpenAI - Parse Edit Request', [-120, 320]),
    codeNode('apply-edit', 'Draft - Apply Edit And Resend Approval', [140, 320], applyEditCode),
    codeNode('cancel-draft', 'Cancel - Mark Draft Cancelled', [-380, 540], cancelCode),
  ],
  connections: {
    'Telegram Webhook': { main: [[{ node: 'Telegram - Normalize And Route', type: 'main', index: 0 }]] },
    'Telegram - Normalize And Route': {
      main: [[
        { node: 'Intake - Prepare File And Prompt', type: 'main', index: 0 },
        { node: 'Approve - Load Draft', type: 'main', index: 0 },
        { node: 'Edit - Load Draft And Prepare AI', type: 'main', index: 0 },
        { node: 'Cancel - Mark Draft Cancelled', type: 'main', index: 0 },
      ]],
    },
    'Intake - Prepare File And Prompt': { main: [[{ node: 'OpenAI - Extract Invoice', type: 'main', index: 0 }]] },
    'OpenAI - Extract Invoice': { main: [[{ node: 'OpenAI - Parse Extraction JSON', type: 'main', index: 0 }]] },
    'OpenAI - Parse Extraction JSON': { main: [[{ node: 'System POS - Find Expense Account', type: 'main', index: 0 }]] },
    'System POS - Find Expense Account': { main: [[{ node: 'Draft - Save And Send Approval', type: 'main', index: 0 }]] },
    'Approve - Load Draft': { main: [[{ node: 'System POS - Register Expense', type: 'main', index: 0 }]] },
    'System POS - Register Expense': { main: [[{ node: 'Telegram - Send Registration Result', type: 'main', index: 0 }]] },
    'Edit - Load Draft And Prepare AI': { main: [[{ node: 'OpenAI - Parse Edit Request', type: 'main', index: 0 }]] },
    'OpenAI - Parse Edit Request': { main: [[{ node: 'Draft - Apply Edit And Resend Approval', type: 'main', index: 0 }]] },
  },
  pinData: {},
  settings: { timezone: 'Asia/Dubai', executionOrder: 'v1' },
  staticData: null,
  tags: [{ name: 'laundry' }, { name: 'telegram' }, { name: 'ai' }, { name: 'expenses' }, { name: 'split-nodes' }, { name: 'direct-pos' }],
  triggerCount: 1,
  updatedAt: '2026-06-11T00:00:00.000Z',
  versionId: 'telegram-ai-expense-split-pos-v1',
};

const outPath = path.resolve(__dirname, '..', 'n8n-telegram-ai-expense-approval-split-nodes-direct-pos.json');
fs.writeFileSync(outPath, JSON.stringify(workflow, null, 2) + '\n', 'utf8');
console.log(outPath);
