import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CheckCircle2,
  Clock,
  Crown,
  FileText,
  Hash,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  ReceiptText,
  RefreshCcw,
  Settings,
  ShoppingBag,
  Shirt,
  TrendingUp,
  User,
  X,
  type LucideIcon,
} from 'lucide-react';
import { CustomerOrderPosItem, CustomerUser, Order, OrderStatus, PricingItem } from '../types';
import { LaundryIcon, resolvePricingItemIcon } from './LaundryIcon';
import { ORDER_STATUS_LABEL_AR } from '../lib/orders';
import { SiteLanguage, formatCurrency, formatNumber, localize } from '../lib/i18n';

interface DashboardProps {
  orders: Order[];
  pricing: PricingItem[];
  onNewOrderClick: () => void;
  onLogout: () => void;
  user: CustomerUser;
  onSyncOrderWithPos?: (orderId: string) => Promise<Order>;
  language?: SiteLanguage;
}

type DashboardTab = 'overview' | 'orders' | 'addresses' | 'invoices' | 'profile';
type OrderFilter = 'all' | 'active' | 'delivered' | 'cancelled';

const ACTIVE_STATUSES = new Set<OrderStatus>(['new', 'accepted', 'on_the_way', 'pickup', 'washing', 'ready', 'delivery']);
const DONE_STATUSES = new Set<OrderStatus>(['completed', 'delivered']);
const STATUS_STEP: Record<OrderStatus, number> = {
  new: 0,
  accepted: 1,
  on_the_way: 1,
  pickup: 2,
  washing: 3,
  ready: 4,
  delivery: 5,
  completed: 5,
  delivered: 5,
  cancelled: 0,
};

const JOURNEY_LABELS = {
  ar: ['جديد', 'في الطريق', 'استلام', 'تنظيف', 'جاهز', 'تسليم'],
  en: ['New', 'On the way', 'Pickup', 'Cleaning', 'Ready', 'Delivery'],
} satisfies Record<SiteLanguage, string[]>;

