import { readFileSync } from 'fs';
import path from 'path';
import type { Pool } from 'pg';

type AiRole =
  | 'customer'
  | 'driver'
  | 'branch_manager'
  | 'cashier'
  | 'accountant'
  | 'operations_manager'
  | 'general_manager'
  | 'unknown';

type AiIntent =
  | 'price_inquiry'
  | 'branch_location'
  | 'opening_hours'
  | 'pickup_request'
  | 'delivery_request'
  | 'order_tracking'
  | 'complaint'
  | 'lost_item'
  | 'damage_claim'
  | 'payment_question'
  | 'service_question'
  | 'garment_care'
  | 'driver_update'
  | 'manager_report'
  | 'cash_deposit_followup'
  | 'machine_problem'
  | 'stock_problem'
  | 'employee_attendance'
  | 'unknown';

type AiChannel = 'whatsapp' | 'website' | 'telegram';
type MessageDirection = 'inbound' | 'outbound';

type AiServiceOptions = {
  sqlite: any;
  pgPool: Pool | null;
  usePostgres: boolean;
  env: NodeJS.ProcessEnv;
};

type RouteMessageInput = {
  channel?: AiChannel;
  from: string;
  to?: string;
  name?: string;
  messageText: string;
  messageType?: string;
  whatsappMessageId?: string;
};

type CreatePickupInput = {
  customer_name?: unknown;
  customer_phone?: unknown;
  branch_id?: unknown;
  address?: unknown;
  google_maps_url?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  preferred_time?: unknown;
  assigned_driver_phone?: unknown;
  notes?: unknown;
  created_by?: unknown;
};

type CreateComplaintInput = {
  customer_name?: unknown;
  customer_phone?: unknown;
  order_id?: unknown;
  branch_id?: unknown;
  complaint_type?: unknown;
  description?: unknown;
  priority?: unknown;
  assigned_to_phone?: unknown;
};

type PickupDraftSuggestion = {
  customer_name: string;
  customer_phone: string;
  area: string;
  address: string;
  google_maps_url: string;
  preferred_time: string;
  serviceType: string;
  notes: string;
  source_message: string;
  confidence: 'low' | 'medium' | 'high';
};

const AI_ALLOWED_INTENTS: AiIntent[] = [
  'price_inquiry',
  'branch_location',
  'opening_hours',
  'pickup_request',
  'delivery_request',
  'order_tracking',
  'complaint',
  'lost_item',
  'damage_claim',
  'payment_question',
  'service_question',
  'garment_care',
  'driver_update',
  'manager_report',
  'cash_deposit_followup',
  'machine_problem',
  'stock_problem',
  'employee_attendance',
  'unknown',
];

const PICKUP_STATUSES = new Set(['new', 'assigned', 'accepted', 'on_the_way', 'picked_up', 'cancelled', 'completed']);
const COMPLAINT_STATUSES = new Set(['new', 'assigned', 'investigating', 'waiting_customer', 'resolved', 'closed']);
const COMPLAINT_TYPES = new Set(['quality', 'delay', 'price', 'delivery', 'lost_item', 'damage', 'staff_behavior', 'other']);
const PRIORITIES = new Set(['low', 'normal', 'high', 'urgent']);
const AI_CONVERSATION_STATUSES = new Set(['open', 'pending', 'assigned', 'resolved', 'closed']);

const clamp = (value: unknown, max = 500) => {
  const text = String(value ?? '').trim();
  return text.length > max ? text.slice(0, max) : text;
};

const nullable = (value: unknown, max = 500) => {
  const text = clamp(value, max);
  return text || null;
};

const envFirst = (env: NodeJS.ProcessEnv, names: string[], fallback = '') => {
  for (const name of names) {
    const value = String(env[name] ?? '').trim();
    if (value) return value;
  }
  return fallback;
};

const numberOrNull = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const positiveInt = (value: unknown, fallback: number, max: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(Math.floor(parsed), max);
};

const firstNonEmpty = (...values: unknown[]) => {
  for (const value of values) {
    const text = String(value ?? '').trim();
    if (text) return text;
  }
  return '';
};

const normalizeMessageLine = (value: unknown) => String(value ?? '').replace(/\s+/g, ' ').trim();

const extractLabeledValue = (lines: string[], labels: string[]) => {
  for (const line of lines) {
    for (const label of labels) {
      const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const match = line.match(new RegExp(`(?:^|\\b)${escaped}\\s*[:：\\-ـ]?\\s*(.+)$`, 'i'));
      if (match?.[1]) return normalizeMessageLine(match[1]);
    }
  }
  return '';
};

