import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Archive,
  Banknote,
  Bot,
  Boxes,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Database,
  LayoutDashboard,
  LogOut,
  PackageCheck,
  ReceiptText,
  RefreshCw,
  Repeat2,
  Server,
  SlidersHorizontal,
  ShieldCheck,
  Truck,
  Users,
  WifiOff,
} from 'lucide-react';
import { Branch, Driver, Order, OrderStatus, PricingItem, SiteConfig, SyncHealthResponse } from '../types';
import { customerApi } from '../lib/customerApi';
import { formatCurrency, localize, SiteLanguage } from '../lib/i18n';
import { cn } from '../lib/utils';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Modal } from './ui/modal';

interface OperationsPlatformProps {
  config: SiteConfig;
  onConfigChange: (config: SiteConfig) => void;
  orders: Order[];
  onOrdersChange: (orders: Order[]) => void;
  onLogout: () => void;
  setRoute: (route: string) => void;
  language?: SiteLanguage;
}

type OpsModule = 'overview' | 'orders' | 'complaints' | 'drivers' | 'branches' | 'inventory' | 'expenses' | 'handover' | 'sync';

const modules: Array<{ id: OpsModule; ar: string; en: string; icon: React.ElementType; roles: string }> = [
  { id: 'overview', ar: 'نظرة عامة', en: 'Overview', icon: LayoutDashboard, roles: 'Staff, Supervisor, Admin' },
  { id: 'orders', ar: 'قائمة الطلبات', en: 'Orders Queue', icon: PackageCheck, roles: 'Staff, Supervisor, Admin' },
  { id: 'complaints', ar: 'الشكاوى', en: 'Complaints', icon: AlertTriangle, roles: 'Supervisor, Admin' },
  { id: 'drivers', ar: 'السائقون', en: 'Drivers', icon: Truck, roles: 'Supervisor, Admin' },
  { id: 'branches', ar: 'الفروع', en: 'Branches', icon: Building2, roles: 'Admin' },
  { id: 'inventory', ar: 'المخزون', en: 'Inventory', icon: Boxes, roles: 'Staff, Supervisor' },
  { id: 'expenses', ar: 'المصروفات', en: 'Expenses', icon: Banknote, roles: 'Supervisor, Admin' },
  { id: 'handover', ar: 'تسليم الشفت', en: 'Shift Handover', icon: ClipboardCheck, roles: 'Staff, Supervisor' },
  { id: 'sync', ar: 'المزامنة', en: 'Sync Health', icon: Database, roles: 'Admin' },
];

const workflow: Array<{ status: OrderStatus; ar: string; en: string }> = [
  { status: 'pickup', ar: 'Received', en: 'Received' },
  { status: 'accepted', ar: 'Sorting', en: 'Sorting' },
  { status: 'washing', ar: 'Washing', en: 'Washing' },
  { status: 'washing', ar: 'Drying', en: 'Drying' },
  { status: 'washing', ar: 'Ironing', en: 'Ironing' },
  { status: 'ready', ar: 'QC', en: 'QC' },
  { status: 'ready', ar: 'Packing', en: 'Packing' },
  { status: 'ready', ar: 'Ready', en: 'Ready' },
  { status: 'delivery', ar: 'Out for Delivery', en: 'Out for Delivery' },
  { status: 'delivered', ar: 'Delivered', en: 'Delivered' },
];

const statusMeta: Record<OrderStatus, { ar: string; en: string; variant: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent' }> = {
  new: { ar: 'جديد', en: 'New', variant: 'info' },
  accepted: { ar: 'فرز', en: 'Sorting', variant: 'info' },
  on_the_way: { ar: 'السائق بالطريق', en: 'Driver on way', variant: 'accent' },
  pickup: { ar: 'مستلم', en: 'Received', variant: 'accent' },
  washing: { ar: 'معالجة', en: 'Processing', variant: 'accent' },
  ready: { ar: 'جاهز', en: 'Ready', variant: 'success' },
  delivery: { ar: 'توصيل', en: 'Delivery', variant: 'warning' },
  completed: { ar: 'مكتمل', en: 'Completed', variant: 'success' },
  delivered: { ar: 'تم التسليم', en: 'Delivered', variant: 'success' },
  cancelled: { ar: 'ملغي', en: 'Cancelled', variant: 'danger' },
};

const expenseRows = [
  { id: 'EXP-101', ar: 'مواد تنظيف', en: 'Cleaning supplies', amount: 420, status: 'approved' },
  { id: 'EXP-102', ar: 'وقود التوصيل', en: 'Delivery fuel', amount: 180, status: 'pending' },
  { id: 'EXP-103', ar: 'صيانة مكواة بخار', en: 'Steam iron service', amount: 260, status: 'review' },
];

