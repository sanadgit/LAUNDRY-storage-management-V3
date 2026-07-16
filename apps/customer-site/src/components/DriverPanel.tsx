import React, { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Bell,
  CheckCircle2,
  ClipboardList,
  Clock3,
  MessageCircle,
  LogOut,
  MapPin,
  Navigation,
  PackageCheck,
  Phone,
  Radar,
  Route,
  Search,
  ShieldCheck,
  Truck,
  User,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Driver, Order, OrderStatus } from '../types';
import { cn } from '../lib/utils';
import { SiteLanguage, localize } from '../lib/i18n';

interface DriverPanelProps {
  driver: Driver;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onLogout: () => void;
  language?: SiteLanguage;
}

const statusLabel: Record<OrderStatus, string> = {
  new: 'New pickup',
  accepted: 'Assigned',
  on_the_way: 'Driver en route',
  pickup: 'Collected',
  washing: 'In care',
  ready: 'Ready',
  delivery: 'Out delivery',
  completed: 'Completed',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const fleet = [
  { id: 'DRV-001', name: 'Ahmed Saleh', zone: 'Al Falah', load: 4, eta: '12 min', x: 23, y: 28, status: 'Online' },
  { id: 'DRV-002', name: 'Khalid Noor', zone: 'Mussaffah', load: 2, eta: '18 min', x: 58, y: 44, status: 'Online' },
  { id: 'DRV-003', name: 'Rami Y.', zone: 'MBZ City', load: 6, eta: '24 min', x: 72, y: 68, status: 'Busy' },
];

const driverStatusFlow: OrderStatus[] = ['accepted', 'on_the_way', 'pickup', 'delivery', 'delivered'];

export const DriverPanel: React.FC<DriverPanelProps> = ({ driver, orders, onUpdateOrderStatus, onLogout, language = 'ar' }) => {
  const [query, setQuery] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState(driver.id || fleet[0].id);
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0]?.id || '');
  const [failedOrderId, setFailedOrderId] = useState('');
  const [proofOrderId, setProofOrderId] = useState('');
  const t = (ar: string, en: string) => localize(language, ar, en);

  const dispatchOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders
      .filter((order) => {
        const mine = !order.assignedDriverId || order.assignedDriverId === driver.id;
        return mine && ['new', 'accepted', 'on_the_way', 'ready', 'delivery', 'pickup'].includes(order.status);
      })
      .filter((order) => !q || [order.id, order.customerName, order.deliveryAddress, order.branch].some((value) => String(value || '').toLowerCase().includes(q)))
      .slice(0, 12);
  }, [orders, query, driver.id]);

  const activeOrder = dispatchOrders.find((order) => order.id === selectedOrderId) || dispatchOrders[0];
  const selectedDriver = fleet.find((item) => item.id === selectedDriverId) || fleet[0];

  const assignOrder = () => {
    if (!activeOrder) return;
    onUpdateOrderStatus(activeOrder.id, activeOrder.status === 'ready' ? 'delivery' : 'accepted');
  };

  const advanceOrder = () => {
    if (!activeOrder) return;
    const current = activeOrder.status === 'new' || activeOrder.status === 'ready'
      ? (activeOrder.status === 'ready' ? 'delivery' : 'accepted')
      : activeOrder.status;
    const index = driverStatusFlow.indexOf(current);
    const nextStatus = driverStatusFlow[Math.min(index + 1, driverStatusFlow.length - 1)] || current;
    onUpdateOrderStatus(activeOrder.id, nextStatus);
  };

  const markUnreachable = () => {
    if (!activeOrder) return;
    setFailedOrderId(activeOrder.id);
    onUpdateOrderStatus(activeOrder.id, 'accepted');
  };

  return (
    <main className="min-h-screen bg-[#F2F2F2] text-[#0D0D0D]">
      <div className="grid min-h-screen lg:grid-cols-[300px_1fr]">
        <aside className="hidden border-e border-white/70 bg-white/58 p-4 shadow-glass backdrop-blur-3xl lg:block">
          <div className="flex h-full flex-col">
            <div className="rounded-2xl bg-gradient-to-br from-primary to-[#7D5CF2] p-5 text-white shadow-high">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-xl bg-white/16">
                  <Route className="size-6" />
                </span>
                <div>
                  <p className="font-display text-xl font-extrabold">{t('السائق', 'Driver')}</p>
                  <p className="text-xs font-semibold text-white/70">{driver.name}</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-white/12 p-3">
                  <p className="text-white/60">{t('مهامي', 'Active')}</p>
                  <p className="text-2xl font-extrabold">{dispatchOrders.length}</p>
                </div>
                <div className="rounded-xl bg-white/12 p-3">
                  <p className="text-white/60">{t('منجزة', 'Done')}</p>
                  <p className="text-2xl font-extrabold">{driver.orders_completed || 0}</p>
                </div>
              </div>
            </div>

            <nav className="mt-5 grid gap-2">
              {[
                { icon: Radar, label: t('الخريطة', 'Live Map') },
                { icon: Truck, label: t('مهامي', 'My Missions') },
                { icon: ClipboardList, label: t('قائمة الطلبات', 'Dispatch Queue') },
                { icon: ShieldCheck, label: t('إثبات التسليم', 'Proof Control') },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className={cn('flex min-h-12 items-center gap-3 rounded-xl px-3 text-start text-sm font-bold', index === 0 ? 'bg-primary text-white' : 'text-[#464350] hover:bg-white/72')}
                    type="button"
                  >
                    <Icon className="size-5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={onLogout}
              className="mt-auto flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-bold text-danger hover:bg-danger/10"
            >
              <LogOut className="size-5" />
              {t('تسجيل الخروج', 'Sign out')}
            </button>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-white/70 bg-white/64 px-4 py-4 shadow-low backdrop-blur-3xl md:px-6">
            <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.1em] text-primary">In & Out Driver</p>
                <h1 className="mt-1 font-display text-3xl font-extrabold text-[#0D0D0D] md:text-5xl">{t('لوحة مهام السائق', 'Driver mission board')}</h1>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#6d667d]" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="h-12 w-full rounded-xl border border-white/70 bg-white/72 pl-10 pr-4 text-sm font-semibold outline-none shadow-low focus:border-primary focus:ring-4 focus:ring-primary/15 sm:w-80"
                    placeholder={t('ابحث بالطلب أو العميل أو الفرع...', 'Search order, branch, customer...')}
                  />
                </div>
                <button className="flex h-12 items-center justify-center gap-2 rounded-xl border border-white/70 bg-white/72 px-4 font-bold shadow-low">
                  <Bell className="size-4 text-primary" />
                  {t('تنبيهات', 'Alerts')}
                </button>
              </div>
            </div>
          </header>

          <div className="grid gap-5 p-4 md:p-6 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/62 shadow-glass backdrop-blur-3xl">
              <div className="flex items-center justify-between border-b border-[#B7A7F2] p-5">
                <div>
                  <h2 className="font-display text-2xl font-extrabold">{t('مسار اليوم', 'Today route')}</h2>
                  <p className="mt-1 text-sm text-[#464350]">{t('عرض سريع للطلبات النشطة وموقع العميل.', 'Fast view for active missions and customer location.')}</p>
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 font-mono text-xs font-bold uppercase text-white">Live</span>
              </div>

              <div className="relative h-[520px] overflow-hidden bg-[#f8f1fb]">
                <div className="absolute inset-0 opacity-80 hero-grid" />
                <div className="absolute left-[8%] top-[18%] h-[66%] w-[78%] rounded-[48%] border border-primary/15" />
                <div className="absolute left-[20%] top-[28%] h-[45%] w-[58%] rounded-[48%] border border-secondary/20" />
                <div className="absolute left-[15%] right-[10%] top-1/2 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-secondary via-accent to-primary opacity-70" />
                <div className="absolute bottom-[22%] left-[22%] right-[18%] h-2 rotate-[-22deg] rounded-full bg-gradient-to-r from-primary via-[#B7A7F2] to-secondary opacity-50" />

                {fleet.map((item) => {
                  const selected = item.id === selectedDriverId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedDriverId(item.id)}
                      style={{ left: `${item.x}%`, top: `${item.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 text-start"
                    >
                      <span className={cn('relative grid size-12 place-items-center rounded-full border-4 border-white shadow-high', selected ? 'bg-primary text-white' : 'bg-secondary text-white')}>
                        <Truck className="size-5" />
                        {selected ? <span className="absolute inset-0 rounded-full bg-primary/30 motion-safe:animate-ping" /> : null}
                      </span>
                      <span className="mt-2 block min-w-32 rounded-xl border border-white/70 bg-white/84 p-2 text-xs font-bold shadow-low backdrop-blur-xl">
                        {item.name}
                        <span className="block font-mono text-[10px] uppercase text-primary">{item.zone} · {item.eta}</span>
                      </span>
                    </button>
                  );
                })}

                {activeOrder ? (
                  <motion.div
                    layout
                    className="absolute bottom-5 left-5 right-5 rounded-[1.5rem] border border-white/70 bg-white/82 p-4 shadow-high backdrop-blur-3xl md:left-auto md:w-[360px]"
                  >
                    <p className="font-mono text-xs font-bold uppercase text-primary">{t('المهمة المحددة', 'Selected mission')}</p>
                    <div className="mt-2 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-xl font-extrabold" dir="ltr">{activeOrder.id}</h3>
                        <p className="mt-1 text-sm font-semibold text-[#464350]">{activeOrder.customerName}</p>
                      </div>
                      <span className="rounded-full bg-[#F2F2F2] px-3 py-1 text-xs font-bold text-primary">{statusLabel[activeOrder.status]}</span>
                    </div>
                    <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-[#464350]">
                      <MapPin className="mt-1 size-4 shrink-0 text-primary" />
                      {activeOrder.deliveryAddress || 'Customer villa address pending'}
                    </p>
                    <DriverActions order={activeOrder} language={language} />
                  </motion.div>
                ) : null}
              </div>
            </section>

            <section className="grid gap-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <Metric icon={PackageCheck} label={t('مهام اليوم', 'Today missions')} value={String(dispatchOrders.length)} />
                <Metric icon={Clock3} label={t('متوسط الوصول', 'Avg ETA')} value={selectedDriver?.eta || '18 min'} />
                <Metric icon={Zap} label={t('تحسين المسار', 'Route gain')} value="14%" />
              </div>

              <div className="rounded-[2rem] border border-white/70 bg-white/72 p-5 shadow-glass backdrop-blur-3xl">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-extrabold">{t('بطاقة السائق', 'Driver card')}</h2>
                    <p className="text-sm text-[#464350]">{t('حالة السائق ونطاق العمل الحالي.', 'Driver state and current working zone.')}</p>
                  </div>
                  <Navigation className="size-6 text-primary" />
                </div>
                <div className="grid gap-3">
                  {[{
                    id: driver.id,
                    name: driver.name,
                    zone: driver.branch || selectedDriver?.zone || 'Abu Dhabi',
                    load: dispatchOrders.length,
                    eta: selectedDriver?.eta || '18 min',
                    status: driver.status || 'online',
                  }, ...fleet.filter((item) => item.id !== driver.id).slice(0, 2)].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedDriverId(item.id)}
                      className={cn('grid gap-3 rounded-2xl border p-4 text-start transition sm:grid-cols-[1fr_auto] sm:items-center', selectedDriverId === item.id ? 'border-primary bg-[#F2F2F2]/45' : 'border-[#B7A7F2] bg-white hover:border-primary/40')}
                    >
                      <span>
                        <span className="block font-display text-lg font-extrabold">{item.name}</span>
                        <span className="mt-1 block text-sm text-[#464350]">{item.zone} · {item.load} active · ETA {item.eta}</span>
                      </span>
                      <span className={cn('w-fit rounded-full px-3 py-1 text-xs font-bold', String(item.status).toLowerCase() === 'online' || String(item.status).toLowerCase() === 'available' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning')}>{item.status}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/70 bg-white/72 p-5 shadow-glass backdrop-blur-3xl">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-2xl font-extrabold">{t('قائمة الطلبات', 'Order queue')}</h2>
                    <p className="text-sm text-[#464350]">{t('طلبات الاستلام والتسليم الجاهزة.', 'Pickup and ready delivery missions.')}</p>
                  </div>
                  <ClipboardList className="size-6 text-primary" />
                </div>
                <div className="grid max-h-[390px] gap-3 overflow-y-auto pr-1">
                  {dispatchOrders.map((order) => (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => setSelectedOrderId(order.id)}
                      className={cn('rounded-2xl border p-4 text-start transition', (activeOrder?.id === order.id) ? 'border-primary bg-[#F2F2F2]/45' : 'border-[#B7A7F2] bg-white hover:border-primary/40')}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-display text-lg font-extrabold" dir="ltr">{order.id}</p>
                          <p className="mt-1 text-sm text-[#464350]">{order.customerName} · {order.serviceType}</p>
                          <p className="mt-2 flex items-start gap-2 text-xs text-[#6d667d]">
                            <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" />
                            {order.deliveryAddress || t('العنوان غير مكتمل', 'Address pending')}
                          </p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-primary shadow-low">{statusLabel[order.status]}</span>
                      </div>
                      <div className="mt-3">
                        <DriverActions order={order} language={language} compact />
                      </div>
                      {failedOrderId === order.id ? (
                        <p className="mt-3 rounded-xl bg-warning/10 p-3 text-xs font-bold text-warning">
                          {t('تم تسجيل تعذر الوصول. حاول الاتصال مرة أخرى أو انتظر تعليمات المشرف.', 'Unreachable case logged. Try calling again or wait for supervisor instructions.')}
                        </p>
                      ) : null}
                      {proofOrderId === order.id ? (
                        <p className="mt-3 rounded-xl bg-success/10 p-3 text-xs font-bold text-success">
                          {t('تم وضع علامة إثبات التسليم لهذه المهمة.', 'Proof of delivery marked for this mission.')}
                        </p>
                      ) : null}
                    </button>
                  ))}
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={assignOrder}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 font-bold text-white shadow-medium transition hover:bg-primary-hover"
                  >
                    {t('قبول المهمة', 'Accept mission')}
                    <ArrowUpRight className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={advanceOrder}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/70 bg-white px-4 font-bold text-primary shadow-low"
                  >
                    <CheckCircle2 className="size-4" />
                    {t('تحديث الحالة', 'Update stage')}
                  </button>
                  <button
                    type="button"
                    onClick={markUnreachable}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-warning/20 bg-warning/10 px-4 font-bold text-warning shadow-low sm:col-span-2"
                  >
                    <Radar className="size-4" />
                    {t('تعذر الوصول للعميل', 'Customer unreachable')}
                  </button>
                  <button
                    type="button"
                    onClick={() => activeOrder && setProofOrderId(activeOrder.id)}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-success/20 bg-success/10 px-4 font-bold text-success shadow-low sm:col-span-2"
                  >
                    <ShieldCheck className="size-4" />
                    {t('تسجيل إثبات تسليم', 'Mark delivery proof')}
                  </button>
                </div>
              </div>
            </section>
          </div>

          <div className="grid gap-4 px-4 pb-6 md:grid-cols-3 md:px-6">
            <ContactCard icon={User} label={t('السائق', 'Driver')} value={driver.name} />
            <ContactCard icon={Phone} label={t('رقم السائق', 'Driver phone')} value={driver.phone} />
            <ContactCard icon={ShieldCheck} label={t('سياسة الجودة', 'Quality policy')} value={t('إثبات التسليم مطلوب', 'Photo proof required')} />
          </div>
        </section>
      </div>
    </main>
  );
};

const DriverActions = ({ order, language, compact = false }: { order: Order; language: SiteLanguage; compact?: boolean }) => {
  const t = (ar: string, en: string) => localize(language, ar, en);
  const phone = normalizePhoneForAction(order.customerPhone);
  const address = order.locationLat && order.locationLng
    ? `${order.locationLat},${order.locationLng}`
    : order.deliveryAddress || order.mapLocationLink || order.locationLink || '';
  const mapsUrl = order.mapLocationLink || order.locationLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || order.branch || 'Abu Dhabi')}`;
  const whatsappMessage = encodeURIComponent(t(
    `مرحباً، أنا سائق In & Out Laundry بخصوص طلبك ${order.id}.`,
    `Hi, I am your In & Out Laundry driver for order ${order.id}.`,
  ));

  const actionClass = compact
    ? 'min-h-9 flex-1 rounded-lg px-2 text-xs'
    : 'min-h-10 rounded-xl px-3 text-xs';

  return (
    <div className={cn('mt-4 flex flex-wrap gap-2', compact && 'mt-0')}>
      <a
        href={phone ? `tel:${phone}` : undefined}
        className={cn('inline-flex items-center justify-center gap-2 bg-primary font-bold text-white shadow-low', actionClass, !phone && 'pointer-events-none opacity-50')}
      >
        <Phone className="size-4" />
        {t('اتصال', 'Call')}
      </a>
      <a
        href={phone ? `https://wa.me/${phone}?text=${whatsappMessage}` : undefined}
        target="_blank"
        rel="noopener noreferrer"
        className={cn('inline-flex items-center justify-center gap-2 border border-primary/20 bg-white font-bold text-primary shadow-low', actionClass, !phone && 'pointer-events-none opacity-50')}
      >
        <MessageCircle className="size-4" />
        {t('واتساب', 'WhatsApp')}
      </a>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn('inline-flex items-center justify-center gap-2 border border-primary/20 bg-white font-bold text-primary shadow-low', actionClass)}
      >
        <Navigation className="size-4" />
        {t('خرائط', 'Maps')}
      </a>
    </div>
  );
};

const Metric = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="rounded-2xl border border-white/70 bg-white/72 p-4 shadow-glass backdrop-blur-3xl">
    <Icon className="size-5 text-primary" />
    <p className="mt-4 text-sm font-semibold text-[#464350]">{label}</p>
    <p className="mt-1 font-display text-2xl font-extrabold text-primary">{value}</p>
  </div>
);

const normalizePhoneForAction = (phone?: string) => {
  const raw = String(phone || '').replace(/[^\d]/g, '');
  if (!raw) return '';
  return raw.startsWith('971') ? raw : `971${raw.replace(/^0+/, '')}`;
};

const ContactCard = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="flex items-center gap-4 rounded-2xl border border-white/70 bg-white/72 p-4 shadow-low backdrop-blur-3xl">
    <span className="grid size-11 place-items-center rounded-xl bg-[#F2F2F2] text-primary">
      <Icon className="size-5" />
    </span>
    <span>
      <span className="block text-xs font-bold uppercase text-[#6d667d]">{label}</span>
      <span className="mt-1 block font-bold">{value}</span>
    </span>
  </div>
);
