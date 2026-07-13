const vars = (typeof $vars === 'object' && $vars) ? $vars : {};

const trim = (value, fallback = '') => String(value ?? fallback).trim();
const compact = (value, max = 3500) => {
  const text = trim(value);
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
};
const digits = (value) => trim(value).replace(/[^0-9]/g, '');
const normalizePhone = (value) => {
  let phone = digits(value);
  if (phone.startsWith('00')) phone = phone.slice(2);
  if (phone.startsWith('0') && phone.length === 10) phone = `971${phone.slice(1)}`;
  return phone;
};
const arabic = (value) =>
  trim(value)
    .replace(/[إأآا]/g, 'ا')
    .replace(/[ى]/g, 'ي')
    .replace(/[ة]/g, 'ه')
    .toLowerCase();
const money = (value) =>
  Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

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
    payload.caption,
    payload.content,
    payload['data[message]'],
    payload['data[text]'],
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

function getBaseUrl() {
  return trim(vars.LAYLA_SITE_URL || vars.PUBLIC_SITE_URL || 'https://www.inandoutuae.com').replace(/\/+$/, '');
}

function detectLanguage(text) {
  return /[\u0600-\u06FF]/.test(text) ? 'ar' : 'en';
}

function extractOrderId(text) {
  const match = trim(text).match(/\b(?:INO|ORD|CMP|INV)?[-\s]?\d{3,8}\b/i);
  return match ? match[0].replace(/\s+/g, '-').toUpperCase() : '';
}

function parseIntent(text) {
  const normalized = arabic(text);
  const orderId = extractOrderId(text);

  if (!normalized || /^(hi|hello|hey|start|menu|help|مرحبا|السلام|مساعده|مساعدة|هلا)$/i.test(normalized)) {
    return { name: 'greeting', orderId, confidence: 0.9 };
  }
  if (/حجز|احجز|استلام|pickup|book|collect|طلب جديد/.test(normalized)) {
    return { name: 'booking', orderId, confidence: 0.9 };
  }
  if (/تتبع|وين|حاله|حالة|طلبي|order status|track|tracking|status/.test(normalized) || orderId) {
    return { name: 'tracking', orderId, confidence: 0.88 };
  }
  if (/سعر|اسعار|الاسعار|كم|price|pricing|cost|aed|درهم/.test(normalized)) {
    return { name: 'pricing', orderId, confidence: 0.85 };
  }
  if (/فرع|فروع|موقع|خريطه|خريطة|وينكم|branch|location|map/.test(normalized)) {
    return { name: 'branches', orderId, confidence: 0.85 };
  }
  if (/شكوى|مشكله|تالف|ضايع|تاخير|تأخير|complaint|issue|problem|lost|damage|delay/.test(normalized)) {
    return { name: 'complaint', orderId, confidence: 0.9 };
  }
  if (/موظف|انسان|اتصال|كلموني|اتواصل|human|agent|call me|support/.test(normalized)) {
    return { name: 'handoff', orderId, confidence: 0.9 };
  }
  return { name: 'general', orderId, confidence: 0.55 };
}

function fallbackSiteContext() {
  return {
    site_name: 'In & Out Laundry',
    whatsapp_number: '971568720885',
    contact_email: 'inandoutuae@gmail.com',
    business_address: 'Abu Dhabi, UAE',
    services: [
      'Wash & Iron',
      'Dry Cleaning',
      'Kandoora & Ghutra Care',
      'Abaya Care',
      'Blankets',
      'Curtains',
      'Carpets',
      'Luxury Garments',
    ],
    branches: [
      { name: 'Al Falah Branch', address: 'Al Falah, Abu Dhabi', phone: '971568720885', hours: '8 AM - 10 PM' },
      { name: 'Mussaffah Branch', address: 'Mussaffah, Abu Dhabi', phone: '971568720885', hours: '8 AM - 10 PM' },
      { name: 'Mohammed Bin Zayed Branch', address: 'Mohammed Bin Zayed City, Abu Dhabi', phone: '971568720885', hours: '8 AM - 10 PM' },
    ],
    service_areas: ['Al Falah', 'Mussaffah', 'Mohammed Bin Zayed City', 'Abu Dhabi'],
    pricing_note: 'Prices vary by item and service. For exact pricing, ask for item type and quantity or direct the customer to the pricing page.',
  };
}

