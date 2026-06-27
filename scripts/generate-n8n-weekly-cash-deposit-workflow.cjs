const fs = require('fs');
const path = require('path');

const posHelpers = String.raw`
const trim = (value, fallback = '') => String(value ?? fallback).trim();
const num = (value, fallback = 0) => {
  const parsed = Number(String(value ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : fallback;
};
const round = (value) => Number(num(value).toFixed(2));
const vars = (typeof $vars === 'object' && $vars) ? $vars : {};
const POS_USERNAME = trim(vars.POS_USERNAME);
const POS_PASSWORD = trim(vars.POS_PASSWORD);
const CLIENT_IDENTIFIER = trim(vars.AIPSOFT_CLIENT_IDENTIFIER, 'inout') || 'inout';
const POS_BASE_URL = trim(vars.AIPSOFT_API_BASE_URL, 'https://beta.aipsoft.com/inout').replace(/\/$/, '');
const POS_LOGIN_ENDPOINT = trim(vars.POS_LOGIN_ENDPOINT, POS_BASE_URL + '/login/check');
const POS_ORIGIN = trim(vars.POS_ORIGIN, 'https://beta.aipsoft.com');
const POS_REFERER = trim(vars.POS_CASH_REFERER, POS_BASE_URL + '/reports/generate/accounts_cash_flow');
if (!POS_USERNAME || !POS_PASSWORD) throw new Error('Missing POS_USERNAME or POS_PASSWORD n8n Variables.');

const encode = (data) => Object.entries(data || {})
  .map(([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(String(value ?? '')))
  .join('&');
const cookieMap = (header) => {
  const map = new Map();
  for (const part of String(header || '').split(';')) {
    const item = part.trim();
    const eq = item.indexOf('=');
    if (eq > 0) map.set(item.slice(0, eq), item.slice(eq + 1));
  }
  return map;
};
const normalizeHeaders = (headers = {}) => {
  const out = {};
  if (headers?.forEach) headers.forEach((value, key) => { out[String(key).toLowerCase()] = value; });
  else for (const [key, value] of Object.entries(headers || {})) out[String(key).toLowerCase()] = value;
  if (headers?.getSetCookie) out['set-cookie'] = headers.getSetCookie();
  return out;
};
const setCookies = (headers) => {
  const raw = normalizeHeaders(headers)['set-cookie'];
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return String(raw).split(/,(?=\s*[^;,\s]+=)/g);
};
const mergeCookies = (base, incoming) => {
  const map = cookieMap(base);
  for (const value of incoming || []) {
    const first = String(value).split(';')[0];
    const eq = first.indexOf('=');
    if (eq > 0) map.set(first.slice(0, eq).trim(), first.slice(eq + 1).trim());
  }
  return Array.from(map.entries()).map(([key, value]) => key + '=' + value).join('; ');
};
const request = async function(options) {
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
};
const posHeaders = (cookie, form = true, referer = POS_REFERER) => {
  const result = {
    Accept: 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8,ar;q=0.7',
    Origin: POS_ORIGIN,
    Referer: referer,
    'X-Requested-With': 'XMLHttpRequest',
    Cookie: cookie,
  };
  if (form) result['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
  return result;
};
const createPosSession = async function() {
  let cookie = 'language=english; direction=ltr; dont_show_today=true';
  const preflight = await request.call(this, { method: 'GET', url: POS_REFERER, headers: posHeaders(cookie, false) });
  cookie = mergeCookies(cookie, setCookies(preflight.headers));
  const short = POS_USERNAME.includes('@') ? POS_USERNAME.split('@')[0].trim() : POS_USERNAME;
  const usernames = Array.from(new Set([POS_USERNAME, POS_USERNAME.toLowerCase(), short, short.toLowerCase(), short + '@' + CLIENT_IDENTIFIER].filter(Boolean)));
  let lastLogin = '';
  for (const username of usernames) {
    const login = await request.call(this, {
      url: POS_LOGIN_ENDPOINT,
      headers: posHeaders(cookie),
      body: encode({ username, password: POS_PASSWORD, client_identifier: CLIENT_IDENTIFIER, auto_login: 'null', connection_path: 'null' }),
    });
    cookie = mergeCookies(cookie, setCookies(login.headers));
    lastLogin = login.body;
    if (/login_success|password_ok/i.test(lastLogin) && /ci_session_/i.test(cookie) && /\binout=/i.test(cookie)) return cookie;
  }
  throw new Error('POS login failed: ' + String(lastLogin).slice(0, 240));
};
const postForm = async function(cookie, endpoint, form, referer = POS_REFERER) {
  const response = await request.call(this, {
    url: POS_BASE_URL + endpoint,
    headers: posHeaders(cookie, true, referer),
    body: encode(form),
  });
  if (/login\/check|name=["']password/i.test(response.body)) throw new Error(endpoint + ' returned POS login page.');
  let parsed = response.body;
  try { parsed = JSON.parse(response.body); } catch {}
  return { statusCode: response.statusCode, data: parsed, raw: response.body };
};
`;

