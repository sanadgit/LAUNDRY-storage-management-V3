import { useMemo, useState } from 'react';
import axios from 'axios';
import {
  AlertCircle,
  Banknote,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  FileText,
  Loader2,
  ReceiptText,
  Send,
} from 'lucide-react';

type ReportStatus = 'idle' | 'loading' | 'success' | 'error';

type CounterCashSummary = {
  company: string;
  report_name: string;
  date_range: string;
  printed_at: string;
  branch: string;
  cash_receipt: number;
  card_receipt: number;
  grand_total_receipt: number;
  total_income: number;
  cash_in_hand: number;
  received_total: number;
  expense_total: number;
  balance: number;
  cash_received_total: number;
  cash_expense_total: number;
  cash_balance: number;
  credit_card_received_total: number;
  credit_card_expense_total: number;
  credit_card_balance: number;
  total_invoice: number;
  expense_sections: Array<{
    key: string;
    title: string;
    received_total: number;
    expense_total: number;
    balance: number;
    rows: Array<{
      no: number;
      description: string;
      amount: number;
    }>;
  }>;
  expenses: Array<{
    no: number;
    description: string;
    amount: number;
    account?: string;
    account_title?: string;
  }>;
  customers: Array<{
    customer: string;
    invoice_count: number;
    amount: number;
  }>;
};

