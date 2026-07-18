import { readFileSync } from 'fs';
import { randomUUID } from 'crypto';
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
  correlationId?: string;
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

type DriverAssignmentInput = {
  pickup_request_id?: unknown;
  delivery_request_id?: unknown;
  task_type?: unknown;
  priority?: unknown;
  service_area?: unknown;
  branch_id?: unknown;
  created_by?: unknown;
};

type AiMessageAnalysis = {
  intent: AiIntent;
  language: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  pickup_draft: PickupDraftSuggestion;
  missing_fields: string[];
  ready_for_auto_create: boolean;
  reply: string;
  source: 'openai' | 'rules';
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

type RoutedMessageResult = {
  contact_id: number;
  conversation_id: number;
  correlation_id?: string;
  inbound_message_id?: number | null;
  outbound_message_id?: number | null;
  human_escalation_id?: number | null;
  role: AiRole;
  language: string;
  intent: AiIntent;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  response: string;
  order_tracking: any;
  ai_source: 'openai' | 'rules';
  pickup_draft: PickupDraftSuggestion;
  missing_fields: string[];
  auto_create_pickup: boolean;
  duplicate_message: boolean;
};

type WhatsappRoutedEvent = {
  from: string;
  to: string;
  text: string;
  type: string;
  routed: RoutedMessageResult;
};

type WhatsappRoutedActionResult = {
  responseOverride?: string;
  suppressReply?: boolean;
  automation?: Record<string, unknown>;
} | null;

type ProcessWhatsappWebhookOptions = {
  onRoutedMessage?: (event: WhatsappRoutedEvent) => Promise<WhatsappRoutedActionResult | void>;
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

const PICKUP_DRAFT_FIELDS: Array<keyof PickupDraftSuggestion> = [
  'customer_name',
  'customer_phone',
  'area',
  'address',
  'google_maps_url',
  'preferred_time',
  'serviceType',
  'notes',
  'source_message',
];

const PICKUP_STATUSES = new Set([
  'new',
  'assigned',
  'accepted',
  'on_the_way',
  'arrived',
  'picked_up',
  'customer_unavailable',
  'failed',
  'cancelled',
  'completed',
]);
const COMPLAINT_STATUSES = new Set(['new', 'assigned', 'investigating', 'waiting_customer', 'resolved', 'closed']);
const COMPLAINT_TYPES = new Set(['quality', 'delay', 'price', 'delivery', 'lost_item', 'damage', 'staff_behavior', 'other']);
const PRIORITIES = new Set(['low', 'normal', 'high', 'urgent']);
const AI_CONVERSATION_STATUSES = new Set(['open', 'pending', 'assigned', 'resolved', 'closed']);
const ACTIVE_DRIVER_ASSIGNMENT_STATUSES = new Set(['assigned', 'accepted', 'on_the_way', 'arrived']);
const DRIVER_ASSIGNMENT_STATUSES = new Set([
  'assigned',
  'accepted',
  'on_the_way',
  'arrived',
  'picked_up',
  'delivered',
  'customer_unavailable',
  'failed',
  'cancelled',
]);
const DRIVER_AVAILABLE_STATUSES = new Set(['online', 'available', 'busy']);

const DRIVER_ASSIGNMENT_TRANSITIONS: Record<string, string[]> = {
  assigned: ['accepted', 'failed', 'cancelled'],
  accepted: ['on_the_way', 'cancelled'],
  on_the_way: ['arrived', 'customer_unavailable', 'cancelled'],
  arrived: ['picked_up', 'delivered', 'cancelled'],
  customer_unavailable: ['assigned', 'cancelled'],
  picked_up: [],
  delivered: [],
  failed: [],
  cancelled: [],
};

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

const jsonPayload = (value: unknown) => JSON.stringify(value ?? {});

const createCorrelationId = () => `corr_${randomUUID()}`;

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

const isUsefulCustomerName = (value: unknown) => {
  const text = String(value ?? '').trim();
  if (text.length < 2) return false;
  if (!/[A-Za-z\u0600-\u06FF]/.test(text)) return false;
  if (/^(customer|user|unknown|guest|عميل|مستخدم)$/i.test(text)) return false;
  return true;
};

const firstUsefulCustomerName = (...values: unknown[]) => {
  for (const value of values) {
    const text = String(value ?? '').trim();
    if (isUsefulCustomerName(text)) return text;
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
    firstUsefulCustomerName(customerName, options.contactName),
    firstNonEmpty(areaFromLabel, areaFromKnown),
    firstNonEmpty(addressFromLabel, addressFromText),
    googleMapsUrl,
    preferredTime,
    serviceType,
  ].filter(Boolean).length;

  return {
    customer_name: clamp(firstUsefulCustomerName(customerName, options.contactName), 150),
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

const emptyPickupDraft = (sourceMessage = ''): PickupDraftSuggestion => ({
  customer_name: '',
  customer_phone: '',
  area: '',
  address: '',
  google_maps_url: '',
  preferred_time: '',
  serviceType: 'WhatsApp pickup',
  notes: sourceMessage ? `Auto extracted from WhatsApp: ${sourceMessage}` : '',
  source_message: sourceMessage,
  confidence: 'low',
});

const mergePickupDrafts = (primary: Partial<PickupDraftSuggestion>, fallback: PickupDraftSuggestion): PickupDraftSuggestion => {
  const merged: any = { ...fallback };
  for (const field of PICKUP_DRAFT_FIELDS) {
    const value = String(primary[field] ?? '').trim();
    if (value) merged[field] = value;
  }
  const confidence = String(primary.confidence ?? fallback.confidence ?? 'low');
  merged.confidence = confidence === 'high' || confidence === 'medium' || confidence === 'low' ? confidence : fallback.confidence;
  if (!merged.serviceType) merged.serviceType = 'WhatsApp pickup';
  if (!merged.source_message) merged.source_message = fallback.source_message;
  return merged as PickupDraftSuggestion;
};

const parseAiJsonObject = (value: unknown) => {
  const text = String(value ?? '').trim();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
};

const extractResponsesOutputText = (payload: any) => {
  const direct = String(payload?.output_text ?? '').trim();
  if (direct) return direct;
  const chunks: string[] = [];
  for (const output of Array.isArray(payload?.output) ? payload.output : []) {
    for (const content of Array.isArray(output?.content) ? output.content : []) {
      const text = String(content?.text ?? '').trim();
      if (text) chunks.push(text);
    }
  }
  return chunks.join('\n').trim();
};

const pickupDraftHasMinimumData = (draft: PickupDraftSuggestion) => {
  return Boolean(draft.customer_phone && isUsefulCustomerName(draft.customer_name));
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

const getAiPhoneVariants = (value: unknown) => {
  const normalized = normalizeAiPhone(value);
  const digits = String(value ?? '').replace(/\D/g, '');
  const variants = new Set<string>();
  if (digits) variants.add(digits.startsWith('00') ? digits.slice(2) : digits);
  if (normalized) {
    variants.add(normalized);
    if (normalized.startsWith('971') && normalized.length === 12) {
      variants.add(`0${normalized.slice(3)}`);
      variants.add(normalized.slice(3));
    }
  }
  return Array.from(variants).filter(Boolean);
};

const getOrderPhoneCandidates = (payload: any) => {
  const values = [
    payload?.customerPhoneNormalized,
    payload?.customerPhone,
    payload?.phoneNumber,
    payload?.phone,
    payload?.mobile,
    payload?.customer_mobile,
    payload?.pos?.customer_phone,
    payload?.pos?.phone,
    payload?.pos?.mobile,
  ];
  return Array.from(new Set(values.flatMap(getAiPhoneVariants))).filter(Boolean);
};

const isOrderPhoneAuthorized = (payload: any, requesterPhoneRaw: unknown) => {
  const requesterVariants = new Set(getAiPhoneVariants(requesterPhoneRaw));
  if (!requesterVariants.size) return false;
  return getOrderPhoneCandidates(payload).some((candidate) => requesterVariants.has(candidate));
};

const normalizeDispatchText = (value: unknown) =>
  String(value ?? '')
    .toLowerCase()
    .replace(/[إأآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const dispatchTextMatches = (source: unknown, target: unknown) => {
  const left = normalizeDispatchText(source);
  const right = normalizeDispatchText(target);
  if (!left || !right) return false;
  return left.includes(right) || right.includes(left);
};

const normalizeDriverAssignmentStatus = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

const maskAiPhone = (value: unknown) => {
  const digits = normalizeAiPhone(value);
  if (!digits) return '*****';
  return `${'*'.repeat(Math.max(5, digits.length - 3))}${digits.slice(-3)}`;
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
  if (/(lost|missing|ضائع|ضاعت|مفقود)/i.test(lower)) return 'lost_item';
  if (/(damage|damaged|burn|stain|تلف|خرب|محروق|بقعة)/i.test(lower)) return 'damage_claim';
  if (/(complaint|complain|شكوى|زعلان|تأخير|تاخير|متأخر|bad service|مشكلة)/i.test(lower)) return 'complaint';
  if (/(track|status|order|invoice|رقم الطلب|تتبع|حالة الطلب|فاتورة|وين طلبي)/i.test(lower)) return 'order_tracking';
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

const AI_MIGRATIONS = [
  {
    sqlite: '20260628_ai_operations_agent_phase1.sqlite.sql',
    postgres: '20260628_ai_operations_agent_phase1.postgres.sql',
  },
  {
    sqlite: '20260717_ai_customer_service_agent_foundation.sqlite.sql',
    postgres: '20260717_ai_customer_service_agent_foundation.postgres.sql',
  },
  {
    sqlite: '20260718_n8n_live_adapter.sqlite.sql',
    postgres: '20260718_n8n_live_adapter.postgres.sql',
  },
];

const migrationSql = (provider: 'sqlite' | 'postgres') =>
  AI_MIGRATIONS.map((migration) =>
    readFileSync(
      path.resolve(process.cwd(), 'database', 'migrations', provider === 'postgres' ? migration.postgres : migration.sqlite),
      'utf8'
    )
  ).join('\n\n');

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
      if (orderStatus.authorization === 'verification_required') {
        return isArabic
          ? 'لحماية بياناتك، أحتاج أتأكد من ملكية الطلب قبل عرض حالته. من فضلك أرسل رقم الهاتف المسجل على الطلب أو آخر 4 أرقام منه.'
          : 'To protect customer privacy, I need to verify ownership before sharing this order status. Please send the phone number registered on the order, or its last 4 digits.';
      }
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
  const openAiKey = envFirst(env, ['OPENAI_API_KEY']);
  const openAiModel = envFirst(env, ['OPENAI_MODEL'], 'gpt-4.1-mini') || 'gpt-4.1-mini';
  const openAiBaseUrl = envFirst(env, ['OPENAI_BASE_URL'], 'https://api.openai.com') || 'https://api.openai.com';
  const autoCreatePickups = !/^(0|false|no)$/i.test(envFirst(env, ['AI_AGENT_AUTO_CREATE_PICKUPS'], 'true'));

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

  const getConfiguredDispatchData = async () => {
    const config = await getCustomerSiteConfig();
    const drivers = Array.isArray(config?.drivers) ? config.drivers : [];
    const serviceAreas = Array.isArray(config?.service_areas) ? config.service_areas : [];
    return { drivers, serviceAreas };
  };

  const resolveServiceAreaForDispatch = (source: unknown, serviceAreas: any[]) => {
    const sourceText = String(source ?? '').trim();
    if (!sourceText) return null;
    const activeAreas = serviceAreas.filter((area) => area?.active !== false);
    return (
      activeAreas.find((area) => dispatchTextMatches(sourceText, area?.name) || dispatchTextMatches(sourceText, area?.id)) ??
      null
    );
  };

  const getDriverActiveTaskCounts = async (): Promise<Map<string, number>> => {
    const result = await query(
      usePostgres
        ? `SELECT driver_phone, COUNT(*)::int AS count
           FROM driver_assignments
           WHERE status IN ('assigned', 'accepted', 'on_the_way', 'arrived')
             AND driver_phone IS NOT NULL
           GROUP BY driver_phone`
        : `SELECT driver_phone, COUNT(*) AS count
           FROM driver_assignments
           WHERE status IN ('assigned', 'accepted', 'on_the_way', 'arrived')
             AND driver_phone IS NOT NULL
           GROUP BY driver_phone`
    );
    return new Map<string, number>(
      result.rows.map((row: any) => [normalizeAiPhone(row.driver_phone), Number(row.count ?? 0)])
    );
  };

  const rankDispatchDrivers = async (params: {
    serviceArea?: any;
    branchId?: unknown;
    sourceText?: unknown;
    priority?: unknown;
  }) => {
    const { drivers } = await getConfiguredDispatchData();
    const workload = await getDriverActiveTaskCounts();
    const serviceAreaName = String(params.serviceArea?.name ?? params.serviceArea?.id ?? params.sourceText ?? '').trim();
    const serviceAreaBranch = String(params.serviceArea?.branch_id ?? '').trim();
    const requestedBranch = String(params.branchId ?? '').trim();
    const candidates = drivers
      .map((driver: any) => {
        const phone = normalizeAiPhone(driver?.phone);
        const status = String(driver?.status ?? '').toLowerCase().trim();
        if (!phone || !DRIVER_AVAILABLE_STATUSES.has(status)) return null;
        const driverAreas = Array.isArray(driver?.service_areas) ? driver.service_areas : [];
        const areaMatch = driverAreas.some(
          (area: unknown) =>
            dispatchTextMatches(area, serviceAreaName) ||
            dispatchTextMatches(area, params.serviceArea?.id) ||
            dispatchTextMatches(area, params.sourceText)
        );
        const branchMatch =
          Boolean(requestedBranch) &&
          (dispatchTextMatches(driver?.branch_id, requestedBranch) || dispatchTextMatches(driver?.branch, requestedBranch));
        const areaBranchMatch =
          Boolean(serviceAreaBranch) &&
          (dispatchTextMatches(driver?.branch_id, serviceAreaBranch) || dispatchTextMatches(driver?.branch, serviceAreaBranch));
        const currentTasks = workload.get(phone) ?? 0;
        const score =
          (areaMatch ? 100 : 0) +
          (branchMatch || areaBranchMatch ? 35 : 0) +
          (status === 'available' ? 20 : status === 'online' ? 15 : 5) -
          currentTasks * 12 +
          (String(params.priority ?? '') === 'urgent' ? 5 : 0);
        return {
          driver,
          phone,
          status,
          areaMatch,
          branchMatch: branchMatch || areaBranchMatch,
          currentTasks,
          score,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.score - a.score || a.currentTasks - b.currentTasks || String(a.driver?.id ?? '').localeCompare(String(b.driver?.id ?? '')));
    return candidates as Array<{
      driver: any;
      phone: string;
      status: string;
      areaMatch: boolean;
      branchMatch: boolean;
      currentTasks: number;
      score: number;
    }>;
  };

  const getActiveDriverAssignmentForTask = async (taskType: string, taskId: number) => {
    if (!taskId) return null;
    const column = taskType === 'delivery' ? 'delivery_request_id' : 'pickup_request_id';
    return get(
      usePostgres
        ? `SELECT * FROM driver_assignments
           WHERE ${column} = $1 AND status IN ('assigned', 'accepted', 'on_the_way', 'arrived')
           ORDER BY created_at DESC LIMIT 1`
        : `SELECT * FROM driver_assignments
           WHERE ${column} = ? AND status IN ('assigned', 'accepted', 'on_the_way', 'arrived')
           ORDER BY datetime(created_at) DESC LIMIT 1`,
      [taskId]
    );
  };

  const recordAiToolCallStarted = async (params: {
    correlationId: string;
    toolName: string;
    intent?: string;
    idempotencyKey?: string;
    requestPayload?: unknown;
  }) => {
    const payload = jsonPayload(params.requestPayload ?? {});
    if (!usePostgres || !pgPool) {
      const info = sqlite.prepare(
        `INSERT INTO ai_tool_calls (
          correlation_id, tool_name, intent, status, idempotency_key, request_payload, started_at, created_at
        ) VALUES (?, ?, ?, 'started', ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      ).run(
        params.correlationId,
        params.toolName,
        params.intent ?? null,
        params.idempotencyKey ?? null,
        payload
      );
      return Number(info.lastInsertRowid);
    }
    const inserted = await pgPool.query(
      `INSERT INTO ai_tool_calls (
        correlation_id, tool_name, intent, status, idempotency_key, request_payload, started_at, created_at
      ) VALUES ($1, $2, $3, 'started', $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id`,
      [
        params.correlationId,
        params.toolName,
        params.intent ?? null,
        params.idempotencyKey ?? null,
        payload,
      ]
    );
    return Number(inserted.rows?.[0]?.id ?? 0) || null;
  };

  const completeAiToolCall = async (idRaw: unknown, params: {
    status: 'succeeded' | 'failed';
    intent?: string;
    responsePayload?: unknown;
    errorCode?: string;
    errorMessage?: string;
  }) => {
    const id = Number(idRaw);
    if (!Number.isFinite(id) || id <= 0) return;
    const payload = jsonPayload(params.responsePayload ?? {});
    if (!usePostgres || !pgPool) {
      sqlite.prepare(
        `UPDATE ai_tool_calls
         SET status = ?, intent = COALESCE(?, intent), response_payload = ?,
             error_code = ?, error_message = ?, completed_at = CURRENT_TIMESTAMP
         WHERE id = ?`
      ).run(
        params.status,
        params.intent ?? null,
        payload,
        params.errorCode ?? null,
        params.errorMessage ?? null,
        id
      );
      return;
    }
    await pgPool.query(
      `UPDATE ai_tool_calls
       SET status = $1, intent = COALESCE($2, intent), response_payload = $3,
           error_code = $4, error_message = $5, completed_at = CURRENT_TIMESTAMP
       WHERE id = $6`,
      [
        params.status,
        params.intent ?? null,
        payload,
        params.errorCode ?? null,
        params.errorMessage ?? null,
        id,
      ]
    );
  };

  const openAiAnalysisSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      intent: { type: 'string', enum: AI_ALLOWED_INTENTS },
      language: { type: 'string', enum: ['ar', 'en', 'ur', 'hi', 'tl', 'auto'] },
      priority: { type: 'string', enum: ['low', 'normal', 'high', 'urgent'] },
      pickup_draft: {
        type: 'object',
        additionalProperties: false,
        properties: {
          customer_name: { type: 'string' },
          customer_phone: { type: 'string' },
          area: { type: 'string' },
          address: { type: 'string' },
          google_maps_url: { type: 'string' },
          preferred_time: { type: 'string' },
          serviceType: { type: 'string' },
          notes: { type: 'string' },
          confidence: { type: 'string', enum: ['low', 'medium', 'high'] },
        },
        required: [
          'customer_name',
          'customer_phone',
          'area',
          'address',
          'google_maps_url',
          'preferred_time',
          'serviceType',
          'notes',
          'confidence',
        ],
      },
      missing_fields: {
        type: 'array',
        items: { type: 'string' },
      },
      ready_for_auto_create: { type: 'boolean' },
      reply: { type: 'string' },
    },
    required: ['intent', 'language', 'priority', 'pickup_draft', 'missing_fields', 'ready_for_auto_create', 'reply'],
  };

  const analyzeMessageWithOpenAi = async (params: {
    text: string;
    contactName?: unknown;
    contactPhone?: unknown;
    knownAreas: string[];
    fallbackDraft: PickupDraftSuggestion;
    correlationId: string;
  }): Promise<AiMessageAnalysis | null> => {
    if (!openAiKey) return null;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    const toolCallId = await recordAiToolCallStarted({
      correlationId: params.correlationId,
      toolName: 'openai.responses.customer_message_analysis',
      idempotencyKey: `openai-analysis:${params.correlationId}`,
      requestPayload: {
        model: openAiModel,
        message_length: String(params.text ?? '').length,
        contact_phone_masked: maskAiPhone(params.contactPhone),
        known_area_count: params.knownAreas.length,
      },
    });
    try {
      const response = await fetch(`${openAiBaseUrl.replace(/\/+$/, '')}/v1/responses`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${openAiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: openAiModel,
          temperature: 0.1,
          max_output_tokens: 900,
          input: [
            {
              role: 'system',
              content:
                'You are a natural WhatsApp operations AI for In & Out Laundry in UAE. Classify messages and extract pickup details. Never invent prices, order status, POS data, branch coverage, customer records, or missing customer data. Resolve high-risk lost/damaged items before generic order tracking. A pickup can be auto-created only when WhatsApp phone and a clear customer name are available. If customer name is missing or unclear, ask only for the name. Use Arabic for Arabic/Urdu messages and English for English messages. Keep replies short and customer-friendly.',
            },
            {
              role: 'user',
              content: JSON.stringify({
                allowed_intents: AI_ALLOWED_INTENTS,
                schema: {
                  intent: 'one allowed intent',
                  language: 'ar | en | ur',
                  priority: 'low | normal | high | urgent',
                  pickup_draft: {
                    customer_name: 'string',
                    customer_phone: 'string',
                    area: 'string',
                    address: 'string',
                    google_maps_url: 'string',
                    preferred_time: 'string',
                    serviceType: 'string',
                    notes: 'string',
                    confidence: 'low | medium | high',
                  },
                  missing_fields: ['field names needed before auto create'],
                  ready_for_auto_create: 'boolean; true only when customer_phone and customer_name are available',
                  reply: 'short helpful WhatsApp reply',
                },
                known_service_areas: params.knownAreas,
                contact_name: params.contactName ?? '',
                contact_phone: params.contactPhone ?? '',
                message: params.text,
              }),
            },
          ],
          text: {
            format: {
              type: 'json_schema',
              name: 'laundry_customer_message_analysis',
              strict: true,
              schema: openAiAnalysisSchema,
            },
          },
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(JSON.stringify(payload));
      const parsed = parseAiJsonObject(extractResponsesOutputText(payload));
      if (!parsed || typeof parsed !== 'object') return null;
      const rawIntent = String((parsed as any).intent ?? '').trim() as AiIntent;
      const intent = AI_ALLOWED_INTENTS.includes(rawIntent) ? rawIntent : detectIntent(params.text);
      const rawPriority = String((parsed as any).priority ?? '').trim();
      const priority: AiMessageAnalysis['priority'] =
        rawPriority === 'low' || rawPriority === 'normal' || rawPriority === 'high' || rawPriority === 'urgent'
          ? rawPriority
          : intent === 'lost_item' || intent === 'damage_claim'
            ? 'urgent'
            : intent === 'complaint'
              ? 'high'
              : 'normal';
      const aiDraft = mergePickupDrafts((parsed as any).pickup_draft ?? {}, params.fallbackDraft);
      const missingFields = Array.isArray((parsed as any).missing_fields)
        ? (parsed as any).missing_fields.map((field: unknown) => clamp(field, 60)).filter(Boolean)
        : [];
      const readyByAi = Boolean((parsed as any).ready_for_auto_create);
      const result: AiMessageAnalysis = {
        intent,
        language: clamp((parsed as any).language, 12) || detectLanguage(params.text),
        priority,
        pickup_draft: aiDraft,
        missing_fields: missingFields,
        ready_for_auto_create: readyByAi && pickupDraftHasMinimumData(aiDraft),
        reply: clamp((parsed as any).reply, 1200),
        source: 'openai',
      };
      await completeAiToolCall(toolCallId, {
        status: 'succeeded',
        intent,
        responsePayload: {
          response_id: payload?.id ?? null,
          intent,
          language: result.language,
          priority,
          missing_fields: missingFields,
          ready_for_auto_create: result.ready_for_auto_create,
          usage: payload?.usage ?? null,
        },
      });
      return result;
    } catch (error: any) {
      await completeAiToolCall(toolCallId, {
        status: 'failed',
        responsePayload: {},
        errorCode: error?.name === 'AbortError' ? 'OPENAI_TIMEOUT' : 'OPENAI_ANALYSIS_FAILED',
        errorMessage: error?.message || String(error),
      });
      console.warn('OpenAI AI router failed; falling back to rules:', error?.message || error);
      return null;
    } finally {
      clearTimeout(timer);
    }
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
    const values = [
      params.conversationId,
      params.direction,
      params.senderPhone ?? null,
      params.receiverPhone ?? null,
      params.messageType ?? 'text',
      params.messageText ?? null,
      params.mediaUrl ?? null,
      params.whatsappMessageId ?? null,
      params.aiResponse ? 1 : 0,
    ];
    if (!usePostgres || !pgPool) {
      const info = sqlite.prepare(
        `INSERT INTO ai_messages (
          conversation_id, direction, sender_phone, receiver_phone, message_type, message_text,
          media_url, whatsapp_message_id, ai_response, created_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
      ).run(...values);
      return Number(info.lastInsertRowid);
    }
    const inserted = await pgPool.query(
      `INSERT INTO ai_messages (
        conversation_id, direction, sender_phone, receiver_phone, message_type, message_text,
        media_url, whatsapp_message_id, ai_response, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
       RETURNING id`,
      values
    );
    return Number(inserted.rows?.[0]?.id ?? 0) || null;
  };

  const upsertCustomerChannelLink = async (params: {
    contactId: number;
    channel: AiChannel;
    channelUserId: string;
    normalizedPhone: string;
    source?: string;
  }) => {
    const channelUserId = clamp(params.channelUserId, 120);
    const normalizedPhone = normalizeAiPhone(params.normalizedPhone || params.channelUserId);
    if (!params.contactId || !channelUserId) return null;
    const metadata = jsonPayload({
      source: params.source ?? 'ai_agent',
      normalized_phone: normalizedPhone,
      phone_masked: maskAiPhone(normalizedPhone),
    });

    if (!usePostgres || !pgPool) {
      sqlite.prepare(
        `INSERT INTO customer_channel_links (
          contact_id, channel, channel_user_id, normalized_phone, is_primary, verification_status,
          verified_at, metadata, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 1, 'channel_verified', CURRENT_TIMESTAMP, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT(channel, channel_user_id) DO UPDATE SET
          contact_id = excluded.contact_id,
          normalized_phone = excluded.normalized_phone,
          is_primary = 1,
          verification_status = 'channel_verified',
          verified_at = CURRENT_TIMESTAMP,
          metadata = excluded.metadata,
          updated_at = CURRENT_TIMESTAMP`
      ).run(params.contactId, params.channel, channelUserId, normalizedPhone, metadata);
      return get(
        'SELECT * FROM customer_channel_links WHERE channel = ? AND channel_user_id = ? LIMIT 1',
        [params.channel, channelUserId]
      );
    }

    const result = await pgPool.query(
      `INSERT INTO customer_channel_links (
        contact_id, channel, channel_user_id, normalized_phone, is_primary, verification_status,
        verified_at, metadata, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, TRUE, 'channel_verified', CURRENT_TIMESTAMP, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(channel, channel_user_id) DO UPDATE SET
        contact_id = EXCLUDED.contact_id,
        normalized_phone = EXCLUDED.normalized_phone,
        is_primary = TRUE,
        verification_status = 'channel_verified',
        verified_at = CURRENT_TIMESTAMP,
        metadata = EXCLUDED.metadata,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *`,
      [params.contactId, params.channel, channelUserId, normalizedPhone, metadata]
    );
    return result.rows[0] ?? null;
  };

  const upsertConversationSummary = async (params: {
    conversationId: number;
    contactId: number;
    summary: string;
    language: string;
    intent: AiIntent;
    sourceMessageId?: number | null;
    humanEscalationId?: number | null;
  }) => {
    const summary = clamp(params.summary, 1800);
    if (!summary) return null;
    const values = [
      summary,
      params.language,
      params.intent,
      params.humanEscalationId ?? null,
      params.sourceMessageId ?? null,
      params.conversationId,
    ];

    if (!usePostgres || !pgPool) {
      const info = sqlite.prepare(
        `UPDATE conversation_summaries
         SET summary = ?, detected_language = ?, last_intent = ?, human_escalation_id = COALESCE(?, human_escalation_id),
             source_message_id = COALESCE(?, source_message_id), updated_at = CURRENT_TIMESTAMP
         WHERE conversation_id = ? AND deleted_at IS NULL`
      ).run(...values);
      if (info.changes === 0) {
        const inserted = sqlite.prepare(
          `INSERT INTO conversation_summaries (
            conversation_id, contact_id, summary, detected_language, last_intent, human_escalation_id,
            source_message_id, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
        ).run(
          params.conversationId,
          params.contactId,
          summary,
          params.language,
          params.intent,
          params.humanEscalationId ?? null,
          params.sourceMessageId ?? null
        );
        return get('SELECT * FROM conversation_summaries WHERE id = ? LIMIT 1', [Number(inserted.lastInsertRowid)]);
      }
      return get(
        'SELECT * FROM conversation_summaries WHERE conversation_id = ? AND deleted_at IS NULL LIMIT 1',
        [params.conversationId]
      );
    }

    const updated = await pgPool.query(
      `UPDATE conversation_summaries
       SET summary = $1, detected_language = $2, last_intent = $3, human_escalation_id = COALESCE($4, human_escalation_id),
           source_message_id = COALESCE($5, source_message_id), updated_at = CURRENT_TIMESTAMP
       WHERE conversation_id = $6 AND deleted_at IS NULL
       RETURNING *`,
      values
    );
    if (updated.rows[0]) return updated.rows[0];
    const inserted = await pgPool.query(
      `INSERT INTO conversation_summaries (
        conversation_id, contact_id, summary, detected_language, last_intent, human_escalation_id,
        source_message_id, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        params.conversationId,
        params.contactId,
        summary,
        params.language,
        params.intent,
        params.humanEscalationId ?? null,
        params.sourceMessageId ?? null,
      ]
    );
    return inserted.rows[0] ?? null;
  };

  const createHumanEscalationIfNeeded = async (params: {
    conversationId: number;
    contactId: number;
    branchId?: unknown;
    intent: AiIntent;
    priority: RoutedMessageResult['priority'];
    reasonText: string;
  }) => {
    const mustEscalate =
      params.priority === 'urgent' ||
      params.intent === 'lost_item' ||
      params.intent === 'damage_claim';
    if (!mustEscalate) return null;
    const reason = clamp(params.reasonText, 1000) || `Auto escalation for ${params.intent}`;
    const existing = await get(
      usePostgres
        ? `SELECT * FROM human_escalations
           WHERE conversation_id = $1 AND status NOT IN ('resolved', 'closed')
           ORDER BY created_at DESC LIMIT 1`
        : `SELECT * FROM human_escalations
           WHERE conversation_id = ? AND status NOT IN ('resolved', 'closed')
           ORDER BY datetime(created_at) DESC LIMIT 1`,
      [params.conversationId]
    );
    if (existing) return existing;

    const severity = params.intent === 'lost_item' || params.intent === 'damage_claim' ? 'urgent' : params.priority;
    if (!usePostgres || !pgPool) {
      const info = sqlite.prepare(
        `INSERT INTO human_escalations (
          conversation_id, contact_id, branch_id, reason, severity, status, escalated_by, metadata, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 'open', 'ai', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      ).run(
        params.conversationId,
        params.contactId,
        numberOrNull(params.branchId),
        reason,
        severity,
        jsonPayload({ intent: params.intent, priority: params.priority })
      );
      return get('SELECT * FROM human_escalations WHERE id = ? LIMIT 1', [Number(info.lastInsertRowid)]);
    }

    const inserted = await pgPool.query(
      `INSERT INTO human_escalations (
        conversation_id, contact_id, branch_id, reason, severity, status, escalated_by, metadata, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, 'open', 'ai', $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        params.conversationId,
        params.contactId,
        numberOrNull(params.branchId),
        reason,
        severity,
        jsonPayload({ intent: params.intent, priority: params.priority }),
      ]
    );
    return inserted.rows[0] ?? null;
  };

  const logNotification = async (params: {
    conversationId?: number | null;
    contactId?: number | null;
    channel: string;
    recipientPhone?: unknown;
    messageType?: string;
    providerMessageId?: unknown;
    idempotencyKey?: unknown;
    status: string;
    errorCode?: unknown;
    errorMessage?: unknown;
    metadata?: unknown;
  }) => {
    const payload = [
      params.conversationId ?? null,
      params.contactId ?? null,
      clamp(params.channel, 30),
      nullable(normalizeAiPhone(params.recipientPhone), 30),
      nullable(params.messageType ?? 'text', 30),
      nullable(params.providerMessageId, 255),
      nullable(params.idempotencyKey, 160),
      clamp(params.status, 40) || 'queued',
      nullable(params.errorCode, 80),
      nullable(params.errorMessage, 1000),
      jsonPayload(params.metadata ?? {}),
    ];
    if (!usePostgres || !pgPool) {
      const info = sqlite.prepare(
        `INSERT INTO notification_logs (
          conversation_id, contact_id, channel, recipient_phone, message_type, provider_message_id,
          idempotency_key, status, error_code, error_message, metadata,
          sent_at, failed_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CASE WHEN ? = 'sent' THEN CURRENT_TIMESTAMP ELSE NULL END,
          CASE WHEN ? = 'failed' THEN CURRENT_TIMESTAMP ELSE NULL END, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      ).run(...payload, params.status, params.status);
      return Number(info.lastInsertRowid);
    }
    const inserted = await pgPool.query(
      `INSERT INTO notification_logs (
        conversation_id, contact_id, channel, recipient_phone, message_type, provider_message_id,
        idempotency_key, status, error_code, error_message, metadata,
        sent_at, failed_at, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
        CASE WHEN $12 = 'sent' THEN CURRENT_TIMESTAMP ELSE NULL END,
        CASE WHEN $13 = 'failed' THEN CURRENT_TIMESTAMP ELSE NULL END,
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id`,
      [...payload, params.status, params.status]
    );
    return Number(inserted.rows?.[0]?.id ?? 0) || null;
  };

  const recordWhatsAppStatusNotification = async (status: any) => {
    const providerMessageId = String(status?.id ?? '').trim();
    const rawStatus = String(status?.status ?? 'unknown').trim() || 'unknown';
    const normalizedStatus = rawStatus === 'delivered' || rawStatus === 'read' || rawStatus === 'failed' ? rawStatus : rawStatus === 'sent' ? 'sent' : 'status';
    const errors = Array.isArray(status?.errors) ? status.errors : [];
    const firstError = errors[0] ?? {};
    if (!providerMessageId) return null;

    const existing = await get(
      usePostgres
        ? `SELECT * FROM notification_logs
           WHERE provider_message_id = $1
           ORDER BY created_at DESC LIMIT 1`
        : `SELECT * FROM notification_logs
           WHERE provider_message_id = ?
           ORDER BY datetime(created_at) DESC LIMIT 1`,
      [providerMessageId]
    );

    if (existing) {
      if (!usePostgres || !pgPool) {
        sqlite.prepare(
          `UPDATE notification_logs
           SET status = ?,
               delivered_at = CASE WHEN ? = 'delivered' THEN CURRENT_TIMESTAMP ELSE delivered_at END,
               read_at = CASE WHEN ? = 'read' THEN CURRENT_TIMESTAMP ELSE read_at END,
               failed_at = CASE WHEN ? = 'failed' THEN CURRENT_TIMESTAMP ELSE failed_at END,
               error_code = COALESCE(?, error_code),
               error_message = COALESCE(?, error_message),
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`
        ).run(
          normalizedStatus,
          normalizedStatus,
          normalizedStatus,
          normalizedStatus,
          nullable(firstError?.code, 80),
          nullable(firstError?.message || firstError?.title, 1000),
          existing.id
        );
        return existing.id;
      }
      await pgPool.query(
        `UPDATE notification_logs
         SET status = $1,
             delivered_at = CASE WHEN $2 = 'delivered' THEN CURRENT_TIMESTAMP ELSE delivered_at END,
             read_at = CASE WHEN $3 = 'read' THEN CURRENT_TIMESTAMP ELSE read_at END,
             failed_at = CASE WHEN $4 = 'failed' THEN CURRENT_TIMESTAMP ELSE failed_at END,
             error_code = COALESCE($5, error_code),
             error_message = COALESCE($6, error_message),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $7`,
        [
          normalizedStatus,
          normalizedStatus,
          normalizedStatus,
          normalizedStatus,
          nullable(firstError?.code, 80),
          nullable(firstError?.message || firstError?.title, 1000),
          existing.id,
        ]
      );
      return existing.id;
    }

    return logNotification({
      channel: 'whatsapp',
      recipientPhone: status?.recipient_id,
      providerMessageId,
      idempotencyKey: `status:${providerMessageId}:${normalizedStatus}`,
      status: normalizedStatus,
      errorCode: firstError?.code,
      errorMessage: firstError?.message || firstError?.title,
      metadata: { source: 'whatsapp_status_webhook', raw_status: rawStatus },
    });
  };

  const buildMemorySummary = (params: {
    contactName?: unknown;
    contactPhone?: unknown;
    channel: AiChannel;
    language: string;
    intent: AiIntent;
    priority: RoutedMessageResult['priority'];
    messageType?: string;
    missingFields: string[];
    autoCreatePickup: boolean;
    humanEscalationId?: number | null;
  }) => {
    const missing = params.missingFields.length ? params.missingFields.join(', ') : 'none';
    const escalation = params.humanEscalationId ? ` Human escalation #${params.humanEscalationId} is open.` : '';
    const pickupState = params.autoCreatePickup ? ' Pickup creation was approved by the router.' : '';
    return [
      `Customer ${firstUsefulCustomerName(params.contactName) || 'unknown'} contacted via ${params.channel}.`,
      `Phone normalized to ${normalizeAiPhone(params.contactPhone) || 'unknown'}; language=${params.language}; intent=${params.intent}; priority=${params.priority}.`,
      `Last message type=${params.messageType || 'text'}; missing_fields=${missing}.`,
      pickupState,
      escalation,
    ].join(' ').replace(/\s+/g, ' ').trim();
  };

  const getRoutedDuplicateMessage = async (whatsappMessageIdRaw: unknown): Promise<RoutedMessageResult | null> => {
    const whatsappMessageId = clamp(whatsappMessageIdRaw, 255);
    if (!whatsappMessageId) return null;
    const row = await get(
      usePostgres
        ? `SELECT
             m.id AS message_id,
             c.id AS conversation_id,
             c.intent,
             c.priority,
             c.status,
             ac.id AS contact_id,
             ac.phone AS contact_phone,
             ac.role AS contact_role,
             ac.language AS contact_language,
             (
               SELECT om.message_text
               FROM ai_messages om
               WHERE om.conversation_id = c.id
                 AND om.direction = 'outbound'
                 AND om.id > m.id
               ORDER BY om.created_at ASC, om.id ASC
               LIMIT 1
             ) AS response_text
           FROM ai_messages m
           JOIN ai_conversations c ON c.id = m.conversation_id
           JOIN ai_contacts ac ON ac.id = c.contact_id
           WHERE m.whatsapp_message_id = $1 AND m.direction = 'inbound'
           LIMIT 1`
        : `SELECT
             m.id AS message_id,
             c.id AS conversation_id,
             c.intent,
             c.priority,
             c.status,
             ac.id AS contact_id,
             ac.phone AS contact_phone,
             ac.role AS contact_role,
             ac.language AS contact_language,
             (
               SELECT om.message_text
               FROM ai_messages om
               WHERE om.conversation_id = c.id
                 AND om.direction = 'outbound'
                 AND om.id > m.id
               ORDER BY datetime(om.created_at) ASC, om.id ASC
               LIMIT 1
             ) AS response_text
           FROM ai_messages m
           JOIN ai_conversations c ON c.id = m.conversation_id
           JOIN ai_contacts ac ON ac.id = c.contact_id
           WHERE m.whatsapp_message_id = ? AND m.direction = 'inbound'
           LIMIT 1`,
      [whatsappMessageId]
    );
    if (!row) return null;
    return {
      contact_id: Number(row.contact_id),
      conversation_id: Number(row.conversation_id),
      role: (row.contact_role || 'unknown') as AiRole,
      language: String(row.contact_language || 'auto'),
      intent: (row.intent || 'unknown') as AiIntent,
      priority: (row.priority || 'normal') as RoutedMessageResult['priority'],
      response: String(row.response_text || ''),
      order_tracking: null,
      ai_source: 'rules',
      pickup_draft: emptyPickupDraft(),
      missing_fields: [],
      auto_create_pickup: false,
      duplicate_message: true,
    };
  };

  const trackOrder = async (orderIdRaw: unknown, requesterPhoneRaw?: unknown) => {
    const orderId = clamp(orderIdRaw, 80);
    if (!orderId) return null;
    try {
      const row = await get(
        usePostgres ? 'SELECT payload FROM customer_orders WHERE id = $1 LIMIT 1' : 'SELECT payload FROM customer_orders WHERE id = ? LIMIT 1',
        [orderId]
      );
      if (!row?.payload) return null;
      const payload = JSON.parse(String(row.payload));
      const requesterPhone = normalizeAiPhone(requesterPhoneRaw);
      if (requesterPhone && !isOrderPhoneAuthorized(payload, requesterPhone)) {
        return {
          order_id: payload.id ?? orderId,
          authorization: 'verification_required',
          verified: false,
          reason: getOrderPhoneCandidates(payload).length ? 'phone_mismatch' : 'order_phone_missing',
        };
      }
      const total = Number(payload?.pos?.total ?? payload?.totalPrice ?? payload?.amount ?? 0) || 0;
      return {
        order_id: payload.id ?? orderId,
        authorization: requesterPhone ? 'verified' : 'internal',
        verified: Boolean(requesterPhone),
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
    const duplicateMessage = await getRoutedDuplicateMessage(input.whatsappMessageId);
    if (duplicateMessage) return duplicateMessage;
    const correlationId = clamp(input.correlationId, 120) || createCorrelationId();

    const knownAreas = await getKnownServiceAreas();
    const fallbackDraft = extractPickupDraftFromMessage(input.messageText, {
      contactName: input.name,
      contactPhone: input.from,
      knownAreas,
    });
    const aiAnalysis = await analyzeMessageWithOpenAi({
      text: input.messageText,
      contactName: input.name,
      contactPhone: input.from,
      knownAreas,
      fallbackDraft,
      correlationId,
    });
    const language = aiAnalysis?.language || detectLanguage(input.messageText);
    const intent = aiAnalysis?.intent || detectIntent(input.messageText);
    const priority =
      aiAnalysis?.priority || (intent === 'lost_item' || intent === 'damage_claim' ? 'urgent' : intent === 'complaint' ? 'high' : 'normal');
    const pickupDraft = aiAnalysis?.pickup_draft || fallbackDraft;
    const missingFields =
      aiAnalysis?.missing_fields ??
      (pickupDraftHasMinimumData(pickupDraft) ? [] : ['location']);
    const autoCreatePickup =
      autoCreatePickups &&
      intent === 'pickup_request' &&
      pickupDraftHasMinimumData(pickupDraft) &&
      (aiAnalysis?.ready_for_auto_create || pickupDraft.confidence === 'high');
    const contact = await getOrCreateContact(input.from, input.name, language);
    await upsertCustomerChannelLink({
      contactId: Number(contact.id),
      channel,
      channelUserId: normalizeAiPhone(input.from) || String(input.from ?? ''),
      normalizedPhone: normalizeAiPhone(input.from),
      source: channel === 'whatsapp' ? 'whatsapp_inbound' : 'ai_router',
    });
    const conversation = await getOrCreateConversation(Number(contact.id), channel, intent, priority);

    const inboundMessageId = await logMessage({
      conversationId: Number(conversation.id),
      direction: 'inbound',
      senderPhone: normalizeAiPhone(input.from),
      receiverPhone: input.to ? normalizeAiPhone(input.to) : null,
      messageType: input.messageType ?? 'text',
      messageText: input.messageText,
      whatsappMessageId: input.whatsappMessageId,
    });

    const orderNumber = input.messageText.match(/\b[A-Z]{0,4}\d{3,}\b/i)?.[0];
    const orderStatus = intent === 'order_tracking' && orderNumber ? await trackOrder(orderNumber, input.from) : null;
    const responseText =
      aiAnalysis?.reply ||
      (autoCreatePickup
        ? language === 'ar' || language === 'ur'
          ? 'تم استلام بيانات طلب الاستلام. سأقوم بإنشاء الطلب وإبلاغ السائق الآن.'
          : 'Pickup details received. I will create the pickup order and notify the driver now.'
        : buildReply(intent, language, input.messageText, orderStatus));

    const humanEscalation = await createHumanEscalationIfNeeded({
      conversationId: Number(conversation.id),
      contactId: Number(contact.id),
      branchId: conversation.branch_id,
      intent,
      priority,
      reasonText: input.messageText,
    });

    const outboundMessageId = await logMessage({
      conversationId: Number(conversation.id),
      direction: 'outbound',
      senderPhone: input.to ? normalizeAiPhone(input.to) : null,
      receiverPhone: normalizeAiPhone(input.from),
      messageType: 'text',
      messageText: responseText,
      aiResponse: true,
    });

    await upsertConversationSummary({
      conversationId: Number(conversation.id),
      contactId: Number(contact.id),
      summary: buildMemorySummary({
        contactName: contact.name || input.name,
        contactPhone: contact.phone || input.from,
        channel,
        language,
        intent,
        priority,
        messageType: input.messageType ?? 'text',
        missingFields,
        autoCreatePickup,
        humanEscalationId: humanEscalation?.id ? Number(humanEscalation.id) : null,
      }),
      language,
      intent,
      sourceMessageId: inboundMessageId,
      humanEscalationId: humanEscalation?.id ? Number(humanEscalation.id) : null,
    });

    return {
      contact_id: Number(contact.id),
      conversation_id: Number(conversation.id),
      inbound_message_id: inboundMessageId,
      outbound_message_id: outboundMessageId,
      human_escalation_id: humanEscalation?.id ? Number(humanEscalation.id) : null,
      role: contact.role as AiRole,
      language,
      intent,
      priority,
      response: responseText,
      order_tracking: orderStatus,
      ai_source: aiAnalysis?.source ?? 'rules',
      pickup_draft: pickupDraft,
      missing_fields: missingFields,
      auto_create_pickup: autoCreatePickup,
      duplicate_message: false,
      correlation_id: correlationId,
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
    await upsertCustomerChannelLink({
      contactId: Number(contact.id),
      channel: 'whatsapp',
      channelUserId: to,
      normalizedPhone: to,
      source: 'whatsapp_outbound',
    });
    const conversation = await getOrCreateConversation(Number(contact.id), 'whatsapp', detectIntent(message), 'normal');
    try {
      const providerResponse = await sendWhatsAppText(to, message);
      const providerMessageId = providerResponse?.messages?.[0]?.id;
      await logMessage({
        conversationId: Number(conversation.id),
        direction: 'outbound',
        senderPhone: normalizeAiPhone(envFirst(env, ['WHATSAPP_PHONE_NUMBER_ID', 'META_WHATSAPP_PHONE_NUMBER_ID'])),
        receiverPhone: to,
        messageType: 'text',
        messageText: message,
        whatsappMessageId: providerMessageId,
        aiResponse: false,
      });
      await logNotification({
        conversationId: Number(conversation.id),
        contactId: Number(contact.id),
        channel: 'whatsapp',
        recipientPhone: to,
        messageType: 'text',
        providerMessageId,
        idempotencyKey: providerMessageId || `manual:${Number(conversation.id)}:${Date.now()}`,
        status: 'sent',
        metadata: { source: 'sendAndLogWhatsAppText' },
      });
      return providerResponse;
    } catch (error: any) {
      await logNotification({
        conversationId: Number(conversation.id),
        contactId: Number(contact.id),
        channel: 'whatsapp',
        recipientPhone: to,
        messageType: 'text',
        idempotencyKey: `manual-failed:${Number(conversation.id)}:${Date.now()}`,
        status: 'failed',
        errorCode: 'NOTIFICATION_SEND_FAILED',
        errorMessage: error?.message || String(error),
        metadata: { source: 'sendAndLogWhatsAppText' },
      });
      throw error;
    }
  };

  const processWhatsappWebhook = async (body: any, options: ProcessWhatsappWebhookOptions = {}) => {
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
        for (const status of Array.isArray(value.statuses) ? value.statuses : []) {
          const errors = Array.isArray(status?.errors) ? status.errors : [];
          const errorSummary = errors
            .map((error: any) =>
              [
                error?.code ? `code=${error.code}` : '',
                error?.title ? `title=${error.title}` : '',
                error?.message ? `message=${error.message}` : '',
                error?.error_data?.details ? `details=${error.error_data.details}` : '',
              ]
                .filter(Boolean)
                .join(' ')
            )
            .filter(Boolean)
            .join(' | ');
          console.log(
            `[whatsapp-webhook] status id=${String(status?.id ?? 'n/a')} recipient=${maskAiPhone(status?.recipient_id)} status=${String(status?.status ?? 'unknown')} timestamp=${String(status?.timestamp ?? 'n/a')}${errorSummary ? ` ${errorSummary}` : ''}`
          );
          const notificationLogId = await recordWhatsAppStatusNotification(status);
          results.push({
            type: 'status',
            id: String(status?.id ?? ''),
            recipient: maskAiPhone(status?.recipient_id),
            status: String(status?.status ?? ''),
            errors: errors.length,
            notification_log_id: notificationLogId,
          });
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
          const to = String(value?.metadata?.display_phone_number ?? value?.metadata?.phone_number_id ?? '');
          const routed = await routeIncomingMessage({
            channel: 'whatsapp',
            from,
            to,
            name: contact?.profile?.name,
            messageText: text,
            messageType: type,
            whatsappMessageId: String(message?.id ?? ''),
          });
          if (routed.duplicate_message) {
            results.push({
              from,
              intent: routed.intent,
              ai_source: routed.ai_source,
              auto_create_pickup: false,
              conversation_id: routed.conversation_id,
              duplicate_message: true,
              send: { status: 'skipped', reason: 'duplicate_whatsapp_message' },
            });
            continue;
          }
          const actionResultRaw = options.onRoutedMessage
            ? await options.onRoutedMessage({ from, to, text, type, routed })
            : null;
          const actionResult = actionResultRaw || null;
          const responseText = clamp(actionResult?.responseOverride || routed.response, 4096);
          let sendResult: any = null;
          if (actionResult?.suppressReply) {
            sendResult = { status: 'skipped', reason: 'reply_suppressed_by_automation' };
          } else {
            try {
              sendResult = await sendWhatsAppText(from, responseText);
              const providerMessageId = sendResult?.messages?.[0]?.id;
              await logNotification({
                conversationId: Number(routed.conversation_id),
                contactId: Number(routed.contact_id),
                channel: 'whatsapp',
                recipientPhone: from,
                messageType: 'text',
                providerMessageId,
                idempotencyKey: providerMessageId || `webhook:${String(message?.id ?? '')}:reply`,
                status: 'sent',
                metadata: {
                  source: 'whatsapp_webhook_auto_reply',
                  inbound_wamid: String(message?.id ?? ''),
                  intent: routed.intent,
                  correlation_id: routed.correlation_id ?? null,
                },
              });
              if (responseText !== routed.response) {
                await logMessage({
                  conversationId: Number(routed.conversation_id),
                  direction: 'outbound',
                  senderPhone: to ? normalizeAiPhone(to) : null,
                  receiverPhone: normalizeAiPhone(from),
                  messageType: 'text',
                  messageText: responseText,
                  whatsappMessageId: providerMessageId,
                  aiResponse: true,
                });
              }
            } catch (error: any) {
              sendResult = { error: error?.message || String(error) };
              await logNotification({
                conversationId: Number(routed.conversation_id),
                contactId: Number(routed.contact_id),
                channel: 'whatsapp',
                recipientPhone: from,
                messageType: 'text',
                idempotencyKey: `webhook:${String(message?.id ?? '')}:reply_failed`,
                status: 'failed',
                errorCode: 'NOTIFICATION_SEND_FAILED',
                errorMessage: error?.message || String(error),
                metadata: {
                  source: 'whatsapp_webhook_auto_reply',
                  inbound_wamid: String(message?.id ?? ''),
                  intent: routed.intent,
                  correlation_id: routed.correlation_id ?? null,
                },
              });
            }
          }
          results.push({
            from,
            intent: routed.intent,
            ai_source: routed.ai_source,
            auto_create_pickup: routed.auto_create_pickup,
            conversation_id: routed.conversation_id,
            automation: actionResult?.automation ?? null,
            send: sendResult,
          });
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

  const assignDriverToPickupRequest = async (idRaw: unknown, input: DriverAssignmentInput = {}) => {
    const pickupId = Number(idRaw);
    if (!Number.isFinite(pickupId) || pickupId <= 0) throw new Error('Valid pickup id is required.');
    const pickup = await get(
      usePostgres ? 'SELECT * FROM pickup_requests WHERE id = $1' : 'SELECT * FROM pickup_requests WHERE id = ?',
      [pickupId]
    );
    if (!pickup) return null;

    const existing = await getActiveDriverAssignmentForTask('pickup', pickupId);
    if (existing) {
      return {
        assignment: existing,
        driver: null,
        candidates: [],
        status: 'already_assigned',
      };
    }

    const { serviceAreas } = await getConfiguredDispatchData();
    const sourceText = firstNonEmpty(
      input.service_area,
      pickup.address,
      pickup.notes,
      pickup.google_maps_url
    );
    const serviceArea = resolveServiceAreaForDispatch(sourceText, serviceAreas);
    const candidates = await rankDispatchDrivers({
      serviceArea,
      branchId: input.branch_id ?? pickup.branch_id ?? serviceArea?.branch_id,
      sourceText,
      priority: input.priority,
    });
    const selected = candidates[0] ?? null;
    if (!selected) {
      return {
        assignment: null,
        driver: null,
        candidates: [],
        status: 'no_driver_available',
      };
    }

    const driverContact = await getOrCreateContact(selected.phone, selected.driver?.name, 'auto');
    const metadata = jsonPayload({
      source: 'ai_driver_dispatch',
      driver_id: selected.driver?.id ?? null,
      driver_name: selected.driver?.name ?? null,
      driver_status: selected.status,
      service_area_id: serviceArea?.id ?? null,
      service_area_name: serviceArea?.name ?? null,
      service_area_branch_id: serviceArea?.branch_id ?? null,
      area_match: selected.areaMatch,
      branch_match: selected.branchMatch,
      current_tasks: selected.currentTasks,
      candidate_count: candidates.length,
    });
    const branchId = numberOrNull(input.branch_id ?? pickup.branch_id);
    const createdBy = clamp(input.created_by ?? 'ai', 80) || 'ai';

    let assignment: any = null;
    if (!usePostgres || !pgPool) {
      const info = sqlite.prepare(
        `INSERT INTO driver_assignments (
          task_type, pickup_request_id, delivery_request_id, driver_contact_id, driver_phone,
          branch_id, service_area, status, ranking_score, metadata, created_at, updated_at, created_by
        ) VALUES ('pickup', ?, NULL, ?, ?, ?, ?, 'assigned', ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)`
      ).run(
        pickupId,
        Number(driverContact.id),
        selected.phone,
        branchId,
        nullable(serviceArea?.name ?? sourceText, 150),
        selected.score,
        metadata,
        createdBy
      );
      assignment = await get('SELECT * FROM driver_assignments WHERE id = ? LIMIT 1', [Number(info.lastInsertRowid)]);
    } else {
      const inserted = await pgPool.query(
        `INSERT INTO driver_assignments (
          task_type, pickup_request_id, delivery_request_id, driver_contact_id, driver_phone,
          branch_id, service_area, status, ranking_score, metadata, created_at, updated_at, created_by
        ) VALUES ('pickup', $1, NULL, $2, $3, $4, $5, 'assigned', $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, $8)
        RETURNING *`,
        [
          pickupId,
          Number(driverContact.id),
          selected.phone,
          branchId,
          nullable(serviceArea?.name ?? sourceText, 150),
          selected.score,
          metadata,
          createdBy,
        ]
      );
      assignment = inserted.rows[0] ?? null;
    }

    await updatePickupRequest(pickupId, {
      status: 'assigned',
      assigned_driver_phone: selected.phone,
    });

    return {
      assignment,
      driver: {
        id: selected.driver?.id ?? null,
        name: selected.driver?.name ?? null,
        phone: selected.phone,
        score: selected.score,
      },
      candidates: candidates.slice(0, 5).map((candidate) => ({
        id: candidate.driver?.id ?? null,
        name: candidate.driver?.name ?? null,
        phone: candidate.phone,
        score: candidate.score,
        current_tasks: candidate.currentTasks,
        area_match: candidate.areaMatch,
        branch_match: candidate.branchMatch,
      })),
      status: 'assigned',
    };
  };

  const updateDriverAssignmentStatus = async (idRaw: unknown, input: Record<string, unknown> = {}) => {
    const id = Number(idRaw);
    if (!Number.isFinite(id) || id <= 0) throw new Error('Valid driver assignment id is required.');
    const nextStatus = normalizeDriverAssignmentStatus(input.status);
    if (!DRIVER_ASSIGNMENT_STATUSES.has(nextStatus)) throw new Error('Valid driver assignment status is required.');

    const current = await get(
      usePostgres ? 'SELECT * FROM driver_assignments WHERE id = $1' : 'SELECT * FROM driver_assignments WHERE id = ?',
      [id]
    );
    if (!current) return null;

    const currentStatus = normalizeDriverAssignmentStatus(current.status || 'assigned');
    if (currentStatus === nextStatus) {
      return {
        assignment: current,
        status: 'unchanged',
      };
    }

    const allowed = DRIVER_ASSIGNMENT_TRANSITIONS[currentStatus] ?? [];
    const taskType = normalizeDriverAssignmentStatus(current.task_type || 'pickup');
    const taskSpecificAllowed =
      (nextStatus === 'picked_up' && taskType !== 'pickup') ||
      (nextStatus === 'delivered' && taskType !== 'delivery')
        ? false
        : allowed.includes(nextStatus);
    if (!taskSpecificAllowed) {
      throw new Error(`Invalid driver assignment transition: ${currentStatus} -> ${nextStatus}.`);
    }

    const failureReason = nullable(input.failure_reason ?? input.reason, 1000);
    const metadata = jsonPayload({
      source: 'driver_assignment_status_update',
      previous_status: currentStatus,
      next_status: nextStatus,
      updated_by: clamp(input.updated_by ?? 'api', 80) || 'api',
      note: nullable(input.note, 1000),
    });

    if (!usePostgres || !pgPool) {
      sqlite.prepare(
        `UPDATE driver_assignments
         SET status = ?,
             failure_reason = COALESCE(?, failure_reason),
             metadata = ?,
             accepted_at = CASE WHEN ? = 'accepted' THEN COALESCE(accepted_at, CURRENT_TIMESTAMP) ELSE accepted_at END,
             rejected_at = CASE WHEN ? = 'failed' THEN COALESCE(rejected_at, CURRENT_TIMESTAMP) ELSE rejected_at END,
             completed_at = CASE WHEN ? IN ('picked_up', 'delivered', 'failed', 'cancelled') THEN COALESCE(completed_at, CURRENT_TIMESTAMP) ELSE completed_at END,
             updated_at = CURRENT_TIMESTAMP,
             updated_by = ?
         WHERE id = ?`
      ).run(
        nextStatus,
        failureReason,
        metadata,
        nextStatus,
        nextStatus,
        nextStatus,
        clamp(input.updated_by ?? 'api', 80) || 'api',
        id
      );
    } else {
      await pgPool.query(
        `UPDATE driver_assignments
         SET status = $1,
             failure_reason = COALESCE($2, failure_reason),
             metadata = $3,
             accepted_at = CASE WHEN $4 = 'accepted' THEN COALESCE(accepted_at, CURRENT_TIMESTAMP) ELSE accepted_at END,
             rejected_at = CASE WHEN $5 = 'failed' THEN COALESCE(rejected_at, CURRENT_TIMESTAMP) ELSE rejected_at END,
             completed_at = CASE WHEN $6 IN ('picked_up', 'delivered', 'failed', 'cancelled') THEN COALESCE(completed_at, CURRENT_TIMESTAMP) ELSE completed_at END,
             updated_at = CURRENT_TIMESTAMP,
             updated_by = $7
         WHERE id = $8`,
        [
          nextStatus,
          failureReason,
          metadata,
          nextStatus,
          nextStatus,
          nextStatus,
          clamp(input.updated_by ?? 'api', 80) || 'api',
          id,
        ]
      );
    }

    const assignment = await get(
      usePostgres ? 'SELECT * FROM driver_assignments WHERE id = $1' : 'SELECT * FROM driver_assignments WHERE id = ?',
      [id]
    );

    if (assignment?.pickup_request_id) {
      await updatePickupRequest(assignment.pickup_request_id, {
        status: nextStatus,
        assigned_driver_phone: assignment.driver_phone,
      });
    }

    return {
      assignment,
      status: 'updated',
    };
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
    const fallbackDraft = extractPickupDraftFromMessage(conversation.last_inbound_text, {
      contactName: conversation.contact_name,
      contactPhone: conversation.contact_phone,
      knownAreas,
    });
    const aiAnalysis = await analyzeMessageWithOpenAi({
      text: String(conversation.last_inbound_text ?? ''),
      contactName: conversation.contact_name,
      contactPhone: conversation.contact_phone,
      knownAreas,
      fallbackDraft,
      correlationId: `corr_pickup_draft_${conversation.id}_${Date.now()}`,
    });
    return aiAnalysis?.pickup_draft ?? fallbackDraft;
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
    const dispatch = await assignDriverToPickupRequest(pickup.id, {
      service_area: firstNonEmpty(input.area, draft?.area, input.address, draft?.address),
      branch_id: input.branch_id ?? conversation.branch_id,
      priority: conversation.priority,
      created_by: 'ai',
    });
    await updateAiConversation(conversation.id, { status: 'assigned', priority: conversation.priority });
    return { ...pickup, driver_assignment: dispatch };
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
    assignDriverToPickupRequest,
    updateDriverAssignmentStatus,
    listComplaints,
    createComplaint,
    updateComplaint,
    trackOrder,
  };
};