const calculateCode = posHelpers + String.raw`
const isoDate = (date) => date.toISOString().slice(0, 10);
const previousWeek = () => {
  const dubaiToday = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dubai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const cursor = new Date(dubaiToday + 'T00:00:00Z');
  const day = cursor.getUTCDay() || 7;
  cursor.setUTCDate(cursor.getUTCDate() - day - 6);
  const from = new Date(cursor);
  const to = new Date(cursor);
  to.setUTCDate(to.getUTCDate() + 6);
  return { from: isoDate(from), to: isoDate(to) };
};
const coverage = previousWeek();
coverage.from = trim(vars.CASH_COVERAGE_FROM, coverage.from);
coverage.to = trim(vars.CASH_COVERAGE_TO, coverage.to);
let branches;
try { branches = JSON.parse(trim(vars.CASH_BRANCHES_JSON, '[]')); } catch { throw new Error('CASH_BRANCHES_JSON is not valid JSON.'); }
if (!Array.isArray(branches) || !branches.length) {
  branches = [{
    id: trim(vars.CASH_DEFAULT_BRANCH_ID, '1'),
    name: trim(vars.CASH_DEFAULT_BRANCH_NAME, 'AL FALAH'),
    manager_chat_id: trim(vars.CASH_BRANCH_MANAGER_CHAT_ID, vars.TELEGRAM_ALLOWED_CHAT_ID),
  }];
}
const allText = (value, seen = new Set()) => {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value !== 'object' || seen.has(value)) return '';
  seen.add(value);
  if (Array.isArray(value)) return value.map((item) => allText(item, seen)).join('\n');
  return Object.entries(value).map(([key, item]) => key + ': ' + allText(item, seen)).join('\n');
};
const moneyAfter = (text, labels) => {
  for (const label of labels) {
    const safe = label.replace(/[.*+?^$()|[\]\\{}]/g, '\\$&');
    const match = text.match(new RegExp(safe + '[^0-9-]{0,40}(?:AED\\s*)?([0-9,]+(?:\\.[0-9]+)?)', 'i'));
    if (match) return round(match[1]);
  }
  return 0;
};
const cookie = await createPosSession.call(this);
const store = $getWorkflowStaticData('global');
if (!store.cashReconciliations || typeof store.cashReconciliations !== 'object') store.cashReconciliations = {};
const results = [];
for (const configured of branches) {
  const branch = {
    id: trim(configured.id),
    name: trim(configured.name, 'Branch ' + trim(configured.id)),
    manager_chat_id: trim(configured.manager_chat_id, vars.CASH_BRANCH_MANAGER_CHAT_ID || vars.TELEGRAM_ALLOWED_CHAT_ID),
  };
  if (!branch.id || !branch.manager_chat_id) continue;
  const report = await postForm.call(this, cookie, '/reports/generate_report', {
    report_type: 'accounts_cash_flow',
    from_date: coverage.from,
    from_time: '12:00 AM',
    to_date: coverage.to,
    to_time: '11:59 PM',
    no_of_decimal_places: '2',
    save: '1',
    branch_id: branch.id,
    predefined_date: 'Custom Range',
  });
  const ledger = await postForm.call(this, cookie, '/reports/generate_report', {
    report_type: 'ledger_report',
    from_date: coverage.from,
    from_time: '12:00 AM',
    to_date: coverage.to,
    to_time: '11:59 PM',
    ledger_name: trim(vars.CASH_ACCOUNT_ID, '1'),
    ledger_name_txt: trim(vars.CASH_ACCOUNT_NAME, 'Cash Account'),
    branch_id: branch.id,
    predefined_date: 'Custom Range',
    post_dated_chks: '0',
    enable_aging: '0',
  });
  const reportText = allText(report.data).replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ');
  const ledgerText = allText(ledger.data).replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/\s+/g, ' ');
  const cashReceived = moneyAfter(reportText, ['Total Income', 'Cash Received', 'Total Cash Income']);
  const cashExpenses = moneyAfter(reportText, ['Total Expense & PI Payments', 'Total Expense', 'Cash Expense']);
  const registeredDeposits = moneyAfter(reportText, ['Total Transfer-Journal/Bank', 'Transfer-Journal/Bank', 'Bank Transfer']);
  const approvedVariance = round(configured.approved_variance || 0);
  const requiredDeposit = Math.max(0, round(cashReceived - cashExpenses - registeredDeposits + approvedVariance));
  const parseOk = /Total Income|Total Expense|Total Cash Balance/i.test(reportText);
  const key = branch.id + '|' + coverage.from + '|' + coverage.to;
  const previous = store.cashReconciliations[key];
  const terminal = ['journal_created', 'attachment_verified', 'reconciled'].includes(previous?.status);
  const record = terminal ? previous : {
    key,
    branch_id: branch.id,
    branch_name: branch.name,
    manager_chat_id: branch.manager_chat_id,
    accountant_chat_id: trim(vars.CASH_ACCOUNTANT_CHAT_ID, vars.TELEGRAM_ALLOWED_CHAT_ID),
    coverage_from: coverage.from,
    coverage_to: coverage.to,
    cash_received: cashReceived,
    cash_expenses: cashExpenses,
    deposits_registered: registeredDeposits,
    approved_variance: approvedVariance,
    required_deposit: requiredDeposit,
    status: parseOk ? 'awaiting_branch_deposit' : 'exception',
    report_parse_ok: parseOk,
    report_excerpt: reportText.slice(0, 1200),
    ledger_excerpt: ledgerText.slice(0, 1200),
    calculated_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    history: [{ at: new Date().toISOString(), action: 'calculated', amount: requiredDeposit }],
  };
  store.cashReconciliations[key] = record;
  const money = (value) => Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const lines = parseOk ? [
    'تقرير الإيداع الأسبوعي',
    'الفرع: ' + branch.name + ' / ' + branch.id,
    'الفترة: ' + coverage.from + ' إلى ' + coverage.to,
    '',
    'Cash Received: AED ' + money(cashReceived),
    'Cash Expenses: AED ' + money(cashExpenses),
    'Deposits Registered: AED ' + money(registeredDeposits),
    'Approved Variance: AED ' + money(approvedVariance),
    'Required Deposit: AED ' + money(requiredDeposit),
    '',
    requiredDeposit > 0 ? 'يرجى إيداع المبلغ في ADIB ثم الضغط على تم الإيداع.' : 'لا يوجد مبلغ مطلوب للإيداع لهذه الفترة.',
    'Reconciliation: ' + key,
  ] : [
    'تعذر تحليل تقرير الكاش تلقائيًا',
    'الفرع: ' + branch.name + ' / ' + branch.id,
    'الفترة: ' + coverage.from + ' إلى ' + coverage.to,
    'تم إيقاف أي كتابة إلى POS. راجع Response في تنفيذ n8n.',
  ];
  results.push({ json: { ...record, chat_id: branch.manager_chat_id, telegram_text: lines.join('\n'), send_actions: parseOk && requiredDeposit > 0 } });
}
return results;
`;