const STATUS_LABEL_EN: Record<OrderStatus, string> = {
  new: 'New',
  accepted: 'Accepted',
  on_the_way: 'On the Way',
  pickup: 'Picked Up',
  washing: 'Cleaning',
  ready: 'Ready',
  delivery: 'Out for Delivery',
  completed: 'Completed',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const getOrderAmount = (order: Order) => Number(order.pos?.total ?? (order as any).amount ?? (order as any).totalPrice ?? 0) || 0;
const getOrderPhone = (order: Order) => String((order as any).customerPhone ?? (order as any).phoneNumber ?? '').trim();
const getOrderDate = (order: Order) => String(order.dateReceived || (order as any).created_at || '').trim() || '-';
const normalizeLookup = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const getSystemOrderLabel = (order: Order) =>
  String(order.pos?.order_no || order.posOrderNo || order.pos?.system_order_id || order.systemOrderId || '').trim();

const getFallbackOrderItems = (order: Order): CustomerOrderPosItem[] => {
  if (order.items?.length) {
    return order.items.map((item) => ({
      id: item.name,
      name: item.name,
      quantity: item.qty,
      unit_price: 0,
      total: 0,
    }));
  }

  return (order.bags ?? []).flatMap((bag) =>
    (bag.items ?? []).map((item, index) => ({
      id: `${bag.label}-${index}`,
      name: item,
      service: bag.label,
      quantity: 0,
      unit_price: 0,
      total: 0,
    }))
  );
};

export const Dashboard: React.FC<DashboardProps> = ({
  orders,
  pricing,
  onNewOrderClick,
  onLogout,
  user,
  onSyncOrderWithPos,
  language = 'ar',
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [filterTab, setFilterTab] = useState<OrderFilter>('all');
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
  const [syncErrors, setSyncErrors] = useState<Record<string, string>>({});
  const autoSyncedIds = useRef(new Set<string>());

  const n = (value: number) => formatNumber(language, value);
  const money = (value: number) => formatCurrency(language, value);
  const dateLocale = language === 'ar' ? 'ar-AE' : 'en-AE';
  const statusLabel = (status: OrderStatus) =>
    language === 'ar' ? ORDER_STATUS_LABEL_AR[status] ?? 'قيد التنفيذ' : STATUS_LABEL_EN[status] ?? 'In Progress';
  const paymentLabel = (value?: string) => {
    if (value === 'paid') return localize(language, 'مدفوع', 'Paid');
    if (value === 'partial') return localize(language, 'جزئي', 'Partial');
    if (value === 'unpaid') return localize(language, 'غير مدفوع', 'Unpaid');
    return localize(language, 'قيد الانتظار', 'Pending');
  };

  const firstName = String(user.name || '').trim().split(' ')[0] || localize(language, 'عميلنا', 'Customer');
  const activeOrders = useMemo(() => orders.filter((order) => ACTIVE_STATUSES.has(order.status)), [orders]);
  const completedOrders = useMemo(() => orders.filter((order) => DONE_STATUSES.has(order.status)), [orders]);
  const activeOrder = activeOrders[0] ?? orders[0] ?? null;
  const totalSpend = useMemo(() => orders.reduce((sum, order) => sum + getOrderAmount(order), 0), [orders]);

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        if (filterTab === 'all') return true;
        if (filterTab === 'active') return ACTIVE_STATUSES.has(order.status);
        if (filterTab === 'delivered') return DONE_STATUSES.has(order.status);
        if (filterTab === 'cancelled') return order.status === 'cancelled';
        return true;
      }),
    [filterTab, orders]
  );

  const addresses = useMemo(() => {
    const map = new Map<string, { label: string; detail: string; count: number; source: string }>();
    const profileAddress = String(user.area ?? '').trim();
    if (profileAddress) {
      map.set(profileAddress.toLowerCase(), {
        label: localize(language, 'العنوان الافتراضي', 'Default Address'),
        detail: profileAddress,
        count: 0,
        source: 'profile',
      });
    }

    for (const order of orders) {
      const detail = String(order.deliveryAddress ?? '').trim();
      if (!detail) continue;
      const key = detail.toLowerCase();
      const current = map.get(key);
      map.set(key, {
        label: current?.label ?? `${localize(language, 'عنوان', 'Address')} ${n(map.size + 1)}`,
        detail,
        count: (current?.count ?? 0) + 1,
        source: current?.source ?? 'orders',
      });
    }

    return Array.from(map.values());
  }, [orders, user.area]);

  const invoiceOrders = useMemo(
    () =>
      orders.filter((order) => DONE_STATUSES.has(order.status) || order.paymentStatus === 'paid' || getOrderAmount(order) > 0),
    [orders]
  );

  const tabs: Array<{ id: DashboardTab; label: string; icon: LucideIcon }> = [
    { id: 'overview', label: localize(language, 'الرئيسية', 'Overview'), icon: LayoutDashboard },
    { id: 'orders', label: localize(language, 'طلباتي', 'My Orders'), icon: ShoppingBag },
    { id: 'addresses', label: localize(language, 'العناوين', 'Addresses'), icon: MapPin },
    { id: 'invoices', label: localize(language, 'الفواتير', 'Invoices'), icon: FileText },
    { id: 'profile', label: localize(language, 'الملف الشخصي', 'Profile'), icon: Settings },
  ];

  const stats = [
    { label: localize(language, 'طلبات نشطة', 'Active Orders'), value: n(activeOrders.length), icon: Clock, color: 'text-secondary' },
    { label: localize(language, 'طلبات مكتملة', 'Completed Orders'), value: n(completedOrders.length), icon: CheckCircle2, color: 'text-success' },
    { label: localize(language, 'إجمالي الإنفاق', 'Total Spend'), value: money(totalSpend), icon: TrendingUp, color: 'text-primary' },
    { label: localize(language, 'نقاط الولاء', 'Loyalty Points'), value: n(Math.floor(totalSpend / 5)), icon: Crown, color: 'text-amber-500' },
  ];

  const findPricingMatch = (item: CustomerOrderPosItem) => {
    const barcode = String(item.barcode ?? '').trim();
    if (barcode) {
      const byBarcode = pricing.find((entry) => entry.barcode === barcode);
      if (byBarcode) return byBarcode;
    }

    const itemName = normalizeLookup(item.name);
    if (!itemName) return undefined;
    return pricing.find((entry) => {
      const names = [entry.name_ar, entry.name_en, entry.category].map(normalizeLookup).filter(Boolean);
      return names.some((name) => itemName.includes(name) || name.includes(itemName));
    });
  };

  const getItemIcon = (item: CustomerOrderPosItem) => {
    const pricingMatch = findPricingMatch(item);
    return pricingMatch ? resolvePricingItemIcon(pricingMatch) : 'folded_laundry';
  };

  const syncOrder = async (orderId: string) => {
    if (!onSyncOrderWithPos || syncingIds.has(orderId)) return;
    setSyncErrors((prev) => {
      const next = { ...prev };
      delete next[orderId];
      return next;
    });
    setSyncingIds((prev) => new Set(prev).add(orderId));
    try {
      await onSyncOrderWithPos(orderId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error ?? '');
      setSyncErrors((prev) => ({
        ...prev,
        [orderId]: message || localize(language, 'تعذرت مزامنة الطلب مع POS.', 'Could not sync the order with POS.'),
      }));
    } finally {
      setSyncingIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
    }
  };

  useEffect(() => {
    if (!onSyncOrderWithPos || activeTab !== 'orders') return;
    for (const order of orders.slice(0, 4)) {
      if (order.pos?.synced_at || autoSyncedIds.current.has(order.id)) continue;
      autoSyncedIds.current.add(order.id);
      void syncOrder(order.id);
    }
  }, [activeTab, onSyncOrderWithPos, orders]);

  const renderOrderCards = (rows: Order[]) => (
    <div className="space-y-4">
      {rows.map((order) => {
        const systemOrder = getSystemOrderLabel(order);
        const posItems = order.pos?.items?.length ? order.pos.items : getFallbackOrderItems(order);
        const isSyncing = syncingIds.has(order.id);
        const posStatus = String(order.pos?.status ?? '').trim();
        const itemCount = Number(order.pos?.item_count ?? order.itemCount ?? 0) || 0;

        return (
          <motion.article
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[1.75rem] border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="p-5 md:p-6 border-b border-gray-100 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <ReceiptText size={25} />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-[11px] font-black text-white">
                      <Hash size={13} />
                      {localize(language, 'طلب الاستلام', 'Pickup Order')} {order.id}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black ${
                        systemOrder ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {localize(language, 'طلب النظام', 'System Order')} {systemOrder || localize(language, 'غير متزامن', 'Not Synced')}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-secondary">{order.serviceType || localize(language, 'خدمة غسيل وكي', 'Laundry Service')}</p>
                  <p className="text-xs font-medium text-gray-400 mt-1">
                    {getOrderDate(order)} · {order.pickupSlot || localize(language, 'موعد الاستلام غير محدد', 'Pickup slot not set')}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider ${
                    DONE_STATUSES.has(order.status)
                      ? 'bg-success/10 text-success'
                      : order.status === 'cancelled'
                        ? 'bg-danger/10 text-danger'
                        : 'bg-secondary/10 text-secondary'
                  }`}
                >
                  {localize(language, 'الموقع', 'Status')}: {statusLabel(order.status)}
                </span>
                <span
                  className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider ${
                    posStatus ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  POS: {posStatus || localize(language, 'بانتظار المزامنة', 'Waiting for Sync')}
                </span>
                {onSyncOrderWithPos && (
                  <button
                    onClick={() => void syncOrder(order.id)}
                    disabled={isSyncing}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-white text-xs font-bold disabled:opacity-60"
                  >
                    <RefreshCcw size={14} className={isSyncing ? 'animate-spin' : ''} />
                    {isSyncing ? localize(language, 'جار التحديث', 'Updating') : localize(language, 'تحديث POS', 'Sync POS')}
                  </button>
                )}
              </div>
            </div>

            {syncErrors[order.id] && (
              <div className="mx-5 md:mx-6 mt-4 rounded-2xl bg-danger/5 border border-danger/10 p-3 text-xs font-bold text-danger">
                {syncErrors[order.id]}
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-5 p-5 md:p-6">
              <div className="space-y-3">
                {posItems.length > 0 ? (
                  posItems.map((item) => {
                    const quantity = Number(item.quantity ?? 0) || 0;
                    const unitPrice = Number(item.unit_price ?? 0) || 0;
                    const total = Number(item.total ?? quantity * unitPrice) || 0;

                    return (
                      <div key={item.id || item.name} className="flex items-center gap-4 rounded-2xl bg-gray-50 p-4">
                        <LaundryIcon
                          name={getItemIcon(item)}
                          alt={item.name}
                          className="h-14 w-14 rounded-2xl bg-white p-1.5 shadow-sm"
                          imageClassName="h-full w-full object-contain"
                          fallback={<Shirt size={26} className="text-primary" />}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-black text-secondary truncate">{item.name}</p>
                          <p className="text-[11px] font-bold text-gray-400 mt-1">
                            {item.service || item.unit || localize(language, 'قطعة', 'Item')} · {localize(language, 'الكمية', 'Qty')} {quantity ? n(quantity) : '-'}
                          </p>
                        </div>
                        <div className="text-left shrink-0">
                          <p className="text-[11px] font-bold text-gray-400">{localize(language, 'سعر القطعة', 'Unit Price')}</p>
                          <p className="font-black text-secondary">{unitPrice ? money(unitPrice) : '-'}</p>
                          <p className="text-xs font-black text-primary mt-1">{total ? money(total) : ''}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-2xl bg-gray-50 p-8 text-center">
                    <Package className="mx-auto mb-3 text-gray-300" size={40} />
                    <p className="font-bold text-gray-400">
                      {localize(language, 'ستظهر تفاصيل القطع بعد مزامنة طلب النظام.', 'Item details will appear after syncing the system order.')}
                    </p>
                  </div>
                )}
              </div>

              <aside className="rounded-2xl bg-secondary p-5 text-white flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{localize(language, 'العنوان', 'Address')}</p>
                    <p className="text-sm font-bold leading-relaxed">{order.deliveryAddress || order.pos?.customer_address || '-'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{localize(language, 'القطع', 'Items')}</p>
                      <p className="text-lg font-black">{itemCount ? n(itemCount) : '-'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{localize(language, 'الدفع', 'Payment')}</p>
                      <p className="text-sm font-black">{paymentLabel(order.pos?.payment_status || order.paymentStatus)}</p>
                    </div>
                  </div>
                  {order.pos?.synced_at && (
                    <p className="text-[11px] font-bold text-white/35">
                      {localize(language, 'آخر مزامنة', 'Last Sync')}: {new Date(order.pos.synced_at).toLocaleString(dateLocale)}
                    </p>
                  )}
                </div>
                <div className="border-t border-white/10 pt-5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">{localize(language, 'الإجمالي من النظام', 'System Total')}</p>
                  <p className="text-3xl font-black italic text-primary">{money(getOrderAmount(order))}</p>
                  {Number(order.pos?.balance ?? 0) > 0 && (
                    <p className="text-xs font-bold text-white/45 mt-2">
                      {localize(language, 'المتبقي', 'Balance')}: {money(Number(order.pos?.balance ?? 0))}
                    </p>
                  )}
                  <button onClick={() => setViewingOrder(order)} className="mt-5 w-full rounded-xl bg-white px-4 py-3 text-sm font-black text-secondary">
                    {localize(language, 'عرض التفاصيل', 'View Details')}
                  </button>
                </div>
              </aside>
            </div>
          </motion.article>
        );
      })}

      {rows.length === 0 && (
        <section className="bg-white rounded-[2rem] border border-gray-100 p-16 text-center shadow-sm">
          <Package className="mx-auto mb-3 text-gray-300" size={42} />
          <p className="text-gray-400 font-bold">{localize(language, 'لا توجد طلبات مطابقة حالياً', 'No matching orders right now')}</p>
        </section>
      )}
    </div>
  );

  const renderOrdersTable = (rows: Order[]) => (
    <section className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto text-sm">
        <table className="w-full text-right">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-5 font-bold uppercase text-[10px] tracking-widest text-gray-400">{localize(language, 'رقم الطلب', 'Order No.')}</th>
              <th className="px-6 py-5 font-bold uppercase text-[10px] tracking-widest text-gray-400">{localize(language, 'التاريخ', 'Date')}</th>
              <th className="px-6 py-5 font-bold uppercase text-[10px] tracking-widest text-gray-400">{localize(language, 'الخدمة', 'Service')}</th>
              <th className="px-6 py-5 font-bold uppercase text-[10px] tracking-widest text-gray-400">{localize(language, 'الحالة', 'Status')}</th>
              <th className="px-6 py-5 font-bold uppercase text-[10px] tracking-widest text-gray-400">{localize(language, 'المبلغ', 'Amount')}</th>
              <th className="px-6 py-5 font-bold uppercase text-[10px] tracking-widest text-gray-400 text-left">{localize(language, 'الإجراء', 'Action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-5 font-bold text-secondary">#{order.id}</td>
                <td className="px-6 py-5 text-gray-500 font-medium whitespace-nowrap">{getOrderDate(order)}</td>
                <td className="px-6 py-5 text-secondary font-medium min-w-[180px]">{order.serviceType || '-'}</td>
                <td className="px-6 py-5">
                  <span
                    className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${
                      DONE_STATUSES.has(order.status)
                        ? 'bg-success/10 text-success'
                        : order.status === 'cancelled'
                          ? 'bg-danger/10 text-danger'
                          : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {statusLabel(order.status)}
                  </span>
                </td>
                <td className="px-6 py-5 font-bold text-secondary whitespace-nowrap">{money(getOrderAmount(order))}</td>
                <td className="px-6 py-5 text-left">
                  <button onClick={() => setViewingOrder(order)} className="text-primary font-bold hover:underline">
                    {localize(language, 'تفاصيل', 'Details')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && (
          <div className="p-16 text-center">
            <Package className="mx-auto mb-3 text-gray-300" size={42} />
            <p className="text-gray-400 font-bold">{localize(language, 'لا توجد بيانات حالياً', 'No data available right now')}</p>
          </div>
        )}
      </div>
    </section>
  );

  return (
    <div className="pt-24 min-h-screen bg-brand-bg flex">
      <aside className="hidden lg:flex w-72 flex-col p-8 border-r border-gray-200">
        <div className="flex items-center gap-3 mb-10 p-3 bg-white rounded-2xl shadow-sm">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <User size={24} />
          </div>
          <div>
            <p className="font-bold text-secondary leading-tight">{user.name}</p>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{user.phone}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {tabs.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all ${
                  activeTab === item.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-secondary'
                }`}
              >
                <Icon size={20} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <button onClick={onLogout} className="flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-danger hover:bg-danger/5 transition-all mt-auto">
          <LogOut size={20} />
          {localize(language, 'تسجيل الخروج', 'Log Out')}
        </button>
      </aside>

      <main className="flex-1 p-5 md:p-10 overflow-y-auto">
        <div className={`max-w-6xl mx-auto ${language === 'ar' ? 'text-right' : 'text-left'}`}>
          <header className="flex flex-col gap-5 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5">
              <div>
                <h1 className="text-3xl font-extrabold mb-2 italic">
                  {localize(language, 'أهلاً بك،', 'Welcome,')} <span className="text-primary italic">{firstName}</span>
                </h1>
                <p className="text-gray-500 font-medium">
                  {localize(language, 'طلباتك وبياناتك متزامنة مع النظام عبر رقم الجوال المسجل.', 'Your orders and profile are synced with the system using your registered phone number.')}
                </p>
              </div>
              <button onClick={onNewOrderClick} className="px-6 py-3 bg-secondary text-white rounded-xl text-sm font-bold shadow-lg">
                {localize(language, 'طلب جديد', 'New Order')}
              </button>
            </div>

            <div className="lg:hidden overflow-x-auto">
              <div className="flex gap-2 min-w-max bg-white p-2 rounded-2xl border border-gray-100">
                {tabs.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${
                        activeTab === item.id ? 'bg-primary text-white' : 'text-gray-500'
                      }`}
                    >
                      <Icon size={16} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </header>

          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {stats.map((stat, idx) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50"
                  >
                    <div className={`${stat.color} mb-4`}>
                      <stat.icon size={24} />
                    </div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-2xl font-extrabold leading-tight">{stat.value}</p>
                  </motion.div>
                ))}
              </div>

              <section className="bg-secondary text-white rounded-[2rem] p-7 md:p-10 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row justify-between gap-5 mb-8">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 bg-primary rounded-full mb-4 inline-block">
                        {localize(language, 'تتبع مباشر', 'Live Tracking')}
                      </span>
                      <h2 className="text-2xl md:text-3xl font-extrabold italic leading-tight">
                        {activeOrder ? `${localize(language, 'طلبك', 'Your Order')} #${activeOrder.id}` : localize(language, 'لا توجد طلبات نشطة حالياً', 'No active orders right now')}
                      </h2>
                      <p className="text-white/50 text-sm mt-2 font-medium">
                        {activeOrder ? activeOrder.deliveryAddress || localize(language, 'عنوان الطلب غير محدد', 'Order address is not set') : localize(language, 'ابدأ طلباً جديداً وسنظهر لك حالة التنفيذ هنا.', 'Start a new order and we will show progress here.')}
                      </p>
                    </div>
                    <button onClick={onNewOrderClick} className="self-start px-5 py-3 bg-white text-secondary rounded-xl text-sm font-bold">
                      {localize(language, 'طلب جديد', 'New Order')}
                    </button>
                  </div>

                  {activeOrder && (
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                      {JOURNEY_LABELS[language].map((label, index) => {
                        const currentStep = STATUS_STEP[activeOrder.status] ?? 0;
                        const done = index <= currentStep && activeOrder.status !== 'cancelled';
                        return (
                          <div key={label} className="flex flex-col items-center gap-3">
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${done ? 'bg-primary text-white' : 'bg-white/10 text-white/40'}`}>
                              {done ? <CheckCircle2 size={22} /> : <Clock size={20} />}
                            </div>
                            <span className={`text-[11px] font-bold ${done ? 'text-primary' : 'text-white/40'}`}>{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>

              <div className="space-y-4">
                <h3 className="text-xl font-bold italic">{localize(language, 'أحدث الطلبات', 'Latest Orders')}</h3>
                {renderOrdersTable(orders.slice(0, 5))}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-5">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <h2 className="text-2xl font-black italic">{localize(language, 'طلباتي', 'My Orders')}</h2>
                <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 gap-1 self-start">
                  {[
                    { id: 'all', label: localize(language, 'الكل', 'All') },
                    { id: 'active', label: localize(language, 'قيد التنفيذ', 'Active') },
                    { id: 'delivered', label: localize(language, 'مكتمل', 'Completed') },
                    { id: 'cancelled', label: localize(language, 'ملغي', 'Cancelled') },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setFilterTab(tab.id as OrderFilter)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                        filterTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              {renderOrderCards(filteredOrders)}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="space-y-5">
              <h2 className="text-2xl font-black italic">{localize(language, 'العناوين', 'Addresses')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {addresses.map((address) => (
                  <div key={address.detail} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5">
                      <MapPin size={22} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{address.label}</p>
                    <p className="font-bold text-secondary leading-relaxed">{address.detail}</p>
                    <p className="text-xs text-gray-400 mt-4">
                      {localize(language, 'استخدم في', 'Used in')} {n(address.count)} {localize(language, 'طلب', 'orders')}
                    </p>
                  </div>
                ))}
                {addresses.length === 0 && (
                  <div className="bg-white p-10 rounded-2xl border border-gray-100 text-center md:col-span-2">
                    <MapPin className="mx-auto mb-3 text-gray-300" size={42} />
                    <p className="font-bold text-gray-400">{localize(language, 'لا توجد عناوين محفوظة بعد', 'No saved addresses yet')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="space-y-5">
              <h2 className="text-2xl font-black italic">{localize(language, 'الفواتير', 'Invoices')}</h2>
              <section className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto text-sm">
                  <table className="w-full text-right">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-5 font-bold uppercase text-[10px] tracking-widest text-gray-400">{localize(language, 'الفاتورة', 'Invoice')}</th>
                        <th className="px-6 py-5 font-bold uppercase text-[10px] tracking-widest text-gray-400">{localize(language, 'التاريخ', 'Date')}</th>
                        <th className="px-6 py-5 font-bold uppercase text-[10px] tracking-widest text-gray-400">{localize(language, 'الحالة', 'Status')}</th>
                        <th className="px-6 py-5 font-bold uppercase text-[10px] tracking-widest text-gray-400">{localize(language, 'الدفع', 'Payment')}</th>
                        <th className="px-6 py-5 font-bold uppercase text-[10px] tracking-widest text-gray-400">{localize(language, 'المبلغ', 'Amount')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {invoiceOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-5 font-bold text-secondary">
                            {order.pos?.invoice_no || getSystemOrderLabel(order) || `INV-${order.id}`}
                          </td>
                          <td className="px-6 py-5 text-gray-500 font-medium">{getOrderDate(order)}</td>
                          <td className="px-6 py-5 text-secondary font-medium">{statusLabel(order.status)}</td>
                          <td className="px-6 py-5 text-gray-500 font-medium">{paymentLabel(order.paymentStatus)}</td>
                          <td className="px-6 py-5 font-bold text-primary">{money(getOrderAmount(order))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {invoiceOrders.length === 0 && (
                    <div className="p-16 text-center">
                      <FileText className="mx-auto mb-3 text-gray-300" size={42} />
                      <p className="text-gray-400 font-bold">{localize(language, 'لا توجد فواتير متاحة حالياً', 'No invoices available right now')}</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-5">
              <h2 className="text-2xl font-black italic">{localize(language, 'الملف الشخصي', 'Profile')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  [localize(language, 'الاسم', 'Name'), user.name || '-'],
                  [localize(language, 'الجوال', 'Phone'), user.phone || '-'],
                  [localize(language, 'البريد الإلكتروني', 'Email'), user.email || '-'],
                  [localize(language, 'نوع الحساب', 'Account Type'), user.type === 'business' ? localize(language, 'شركة', 'Business') : localize(language, 'فرد', 'Individual')],
                  [localize(language, 'المنطقة', 'Area'), user.area || '-'],
                  [localize(language, 'الإشعارات', 'Notifications'), user.notifType || 'whatsapp'],
                  [localize(language, 'تاريخ الإنشاء', 'Created At'), user.created_at ? new Date(user.created_at).toLocaleDateString(dateLocale) : '-'],
                  [localize(language, 'آخر دخول', 'Last Login'), user.last_login_at ? new Date(user.last_login_at).toLocaleDateString(dateLocale) : '-'],
                ].map(([label, value]) => (
                  <div key={label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">{label}</p>
                    <p className="font-bold text-secondary" dir={label === localize(language, 'الجوال', 'Phone') ? 'ltr' : language === 'ar' ? 'rtl' : 'ltr'}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {viewingOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingOrder(null)}
              className="absolute inset-0 bg-secondary/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 18 }}
              className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-7 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h3 className="text-2xl font-black italic">{localize(language, 'تفاصيل الطلب', 'Order Details')}</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                    {localize(language, 'طلب الاستلام', 'Pickup Order')} #{viewingOrder.id}
                    {getSystemOrderLabel(viewingOrder) ? ` · ${localize(language, 'طلب النظام', 'System Order')} ${getSystemOrderLabel(viewingOrder)}` : ''}
                  </p>
                </div>
                <button onClick={() => setViewingOrder(null)} className="w-11 h-11 bg-white shadow-sm flex items-center justify-center rounded-2xl hover:bg-gray-100">
                  <X size={22} className="text-secondary" />
                </button>
              </div>

              <div className="p-7 overflow-y-auto space-y-6 text-right">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{localize(language, 'الحالة', 'Status')}</p>
                    <p className="font-bold text-secondary">{statusLabel(viewingOrder.status)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{localize(language, 'التاريخ', 'Date')}</p>
                    <p className="font-bold text-secondary">{getOrderDate(viewingOrder)}</p>
                  </div>
                </div>

                <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 flex gap-4 items-start">
                  <MapPin size={22} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-[10px] font-bold text-primary uppercase mb-1">{localize(language, 'العنوان', 'Address')}</p>
                    <p className="text-sm font-bold text-secondary leading-relaxed">{viewingOrder.deliveryAddress || '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{localize(language, 'الخدمة', 'Service')}</p>
                    <p className="font-bold text-secondary">{viewingOrder.serviceType || '-'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{localize(language, 'رقم الجوال', 'Phone Number')}</p>
                    <p className="font-bold text-secondary" dir="ltr">{getOrderPhone(viewingOrder) || user.phone}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{localize(language, 'تفاصيل القطع من POS', 'POS Item Details')}</p>
                    <span className="text-[10px] font-bold text-primary">
                      {viewingOrder.pos?.synced_at ? localize(language, 'متزامن', 'Synced') : localize(language, 'غير متزامن', 'Not Synced')}
                    </span>
                  </div>
                  {(viewingOrder.pos?.items?.length ? viewingOrder.pos.items : getFallbackOrderItems(viewingOrder)).map((item) => {
                    const quantity = Number(item.quantity ?? 0) || 0;
                    const unitPrice = Number(item.unit_price ?? 0) || 0;
                    const total = Number(item.total ?? quantity * unitPrice) || 0;

                    return (
                      <div key={item.id || item.name} className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4">
                        <LaundryIcon
                          name={getItemIcon(item)}
                          alt={item.name}
                          className="h-12 w-12 rounded-2xl bg-white p-1.5 shadow-sm"
                          imageClassName="h-full w-full object-contain"
                          fallback={<Shirt size={24} className="text-primary" />}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-secondary truncate">{item.name}</p>
                          <p className="text-[11px] text-gray-400 font-bold">
                            {localize(language, 'الكمية', 'Qty')} {quantity ? n(quantity) : '-'} · {localize(language, 'سعر القطعة', 'Unit Price')} {unitPrice ? money(unitPrice) : '-'}
                          </p>
                        </div>
                        <p className="font-black text-primary whitespace-nowrap">{total ? money(total) : '-'}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-secondary text-white p-7 rounded-[2rem] flex justify-between items-center">
                  <div>
                    <p className="text-white/40 text-[10px] font-bold uppercase mb-1">{localize(language, 'الإجمالي', 'Total')}</p>
                    <p className="text-3xl font-black italic leading-none">{money(getOrderAmount(viewingOrder))}</p>
                  </div>
                  <FileText className="text-primary" size={28} />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
