const fs = require('fs');
const path = require('path');

const fetchCode = String.raw`
const trim = (value, fallback = '') => String(value ?? fallback).trim();
const vars = (typeof $vars === 'object' && $vars) ? $vars : {};
const POS_USERNAME = trim(vars.POS_USERNAME);
const POS_PASSWORD = trim(vars.POS_PASSWORD);
const CLIENT_IDENTIFIER = trim(vars.AIPSOFT_CLIENT_IDENTIFIER, 'inout') || 'inout';
const POS_BASE_URL = trim(vars.AIPSOFT_API_BASE_URL, 'https://beta.aipsoft.com/inout').replace(/\/$/, '');
const POS_LOGIN_ENDPOINT = trim(vars.POS_LOGIN_ENDPOINT, POS_BASE_URL + '/login/check');
const POS_REFERER = trim(vars.POS_SALES_REFERER, POS_BASE_URL + '/transaction/sales_order');
const POS_ORIGIN = trim(vars.POS_ORIGIN, 'https://beta.aipsoft.com');
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
const request = async (options) => {
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
const headers = (cookie, form = true) => {
  const result = {
    Accept: 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8,ar;q=0.7',
    Origin: POS_ORIGIN,
    Referer: POS_REFERER,
    'X-Requested-With': 'XMLHttpRequest',
    Cookie: cookie,
  };
  if (form) result['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
  return result;
};
let cookie = 'language=english; direction=ltr; dont_show_today=true';
const preflight = await request.call(this, { method: 'GET', url: POS_REFERER, headers: headers(cookie, false) });
cookie = mergeCookies(cookie, setCookies(preflight.headers));
const short = POS_USERNAME.includes('@') ? POS_USERNAME.split('@')[0].trim() : POS_USERNAME;
const usernames = Array.from(new Set([
  POS_USERNAME,
  POS_USERNAME.toLowerCase(),
  short,
  short.toLowerCase(),
  short + '@' + CLIENT_IDENTIFIER,
].filter(Boolean)));
let loggedIn = false;
let lastLogin = '';
for (const username of usernames) {
  const login = await request.call(this, {
    method: 'POST',
    url: POS_LOGIN_ENDPOINT,
    headers: headers(cookie),
    body: encode({
      username,
      password: POS_PASSWORD,
      client_identifier: CLIENT_IDENTIFIER,
      auto_login: 'null',
      connection_path: 'null',
    }),
  });
  cookie = mergeCookies(cookie, setCookies(login.headers));
  lastLogin = login.body;
  if (/login_success|password_ok/i.test(lastLogin) && /ci_session_/i.test(cookie) && /\binout=/i.test(cookie)) {
    loggedIn = true;
    break;
  }
}
if (!loggedIn) throw new Error('POS login failed: ' + String(lastLogin).slice(0, 240));

const form = {
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
  'order[0][column]': '0',
  'order[0][dir]': 'DESC',
  start: '0',
  length: trim(vars.POS_SALES_SYNC_PAGE_SIZE, '10'),
  'search[value]': '',
  'search[regex]': 'false',
  branch_sort: trim(vars.POS_SALES_BRANCH_FILTER),
  mode: 'SALES_ORDER',
};
const sales = await request.call(this, {
  method: 'POST',
  url: POS_BASE_URL + '/transaction/loadLatestTransEntries',
  headers: headers(cookie),
  body: encode(form),
});
if (/login\/check|name=["']password/i.test(sales.body)) throw new Error('Sales endpoint returned POS login page.');
let response;
try { response = JSON.parse(sales.body); }
catch { throw new Error('loadLatestTransEntries returned invalid JSON: ' + sales.body.slice(0, 300)); }
return [{
  json: {
    fetched_at: new Date().toISOString(),
    response,
    pos_session: {
      base_url: POS_BASE_URL,
      origin: POS_ORIGIN,
      referer: POS_REFERER,
      cookie,
    },
  },
}];
`;