const normalizeTelegramCode = String.raw`
const trim = (value, fallback = '') => String(value ?? fallback).trim();
const vars = (typeof $vars === 'object' && $vars) ? $vars : {};
const update = $json;
const callback = update.callback_query;
const message = update.message || update.edited_message || callback?.message || update;
const chatId = trim(message.chat?.id);
const callbackData = trim(callback?.data);
const caption = trim(message.caption || message.text);
const allowed = [vars.TELEGRAM_ALLOWED_CHAT_ID, vars.CASH_BRANCH_MANAGER_CHAT_ID, vars.CASH_ACCOUNTANT_CHAT_ID]
  .flatMap((value) => trim(value).split(','))
  .map((value) => value.trim()).filter(Boolean);
let configured = [];
try { configured = JSON.parse(trim(vars.CASH_BRANCHES_JSON, '[]')); } catch {}
for (const branch of Array.isArray(configured) ? configured : []) if (branch.manager_chat_id) allowed.push(trim(branch.manager_chat_id));
if (!chatId || (allowed.length && !allowed.includes(chatId))) return [];
let action = 'unknown';
let key = '';
if (callbackData.startsWith('cash:')) {
  const parts = callbackData.split(':');
  action = trim(parts[1]);
  key = trim(parts.slice(2).join(':'));
}
let fileId = '';
let fileName = '';
let mimeType = '';
if (Array.isArray(message.photo) && message.photo.length) {
  fileId = trim(message.photo[message.photo.length - 1]?.file_id);
  fileName = 'bank-deposit-receipt.jpg';
  mimeType = 'image/jpeg';
}
if (message.document?.file_id) {
  fileId = trim(message.document.file_id);
  fileName = trim(message.document.file_name, 'bank-deposit-receipt');
  mimeType = trim(message.document.mime_type, 'application/octet-stream');
}
if (fileId) {
  action = 'receipt';
  const explicit = caption.match(/(?:deposit|إيداع|ايداع)\s+([^\s]+)/i)?.[1];
  if (explicit) key = explicit.replace(/_/g, '|');
}
return [{ json: {
  action,
  key,
  chat_id: chatId,
  callback_query_id: trim(callback?.id),
  telegram_file_id: fileId,
  telegram_file_name: fileName,
  telegram_mime_type: mimeType,
  caption,
  from_name: trim(message.from?.username || callback?.from?.username || message.from?.first_name || callback?.from?.first_name, 'manager'),
} }];
`;

const markDepositedCode = String.raw`
if ($json.action !== 'deposited') return [];
const store = $getWorkflowStaticData('global');
const record = store.cashReconciliations?.[$json.key];
if (!record) return [{ json: { ...$json, telegram_text: 'لم أجد هذه التسوية: ' + $json.key } }];
if (record.manager_chat_id && String(record.manager_chat_id) !== String($json.chat_id)) return [];
if (!record.report_parse_ok || Number(record.required_deposit || 0) <= 0) {
  return [{ json: { ...$json, telegram_text: 'لا يمكن بدء الإيداع: التقرير يحتاج مراجعة أو لا يوجد مبلغ مطلوب.' } }];
}
if (['journal_created', 'attachment_verified', 'reconciled'].includes(record.status)) {
  return [{ json: { ...$json, telegram_text: 'هذه التسوية مسجلة مسبقًا. Journal ID: ' + (record.journal_id || '-') } }];
}
record.status = 'awaiting_receipt';
record.branch_confirmed_by = $json.from_name;
record.updated_at = new Date().toISOString();
record.history = record.history || [];
record.history.push({ at: record.updated_at, action: 'branch_marked_deposited', by: $json.from_name });
return [{ json: { ...$json, telegram_text: [
  'تم تسجيل تأكيد الإيداع للفرع ' + record.branch_name + '.',
  'أرسل الآن صورة أو PDF لإيصال ADIB.',
  'اكتب في Caption:',
  'deposit ' + record.key.replace(/\|/g, '_'),
].join('\n') } }];
`;

const simpleActionCode = String.raw`
if (!['review', 'variance', 'details', 'reject'].includes($json.action)) return [];
const store = $getWorkflowStaticData('global');
const record = store.cashReconciliations?.[$json.key];
if (!record) return [{ json: { ...$json, telegram_text: 'لم أجد هذه التسوية: ' + $json.key } }];
if ($json.action === 'reject') {
  record.status = 'exception';
  record.rejected_by = $json.from_name;
  record.updated_at = new Date().toISOString();
}
const money = (value) => Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const text = $json.action === 'details' ? [
  'تفاصيل التسوية ' + record.key,
  'Cash Received: AED ' + money(record.cash_received),
  'Cash Expenses: AED ' + money(record.cash_expenses),
  'Registered Deposits: AED ' + money(record.deposits_registered),
  'Required: AED ' + money(record.required_deposit),
  'Status: ' + record.status,
].join('\n') : $json.action === 'reject'
  ? 'تم رفض التسوية وتحويلها إلى Exception: ' + record.key
  : 'تم إرسال طلب مراجعة للتسوية ' + record.key + '. لن يُنشأ أي قيد قبل اعتماد المحاسب.';
return [{ json: { ...$json, chat_id: record.accountant_chat_id || $json.chat_id, telegram_text: text } }];
`;

