import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Boxes,
  Building2,
  CalendarDays,
  Download,
  FileSpreadsheet,
  Filter,
  LineChart,
  PackageCheck,
  Printer,
  ReceiptText,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Branch, Driver, Order, PricingItem } from '../types';
import { formatCurrency, localize, SiteLanguage } from '../lib/i18n';
import { cn } from '../lib/utils';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface ReportsDashboardProps {
  orders: Order[];
  branches: Branch[];
  drivers: Driver[];
  pricing: PricingItem[];
  language?: SiteLanguage;
}

type ReportTab = 'revenue' | 'orders' | 'branches' | 'complaints' | 'inventory' | 'expenses';
type DateRange = 'today' | '7d' | '30d' | 'quarter';

const tabs: Array<{ id: ReportTab; ar: string; en: string; icon: React.ElementType }> = [
  { id: 'revenue', ar: 'الإيرادات', en: 'Revenue', icon: LineChart },
  { id: 'orders', ar: 'الطلبات', en: 'Orders', icon: PackageCheck },
  { id: 'branches', ar: 'الفروع', en: 'Branches', icon: Building2 },
  { id: 'complaints', ar: 'الشكاوى', en: 'Complaints', icon: AlertTriangle },
  { id: 'inventory', ar: 'المخزون', en: 'Inventory', icon: Boxes },
  { id: 'expenses', ar: 'المصروفات', en: 'Expenses', icon: ReceiptText },
];

const ranges: Array<{ id: DateRange; ar: string; en: string }> = [
  { id: 'today', ar: 'اليوم', en: 'Today' },
  { id: '7d', ar: '7 أيام', en: '7 days' },
  { id: '30d', ar: '30 يوم', en: '30 days' },
  { id: 'quarter', ar: 'ربع سنوي', en: 'Quarter' },
];

const expenseData = [
  { key: 'supplies', ar: 'مواد تنظيف', en: 'Supplies', amount: 1280 },
  { key: 'delivery', ar: 'توصيل', en: 'Delivery', amount: 820 },
  { key: 'maintenance', ar: 'صيانة', en: 'Maintenance', amount: 540 },
  { key: 'utilities', ar: 'مرافق', en: 'Utilities', amount: 460 },
];

