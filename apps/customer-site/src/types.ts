export type OrderStatus = 
  | 'new' 
  | 'accepted'
  | 'on_the_way'
  | 'pickup'
  | 'washing' 
  | 'ready' 
  | 'delivery'
  | 'completed'
  | 'delivered'
  | 'cancelled';

export interface MissionStep {
  key: string;
  label: string;
  status: 'done' | 'active' | 'pending';
}

export interface OrderItem {
  icon: string;
  name: string;
  qty: number;
}

export interface CustomerOrderPosItem {
  id?: string;
  sale_entry_id?: string;
  product_id?: string;
  barcode?: string;
  name: string;
  service?: string;
  quantity: number;
  unit_price: number;
  subtotal?: number;
  tax_amount?: number;
  total: number;
  unit?: string;
  remark?: string;
  category?: string;
}

export interface CustomerOrderPosSync {
  synced_at: string;
  order_no?: string;
  system_order_id?: string;
  source_orders_id?: string;
  invoice_id?: string;
  invoice_no?: string;
  status?: string;
  mapped_status?: OrderStatus;
  payment_status?: 'paid' | 'partial' | 'unpaid' | string;
  total: number;
  paid: number;
  balance: number;
  order_date?: string;
  delivery_date?: string;
  delivery_time?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  remark?: string;
  item_count?: number;
  items: CustomerOrderPosItem[];
  details_error?: string;
}

export interface Order {
  id: string;
  systemOrderId?: string;
  posOrderNo?: string;
  customerName: string;
  customerPhone?: string;
  customerNotes?: string;
  dateReceived: string;
  itemCount: number;
  serviceType: string;
  branch: string;
  status: OrderStatus;
  amount: number;
  priority: 'normal' | 'express' | 'high' | 'urgent';
  paymentStatus: 'paid' | 'unpaid' | 'pending';
  assignedDriverId?: string;
  deliveryAddress?: string;
  distanceKm?: number;
  etaMinutes?: number;
  timeSlot?: { from: string; to: string };
  deadline?: string;
  items?: OrderItem[];
  steps?: MissionStep[];
  paymentMethod?: 'cash' | 'card' | 'wallet';
  bags?: {
    label: string;
    items: string[];
  }[];
  eta?: string;
  progressPercentage?: number;
  pickupSlot?: string;
  locationLat?: number | null;
  locationLng?: number | null;
  locationLink?: string;
  mapLocationLink?: string;
  driverLocationLink?: string;
  totalPrice?: number;
  pos?: CustomerOrderPosSync;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  priceStart?: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  whatsapp: string;
  hours: string;
  coordinates: { lat: number; lng: number };
  status?: 'active' | 'busy' | 'closed';
}

export interface PricingItem {
  barcode: string;
  name_ar: string;
  name_en: string;
  category: string;
  icon?: string;
  wash_iron: number;
  iron: number;
  wash_dry: number;
  dry: number;
  active?: boolean;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  branch: string;
  branch_id?: string;
  service_areas?: string[];
  status: 'online' | 'offline' | 'busy' | 'available' | 'off';
  rating: number;
  total_ratings?: number;
  orders_completed: number;
  earnings_today: number;
  avatar?: string;
}

export interface Offer {
  id: string;
  name: string;
  discount: string;
  condition: string;
  active: boolean;
}

export interface ServiceOption {
  id: number;
  name: string;
  desc: string;
  icon: string;
  priceKey: 'wash_dry' | 'wash_iron' | 'iron' | 'dry';
  active?: boolean;
}

export interface UrgencyOption {
  id: number;
  name: string;
  time: string;
  extra: number;
  desc: string;
  active?: boolean;
}

export interface ServiceArea {
  id: string;
  name: string;
  active?: boolean;
  delivery_fee?: number;
  min_order_amount?: number;
  branch_id?: string;
}

export interface PickupDayOption {
  id: string;
  label: string;
  active?: boolean;
}

export interface TimeSlotOption {
  id: string;
  time: string;
  avail: string;
  busy?: boolean;
  active?: boolean;
}

export interface PaymentMethodOption {
  id: number;
  name: string;
  desc: string;
  kind: 'card' | 'cash' | 'wallet';
  active?: boolean;
}