const prepareReceiptCode = String.raw`
if ($json.action !== 'receipt' || !$json.telegram_file_id) return [];
const store = $getWorkflowStaticData('global');
const records = Object.values(store.cashReconciliations || {});
let record = $json.key ? store.cashReconciliations?.[$json.key] : null;
if (!record) {
  record = records
    .filter((item) => String(item.manager_chat_id) === String($json.chat_id) && ['awaiting_receipt', 'awaiting_branch_deposit'].includes(item.status))
    .sort((a, b) => String(b.updated_at || '').localeCompare(String(a.updated_at || '')))[0];
}
if (!record) return [{ json: { ...$json, telegram_text: 'لم أجد تسوية تنتظر إيصالًا. استخدم Caption الذي أرسله البوت.' } }];
if (['journal_created', 'attachment_verified', 'reconciled'].includes(record.status)) {
  return [{ json: { ...$json, telegram_text: 'هذه التسوية أُنشئ قيدها مسبقًا ولن أعالج إيصالًا جديدًا تلقائيًا.' } }];
}
record.status = 'receipt_received';
record.telegram_file_id = $json.telegram_file_id;
record.receipt_file_name = $json.telegram_file_name;
record.receipt_mime_type = $json.telegram_mime_type;
record.receipt_caption = $json.caption;
record.updated_at = new Date().toISOString();
if (!store.cashReceiptJobs || typeof store.cashReceiptJobs !== 'object') store.cashReceiptJobs = {};
store.cashReceiptJobs[$json.telegram_file_id] = { key: record.key, chat_id: $json.chat_id, created_at: record.updated_at };
return [{ json: { ...$json, key: record.key, telegram_file_id: $json.telegram_file_id } }];
`;

const prepareOcrCode = String.raw`
const trim = (value, fallback = '') => String(value ?? fallback).trim();
const binaryKey = Object.keys($input.item.binary || {})[0];
if (!binaryKey) throw new Error('Telegram receipt was not returned as binary data.');
const buffer = this.helpers?.getBinaryDataBuffer
  ? await this.helpers.getBinaryDataBuffer(0, binaryKey)
  : Buffer.from($input.item.binary[binaryKey]?.data || '', 'base64');
if (!buffer?.length) throw new Error('Could not read Telegram receipt binary.');
const store = $getWorkflowStaticData('global');
const fileId = trim($json.result?.file_id || $json.file_id || $json.telegram_file_id);
const job = store.cashReceiptJobs?.[fileId];
if (!job) throw new Error('Receipt job not found for Telegram file_id.');
const record = store.cashReconciliations?.[job.key];
if (!record) throw new Error('Reconciliation not found for receipt job.');
const mime = trim(record.receipt_mime_type, 'image/jpeg');
const dataUrl = 'data:' + mime + ';base64,' + Buffer.from(buffer).toString('base64');
const schema = {
  type: 'object', additionalProperties: false,
  properties: {
    deposit_amount: { type: 'number' }, deposit_date: { type: 'string' },
    bank_reference: { type: 'string' }, bank_name: { type: 'string' },
    branch: { type: 'string' }, account_hint: { type: 'string' }, confidence: { type: 'number' }, notes: { type: 'string' },
  },
  required: ['deposit_amount','deposit_date','bank_reference','bank_name','branch','account_hint','confidence','notes'],
};
const prompt = [
  'Extract bank deposit receipt fields. Return empty strings when unreadable and 0 for unreadable amount/confidence.',
  'The expected bank is ADIB and expected amount is AED ' + record.required_deposit + '.',
  'Do not invent a bank reference.',
  'Caption: ' + trim(record.receipt_caption),
].join('\n');
const content = [{ type: 'input_text', text: prompt }];
if (mime === 'application/pdf') content.push({ type: 'input_file', filename: record.receipt_file_name || 'receipt.pdf', file_data: dataUrl });
else content.push({ type: 'input_image', image_url: dataUrl, detail: 'high' });
return [{ json: { reconciliation_key: record.key, telegram_file_id: fileId, chat_id: job.chat_id, openaiBody: {
  model: String($vars.OPENAI_MODEL || 'gpt-4.1-mini'),
  metadata: { reconciliation_key: record.key, telegram_file_id: fileId },
  input: [{ role: 'user', content }],
  text: { format: { type: 'json_schema', name: 'bank_deposit_receipt', strict: true, schema } },
} } }];
`;

const parseReceiptCode = String.raw`
const trim = (value) => String(value ?? '').trim();
const metadata = $json.metadata || {};
const key = trim(metadata.reconciliation_key);
const fileId = trim(metadata.telegram_file_id);
const outputText = trim($json.output_text) || trim(($json.output || []).flatMap((item) => item.content || []).find((item) => item.type === 'output_text')?.text);
let extracted;
try { extracted = JSON.parse(outputText); } catch { throw new Error('OpenAI receipt response is not valid JSON: ' + outputText.slice(0, 300)); }
const store = $getWorkflowStaticData('global');
const record = store.cashReconciliations?.[key];
if (!record) throw new Error('Reconciliation not found after receipt extraction.');
const reference = trim(extracted.bank_reference);
const duplicate = Object.values(store.cashReconciliations || {}).some((item) => item.key !== key && reference && trim(item.deposit_reference) === reference);
const tolerance = Number($vars.CASH_RECEIPT_AMOUNT_TOLERANCE || 0.50);
const amountDifference = Number((Number(extracted.deposit_amount || 0) - Number(record.required_deposit || 0)).toFixed(2));
const bankOk = /ADIB|Abu Dhabi Islamic/i.test(trim(extracted.bank_name) + ' ' + trim(extracted.account_hint));
const errors = [];
if (!reference) errors.push('Bank reference is missing');
if (duplicate) errors.push('Bank reference is already used');
if (Math.abs(amountDifference) > tolerance) errors.push('Receipt amount differs by AED ' + amountDifference.toFixed(2));
if (!bankOk) errors.push('Bank is not confirmed as ADIB');
record.receipt = extracted;
record.deposit_reference = reference;
record.receipt_amount_difference = amountDifference;
record.receipt_validation_errors = errors;
record.receipt_file_id = fileId;
record.status = 'awaiting_accountant_approval';
record.updated_at = new Date().toISOString();
record.history = record.history || [];
record.history.push({ at: record.updated_at, action: 'receipt_analyzed', errors });
const money = (value) => Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
return [{ json: {
  key,
  chat_id: record.accountant_chat_id,
  telegram_text: [
    'إيصال إيداع جاهز لموافقة المحاسب',
    'الفرع: ' + record.branch_name + ' / ' + record.branch_id,
    'الفترة: ' + record.coverage_from + ' إلى ' + record.coverage_to,
    'المطلوب: AED ' + money(record.required_deposit),
    'الإيصال: AED ' + money(extracted.deposit_amount),
    'التاريخ: ' + (extracted.deposit_date || '-'),
    'البنك: ' + (extracted.bank_name || '-'),
    'المرجع: ' + (reference || '-'),
    'Confidence: ' + Number(extracted.confidence || 0).toFixed(2),
    errors.length ? 'تنبيهات: ' + errors.join(' | ') : 'التحقق الأولي: مطابق',
    '',
    'لن ينشأ Journal قبل الضغط على اعتماد.',
  ].join('\n'),
} }];
`;

