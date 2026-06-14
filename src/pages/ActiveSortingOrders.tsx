import axios from 'axios';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Home,
  Loader2,
  PackageCheck,
  RefreshCw,
  Search,
  Shirt,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react';
import { detectSortingItemCategory } from '../utils/sortingItemCategory';

type SortingItem = {
  id: number;
  order_no: string;
  item_name: string;
  qty_required: number;
  qty_sorted: number;
  qty_ironed?: number;
  qty_packed?: number;
  status: 'missing' | 'partial' | 'complete';
};

type SortingOrder = {
  order_no: string;
  customer_name: string;
  customer_phone?: string | null;
  total_required: number;
  total_sorted: number;
  total_ironed?: number;
  status:
    | 'sorting_pending'
    | 'sorting_partial'
    | 'sorted_complete'
    | 'packing_in_progress'
    | 'packed_complete';
  table_id: number | null;
  row_no: number | null;
  col_no: number | null;
  source_orders_id: string | null;
  source_invoice_id: string | null;
  pos_order_status?: 'Delivered' | 'Fully Packed' | 'Partially Packed' | 'Pending' | 'Pending/Unpaid' | string | null;
  pos_payment_status?: string | null;
  pos_status_flags?: string | null;
  pos_remark?: string | null;
  pos_total?: number | null;
  pos_paid?: number | null;
  pos_balance?: number | null;
  pos_order_date?: string | null;
  pos_delivery_date?: string | null;
  pos_delivery_time?: string | null;
  pos_last_synced_at?: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  progress_percent: number;
  items: SortingItem[];
};

type SortingStateResponse = {
  tables: unknown[];
  orders: {
    all: SortingOrder[];
    sorting: SortingOrder[];
    ready_for_packing: SortingOrder[];
    packed: SortingOrder[];
  };
};

type ScanResponse = {
  success: boolean;
  pos_sync?: {
    success: boolean;
    verified: boolean;
    description?: string;
    error?: string;
  } | null;
  state: SortingStateResponse;
};

type SyncActiveResponse = {
  success: boolean;
  state: SortingStateResponse;
  summary: {
    checked: number;
    synced: number;
  };
};

const formatPercent = (value: number) => `${Math.max(0, Math.min(100, Math.round(value)))}%`;

const splitOrderItems = (items: SortingItem[]) => {
  const clothes: SortingItem[] = [];
  const homePhase2: SortingItem[] = [];
  const blanketPhase3: SortingItem[] = [];

  for (const item of items) {
    const category = detectSortingItemCategory(item.item_name);
    if (category === 'blanket_phase3') {
      blanketPhase3.push(item);
      continue;
    }
    if (category === 'home_phase2') {
      homePhase2.push(item);
      continue;
    }
    clothes.push(item);
  }

  return { clothes, homePhase2, blanketPhase3 };
};

const formatOrderStatus = (status: SortingOrder['status']) => {
  switch (status) {
    case 'sorting_pending':
      return 'Pending Sorting';
    case 'sorting_partial':
      return 'Partially Sorted';
    case 'sorted_complete':
      return 'Ready For Packing';
    case 'packing_in_progress':
      return 'Packing In Progress';
    case 'packed_complete':
      return 'Packed';
    default:
      return status;
  }
};

const statusBadgeClass = (status: SortingOrder['status']) => {
  switch (status) {
    case 'sorted_complete':
      return 'bg-emerald-100 text-emerald-700 border-emerald-300';
    case 'packing_in_progress':
      return 'bg-indigo-100 text-indigo-700 border-indigo-300';
    case 'packed_complete':
      return 'bg-slate-200 text-slate-700 border-slate-300';
    case 'sorting_partial':
      return 'bg-amber-100 text-amber-700 border-amber-300';
    default:
      return 'bg-rose-100 text-rose-700 border-rose-300';
  }
};

const posOrderStatusBadgeClass = (status?: string | null) => {
  switch (String(status ?? '').trim()) {
    case 'Delivered':
      return 'border-emerald-300 bg-emerald-50 text-emerald-700';
    case 'Fully Packed':
      return 'border-blue-300 bg-blue-50 text-blue-700';
    case 'Partially Packed':
      return 'border-amber-300 bg-amber-50 text-amber-700';
    case 'Pending/Unpaid':
      return 'border-rose-300 bg-rose-50 text-rose-700';
    case 'Pending':
      return 'border-slate-300 bg-slate-50 text-slate-700';
    default:
      return 'border-slate-200 bg-slate-50 text-slate-500';
  }
};

const sumRemaining = (orders: SortingOrder[]) =>
  orders.reduce((total, order) => total + Math.max(0, order.total_required - order.total_sorted), 0);