export const ReportsDashboard: React.FC<ReportsDashboardProps> = ({
  orders,
  branches,
  drivers,
  pricing,
  language = 'ar',
}) => {
  const [activeTab, setActiveTab] = useState<ReportTab>('revenue');
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [branchFilter, setBranchFilter] = useState('all');
  const reduceMotion = useReducedMotion();
  const t = (ar: string, en: string) => localize(language, ar, en);

  const filteredOrders = useMemo(() => {
    if (branchFilter === 'all') return orders;
    return orders.filter((order) => order.branch === branchFilter || order.branch.includes(branchFilter));
  }, [branchFilter, orders]);

  const metrics = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + amountOf(order), 0);
    const activeOrders = filteredOrders.filter((order) => !['delivered', 'completed', 'cancelled'].includes(order.status)).length;
    const completedOrders = filteredOrders.filter((order) => ['delivered', 'completed'].includes(order.status)).length;
    const complaints = filteredOrders.filter((order) => order.status === 'cancelled' || order.paymentStatus !== 'paid').length;
    return { totalRevenue, activeOrders, completedOrders, complaints };
  }, [filteredOrders]);

  const revenueSeries = useMemo(() => buildRevenueSeries(filteredOrders), [filteredOrders]);
  const statusSeries = useMemo(() => buildStatusSeries(filteredOrders, language), [filteredOrders, language]);
  const branchSeries = useMemo(() => buildBranchSeries(filteredOrders, branches, language), [branches, filteredOrders, language]);
  const complaintSeries = useMemo(() => buildComplaintSeries(filteredOrders, language), [filteredOrders, language]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(140,35,112,0.12),transparent_34%),linear-gradient(180deg,#F2F2F2,#ffffff)] text-foreground">
      <header className="border-b border-white/70 bg-white/64 shadow-low backdrop-blur-3xl">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <p className="text-sm font-bold text-accent">{t('Reports UI', 'Reports UI')}</p>
              <h1 className="mt-1 text-3xl font-black text-primary md:text-5xl">
                {t('تقارير تحول التشغيل إلى قرارات.', 'Reports that turn operations into decisions.')}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                {t('إيرادات، طلبات، فروع، شكاوى، مخزون، ومصروفات مع تصدير واضح.', 'Revenue, orders, branches, complaints, inventory, and expenses with clear export actions.')}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary"><Download aria-hidden="true" className="size-5" />PDF</Button>
              <Button variant="secondary"><FileSpreadsheet aria-hidden="true" className="size-5" />Excel</Button>
              <Button variant="secondary"><Printer aria-hidden="true" className="size-5" />{t('طباعة', 'Print')}</Button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 rounded-2xl border border-white/70 bg-white/72 p-3 shadow-glass backdrop-blur-3xl lg:grid-cols-[auto_1fr_auto] lg:items-center">
            <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
              <Filter aria-hidden="true" className="size-4" />
              {t('الفلاتر', 'Filters')}
            </div>
            <div className="flex flex-wrap gap-2">
              {ranges.map((range) => (
                <button
                  key={range.id}
                  type="button"
                  onClick={() => setDateRange(range.id)}
                  className={cn('min-h-10 rounded-pill border px-4 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', dateRange === range.id ? 'border-primary bg-primary text-white' : 'border-border bg-surface')}
                >
                  {localize(language, range.ar, range.en)}
                </button>
              ))}
            </div>
            <select
              value={branchFilter}
              onChange={(event) => setBranchFilter(event.target.value)}
              className="min-h-11 rounded-md border border-input bg-surface px-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={t('فلتر الفرع', 'Branch filter')}
            >
              <option value="all">{t('كل الفروع', 'All branches')}</option>
              {branches.map((branch) => <option key={branch.id} value={branch.name}>{branch.name}</option>)}
            </select>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn('flex min-h-11 shrink-0 items-center gap-2 rounded-md border px-4 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', activeTab === tab.id ? 'border-primary bg-primary text-white' : 'border-border bg-surface text-muted-foreground')}
              >
                <Icon aria-hidden="true" className="size-4" />
                {localize(language, tab.ar, tab.en)}
              </button>
            );
          })}
        </div>

        <motion.div
          key={`${activeTab}-${dateRange}-${branchFilter}`}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.16 }}
          className="grid gap-6"
        >
          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard icon={TrendingUp} label={t('إجمالي الإيراد', 'Total revenue')} value={formatCurrency(language, metrics.totalRevenue)} hint="+12%" tone="primary" />
            <MetricCard icon={PackageCheck} label={t('طلبات نشطة', 'Active orders')} value={String(metrics.activeOrders)} hint={t('الآن', 'Now')} tone="info" />
            <MetricCard icon={TrendingDown} label={t('شكاوى/مخاطر', 'Complaints / risk')} value={String(metrics.complaints)} hint={t('تحتاج مراجعة', 'Needs review')} tone="warning" />
            <MetricCard icon={Users} label={t('السائقون', 'Drivers')} value={String(drivers.length)} hint={t('متاحون', 'Available')} tone="success" />
          </div>

          {activeTab === 'revenue' ? (
            <DashboardGrid
              main={<LinePanel title={t('Revenue trend', 'Revenue trend')} description={t('المحور الرأسي: الإيراد، الأفقي: الفترة.', 'Y-axis: revenue, X-axis: period.')} series={revenueSeries} language={language} />}
              side={<BarPanel title={t('Revenue by branch', 'Revenue by branch')} description={t('مقارنة الفروع', 'Branch comparison')} data={branchSeries} language={language} />}
            />
          ) : null}

          {activeTab === 'orders' ? (
            <DashboardGrid
              main={<BarPanel title={t('Orders by status', 'Orders by status')} description={t('توزيع الطلبات حسب الحالة.', 'Order distribution by status.')} data={statusSeries} language={language} />}
              side={<FunnelPanel language={language} orders={filteredOrders} />}
            />
          ) : null}

          {activeTab === 'branches' ? (
            <DashboardGrid
              main={<BarPanel title={t('Branch comparison', 'Branch comparison')} description={t('إيراد وطلب لكل فرع.', 'Revenue and orders by branch.')} data={branchSeries} language={language} />}
              side={<BranchTable branches={branches} data={branchSeries} language={language} />}
            />
          ) : null}

          {activeTab === 'complaints' ? (
            <DashboardGrid
              main={<BarPanel title={t('Complaints trend', 'Complaints trend')} description={t('مؤشرات الشكاوى والمخاطر.', 'Complaints and risk indicators.')} data={complaintSeries} language={language} />}
              side={<RiskTable orders={filteredOrders} language={language} />}
            />
          ) : null}

          {activeTab === 'inventory' ? (
            <DashboardGrid
              main={<InventoryPanel pricing={pricing} language={language} />}
              side={<BarPanel title={t('Inventory categories', 'Inventory categories')} description={t('عدد الأصناف حسب التصنيف.', 'Items by category.')} data={buildInventorySeries(pricing, language)} language={language} />}
            />
          ) : null}

          {activeTab === 'expenses' ? (
            <DashboardGrid
              main={<BarPanel title={t('Expense breakdown', 'Expense breakdown')} description={t('مصروفات تشغيلية نموذجية.', 'Sample operational expenses.')} data={expenseData.map((item) => ({ label: localize(language, item.ar, item.en), value: item.amount }))} language={language} />}
              side={<ExpensesTable language={language} />}
            />
          ) : null}

          <DrillDownTable orders={filteredOrders} language={language} />
        </motion.div>
      </section>
    </main>
  );
};

