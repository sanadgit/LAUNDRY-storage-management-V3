import { useStore, type Blanket } from '../store/useStore';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Plus, ScanLine, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { extractTicketNumberFromScan } from '../utils/barcode';
import { getScannerSupportMessage, startCameraBarcodeScanner } from '../utils/cameraScanner';
import { canUseInputMode } from '../lib/roleAccess';
import StoreControlBar from './StoreControlBar';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type GridInteractionMode = 'search' | 'input';
type GridDensityMode = 'fit' | 'comfortable' | 'compact' | 'large';

type Grid2DProps = {
  interactionMode?: GridInteractionMode;
  lockedStores?: Record<string, boolean>;
  onOpenStoreManagement?: (storeName: string) => void;
};

export default function Grid2D({ interactionMode = 'search', lockedStores = {}, onOpenStoreManagement }: Grid2DProps) {
  const {
    stores,
    selectedStore,
    setSelectedStore,
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
  const [scannerPreview, setScannerPreview] = useState<{ raw: string; extracted: string } | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canUseInput = canUseInputMode(currentUser?.role);
  const isStoreLocked = Boolean(selectedStore && lockedStores[selectedStore]);
  const canModify = canUseInput && interactionMode === 'input' && !isStoreLocked;
  const isSearchMode = interactionMode === 'search';
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 639px)').matches : false
  );
  const [gridDensity, setGridDensity] = useState<GridDensityMode>(() => {
    if (typeof localStorage === 'undefined') return 'fit';
    const saved = localStorage.getItem('warehouse-grid-density');
    if (saved === 'fit' || saved === 'comfortable' || saved === 'compact' || saved === 'large') return saved;
    return 'fit';
  });

  const store = useMemo(
    () => stores.find((s) => s.store_name === selectedStore) || stores[0],
    [stores, selectedStore]
  );
  const fallbackStore = useMemo(
    () =>
      ({
        store_name: selectedStore || 'Store',
        rows: 1,
        columns: 1,
        store_type: 'grid',
        auto_settle: true,
      }) as any,
    [selectedStore]
  );
  const activeStore = store ?? fallbackStore;
  const isConveyerStore = useMemo(
    () => Boolean(store && /convey/i.test(activeStore.store_name.trim())),
    [store, activeStore.store_name]
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
      for (let c = 1; c <= store.columns; c += 1) {
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
    setScannerPreview(null);
  }, [store?.store_name]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(max-width: 639px)');
    const update = () => setIsMobileViewport(media.matches);
    update();
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    }
    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem('warehouse-grid-density', gridDensity);
  }, [gridDensity]);

  useEffect(() => {
    if (!store || !isConveyerStore) return;
    if (!activeCell) return;
    setSlotInput((prev) => (prev === String(activeCell.column) ? prev : String(activeCell.column)));
  }, [store?.store_name, isConveyerStore, activeCell?.column]);

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
          onDetected: (rawValue) => {
            if (cancelled || consumed) return;
            const rawText = String(rawValue ?? '').trim();
            const extracted = extractTicketNumberFromScan(rawText);
            setScannerPreview((prev) => {
              if (prev && prev.raw === rawText && prev.extracted === extracted) return prev;
              return { raw: rawText, extracted };
            });
            if (!extracted) return;
            consumed = true;
            stopSession?.();
            try {
              navigator.vibrate?.(50);
            } catch {
              // ignore
            }
            setNewNumber(extracted);
            setScannerOpen(false);
            inputRef.current?.focus();
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
      } catch (scanError) {
        setScannerError(getScannerSupportMessage(scanError));
      }
    };

    start();
    return () => {
      cancelled = true;
      stopSession?.();
    };
  }, [scannerOpen]);

  useEffect(() => {
    if (!store) return;
    if (activeCell) return;
    const fallback = firstAvailableCell ?? { row: 1, column: store.columns };
    setSelectedGridCell({ store: store.store_name, row: fallback.row, column: fallback.column });
  }, [store, activeCell, firstAvailableCell, setSelectedGridCell]);

  const parsedSlot = Number.parseInt(slotInput, 10);
  const hasValidConveyerSlot =
    isConveyerStore &&
    Number.isFinite(parsedSlot) &&
    parsedSlot >= 1 &&
    parsedSlot <= activeStore.columns;

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
    if (!canModify) {
      setError(isStoreLocked ? 'This store is locked. Unlock it from Store Control Bar.' : 'Input Mode is restricted to admin/super-admin.');
      return;
    }
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
  for (let r = 1; r <= activeStore.rows; r++) {
    const row = [];
    for (let c = 1; c <= activeStore.columns; c++) {
      const key = `${r},${c}`;
      const items = cellItemsMap.get(key) ?? [];
      const count = items.length;
      const latest = items[0]?.blanket_number;
      const numbers = items.map((item) => item.blanket_number);
      const previewText =
        numbers.length <= 2 ? numbers.join(' / ') : `${numbers.slice(0, 2).join(' / ')} +${numbers.length - 2}`;
      const isTarget = targetBlankets.some((b) => b.row === r && b.column === c);
      row.push({ r, c, key, count, latest, numbers, previewText, isTarget });
    }
    grid.push(row);
  }

  const storeCapacity = Math.max(1, activeStore.rows * activeStore.columns * slotCapacity);
  const mobileEntryMode = canModify && isMobileViewport && !isConveyerStore;
  const selectedSlotLabel = selectedCell
    ? `${activeStore.store_name} • R${selectedCell.row} : C${selectedCell.column}`
    : `${activeStore.store_name} • --`;

  const appendDigit = (digit: string) => {
    setNewNumber((prev) => `${prev}${digit}`.slice(0, 18));
  };

  const backspaceDigit = () => {
    setNewNumber((prev) => prev.slice(0, -1));
  };
  const densityConfig = useMemo(() => {
    const configs: Record<GridDensityMode, { width: string; minHeight: string; fontSize: string; gap: number; label: string }> = {
      fit: {
        width: 'clamp(54px, 7vw, 96px)',
        minHeight: 'clamp(38px, 5vw, 64px)',
        fontSize: 'clamp(10px, 1.1vw, 14px)',
        gap: 6,
        label: 'Fit to Screen',
      },
      comfortable: {
        width: 'clamp(62px, 7.8vw, 108px)',
        minHeight: 'clamp(42px, 5.5vw, 70px)',
        fontSize: 'clamp(10px, 1.15vw, 14px)',
        gap: 7,
        label: 'Comfortable',
      },
      compact: {
        width: 'clamp(54px, 6vw, 88px)',
        minHeight: 'clamp(38px, 4.6vw, 60px)',
        fontSize: 'clamp(10px, 1vw, 13px)',
        gap: 5,
        label: 'Compact',
      },
      large: {
        width: 'clamp(72px, 8.8vw, 124px)',
        minHeight: 'clamp(48px, 6vw, 78px)',
        fontSize: 'clamp(11px, 1.2vw, 15px)',
        gap: 8,
        label: 'Large',
      },
    };
    return configs[gridDensity];
  }, [gridDensity]);

  return (
    <div className={cn(
      "warehouse-grid-ui h-full w-full min-w-0 flex flex-col p-3 sm:p-5 lg:p-8 pb-20 sm:pb-28 overflow-y-auto overflow-x-hidden bg-slate-950",
      canModify ? "warehouse-grid-ui--input" : "warehouse-grid-ui--search",
      mobileEntryMode && "pb-[11.5rem]"
    )}>
      {!mobileEntryMode && (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex flex-col gap-2 min-w-0">
          <h2 className="text-[clamp(1.4rem,3.3vw,2.85rem)] font-black tracking-tighter text-white uppercase truncate">{activeStore.store_name}</h2>
          <p className="text-slate-500 font-bold text-[10px] sm:text-[13px] lg:text-[15px] uppercase tracking-[0.16em]">
            {activeStore.rows} Rows × {activeStore.columns} Columns • {storeBlankets.length} Items Stored • {Math.round((storeBlankets.length / storeCapacity) * 100)}% Capacity
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
          <span
            className={cn(
              'text-[10px] font-black uppercase tracking-widest px-2.5 sm:px-3 py-2 rounded-xl sm:rounded-2xl border self-start sm:self-center',
              activeStore.auto_settle !== false
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40'
                : 'bg-slate-700/40 text-slate-300 border-slate-600'
            )}
          >
            Auto-settle: {activeStore.auto_settle !== false ? 'Enabled' : 'Disabled'}
          </span>
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/70 p-1 overflow-x-auto no-scrollbar max-w-full">
            {(['fit', 'comfortable', 'compact', 'large'] as GridDensityMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setGridDensity(mode)}
                className={cn(
                  'h-8 px-2.5 rounded-lg text-[10px] font-black uppercase tracking-wide whitespace-nowrap transition-all border',
                  gridDensity === mode
                    ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_12px_rgba(47,125,255,0.35)]'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                )}
                title={densityConfig.label}
              >
                {mode === 'fit' ? 'Fit to Screen' : mode === 'comfortable' ? 'Comfortable' : mode === 'compact' ? 'Compact' : 'Large'}
              </button>
            ))}
          </div>
        </div>
      </div>
      )}

      {canModify && !mobileEntryMode && (
      <div className="mb-4 sm:mb-6 rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900/85 p-3 sm:p-4 shadow-2xl space-y-2.5 sm:space-y-3 w-full max-w-[min(100%,64rem)]">
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
          <div className="space-y-1 sm:max-w-[260px]">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Slot Number</label>
            <input
              type="number"
              min={1}
              max={activeStore.columns}
              step={1}
              value={slotInput}
              onChange={(e) => setSlotInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return;
                e.preventDefault();
                inputRef.current?.focus();
              }}
              placeholder={`1 .. ${activeStore.columns}`}
              className="w-full h-10 sm:h-11 rounded-xl bg-slate-900 border border-slate-700 px-3 text-sm text-white font-bold outline-none focus:border-blue-500"
            />
          </div>
        )}
        <div
          className={cn(
            "grid gap-2 sm:gap-2.5",
            isConveyerStore
              ? "grid-cols-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]"
              : "grid-cols-[minmax(0,1fr)_auto]"
          )}
        >
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
            className={cn(
              "min-w-0 rounded-xl bg-slate-900 border border-slate-700 px-3 h-10 sm:h-11 text-sm text-white font-bold outline-none focus:border-blue-500",
              isConveyerStore ? "col-span-2 sm:col-span-1" : "col-span-1"
            )}
          />
          {isConveyerStore && (
            <button
              type="button"
              onClick={() => setScannerOpen(true)}
              className="px-3 sm:px-4 h-10 sm:h-11 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 min-w-[96px]"
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
              'px-3 sm:px-4 h-10 sm:h-11 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 min-w-[96px]',
              busy ||
              !selectedCell ||
              selectedCellFull ||
              !newNumber.trim() ||
              !canModify ||
              (isConveyerStore && !hasValidConveyerSlot)
                ? 'bg-slate-800 text-slate-300/70 border border-slate-700 cursor-not-allowed'
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
      )}

      {mobileEntryMode && (
        <div className="mb-2 px-1">
          <div className="text-2xl font-black text-white">{activeStore.store_name} Grid</div>
          <div className="text-[10px] text-slate-400 font-semibold">Numbers are written inside each slot clearly</div>
        </div>
      )}

      <div className="flex-1 min-h-0 flex items-start sm:items-center justify-center">
        <div className="w-full h-full overflow-auto pb-2">
          <div
            className="warehouse-grid-map mx-auto w-max grid p-2.5 sm:p-5 bg-slate-900 rounded-[22px] sm:rounded-[32px] border border-slate-800 shadow-2xl"
            style={{
              gridTemplateColumns: `repeat(${activeStore.columns}, minmax(0, 1fr))`,
              gap: `${densityConfig.gap}px`,
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
                    disabled={!canModify}
                    onClick={() => {
                      if (!canModify) return;
                      setSelectedGridCell({ store: activeStore.store_name, row: cell.r, column: cell.c });
                      if (isConveyerStore) {
                        setSlotInput(String(cell.c));
                      }
                      inputRef.current?.focus();
                    }}
                    className={cn(
                      'warehouse-grid-cell w-[var(--cell-width)] min-h-[var(--cell-min-height)] rounded-lg sm:rounded-xl flex items-start justify-center px-1.5 py-1 text-[var(--cell-font-size)] font-black leading-tight text-center transition-all duration-300 group relative border whitespace-normal break-words [overflow-wrap:anywhere]',
                      canModify ? 'cursor-pointer' : 'cursor-default',
                      isSelected
                        ? 'warehouse-grid-cell--selected bg-emerald-500 text-white border-emerald-300 ring-2 ring-emerald-300/70'
                        : cell.isTarget
                        ? 'warehouse-grid-cell--target bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-110 z-10 ring-4 ring-emerald-400/50 border-emerald-300'
                        : cell.count > 0
                        ? isFull
                          ? 'warehouse-grid-cell--occupied bg-rose-900/40 text-rose-300 border-rose-800/80 hover:bg-rose-900/55'
                          : 'warehouse-grid-cell--busy bg-blue-900/35 text-blue-200 border-blue-800/70 hover:bg-blue-900/50'
                        : 'warehouse-grid-cell--empty bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-600'
                    )}
                    title={`Store ${activeStore.store_name} • Row ${cell.r}, Column ${cell.c}${cell.numbers.length ? ` • ${cell.numbers.join(' | ')}` : ''}`}
                    style={
                      {
                        '--cell-width': densityConfig.width,
                        '--cell-min-height': densityConfig.minHeight,
                        '--cell-font-size': densityConfig.fontSize,
                      } as { [key: string]: string }
                    }
                  >
                    {cell.isTarget ? (
                      showBlanketNumberInCell ? (
                        <span
                          className={cn(
                            'animate-bounce w-full whitespace-normal break-words [overflow-wrap:anywhere]',
                            (cell.latest?.length ?? 0) > 10 && 'text-[0.92em]'
                          )}
                          title={cell.latest || ''}
                        >
                          {cell.latest || '-'}
                        </span>
                      ) : (
                        <span className="animate-bounce w-full whitespace-normal break-words [overflow-wrap:anywhere]" title={cell.previewText}>
                          {cell.previewText || `${cell.count || 1}x`}
                        </span>
                      )
                    ) : cell.count > 0 ? (
                      showBlanketNumberInCell ? (
                        <span
                          className={cn(
                            'opacity-90 group-hover:opacity-100 w-full whitespace-normal break-words [overflow-wrap:anywhere]',
                            (cell.latest?.length ?? 0) > 10 && 'text-[0.92em]'
                          )}
                          title={cell.latest || ''}
                        >
                          {cell.latest || '-'}
                        </span>
                      ) : (
                        <span
                          className="opacity-90 group-hover:opacity-100 w-full whitespace-normal break-words [overflow-wrap:anywhere]"
                          title={cell.numbers.join(' | ')}
                        >
                          {cell.previewText || `${cell.count}x`}
                        </span>
                      )
                    ) : (
                      <span className="opacity-0 group-hover:opacity-20">
                        {cell.r}:{cell.c}
                      </span>
                    )}

                    <div className={cn(
                      "absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold transition-opacity pointer-events-none whitespace-nowrap z-20 border border-slate-700 shadow-2xl",
                      isSearchMode ? "opacity-0" : "opacity-0 group-hover:opacity-100"
                    )}>
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

      {mobileEntryMode && (
        <div className="warehouse-input-dock sm:hidden fixed left-0 right-0 bottom-0 z-20 border-t border-slate-700 bg-slate-900/98 backdrop-blur-md px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <div className="mb-2 overflow-x-auto no-scrollbar rounded-2xl border border-slate-700 bg-slate-900/70 p-1.5">
            <StoreControlBar
              stores={stores}
              selectedStore={selectedStore}
              lockedStores={lockedStores}
              onSelectStore={setSelectedStore}
              onOpenManagement={(storeName) => onOpenStoreManagement?.(storeName)}
              className="min-w-max"
            />
          </div>
          <div className="warehouse-selected-slot mb-2 rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-2 flex items-center justify-between gap-2">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">
              {selectedSlotLabel}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="warehouse-input-number min-w-[6.5rem] h-9 rounded-lg border border-blue-500 bg-slate-950 px-2 flex items-center justify-end text-base font-black text-white">
                {newNumber || '--'}
              </div>
              <button
                type="button"
                onClick={() => setNewNumber('')}
                className="warehouse-clear-btn h-9 px-2.5 rounded-lg border border-rose-700 bg-rose-950/40 text-rose-300 text-[10px] font-black uppercase tracking-widest"
              >
                Clear
              </button>
            </div>
          </div>
          {error && (
            <div className="mb-2 rounded-lg border border-rose-900/60 bg-rose-900/20 px-2.5 py-2 text-[11px] font-bold text-rose-300">
              {error}
            </div>
          )}
          <div className="warehouse-keypad grid grid-cols-4 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0'].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (key === '⌫') backspaceDigit();
                  else appendDigit(key);
                }}
                className={cn(
                  "h-9 rounded-xl border text-sm font-black",
                  key === '⌫'
                    ? "bg-purple-950/30 border-purple-800 text-purple-200"
                    : "bg-slate-800 border-slate-700 text-slate-100"
                )}
              >
                {key}
              </button>
            ))}
            <button
              type="button"
              onClick={() => void handleStoreBlanket()}
              disabled={busy || !selectedCell || selectedCellFull || !newNumber.trim() || !canModify}
              className={cn(
                "warehouse-save-btn h-9 rounded-xl border text-xs font-black uppercase tracking-widest",
                busy || !selectedCell || selectedCellFull || !newNumber.trim() || !canModify
                  ? "bg-slate-800 border-slate-700 text-slate-400"
                  : "bg-emerald-600 border-emerald-400 text-white"
              )}
            >
              Save
            </button>
          </div>
        </div>
      )}

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
                  Tip: Works on Android, iPhone (Safari/Chrome), and desktop browsers. Allow camera permission.
                </div>
              </div>
            ) : (
              <div className="max-w-lg w-full rounded-3xl border border-slate-800 bg-slate-900/60 px-5 py-4 text-slate-200 text-sm font-bold">
                Scanning... it will fill invoice number automatically.
              </div>
            )}

            {scannerPreview && (
              <div className="max-w-lg w-full rounded-3xl border border-slate-700 bg-slate-900/80 px-5 py-4 space-y-2">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Scan Preview</div>
                <div className="text-xs font-semibold text-slate-300 break-all">
                  Raw: <span className="text-slate-200">{scannerPreview.raw || '-'}</span>
                </div>
                <div className="text-xs font-semibold text-emerald-300 break-all">
                  Extracted: {scannerPreview.extracted || 'No valid number yet'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
