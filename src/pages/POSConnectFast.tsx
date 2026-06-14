import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { AlertCircle, CheckCircle2, Loader2, Search, Wifi, WifiOff } from 'lucide-react';

type POSConnectionStatus = 'idle' | 'loading' | 'success' | 'error';

type PosOrderData = {
  orders_id: string;
  order_no: string;
  created_at: string;
  invoice_no: string;
  invoice_date: string;
  delivery_type: string;
  customer_phone: string;
  customer_name: string;
  notes: string;
  total: number;
  paid: number;
  balance: number;
  branch: string;
  status_flags: string[];
};

// Simple in-memory cache with TTL
const searchCache = new Map<string, { data: PosOrderData | null; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute

const getCachedResult = (query: string): PosOrderData | null | undefined => {
  const cached = searchCache.get(query);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return undefined;
};

const setCachedResult = (query: string, data: PosOrderData | null) => {
  searchCache.set(query, { data, timestamp: Date.now() });
};

export default function POSConnectFast() {
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState<POSConnectionStatus>('idle');
  const [posData, setPosData] = useState<PosOrderData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTime, setSearchTime] = useState<number | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const abortController = useRef<AbortController | null>(null);

  // Perform search with caching
  const performSearch = useCallback(async (query: string) => {
    const trimmedQuery = query.trim().toUpperCase();

    if (!trimmedQuery || trimmedQuery.length < 2) {
      setStatus('idle');
      setError(null);
      setPosData(null);
      setSearchTime(null);
      return;
    }

    // Check cache first (instant)
    const cached = getCachedResult(trimmedQuery);
    if (cached !== undefined) {
      setPosData(cached);
      setStatus(cached ? 'success' : 'error');
      setError(cached ? null : 'No orders found (cached)');
      setSearchTime(0);
      return;
    }

    // Cancel previous request
    abortController.current?.abort();
    abortController.current = new AbortController();

    setStatus('loading');
    setError(null);
    setSearchTime(null);

    const startTime = performance.now();

    try {
      const response = await axios.get<{ orders: PosOrderData[] }>('/api/pos/find-laundry-orders', {
        params: { search: trimmedQuery },
        signal: abortController.current.signal,
        timeout: 8000, // 8 second timeout
      });

      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      setSearchTime(duration);

      if (response.data.orders && response.data.orders.length > 0) {
        const result = response.data.orders[0];
        setPosData(result);
        setCachedResult(trimmedQuery, result);
        setStatus('success');
      } else {
        setError('No orders found');
        setCachedResult(trimmedQuery, null);
        setStatus('error');
      }
    } catch (err: any) {
      if (err.code === 'ERR_CANCELED') return;

      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      setSearchTime(duration);

      const errorMsg = err.response?.data?.error || err.message || 'Failed to connect to POS system';
      setError(errorMsg);
      setCachedResult(trimmedQuery, null);
      setStatus('error');
    }
  }, []);

  // Debounce search input (300ms)
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Auto-search after debounce
    debounceTimer.current = setTimeout(() => {
      void performSearch(value);
    }, 300);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      void performSearch(searchQuery);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      abortController.current?.abort();
    };
  }, []);

  const isConnected = status === 'success';
  const hasError = status === 'error';

  return (
    <div className="min-h-full overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-5 sm:space-y-6">
      {/* Header Section */}
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
              Fast search with caching. Just start typing - automatic search after 300ms.
            </p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
            isConnected
              ? 'bg-green-500/20 text-green-100'
              : hasError
              ? 'bg-red-500/20 text-red-100'
              : 'bg-white/10 text-blue-100'
          }`}>
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
                <div className="w-4 h-4 rounded-full bg-white/30 animate-pulse" />
                <span className="text-sm font-semibold">Ready</span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Search Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
        <label htmlFor="search" className="block text-sm font-semibold text-slate-700 mb-3">
          Search Order
        </label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              id="search"
              type="text"
              placeholder="Order number, invoice, or phone..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white text-slate-900 placeholder:text-slate-500"
              autoFocus
            />
            {searchQuery && status === 'loading' && (
              <Loader2 size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-blue-600" />
            )}
          </div>
          <button
            onClick={() => void performSearch(searchQuery)}
            disabled={status === 'loading' || !searchQuery.trim()}
            className="px-6 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors whitespace-nowrap"
          >
            <Search size={18} />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
        {searchTime !== null && status !== 'loading' && (
          <p className="text-xs text-slate-500 mt-2">
            {status === 'success' && searchTime === 0 && '⚡ Instant (cached)'}
            {status === 'success' && searchTime > 0 && `✓ Loaded in ${searchTime}ms`}
            {status === 'error' && `✗ Search took ${searchTime}ms`}
          </p>
        )}
      </div>

      {/* Error State */}
      {hasError && error && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-4 space-y-2">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold text-red-900">Search Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success State */}
      {isConnected && posData && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-green-300 bg-green-50 p-4 flex items-center gap-3">
            <CheckCircle2 className="text-green-600 flex-shrink-0" size={24} />
            <div>
              <h3 className="font-semibold text-green-900">Order Found</h3>
              <p className="text-sm text-green-700">Order #{posData.order_no}</p>
            </div>
          </div>

          {/* Order Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Order Info */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wide">Order Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Order #</span>
                  <span className="font-semibold text-slate-900">{posData.order_no}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Invoice #</span>
                  <span className="font-semibold text-slate-900">{posData.invoice_no}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Branch</span>
                  <span className="font-semibold text-slate-900">{posData.branch}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Type</span>
                  <span className="font-semibold text-slate-900">{posData.delivery_type}</span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wide">Customer</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Name</span>
                  <span className="font-semibold text-slate-900">{posData.customer_name}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Phone</span>
                  <span className="font-semibold text-slate-900">{posData.customer_phone}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Created</span>
                  <span className="font-semibold text-slate-900">
                    {new Date(posData.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Invoice Date</span>
                  <span className="font-semibold text-slate-900">
                    {new Date(posData.invoice_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Financials */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wide">Financials</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Total</span>
                  <span className="font-semibold text-slate-900">${posData.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Paid</span>
                  <span className="font-semibold text-green-600">${posData.paid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Balance</span>
                  <span className={`font-semibold ${posData.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${posData.balance.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Status Flags */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wide">Status</h3>
              {posData.status_flags && posData.status_flags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {posData.status_flags.map((flag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-semibold"
                    >
                      {flag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-600">No status flags</p>
              )}
            </div>
          </div>

          {/* Notes */}
          {posData.notes && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900 mb-2 text-sm uppercase tracking-wide">Notes</h3>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{posData.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {status === 'idle' && !posData && (
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-8 text-center">
          <div className="text-slate-300 mb-4">
            <Search size={56} className="mx-auto" />
          </div>
          <h3 className="font-semibold text-slate-700 mb-2">Ready to Search</h3>
          <p className="text-sm text-slate-600 mb-4">
            Enter an order number, invoice, or customer phone
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold">
            💡 Tip: Results are cached for 60 seconds
          </div>
        </div>
      )}
    </div>
  );
}