const parseCode = String.raw`
const trim = (value) => String(value ?? '').trim();
const decode = (value) => trim(value)
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&quot;/gi, '"')
  .replace(/&#039;/gi, "'")
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>');
const text = (html) => decode(String(html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' '));
const dateIso = (value) => {
  const match = trim(value).match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
  if (!match) return trim(value);
  const months = { jan:'01', feb:'02', mar:'03', apr:'04', may:'05', jun:'06', jul:'07', aug:'08', sep:'09', oct:'10', nov:'11', dec:'12' };
  const month = months[match[2].toLowerCase()];
  return month ? match[3] + '-' + month + '-' + match[1].padStart(2, '0') : trim(value);
};
const rows = [];
for (const row of $json.response?.data || []) {
  const html = String(row?.[0] || '');
  const id = trim(html.match(/data-id=["']([^"']+)["']/i)?.[1]);
  const account = text(html.match(/<h3[^>]*>([\s\S]*?)<\/h[35]>/i)?.[1]);
  const invoice = text(html.match(/<span[^>]*>([\s\S]*?)<\/span>/i)?.[1]);
  const date = text(html.match(/<p[^>]*class=["'][^"']*left_table_date[^"']*["'][^>]*>([\s\S]*?)<\/p>/i)?.[1]);
  if (id && invoice) rows.push({
    transaction_id: id,
    invoice_no: invoice,
    transaction_date: dateIso(date),
    account_name: account,
  });
}
const store = $getWorkflowStaticData('global');
if (!store.salesSync || typeof store.salesSync !== 'object') store.salesSync = {};
const lastId = trim(store.salesSync.last_transaction_id);
const pendingRows = [];
for (const row of rows) {
  if (lastId && row.transaction_id === lastId) break;
  pendingRows.push(row);
}
return [{
  json: {
    fetched_at: $json.fetched_at,
    pos_session: $json.pos_session,
    records_filtered: Number($json.response?.recordsFiltered || 0),
    fetched_count: rows.length,
    pending_count: pendingRows.length,
    previous_watermark: lastId,
    candidate_watermark: rows[0]?.transaction_id || lastId,
    candidate_invoice_no: rows[0]?.invoice_no || '',
    transactions: rows,
    pending_transactions: pendingRows,
  },
}];
`;

const fetchDetailsCode = String.raw`
const trim = (value) => String(value ?? '').trim();
const session = $json.pos_session || {};
if (!session.base_url || !session.cookie) throw new Error('POS session is missing before fetching sale details.');
const encode = (data) => Object.entries(data || {})
  .map(([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(String(value ?? '')))
  .join('&');
const headers = {
  Accept: 'application/json, text/javascript, */*; q=0.01',
  'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8,ar;q=0.7',
  Origin: session.origin || 'https://beta.aipsoft.com',
  Referer: session.referer || (session.base_url + '/transaction/sales_order'),
  'X-Requested-With': 'XMLHttpRequest',
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  Cookie: session.cookie,
};
const details = [];
for (const transaction of $json.pending_transactions || []) {
  const response = await this.helpers.httpRequest({
    method: 'POST',
    url: session.base_url + '/transaction/fetch_purchase_details',
    headers,
    body: encode({
      purchase_id: transaction.transaction_id,
      purchase_id_counter: '',
      counter_mode: '',
      hold: '0',
      type: '0',
      mode: 'SALES_ORDER',
    }),
    json: false,
    returnFullResponse: true,
    resolveWithFullResponse: true,
    simple: false,
    timeout: 120000,
  });
  const body = response && typeof response === 'object' && Object.prototype.hasOwnProperty.call(response, 'body')
    ? response.body
    : response;
  let parsed;
  try { parsed = typeof body === 'string' ? JSON.parse(body) : body; }
  catch { throw new Error('Sale ' + transaction.invoice_no + ' returned invalid JSON: ' + String(body).slice(0, 250)); }
  const invoice = Array.isArray(parsed?.purchase_invoice) ? parsed.purchase_invoice[0] : null;
  if (Number(parsed?.response_code) !== 200 || !invoice || trim(invoice.id) !== transaction.transaction_id) {
    throw new Error('Could not fetch complete details for sale ' + transaction.invoice_no + ': ' + JSON.stringify(parsed).slice(0, 500));
  }
  details.push({ transaction, response: parsed });
}
return [{ json: { ...$json, sale_detail_responses: details } }];
`;

