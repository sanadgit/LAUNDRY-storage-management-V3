import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  AlertCircle,
  Banknote,
  BarChart3,
  Building2,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  CreditCard,
  Download,
  FileCheck2,
  Loader2,
  Mail,
  Phone,
  ReceiptText,
  RefreshCw,
  Share2,
  ShoppingCart,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

type ReportStatus = 'idle' | 'loading' | 'success' | 'error';

type PerformanceReport = {
  ok: boolean;
  report_id: string;
  report_type: string;
  period_label: string;
  from_date: string;
  to_date: string;
  branch_id: string;
  branch_name: string;
  prepared_by: string;
  report_date: string;
  share_url: string;
  image_url: string;
  metrics: {
    total_revenue: number;
    cash: number;
    card: number;
    total_expenses: number;
    net_profit: number;
    cash_expenses: number;
    card_expenses: number;
    net_cash: number;
    total_orders: number;
    cash_percent: number;
    card_percent: number;
    expense_percent: number;
    net_profit_percent: number;
  };
  series: Array<{
    label: string;
    from_date: string;
    to_date: string;
    revenue: number;
    expenses: number;
    orders: number;
  }>;
  expense_categories: Array<{
    category: string;
    amount: number;
    percent: number;
    source?: string;
  }>;
  payment_methods?: Array<{
    method: string;
    amount: number;
    percent: number;
    source?: string;
  }>;
  data_sources?: {
    expense_categories?: string;
    payment_methods?: string;
    revenue_trend?: string;
  };
  advice: {
    performance: string[];
    notes: string[];
    goals: string[];
  };
};

const toDateInputValue = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
};

const today = () => toDateInputValue(new Date());

const monthStart = () => {
  const now = new Date();
  return toDateInputValue(new Date(now.getFullYear(), now.getMonth(), 1));
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const previousMonthRange = () => {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const to = new Date(now.getFullYear(), now.getMonth(), 0);
  return { from: toDateInputValue(from), to: toDateInputValue(to), label: from.toLocaleString('en-US', { month: 'long', year: 'numeric' }) };
};

const previousYearRange = () => {
  const now = new Date();
  const year = now.getFullYear() - 1;
  return { from: `${year}-01-01`, to: `${year}-12-31`, label: String(year) };
};

const formatMoney = (value: number | null | undefined) => {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return 'AED 0.00';
  return `AED ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatNumber = (value: number | null | undefined) => Number(value ?? 0).toLocaleString('en-US');

const formatPercent = (value: number | null | undefined) => `${Number(value ?? 0).toFixed(1)}%`;

const formatSourceLabel = (value?: string) => {
  const labels: Record<string, string> = {
    expense_purchase_details: 'المصدر: تفاصيل المصروفات والمشتريات من POS',
    counter_cash_summary_rows: 'المصدر: ملخص Counter Cash',
    received_payment_details: 'المصدر: تفاصيل المدفوعات من POS',
    counter_cash_summary: 'المصدر: ملخص طرق الدفع من POS',
    order_billwise_details: 'المصدر: تفاصيل الفواتير من POS',
    counter_cash_bucket_reports: 'المصدر: تقارير Counter Cash حسب الفترة',
  };
  return value ? labels[value] || value : '';
};

const compactLegendLabel = (value: string) => {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= 46) return text;
  return `${text.slice(0, 43).trim()}...`;
};

const formatCompactMoney = (value: number | null | undefined) => {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount) || amount <= 0) return '0';
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${Math.ceil(amount / 1_000)}K`;
  return amount.toFixed(0);
};

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

function KpiCard({
  title,
  subtitle,
  value,
  meta,
  icon: Icon,
  tone,
}: {
  title: string;
  subtitle: string;
  value: string;
  meta: string;
  icon: LucideIcon;
  tone: 'teal' | 'navy' | 'red' | 'green' | 'blue';
}) {
  const tones = {
    teal: 'from-cyan-600 to-teal-500 text-cyan-700',
    navy: 'from-slate-900 to-blue-900 text-blue-900',
    red: 'from-red-500 to-rose-600 text-red-700',
    green: 'from-green-600 to-emerald-500 text-green-700',
    blue: 'from-sky-600 to-blue-600 text-sky-700',
  }[tone];

  return (
    <article className="min-h-36 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex h-full items-start gap-4">
        <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${tones} text-white shadow-sm`}>
          <Icon size={34} strokeWidth={2.4} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-right text-sm font-black leading-5 text-slate-900" dir="rtl">
            {title}
          </div>
          <div className="mt-1 text-xs font-black uppercase text-slate-700">{subtitle}</div>
          <div className={`mt-4 break-words text-2xl font-black ${tones.split(' ').at(-1)}`}>{value}</div>
          <div className="mt-2 text-right text-xs font-semibold text-slate-700" dir="rtl">
            {meta}
          </div>
        </div>
      </div>
    </article>
  );
}

function HighlightMetric({
  title,
  subtitle,
  value,
  icon: Icon,
  tone,
}: {
  title: string;
  subtitle: string;
  value: string;
  icon: LucideIcon;
  tone: 'green' | 'red' | 'blue';
}) {
  const tones = {
    green: 'border-green-200 bg-green-50 text-green-700 from-green-600 to-emerald-500',
    red: 'border-red-200 bg-red-50 text-red-700 from-red-500 to-rose-600',
    blue: 'border-sky-200 bg-sky-50 text-sky-700 from-sky-600 to-blue-600',
  }[tone];

  return (
    <article className={`rounded-lg border p-5 ${tones}`}>
      <div className="flex items-center justify-center gap-5">
        <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${tones} text-white shadow-sm`}>
          <Icon size={32} />
        </div>
        <div className="min-w-0 text-center">
          <div className="text-sm font-black text-slate-900" dir="rtl">
            {title}
          </div>
          <div className="mt-1 text-xs font-black uppercase text-slate-800">{subtitle}</div>
          <div className="mt-3 break-words text-3xl font-black">{value}</div>
        </div>
      </div>
    </article>
  );
}

