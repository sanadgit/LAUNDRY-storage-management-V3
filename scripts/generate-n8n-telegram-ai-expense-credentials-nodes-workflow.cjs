const fs = require('fs');
const path = require('path');

function readJsonObjectFromFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end <= start) return {};
  return JSON.parse(raw.slice(start, end + 1));
}

function loadStaticPartyAccounts() {
  const filePath = path.join(__dirname, '..', 'expense_account.md', 'Creditors_accounts.md');
  try {
    const data = readJsonObjectFromFile(filePath);
    return (Array.isArray(data.customer_data) ? data.customer_data : [])
      .map((item) => ({
        id: String(item.id ?? '').trim(),
        text: String(item.customer_name ?? item.text ?? '').trim(),
        branch_id: String(item.branch_id ?? '').trim(),
      }))
      .filter((item) => item.id && item.text);
  } catch (error) {
    console.warn('Could not load Creditors_accounts.md:', error.message);
    return [];
  }
}

const staticPartyAccountsLiteral = JSON.stringify(loadStaticPartyAccounts(), null, 2);

const normalizeUpdateCode = String.raw`
const vars = (typeof $vars === 'object' && $vars) ? $vars : {};
const trim = (v, f = '') => String(v ?? f).trim();
const update = $json;
const callback = update.callback_query;
const message = update.message || update.edited_message || callback?.message || update;
const text = trim(callback?.data || message.text || message.caption || '');
const chatId = trim(message.chat?.id);
const allowed = trim(vars.TELEGRAM_ALLOWED_CHAT_ID).split(',').map((v) => v.trim()).filter(Boolean);
if (!chatId) return [];
if (allowed.length && !allowed.includes(chatId)) return [];

let action = 'intake';
let draft_id = '';
let edit_text = '';
let pay_account = '';
let pay_account_name = '';
let branch_id = '';
let branch_name = '';
if (text.startsWith('approve:')) {
  action = 'approve';
  draft_id = text.slice('approve:'.length).trim();
} else if (text.startsWith('cancel:')) {
  action = 'cancel';
  draft_id = text.slice('cancel:'.length).trim();
} else if (text.startsWith('edit_request:')) {
  action = 'edit_request';
  draft_id = text.slice('edit_request:'.length).trim();
} else if (text.startsWith('pay_account:')) {
  const parts = text.split(':');
  action = 'pay_account';
  draft_id = trim(parts[1]);
  pay_account = trim(parts[2]);
  pay_account_name = trim(parts.slice(3).join(':'));
} else if (text.startsWith('branch:')) {
  const parts = text.split(':');
  action = 'branch';
  draft_id = trim(parts[1]);
  branch_id = trim(parts[2]);
  branch_name = trim(parts.slice(3).join(':'));
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
let telegram_file_id = '';
let telegram_file_name = '';
let telegram_mime_type = '';
if (Array.isArray(message.photo) && message.photo.length) input_type = 'image';
if (Array.isArray(message.photo) && message.photo.length) {
  telegram_file_id = trim(message.photo[message.photo.length - 1]?.file_id);
  telegram_file_name = 'telegram-invoice.jpg';
  telegram_mime_type = 'image/jpeg';
}
if (message.document?.file_id) {
  const mime = trim(message.document.mime_type);
  telegram_file_id = trim(message.document.file_id);
  telegram_file_name = trim(message.document.file_name, 'telegram-invoice');
  telegram_mime_type = mime || 'application/octet-stream';
  if (mime === 'application/pdf' || /\.pdf$/i.test(trim(message.document.file_name))) input_type = 'pdf';
}

return [{
  json: {
    action,
    draft_id,
    edit_text,
    pay_account,
    pay_account_name,
    branch_id,
    branch_name,
    input_type,
    telegram_file_id,
    telegram_file_name,
    telegram_mime_type,
    message_text: trim(message.text || message.caption || ''),
    chat_id: chatId,
    message_id: message.message_id,
    callback_query_id: trim(callback?.id),
    from_name: trim(message.from?.username || callback?.from?.username || message.from?.first_name || callback?.from?.first_name, 'manager'),
  },
  binary: $input.item.binary,
}];
`;

const intakePrepareCode = String.raw`
const vars = (typeof $vars === 'object' && $vars) ? $vars : {};
const trim = (v, f = '') => String(v ?? f).trim();
const compact = (v, max = 3500) => {
  const text = trim(v);
  return text.length > max ? text.slice(0, max - 3) + '...' : text;
};
if ($json.action !== 'intake') return [];
if (!$json.message_text && !$input.item.binary) {
  return [{ json: { ...$json, stop: true, telegram_text: 'أرسل فاتورة كنص أو صورة أو PDF، وبعدها سأرسل لك ملخص للموافقة.' } }];
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
const binaryEntries = Object.values($input.item.binary || {});
const binaryKeys = Object.keys($input.item.binary || {});
const binaryKey = binaryKeys[0];
const binary = binaryEntries[0];
let sourceAttachment = null;
if (binaryKey && binary) {
  let buffer;
  if (this.helpers?.getBinaryDataBuffer) {
    buffer = await this.helpers.getBinaryDataBuffer(0, binaryKey);
  } else if (binary.data) {
    buffer = Buffer.from(binary.data, 'base64');
  }
  if (!buffer || !buffer.length) throw new Error('Could not read Telegram binary file data.');
  const rawMime = String(binary.mimeType || '').trim();
  const mime = $json.input_type === 'pdf'
    ? 'application/pdf'
      : rawMime.startsWith('image/')
      ? rawMime
      : 'image/jpeg';
  const dataBase64 = Buffer.from(buffer).toString('base64');
  const fileName = binary.fileName || ($json.input_type === 'pdf' || mime === 'application/pdf' ? 'invoice.pdf' : 'invoice.jpg');
  const dataUrl = 'data:' + mime + ';base64,' + dataBase64;
  sourceAttachment = {
    file_name: fileName,
    mime_type: mime,
    telegram_file_id: trim($json.telegram_file_id),
    input_type: $json.input_type,
  };
  if ($json.input_type === 'pdf' || mime === 'application/pdf') {
    content.push({ type: 'input_file', filename: fileName, file_data: dataUrl });
  } else {
    content.push({ type: 'input_image', image_url: dataUrl });
  }
}
const intakeKey = [
  trim($json.chat_id, 'chat'),
  trim($json.message_id, Date.now()),
  Math.random().toString(36).slice(2, 8),
].join('-');
const preparedContext = {
  ...$json,
  source_attachment: sourceAttachment,
  intake_key: intakeKey,
  telegram_text: 'استلمت الفاتورة. جاري التحليل وتجهيز المسودة...',
};
const store = $getWorkflowStaticData('global');
if (!store.invoiceIntakes || typeof store.invoiceIntakes !== 'object') store.invoiceIntakes = {};
store.invoiceIntakes[intakeKey] = preparedContext;
return [{
  json: {
    ...preparedContext,
    openaiBody: {
      model: trim(vars.OPENAI_MODEL, 'gpt-4.1-mini'),
      metadata: { intake_key: intakeKey },
      input: [{ role: 'user', content }],
      text: { format: { type: 'json_schema', name: 'invoice_expense_extraction', strict: true, schema } },
    },
  },
}];
`;

