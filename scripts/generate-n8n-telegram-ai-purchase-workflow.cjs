const fs = require('fs');
const path = require('path');

function readJsonObject(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end <= start) return {};
  return JSON.parse(raw.slice(start, end + 1));
}

function loadVendors() {
  const filePath = path.join(__dirname, '..', 'expense_account.md', 'Creditors_accounts.md');
  const data = readJsonObject(filePath);
  return (Array.isArray(data.customer_data) ? data.customer_data : [])
    .map((item) => ({
      id: String(item.id ?? '').trim(),
      text: String(item.customer_name ?? '').trim(),
      branch_id: String(item.branch_id ?? '').trim(),
    }))
    .filter((item) => item.id && item.text);
}

const vendorsLiteral = JSON.stringify(loadVendors());

const normalizeCode = String.raw`
const vars = (typeof $vars === 'object' && $vars) ? $vars : {};
const trim = (v, f = '') => String(v ?? f).trim();
const update = $json;
const callback = update.callback_query;
const message = update.message || update.edited_message || callback?.message || update;
const text = trim(callback?.data || message.text || message.caption || '');
const chatId = trim(message.chat?.id);
const allowed = trim(vars.TELEGRAM_ALLOWED_CHAT_ID).split(',').map((v) => v.trim()).filter(Boolean);
if (!chatId || (allowed.length && !allowed.includes(chatId))) return [];

let action = 'intake';
let draft_id = '';
let edit_text = '';
let branch_id = '';
let branch_name = '';

if (text.startsWith('purchase_approve:')) {
  action = 'approve';
  draft_id = trim(text.slice('purchase_approve:'.length));
} else if (text.startsWith('purchase_cancel:')) {
  action = 'cancel';
  draft_id = trim(text.slice('purchase_cancel:'.length));
} else if (text.startsWith('purchase_edit_request:')) {
  action = 'edit_request';
  draft_id = trim(text.slice('purchase_edit_request:'.length));
} else if (text.startsWith('purchase_branch:')) {
  const parts = text.split(':');
  action = 'branch';
  draft_id = trim(parts[1]);
  branch_id = trim(parts[2]);
  branch_name = trim(parts.slice(3).join(':'));
} else {
  let match = text.match(/^(موافق|approve|ok)\s+(PUR-[A-Z0-9-]+)/i);
  if (match) {
    action = 'approve';
    draft_id = match[2];
  }
  match = text.match(/^(إلغاء|الغاء|cancel)\s+(PUR-[A-Z0-9-]+)/i);
  if (match) {
    action = 'cancel';
    draft_id = match[2];
  }
  match = text.match(/^(تعديل|edit)\s+(PUR-[A-Z0-9-]+)\s*([\s\S]*)/i);
  if (match) {
    action = 'edit';
    draft_id = match[2];
    edit_text = trim(match[3]);
  }
}

let input_type = 'text';
let telegram_file_id = '';
let telegram_file_name = '';
let telegram_mime_type = '';
if (Array.isArray(message.photo) && message.photo.length) {
  input_type = 'image';
  telegram_file_id = trim(message.photo[message.photo.length - 1]?.file_id);
  telegram_file_name = 'purchase-invoice.jpg';
  telegram_mime_type = 'image/jpeg';
}
if (message.document?.file_id) {
  const mime = trim(message.document.mime_type);
  telegram_file_id = trim(message.document.file_id);
  telegram_file_name = trim(message.document.file_name, 'purchase-invoice');
  telegram_mime_type = mime || 'application/octet-stream';
  input_type = mime === 'application/pdf' || /\.pdf$/i.test(telegram_file_name) ? 'pdf' : 'document';
}

const store = $getWorkflowStaticData('global');
if (!store.purchaseEditSessions || typeof store.purchaseEditSessions !== 'object') store.purchaseEditSessions = {};
const editSession = store.purchaseEditSessions[chatId];
if (action === 'edit_request' && draft_id) {
  store.purchaseEditSessions[chatId] = {
    draft_id,
    expires_at: Date.now() + (30 * 60 * 1000),
  };
} else if (
  action === 'intake'
  && text
  && !telegram_file_id
  && editSession?.draft_id
  && Number(editSession.expires_at || 0) > Date.now()
) {
  action = 'edit';
  draft_id = trim(editSession.draft_id);
  edit_text = trim(message.text || message.caption || text);
  delete store.purchaseEditSessions[chatId];
} else if (action === 'approve' || action === 'cancel') {
  delete store.purchaseEditSessions[chatId];
} else if (editSession && Number(editSession.expires_at || 0) <= Date.now()) {
  delete store.purchaseEditSessions[chatId];
}

return [{
  json: {
    action,
    draft_id,
    edit_text,
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

const intakeCode = String.raw`
const vars = (typeof $vars === 'object' && $vars) ? $vars : {};
const trim = (v, f = '') => String(v ?? f).trim();
if ($json.action !== 'intake') return [];
const hasBinary = Object.keys($input.item.binary || {}).length > 0;
if ($json.telegram_file_id && !hasBinary) {
  return [{
    json: {
      ...$json,
      stop: true,
      telegram_text: 'وصلت الفاتورة إلى البوت لكن Telegram Trigger لم ينزل الملف. افتح العقدة وفعّل Download Images/Files ثم أعد تفعيل Workflow.',
    },
  }];
}
if (!$json.message_text && !hasBinary) {
  return [{ json: { ...$json, stop: true, telegram_text: 'أرسل فاتورة مشتريات كنص أو صورة أو PDF.' } }];
}
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dubai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const itemSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    description: { type: 'string' },
    barcode: { type: 'string' },
    quantity: { type: 'number' },
    unit_text: { type: 'string' },
    unit_price: { type: 'number' },
    amount: { type: 'number' },
    vat_rate: { type: 'number' },
    tax_amount: { type: 'number' },
    net_amount: { type: 'number' },
    price_includes_tax: { type: 'boolean' },
  },
  required: ['description','barcode','quantity','unit_text','unit_price','amount','vat_rate','tax_amount','net_amount','price_includes_tax'],
};
const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    supplier_name: { type: 'string' },
    supplier_invoice_no: { type: 'string' },
    supplier_invoice_date: { type: 'string' },
    purchase_date: { type: 'string' },
    currency: { type: 'string' },
    tax_billing: { type: 'boolean' },
    items: { type: 'array', minItems: 1, items: itemSchema },
    discount: { type: 'number' },
    adjustment: { type: 'number' },
    round_off: { type: 'number' },
    invoice_total: { type: 'number' },
    notes: { type: 'string' },
    confidence: { type: 'number' },
    warnings: { type: 'array', items: { type: 'string' } },
  },
  required: ['supplier_name','supplier_invoice_no','supplier_invoice_date','purchase_date','currency','tax_billing','items','discount','adjustment','round_off','invoice_total','notes','confidence','warnings'],
};
const prompt = [
  'You extract UAE purchase invoices for IN AND OUT LAUNDRY.',
  'Return JSON only and preserve every purchased line item.',
  'Dates must be YYYY-MM-DD. Use ' + today + ' only when a date is missing and add a warning.',
  'Use AED unless another currency is printed.',
  'Never invent a barcode, supplier invoice number, quantity, or price.',
  'For labeled Telegram text, the value always comes after the label. Example: "المنتج items" means description="items", never description="المنتج".',
  'Support labels with or without a colon, including الفرع, المورد, رقم فاتورة المورد, تاريخ الفاتورة, المبلغ قبل الضريبة, الضريبة, الاجمالي, and المنتج.',
  'When Telegram text contains one product plus invoice subtotal/VAT/total but no quantity, use quantity=1 and assign the invoice subtotal/VAT/total to that product.',
  'For images and PDFs, perform careful OCR and read the supplier header, invoice number/date, every product row, subtotal, VAT, discounts, and grand total.',
  'Do not treat table headings such as Item, Product, Description, Qty, Amount, VAT, or Total as purchased product names.',
  'When a value is unreadable or ambiguous, preserve the readable values, use zero or an empty string for the uncertain value, and explain it in warnings.',
  'Check arithmetic: each line net_amount should equal amount + tax_amount, and invoice_total should match the visible grand total.',
  'For each item determine whether unit_price includes VAT.',
  'If VAT is printed, preserve subtotal, VAT, and total values exactly as closely as possible.',
  'If only a VAT-inclusive total is shown, set price_includes_tax=true.',
  'Telegram text or caption: ' + trim($json.message_text).slice(0, 3000),
].join('\n');
const content = [{ type: 'input_text', text: prompt }];
const binaryKey = Object.keys($input.item.binary || {})[0];
const binary = binaryKey ? $input.item.binary[binaryKey] : null;
let source_attachment = null;
if (binaryKey && binary) {
  const buffer = this.helpers?.getBinaryDataBuffer
    ? await this.helpers.getBinaryDataBuffer(0, binaryKey)
    : Buffer.from(binary.data || '', 'base64');
  if (!buffer?.length) throw new Error('Could not read Telegram purchase invoice binary.');
  const mime = $json.input_type === 'pdf'
    ? 'application/pdf'
    : String(binary.mimeType || $json.telegram_mime_type || 'image/jpeg');
  const fileName = binary.fileName || $json.telegram_file_name || (mime === 'application/pdf' ? 'purchase.pdf' : 'purchase.jpg');
  const dataUrl = 'data:' + mime + ';base64,' + Buffer.from(buffer).toString('base64');
  source_attachment = {
    telegram_file_id: trim($json.telegram_file_id),
    file_name: fileName,
    mime_type: mime,
    input_type: $json.input_type,
  };
  if (mime === 'application/pdf') content.push({ type: 'input_file', filename: fileName, file_data: dataUrl });
  else content.push({ type: 'input_image', image_url: dataUrl });
}
const intake_key = [trim($json.chat_id, 'chat'), trim($json.message_id, Date.now()), Math.random().toString(36).slice(2, 8)].join('-');
const prepared = { ...$json, intake_key, source_attachment, telegram_text: 'استلمت فاتورة المشتريات. جاري التحليل والمطابقة مع POS...' };
const store = $getWorkflowStaticData('global');
if (!store.purchaseIntakes || typeof store.purchaseIntakes !== 'object') store.purchaseIntakes = {};
store.purchaseIntakes[intake_key] = prepared;
return [{
  json: {
    ...prepared,
    openaiBody: {
      model: trim(vars.OPENAI_MODEL, 'gpt-4.1-mini'),
      metadata: { intake_key },
      input: [{ role: 'user', content }],
      text: { format: { type: 'json_schema', name: 'purchase_invoice_extraction', strict: true, schema } },
    },
  },
}];
`;

const gateCode = String.raw`
if ($json.stop) return [];
return items;
`;

const parseOpenAiCode = String.raw`
const trim = (v) => String(v ?? '').trim();
function outputText(response) {
  if (typeof response?.output_text === 'string') return response.output_text;
  const out = [];
  for (const row of response?.output || []) for (const part of row?.content || []) if (typeof part?.text === 'string') out.push(part.text);
  return out.join('\n');
}
function parse(text) {
  const fence = String.fromCharCode(96).repeat(3);
  let raw = trim(text);
  if (raw.toLowerCase().startsWith(fence + 'json')) raw = raw.slice(7);
  else if (raw.startsWith(fence)) raw = raw.slice(3);
  if (raw.endsWith(fence)) raw = raw.slice(0, -3);
  return JSON.parse(raw.trim());
}
const intake_key = trim($json.metadata?.intake_key);
const store = $getWorkflowStaticData('global');
const prepared = store.purchaseIntakes?.[intake_key];
if (!prepared) throw new Error('Purchase intake context not found. Run from Telegram Trigger.');
delete store.purchaseIntakes[intake_key];
const extracted = parse(outputText($json));
const sourceText = trim(prepared.message_text);
const lines = sourceText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
const valueAfterLabel = (labels) => {
  for (const line of lines) {
    for (const label of labels) {
      const escaped = label.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
      const match = line.match(new RegExp('^' + escaped + '\\s*[:：]?\\s*(.+)$', 'i'));
      if (match) return trim(match[1]);
    }
  }
  return '';
};
const amount = (value) => {
  const match = String(value || '').replace(/,/g, '').match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
};
const splitNameId = (value) => {
  const raw = trim(value);
  const match = raw.match(/^(.*?)\s*\/\s*(\d+)\s*$/);
  return match ? { name: trim(match[1]), id: trim(match[2]) } : { name: raw, id: '' };
};
const branch = splitNameId(valueAfterLabel(['الفرع', 'branch']));
const supplier = splitNameId(valueAfterLabel(['المورد', 'vendor', 'supplier']));
const invoiceNo = valueAfterLabel(['رقم فاتورة المورد', 'رقم الفاتورة', 'supplier invoice no', 'invoice no']);
const invoiceDate = valueAfterLabel(['تاريخ الفاتورة', 'supplier invoice date', 'invoice date']);
const productValue = valueAfterLabel(['المنتج', 'الصنف', 'product', 'item']);
const product = splitNameId(productValue);
const quantity = amount(valueAfterLabel(['الكمية', 'quantity', 'qty'])) || 1;
const subtotal = amount(valueAfterLabel(['المبلغ قبل الضريبة', 'قبل الضريبة', 'subtotal', 'gross']));
const tax = amount(valueAfterLabel(['قيمة الضريبة', 'الضريبة', 'vat', 'tax']));
const total = amount(valueAfterLabel(['الإجمالي', 'الاجمالي', 'grand total', 'total']));

