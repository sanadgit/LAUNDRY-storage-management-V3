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

export interface Order {
  id: string;
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
  pricing: PricingItem[];
  branches: Branch[];
  drivers: Driver[];
  offers: Offer[];
}
