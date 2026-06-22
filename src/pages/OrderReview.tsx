import axios from 'axios';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Loader2,
  Play,
  RotateCcw,
  Search,
  SkipForward,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type ReviewOrder = {
  store_name: string;
  order_no: string;
  customer_name: string;
  customer_phone: string;
  order_status: string;
  balance: number;
  remark: string;
  error_message?: string;
};

type DuplicateGroup = {
  phone: string;
  customer_name: string;
  orders: ReviewOrder[];
};

type ReviewResponse = {
  batch_id: number;
  status?: 'completed';
  checked_orders: number;
  stores_reviewed: number;
  failed_orders: number;
  duplicate_groups: DuplicateGroup[];
  warnings: ReviewOrder[];
};

type ReviewStartResponse = {
  batch_id: number;
  status: 'processing';
};

const parseOrderNumbers = (value: string) =>
  Array.from(
    new Set(
      (value.match(/[A-Za-z]?\d{3,10}/g) ?? [])
        .map((order) => order.trim().toUpperCase().replace(/[^A-Z0-9]/g, ''))
        .filter(Boolean)
    )
  );

const formatMoney = (value: number) => `AED ${Number(value || 0).toFixed(2)}`;

const statusClass = (status: string) => {
  const normalized = status.trim().toLowerCase();
  if (normalized.includes('deliver')) return 'text-slate-500 bg-slate-100 border-slate-200';
  if (normalized.includes('pending') || normalized.includes('unpaid')) {
    return 'text-amber-700 bg-amber-50 border-amber-200';
  }
  if (normalized.includes('pack')) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  return 'text-blue-700 bg-blue-50 border-blue-200';
};

