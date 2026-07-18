const CONFIG = {
  OWNER_WHATSAPP: '971568720885',
  ALLOWED_WHATSAPP: '971568720885',

  TEXTCONNECT_SECRET: 'PUT_SECRET_HERE',
  TEXTCONNECT_ACCOUNT: 'PUT_ACCOUNT_HERE',

  REPORT_APP_BASE_URL: 'https://www.inandoutuae.com',
  REPORT_API_TOKEN: 'PUT_REPORT_API_TOKEN_HERE',
};

const trim = (value, fallback = '') => String(value ?? fallback).trim();
const compact = (value, max = 3500) => {
  const text = trim(value);
  return text.length > max ? text.slice(0, max - 3) + '...' : text;
};
const digits = (value) => trim(value).replace(/[^0-9]/g, '');
const normalizePhone = (value) => {
  let phone = digits(value);
  if (phone.startsWith('00')) phone = phone.slice(2);
  if (phone.startsWith('0') && phone.length === 10) phone = '971' + phone.slice(1);
  return phone;
};
const money = (value) =>
  Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const number = (value) => Number(value || 0).toLocaleString('en-US');
const arabic = (value) =>
  trim(value)
    .replace(/[إأآا]/g, 'ا')
    .replace(/[ى]/g, 'ي')
    .replace(/[ة]/g, 'ه')
    .toLowerCase();
const pad = (value) => String(value).padStart(2, '0');
const fmt = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const dubaiNow = () => new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Dubai' }));