const gateOpenAiCode = String.raw`
if ($json.stop) return [];
return items;
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
const intakeKey = trim($json.metadata?.intake_key);
const store = $getWorkflowStaticData('global');
const prepared = intakeKey ? store.invoiceIntakes?.[intakeKey] : null;
if (!prepared) throw new Error('Invoice intake context was not found. Execute the workflow from Telegram Trigger, not this node alone.');
const extracted = parseJsonText(responseText($json));
delete store.invoiceIntakes[intakeKey];
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
const formEncode = (params) => {
  const pairs = [];
  const add = (key, value) => pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(value ?? '')));
  const build = (prefix, value) => {
    if (Array.isArray(value)) {
      value.forEach((entry, index) => build(prefix + '[' + index + ']', entry));
      return;
    }
    if (value && typeof value === 'object') {
      for (const [childKey, childValue] of Object.entries(value)) build(prefix + '[' + childKey + ']', childValue);
      return;
    }
    add(prefix, value);
  };
  for (const [key, value] of Object.entries(params || {})) build(key, value);
  return pairs.join('&');
};
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
  const requestOptions = {
    method: options.method || 'POST',
    url: options.url,
    headers: options.headers || {},
    json: false,
    returnFullResponse: true,
    resolveWithFullResponse: true,
    simple: false,
    timeout: 120000,
  };
  if (options.formData) requestOptions.formData = options.formData;
  else requestOptions.body = options.body;
  const response = await this.helpers.httpRequest(requestOptions);
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
function multipartBody(fields, files) {
  const boundary = '----n8nFormBoundary' + Date.now().toString(16) + Math.random().toString(16).slice(2);
  const chunks = [];
  const push = (value) => chunks.push(Buffer.isBuffer(value) ? value : Buffer.from(String(value), 'utf8'));
  for (const [key, value] of Object.entries(fields || {})) {
    push('--' + boundary + '\r\n');
    push('Content-Disposition: form-data; name="' + key + '"\r\n\r\n');
    push(value ?? '');
    push('\r\n');
  }
  for (const file of files || []) {
    const fileName = String(file.fileName || 'attachment').replace(/"/g, '');
    push('--' + boundary + '\r\n');
    push('Content-Disposition: form-data; name="' + file.fieldName + '"; filename="' + fileName + '"\r\n');
    push('Content-Type: ' + (file.mimeType || 'application/octet-stream') + '\r\n\r\n');
    push(file.buffer);
    push('\r\n');
  }
  push('--' + boundary + '--\r\n');
  return { boundary, body: Buffer.concat(chunks) };
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
  async function postMultipart(path, fields, files, label) {
    const headers = { ...posHeaders(cookieHeader) };
    delete headers['Content-Type'];
    const file = (files || [])[0];
    const fieldNames = file?.fieldNames || [file?.fieldName || 'attachments[]'];
    let lastResponse = null;
    const attempts = [];
    for (const fieldName of fieldNames) {
      const rawMultipart = multipartBody(fields, [{
        fieldName,
        fileName: file?.fileName || 'attachment',
        mimeType: file?.mimeType || 'application/octet-stream',
        buffer: file?.buffer || Buffer.alloc(0),
      }]);
      const rawHeaders = {
        ...headers,
        'Content-Type': 'multipart/form-data; boundary=' + rawMultipart.boundary,
        'Content-Length': String(rawMultipart.body.length),
      };
      const methods = this.helpers?.request ? ['request_raw', 'http_raw'] : ['http_raw'];
      for (const method of methods) {
        try {
          let response;
          if (method === 'request_raw') {
            response = await this.helpers.request({
              method: 'POST',
              uri: POS_BASE_URL + path,
              headers: rawHeaders,
              body: rawMultipart.body,
              encoding: null,
              json: false,
              resolveWithFullResponse: true,
              simple: false,
              timeout: 30000,
            });
          } else {
            response = await requestFull.call(this, {
              method: 'POST',
              url: POS_BASE_URL + path,
              headers: rawHeaders,
              body: rawMultipart.body,
            });
          }
          response = response && typeof response === 'object' && (response.headers || Object.prototype.hasOwnProperty.call(response, 'body'))
            ? { statusCode: response.statusCode || response.status || 0, headers: response.headers || {}, body: Buffer.isBuffer(response.body) ? response.body.toString('utf8') : (typeof response.body === 'string' ? response.body : JSON.stringify(response.body ?? '')) }
            : { statusCode: 0, headers: {}, body: Buffer.isBuffer(response) ? response.toString('utf8') : (typeof response === 'string' ? response : JSON.stringify(response ?? '')) };
          cookieHeader = mergeCookieHeaders(cookieHeader, getSetCookies(response.headers));
          if (isLoginHtml(response.body)) throw new Error(label + ' returned login page. Check POS permission.');
          lastResponse = parseJson(response.body, label + ' (' + fieldName + ', ' + method + ')');
          const ok = Number(lastResponse.status) === 1 || Number(lastResponse.response_code) === 200 || Number(lastResponse['response code']) === 200 || String(lastResponse.message || '').toLowerCase().includes('success');
          attempts.push({
            field_name: fieldName,
            method,
            response_code: lastResponse.response_code ?? lastResponse['response code'] ?? lastResponse.status ?? '',
            message: String(lastResponse.message || '').slice(0, 180),
          });
          if (ok) {
            return { ...lastResponse, attachment_attempts: attempts };
          }
        } catch (error) {
          let message = '';
          try {
            message = typeof error === 'string' ? error : (error?.message || JSON.stringify(error, Object.getOwnPropertyNames(error)));
          } catch {
            message = String(error);
          }
          attempts.push({ field_name: fieldName, method, error: message || 'Unknown multipart error' });
        }
      }
    }
    if (lastResponse && typeof lastResponse === 'object') lastResponse = { ...lastResponse, attachment_attempts: attempts };
    if (!lastResponse) lastResponse = { message: 'Attachment upload attempts failed', response_code: 501, attachment_attempts: attempts };
    return lastResponse;
  }
  async function getPage(path, label) {
    const response = await requestFull.call(this, { method: 'GET', url: POS_BASE_URL + path, headers: { ...posHeaders(cookieHeader), Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' } });
    cookieHeader = mergeCookieHeaders(cookieHeader, getSetCookies(response.headers));
    if (isLoginHtml(response.body)) throw new Error(label + ' returned login page. Check POS permission.');
    return response.body;
  }
  return { postApi: postApi.bind(this), postMultipart: postMultipart.bind(this), getPage: getPage.bind(this), usedUsername: () => usedUsername, cookieHeader: () => cookieHeader };
}
`;