async function fetchSiteContext() {
  const base = getBaseUrl();
  try {
    const config = await this.helpers.httpRequest({
      method: 'GET',
      url: `${base}/api/customer/site-config`,
      json: true,
      timeout: 20000,
    });
    const branches = Array.isArray(config?.branches) ? config.branches : [];
    const pricing = Array.isArray(config?.pricing) ? config.pricing : [];
    const areas = Array.isArray(config?.service_areas) ? config.service_areas : [];
    return {
      site_name: config.site_name || 'In & Out Laundry',
      whatsapp_number: config.whatsapp_number || '971568720885',
      contact_email: config.contact_email || '',
      business_address: config.business_address || '',
      branches: branches.map((branch) => ({
        name: branch.name,
        address: branch.address,
        phone: branch.phone,
        whatsapp: branch.whatsapp,
        hours: branch.hours,
        status: branch.status || 'active',
      })),
      service_areas: areas.filter((area) => area.active !== false).map((area) => ({
        name: area.name,
        delivery_fee: area.delivery_fee,
        minimum_order: area.minimum_order,
      })),
      pricing: pricing.slice(0, 40).map((item) => ({
        name_ar: item.name_ar,
        name_en: item.name_en,
        category: item.category,
        wash_iron: item.wash_iron,
        dry: item.dry,
        iron: item.iron,
      })),
      services: [
        'Wash & Iron',
        'Dry Cleaning',
        'Kandoora & Ghutra Care',
        'Abaya Care',
        'Blankets',
        'Curtains',
        'Carpets',
        'Luxury Garments',
      ],
    };
  } catch (error) {
    return fallbackSiteContext();
  }
}

async function fetchOrder(orderId) {
  const token = trim(vars.LAYLA_APP_BEARER_TOKEN || vars.CUSTOMER_PORTAL_API_TOKEN || vars.ADMIN_API_TOKEN);
  if (!orderId || !token) return null;
  try {
    return await this.helpers.httpRequest({
      method: 'GET',
      url: `${getBaseUrl()}/api/customer/orders/${encodeURIComponent(orderId)}`,
      headers: { Authorization: `Bearer ${token}` },
      json: true,
      timeout: 20000,
    });
  } catch (error) {
    return null;
  }
}

function statusText(order, language) {
  if (!order) return '';
  const labels = {
    new: ['تم استلام الطلب', 'Order received'],
    accepted: ['تم قبول الطلب', 'Order accepted'],
    on_the_way: ['السائق في الطريق', 'Driver is on the way'],
    pickup: ['تم الاستلام', 'Picked up'],
    washing: ['قيد العناية والتنظيف', 'In cleaning care'],
    ready: ['جاهز للتسليم', 'Ready'],
    delivery: ['خارج للتوصيل', 'Out for delivery'],
    delivered: ['تم التسليم', 'Delivered'],
    completed: ['مكتمل', 'Completed'],
    cancelled: ['ملغي', 'Cancelled'],
  };
  const pair = labels[order.status] || [String(order.status || ''), String(order.status || '')];
  return language === 'ar' ? pair[0] : pair[1];
}

function bookingLink() {
  return `${getBaseUrl()}/book`;
}

function trackingLink(orderId = '') {
  const suffix = orderId ? `?id=${encodeURIComponent(orderId)}` : '';
  return `${getBaseUrl()}/track${suffix}`;
}

function complaintLink(orderId = '') {
  const suffix = orderId ? `?id=${encodeURIComponent(orderId)}` : '';
  return `${getBaseUrl()}/complaint${suffix}`;
}

