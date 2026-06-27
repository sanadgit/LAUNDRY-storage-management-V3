import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  AlertCircle,
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Phone,
  ReceiptText,
  RefreshCw,
  Shirt,
  ShoppingBag,
  Star,
  TrendingUp,
  UserPlus,
  WalletCards,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

type ReportStatus = 'idle' | 'loading' | 'success' | 'error';

type DailyOperationsReport = {
  ok: boolean;
  report_id: string;
  report_title?: string;
  operations_type?: string;
  date: string;
  from_date?: string;
  to_date?: string;
  date_label: string;
  report_date: string;
  prepared_at: string;
  scope: string;
  branch_names: string[];
  share_url: string;
  image_url: string;
  share_token?: string;
  metrics: {
    total_revenue: number;
    total_orders: number;
    new_customers: number;
    avg_order_value: number;
    items_processed: number;
    total_expenses: number;
    opening_balance: number;
    todays_revenue: number;
    total_cash_in: number;
    total_cash_out: number;
    closing_balance: number;
    deltas: {
      revenue: number;
      orders: number;
      new_customers: number;
      avg_order_value: number;
      items_processed: number;
    };
  };
  trend: Array<{ label: string; date: string; revenue: number; orders: number }>;
  branches: Array<{
    branch_id: string;
    branch: string;
    revenue: number;
    orders: number;
    items: number;
    new_customers: number;
    error?: string;
  }>;
  expenses: Array<{ category: string; amount: number; percent: number }>;
  top_services: Array<{ rank: number; service: string; qty: number; revenue: number; percent: number }>;
  highlights: string[];
  alerts: string[];
  tasks: string[];
  data_sources?: Record<string, string>;
};

const toDateInputValue = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
};

const today = () => toDateInputValue(new Date());

const formatMoney = (value: number | null | undefined, suffix = true) => {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return suffix ? '0.00 AED' : '0.00';
  const formatted = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return suffix ? `${formatted} AED` : formatted;
};

const formatNumber = (value: number | null | undefined) => Number(value ?? 0).toLocaleString('en-US');

const formatDelta = (value: number | null | undefined) => {
  const delta = Number(value ?? 0);
  const sign = delta >= 0 ? '+' : '-';
  return `${sign}${Math.abs(delta).toFixed(2)}%`;
};

