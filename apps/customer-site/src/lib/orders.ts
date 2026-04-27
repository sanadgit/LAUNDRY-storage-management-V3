import { Order, OrderStatus } from '../types';

export const ORDER_STATUS_VALUES: OrderStatus[] = [
  'new',
  'accepted',
  'on_the_way',
  'pickup',
  'washing',
  'ready',
  'delivery',
  'completed',
  'delivered',
  'cancelled',
];

const ORDER_STATUS_SET = new Set<string>(ORDER_STATUS_VALUES);

const LEGACY_STATUS_MAP: Record<string, OrderStatus> = {
  'in progress': 'washing',
  ironing: 'washing',
  delivered: 'delivered',
  cancelled: 'cancelled',
};

export const normalizeOrderStatus = (value: unknown): OrderStatus => {
  const raw = String(value ?? '').trim().toLowerCase();
  if (ORDER_STATUS_SET.has(raw)) return raw as OrderStatus;
  if (LEGACY_STATUS_MAP[raw]) return LEGACY_STATUS_MAP[raw];
  return 'new';
};

export const normalizeOrder = (order: any): Order => {
  const normalized: Order = {
    ...order,
    id: String(order?.id ?? '').trim(),
    customerName: String(order?.customerName ?? 'عميل جديد'),
    dateReceived: String(order?.dateReceived ?? ''),
    itemCount: Number.isFinite(Number(order?.itemCount)) ? Number(order.itemCount) : 0,
    serviceType: String(order?.serviceType ?? ''),
    branch: String(order?.branch ?? ''),
    status: normalizeOrderStatus(order?.status),
    amount: Number.isFinite(Number(order?.amount)) ? Number(order.amount) : 0,
    priority: ['normal', 'express', 'high', 'urgent'].includes(String(order?.priority))
      ? order.priority
      : 'normal',
    paymentStatus: ['paid', 'unpaid', 'pending'].includes(String(order?.paymentStatus))
      ? order.paymentStatus
      : 'pending',
  };

  return normalized;
};

export const normalizeOrders = (orders: any[]): Order[] => {
  if (!Array.isArray(orders)) return [];
  return orders.map(normalizeOrder).filter((order) => order.id.length > 0);
};

export const ORDER_STATUS_LABEL_AR: Record<OrderStatus, string> = {
  new: 'جديد',
  accepted: 'تم القبول',
  on_the_way: 'في الطريق',
  pickup: 'تم الاستلام',
  washing: 'الغسيل والكوي',
  ready: 'جاهز',
  delivery: 'قيد التسليم',
  completed: 'مكتمل',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
};