function fallbackReply({ language, intent, siteContext, order }) {
  const ar = language === 'ar';
  if (intent.name === 'greeting') {
    return ar
      ? 'مرحباً، أنا ليلى من In & Out Laundry. أقدر أساعدك في الحجز، تتبع الطلب، الأسعار، الفروع، أو الشكاوى. كيف أقدر أخدمك؟'
      : 'Hi, I am Layla from In & Out Laundry. I can help with booking, tracking, prices, branches, or complaints. How can I help?';
  }
  if (intent.name === 'booking') {
    return ar
      ? `أكيد. للحجز السريع افتح الرابط:\n${bookingLink()}\n\nأو أرسل لي: الاسم، المنطقة، العنوان، الخدمة المطلوبة، والوقت المناسب للاستلام.`
      : `Sure. For quick booking, open:\n${bookingLink()}\n\nOr send: name, area, address, service, and preferred pickup time.`;
  }
  if (intent.name === 'tracking') {
    if (order) {
      return ar
        ? `طلبك ${order.id} حالته الآن: ${statusText(order, language)}.\nالتتبع: ${trackingLink(order.id)}`
        : `Your order ${order.id} is now: ${statusText(order, language)}.\nTrack it here: ${trackingLink(order.id)}`;
    }
    return intent.orderId
      ? (ar
          ? `لخصوصية بياناتك، افتح رابط التتبع للطلب ${intent.orderId}:\n${trackingLink(intent.orderId)}`
          : `For privacy, track order ${intent.orderId} here:\n${trackingLink(intent.orderId)}`)
      : (ar
          ? `أرسل رقم الطلب وسأعطيك رابط التتبع. أو افتح:\n${trackingLink()}`
          : `Send your order number and I will share the tracking link. Or open:\n${trackingLink()}`);
  }
  if (intent.name === 'pricing') {
    const sample = Array.isArray(siteContext.pricing) && siteContext.pricing.length
      ? siteContext.pricing.slice(0, 5).map((item) => {
          const name = ar ? item.name_ar : item.name_en;
          const price = item.wash_iron || item.dry || item.iron;
          return `${name}: AED ${money(price)}`;
        }).join('\n')
      : '';
    return ar
      ? `الأسعار تختلف حسب القطعة والخدمة. أمثلة:\n${sample || '- غسيل وكي\n- تنظيف جاف\n- عناية كندورة وغترة'}\n\nأرسل نوع القطعة والعدد لأعطيك تقدير أوضح.`
      : `Prices vary by item and service. Examples:\n${sample || '- Wash & Iron\n- Dry Cleaning\n- Kandoora & Ghutra Care'}\n\nSend item type and quantity for a clearer estimate.`;
  }
  if (intent.name === 'branches') {
    const branches = (siteContext.branches || []).slice(0, 4).map((branch) => `${branch.name}: ${branch.address}`).join('\n');
    return ar
      ? `فروعنا الحالية:\n${branches}\n\nللحجز من أقرب فرع: ${bookingLink()}`
      : `Current branches:\n${branches}\n\nBook from the nearest branch: ${bookingLink()}`;
  }
  if (intent.name === 'complaint') {
    return ar
      ? `آسفين على أي إزعاج. افتح تذكرة متابعة من هنا:\n${complaintLink(intent.orderId)}\n\nوأرسل رقم الطلب ووصف المشكلة وسيتابعها الفريق.`
      : `Sorry for the inconvenience. Open a tracked support ticket here:\n${complaintLink(intent.orderId)}\n\nSend the order number and issue details for the team.`;
  }
  if (intent.name === 'handoff') {
    return ar
      ? 'تم، سأحوّل طلبك لفريق خدمة العملاء. أرسل اسمك ورقم الطلب أو المنطقة حتى يتواصلون معك بسرعة.'
      : 'Done, I will route this to customer support. Please send your name, order number or area so the team can follow up quickly.';
  }
  return ar
    ? 'أقدر أساعدك في الحجز، التتبع، الأسعار، الفروع، أو الشكاوى. اكتب طلبك بشكل بسيط وسأكمل معك.'
    : 'I can help with booking, tracking, prices, branches, or complaints. Send your request and I will guide you.';
}

function systemPrompt(language) {
  return [
    'You are Layla AI, the customer-service WhatsApp agent for In & Out Laundry in Abu Dhabi.',
    'Speak in the same language as the customer. Arabic should be warm Gulf-friendly Modern Arabic, concise and respectful. English should be clear and premium.',
    'Your job: help with booking pickup, tracking, prices, branches, complaints, and handoff to a human.',
    'Never invent exact prices, order status, branch availability, or delivery promises if not present in the provided context.',
    'For tracking: if order data is not provided, share the tracking link and ask for the order number. Do not reveal private details without verified order data.',
    'For booking: collect only the missing essentials: name, phone if missing, area, address/location, service, pickup time.',
    'For complaints: apologize briefly, ask for order number and issue details, and offer the complaint link.',
    'If message is angry, urgent, damaged/lost item, payment dispute, or asks for human, escalate politely.',
    'Keep WhatsApp replies under 900 characters unless necessary. No markdown tables. Avoid robotic disclaimers.',
  ].join('\n');
}

function userPrompt({ text, sender, intent, siteContext, order, language }) {
  return JSON.stringify({
    customer_message: text,
    sender,
    detected_language: language,
    detected_intent: intent,
    site_context: siteContext,
    order_context: order ? {
      id: order.id,
      status: order.status,
      status_text: statusText(order, language),
      serviceType: order.serviceType,
      branch: order.branch,
      pickupSlot: order.pickupSlot,
      paymentStatus: order.paymentStatus,
      totalPrice: order.totalPrice || order.amount,
      tracking_link: trackingLink(order.id),
    } : null,
    important_links: {
      booking: bookingLink(),
      tracking: trackingLink(intent.orderId),
      complaint: complaintLink(intent.orderId),
    },
    response_contract: {
      return_only_customer_reply: true,
      should_escalate_when_needed: true,
      no_json: true,
    },
  });
}