const extractPickupDraftFromMessage = (
  messageRaw: unknown,
  options: {
    contactName?: unknown;
    contactPhone?: unknown;
    knownAreas?: string[];
  } = {}
): PickupDraftSuggestion => {
  const sourceMessage = clamp(messageRaw, 2500);
  const lines = sourceMessage
    .split(/\r?\n|[|؛]/)
    .map(normalizeMessageLine)
    .filter(Boolean);
  const compactText = normalizeMessageLine(sourceMessage);
  const linkMatch = compactText.match(/(?:https?:\/\/)?(?:maps\.app\.goo\.gl|goo\.gl\/maps|google\.com\/maps|maps\.google\.com)\/[^\s]+/i);
  const rawLink = linkMatch?.[0] ?? '';
  const googleMapsUrl = rawLink && !/^https?:\/\//i.test(rawLink) ? `https://${rawLink}` : rawLink;
  const knownAreas = (options.knownAreas ?? []).map((area) => normalizeMessageLine(area)).filter(Boolean);

  const areaFromLabel = extractLabeledValue(lines, ['area', 'zone', 'المنطقة', 'منطقة', 'الحي', 'حي']);
  const areaFromKnown =
    knownAreas.find((area) => compactText.toLowerCase().includes(area.toLowerCase())) ?? '';
  const addressFromLabel = extractLabeledValue(lines, [
    'address',
    'location',
    'pickup address',
    'العنوان',
    'عنوان',
    'الموقع',
    'موقع',
    'مكان الاستلام',
  ]);
  const addressFromText =
    lines.find((line) =>
      /(street|building|villa|flat|apartment|floor|near|شارع|بناية|مبنى|فيلا|شقة|طابق|قريب|جنب|خلف|أمام)/i.test(line)
    ) ?? '';
  const preferredTime =
    extractLabeledValue(lines, ['time', 'pickup time', 'slot', 'موعد', 'وقت', 'وقت الاستلام']) ||
    compactText.match(
      /\b(?:today|tomorrow|morning|evening|afternoon|tonight|after\s+\d+|[01]?\d|2[0-3])(?::[0-5]\d)?\s*(?:am|pm)?\b|(?:اليوم|بكرة|غدا|غداً|الصباح|المساء|بعد الظهر|الساعة\s*[٠-٩0-9: ]+)/i
    )?.[0] ||
    '';
  const serviceType =
    extractLabeledValue(lines, ['service', 'خدمة', 'الخدمة']) ||
    compactText.match(/wash\s*(?:and|&)?\s*iron|dry\s*clean|wash|iron|غسيل\s*وكي|غسيل|كوي|كي|تنظيف\s*جاف/i)?.[0] ||
    '';
  const customerName = extractLabeledValue(lines, ['name', 'customer', 'الاسم', 'اسمي', 'اسم العميل']);

  const filled = [
    firstNonEmpty(customerName, options.contactName),
    firstNonEmpty(areaFromLabel, areaFromKnown),
    firstNonEmpty(addressFromLabel, addressFromText),
    googleMapsUrl,
    preferredTime,
    serviceType,
  ].filter(Boolean).length;

  return {
    customer_name: clamp(firstNonEmpty(customerName, options.contactName), 150),
    customer_phone: normalizeAiPhone(options.contactPhone),
    area: clamp(firstNonEmpty(areaFromLabel, areaFromKnown), 150),
    address: clamp(firstNonEmpty(addressFromLabel, addressFromText), 1000),
    google_maps_url: clamp(googleMapsUrl, 1000),
    preferred_time: clamp(preferredTime, 120),
    serviceType: clamp(serviceType || 'WhatsApp pickup', 120),
    notes: sourceMessage ? `Auto extracted from WhatsApp: ${sourceMessage}` : '',
    source_message: sourceMessage,
    confidence: filled >= 4 ? 'high' : filled >= 2 ? 'medium' : 'low',
  };
};

export const normalizeAiPhone = (value: unknown) => {
  let digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('971') && digits.length >= 12) return digits;
  if (digits.startsWith('0') && digits.length === 10) return `971${digits.slice(1)}`;
  if (digits.startsWith('5') && digits.length === 9) return `971${digits}`;
  return digits;
};

export const detectLanguage = (text: unknown) => {
  const value = String(text ?? '');
  if (/[\u0600-\u06FF]/.test(value)) return 'ar';
  if (/[\u0750-\u077F]/.test(value)) return 'ur';
  return 'en';
};

export const detectIntent = (text: unknown): AiIntent => {
  const raw = String(text ?? '').trim();
  const lower = raw.toLowerCase();

  if (/^(accept|on the way|picked up|delivered|failed|location)\b/i.test(raw) || /(قبلت|في الطريق|تم الاستلام|تم التوصيل|فشل)/.test(raw)) {
    return 'driver_update';
  }
  if (/(price|cost|how much|rate|سعر|كم|بكم|تكلفة)/i.test(lower)) return 'price_inquiry';
  if (/(pickup|collect|استلام|استلم|تعال|خذ الملابس|book pickup)/i.test(lower)) return 'pickup_request';
  if (/(deliver|delivery|توصيل|وصل|استلام الطلب جاهز)/i.test(lower)) return 'delivery_request';
  if (/(track|status|order|invoice|رقم الطلب|تتبع|حالة الطلب|فاتورة|وين طلبي)/i.test(lower)) return 'order_tracking';
  if (/(complaint|complain|شكوى|زعلان|تأخير|تاخير|متأخر|bad service|مشكلة)/i.test(lower)) return 'complaint';
  if (/(lost|missing|ضائع|ضاعت|مفقود)/i.test(lower)) return 'lost_item';
  if (/(damage|damaged|burn|stain|تلف|خرب|محروق|بقعة)/i.test(lower)) return 'damage_claim';
  if (/(branch|location|map|address|فرع|موقع|عنوان|الخريطة)/i.test(lower)) return 'branch_location';
  if (/(open|hours|timing|دوام|مواعيد|ساعات|يفتح|يغلق)/i.test(lower)) return 'opening_hours';
  if (/(pay|payment|invoice|paid|دفع|مدفوع|حساب|فاتورة)/i.test(lower)) return 'payment_question';
  if (/(care|wash|iron|dry clean|laundry|غسيل|كوي|تنظيف|عناية)/i.test(lower)) return 'service_question';
  if (/(kandora|abaya|shirt|blanket|care|كندورة|عباية|قميص|بطانية)/i.test(lower)) return 'garment_care';
  if (/(today report|status|cash|machine issue|stock|attendance|تقرير اليوم|الكاش|عطل ماكينة|نقص|حضور)/i.test(lower)) {
    if (/(cash|الكاش|deposit|إيداع|ايداع)/i.test(lower)) return 'cash_deposit_followup';
    if (/(machine|ماكينة|عطل)/i.test(lower)) return 'machine_problem';
    if (/(stock|نقص|مخزون)/i.test(lower)) return 'stock_problem';
    if (/(attendance|حضور|دوام الموظفين)/i.test(lower)) return 'employee_attendance';
    return 'manager_report';
  }

  return 'unknown';
};

const migrationSql = (provider: 'sqlite' | 'postgres') =>
  readFileSync(
    path.resolve(
      process.cwd(),
      'database',
      'migrations',
      provider === 'postgres'
        ? '20260628_ai_operations_agent_phase1.postgres.sql'
        : '20260628_ai_operations_agent_phase1.sqlite.sql'
    ),
    'utf8'
  );