type DatePreset = 'all' | 'today' | 'yesterday' | 'this_month' | 'last_month' | 'custom';

const parseOrderDate = (value?: string | null) => {
  const raw = String(value ?? '').trim();
  if (!raw) return null;
  const isoLike = raw.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoLike) {
    return new Date(Number(isoLike[1]), Number(isoLike[2]) - 1, Number(isoLike[3]));
  }
  const dayFirst = raw.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dayFirst) {
    return new Date(Number(dayFirst[3]), Number(dayFirst[2]) - 1, Number(dayFirst[1]));
  }
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const resolveOrderFilterDate = (order: SortingOrder) =>
  parseOrderDate(order.pos_order_date || order.created_at || order.updated_at);

const getDateRangeForPreset = (preset: DatePreset, customFrom: string, customTo: string) => {
  if (preset === 'all') return { from: null as Date | null, to: null as Date | null };
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

  if (preset === 'today') return { from: startOfToday, to: endOfToday };
  if (preset === 'yesterday') {
    const from = new Date(startOfToday);
    from.setDate(from.getDate() - 1);
    const to = new Date(endOfToday);
    to.setDate(to.getDate() - 1);
    return { from, to };
  }
  if (preset === 'this_month') {
    return {
      from: new Date(today.getFullYear(), today.getMonth(), 1),
      to: new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999),
    };
  }
  if (preset === 'last_month') {
    return {
      from: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      to: new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999),
    };
  }

  return {
    from: customFrom ? new Date(`${customFrom}T00:00:00`) : null,
    to: customTo ? new Date(`${customTo}T23:59:59.999`) : null,
  };
};

const orderMatchesSearch = (order: SortingOrder, query: string) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  const haystack = [
    order.order_no,
    order.customer_name,
    order.customer_phone,
    order.pos_order_status,
    order.pos_payment_status,
    order.pos_remark,
    order.pos_order_date,
    order.pos_delivery_date,
    ...order.items.map((item) => item.item_name),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(normalized);
};

