import { useStore, type Blanket } from '../store/useStore';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Plus, ScanLine, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { extractTicketNumberFromScan } from '../utils/barcode';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Grid2D() {
  const {
    stores,
    selectedStore,
    blankets,
    searchQuery,
    selectedGridCell,
    setSelectedGridCell,
    addBlanket,
    markAsPicked,
    fetchBlankets,
    currentUser,
  } = useStore();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [newNumber, setNewNumber] = useState('');
  const [slotInput, setSlotInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [pickingId, setPickingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scannerRafRef = useRef<number | null>(null);
  const canModify = ['admin', 'super-admin'].includes(currentUser?.role || '');

  const store = useMemo(
    () => stores.find((s) => s.store_name === selectedStore) || stores[0],
    [stores, selectedStore]
  );
  const isConveyerStore = useMemo(
    () => Boolean(store && /convey/i.test(store.store_name.trim())),
    [store?.store_name]
  );

  const storeBlankets = useMemo(
    () => blankets.filter((b) => b.store === store?.store_name && b.status === 'stored'),
    [blankets, store]
  );

  const targetBlankets = useMemo(
    () => storeBlankets.filter((b) => b.blanket_number.toLowerCase() === searchQuery.toLowerCase()),
    [storeBlankets, searchQuery]
  );

  const slotCapacity = useMemo(() => {
    if (!store) return 1;
    if (store.store_type === 'hanger') return 1;
    return Math.max(1, Number((store as any).slot_capacity ?? 1));
  }, [store]);

  const showBlanketNumberInCell = slotCapacity === 1;

  const cellItemsMap = useMemo(() => {
    const map = new Map<string, Blanket[]>();
    for (const b of storeBlankets) {
      const key = `${b.row},${b.column}`;
      const list = map.get(key);
      if (list) {
        list.push(b);
      } else {
        map.set(key, [b]);
      }
    }
    for (const list of map.values()) {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return map;
  }, [storeBlankets]);

  const firstAvailableCell = useMemo(() => {
    if (!store) return null;
    for (let r = 1; r <= store.rows; r += 1) {
      for (let c = store.columns; c >= 1; c -= 1) {
        const count = cellItemsMap.get(`${r},${c}`)?.length ?? 0;
        if (count < slotCapacity) return { row: r, column: c };
      }
    }
    return null;
  }, [store, cellItemsMap, slotCapacity]);

  const activeCell = useMemo(() => {
    if (!store) return null;
    if (selectedGridCell && selectedGridCell.store === store.store_name) {
      return { row: selectedGridCell.row, column: selectedGridCell.column };
    }
    return null;
  }, [store, selectedGridCell]);

  useEffect(() => {
    setNewNumber('');
    setSlotInput('');
    setError(null);
    setScannerOpen(false);
    setScannerError(null);
  }, [store?.store_name]);

  useEffect(() => {
    if (!store || !isConveyerStore) return;
    if (!activeCell) return;
    setSlotInput((prev) => (prev === String(activeCell.column) ? prev : String(activeCell.column)));
  }, [store?.store_name, isConveyerStore, activeCell?.column]);

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
              const extracted = extractTicketNumberFromScan(String(rawValue));
              if (extracted) {
                try {
                  navigator.vibrate?.(50);
                } catch {
                  // ignore
                }
                setNewNumber(extracted);
                setScannerOpen(false);
                inputRef.current?.focus();
                return;
              }
            }
          } catch {
            // ignore frame-level scanner errors
          }
          scannerRafRef.current = window.requestAnimationFrame(tick);
        };

        scannerRafRef.current = window.requestAnimationFrame(tick);
      } catch (scanError: any) {
        const message =
          typeof scanError?.message === 'string' ? scanError.message : 'Failed to start scanner.';
        setScannerError(message);
      }
    };

    start();
    return () => {
      cancelled = true;
      stop();
    };
  }, [scannerOpen]);

  useEffect(() => {
    if (!store) return;
    if (activeCell) return;
    const fallback = firstAvailableCell ?? { row: 1, column: store.columns };
    setSelectedGridCell({ store: store.store_name, row: fallback.row, column: fallback.column });
  }, [store, activeCell, firstAvailableCell, setSelectedGridCell]);

  if (!store) return null;

  const parsedSlot = Number.parseInt(slotInput, 10);
  const hasValidConveyerSlot =
    isConveyerStore &&
    Number.isFinite(parsedSlot) &&
    parsedSlot >= 1 &&
    parsedSlot <= store.columns;

  const selectedCell =
    isConveyerStore && hasValidConveyerSlot
      ? { row: 1, column: parsedSlot }
      : activeCell ?? firstAvailableCell;
  const selectedCellKey = selectedCell ? `${selectedCell.row},${selectedCell.column}` : null;
  const selectedCellItems = selectedCellKey ? cellItemsMap.get(selectedCellKey) ?? [] : [];
  const selectedCellCount = selectedCellItems.length;
  const selectedCellFull = selectedCellCount >= slotCapacity;

  useEffect(() => {
    if (!store || !isConveyerStore || !hasValidConveyerSlot) return;
    if (
      selectedGridCell?.store === store.store_name &&
      selectedGridCell.row === 1 &&
      selectedGridCell.column === parsedSlot
    ) {
      return;
    }
    setSelectedGridCell({ store: store.store_name, row: 1, column: parsedSlot });
  }, [
    store?.store_name,
    isConveyerStore,
    hasValidConveyerSlot,
    parsedSlot,
    selectedGridCell?.store,
    selectedGridCell?.row,
    selectedGridCell?.column,
    setSelectedGridCell,
  ]);

  const handleStoreBlanket = async () => {
    if (!store) return;
    const value = newNumber.trim();
    if (!value) {
      setError(isConveyerStore ? 'Enter invoice number first.' : 'Enter blanket number first.');
      return;
    }

    if (isConveyerStore && !hasValidConveyerSlot) {
      setError(`Enter a valid slot between 1 and ${store.columns}.`);
      return;
    }

    if (!selectedCell) {
      setError('Select a slot first.');
      return;
    }

    const targetCell = selectedCell;
    const targetCount = cellItemsMap.get(`${targetCell.row},${targetCell.column}`)?.length ?? 0;
    if (targetCount >= slotCapacity) {
      setError('Selected cell is full.');
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await addBlanket({
        blanket_number: value,
        store: store.store_name,
        row: targetCell.row,
        column: targetCell.column,
        status: 'stored',
      });
      setNewNumber('');
      if (!isConveyerStore && targetCount + 1 >= slotCapacity) {
        setSelectedGridCell(null);
      }
      inputRef.current?.focus();
    } catch (err: any) {
      const message = String(err?.message || '');
      if (/slot\s+is\s+full/i.test(message)) {
        if (!isConveyerStore) {
          setSelectedGridCell(null);
          setError('Selected cell was full, moved to next available cell.');
        } else {
          setError('Selected slot is full. Enter another slot.');
        }
        await fetchBlankets();
      } else {
        setError(message || 'Failed to store blanket.');
      }
      inputRef.current?.focus();
    } finally {
      setBusy(false);
    }
  };

  const handlePicked = async (blanket: Blanket) => {
    setPickingId(blanket.id);
    setError(null);
    try {
      await markAsPicked(blanket);
    } catch (err: any) {
      setError(err?.message || 'Failed to mark as picked.');
    } finally {
      setPickingId(null);
    }
  };

  const grid = [];
  for (let r = 1; r <= store.rows; r++) {
    const row = [];
    for (let c = store.columns; c >= 1; c--) {
      const key = `${r},${c}`;
      const items = cellItemsMap.get(key) ?? [];
      const count = items.length;
      const latest = items[0]?.blanket_number;
      const isTarget = targetBlankets.some((b) => b.row === r && b.column === c);
      row.push({ r, c, key, count, latest, isTarget });
    }
    grid.push(row);
  }

  const storeCapacity = Math.max(1, store.rows * store.columns * slotCapacity);

  return (
    <div className="h-full w-full flex flex-col p-3 sm:p-6 lg:p-10 pb-24 sm:pb-32 overflow-auto bg-slate-950">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-white uppercase">{store.store_name}</h2>
          <p className="text-slate-500 font-bold text-[11px] sm:text-base uppercase tracking-widest">
            {store.rows} Rows × {store.columns} Columns • {storeBlankets.length} Items Stored
          </p>
        </div>

        <div className="flex items-start sm:items-center gap-2 sm:gap-3">
          <span
            className={cn(
              'text-[10px] font-black uppercase tracking-widest px-2.5 sm:px-3 py-2 rounded-xl sm:rounded-2xl border self-start sm:self-center',
              store.auto_settle !== false
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40'
                : 'bg-slate-700/40 text-slate-300 border-slate-600'
            )}
          >
            Auto-settle: {store.auto_settle !== false ? 'Enabled' : 'Disabled'}
          </span>
          <div className="bg-slate-900 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800 shadow-2xl flex flex-col items-center justify-center min-w-[96px] sm:min-w-[110px]">
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Capacity</span>
            <span className="text-xl sm:text-2xl font-black text-white">{Math.round((storeBlankets.length / storeCapacity) * 100)}%</span>
          </div>
        </div>
      </div>

      <div className="mb-4 sm:mb-6 rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900/85 p-3 sm:p-4 shadow-2xl space-y-3">
        <div className="flex items-center justify-between text-[11px] font-black text-white">
          <span>
            {isConveyerStore
              ? `Slot: ${selectedCell ? `${selectedCell.column}` : '—'}`
              : `Selected: ${selectedCell ? `R${selectedCell.row} · C${selectedCell.column}` : '—'}`}
          </span>
          <span className={cn('text-xs', selectedCellFull ? 'text-rose-400' : 'text-emerald-400')}>
            {selectedCellCount}/{slotCapacity}
          </span>
        </div>
        {isConveyerStore && (
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Slot Number</label>
            <input
              type="number"
              min={1}
              max={store.columns}
              step={1}
              value={slotInput}
              onChange={(e) => setSlotInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return;
                e.preventDefault();
                inputRef.current?.focus();
              }}
              placeholder={`1 .. ${store.columns}`}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-sm text-white font-bold outline-none focus:border-blue-500"
            />
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newNumber}
            onChange={(e) => setNewNumber(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return;
              e.preventDefault();
              void handleStoreBlanket();
            }}
            placeholder={isConveyerStore ? 'Invoice / barcode number...' : 'Blanket number...'}
            className="flex-1 rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-base sm:text-sm text-white font-bold outline-none focus:border-blue-500"
          />
          {isConveyerStore && (
            <button
              type="button"
              onClick={() => setScannerOpen(true)}
              className="px-3 h-11 sm:h-auto rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600"
              title="Scan barcode with camera"
            >
              <ScanLine size={14} />
              Scan
            </button>
          )}
          <button
            type="button"
            onClick={handleStoreBlanket}
            disabled={
              busy ||
              !selectedCell ||
              selectedCellFull ||
              !newNumber.trim() ||
              !canModify ||
              (isConveyerStore && !hasValidConveyerSlot)
            }
            className={cn(
              'px-3 h-11 sm:h-auto rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5',
              busy ||
              !selectedCell ||
              selectedCellFull ||
              !newNumber.trim() ||
              !canModify ||
              (isConveyerStore && !hasValidConveyerSlot)
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            )}
          >
            <Plus size={14} />
            Store
          </button>
        </div>
        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cell Contents</div>
          {selectedCellItems.length === 0 ? (
            <div className="text-xs text-slate-500 font-semibold">This cell is empty.</div>
          ) : (
            <div className="max-h-36 overflow-auto space-y-1.5 pr-1">
              {selectedCellItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-black text-white truncate">#{item.blanket_number}</div>
                    <div className="text-[10px] text-slate-500 font-bold">{new Date(item.created_at).toLocaleString()}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePicked(item)}
                    disabled={pickingId === item.id || !canModify}
                    className={cn(
                      'px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1',
                      pickingId === item.id || !canModify
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    )}
                  >
                    <Check size={12} />
                    Picked
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {error && (
          <div className="rounded-xl border border-rose-900/60 bg-rose-900/20 px-3 py-2 text-xs font-bold text-rose-300">
            {error}
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 flex items-center justify-center">
        <div className="w-full overflow-auto pb-2">
          <div
            className="mx-auto w-max grid gap-1 sm:gap-2 p-3 sm:p-6 bg-slate-900 rounded-[26px] sm:rounded-[40px] border border-slate-800 shadow-2xl"
            style={{
              gridTemplateColumns: `repeat(${store.columns}, minmax(0, 1fr))`,
            }}
          >
            {grid.map((row, rIdx) =>
              row.map((cell, cIdx) => {
                const isSelected = selectedCell?.row === cell.r && selectedCell?.column === cell.c;
                const isFull = cell.count >= slotCapacity;
                return (
                  <button
                    key={`${rIdx}-${cIdx}`}
                    type="button"
                    onClick={() => {
                      setSelectedGridCell({ store: store.store_name, row: cell.r, column: cell.c });
                      if (isConveyerStore) {
                        setSlotInput(String(cell.c));
                      }
                      inputRef.current?.focus();
                    }}
                    className={cn(
                      'w-[3.1rem] h-10 sm:w-[4.4rem] sm:h-[3.15rem] md:w-24 md:h-16 rounded-lg sm:rounded-xl flex items-center justify-center text-[11px] sm:text-xs font-black transition-all duration-300 cursor-pointer group relative border',
                      isSelected
                        ? 'bg-emerald-500 text-white border-emerald-300 ring-2 ring-emerald-300/70'
                        : cell.isTarget
                        ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-110 z-10 ring-4 ring-emerald-400/50 border-emerald-300'
                        : cell.count > 0
                        ? isFull
                          ? 'bg-rose-900/40 text-rose-300 border-rose-800/80 hover:bg-rose-900/55'
                          : 'bg-blue-900/35 text-blue-200 border-blue-800/70 hover:bg-blue-900/50'
                        : 'bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-600'
                    )}
                    title={`Row ${cell.r}, Column ${cell.c}`}
                  >
                    {cell.isTarget ? (
                      showBlanketNumberInCell ? (
                        <span className="animate-bounce max-w-full px-1 truncate" title={cell.latest || ''}>
                          {cell.latest || '-'}
                        </span>
                      ) : (
                        <span className="animate-bounce tabular-nums">{cell.count || 1}x</span>
                      )
                    ) : cell.count > 0 ? (
                      showBlanketNumberInCell ? (
                        <span className="opacity-70 group-hover:opacity-100 max-w-full px-1 truncate" title={cell.latest || ''}>
                          {cell.latest || '-'}
                        </span>
                      ) : (
                        <span className="opacity-50 group-hover:opacity-100 tabular-nums">{cell.count}x</span>
                      )
                    ) : (
                      <span className="opacity-0 group-hover:opacity-20">
                        {cell.r}:{cell.c}
                      </span>
                    )}

                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 border border-slate-700 shadow-2xl">
                      Row {cell.r}, Column {cell.c}
                      {cell.count > 0 && (
                        <div className="text-blue-400">
                          {cell.count}/{slotCapacity} bags {cell.latest ? `· Latest #${cell.latest}` : ''}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {scannerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex flex-col">
          <div className="p-4 sm:p-6 flex items-center justify-between gap-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center">
                <ScanLine size={22} />
              </div>
              <div>
                <div className="text-sm font-black uppercase tracking-widest text-slate-200">Conveyer Scanner</div>
                <div className="text-xs text-slate-400 font-bold">Point camera to the invoice barcode</div>
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
                  Tip: Use Chrome on Android and allow camera permission.
                </div>
              </div>
            ) : (
              <div className="max-w-lg w-full rounded-3xl border border-slate-800 bg-slate-900/60 px-5 py-4 text-slate-200 text-sm font-bold">
                Scanning... it will fill invoice number automatically.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