export const OperationsPlatform: React.FC<OperationsPlatformProps> = ({
  config,
  onConfigChange,
  orders,
  onOrdersChange,
  onLogout,
  setRoute,
  language = 'ar',
}) => {
  const [activeModule, setActiveModule] = useState<OpsModule>('overview');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Order['priority']>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmOrder, setConfirmOrder] = useState<Order | null>(null);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const t = (ar: string, en: string) => localize(language, ar, en);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesQuery = !q || [order.id, order.customerName, order.customerPhone, order.branch, order.serviceType].some((value) => String(value || '').toLowerCase().includes(q));
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchesBranch = branchFilter === 'all' || order.branch === branchFilter;
      const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter;
      return matchesQuery && matchesStatus && matchesBranch && matchesPriority;
    });
  }, [orders, search, statusFilter, branchFilter, priorityFilter]);

  const branchOptions = useMemo(() => Array.from(new Set(orders.map((order) => order.branch).filter(Boolean))), [orders]);

  const stats = useMemo(() => {
    const active = orders.filter((order) => !['delivered', 'completed', 'cancelled'].includes(order.status)).length;
    const delayed = orders.filter((order) => order.priority === 'urgent' || order.status === 'delivery').length;
    const revenue = orders.reduce((sum, order) => sum + Number(order.pos?.total ?? order.totalPrice ?? order.amount ?? 0), 0);
    return { active, delayed, revenue, complaints: orders.filter((order) => order.status === 'cancelled' || order.paymentStatus !== 'paid').length };
  }, [orders]);

  const setOrderStatus = (orderId: string, status: OrderStatus) => {
    onOrdersChange(orders.map((order) => order.id === orderId ? { ...order, status } : order));
  };

  const assignDriver = (orderId: string, driverId: string) => {
    onOrdersChange(orders.map((order) => order.id === orderId ? {
      ...order,
      assignedDriverId: driverId || undefined,
      status: driverId && order.status === 'new' ? 'on_the_way' : order.status,
    } : order));
  };

  const cancelOrder = () => {
    if (!confirmOrder) return;
    setOrderStatus(confirmOrder.id, 'cancelled');
    setConfirmOrder(null);
  };

  const bulkMarkReady = () => {
    onOrdersChange(orders.map((order) => selectedIds.has(order.id) ? { ...order, status: 'ready' } : order));
    setSelectedIds(new Set());
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(89,46,242,0.13),transparent_34%),linear-gradient(180deg,#F2F2F2,#ffffff)] text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-e border-white/70 bg-white/62 shadow-glass backdrop-blur-3xl lg:block">
          <div className="sticky top-0 flex h-screen flex-col">
            <div className="border-b border-white/70 p-5">
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-md bg-primary text-white">
                  <ShieldCheck aria-hidden="true" className="size-6" />
                </div>
                <div>
                  <p className="text-lg font-black">Operations</p>
                  <p className="text-xs text-muted-foreground">In & Out Laundry</p>
                </div>
              </div>
            </div>
            <nav className="grid gap-1 p-3" aria-label={t('تنقل منصة العمليات', 'Operations navigation')}>
              {modules.map((module) => (
                <ModuleButton key={module.id} module={module} active={activeModule === module.id} language={language} onClick={() => setActiveModule(module.id)} />
              ))}
            </nav>
            <div className="mt-auto border-t border-border p-3">
              <Button variant="ghost" className="w-full justify-start text-danger" onClick={onLogout}>
                <LogOut aria-hidden="true" className="size-5" />
                {t('تسجيل الخروج', 'Logout')}
              </Button>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-white/70 bg-white/64 px-4 py-4 shadow-low backdrop-blur-3xl md:px-6">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs font-bold text-accent">{t('منصة تشغيل داخلية', 'Internal operations platform')}</p>
                <h1 className="mt-1 text-2xl font-black text-primary md:text-3xl">{moduleTitle(activeModule, language)}</h1>
              </div>
            <div className="flex flex-col gap-2 sm:flex-row">
                <Button variant="secondary" onClick={() => setRoute('/pos')}>
                  <ReceiptText aria-hidden="true" className="size-5" />
                  POS
                </Button>
                <Button variant="secondary" onClick={() => setRoute('/ai-dashboard')}>
                  <Bot aria-hidden="true" className="size-5" />
                  AI
                </Button>
                <Button variant="secondary" onClick={() => setRoute('/reports')}>
                  <Archive aria-hidden="true" className="size-5" />
                  {t('التقارير', 'Reports')}
                </Button>
                <Input
                  aria-label={t('بحث', 'Search')}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t('بحث في الطلبات...', 'Search orders...')}
                  className="sm:w-72"
                />
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as 'all' | OrderStatus)}
                  className="min-h-11 rounded-md border border-input bg-surface px-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={t('فلتر الحالة', 'Status filter')}
                >
                  <option value="all">{t('كل الحالات', 'All statuses')}</option>
                  {Object.entries(statusMeta).map(([status, meta]) => (
                    <option key={status} value={status}>{localize(language, meta.ar, meta.en)}</option>
                  ))}
                </select>
                <select
                  value={branchFilter}
                  onChange={(event) => setBranchFilter(event.target.value)}
                  className="min-h-11 rounded-md border border-input bg-surface px-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={t('فلتر الفرع', 'Branch filter')}
                >
                  <option value="all">{t('كل الفروع', 'All branches')}</option>
                  {branchOptions.map((branch) => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
                <select
                  value={priorityFilter}
                  onChange={(event) => setPriorityFilter(event.target.value as 'all' | Order['priority'])}
                  className="min-h-11 rounded-md border border-input bg-surface px-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={t('فلتر الأولوية', 'Priority filter')}
                >
                  <option value="all">{t('كل الأولويات', 'All priorities')}</option>
                  <option value="normal">{t('عادي', 'Normal')}</option>
                  <option value="express">{t('سريع', 'Express')}</option>
                  <option value="high">{t('مهم', 'High')}</option>
                  <option value="urgent">{t('عاجل', 'Urgent')}</option>
                </select>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold text-muted-foreground">
              <SlidersHorizontal aria-hidden="true" className="size-4 text-primary" />
              <span>{t('المعروض', 'Showing')}: {filteredOrders.length}</span>
              <span>·</span>
              <span>{t('المحدد', 'Selected')}: {selectedIds.size}</span>
            </div>
          </header>

          <div className="border-b border-border bg-surface p-2 lg:hidden">
            <div className="flex gap-2 overflow-x-auto">
              {modules.map((module) => (
                <button
                  key={module.id}
                  type="button"
                  onClick={() => setActiveModule(module.id)}
                  className={cn('min-h-11 whitespace-nowrap rounded-md px-3 text-sm font-bold', activeModule === module.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground')}
                >
                  {localize(language, module.ar, module.en)}
                </button>
              ))}
            </div>
          </div>

          <section className="p-4 md:p-6">
            {activeModule === 'overview' ? <Overview stats={stats} language={language} orders={orders} /> : null}
            {activeModule === 'orders' ? (
              <OrdersQueue
                language={language}
                orders={filteredOrders}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
                setOrderStatus={setOrderStatus}
                assignDriver={assignDriver}
                drivers={config.drivers}
                setConfirmOrder={setConfirmOrder}
                bulkMarkReady={bulkMarkReady}
              />
            ) : null}
            {activeModule === 'complaints' ? <Complaints language={language} orders={orders} /> : null}
            {activeModule === 'drivers' ? <DriversView language={language} drivers={config.drivers} orders={orders} /> : null}
            {activeModule === 'branches' ? <BranchesOps language={language} branches={config.branches} onConfigChange={onConfigChange} config={config} /> : null}
            {activeModule === 'inventory' ? <Inventory language={language} pricing={config.pricing} /> : null}
            {activeModule === 'expenses' ? <Expenses language={language} /> : null}
            {activeModule === 'handover' ? <Handover language={language} checklist={checklist} setChecklist={setChecklist} /> : null}
            {activeModule === 'sync' ? <SyncHealth language={language} /> : null}
          </section>
        </div>
      </div>

      <Modal
        open={Boolean(confirmOrder)}
        onOpenChange={(open) => !open && setConfirmOrder(null)}
        title={t('تأكيد إلغاء الطلب', 'Confirm order cancellation')}
        description={t('هذا إجراء عالي التأثير ويتطلب تأكيدًا واضحًا.', 'This is a high-impact action and requires clear confirmation.')}
        footer={(
          <>
            <Button variant="ghost" onClick={() => setConfirmOrder(null)}>{t('تراجع', 'Back')}</Button>
            <Button variant="destructive" onClick={cancelOrder}>{t('إلغاء الطلب', 'Cancel order')}</Button>
          </>
        )}
      >
        <p className="text-sm leading-6 text-muted-foreground">
          {t('سيتم وضع الطلب في حالة ملغي وإظهاره في سجل التدقيق.', 'The order will be marked cancelled and shown in the audit trail.')}
        </p>
        <p className="mt-3 font-black" dir="ltr">{confirmOrder?.id}</p>
      </Modal>
    </main>
  );
};

const Overview = ({ stats, language, orders }: { stats: { active: number; delayed: number; revenue: number; complaints: number }; language: SiteLanguage; orders: Order[] }) => {
  const t = (ar: string, en: string) => localize(language, ar, en);
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <OpsStat icon={PackageCheck} label={t('طلبات نشطة', 'Active orders')} value={String(stats.active)} tone="primary" />
        <OpsStat icon={Clock3} label={t('تنبيهات SLA', 'SLA alerts')} value={String(stats.delayed)} tone="warning" />
        <OpsStat icon={Banknote} label={t('إيراد اليوم', 'Today revenue')} value={formatCurrency(language, stats.revenue)} tone="success" />
        <OpsStat icon={AlertTriangle} label={t('حالات متابعة', 'Follow-up cases')} value={String(stats.complaints)} tone="danger" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t('خط التشغيل', 'Workflow pipeline')}</CardTitle>
            <CardDescription>{t('يعكس المراحل الفيزيائية داخل المغسلة.', 'Mirrors the physical laundry process.')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 md:grid-cols-5">
            {workflow.map((stage, index) => (
              <div key={`${stage.en}-${index}`} className="rounded-md border border-border bg-muted p-3 text-center">
                <p className="text-xs font-bold text-muted-foreground">{index + 1}</p>
                <p className="mt-1 text-sm font-black">{localize(language, stage.ar, stage.en)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('آخر الطلبات', 'Latest orders')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {orders.slice(0, 5).map((order) => <CompactOrder key={order.id} order={order} language={language} />)}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const OrdersQueue = ({
  language,
  orders,
  selectedIds,
  setSelectedIds,
  setOrderStatus,
  assignDriver,
  drivers,
  setConfirmOrder,
  bulkMarkReady,
}: {
  language: SiteLanguage;
  orders: Order[];
  selectedIds: Set<string>;
  setSelectedIds: (ids: Set<string>) => void;
  setOrderStatus: (id: string, status: OrderStatus) => void;
  assignDriver: (id: string, driverId: string) => void;
  drivers: Driver[];
  setConfirmOrder: (order: Order) => void;
  bulkMarkReady: () => void;
}) => {
  const t = (ar: string, en: string) => localize(language, ar, en);
  const toggle = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };
  return (
    <Card>
      <CardHeader className="border-b border-border">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <CardTitle>{t('Orders Queue', 'Orders Queue')}</CardTitle>
            <CardDescription>{t('بحث، فلترة، إجراءات جماعية، وتغيير مرحلة سريع.', 'Search, filter, bulk actions, and fast stage changes.')}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={!selectedIds.size} onClick={bulkMarkReady}>
              <CheckCircle2 aria-hidden="true" className="size-5" />
              {t('جاهز جماعيًا', 'Bulk ready')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted text-xs text-muted-foreground">
              <tr>
                <th className="p-3 text-start"><span className="sr-only">{t('تحديد', 'Select')}</span></th>
                <th className="p-3 text-start">{t('الطلب', 'Order')}</th>
                <th className="p-3 text-start">{t('العميل', 'Customer')}</th>
                <th className="p-3 text-start">{t('الخدمة', 'Service')}</th>
                <th className="p-3 text-start">{t('الحالة', 'Status')}</th>
                <th className="p-3 text-start">{t('السائق', 'Driver')}</th>
                <th className="p-3 text-start">{t('الفرع', 'Branch')}</th>
                <th className="p-3 text-start">{t('الإجراء', 'Action')}</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 12).map((order) => <OrderRow key={order.id} order={order} language={language} selected={selectedIds.has(order.id)} toggle={toggle} setOrderStatus={setOrderStatus} assignDriver={assignDriver} drivers={drivers} setConfirmOrder={setConfirmOrder} />)}
            </tbody>
          </table>
        </div>
        <div className="grid gap-3 p-3 lg:hidden">
          {orders.slice(0, 12).map((order) => <OrderCard key={order.id} order={order} language={language} selected={selectedIds.has(order.id)} toggle={toggle} setOrderStatus={setOrderStatus} assignDriver={assignDriver} drivers={drivers} setConfirmOrder={setConfirmOrder} />)}
        </div>
      </CardContent>
    </Card>
  );
};

const Complaints = ({ language, orders }: { language: SiteLanguage; orders: Order[] }) => {
  const t = (ar: string, en: string) => localize(language, ar, en);
  const [caseStates, setCaseStates] = useState<Record<string, 'open' | 'reviewing' | 'resolved'>>({});
  const cases = orders.filter((order) => order.status === 'cancelled' || order.paymentStatus !== 'paid').slice(0, 8);
  const visibleCases = cases.length ? cases : orders.slice(0, 4);
  const setCaseState = (orderId: string, state: 'open' | 'reviewing' | 'resolved') => {
    setCaseStates((prev) => ({ ...prev, [orderId]: state }));
  };
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        <OpsStat icon={AlertTriangle} label={t('مفتوحة', 'Open')} value={String(visibleCases.filter((order) => (caseStates[order.id] || 'open') === 'open').length)} tone="danger" />
        <OpsStat icon={Clock3} label={t('قيد المعالجة', 'Reviewing')} value={String(visibleCases.filter((order) => caseStates[order.id] === 'reviewing').length)} tone="warning" />
        <OpsStat icon={CheckCircle2} label={t('محلولة', 'Resolved')} value={String(visibleCases.filter((order) => caseStates[order.id] === 'resolved').length)} tone="success" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t('إدارة الشكاوى وSLA', 'Complaints and SLA management')}</CardTitle>
          <CardDescription>{t('مؤشرات aging حتى لا تضيع الحالات المهمة.', 'Aging indicators keep critical cases visible.')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {visibleCases.map((order, index) => {
            const state = caseStates[order.id] || 'open';
            return (
              <div key={order.id} className="grid gap-3 rounded-lg border border-border bg-surface p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
                <div>
                  <p className="font-black" dir="ltr">{order.id}</p>
                  <p className="text-sm text-muted-foreground">{order.customerName} · {order.serviceType}</p>
                  <p className="mt-1 text-xs font-bold text-muted-foreground">
                    {t('سبب المتابعة', 'Reason')}: {order.status === 'cancelled' ? t('طلب ملغي', 'Cancelled order') : paymentLabel(order.paymentStatus, language)}
                  </p>
                </div>
                <Badge variant={state === 'resolved' ? 'success' : state === 'reviewing' ? 'warning' : index === 0 ? 'danger' : 'accent'}>
                  {state === 'resolved' ? t('محلولة', 'Resolved') : state === 'reviewing' ? t('قيد المعالجة', 'Reviewing') : index === 0 ? t('SLA خطر', 'SLA risk') : t('مفتوحة', 'Open')}
                </Badge>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setCaseState(order.id, 'reviewing')}>{t('معالجة', 'Review')}</Button>
                  <Button variant="accent" size="sm" onClick={() => setCaseState(order.id, 'resolved')}>{t('حل', 'Resolve')}</Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

const paymentLabel = (status: Order['paymentStatus'], language: SiteLanguage) => {
  if (status === 'paid') return localize(language, 'مدفوع', 'Paid');
  if (status === 'pending') return localize(language, 'قيد الانتظار', 'Pending');
  return localize(language, 'غير مدفوع', 'Unpaid');
};

const DriversView = ({ language, drivers, orders }: { language: SiteLanguage; drivers: Driver[]; orders: Order[] }) => {
  const t = (ar: string, en: string) => localize(language, ar, en);
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {drivers.map((driver) => (
        <Card key={driver.id}>
          <CardHeader>
            <Badge variant={driver.status === 'online' || driver.status === 'available' ? 'success' : 'neutral'}>{driver.status}</Badge>
            <CardTitle>{driver.name}</CardTitle>
            <CardDescription>{driver.branch}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <InfoLine label={t('الهاتف', 'Phone')} value={driver.phone} />
            <InfoLine label={t('طلبات مكتملة', 'Completed')} value={String(driver.orders_completed)} />
            <InfoLine label={t('مهام نشطة', 'Active missions')} value={String(orders.filter((order) => order.assignedDriverId === driver.id).length)} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const BranchesOps = ({ language, branches, config, onConfigChange }: { language: SiteLanguage; branches: Branch[]; config: SiteConfig; onConfigChange: (config: SiteConfig) => void }) => {
  const t = (ar: string, en: string) => localize(language, ar, en);
  const updateBranchStatus = (branchId: string, status: Branch['status']) => {
    onConfigChange({
      ...config,
      branches: config.branches.map((branch) => branch.id === branchId ? { ...branch, status } : branch),
    });
  };
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {branches.map((branch) => (
        <Card key={branch.id}>
          <CardHeader>
            <Badge variant={branch.status === 'active' ? 'success' : branch.status === 'busy' ? 'warning' : 'neutral'}>{branch.status || 'active'}</Badge>
            <CardTitle>{branch.name}</CardTitle>
            <CardDescription>{branch.address}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <InfoLine label={t('الهاتف', 'Phone')} value={branch.phone} />
            <InfoLine label={t('ساعات العمل', 'Hours')} value={branch.hours} />
            <InfoLine label={t('الموقع', 'Location')} value={`${branch.coordinates.lat.toFixed(3)}, ${branch.coordinates.lng.toFixed(3)}`} />
            <label className="grid gap-2 text-xs font-black">
              {t('حالة الفرع', 'Branch status')}
              <select
                value={branch.status || 'active'}
                onChange={(event) => updateBranchStatus(branch.id, event.target.value as Branch['status'])}
                className="min-h-10 rounded-md border border-input bg-surface px-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="active">{t('نشط', 'Active')}</option>
                <option value="busy">{t('مشغول', 'Busy')}</option>
                <option value="closed">{t('مغلق', 'Closed')}</option>
              </select>
            </label>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const Inventory = ({ language, pricing }: { language: SiteLanguage; pricing: PricingItem[] }) => {
  const t = (ar: string, en: string) => localize(language, ar, en);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('المخزون والأسعار التشغيلية', 'Inventory and operational items')}</CardTitle>
        <CardDescription>{t('قائمة كثيفة كبداية لإدارة الأصناف.', 'Dense starter list for item management.')}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        {pricing.slice(0, 12).map((item) => (
          <div key={item.barcode} className="grid gap-2 rounded-md border border-border bg-surface p-3 md:grid-cols-[1fr_auto_auto] md:items-center">
            <div>
              <p className="font-black">{language === 'ar' ? item.name_ar : item.name_en}</p>
              <p className="text-xs text-muted-foreground">{item.barcode} · {item.category}</p>
            </div>
            <Badge variant={item.active === false ? 'neutral' : 'success'}>{item.active === false ? t('متوقف', 'Inactive') : t('نشط', 'Active')}</Badge>
            <span className="font-black text-primary">{formatCurrency(language, Number(item.wash_iron || item.wash_dry || item.dry || item.iron || 0))}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const Expenses = ({ language }: { language: SiteLanguage }) => {
  const t = (ar: string, en: string) => localize(language, ar, en);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('المصروفات', 'Expenses')}</CardTitle>
        <CardDescription>{t('حالات موافقة واضحة للمصروفات اليومية.', 'Clear approval states for daily expenses.')}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {expenseRows.map((expense) => (
          <div key={expense.id} className="grid gap-3 rounded-lg border border-border bg-surface p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
            <div>
              <p className="font-black">{localize(language, expense.ar, expense.en)}</p>
              <p className="text-sm text-muted-foreground" dir="ltr">{expense.id}</p>
            </div>
            <Badge variant={expense.status === 'approved' ? 'success' : expense.status === 'pending' ? 'warning' : 'info'}>{expense.status}</Badge>
            <span className="font-black text-primary">{formatCurrency(language, expense.amount)}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const Handover = ({ language, checklist, setChecklist }: { language: SiteLanguage; checklist: Record<string, boolean>; setChecklist: (value: Record<string, boolean>) => void }) => {
  const t = (ar: string, en: string) => localize(language, ar, en);
  const rows = [
    ['machines', t('تأكيد حالة الغسالات والنشافات', 'Confirm washer and dryer status')],
    ['pending', t('مراجعة الطلبات العالقة', 'Review pending orders')],
    ['cash', t('مطابقة النقدية والمدفوعات', 'Reconcile cash and payments')],
    ['incidents', t('تسجيل أي حادث أو ملاحظة', 'Log incidents or notes')],
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('تسليم الشفت', 'Shift handover')}</CardTitle>
        <CardDescription>{t('Checklist سريع لتقليل أخطاء نهاية الشفت.', 'Fast checklist to reduce end-of-shift mistakes.')}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {rows.map(([id, label]) => (
          <label key={id} className="flex min-h-14 items-center gap-3 rounded-lg border border-border bg-surface p-4 font-bold">
            <input
              type="checkbox"
              checked={Boolean(checklist[id])}
              onChange={(event) => setChecklist({ ...checklist, [id]: event.target.checked })}
              className="size-5 accent-[var(--color-primary)]"
            />
            {label}
          </label>
        ))}
      </CardContent>
    </Card>
  );
};

const SyncHealth = ({ language }: { language: SiteLanguage }) => {
  const t = (ar: string, en: string) => localize(language, ar, en);
  const [health, setHealth] = useState<SyncHealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState('');
  const [retryMessage, setRetryMessage] = useState('');

  const loadHealth = async () => {
    setLoading(true);
    setError('');
    try {
      setHealth(await customerApi.getSyncHealth());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : String(loadError));
    } finally {
      setLoading(false);
    }
  };

  const retryQueue = async () => {
    setRetrying(true);
    setError('');
    setRetryMessage('');
    try {
      const result = await customerApi.retrySyncQueue();
      setRetryMessage(
        result.skipped
          ? t(`تم تخطي العملية: ${result.skipped}`, `Skipped: ${result.skipped}`)
          : t(`تمت معالجة ${result.processed} عملية`, `Processed ${result.processed} jobs`),
      );
      await loadHealth();
    } catch (retryError) {
      setError(retryError instanceof Error ? retryError.message : String(retryError));
    } finally {
      setRetrying(false);
    }
  };

  useEffect(() => {
    void loadHealth();
  }, []);

  const counts = health?.counts || {};
  const pending = Number(counts.pending || 0);
  const failed = Number(counts.failed || 0);
  const dead = Number(counts.dead || 0);
  const synced = Number(counts.synced || 0);
  const overallVariant = !health
    ? 'neutral'
    : health.local.ok && (!health.supabase_configured || health.supabase_reachable) && dead === 0
      ? 'success'
      : dead > 0 || !health.local.ok
        ? 'danger'
        : 'warning';

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>{t('مراقبة المزامنة', 'Sync health')}</CardTitle>
                <Badge variant={overallVariant} withIcon>
                  {health
                    ? overallVariant === 'success'
                      ? t('مستقر', 'Stable')
                      : overallVariant === 'danger'
                        ? t('يتطلب تدخل', 'Needs action')
                        : t('متابعة', 'Watch')
                    : t('غير محمل', 'Not loaded')}
                </Badge>
              </div>
              <CardDescription>
                {health?.checked_at ? `${t('آخر فحص', 'Last check')}: ${formatSyncDate(health.checked_at, language)}` : t('حالة القاعدة المحلية و Supabase.', 'Local database and Supabase status.')}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={loadHealth} loading={loading}>
                <RefreshCw aria-hidden="true" className="size-5" />
                {t('تحديث', 'Refresh')}
              </Button>
              <Button variant="accent" onClick={retryQueue} loading={retrying} disabled={retrying || loading}>
                <Repeat2 aria-hidden="true" className="size-5" />
                {t('إعادة المحاولة', 'Retry queue')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 p-5">
          {error ? (
            <div className="flex items-start gap-3 rounded-lg border border-danger/20 bg-danger/10 p-4 text-sm font-bold text-danger">
              <AlertTriangle aria-hidden="true" className="mt-0.5 size-5" />
              <span>{error}</span>
            </div>
          ) : null}
          {retryMessage ? (
            <div className="flex items-start gap-3 rounded-lg border border-success/20 bg-success/10 p-4 text-sm font-bold text-success">
              <CheckCircle2 aria-hidden="true" className="mt-0.5 size-5" />
              <span>{retryMessage}</span>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SyncMetric
              icon={Database}
              label={t('SQLite المحلي', 'Local SQLite')}
              value={health?.local.ok ? t('متصل', 'Online') : t('غير متصل', 'Offline')}
              detail={`${t('طلبات', 'Orders')}: ${health?.local.customer_orders ?? 0}`}
              variant={health?.local.ok ? 'success' : 'danger'}
            />
            <SyncMetric
              icon={health?.supabase_reachable ? Server : WifiOff}
              label="Supabase"
              value={!health?.supabase_configured ? t('غير مهيأ', 'Not configured') : health.supabase_reachable ? t('متصل', 'Reachable') : t('متعذر', 'Unreachable')}
              detail={`${t('طلبات', 'Orders')}: ${health?.supabase.customer_orders ?? '-'}`}
              variant={!health?.supabase_configured ? 'neutral' : health.supabase_reachable ? 'success' : 'warning'}
            />
            <SyncMetric
              icon={Clock3}
              label={t('بانتظار المزامنة', 'Pending sync')}
              value={String(pending + failed)}
              detail={`${t('فاشلة', 'Failed')}: ${failed}`}
              variant={pending + failed > 0 ? 'warning' : 'success'}
            />
            <SyncMetric
              icon={AlertTriangle}
              label={t('متوقفة نهائيا', 'Dead jobs')}
              value={String(dead)}
              detail={`${t('متزامنة', 'Synced')}: ${synced}`}
              variant={dead > 0 ? 'danger' : 'success'}
            />
          </div>

          {health?.supabase.error ? (
            <div className="rounded-lg border border-warning/20 bg-warning/10 p-4 text-sm font-bold text-warning">
              {health.supabase.error}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('آخر عمليات الطابور', 'Latest queue jobs')}</CardTitle>
          <CardDescription>{t('آخر 20 عملية مزامنة محفوظة في السيرفر.', 'Latest 20 sync jobs stored on the server.')}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted text-xs text-muted-foreground">
                <tr>
                  <th className="p-3 text-start">{t('الكيان', 'Entity')}</th>
                  <th className="p-3 text-start">{t('العملية', 'Operation')}</th>
                  <th className="p-3 text-start">{t('الحالة', 'Status')}</th>
                  <th className="p-3 text-start">{t('المحاولات', 'Attempts')}</th>
                  <th className="p-3 text-start">{t('آخر تحديث', 'Updated')}</th>
                  <th className="p-3 text-start">{t('الخطأ', 'Error')}</th>
                </tr>
              </thead>
              <tbody>
                {(health?.latest || []).map((item) => (
                  <tr key={item.id} className="border-b border-border">
                    <td className="p-3">
                      <p className="font-black">{item.entity_type}</p>
                      <p className="text-xs text-muted-foreground" dir="ltr">{item.entity_id}</p>
                    </td>
                    <td className="p-3">{item.operation}</td>
                    <td className="p-3"><Badge variant={syncStatusVariant(item.status)}>{item.status}</Badge></td>
                    <td className="p-3 font-bold">{item.attempts}</td>
                    <td className="p-3">{formatSyncDate(item.updated_at, language)}</td>
                    <td className="max-w-sm truncate p-3 text-xs text-muted-foreground">{item.last_error || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid gap-3 p-3 lg:hidden">
            {(health?.latest || []).map((item) => (
              <div key={item.id} className="rounded-lg border border-border bg-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-black">{item.entity_type}</p>
                    <p className="truncate text-xs text-muted-foreground" dir="ltr">{item.entity_id}</p>
                  </div>
                  <Badge variant={syncStatusVariant(item.status)}>{item.status}</Badge>
                </div>
                <div className="mt-3 grid gap-2 text-sm">
                  <InfoLine label={t('العملية', 'Operation')} value={item.operation} />
                  <InfoLine label={t('المحاولات', 'Attempts')} value={String(item.attempts)} />
                  <InfoLine label={t('آخر تحديث', 'Updated')} value={formatSyncDate(item.updated_at, language)} />
                </div>
                {item.last_error ? <p className="mt-3 text-xs font-bold text-danger">{item.last_error}</p> : null}
              </div>
            ))}
          </div>
          {health && health.latest.length === 0 ? (
            <div className="p-6 text-center text-sm font-bold text-muted-foreground">
              {t('لا توجد عمليات مزامنة في الطابور.', 'No sync jobs in the queue.')}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

const SyncMetric = ({
  icon: Icon,
  label,
  value,
  detail,
  variant,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  detail: string;
  variant: 'neutral' | 'success' | 'warning' | 'danger';
}) => {
  const MetricIcon = Icon as any;
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="grid size-11 place-items-center rounded-md bg-muted text-primary">
          <MetricIcon aria-hidden="true" className="size-5" />
        </div>
        <Badge variant={variant}>{value}</Badge>
      </div>
      <p className="mt-4 text-xs font-bold text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-black">{detail}</p>
    </div>
  );
};

const syncStatusVariant = (status: string): 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'accent' => {
  if (status === 'synced') return 'success';
  if (status === 'failed') return 'warning';
  if (status === 'dead') return 'danger';
  if (status === 'pending') return 'info';
  return 'neutral';
};

const formatSyncDate = (value: string | null | undefined, language: SiteLanguage) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat(language === 'ar' ? 'ar-AE' : 'en-AE', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const OrderRow = ({ order, language, selected, toggle, setOrderStatus, assignDriver, drivers, setConfirmOrder }: OrderRenderProps) => {
  const meta = statusMeta[order.status];
  return (
    <tr className="border-b border-border">
      <td className="p-3"><input type="checkbox" checked={selected} onChange={() => toggle(order.id)} className="size-4 accent-[var(--color-primary)]" /></td>
      <td className="p-3 font-black" dir="ltr">{order.id}</td>
      <td className="p-3">{order.customerName}</td>
      <td className="p-3">{order.serviceType}</td>
      <td className="p-3"><Badge variant={meta.variant}>{localize(language, meta.ar, meta.en)}</Badge></td>
      <td className="p-3"><DriverSelect order={order} language={language} drivers={drivers} assignDriver={assignDriver} /></td>
      <td className="p-3">{order.branch}</td>
      <td className="p-3">
        <div className="flex gap-2">
          <StageSelect order={order} language={language} setOrderStatus={setOrderStatus} />
          <Button variant="destructive" size="sm" onClick={() => setConfirmOrder(order)}>{localize(language, 'إلغاء', 'Cancel')}</Button>
        </div>
      </td>
    </tr>
  );
};

type OrderRenderProps = {
  order: Order;
  language: SiteLanguage;
  selected: boolean;
  toggle: (id: string) => void;
  setOrderStatus: (id: string, status: OrderStatus) => void;
  assignDriver: (id: string, driverId: string) => void;
  drivers: Driver[];
  setConfirmOrder: (order: Order) => void;
};

const OrderCard = ({ order, language, selected, toggle, setOrderStatus, assignDriver, drivers, setConfirmOrder }: OrderRenderProps) => {
  const meta = statusMeta[order.status];
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <label className="flex items-center gap-3">
          <input type="checkbox" checked={selected} onChange={() => toggle(order.id)} className="size-5 accent-[var(--color-primary)]" />
          <span className="font-black" dir="ltr">{order.id}</span>
        </label>
        <Badge variant={meta.variant}>{localize(language, meta.ar, meta.en)}</Badge>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{order.customerName} · {order.serviceType}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <StageSelect order={order} language={language} setOrderStatus={setOrderStatus} />
        <DriverSelect order={order} language={language} drivers={drivers} assignDriver={assignDriver} />
        <Button variant="destructive" size="sm" onClick={() => setConfirmOrder(order)}>{localize(language, 'إلغاء', 'Cancel')}</Button>
      </div>
    </div>
  );
};

const DriverSelect = ({ order, language, drivers, assignDriver }: { order: Order; language: SiteLanguage; drivers: Driver[]; assignDriver: (id: string, driverId: string) => void }) => {
  const availableDrivers = drivers.filter((driver) => ['online', 'available', 'busy'].includes(driver.status));
  return (
    <select
      value={order.assignedDriverId || ''}
      onChange={(event) => assignDriver(order.id, event.target.value)}
      className="min-h-9 max-w-44 rounded-md border border-input bg-surface px-2 text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={localize(language, 'تعيين السائق', 'Assign driver')}
    >
      <option value="">{localize(language, 'بدون سائق', 'No driver')}</option>
      {availableDrivers.map((driver) => (
        <option key={driver.id} value={driver.id}>{driver.name}</option>
      ))}
    </select>
  );
};

const StageSelect = ({ order, language, setOrderStatus }: { order: Order; language: SiteLanguage; setOrderStatus: (id: string, status: OrderStatus) => void }) => (
  <select
    value={order.status}
    onChange={(event) => setOrderStatus(order.id, event.target.value as OrderStatus)}
    className="min-h-9 rounded-md border border-input bg-surface px-2 text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    aria-label={localize(language, 'تغيير حالة الطلب', 'Change order status')}
  >
    {Object.entries(statusMeta).map(([status, meta]) => (
      <option key={status} value={status}>{localize(language, meta.ar, meta.en)}</option>
    ))}
  </select>
);

const CompactOrder = ({ order, language }: { order: Order; language: SiteLanguage }) => {
  const meta = statusMeta[order.status];
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface p-3">
      <div className="min-w-0">
        <p className="truncate font-black" dir="ltr">{order.id}</p>
        <p className="truncate text-xs text-muted-foreground">{order.customerName}</p>
      </div>
      <Badge variant={meta.variant}>{localize(language, meta.ar, meta.en)}</Badge>
    </div>
  );
};

const ModuleButton = ({ module, active, language, onClick }: { module: (typeof modules)[number]; active: boolean; language: SiteLanguage; onClick: () => void }) => {
  const Icon = module.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('flex min-h-11 items-center gap-3 rounded-md px-3 text-start text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', active ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted')}
    >
      <Icon aria-hidden="true" className="size-5" />
      <span className="min-w-0 flex-1">{localize(language, module.ar, module.en)}</span>
    </button>
  );
};

const OpsStat = ({ icon: Icon, label, value, tone }: { icon: React.ElementType; label: string; value: string; tone: 'primary' | 'warning' | 'success' | 'danger' }) => {
  const toneClass = {
    primary: 'bg-primary text-white',
    warning: 'bg-warning text-white',
    success: 'bg-success text-white',
    danger: 'bg-danger text-white',
  }[tone];
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn('grid size-11 place-items-center rounded-md', toneClass)}>
          <Icon aria-hidden="true" className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-muted-foreground">{label}</p>
          <p className="mt-1 truncate text-xl font-black">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const InfoLine = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-3 border-b border-border pb-2 last:border-b-0 last:pb-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-bold">{value}</span>
  </div>
);

const moduleTitle = (module: OpsModule, language: SiteLanguage) => {
  const found = modules.find((item) => item.id === module) || modules[0];
  return localize(language, found.ar, found.en);
};