const findAccountCode = posShared + `
const staticPartyAccounts = ${staticPartyAccountsLiteral};
` + String.raw`
const approvedExpenseAccounts = [
  { id: '3', text: 'Purchase Return Account', keys: ['purchase return', 'return purchase'] },
  { id: '5', text: 'Discount on Sales', keys: ['discount on sales', 'sales discount'] },
  { id: '8', text: 'Round Off', keys: ['round off', 'rounding'] },
  { id: '11', text: 'Purchase Account', keys: ['purchase', 'general purchase'] },
  { id: '13', text: 'Opening Stock', keys: ['opening stock', 'stock opening'] },
  { id: '33958', text: 'Miscellaneous Account', keys: ['misc', 'miscellaneous', 'other', 'unknown', 'general expense'] },
  { id: '35691', text: 'shop Exp', keys: ['shop', 'shop expense', 'branch expense'] },
  { id: '36460', text: 'Chemicals Purchases', keys: ['chemical', 'chemicals', 'detergent', 'soap', 'laundry supplies', 'seapack', 'cleaning material'] },
  { id: '43383', text: 'Salaries', keys: ['salary', 'salaries', 'wage', 'overtime', 'cash salary'] },
  { id: '44291', text: 'petrol exp', keys: ['petrol', 'fuel', 'adnoc', 'gasoline', 'diesel', 'shell', 'oil'] },
  { id: '44337', text: 'Car Expenses', keys: ['car', 'vehicle', 'motorcycle', 'bike', 'repair', 'garage', 'tyre', 'tire', 'auto', 'decent auto'] },
  { id: '44775', text: 'maintenance machine', keys: ['maintenance', 'machine', 'spare', 'parts', 'repair machine', 'electronics'] },
  { id: '46298', text: 'rents', keys: ['rent', 'rents', 'rental', 'shop rental', 'piece of town', 'real estate'] },
  { id: '52253', text: 'Internet+Phone', keys: ['internet', 'phone', 'mobile', 'du', 'etisalat', 'telecom', 'telephone'] },
  { id: '52430', text: 'benefits', keys: ['benefit', 'benefits', 'allowance', 'employee benefit'] },
  { id: '53440', text: 'Staff costs', keys: ['staff cost', 'staff costs', 'employee cost', 'labour', 'labor'] },
  { id: '54263', text: 'tax', keys: ['tax', 'vat', 'value added tax'] },
  { id: '54265', text: 'WATER-Electricity ', keys: ['water', 'electricity', 'utility', 'utilities', 'taqa', 'addc', 'sewerage'] },
  { id: '61639', text: 'IT & Software ', keys: ['software', 'computer', 'it', 'subscription', 'system', 'domain', 'hosting'] },
  { id: '61640', text: 'Printing and Stationeries', keys: ['printing', 'stationery', 'stationeries', 'paper', 'sticker', 'label', 'printer'] },
  { id: '61955', text: 'Staff Residency Costs', keys: ['residency', 'residence', 'emirates id', 'medical test', 'immigration'] },
  { id: '61965', text: 'Employee Travel Tickets', keys: ['ticket', 'travel ticket', 'air ticket', 'flight'] },
  { id: '62645', text: 'Bank & Transaction Fees', keys: ['bank fee', 'transaction fee', 'commission', 'card fee', 'msf'] },
  { id: '62649', text: 'Visa & Permits', keys: ['visa', 'permit', 'permits', 'work permit', 'labour card', 'mohre'] },
  { id: '64471', text: 'Corporate Profit Tax Expense', keys: ['corporate tax', 'profit tax'] },
  { id: '64473', text: 'Fee charged based on volume (MSF)', keys: ['msf', 'merchant fee', 'volume fee'] },
  { id: '66280', text: 'Health Insurance Expense', keys: ['health insurance', 'medical insurance'] },
  { id: '66281', text: 'Trade License Fees', keys: ['trade license', 'license', 'licence', 'economic development', 'ded', 'department of economic development'] },
  { id: '66282', text: 'Carpet Cleaning', keys: ['carpet', 'carpet cleaning'] },
  { id: '66285', text: 'Insurance Expense', keys: ['insurance', 'takaful', 'policy'] },
  { id: '66287', text: 'Traffic Fines', keys: ['traffic fine', 'fine', 'police', 'abu dhabi police', 'violation'] },
];
function norm(value) {
  return trim(value).toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9\u0600-\u06ff]+/g, ' ').replace(/\s+/g, ' ').trim();
}
function scoreAccount(account, haystack) {
  const h = norm(haystack);
  const name = norm(account.text);
  let score = 0;
  if (h.includes(name) || name.includes(h)) score += 20;
  for (const key of account.keys || []) {
    const k = norm(key);
    if (!k) continue;
    if (h.includes(k)) score += 10 + Math.min(k.length / 10, 4);
  }
  return score;
}
function decodeHtml(value) {
  return trim(value)
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}
function parseOptions(html, selectName) {
  const options = [];
  const selectRegex = new RegExp("<select[^>]+name=[\\\"']" + selectName + "[\\\"'][\\s\\S]*?<\\/select>", "i");
  const selectMatch = String(html || '').match(selectRegex);
  const selectHtml = selectMatch ? selectMatch[0] : '';
  const optionRegex = /<option[^>]+value=["']?([^"'>\s]+)["']?[^>]*>([\s\S]*?)<\/option>/gi;
  let match;
  while ((match = optionRegex.exec(selectHtml))) {
    const id = trim(match[1]);
    const text = decodeHtml(String(match[2] || '').replace(/<[^>]*>/g, ' '));
    if (id && text) options.push({ id, text });
  }
  return options;
}
function scoreParty(party, supplier) {
  const p = norm(party.text);
  const s = norm(supplier);
  if (!p || !s || party.id === '0') return 0;
  if (p === s) return 100;
  if (p.includes(s) || s.includes(p)) return 80;
  const words = s.split(' ').filter((w) => w.length > 2);
  let score = words.reduce((sum, word) => sum + (p.includes(word) ? 5 : 0), 0);
  if (String(party.branch_id || '') === '1') score += 1;
  return score;
}
function mergeParties(staticItems, pageItems) {
  const map = new Map();
  for (const item of [...(staticItems || []), ...(pageItems || [])]) {
    const id = trim(item.id);
    const text = trim(item.text);
    if (!id || !text) continue;
    if (!map.has(id)) map.set(id, { id, text, branch_id: trim(item.branch_id), source: item.source || 'static_creditors_accounts' });
  }
  return Array.from(map.values());
}
const extracted = $json.extracted || {};
const query = trim(extracted.suggested_account_query || extracted.suggested_account_name || extracted.description || 'miscellaneous');
const haystack = [query, extracted.suggested_account_name, extracted.supplier_name, extracted.description].join(' ');
let account = approvedExpenseAccounts
  .map((item) => ({ ...item, score: scoreAccount(item, haystack) }))
  .sort((a, b) => b.score - a.score)[0];
if (!account || account.score <= 0) account = approvedExpenseAccounts.find((item) => item.id === '33958');
account = { id: account.id, text: account.text, source: 'approved_static_map', score: account.score || 0 };
let party = { id: '0', text: 'Direct Pay / Without party account', source: 'default' };
let parties = mergeParties(staticPartyAccounts, []);
try {
  const session = await createPosSession.call(this);
  const html = await session.getPage('/accounts/expenses', 'expenses page');
  const pageParties = parseOptions(html, 'party_account').map((item) => ({ ...item, source: 'pos_party_select' }));
  parties = mergeParties(staticPartyAccounts, pageParties);
} catch {}
const bestParty = parties
  .map((item) => ({ ...item, score: scoreParty(item, extracted.supplier_name) }))
  .sort((a, b) => b.score - a.score)[0];
if (bestParty && bestParty.score >= 15) party = { id: bestParty.id, text: bestParty.text, branch_id: bestParty.branch_id || '', source: bestParty.source || 'static_creditors_accounts', score: bestParty.score };
return [{ json: { ...$json, account, party_account: party } }];
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
function buildPayload(extracted, account, partyAccount) {
  const directDefaults = {
    user_id: '1',
    paid_by: '1',
    paid_by_name: 'SAOOD',
    branch_id: '1',
    branch_name: 'AL FALAH',
    pay_account: '0',
    pay_account_name: 'Credit',
    party_account: '0',
    expense_type: '0',
  };
  const total = num(extracted.total);
  const tax = num(extracted.vat_amount);
  const subtotal = num(extracted.subtotal, Math.max(total - tax, 0));
  const date = /^\d{4}-\d{2}-\d{2}$/.test(trim(extracted.invoice_date)) ? trim(extracted.invoice_date) : todayDubai();
  const billNo = trim(extracted.invoice_no);
  const supplier = trim(extracted.supplier_name, 'Unknown supplier');
  const description = trim(extracted.description, 'Invoice expense');
  return {
    user_id: directDefaults.user_id,
    paid_by: directDefaults.paid_by,
    paid_by_name: directDefaults.paid_by_name,
    paid_by_id: directDefaults.paid_by,
    paid_user_id: directDefaults.paid_by,
    branch_id: directDefaults.branch_id,
    branch_name: directDefaults.branch_name,
    pay_account: directDefaults.pay_account,
    pay_account_name: directDefaults.pay_account_name,
    party_account: trim(partyAccount?.id, directDefaults.party_account),
    party_account_name: trim(partyAccount?.text, 'Direct Pay / Without party account'),
    date,
    bill_date: date,
    bill_no: billNo,
    remark: compact(supplier + (billNo ? ' - Bill #' + billNo : '') + ' - ' + description, 240),
    vendor_id: trim(partyAccount?.id) === '0' ? '' : trim(partyAccount?.id),
    project_id: '',
    order_no: '',
    expense_type: directDefaults.expense_type,
    lines: [{ account_head: account.id, notes: compact(supplier + (billNo ? ' - Bill #' + billNo : '') + ' - ' + description, 240), amount: subtotal, tax_amount: tax, total: total || num(subtotal + tax) }],
  };
}
function reviewMessage(id, draft) {
  const branchName = trim(vars.DEFAULT_BRANCH_NAME, 'AL FALAH');
  const p = draft.payload;
  const paidByName = trim(p.paid_by_name, 'SAOOD');
  const payAccountName = trim(p.pay_account_name, 'Credit');
  const line = p.lines[0];
  const warnings = (draft.extracted.warnings || []).filter(Boolean);
  return [
    'فاتورة جاهزة للمراجعة',
    '',
    'Draft: ' + id,
    'الفرع: ' + trim(p.branch_name, branchName) + ' (' + p.branch_id + ')',
    'Paid By: ' + paidByName + ' / ' + p.paid_by_id,
    'Pay Account: ' + payAccountName + ' / ' + p.pay_account,
    'Party A/C: ' + trim(p.party_account_name, 'Direct Pay') + ' / ' + trim(p.party_account, '0'),
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
const payload = buildPayload($json.extracted, $json.account, $json.party_account);
const id = draftId();
const store = $getWorkflowStaticData('global');
if (!store.expenseDrafts || typeof store.expenseDrafts !== 'object') store.expenseDrafts = {};
store.expenseDrafts[id] = { status: 'pending_approval', created_at: new Date().toISOString(), created_by: $json.from_name, telegram_chat_id: $json.chat_id, telegram_message_id: $json.message_id, input_type: $json.input_type, source_attachment: $json.source_attachment || null, extracted: $json.extracted, account: $json.account, payload };
return [{ json: { ok: true, action: 'draft_created', draft_id: id, chat_id: $json.chat_id, telegram_text: reviewMessage(id, store.expenseDrafts[id]), payload, account: $json.account, extracted: $json.extracted } }];
`;