const fetchJournalCode = String.raw`
const session = $json.pos_session || {};
if (!session.base_url || !session.cookie) throw new Error('POS session is missing before fetching sale journal entries.');
const encode = (data) => Object.entries(data || {})
  .map(([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(String(value ?? '')))
  .join('&');
const headers = {
  Accept: 'application/json, text/javascript, */*; q=0.01',
  'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8,ar;q=0.7',
  Origin: session.origin || 'https://beta.aipsoft.com',
  Referer: session.base_url + '/transaction/sales_invoice',
  'X-Requested-With': 'XMLHttpRequest',
  'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
  Cookie: session.cookie,
};
const enriched = [];
for (const entry of $json.sale_detail_responses || []) {
  const salesId = String(entry.transaction?.transaction_id || entry.response?.purchase_id || '').trim();
  let journalResponse = null;
  let journalError = '';
  try {
    const response = await this.helpers.httpRequest({
      method: 'POST',
      url: session.base_url + '/transaction/journalSalesEntryData',
      headers,
      body: encode({ sales_id: salesId }),
      json: false,
      returnFullResponse: true,
      resolveWithFullResponse: true,
      simple: false,
      timeout: 120000,
    });
    const body = response && typeof response === 'object' && Object.prototype.hasOwnProperty.call(response, 'body')
      ? response.body
      : response;
    journalResponse = typeof body === 'string' ? JSON.parse(body) : body;
    if (!Array.isArray(journalResponse?.data)) {
      journalError = 'journalSalesEntryData did not return a data array.';
      journalResponse = null;
    }
  } catch (error) {
    journalError = String(error?.message || error);
  }
  enriched.push({ ...entry, journal_response: journalResponse, journal_error: journalError });
}
return [{ json: { ...$json, sale_detail_responses: enriched } }];
`;

