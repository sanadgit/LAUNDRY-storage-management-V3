import React, { useMemo, useState } from 'react';
import {
  Bell,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  Download,
  FileText,
  Headphones,
  Home,
  LogOut,
  MapPin,
  PackageCheck,
  Search,
  Plus,
  ReceiptText,
  RefreshCcw,
  Settings,
  ShieldCheck,
  Truck,
  User,
  WalletCards,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { CustomerUser, Order, OrderStatus, PricingItem } from '../types';
import { formatCurrency, localize, SiteLanguage } from '../lib/i18n';
import { normalizeOrderStatus } from '../lib/orders';
import { cn } from '../lib/utils';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

interface CustomerPortalProps {
  orders: Order[];
  pricing: PricingItem[];
  onNewOrderClick: () => void;
  onReorderClick?: (order: Order) => void;
  onTrackOrderClick?: (order: Order) => void;
  onSupportClick?: (order?: Order) => void;
  onLogout: () => void;
  user: CustomerUser;
  onSyncOrderWithPos?: (orderId: string) => Promise<Order>;
  language?: SiteLanguage;
}

type PortalTab = 'home' | 'orders' | 'invoices' | 'support' | 'profile';

const activeStatuses = new Set<OrderStatus>(['new', 'accepted', 'on_the_way', 'pickup', 'washing', 'ready', 'delivery']);
const paidStatuses = new Set(['paid']);

const statusIndex: Record<OrderStatus, number> = {
  new: 0,
  accepted: 1,
  on_the_way: 1,
  pickup: 2,
  washing: 3,
  ready: 6,
  delivery: 8,
  completed: 9,
  delivered: 9,
  cancelled: 0,
};

const orderStages = [
  { ar: 'استلام', en: 'Received' },
  { ar: 'فرز', en: 'Sorting' },
  { ar: 'غسيل', en: 'Washing' },
  { ar: 'تجفيف', en: 'Drying' },
  { ar: 'كي', en: 'Ironing' },
  { ar: 'جودة', en: 'QC' },
  { ar: 'تغليف', en: 'Packing' },
  { ar: 'جاهز', en: 'Ready' },
  { ar: 'توصيل', en: 'Delivery' },
  { ar: 'تم', en: 'Delivered' },
];

const statusLabels: Record<OrderStatus, { ar: string; en: string; variant: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent' }> = {
  new: { ar: 'جديد', en: 'New', variant: 'info' },
  accepted: { ar: 'تم القبول', en: 'Accepted', variant: 'info' },
  on_the_way: { ar: 'السائق في الطريق', en: 'Driver on the way', variant: 'accent' },
  pickup: { ar: 'تم الاستلام', en: 'Picked up', variant: 'accent' },
  washing: { ar: 'قيد العناية', en: 'In care', variant: 'accent' },
  ready: { ar: 'جاهز', en: 'Ready', variant: 'success' },
  delivery: { ar: 'خارج للتوصيل', en: 'Out for delivery', variant: 'warning' },
  completed: { ar: 'مكتمل', en: 'Completed', variant: 'success' },
  delivered: { ar: 'تم التسليم', en: 'Delivered', variant: 'success' },
  cancelled: { ar: 'ملغي', en: 'Cancelled', variant: 'danger' },
};

const tabItems: Array<{ id: PortalTab; icon: React.ElementType; ar: string; en: string }> = [
  { id: 'home', icon: Home, ar: 'الرئيسية', en: 'Home' },
  { id: 'orders', icon: PackageCheck, ar: 'الطلبات', en: 'Orders' },
  { id: 'invoices', icon: ReceiptText, ar: 'الفواتير', en: 'Invoices' },
  { id: 'support', icon: Headphones, ar: 'الدعم', en: 'Support' },
  { id: 'profile', icon: User, ar: 'الملف', en: 'Profile' },
];

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  orders,
  pricing,
  onNewOrderClick,
  onReorderClick,
  onTrackOrderClick,
  onSupportClick,
  onLogout,
  user,
  onSyncOrderWithPos,
  language = 'ar',
}) => {
  const [activeTab, setActiveTab] = useState<PortalTab>('home');
  const [selectedOrderId, setSelectedOrderId] = useState(orders[0]?.id || '');
  const [syncingOrderId, setSyncingOrderId] = useState('');
  const reduceMotion = useReducedMotion();
  const t = (ar: string, en: string) => localize(language, ar, en);

  const normalizedOrders = useMemo(
    () => orders.map((order) => ({ ...order, status: normalizeOrderStatus(order.status) })),
    [orders],
  );
  const activeOrders = normalizedOrders.filter((order) => activeStatuses.has(order.status));
  const latestOrder = activeOrders[0] || normalizedOrders[0];
  const selectedOrder = normalizedOrders.find((order) => order.id === selectedOrderId) || latestOrder;
  const outstandingTotal = normalizedOrders
    .filter((order) => !paidStatuses.has(String(order.paymentStatus)))
    .reduce((sum, order) => sum + getAmount(order), 0);
  const paidTotal = normalizedOrders
    .filter((order) => paidStatuses.has(String(order.paymentStatus)))
    .reduce((sum, order) => sum + getAmount(order), 0);

  const syncOrder = async (orderId: string) => {
    if (!onSyncOrderWithPos) return;
    setSyncingOrderId(orderId);
    try {
      const synced = await onSyncOrderWithPos(orderId);
      setSelectedOrderId(synced.id);
    } finally {
      setSyncingOrderId('');
    }
  };

  return (
    <main className="min-h-screen bg-background pt-20 text-foreground md:pt-24">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 pb-24 pt-6 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8 lg:pb-10">
        <aside className="hidden lg:block">
          <Card className="sticky top-28 overflow-hidden">
            <CardHeader className="border-b border-border">
              <div className="grid size-12 place-items-center rounded-md bg-primary text-white">
                <User aria-hidden="true" className="size-6" />
              </div>
              <CardTitle>{user.name || t('عميل In & Out', 'In & Out Customer')}</CardTitle>
              <CardDescription dir="ltr">{user.phone}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 p-3">
              {tabItems.map((item) => (
                <NavButton key={item.id} item={item} active={activeTab === item.id} language={language} onClick={() => setActiveTab(item.id)} />
              ))}
              <button
                type="button"
                onClick={onLogout}
                className="mt-2 flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-bold text-danger transition-colors hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <LogOut aria-hidden="true" className="size-5" />
                {t('تسجيل الخروج', 'Logout')}
              </button>
            </CardContent>
          </Card>
        </aside>

        <div className="min-w-0">
          <header className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-bold text-accent">{t('بوابة العميل', 'Customer portal')}</p>
              <h1 className="mt-2 text-3xl font-black leading-tight text-primary md:text-5xl">
                {t('مرحبًا، ', 'Welcome, ')}{user.name || t('عميلنا', 'customer')}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                {t('طلباتك، فواتيرك، الدعم، وبياناتك في مساحة واحدة واضحة.', 'Orders, invoices, support, and profile details in one clear space.')}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="accent" onClick={onNewOrderClick}>
                <Plus aria-hidden="true" className="size-5" />
                {t('طلب استلام جديد', 'New pickup')}
              </Button>
              <Button variant="secondary" onClick={() => setActiveTab('support')}>
                <Headphones aria-hidden="true" className="size-5" />
                {t('الدعم', 'Support')}
              </Button>
            </div>
          </header>

          <motion.div
            key={activeTab}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === 'home' ? (
              <PortalHome
                language={language}
                latestOrder={latestOrder}
                activeCount={activeOrders.length}
                outstandingTotal={outstandingTotal}
                paidTotal={paidTotal}
                onNewOrderClick={onNewOrderClick}
                setActiveTab={setActiveTab}
                onSupportClick={onSupportClick}
              />
            ) : null}

            {activeTab === 'orders' ? (
              <OrdersView
                language={language}
                orders={normalizedOrders}
                selectedOrder={selectedOrder}
                selectedOrderId={selectedOrder?.id || ''}
                setSelectedOrderId={setSelectedOrderId}
                syncOrder={syncOrder}
                syncingOrderId={syncingOrderId}
                onReorderClick={onReorderClick}
                onTrackOrderClick={onTrackOrderClick}
                onSupportClick={onSupportClick}
              />
            ) : null}

            {activeTab === 'invoices' ? (
              <InvoicesView language={language} orders={normalizedOrders} outstandingTotal={outstandingTotal} paidTotal={paidTotal} onTrackOrderClick={onTrackOrderClick} />
            ) : null}

            {activeTab === 'support' ? (
              <SupportView language={language} latestOrder={latestOrder} onSupportClick={onSupportClick} />
            ) : null}

            {activeTab === 'profile' ? (
              <ProfileView language={language} user={user} pricing={pricing} orders={normalizedOrders} onLogout={onLogout} onNewOrderClick={onNewOrderClick} />
            ) : null}
          </motion.div>
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 px-3 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 shadow-high backdrop-blur lg:hidden" aria-label={t('تنقل بوابة العميل', 'Customer portal navigation')}>
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          {tabItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={cn('flex min-h-14 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', active ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted')}
              >
                <Icon aria-hidden="true" className="size-5" />
                {localize(language, item.ar, item.en)}
              </button>
            );
          })}
        </div>
      </nav>
    </main>
  );
};