const approveLoadCode = String.raw`
if ($json.action !== 'approve') return [];
const store = $getWorkflowStaticData('global');
const draft = store.expenseDrafts?.[$json.draft_id];
if (!draft) return [{ json: { ...$json, skip_register: true, telegram_text: 'لم أجد هذا الـ Draft: ' + $json.draft_id } }];
return [{ json: { ...$json, draft } }];
`;

const payAccountUpdateCode = String.raw`
if ($json.action !== 'pay_account') return [];
const trim = (v, f = '') => String(v ?? f).trim();
const num = (v, f = 0) => {
  const parsed = Number(String(v ?? '').replace(/,/g, ''));
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : f;
};
const money = (v) => num(v, 0).toFixed(2);
const payAccounts = {
  '0': 'Credit',
  '1': 'Cash Account',
  '33777': 'Credit Card',
  '34127': 'ADIB BANK',
};
function reviewMessage(id, draft) {
  const p = draft.payload;
  const line = p.lines[0];
  const paidByName = trim(p.paid_by_name, 'SAOOD');
  return [
    'تم تحديث Pay Account. راجع المسودة:',
    '',
    'Draft: ' + id,
    'الفرع: ' + trim(p.branch_name, 'AL FALAH') + ' (' + p.branch_id + ')',
    'Paid By: ' + paidByName + ' / ' + p.paid_by_id,
    'Pay Account: ' + trim(p.pay_account_name, 'Credit') + ' / ' + p.pay_account,
    'Party A/C: ' + trim(p.party_account_name, 'Direct Pay') + ' / ' + trim(p.party_account, '0'),
    '',
    'المورد: ' + draft.extracted.supplier_name,
    'رقم الفاتورة: ' + (p.bill_no || '-'),
    'التاريخ: ' + p.bill_date,
    'حساب المصروف: ' + draft.account.text + ' (' + line.account_head + ')',
    'الوصف: ' + line.notes,
    'المبلغ قبل الضريبة: AED ' + money(line.amount),
    'VAT: AED ' + money(line.tax_amount),
    'الإجمالي: AED ' + money(line.total),
  ].join('\n');
}
const selectedId = trim($json.pay_account);
const selectedName = payAccounts[selectedId] || trim($json.pay_account_name);
if (!selectedId || !selectedName) {
  return [{ json: { ...$json, telegram_text: 'اختيار Pay Account غير صحيح.' } }];
}
const store = $getWorkflowStaticData('global');
const draft = store.expenseDrafts?.[$json.draft_id];
if (!draft) return [{ json: { ...$json, telegram_text: 'لم أجد هذا الـ Draft: ' + $json.draft_id } }];
if (draft.status === 'registered') return [{ json: { ...$json, telegram_text: 'هذا المصروف مسجل سابقا ولا يمكن تغيير Pay Account.' } }];
draft.payload.pay_account = selectedId;
draft.payload.pay_account_name = selectedName;
draft.updated_at = new Date().toISOString();
return [{ json: { ...$json, draft, telegram_text: reviewMessage($json.draft_id, draft), payload: draft.payload } }];
`;

const branchUpdateCode = String.raw`
if ($json.action !== 'branch') return [];
const trim = (v, f = '') => String(v ?? f).trim();
const num = (v, f = 0) => {
  const parsed = Number(String(v ?? '').replace(/,/g, ''));
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : f;
};
const money = (v) => num(v, 0).toFixed(2);
const branches = {
  '1': 'AL FALAH',
  '2': 'MBZ',
  '3': 'Musaffah',
};
function reviewMessage(id, draft) {
  const p = draft.payload;
  const line = p.lines[0];
  const paidByName = trim(p.paid_by_name, 'SAOOD');
  return [
    'تم تحديث الفرع. راجع المسودة:',
    '',
    'Draft: ' + id,
    'الفرع: ' + trim(p.branch_name, 'AL FALAH') + ' (' + p.branch_id + ')',
    'Paid By: ' + paidByName + ' / ' + p.paid_by_id,
    'Pay Account: ' + trim(p.pay_account_name, 'Credit') + ' / ' + p.pay_account,
    'Party A/C: ' + trim(p.party_account_name, 'Direct Pay') + ' / ' + trim(p.party_account, '0'),
    '',
    'المورد: ' + draft.extracted.supplier_name,
    'رقم الفاتورة: ' + (p.bill_no || '-'),
    'التاريخ: ' + p.bill_date,
    'حساب المصروف: ' + draft.account.text + ' (' + line.account_head + ')',
    'الوصف: ' + line.notes,
    'المبلغ قبل الضريبة: AED ' + money(line.amount),
    'VAT: AED ' + money(line.tax_amount),
    'الإجمالي: AED ' + money(line.total),
  ].join('\n');
}
const selectedId = trim($json.branch_id);
const selectedName = branches[selectedId] || trim($json.branch_name);
if (!selectedId || !selectedName) {
  return [{ json: { ...$json, telegram_text: 'اختيار الفرع غير صحيح.' } }];
}
const store = $getWorkflowStaticData('global');
const draft = store.expenseDrafts?.[$json.draft_id];
if (!draft) return [{ json: { ...$json, telegram_text: 'لم أجد هذا الـ Draft: ' + $json.draft_id } }];
if (draft.status === 'registered') return [{ json: { ...$json, telegram_text: 'هذا المصروف مسجل سابقا ولا يمكن تغيير الفرع.' } }];
draft.payload.branch_id = selectedId;
draft.payload.branch_name = selectedName;
for (const line of draft.payload.lines || []) line.post_branch = selectedId;
draft.updated_at = new Date().toISOString();
return [{ json: { ...$json, draft, telegram_text: reviewMessage($json.draft_id, draft), payload: draft.payload } }];
`;