const normalizeDetailsCode = String.raw`
const trim = (value, fallback = '') => String(value ?? fallback).trim();
const vars = (typeof $vars === 'object' && $vars) ? $vars : {};
const num = (value, fallback = 0) => {
  const parsed = Number(String(value ?? '').replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : fallback;
};
const round = (value) => Math.round((num(value) + Number.EPSILON) * 100) / 100;
const residualTolerance = Math.max(num(vars.POS_PAYMENT_RESIDUAL_TOLERANCE, 0.5), 0);
const paymentAmount = (payment) => {
  for (const key of ['amount','paid_amount','payment_amount','receipt_amount','tender_amount','received_amount']) {
    if (payment?.[key] !== undefined && payment?.[key] !== null && payment?.[key] !== '') return num(payment[key]);
  }
  return 0;
};
const paymentName = (payment) => trim(
  payment?.payment_method_name
  || payment?.payment_method
  || payment?.payment_type
  || payment?.account_name
  || payment?.card_name
  || payment?.type,
  'Unknown',
);
const classifyAccount = (account, narration) => {
  const value = (trim(account) + ' ' + trim(narration)).toLowerCase();
  if (/cash account|pay cash|paid with cash/.test(value)) return 'cash';
  if (/credit card|debit card|visa|mastercard|master card|card account/.test(value)) return 'card';
  if (/bank|adib|transfer|cheque|check/.test(value)) return 'bank';
  if (/wallet|online|tabby|tamara/.test(value)) return 'other';
  return '';
};
const normalized = [];
for (const entry of $json.sale_detail_responses || []) {
  const raw = entry.response?.purchase_invoice?.[0] || {};
  const rawItems = Array.isArray(raw.purchase_details) ? raw.purchase_details : [];
  const items = rawItems.map((item) => {
    const quantity = num(item.qty);
    const gross = num(item.sub_total, quantity * num(item.unit_price));
    const tax = num(item.tax_amount);
    return {
      detail_id: trim(item.id),
      product_id: trim(item.product_id),
      product_name: trim(item.product_name1_long || item.product_name),
      barcode: trim(item.barcode),
      unit_id: trim(item.unit_id),
      unit_name: trim(item.unitname),
      quantity,
      unit_price: round(item.unit_price),
      gross_amount: round(gross),
      discount_amount: round(item.discount || item.p_discount),
      tax_amount: round(tax),
      net_amount: round(gross + tax),
      status: trim(item.status),
      delivery_status: trim(item.delivery_status),
    };
  });
  const itemQuantity = round(items.reduce((sum, item) => sum + item.quantity, 0));
  const itemGross = round(items.reduce((sum, item) => sum + item.gross_amount, 0));
  const itemTax = round(items.reduce((sum, item) => sum + item.tax_amount, 0));
  const headerGross = round(raw.total_amount);
  const gross = headerGross || itemGross;
  const discount = round(raw.discount);
  const adjustment = round(raw.adjustment);
  const roundOff = round(raw.round_off);
  const headerTax = round(raw.tax_amount);
  const tax = headerTax || itemTax;
  const invoiceTotal = round(gross - discount + tax + adjustment + roundOff);
  const payments = (Array.isArray(raw.payment_details) ? raw.payment_details : []).map((payment, index) => ({
    payment_id: trim(payment.id, String(index + 1)),
    method_id: trim(payment.payment_method_id || payment.method_id || payment.account_id),
    method_name: paymentName(payment),
    amount: round(paymentAmount(payment)),
    reference_no: trim(payment.reference_no || payment.transaction_no || payment.card_no),
    raw: payment,
  }));
  const paymentTotal = round(payments.reduce((sum, payment) => sum + payment.amount, 0));
  const received = round(raw.received_amount);
  const tenderCash = round(raw.tender_cash);
  const paidFromBalance = Math.max(round(invoiceTotal - num(raw.balance)), 0);
  const paymentCollection = { cash: 0, card: 0, bank: 0, other: 0, unknown: 0 };
  for (const payment of payments) {
    const method = payment.method_name.toLowerCase();
    if (/cash/.test(method)) paymentCollection.cash += payment.amount;
    else if (/card|visa|master|credit card|debit card/.test(method)) paymentCollection.card += payment.amount;
    else if (/bank|transfer|adib|cheque|check/.test(method)) paymentCollection.bank += payment.amount;
    else paymentCollection.other += payment.amount;
  }
  if (!payments.length && tenderCash > 0) paymentCollection.cash = tenderCash;

  const journalEntries = (Array.isArray(entry.journal_response?.data) ? entry.journal_response.data : []).map((row) => ({
    branch_id: trim(row.branch_id),
    branch_name: trim(row.branch_code),
    account_name: trim(row.acc_name1),
    narration: trim(row.narration),
    debit: round(row.db_amount),
    credit: round(row.cr_amount),
  }));
  const journalDebit = round(journalEntries.reduce((sum, row) => sum + row.debit, 0));
  const journalCredit = round(journalEntries.reduce((sum, row) => sum + row.credit, 0));
  const journalSales = round(journalEntries
    .filter((row) => /sales account/i.test(row.account_name) && row.credit > 0)
    .reduce((sum, row) => sum + row.credit, 0));
  const journalVat = round(journalEntries
    .filter((row) => /vat on sales/i.test(row.account_name) && row.credit > 0)
    .reduce((sum, row) => sum + row.credit, 0));
  const journalCollection = { cash: 0, card: 0, bank: 0, other: 0, unknown: 0 };
  for (const row of journalEntries) {
    if (row.debit <= 0) continue;
    const type = classifyAccount(row.account_name, row.narration);
    if (type) journalCollection[type] += row.debit;
  }
  const journalCollected = round(
    journalCollection.cash
    + journalCollection.card
    + journalCollection.bank
    + journalCollection.other,
  );
  const paymentCollected = round(
    paymentCollection.cash
    + paymentCollection.card
    + paymentCollection.bank
    + paymentCollection.other,
  );
  const collection = journalCollected > 0 ? journalCollection : paymentCollection;
  const paidAmount = round(Math.max(paymentTotal, received, tenderCash, paidFromBalance, journalCollected));
  const balance = round(num(raw.balance, Math.max(invoiceTotal - paidAmount, 0)));
  const categorized = round(collection.cash + collection.card + collection.bank + collection.other);
  collection.unknown = Math.max(round(paidAmount - categorized), 0);
  for (const key of Object.keys(collection)) collection[key] = round(collection[key]);
  const hasCompletedCollection = categorized > 0 || paidAmount > 0 || journalCollected > 0;
  const logTexts = [];
  const collectLogTexts = (value) => {
    if (Array.isArray(value)) {
      value.forEach(collectLogTexts);
      return;
    }
    if (typeof value === 'string') logTexts.push(value);
  };
  collectLogTexts(entry.response?.logs);
  const loggedGrandTotals = [];
  for (const text of logTexts) {
    for (const match of text.matchAll(/grand_total\s*:\s*([0-9.,]+)/gi)) {
      loggedGrandTotals.push(round(match[1]));
    }
  }
  const matchedPaidTotal = loggedGrandTotals.find((loggedTotal) => (
    Math.abs(loggedTotal - paidAmount) <= 0.01
    && invoiceTotal - loggedTotal > 0.01
    && invoiceTotal - loggedTotal <= residualTolerance
  ));
  const hasResidualEvidence = matchedPaidTotal !== undefined;
  const posResidual = (
    hasCompletedCollection
    && balance > 0
    && balance <= residualTolerance
    && hasResidualEvidence
  ) ? balance : 0;
  const posOpenBalance = round(Math.max(balance - posResidual, 0));
  const requiresBranchConfirmation = (
    posOpenBalance > 0
    && trim(raw.order_status) === '3'
    && (
      collection.cash > 0
      || !trim(raw.customer_name)
      || /\bcash\b/i.test(trim(raw.customer_trn))
    )
  );
  const branchReviewBalance = requiresBranchConfirmation ? posOpenBalance : 0;
  const collectibleBalance = requiresBranchConfirmation ? 0 : posOpenBalance;
  const paymentStatus = requiresBranchConfirmation
    ? 'branch_confirmation_required'
    : collectibleBalance <= 0.01 && hasCompletedCollection
      ? (posResidual > 0 ? 'paid_with_pos_residual' : 'paid')
      : (paidAmount > 0 ? 'partial' : 'unpaid');
  const alerts = [];
  if (Math.abs(itemGross - gross) > 0.01) alerts.push('Header gross differs from item gross by AED ' + round(gross - itemGross).toFixed(2));
  if (Math.abs(itemTax - tax) > 0.01) alerts.push('Header VAT differs from item VAT by AED ' + round(tax - itemTax).toFixed(2));
  if (
    raw.total_quantity !== undefined
    && raw.total_quantity !== null
    && raw.total_quantity !== ''
    && Math.abs(itemQuantity - num(raw.total_quantity)) > 0.001
  ) {
    alerts.push('Header quantity differs from item quantity.');
  }
  if (Math.abs((paidAmount + balance) - invoiceTotal) > 0.01) alerts.push('Paid plus balance does not equal invoice total.');
  if (journalEntries.length && Math.abs(journalDebit - journalCredit) > 0.01) {
    alerts.push('Journal entry is not balanced. Debit AED ' + journalDebit.toFixed(2) + ', Credit AED ' + journalCredit.toFixed(2));
  }
  if (journalSales > 0 && Math.abs(journalSales - gross) > 0.01) {
    alerts.push('Journal Sales Account differs from invoice gross by AED ' + round(journalSales - gross).toFixed(2));
  }
  if (journalVat > 0 && Math.abs(journalVat - tax) > 0.01) {
    alerts.push('Journal VAT differs from invoice VAT by AED ' + round(journalVat - tax).toFixed(2));
  }
  if (journalCollected > 0 && journalCollected < invoiceTotal - 0.01 && balance <= 0.01) {
    alerts.push('Collection is short by AED ' + round(invoiceTotal - journalCollected).toFixed(2) + ' but POS balance is zero.');
  }
  if (posResidual > 0) {
    alerts.push(
      'Known POS payment residual: AED ' + posResidual.toFixed(2)
      + '. Payment matched previous logged total AED ' + num(matchedPaidTotal).toFixed(2)
      + '; excluded from collectible receivables.',
    );
  } else if (hasCompletedCollection && balance > 0 && balance <= residualTolerance) {
    alerts.push(
      'Small unpaid balance AED ' + balance.toFixed(2)
      + ' has no POS recalculation evidence; it is not a POS residual.',
    );
  }
  if (requiresBranchConfirmation) {
    alerts.push(
      'Delivered cash/anonymous sale has open balance AED ' + branchReviewBalance.toFixed(2)
      + '; excluded from confirmed receivables pending branch confirmation.',
    );
  }
  if (entry.journal_error) alerts.push('Sale journal was unavailable: ' + entry.journal_error);
  if (paidAmount > 0 && categorized <= 0) alerts.push('Payment exists but its method could not be classified.');
  normalized.push({
    transaction_id: trim(raw.id || entry.transaction?.transaction_id),
    invoice_no: trim(raw.order_no || entry.transaction?.invoice_no),
    invoice_date: trim(raw.billing_date || raw.order_date || entry.transaction?.transaction_date),
    invoice_time: trim(raw.billing_time || raw.order_time),
    branch_id: trim(raw.branch_id),
    branch_name: trim(raw.city),
    customer_id: trim(raw.customer_id),
    customer_type_id: trim(raw.customer_type_id),
    customer_account_id: trim(raw.account_id),
    customer_name: trim(raw.customer_name),
    customer_mobile: trim(raw.customer_mobile),
    customer_trn: trim(raw.customer_trn),
    currency: trim(raw.currency_short, 'AED'),
    gross_amount: gross,
    discount_amount: discount,
    tax_amount: tax,
    adjustment_amount: adjustment,
    round_off: roundOff,
    invoice_total: invoiceTotal,
    paid_amount: paidAmount,
    balance_amount: balance,
    pos_open_balance_amount: posOpenBalance,
    collectible_balance_amount: collectibleBalance,
    branch_review_balance_amount: branchReviewBalance,
    pos_residual_amount: posResidual,
    pos_residual_evidence: hasResidualEvidence ? {
      type: 'payment_matched_previous_logged_total',
      previous_logged_total: round(matchedPaidTotal),
      current_invoice_total: invoiceTotal,
    } : null,
    payment_status: paymentStatus,
    receivable_review_status: requiresBranchConfirmation ? 'branch_confirmation_required' : 'not_required',
    raw_paid_status: trim(raw.paid_status),
    order_status: trim(raw.order_status),
    total_quantity: itemQuantity,
    total_profit: round(raw.total_profit),
    salesman_id: trim(raw.salesman_id),
    driver_id: trim(raw.driver_id),
    created_at: trim(raw.created_datetime),
    modified_at: trim(raw.last_modified),
    items,
    payments,
    journal_entries: journalEntries,
    journal_debit: journalDebit,
    journal_credit: journalCredit,
    journal_sales: journalSales,
    journal_vat: journalVat,
    journal_collected: journalCollected,
    journal_balanced: !journalEntries.length || Math.abs(journalDebit - journalCredit) <= 0.01,
    collection,
    alerts,
  });
}
const summary = {
  invoice_count: normalized.length,
  gross_sales: round(normalized.reduce((sum, sale) => sum + sale.gross_amount, 0)),
  discounts: round(normalized.reduce((sum, sale) => sum + sale.discount_amount, 0)),
  vat: round(normalized.reduce((sum, sale) => sum + sale.tax_amount, 0)),
  net_sales: round(normalized.reduce((sum, sale) => sum + sale.gross_amount - sale.discount_amount + sale.adjustment_amount + sale.round_off, 0)),
  invoice_total: round(normalized.reduce((sum, sale) => sum + sale.invoice_total, 0)),
  collected: round(normalized.reduce((sum, sale) => sum + sale.paid_amount, 0)),
  outstanding: round(normalized.reduce((sum, sale) => sum + sale.collectible_balance_amount, 0)),
  pending_branch_review: round(normalized.reduce((sum, sale) => sum + sale.branch_review_balance_amount, 0)),
  pos_residuals: round(normalized.reduce((sum, sale) => sum + sale.pos_residual_amount, 0)),
  cash_collected: round(normalized.reduce((sum, sale) => sum + sale.collection.cash, 0)),
  card_collected: round(normalized.reduce((sum, sale) => sum + sale.collection.card, 0)),
  bank_collected: round(normalized.reduce((sum, sale) => sum + sale.collection.bank, 0)),
  other_collected: round(normalized.reduce((sum, sale) => sum + sale.collection.other, 0)),
  unknown_collected: round(normalized.reduce((sum, sale) => sum + sale.collection.unknown, 0)),
  quantity: round(normalized.reduce((sum, sale) => sum + sale.total_quantity, 0)),
  alert_count: normalized.reduce((sum, sale) => sum + sale.alerts.length, 0),
};
summary.average_invoice = summary.invoice_count ? round(summary.invoice_total / summary.invoice_count) : 0;
summary.collection_rate = summary.invoice_total ? round((summary.collected / summary.invoice_total) * 100) : 0;

const store = $getWorkflowStaticData('global');
if (!store.salesSync || typeof store.salesSync !== 'object') store.salesSync = {};
if (!store.salesSync.sales || typeof store.salesSync.sales !== 'object') store.salesSync.sales = {};
for (const sale of normalized) {
  store.salesSync.sales[sale.transaction_id] = {
    transaction_id: sale.transaction_id,
    invoice_no: sale.invoice_no,
    invoice_date: sale.invoice_date,
    branch_id: sale.branch_id,
    branch_name: sale.branch_name,
    customer_id: sale.customer_id,
    customer_type_id: sale.customer_type_id,
    customer_account_id: sale.customer_account_id,
    customer_name: sale.customer_name,
    gross_amount: sale.gross_amount,
    tax_amount: sale.tax_amount,
    invoice_total: sale.invoice_total,
    paid_amount: sale.paid_amount,
    balance_amount: sale.balance_amount,
    pos_open_balance_amount: sale.pos_open_balance_amount,
    collectible_balance_amount: sale.collectible_balance_amount,
    branch_review_balance_amount: sale.branch_review_balance_amount,
    pos_residual_amount: sale.pos_residual_amount,
    payment_status: sale.payment_status,
    receivable_review_status: sale.receivable_review_status,
    synced_at: new Date().toISOString(),
  };
}
const ids = Object.keys(store.salesSync.sales);
if (ids.length > 1000) {
  ids.slice(0, ids.length - 1000).forEach((id) => { delete store.salesSync.sales[id]; });
}
if (($json.pending_transactions || []).length) {
  store.salesSync.last_transaction_id = $json.candidate_watermark;
  store.salesSync.last_invoice_no = $json.candidate_invoice_no;
  store.salesSync.last_success_at = new Date().toISOString();
}
return [{
  json: {
    fetched_at: $json.fetched_at,
    records_filtered: $json.records_filtered,
    fetched_count: $json.fetched_count,
    new_count: normalized.length,
    previous_watermark: $json.previous_watermark,
    current_watermark: store.salesSync.last_transaction_id || $json.previous_watermark,
    sales: normalized,
    summary,
  },
}];
`;

