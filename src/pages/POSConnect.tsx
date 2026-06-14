import { useState } from 'react';
import axios from 'axios';
import {
  AlertCircle,
  Banknote,
  CalendarClock,
  CheckCircle2,
  FileText,
  Loader2,
  MapPin,
  Phone,
  Search,
  User,
  Wifi,
  WifiOff,
} from 'lucide-react';

type POSConnectionStatus = 'idle' | 'loading' | 'success' | 'error';

type PosOrderStatus = 'Delivered' | 'Fully Packed' | 'Partially Packed' | 'Pending' | 'Pending/Unpaid';

type PosConnectOrder = {
  order_no: string;
  customer_phone: string;
  customer_name: string;
  order_date: string;
  delivery_date: string;
  delivery_time: string;
  customer_address: string;
  remark: string;
  price: number;
  balance: number;
  order_status: PosOrderStatus;
  source_orders_id: string;
  source_invoice_id: string;
};

type PosConnectResponse = {
  order: PosConnectOrder | null;
  orders: PosConnectOrder[];
  multiple: boolean;
  storage_sync?: PosConveyerStorageSync | null;
  details_pending?: boolean;
  searched_queries?: string[];
  attempts?: Array<{
    query: string;
    records_total: number;
    records_filtered: number;
    parsed_orders: number;
  }>;
};

type PosConveyerStorageSync = {
  synced: boolean;
  reason?: string;
  action?: 'inserted' | 'moved' | 'unchanged';
  order_no: string;
  remark: string;
  slot: number | null;
  store: string | null;
  row: number | null;
  column: number | null;
  blanket_id?: number | null;
  occupied_by?: string | null;
  message?: string;
};

const emptyValue = '-';

const formatText = (value: string | number | null | undefined) => {
  const text = String(value ?? '').trim();
  return text || emptyValue;
};

const formatMoney = (value: number | null | undefined) => {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return 'AED 0.00';
  return `AED ${amount.toFixed(2)}`;
};

const formatDateText = (value: string | null | undefined) => {
  const text = String(value ?? '').trim();
  if (!text) return emptyValue;
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return text;
  return parsed.toLocaleDateString();
};

const statusClassName = (status: PosOrderStatus) => {
  if (status === 'Delivered') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (status === 'Fully Packed') return 'border-blue-200 bg-blue-50 text-blue-700';
  if (status === 'Partially Packed') return 'border-amber-200 bg-amber-50 text-amber-700';
  if (status === 'Pending/Unpaid') return 'border-rose-200 bg-rose-50 text-rose-700';
  return 'border-slate-200 bg-slate-100 text-slate-700';
};

const storageSyncText = (sync: PosConveyerStorageSync) => {
  if (sync.synced && sync.store && sync.slot) {
    if (sync.action === 'unchanged') {
      return `Already stored in ${sync.store} slot ${sync.slot}`;
    }
    if (sync.action === 'moved') {
      return `Moved order ${sync.order_no} to ${sync.store} slot ${sync.slot}`;
    }
    return `Stored order ${sync.order_no} in ${sync.store} slot ${sync.slot}`;
  }

  if (sync.reason === 'no_conveyer_slot_in_remark') {
    return 'No conveyer slot found in POS remark. Use a number from 1 to 300.';
  }
  if (sync.reason === 'slot_occupied') {
    return sync.message || `Conveyer slot ${sync.slot ?? ''} is occupied.`;
  }
  if (sync.reason === 'disabled') {
    return 'Conveyer auto-sync is disabled.';
  }
  return sync.message || 'Conveyer sync was not completed.';
};

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm font-semibold text-slate-500">{label}</span>
      <span className="text-sm font-bold text-slate-900 text-right break-words">{value}</span>
    </div>
  );
}