type CounterCashReportResponse = {
  ok: boolean;
  endpoint: string;
  request: Record<string, string>;
  summary: CounterCashSummary;
  html: string;
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

const formatMoney = (value: number | null | undefined) => {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return 'AED 0.00';
  return `AED ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

function MetricCard({
  label,
  value,
  icon: Icon,
  tone = 'slate',
}: {
  label: string;
  value: string;
  icon: typeof Banknote;
  tone?: 'slate' | 'emerald' | 'blue' | 'amber' | 'rose';
}) {
  const toneClass = {
    slate: 'border-slate-200 bg-white text-slate-900',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    blue: 'border-blue-200 bg-blue-50 text-blue-900',
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
    rose: 'border-rose-200 bg-rose-50 text-rose-900',
  }[tone];

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${toneClass}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-black uppercase tracking-widest opacity-60">{label}</div>
          <div className="mt-2 text-2xl font-black tracking-tight">{value}</div>
        </div>
        <div className="rounded-2xl border border-current/10 bg-white/60 p-3">
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

export default function Report() {
  const [fromDate, setFromDate] = useState(monthStart);
  const [toDate, setToDate] = useState(today);
  const [status, setStatus] = useState<ReportStatus>('idle');
  const [report, setReport] = useState<CounterCashReportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const summary = report?.summary ?? null;
  const canSubmit = fromDate.trim().length > 0 && toDate.trim().length > 0 && status !== 'loading';

  const n8nPayloadPreview = useMemo(() => {
    if (!report) return null;
    return {
      source: 'pos_counter_cash_report',
      endpoint: report.endpoint,
      request: report.request,
      summary: report.summary,
    };
  }, [report]);

  const runReport = async () => {
    if (!canSubmit) return;
    setStatus('loading');
    setError(null);
    setReport(null);

    try {
      const response = await axios.post<CounterCashReportResponse>('/api/pos/report/counter-cash', {
        from_date: fromDate,
        from_time: '12:00 AM',
        to_date: toDate,
        to_time: '11:59 PM',
      });
      setReport(response.data);
      setStatus('success');
    } catch (requestError: any) {
      setError(requestError?.response?.data?.error || requestError?.message || 'Failed to fetch POS report.');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-blue-700">
                <ReceiptText size={14} />
                POS Report Test
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Counter Cash Report</h1>
                <p className="mt-1 max-w-3xl text-sm font-semibold text-slate-600">
                  اختبار استخراج تقرير الإيرادات والمصروفات من POS قبل تحويله إلى n8n workflow أو AI agent.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[10rem_10rem_auto]">
              <label className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">From</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(event) => setFromDate(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">To</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(event) => setToDate(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </label>
              <button
                type="button"
                onClick={() => void runReport()}
                disabled={!canSubmit}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === 'loading' ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                Test Report
              </button>
            </div>
          </div>
        </section>

        {status === 'error' && error && (
          <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 shrink-0 text-rose-600" size={20} />
              <div>
                <div className="font-black text-rose-900">POS Report Error</div>
                <div className="mt-1 text-sm font-semibold text-rose-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {status === 'success' && summary && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={22} />
                <div className="min-w-0">
                  <div className="font-black text-emerald-900">POS report fetched successfully</div>
                  <div className="mt-1 text-sm font-semibold text-emerald-700 break-words">
                    {summary.branch || 'Branch not detected'} | {summary.date_range || `${fromDate} - ${toDate}`}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Total Income" value={formatMoney(summary.total_income)} icon={Banknote} tone="emerald" />
              <MetricCard label="Cash Receipt" value={formatMoney(summary.cash_receipt)} icon={Banknote} tone="blue" />
              <MetricCard label="Card Receipt" value={formatMoney(summary.card_receipt)} icon={CreditCard} tone="slate" />
              <MetricCard
                label="Cash Expenses"
                value={formatMoney(summary.cash_expense_total)}
                icon={ReceiptText}
                tone={summary.cash_expense_total > 0 ? 'rose' : 'slate'}
              />
              <MetricCard
                label="Card Expenses"
                value={formatMoney(summary.credit_card_expense_total)}
                icon={CreditCard}
                tone={summary.credit_card_expense_total > 0 ? 'rose' : 'slate'}
              />
              <MetricCard
                label="All Expenses"
                value={formatMoney(summary.expense_total)}
                icon={ReceiptText}
                tone={summary.expense_total > 0 ? 'rose' : 'slate'}
              />
              <MetricCard label="Balance" value={formatMoney(summary.balance)} icon={Banknote} tone="amber" />
              <MetricCard label="Cash In Hand" value={formatMoney(summary.cash_in_hand)} icon={Banknote} tone="slate" />
              <MetricCard label="Grand Receipt" value={formatMoney(summary.grand_total_receipt)} icon={FileText} tone="slate" />
              <MetricCard label="Total Invoice" value={String(summary.total_invoice || 0)} icon={CalendarDays} tone="slate" />
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(24rem,0.8fr)]">
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-200 px-4 py-3">
                  <h2 className="font-black text-slate-900">Expense Details</h2>
                  <p className="text-xs font-semibold text-slate-500">
                    {summary.expenses.length} rows across {summary.expense_sections.length || 1} POS account section(s)
                  </p>
                </div>
                <div className="max-h-[28rem] overflow-auto divide-y divide-slate-200">
                  {(summary.expense_sections.length > 0
                    ? summary.expense_sections
                    : [
                        {
                          key: 'expenses',
                          title: 'Expense Details',
                          received_total: summary.received_total,
                          expense_total: summary.expense_total,
                          balance: summary.balance,
                          rows: summary.expenses,
                        },
                      ]
                  ).map((section) => (
                    <div key={section.key || section.title} className="min-w-full">
                      <div className="bg-slate-50 px-4 py-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <h3 className="font-black text-slate-900">{section.title}</h3>
                          <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-wider">
                            <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-blue-700">
                              Received {formatMoney(section.received_total)}
                            </span>
                            <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-rose-700">
                              Expenses {formatMoney(section.expense_total)}
                            </span>
                            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-amber-700">
                              Balance {formatMoney(section.balance)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <table className="w-full text-sm">
                        <thead className="bg-white text-slate-500">
                          <tr>
                            <th className="w-16 px-4 py-3 text-left font-black">#</th>
                            <th className="px-4 py-3 text-left font-black">Description</th>
                            <th className="w-32 px-4 py-3 text-right font-black">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {section.rows.length > 0 ? (
                            section.rows.map((expense) => (
                              <tr key={`${section.key}-${expense.no}-${expense.description}`} className="hover:bg-slate-50">
                                <td className="px-4 py-3 font-bold text-slate-500">{expense.no}</td>
                                <td className="px-4 py-3 font-semibold text-slate-800">{expense.description}</td>
                                <td className="px-4 py-3 text-right font-black text-slate-900">{formatMoney(expense.amount)}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="px-4 py-8 text-center text-sm font-semibold text-slate-500">
                                No expense rows detected.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-200 px-4 py-3">
                  <h2 className="font-black text-slate-900">n8n Payload Preview</h2>
                  <p className="text-xs font-semibold text-slate-500">This is the shape we can send to workflows.</p>
                </div>
                <pre className="max-h-[28rem] overflow-auto p-4 text-xs font-semibold leading-relaxed text-slate-700">
                  {JSON.stringify(n8nPayloadPreview, null, 2)}
                </pre>
              </section>
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 px-4 py-3">
                <h2 className="font-black text-slate-900">POS HTML Preview</h2>
                <p className="text-xs font-semibold text-slate-500">
                  The original report fragment returned by `{report?.endpoint || 'POS'}`.
                </p>
              </div>
              <iframe
                title="POS Counter Cash Report Preview"
                srcDoc={report?.html || ''}
                sandbox=""
                className="h-[42rem] w-full bg-white"
              />
            </section>
          </div>
        )}

        {status === 'idle' && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <ReceiptText className="mx-auto text-slate-400" size={44} />
            <h2 className="mt-3 font-black text-slate-800">Ready to test POS report extraction</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              اختر الفترة واضغط Test Report. لو رجعت البيانات، بعدها نبني n8n workflow على نفس الـ endpoint.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