const registerPosCode = posShared + String.raw`
if ($json.skip_register) return [{ json: $json }];
const draft = $json.draft;
draft.payload.user_id = trim(draft.payload.user_id, '1');
draft.payload.paid_by = trim(draft.payload.paid_by, '1');
draft.payload.paid_by_name = trim(draft.payload.paid_by_name, 'SAOOD');
draft.payload.paid_by_id = trim(draft.payload.paid_by_id, '1');
draft.payload.paid_user_id = trim(draft.payload.paid_user_id, '1');
draft.payload.branch_id = trim(draft.payload.branch_id, '1');
draft.payload.branch_name = trim(draft.payload.branch_name, 'AL FALAH');
draft.payload.pay_account = trim(draft.payload.pay_account, '0');
draft.payload.pay_account_name = trim(draft.payload.pay_account_name, 'Credit');
draft.payload.party_account = trim(draft.payload.party_account, '0');
draft.payload.party_account_name = trim(draft.payload.party_account_name, 'Direct Pay / Without party account');
draft.payload.expense_type = trim(draft.payload.expense_type, '0');
if (!draft.payload.paid_by_id || !draft.payload.paid_user_id) throw new Error('paid_by_id is required before creating expense.');
if (draft.status === 'registered') return [{ json: { ...$json, already_registered: true, result: draft.result } }];
const session = await createPosSession.call(this);
const payload = draft.payload;
let voucherNo = trim(payload.expense_no);
if (!voucherNo) {
  const latestExpense = await session.postApi('/accounts/latest_expense_id', {}, 'latest_expense_id');
  const latestValue = typeof latestExpense === 'object'
    ? (latestExpense.expense_no ?? latestExpense.latest_expense_id ?? latestExpense.id ?? latestExpense.value)
    : latestExpense;
  const latestNumber = Number(String(latestValue ?? '').replace(/[^\d.-]/g, ''));
  if (Number.isFinite(latestNumber)) voucherNo = String(latestNumber + 1);
}
let totalTax = 0;
let totalAmount = 0;
const expenseDetails = [];
for (const line of payload.lines || []) {
  const lineTax = num(line.tax_amount || 0);
  totalTax = num(totalTax + lineTax);
  totalAmount = num(totalAmount + Number(line.total || 0));
  expenseDetails.push({
    details_id: '',
    post_branch: payload.branch_id,
    account_head: line.account_head,
    segment: payload.account_segment_id || '',
    ac_class: payload.account_class_id || '',
    amount: line.amount,
    tax_amount: lineTax,
    total: line.total,
    notes: line.notes,
    taxes: lineTax > 0 ? ['1'] : [],
  });
}
const savePayload = {
  expense_id: payload.expense_id || '',
  expense_type: payload.expense_type,
  hold: '0',
  action: 'save',
  expense_no: voucherNo,
  branch_id: payload.branch_id,
  pay_account: payload.pay_account,
  currency: payload.currency || 'AED',
  date: payload.date,
  paid_by: payload.paid_by,
  remark: payload.remark,
  comments: payload.comments || '',
  sub_total: totalAmount - totalTax,
  discount: payload.discount || 0,
  total_tax: totalTax,
  grand_total: totalAmount,
  expense_details: expenseDetails,
  project_id: payload.project_id || '',
  party_account: payload.party_account || payload.vendor_id || '0',
  bill_date: payload.bill_date,
  bill_no: payload.bill_no,
  order_no: payload.order_no || '',
  taxes_details: [],
  discount_account: payload.discount_account || '',
  same_branches: '1',
};
const save = await session.postApi('/accounts/save_expenses2', savePayload, 'save_expenses2');
if (Number(save.status) !== 1 && Number(save.response_code) !== 200) throw new Error('save_expenses2 failed: ' + JSON.stringify(save));
const expenseId = String(save.p_id || save.expense_id || save.id || payload.expense_id || '');
if (!voucherNo && expenseId) voucherNo = expenseId;
let verification = {
  checked: false,
  ok: false,
  status: 'not_checked',
  warnings: [],
  errors: [],
  response: null,
};
try {
  const response = await session.postApi(
    '/accounts/fecthExpenseDetails2',
    { expense_id: expenseId },
    'fecthExpenseDetails2',
  );
  const rows = Array.isArray(response?.journal_data) ? response.journal_data : [];
  const journalEntries = Array.isArray(response?.journal_entries) ? response.journal_entries : [];
  const header = rows[0] || {};
  const actualAmount = num(rows.reduce((sum, row) => sum + Number(row.amount || 0), 0));
  const actualTax = num(rows.reduce((sum, row) => sum + Number(row.tax_amount || 0), 0));
  const actualTotal = num(rows.reduce((sum, row) => sum + Number(row.total || 0), 0));
  const journalDebit = num(journalEntries.reduce((sum, row) => sum + Number(row.db_amount || 0), 0));
  const journalCredit = num(journalEntries.reduce((sum, row) => sum + Number(row.cr_amount || 0), 0));
  const expectedAmount = num(totalAmount - totalTax);
  const compare = (label, expected, actual) => {
    if (Math.abs(Number(expected || 0) - Number(actual || 0)) > 0.01) {
      verification.errors.push(label + ' expected ' + num(expected).toFixed(2) + ', POS returned ' + num(actual).toFixed(2));
    }
  };
  verification.checked = true;
  verification.response = response;
  if (!rows.length) verification.errors.push('POS returned no journal_data for Expense ID ' + expenseId);
  compare('Amount', expectedAmount, actualAmount);
  compare('VAT', totalTax, actualTax);
  compare('Total', totalAmount, actualTotal || header.grand_total);
  if (trim(header.id) && trim(header.id) !== expenseId) verification.errors.push('Expense ID mismatch.');
  if (trim(header.expense_no) && voucherNo && trim(header.expense_no) !== trim(voucherNo)) verification.errors.push('Voucher mismatch.');
  if (trim(header.branch_id) && trim(header.branch_id) !== trim(payload.branch_id)) verification.errors.push('Branch mismatch.');
  if (trim(header.paid_by) && trim(header.paid_by) !== trim(payload.paid_by)) verification.errors.push('Paid By mismatch.');
  if (trim(header.pay_account) && trim(header.pay_account) !== trim(payload.pay_account)) verification.errors.push('Pay Account mismatch.');
  if (trim(header.party_account) && trim(header.party_account) !== trim(payload.party_account || payload.vendor_id || '0')) verification.errors.push('Party Account mismatch.');
  if (trim(header.bill_no) !== trim(payload.bill_no)) verification.errors.push('Bill Number mismatch.');
  if (trim(header.bill_date) && trim(header.bill_date) !== trim(payload.bill_date)) verification.errors.push('Bill Date mismatch.');
  if (Math.abs(journalDebit - journalCredit) > 0.01) {
    verification.errors.push('Journal is not balanced: debit ' + journalDebit.toFixed(2) + ', credit ' + journalCredit.toFixed(2));
  }
  if (totalTax > 0 && !rows.some((row) => (row.selected_taxes || []).some((tax) => String(tax.tax_id) === '1'))) {
    verification.warnings.push('VAT amount exists but Tax ID 1 was not returned in selected_taxes.');
  }
  verification.actual = {
    expense_id: trim(header.id, expenseId),
    voucher_no: trim(header.expense_no, voucherNo),
    branch_id: trim(header.branch_id),
    branch_name: trim(header.city || header.main_branch_code),
    paid_by_id: trim(header.paid_by),
    paid_by_name: trim(header.acc_name1),
    pay_account_id: trim(header.pay_account),
    pay_account_name: trim(header.pay_account_name),
    party_account_id: trim(header.party_account),
    party_account_name: trim(header.party_account_name),
    amount: actualAmount,
    tax: actualTax,
    total: actualTotal || num(header.grand_total),
    paid_amount: num(header.paid_amount),
    balance_amount: num(header.balance_amount),
    journal_debit: journalDebit,
    journal_credit: journalCredit,
    journal_balanced: Math.abs(journalDebit - journalCredit) <= 0.01,
    logs: Array.isArray(response?.logs) ? response.logs : [],
  };
  verification.ok = verification.errors.length === 0;
  verification.status = verification.ok ? 'verified' : 'mismatch';
} catch (error) {
  verification.checked = true;
  verification.status = 'unavailable';
  verification.errors.push(String(error?.message || error));
}
const attachmentStatus = draft.source_attachment?.telegram_file_id ? 'pending_separate_upload' : 'not_available';
const result = { ok: true, expense_id: expenseId, voucher_no: voucherNo || expenseId, header: { ...savePayload, expense_no: voucherNo || expenseId }, lines: payload.lines, total_tax: totalTax, total_amount: totalAmount, vat_tax_id: totalTax > 0 ? '1' : '', save_response: save, verification, attachment_status: attachmentStatus, attachment_source: draft.source_attachment || null, used_username: session.usedUsername() };
const store = $getWorkflowStaticData('global');
store.expenseDrafts[$json.draft_id].status = 'registered';
store.expenseDrafts[$json.draft_id].result = result;
store.expenseDrafts[$json.draft_id].registered_at = new Date().toISOString();
return [{ json: { ...$json, result } }];
`;

const prepareResultCode = String.raw`
const trim = (v) => String(v ?? '').trim();
const money = (v) => (Math.round((Number(v) || 0) * 100) / 100).toFixed(2);
const telegramSafe = (v) => trim(v).replace(/[_*\[\]]/g, ' ').replace(new RegExp(String.fromCharCode(96), 'g'), ' ').slice(0, 180);
if ($json.telegram_text) return [{ json: $json }];
const result = $json.result || {};
const draft = $json.draft || {};
const id = trim(result.expense_id || result.hold_response?.expense_id || 'UNKNOWN');
const voucher = trim(result.voucher_no || result.header?.expense_no || id);
const line = draft.payload?.lines?.[0] || {};
const verification = result.verification || {};
const verificationLine = verification.status === 'verified'
  ? 'التحقق: تم تأكيد البيانات والقيد من POS'
  : verification.status === 'mismatch'
    ? 'التحقق: توجد فروقات - ' + telegramSafe((verification.errors || []).join(' | '))
    : verification.status === 'unavailable'
      ? 'التحقق: تعذر فتح المصروف بعد الحفظ - ' + telegramSafe((verification.errors || []).join(' | '))
      : 'التحقق: لم يتم';
const attachmentLine = result.attachment_status === 'uploaded'
  ? 'المرفق: تم حفظه في POS'
  : result.attachment_status === 'not_available'
    ? 'المرفق: لا يوجد مرفق'
    : result.attachment_status === 'pending_separate_upload'
      ? 'المرفق: محفوظ في Telegram وبانتظار مسار الرفع المنفصل'
    : 'المرفق: لم يتم حفظه - ' + telegramSafe(result.attachment_error || 'راجع save attachments');
return [{ json: { ...$json, telegram_text: ['تم تسجيل المصروف بنجاح', 'Expense ID: ' + id, 'Voucher: ' + voucher, 'Tax: ' + (Number(result.total_tax || 0) > 0 ? 'VAT (5%) / 1' : 'No VAT'), 'الإجمالي: AED ' + money(line.total), 'الحساب: ' + (draft.account?.text || line.account_head), 'Paid By: ' + (draft.payload?.paid_by || ''), verificationLine, attachmentLine].join('\n') } }];
`;

