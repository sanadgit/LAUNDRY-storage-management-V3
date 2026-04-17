import { useState, useEffect, useMemo, useDeferredValue, useRef } from 'react';
import { useStore, type Blanket, type Log } from '../store/useStore';
import { Search, Map as MapIcon, Box, CheckCircle2, ChevronRight, ChevronLeft, Target, Package, Crosshair, ScanLine, X } from 'lucide-react';
import Grid2D from '../components/Grid2D';
import Warehouse3D from '../components/Warehouse3D';
import { useViewer3D } from '../context/Viewer3DSettings';
import { getVirtualGridCellWorldPoint } from '../utils/virtualGridWorldPoint';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function SearchPage() {
  const { 
    blankets, 
    logs,
    stores, 
    searchQuery, 
    setSearchQuery, 
    retrievalMode, 
    setRetrievalMode, 
    retrievalIndex, 
    setRetrievalIndex,
    viewMode,
    setViewMode,
    markAsPicked,
    selectedStore,
    setSelectedStore,
    gridFace,
    setGridFace,
    selectedGridCell,
    setSelectedGridCell,
    currentUser,
  } = useStore();

  const { requestFocusCellWorld } = useViewer3D();

  const [searchPanelOpen, setSearchPanelOpen] = useState(true);
  const [pickError, setPickError] = useState<string | null>(null);
  const [queryInput, setQueryInput] = useState(searchQuery);
  const deferredQuery = useDeferredValue(queryInput);
  const suggestionBlurTimeout = useRef<number | null>(null);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scannerRafRef = useRef<number | null>(null);

  useEffect(() => {
    setQueryInput(searchQuery);
  }, [searchQuery]);

  const extractBlanketNumberFromScan = (raw: string) => {
    const value = (raw ?? '').trim();
    if (!value) return '';
    try {
      const url = new URL(value);
      const fromQuery =
        url.searchParams.get('blanket') ||
        url.searchParams.get('blanket_number') ||
        url.searchParams.get('n') ||
        url.searchParams.get('number');
      if (fromQuery) return fromQuery.trim();
    } catch {
      // not a URL; treat as a raw number
    }
    return value.replace(/^#/, '').split(/\s+/)[0].trim();
  };

  useEffect(() => {
    if (!scannerOpen) return;

    let cancelled = false;
    setScannerError(null);

    const stop = () => {
      if (scannerRafRef.current) {
        window.cancelAnimationFrame(scannerRafRef.current);
        scannerRafRef.current = null;
      }
      const stream = mediaStreamRef.current;
      mediaStreamRef.current = null;
      if (stream) {
        for (const track of stream.getTracks()) track.stop();
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    const start = async () => {
      try {
        const hasBarcodeDetector = typeof (globalThis as any).BarcodeDetector !== 'undefined';
        if (!hasBarcodeDetector) {
          throw new Error('Scanner not supported on this device/browser (BarcodeDetector missing).');
        }

        const detector = new (globalThis as any).BarcodeDetector({
          formats: ['qr_code', 'code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e'],
        });

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });

        if (cancelled) {
          for (const track of stream.getTracks()) track.stop();
          return;
        }

        mediaStreamRef.current = stream;

        const video = videoRef.current;
        if (!video) throw new Error('Scanner video element not ready.');

        video.srcObject = stream;
        await video.play();

        const tick = async () => {
          if (cancelled || !videoRef.current) return;
          try {
            const results = await detector.detect(videoRef.current);
            if (Array.isArray(results) && results.length > 0) {
              const rawValue = results[0]?.rawValue ?? '';
              const extracted = extractBlanketNumberFromScan(String(rawValue));
              if (extracted) {
                try {
                  navigator.vibrate?.(50);
                } catch {
                  // ignore
                }
                setQueryInput(extracted);
                setSearchQuery(extracted);
                setSearchPanelOpen(true);
                setScannerOpen(false);
                return;
              }
            }
          } catch (error) {
            // ignore single-frame detect failures
          }
          scannerRafRef.current = window.requestAnimationFrame(tick);
        };

        scannerRafRef.current = window.requestAnimationFrame(tick);
      } catch (error: any) {
        const message = typeof error?.message === 'string' ? error.message : 'Failed to start scanner.';
        setScannerError(message);
      }
    };

    start();
    return () => {
      cancelled = true;
      stop();
    };
  }, [scannerOpen, setSearchQuery]);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      if (searchQuery === queryInput) return;
      setSearchQuery(queryInput);
    }, 160);
    return () => window.clearTimeout(handle);
  }, [queryInput, searchQuery, setSearchQuery]);

  const normalizedQuery = deferredQuery.trim();
  const normalizedQueryLower = normalizedQuery.toLowerCase();
  const hasQuery = normalizedQuery.length > 0;

  const latestLogBySlotKey = useMemo(() => {
    const map = new Map<string, Log>();
    for (const log of logs) {
      if (!log.blanket_number || !log.store) continue;
      const key = `${log.blanket_number.toLowerCase()}|${String(log.store).toLowerCase()}|${log.row}|${log.column}`;
      if (!map.has(key)) map.set(key, log);
    }
    return map;
  }, [logs]);

  const latestLogByNumber = useMemo(() => {
    const map = new Map<string, Log>();
    for (const log of logs) {
      const num = log.blanket_number?.toLowerCase();
      if (!num) continue;
      if (!map.has(num)) map.set(num, log);
    }
    return map;
  }, [logs]);

  type NumberSuggestion = {
    lower: string;
    number: string;
    storedCount: number;
    totalCount: number;
    lastStatus?: string;
    lastAt?: string;
  };

  const numberSuggestions = useMemo(() => {
    const map = new Map<string, NumberSuggestion>();
    for (const b of blankets) {
      const lower = b.blanket_number.toLowerCase();
      const existing = map.get(lower);
      if (existing) {
        existing.totalCount += 1;
        if (b.status === 'stored') existing.storedCount += 1;
      } else {
        map.set(lower, {
          lower,
          number: b.blanket_number,
          storedCount: b.status === 'stored' ? 1 : 0,
          totalCount: 1,
        });
      }
    }

    for (const [lower, entry] of map.entries()) {
      const last = latestLogByNumber.get(lower);
      if (last) {
        entry.lastStatus = last.status ?? entry.lastStatus;
        entry.lastAt = last.timestamp ?? entry.lastAt;
      }
    }

    return Array.from(map.values());
  }, [blankets, latestLogByNumber]);

  const suggestions = useMemo(() => {
    if (!hasQuery) return [];
    const q = normalizedQueryLower;
    const matches = numberSuggestions.filter((entry) => entry.lower.includes(q));
    matches.sort((a, b) => {
      const aStarts = a.lower.startsWith(q) ? 1 : 0;
      const bStarts = b.lower.startsWith(q) ? 1 : 0;
      if (aStarts !== bStarts) return bStarts - aStarts;

      const aStored = a.storedCount;
      const bStored = b.storedCount;
      if (aStored !== bStored) return bStored - aStored;

      const aTime = a.lastAt ? Date.parse(a.lastAt) : 0;
      const bTime = b.lastAt ? Date.parse(b.lastAt) : 0;
      if (aTime !== bTime) return bTime - aTime;
      return a.lower.localeCompare(b.lower);
    });
    return matches.slice(0, 10);
  }, [hasQuery, normalizedQueryLower, numberSuggestions]);

  type BlanketMatch = Blanket & { lastLog?: Log | null; lastAtMs: number; lastStatus?: string };

  const exactMatches = useMemo(() => {
    if (!hasQuery) return [] as BlanketMatch[];
    const list: BlanketMatch[] = [];
    for (const blanket of blankets) {
      if (blanket.blanket_number.toLowerCase() !== normalizedQueryLower) continue;
      const key = `${blanket.blanket_number.toLowerCase()}|${blanket.store.toLowerCase()}|${blanket.row}|${blanket.column}`;
      const lastLog = latestLogBySlotKey.get(key) ?? null;
      const lastAt = lastLog?.timestamp ?? blanket.created_at;
      const lastAtMs = lastAt ? Date.parse(lastAt) || 0 : 0;
      list.push({
        ...blanket,
        lastLog,
        lastAtMs,
        lastStatus: (lastLog?.status as any) ?? blanket.status,
      });
    }
    list.sort((a, b) => b.lastAtMs - a.lastAtMs);
    return list;
  }, [blankets, hasQuery, latestLogBySlotKey, normalizedQueryLower]);

  const storedMatches = useMemo(
    () => exactMatches.filter((b) => b.status === 'stored'),
    [exactMatches]
  );

  const storedIndexById = useMemo(() => {
    const map = new Map<number, number>();
    storedMatches.forEach((b, index) => map.set(b.id, index));
    return map;
  }, [storedMatches]);

  const currentResult = storedMatches[retrievalIndex];

  useEffect(() => {
    if (storedMatches.length > 1) {
      setRetrievalMode(true);
    } else {
      setRetrievalMode(false);
      setRetrievalIndex(0);
    }
    
    if (!hasQuery) {
      setSearchPanelOpen(false);
      return;
    }
    setSearchPanelOpen(true);

    if (storedMatches.length > 0) {
      setSelectedStore(storedMatches[0].store);
    }
  }, [storedMatches.length, hasQuery, setRetrievalMode, setRetrievalIndex, setSelectedStore]);

  useEffect(() => {
    setRetrievalIndex(0);
  }, [normalizedQueryLower, setRetrievalIndex]);

  useEffect(() => {
    if (currentResult) {
      setSelectedStore(currentResult.store);
    }
  }, [retrievalIndex, currentResult, setSelectedStore]);

  const zoomToBlanket = (blanket: Blanket) => {
    const store = stores.find((s) => s.store_name === blanket.store);
    if (!store) return;
    setViewMode('3D');
    setSelectedStore(blanket.store);
    setSelectedGridCell({ store: blanket.store, row: blanket.row, column: blanket.column });
    const point = getVirtualGridCellWorldPoint({
      store,
      row: blanket.row,
      column: blanket.column,
      gridFace,
    });
    requestFocusCellWorld(point);
  };

  const handleMarkAsPicked = async () => {
    if (!currentResult) return;
    setPickError(null);
    try {
      const payload: Blanket = {
        id: currentResult.id,
        blanket_number: currentResult.blanket_number,
        store: currentResult.store,
        row: currentResult.row,
        column: currentResult.column,
        status: currentResult.status,
        created_at: currentResult.created_at,
      };
      await markAsPicked(payload);
    } catch (error: any) {
      const message = typeof error?.message === 'string' ? error.message : 'Failed to mark as picked.';
      console.error('markAsPicked failed:', error);
      setPickError(message);
      return;
    }
    
    if (retrievalIndex < storedMatches.length - 1) {
      setRetrievalIndex(retrievalIndex + 1);
    } else {
      setRetrievalMode(false);
      setRetrievalIndex(0);
      setSearchQuery('');
      setQueryInput('');
    }
  };

  const handleSelectSuggestion = (value: string) => {
    setQueryInput(value);
    setSearchQuery(value);
    setSuggestionsOpen(false);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white overflow-hidden">
      {/* Header / Search Bar */}
      <div className="p-4 sm:p-6 bg-slate-900 border-b border-slate-800 flex flex-col md:flex-row items-center gap-4 sm:gap-6 z-20">
        <div className="relative flex-1 max-w-2xl w-full">
          <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-500" size={22} />
          <input 
            type="text" 
            placeholder="Enter Blanket Number to Retrieve..." 
            className="w-full pl-12 sm:pl-14 pr-4 sm:pr-6 py-3.5 sm:py-5 bg-slate-800 border border-slate-700 rounded-3xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-base sm:text-xl font-bold placeholder:text-slate-600"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            onFocus={() => {
              if (suggestionBlurTimeout.current) window.clearTimeout(suggestionBlurTimeout.current);
              setSuggestionsOpen(true);
            }}
            onBlur={() => {
              suggestionBlurTimeout.current = window.setTimeout(() => setSuggestionsOpen(false), 130);
            }}
          />
          <div className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {queryInput && (
              <button 
                type="button"
                onClick={() => {
                  setQueryInput('');
                  setSearchQuery('');
                }}
                className="p-2 hover:bg-slate-700 rounded-xl text-slate-400"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => setScannerOpen(true)}
              className="p-2 hover:bg-slate-700 rounded-xl text-slate-200 bg-slate-800 border border-slate-700"
              title="Scanner mode"
            >
              <ScanLine size={18} />
            </button>
          </div>

          {suggestionsOpen && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-3 rounded-3xl border border-slate-700 bg-slate-900/95 backdrop-blur-md shadow-2xl overflow-hidden z-30">
              <div className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                Suggestions
              </div>
              <div className="max-h-72 overflow-auto">
                {suggestions.map((s) => (
                  <button
                    key={`sugg-${s.lower}`}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectSuggestion(s.number)}
                    className="w-full px-5 py-4 flex items-center justify-between gap-4 hover:bg-slate-800 text-left"
                  >
                    <div className="min-w-0">
                      <div className="text-base font-black text-white truncate">#{s.number}</div>
                      <div className="text-xs text-slate-500 font-bold">
                        Stored: {s.storedCount} · Total: {s.totalCount}
                        {s.lastStatus ? ` · Last: ${s.lastStatus}` : ''}
                      </div>
                    </div>
                    <span className="shrink-0 rounded-2xl bg-slate-800 border border-slate-700 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-200">
                      Select
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        {currentUser ? (
          <div className="rounded-3xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-200">
            Signed in as <span className="font-bold text-white">{currentUser.username}</span> ({currentUser.role})
          </div>
        ) : (
          <div className="rounded-3xl border border-rose-600 bg-rose-950/60 px-4 py-3 text-sm text-rose-200">
            Select a user from the sidebar before picking blankets.
          </div>
        )}

        <div className="flex bg-slate-800 p-1.5 rounded-2xl border border-slate-700 shadow-inner w-full md:w-auto">
          <button 
            onClick={() => setViewMode('2D')}
            className={cn(
              "flex-1 md:flex-none justify-center flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-bold transition-all",
              viewMode === '2D' ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            )}
          >
            <MapIcon size={20} />
            2D View
          </button>
          <button 
            onClick={() => setViewMode('3D')}
            className={cn(
              "flex-1 md:flex-none justify-center flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-bold transition-all",
              viewMode === '3D' ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            )}
          >
            <Box size={20} />
            3D View
          </button>
        </div>
      </div>

      {scannerOpen && (
        <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex flex-col">
          <div className="p-4 sm:p-6 flex items-center justify-between gap-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center">
                <ScanLine size={22} />
              </div>
              <div>
                <div className="text-sm font-black uppercase tracking-widest text-slate-200">Scanner mode</div>
                <div className="text-xs text-slate-400 font-bold">Point the camera at the sticker QR / barcode</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setScannerOpen(false)}
              className="rounded-2xl bg-slate-800 border border-slate-700 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-200 hover:bg-slate-700 flex items-center gap-2"
            >
              <X size={18} />
              Close
            </button>
          </div>

          <div className="flex-1 p-4 sm:p-6 flex flex-col items-center justify-center gap-4">
            <div className="w-full max-w-lg aspect-[3/4] sm:aspect-video rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 relative">
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-56 h-56 sm:w-72 sm:h-72 border-2 border-emerald-400/80 rounded-3xl shadow-[0_0_0_999px_rgba(2,6,23,0.55)]" />
              </div>
            </div>

            {scannerError ? (
              <div className="max-w-lg w-full rounded-3xl border border-rose-700 bg-rose-950/60 px-5 py-4 text-rose-200 text-sm font-bold">
                {scannerError}
                <div className="mt-2 text-xs text-rose-200/80 font-semibold">
                  Tip: Use Chrome on Android, and allow camera permission.
                </div>
              </div>
            ) : (
              <div className="max-w-lg w-full rounded-3xl border border-slate-800 bg-slate-900/60 px-5 py-4 text-slate-200 text-sm font-bold">
                Scanning… it will auto-search when the code is detected.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Left Sidebar: Results & Guided Retrieval */}
        <div className={cn(
          "bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-500 z-20 absolute sm:relative inset-y-0 left-0 w-full sm:w-96",
          hasQuery && searchPanelOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {hasQuery && (
            <div className="flex items-center justify-between gap-3 px-6 sm:px-8 pt-6 sm:pt-8 pb-4">
              <div className="flex items-center gap-3 text-blue-400">
                <Target size={28} />
                <h2 className="text-2xl font-black uppercase tracking-tighter">Search</h2>
              </div>
              <button
                type="button"
                onClick={() => setSearchPanelOpen(false)}
                className="rounded-2xl bg-slate-800 border border-slate-700 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-200 hover:bg-slate-700"
              >
                Hide
              </button>
            </div>
          )}
          {retrievalMode && storedMatches.length > 0 ? (
            <div className="p-6 sm:p-8 flex flex-col h-full overflow-hidden">
              <div className="bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl mb-6 sm:mb-8 flex-1 flex flex-col justify-center items-center text-center space-y-6">
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-4xl font-black shadow-xl shadow-blue-900/40 animate-pulse">
                  {retrievalIndex + 1}
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 font-bold uppercase tracking-widest text-sm">Pick {retrievalIndex + 1} of {storedMatches.length}</span>
                  <h3 className="text-4xl sm:text-5xl font-black tracking-tighter">#{currentResult?.blanket_number}</h3>
                </div>
                
                <div className="w-full space-y-4 pt-6 border-t border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">STORE</span>
                    <span className="text-2xl font-black text-blue-400">{currentResult?.store}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">POSITION</span>
                    <span className="text-2xl font-black text-white">R{currentResult?.row} : C{currentResult?.column}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">LAST STATUS</span>
                    <span className="text-sm font-black uppercase tracking-widest text-slate-200">
                      {currentResult?.lastStatus ?? currentResult?.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 shrink-0">
                {pickError && (
                  <div className="rounded-3xl border border-rose-600 bg-rose-950/60 px-5 py-4 text-sm font-bold text-rose-200">
                    {pickError}
                  </div>
                )}
                <button 
                  onClick={handleMarkAsPicked}
                  disabled={!currentUser}
                  className={cn(
                    "w-full py-5 sm:py-6 rounded-3xl font-black text-xl sm:text-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3",
                    currentUser 
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20" 
                      : "bg-slate-700 text-slate-400 cursor-not-allowed shadow-none"
                  )}
                >
                  <CheckCircle2 size={32} />
                  MARK AS PICKED
                </button>

                <button
                  type="button"
                  onClick={() => currentResult && zoomToBlanket(currentResult)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-3xl font-black text-base shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <Crosshair size={22} />
                  ZOOM TO SLOT (3D)
                </button>
                
                <div className="flex gap-3">
                  <button 
                    disabled={retrievalIndex === 0}
                    onClick={() => setRetrievalIndex(retrievalIndex - 1)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 p-4 rounded-2xl flex items-center justify-center transition-all"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    disabled={retrievalIndex === storedMatches.length - 1}
                    onClick={() => setRetrievalIndex(retrievalIndex + 1)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 p-4 rounded-2xl flex items-center justify-center transition-all"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
              </div>

              {exactMatches.length > 0 && (
                <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                  <div className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 flex items-center justify-between">
                    <span>All matches (latest first)</span>
                    <span className="text-slate-600">{exactMatches.length}</span>
                  </div>
                  <div className="max-h-56 overflow-auto divide-y divide-slate-800">
                    {exactMatches.map((b) => {
                      const isStored = b.status === 'stored';
                      const index = storedIndexById.get(b.id);
                      return (
                        <div key={b.id} className="px-5 py-4 flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <div className="text-sm font-black text-white truncate">
                              {b.store} · R{b.row} C{b.column}
                            </div>
                            <div className="text-xs text-slate-500 font-bold">
                              Status: {b.lastStatus ?? b.status}
                              {b.lastLog?.action ? ` · Action: ${b.lastLog.action}` : ''}
                            </div>
                          </div>
                          <div className="shrink-0 flex items-center gap-2">
                            {typeof index === 'number' && isStored && (
                              <button
                                type="button"
                                onClick={() => setRetrievalIndex(index)}
                                className="rounded-2xl bg-blue-600 hover:bg-blue-500 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white"
                              >
                                Go
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => zoomToBlanket(b)}
                              className="rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-200"
                            >
                              Zoom
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : storedMatches.length === 1 ? (
            <div className="p-6 sm:p-8 flex flex-col h-full overflow-hidden">
              <div className="bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-2xl mb-6 sm:mb-8 flex-1 flex flex-col justify-center items-center text-center space-y-6">
                <div className="w-24 h-24 bg-emerald-600 rounded-full flex items-center justify-center text-4xl font-black shadow-xl shadow-emerald-900/40">
                  <Package size={48} />
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 font-bold uppercase tracking-widest text-sm">Single Match Found</span>
                  <h3 className="text-4xl sm:text-5xl font-black tracking-tighter">#{currentResult?.blanket_number}</h3>
                </div>
                
                <div className="w-full space-y-4 pt-6 border-t border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">STORE</span>
                    <span className="text-2xl font-black text-emerald-400">{currentResult?.store}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">POSITION</span>
                    <span className="text-2xl font-black text-white">R{currentResult?.row} : C{currentResult?.column}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">LAST STATUS</span>
                    <span className="text-sm font-black uppercase tracking-widest text-slate-200">
                      {currentResult?.lastStatus ?? currentResult?.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 shrink-0">
                {pickError && (
                  <div className="rounded-3xl border border-rose-600 bg-rose-950/60 px-5 py-4 text-sm font-bold text-rose-200">
                    {pickError}
                  </div>
                )}
                <button 
                  onClick={handleMarkAsPicked}
                  disabled={!currentUser}
                  className={cn(
                    "w-full py-5 sm:py-6 rounded-3xl font-black text-xl sm:text-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3",
                    currentUser 
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20" 
                      : "bg-slate-700 text-slate-400 cursor-not-allowed shadow-none"
                  )}
                >
                  <CheckCircle2 size={32} />
                  MARK AS PICKED
                </button>
                <button
                  type="button"
                  onClick={() => currentResult && zoomToBlanket(currentResult)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-3xl font-black text-base shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <Crosshair size={22} />
                  ZOOM TO SLOT (3D)
                </button>
              </div>

              {exactMatches.length > 0 && (
                <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                  <div className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 flex items-center justify-between">
                    <span>All matches (latest first)</span>
                    <span className="text-slate-600">{exactMatches.length}</span>
                  </div>
                  <div className="max-h-56 overflow-auto divide-y divide-slate-800">
                    {exactMatches.map((b) => (
                      <div key={b.id} className="px-5 py-4 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-sm font-black text-white truncate">
                            {b.store} · R{b.row} C{b.column}
                          </div>
                          <div className="text-xs text-slate-500 font-bold">
                            Status: {b.lastStatus ?? b.status}
                            {b.lastLog?.action ? ` · Action: ${b.lastLog.action}` : ''}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => zoomToBlanket(b)}
                          className="shrink-0 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-200"
                        >
                          Zoom
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 sm:p-8 flex flex-col h-full overflow-hidden">
              {!hasQuery ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-40">
                  <Search size={80} className="text-slate-700" />
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold">No Active Search</h3>
                    <p className="text-slate-500">Enter a blanket number above to locate it in the warehouse.</p>
                  </div>
                </div>
              ) : exactMatches.length === 0 ? (
                <div className="flex flex-col gap-6">
                  <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
                    <div className="text-xl font-black text-white">No exact matches</div>
                    <div className="text-sm text-slate-500 font-bold mt-1">
                      Keep typing or choose a suggestion.
                    </div>
                  </div>
                  {suggestions.length > 0 ? (
                    <div className="rounded-3xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                      <div className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                        Suggestions
                      </div>
                      <div className="divide-y divide-slate-800 max-h-80 overflow-auto">
                        {suggestions.map((s) => (
                          <button
                            key={`panel-sugg-${s.lower}`}
                            type="button"
                            onClick={() => handleSelectSuggestion(s.number)}
                            className="w-full px-5 py-4 flex items-center justify-between gap-4 hover:bg-slate-800 text-left"
                          >
                            <div className="min-w-0">
                              <div className="text-base font-black text-white truncate">#{s.number}</div>
                              <div className="text-xs text-slate-500 font-bold">
                                Stored: {s.storedCount} · Total: {s.totalCount}
                                {s.lastStatus ? ` · Last: ${s.lastStatus}` : ''}
                              </div>
                            </div>
                            <span className="shrink-0 rounded-2xl bg-slate-800 border border-slate-700 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-200">
                              Select
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-slate-500 font-bold mt-6">No suggestions found.</div>
                  )}
                </div>
              ) : (
                <div className="rounded-3xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                  <div className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 flex items-center justify-between">
                    <span>Matches (latest first)</span>
                    <span className="text-slate-600">{exactMatches.length}</span>
                  </div>
                  <div className="max-h-[70vh] overflow-auto divide-y divide-slate-800">
                    {exactMatches.map((b) => (
                      <div key={b.id} className="px-5 py-4 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-sm font-black text-white truncate">
                            {b.store} · R{b.row} C{b.column}
                          </div>
                          <div className="text-xs text-slate-500 font-bold">
                            Status: {b.lastStatus ?? b.status}
                            {b.lastLog?.action ? ` · Action: ${b.lastLog.action}` : ''}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => zoomToBlanket(b)}
                          className="shrink-0 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-200"
                        >
                          Zoom
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {hasQuery && !searchPanelOpen && (
          <button
            type="button"
            onClick={() => setSearchPanelOpen(true)}
            className="absolute top-4 left-4 sm:top-6 sm:left-6 z-30 flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-700 text-sm font-bold text-white shadow-xl"
          >
            <ChevronRight size={16} />
            Show search panel
          </button>
        )}

        {/* Center: Viewport */}
        <div className="flex-1 relative bg-slate-950">
          {viewMode === '2D' ? (
            <Grid2D />
          ) : (
            <Warehouse3D />
          )}
          
          {/* Store Selector Overlay */}
          <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex bg-slate-900/80 backdrop-blur-md p-2 rounded-3xl border border-slate-700 shadow-2xl z-10 max-w-[94%] sm:max-w-[90%] overflow-x-auto no-scrollbar">
            {stores.map(s => (
              <button
                key={s.store_name}
                onClick={() => setSelectedStore(s.store_name)}
                className={cn(
                  "px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-bold whitespace-nowrap transition-all text-sm sm:text-base",
                  selectedStore === s.store_name 
                    ? "bg-blue-600 text-white shadow-lg" 
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                {s.store_name}
              </button>
            ))}
          </div>

          {/* View Info Overlay */}
          <div className="absolute top-4 sm:top-8 right-4 sm:right-8 flex flex-col gap-3 z-10 items-end">
            <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700 shadow-xl flex flex-wrap items-center gap-x-4 gap-y-2 justify-end max-w-md">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-600/80 border border-slate-500" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Empty</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Occupied</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Selected</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-lime-400 shadow-[0_0_12px_rgba(163,230,53,0.6)] animate-pulse" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Search</span>
              </div>
            </div>
            {viewMode === '3D' && (
              <div className="bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-700 shadow-xl flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-1">Grid layer</span>
                <button
                  type="button"
                  onClick={() => setGridFace('front')}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all',
                    gridFace === 'front'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  )}
                >
                  Front
                </button>
                <button
                  type="button"
                  onClick={() => setGridFace('back')}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all',
                    gridFace === 'back'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  )}
                >
                  Back
                </button>
                {selectedGridCell && selectedGridCell.store === selectedStore && (
                  <>
                    <span className="text-[10px] font-bold text-slate-500 mx-1">|</span>
                    <span className="text-[11px] font-black tabular-nums text-emerald-400">
                      R{selectedGridCell.row}·C{selectedGridCell.column}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedGridCell(null)}
                      className="text-[10px] font-bold text-slate-500 hover:text-white uppercase"
                    >
                      Clear
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