const reportCode = String.raw`
const rows = $json.sales || [];
const summary = $json.summary || {};
const money = (value) => Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const lines = [
  'تقرير مزامنة المبيعات والتحصيل',
  'وقت الفحص: ' + new Date($json.fetched_at).toLocaleString('en-GB', { timeZone: 'Asia/Dubai' }),
  'السجلات المقروءة: ' + $json.fetched_count,
  'العمليات الجديدة: ' + $json.new_count,
  'إجمالي السجلات حسب POS: ' + $json.records_filtered,
];
if (rows.length) {
  lines.push(
    '',
    'Gross Sales: AED ' + money(summary.gross_sales),
    'Discounts: AED ' + money(summary.discounts),
    'Sales Before VAT: AED ' + money(summary.net_sales),
    'VAT: AED ' + money(summary.vat),
    'Invoice Total: AED ' + money(summary.invoice_total),
    'Collected: AED ' + money(summary.collected),
    'Cash: AED ' + money(summary.cash_collected),
    'Card: AED ' + money(summary.card_collected),
    'Bank: AED ' + money(summary.bank_collected),
    'Unclassified Collection: AED ' + money(summary.unknown_collected),
    'Outstanding: AED ' + money(summary.outstanding),
    'Pending Branch Review: AED ' + money(summary.pending_branch_review),
    'POS Payment Residuals: AED ' + money(summary.pos_residuals),
    'Collection Rate: ' + Number(summary.collection_rate || 0).toFixed(2) + '%',
    'Average Invoice: AED ' + money(summary.average_invoice),
    'Items Quantity: ' + Number(summary.quantity || 0),
    '',
    'أحدث الفواتير:',
  );
  for (const row of rows.slice(0, 10)) {
    lines.push(
      '- ' + row.invoice_no
      + ' | ' + row.customer_name
      + ' | AED ' + money(row.invoice_total)
      + ' | ' + (
        row.payment_status === 'paid'
          ? 'مدفوعة'
          : row.payment_status === 'paid_with_pos_residual'
            ? 'مدفوعة مع فرق POS'
            : row.payment_status === 'branch_confirmation_required'
              ? 'بانتظار تأكيد الفرع'
            : row.payment_status === 'partial'
              ? 'جزئية'
              : 'غير مدفوعة'
      ),
    );
    if (row.alerts?.length) lines.push('  تنبيه: ' + row.alerts.join(' | '));
  }
} else {
  lines.push('', 'لا توجد Sales Orders جديدة منذ آخر مزامنة.');
}
return [{ json: { ...$json, chat_id: String($vars.TELEGRAM_ALLOWED_CHAT_ID || ''), telegram_text: lines.join('\n') } }];
`;