if (supplier.name) extracted.supplier_name = supplier.name;
if (invoiceNo) extracted.supplier_invoice_no = invoiceNo;
if (/^\d{4}-\d{2}-\d{2}$/.test(invoiceDate)) {
  extracted.supplier_invoice_date = invoiceDate;
  extracted.purchase_date = invoiceDate;
}
if (total > 0) extracted.invoice_total = total;
if (product.name) {
  const net = total || (subtotal + tax);
  const beforeTax = subtotal || (tax > 0 && net > 0 ? net - tax : net);
  extracted.items = [{
    description: product.name,
    barcode: product.id,
    quantity,
    unit_text: 'item',
    unit_price: quantity > 0 ? beforeTax / quantity : beforeTax,
    amount: beforeTax,
    vat_rate: tax > 0 && beforeTax > 0 ? Number(((tax / beforeTax) * 100).toFixed(4)) : 0,
    tax_amount: tax,
    net_amount: net,
    price_includes_tax: false,
  }];
}
return [{
  json: {
    ...prepared,
    extracted,
    branch_id: branch.id || prepared.branch_id || '',
    branch_name: branch.name || prepared.branch_name || '',
    supplied_vendor_id: supplier.id,
  },
}];
`;

const posShared = String.raw`
const trim = (v, f = '') => String(v ?? f).trim();
const number = (v, f = 0) => {
  const parsed = Number(String(v ?? '').replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : f;
};
const vars = (typeof $vars === 'object' && $vars) ? $vars : {};
const POS_USERNAME = trim(vars.POS_USERNAME);
const POS_PASSWORD = trim(vars.POS_PASSWORD);
const CLIENT_IDENTIFIER = trim(vars.AIPSOFT_CLIENT_IDENTIFIER, 'inout') || 'inout';
const POS_BASE_URL = trim(vars.AIPSOFT_API_BASE_URL, 'https://beta.aipsoft.com/inout').replace(/\/$/, '');
const POS_LOGIN_ENDPOINT = trim(vars.POS_LOGIN_ENDPOINT, POS_BASE_URL + '/login/check');
const POS_REFERER = trim(vars.POS_PURCHASE_REFERER, POS_BASE_URL + '/transaction/purchase');
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
      for (const [key, child] of Object.entries(value)) build(prefix + '[' + key + ']', child);
      return;
    }
    add(prefix, value);
  };
  for (const [key, value] of Object.entries(params || {})) build(key, value);
  return pairs.join('&');
};
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
const isLogin = (text) => /login\/check|name=["']password|::\s*login/i.test(String(text || ''));
async function rawRequest(options) {
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
function headers(cookie, contentType = true) {
  const value = {
    Accept: 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8,ar;q=0.7',
    Origin: POS_ORIGIN,
    Referer: POS_REFERER,
    'X-Requested-With': 'XMLHttpRequest',
    Cookie: cookie,
  };
  if (contentType) value['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
  return value;
}
async function createPosSession() {
  let cookie = 'language=english; direction=ltr; dont_show_today=true';
  try {
    const start = await rawRequest.call(this, { method: 'GET', url: POS_REFERER, headers: headers(cookie, false) });
    cookie = mergeCookies(cookie, setCookies(start.headers));
  } catch {}
  const short = POS_USERNAME.includes('@') ? POS_USERNAME.split('@')[0].trim() : POS_USERNAME;
  const candidates = Array.from(new Set([POS_USERNAME, POS_USERNAME.toLowerCase(), short, short.toLowerCase(), short + '@' + CLIENT_IDENTIFIER].filter(Boolean)));
  let authed = false;
  for (const username of candidates) {
    const login = await rawRequest.call(this, {
      method: 'POST',
      url: POS_LOGIN_ENDPOINT,
      headers: headers(cookie),
      body: formEncode({ username, password: POS_PASSWORD, client_identifier: CLIENT_IDENTIFIER, auto_login: 'null', connection_path: 'null' }),
    });
    cookie = mergeCookies(cookie, setCookies(login.headers));
    if ((/login_success|password_ok/i.test(login.body) || !isLogin(login.body)) && /ci_session_/i.test(cookie) && /\binout=/i.test(cookie)) {
      authed = true;
      break;
    }
  }
  if (!authed) throw new Error('POS login failed.');
  async function post(path, data, label) {
    const response = await rawRequest.call(this, { method: 'POST', url: POS_BASE_URL + path, headers: headers(cookie), body: formEncode(data || {}) });
    cookie = mergeCookies(cookie, setCookies(response.headers));
    if (isLogin(response.body)) throw new Error(label + ' returned POS login page.');
    try { return JSON.parse(response.body); }
    catch { throw new Error(label + ' returned invalid JSON: ' + response.body.slice(0, 250)); }
  }
  async function get(path, label) {
    const response = await rawRequest.call(this, { method: 'GET', url: POS_BASE_URL + path, headers: headers(cookie, false) });
    cookie = mergeCookies(cookie, setCookies(response.headers));
    if (isLogin(response.body)) throw new Error(label + ' returned POS login page.');
    try { return JSON.parse(response.body); }
    catch { throw new Error(label + ' returned invalid JSON: ' + response.body.slice(0, 250)); }
  }
  return { post: post.bind(this), get: get.bind(this), cookie: () => cookie };
}
`;

const matchCode = posShared + String.raw`
const vendors = ${vendorsLiteral};
const normalize = (value) => trim(value).toLowerCase()
  .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9\u0600-\u06ff]+/g, ' ')
  .replace(/\b(llc|l l c|est|establishment|company|co|trading|general)\b/g, ' ')
  .replace(/\s+/g, ' ').trim();
const similarity = (left, right) => {
  const a = normalize(left);
  const b = normalize(right);
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return 0.92;
  const aa = new Set(a.split(' '));
  const bb = new Set(b.split(' '));
  const intersection = [...aa].filter((word) => bb.has(word)).length;
  return intersection / Math.max(aa.size, bb.size, 1);
};
const productAliases = {
  items: { product_id: '211', barcode: '95343' },
};
const branchId = trim($json.branch_id, '1');
const supplier = trim($json.extracted?.supplier_name);
const suppliedVendorId = trim($json.supplied_vendor_id);
const vendorMatches = vendors
  .map((vendor) => ({ ...vendor, score: similarity(supplier, vendor.text) + ((vendor.branch_id === branchId || vendor.branch_id === '0') ? 0.03 : 0) }))
  .sort((a, b) => b.score - a.score);
const exactVendor = suppliedVendorId ? vendors.find((vendor) => vendor.id === suppliedVendorId) : null;
const vendor = exactVendor
  ? { ...exactVendor, score: 1 }
  : (vendorMatches[0] && vendorMatches[0].score >= 0.45 ? vendorMatches[0] : null);
if (!vendor) {
  return [{ json: { ...$json, match_error: 'لم يتم العثور على مورد مطابق في حسابات POS: ' + supplier, vendor_candidates: vendorMatches.slice(0, 5) } }];
}
const session = await createPosSession.call(this);
let vendorInfo = {};
try {
  vendorInfo = await session.post('/transaction/check_taxable', { type: '', id: vendor.id, branch: branchId, mode: 'PURCHASE' }, 'check_taxable');
} catch {}

const matchedItems = [];
for (let index = 0; index < ($json.extracted?.items || []).length; index++) {
  const source = $json.extracted.items[index];
  const query = trim(source.barcode || source.description);
  const alias = productAliases[normalize(source.description)] || null;
  const expectedBarcode = trim(source.barcode || alias?.barcode);
  if (!query) {
    matchedItems.push({ source, index, matched: false, error: 'اسم المنتج أو Barcode مفقود' });
    continue;
  }
  let search = [];
  const searchTerms = Array.from(new Set([query, expectedBarcode].filter(Boolean)));
  for (const term of searchTerms) {
    try {
      const response = await session.get('/transaction/fetch_product_with_name_hinds/new_search_2/?search_text=' + encodeURIComponent(term), 'product search');
      if (Array.isArray(response)) search.push(...response);
    } catch {}
    if (search.length) break;
  }
  if (!search.length && alias?.product_id) {
    search = [{ id: alias.product_id, customer_input: alias.barcode || source.description }];
  }
  if (!Array.isArray(search) || !search.length) {
    matchedItems.push({ source, index, matched: false, error: 'المنتج غير موجود في POS: ' + query });
    continue;
  }
  const ranked = search
    .map((row) => ({
      ...row,
      score: similarity(source.description, row.customer_input)
        + (expectedBarcode && trim(row.customer_input) === expectedBarcode ? 1 : 0)
        + (alias?.product_id && trim(row.id) === alias.product_id ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  let selected = null;
  for (const candidate of ranked) {
    let details;
    try {
      details = await session.post('/transaction/fetch_product_complete_details', {
        product_id: candidate.id,
        selected_txt: candidate.id,
        search_type: '',
        branch_id: branchId,
        last_sale_price_flag: '0',
        cust_id: vendor.id,
        mode: 'PURCHASE',
      }, 'fetch_product_complete_details');
    } catch {
      continue;
    }
    const product = Array.isArray(details?.[0]) ? details[0][0] : null;
    const taxes = Array.isArray(details?.[1]) ? details[1] : [];
    if (!product) continue;
    const score = similarity(source.description, product.product_name1_long || product.product_name)
      + (expectedBarcode && expectedBarcode === trim(product.barcode) ? 1.5 : 0)
      + (alias?.product_id && alias.product_id === trim(product.id) ? 1 : 0);
    if (!selected || score > selected.score) selected = { product, taxes, score };
  }
  if (!selected || selected.score < 0.35) {
    matchedItems.push({ source, index, matched: false, error: 'تعذر تأكيد المنتج: ' + query, candidates: ranked });
    continue;
  }
  matchedItems.push({ source, index, matched: true, product: selected.product, taxes: selected.taxes, match_score: selected.score });
}
return [{ json: { ...$json, vendor: { id: vendor.id, text: vendor.text, branch_id: vendor.branch_id, score: vendor.score, taxable: String(vendorInfo.taxable ?? '') }, matched_items: matchedItems } }];
`;

const saveDraftCode = String.raw`
const trim = (v, f = '') => String(v ?? f).trim();
const num = (v, f = 0) => {
  const parsed = Number(String(v ?? '').replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : f;
};
const round = (v, digits = 12) => Number(num(v).toFixed(digits));
const money = (v) => num(v).toFixed(2);
const dateOnly = (value) => {
  const raw = trim(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dubai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
};
const review = (id, draft) => {
  const lines = [
    'فاتورة مشتريات جاهزة للمراجعة',
    '',
    'Draft: ' + id,
    'الفرع: ' + draft.branch.name + ' / ' + draft.branch.id,
    'المورد: ' + draft.vendor.text + ' / ' + draft.vendor.id,
    'رقم فاتورة المورد: ' + (draft.header.party_invoice_no || '-'),
    'تاريخ الفاتورة: ' + draft.header.party_invoice_date,
    'طريقة الدفع: آجل',
    '',
  ];
  draft.items.forEach((item, index) => {
    lines.push(
      (index + 1) + '. ' + item.product_name,
      'Product ID: ' + item.product_id + ' | Barcode: ' + (item.barcode || '-'),
      'Qty: ' + item.quantity + ' ' + item.unit_name,
      'Before VAT: AED ' + money(item.amount),
      'VAT ' + item.vat_rate + '%: AED ' + money(item.tax_amount),
      'Net: AED ' + money(item.net_amount),
      ''
    );
  });
  lines.push(
    'Gross: AED ' + money(draft.totals.gross),
    'VAT: AED ' + money(draft.totals.tax),
    'Grand Total: AED ' + money(draft.totals.grand_total),
    'Balance: AED ' + money(draft.totals.balance),
    'Difference: AED ' + money(draft.totals.difference)
  );
  if (draft.errors.length) lines.push('', 'لا يمكن الحفظ:', ...draft.errors.map((value) => '- ' + value));
  return lines.join('\n');
};

const errors = $json.match_error ? [$json.match_error] : [];
const items = [];
for (const row of $json.matched_items || []) {
  if (!row.matched) {
    errors.push(row.error || 'يوجد منتج غير مطابق');
    continue;
  }
  const source = row.source || {};
  const product = row.product || {};
  const quantity = Math.max(num(source.quantity, 1), 0);
  const vatRate = Math.max(num(source.vat_rate, row.taxes?.length ? 5 : 0), 0);
  let amount = num(source.amount);
  let tax = num(source.tax_amount);
  let net = num(source.net_amount);
  const unitPrice = num(source.unit_price);
  if (source.price_includes_tax) {
    if (!net) net = round(quantity * unitPrice);
    if (!amount) amount = vatRate > 0 ? round(net / (1 + vatRate / 100)) : net;
    if (!tax) tax = round(net - amount);
  } else {
    if (!amount) amount = round(quantity * unitPrice);
    if (!tax && vatRate > 0) tax = round(amount * vatRate / 100);
    if (!net) net = round(amount + tax);
  }
  if (quantity <= 0) errors.push('كمية غير صحيحة للمنتج: ' + trim(product.product_name));
  const taxRow = (row.taxes || []).find((value) => String(value.tax_id) === '1') || (row.taxes || [])[0] || null;
  const purchaseRate = quantity > 0 ? round(amount / quantity) : 0;
  const inclusiveRate = quantity > 0 ? round(net / quantity) : 0;
  const salePrice = num(product.sale_price);
  const margin = salePrice ? round(((salePrice - purchaseRate) / salePrice) * 100, 2) : 0;
  items.push({
    product_id: trim(product.id),
    product_name: trim(product.product_name1_long || product.product_name),
    barcode: trim(product.barcode || source.barcode),
    unit_id: trim(product.purchase_unit_id || product.unit_id),
    unit_name: trim(product.purchase_unit || product.avail_units || product.baseunit),
    quantity,
    base_qty: round(quantity * num(product.purchase_eq_to_base, 1)),
    purchase_rate: purchaseRate,
    amount: round(amount),
    total_tax: round(tax),
    net_amount: round(net),
    inc_rate: inclusiveRate,
    net_rate: purchaseRate,
    item_note: trim(product.category_name || source.description),
    sale_price: salePrice,
    margin_per: margin,
    tax_id: vatRate > 0 ? trim(taxRow?.tax_id, '1') : '',
    tax_value: vatRate > 0 ? trim(taxRow?.tax_value, String(vatRate) + '%') : '',
    vat_rate: vatRate,
    unique_record: Array.from({ length: 64 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)]).join(''),
  });
}
if (!items.length) errors.push('لم تتم مطابقة أي منتج مع POS.');
const gross = round(items.reduce((sum, item) => sum + item.amount, 0));
const totalTax = round(items.reduce((sum, item) => sum + item.total_tax, 0));
const totalNet = round(items.reduce((sum, item) => sum + item.net_amount, 0));
const discount = num($json.extracted?.discount);
const adjustment = num($json.extracted?.adjustment);
const roundOff = num($json.extracted?.round_off);
const grandTotal = round(totalNet - discount + adjustment + roundOff);
const invoiceTotal = num($json.extracted?.invoice_total, grandTotal);
const difference = round(invoiceTotal - grandTotal);
if (Math.abs(difference) > 0.01) errors.push('فرق الإجمالي AED ' + money(difference));
if (!$json.vendor?.id) errors.push('المورد غير محدد.');
const existingId = trim($json.draft_id);
const draftId = existingId || ('PUR-' + new Date().toISOString().replace(/\D/g, '').slice(0, 14) + '-' + Math.random().toString(36).slice(2, 6).toUpperCase());
const branch = { id: trim($json.branch_id, '1'), name: trim($json.branch_name, 'AL FALAH') };
const vendor = $json.vendor || {
  id: '',
  text: trim($json.extracted?.supplier_name, 'غير مطابق'),
  branch_id: branch.id,
  score: 0,
  taxable: '',
};
const draft = {
  draft_id: draftId,
  status: errors.length ? 'needs_review' : 'pending_approval',
  chat_id: trim($json.chat_id),
  message_id: trim($json.message_id),
  source_attachment: $json.source_attachment || null,
  extracted: $json.extracted,
  branch,
  vendor,
  items,
  header: {
    party_invoice_no: trim($json.extracted?.supplier_invoice_no),
    party_invoice_date: dateOnly($json.extracted?.supplier_invoice_date),
    purchase_date: dateOnly($json.extracted?.purchase_date || $json.extracted?.supplier_invoice_date),
    notes: trim($json.extracted?.notes),
  },
  totals: {
    quantity: round(items.reduce((sum, item) => sum + item.quantity, 0)),
    gross,
    tax: totalTax,
    net: totalNet,
    discount,
    adjustment,
    round_off: roundOff,
    grand_total: grandTotal,
    paid: 0,
    balance: grandTotal,
    invoice_total: invoiceTotal,
    difference,
  },
  errors,
  updated_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
};
const store = $getWorkflowStaticData('global');
if (!store.purchaseDrafts || typeof store.purchaseDrafts !== 'object') store.purchaseDrafts = {};
if (store.purchaseDrafts[draftId]?.created_at) draft.created_at = store.purchaseDrafts[draftId].created_at;
store.purchaseDrafts[draftId] = draft;
return [{ json: { ...$json, draft_id: draftId, draft, telegram_text: review(draftId, draft) } }];
`;

const loadDraftCode = String.raw`
if ($json.action !== 'approve') return [];
const store = $getWorkflowStaticData('global');
const draft = store.purchaseDrafts?.[$json.draft_id];
if (!draft) return [{ json: { ...$json, stop: true, telegram_text: 'لم أجد مسودة المشتريات: ' + $json.draft_id } }];
if (draft.status === 'registered') return [{ json: { ...$json, stop: true, telegram_text: 'تم تسجيل هذه المسودة سابقاً. Purchase ID: ' + (draft.result?.purchase_id || '') } }];
if (draft.errors?.length) return [{ json: { ...$json, stop: true, telegram_text: 'لا يمكن التسجيل قبل حل الأخطاء:\n' + draft.errors.map((v) => '- ' + v).join('\n') } }];
draft.status = 'registering';
draft.registering_at = new Date().toISOString();
return [{ json: { ...$json, draft } }];
`;

const registerCode = posShared + String.raw`
if ($json.stop) return [{ json: $json }];
const draft = $json.draft;
if (!draft) throw new Error('Purchase draft is missing.');
const toPosDate = (value) => {
  const raw = trim(value);
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? match[3] + '-' + match[2] + '-' + match[1] : raw;
};
const normalizeName = (value) => trim(value).toLowerCase()
  .replace(/[^a-z0-9\u0600-\u06ff]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
const session = await createPosSession.call(this);
const latest = await session.post('/transaction/latest_invoice_number', { mode: 'PURCHASE' }, 'latest_invoice_number');
const invoiceNo = trim(typeof latest === 'string' || typeof latest === 'number' ? latest : (latest.invoice_no || latest.id || latest.data));
if (!invoiceNo) throw new Error('POS did not return latest purchase invoice number.');
const dueDate = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dubai', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date()).replace(/\//g, '-');
const common = {
  invoice_no: invoiceNo,
  branch_id: draft.branch.id,
  vendors: draft.vendor.id,
  purchase_account: '11',
  currencies: '2',
  purchase_date: toPosDate(draft.header.purchase_date),
  due_date: dueDate,
  partys_name: '',
  partys_no: draft.header.party_invoice_no,
  partys_inv_date: toPosDate(draft.header.party_invoice_date),
  remark1: '',
  remark2: '',
  purchase_order_no: '',
  grn_no: '',
  total_quantity: draft.totals.quantity,
  total_gross: draft.totals.gross,
  total_net_amount: draft.totals.net,
  final_total_tax: draft.totals.tax,
  total_disc: draft.totals.discount,
  total_additional_discount_per: '',
  total_additional_discount: '0',
  round_off: draft.totals.round_off || '',
  adjustment: draft.totals.adjustment || '',
  grand_total: draft.totals.grand_total.toFixed(2),
  paid_amount: '0',
  balance_amount: draft.totals.balance,
  project_id: '',
  disable_tax: '1',
  manual_total: '',
};
const toProductRow = (item) => ({
  details_id: '',
  barcode: item.barcode,
  product_id: item.product_id,
  unit_id: item.unit_id,
  quantity: item.quantity,
  purchase_rate: item.purchase_rate,
  amount: item.amount,
  total_tax: item.total_tax,
  net_amount: item.net_amount,
  mr_no: '0',
  spl_discount: '0',
  spl_disc_percentage: '0',
  add_discount: '0',
  discount: '0',
  free: '0',
  inc_rate: item.inc_rate,
  item_note: item.item_note,
  net_rate: item.net_rate,
  foc_link_id: '0',
  sale_price: item.sale_price,
  margin_per: item.margin_per,
  base_qty: item.base_qty,
  unique_record: item.unique_record,
  multi_rate_id: '',
});
const toTaxRow = (item) => ({
  tax_id: item.tax_id,
  tax_amount: item.total_tax,
  tax_value: item.tax_value || (item.vat_rate + '%'),
  product_id: item.product_id,
});
let purchaseId = '';
const lineResponses = [];
let cumulativeQuantity = 0;
let cumulativeGross = 0;
let cumulativeTax = 0;
let cumulativeNet = 0;

// POS auto-saves one product row at a time. The returned p_id must be chained
// into invoice_id for every following row before the final save_type=2 request.
for (let index = 0; index < draft.items.length; index += 1) {
  const item = draft.items[index];
  cumulativeQuantity += Number(item.quantity || 0);
  cumulativeGross += Number(item.amount || 0);
  cumulativeTax += Number(item.total_tax || 0);
  cumulativeNet += Number(item.net_amount || 0);
  const rowPayload = {
    hold: '1',
    ...common,
    total_quantity: cumulativeQuantity,
    total_gross: cumulativeGross,
    total_net_amount: cumulativeNet,
    final_total_tax: cumulativeTax,
    total_disc: '0',
    round_off: '',
    adjustment: '',
    grand_total: cumulativeNet.toFixed(2),
    balance_amount: cumulativeNet,
    final_purchase_product_list: [toProductRow(item)],
    purchase_tax_values: item.tax_id && Number(item.total_tax) > 0 ? [toTaxRow(item)] : [],
    update_purchase_rate: '0',
    invoice_id: purchaseId,
    save_type: '1',
    product_custom_fields: { form_validation: 'true' },
  };
  const rowResponse = await session.post(
    '/transaction/save_purchase_details_2',
    rowPayload,
    'create purchase line ' + (index + 1),
  );
  if (
    Number(rowResponse.response_code) !== 200
    || Number(rowResponse.status) !== 1
    || !rowResponse.p_id
    || !rowResponse.details_id
  ) {
    throw new Error(
      'Purchase line ' + (index + 1) + ' was not saved correctly: ' + JSON.stringify(rowResponse),
    );
  }
  const returnedPurchaseId = trim(rowResponse.p_id);
  if (purchaseId && returnedPurchaseId !== purchaseId) {
    throw new Error(
      'POS returned a different Purchase ID for line ' + (index + 1)
      + '. Expected ' + purchaseId + ', received ' + returnedPurchaseId,
    );
  }
  purchaseId = returnedPurchaseId;
  lineResponses.push({
    line: index + 1,
    product_id: item.product_id,
    details_id: trim(rowResponse.details_id),
    response: rowResponse,
  });
}
if (!purchaseId) throw new Error('POS did not create a Purchase ID.');
const finalizePayload = {
  hold: '0',
  ...common,
  update_purchase_rate: '1',
  invoice_id: purchaseId,
  adjustment_details: [{
    adjustment_id: '',
    add_or_less: '',
    adjust_account: '',
    adjust_narration: '',
    adjust_amount: '0',
  }],
  new_misc_fields: [{ field_name: '', field_type: '' }],
  payment_details: [],
  removed_payment_details: [],
  save_type: '2',
  page_custom_fields: { form_validation: 'true' },
};
const finalize = await session.post('/transaction/save_purchase_details_2', finalizePayload, 'finalize purchase');
if (Number(finalize.response_code) !== 200 || Number(finalize.status) !== 2) {
  throw new Error('Purchase Finalize failed after creating Purchase ID ' + purchaseId + ': ' + JSON.stringify(finalize));
}
const verification = {
  checked: false,
  ok: false,
  status: 'not_checked',
  warnings: [],
  errors: [],
  journal_checked: false,
  journal_ok: false,
  details_checked: false,
  details_ok: false,
  journal_entries: [],
  purchase_details: [],
};
try {
  const journalErrorStart = verification.errors.length;
  const journal = await session.post('/transaction/journalEntryData', {
    draw: '1',
    'columns[0][data]': '0',
    'columns[0][name]': '',
    'columns[0][searchable]': 'false',
    'columns[0][orderable]': 'false',
    'columns[0][search][value]': '',
    'columns[0][search][regex]': 'false',
    'columns[1][data]': '1',
    'columns[1][name]': '',
    'columns[1][searchable]': 'false',
    'columns[1][orderable]': 'false',
    'columns[1][search][value]': '',
    'columns[1][search][regex]': 'false',
    'columns[2][data]': '2',
    'columns[2][name]': '',
    'columns[2][searchable]': 'false',
    'columns[2][orderable]': 'false',
    'columns[2][search][value]': '',
    'columns[2][search][regex]': 'false',
    'order[0][column]': '0',
    'order[0][dir]': 'ASC',
    start: '0',
    length: '10',
    'search[value]': '',
    'search[regex]': 'false',
    from_date: 'undefined-undefined-',
    from_time: '',
    to_date: 'undefined-undefined-',
    to_time: '',
    vendor: '',
    order_id: purchaseId,
    order_type: 'PI',
  }, 'purchase journalEntryData');
  const rows = Array.isArray(journal?.data) ? journal.data : [];
  const entries = rows.map((row) => ({
    account_name: trim(Array.isArray(row) ? row[0] : row.acc_name1),
    debit: number(Array.isArray(row) ? row[1] : row.db_amount),
    credit: number(Array.isArray(row) ? row[2] : row.cr_amount),
  }));
  const debit = number(journal?.db_total, entries.reduce((sum, row) => sum + row.debit, 0));
  const credit = number(journal?.cr_total, entries.reduce((sum, row) => sum + row.credit, 0));
  const purchaseDebit = entries
    .filter((row) => /purchase account/i.test(row.account_name))
    .reduce((sum, row) => sum + row.debit, 0);
  const vatDebit = entries
    .filter((row) => /vat on purchase/i.test(row.account_name))
    .reduce((sum, row) => sum + row.debit, 0);
  const vendorCredit = entries
    .filter((row) => row.credit > 0 && !/purchase account|vat on purchase/i.test(row.account_name))
    .reduce((sum, row) => sum + row.credit, 0);
  const compare = (label, expected, actual) => {
    if (Math.abs(number(expected) - number(actual)) > 0.01) {
      verification.errors.push(
        label + ' expected AED ' + number(expected).toFixed(2)
        + ', journal returned AED ' + number(actual).toFixed(2),
      );
    }
  };
  verification.journal_checked = true;
  verification.journal_response = journal;
  verification.journal_entries = entries;
  verification.journal_actual = {
    purchase_account_debit: number(purchaseDebit),
    vat_on_purchase_debit: number(vatDebit),
    vendor_credit: number(vendorCredit),
    debit_total: number(debit),
    credit_total: number(credit),
    balanced: Math.abs(number(debit) - number(credit)) <= 0.01,
  };
  if (!entries.length) verification.errors.push('POS returned no purchase journal entries.');
  compare('Purchase Account', draft.totals.gross, purchaseDebit);
  compare('VAT on Purchase', draft.totals.tax, vatDebit);
  compare('Vendor Credit', draft.totals.grand_total, vendorCredit);
  if (Math.abs(number(debit) - number(credit)) > 0.01) {
    verification.errors.push(
      'Purchase journal is not balanced: debit AED ' + number(debit).toFixed(2)
      + ', credit AED ' + number(credit).toFixed(2),
    );
  }
  const vendorEntry = entries.find((row) => row.credit > 0 && row.account_name);
  if (vendorEntry && normalizeName(vendorEntry.account_name) !== normalizeName(draft.vendor.text)) {
    verification.warnings.push(
      'Journal vendor name "' + vendorEntry.account_name
      + '" differs from selected vendor "' + draft.vendor.text + '".',
    );
  }
  verification.journal_ok = verification.errors.length === journalErrorStart;
} catch (error) {
  verification.journal_error = String(error?.message || error);
  verification.warnings.push('تعذر جلب القيد المحاسبي بعد الحفظ.');
}
try {
  const detailsErrorStart = verification.errors.length;
  const detailsResponse = await session.post('/transaction/fetch_purchase_details', {
    purchase_id: purchaseId,
    purchase_id_counter: '',
    counter_mode: '',
    hold: '0',
    type: '0',
    mode: 'PURCHASE',
  }, 'purchase fetch_purchase_details');
  const invoice = Array.isArray(detailsResponse?.purchase_invoice)
    ? detailsResponse.purchase_invoice[0]
    : detailsResponse?.purchase_invoice;
  if (!invoice || typeof invoice !== 'object') {
    throw new Error('POS returned no purchase_invoice record for Purchase ID ' + purchaseId + '.');
  }
  const detailRows = Array.isArray(invoice.purchase_details) ? invoice.purchase_details : [];
  const compareId = (label, expected, actual) => {
    if (trim(expected) !== trim(actual)) {
      verification.errors.push(
        label + ' expected "' + trim(expected) + '", POS returned "' + trim(actual) + '".',
      );
    }
  };
  const compareAmount = (label, expected, actual) => {
    if (Math.abs(number(expected) - number(actual)) > 0.01) {
      verification.errors.push(
        label + ' expected AED ' + number(expected).toFixed(2)
        + ', POS returned AED ' + number(actual).toFixed(2),
      );
    }
  };
  verification.details_checked = true;
  verification.details_response_code = number(detailsResponse?.response_code);
  verification.purchase_header = {
    id: trim(invoice.id),
    invoice_no: trim(invoice.invoice_no),
    branch_id: trim(invoice.branch_id),
    vendor_id: trim(invoice.vendor_id),
    vendor_name: trim(invoice.customer_name),
    purchase_account: trim(invoice.purchase_account),
    currency_id: trim(invoice.currency_id),
    party_invoice_no: trim(invoice.party_no),
    purchase_date: trim(invoice.date),
    party_invoice_date: trim(invoice.party_invoice_date),
    total_quantity: number(invoice.total_quantity),
    total_gross: number(invoice.total_gross),
    total_tax: number(invoice.total_tax),
    grand_total: number(invoice.grand_total),
    paid_amount: number(invoice.paid_amount),
    balance_amount: number(invoice.balance_amount),
    status: trim(invoice.status),
    hold: trim(invoice.hold),
  };
  if (number(detailsResponse?.response_code) !== 200) {
    verification.errors.push(
      'fetch_purchase_details response_code expected 200, POS returned '
      + trim(detailsResponse?.response_code) + '.',
    );
  }
  compareId('Purchase ID', purchaseId, invoice.id);
  compareId('Purchase number', invoiceNo, invoice.invoice_no);
  compareId('Branch ID', draft.branch.id, invoice.branch_id);
  compareId('Vendor ID', draft.vendor.id, invoice.vendor_id);
  compareId('Purchase Account', '11', invoice.purchase_account);
  compareId('Currency ID', '2', invoice.currency_id);
  compareId('Party invoice number', draft.header.party_invoice_no, invoice.party_no);
  compareId('Purchase date', draft.header.purchase_date, invoice.date);
  compareId('Party invoice date', draft.header.party_invoice_date, invoice.party_invoice_date);
  compareId('Purchase status', '1', invoice.status);
  compareId('Purchase hold', '0', invoice.hold);
  compareAmount('Total quantity', draft.totals.quantity, invoice.total_quantity);
  compareAmount('Purchase Gross', draft.totals.gross, invoice.total_gross);
  compareAmount('Purchase VAT', draft.totals.tax, invoice.total_tax);
  compareAmount('Purchase Net', draft.totals.net, invoice.total_net_amount);
  compareAmount('Purchase Grand Total', draft.totals.grand_total, invoice.grand_total);
  compareAmount('Purchase Paid', draft.totals.paid, invoice.paid_amount);
  compareAmount('Purchase Balance', draft.totals.balance, invoice.balance_amount);
  if (detailRows.length !== draft.items.length) {
    verification.errors.push(
      'Product row count expected ' + draft.items.length + ', POS returned ' + detailRows.length + '.',
    );
  }
  const usedDetails = new Set();
  for (let index = 0; index < draft.items.length; index += 1) {
    const expected = draft.items[index];
    let detailIndex = detailRows.findIndex((row, rowIndex) => (
      !usedDetails.has(rowIndex)
      && trim(row.product_id) === trim(expected.product_id)
      && (!trim(expected.barcode) || trim(row.barcode) === trim(expected.barcode))
    ));
    if (detailIndex < 0) {
      detailIndex = detailRows.findIndex((row, rowIndex) => (
        !usedDetails.has(rowIndex) && trim(row.product_id) === trim(expected.product_id)
      ));
    }
    if (detailIndex < 0) {
      verification.errors.push(
        'Product row not found in POS: ' + trim(expected.product_name, expected.product_id) + '.',
      );
      continue;
    }
    usedDetails.add(detailIndex);
    const actual = detailRows[detailIndex];
    const savedLine = lineResponses[index] || {};
    const rowLabel = 'Product ' + (index + 1) + ' (' + trim(expected.product_name, expected.product_id) + ')';
    if (!trim(actual.id)) verification.errors.push(rowLabel + ' has no details_id in POS.');
    if (savedLine.details_id) compareId(rowLabel + ' details_id', savedLine.details_id, actual.id);
    compareId(rowLabel + ' product_id', expected.product_id, actual.product_id);
    compareId(rowLabel + ' barcode', expected.barcode, actual.barcode);
    compareId(rowLabel + ' unit_id', expected.unit_id, actual.unit_id);
    compareAmount(rowLabel + ' quantity', expected.quantity, actual.quantity);
    compareAmount(rowLabel + ' base quantity', expected.base_qty, actual.base_qty);
    compareAmount(rowLabel + ' amount', expected.amount, actual.amount);
    compareAmount(rowLabel + ' VAT', expected.total_tax, actual.total_tax);
    compareAmount(rowLabel + ' net amount', expected.net_amount, actual.net_amount);
    if (
      normalizeName(expected.product_name)
      && normalizeName(expected.product_name) !== normalizeName(actual.product_name1_long || actual.product_name)
    ) {
      verification.warnings.push(
        rowLabel + ' name differs from POS "' + trim(actual.product_name1_long || actual.product_name) + '".',
      );
    }
    const taxes = Array.isArray(actual.purchase_taxes) ? actual.purchase_taxes : [];
    if (number(expected.total_tax) > 0 && !taxes.some((tax) => trim(tax.tax_id) === trim(expected.tax_id, '1'))) {
      verification.errors.push(rowLabel + ' is missing VAT tax_id ' + trim(expected.tax_id, '1') + '.');
    }
    verification.purchase_details.push({
      details_id: trim(actual.id),
      product_id: trim(actual.product_id),
      product_name: trim(actual.product_name1_long || actual.product_name),
      barcode: trim(actual.barcode),
      unit_id: trim(actual.unit_id),
      quantity: number(actual.quantity),
      amount: number(actual.amount),
      total_tax: number(actual.total_tax),
      net_amount: number(actual.net_amount),
      tax_ids: taxes.map((tax) => trim(tax.tax_id)).filter(Boolean),
    });
  }
  verification.details_ok = verification.errors.length === detailsErrorStart;
} catch (error) {
  verification.details_error = String(error?.message || error);
  verification.warnings.push('تعذر إعادة فتح تفاصيل المشتريات بعد الحفظ.');
}
verification.checked = verification.journal_checked || verification.details_checked;
verification.ok = verification.journal_ok && verification.details_ok && verification.errors.length === 0;
verification.status = verification.errors.length
  ? 'mismatch'
  : verification.journal_ok && verification.details_ok
    ? 'verified'
    : verification.journal_ok || verification.details_ok
      ? 'partial'
      : 'unavailable';
const result = {
  purchase_id: trim(finalize.p_id, purchaseId),
  invoice_no: invoiceNo,
  line_responses: lineResponses,
  finalize_response: finalize,
  verification,
  attachment_status: draft.source_attachment?.telegram_file_id ? 'pending' : 'not_available',
  attachment_source: draft.source_attachment || null,
};
const store = $getWorkflowStaticData('global');
store.purchaseDrafts[$json.draft_id].status = 'registered';
store.purchaseDrafts[$json.draft_id].result = result;
store.purchaseDrafts[$json.draft_id].registered_at = new Date().toISOString();
return [{ json: { ...$json, draft, result } }];
`;

const resultCode = String.raw`
const money = (v) => Number(v || 0).toFixed(2);
if ($json.stop) return [{ json: $json }];
const result = $json.result || {};
const draft = $json.draft || {};
const verification = result.verification || {};
const verificationLine = verification.status === 'verified'
  ? 'التحقق: القيد والمنتجات متطابقة مع POS'
  : verification.status === 'mismatch'
    ? 'التحقق: توجد فروقات - ' + (verification.errors || []).join(' | ').slice(0, 350)
    : verification.status === 'partial'
      ? 'التحقق: جزئي - تعذر فحص القيد أو تفاصيل المنتجات'
    : verification.status === 'unavailable'
      ? 'التحقق: تعذر إعادة فحص الشراء بعد الحفظ'
      : 'التحقق: لم يتم';
const attachment = result.attachment_status === 'pending'
  ? 'المرفق: جاري رفعه إلى POS'
  : result.attachment_status === 'not_available' ? 'المرفق: لا يوجد' : '';
return [{
  json: {
    ...$json,
    telegram_text: [
      'تم تسجيل فاتورة المشتريات بنجاح',
      'Purchase ID: ' + (result.purchase_id || ''),
      'Purchase #: ' + (result.invoice_no || ''),
      'المورد: ' + (draft.vendor?.text || ''),
      'الفرع: ' + (draft.branch?.name || ''),
      'الإجمالي: AED ' + money(draft.totals?.grand_total),
      'الرصيد: AED ' + money(draft.totals?.balance),
      verificationLine,
      attachment,
    ].filter(Boolean).join('\n'),
  },
}];
`;

const attachmentJobCode = String.raw`
if ($json.stop || $json.result?.attachment_status !== 'pending') return [];
const source = $json.result?.attachment_source || {};
const fileId = String(source.telegram_file_id || '').trim();
if (!fileId) return [];
const store = $getWorkflowStaticData('global');
if (!store.purchaseAttachmentJobs || typeof store.purchaseAttachmentJobs !== 'object') store.purchaseAttachmentJobs = {};
store.purchaseAttachmentJobs[fileId] = {
  draft_id: $json.draft_id,
  chat_id: $json.chat_id,
  purchase_id: $json.result.purchase_id,
  invoice_no: $json.result.invoice_no,
  telegram_file_id: fileId,
  file_name: source.file_name || 'purchase-attachment',
  mime_type: source.mime_type || 'application/octet-stream',
};
return [{ json: { telegram_file_id: fileId, chat_id: $json.chat_id, purchase_id: $json.result.purchase_id } }];
`;

const prepareAttachmentCode = posShared + String.raw`
const fileId = trim($json.result?.file_id || $json.file_id || $json.telegram_file_id);
const store = $getWorkflowStaticData('global');
const job = store.purchaseAttachmentJobs?.[fileId];
if (!job) throw new Error('Purchase attachment job not found.');
const binaryKey = Object.keys($input.item.binary || {})[0];
if (!binaryKey) throw new Error('Telegram purchase file was not returned as binary data.');
const session = await createPosSession.call(this);
return [{
  json: {
    ...job,
    upload_url: POS_BASE_URL + '/transaction/save_attachments',
    pos_cookie: session.cookie(),
  },
  binary: { data: $input.item.binary[binaryKey] },
}];
`;

const finalizeAttachmentCode = String.raw`
const prepared = $('POS - Prepare Purchase Attachment Session').first().json;
const raw = Object.prototype.hasOwnProperty.call($json, 'body') ? $json.body : $json;
let response = raw;
if (typeof raw === 'string') {
  try { response = JSON.parse(raw); }
  catch { response = { message: raw, status_code: $json.statusCode || 0 }; }
}
const ok = Number(response?.response_code) === 200 || Number(response?.['response code']) === 200 || Number(response?.status) === 1 || /success/i.test(String(response?.message || ''));
const store = $getWorkflowStaticData('global');
if (ok) {
  if (store.purchaseDrafts?.[prepared.draft_id]?.result) {
    store.purchaseDrafts[prepared.draft_id].result.attachment_status = 'uploaded';
    store.purchaseDrafts[prepared.draft_id].result.attachment_response = response;
  }
  delete store.purchaseAttachmentJobs[prepared.telegram_file_id];
  return [{ json: { ...prepared, telegram_text: ['تم رفع مرفق المشتريات بنجاح', 'Purchase ID: ' + prepared.purchase_id, 'Purchase #: ' + prepared.invoice_no].join('\n') } }];
}
let error;
try { error = JSON.stringify(response); } catch { error = String(response); }
return [{ json: { ...prepared, telegram_text: ['تم تسجيل المشتريات ولكن تعذر رفع المرفق', 'Purchase ID: ' + prepared.purchase_id, 'السبب: ' + error.slice(0, 300)].join('\n') } }];
`;

const branchCode = String.raw`
if ($json.action !== 'branch') return [];
const store = $getWorkflowStaticData('global');
const draft = store.purchaseDrafts?.[$json.draft_id];
if (!draft) return [{ json: { ...$json, telegram_text: 'لم أجد مسودة المشتريات: ' + $json.draft_id } }];
draft.branch = { id: String($json.branch_id), name: String($json.branch_name) };
draft.status = 'pending_rematch';
return [{ json: { ...$json, extracted: draft.extracted, source_attachment: draft.source_attachment, branch_id: draft.branch.id, branch_name: draft.branch.name } }];
`;

const editRequestCode = String.raw`
if ($json.action !== 'edit_request') return [];
const store = $getWorkflowStaticData('global');
const draft = store.purchaseDrafts?.[$json.draft_id];
const issues = Array.isArray(draft?.errors) && draft.errors.length
  ? ['', 'الملاحظات الحالية:', ...draft.errors.map((value) => '- ' + value)]
  : [];
return [{
  json: {
    ...$json,
    telegram_text: [
      'أرسل التعديل الآن في رسالة عادية.',
      'لا تحتاج لكتابة رقم Draft أو كلمة تعديل.',
      '',
      'مثال: غيّر المنتج إلى items والكمية 2، والمبلغ قبل الضريبة 200 والضريبة 10.',
      'يمكنك أيضاً القول: احذف المنتج الثاني، أضف منتجاً، غيّر المورد، أو غيّر تاريخ الفاتورة.',
      ...issues,
      '',
      'جلسة التعديل متاحة لمدة 30 دقيقة.',
    ].join('\n'),
  },
}];
`;

const editPrepareCode = String.raw`
if ($json.action !== 'edit') return [];
const store = $getWorkflowStaticData('global');
const draft = store.purchaseDrafts?.[$json.draft_id];
if (!draft) return [{ json: { ...$json, stop: true, telegram_text: 'لم أجد مسودة المشتريات: ' + $json.draft_id } }];
const itemSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    description: { type: 'string' }, barcode: { type: 'string' }, quantity: { type: 'number' }, unit_text: { type: 'string' },
    unit_price: { type: 'number' }, amount: { type: 'number' }, vat_rate: { type: 'number' }, tax_amount: { type: 'number' },
    net_amount: { type: 'number' }, price_includes_tax: { type: 'boolean' },
  },
  required: ['description','barcode','quantity','unit_text','unit_price','amount','vat_rate','tax_amount','net_amount','price_includes_tax'],
};
const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    supplier_name: { type: 'string' }, supplier_invoice_no: { type: 'string' }, supplier_invoice_date: { type: 'string' },
    purchase_date: { type: 'string' }, currency: { type: 'string' }, tax_billing: { type: 'boolean' },
    items: { type: 'array', minItems: 1, items: itemSchema }, discount: { type: 'number' }, adjustment: { type: 'number' },
    round_off: { type: 'number' }, invoice_total: { type: 'number' }, notes: { type: 'string' }, confidence: { type: 'number' },
    warnings: { type: 'array', items: { type: 'string' } },
  },
  required: ['supplier_name','supplier_invoice_no','supplier_invoice_date','purchase_date','currency','tax_billing','items','discount','adjustment','round_off','invoice_total','notes','confidence','warnings'],
};
const prompt = [
  'You are an Arabic/English purchase invoice editing assistant for a UAE laundry POS.',
  'Apply only the manager requested changes to the current purchase invoice.',
  'Return the complete updated JSON, never a patch and never explanatory prose.',
  'Preserve every existing value that the manager did not ask to change.',
  'Understand natural Arabic, Gulf Arabic, English, spelling mistakes, and short instructions.',
  'Examples: "خلي الكمية 2", "غير المنتج إلى items", "احذف الصنف الثاني", "أضف صنف chemicals بسعر 100 وضريبة 5%", "المبلغ شامل الضريبة".',
  'A value after labels المنتج or الصنف is the product description; never use the label itself as a product name.',
  'If one product exists and the manager gives subtotal, VAT, and total, apply those values to that product unless another product is explicitly named.',
  'When quantity or unit price changes, recalculate amount, tax_amount, and net_amount consistently.',
  'When subtotal or tax changes, recalculate line and invoice totals consistently.',
  'VAT in UAE is normally 5%, but preserve a different explicit rate.',
  'Never invent a barcode. Keep an existing barcode only when the same product remains; clear it when the product name changes.',
  'If the instruction is ambiguous, make the smallest safe change and add a clear Arabic warning.',
  'Current JSON:', JSON.stringify(draft.extracted),
  'Current branch:', JSON.stringify(draft.branch),
  'Current validation issues:', JSON.stringify(draft.errors || []),
  'Instruction:', $json.edit_text,
].join('\n');
return [{ json: { ...$json, draft, openaiBody: { model: String($vars.OPENAI_MODEL || 'gpt-4.1-mini'), input: [{ role: 'user', content: [{ type: 'input_text', text: prompt }] }], text: { format: { type: 'json_schema', name: 'purchase_invoice_edit', strict: true, schema } } } } }];
`;

const applyEditCode = String.raw`
if ($json.stop) return [];
const trim = (v) => String(v ?? '').trim();
const prepared = $('Edit - Prepare Purchase Change').first().json;
function outputText(response) {
  if (typeof response?.output_text === 'string') return response.output_text;
  const out = [];
  for (const row of response?.output || []) for (const part of row?.content || []) if (typeof part?.text === 'string') out.push(part.text);
  return out.join('\n');
}
let raw = trim(outputText($json));
const fence = String.fromCharCode(96).repeat(3);
if (raw.toLowerCase().startsWith(fence + 'json')) raw = raw.slice(7);
else if (raw.startsWith(fence)) raw = raw.slice(3);
if (raw.endsWith(fence)) raw = raw.slice(0, -3);
const extracted = JSON.parse(raw.trim());
const instruction = trim(prepared.edit_text);
let branchId = prepared.draft.branch.id;
let branchName = prepared.draft.branch.name;
if (/(al\s*falah|الفلاح)(?:\s*\/\s*1|\s+1)?/i.test(instruction)) {
  branchId = '1';
  branchName = 'AL FALAH';
} else if (/(mbz|محمد\s*بن\s*زايد)(?:\s*\/\s*2|\s+2)?/i.test(instruction)) {
  branchId = '2';
  branchName = 'MBZ';
} else if (/(musaffah|مصفح)(?:\s*\/\s*3|\s+3)?/i.test(instruction)) {
  branchId = '3';
  branchName = 'Musaffah';
}
const vendorMatch = instruction.match(/(?:المورد|vendor|supplier)\s*[:：]?\s*([^/\n]+?)\s*\/\s*(\d+)/i);
return [{
  json: {
    ...prepared,
    extracted,
    source_attachment: prepared.draft.source_attachment,
    branch_id: branchId,
    branch_name: branchName,
    supplied_vendor_id: vendorMatch ? vendorMatch[2] : '',
  },
}];
`;

const cancelCode = String.raw`
if ($json.action !== 'cancel') return [];
const store = $getWorkflowStaticData('global');
if (store.purchaseDrafts?.[$json.draft_id]) {
  store.purchaseDrafts[$json.draft_id].status = 'cancelled';
  store.purchaseDrafts[$json.draft_id].cancelled_at = new Date().toISOString();
}
return [{ json: { ...$json, telegram_text: 'تم إلغاء مسودة المشتريات.\nDraft: ' + $json.draft_id } }];
`;

function codeNode(id, name, position, jsCode) {
  return { id, name, type: 'n8n-nodes-base.code', typeVersion: 2, position, parameters: { jsCode: jsCode.trim() } };
}

function telegramTrigger() {
  return {
    id: 'telegram-trigger-purchase',
    name: 'Telegram Trigger - Purchase',
    type: 'n8n-nodes-base.telegramTrigger',
    typeVersion: 1.2,
    position: [-1040, 0],
    parameters: {
      updates: ['message', 'callback_query'],
      additionalFields: {
        download: true,
        imageSize: 'large',
        chatIds: '={{$vars.TELEGRAM_ALLOWED_CHAT_ID}}',
      },
    },
    credentials: { telegramApi: { id: 'REPLACE_TELEGRAM_CREDENTIAL_ID', name: 'Telegram account' } },
  };
}

function telegramSend(id, name, position) {
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
      additionalFields: { disable_web_page_preview: true, appendAttribution: false },
    },
    credentials: { telegramApi: { id: 'REPLACE_TELEGRAM_CREDENTIAL_ID', name: 'Telegram account' } },
  };
}

function telegramApproval(id, name, position) {
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
          { row: { buttons: [
            { text: 'AL FALAH / 1', additionalFields: { callback_data: "={{'purchase_branch:' + $json.draft_id + ':1:AL FALAH'}}" } },
            { text: 'MBZ / 2', additionalFields: { callback_data: "={{'purchase_branch:' + $json.draft_id + ':2:MBZ'}}" } },
            { text: 'Musaffah / 3', additionalFields: { callback_data: "={{'purchase_branch:' + $json.draft_id + ':3:Musaffah'}}" } },
          ] } },
          { row: { buttons: [
            { text: 'موافق', additionalFields: { callback_data: "={{'purchase_approve:' + $json.draft_id}}" } },
            { text: 'تعديل', additionalFields: { callback_data: "={{'purchase_edit_request:' + $json.draft_id}}" } },
            { text: 'إلغاء', additionalFields: { callback_data: "={{'purchase_cancel:' + $json.draft_id}}" } },
          ] } },
        ],
      },
      additionalFields: { disable_web_page_preview: true, appendAttribution: false },
    },
    credentials: { telegramApi: { id: 'REPLACE_TELEGRAM_CREDENTIAL_ID', name: 'Telegram account' } },
  };
}

function telegramGetFile(id, name, position) {
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
    credentials: { telegramApi: { id: 'REPLACE_TELEGRAM_CREDENTIAL_ID', name: 'Telegram account' } },
  };
}

function openAiNode(id, name, position) {
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
    credentials: { openAiApi: { id: 'REPLACE_OPENAI_CREDENTIAL_ID', name: 'OpenAI account' } },
  };
}

function attachmentHttpNode() {
  return {
    id: 'purchase-attachment-http',
    name: 'POS HTTP - Upload Purchase Attachment',
    type: 'n8n-nodes-base.httpRequest',
    typeVersion: 4.2,
    position: [1240, 220],
    parameters: {
      method: 'POST',
      url: '={{$json.upload_url}}',
      sendHeaders: true,
      headerParameters: { parameters: [
        { name: 'Cookie', value: '={{$json.pos_cookie}}' },
        { name: 'X-Requested-With', value: 'XMLHttpRequest' },
        { name: 'Origin', value: 'https://beta.aipsoft.com' },
        { name: 'Referer', value: 'https://beta.aipsoft.com/inout/transaction/purchase' },
        { name: 'Accept', value: 'application/json, text/javascript, */*; q=0.01' },
      ] },
      sendBody: true,
      contentType: 'multipart-form-data',
      bodyParameters: { parameters: [
        { parameterType: 'formData', name: 'module_id', value: '={{$json.purchase_id}}' },
        { parameterType: 'formData', name: 'attach_module', value: 'purchase' },
        { parameterType: 'formBinaryData', name: 'attachments[]', inputDataFieldName: 'data' },
      ] },
      options: {
        response: { response: { fullResponse: true, neverError: true, responseFormat: 'text' } },
        timeout: 30000,
      },
    },
    continueOnFail: true,
  };
}

const workflow = {
  name: 'Telegram AI Purchase Approval - Credentials Direct POS',
  active: false,
  nodes: [
    {
      id: 'purchase-setup-note',
      name: 'Purchase Setup Notes',
      type: 'n8n-nodes-base.stickyNote',
      typeVersion: 1,
      position: [-1080, -600],
      parameters: {
        content: [
          '## Telegram AI Purchase Workflow',
          'Version 1 registers CREDIT purchases (Paid=0, Balance=Grand Total).',
          'It supports text, image, PDF, multiple products, VAT, branch selection, edit, approval, and attachment upload.',
          '',
          'Telegram allows one webhook per Bot. Use a separate Purchase Bot, or disable the Expense workflow while testing.',
          '',
          'Select Credentials in every Telegram node and OpenAI node.',
          '',
          'Required n8n Variables:',
          'TELEGRAM_ALLOWED_CHAT_ID',
          'POS_USERNAME',
          'POS_PASSWORD',
          '',
          'Optional:',
          'OPENAI_MODEL, AIPSOFT_API_BASE_URL, AIPSOFT_CLIENT_IDENTIFIER, POS_LOGIN_ENDPOINT, POS_PURCHASE_REFERER, POS_ORIGIN',
          '',
          'Confirmed POS constants:',
          'Purchase Account=11, AED Currency=2, VAT 5%=1',
          'Branches: AL FALAH=1, MBZ=2, Musaffah=3',
        ].join('\n'),
      },
    },
    telegramTrigger(),
    codeNode('purchase-normalize', 'Telegram - Normalize Purchase Input', [-800, 0], normalizeCode),
    codeNode('purchase-intake', 'Intake - Prepare Purchase Prompt', [-540, -300], intakeCode),
    telegramSend('purchase-intake-notice', 'Telegram - Send Purchase Analysis Notice', [-280, -470]),
    codeNode('purchase-gate', 'Intake - Continue Purchase Analysis', [-280, -300], gateCode),
    openAiNode('purchase-openai-extract', 'OpenAI - Extract Purchase Invoice', [-20, -300]),
    codeNode('purchase-openai-parse', 'OpenAI - Parse Purchase JSON', [240, -300], parseOpenAiCode),
    codeNode('purchase-pos-match', 'POS - Match Vendor And Products', [500, -300], matchCode),
    codeNode('purchase-save-draft', 'Draft - Calculate And Save Purchase', [760, -300], saveDraftCode),
    telegramApproval('purchase-send-review', 'Telegram - Send Purchase Review', [1020, -300]),

    codeNode('purchase-approve-load', 'Approve - Load Purchase Draft', [-540, 40], loadDraftCode),
    codeNode('purchase-register', 'POS - Create And Finalize Purchase', [-280, 40], registerCode),
    codeNode('purchase-result', 'Telegram - Prepare Purchase Result', [-20, 40], resultCode),
    telegramSend('purchase-send-result', 'Telegram - Send Purchase Result', [240, 40]),
    codeNode('purchase-attachment-job', 'Attachment - Prepare Purchase Upload Job', [-20, 220], attachmentJobCode),
    telegramGetFile('purchase-download-file', 'Telegram - Download Registered Purchase File', [240, 220]),
    codeNode('purchase-attachment-session', 'POS - Prepare Purchase Attachment Session', [500, 220], prepareAttachmentCode),
    attachmentHttpNode(),
    codeNode('purchase-attachment-finalize', 'Purchase - Finalize Attachment Result', [1500, 220], finalizeAttachmentCode),
    telegramSend('purchase-attachment-result', 'Telegram - Send Purchase Attachment Result', [1760, 220]),

    codeNode('purchase-branch', 'Branch - Update Purchase Draft', [-540, 460], branchCode),
    codeNode('purchase-branch-rematch', 'POS - Rematch Purchase After Branch', [-280, 460], matchCode),
    codeNode('purchase-branch-save', 'Draft - Save Purchase After Branch', [-20, 460], saveDraftCode),
    telegramApproval('purchase-branch-review', 'Telegram - Send Purchase Branch Review', [240, 460]),

    codeNode('purchase-edit-request', 'Edit Button - Ask Purchase Details', [-540, 700], editRequestCode),
    telegramSend('purchase-edit-instructions', 'Telegram - Send Purchase Edit Instructions', [-280, 700]),
    codeNode('purchase-edit-prepare', 'Edit - Prepare Purchase Change', [-540, 920], editPrepareCode),
    openAiNode('purchase-edit-openai', 'OpenAI - Parse Purchase Edit', [-280, 920]),
    codeNode('purchase-edit-apply', 'Edit - Apply Purchase Change', [-20, 920], applyEditCode),
    codeNode('purchase-edit-rematch', 'POS - Rematch Edited Purchase', [240, 920], matchCode),
    codeNode('purchase-edit-save', 'Draft - Save Edited Purchase', [500, 920], saveDraftCode),
    telegramApproval('purchase-edit-review', 'Telegram - Send Edited Purchase Review', [760, 920]),

    codeNode('purchase-cancel', 'Cancel - Mark Purchase Draft', [-540, 1160], cancelCode),
    telegramSend('purchase-cancel-send', 'Telegram - Send Purchase Cancelled', [-280, 1160]),
  ],
  connections: {
    'Telegram Trigger - Purchase': { main: [[{ node: 'Telegram - Normalize Purchase Input', type: 'main', index: 0 }]] },
    'Telegram - Normalize Purchase Input': { main: [[
      { node: 'Intake - Prepare Purchase Prompt', type: 'main', index: 0 },
      { node: 'Approve - Load Purchase Draft', type: 'main', index: 0 },
      { node: 'Branch - Update Purchase Draft', type: 'main', index: 0 },
      { node: 'Edit Button - Ask Purchase Details', type: 'main', index: 0 },
      { node: 'Edit - Prepare Purchase Change', type: 'main', index: 0 },
      { node: 'Cancel - Mark Purchase Draft', type: 'main', index: 0 },
    ]] },
    'Intake - Prepare Purchase Prompt': { main: [[
      { node: 'Telegram - Send Purchase Analysis Notice', type: 'main', index: 0 },
      { node: 'Intake - Continue Purchase Analysis', type: 'main', index: 0 },
    ]] },
    'Intake - Continue Purchase Analysis': { main: [[{ node: 'OpenAI - Extract Purchase Invoice', type: 'main', index: 0 }]] },
    'OpenAI - Extract Purchase Invoice': { main: [[{ node: 'OpenAI - Parse Purchase JSON', type: 'main', index: 0 }]] },
    'OpenAI - Parse Purchase JSON': { main: [[{ node: 'POS - Match Vendor And Products', type: 'main', index: 0 }]] },
    'POS - Match Vendor And Products': { main: [[{ node: 'Draft - Calculate And Save Purchase', type: 'main', index: 0 }]] },
    'Draft - Calculate And Save Purchase': { main: [[{ node: 'Telegram - Send Purchase Review', type: 'main', index: 0 }]] },

    'Approve - Load Purchase Draft': { main: [[{ node: 'POS - Create And Finalize Purchase', type: 'main', index: 0 }]] },
    'POS - Create And Finalize Purchase': { main: [[
      { node: 'Telegram - Prepare Purchase Result', type: 'main', index: 0 },
      { node: 'Attachment - Prepare Purchase Upload Job', type: 'main', index: 0 },
    ]] },
    'Telegram - Prepare Purchase Result': { main: [[{ node: 'Telegram - Send Purchase Result', type: 'main', index: 0 }]] },
    'Attachment - Prepare Purchase Upload Job': { main: [[{ node: 'Telegram - Download Registered Purchase File', type: 'main', index: 0 }]] },
    'Telegram - Download Registered Purchase File': { main: [[{ node: 'POS - Prepare Purchase Attachment Session', type: 'main', index: 0 }]] },
    'POS - Prepare Purchase Attachment Session': { main: [[{ node: 'POS HTTP - Upload Purchase Attachment', type: 'main', index: 0 }]] },
    'POS HTTP - Upload Purchase Attachment': { main: [[{ node: 'Purchase - Finalize Attachment Result', type: 'main', index: 0 }]] },
    'Purchase - Finalize Attachment Result': { main: [[{ node: 'Telegram - Send Purchase Attachment Result', type: 'main', index: 0 }]] },

    'Branch - Update Purchase Draft': { main: [[{ node: 'POS - Rematch Purchase After Branch', type: 'main', index: 0 }]] },
    'POS - Rematch Purchase After Branch': { main: [[{ node: 'Draft - Save Purchase After Branch', type: 'main', index: 0 }]] },
    'Draft - Save Purchase After Branch': { main: [[{ node: 'Telegram - Send Purchase Branch Review', type: 'main', index: 0 }]] },

    'Edit Button - Ask Purchase Details': { main: [[{ node: 'Telegram - Send Purchase Edit Instructions', type: 'main', index: 0 }]] },
    'Edit - Prepare Purchase Change': { main: [[{ node: 'OpenAI - Parse Purchase Edit', type: 'main', index: 0 }]] },
    'OpenAI - Parse Purchase Edit': { main: [[{ node: 'Edit - Apply Purchase Change', type: 'main', index: 0 }]] },
    'Edit - Apply Purchase Change': { main: [[{ node: 'POS - Rematch Edited Purchase', type: 'main', index: 0 }]] },
    'POS - Rematch Edited Purchase': { main: [[{ node: 'Draft - Save Edited Purchase', type: 'main', index: 0 }]] },
    'Draft - Save Edited Purchase': { main: [[{ node: 'Telegram - Send Edited Purchase Review', type: 'main', index: 0 }]] },

    'Cancel - Mark Purchase Draft': { main: [[{ node: 'Telegram - Send Purchase Cancelled', type: 'main', index: 0 }]] },
  },
  pinData: {},
  settings: { timezone: 'Asia/Dubai', executionOrder: 'v1' },
  staticData: null,
  tags: [{ name: 'laundry' }, { name: 'telegram' }, { name: 'ai' }, { name: 'purchase' }, { name: 'direct-pos' }],
  triggerCount: 1,
  updatedAt: '2026-06-13T00:00:00.000Z',
  versionId: 'telegram-ai-purchase-direct-pos-v1',
};

const output = path.resolve(__dirname, '..', 'n8n-telegram-ai-purchase-approval-direct-pos.json');
fs.writeFileSync(output, JSON.stringify(workflow, null, 2) + '\n', 'utf8');
console.log(output);