const compactLabel = (value: string, max = 34) => {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 3).trim()}...` : text;
};

function LogoBlock() {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-8 border-blue-950 text-cyan-700">
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
  );
}

function KpiTile({
  title,
  value,
  delta,
  icon: Icon,
  tone = 'teal',
}: {
  title: string;
  value: string;
  delta: number;
  icon: LucideIcon;
  tone?: 'teal' | 'navy';
}) {
  const positive = Number(delta || 0) >= 0;
  const iconClass = tone === 'navy' ? 'bg-blue-950' : 'bg-cyan-700';

  return (
    <article className="min-h-28 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-lg text-white ${iconClass}`}>
          <Icon size={30} strokeWidth={2.4} />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-black uppercase text-slate-900">{title}</div>
          <div className="mt-2 break-words text-2xl font-black text-cyan-700">{value}</div>
          <div className="mt-2 flex items-center gap-2 text-xs font-bold text-slate-800">
            <span>vs Yesterday</span>
            <span className={positive ? 'text-green-600' : 'text-red-600'}>{positive ? '↑' : '↓'} {formatDelta(delta)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function LineAreaChart({ data }: { data: DailyOperationsReport['trend'] }) {
  const max = Math.max(1, ...data.map((item) => item.revenue));
  const width = 520;
  const height = 220;
  const left = 48;
  const top = 24;
  const chartWidth = 440;
  const chartHeight = 150;
  const points = data.map((item, index) => {
    const x = left + (index / Math.max(1, data.length - 1)) * chartWidth;
    const y = top + chartHeight - (item.revenue / max) * chartHeight;
    return { ...item, x, y };
  });
  const line = points.map((point) => `${point.x},${point.y}`).join(' ');
  const area = `${left},${top + chartHeight} ${line} ${left + chartWidth},${top + chartHeight}`;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-black uppercase text-slate-900">Revenue Overview (AED)</h2>
      <svg className="mt-4 h-64 w-full overflow-visible" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Revenue overview">
        {[0, 1, 2, 3].map((lineIndex) => {
          const y = top + lineIndex * (chartHeight / 3);
          const value = max * (1 - lineIndex / 3);
          return (
            <g key={lineIndex}>
              <line x1={left} x2={left + chartWidth} y1={y} y2={y} stroke="#e2e8f0" />
              <text x={left - 10} y={y + 4} textAnchor="end" className="fill-slate-700 text-[11px] font-bold">
                {Math.round(value / 1000)}K
              </text>
            </g>
          );
        })}
        <polygon points={area} fill="#1596a7" opacity="0.14" />
        <polyline points={line} fill="none" stroke="#0f6d80" strokeWidth="3" />
        {points.map((point) => (
          <g key={point.date}>
            <circle cx={point.x} cy={point.y} r="4" fill="#0f6d80" />
            <text x={point.x} y={point.y - 12} textAnchor="middle" className="fill-slate-900 text-[11px] font-black">
              {Math.round(point.revenue).toLocaleString('en-US')}
            </text>
            <text x={point.x} y={top + chartHeight + 24} textAnchor="middle" className="fill-slate-800 text-[11px] font-bold">
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    </section>
  );
}

function OrdersChart({ data }: { data: DailyOperationsReport['trend'] }) {
  const max = Math.max(1, ...data.map((item) => item.orders));
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-black uppercase text-slate-900">Orders Overview</h2>
      <div className="mt-5 grid h-60 grid-cols-[2.8rem_1fr] gap-3">
        <div className="flex flex-col justify-between text-right text-xs font-bold text-slate-600">
          <span>{Math.ceil(max / 100) * 100}</span>
          <span>{Math.ceil(max / 200) * 100}</span>
          <span>0</span>
        </div>
        <div className="flex items-end gap-4 border-b border-l border-slate-200 px-3">
          {data.map((item) => (
            <div key={item.date} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <div className="text-xs font-black text-slate-900">{formatNumber(item.orders)}</div>
              <div className="w-full rounded-t bg-cyan-700" style={{ height: `${Math.max(4, (item.orders / max) * 170)}px` }} />
              <div className="text-[11px] font-bold text-slate-800">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DonutSummary({ expenses, total }: { expenses: DailyOperationsReport['expenses']; total: number }) {
  let cursor = 0;
  const colors = ['#073b6d', '#2e86de', '#74b9db', '#69b843', '#f6a914', '#f8c04e'];
  const segments = expenses.map((item, index) => {
    const start = cursor;
    cursor += Math.max(0, Math.min(100, item.percent));
    return `${colors[index % colors.length]} ${start}% ${cursor}%`;
  });

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-black uppercase text-slate-900">Expenses Summary (AED)</h2>
      <div className="mt-5 grid items-center gap-5 lg:grid-cols-[13rem_1fr]">
        <div
          className="relative mx-auto h-52 w-52 rounded-full"
          style={{ background: segments.length ? `conic-gradient(${segments.join(', ')})` : 'conic-gradient(#cbd5e1 0 100%)' }}
        >
          <div className="absolute inset-14 flex flex-col items-center justify-center rounded-full bg-white text-center shadow-inner">
            <div className="text-xs font-bold text-slate-700">TOTAL</div>
            <div className="mt-1 text-lg font-black text-slate-950">{formatMoney(total, false)}</div>
            <div className="text-xs font-black">AED</div>
          </div>
        </div>
        <div className="space-y-3">
          {expenses.map((item, index) => (
            <div key={item.category} className="grid grid-cols-[0.8rem_1fr_auto_auto] items-center gap-3 text-sm">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
              <span className="font-semibold text-slate-900">{compactLabel(item.category, 20)}</span>
              <span className="font-bold text-slate-900">{formatMoney(item.amount, false)}</span>
              <span className="w-12 text-right font-bold text-slate-700">{item.percent.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BranchTable({ rows }: { rows: DailyOperationsReport['branches'] }) {
  const totals = rows.reduce(
    (acc, row) => ({
      revenue: acc.revenue + row.revenue,
      orders: acc.orders + row.orders,
      items: acc.items + row.items,
      new_customers: acc.new_customers + row.new_customers,
    }),
    { revenue: 0, orders: 0, items: 0, new_customers: 0 }
  );

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-black uppercase text-slate-900">Branch Performance</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[34rem] border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="bg-blue-950 text-white">
              {['Branch', 'Revenue (AED)', 'Orders', 'Items', 'New Customers'].map((header) => (
                <th key={header} className="border-r border-white/20 px-3 py-2 text-center text-xs font-black">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.branch_id} className="border-b border-slate-200">
                <td className="border-b border-r border-slate-200 px-3 py-3 font-semibold">
                  <span className="mr-2 inline-block h-3 w-3 rounded-full bg-cyan-600" />
                  {row.branch}
                </td>
                <td className="border-b border-r border-slate-200 px-3 py-3 text-center font-bold">{formatMoney(row.revenue, false)}</td>
                <td className="border-b border-r border-slate-200 px-3 py-3 text-center font-bold">{formatNumber(row.orders)}</td>
                <td className="border-b border-r border-slate-200 px-3 py-3 text-center font-bold">{formatNumber(row.items)}</td>
                <td className="border-b border-slate-200 px-3 py-3 text-center font-bold">{formatNumber(row.new_customers)}</td>
              </tr>
            ))}
            <tr className="bg-blue-950 text-white">
              <td className="px-3 py-3 text-center font-black">TOTAL</td>
              <td className="px-3 py-3 text-center font-black">{formatMoney(totals.revenue, false)}</td>
              <td className="px-3 py-3 text-center font-black">{formatNumber(totals.orders)}</td>
              <td className="px-3 py-3 text-center font-black">{formatNumber(totals.items)}</td>
              <td className="px-3 py-3 text-center font-black">{formatNumber(totals.new_customers)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TopServices({ rows }: { rows: DailyOperationsReport['top_services'] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-black uppercase text-slate-900">Top Services (By Revenue)</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-sm">
          <thead className="text-xs font-black text-slate-900">
            <tr>
              <th className="w-10 py-2 text-left">#</th>
              <th className="py-2 text-left">Service</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Revenue (AED)</th>
              <th className="py-2 text-right">%</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.length ? (
              rows.map((row) => (
                <tr key={`${row.rank}-${row.service}`}>
                  <td className="py-2 font-bold">{row.rank}</td>
                  <td className="py-2 font-semibold">{compactLabel(row.service, 30)}</td>
                  <td className="py-2 text-right font-bold">{formatNumber(row.qty)}</td>
                  <td className="py-2 text-right font-bold">{formatMoney(row.revenue, false)}</td>
                  <td className="py-2 text-right font-bold">{row.percent.toFixed(1)}%</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm font-semibold text-slate-500">
                  POS did not return service details for this day.
                </td>
              </tr>
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot className="bg-blue-950 text-white">
              <tr>
                <td className="py-2 text-center font-black" colSpan={2}>
                  TOTAL
                </td>
                <td className="py-2 text-right font-black">{formatNumber(rows.reduce((sum, row) => sum + row.qty, 0))}</td>
                <td className="py-2 text-right font-black">{formatMoney(rows.reduce((sum, row) => sum + row.revenue, 0), false)}</td>
                <td className="py-2 text-right font-black">100%</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </section>
  );
}

function CashSummary({ report }: { report: DailyOperationsReport }) {
  const metrics = report.metrics;
  return (
    <section className="overflow-hidden rounded-lg border border-cyan-100 bg-cyan-50 shadow-sm">
      <div className="p-5">
        <h2 className="text-base font-black uppercase text-cyan-800">Cash Summary (AED)</h2>
        <div className="mt-4 space-y-3 text-sm">
          {[
            ['Opening Balance', metrics.opening_balance],
            ["Today's Revenue", metrics.todays_revenue],
            ['Total Cash In', metrics.total_cash_in],
            ['Total Cash Out (Expenses)', metrics.total_cash_out],
          ].map(([label, value]) => (
            <div key={String(label)} className="flex items-center justify-between gap-4 border-b border-cyan-200 pb-2 last:border-b-0">
              <span className="font-semibold text-slate-900">{label}</span>
              <span className="font-black text-slate-950">{formatMoney(Number(value), false)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between bg-cyan-700 px-5 py-4 text-white">
        <div className="flex items-center gap-3 text-sm font-black uppercase">
          <WalletCards size={24} />
          Closing Balance
        </div>
        <div className="text-lg font-black">{formatMoney(metrics.closing_balance, false)}</div>
      </div>
    </section>
  );
}

function NotesPanel({ title, icon: Icon, items, tone }: { title: string; icon: LucideIcon; items: string[]; tone: 'star' | 'alert' | 'task' }) {
  const iconClass = tone === 'star' ? 'bg-blue-950' : tone === 'alert' ? 'bg-blue-950' : 'bg-blue-950';
  const markerClass = tone === 'alert' ? 'text-amber-500' : tone === 'task' ? 'text-sky-600' : 'text-green-600';
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg text-white ${iconClass}`}>
          <Icon size={24} />
        </div>
        <h2 className="text-base font-black uppercase text-slate-950">{title}</h2>
      </div>
      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <div key={item} className="flex gap-3 text-sm font-semibold leading-6 text-slate-900">
            <CheckCircle2 className={`mt-1 shrink-0 ${markerClass}`} size={15} />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function OperationsReport() {
  const [searchParams, setSearchParams] = useSearchParams();
  const imageMode = searchParams.get('mode') === 'image';
  const snapshotReportId = searchParams.get('report_id') || '';
  const snapshotToken = searchParams.get('token') || '';
  const [reportDate, setReportDate] = useState(searchParams.get('date') || today());
  const [status, setStatus] = useState<ReportStatus>('idle');
  const [report, setReport] = useState<DailyOperationsReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const branchList = useMemo(() => report?.branch_names.join('  •  ') || 'Al Falah  •  MBZ  •  Musaffah', [report]);

  const runReport = async (date = reportDate) => {
    if (!date || status === 'loading') return;
    setStatus('loading');
    setError(null);
    try {
      const response = await axios.get<DailyOperationsReport>('/api/reports/daily-operations', { params: { date } });
      setReport(response.data);
      setReportDate(date);
      setStatus('success');
      setSearchParams({ date, ...(imageMode ? { mode: 'image' } : {}) });
    } catch (requestError: any) {
      setError(requestError?.response?.data?.error || requestError?.message || 'Failed to build daily operations report.');
      setStatus('error');
    }
  };

  const loadSnapshot = async (reportId: string, token: string) => {
    if (!reportId || status === 'loading') return;
    setStatus('loading');
    setError(null);
    try {
      const response = await axios.get<DailyOperationsReport>(`/api/reports/snapshot/${encodeURIComponent(reportId)}`, {
        params: token ? { token } : {},
      });
      setReport(response.data);
      setReportDate(response.data.date || response.data.to_date || reportDate);
      setStatus('success');
    } catch (requestError: any) {
      setError(requestError?.response?.data?.error || requestError?.message || 'Failed to open saved report.');
      setStatus('error');
    }
  };

  useEffect(() => {
    if (snapshotReportId) {
      void loadSnapshot(snapshotReportId, snapshotToken);
      return;
    }
    if (searchParams.get('date')) void runReport(searchParams.get('date') || reportDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const metrics = report?.metrics;

  return (
    <div className={imageMode ? 'min-h-full bg-white p-4 text-slate-950' : 'min-h-full bg-slate-100 p-4 text-slate-950 sm:p-6'}>
      <div className="mx-auto max-w-[1500px] space-y-4">
        {!imageMode && (
          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-2xl font-black text-slate-950">Daily / Weekly / Monthly Operations Report</h1>
                <p className="mt-1 text-sm font-semibold text-slate-600" dir="rtl">
                  تقرير يومي مجمع لكل الأفرع بنفس شكل الصورة المرجعية.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="space-y-1">
                  <span className="text-xs font-black uppercase text-slate-500">Report Date</span>
                  <input
                    type="date"
                    value={reportDate}
                    onChange={(event) => setReportDate(event.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => void runReport()}
                  disabled={status === 'loading'}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-cyan-700 px-4 py-2 text-sm font-black text-white hover:bg-cyan-800 disabled:opacity-50"
                >
                  {status === 'loading' ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
                  Generate
                </button>
              </div>
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
          <div className="rounded-lg border border-slate-200 bg-white p-10 text-center shadow-sm">
            <Loader2 className="mx-auto animate-spin text-cyan-700" size={38} />
            <div className="mt-3 font-black text-slate-900">Building all branches report...</div>
          </div>
        )}

        {report && metrics && (
          <div className="rounded-lg border border-slate-300 bg-white shadow-sm">
            <header className="grid gap-5 border-b border-slate-300 p-6 lg:grid-cols-[minmax(16rem,1fr)_minmax(0,2fr)_minmax(16rem,1fr)]">
              <LogoBlock />
              <div className="text-center">
                <h1 className="text-4xl font-black text-blue-950">{report.report_title || 'DAILY OPERATIONS REPORT'}</h1>
                <div className="mt-4 inline-flex items-center gap-3 text-xl font-black text-cyan-700">
                  <CalendarDays className="text-blue-950" size={25} />
                  {report.date_label}
                </div>
              </div>
              <div className="text-left lg:text-right">
                <div className="inline-flex items-center gap-3 text-blue-950">
                  <Building2 size={42} />
                  <div>
                    <div className="text-lg font-black">{report.scope}</div>
                    <div className="text-sm font-bold text-slate-700">{branchList}</div>
                  </div>
                </div>
                <div className="mt-5 space-y-2 text-sm font-semibold text-slate-900">
                  <div>Report Date: {report.report_date}</div>
                  <div>Prepared At: {report.prepared_at}</div>
                </div>
              </div>
            </header>

            <main className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                <KpiTile title="Total Revenue" value={formatMoney(metrics.total_revenue)} delta={metrics.deltas.revenue} icon={WalletCards} tone="navy" />
                <KpiTile title="Total Orders" value={formatNumber(metrics.total_orders)} delta={metrics.deltas.orders} icon={ShoppingBag} />
                <KpiTile title="New Customers" value={formatNumber(metrics.new_customers)} delta={metrics.deltas.new_customers} icon={UserPlus} tone="navy" />
                <KpiTile title="Avg Order Value" value={formatMoney(metrics.avg_order_value)} delta={metrics.deltas.avg_order_value} icon={TrendingUp} />
                <KpiTile title="Items Processed" value={formatNumber(metrics.items_processed)} delta={metrics.deltas.items_processed} icon={Shirt} tone="navy" />
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_1fr_1.05fr]">
                <div className="space-y-5">
                  <LineAreaChart data={report.trend} />
                  <OrdersChart data={report.trend} />
                </div>
                <div className="space-y-5">
                  <BranchTable rows={report.branches} />
                  <TopServices rows={report.top_services} />
                </div>
                <div className="space-y-5">
                  <DonutSummary expenses={report.expenses} total={metrics.total_expenses} />
                  <CashSummary report={report} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                <NotesPanel title="Highlights" icon={Star} items={report.highlights} tone="star" />
                <NotesPanel title="Alerts / Notes" icon={Bell} items={report.alerts.length ? report.alerts : ['No critical alerts for this report.']} tone="alert" />
                <NotesPanel title="Today's Tasks" icon={ClipboardList} items={report.tasks} tone="task" />
              </div>
            </main>

            <footer className="flex flex-col gap-3 bg-blue-950 px-6 py-4 text-sm font-bold text-white sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span>IN & OUT LAUNDRY</span>
                <span className="hidden sm:inline">مصيغة إن أند أوت</span>
              </div>
              <div className="flex flex-wrap gap-6">
                <span className="inline-flex items-center gap-2">
                  <Phone size={16} /> 02 586 4164
                </span>
                <span className="inline-flex items-center gap-2">
                  <Phone size={16} /> 02 555 5929
                </span>
                <span>inandoutuae</span>
              </div>
              <div className="font-normal italic text-cyan-200">Thank you for your trust</div>
            </footer>
          </div>
        )}

        {status === 'idle' && !report && (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <BarChart3 className="mx-auto text-slate-400" size={46} />
            <h2 className="mt-3 font-black text-slate-800">Ready to build all branches daily report</h2>
          </div>
        )}
      </div>
    </div>
  );
}
