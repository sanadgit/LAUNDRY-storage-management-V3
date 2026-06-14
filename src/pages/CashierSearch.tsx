import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Crosshair, Loader2, RotateCcw, ScanLine, Search, X } from 'lucide-react';
import { useStore, type Blanket, type Log } from '../store/useStore';
import { extractTicketNumberFromScan } from '../utils/barcode';
import { getScannerSupportMessage, startCameraBarcodeScanner } from '../utils/cameraScanner';

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
  order_status: string;
  source_orders_id: string;
  source_invoice_id: string;
};

type PosConnectResponse = {
  order: PosConnectOrder | null;
  orders: PosConnectOrder[];
  multiple: boolean;
};

type BlanketMatch = Blanket & {
  lastLog?: Log | null;
  lastAtMs: number;
};

type SearchResult = {
  query: string;
  posOrder: PosConnectOrder | null;
  posError: string | null;
};

type CashierOrderStatus = {
  order_no: string;
  found: boolean;
  storage: {
    total: number;
    stored_count: number;
    picked_count: number;
    retrieved_count: number;
    rows: Blanket[];
    last_picked_at: string | null;
  };
  packing: {
    packed: number;
    total_blankets: number;
    remaining: number | null;
    status: 'not_packed' | 'partially_packed' | 'fully_packed';
    last_at: string | null;
    last_by: string | null;
    entries: Array<{
      id: number;
      blanket_index: number;
      total_blankets: number;
      action: string;
      status: string;
      packed_by: string | null;
      created_at: string;
    }>;
  };
  logs: Log[];
};

const NUMBER_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
const LETTER_KEYS = [
  { key: 'A', className: 'bg-rose-600 hover:bg-rose-500 text-white' },
  { key: 'B', className: 'bg-blue-600 hover:bg-blue-500 text-white' },
  { key: 'Z', className: 'bg-emerald-600 hover:bg-emerald-500 text-white' },
  { key: 'M', className: 'bg-amber-500 hover:bg-amber-400 text-slate-950' },
];

const normalizeOrderKey = (value: unknown) => String(value ?? '').trim().toUpperCase();

const formatDateTime = (value: string | null | undefined) => {
  const raw = String(value ?? '').trim();
  if (!raw) return '-';
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toLocaleString();
};