const createJournalCode = posHelpers + String.raw`
if ($json.action !== 'approve') return [];
const store = $getWorkflowStaticData('global');
const record = store.cashReconciliations?.[$json.key];
if (!record) return [{ json: { ...$json, telegram_text: 'لم أجد هذه التسوية: ' + $json.key } }];
const accountantIds = trim(vars.CASH_ACCOUNTANT_CHAT_ID, vars.TELEGRAM_ALLOWED_CHAT_ID).split(',').map((value) => value.trim()).filter(Boolean);
if (accountantIds.length && !accountantIds.includes(String($json.chat_id))) return [];
if (record.journal_id || ['journal_created', 'attachment_verified', 'reconciled'].includes(record.status)) {
  return [{ json: { ...$json, chat_id: $json.chat_id, telegram_text: 'منع التكرار: Journal موجود مسبقًا لهذه التسوية. ID: ' + (record.journal_id || '-') } }];
}
if (record.status !== 'awaiting_accountant_approval') {
  return [{ json: { ...$json, chat_id: $json.chat_id, telegram_text: 'الحالة الحالية لا تسمح بإنشاء القيد: ' + record.status } }];
}
const reference = trim(record.deposit_reference);
if (!reference) return [{ json: { ...$json, chat_id: $json.chat_id, telegram_text: 'لا يمكن الإنشاء بدون Bank Reference.' } }];
const duplicate = Object.values(store.cashReconciliations || {}).some((item) => item.key !== record.key && trim(item.deposit_reference) === reference && item.journal_id);
if (duplicate) return [{ json: { ...$json, chat_id: $json.chat_id, telegram_text: 'منع التكرار: مرجع الإيداع مستخدم في Journal آخر.' } }];
const amount = round(record.receipt?.deposit_amount || record.required_deposit);
if (amount <= 0) return [{ json: { ...$json, chat_id: $json.chat_id, telegram_text: 'مبلغ الإيداع غير صالح.' } }];
const cookie = await createPosSession.call(this);
const notes = 'Weekly cash deposit ' + record.coverage_from + ' to ' + record.coverage_to + ' | ' + record.key;
const depositDateRaw = trim(record.receipt?.deposit_date, new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dubai' }).format(new Date()));
const dateMatch = depositDateRaw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
const journalDate = dateMatch ? dateMatch[3] + '-' + dateMatch[2] + '-' + dateMatch[1] : depositDateRaw;
const save = await postForm.call(this, cookie, '/accounts/save_journal_entry', {
  hold: '0', action: 'save', journal_no: trim(vars.CASH_NEXT_JOURNAL_NO), branch_id: record.branch_id,
  journal_date: journalDate, remark1: reference, journal_id: '', transaction_type: 'JE',
  'journal_entry_details[0][details_id]': '', 'journal_entry_details[0][account_head]': trim(vars.CASH_ACCOUNT_ID, '1'),
  'journal_entry_details[0][segment_id]': '', 'journal_entry_details[0][class_id]': '',
  'journal_entry_details[0][account_debit]': '0', 'journal_entry_details[0][account_credit]': amount,
  'journal_entry_details[0][notes]': notes,
  'journal_entry_details[1][details_id]': '', 'journal_entry_details[1][account_head]': trim(vars.CASH_BANK_ACCOUNT_ID, '34127'),
  'journal_entry_details[1][segment_id]': '', 'journal_entry_details[1][class_id]': '',
  'journal_entry_details[1][account_debit]': amount, 'journal_entry_details[1][account_credit]': '0',
  'journal_entry_details[1][notes]': notes,
  'new_misc_fields[0][field_name]': '', 'new_misc_fields[0][field_type]': '',
});
const response = typeof save.data === 'object' ? save.data : {};
const journalId = trim(response.p_id || response.journal_id || response.id);
const saveOk = Number(response.response_code) === 200 && Number(response.status) === 1 && journalId;
if (!saveOk) {
  record.status = 'exception';
  record.save_response = response || save.raw;
  record.updated_at = new Date().toISOString();
  return [{ json: { ...$json, chat_id: $json.chat_id, telegram_text: 'فشل إنشاء Journal ولم تتم إعادة المحاولة. Response: ' + String(save.raw).slice(0, 350) } }];
}
record.journal_id = journalId;
record.journal_save_response = response;
record.status = 'journal_created';
record.accountant_approved_by = $json.from_name;
record.updated_at = new Date().toISOString();
record.history = record.history || [];
record.history.push({ at: record.updated_at, action: 'journal_created', journal_id: journalId, by: $json.from_name });
let verification;
try {
  verification = await postForm.call(this, cookie, '/accounts/fecthJournalDetails', { journal_id: journalId }, POS_BASE_URL + '/accounts/journal_entry');
} catch (error) {
  verification = { data: {}, raw: error.message };
}
const verifyText = JSON.stringify(verification.data || verification.raw);
const hasCash = new RegExp('Cash Account|account_head["\\s:]+1|account[_ ]?id["\\s:]+1', 'i').test(verifyText);
const hasBank = new RegExp('ADIB|34127', 'i').test(verifyText);
const hasAmount = verifyText.includes(String(amount)) || verifyText.includes(amount.toFixed(2));
const notHold = !/["']?hold["']?\s*[:=]\s*["']?1/i.test(verifyText);
record.journal_verification = { has_cash: hasCash, has_bank: hasBank, has_amount: hasAmount, not_hold: notHold, excerpt: verifyText.slice(0, 1500) };
record.journal_verified = hasCash && hasBank && hasAmount && notHold;
if (!record.journal_verified) record.status = 'journal_created';
if (!store.cashAttachmentJobs || typeof store.cashAttachmentJobs !== 'object') store.cashAttachmentJobs = {};
store.cashAttachmentJobs[record.receipt_file_id] = { key: record.key, journal_id: journalId, chat_id: $json.chat_id, file_id: record.receipt_file_id };
return [{ json: {
  ...$json,
  reconciliation_key: record.key,
  journal_id: journalId,
  telegram_file_id: record.receipt_file_id,
  chat_id: $json.chat_id,
  telegram_text: record.journal_verified
    ? 'تم إنشاء Journal والتحقق منه. ID: ' + journalId + '. جارٍ رفع الإيصال.'
    : 'تم إنشاء Journal ID ' + journalId + ' لكن التحقق غير مكتمل. لن يعاد إنشاء القيد. جارٍ محاولة إرفاق الإيصال.',
} }];
`;