const buildReply = (intent: AiIntent, language: string, text: string, orderStatus?: any) => {
  const isArabic = language === 'ar' || language === 'ur';
  if (intent === 'price_inquiry') {
    return isArabic
      ? 'أكيد. الأسعار تعتمد على نوع القطعة والخدمة. من فضلك أرسل اسم القطعة ونوع الخدمة المطلوبة، وسأتحقق لك من السعر المسجل في النظام.'
      : 'Sure. Prices depend on the garment and service type. Please send the item name and required service, and I will check the registered system price.';
  }
  if (intent === 'pickup_request') {
    return isArabic
      ? 'أكيد، نرتب لك الاستلام. من فضلك أرسل الاسم، رقم الجوال، رابط الموقع أو العنوان، والوقت المناسب للاستلام.'
      : 'Sure, we can arrange pickup. Please send your name, mobile number, location link or address, and preferred pickup time.';
  }
  if (intent === 'complaint' || intent === 'lost_item' || intent === 'damage_claim') {
    return isArabic
      ? 'نعتذر عن ذلك. من فضلك أرسل رقم الطلب، رقم الجوال، ووصف المشكلة حتى نفتح تذكرة متابعة.'
      : 'Sorry to hear that. Please send the order number, mobile number, and a short description so we can open a follow-up ticket.';
  }
  if (intent === 'order_tracking') {
    if (orderStatus) {
      return isArabic
        ? `حالة الطلب ${orderStatus.order_id}: ${orderStatus.status}.`
        : `Order ${orderStatus.order_id} status: ${orderStatus.status}.`;
    }
    return isArabic
      ? 'من فضلك أرسل رقم الطلب أو رقم الفاتورة حتى أتحقق من الحالة.'
      : 'Please send the order number or invoice number so I can check the status.';
  }
  if (intent === 'branch_location') {
    return isArabic
      ? 'يمكنني مساعدتك بمواقع فروع In & Out Laundry. من فضلك أرسل المنطقة أو افتح صفحة الفروع في الموقع.'
      : 'I can help with In & Out Laundry branch locations. Please send your area or open the branches page on the website.';
  }
  if (intent === 'opening_hours') {
    return isArabic
      ? 'ساعات العمل تختلف حسب الفرع. من فضلك أرسل اسم الفرع أو المنطقة لأعطيك المعلومة الصحيحة.'
      : 'Opening hours can vary by branch. Please send the branch name or area so I can provide the correct information.';
  }
  if (intent === 'driver_update') {
    return isArabic
      ? 'تم استلام تحديث السائق. يرجى تضمين رقم المهمة مع الأمر عند الحاجة.'
      : 'Driver update received. Please include the task number with the command when needed.';
  }
  if (intent === 'manager_report') {
    return isArabic
      ? 'تم استلام تحديث الإدارة. يمكنك إرسال حالة الموظفين، الطلبات المتأخرة، الأعطال، المخزون، والشكاوى.'
      : 'Manager update received. You can send staff status, delayed orders, machine issues, stock issues, and complaints.';
  }
  if (/weather|football|movie|news|سياسة|طقس|كرة|فيلم/i.test(text)) {
    return isArabic
      ? 'أستطيع مساعدتك فقط في خدمات In & Out Laundry والطلبات والاستلام والتوصيل والأسعار والفروع والشكاوى.'
      : 'I can help you with In & Out Laundry services, orders, pickup, delivery, prices, branches, or complaints.';
  }
  return isArabic
    ? 'كيف أقدر أساعدك في خدمات In & Out Laundry؟ يمكنك طلب سعر، استلام، تتبع طلب، أو تسجيل شكوى.'
    : 'How can I help with In & Out Laundry? You can ask for prices, pickup, order tracking, or complaints.';
};