function extractOpenAIText(response) {
  if (typeof response?.output_text === 'string' && response.output_text.trim()) return response.output_text.trim();
  const chunks = [];
  for (const item of response?.output || []) {
    for (const content of item?.content || []) {
      if (typeof content?.text === 'string') chunks.push(content.text);
    }
  }
  return chunks.join('\n').trim();
}

async function callOpenAI(payload) {
  const apiKey = trim(vars.OPENAI_API_KEY || vars.LAYLA_OPENAI_API_KEY);
  const model = trim(vars.LAYLA_OPENAI_MODEL || vars.OPENAI_MODEL);
  if (!apiKey || !model) return '';
  try {
    const response = await this.helpers.httpRequest({
      method: 'POST',
      url: 'https://api.openai.com/v1/responses',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: {
        model,
        input: [
          {
            role: 'system',
            content: [{ type: 'input_text', text: systemPrompt(payload.language) }],
          },
          {
            role: 'user',
            content: [{ type: 'input_text', text: userPrompt(payload) }],
          },
        ],
        temperature: 0.3,
        max_output_tokens: 450,
      },
      json: true,
      timeout: 60000,
    });
    return compact(extractOpenAIText(response), 1800);
  } catch (error) {
    return '';
  }
}

async function sendWhatsApp(to, message) {
  const secret = trim(vars.TEXTCONNECT_SECRET);
  const account = trim(vars.TEXTCONNECT_ACCOUNT);
  if (!secret) throw new Error('TEXTCONNECT_SECRET is missing in n8n Variables.');
  if (!account) throw new Error('TEXTCONNECT_ACCOUNT is missing in n8n Variables.');
  return await this.helpers.httpRequest({
    method: 'POST',
    url: 'https://textconnect.aipsoft.com/api/send/whatsapp',
    qs: {
      secret,
      account,
      recipient: to,
      type: 'text',
      message,
    },
    json: true,
    timeout: 120000,
  });
}

async function sendEscalation({ sender, text, intent, reply }) {
  const to = normalizePhone(vars.LAYLA_ESCALATION_WHATSAPP || vars.SUPPORT_WHATSAPP || '');
  if (!to) return null;
  const shouldEscalate =
    intent.name === 'handoff' ||
    intent.name === 'complaint' ||
    /غاضب|زعلان|تالف|ضايع|مفقود|تعويض|مدير|angry|lost|damage|refund|manager/i.test(text);
  if (!shouldEscalate) return null;
  const alert = [
    'Layla AI escalation',
    `Customer: ${sender}`,
    `Intent: ${intent.name}`,
    `Message: ${text}`,
    '',
    `Layla reply: ${reply}`,
  ].join('\n');
  return await sendWhatsApp.call(this, to, compact(alert, 1800));
}

const payload = getPayload();
const text = incomingMessage(payload);
const sender = incomingSender(payload);
const webhookSecret = trim(vars.TEXTCONNECT_INCOMING_SECRET || vars.LAYLA_WEBHOOK_SECRET || vars.TEXTCONNECT_SECRET);
const incomingSecret = trim(payload.secret || payload['data[secret]']);
const fallbackRecipient = normalizePhone(vars.LAYLA_TEST_RECIPIENT || vars.SUPPORT_WHATSAPP || '');
const recipient = sender || (incomingSecret && webhookSecret && incomingSecret === webhookSecret ? fallbackRecipient : '');

if (!text) {
  return [{ json: { ok: true, ignored: 'empty_message', payload } }];
}

if (!recipient) {
  return [{ json: { ok: true, ignored: 'missing_sender', message: text, payload } }];
}

const intent = parseIntent(text);
const language = detectLanguage(text);
const siteContext = await fetchSiteContext.call(this);
const order = await fetchOrder.call(this, intent.orderId);
const aiReply = await callOpenAI.call(this, { text, sender: recipient, intent, siteContext, order, language });
const reply = compact(aiReply || fallbackReply({ language, intent, siteContext, order }), 1800);
const whatsappResult = await sendWhatsApp.call(this, recipient, reply);
const escalationResult = await sendEscalation.call(this, { sender: recipient, text, intent, reply });

return [
  {
    json: {
      ok: true,
      assistant: 'Layla AI',
      sender: recipient,
      text,
      intent,
      used_openai: Boolean(aiReply),
      used_order_context: Boolean(order),
      reply,
      whatsapp_result: whatsappResult,
      escalation_result: escalationResult,
    },
  },
];