export interface SiteConfig {
  hero: {
    title: string;
    subtitle: string;
    cta_primary: string;
    cta_secondary: string;
  };
  stats: {
    delivery_hours: string;
    delivery_label: string;
    satisfied_customers: string;
    satisfied_label: string;
    process_steps: string;
    satisfaction_rate: string;
  };
  gallery: {
    id: string;
    icon: string;
    label: string;
  }[];
  whatsapp_number: string;
  maintenance_mode: boolean;
  accept_orders: boolean;
  whatsapp_notifications: boolean;
  site_name: string;
  contact_email: string;
  business_address: string;
  vat_number: string;
  google_maps_url: string;
  footer_text: string;
  social_media: {
    instagram: string;
    tiktok: string;
    facebook: string;
  };
  delivery_fee: number;
  min_order_amount: number;
  vat_percentage: number;
  service_options: ServiceOption[];
  urgency_options: UrgencyOption[];
  service_areas: ServiceArea[];
  pickup_days: PickupDayOption[];
  time_slots: TimeSlotOption[];
  payment_methods: PaymentMethodOption[];
  ai_settings?: {
    auto_pickup_enabled: boolean;
    manual_review_enabled: boolean;
    min_confidence: 'low' | 'medium' | 'high';
    require_customer_name: boolean;
    require_customer_phone: boolean;
    require_area: boolean;
    require_address: boolean;
    require_location_link: boolean;
    require_pickup_time: boolean;
    ask_missing_name_only: boolean;
    notify_driver: boolean;
    natural_customer_reply: boolean;
    template_fallback_enabled: boolean;
  };
  pricing: PricingItem[];
  branches: Branch[];
  drivers: Driver[];
  offers: Offer[];
}

export interface CustomerUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  type: string;
  area: string;
  prefService: number;
  notifType: string;
  created_at: string | null;
  last_login_at: string | null;
}

export interface CustomerAuthResponse {
  user: CustomerUser;
  token: string;
  expires_at: number;
}

export interface CustomerOtpSendResponse {
  challengeId: string;
  expires_at: number;
  cooldown_until: number;
  provider: 'twilio' | 'aipsoft' | 'meta_whatsapp' | 'mock';
  channel: 'sms' | 'whatsapp';
  dev_code?: string;
}

export interface CustomerOtpVerifyResponse {
  verified: boolean;
  verificationToken: string;
  expires_at: number;
}

export interface PublicTrackVerificationResponse {
  challengeId: string;
  maskedPhone: string;
  expires_at: number;
  cooldown_until: number;
  provider: 'twilio' | 'aipsoft' | 'meta_whatsapp' | 'mock';
  channel: 'sms' | 'whatsapp';
  dev_code?: string;
}

export interface PublicTrackVerifyResponse {
  verified: boolean;
  maskedPhone: string;
  order: Order;
}

export interface SyncQueueItem {
  id: number;
  entity_type: string;
  entity_id: string;
  operation: string;
  target: string;
  status: 'pending' | 'failed' | 'synced' | 'dead' | string;
  attempts: number;
  last_error?: string | null;
  next_attempt_at?: string | null;
  updated_at?: string | null;
}

export interface SyncHealthResponse {
  ok: boolean;
  local_first: boolean;
  checked_at: string;
  local: {
    ok: boolean;
    customer_orders?: number;
    error?: string;
  };
  supabase: {
    configured: boolean;
    reachable: boolean;
    customer_orders?: number | null;
    error?: string;
  };
  supabase_configured: boolean;
  supabase_reachable: boolean;
  retry_ms: number;
  max_attempts: number;
  counts: Record<string, number>;
  latest: SyncQueueItem[];
}

export interface SyncRetryResponse {
  ok: boolean;
  processed: number;
  skipped?: string;
}

export interface AdminUser {
  id: number;
  username: string;
  role: string;
  full_name?: string;
  email?: string;
}

export interface AdminAuthResponse {
  user: AdminUser;
  token: string;
  expires_at: number;
}

export interface DriverAuthUser {
  id: string;
  name: string;
  phone: string;
}

export interface DriverAuthResponse {
  driver: DriverAuthUser;
  token: string;
  expires_at: number;
}