export default function POSConnect() {
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState<POSConnectionStatus>('idle');
  const [posData, setPosData] = useState<PosConnectOrder | null>(null);
  const [matches, setMatches] = useState<PosConnectOrder[]>([]);
  const [storageSync, setStorageSync] = useState<PosConveyerStorageSync | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (selectedOrder?: PosConnectOrder) => {
    const query = searchQuery.trim();
    if (!query) {
      setError('Please enter an order number or customer phone');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setError(null);
    setPosData(null);
    setStorageSync(null);
    setDetailsLoading(false);
    if (!selectedOrder) setMatches([]);

    try {
      const requestLookup = (deep = false) =>
        axios.get<PosConnectResponse>('/api/pos/connect-order', {
          params: {
            q: query,
            orders_id: selectedOrder?.source_orders_id || undefined,
            invoice_id: selectedOrder?.source_invoice_id || undefined,
            fast: '1',
            deep: deep ? '1' : undefined,
          },
        });

      let response = await requestLookup(false);
      if (!selectedOrder && !response.data.order && !(response.data.multiple && response.data.orders.length > 0)) {
        response = await requestLookup(true);
      }

      if (response.data.order) {
        const initialOrder = response.data.order;
        setPosData(initialOrder);
        setStorageSync(response.data.storage_sync ?? null);
        setMatches([]);
        setStatus('success');
        if (response.data.details_pending && (initialOrder.source_orders_id || initialOrder.source_invoice_id)) {
          const sourceOrdersId = initialOrder.source_orders_id;
          const sourceInvoiceId = initialOrder.source_invoice_id;
          setDetailsLoading(true);
          void axios
            .get<{ order: PosConnectOrder; storage_sync?: PosConveyerStorageSync | null }>(
              '/api/pos/connect-order-details',
              {
                params: {
                  orders_id: sourceOrdersId || undefined,
                  invoice_id: sourceInvoiceId || undefined,
                },
              }
            )
            .then((detailsResponse) => {
              const detailedOrder = detailsResponse.data.order;
              setPosData((current) => {
                if (!current) return detailedOrder;
                const sameOrder =
                  (!sourceOrdersId || current.source_orders_id === sourceOrdersId) &&
                  (!sourceInvoiceId || current.source_invoice_id === sourceInvoiceId);
                return sameOrder ? detailedOrder : current;
              });
              setStorageSync(detailsResponse.data.storage_sync ?? null);
            })
            .catch((detailsError: any) => {
              setError(detailsError.response?.data?.error || detailsError.message || 'Failed to load full POS details');
            })
            .finally(() => setDetailsLoading(false));
        }
        return;
      }

      if (response.data.multiple && response.data.orders.length > 0) {
        setMatches(response.data.orders);
        setStatus('success');
        return;
      }

      const attempts = response.data.attempts ?? [];
      const variants = response.data.searched_queries?.filter(Boolean) ?? [];
      const attemptSummary = attempts
        .map((attempt) => `${attempt.query}: raw ${attempt.records_filtered}, parsed ${attempt.parsed_orders}`)
        .join(' | ');
      setError(
        attemptSummary
          ? `No POS orders found. ${attemptSummary}`
          : variants.length > 0
            ? `No POS orders found. Tried: ${variants.join(', ')}`
            : 'No POS orders found for this search'
      );
      setStatus('error');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to connect to POS system');
      setStatus('error');
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      void handleSearch();
    }
  };

  const isLoading = status === 'loading';
  const isConnected = status === 'success';
  const hasError = status === 'error';

  return (
    <div className="min-h-full overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-5 sm:space-y-6">
      <section className="rounded-3xl border p-4 sm:p-6 shadow-sm bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.25em] text-blue-100 font-black">
              System Integration
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">
              POS Connect
            </h1>
            <p className="mt-2 text-sm text-blue-100 font-medium max-w-3xl">
              Search POS orders by order number or customer phone.
            </p>
          </div>
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
              isConnected
                ? 'bg-green-500/20 text-green-100'
                : hasError
                  ? 'bg-red-500/20 text-red-100'
                  : 'bg-white/10 text-blue-100'
            }`}
          >
            {isConnected ? (
              <>
                <Wifi size={18} />
                <span className="text-sm font-semibold">Connected</span>
              </>
            ) : hasError ? (
              <>
                <WifiOff size={18} />
                <span className="text-sm font-semibold">Disconnected</span>
              </>
            ) : (
              <>
                <div className="w-4 h-4 rounded-full bg-white/30" />
                <span className="text-sm font-semibold">Idle</span>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <label htmlFor="search" className="block text-sm font-semibold text-slate-700 mb-2">
          Search by Order Number or Customer Phone
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id="search"
            type="text"
            placeholder="Order number or phone"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-4 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white text-slate-900 placeholder:text-slate-500"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => void handleSearch()}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search size={18} />
                <span>Search</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (hasError || isConnected) && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-4 space-y-2">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-red-900">POS Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {matches.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
            <h2 className="font-bold text-slate-900">Matching Orders</h2>
            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{matches.length} found</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left font-bold">Order</th>
                  <th className="px-4 py-3 text-left font-bold">Customer</th>
                  <th className="px-4 py-3 text-left font-bold">Phone</th>
                  <th className="px-4 py-3 text-left font-bold">Order Date</th>
                  <th className="px-4 py-3 text-left font-bold">Price</th>
                  <th className="px-4 py-3 text-left font-bold">Status</th>
                  <th className="px-4 py-3 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {matches.map((order) => (
                  <tr key={`${order.source_orders_id}-${order.source_invoice_id}-${order.order_no}`} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-900">{formatText(order.order_no)}</td>
                    <td className="px-4 py-3 text-slate-700">{formatText(order.customer_name)}</td>
                    <td className="px-4 py-3 text-slate-700">{formatText(order.customer_phone)}</td>
                    <td className="px-4 py-3 text-slate-700">{formatDateText(order.order_date)}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{formatMoney(order.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-black ${statusClassName(order.order_status)}`}>
                        {order.order_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => void handleSearch(order)}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-700 disabled:opacity-50"
                      >
                        <Search size={14} />
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isConnected && posData && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-green-300 bg-green-50 p-4 flex items-center gap-3">
            <CheckCircle2 className="text-green-600 flex-shrink-0" size={24} />
            <div className="min-w-0">
              <h3 className="font-semibold text-green-900">POS Data Retrieved</h3>
              <p className="text-sm text-green-700 break-words">
                Order {formatText(posData.order_no)}
                {detailsLoading ? ' - loading full details...' : ''}
              </p>
            </div>
          </div>

          {detailsLoading && (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 flex items-center gap-3">
              <Loader2 className="text-blue-600 flex-shrink-0 animate-spin" size={20} />
              <div>
                <h3 className="font-semibold text-blue-900">Fast result shown</h3>
                <p className="text-sm text-blue-700">Full POS details and conveyer sync are loading in the background.</p>
              </div>
            </div>
          )}

          {storageSync && (
            <div
              className={`rounded-2xl border p-4 flex items-start gap-3 ${
                storageSync.synced
                  ? 'border-emerald-300 bg-emerald-50'
                  : storageSync.reason === 'no_conveyer_slot_in_remark'
                    ? 'border-amber-300 bg-amber-50'
                    : 'border-red-300 bg-red-50'
              }`}
            >
              {storageSync.synced ? (
                <CheckCircle2 className="text-emerald-600 flex-shrink-0 mt-0.5" size={22} />
              ) : (
                <AlertCircle
                  className={`flex-shrink-0 mt-0.5 ${
                    storageSync.reason === 'no_conveyer_slot_in_remark' ? 'text-amber-600' : 'text-red-600'
                  }`}
                  size={22}
                />
              )}
              <div className="min-w-0">
                <h3
                  className={`font-semibold ${
                    storageSync.synced
                      ? 'text-emerald-900'
                      : storageSync.reason === 'no_conveyer_slot_in_remark'
                        ? 'text-amber-900'
                        : 'text-red-900'
                  }`}
                >
                  Conveyer Storage Sync
                </h3>
                <p
                  className={`text-sm mt-1 break-words ${
                    storageSync.synced
                      ? 'text-emerald-700'
                      : storageSync.reason === 'no_conveyer_slot_in_remark'
                        ? 'text-amber-700'
                        : 'text-red-700'
                  }`}
                >
                  {storageSyncText(storageSync)}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="text-blue-600" size={18} />
                <h3 className="font-bold text-slate-900">Order</h3>
              </div>
              <DetailRow label="Order Number" value={formatText(posData.order_no)} />
              <DetailRow label="Order Date" value={formatDateText(posData.order_date)} />
              <DetailRow
                label="Delivery"
                value={`${formatDateText(posData.delivery_date)}${posData.delivery_time ? ` ${posData.delivery_time}` : ''}`}
              />
              <div className="flex items-start justify-between gap-4 py-2">
                <span className="text-sm font-semibold text-slate-500">Order Status</span>
                <span className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-black ${statusClassName(posData.order_status)}`}>
                  {posData.order_status}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <User className="text-blue-600" size={18} />
                <h3 className="font-bold text-slate-900">Customer</h3>
              </div>
              <DetailRow label="Name" value={formatText(posData.customer_name)} />
              <DetailRow label="Phone" value={formatText(posData.customer_phone)} />
              <div className="flex items-start gap-2 py-2">
                <MapPin className="text-slate-400 shrink-0 mt-0.5" size={16} />
                <div>
                  <div className="text-sm font-semibold text-slate-500">Address</div>
                  <div className="text-sm font-bold text-slate-900 break-words mt-1">
                    {formatText(posData.customer_address)}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Banknote className="text-blue-600" size={18} />
                <h3 className="font-bold text-slate-900">Payment</h3>
              </div>
              <DetailRow label="Price" value={formatMoney(posData.price)} />
              <DetailRow label="Balance" value={formatMoney(posData.balance)} />
              <div className="flex items-center gap-2 mt-4 text-sm text-slate-500">
                <Phone size={16} />
                <span className="font-semibold">{formatText(posData.customer_phone)}</span>
              </div>
              <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                <CalendarClock size={16} />
                <span className="font-semibold">{formatDateText(posData.delivery_date)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="text-blue-600" size={18} />
              <h3 className="font-bold text-slate-900">Remark</h3>
            </div>
            <p className="text-sm font-semibold text-slate-700 whitespace-pre-wrap break-words">
              {formatText(posData.remark)}
            </p>
          </div>
        </div>
      )}

      {status === 'idle' && !posData && matches.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
          <div className="text-slate-400 mb-3">
            <Search size={48} className="mx-auto" />
          </div>
          <h3 className="font-semibold text-slate-700 mb-1">No Search Results</h3>
          <p className="text-sm text-slate-600">Enter an order number or customer phone.</p>
        </div>
      )}
    </div>
  );
}