function firstText(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function getPayload() {
  const body = $json.body && typeof $json.body === 'object' ? $json.body : {};
  const query = $json.query && typeof $json.query === 'object' ? $json.query : {};
  return { ...query, ...body, raw: $json };
}

function incomingMessage(payload) {
  return firstText(
    payload.message,
    payload.text,
    payload.body,
    payload['data[message]'],
    payload['data[text]'],
    payload.caption,
    payload.content,
    payload.data?.message,
    payload.data?.text,
    payload.messages?.[0]?.text?.body,
    payload.messages?.[0]?.body,
    payload.raw?.message,
    payload.raw?.text
  );
}

function incomingSender(payload) {
  return normalizePhone(
    firstText(
      payload.sender,
      payload.from,
      payload.phone,
      payload.msisdn,
      payload.recipient,
      payload['data[from]'],
      payload['data[sender]'],
      payload['data[phone]'],
      payload['data[number]'],
      payload['data[recipient]'],
      payload.data?.sender,
      payload.data?.from,
      payload.messages?.[0]?.from,
      payload.raw?.sender,
      payload.raw?.from
    )
  );
}

function branchFromText(normalized) {
  if (/\bmbz\b|محمد بن زايد|مصفحه? بن زايد|بني ياس/.test(normalized)) return { id: '2', name: 'MBZ' };
  if (/musaffah|mussafah|مصفح/.test(normalized)) return { id: '3', name: 'Musaffah' };
  if (/falah|الفلاح|فلح/.test(normalized)) return { id: '1', name: 'Al Falah' };
  if (/riyadh|رياض|الرياض/.test(normalized)) return { id: '4', name: 'Al Riyadh' };
  return null;
}

function periodFromText(normalized) {
  const now = dubaiNow();

  if (/امس|yesterday/.test(normalized)) {
    const date = new Date(now);
    date.setDate(date.getDate() - 1);
    return { type: 'daily', from_date: fmt(date), to_date: fmt(date), label: fmt(date) };
  }

  if (/الاسبوع الماضي|اسبوع ماضي|last week/.test(normalized)) {
    const end = new Date(now);
    end.setDate(end.getDate() - 7);
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    return { type: 'weekly', from_date: fmt(start), to_date: fmt(end), label: `${fmt(start)} إلى ${fmt(end)}` };
  }

  if (/اسبوع|الاسبوع|weekly|week/.test(normalized)) {
    const end = new Date(now);
    const start = new Date(now);
    start.setDate(end.getDate() - 6);
    return { type: 'weekly', from_date: fmt(start), to_date: fmt(end), label: `${fmt(start)} إلى ${fmt(end)}` };
  }

  if (/الشهر الماضي|شهر ماضي|last month/.test(normalized)) {
    const firstThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastPrevMonth = new Date(firstThisMonth);
    lastPrevMonth.setDate(0);
    const firstPrevMonth = new Date(lastPrevMonth.getFullYear(), lastPrevMonth.getMonth(), 1);
    return { type: 'monthly', from_date: fmt(firstPrevMonth), to_date: fmt(lastPrevMonth), label: `${fmt(firstPrevMonth)} إلى ${fmt(lastPrevMonth)}` };
  }

  if (/شهر|الشهري|monthly|month/.test(normalized)) {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { type: 'monthly', from_date: fmt(start), to_date: fmt(now), label: `${fmt(start)} إلى ${fmt(now)}` };
  }

  return { type: 'daily', from_date: fmt(now), to_date: fmt(now), label: fmt(now) };
}

function parseIntent(text) {
  const normalized = arabic(text);
  const period = periodFromText(normalized);
  const branch = branchFromText(normalized);

  if (!normalized || /^(help|مساعده|الاوامر|اوامر|menu|start)$/i.test(normalized)) {
    return { action: 'help', topic: 'help', period, branch: null };
  }

  if (/عميل|customer|زبون|رقم عميل/.test(normalized)) return { action: 'placeholder', topic: 'customer', period, branch };
  if (/فاتوره غير مدفوعه|فواتير|invoice|unpaid/.test(normalized)) return { action: 'placeholder', topic: 'invoice', period, branch };
  if (/مشتريات|purchase|مورد/.test(normalized)) return { action: 'placeholder', topic: 'purchase', period, branch };
  if (/اعتماد|موافقات|pending|approval/.test(normalized)) return { action: 'placeholder', topic: 'approval', period, branch };

  if (/اسوا|اسوأ|اقل فرع|ادني فرع|اضعف فرع|lowest|worst/.test(normalized)) return { action: 'report', topic: 'worst_branch', period, branch };
  if (/اعلى فرع|اعلي فرع|افضل فرع|اكثر فرع|top branch|best branch/.test(normalized)) return { action: 'report', topic: 'top_branch', period, branch };
  if (/مبيعات الفروع|ايرادات الفروع|sales by branch|branch sales/.test(normalized)) return { action: 'report', topic: 'branch_sales', period, branch };
  if (/مصروفات الفروع|expenses by branch|branch expenses/.test(normalized)) return { action: 'report', topic: 'branch_expenses', period, branch };
  if (/ملخص|مختصر|summary|brief/.test(normalized)) return { action: 'report', topic: 'brief', period, branch };
  if (/مصروف|مصروفات|expense|expenses/.test(normalized)) return { action: 'report', topic: 'expenses', period, branch };
  if (/كاش|cash|رصيد|صافي/.test(normalized)) return { action: 'report', topic: 'cash', period, branch };
  if (/مبيعات|ايراد|ايرادات|sales|revenue/.test(normalized)) return { action: 'report', topic: 'sales', period, branch };
  if (/قارن|مقارنه|compare/.test(normalized)) return { action: 'report', topic: 'branches', period, branch };
  if (/تقرير|report|اليوم|امس|اسبوع|شهر/.test(normalized)) return { action: 'report', topic: 'summary', period, branch };

  return { action: 'unknown', topic: 'unknown', period, branch };
}

function helpText() {
  return [
    'مساعد المالك على واتساب',
    '',
    'أوامر التقارير:',
    '- تقرير اليوم',
    '- تقرير أمس',
    '- تقرير الأسبوع',
    '- تقرير الأسبوع الماضي',
    '- تقرير الشهر',
    '- تقرير الشهر الماضي',
    '- ملخص اليوم',
    '- مبيعات فرع MBZ اليوم',
    '- مصروفات الأسبوع',
    '- الكاش اليوم',
    '- قارن الفروع اليوم',
    '- مبيعات الفروع اليوم',
    '- أعلى فرع اليوم',
    '- أقل فرع اليوم',
    '',
    'أوامر المرحلة التالية:',
    '- ابحث عن العميل 9715xxxxxxx',
    '- الفواتير غير المدفوعة',
    '- المشتريات المعلقة',
    '- الموافقات المطلوبة',
  ].join('\n');
}

function placeholderText(topic) {
  const labels = {
    customer: 'بحث العملاء وحساب العميل',
    invoice: 'الفواتير غير المدفوعة',
    purchase: 'المشتريات والموردين',
    approval: 'الموافقات المعلقة',
  };
  return [
    `تم فهم الطلب: ${labels[topic] || topic}`,
    '',
    'هذه الوظيفة سيتم ربطها في المرحلة التالية.',
    'حالياً المساعد جاهز للتقارير والمبيعات والمصروفات والكاش.',
    '',
    'اكتب: مساعدة',
  ].join('\n');
}

function scopeText(intent) {
  return intent.branch ? `فرع ${intent.branch.name}` : 'كل الأفرع';
}

function reportTitle(intent) {
  const scope = ` - ${scopeText(intent)}`;
  if (intent.topic === 'brief') return `⚡ ملخص ${intent.period.type === 'monthly' ? 'الشهر' : intent.period.type === 'weekly' ? 'الأسبوع' : 'اليوم'}${scope}`;
  if (intent.topic === 'sales' || intent.topic === 'branch_sales') return `💰 المبيعات${scope}`;
  if (intent.topic === 'expenses' || intent.topic === 'branch_expenses') return `📉 المصروفات${scope}`;
  if (intent.topic === 'cash') return `💵 الكاش${scope}`;
  if (intent.topic === 'top_branch') return `🏆 أعلى فرع`;
  if (intent.topic === 'worst_branch') return `⚠️ أقل فرع`;
  if (intent.topic === 'branches') return `🏪 مقارنة الفروع`;
  return `${intent.period.type === 'monthly' ? '📆 التقرير الشهري' : intent.period.type === 'weekly' ? '📌 التقرير الأسبوعي' : '📊 التقرير اليومي'}${scope}`;
}

function sortedBranches(report, direction = 'desc') {
  const rows = Array.isArray(report.branches) ? report.branches.slice() : [];
  return rows.sort((a, b) =>
    direction === 'asc'
      ? Number(a.revenue || 0) - Number(b.revenue || 0)
      : Number(b.revenue || 0) - Number(a.revenue || 0)
  );
}

function branchLines(report, direction = 'desc') {
  return sortedBranches(report, direction)
    .slice(0, 6)
    .map((row, index) => `${index + 1}. ${row.branch || row.branch_id}: ${money(row.revenue)} AED | طلبات ${number(row.orders)} | كاش ${money(row.cash)}`);
}

function expenseLines(report) {
  const expenses = Array.isArray(report.expenses) ? report.expenses : [];
  return expenses
    .slice(0, 6)
    .map((item, index) => `${index + 1}. ${item.category || item.name || item.expense || 'Expense'}: ${money(item.amount || item.total || item.value)} AED`);
}

function serviceLines(report) {
  const services = Array.isArray(report.top_services) ? report.top_services : [];
  return services
    .slice(0, 4)
    .map((item) => `${item.rank || '-'}: ${item.service} | ${number(item.qty)} | ${money(item.revenue)} AED`);
}

function buildReportMessage(intent, report) {
  const metrics = report.metrics || {};
  const link = trim(report.share_url || report.operations_report_link || '');
  const best = sortedBranches(report, 'desc')[0];
  const worst = sortedBranches(report, 'asc')[0];
  const common = [reportTitle(intent), `📅 الفترة: ${intent.period.label || report.date_label || ''}`, ''];

  if (intent.topic === 'brief') {
    return compact([
      ...common,
      `💰 الإيرادات: ${money(metrics.total_revenue)} AED`,
      `🧾 الطلبات: ${number(metrics.total_orders)}`,
      `📉 المصروفات: ${money(metrics.total_expenses)} AED`,
      `💵 صافي الكاش: ${money(metrics.closing_balance)} AED`,
      best ? `🏆 أعلى فرع: ${best.branch} (${money(best.revenue)} AED)` : '',
      worst ? `⚠️ أقل فرع: ${worst.branch} (${money(worst.revenue)} AED)` : '',
      link ? `📎 ${link}` : '',
    ].filter(Boolean).join('\n'));
  }

  if (intent.topic === 'top_branch') {
    return compact([
      ...common,
      best ? `${best.branch}: ${money(best.revenue)} AED` : 'لا توجد بيانات فروع.',
      best ? `🧾 الطلبات: ${number(best.orders)}` : '',
      best ? `💵 الكاش: ${money(best.cash)}` : '',
      '',
      ...branchLines(report, 'desc'),
      '',
      link ? `📎 رابط التقرير:\n${link}` : '',
    ].filter(Boolean).join('\n'));
  }

  if (intent.topic === 'worst_branch') {
    return compact([
      ...common,
      worst ? `${worst.branch}: ${money(worst.revenue)} AED` : 'لا توجد بيانات فروع.',
      worst ? `🧾 الطلبات: ${number(worst.orders)}` : '',
      worst ? `💵 الكاش: ${money(worst.cash)}` : '',
      '',
      ...branchLines(report, 'asc'),
      '',
      link ? `📎 رابط التقرير:\n${link}` : '',
    ].filter(Boolean).join('\n'));
  }

  if (intent.topic === 'branch_sales') {
    return compact([
      ...common,
      ...branchLines(report, 'desc'),
      '',
      `💰 الإجمالي: ${money(metrics.total_revenue)} AED`,
      `🧾 الطلبات: ${number(metrics.total_orders)}`,
      link ? `📎 رابط التقرير:\n${link}` : '',
    ].filter(Boolean).join('\n'));
  }

  if (intent.topic === 'branch_expenses') {
    return compact([
      ...common,
      `📉 إجمالي المصروفات: ${money(metrics.total_expenses)} AED`,
      `💸 كاش خارج: ${money(metrics.total_cash_out)} AED`,
      '',
      ...expenseLines(report),
      '',
      'ملاحظة: تفاصيل المصروفات حسب الفرع تعتمد على بيانات POS المتاحة في التقرير.',
      link ? `📎 رابط التقرير:\n${link}` : '',
    ].filter(Boolean).join('\n'));
  }

  if (intent.topic === 'sales') {
    return compact([
      ...common,
      `💰 إجمالي الإيرادات: ${money(metrics.total_revenue)} AED`,
      `🧾 عدد الطلبات: ${number(metrics.total_orders)}`,
      `📦 القطع/الخدمات: ${number(metrics.items_processed)}`,
      `📊 متوسط الطلب: ${money(metrics.avg_order_value)} AED`,
      best ? `🏆 أعلى فرع: ${best.branch} (${money(best.revenue)} AED)` : '',
      '',
      ...branchLines(report),
      serviceLines(report).length ? '\nأعلى الخدمات:' : '',
      ...serviceLines(report),
      '',
      link ? `📎 رابط التقرير:\n${link}` : '',
    ].filter(Boolean).join('\n'));
  }

  if (intent.topic === 'expenses') {
    return compact([
      ...common,
      `📉 إجمالي المصروفات: ${money(metrics.total_expenses)} AED`,
      `💸 كاش خارج: ${money(metrics.total_cash_out)} AED`,
      `💵 صافي الكاش: ${money(metrics.closing_balance)} AED`,
      '',
      ...expenseLines(report),
      '',
      link ? `📎 رابط التقرير:\n${link}` : '',
    ].filter(Boolean).join('\n'));
  }

  if (intent.topic === 'cash') {
    return compact([
      ...common,
      `💵 كاش داخل: ${money(metrics.total_cash_in)} AED`,
      `💸 كاش خارج: ${money(metrics.total_cash_out)} AED`,
      `📉 المصروفات: ${money(metrics.total_expenses)} AED`,
      `✅ صافي الكاش: ${money(metrics.closing_balance)} AED`,
      '',
      ...branchLines(report),
      '',
      link ? `📎 رابط التقرير:\n${link}` : '',
    ].filter(Boolean).join('\n'));
  }

  if (intent.topic === 'branches') {
    return compact([
      ...common,
      best ? `🏆 أعلى فرع: ${best.branch} (${money(best.revenue)} AED)` : 'لا توجد بيانات فروع.',
      worst ? `⚠️ أقل فرع: ${worst.branch} (${money(worst.revenue)} AED)` : '',
      '',
      ...branchLines(report),
      '',
      `💰 الإجمالي: ${money(metrics.total_revenue)} AED`,
      `🧾 الطلبات: ${number(metrics.total_orders)}`,
      link ? `📎 رابط التقرير:\n${link}` : '',
    ].filter(Boolean).join('\n'));
  }

  return compact([
    ...common,
    `🏪 النطاق: ${scopeText(intent)}`,
    `💰 الإيرادات: ${money(metrics.total_revenue)} AED`,
    `🧾 عدد الطلبات: ${number(metrics.total_orders)}`,
    `📉 المصروفات: ${money(metrics.total_expenses)} AED`,
    `💵 صافي الكاش: ${money(metrics.closing_balance)} AED`,
    best ? `🏆 أعلى فرع: ${best.branch}` : '',
    '',
    link ? `📎 التقرير جاهز للفتح مباشرة:\n${link}` : '📎 رابط التقرير غير جاهز.',
  ].filter(Boolean).join('\n'));
}

async function sendWhatsApp(to, message) {
  if (!CONFIG.TEXTCONNECT_SECRET || CONFIG.TEXTCONNECT_SECRET.includes('PUT_')) {
    throw new Error('TEXTCONNECT_SECRET is missing inside CONFIG.');
  }
  if (!CONFIG.TEXTCONNECT_ACCOUNT || CONFIG.TEXTCONNECT_ACCOUNT.includes('PUT_')) {
    throw new Error('TEXTCONNECT_ACCOUNT is missing inside CONFIG.');
  }
  return await this.helpers.httpRequest({
    method: 'POST',
    url: 'https://textconnect.aipsoft.com/api/send/whatsapp',
    qs: {
      secret: CONFIG.TEXTCONNECT_SECRET,
      account: CONFIG.TEXTCONNECT_ACCOUNT,
      recipient: to,
      type: 'text',
      message,
    },
    json: true,
    timeout: 120000,
  });
}

async function generateReport(intent) {
  if (!CONFIG.REPORT_API_TOKEN || CONFIG.REPORT_API_TOKEN.includes('PUT_')) {
    throw new Error('REPORT_API_TOKEN is missing inside CONFIG.');
  }
  const base = trim(CONFIG.REPORT_APP_BASE_URL, 'https://www.inandoutuae.com').replace(/\/+$/, '');
  const body = {
    report_type: intent.period.type,
    from_date: intent.period.from_date,
    to_date: intent.period.to_date,
    date: intent.period.to_date,
    save_snapshot: '1',
  };
  if (intent.branch?.id) body.branch_ids = intent.branch.id;
  return await this.helpers.httpRequest({
    method: 'POST',
    url: base + '/api/reports/daily-operations',
    headers: { 'X-Report-Api-Key': CONFIG.REPORT_API_TOKEN },
    body,
    json: true,
    timeout: 300000,
  });
}

const payload = getPayload();
const text = incomingMessage(payload);
const owner = normalizePhone(CONFIG.OWNER_WHATSAPP || '971568720885');
const incomingSecret = trim(payload.secret || payload['data[secret]']);
const sender =
  incomingSender(payload) ||
  (incomingSecret && CONFIG.TEXTCONNECT_SECRET && incomingSecret === CONFIG.TEXTCONNECT_SECRET ? owner : '');
const allowed = trim(CONFIG.ALLOWED_WHATSAPP || owner)
  .split(',')
  .map(normalizePhone)
  .filter(Boolean);
const recipient = sender || owner;

if (!sender) {
  return [{ json: { ok: true, ignored: 'missing_sender', message: text, payload } }];
}
if (allowed.length && !allowed.includes(sender)) {
  return [{ json: { ok: true, ignored: 'unauthorized_sender', sender } }];
}

const intent = parseIntent(text);
let reply = '';
let report = null;

if (intent.action === 'help') {
  reply = helpText();
} else if (intent.action === 'placeholder') {
  reply = placeholderText(intent.topic);
} else if (intent.action === 'report') {
  report = await generateReport.call(this, intent);
  reply = buildReportMessage(intent, report);
} else {
  reply = [
    'لم أفهم الطلب بشكل كافي.',
    '',
    'اكتب مثلاً:',
    '- ملخص اليوم',
    '- تقرير اليوم',
    '- مبيعات فرع MBZ اليوم',
    '- مبيعات الفروع اليوم',
    '- أعلى فرع اليوم',
    '- أقل فرع اليوم',
    '',
    'أو اكتب: مساعدة',
  ].join('\n');
}

const whatsappResult = await sendWhatsApp.call(this, recipient, reply);
return [
  {
    json: {
      ok: true,
      sender,
      recipient,
      text,
      intent,
      reply,
      report_id: report?.report_id || '',
      whatsapp_result: whatsappResult,
    },
  },
];