function DonutChart({
  title,
  subtitle,
  centerTitle,
  centerValue,
  items,
  sourceLabel,
}: {
  title: string;
  subtitle: string;
  centerTitle: string;
  centerValue: string;
  items: Array<{ label: string; value: number; percent: number; color: string }>;
  sourceLabel?: string;
}) {
  let cursor = 0;
  const segments = items
    .filter((item) => item.value > 0)
    .map((item) => {
      const start = cursor;
      cursor += clampPercent(item.percent);
      return `${item.color} ${start}% ${cursor}%`;
    });
  const background = segments.length ? `conic-gradient(${segments.join(', ')})` : 'conic-gradient(#cbd5e1 0% 100%)';

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-center">
        <h2 className="text-base font-black text-slate-900" dir="rtl">
          {title}
        </h2>
        <div className="text-xs font-black uppercase text-slate-700">{subtitle}</div>
        {sourceLabel && <div className="mt-1 text-[11px] font-bold text-cyan-700">{sourceLabel}</div>}
      </div>
      <div className="mt-5 grid items-center gap-5 sm:grid-cols-[12rem_minmax(0,1fr)] 2xl:grid-cols-[13rem_minmax(0,1fr)]">
        <div className="relative mx-auto h-48 w-48 rounded-full 2xl:h-52 2xl:w-52" style={{ background }}>
          <div className="absolute inset-11 flex flex-col items-center justify-center rounded-full bg-white text-center shadow-inner">
            <div className="text-xs font-black uppercase text-slate-700">{centerTitle}</div>
            <div className="mt-1 max-w-28 break-words text-base font-black leading-5 text-slate-950 2xl:text-lg">{centerValue}</div>
          </div>
        </div>
        <div className="min-w-0 space-y-3">
          {items.map((item) => (
            <div key={item.label} className="grid min-w-0 grid-cols-[0.875rem_minmax(0,1fr)] items-start gap-2 text-sm">
              <span className="mt-1.5 h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
              <div className="min-w-0">
                <div className="break-words font-semibold leading-5 text-slate-800" dir="rtl">
                  {item.label}
                </div>
                <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span className="font-bold leading-5 text-slate-900">{formatMoney(item.value)}</span>
                  <span className="font-bold leading-5 text-slate-700">{formatPercent(item.percent)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RevenueBars({ series, sourceLabel }: { series: PerformanceReport['series']; sourceLabel?: string }) {
  const chartSeries = series || [];
  const maxRevenue = Math.max(0, ...chartSeries.map((item) => Number(item.revenue || 0)));
  const labelStep = Math.max(1, Math.ceil(chartSeries.length / 8));
  const hasRevenue = chartSeries.some((item) => Number(item.revenue || 0) > 0);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-center">
        <h2 className="text-base font-black text-slate-900" dir="rtl">
          الإيرادات حسب الفترة
        </h2>
        <div className="text-xs font-black uppercase text-slate-700">REVENUE TREND (AED)</div>
        {sourceLabel && <div className="mt-1 text-[11px] font-bold text-cyan-700">{sourceLabel}</div>}
      </div>
      {hasRevenue ? (
        <div className="mt-5 overflow-x-auto">
          <svg className="h-72 min-w-[34rem] overflow-visible" viewBox="0 0 620 280" role="img" aria-label="Revenue trend chart">
            {[0, 1, 2, 3].map((line) => {
              const y = 28 + line * 56;
              const value = maxRevenue * (1 - line / 3);
              return (
                <g key={line}>
                  <line x1="48" y1={y} x2="604" y2={y} stroke="#e2e8f0" strokeWidth="1" />
                  <text x="42" y={y + 4} textAnchor="end" className="fill-slate-600 text-[11px] font-bold">
                    {formatCompactMoney(value)}
                  </text>
                </g>
              );
            })}
            <line x1="48" y1="196" x2="604" y2="196" stroke="#cbd5e1" strokeWidth="1.5" />
            <line x1="48" y1="28" x2="48" y2="196" stroke="#cbd5e1" strokeWidth="1.5" />
            {chartSeries.map((item, index) => {
              const availableWidth = 540;
              const slot = availableWidth / Math.max(chartSeries.length, 1);
              const barWidth = Math.max(5, Math.min(18, slot * 0.62));
              const x = 58 + index * slot + (slot - barWidth) / 2;
              const height = Math.max(4, (Number(item.revenue || 0) / Math.max(maxRevenue, 1)) * 160);
              const y = 196 - height;
              return (
                <g key={`${item.from_date}-${item.to_date}`}>
                  <rect x={x} y={y} width={barWidth} height={height} rx="2" fill="#1596a7">
                    <title>{`${item.label}: ${formatMoney(item.revenue)}`}</title>
                  </rect>
                  {(index % labelStep === 0 || index === chartSeries.length - 1) && (
                    <text x={x + barWidth / 2} y="222" textAnchor="middle" className="fill-slate-700 text-[11px] font-bold">
                      {item.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      ) : (
        <div className="mt-5 flex h-72 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 text-center">
          <div>
            <BarChart3 className="mx-auto text-slate-400" size={42} />
            <div className="mt-3 text-sm font-black text-slate-700" dir="rtl">
              لا توجد بيانات إيرادات يومية/شهرية للرسم في هذه الفترة.
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function AdvicePanel({
  title,
  icon: Icon,
  items,
  tone,
}: {
  title: string;
  icon: LucideIcon;
  items: string[];
  tone: 'green' | 'teal' | 'blue';
}) {
  const colors = {
    green: 'text-green-700 bg-green-50 border-green-200',
    teal: 'text-teal-700 bg-teal-50 border-teal-200',
    blue: 'text-blue-700 bg-blue-50 border-blue-200',
  }[tone];

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-4">
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border ${colors}`}>
          <Icon size={28} />
        </div>
        <h2 className="text-base font-black text-slate-900" dir="rtl">
          {title}
        </h2>
      </div>
      <div className="mt-4 space-y-2" dir="rtl">
        {items.map((item) => (
          <div key={item} className="flex gap-3 text-sm font-semibold leading-6 text-slate-800">
            <CheckSquare className="mt-0.5 shrink-0 text-green-600" size={16} />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Report() {
  const [searchParams, setSearchParams] = useSearchParams();
  const imageMode = searchParams.get('mode') === 'image';
  const [fromDate, setFromDate] = useState(searchParams.get('from_date') || monthStart());
  const [toDate, setToDate] = useState(searchParams.get('to_date') || today());
  const [branchId, setBranchId] = useState(searchParams.get('branch_id') || '');
  const [periodLabel, setPeriodLabel] = useState(searchParams.get('period_label') || '');
  const [status, setStatus] = useState<ReportStatus>('idle');
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = fromDate.trim().length > 0 && toDate.trim().length > 0 && status !== 'loading';

  const paymentItems = useMemo(() => {
    const metrics = report?.metrics;
    const palette = ['#0f4c81', '#1596a7', '#43a047', '#f5b117', '#8b7bd8', '#9ca3af'];
    if (report?.payment_methods?.length) {
      return report.payment_methods.slice(0, 6).map((item, index) => ({
        label: compactLegendLabel(item.method),
        value: item.amount,
        percent: item.percent,
        color: palette[index] || '#9ca3af',
      }));
    }
    return [
      { label: 'الكاش (Cash)', value: metrics?.cash || 0, percent: metrics?.cash_percent || 0, color: palette[0] },
      { label: 'البطاقة (Card)', value: metrics?.card || 0, percent: metrics?.card_percent || 0, color: palette[1] },
    ];
  }, [report]);

  const expenseItems = useMemo(() => {
    const palette = ['#0f4c81', '#1596a7', '#43a047', '#f5b117', '#8b7bd8', '#9ca3af'];
    const categories = report?.expense_categories || [];
    if (!categories.length) return [{ label: 'لا توجد مصروفات', value: 0, percent: 0, color: '#cbd5e1' }];
    return categories.slice(0, 6).map((item, index) => ({
      label: compactLegendLabel(item.category),
      value: item.amount,
      percent: item.percent,
      color: palette[index] || '#9ca3af',
    }));
  }, [report]);

  const runReport = async (next?: { from: string; to: string; label?: string }) => {
    const requestFrom = next?.from || fromDate;
    const requestTo = next?.to || toDate;
    const requestLabel = next?.label || periodLabel || `${requestFrom} إلى ${requestTo}`;
    if (!requestFrom || !requestTo || status === 'loading') return;

    setFromDate(requestFrom);
    setToDate(requestTo);
    setPeriodLabel(requestLabel);
    setStatus('loading');
    setError(null);

    try {
      const params = {
        from_date: requestFrom,
        from_time: '12:00 AM',
        to_date: requestTo,
        to_time: '11:59 PM',
        period_label: requestLabel,
        ...(branchId.trim() ? { branch_id: branchId.trim() } : {}),
      };
      const response = await axios.get<PerformanceReport>('/api/reports/performance', { params });
      setReport(response.data);
      setStatus('success');
      setSearchParams({
        from_date: requestFrom,
        to_date: requestTo,
        period_label: requestLabel,
        ...(branchId.trim() ? { branch_id: branchId.trim() } : {}),
        ...(imageMode ? { mode: 'image' } : {}),
      });
    } catch (requestError: any) {
      setError(requestError?.response?.data?.error || requestError?.message || 'Failed to build performance report.');
      setStatus('error');
    }
  };

  useEffect(() => {
    if (searchParams.get('from_date') && searchParams.get('to_date')) {
      void runReport({
        from: searchParams.get('from_date') || fromDate,
        to: searchParams.get('to_date') || toDate,
        label: searchParams.get('period_label') || periodLabel,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setPreset = (preset: 'today' | 'week' | 'month' | 'previous_month' | 'previous_year') => {
    if (preset === 'today') void runReport({ from: today(), to: today(), label: 'Daily Report' });
    if (preset === 'week') void runReport({ from: toDateInputValue(addDays(new Date(), -6)), to: today(), label: 'Weekly Report' });
    if (preset === 'month') void runReport({ from: monthStart(), to: today(), label: 'Monthly Report' });
    if (preset === 'previous_month') {
      const range = previousMonthRange();
      void runReport({ from: range.from, to: range.to, label: range.label });
    }
    if (preset === 'previous_year') {
      const range = previousYearRange();
      void runReport({ from: range.from, to: range.to, label: `Year ${range.label}` });
    }
  };

  const copyShareLink = async () => {
    if (!report?.share_url) return;
    await navigator.clipboard.writeText(report.share_url);
  };

  const metrics = report?.metrics;
  const branchName = report?.branch_name || 'AL FALAH';
  const periodText = report?.period_label || periodLabel || `${fromDate} إلى ${toDate}`;

  return (
    <div className={imageMode ? 'min-h-full bg-white p-3 text-slate-950' : 'min-h-full bg-slate-100 p-4 text-slate-950 sm:p-6'}>
      <div className="mx-auto max-w-[1480px] space-y-4">
        {!imageMode && (
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-black uppercase text-cyan-700">
                  <ReceiptText size={14} />
                  Performance Reports
                </div>
                <h1 className="mt-2 text-2xl font-black text-slate-950">Professional Laundry Report</h1>
                <p className="mt-1 text-sm font-semibold text-slate-600" dir="rtl">
                  يولد تقرير يومي أو أسبوعي أو شهري أو مخصص بنفس شكل الداشبورد، مع رابط تفاعلي قابل للإرسال.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[10rem_10rem_8rem_minmax(9rem,1fr)_auto]">
                <label className="space-y-1">
                  <span className="text-xs font-black uppercase text-slate-500">From</span>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(event) => setFromDate(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-black uppercase text-slate-500">To</span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(event) => setToDate(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-black uppercase text-slate-500">Branch</span>
                  <input
                    value={branchId}
                    onChange={(event) => setBranchId(event.target.value)}
                    placeholder="1"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-black uppercase text-slate-500">Label</span>
                  <input
                    value={periodLabel}
                    onChange={(event) => setPeriodLabel(event.target.value)}
                    placeholder="Monthly Report"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => void runReport()}
                  disabled={!canSubmit}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-2 text-sm font-black text-white transition-colors hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {status === 'loading' ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                  Generate
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => setPreset('today')} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50">
                Today
              </button>
              <button type="button" onClick={() => setPreset('week')} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50">
                Week
              </button>
              <button type="button" onClick={() => setPreset('month')} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50">
                Month
              </button>
              <button type="button" onClick={() => setPreset('previous_month')} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50">
                Previous Month
              </button>
              <button type="button" onClick={() => setPreset('previous_year')} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50">
                Previous Year
              </button>
              {report?.share_url && (
                <>
                  <button type="button" onClick={() => void copyShareLink()} className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-xs font-black text-blue-700">
                    <Share2 size={15} />
                    Copy Link
                  </button>
                  <a href={`${report.share_url}&mode=image`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-xs font-black text-green-700">
                    <Download size={15} />
                    Image View
                  </a>
                </>
              )}
            </div>
          </section>
        )}

        {status === 'error' && error && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 shrink-0 text-red-600" size={20} />
              <div>
                <div className="font-black text-red-900">Report Error</div>
                <div className="mt-1 text-sm font-semibold text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {status === 'loading' && (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
            <Loader2 className="mx-auto animate-spin text-cyan-700" size={38} />
            <div className="mt-3 font-black text-slate-900">Building performance report...</div>
          </div>
        )}

        {report && metrics && (
          <div id="performance-report-card" className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
            <header className="grid gap-5 border-b border-slate-300 pb-5 lg:grid-cols-[minmax(13rem,1fr)_minmax(0,2fr)_minmax(13rem,1fr)]">
              <div className="flex items-center gap-4">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-8 border-blue-900 text-cyan-700">
                  <ReceiptText size={46} />
                </div>
                <div className="min-w-0">
                  <div className="text-2xl font-black leading-7 text-slate-950">IN & OUT</div>
                  <div className="text-3xl font-black leading-8 text-cyan-700">LAUNDRY</div>
                  <div className="mt-1 text-lg font-black text-blue-950" dir="rtl">
                    مصبغة إن أند أوت
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h1 className="text-3xl font-black text-blue-950 sm:text-4xl">PERFORMANCE REPORT</h1>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-lg font-bold text-blue-950">
                  <span className="inline-flex items-center gap-2 text-cyan-700">
                    <CalendarDays size={20} />
                    {periodText}
                  </span>
                  <span>|</span>
                  <span>
                    {report.from_date} إلى {report.to_date}
                  </span>
                </div>
                <div className="mx-auto mt-4 inline-flex items-center gap-2 rounded-full bg-cyan-800 px-6 py-2 text-lg font-black text-white shadow-sm">
                  <Building2 size={20} />
                  {branchName} BRANCH
                </div>
              </div>

              <div className="text-left lg:text-right">
                <div className="inline-flex items-center gap-3 text-blue-950">
                  <Building2 size={44} />
                  <div>
                    <div className="text-sm font-black uppercase">Branch</div>
                    <div className="text-lg font-black text-cyan-700">{branchName}</div>
                  </div>
                </div>
                <div className="mt-5 space-y-2 text-sm font-semibold text-blue-950">
                  <div>Report Date: {report.report_date}</div>
                  <div>Prepared By: {report.prepared_by}</div>
                  <div>ID: {report.report_id}</div>
                </div>
              </div>
            </header>

            <main className="mt-5 space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                <KpiCard title="إجمالي الإيرادات" subtitle="TOTAL REVENUES" value={formatMoney(metrics.total_revenue)} meta="100% من إجمالي الإيرادات" icon={TrendingUp} tone="teal" />
                <KpiCard title="الكاش" subtitle="CASH" value={formatMoney(metrics.cash)} meta={`${formatPercent(metrics.cash_percent)} من إجمالي الإيرادات`} icon={Banknote} tone="teal" />
                <KpiCard title="البطاقة" subtitle="CARD" value={formatMoney(metrics.card)} meta={`${formatPercent(metrics.card_percent)} من إجمالي الإيرادات`} icon={CreditCard} tone="navy" />
                <KpiCard title="إجمالي المصروفات" subtitle="TOTAL EXPENSES" value={formatMoney(metrics.total_expenses)} meta={`${formatPercent(metrics.expense_percent)} من إجمالي الإيرادات`} icon={TrendingDown} tone="red" />
                <KpiCard title="صافي الإيراد بعد المصروفات" subtitle="NET PROFIT AFTER EXPENSES" value={formatMoney(metrics.net_profit)} meta={`${formatPercent(metrics.net_profit_percent)} من إجمالي الإيرادات`} icon={FileCheck2} tone="green" />
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.25fr_1.3fr]">
                <DonutChart
                  title="توزيع الإيرادات حسب طريقة الدفع"
                  subtitle="REVENUE BY PAYMENT METHOD"
                  centerTitle="TOTAL REVENUE"
                  centerValue={formatMoney(metrics.total_revenue)}
                  items={paymentItems}
                  sourceLabel={formatSourceLabel(report.data_sources?.payment_methods)}
                />
                <RevenueBars series={report.series} sourceLabel={formatSourceLabel(report.data_sources?.revenue_trend)} />
                <DonutChart
                  title="توزيع المصروفات حسب الفئة"
                  subtitle="EXPENSES BY CATEGORY"
                  centerTitle="TOTAL EXPENSES"
                  centerValue={formatMoney(metrics.total_expenses)}
                  items={expenseItems}
                  sourceLabel={formatSourceLabel(report.data_sources?.expense_categories)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <HighlightMetric title="صافي الإيراد بعد المصروفات" subtitle="NET PROFIT AFTER EXPENSES" value={formatMoney(metrics.net_profit)} icon={ReceiptText} tone="green" />
                <HighlightMetric title="صافي الكاش بعد مصروفات الكاش" subtitle="NET CASH AFTER CASH EXPENSES" value={formatMoney(metrics.net_cash)} icon={Banknote} tone={metrics.net_cash < 0 ? 'red' : 'green'} />
                <HighlightMetric title="عدد الطلبات" subtitle="TOTAL ORDERS" value={`${formatNumber(metrics.total_orders)} طلب`} icon={ShoppingCart} tone="blue" />
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <AdvicePanel title="ملخص الأداء" icon={BarChart3} items={report.advice.performance} tone="green" />
                <AdvicePanel title="ملاحظات" icon={ClipboardList} items={report.advice.notes} tone="teal" />
                <AdvicePanel title="أهداف مقترحة" icon={Target} items={report.advice.goals} tone="blue" />
              </div>
            </main>

            <footer className="mt-5 flex flex-col gap-3 rounded-lg bg-blue-950 px-5 py-4 text-sm font-bold text-white sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <ReceiptText size={18} />
                <span>IN & OUT LAUNDRY</span>
                <span className="hidden sm:inline">مصيغة إن أند أوت</span>
              </div>
              <div className="flex flex-wrap gap-5">
                <span className="inline-flex items-center gap-2">
                  <Phone size={16} /> 02 586 4164
                </span>
                <span className="inline-flex items-center gap-2">
                  <Phone size={16} /> 02 555 5929
                </span>
                <span className="inline-flex items-center gap-2">
                  <Mail size={16} /> info@inandoutlaundry.ae
                </span>
              </div>
              <div className="font-normal italic text-cyan-200">Thank you for your trust</div>
            </footer>
          </div>
        )}

        {status === 'idle' && !report && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <ReceiptText className="mx-auto text-slate-400" size={44} />
            <h2 className="mt-3 font-black text-slate-800">Ready to generate the professional report</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500" dir="rtl">
              اختر الفترة أو استخدم الاختصارات، وسيتم بناء التقرير من بيانات POS مباشرة.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