const ItemGroup = ({
  title,
  icon,
  tone,
  emptyLabel,
  items,
  orderNo,
  busyKey,
  onQuickScan,
}: {
  title: string;
  icon: ReactNode;
  tone: 'blue' | 'emerald' | 'violet';
  emptyLabel: string;
  items: SortingItem[];
  orderNo: string;
  busyKey: string | null;
  onQuickScan: (orderNo: string, itemName: string) => void;
}) => {
  const toneClass = {
    blue: 'border-blue-300 bg-blue-50 text-blue-700',
    emerald: 'border-emerald-300 bg-emerald-50 text-emerald-700',
    violet: 'border-violet-300 bg-violet-50 text-violet-700',
  }[tone];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 space-y-2">
      <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-slate-600">
        {icon}
        {title}
      </div>
      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="text-xs text-slate-500 font-semibold">{emptyLabel}</div>
        ) : (
          items.map((item) => {
            const remain = Math.max(0, item.qty_required - item.qty_sorted);
            const key = `${orderNo}:${item.item_name}`;
            const busy = busyKey === key;
            return (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 px-2.5 py-2 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="text-xs font-black text-slate-900 truncate">{item.item_name}</div>
                  <div className="text-[11px] text-slate-600 font-semibold">
                    {item.qty_sorted}/{item.qty_required} - Remaining {remain}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onQuickScan(orderNo, item.item_name)}
                  disabled={busy || remain <= 0}
                  className={`shrink-0 rounded-lg border px-2 py-1 text-[10px] font-black uppercase tracking-wider disabled:opacity-50 ${toneClass}`}
                >
                  {busy ? '...' : '+1'}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default function ActiveSortingOrdersPage() {
  const [sortingState, setSortingState] = useState<SortingStateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [itemScanBusyKey, setItemScanBusyKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const sortingOrders = sortingState?.orders.sorting ?? [];
  const filteredSortingOrders = useMemo(() => {
    const { from, to } = getDateRangeForPreset(datePreset, dateFrom, dateTo);
    return sortingOrders.filter((order) => {
      if (!orderMatchesSearch(order, searchQuery)) return false;
      if (!from && !to) return true;
      const orderDate = resolveOrderFilterDate(order);
      if (!orderDate) return false;
      if (from && orderDate < from) return false;
      if (to && orderDate > to) return false;
      return true;
    });
  }, [dateFrom, datePreset, dateTo, searchQuery, sortingOrders]);
  const totals = useMemo(() => {
    const required = filteredSortingOrders.reduce((sum, order) => sum + order.total_required, 0);
    const sorted = filteredSortingOrders.reduce((sum, order) => sum + order.total_sorted, 0);
    return {
      required,
      sorted,
      remaining: sumRemaining(filteredSortingOrders),
    };
  }, [filteredSortingOrders]);

  const loadState = useCallback(async (quiet = false) => {
    try {
      if (!quiet) setLoading(true);
      setError(null);
      const response = await axios.get<SortingStateResponse>('/api/sorting/state');
      setSortingState(response.data);

      setRefreshing(true);
      void axios
        .post<SyncActiveResponse>('/api/sorting/sync-active', { limit: 12 }, { timeout: 8000 })
        .then((syncResponse) => {
          setSortingState(syncResponse.data.state);
        })
        .catch(() => {
          // Keep the local state visible; POS sync is a background refresh.
        })
        .finally(() => setRefreshing(false));
    } catch (requestError: any) {
      setError(requestError?.response?.data?.error || requestError?.message || 'Failed to load active sorting orders.');
      setRefreshing(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadState();
  }, [loadState]);

  const toggleOrderExpanded = (orderNo: string) => {
    setExpandedOrders((current) => ({
      ...current,
      [orderNo]: !current[orderNo],
    }));
  };

  const handleQuickItemScan = async (orderNo: string, itemName: string) => {
    const key = `${orderNo}:${itemName}`;
    try {
      setItemScanBusyKey(key);
      setActionError(null);
      const response = await axios.post<ScanResponse>('/api/sorting/scan', {
        order_no: orderNo,
        qty: 1,
        item_name: itemName,
      });
      setSortingState(response.data.state);
      if (response.data.pos_sync && !response.data.pos_sync.success) {
        setActionError(`تم تسجيل الفرز محليًا، لكن تعذر تحديث POS: ${response.data.pos_sync.error || 'Unknown error'}`);
      }
    } catch (requestError: any) {
      setActionError(requestError?.response?.data?.error || requestError?.message || 'Failed to process item scan.');
    } finally {
      setItemScanBusyKey(null);
    }
  };

  return (
    <div className="clothes-sorting-system min-h-full overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-5 sm:space-y-6">
      <section className="cs-hero relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 sm:p-7 shadow-sm">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <PackageCheck size={25} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Active Sorting Orders</h1>
              <p className="mt-1 text-sm sm:text-base font-semibold text-slate-500">
                طلبات الفرز النشطة ومتابعة القطع حسب المرحلة والموقع.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              void loadState(true);
            }}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-900 px-4 py-3 text-sm font-black text-white shadow-sm disabled:opacity-60"
          >
            {refreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Refresh
          </button>
        </div>

        <div className="relative mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="cs-stat-card rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500">
              <Sparkles size={15} /> Active
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">{filteredSortingOrders.length}</div>
            {filteredSortingOrders.length !== sortingOrders.length && (
              <div className="mt-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                of {sortingOrders.length}
              </div>
            )}
          </div>
          <div className="cs-stat-card rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500">
              <TrendingUp size={15} /> Pieces
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">{totals.required}</div>
          </div>
          <div className="cs-stat-card rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500">
              <CheckCircle2 size={15} /> Sorted
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">{totals.sorted}</div>
          </div>
          <div className="cs-stat-card rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500">
              <AlertCircle size={15} /> Remaining
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">{totals.remaining}</div>
          </div>
        </div>
      </section>

      {actionError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {actionError}
        </div>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-800 font-black">
            <PackageCheck size={18} />
            Active Sorting Orders
          </div>
          <div className="text-xs font-black uppercase tracking-wider text-slate-500">
            Live sorting queue
          </div>
        </div>

        <div dir="ltr" className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4 space-y-3">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.4fr_1fr_1fr_auto]">
            <label className="relative block">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search order, customer, remark"
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <div className="mb-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <Calendar size={13} />
                From
              </div>
              <input
                type="date"
                value={dateFrom}
                onChange={(event) => {
                  setDateFrom(event.target.value);
                  setDatePreset('custom');
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-black text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <div className="mb-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <Calendar size={13} />
                To
              </div>
              <input
                type="date"
                value={dateTo}
                onChange={(event) => {
                  setDateTo(event.target.value);
                  setDatePreset('custom');
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-black text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setDatePreset('all');
                setDateFrom('');
                setDateTo('');
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-700 transition hover:bg-slate-100 lg:self-end"
            >
              <X size={14} />
              Clear
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all' as DatePreset, label: 'All' },
              { id: 'today' as DatePreset, label: 'Today' },
              { id: 'yesterday' as DatePreset, label: 'Yesterday' },
              { id: 'this_month' as DatePreset, label: 'This Month' },
              { id: 'last_month' as DatePreset, label: 'Last Month' },
            ].map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setDatePreset(preset.id);
                  if (preset.id !== 'custom') {
                    setDateFrom('');
                    setDateTo('');
                  }
                }}
                className={`rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-wider transition ${
                  datePreset === preset.id
                    ? 'border-blue-500 bg-blue-600 text-white shadow-sm'
                    : 'border-slate-300 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="text-[11px] font-bold text-slate-500">
            Showing {filteredSortingOrders.length} of {sortingOrders.length} active orders. Date filter uses POS order date when available, otherwise system created date.
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
            <div className="inline-flex items-center gap-2 text-sm font-black text-slate-600">
              <Loader2 size={18} className="animate-spin" />
              Loading active orders...
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-5 text-sm font-bold text-rose-700">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr className="text-left">
                  <th className="px-3 py-2 font-black uppercase tracking-wider">Order</th>
                  <th className="px-3 py-2 font-black uppercase tracking-wider">Customer</th>
                  <th className="px-3 py-2 font-black uppercase tracking-wider">POS Status</th>
                  <th className="px-3 py-2 font-black uppercase tracking-wider">Remark</th>
                  <th className="px-3 py-2 font-black uppercase tracking-wider">Progress</th>
                  <th className="px-3 py-2 font-black uppercase tracking-wider">Status</th>
                  <th className="px-3 py-2 font-black uppercase tracking-wider">Location</th>
                </tr>
              </thead>
              <tbody>
                {filteredSortingOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-10 text-center text-slate-500 font-semibold">
                      No active sorting orders match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredSortingOrders.map((order) => {
                    const expanded = Boolean(expandedOrders[order.order_no]);
                    const split = splitOrderItems(order.items);
                    return (
                      <Fragment key={order.order_no}>
                        <tr className="border-t border-slate-200">
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              onClick={() => toggleOrderExpanded(order.order_no)}
                              className="inline-flex items-center gap-1.5 font-black text-slate-900 hover:text-blue-700"
                            >
                              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              {order.order_no}
                            </button>
                          </td>
                          <td className="px-3 py-2 font-semibold text-slate-700">{order.customer_name || '-'}</td>
                          <td className="px-3 py-2">
                            <span className={`inline-flex px-2 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${posOrderStatusBadgeClass(order.pos_order_status)}`}>
                              {order.pos_order_status || 'Pending'}
                            </span>
                            {order.pos_payment_status && (
                              <div className="mt-1 text-[10px] font-bold text-slate-500">{order.pos_payment_status}</div>
                            )}
                          </td>
                          <td className="max-w-[220px] px-3 py-2 font-semibold text-violet-800">
                            <div className="truncate" title={order.pos_remark || ''}>
                              {order.pos_remark || '-'}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <div className="font-semibold text-slate-700">
                              {order.total_sorted}/{order.total_required} ({formatPercent(order.progress_percent)})
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`inline-flex px-2 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${statusBadgeClass(order.status)}`}
                            >
                              {formatOrderStatus(order.status)}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-slate-700 font-semibold">
                            {order.table_id && order.row_no && order.col_no
                              ? `T${order.table_id} - R${order.row_no}:C${order.col_no}`
                              : '-'}
                          </td>
                        </tr>

                        {expanded && (
                          <tr className="border-t border-slate-100 bg-slate-50">
                            <td colSpan={7} className="px-3 py-3">
                              <div className="space-y-3">
                                <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-600">
                                  Piece Processing
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                                  <ItemGroup
                                    title="Clothes"
                                    icon={<Shirt size={13} />}
                                    tone="blue"
                                    emptyLabel="No clothes pieces."
                                    items={split.clothes}
                                    orderNo={order.order_no}
                                    busyKey={itemScanBusyKey}
                                    onQuickScan={handleQuickItemScan}
                                  />
                                  <ItemGroup
                                    title="Home Items (Phase 2)"
                                    icon={<Home size={13} />}
                                    tone="emerald"
                                    emptyLabel="No home items in this order."
                                    items={split.homePhase2}
                                    orderNo={order.order_no}
                                    busyKey={itemScanBusyKey}
                                    onQuickScan={handleQuickItemScan}
                                  />
                                  <ItemGroup
                                    title="Blankets (Phase 3)"
                                    icon={<PackageCheck size={13} />}
                                    tone="violet"
                                    emptyLabel="No blanket items in this order."
                                    items={split.blanketPhase3}
                                    orderNo={order.order_no}
                                    busyKey={itemScanBusyKey}
                                    onQuickScan={handleQuickItemScan}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