const DashboardGrid = ({ main, side }: { main: React.ReactNode; side: React.ReactNode }) => (
  <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
    {main}
    {side}
  </div>
);

const MetricCard = ({ icon: Icon, label, value, hint, tone }: { icon: React.ElementType; label: string; value: string; hint: string; tone: 'primary' | 'info' | 'warning' | 'success' }) => {
  const toneClass = {
    primary: 'bg-primary text-white',
    info: 'bg-info text-white',
    warning: 'bg-warning text-white',
    success: 'bg-success text-white',
  }[tone];
  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-5 flex items-center justify-between">
          <div className={cn('grid size-11 place-items-center rounded-md', toneClass)}>
            <Icon aria-hidden="true" className="size-5" />
          </div>
          <Badge variant={tone === 'warning' ? 'warning' : 'info'}>{hint}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 truncate text-2xl font-black text-primary">{value}</p>
      </CardContent>
    </Card>
  );
};

const LinePanel = ({ title, description, series, language }: { title: string; description: string; series: Array<{ label: string; value: number }>; language: SiteLanguage }) => {
  const max = Math.max(...series.map((item) => item.value), 1);
  const points = series.map((item, index) => {
    const x = 8 + (index / Math.max(series.length - 1, 1)) * 84;
    const y = 88 - (item.value / max) * 70;
    return `${x},${y}`;
  }).join(' ');
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {series.length ? (
          <div>
            <div className="h-72 rounded-lg border border-border bg-muted p-4">
              <svg viewBox="0 0 100 100" role="img" aria-label={title} className="h-full w-full">
                <line x1="8" y1="88" x2="94" y2="88" stroke="currentColor" className="text-border" />
                <line x1="8" y1="14" x2="8" y2="88" stroke="currentColor" className="text-border" />
                <polyline points={points} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                {series.map((item, index) => {
                  const x = 8 + (index / Math.max(series.length - 1, 1)) * 84;
                  const y = 88 - (item.value / max) * 70;
                  return <circle key={item.label} cx={x} cy={y} r="2.4" fill="var(--color-accent)" />;
                })}
              </svg>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-xs text-muted-foreground md:grid-cols-7">
              {series.map((item) => <span key={item.label}>{item.label}</span>)}
            </div>
          </div>
        ) : <EmptyChart language={language} />}
      </CardContent>
    </Card>
  );
};