export default function CashierSearchPage() {
  const navigate = useNavigate();
  const {
    blankets,
    logs,
    stores,
    fetchBlankets,
    fetchLogs,
    markAsPicked,
    setSearchQuery,
    setSelectedStore,
    setSelectedGridCell,
    setViewMode,
    currentUser,
  } = useStore();
  const [input, setInput] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [orderStatus, setOrderStatus] = useState<CashierOrderStatus | null>(null);
  const [searchBusy, setSearchBusy] = useState(false);
  const [pickBusy, setPickBusy] = useState(false);
  const [slotIndex, setSlotIndex] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [mobileKeypadHidden, setMobileKeypadHidden] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [scannerPreview, setScannerPreview] = useState<{ raw: string; extracted: string } | null>(null);
  const [pendingPickScanBlanket, setPendingPickScanBlanket] = useState<Blanket | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pendingPickScanBlanketRef = useRef<Blanket | null>(null);

  useEffect(() => {
    void fetchBlankets();
    void fetchLogs(1000);
  }, [fetchBlankets, fetchLogs]);

  useEffect(() => {
    pendingPickScanBlanketRef.current = pendingPickScanBlanket;
  }, [pendingPickScanBlanket]);

  const latestLogBySlot = useMemo(() => {
    const map = new Map<string, Log>();
    for (const log of logs) {
      const key = `${String(log.blanket_number ?? '').toUpperCase()}|${String(log.store ?? '').toUpperCase()}|${log.row}|${log.column}`;
      if (!map.has(key)) map.set(key, log);
    }
    return map;
  }, [logs]);

  const normalizedSubmitted = normalizeOrderKey(submittedQuery || result?.query || input);

  const exactMatches = useMemo(() => {
    if (!normalizedSubmitted) return [] as BlanketMatch[];
    const list: BlanketMatch[] = [];
    for (const blanket of blankets) {
      if (normalizeOrderKey(blanket.blanket_number) !== normalizedSubmitted) continue;
      const key = `${normalizeOrderKey(blanket.blanket_number)}|${normalizeOrderKey(blanket.store)}|${blanket.row}|${blanket.column}`;
      const lastLog = latestLogBySlot.get(key) ?? null;
      const lastAt = lastLog?.timestamp ?? blanket.created_at;
      list.push({
        ...blanket,
        lastLog,
        lastAtMs: Date.parse(lastAt) || 0,
      });
    }
    list.sort((a, b) => b.lastAtMs - a.lastAtMs);
    return list;
  }, [blankets, latestLogBySlot, normalizedSubmitted]);

  const storedMatches = useMemo(() => exactMatches.filter((item) => item.status === 'stored'), [exactMatches]);
  const currentStored = storedMatches[Math.min(slotIndex, Math.max(0, storedMatches.length - 1))] ?? null;

  const packingLogs = useMemo(
    () =>
      logs
        .filter(
          (log) =>
            normalizeOrderKey(log.blanket_number) === normalizedSubmitted &&
            String(log.store ?? '').toLowerCase() === 'blanket_packing' &&
            String(log.action ?? '').toLowerCase() === 'packed'
        )
        .slice()
        .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)),
    [logs, normalizedSubmitted]
  );

  useEffect(() => {
    if (slotIndex > storedMatches.length - 1) {
      setSlotIndex(Math.max(0, storedMatches.length - 1));
    }
  }, [slotIndex, storedMatches.length]);

  const addKey = (key: string) => {
    setInput((prev) => `${prev}${key}`.toUpperCase());
    setMessage(null);
  };

  const clearSearch = () => {
    setInput('');
    setSubmittedQuery('');
    setResult(null);
    setOrderStatus(null);
    setSlotIndex(0);
    setMobileKeypadHidden(false);
    setMessage(null);
  };

  const normalizeTicketForCompare = (value: string) => String(value ?? '').trim().toLowerCase();

  const runSearch = async () => {
    const query = normalizeOrderKey(input);
    if (!query) {
      setMessage('اكتب رقم الطلب أولاً.');
      return;
    }

    setSubmittedQuery(query);
    setOrderStatus(null);
    setSlotIndex(0);
    setMobileKeypadHidden(false);
    setMessage(null);
    setSearchBusy(true);

    const hasLocalMatch = blankets.some((item) => normalizeOrderKey(item.blanket_number) === query);
    const hasStoredMatch = blankets.some((item) => normalizeOrderKey(item.blanket_number) === query && item.status === 'stored');
    const statusPromise = axios
      .get<CashierOrderStatus>(`/api/cashier/order-status/${encodeURIComponent(query)}`)
      .then((response) => response.data)
      .catch(() => null);

    if (hasStoredMatch) {
      setOrderStatus(await statusPromise);
      setResult({ query, posOrder: null, posError: null });
      setMobileKeypadHidden(true);
      setSearchBusy(false);
      return;
    }

    try {
      const [posResponse, statusResponse] = await Promise.all([
        axios.get<PosConnectResponse>('/api/pos/connect-order', {
          params: { q: query, fast: '0', deep: '1' },
        }),
        statusPromise,
      ]);
      const order =
        posResponse.data.order ??
        (Array.isArray(posResponse.data.orders) && posResponse.data.orders.length === 1 ? posResponse.data.orders[0] : null);
      setOrderStatus(statusResponse);
      setResult({ query, posOrder: order, posError: null });
      setMobileKeypadHidden(Boolean(order) || hasLocalMatch || Boolean(statusResponse?.found));
    } catch (error: any) {
      const statusResponse = await statusPromise;
      setOrderStatus(statusResponse);
      setResult({
        query,
        posOrder: null,
        posError: error?.response?.data?.error || error?.message || 'POS lookup failed.',
      });
      setMobileKeypadHidden(hasLocalMatch || Boolean(statusResponse?.found));
    } finally {
      setSearchBusy(false);
    }
  };

  const completePick = async (blanket: Blanket, pickScanValue?: string) => {
    try {
      setPickBusy(true);
      setMessage(null);
      await markAsPicked(blanket, { pickScanValue });
      await fetchBlankets();
      await fetchLogs(1000);
      if (storedMatches.length <= 1) {
        setInput('');
        setSubmittedQuery('');
        setResult(null);
        setOrderStatus(null);
        setSlotIndex(0);
        setMobileKeypadHidden(false);
        setMessage(`تم تسليم ${blanket.blanket_number}. جاهز للبحث التالي.`);
      } else {
        setMessage(`تم تسليم ${blanket.blanket_number} من ${blanket.store} R${blanket.row} C${blanket.column}.`);
      }
      setPendingPickScanBlanket(null);
      pendingPickScanBlanketRef.current = null;
    } catch (error: any) {
      setMessage(error?.response?.data?.error || error?.message || 'Failed to mark as picked.');
      setMobileKeypadHidden(false);
    } finally {
      setPickBusy(false);
    }
  };

  const handlePick = async () => {
    if (!currentStored) return;
    if (store?.require_pick_scan) {
      setScannerError(null);
      setScannerPreview(null);
      setPendingPickScanBlanket(currentStored);
      pendingPickScanBlanketRef.current = currentStored;
      setScannerOpen(true);
      return;
    }
    await completePick(currentStored);
  };

  const closeScanner = () => {
    setScannerOpen(false);
    setScannerPreview(null);
    setScannerError(null);
    setPendingPickScanBlanket(null);
    pendingPickScanBlanketRef.current = null;
  };

  const showSlot = () => {
    if (!currentStored) return;
    setViewMode('2D');
    setSearchQuery(currentStored.blanket_number);
    setSelectedStore(currentStored.store);
    setSelectedGridCell({ store: currentStored.store, row: currentStored.row, column: currentStored.column });
    navigate('/search');
  };

  useEffect(() => {
    if (!scannerOpen) return;

    let cancelled = false;
    let consumed = false;
    let stopSession: (() => void) | null = null;
    setScannerError(null);
    setScannerPreview(null);

    const start = async () => {
      try {
        const video = videoRef.current;
        if (!video) throw new Error('Scanner video element not ready.');
        const session = await startCameraBarcodeScanner({
          videoElement: video,
          onDetected: async (rawValue) => {
            if (cancelled || consumed) return;
            const rawText = String(rawValue ?? '').trim();
            const extracted = extractTicketNumberFromScan(rawText);
            setScannerPreview((prev) => {
              if (prev && prev.raw === rawText && prev.extracted === extracted) return prev;
              return { raw: rawText, extracted };
            });
            if (!extracted) return;

            const target = pendingPickScanBlanketRef.current;
            if (!target) {
              setScannerError('No pending pick target. Press MARK AS PICKED again.');
              return;
            }
            if (normalizeTicketForCompare(extracted) !== normalizeTicketForCompare(target.blanket_number)) {
              try {
                navigator.vibrate?.([40, 40, 40]);
              } catch {
                // ignore vibration errors
              }
              setScannerError(`Scanned #${extracted} does not match required #${target.blanket_number}.`);
              return;
            }

            consumed = true;
            stopSession?.();
            try {
              navigator.vibrate?.(70);
            } catch {
              // ignore vibration errors
            }
            setScannerOpen(false);
            setScannerError(null);
            await completePick(target, extracted);
          },
          onRuntimeError: (runtimeError) => {
            if (cancelled) return;
            setScannerError(getScannerSupportMessage(runtimeError));
          },
        });

        if (cancelled) {
          session.stop();
          return;
        }
        stopSession = session.stop;
      } catch (error) {
        setScannerError(getScannerSupportMessage(error));
      }
    };

    void start();
    return () => {
      cancelled = true;
      stopSession?.();
    };
  }, [scannerOpen]);

  const hasSubmitted = Boolean(result || submittedQuery);
  const packedCount = orderStatus?.packing.packed ?? packingLogs.length;
  const totalBlankets = orderStatus?.packing.total_blankets ?? 0;
  const pickedCount = orderStatus?.storage.picked_count ?? exactMatches.filter((item) => item.status === 'picked').length;
  const retrievedCount = orderStatus?.storage.retrieved_count ?? exactMatches.filter((item) => item.status === 'retrieved').length;
  const foundSomething =
    storedMatches.length > 0 ||
    exactMatches.length > 0 ||
    Boolean(result?.posOrder) ||
    Boolean(orderStatus?.found) ||
    packedCount > 0 ||
    pickedCount > 0;
  const store = currentStored ? stores.find((item) => item.store_name === currentStored.store) : null;
  const canPick = Boolean(currentStored && currentUser);
  const storageStatusLabel =
    storedMatches.length > 0
      ? `In Store (${storedMatches.length})`
      : pickedCount > 0
        ? `Picked (${pickedCount})`
        : retrievedCount > 0
          ? `Retrieved (${retrievedCount})`
          : exactMatches.length > 0
            ? 'Not in store now'
            : 'No storage record';
  const packingStatusLabel =
    totalBlankets > 0
      ? `${packedCount} / ${totalBlankets} blankets`
      : packedCount > 0
        ? `${packedCount} blankets packed`
        : 'No blanket packing';

  return (
    <div className="min-h-full bg-slate-100 p-4 sm:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl content-center gap-5 pb-20 pt-12 sm:min-h-0 sm:content-start sm:pb-0 sm:pt-0 lg:grid-cols-[minmax(320px,0.42fr)_minmax(0,1fr)]">
        <section className={`${mobileKeypadHidden ? 'hidden lg:block' : ''} rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.25em] text-blue-600">Cashier Search</div>
              <h1 className="text-2xl font-black text-slate-950">Search</h1>
            </div>
            <button
              type="button"
              onClick={clearSearch}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600"
              aria-label="Clear"
            >
              <X size={18} />
            </button>
          </div>

          <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-4">
            <input
              value={input}
              dir="ltr"
              onChange={(event) => setInput(event.target.value.toUpperCase())}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void runSearch();
              }}
              placeholder="ORDER NUMBER"
              className="w-full border-0 bg-transparent text-center font-mono text-3xl font-black tracking-[0.2em] text-slate-950 outline-none"
            />
          </div>

          <div className="mt-4 grid grid-cols-5 gap-2">
            {NUMBER_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => addKey(key)}
                className="flex aspect-square items-center justify-center rounded-2xl bg-slate-800 text-2xl font-black text-white shadow-sm transition hover:bg-slate-700 active:scale-95"
              >
                {key}
              </button>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2">
            {LETTER_KEYS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => addKey(item.key)}
                className={`flex min-h-16 items-center justify-center rounded-2xl text-2xl font-black shadow-sm transition active:scale-95 ${item.className}`}
              >
                {item.key}
              </button>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setInput((prev) => prev.slice(0, -1))}
              className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white text-sm font-black text-slate-700"
            >
              <RotateCcw size={17} />
              حذف
            </button>
            <button
              type="button"
              onClick={() => void runSearch()}
              disabled={searchBusy}
              className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-blue-700 text-sm font-black text-white disabled:opacity-60"
            >
              {searchBusy ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              بحث
            </button>
          </div>

          {message && !mobileKeypadHidden && (
            <div className="mt-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-center text-sm font-bold text-blue-700">
              {message}
            </div>
          )}
        </section>

        <section className={`${!hasSubmitted ? 'hidden lg:block' : ''} min-h-[520px] rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6`}>
          {!hasSubmitted ? (
            <div className="flex h-full min-h-[480px] flex-col items-center justify-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
                <Search size={38} />
              </div>
              <div className="mt-4 text-2xl font-black text-slate-900">اكتب رقم الطلب واضغط بحث</div>
              <div className="mt-2 text-sm font-bold text-slate-500">الصفحة تبحث في الاستور ثم POS وتعرض الإجراء المناسب.</div>
            </div>
          ) : searchBusy ? (
            <div className="flex h-full min-h-[480px] items-center justify-center gap-3 text-lg font-black text-slate-700">
              <Loader2 className="animate-spin text-blue-700" />
              جاري البحث...
            </div>
          ) : storedMatches.length > 0 && currentStored ? (
            <div className="mx-auto max-w-2xl space-y-5">
              <div className="rounded-3xl bg-slate-950 p-6 text-center text-white">
                <div className="text-xs font-black uppercase tracking-[0.25em] text-blue-300">
                  Pick {slotIndex + 1} of {storedMatches.length}
                </div>
                <div dir="ltr" className="mt-2 font-mono text-4xl font-black">#{currentStored.blanket_number}</div>
                <div className="mt-5 grid grid-cols-2 gap-3 text-left">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Store</div>
                    <div className="mt-1 text-xl font-black text-blue-200">{currentStored.store}</div>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Slot</div>
                    <div className="mt-1 text-xl font-black">R{currentStored.row} : C{currentStored.column}</div>
                  </div>
                </div>
                {store?.require_pick_scan && (
                  <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-bold text-amber-100">
                    هذا الاستور يحتاج اسكان نفس رقم الطلب قبل تأكيد الاستلام.
                  </div>
                )}
              </div>

              {message && (
                <div className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-center text-sm font-bold text-blue-700">
                  {message}
                </div>
              )}

              {(packedCount > 0 || pickedCount > 0) && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Blanket Packing</div>
                    <div className="mt-1 text-xl font-black text-emerald-800">{packingStatusLabel}</div>
                    {orderStatus?.packing.last_at && (
                      <div className="mt-1 text-xs font-bold text-emerald-700">{formatDateTime(orderStatus.packing.last_at)}</div>
                    )}
                  </div>
                  <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-blue-500">Picked</div>
                    <div className="mt-1 text-xl font-black text-blue-800">{pickedCount > 0 ? `${pickedCount} picked` : 'Not picked'}</div>
                    {orderStatus?.storage.last_picked_at && (
                      <div className="mt-1 text-xs font-bold text-blue-700">{formatDateTime(orderStatus.storage.last_picked_at)}</div>
                    )}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => void handlePick()}
                disabled={!canPick || pickBusy}
                className="flex min-h-20 w-full items-center justify-center gap-3 rounded-3xl bg-emerald-600 text-xl font-black text-white shadow-lg shadow-emerald-700/20 disabled:bg-slate-300 disabled:shadow-none"
              >
                {pickBusy ? <Loader2 size={28} className="animate-spin" /> : store?.require_pick_scan ? <ScanLine size={28} /> : <CheckCircle2 size={28} />}
                {store?.require_pick_scan ? 'SCAN & MARK AS PICKED' : 'MARK AS PICKED'}
              </button>

              <button
                type="button"
                onClick={showSlot}
                className="flex min-h-16 w-full items-center justify-center gap-3 rounded-3xl bg-slate-900 text-base font-black text-white"
              >
                <Crosshair size={22} />
                SHOW SLOT (2D)
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={slotIndex <= 0}
                  onClick={() => setSlotIndex((prev) => Math.max(0, prev - 1))}
                  className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white font-black text-slate-800 disabled:opacity-40"
                >
                  <ChevronLeft size={22} />
                  Prev
                </button>
                <button
                  type="button"
                  disabled={slotIndex >= storedMatches.length - 1}
                  onClick={() => setSlotIndex((prev) => Math.min(storedMatches.length - 1, prev + 1))}
                  className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white font-black text-slate-800 disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={22} />
                </button>
              </div>

              <button
                type="button"
                onClick={clearSearch}
                className="flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-300 bg-white text-sm font-black text-slate-700 lg:hidden"
              >
                بحث جديد
              </button>
            </div>
          ) : foundSomething ? (
            <div className="mx-auto max-w-2xl space-y-5">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <div className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">Order Status</div>
                <div dir="ltr" className="mt-2 font-mono text-4xl font-black text-slate-950">#{normalizedSubmitted}</div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white p-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Storage</div>
                    <div className="mt-1 text-lg font-black text-slate-900">
                      {storageStatusLabel}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white p-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Blanket Packing</div>
                    <div className="mt-1 text-lg font-black text-emerald-700">{packingStatusLabel}</div>
                  </div>
                  <div className="rounded-2xl bg-white p-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Picked</div>
                    <div className="mt-1 text-lg font-black text-blue-700">{pickedCount > 0 ? `${pickedCount} picked` : '-'}</div>
                  </div>
                  <div className="rounded-2xl bg-white p-4">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">POS</div>
                    <div className="mt-1 text-lg font-black text-blue-700">{result?.posOrder?.order_status || '-'}</div>
                  </div>
                </div>
                {result?.posOrder && (
                  <div className="mt-4 rounded-2xl bg-white p-4 text-sm font-bold text-slate-700">
                    <div>Customer: {result.posOrder.customer_name || '-'}</div>
                    <div>Delivery: {result.posOrder.delivery_date || '-'} {result.posOrder.delivery_time || ''}</div>
                    <div>Remark: {result.posOrder.remark || '-'}</div>
                  </div>
                )}
                {packingLogs.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
                    آخر تعبئة بطانيات: {formatDateTime(packingLogs[0].timestamp)} · عدد أحداث التعبئة: {packingLogs.length}
                  </div>
                )}
                {orderStatus?.packing.last_at && (
                  <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
                    تعبئة البطاطين: {packingStatusLabel} · آخر تحديث: {formatDateTime(orderStatus.packing.last_at)}
                    {orderStatus.packing.last_by ? ` · بواسطة ${orderStatus.packing.last_by}` : ''}
                  </div>
                )}
                {orderStatus?.storage.last_picked_at && (
                  <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-bold text-blue-800">
                    تم الاستلام Picked: {formatDateTime(orderStatus.storage.last_picked_at)}
                  </div>
                )}
                {result?.posError && (
                  <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
                    POS: {result.posError}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={clearSearch}
                className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-slate-900 text-sm font-black text-white lg:hidden"
              >
                بحث جديد
              </button>
            </div>
          ) : (
            <div className="flex h-full min-h-[480px] flex-col items-center justify-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 text-rose-600">
                <AlertCircle size={38} />
              </div>
              <div className="mt-4 text-2xl font-black text-slate-900">لم يتم العثور على الطلب</div>
              <div dir="ltr" className="mt-2 font-mono text-lg font-black text-slate-500">#{normalizedSubmitted}</div>
            </div>
          )}
        </section>
      </div>

      {scannerOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/90 p-4">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 p-4">
              <div>
                <div className="text-sm font-black uppercase tracking-widest text-slate-200">Picked verification</div>
                <div className="text-xs font-bold text-slate-400">
                  Scan the same order number: #{pendingPickScanBlanket?.blanket_number ?? ''}
                </div>
              </div>
              <button
                type="button"
                onClick={closeScanner}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-200"
                aria-label="Close scanner"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <div className="overflow-hidden rounded-2xl border border-slate-700 bg-black">
                <video ref={videoRef} className="h-[320px] w-full object-cover" muted playsInline />
              </div>
              {scannerError ? (
                <div className="mt-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-100">
                  {scannerError}
                </div>
              ) : (
                <div className="mt-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-100">
                  Scanning... it will mark as picked only when the scanned code matches exactly.
                </div>
              )}
              {scannerPreview && (
                <div className="mt-3 rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-xs font-bold text-slate-300">
                  <div>Raw: <span className="text-slate-100">{scannerPreview.raw || '-'}</span></div>
                  <div>Extracted: <span className="text-slate-100">{scannerPreview.extracted || '-'}</span></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