function codeNode(id, name, position, jsCode) {
  return {
    id,
    name,
    type: 'n8n-nodes-base.code',
    typeVersion: 2,
    position,
    parameters: { jsCode: jsCode.trim() },
  };
}

const workflow = {
  name: 'POS Sales And Collections Incremental Sync',
  active: false,
  nodes: [
    {
      id: 'sales-manual-trigger',
      name: 'Manual Test',
      type: 'n8n-nodes-base.manualTrigger',
      typeVersion: 1,
      position: [-760, 80],
      parameters: {},
    },
    {
      id: 'sales-schedule-trigger',
      name: 'Every 5 Minutes',
      type: 'n8n-nodes-base.scheduleTrigger',
      typeVersion: 1.2,
      position: [-760, -80],
      parameters: {
        rule: { interval: [{ field: 'minutes', minutesInterval: 5 }] },
      },
    },
    codeNode('sales-pos-fetch', 'POS - Fetch Latest Sales Orders', [-500, 0], fetchCode),
    codeNode('sales-parse', 'Sales - Parse Pending Transactions', [-240, 0], parseCode),
    codeNode('sales-details', 'POS - Fetch Full Sale Details', [20, 0], fetchDetailsCode),
    codeNode('sales-journal', 'POS - Fetch Sale Journal Entries', [280, 0], fetchJournalCode),
    codeNode('sales-normalize', 'Sales - Normalize And Validate', [540, 0], normalizeDetailsCode),
    codeNode('sales-report', 'Sales - Build Financial Report', [800, 0], reportCode),
    {
      id: 'sales-telegram',
      name: 'Telegram - Send Sales Financial Report',
      type: 'n8n-nodes-base.telegram',
      typeVersion: 1.2,
      position: [1060, 0],
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
    },
    {
      id: 'sales-note',
      name: 'Sales Sync Setup',
      type: 'n8n-nodes-base.stickyNote',
      typeVersion: 1,
      position: [-780, -420],
      parameters: {
        content: [
          '## POS Sales And Collections Sync',
          '',
          'Read-only workflow. It does not create, edit, or delete POS sales.',
          '',
          'Required n8n Variables:',
          '- POS_USERNAME',
          '- POS_PASSWORD',
          '- TELEGRAM_ALLOWED_CHAT_ID',
          '',
          'Optional:',
          '- AIPSOFT_API_BASE_URL',
          '- AIPSOFT_CLIENT_IDENTIFIER',
          '- POS_LOGIN_ENDPOINT',
          '- POS_SALES_REFERER',
          '- POS_ORIGIN',
          '- POS_SALES_SYNC_PAGE_SIZE',
          '- POS_SALES_BRANCH_FILTER',
          '- POS_PAYMENT_RESIDUAL_TOLERANCE (default 0.50 AED)',
          '',
          'Select the Telegram Credential before activation.',
        ].join('\n'),
      },
    },
  ],
  connections: {
    'Manual Test': {
      main: [[{ node: 'POS - Fetch Latest Sales Orders', type: 'main', index: 0 }]],
    },
    'Every 5 Minutes': {
      main: [[{ node: 'POS - Fetch Latest Sales Orders', type: 'main', index: 0 }]],
    },
    'POS - Fetch Latest Sales Orders': {
      main: [[{ node: 'Sales - Parse Pending Transactions', type: 'main', index: 0 }]],
    },
    'Sales - Parse Pending Transactions': {
      main: [[{ node: 'POS - Fetch Full Sale Details', type: 'main', index: 0 }]],
    },
    'POS - Fetch Full Sale Details': {
      main: [[{ node: 'POS - Fetch Sale Journal Entries', type: 'main', index: 0 }]],
    },
    'POS - Fetch Sale Journal Entries': {
      main: [[{ node: 'Sales - Normalize And Validate', type: 'main', index: 0 }]],
    },
    'Sales - Normalize And Validate': {
      main: [[{ node: 'Sales - Build Financial Report', type: 'main', index: 0 }]],
    },
    'Sales - Build Financial Report': {
      main: [[{ node: 'Telegram - Send Sales Financial Report', type: 'main', index: 0 }]],
    },
  },
  settings: {
    executionOrder: 'v1',
    timezone: 'Asia/Dubai',
  },
  pinData: {},
  meta: {
    templateCredsSetupCompleted: false,
  },
  tags: [],
};

const output = path.join(__dirname, '..', 'n8n-pos-sales-and-collections-sync-auto-login.json');
fs.writeFileSync(output, JSON.stringify(workflow, null, 2) + '\n');
console.log(output);