const prepareUploadCode = posHelpers + String.raw`
const store = $getWorkflowStaticData('global');
const fileId = trim($json.result?.file_id || $json.file_id || $json.telegram_file_id);
const job = store.cashAttachmentJobs?.[fileId];
if (!job) throw new Error('Cash attachment job not found for Telegram file_id.');
const binaryKey = Object.keys($input.item.binary || {})[0];
if (!binaryKey) throw new Error('Telegram receipt was not returned as binary data.');
const cookie = await createPosSession.call(this);
return [{ json: {
  ...job,
  telegram_file_id: fileId,
  upload_url: POS_BASE_URL + '/purchase/save_attachments',
  pos_cookie: cookie,
  pos_base_url: POS_BASE_URL,
  pos_origin: POS_ORIGIN,
}, binary: { data: $input.item.binary[binaryKey] } }];
`;

const continueUploadCode = String.raw`
if (!$json.journal_id || !$json.telegram_file_id || !$json.reconciliation_key) return [];
return items;
`;

const finalizeUploadCode = posHelpers + String.raw`
const prepared = $('POS - Prepare Journal Receipt Upload').first().json;
const rawResponse = Object.prototype.hasOwnProperty.call($json, 'body') ? $json.body : $json;
let uploadResponse = rawResponse;
if (typeof rawResponse === 'string') { try { uploadResponse = JSON.parse(rawResponse); } catch { uploadResponse = { message: rawResponse }; } }
const uploadOk = Number(uploadResponse?.response_code) === 200 || /success/i.test(String(uploadResponse?.message || ''));
const store = $getWorkflowStaticData('global');
const record = store.cashReconciliations?.[prepared.key];
if (!record) throw new Error('Reconciliation missing while finalizing attachment.');
if (!uploadOk) {
  record.attachment_status = 'failed';
  record.status = 'journal_created';
  record.attachment_response = uploadResponse;
  return [{ json: { ...prepared, chat_id: prepared.chat_id, telegram_text: 'تم إنشاء Journal ' + prepared.journal_id + ' لكن فشل رفع الإيصال. لن يعاد إنشاء القيد.' } }];
}
const cookie = await createPosSession.call(this);
await new Promise((resolve) => setTimeout(resolve, 1500));
const attachments = await postForm.call(this, cookie, '/purchase/loadAttachmentData', { module: 'journal_entry', module_id: prepared.journal_id }, POS_BASE_URL + '/accounts/journal_entry');
const attachmentText = JSON.stringify(attachments.data || attachments.raw);
const count = Number(attachments.data?.recordsTotal || attachments.data?.recordsFiltered || 0);
const linked = count > 0 || (attachmentText.includes(String(prepared.journal_id)) && /journal_entry/i.test(attachmentText));
record.attachment_status = linked ? 'verified' : 'uploaded_unverified';
record.status = linked && record.journal_verified ? 'reconciled' : 'journal_created';
record.attachment_response = uploadResponse;
record.attachment_verification_excerpt = attachmentText.slice(0, 1200);
record.updated_at = new Date().toISOString();
record.history = record.history || [];
record.history.push({ at: record.updated_at, action: linked ? 'attachment_verified' : 'attachment_uploaded_unverified' });
if (linked) delete store.cashAttachmentJobs[prepared.telegram_file_id];
return [{ json: {
  ...prepared,
  chat_id: prepared.chat_id,
  telegram_text: [
    linked ? 'اكتملت تسوية الإيداع بنجاح' : 'تم رفع الإيصال لكن تعذر إثبات ظهوره في قائمة المرفقات',
    'Journal ID: ' + prepared.journal_id,
    'Reconciliation: ' + prepared.key,
    'Journal Verification: ' + (record.journal_verified ? 'verified' : 'needs review'),
    'Attachment: ' + record.attachment_status,
    'Status: ' + record.status,
  ].join('\n'),
} }];
`;