const prepareAttachmentJobCode = String.raw`
const trim = (v, f = '') => String(v ?? f).trim();
const result = $json.result || {};
const source = result.attachment_source || {};
const fileId = trim(source.telegram_file_id);
const expenseId = trim(result.expense_id);
if (result.attachment_status !== 'pending_separate_upload' || !fileId || !expenseId) return [];
const store = $getWorkflowStaticData('global');
if (!store.attachmentJobs || typeof store.attachmentJobs !== 'object') store.attachmentJobs = {};
store.attachmentJobs[fileId] = {
  draft_id: trim($json.draft_id),
  chat_id: trim($json.chat_id),
  expense_id: expenseId,
  voucher_no: trim(result.voucher_no, expenseId),
  file_id: fileId,
  file_name: trim(source.file_name, 'invoice-attachment'),
  mime_type: trim(source.mime_type, 'application/octet-stream'),
  created_at: new Date().toISOString(),
};
return [{ json: { telegram_file_id: fileId, expense_id: expenseId, chat_id: trim($json.chat_id) } }];
`;

const prepareAttachmentSessionCode = posShared + String.raw`
const store = $getWorkflowStaticData('global');
const fileId = trim($json.result?.file_id || $json.file_id || $json.telegram_file_id);
const job = store.attachmentJobs?.[fileId];
if (!job) {
  throw new Error('Attachment upload job was not found for Telegram file_id.');
}
const binaryKey = Object.keys($input.item.binary || {})[0];
if (!binaryKey) throw new Error('Telegram file was not returned as Binary data.');
const session = await createPosSession.call(this);
return [{
  json: {
    ...job,
    telegram_file_id: fileId,
    upload_url: POS_BASE_URL + '/purchase/save_attachments',
    pos_cookie: session.cookieHeader(),
  },
  binary: {
    data: $input.item.binary[binaryKey],
  },
}];
`;

const finalizeAttachmentUploadCode = String.raw`
const trim = (v) => String(v ?? '').trim();
const prepared = $('POS - Prepare Attachment Upload Session').first().json;
const rawResponse = Object.prototype.hasOwnProperty.call($json, 'body') ? $json.body : $json;
let response = rawResponse;
if (typeof rawResponse === 'string') {
  try { response = JSON.parse(rawResponse); }
  catch { response = { message: rawResponse, status_code: $json.statusCode || 0 }; }
}
const ok = Number(response?.status) === 1 || Number(response?.response_code) === 200 || Number(response?.['response code']) === 200 || String(response?.message || '').toLowerCase().includes('success');
const store = $getWorkflowStaticData('global');
if (ok) {
  if (prepared.draft_id && store.expenseDrafts?.[prepared.draft_id]?.result) {
    store.expenseDrafts[prepared.draft_id].result.attachment_status = 'uploaded';
    store.expenseDrafts[prepared.draft_id].result.attachment_response = response;
    store.expenseDrafts[prepared.draft_id].attachment_uploaded_at = new Date().toISOString();
  }
  delete store.attachmentJobs[prepared.telegram_file_id];
  return [{ json: { ...prepared, chat_id: prepared.chat_id, attachment_response: response, telegram_text: ['تم رفع مرفق الفاتورة بنجاح', 'Expense ID: ' + prepared.expense_id, 'Voucher: ' + prepared.voucher_no].join('\n') } }];
}
let responseText = '';
try { responseText = JSON.stringify(response); }
catch { responseText = String(response?.message || response); }
const message = trim(responseText).replace(/[_*\[\]]/g, ' ').replace(new RegExp(String.fromCharCode(96), 'g'), ' ').slice(0, 300);
if (prepared.draft_id && store.expenseDrafts?.[prepared.draft_id]?.result) {
  store.expenseDrafts[prepared.draft_id].result.attachment_status = 'failed';
  store.expenseDrafts[prepared.draft_id].result.attachment_error = message;
}
return [{ json: { ...prepared, chat_id: prepared.chat_id, telegram_text: ['تم تسجيل المصروف ولكن تعذر رفع المرفق', 'Expense ID: ' + prepared.expense_id, 'السبب: ' + message].join('\n') } }];
`;

const editPrepareCode = String.raw`
if ($json.action !== 'edit') return [];
const store = $getWorkflowStaticData('global');
const draft = store.expenseDrafts?.[$json.draft_id];
if (!draft) return [{ json: { ...$json, skip_edit: true, telegram_text: 'لم أجد هذا الـ Draft: ' + $json.draft_id } }];
const schema = { type: 'object', additionalProperties: false, properties: { bill_no: { type: 'string' }, date: { type: 'string' }, bill_date: { type: 'string' }, supplier_name: { type: 'string' }, description: { type: 'string' }, account_head: { type: 'string' }, account_name: { type: 'string' }, amount: { type: 'number' }, tax_amount: { type: 'number' }, total: { type: 'number' }, remark: { type: 'string' }, notes: { type: 'string' } }, required: ['bill_no','date','bill_date','supplier_name','description','account_head','account_name','amount','tax_amount','total','remark','notes'] };
const prompt = ['Convert the manager Arabic/English edit instruction into JSON patch for this POS expense draft.', 'If a field is not mentioned, return an empty string for text fields and 0 for numeric fields.', 'Current draft:', JSON.stringify(draft, null, 2), 'Instruction:', $json.edit_text || ''].join('\n');
return [{ json: { ...$json, draft, openaiBody: { model: String($vars.OPENAI_MODEL || 'gpt-4.1-mini'), input: [{ role: 'user', content: [{ type: 'input_text', text: prompt }] }], text: { format: { type: 'json_schema', name: 'expense_edit_patch', strict: true, schema } } } } }];
`;

const skipEditGateCode = String.raw`
if ($json.skip_edit) return [];
return items;
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
  for (const output of response?.output || []) for (const content of output?.content || []) if (typeof content?.text === 'string') parts.push(content.text);
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
  return ['تم تعديل المسودة. راجعها من جديد:', '', 'Draft: ' + id, 'الفرع: ' + trim(p.branch_name, 'AL FALAH') + ' (' + p.branch_id + ')', 'Paid By: ' + p.paid_by + ' / ' + p.paid_by_id, 'المورد: ' + draft.extracted.supplier_name, 'رقم الفاتورة: ' + (p.bill_no || '-'), 'التاريخ: ' + p.bill_date, 'حساب المصروف: ' + draft.account.text + ' (' + line.account_head + ')', 'الوصف: ' + line.notes, 'المبلغ قبل الضريبة: AED ' + money(line.amount), 'VAT: AED ' + money(line.tax_amount), 'الإجمالي: AED ' + money(line.total), '', 'للموافقة اكتب: موافق ' + id].join('\n');
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
return [{ json: { ...original, ok: true, action: 'edited', patch, telegram_text: reviewMessage(original.draft_id, draft) } }];
`;

const cancelCode = String.raw`
if ($json.action !== 'cancel') return [];
const store = $getWorkflowStaticData('global');
if (store.expenseDrafts?.[$json.draft_id]) {
  store.expenseDrafts[$json.draft_id].status = 'cancelled';
  store.expenseDrafts[$json.draft_id].cancelled_at = new Date().toISOString();
}
return [{ json: { ...$json, telegram_text: 'تم إلغاء تسجيل الفاتورة.\nDraft: ' + $json.draft_id } }];
`;

const editRequestCode = String.raw`
if ($json.action !== 'edit_request') return [];
const store = $getWorkflowStaticData('global');
const draft = store.expenseDrafts?.[$json.draft_id];
if (!draft) {
  return [{ json: { ...$json, telegram_text: 'لم أجد هذا الـ Draft: ' + $json.draft_id } }];
}
return [{
  json: {
    ...$json,
    telegram_text: [
      'اكتب تفاصيل التعديل كرد على هذه الرسالة:',
      '',
      'تعديل ' + $json.draft_id + ' amount=100 tax_amount=5 total=105 account_head=44291',
      '',
      'أو اكتب بالعربي مثل:',
      'تعديل ' + $json.draft_id + ' غير الحساب إلى rents وخلي الإجمالي 35000',
    ].join('\n'),
  },
}];
`;