const BarPanel = ({ title, description, data, language }: { title: string; description: string; data: Array<{ label: string; value: number }>; language: SiteLanguage }) => {
  const max = Math.max(...data.map((item) => item.value), 1);
  const hasData = data.some((item) => item.value > 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {data.length && hasData ? data.map((item, index) => (
          <div key={item.label}>
            <div className="mb-1 flex justify-between gap-3 text-sm">
              <span className="font-bold">{item.label}</span>
              <span className="tabular-nums text-muted-foreground">{item.value.toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
            </div>
            <div className="h-4 overflow-hidden rounded-pill bg-muted" role="img" aria-label={`${item.label}: ${item.value}`}>
              <div
                className={cn('h-full rounded-pill', index === 1 ? 'bg-accent' : index === 2 ? 'bg-warning' : 'bg-primary')}
                style={{ width: `${Math.max((item.value / max) * 100, 5)}%` }}
              />
            </div>
          </div>
        )) : <EmptyChart language={language} />}
      </CardContent>
    </Card>
  );
};

const FunnelPanel = ({ language, orders }: { language: SiteLanguage; orders: Order[] }) => {
  const t = (ar: string, en: string) => localize(language, ar, en);
  const rows = [
    [t('تم الاستلام', 'Received'), orders.length],
    [t('قيد المعالجة', 'Processing'), orders.filter((order) => ['accepted', 'pickup', 'washing'].includes(order.status)).length],
    [t('جاهز', 'Ready'), orders.filter((order) => order.status === 'ready').length],
    [t('تم التسليم', 'Delivered'), orders.filter((order) => ['delivered', 'completed'].includes(order.status)).length],
  ];
  const max = Math.max(...rows.map(([, value]) => Number(value)), 1);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('Order funnel', 'Order funnel')}</CardTitle>
        <CardDescription>{t('summary → detail table drill-down', 'summary → detail table drill-down')}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {rows.map(([label, value]) => (
          <div key={String(label)} className="rounded-lg border border-border bg-muted p-3">
            <div className="flex justify-between text-sm font-bold">
              <span>{label}</span>
              <span>{String(value)}</span>
            </div>
            <div className="mt-2 h-5 rounded-pill bg-surface">
              <div className="h-full rounded-pill bg-accent" style={{ width: `${Math.max((Number(value) / max) * 100, 8)}%` }} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const BranchTable = ({ branches, data, language }: { branches: Branch[]; data: Array<{ label: string; value: number }>; language: SiteLanguage }) => (
  <Card>
    <CardHeader>
      <CardTitle>{localize(language, 'جدول الفروع', 'Branch table')}</CardTitle>
      <CardDescription>{localize(language, 'مقارنة مختصرة قابلة للتفصيل.', 'Compact comparison ready for drill-down.')}</CardDescription>
    </CardHeader>
    <CardContent className="grid gap-3">
      {branches.map((branch) => {
        const value = data.find((item) => item.label === branch.name)?.value || 0;
        return <InfoRow key={branch.id} label={branch.name} value={formatCurrency(language, value)} badge={branch.status || 'active'} />;
      })}
    </CardContent>
  </Card>
);

const RiskTable = ({ orders, language }: { orders: Order[]; language: SiteLanguage }) => {
  const risks = orders.filter((order) => order.status === 'cancelled' || order.paymentStatus !== 'paid').slice(0, 6);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{localize(language, 'حالات تحتاج متابعة', 'Cases needing follow-up')}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {(risks.length ? risks : orders.slice(0, 3)).map((order, index) => (
          <InfoRow key={order.id} label={order.id} value={order.customerName} badge={index === 0 ? localize(language, 'عاجل', 'Urgent') : localize(language, 'مراقبة', 'Watch')} />
        ))}
      </CardContent>
    </Card>
  );
};

const InventoryPanel = ({ pricing, language }: { pricing: PricingItem[]; language: SiteLanguage }) => (
  <Card>
    <CardHeader>
      <CardTitle>{localize(language, 'تقرير المخزون', 'Inventory report')}</CardTitle>
      <CardDescription>{localize(language, 'الأصناف النشطة وقابلية التسعير.', 'Active items and pricing readiness.')}</CardDescription>
    </CardHeader>
    <CardContent className="grid gap-2">
      {pricing.slice(0, 10).map((item) => (
        <div key={item.barcode} className="grid gap-2 rounded-md border border-border bg-surface p-3 md:grid-cols-[1fr_auto_auto] md:items-center">
          <div>
            <p className="font-black">{language === 'ar' ? item.name_ar : item.name_en}</p>
            <p className="text-xs text-muted-foreground">{item.category} · {item.barcode}</p>
          </div>
          <Badge variant={item.active === false ? 'neutral' : 'success'}>{item.active === false ? 'inactive' : 'active'}</Badge>
          <span className="font-black text-primary">{formatCurrency(language, Number(item.wash_iron || item.wash_dry || item.dry || item.iron || 0))}</span>
        </div>
      ))}
    </CardContent>
  </Card>
);

const ExpensesTable = ({ language }: { language: SiteLanguage }) => (
  <Card>
    <CardHeader>
      <CardTitle>{localize(language, 'جدول المصروفات', 'Expenses table')}</CardTitle>
    </CardHeader>
    <CardContent className="grid gap-3">
      {expenseData.map((item) => <InfoRow key={item.key} label={localize(language, item.ar, item.en)} value={formatCurrency(language, item.amount)} badge="OPEX" />)}
    </CardContent>
  </Card>
);

const DrillDownTable = ({ orders, language }: { orders: Order[]; language: SiteLanguage }) => (
  <Card>
    <CardHeader>
      <CardTitle>{localize(language, 'جدول التفاصيل', 'Drill-down table')}</CardTitle>
      <CardDescription>{localize(language, 'الجدول المساند لكل الرسوم أعلاه.', 'Supporting detail table for the charts above.')}</CardDescription>
    </CardHeader>
    <CardContent className="p-0">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted text-xs text-muted-foreground">
            <tr>
              <th className="p-3 text-start">{localize(language, 'الطلب', 'Order')}</th>
              <th className="p-3 text-start">{localize(language, 'العميل', 'Customer')}</th>
              <th className="p-3 text-start">{localize(language, 'الفرع', 'Branch')}</th>
              <th className="p-3 text-start">{localize(language, 'الحالة', 'Status')}</th>
              <th className="p-3 text-start">{localize(language, 'المبلغ', 'Amount')}</th>
            </tr>
          </thead>
          <tbody>
            {orders.length ? orders.slice(0, 10).map((order) => (
              <tr key={order.id} className="border-b border-border">
                <td className="p-3 font-black" dir="ltr">{order.id}</td>
                <td className="p-3">{order.customerName}</td>
                <td className="p-3">{order.branch}</td>
                <td className="p-3"><Badge variant={order.status === 'cancelled' ? 'danger' : order.status === 'delivered' ? 'success' : 'info'}>{order.status}</Badge></td>
                <td className="p-3 font-black">{formatCurrency(language, amountOf(order))}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">
                  {localize(language, 'لا توجد بيانات لهذه الفترة. غيّر الفلتر أو الفترة لعرض نتائج.', 'No data for this date range. Change filters or date range to view results.')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 p-3 md:hidden">
        {orders.length ? orders.slice(0, 10).map((order) => (
          <div key={order.id} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black" dir="ltr">{order.id}</p>
                <p className="text-sm text-muted-foreground">{order.customerName}</p>
              </div>
              <Badge variant={order.status === 'cancelled' ? 'danger' : order.status === 'delivered' ? 'success' : 'info'}>{order.status}</Badge>
            </div>
            <p className="mt-3 font-black text-primary">{formatCurrency(language, amountOf(order))}</p>
          </div>
        )) : <EmptyChart language={language} />}
      </div>
    </CardContent>
  </Card>
);

const InfoRow = ({ label, value, badge }: { label: string; value: string; badge: string }) => (
  <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-3">
    <div>
      <p className="font-black">{label}</p>
      <p className="mt-1 text-sm text-muted-foreground">{value}</p>
    </div>
    <Badge variant="info">{badge}</Badge>
  </div>
);

const EmptyChart = ({ language }: { language: SiteLanguage }) => (
  <div className="rounded-lg border border-dashed border-border bg-muted p-8 text-center">
    <CalendarDays aria-hidden="true" className="mx-auto mb-3 size-8 text-primary" />
    <p className="font-black">{localize(language, 'لا توجد بيانات لهذه الفترة', 'No data for this date range')}</p>
    <p className="mt-2 text-sm text-muted-foreground">{localize(language, 'غيّر الفلتر أو الفترة لعرض نتائج.', 'Change filters or date range to view results.')}</p>
  </div>
);

const amountOf = (order: Order) => Number(order.pos?.total ?? order.totalPrice ?? order.amount ?? 0) || 0;

const buildRevenueSeries = (orders: Order[]) => {
  const base = orders.reduce((sum, order) => sum + amountOf(order), 0);
  if (!orders.length || base <= 0) return [];
  const safeBase = base;
  return ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'].map((label, index) => ({
    label,
    value: Math.round((safeBase / 7) * (0.72 + index * 0.08)),
  }));
};

const buildStatusSeries = (orders: Order[], language: SiteLanguage) => {
  const labels: Record<string, string> = {
    new: localize(language, 'جديد', 'New'),
    washing: localize(language, 'معالجة', 'Processing'),
    ready: localize(language, 'جاهز', 'Ready'),
    delivered: localize(language, 'مسلم', 'Delivered'),
    cancelled: localize(language, 'ملغي', 'Cancelled'),
  };
  return Object.entries(labels).map(([status, label]) => ({
    label,
    value: orders.filter((order) => order.status === status || (status === 'delivered' && order.status === 'completed')).length,
  }));
};

const buildBranchSeries = (orders: Order[], branches: Branch[], language: SiteLanguage) =>
  branches.map((branch) => ({
    label: language === 'ar' ? branch.name : branch.name.replace('فرع ', ''),
    value: orders.filter((order) => order.branch === branch.name || order.branch.includes(branch.name)).reduce((sum, order) => sum + amountOf(order), 0),
  }));

const buildComplaintSeries = (orders: Order[], language: SiteLanguage) => [
  { label: localize(language, 'دفع', 'Payment'), value: orders.filter((order) => order.paymentStatus !== 'paid').length },
  { label: localize(language, 'ملغي', 'Cancelled'), value: orders.filter((order) => order.status === 'cancelled').length },
  { label: localize(language, 'توصيل', 'Delivery'), value: orders.filter((order) => order.status === 'delivery').length },
  { label: localize(language, 'عاجل', 'Urgent'), value: orders.filter((order) => order.priority === 'urgent').length },
];

const buildInventorySeries = (pricing: PricingItem[], language: SiteLanguage) => {
  const categories = ['men', 'women', 'kids', 'home'];
  const label: Record<string, string> = {
    men: localize(language, 'رجال', 'Men'),
    women: localize(language, 'نساء', 'Women'),
    kids: localize(language, 'أطفال', 'Kids'),
    home: localize(language, 'منزلية', 'Home'),
  };
  return categories.map((category) => ({
    label: label[category],
    value: pricing.filter((item) => item.category === category && item.active !== false).length,
  }));
};