function codeNode(id, name, position, jsCode) {
  return { id, name, type: 'n8n-nodes-base.code', typeVersion: 2, position, parameters: { jsCode: jsCode.trim() } };
}
function telegramCredential() {
  return { telegramApi: { id: 'REPLACE_TELEGRAM_CREDENTIAL_ID', name: 'Telegram account' } };
}
function telegramSend(id, name, position) {
  return {
    id, name, type: 'n8n-nodes-base.telegram', typeVersion: 1.2, position,
    parameters: {
      resource: 'message', operation: 'sendMessage', chatId: '={{$json.chat_id}}', text: '={{$json.telegram_text}}',
      additionalFields: { disable_web_page_preview: true, appendAttribution: false },
    }, credentials: telegramCredential(),
  };
}
function telegramReport() {
  return {
    id: 'cash-send-weekly-report', name: 'Telegram - Send Weekly Deposit Order', type: 'n8n-nodes-base.telegram', typeVersion: 1.2, position: [40, -360],
    parameters: {
      resource: 'message', operation: 'sendMessage', chatId: '={{$json.chat_id}}', text: '={{$json.telegram_text}}',
      replyMarkup: 'inlineKeyboard',
      inlineKeyboard: { rows: [
        { row: { buttons: [
          { text: '✅ تم الإيداع', additionalFields: { callback_data: "={{'cash:deposited:' + $json.key}}" } },
          { text: '🔎 مراجعة المبلغ', additionalFields: { callback_data: "={{'cash:review:' + $json.key}}" } },
        ] } },
        { row: { buttons: [
          { text: '⚠️ يوجد فرق', additionalFields: { callback_data: "={{'cash:variance:' + $json.key}}" } },
          { text: '📄 التفاصيل', additionalFields: { callback_data: "={{'cash:details:' + $json.key}}" } },
        ] } },
      ] },
      additionalFields: { disable_web_page_preview: true, appendAttribution: false },
    }, credentials: telegramCredential(),
  };
}
function telegramApproval() {
  return {
    id: 'cash-send-accountant-approval', name: 'Telegram - Send Accountant Approval', type: 'n8n-nodes-base.telegram', typeVersion: 1.2, position: [1560, 20],
    parameters: {
      resource: 'message', operation: 'sendMessage', chatId: '={{$json.chat_id}}', text: '={{$json.telegram_text}}',
      replyMarkup: 'inlineKeyboard',
      inlineKeyboard: { rows: [{ row: { buttons: [
        { text: '✅ اعتماد وإنشاء القيد', additionalFields: { callback_data: "={{'cash:approve:' + $json.key}}" } },
        { text: '❌ رفض', additionalFields: { callback_data: "={{'cash:reject:' + $json.key}}" } },
      ] } }] },
      additionalFields: { disable_web_page_preview: true, appendAttribution: false },
    }, credentials: telegramCredential(),
  };
}
function telegramGetFile(id, name, position) {
  return {
    id, name, type: 'n8n-nodes-base.telegram', typeVersion: 1.2, position,
    parameters: { resource: 'file', operation: 'get', fileId: '={{$json.telegram_file_id}}', binaryProperty: 'data', download: true },
    credentials: telegramCredential(),
  };
}
function openAiNode() {
  return {
    id: 'cash-openai-receipt', name: 'OpenAI - Extract Deposit Receipt', type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2, position: [1040, 20],
    parameters: {
      authentication: 'predefinedCredentialType', nodeCredentialType: 'openAiApi', method: 'POST', url: 'https://api.openai.com/v1/responses',
      sendHeaders: true, headerParameters: { parameters: [{ name: 'Content-Type', value: 'application/json' }] },
      sendBody: true, specifyBody: 'json', jsonBody: '={{$json.openaiBody}}', options: {},
    }, credentials: { openAiApi: { id: 'REPLACE_OPENAI_CREDENTIAL_ID', name: 'OpenAI account' } },
  };
}
function uploadNode() {
  return {
    id: 'cash-upload-receipt', name: 'POS HTTP - Upload Journal Receipt', type: 'n8n-nodes-base.httpRequest', typeVersion: 4.2, position: [1040, 360],
    parameters: {
      method: 'POST', url: '={{$json.upload_url}}', sendHeaders: true,
      headerParameters: { parameters: [
        { name: 'Cookie', value: '={{$json.pos_cookie}}' }, { name: 'X-Requested-With', value: 'XMLHttpRequest' },
        { name: 'Origin', value: '={{$json.pos_origin}}' }, { name: 'Referer', value: '={{$json.pos_base_url + "/accounts/journal_entry"}}' },
        { name: 'Accept', value: 'application/json, text/javascript, */*; q=0.01' },
      ] },
      sendBody: true, contentType: 'multipart-form-data', bodyParameters: { parameters: [
        { parameterType: 'formData', name: 'module_id', value: '={{$json.journal_id}}' },
        { parameterType: 'formData', name: 'attach_module', value: 'journal_entry' },
        { parameterType: 'formBinaryData', name: 'attachments[]', inputDataFieldName: 'data' },
      ] },
      options: { response: { response: { fullResponse: true, neverError: true, responseFormat: 'text' } }, timeout: 30000 },
    }, continueOnFail: true,
  };
}