function codeNode(id, name, position, jsCode) {
  return { id, name, type: 'n8n-nodes-base.code', typeVersion: 2, position, parameters: { jsCode: jsCode.trim() } };
}

function telegramTriggerNode() {
  return {
    id: 'telegram-trigger',
    name: 'Telegram Trigger',
    type: 'n8n-nodes-base.telegramTrigger',
    typeVersion: 1.2,
    position: [-900, 0],
    parameters: {
      updates: ['message', 'callback_query'],
      additionalFields: {
        download: true,
        imageSize: 'large',
        restrictToChatIds: '={{$vars.TELEGRAM_ALLOWED_CHAT_ID}}',
      },
    },
    credentials: {
      telegramApi: {
        id: 'REPLACE_TELEGRAM_CREDENTIAL_ID',
        name: 'Telegram account',
      },
    },
  };
}

function telegramSendNode(id, name, position) {
  return {
    id,
    name,
    type: 'n8n-nodes-base.telegram',
    typeVersion: 1.2,
    position,
    parameters: {
      resource: 'message',
      operation: 'sendMessage',
      chatId: '={{$json.chat_id}}',
      text: '={{$json.telegram_text}}',
      additionalFields: {
        disable_web_page_preview: true,
        appendAttribution: false,
      },
    },
    credentials: {
      telegramApi: {
        id: 'REPLACE_TELEGRAM_CREDENTIAL_ID',
        name: 'Telegram account',
      },
    },
  };
}

function telegramGetFileNode(id, name, position) {
  return {
    id,
    name,
    type: 'n8n-nodes-base.telegram',
    typeVersion: 1.2,
    position,
    parameters: {
      resource: 'file',
      operation: 'get',
      fileId: '={{$json.telegram_file_id}}',
      binaryProperty: 'data',
      download: true,
    },
    credentials: {
      telegramApi: {
        id: 'REPLACE_TELEGRAM_CREDENTIAL_ID',
        name: 'Telegram account',
      },
    },
  };
}

function telegramApprovalNode(id, name, position) {
  return {
    id,
    name,
    type: 'n8n-nodes-base.telegram',
    typeVersion: 1.2,
    position,
    parameters: {
      resource: 'message',
      operation: 'sendMessage',
      chatId: '={{$json.chat_id}}',
      text: '={{$json.telegram_text}}',
      replyMarkup: 'inlineKeyboard',
      inlineKeyboard: {
        rows: [
          {
            row: {
              buttons: [
                {
                  text: 'AL FALAH / 1',
                  additionalFields: {
                    callback_data: "={{'branch:' + $json.draft_id + ':1:AL FALAH'}}",
                  },
                },
                {
                  text: 'MBZ / 2',
                  additionalFields: {
                    callback_data: "={{'branch:' + $json.draft_id + ':2:MBZ'}}",
                  },
                },
                {
                  text: 'Musaffah / 3',
                  additionalFields: {
                    callback_data: "={{'branch:' + $json.draft_id + ':3:Musaffah'}}",
                  },
                },
              ],
            },
          },
          {
            row: {
              buttons: [
                {
                  text: 'Credit / 0',
                  additionalFields: {
                    callback_data: "={{'pay_account:' + $json.draft_id + ':0:Credit'}}",
                  },
                },
                {
                  text: 'Cash / 1',
                  additionalFields: {
                    callback_data: "={{'pay_account:' + $json.draft_id + ':1:Cash Account'}}",
                  },
                },
              ],
            },
          },
          {
            row: {
              buttons: [
                {
                  text: 'Credit Card / 33777',
                  additionalFields: {
                    callback_data: "={{'pay_account:' + $json.draft_id + ':33777:Credit Card'}}",
                  },
                },
                {
                  text: 'ADIB BANK / 34127',
                  additionalFields: {
                    callback_data: "={{'pay_account:' + $json.draft_id + ':34127:ADIB BANK'}}",
                  },
                },
              ],
            },
          },
          {
            row: {
              buttons: [
                {
                  text: '✅ موافق',
                  additionalFields: {
                    callback_data: "={{'approve:' + $json.draft_id}}",
                  },
                },
                {
                  text: '✏️ تعديل',
                  additionalFields: {
                    callback_data: "={{'edit_request:' + $json.draft_id}}",
                  },
                },
                {
                  text: '❌ إلغاء',
                  additionalFields: {
                    callback_data: "={{'cancel:' + $json.draft_id}}",
                  },
                },
              ],
            },
          },
        ],
      },
      additionalFields: {
        disable_web_page_preview: true,
        appendAttribution: false,
      },
    },
    credentials: {
      telegramApi: {
        id: 'REPLACE_TELEGRAM_CREDENTIAL_ID',
        name: 'Telegram account',
      },
    },
  };
}

function openAiHttpNode(id, name, position) {
  return {
    id,
    name,
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position,
    parameters: {
      authentication: 'predefinedCredentialType',
      nodeCredentialType: 'openAiApi',
      method: 'POST',
      url: 'https://api.openai.com/v1/responses',
      sendHeaders: true,
      headerParameters: { parameters: [{ name: 'Content-Type', value: 'application/json' }] },
      sendBody: true,
      specifyBody: 'json',
      jsonBody: '={{$json.openaiBody}}',
      options: {},
    },
    credentials: {
      openAiApi: {
        id: 'REPLACE_OPENAI_CREDENTIAL_ID',
        name: 'OpenAI account',
      },
    },
  };
}

function posAttachmentHttpNode(id, name, position) {
  return {
    id,
    name,
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position,
    parameters: {
      method: 'POST',
      url: '={{$json.upload_url}}',
      sendHeaders: true,
      headerParameters: {
        parameters: [
          { name: 'Cookie', value: '={{$json.pos_cookie}}' },
          { name: 'X-Requested-With', value: 'XMLHttpRequest' },
          { name: 'Origin', value: 'https://beta.aipsoft.com' },
          { name: 'Referer', value: 'https://beta.aipsoft.com/inout/accounts/expenses' },
          { name: 'Accept', value: 'application/json, text/javascript, */*; q=0.01' },
        ],
      },
      sendBody: true,
      contentType: 'multipart-form-data',
      bodyParameters: {
        parameters: [
          {
            parameterType: 'formData',
            name: 'module_id',
            value: '={{$json.expense_id}}',
          },
          {
            parameterType: 'formData',
            name: 'attach_module',
            value: 'expenses',
          },
          {
            parameterType: 'formBinaryData',
            name: 'attachments[]',
            inputDataFieldName: 'data',
          },
        ],
      },
      options: {
        response: {
          response: {
            fullResponse: true,
            neverError: true,
            responseFormat: 'text',
          },
        },
        timeout: 30000,
      },
    },
    continueOnFail: true,
  };
}