const PortalHome = ({
  language,
  latestOrder,
  activeCount,
  outstandingTotal,
  paidTotal,
  onNewOrderClick,
  setActiveTab,
  onSupportClick,
}: {
  language: SiteLanguage;
  latestOrder?: Order;
  activeCount: number;
  outstandingTotal: number;
  paidTotal: number;
  onNewOrderClick: () => void;
  setActiveTab: (tab: PortalTab) => void;
  onSupportClick?: (order?: Order) => void;
}) => {
  const t = (ar: string, en: string) => localize(language, ar, en);
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={PackageCheck} label={t('طلبات نشطة', 'Active orders')} value={String(activeCount)} tone="primary" />
        <StatCard icon={WalletCards} label={t('مستحقات', 'Outstanding')} value={formatCurrency(language, outstandingTotal)} tone="accent" />
        <StatCard icon={CheckCircle2} label={t('مدفوع', 'Paid')} value={formatCurrency(language, paidTotal)} tone="success" />
        <StatCard icon={Bell} label={t('إشعارات', 'Notifications')} value="3" tone="info" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t('أهم تحديث الآن', 'Most relevant update')}</CardTitle>
            <CardDescription>{t('أقرب طلب أو حالة تحتاج انتباهك.', 'The closest order or case needing your attention.')}</CardDescription>
          </CardHeader>
          <CardContent>
            {latestOrder ? (
              <OrderFocus order={latestOrder} language={language} onOpen={() => setActiveTab('orders')} />
            ) : (
              <EmptyState
                icon={PackageCheck}
                title={t('لا توجد طلبات بعد', 'No orders yet')}
                text={t('ابدأ أول طلب استلام وسيظهر التتبع هنا.', 'Start your first pickup and tracking will appear here.')}
                action={t('احجز استلام', 'Book pickup')}
                onAction={onNewOrderClick}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('إجراءات سريعة', 'Quick actions')}</CardTitle>
            <CardDescription>{t('لا تحتاج أكثر من ضغطتين للوصول للأهم.', 'Reach the essentials within two clicks.')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {[
              [Plus, t('طلب استلام جديد', 'New pickup'), onNewOrderClick],
              [PackageCheck, t('تتبع الطلبات', 'Track orders'), () => setActiveTab('orders')],
              [ReceiptText, t('الفواتير والدفع', 'Invoices and payments'), () => setActiveTab('invoices')],
              [Headphones, t('فتح تذكرة دعم', 'Open support ticket'), () => onSupportClick ? onSupportClick(latestOrder) : setActiveTab('support')],
            ].map(([Icon, label, onClick]) => {
              const ActionIcon = Icon as React.ElementType;
              return (
                <button
                  key={String(label)}
                  type="button"
                  onClick={onClick as () => void}
                  className="flex min-h-14 items-center justify-between rounded-lg border border-border bg-muted px-4 text-start font-bold transition-colors hover:border-accent hover:bg-accent/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span>{label as string}</span>
                  <ActionIcon aria-hidden="true" className="size-5 text-primary" />
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const OrdersView = ({
  language,
  orders,
  selectedOrder,
  selectedOrderId,
  setSelectedOrderId,
  syncOrder,
  syncingOrderId,
  onReorderClick,
  onTrackOrderClick,
  onSupportClick,
}: {
  language: SiteLanguage;
  orders: Order[];
  selectedOrder?: Order;
  selectedOrderId: string;
  setSelectedOrderId: (id: string) => void;
  syncOrder: (id: string) => void;
  syncingOrderId: string;
  onReorderClick?: (order: Order) => void;
  onTrackOrderClick?: (order: Order) => void;
  onSupportClick?: (order?: Order) => void;
}) => {
  const t = (ar: string, en: string) => localize(language, ar, en);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'done' | 'unpaid'>('all');
  const filteredOrders = orders.filter((order) => {
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || [order.id, order.serviceType, order.branch, order.deliveryAddress].some((value) => String(value || '').toLowerCase().includes(term));
    const matchesFilter =
      statusFilter === 'all' ||
      (statusFilter === 'active' && activeStatuses.has(order.status)) ||
      (statusFilter === 'done' && ['completed', 'delivered'].includes(order.status)) ||
      (statusFilter === 'unpaid' && !paidStatuses.has(String(order.paymentStatus)));
    return matchesSearch && matchesFilter;
  });
  return (
    <div className="grid gap-6 xl:grid-cols-[.82fr_1.18fr]">
      <Card>
        <CardHeader>
          <CardTitle>{t('سجل الطلبات', 'Order history')}</CardTitle>
          <CardDescription>{t('قائمة قابلة للمسح مع حالات واضحة.', 'A scannable list with clear statuses.')}</CardDescription>
          <div className="grid gap-3 pt-3">
            <div className="relative">
              <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 text-muted-foreground ltr:left-3 rtl:right-3" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('ابحث برقم الطلب أو الخدمة', 'Search by order or service')}
                className="min-h-11 w-full rounded-md border border-input bg-surface px-9 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ['all', t('الكل', 'All')],
                ['active', t('نشطة', 'Active')],
                ['done', t('مكتملة', 'Done')],
                ['unpaid', t('غير مدفوعة', 'Unpaid')],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setStatusFilter(id as 'all' | 'active' | 'done' | 'unpaid')}
                  className={cn('min-h-10 rounded-md border px-3 text-xs font-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', statusFilter === id ? 'border-primary bg-primary text-white' : 'border-border bg-muted text-muted-foreground hover:border-primary/50')}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3">
          {filteredOrders.length ? filteredOrders.map((order) => {
            const label = statusLabels[order.status];
            return (
              <button
                key={order.id}
                type="button"
                onClick={() => setSelectedOrderId(order.id)}
                className={cn('rounded-lg border p-4 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', selectedOrderId === order.id ? 'border-accent bg-accent/5' : 'border-border bg-surface hover:border-accent/50')}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black" dir="ltr">{order.id}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{order.serviceType}</p>
                  </div>
                  <Badge variant={label.variant}>{localize(language, label.ar, label.en)}</Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <InfoMini label={t('الفرع', 'Branch')} value={order.branch} />
                  <InfoMini label={t('المبلغ', 'Amount')} value={formatCurrency(language, getAmount(order))} />
                </div>
              </button>
            );
          }) : (
            <EmptyState icon={PackageCheck} title={t('لا توجد نتائج', 'No results')} text={t('غيّر البحث أو الفلتر لعرض طلبات أخرى.', 'Change search or filter to show other orders.')} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-border">
          <CardTitle>{t('تفاصيل التتبع', 'Tracking detail')}</CardTitle>
          <CardDescription>{selectedOrder?.id || t('اختر طلبًا من القائمة.', 'Select an order from the list.')}</CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          {selectedOrder ? (
            <div className="grid gap-5">
              <OrderFocus order={selectedOrder} language={language} />
              <div className="grid gap-3 md:grid-cols-2">
                <InfoTile icon={MapPin} label={t('العنوان', 'Address')} value={selectedOrder.deliveryAddress || '-'} />
                <InfoTile icon={CalendarClock} label={t('موعد الاستلام', 'Pickup slot')} value={selectedOrder.pickupSlot || selectedOrder.eta || '-'} />
                <InfoTile icon={CreditCard} label={t('الدفع', 'Payment')} value={paymentLabel(selectedOrder.paymentStatus, language)} />
                <InfoTile icon={Truck} label={t('السائق', 'Driver')} value={selectedOrder.assignedDriverId || t('لم يحدد بعد', 'Not assigned yet')} />
              </div>
              {syncOrder ? (
                <Button variant="secondary" onClick={() => syncOrder(selectedOrder.id)} disabled={syncingOrderId === selectedOrder.id}>
                  <RefreshCcw aria-hidden="true" className={cn('size-5', syncingOrderId === selectedOrder.id && 'animate-spin')} />
                  {syncingOrderId === selectedOrder.id ? t('جاري المزامنة', 'Syncing') : t('مزامنة مع POS', 'Sync with POS')}
                </Button>
              ) : null}
              <div className="grid gap-2 md:grid-cols-3">
                <Button variant="accent" onClick={() => onTrackOrderClick?.(selectedOrder)}>
                  <Truck aria-hidden="true" className="size-5" />
                  {t('فتح التتبع', 'Open tracking')}
                </Button>
                <Button variant="secondary" onClick={() => onReorderClick?.(selectedOrder)}>
                  <RefreshCcw aria-hidden="true" className="size-5" />
                  {t('إعادة الطلب', 'Reorder')}
                </Button>
                <Button variant="secondary" onClick={() => onSupportClick?.(selectedOrder)}>
                  <Headphones aria-hidden="true" className="size-5" />
                  {t('دعم لهذا الطلب', 'Order support')}
                </Button>
              </div>
            </div>
          ) : (
            <EmptyState icon={PackageCheck} title={t('اختر طلبًا', 'Select an order')} text={t('ستظهر التفاصيل والتايملاين هنا.', 'Details and timeline appear here.')} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const InvoicesView = ({
  language,
  orders,
  outstandingTotal,
  paidTotal,
  onTrackOrderClick,
}: {
  language: SiteLanguage;
  orders: Order[];
  outstandingTotal: number;
  paidTotal: number;
  onTrackOrderClick?: (order: Order) => void;
}) => {
  const t = (ar: string, en: string) => localize(language, ar, en);
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={WalletCards} label={t('المستحق', 'Outstanding')} value={formatCurrency(language, outstandingTotal)} tone="accent" />
        <StatCard icon={CheckCircle2} label={t('مدفوع', 'Paid')} value={formatCurrency(language, paidTotal)} tone="success" />
        <StatCard icon={FileText} label={t('عدد الفواتير', 'Invoices')} value={String(orders.length)} tone="primary" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t('الفواتير والمدفوعات', 'Invoices and payments')}</CardTitle>
          <CardDescription>{t('رسوم واضحة، حالة دفع، وإجراء تنزيل لاحقًا.', 'Clear charges, payment status, and receipt actions later.')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {orders.length ? orders.map((order) => (
            <div key={order.id} className="grid gap-4 rounded-lg border border-border bg-surface p-4 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
              <div>
                <p className="font-black" dir="ltr">{order.pos?.invoice_no || order.pos?.invoice_id || order.id}</p>
                <p className="mt-1 text-sm text-muted-foreground">{order.serviceType}</p>
              </div>
              <Badge variant={paidStatuses.has(String(order.paymentStatus)) ? 'success' : 'warning'}>
                {paymentLabel(order.paymentStatus, language)}
              </Badge>
              <div className="text-lg font-black text-primary">{formatCurrency(language, getAmount(order))}</div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => onTrackOrderClick?.(order)}>
                  <Truck aria-hidden="true" className="size-4" />
                  {t('تتبع', 'Track')}
                </Button>
                <Button size="sm" variant="secondary" disabled>
                  <Download aria-hidden="true" className="size-4" />
                  {t('PDF', 'PDF')}
                </Button>
              </div>
            </div>
          )) : (
            <EmptyState icon={ReceiptText} title={t('لا توجد فواتير', 'No invoices')} text={t('ستظهر الفواتير بعد إنشاء الطلبات.', 'Invoices appear after orders are created.')} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const SupportView = ({ language, latestOrder, onSupportClick }: { language: SiteLanguage; latestOrder?: Order; onSupportClick?: (order?: Order) => void }) => {
  const t = (ar: string, en: string) => localize(language, ar, en);
  return (
    <div className="grid gap-6 xl:grid-cols-[.95fr_1.05fr]">
      <Card>
        <CardHeader>
          <CardTitle>{t('تذكرة دعم جديدة', 'New support ticket')}</CardTitle>
          <CardDescription>{t('نموذج مبسط، وسيتم ربط المحادثات لاحقًا.', 'A simple form, ready for conversation integration later.')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Input label={t('رقم الطلب', 'Order ID')} defaultValue={latestOrder?.id || ''} dir="ltr" />
          <Input label={t('نوع الطلب', 'Topic')} defaultValue={t('استفسار عن طلب', 'Order question')} />
          <label className="flex flex-col gap-2 text-xs font-bold">
            {t('الرسالة', 'Message')}
            <textarea className="min-h-28 rounded-md border border-input bg-surface p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder={t('اكتب رسالتك هنا...', 'Write your message here...')} />
          </label>
          <Button variant="accent" onClick={() => onSupportClick?.(latestOrder)}>
            <Headphones aria-hidden="true" className="size-5" />
            {t('فتح صفحة الشكاوى', 'Open complaint page')}
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t('سجل الدعم', 'Support timeline')}</CardTitle>
          <CardDescription>{t('حالات واضحة: مفتوحة، قيد المعالجة، محلولة.', 'Clear states: open, in progress, resolved.')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {[
            [t('تم استلام طلب الدعم', 'Support request received'), t('مفتوحة', 'Open'), 'accent'],
            [t('مراجعة تفاصيل الطلب', 'Reviewing order details'), t('قيد المعالجة', 'In progress'), 'warning'],
            [t('تأكيد الحل مع العميل', 'Confirming resolution'), t('لاحقًا', 'Later'), 'neutral'],
          ].map(([title, status, variant]) => (
            <div key={title} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted p-4">
              <div className="flex items-center gap-3">
                <MessageDot />
                <span className="font-bold">{title}</span>
              </div>
              <Badge variant={variant as 'neutral' | 'warning' | 'accent'}>{status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

const ProfileView = ({
  language,
  user,
  pricing,
  orders,
  onLogout,
  onNewOrderClick,
}: {
  language: SiteLanguage;
  user: CustomerUser;
  pricing: PricingItem[];
  orders: Order[];
  onLogout: () => void;
  onNewOrderClick: () => void;
}) => {
  const t = (ar: string, en: string) => localize(language, ar, en);
  const preferredService = pricing.find((item) => Number(item.barcode) === Number(user.prefService));
  const savedAddresses = Array.from(
    new Set([user.area, ...orders.map((order) => order.deliveryAddress)].filter(Boolean).map((value) => String(value))),
  ).slice(0, 4);
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_.9fr]">
      <Card>
        <CardHeader>
          <CardTitle>{t('البيانات الشخصية', 'Personal info')}</CardTitle>
          <CardDescription>{t('منظمة في أقسام واضحة.', 'Organized into clear sections.')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Input label={t('الاسم', 'Name')} defaultValue={user.name} />
          <Input label={t('الهاتف', 'Phone')} defaultValue={user.phone} dir="ltr" />
          <Input label={t('البريد', 'Email')} defaultValue={user.email} dir="ltr" />
          <Input label={t('المنطقة', 'Area')} defaultValue={user.area} />
        </CardContent>
      </Card>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('العناوين المحفوظة', 'Saved addresses')}</CardTitle>
            <CardDescription>{t('مستخرجة من بياناتك وطلباتك السابقة.', 'Collected from your profile and previous orders.')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {savedAddresses.length ? savedAddresses.map((address, index) => (
              <div key={address} className="flex items-start justify-between gap-3 rounded-lg border border-border bg-muted p-4">
                <div className="flex items-start gap-3">
                  <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-black">{index === 0 ? t('العنوان الافتراضي', 'Default address') : t('عنوان محفوظ', 'Saved address')}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{address}</p>
                  </div>
                </div>
                {index === 0 ? <Badge variant="accent">{t('افتراضي', 'Default')}</Badge> : null}
              </div>
            )) : (
              <EmptyState icon={MapPin} title={t('لا توجد عناوين', 'No addresses')} text={t('سيتم حفظ العناوين بعد أول طلب.', 'Addresses will be saved after the first order.')} />
            )}
            <Button variant="accent" onClick={onNewOrderClick}>
              <Plus aria-hidden="true" className="size-5" />
              {t('حجز باستخدام عنواني', 'Book with my address')}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('التفضيلات', 'Preferences')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <InfoTile icon={Bell} label={t('الإشعارات', 'Notifications')} value={user.notifType || t('واتساب', 'WhatsApp')} />
            <InfoTile icon={Settings} label={t('نوع العميل', 'Customer type')} value={user.type || t('فرد', 'Individual')} />
            <InfoTile icon={ShieldCheck} label={t('الخدمة المفضلة', 'Preferred service')} value={preferredService ? (language === 'ar' ? preferredService.name_ar : preferredService.name_en) : '-'} />
          </CardContent>
        </Card>
        <Button variant="destructive" onClick={onLogout}>
          <LogOut aria-hidden="true" className="size-5" />
          {t('تسجيل الخروج', 'Logout')}
        </Button>
      </div>
    </div>
  );
};

const NavButton = ({
  item,
  active,
  language,
  onClick,
}: {
  item: (typeof tabItems)[number];
  active: boolean;
  language: SiteLanguage;
  onClick: () => void;
}) => {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', active ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted')}
    >
      <Icon aria-hidden="true" className="size-5" />
      {localize(language, item.ar, item.en)}
    </button>
  );
};

const StatCard = ({ icon: Icon, label, value, tone }: { icon: React.ElementType; label: string; value: string; tone: 'primary' | 'accent' | 'success' | 'info' }) => {
  const toneClass = {
    primary: 'bg-primary text-white',
    accent: 'bg-accent text-white',
    success: 'bg-success text-white',
    info: 'bg-info text-white',
  }[tone];
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn('grid size-12 place-items-center rounded-md', toneClass)}>
          <Icon aria-hidden="true" className="size-6" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 truncate text-xl font-black text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const OrderFocus = ({ order, language, onOpen }: { order: Order; language: SiteLanguage; onOpen?: () => void }) => {
  const label = statusLabels[order.status];
  const currentIndex = statusIndex[order.status];
  return (
    <div className="grid gap-5">
      <div className="flex flex-col justify-between gap-4 rounded-lg border border-border bg-muted p-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm text-muted-foreground">{localize(language, 'رقم الطلب', 'Order ID')}</p>
          <p className="mt-1 text-2xl font-black text-primary" dir="ltr">{order.id}</p>
        </div>
        <Badge variant={label.variant} withIcon>{localize(language, label.ar, label.en)}</Badge>
      </div>
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {orderStages.map((stage, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          return (
            <li key={stage.en} className={cn('rounded-md border p-3 text-center text-xs font-bold', done ? 'border-success bg-success/10 text-success' : active ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-surface text-muted-foreground')}>
              {localize(language, stage.ar, stage.en)}
            </li>
          );
        })}
      </ol>
      {onOpen ? (
        <Button variant="secondary" onClick={onOpen}>{localize(language, 'فتح التفاصيل', 'Open details')}</Button>
      ) : null}
    </div>
  );
};

const InfoTile = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="flex min-h-20 items-start gap-3 rounded-lg border border-border bg-muted p-4">
    <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
    <div className="min-w-0">
      <p className="text-xs font-bold text-muted-foreground">{label}</p>
      <p className="mt-1 break-words font-bold">{value}</p>
    </div>
  </div>
);

const InfoMini = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="mt-1 truncate font-bold">{value}</p>
  </div>
);

const EmptyState = ({
  icon: Icon,
  title,
  text,
  action,
  onAction,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
  action?: string;
  onAction?: () => void;
}) => (
  <div className="rounded-lg border border-dashed border-border bg-muted p-8 text-center">
    <div className="mx-auto grid size-14 place-items-center rounded-pill bg-primary text-white">
      <Icon aria-hidden="true" className="size-7" />
    </div>
    <h2 className="mt-4 text-xl font-black">{title}</h2>
    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{text}</p>
    {action && onAction ? <Button className="mt-5" variant="accent" onClick={onAction}>{action}</Button> : null}
  </div>
);

const MessageDot = () => (
  <span className="grid size-9 shrink-0 place-items-center rounded-pill bg-primary text-white">
    <Headphones aria-hidden="true" className="size-4" />
  </span>
);

const getAmount = (order: Order) => Number(order.pos?.total ?? order.totalPrice ?? order.amount ?? 0) || 0;

const paymentLabel = (status: Order['paymentStatus'], language: SiteLanguage) => {
  if (status === 'paid') return localize(language, 'مدفوع', 'Paid');
  if (status === 'pending') return localize(language, 'قيد الانتظار', 'Pending');
  return localize(language, 'غير مدفوع', 'Unpaid');
};