export default function OrderReviewPage() {
  const [stores, setStores] = useState<string[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [reviewedStores, setReviewedStores] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingStores, setLoadingStores] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReviewResponse | null>(null);
  const [filter, setFilter] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    setLoadingStores(true);
    axios
      .get<{ stores: string[] }>('/api/order-review/stores')
      .then((response) => {
        if (cancelled) return;
        const loadedStores = Array.from(
          new Set((response.data.stores ?? []).map((store) => String(store).trim()).filter(Boolean))
        );
        setStores(loadedStores);
        setDrafts(Object.fromEntries(loadedStores.map((store) => [store, ''])));
      })
      .catch((requestError: any) => {
        if (!cancelled) {
          setError(requestError?.response?.data?.error || requestError?.message || 'Failed to load stores.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingStores(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const currentStore = stores[currentIndex] ?? '';
  const currentDraft = drafts[currentStore] ?? '';
  const currentOrders = useMemo(() => parseOrderNumbers(currentDraft), [currentDraft]);
  const ordersByStore = useMemo(
    () => Object.fromEntries(stores.map((store) => [store, parseOrderNumbers(drafts[store] ?? '')])),
    [drafts, stores]
  );
  const totalOrders = useMemo(
    () => stores.reduce((sum, store) => sum + ordersByStore[store].length, 0),
    [ordersByStore, stores]
  );
  const allStoresReviewed = stores.length > 0 && reviewedStores.size === stores.length;

  const filteredGroups = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return result?.duplicate_groups ?? [];
    return (result?.duplicate_groups ?? []).filter((group) =>
      [group.phone, group.customer_name, ...group.orders.flatMap((order) => [order.order_no, order.store_name])]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [filter, result]);

  useEffect(() => {
    if (!result) return;
    setExpandedGroups(new Set(result.duplicate_groups.map((group) => group.phone)));
  }, [result]);

  const markCurrentReviewed = (skip = false) => {
    if (!currentStore) return;
    setError(null);
    if (skip) {
      setDrafts((previous) => ({ ...previous, [currentStore]: '' }));
    } else if (currentOrders.length === 0) {
      setError('Enter at least one order, or use Skip Store.');
      return;
    }
    setReviewedStores((previous) => new Set(previous).add(currentStore));
    if (currentIndex < stores.length - 1) setCurrentIndex((index) => index + 1);
  };

  const runReview = async () => {
    if (totalOrders === 0) {
      setError('Add at least one order before processing.');
      return;
    }
    if (!allStoresReviewed) {
      setError('Review or skip every store before processing.');
      return;
    }

    setProcessing(true);
    setError(null);
    setResult(null);
    try {
      const response = await axios.post<ReviewStartResponse>('/api/order-review/process', {
        stores: stores.map((store) => ({
          store_name: store,
          orders: ordersByStore[store],
          skipped: ordersByStore[store].length === 0,
        })),
      });
      const batchId = response.data.batch_id;
      let completed: ReviewResponse | null = null;
      for (let attempt = 0; attempt < 400; attempt += 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 1500));
        const batchResponse = await axios.get<ReviewResponse | ReviewStartResponse>(
          `/api/order-review/batches/${batchId}`
        );
        if (batchResponse.data.status === 'completed') {
          completed = batchResponse.data as ReviewResponse;
          break;
        }
      }
      if (!completed) throw new Error('Processing is taking longer than expected. Please try again shortly.');
      setResult(completed);
    } catch (requestError: any) {
      setError(requestError?.response?.data?.error || requestError?.message || 'Order review failed.');
    } finally {
      setProcessing(false);
    }
  };

  const resetReview = () => {
    setDrafts(Object.fromEntries(stores.map((store) => [store, ''])));
    setReviewedStores(new Set());
    setCurrentIndex(0);
    setResult(null);
    setFilter('');
    setError(null);
  };

  const toggleGroup = (phone: string) => {
    setExpandedGroups((previous) => {
      const next = new Set(previous);
      if (next.has(phone)) next.delete(phone);
      else next.add(phone);
      return next;
    });
  };

  if (loadingStores) {
    return (
      <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600 font-bold">
          <Loader2 className="animate-spin text-emerald-600" size={22} /> Loading stores...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 text-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px] space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Order Review &amp; Verification</h1>
            <p className="mt-1 text-sm sm:text-base text-slate-500 font-medium">
              Review orders store by store, then identify customers with multiple orders.
            </p>
          </div>
          <button
            type="button"
            onClick={resetReview}
            disabled={processing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            <RotateCcw size={17} /> New Review
          </button>
        </header>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
            <AlertTriangle size={19} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-black uppercase tracking-[0.16em] text-slate-700">Store Progress</h2>
            <span className="text-sm font-bold text-slate-500">
              {reviewedStores.size}/{stores.length} reviewed
            </span>
          </div>
          <div className="mt-5 overflow-x-auto pb-2">
            <div className="flex min-w-max items-start">
              {stores.map((store, index) => {
                const complete = reviewedStores.has(store);
                const active = index === currentIndex;
                return (
                  <div key={store} className="flex items-start">
                    <button
                      type="button"
                      onClick={() => setCurrentIndex(index)}
                      className="group flex w-24 flex-col items-center gap-2 text-center sm:w-28"
                    >
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-black transition-colors ${
                          complete
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : active
                              ? 'border-emerald-600 bg-white text-emerald-700'
                              : 'border-slate-300 bg-white text-slate-500 group-hover:border-slate-400'
                        }`}
                      >
                        {complete ? <Check size={17} strokeWidth={3} /> : index + 1}
                      </span>
                      <span className={`max-w-24 truncate text-xs font-black ${active ? 'text-emerald-700' : 'text-slate-700'}`}>
                        {store}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {complete ? 'Reviewed' : active ? 'Current' : 'Pending'}
                      </span>
                    </button>
                    {index < stores.length - 1 && (
                      <div className={`mt-4 h-0.5 w-5 sm:w-8 ${complete ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_330px]">
            <div className="p-4 sm:p-6 lg:border-r lg:border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Current Store</div>
                  <h2 className="mt-1 text-xl font-black">{currentStore || 'No stores available'}</h2>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600">
                  {currentOrders.length} unique order{currentOrders.length === 1 ? '' : 's'}
                </div>
              </div>

              <label className="mt-5 block text-sm font-bold text-slate-700" htmlFor="store-orders">
                Paste one order number per line
              </label>
              <textarea
                id="store-orders"
                value={currentDraft}
                onChange={(event) => {
                  setDrafts((previous) => ({ ...previous, [currentStore]: event.target.value }));
                  setError(null);
                }}
                disabled={!currentStore || processing}
                placeholder={'256580\n255560\n260555'}
                className="mt-2 min-h-64 w-full resize-y rounded-xl border border-slate-300 bg-white p-4 font-mono text-base leading-8 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 disabled:bg-slate-100"
              />
              <div className="mt-1 text-xs font-semibold text-slate-400">
                Separate orders with a new line, comma, or space.
              </div>

              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => markCurrentReviewed(true)}
                  disabled={!currentStore || processing}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                >
                  <SkipForward size={17} /> Skip Store
                </button>
                <button
                  type="button"
                  onClick={() => markCurrentReviewed(false)}
                  disabled={!currentStore || processing}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-black text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {currentIndex === stores.length - 1 ? 'Finish Stores' : 'Save & Next'} <ArrowRight size={17} />
                </button>
              </div>
            </div>

            <aside className="border-t border-slate-200 bg-slate-50/70 p-4 sm:p-6 lg:border-t-0">
              <h3 className="text-base font-black">Review Summary</h3>
              <dl className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
                {[
                  ['Stores reviewed', `${reviewedStores.size} / ${stores.length}`],
                  ['Orders entered', totalOrders],
                  ['Current store orders', currentOrders.length],
                  ['Duplicate customers', result?.duplicate_groups.length ?? '-'],
                  ['Orders with warnings', result?.failed_orders ?? '-'],
                ].map(([label, value]) => (
                  <div key={String(label)} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                    <dt className="font-semibold text-slate-600">{label}</dt>
                    <dd className="font-black text-slate-900">{value}</dd>
                  </div>
                ))}
              </dl>
              <button
                type="button"
                onClick={() => void runReview()}
                disabled={!allStoresReviewed || totalOrders === 0 || processing}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-black text-white shadow-sm hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {processing ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} fill="currentColor" />}
                {processing ? 'Processing Orders...' : 'Start Processing'}
              </button>
              {!allStoresReviewed && (
                <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">
                  Review or skip every store to enable processing.
                </p>
              )}
            </aside>
          </div>
        </section>

        {processing && (
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-6 text-center">
            <Loader2 className="mx-auto animate-spin text-emerald-600" size={28} />
            <h2 className="mt-3 text-lg font-black text-emerald-950">Processing order details</h2>
            <p className="mt-1 text-sm font-semibold text-emerald-800">
              This may take some time while POS details are loaded for every order.
            </p>
          </section>
        )}

        {result && !processing && (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div>
                <div className="flex items-center gap-2">
                  <Users size={20} className="text-emerald-600" />
                  <h2 className="text-xl font-black">Customers With Multiple Orders</h2>
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Collect these orders into one store or hanger before customer pickup.
                </p>
              </div>
              <label className="relative block sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                  placeholder="Search name, phone, or order..."
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm font-semibold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </label>
            </div>

            {filteredGroups.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <ClipboardCheck className="mx-auto text-emerald-600" size={38} />
                <h3 className="mt-3 text-lg font-black">
                  {result.duplicate_groups.length === 0 ? 'No duplicate customers found' : 'No matching results'}
                </h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {result.duplicate_groups.length === 0
                    ? 'No phone number has more than one order in the submitted stores.'
                    : 'Try another customer name, phone, or order number.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {filteredGroups.map((group) => {
                  const expanded = expandedGroups.has(group.phone);
                  return (
                    <article key={group.phone}>
                      <button
                        type="button"
                        onClick={() => toggleGroup(group.phone)}
                        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left hover:bg-slate-50 sm:px-5"
                      >
                        <div className="min-w-0">
                          <div className="font-black text-slate-900">{group.customer_name || 'Unknown Customer'}</div>
                          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold text-slate-500">
                            <span>{group.phone}</span>
                            <span>{group.orders.length} orders</span>
                            <span>{Array.from(new Set(group.orders.map((order) => order.store_name))).join(', ')}</span>
                          </div>
                        </div>
                        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>

                      {expanded && (
                        <div className="overflow-x-auto border-t border-slate-100 bg-slate-50/50">
                          <table className="w-full min-w-[900px] text-left text-sm">
                            <thead className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                              <tr>
                                <th className="px-5 py-3 font-black">Order</th>
                                <th className="px-5 py-3 font-black">Store</th>
                                <th className="px-5 py-3 font-black">Status</th>
                                <th className="px-5 py-3 font-black">Balance</th>
                                <th className="px-5 py-3 font-black">Remark</th>
                                <th className="px-5 py-3 font-black">Action Required</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                              {group.orders.map((order) => (
                                <tr key={`${order.store_name}-${order.order_no}`}>
                                  <td className="px-5 py-3.5 font-black text-slate-900">{order.order_no}</td>
                                  <td className="px-5 py-3.5 font-bold text-slate-700">{order.store_name}</td>
                                  <td className="px-5 py-3.5">
                                    <span className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-black ${statusClass(order.order_status)}`}>
                                      {order.order_status || '-'}
                                    </span>
                                  </td>
                                  <td className="px-5 py-3.5 font-black text-slate-800">{formatMoney(order.balance)}</td>
                                  <td className="max-w-xs px-5 py-3.5 font-semibold text-slate-600">{order.remark || '-'}</td>
                                  <td className="px-5 py-3.5 font-bold text-emerald-700">Move to the same store or hanger</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-500 sm:px-5">
              <span>Batch #{result.batch_id}</span>
              <span>{result.checked_orders} orders checked · {result.duplicate_groups.length} duplicate customer groups</span>
            </footer>
          </section>
        )}

        {result && result.warnings.length > 0 && (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
            <h2 className="flex items-center gap-2 font-black text-amber-950">
              <AlertTriangle size={19} /> Orders With Lookup Warnings
            </h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {result.warnings.map((warning) => (
                <div key={`${warning.store_name}-${warning.order_no}`} className="rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-sm">
                  <div className="font-black text-slate-900">{warning.order_no} · {warning.store_name}</div>
                  <div className="mt-1 font-semibold text-amber-800">{warning.error_message || 'POS details unavailable.'}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