const workflow = {
  name: 'Telegram AI Expense Approval - Credentials Nodes Direct POS',
  nodes: [
    {
      id: 'note-setup',
      name: 'Setup Notes',
      type: 'n8n-nodes-base.stickyNote',
      typeVersion: 1,
      position: [-940, -560],
      parameters: {
        content: [
          '## Credentials Nodes Version',
          'Uses Telegram Trigger credential, Telegram Send Message credential, and OpenAI credential.',
          'No TELEGRAM_BOT_TOKEN or OPENAI_API_KEY variables are used in Code nodes.',
          '',
          'After import, select your real Credentials in:',
          '- Telegram Trigger',
          '- Telegram - Send Intake Notice',
          '- Telegram - Send Approval Review',
          '- Telegram - Send Registration Result',
          '- Telegram - Download Registered Invoice',
          '- Telegram - Send Attachment Result',
          '- Telegram - Send Edit Review',
          '- Telegram - Send Cancelled',
          '- Telegram - Send Branch Review',
          '- OpenAI - Extract Invoice',
          '- OpenAI - Parse Edit Request',
          '',
          'Attachment upload uses POS HTTP multipart/form-data with binary field data -> attachments[].',
          '',
          'Required Variables:',
          'TELEGRAM_ALLOWED_CHAT_ID, POS_USERNAME, POS_PASSWORD',
          '',
          'Hardcoded POS defaults:',
          'Branch AL FALAH = 1, MBZ = 2, Musaffah = 3, Paid By SAOOD = 1, Pay Account Credit = 0, Party A/C Direct Pay = 0, Expense Type = 2',
        ].join('\n'),
      },
    },
    telegramTriggerNode(),
    codeNode('normalize-update', 'Telegram - Normalize And Route', [-660, 0], normalizeUpdateCode),
    codeNode('intake-prepare', 'Intake - Prepare File And Prompt', [-380, -260], intakePrepareCode),
    telegramSendNode('send-intake', 'Telegram - Send Intake Notice', [-120, -430]),
    codeNode('gate-openai', 'Intake - Continue To OpenAI', [-120, -260], gateOpenAiCode),
    openAiHttpNode('openai-extract', 'OpenAI - Extract Invoice', [140, -260]),
    codeNode('parse-openai', 'OpenAI - Parse Extraction JSON', [400, -260], parseOpenAiCode),
    codeNode('pos-find-account', 'System POS - Find Expense Account', [660, -260], findAccountCode),
    codeNode('save-draft', 'Draft - Save And Prepare Approval', [920, -260], saveDraftCode),
    telegramApprovalNode('send-approval', 'Telegram - Send Approval Review', [1180, -260]),
    codeNode('approve-load', 'Approve - Load Draft', [-380, 80], approveLoadCode),
    codeNode('pos-register', 'System POS - Register Expense', [-120, 80], registerPosCode),
    codeNode('prepare-result', 'Telegram - Prepare Registration Result', [140, 80], prepareResultCode),
    telegramSendNode('send-result', 'Telegram - Send Registration Result', [400, 80]),
    codeNode('prepare-attachment-job', 'Attachment - Prepare Upload Job', [140, 200], prepareAttachmentJobCode),
    telegramGetFileNode('telegram-download-registered-invoice', 'Telegram - Download Registered Invoice', [400, 200]),
    codeNode('prepare-pos-attachment-session', 'POS - Prepare Attachment Upload Session', [660, 200], prepareAttachmentSessionCode),
    posAttachmentHttpNode('pos-http-upload-attachment', 'POS HTTP - Upload Expense Attachment', [920, 200]),
    codeNode('finalize-attachment-upload', 'Attachment - Finalize Upload Result', [1180, 200], finalizeAttachmentUploadCode),
    telegramSendNode('send-attachment-result', 'Telegram - Send Attachment Result', [1440, 200]),
    codeNode('edit-prepare', 'Edit - Load Draft And Prepare AI', [-380, 360], editPrepareCode),
    codeNode('edit-gate', 'Edit - Continue To OpenAI', [-120, 360], skipEditGateCode),
    openAiHttpNode('openai-edit', 'OpenAI - Parse Edit Request', [140, 360]),
    codeNode('apply-edit', 'Draft - Apply Edit And Prepare Review', [400, 360], applyEditCode),
    telegramApprovalNode('send-edit', 'Telegram - Send Edit Review', [660, 360]),
    codeNode('cancel-draft', 'Cancel - Mark Draft Cancelled', [-380, 600], cancelCode),
    telegramSendNode('send-cancel', 'Telegram - Send Cancelled', [-120, 600]),
    codeNode('edit-request', 'Edit Button - Ask For Details', [-380, 820], editRequestCode),
    telegramSendNode('send-edit-instructions', 'Telegram - Send Edit Instructions', [-120, 820]),
    codeNode('pay-account-update', 'Pay Account - Update Draft', [-380, 1040], payAccountUpdateCode),
    telegramApprovalNode('send-pay-account-review', 'Telegram - Send Pay Account Review', [-120, 1040]),
    codeNode('branch-update', 'Branch - Update Draft', [-380, 1260], branchUpdateCode),
    telegramApprovalNode('send-branch-review', 'Telegram - Send Branch Review', [-120, 1260]),
  ],
  connections: {
    'Telegram Trigger': { main: [[{ node: 'Telegram - Normalize And Route', type: 'main', index: 0 }]] },
    'Telegram - Normalize And Route': {
      main: [[
        { node: 'Intake - Prepare File And Prompt', type: 'main', index: 0 },
        { node: 'Approve - Load Draft', type: 'main', index: 0 },
        { node: 'Edit - Load Draft And Prepare AI', type: 'main', index: 0 },
        { node: 'Cancel - Mark Draft Cancelled', type: 'main', index: 0 },
        { node: 'Edit Button - Ask For Details', type: 'main', index: 0 },
        { node: 'Pay Account - Update Draft', type: 'main', index: 0 },
        { node: 'Branch - Update Draft', type: 'main', index: 0 },
      ]],
    },
    'Intake - Prepare File And Prompt': {
      main: [[
        { node: 'Telegram - Send Intake Notice', type: 'main', index: 0 },
        { node: 'Intake - Continue To OpenAI', type: 'main', index: 0 },
      ]],
    },
    'Intake - Continue To OpenAI': { main: [[{ node: 'OpenAI - Extract Invoice', type: 'main', index: 0 }]] },
    'OpenAI - Extract Invoice': { main: [[{ node: 'OpenAI - Parse Extraction JSON', type: 'main', index: 0 }]] },
    'OpenAI - Parse Extraction JSON': { main: [[{ node: 'System POS - Find Expense Account', type: 'main', index: 0 }]] },
    'System POS - Find Expense Account': { main: [[{ node: 'Draft - Save And Prepare Approval', type: 'main', index: 0 }]] },
    'Draft - Save And Prepare Approval': { main: [[{ node: 'Telegram - Send Approval Review', type: 'main', index: 0 }]] },
    'Approve - Load Draft': { main: [[{ node: 'System POS - Register Expense', type: 'main', index: 0 }]] },
    'System POS - Register Expense': {
      main: [[
        { node: 'Telegram - Prepare Registration Result', type: 'main', index: 0 },
        { node: 'Attachment - Prepare Upload Job', type: 'main', index: 0 },
      ]],
    },
    'Telegram - Prepare Registration Result': { main: [[{ node: 'Telegram - Send Registration Result', type: 'main', index: 0 }]] },
    'Attachment - Prepare Upload Job': { main: [[{ node: 'Telegram - Download Registered Invoice', type: 'main', index: 0 }]] },
    'Telegram - Download Registered Invoice': { main: [[{ node: 'POS - Prepare Attachment Upload Session', type: 'main', index: 0 }]] },
    'POS - Prepare Attachment Upload Session': { main: [[{ node: 'POS HTTP - Upload Expense Attachment', type: 'main', index: 0 }]] },
    'POS HTTP - Upload Expense Attachment': { main: [[{ node: 'Attachment - Finalize Upload Result', type: 'main', index: 0 }]] },
    'Attachment - Finalize Upload Result': { main: [[{ node: 'Telegram - Send Attachment Result', type: 'main', index: 0 }]] },
    'Edit - Load Draft And Prepare AI': { main: [[{ node: 'Edit - Continue To OpenAI', type: 'main', index: 0 }]] },
    'Edit - Continue To OpenAI': { main: [[{ node: 'OpenAI - Parse Edit Request', type: 'main', index: 0 }]] },
    'OpenAI - Parse Edit Request': { main: [[{ node: 'Draft - Apply Edit And Prepare Review', type: 'main', index: 0 }]] },
    'Draft - Apply Edit And Prepare Review': { main: [[{ node: 'Telegram - Send Edit Review', type: 'main', index: 0 }]] },
    'Cancel - Mark Draft Cancelled': { main: [[{ node: 'Telegram - Send Cancelled', type: 'main', index: 0 }]] },
    'Edit Button - Ask For Details': { main: [[{ node: 'Telegram - Send Edit Instructions', type: 'main', index: 0 }]] },
    'Pay Account - Update Draft': { main: [[{ node: 'Telegram - Send Pay Account Review', type: 'main', index: 0 }]] },
    'Branch - Update Draft': { main: [[{ node: 'Telegram - Send Branch Review', type: 'main', index: 0 }]] },
  },
  pinData: {},
  settings: { timezone: 'Asia/Dubai', executionOrder: 'v1' },
  staticData: null,
  tags: [{ name: 'laundry' }, { name: 'telegram' }, { name: 'ai' }, { name: 'expenses' }, { name: 'credentials' }, { name: 'direct-pos' }],
  triggerCount: 1,
  updatedAt: '2026-06-11T00:00:00.000Z',
  versionId: 'telegram-ai-expense-credentials-nodes-v1',
};

const outPath = path.resolve(__dirname, '..', 'n8n-telegram-ai-expense-approval-credentials-nodes-direct-pos.json');
fs.writeFileSync(outPath, JSON.stringify(workflow, null, 2) + '\n', 'utf8');
console.log(outPath);