const workflow = {
  name: 'POS Weekly Cash Deposit Reconciliation And Approval',
  active: false,
  nodes: [
    {
      id: 'cash-setup-note', name: 'Setup Notes', type: 'n8n-nodes-base.stickyNote', typeVersion: 1, position: [-980, -700],
      parameters: { content: [
        '## Weekly Cash Deposit Reconciliation', '',
        'Safe flow: calculate -> branch confirmation -> receipt OCR -> accountant approval -> create Journal once -> verify -> attach receipt.', '',
        'Required n8n Variables:', '- POS_USERNAME', '- POS_PASSWORD', '- TELEGRAM_ALLOWED_CHAT_ID', '- CASH_ACCOUNTANT_CHAT_ID',
        '- CASH_BRANCHES_JSON (example below)', '',
        '`[{"id":"1","name":"AL FALAH","manager_chat_id":"123456"}]`', '',
        'Optional:', '- AIPSOFT_API_BASE_URL', '- AIPSOFT_CLIENT_IDENTIFIER', '- OPENAI_MODEL',
        '- CASH_ACCOUNT_ID=1', '- CASH_BANK_ACCOUNT_ID=34127', '- CASH_RECEIPT_AMOUNT_TOLERANCE=0.50',
        '- CASH_COVERAGE_FROM / CASH_COVERAGE_TO for controlled test', '- CASH_NEXT_JOURNAL_NO only if POS requires a visible voucher number.', '',
        'Select Telegram credentials on every Telegram node and OpenAI credential on the receipt extraction node.',
        'Use a dedicated Telegram bot or merge these routes into the existing bot because Telegram permits one active webhook per bot.',
        'Do not activate before Manual Test parses the report correctly.',
      ].join('\n') },
    },
    { id: 'cash-manual-trigger', name: 'Manual Test', type: 'n8n-nodes-base.manualTrigger', typeVersion: 1, position: [-920, -420], parameters: {} },
    {
      id: 'cash-weekly-trigger', name: 'Every Monday 08 00', type: 'n8n-nodes-base.scheduleTrigger', typeVersion: 1.2, position: [-920, -300],
      parameters: { rule: { interval: [{ field: 'cronExpression', expression: '0 8 * * 1' }] } },
    },
    codeNode('cash-calculate', 'POS - Calculate Weekly Cash Deposit', [-620, -360], calculateCode),
    telegramReport(),
    {
      id: 'cash-telegram-trigger', name: 'Telegram Trigger - Cash Deposit', type: 'n8n-nodes-base.telegramTrigger', typeVersion: 1.2, position: [-920, 20],
      parameters: { updates: ['message', 'callback_query'], additionalFields: { download: true, imageSize: 'large' } },
      credentials: telegramCredential(),
    },
    codeNode('cash-normalize', 'Telegram - Normalize Cash Action', [-660, 20], normalizeTelegramCode),
    codeNode('cash-mark-deposited', 'Branch - Mark Deposited', [-400, -80], markDepositedCode),
    telegramSend('cash-send-receipt-request', 'Telegram - Request Deposit Receipt', [-140, -80]),
    codeNode('cash-simple-actions', 'Cash - Review Details Or Reject', [-400, -220], simpleActionCode),
    telegramSend('cash-send-simple-action', 'Telegram - Send Cash Action Result', [-140, -220]),
    codeNode('cash-prepare-receipt', 'Receipt - Match Reconciliation', [-400, 20], prepareReceiptCode),
    telegramGetFile('cash-download-receipt', 'Telegram - Download Deposit Receipt', [-140, 20]),
    codeNode('cash-prepare-ocr', 'Receipt - Prepare OpenAI Extraction', [400, 20], prepareOcrCode),
    openAiNode(),
    codeNode('cash-parse-receipt', 'Receipt - Validate And Save', [1300, 20], parseReceiptCode),
    telegramApproval(),
    codeNode('cash-create-journal', 'POS - Create And Verify Deposit Journal', [-400, 360], createJournalCode),
    telegramSend('cash-send-journal-status', 'Telegram - Send Journal Status', [-140, 240]),
    codeNode('cash-continue-upload', 'Receipt - Continue After Journal Created', [-140, 360], continueUploadCode),
    telegramGetFile('cash-redownload-receipt', 'Telegram - Download Receipt For POS', [120, 360]),
    codeNode('cash-prepare-upload', 'POS - Prepare Journal Receipt Upload', [400, 360], prepareUploadCode),
    uploadNode(),
    codeNode('cash-finalize-upload', 'POS - Verify Receipt Attachment', [1300, 360], finalizeUploadCode),
    telegramSend('cash-send-final-result', 'Telegram - Send Reconciliation Result', [1560, 360]),
  ],
  connections: {
    'Manual Test': { main: [[{ node: 'POS - Calculate Weekly Cash Deposit', type: 'main', index: 0 }]] },
    'Every Monday 08 00': { main: [[{ node: 'POS - Calculate Weekly Cash Deposit', type: 'main', index: 0 }]] },
    'POS - Calculate Weekly Cash Deposit': { main: [[{ node: 'Telegram - Send Weekly Deposit Order', type: 'main', index: 0 }]] },
    'Telegram Trigger - Cash Deposit': { main: [[{ node: 'Telegram - Normalize Cash Action', type: 'main', index: 0 }]] },
    'Telegram - Normalize Cash Action': { main: [[
      { node: 'Branch - Mark Deposited', type: 'main', index: 0 },
      { node: 'Cash - Review Details Or Reject', type: 'main', index: 0 },
      { node: 'Receipt - Match Reconciliation', type: 'main', index: 0 },
      { node: 'POS - Create And Verify Deposit Journal', type: 'main', index: 0 },
    ]] },
    'Branch - Mark Deposited': { main: [[{ node: 'Telegram - Request Deposit Receipt', type: 'main', index: 0 }]] },
    'Cash - Review Details Or Reject': { main: [[{ node: 'Telegram - Send Cash Action Result', type: 'main', index: 0 }]] },
    'Receipt - Match Reconciliation': { main: [[{ node: 'Telegram - Download Deposit Receipt', type: 'main', index: 0 }]] },
    'Telegram - Download Deposit Receipt': { main: [[{ node: 'Receipt - Prepare OpenAI Extraction', type: 'main', index: 0 }]] },
    'Receipt - Prepare OpenAI Extraction': { main: [[{ node: 'OpenAI - Extract Deposit Receipt', type: 'main', index: 0 }]] },
    'OpenAI - Extract Deposit Receipt': { main: [[{ node: 'Receipt - Validate And Save', type: 'main', index: 0 }]] },
    'Receipt - Validate And Save': { main: [[{ node: 'Telegram - Send Accountant Approval', type: 'main', index: 0 }]] },
    'POS - Create And Verify Deposit Journal': { main: [[
      { node: 'Telegram - Send Journal Status', type: 'main', index: 0 },
      { node: 'Receipt - Continue After Journal Created', type: 'main', index: 0 },
    ]] },
    'Receipt - Continue After Journal Created': { main: [[{ node: 'Telegram - Download Receipt For POS', type: 'main', index: 0 }]] },
    'Telegram - Download Receipt For POS': { main: [[{ node: 'POS - Prepare Journal Receipt Upload', type: 'main', index: 0 }]] },
    'POS - Prepare Journal Receipt Upload': { main: [[{ node: 'POS HTTP - Upload Journal Receipt', type: 'main', index: 0 }]] },
    'POS HTTP - Upload Journal Receipt': { main: [[{ node: 'POS - Verify Receipt Attachment', type: 'main', index: 0 }]] },
    'POS - Verify Receipt Attachment': { main: [[{ node: 'Telegram - Send Reconciliation Result', type: 'main', index: 0 }]] },
  },
  settings: { executionOrder: 'v1', timezone: 'Asia/Dubai' },
  pinData: {}, meta: { templateCredsSetupCompleted: false }, tags: [],
};

const output = path.join(__dirname, '..', 'n8n-pos-weekly-cash-deposit-reconciliation.json');
fs.writeFileSync(output, JSON.stringify(workflow, null, 2) + '\n');
console.log(output);