export const createAiOperationsService = ({ sqlite, pgPool, usePostgres, env }: AiServiceOptions) => {
  const query = async (sql: string, params: any[] = []) => {
    if (!usePostgres || !pgPool) return { rows: sqlite.prepare(sql).all(...params) };
    const result = await pgPool.query(sql, params);
    return { rows: result.rows };
  };

  const get = async (sql: string, params: any[] = []) => {
    if (!usePostgres || !pgPool) return sqlite.prepare(sql).get(...params);
    const result = await pgPool.query(sql, params);
    return result.rows[0];
  };

  const run = async (sqliteSql: string, pgSql: string, params: any[] = []) => {
    if (!usePostgres || !pgPool) return sqlite.prepare(sqliteSql).run(...params);
    return pgPool.query(pgSql, params);
  };

  const getCustomerSiteConfig = async () => {
    try {
      const row = await get(
        usePostgres ? 'SELECT payload FROM customer_site_config WHERE id = $1' : 'SELECT payload FROM customer_site_config WHERE id = ?',
        [1]
      );
      return row?.payload ? JSON.parse(String(row.payload)) : null;
    } catch {
      return null;
    }
  };

  const getKnownServiceAreas = async () => {
    const config = await getCustomerSiteConfig();
    return Array.isArray(config?.service_areas)
      ? config.service_areas
          .filter((area: any) => area?.active !== false)
          .map((area: any) => String(area?.name ?? area?.id ?? '').trim())
          .filter(Boolean)
      : [];
  };

  const detectContactRole = async (phone: string): Promise<AiRole> => {
    const normalized = normalizeAiPhone(phone);
    const managerMap: Array<[AiRole, string | undefined]> = [
      ['general_manager', env.GENERAL_MANAGER_PHONE],
      ['operations_manager', env.OPERATIONS_MANAGER_PHONE],
      ['accountant', env.ACCOUNTING_MANAGER_PHONE],
    ];
    for (const [role, configuredPhone] of managerMap) {
      if (configuredPhone && normalizeAiPhone(configuredPhone) === normalized) return role;
    }

    try {
      const customer = await get(
        usePostgres
          ? 'SELECT id FROM customer_users WHERE phone_normalized = $1 OR phone = $2 LIMIT 1'
          : 'SELECT id FROM customer_users WHERE phone_normalized = ? OR phone = ? LIMIT 1',
        [normalized.replace(/^971/, '0'), phone]
      );
      if (customer) return 'customer';
    } catch {
      // Customer table may not exist in isolated AI-only deployments.
    }

    try {
      const config = await getCustomerSiteConfig();
      const driver = Array.isArray(config?.drivers)
        ? config.drivers.find((item: any) => normalizeAiPhone(item?.phone) === normalized)
        : null;
      if (driver) return 'driver';
    } catch {
      // Optional website configuration.
    }

    return 'unknown';
  };

  const getOrCreateContact = async (phoneRaw: string, nameRaw?: string, language = 'auto') => {
    const phone = normalizeAiPhone(phoneRaw);
    if (!phone) throw new Error('A valid phone number is required.');
    const existing = await get(
      usePostgres ? 'SELECT * FROM ai_contacts WHERE phone = $1 LIMIT 1' : 'SELECT * FROM ai_contacts WHERE phone = ? LIMIT 1',
      [phone]
    );
    const detectedRole = await detectContactRole(phoneRaw);
    const name = nullable(nameRaw, 150);
    if (existing) {
      await run(
        `UPDATE ai_contacts
         SET name = COALESCE(?, name),
             role = CASE WHEN role = 'unknown' THEN ? ELSE role END,
             language = CASE WHEN language = 'auto' THEN ? ELSE language END,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        `UPDATE ai_contacts
         SET name = COALESCE($1, name),
             role = CASE WHEN role = 'unknown' THEN $2 ELSE role END,
             language = CASE WHEN language = 'auto' THEN $3 ELSE language END,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4`,
        [name, detectedRole, language, existing.id]
      );
      return { ...existing, name: name ?? existing.name, role: existing.role === 'unknown' ? detectedRole : existing.role };
    }

    if (!usePostgres || !pgPool) {
      const info = await run(
        `INSERT INTO ai_contacts (phone, name, role, language, created_at, updated_at)
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        '',
        [phone, name, detectedRole, language]
      );
      return get('SELECT * FROM ai_contacts WHERE id = ? LIMIT 1', [Number(info.lastInsertRowid)]);
    }

    const inserted = await pgPool.query(
      `INSERT INTO ai_contacts (phone, name, role, language, created_at, updated_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [phone, name, detectedRole, language]
    );
    return inserted.rows[0];
  };

  const getOrCreateConversation = async (contactId: number, channel: AiChannel, intent: AiIntent, priority = 'normal') => {
    const existing = await get(
      usePostgres
        ? `SELECT * FROM ai_conversations
           WHERE contact_id = $1 AND channel = $2 AND status NOT IN ('resolved', 'closed')
           ORDER BY updated_at DESC LIMIT 1`
        : `SELECT * FROM ai_conversations
           WHERE contact_id = ? AND channel = ? AND status NOT IN ('resolved', 'closed')
           ORDER BY datetime(updated_at) DESC LIMIT 1`,
      [contactId, channel]
    );
    if (existing) {
      await run(
        `UPDATE ai_conversations
         SET intent = ?, priority = ?, last_message_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        `UPDATE ai_conversations
         SET intent = $1, priority = $2, last_message_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [intent, priority, existing.id]
      );
      return { ...existing, intent, priority };
    }

    if (!usePostgres || !pgPool) {
      const info = await run(
        `INSERT INTO ai_conversations (contact_id, channel, status, intent, priority, last_message_at, created_at, updated_at)
         VALUES (?, ?, 'open', ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        '',
        [contactId, channel, intent, priority]
      );
      return get('SELECT * FROM ai_conversations WHERE id = ? LIMIT 1', [Number(info.lastInsertRowid)]);
    }

    const inserted = await pgPool.query(
      `INSERT INTO ai_conversations (contact_id, channel, status, intent, priority, last_message_at, created_at, updated_at)
       VALUES ($1, $2, 'open', $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [contactId, channel, intent, priority]
    );
    return inserted.rows[0];
  };

  const logMessage = async (params: {
    conversationId: number;
    direction: MessageDirection;
    senderPhone?: string;
    receiverPhone?: string;
    messageType?: string;
    messageText?: string;
    mediaUrl?: string;
    whatsappMessageId?: string;
    aiResponse?: boolean;
  }) => {
    await run(
      `INSERT INTO ai_messages (
        conversation_id, direction, sender_phone, receiver_phone, message_type, message_text,
        media_url, whatsapp_message_id, ai_response, created_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      `INSERT INTO ai_messages (
        conversation_id, direction, sender_phone, receiver_phone, message_type, message_text,
        media_url, whatsapp_message_id, ai_response, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)`,
      [
        params.conversationId,
        params.direction,
        params.senderPhone ?? null,
        params.receiverPhone ?? null,
        params.messageType ?? 'text',
        params.messageText ?? null,
        params.mediaUrl ?? null,
        params.whatsappMessageId ?? null,
        params.aiResponse ? 1 : 0,
      ]
    );
  };

  const trackOrder = async (orderIdRaw: unknown) => {
    const orderId = clamp(orderIdRaw, 80);
    if (!orderId) return null;
    try {
      const row = await get(
        usePostgres ? 'SELECT payload FROM customer_orders WHERE id = $1 LIMIT 1' : 'SELECT payload FROM customer_orders WHERE id = ? LIMIT 1',
        [orderId]
      );
      if (!row?.payload) return null;
      const payload = JSON.parse(String(row.payload));
      const total = Number(payload?.pos?.total ?? payload?.totalPrice ?? payload?.amount ?? 0) || 0;
      return {
        order_id: payload.id ?? orderId,
        customer_name: payload.customerName ?? payload.name ?? 'Customer',
        branch: payload.branch ?? payload.pos?.branch ?? null,
        status: payload.pos?.status ?? payload.status ?? 'unknown',
        total,
        paid: payload.paymentStatus === 'paid' || payload.pos?.payment_status === 'paid',
        expected_delivery: payload.expectedDelivery ?? payload.eta ?? payload.pos?.delivery_time ?? null,
      };
    } catch {
      return null;
    }
  };

  const routeIncomingMessage = async (input: RouteMessageInput) => {
    const channel = input.channel ?? 'whatsapp';
    const language = detectLanguage(input.messageText);
    const intent = detectIntent(input.messageText);
    const priority = intent === 'lost_item' || intent === 'damage_claim' ? 'urgent' : intent === 'complaint' ? 'high' : 'normal';
    const contact = await getOrCreateContact(input.from, input.name, language);
    const conversation = await getOrCreateConversation(Number(contact.id), channel, intent, priority);

    await logMessage({
      conversationId: Number(conversation.id),
      direction: 'inbound',
      senderPhone: normalizeAiPhone(input.from),
      receiverPhone: input.to ? normalizeAiPhone(input.to) : null,
      messageType: input.messageType ?? 'text',
      messageText: input.messageText,
      whatsappMessageId: input.whatsappMessageId,
    });

    const orderNumber = input.messageText.match(/\b[A-Z]{0,4}\d{3,}\b/i)?.[0];
    const orderStatus = intent === 'order_tracking' && orderNumber ? await trackOrder(orderNumber) : null;
    const responseText = buildReply(intent, language, input.messageText, orderStatus);

    await logMessage({
      conversationId: Number(conversation.id),
      direction: 'outbound',
      senderPhone: input.to ? normalizeAiPhone(input.to) : null,
      receiverPhone: normalizeAiPhone(input.from),
      messageType: 'text',
      messageText: responseText,
      aiResponse: true,
    });

    return {
      contact_id: Number(contact.id),
      conversation_id: Number(conversation.id),
      role: contact.role as AiRole,
      language,
      intent,
      priority,
      response: responseText,
      order_tracking: orderStatus,
    };
  };

  const sendWhatsAppText = async (toRaw: unknown, messageRaw: unknown) => {
    const to = normalizeAiPhone(toRaw);
    const message = clamp(messageRaw, 4096);
    if (!to || !message) throw new Error('WhatsApp recipient and message are required.');

    const token = envFirst(env, ['WHATSAPP_ACCESS_TOKEN', 'META_WHATSAPP_ACCESS_TOKEN']);
    const phoneNumberId = envFirst(env, ['WHATSAPP_PHONE_NUMBER_ID', 'META_WHATSAPP_PHONE_NUMBER_ID']);
    const version = envFirst(env, ['WHATSAPP_API_VERSION', 'META_WHATSAPP_API_VERSION'], 'v20.0') || 'v20.0';
    if (!token || !phoneNumberId) {
      throw new Error(
        'WhatsApp Cloud API is not configured. Set WHATSAPP_ACCESS_TOKEN/WHATSAPP_PHONE_NUMBER_ID or META_WHATSAPP_ACCESS_TOKEN/META_WHATSAPP_PHONE_NUMBER_ID.'
      );
    }

    const response = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: {
          preview_url: false,
          body: message,
        },
      }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(JSON.stringify(payload));
    }
    return payload;
  };

  const sendAndLogWhatsAppText = async (toRaw: unknown, messageRaw: unknown) => {
    const to = normalizeAiPhone(toRaw);
    const message = clamp(messageRaw, 4096);
    const contact = await getOrCreateContact(to, undefined, detectLanguage(message));
    const conversation = await getOrCreateConversation(Number(contact.id), 'whatsapp', detectIntent(message), 'normal');
    const providerResponse = await sendWhatsAppText(to, message);
    await logMessage({
      conversationId: Number(conversation.id),
      direction: 'outbound',
      senderPhone: normalizeAiPhone(envFirst(env, ['WHATSAPP_PHONE_NUMBER_ID', 'META_WHATSAPP_PHONE_NUMBER_ID'])),
      receiverPhone: to,
      messageType: 'text',
      messageText: message,
      whatsappMessageId: providerResponse?.messages?.[0]?.id,
      aiResponse: false,
    });
    return providerResponse;
  };

  const processWhatsappWebhook = async (body: any) => {
    const results: any[] = [];
    const entries = Array.isArray(body?.entry) ? body.entry : [];
    for (const entry of entries) {
      const changes = Array.isArray(entry?.changes) ? entry.changes : [];
      for (const change of changes) {
        const value = change?.value ?? {};
        const contactsByWaId = new Map<string, any>();
        for (const contact of Array.isArray(value.contacts) ? value.contacts : []) {
          contactsByWaId.set(String(contact?.wa_id ?? ''), contact);
        }
        for (const message of Array.isArray(value.messages) ? value.messages : []) {
          const from = String(message?.from ?? '').trim();
          if (!from) continue;
          const type = String(message?.type ?? 'text');
          const text =
            type === 'text'
              ? String(message?.text?.body ?? '').trim()
              : type === 'location'
                ? `Location: https://www.google.com/maps?q=${message?.location?.latitude},${message?.location?.longitude}`
                : `[${type} message]`;
          const contact = contactsByWaId.get(from);
          const routed = await routeIncomingMessage({
            channel: 'whatsapp',
            from,
            to: String(value?.metadata?.display_phone_number ?? value?.metadata?.phone_number_id ?? ''),
            name: contact?.profile?.name,
            messageText: text,
            messageType: type,
            whatsappMessageId: String(message?.id ?? ''),
          });
          let sendResult: any = null;
          try {
            sendResult = await sendWhatsAppText(from, routed.response);
          } catch (error: any) {
            sendResult = { error: error?.message || String(error) };
          }
          results.push({ from, intent: routed.intent, conversation_id: routed.conversation_id, send: sendResult });
        }
      }
    }
    return results;
  };

  const listAiConversations = async (filters: Record<string, unknown> = {}) => {
    const params: any[] = [];
    const addParam = (value: any) => {
      params.push(value);
      return usePostgres ? `$${params.length}` : '?';
    };
    const where: string[] = [];
    const status = clamp(filters.status, 40);
    const intent = clamp(filters.intent, 80);
    const q = clamp(filters.q, 120).toLowerCase();
    const limit = positiveInt(filters.limit, 80, 300);

    if (status && status !== 'all') {
      where.push(`c.status = ${addParam(status)}`);
    }
    if (intent && intent !== 'all') {
      where.push(`c.intent = ${addParam(intent)}`);
    }
    if (q) {
      const pattern = `%${q}%`;
      if (usePostgres) {
        where.push(
          `(ac.phone ILIKE ${addParam(pattern)} OR COALESCE(ac.name, '') ILIKE ${addParam(pattern)} OR COALESCE(c.intent, '') ILIKE ${addParam(pattern)})`
        );
      } else {
        where.push(
          `(LOWER(ac.phone) LIKE ${addParam(pattern)} OR LOWER(COALESCE(ac.name, '')) LIKE ${addParam(pattern)} OR LOWER(COALESCE(c.intent, '')) LIKE ${addParam(pattern)})`
        );
      }
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const limitSql = addParam(limit);
    const result = await query(
      usePostgres
        ? `SELECT
             c.*,
             ac.phone AS contact_phone,
             ac.name AS contact_name,
             ac.role AS contact_role,
             ac.language AS contact_language,
             (
               SELECT m.message_text
               FROM ai_messages m
               WHERE m.conversation_id = c.id
               ORDER BY m.created_at DESC, m.id DESC
               LIMIT 1
             ) AS last_message_text,
             (
               SELECT m.direction
               FROM ai_messages m
               WHERE m.conversation_id = c.id
               ORDER BY m.created_at DESC, m.id DESC
               LIMIT 1
             ) AS last_message_direction,
             (
               SELECT COUNT(*)
               FROM ai_messages m
               WHERE m.conversation_id = c.id
             )::int AS message_count
           FROM ai_conversations c
           JOIN ai_contacts ac ON ac.id = c.contact_id
           ${whereSql}
           ORDER BY COALESCE(c.last_message_at, c.updated_at, c.created_at) DESC, c.id DESC
           LIMIT ${limitSql}`
        : `SELECT
             c.*,
             ac.phone AS contact_phone,
             ac.name AS contact_name,
             ac.role AS contact_role,
             ac.language AS contact_language,
             (
               SELECT m.message_text
               FROM ai_messages m
               WHERE m.conversation_id = c.id
               ORDER BY datetime(m.created_at) DESC, m.id DESC
               LIMIT 1
             ) AS last_message_text,
             (
               SELECT m.direction
               FROM ai_messages m
               WHERE m.conversation_id = c.id
               ORDER BY datetime(m.created_at) DESC, m.id DESC
               LIMIT 1
             ) AS last_message_direction,
             (
               SELECT COUNT(*)
               FROM ai_messages m
               WHERE m.conversation_id = c.id
             ) AS message_count
           FROM ai_conversations c
           JOIN ai_contacts ac ON ac.id = c.contact_id
           ${whereSql}
           ORDER BY datetime(COALESCE(c.last_message_at, c.updated_at, c.created_at)) DESC, c.id DESC
           LIMIT ${limitSql}`,
      params
    );
    return result.rows;
  };

  const listAiConversationMessages = async (idRaw: unknown) => {
    const id = Number(idRaw);
    if (!Number.isFinite(id)) throw new Error('Valid conversation id is required.');
    const result = await query(
      usePostgres
        ? `SELECT * FROM ai_messages WHERE conversation_id = $1 ORDER BY created_at ASC, id ASC LIMIT 300`
        : `SELECT * FROM ai_messages WHERE conversation_id = ? ORDER BY datetime(created_at) ASC, id ASC LIMIT 300`,
      [id]
    );
    return result.rows;
  };

  const updateAiConversation = async (idRaw: unknown, input: Record<string, unknown>) => {
    const id = Number(idRaw);
    if (!Number.isFinite(id)) throw new Error('Valid conversation id is required.');
    const current = await get(usePostgres ? 'SELECT * FROM ai_conversations WHERE id = $1' : 'SELECT * FROM ai_conversations WHERE id = ?', [id]);
    if (!current) return null;
    const next = {
      status:
        input.status === undefined
          ? current.status
          : AI_CONVERSATION_STATUSES.has(String(input.status))
            ? String(input.status)
            : current.status,
      priority:
        input.priority === undefined
          ? current.priority
          : PRIORITIES.has(String(input.priority))
            ? String(input.priority)
            : current.priority,
      assigned_to_phone:
        input.assigned_to_phone === undefined
          ? current.assigned_to_phone
          : nullable(normalizeAiPhone(input.assigned_to_phone), 30),
    };
    await run(
      `UPDATE ai_conversations
       SET status = ?, priority = ?, assigned_to_phone = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      `UPDATE ai_conversations
       SET status = $1, priority = $2, assigned_to_phone = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [next.status, next.priority, next.assigned_to_phone, id]
    );
    return get(usePostgres ? 'SELECT * FROM ai_conversations WHERE id = $1' : 'SELECT * FROM ai_conversations WHERE id = ?', [id]);
  };

  const listPickupRequests = async () => {
    const result = await query(
      usePostgres
        ? 'SELECT * FROM pickup_requests ORDER BY created_at DESC LIMIT 200'
        : 'SELECT * FROM pickup_requests ORDER BY datetime(created_at) DESC LIMIT 200'
    );
    return result.rows;
  };

  const createPickupRequest = async (input: CreatePickupInput) => {
    const payload = {
      customer_name: nullable(input.customer_name, 150),
      customer_phone: nullable(normalizeAiPhone(input.customer_phone), 30),
      branch_id: numberOrNull(input.branch_id),
      address: nullable(input.address, 2000),
      google_maps_url: nullable(input.google_maps_url, 2000),
      latitude: numberOrNull(input.latitude),
      longitude: numberOrNull(input.longitude),
      preferred_time: nullable(input.preferred_time, 100),
      assigned_driver_phone: nullable(normalizeAiPhone(input.assigned_driver_phone), 30),
      notes: nullable(input.notes, 2000),
      created_by: ['ai', 'admin', 'customer'].includes(String(input.created_by ?? 'ai')) ? String(input.created_by ?? 'ai') : 'ai',
    };
    if (!payload.customer_phone && !payload.customer_name) throw new Error('customer_name or customer_phone is required.');

    if (!usePostgres || !pgPool) {
      const info = sqlite.prepare(
        `INSERT INTO pickup_requests (
          customer_name, customer_phone, branch_id, address, google_maps_url, latitude, longitude,
          preferred_time, status, assigned_driver_phone, notes, created_by, created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      ).run(
        payload.customer_name,
        payload.customer_phone,
        payload.branch_id,
        payload.address,
        payload.google_maps_url,
        payload.latitude,
        payload.longitude,
        payload.preferred_time,
        payload.assigned_driver_phone,
        payload.notes,
        payload.created_by
      );
      return get('SELECT * FROM pickup_requests WHERE id = ? LIMIT 1', [Number(info.lastInsertRowid)]);
    }

    const inserted = await pgPool.query(
      `INSERT INTO pickup_requests (
        customer_name, customer_phone, branch_id, address, google_maps_url, latitude, longitude,
        preferred_time, status, assigned_driver_phone, notes, created_by, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'new', $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        payload.customer_name,
        payload.customer_phone,
        payload.branch_id,
        payload.address,
        payload.google_maps_url,
        payload.latitude,
        payload.longitude,
        payload.preferred_time,
        payload.assigned_driver_phone,
        payload.notes,
        payload.created_by,
      ]
    );
    return inserted.rows[0];
  };

  const updatePickupRequest = async (idRaw: unknown, input: Record<string, unknown>) => {
    const id = Number(idRaw);
    if (!Number.isFinite(id)) throw new Error('Valid pickup id is required.');
    const current = await get(usePostgres ? 'SELECT * FROM pickup_requests WHERE id = $1' : 'SELECT * FROM pickup_requests WHERE id = ?', [id]);
    if (!current) return null;
    const next = {
      status: PICKUP_STATUSES.has(String(input.status ?? current.status)) ? String(input.status ?? current.status) : current.status,
      assigned_driver_phone:
        input.assigned_driver_phone === undefined ? current.assigned_driver_phone : nullable(normalizeAiPhone(input.assigned_driver_phone), 30),
      notes: input.notes === undefined ? current.notes : nullable(input.notes, 2000),
      preferred_time: input.preferred_time === undefined ? current.preferred_time : nullable(input.preferred_time, 100),
    };
    await run(
      `UPDATE pickup_requests
       SET status = ?, assigned_driver_phone = ?, notes = ?, preferred_time = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      `UPDATE pickup_requests
       SET status = $1, assigned_driver_phone = $2, notes = $3, preferred_time = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5`,
      [next.status, next.assigned_driver_phone, next.notes, next.preferred_time, id]
    );
    return get(usePostgres ? 'SELECT * FROM pickup_requests WHERE id = $1' : 'SELECT * FROM pickup_requests WHERE id = ?', [id]);
  };

  const listComplaints = async () => {
    const result = await query(
      usePostgres
        ? 'SELECT * FROM complaint_tickets ORDER BY created_at DESC LIMIT 200'
        : 'SELECT * FROM complaint_tickets ORDER BY datetime(created_at) DESC LIMIT 200'
    );
    return result.rows;
  };

  const createComplaint = async (input: CreateComplaintInput) => {
    const complaintType = COMPLAINT_TYPES.has(String(input.complaint_type ?? 'other')) ? String(input.complaint_type ?? 'other') : 'other';
    const priority = PRIORITIES.has(String(input.priority ?? 'normal')) ? String(input.priority ?? 'normal') : 'normal';
    const payload = {
      customer_name: nullable(input.customer_name, 150),
      customer_phone: nullable(normalizeAiPhone(input.customer_phone), 30),
      order_id: numberOrNull(input.order_id),
      branch_id: numberOrNull(input.branch_id),
      complaint_type: complaintType,
      description: nullable(input.description, 4000),
      priority,
      assigned_to_phone: nullable(normalizeAiPhone(input.assigned_to_phone), 30),
    };
    if (!payload.description) throw new Error('description is required.');

    if (!usePostgres || !pgPool) {
      const info = sqlite.prepare(
        `INSERT INTO complaint_tickets (
          customer_name, customer_phone, order_id, branch_id, complaint_type, description,
          priority, status, assigned_to_phone, created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, 'new', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      ).run(
        payload.customer_name,
        payload.customer_phone,
        payload.order_id,
        payload.branch_id,
        payload.complaint_type,
        payload.description,
        payload.priority,
        payload.assigned_to_phone
      );
      return get('SELECT * FROM complaint_tickets WHERE id = ? LIMIT 1', [Number(info.lastInsertRowid)]);
    }

    const inserted = await pgPool.query(
      `INSERT INTO complaint_tickets (
        customer_name, customer_phone, order_id, branch_id, complaint_type, description,
        priority, status, assigned_to_phone, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'new', $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        payload.customer_name,
        payload.customer_phone,
        payload.order_id,
        payload.branch_id,
        payload.complaint_type,
        payload.description,
        payload.priority,
        payload.assigned_to_phone,
      ]
    );
    return inserted.rows[0];
  };

  const updateComplaint = async (idRaw: unknown, input: Record<string, unknown>) => {
    const id = Number(idRaw);
    if (!Number.isFinite(id)) throw new Error('Valid complaint id is required.');
    const current = await get(usePostgres ? 'SELECT * FROM complaint_tickets WHERE id = $1' : 'SELECT * FROM complaint_tickets WHERE id = ?', [id]);
    if (!current) return null;
    const next = {
      status: COMPLAINT_STATUSES.has(String(input.status ?? current.status)) ? String(input.status ?? current.status) : current.status,
      priority: PRIORITIES.has(String(input.priority ?? current.priority)) ? String(input.priority ?? current.priority) : current.priority,
      assigned_to_phone:
        input.assigned_to_phone === undefined ? current.assigned_to_phone : nullable(normalizeAiPhone(input.assigned_to_phone), 30),
      resolution: input.resolution === undefined ? current.resolution : nullable(input.resolution, 4000),
    };
    await run(
      `UPDATE complaint_tickets
       SET status = ?, priority = ?, assigned_to_phone = ?, resolution = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      `UPDATE complaint_tickets
       SET status = $1, priority = $2, assigned_to_phone = $3, resolution = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5`,
      [next.status, next.priority, next.assigned_to_phone, next.resolution, id]
    );
    return get(usePostgres ? 'SELECT * FROM complaint_tickets WHERE id = $1' : 'SELECT * FROM complaint_tickets WHERE id = ?', [id]);
  };

  const getAiConversationActionContext = async (idRaw: unknown) => {
    const id = Number(idRaw);
    if (!Number.isFinite(id)) throw new Error('Valid conversation id is required.');
    return get(
      usePostgres
        ? `SELECT
             c.*,
             ac.phone AS contact_phone,
             ac.name AS contact_name,
             ac.role AS contact_role,
             (
               SELECT m.message_text
               FROM ai_messages m
               WHERE m.conversation_id = c.id AND m.direction = 'inbound'
               ORDER BY m.created_at DESC, m.id DESC
               LIMIT 1
             ) AS last_inbound_text
           FROM ai_conversations c
           JOIN ai_contacts ac ON ac.id = c.contact_id
           WHERE c.id = $1
           LIMIT 1`
        : `SELECT
             c.*,
             ac.phone AS contact_phone,
             ac.name AS contact_name,
             ac.role AS contact_role,
             (
               SELECT m.message_text
               FROM ai_messages m
               WHERE m.conversation_id = c.id AND m.direction = 'inbound'
               ORDER BY datetime(m.created_at) DESC, m.id DESC
               LIMIT 1
             ) AS last_inbound_text
           FROM ai_conversations c
           JOIN ai_contacts ac ON ac.id = c.contact_id
           WHERE c.id = ?
           LIMIT 1`,
      [id]
    );
  };

  const getPickupDraftForConversation = async (idRaw: unknown) => {
    const conversation = await getAiConversationActionContext(idRaw);
    if (!conversation) return null;
    const knownAreas = await getKnownServiceAreas();
    return extractPickupDraftFromMessage(conversation.last_inbound_text, {
      contactName: conversation.contact_name,
      contactPhone: conversation.contact_phone,
      knownAreas,
    });
  };

  const buildActionNote = (conversation: any, prefix: string, extra?: unknown) => {
    const parts = [
      `${prefix} from WhatsApp AI conversation #${conversation.id}.`,
      conversation.intent ? `Intent: ${conversation.intent}.` : '',
      conversation.last_inbound_text ? `Customer message: ${clamp(conversation.last_inbound_text, 1200)}` : '',
      clamp(extra, 700),
    ].filter(Boolean);
    return parts.join(' ');
  };

  const createPickupFromConversation = async (idRaw: unknown, input: Record<string, unknown> = {}) => {
    const conversation = await getAiConversationActionContext(idRaw);
    if (!conversation) return null;
    const draft = await getPickupDraftForConversation(idRaw);
    const pickup = await createPickupRequest({
      customer_name: firstNonEmpty(input.customer_name, draft?.customer_name, conversation.contact_name),
      customer_phone: firstNonEmpty(input.customer_phone, draft?.customer_phone, conversation.contact_phone),
      branch_id: input.branch_id ?? conversation.branch_id,
      address: firstNonEmpty(input.address, draft?.address),
      google_maps_url: firstNonEmpty(input.google_maps_url, draft?.google_maps_url),
      latitude: input.latitude,
      longitude: input.longitude,
      preferred_time: firstNonEmpty(input.preferred_time, draft?.preferred_time),
      assigned_driver_phone: input.assigned_driver_phone ?? conversation.assigned_to_phone,
      notes: buildActionNote(conversation, 'Pickup request created', firstNonEmpty(input.notes, draft?.notes)),
      created_by: 'admin',
    });
    await updateAiConversation(conversation.id, { status: 'assigned', priority: conversation.priority });
    return pickup;
  };

  const createComplaintFromConversation = async (idRaw: unknown, input: Record<string, unknown> = {}) => {
    const conversation = await getAiConversationActionContext(idRaw);
    if (!conversation) return null;
    const complaint = await createComplaint({
      customer_name: input.customer_name ?? conversation.contact_name,
      customer_phone: input.customer_phone ?? conversation.contact_phone,
      order_id: input.order_id,
      branch_id: input.branch_id ?? conversation.branch_id,
      complaint_type: input.complaint_type ?? 'other',
      description: input.description ?? buildActionNote(conversation, 'Complaint ticket opened', input.notes),
      priority: input.priority ?? conversation.priority ?? 'normal',
      assigned_to_phone: input.assigned_to_phone ?? conversation.assigned_to_phone,
    });
    await updateAiConversation(conversation.id, { status: 'assigned', priority: complaint.priority ?? conversation.priority });
    return complaint;
  };

  return {
    ensureSchema: async () => {
      if (!usePostgres || !pgPool) {
        sqlite.exec(migrationSql('sqlite'));
        return;
      }
      await pgPool.query(migrationSql('postgres'));
    },
    verifyWebhook: (queryParams: any) => {
      const mode = String(queryParams?.['hub.mode'] ?? '').trim();
      const token = String(queryParams?.['hub.verify_token'] ?? '').trim();
      const challenge = String(queryParams?.['hub.challenge'] ?? '').trim();
      const verifyToken = envFirst(env, ['WHATSAPP_VERIFY_TOKEN', 'META_WHATSAPP_VERIFY_TOKEN']);
      return mode === 'subscribe' && token && token === verifyToken
        ? challenge
        : null;
    },
    detectIntent,
    detectLanguage,
    routeIncomingMessage,
    processWhatsappWebhook,
    sendWhatsAppText,
    sendAndLogWhatsAppText,
    listAiConversations,
    listAiConversationMessages,
    getPickupDraftForConversation,
    updateAiConversation,
    createPickupFromConversation,
    createComplaintFromConversation,
    listPickupRequests,
    createPickupRequest,
    updatePickupRequest,
    listComplaints,
    createComplaint,
    updateComplaint,
    trackOrder,
  };
};
