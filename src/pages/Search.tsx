import { useState, useEffect, useMemo, useDeferredValue, useRef } from 'react';
import { useStore, type Blanket, type Log } from '../store/useStore';
import { Search, Map as MapIcon, Box, CheckCircle2, ChevronRight, ChevronLeft, Target, Package, Crosshair, ScanLine, X, AlertCircle } from 'lucide-react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import Grid2D from '../components/Grid2D';
import Warehouse3D from '../components/Warehouse3D';
import StoreControlBar from '../components/StoreControlBar';
import StoreManagementModal from '../components/store-management/StoreManagementModal';
import EmptyStoreConfirmStep from '../components/store-management/EmptyStoreConfirmStep';
import ImportStoreStep, {
  type ImportMeta as StoreImportMeta,
  type ImportPreviewRow as StoreImportPreviewRow,
  type ImportConflictStrategy,
  type ImportDuplicateStrategy,
  type ImportUnknownStoreStrategy,
  type ImportProgress,
  type ImportResultSummary,
} from '../components/store-management/ImportStoreStep';
import ExportStoreStep from '../components/store-management/ExportStoreStep';
import StoreSummaryStep from '../components/store-management/StoreSummaryStep';
import StoreHealthStep from '../components/store-management/StoreHealthStep';
import StoreHistoryStep from '../components/store-management/StoreHistoryStep';
import { useViewer3D } from '../context/Viewer3DSettings';
import { getVirtualGridCellWorldPoint } from '../utils/virtualGridWorldPoint';
import { extractTicketNumberFromScan } from '../utils/barcode';
import { getScannerSupportMessage, startCameraBarcodeScanner } from '../utils/cameraScanner';
import { canMarkPicked } from '../lib/roleAccess';
import { isSupabaseEnabled } from '../lib/supabaseClient';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ScannerMode = 'search' | 'pick-confirm';
type MobilePanelSnap = 'peek' | 'expanded';
type StoreManagementStep =
  | 'main'
  | 'summary'
  | 'import'
  | 'export'
  | 'move'
  | 'health'
  | 'history'
  | 'print'
  | 'empty';
type StoreManagementAction =
  | 'summary'
  | 'import_excel'
  | 'export_excel'
  | 'move_all'
  | 'toggle_lock'
  | 'print_labels'
  | 'health_check'
  | 'history'
  | 'clear_empty_cells'
  | 'empty_store';

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
    setSelectedGridCell,
    updateBlanket,
    addStore,
    updateStore,
    fetchStores,
    fetchBlankets,
    fetchLogs,
    currentUser,
    setSearchImmersive,
  } = useStore();

  const { requestFocusCellWorld } = useViewer3D();

  const [searchPanelOpen, setSearchPanelOpen] = useState(true);
  const [mobilePanelSnap, setMobilePanelSnap] = useState<MobilePanelSnap>('peek');
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 639px)').matches : false
  );
  const [isTabletViewport, setIsTabletViewport] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 1024px)').matches : false
  );
  const [pickError, setPickError] = useState<string | null>(null);
  const [queryInput, setQueryInput] = useState(searchQuery);
  const deferredQuery = useDeferredValue(queryInput);
  const suggestionBlurTimeout = useRef<number | null>(null);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerMode, setScannerMode] = useState<ScannerMode>('search');
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [scannerPreview, setScannerPreview] = useState<{ raw: string; extracted: string } | null>(null);
  const [hasOpened3D, setHasOpened3D] = useState(viewMode === '3D');
  const [pendingPickScanBlanket, setPendingPickScanBlanket] = useState<Blanket | null>(null);
  const canPick = canMarkPicked(currentUser?.role);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerModeRef = useRef<ScannerMode>('search');
  const pendingPickScanBlanketRef = useRef<Blanket | null>(null);
  const completeMarkAsPickedRef = useRef<(payload: Blanket) => Promise<boolean>>(async () => false);
  const panelDragStartYRef = useRef<number | null>(null);
  const panelDragStartSnapRef = useRef<MobilePanelSnap>('peek');
  const [lockedStores, setLockedStores] = useState<Record<string, boolean>>({});
  const [storeActionError, setStoreActionError] = useState<string | null>(null);
  const [managementStoreName, setManagementStoreName] = useState<string | null>(null);
  const [managementStep, setManagementStep] = useState<StoreManagementStep>('main');
  const [printLabelMode, setPrintLabelMode] = useState<'all' | 'occupied' | 'empty'>('all');
  const [moveStoreName, setMoveStoreName] = useState<string | null>(null);
  const [moveTargetStore, setMoveTargetStore] = useState<string>('');
  const [moveBusy, setMoveBusy] = useState(false);
  const [emptyStoreName, setEmptyStoreName] = useState<string | null>(null);
  const [emptyConfirmText, setEmptyConfirmText] = useState('');
  const [emptyReason, setEmptyReason] = useState('');
  const [emptyBusy, setEmptyBusy] = useState(false);
  const [importTargetStore, setImportTargetStore] = useState<string | null>(null);
  const [importPreview, setImportPreview] = useState<StoreImportPreviewRow[] | null>(null);
  const [importMeta, setImportMeta] = useState<StoreImportMeta | null>(null);
  const [importBusy, setImportBusy] = useState(false);
  const [importConflictStrategy, setImportConflictStrategy] = useState<ImportConflictStrategy>('fill_empty_only');
  const [importDuplicateStrategy, setImportDuplicateStrategy] = useState<ImportDuplicateStrategy>('skip_duplicates');
  const [importUnknownStoreStrategy, setImportUnknownStoreStrategy] = useState<ImportUnknownStoreStrategy>('auto_create');
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [importResult, setImportResult] = useState<ImportResultSummary | null>(null);
  const [exportStoreName, setExportStoreName] = useState<string | null>(null);
  const [exportScope, setExportScope] = useState<'current' | 'all'>('current');
  const [exportStoredOnly, setExportStoredOnly] = useState(true);
  const [exportIncludeEmptySlots, setExportIncludeEmptySlots] = useState(false);
  const [exportIncludeHistory, setExportIncludeHistory] = useState(false);

  useEffect(() => {
    setQueryInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    try {
      const raw = typeof localStorage === 'undefined' ? '' : localStorage.getItem('store-lock-map') || '';
      const parsed = raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
      setLockedStores(parsed && typeof parsed === 'object' ? parsed : {});
    } catch {
      setLockedStores({});
    }
  }, []);

  useEffect(() => {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem('store-lock-map', JSON.stringify(lockedStores));
  }, [lockedStores]);

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
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(max-width: 1024px)');
    const update = () => setIsTabletViewport(media.matches);
    update();
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    }
    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  useEffect(() => {
    scannerModeRef.current = scannerMode;
  }, [scannerMode]);

  useEffect(() => {
    pendingPickScanBlanketRef.current = pendingPickScanBlanket;
  }, [pendingPickScanBlanket]);

  const normalizeTicketForCompare = (value: string) => String(value ?? '').trim().toLowerCase();

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

            const mode = scannerModeRef.current;
            if (mode === 'pick-confirm') {
              const target = pendingPickScanBlanketRef.current;
              if (!target) {
                setScannerError('No pending pick target. Try pressing MARK AS PICKED again.');
                return;
              }
              const scanned = normalizeTicketForCompare(extracted);
              const expected = normalizeTicketForCompare(target.blanket_number);
              if (scanned !== expected) {
                try {
                  navigator.vibrate?.([40, 40, 40]);
                } catch {
                  // ignore
                }
                setScannerError(`Scanned #${extracted} does not match required #${target.blanket_number}.`);
                return;
              }

              consumed = true;
              stopSession?.();
              try {
                navigator.vibrate?.(70);
              } catch {
                // ignore
              }
              setScannerError(null);
              setScannerOpen(false);
              const marked = await completeMarkAsPickedRef.current(target);
              if (marked) {
                setPendingPickScanBlanket(null);
                pendingPickScanBlanketRef.current = null;
                setScannerMode('search');
                scannerModeRef.current = 'search';
              }
              return;
            }

            consumed = true;
            stopSession?.();
            try {
              navigator.vibrate?.(50);
            } catch {
              // ignore
            }
            setQueryInput(extracted);
            setSearchQuery(extracted);
            setSearchPanelOpen(true);
            setScannerOpen(false);
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

    start();
    return () => {
      cancelled = true;
      stopSession?.();
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
  const hasSearchInput = queryInput.trim().length > 0;
  const isSearchImmersive = isMobileViewport && hasSearchInput && searchPanelOpen && mobilePanelSnap === 'expanded';

  useEffect(() => {
    setSearchImmersive(isSearchImmersive);
  }, [isSearchImmersive, setSearchImmersive]);

  useEffect(() => {
    return () => setSearchImmersive(false);
  }, [setSearchImmersive]);

  useEffect(() => {
    if (viewMode === '3D') setHasOpened3D(true);
  }, [viewMode]);

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
  const shouldShowTopSuggestions =
    !isTabletViewport &&
    suggestionsOpen &&
    suggestions.length > 0 &&
    !retrievalMode &&
    exactMatches.length === 0;

  const storedIndexById = useMemo(() => {
    const map = new Map<number, number>();
    storedMatches.forEach((b, index) => map.set(b.id, index));
    return map;
  }, [storedMatches]);

  const currentResult = storedMatches[retrievalIndex];
  const isNotFound = hasQuery && exactMatches.length === 0;
  const panelMatchPreviewCount = isMobileViewport ? 2 : isTabletViewport ? 4 : 7;
  const visibleExactMatches = useMemo(
    () => exactMatches.slice(0, panelMatchPreviewCount),
    [exactMatches, panelMatchPreviewCount]
  );
  const hiddenExactMatchesCount = Math.max(0, exactMatches.length - visibleExactMatches.length);

  const isAdminUser = useMemo(() => {
    const role = String(currentUser?.role ?? '').toLowerCase();
    return role === 'admin' || role === 'super-admin';
  }, [currentUser?.role]);

  const storeByName = useMemo(() => {
    const map = new Map<string, (typeof stores)[number]>();
    for (const store of stores) map.set(store.store_name, store);
    return map;
  }, [stores]);

  const storedBlanketsByStore = useMemo(() => {
    const map = new Map<string, Blanket[]>();
    for (const blanket of blankets) {
      if (blanket.status !== 'stored') continue;
      const list = map.get(blanket.store);
      if (list) list.push(blanket);
      else map.set(blanket.store, [blanket]);
    }
    return map;
  }, [blankets]);

  const summaryStoreData = useMemo(() => {
    if (!managementStoreName) return null;
    const store = storeByName.get(managementStoreName);
    if (!store) return null;
    const storedItems = storedBlanketsByStore.get(managementStoreName) ?? [];
    const totalSlots = Math.max(1, store.rows * store.columns);
    const byNumber = new Map<string, number>();
    for (const item of storedItems) {
      const key = item.blanket_number.trim().toLowerCase();
      byNumber.set(key, (byNumber.get(key) ?? 0) + 1);
    }
    const duplicateCount = Array.from(byNumber.values()).filter((count) => count > 1).length;
    const latestLog = logs
      .filter((log) => log.store === managementStoreName)
      .slice()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    return {
      store,
      storedItems,
      totalSlots,
      occupancy: Math.round((storedItems.length / totalSlots) * 100),
      emptySlots: getEmptySlots(managementStoreName).length,
      duplicateCount,
      lastUpdated: latestLog?.timestamp ?? '-',
    };
  }, [managementStoreName, storeByName, storedBlanketsByStore, logs]);

  const storeHistoryRows = useMemo(() => {
    if (!managementStoreName) return [] as Array<{ id: number; action: string; user: string; timestamp: string; reason?: string }>;
    return logs
      .filter((log) => log.store === managementStoreName)
      .slice()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 300)
      .map((log) => ({
        id: log.id,
        action: log.action,
        user: log.user,
        timestamp: log.timestamp,
        reason: log.notes ?? undefined,
      }));
  }, [managementStoreName, logs]);

  const storeHealthData = useMemo(() => {
    if (!managementStoreName) return null;
    const store = storeByName.get(managementStoreName);
    if (!store) return null;
    const stored = storedBlanketsByStore.get(managementStoreName) ?? [];
    const capacity = store.store_type === 'hanger' ? 1 : Math.max(1, Number((store as any).slot_capacity ?? 1));

    const byNumber = new Map<string, number>();
    for (const item of stored) {
      const key = item.blanket_number.trim().toLowerCase();
      byNumber.set(key, (byNumber.get(key) ?? 0) + 1);
    }
    const duplicateNumbers = Array.from(byNumber.values()).filter((count) => count > 1).length;

    const invalidNumbers = stored.filter((item) => !item.blanket_number || item.blanket_number.trim().length === 0).length;
    const invalidSlots = stored.filter(
      (item) => item.row < 1 || item.row > store.rows || item.column < 1 || item.column > store.columns
    );

    const rowCounts = new Map<number, number>();
    for (const item of stored) rowCounts.set(item.row, (rowCounts.get(item.row) ?? 0) + 1);
    const fullRows = Array.from(rowCounts.values()).filter((count) => count >= store.columns * capacity).length;

    const nowMs = Date.now();
    const tenDaysMs = 10 * 24 * 60 * 60 * 1000;
    const oldStoredItems = stored.filter((item) => {
      const t = Date.parse(item.created_at);
      return Number.isFinite(t) && nowMs - t > tenDaysMs;
    }).length;

    const missingScanRecords = stored.filter((item) => {
      return !logs.some(
        (log) =>
          log.store === managementStoreName &&
          String(log.blanket_number).trim().toLowerCase() === item.blanket_number.trim().toLowerCase()
      );
    }).length;

    const emptySlots = getEmptySlots(managementStoreName);
    const emptyGaps = emptySlots.length;

    const suggestedActions: string[] = [];
    if (duplicateNumbers > 0) suggestedActions.push('Resolve duplicate numbers before next shift.');
    if (invalidSlots.length > 0) suggestedActions.push('Fix out-of-bounds cell assignments.');
    if (oldStoredItems > 0) suggestedActions.push('Review aged items and escalate delayed orders.');
    if (missingScanRecords > 0) suggestedActions.push('Enforce scan records for traceability.');
    if (fullRows > 0) suggestedActions.push('Redistribute full rows to balance capacity.');

    return {
      duplicateNumbers,
      invalidNumbers: invalidNumbers + invalidSlots.length,
      emptyGaps,
      oldStoredItems,
      missingScanRecords,
      fullRows,
      suggestedActions,
    };
  }, [managementStoreName, storeByName, storedBlanketsByStore, logs]);

  function getEmptySlots(storeName: string) {
    const store = storeByName.get(storeName);
    if (!store) return [] as Array<{ row: number; column: number }>;
    const occupied = new Set<string>();
    for (const blanket of storedBlanketsByStore.get(storeName) ?? []) {
      occupied.add(`${blanket.row}:${blanket.column}`);
    }
    const slots: Array<{ row: number; column: number }> = [];
    for (let row = 1; row <= store.rows; row += 1) {
      for (let column = 1; column <= store.columns; column += 1) {
        if (!occupied.has(`${row}:${column}`)) slots.push({ row, column });
      }
    }
    return slots;
  }

  useEffect(() => {
    if (storedMatches.length > 1) {
      setRetrievalMode(true);
    } else {
      setRetrievalMode(false);
      setRetrievalIndex(0);
    }
    
    if (!hasSearchInput) {
      setSearchPanelOpen(false);
      setMobilePanelSnap('peek');
      return;
    }
    setSearchPanelOpen(true);
    if (isMobileViewport) {
      setMobilePanelSnap('expanded');
    } else if (mobilePanelSnap !== 'expanded') {
      setMobilePanelSnap('peek');
    }

    if (storedMatches.length > 0) {
      setSelectedStore(storedMatches[0].store);
    }
  }, [storedMatches.length, exactMatches.length, hasSearchInput, isMobileViewport, mobilePanelSnap, setRetrievalMode, setRetrievalIndex, setSelectedStore]);

  useEffect(() => {
    if (retrievalMode || exactMatches.length > 0) {
      setSuggestionsOpen(false);
    }
  }, [retrievalMode, exactMatches.length]);

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

  const completeMarkAsPicked = async (payload: Blanket) => {
    setPickError(null);
    try {
      await markAsPicked(payload);
    } catch (error: any) {
      const message = typeof error?.message === 'string' ? error.message : 'Failed to mark as picked.';
      console.error('markAsPicked failed:', error);
      setPickError(message);
      return false;
    }

    if (retrievalIndex < storedMatches.length - 1) {
      setRetrievalIndex(retrievalIndex + 1);
    } else {
      setRetrievalMode(false);
      setRetrievalIndex(0);
      setSearchPanelOpen(true);
    }
    return true;
  };

  completeMarkAsPickedRef.current = completeMarkAsPicked;

  const handleMarkAsPicked = async () => {
    if (!currentResult) return;
    const payload: Blanket = {
      id: currentResult.id,
      blanket_number: currentResult.blanket_number,
      store: currentResult.store,
      row: currentResult.row,
      column: currentResult.column,
      status: currentResult.status,
      created_at: currentResult.created_at,
    };
    const store = stores.find((entry) => entry.store_name === currentResult.store);
    if (store?.require_pick_scan) {
      setPickError(null);
      setScannerError(null);
      setPendingPickScanBlanket(payload);
      pendingPickScanBlanketRef.current = payload;
      setScannerMode('pick-confirm');
      scannerModeRef.current = 'pick-confirm';
      setScannerOpen(true);
      return;
    }

    const marked = await completeMarkAsPicked(payload);
    if (!marked) {
      return;
    }
  };

  const scannerHeaderLabel = scannerMode === 'pick-confirm' ? 'Picked verification' : 'Scanner mode';
  const scannerHint =
    scannerMode === 'pick-confirm'
      ? `Scan the picked invoice now. Required: #${pendingPickScanBlanket?.blanket_number ?? ''}`
      : 'Point the camera at the sticker QR / barcode';
  const scannerFooterHint =
    scannerMode === 'pick-confirm'
      ? 'Scanning… it will mark as picked only when the scanned code matches exactly.'
      : 'Scanning… it will auto-search when the code is detected.';

  const openSearchScanner = () => {
    setScannerError(null);
    setScannerPreview(null);
    setScannerMode('search');
    scannerModeRef.current = 'search';
    setPendingPickScanBlanket(null);
    pendingPickScanBlanketRef.current = null;
    setScannerOpen(true);
  };

  const closeScanner = () => {
    setScannerOpen(false);
    setScannerPreview(null);
    setPendingPickScanBlanket(null);
    pendingPickScanBlanketRef.current = null;
    setScannerMode('search');
    scannerModeRef.current = 'search';
  };

  const buildExportRows = (
    scope: 'current' | 'all',
    storedOnly: boolean,
    includeEmptySlots: boolean,
    includeHistory: boolean,
    fixedStoreName?: string | null
  ) => {
    const scopedStores =
      scope === 'current'
        ? stores.filter((store) => store.store_name === fixedStoreName)
        : stores;
    const rows: Array<Record<string, unknown>> = [];

    const scopedStoreNames = new Set(scopedStores.map((store) => store.store_name));
    const blanketList = blankets.filter((blanket) =>
      scopedStoreNames.has(blanket.store) && (!storedOnly || blanket.status === 'stored')
    );

    const logsByBlanket = new Map<string, Log[]>();
    for (const log of logs) {
      if (!log.store || !log.blanket_number) continue;
      const key = `${log.store}::${log.blanket_number}`;
      const list = logsByBlanket.get(key);
      if (list) list.push(log);
      else logsByBlanket.set(key, [log]);
    }

    for (const blanket of blanketList) {
      const key = `${blanket.store}::${blanket.blanket_number}`;
      const relatedLogs = (logsByBlanket.get(key) ?? []).slice().sort((a, b) => {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      });
      const createdLog = relatedLogs.find((log) => log.action === 'stored') ?? relatedLogs[0];
      const updatedLog = relatedLogs[relatedLogs.length - 1];

      const parseMeta = (rawNotes: unknown) => {
        const text = String(rawNotes ?? '');
        const customerMatch = text.match(/customer\s*:\s*([^|]+)/i);
        const orderMatch = text.match(/order\s*:\s*([^|]+)/i);
        return {
          customer: customerMatch ? customerMatch[1].trim() : '',
          order: orderMatch ? orderMatch[1].trim() : '',
        };
      };
      const meta = parseMeta(createdLog?.notes ?? updatedLog?.notes);

      rows.push({
        Store: blanket.store,
        Row: blanket.row,
        Column: blanket.column,
        Number: blanket.blanket_number,
        Status: blanket.status,
        Customer: meta.customer,
        Order: meta.order,
        Notes: updatedLog?.notes ?? '',
        CreatedBy: createdLog?.user ?? '',
        UpdatedBy: updatedLog?.user ?? '',
        CreatedAt: createdLog?.timestamp ?? blanket.created_at,
        UpdatedAt: updatedLog?.timestamp ?? blanket.created_at,
      });
    }

    if (includeEmptySlots) {
      for (const store of scopedStores) {
        const emptySlots = getEmptySlots(store.store_name);
        for (const slot of emptySlots) {
          rows.push({
            Store: store.store_name,
            Row: slot.row,
            Column: slot.column,
            Number: '',
            Status: 'empty',
            Customer: '',
            Order: '',
            Notes: '',
            CreatedBy: '',
            UpdatedBy: '',
            CreatedAt: '',
            UpdatedAt: '',
          });
        }
      }
    }

    if (includeHistory) {
      for (const log of logs) {
        if (!log.store || !scopedStoreNames.has(log.store)) continue;
        rows.push({
          Store: log.store,
          Row: log.row ?? '',
          Column: log.column ?? '',
          Number: log.blanket_number ?? '',
          Status: log.status ?? '',
          Customer: '',
          Order: '',
          Notes: log.notes ?? '',
          CreatedBy: log.user ?? '',
          UpdatedBy: log.user ?? '',
          CreatedAt: log.timestamp ?? '',
          UpdatedAt: log.timestamp ?? '',
        });
      }
    }

    return rows;
  };

  const exportRowsToWorkbook = (rows: Array<Record<string, unknown>>, filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'StoreExport');
    XLSX.writeFile(workbook, filename);
  };

  const exportCurrentStoreBackup = (storeName: string) => {
    const rows = buildExportRows('current', false, false, false, storeName);
    exportRowsToWorkbook(rows, `store-backup-${storeName}-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.xlsx`);
  };

  const performEmptyStore = async (storeName: string) => {
    setEmptyBusy(true);
    setStoreActionError(null);
    try {
      const blanketsBase = isSupabaseEnabled ? '/api/supabase/blankets' : '/api/blankets';
      const userName = currentUser?.username || 'system';
      const response = await axios.post(`${blanketsBase}/empty-store`, {
        storeName,
        reason: emptyReason.trim(),
        user: userName,
      });

      const responseBlankets = Array.isArray(response.data?.blankets) ? response.data.blankets : null;
      useStore.setState((state) => ({
        blankets: responseBlankets
          ? [...state.blankets.filter((item) => item.store !== storeName), ...responseBlankets]
          : state.blankets.map((item) =>
              item.store === storeName && item.status === 'stored'
                ? { ...item, status: 'retrieved' as const }
                : item
            ),
      }));

      void fetchLogs();
      setEmptyStoreName(null);
      setEmptyConfirmText('');
      setEmptyReason('');
      setManagementStep('main');
    } catch (error: any) {
      setStoreActionError(error?.message || 'Failed to empty store.');
    } finally {
      setEmptyBusy(false);
    }
  };

  const parseImportFile = async (file: File, storeName: string) => {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) throw new Error('No worksheet found in the file.');
    const worksheet = workbook.Sheets[firstSheetName];

    const matrixRaw = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(worksheet, {
      header: 1,
      defval: '',
      raw: false,
    });
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '', raw: false });

    const normalizeHeader = (header: string) => header.trim().toLowerCase().replace(/[\s_\-]+/g, '');
    const normalizeStoreKey = (value: string) => value.trim().toLowerCase().replace(/[\s_\-]+/g, '');
    const canonicalizeStoreName = (raw: string) => {
      const trimmed = String(raw ?? '').trim();
      if (!trimmed) return '';
      const normalized = trimmed.replace(/\s+/g, ' ').toLowerCase();
      const mapped = normalized
        .replace(/front/g, 'front')
        .replace(/back/g, 'back')
        .replace(/\s*-\s*/g, ' ')
        .trim();
      const parts = mapped.split(' ').filter(Boolean);
      if (parts.length >= 2) {
        const first = parts[0].toUpperCase();
        const rest = parts.slice(1).join('-');
        return `${first}-${rest}`;
      }
      return trimmed.replace(/\s+/g, '-');
    };
    const toText = (value: unknown) => String(value ?? '').trim();
    const toIntOrNull = (value: unknown) => {
      const text = toText(value);
      if (!text) return null;
      const parsed = Number(text);
      if (!Number.isFinite(parsed)) return null;
      return Math.trunc(parsed);
    };

    const storeAliasMap = new Map<string, string>();
    for (const store of stores) {
      const base = normalizeStoreKey(store.store_name);
      storeAliasMap.set(base, store.store_name);
      storeAliasMap.set(base.replace(/front/g, 'fr').replace(/back/g, 'bk'), store.store_name);
      storeAliasMap.set(base.replace(/fr/g, 'front').replace(/bk/g, 'back'), store.store_name);
    }
    const resolveStoreName = (raw: string) => {
      const key = normalizeStoreKey(raw);
      if (!key) return null;
      if (storeAliasMap.has(key)) return storeAliasMap.get(key)!;
      const hyphenVariant = key.replace(/([a-z])([0-9])/gi, '$1$2');
      if (storeAliasMap.has(hyphenVariant)) return storeAliasMap.get(hyphenVariant)!;
      const canonical = canonicalizeStoreName(raw);
      return canonical || null;
    };

    const pickValue = (row: Record<string, unknown>, keys: string[]) => {
      const map = new Map<string, unknown>();
      for (const [k, v] of Object.entries(row)) map.set(normalizeHeader(k), v);
      for (const key of keys) {
        const value = map.get(normalizeHeader(key));
        if (value != null && String(value).trim() !== '') return String(value).trim();
      }
      return '';
    };

    const existingNumberLocations = new Map<string, { store: string; row: number; column: number }>();
    for (const item of blankets) {
      if (item.status !== 'stored') continue;
      const key = item.blanket_number.trim().toLowerCase();
      if (!key || existingNumberLocations.has(key)) continue;
      existingNumberLocations.set(key, { store: item.store, row: item.row, column: item.column });
    }

    const usedSlotsByStore = new Map<string, Set<string>>();
    for (const store of stores) {
      const set = new Set<string>();
      for (const item of storedBlanketsByStore.get(store.store_name) ?? []) {
        set.add(`${item.row}:${item.column}`);
      }
      usedSlotsByStore.set(store.store_name, set);
    }
    const plannedSlotsByStore = new Map<string, Set<string>>();
    const emptySlotsByStore = new Map<string, Array<{ row: number; column: number }>>();
    const emptyCursorByStore = new Map<string, number>();

    const getNextEmptySlot = (resolvedStoreName: string) => {
      const slots = emptySlotsByStore.get(resolvedStoreName) ?? getEmptySlots(resolvedStoreName);
      if (!emptySlotsByStore.has(resolvedStoreName)) {
        emptySlotsByStore.set(resolvedStoreName, slots);
      }
      const cursor = emptyCursorByStore.get(resolvedStoreName) ?? 0;
      const slot = slots[cursor];
      if (!slot) return null;
      emptyCursorByStore.set(resolvedStoreName, cursor + 1);
      return slot;
    };

    const preview: StoreImportPreviewRow[] = [];
    const duplicateTracker = new Set<string>();

    const matrixRows = matrixRaw.map((row) => row.map((cell) => toText(cell)));
    const matrixColumnCount = matrixRows.reduce((max, row) => Math.max(max, row.length), 0);
    const paddedMatrix = matrixRows.map((row) => {
      const padded = row.slice();
      while (padded.length < matrixColumnCount) padded.push('');
      return padded;
    });

    const firstRow = paddedMatrix[0] ?? [];
    const secondRow = paddedMatrix[1] ?? [];
    const firstRowHasHeaderKeywords = firstRow.some((cell) => {
      const h = normalizeHeader(cell);
      return ['number', 'store', 'row', 'column', 'customer', 'order', 'notes'].includes(h);
    });
    const firstRowStoreColumns = firstRow.map((cell, index) => ({ cell, index }));
    const nonEmptyStoreHeaderCount = firstRowStoreColumns.filter((entry) => entry.cell.length > 0).length;
    const numericColumnsCount = secondRow.filter((value) => /^\d+$/.test(String(value).trim())).length;
    const dataFilledCount = paddedMatrix
      .slice(2)
      .reduce((acc, row) => acc + row.filter((cell) => String(cell).trim().length > 0).length, 0);
    const isMatrixLayout =
      !firstRowHasHeaderKeywords &&
      nonEmptyStoreHeaderCount >= 1 &&
      numericColumnsCount >= 2 &&
      dataFilledCount >= 1;
    const layoutType: StoreImportMeta['layoutType'] = isMatrixLayout ? 'matrix' : 'table';

    const matrixRequirements = new Map<string, { reqRows: number; reqCols: number }>();

    if (isMatrixLayout) {
      const effectiveStoreHeaders: string[] = [];
      let currentStoreHeader = '';
      for (let c = 0; c < matrixColumnCount; c += 1) {
        const raw = String(firstRow[c] ?? '').trim();
        if (raw) currentStoreHeader = raw;
        effectiveStoreHeaders[c] = currentStoreHeader;
      }
      const effectiveColumnHeaders: Array<number | null> = [];
      for (let c = 0; c < matrixColumnCount; c += 1) {
        const parsed = toIntOrNull(secondRow[c]);
        effectiveColumnHeaders[c] = parsed;
      }
      const dataRowCount = Math.max(0, paddedMatrix.length - 2);
      for (let c = 0; c < matrixColumnCount; c += 1) {
        const storeRaw = effectiveStoreHeaders[c] ?? '';
        const resolvedStore = resolveStoreName(storeRaw);
        const targetColumn = effectiveColumnHeaders[c];
        if (!resolvedStore || targetColumn == null) continue;
        const rec = matrixRequirements.get(resolvedStore) ?? { reqRows: 0, reqCols: 0 };
        rec.reqRows = Math.max(rec.reqRows, dataRowCount);
        rec.reqCols = Math.max(rec.reqCols, targetColumn);
        matrixRequirements.set(resolvedStore, rec);
      }

      for (let r = 2; r < paddedMatrix.length; r += 1) {
        for (let c = 0; c < matrixColumnCount; c += 1) {
          const value = paddedMatrix[r]?.[c] ?? '';
          if (!value) continue;
          const storeRaw = effectiveStoreHeaders[c] ?? '';
          const resolvedStore = resolveStoreName(storeRaw);
          const targetColumn = effectiveColumnHeaders[c];
          const targetRow = r - 1;
          const errors: string[] = [];

          if (!resolvedStore) errors.push(`Store not recognized: ${storeRaw || '(blank)'}`);
          if (targetColumn == null) errors.push(`Invalid column in header row 2: ${secondRow[c] || '(blank)'}`);
          if (resolvedStore && lockedStores[resolvedStore]) errors.push('Target store is locked');

          const targetStore = resolvedStore ?? '';
          const storeDef = resolvedStore ? storeByName.get(resolvedStore) : null;
          if (resolvedStore && !storeDef) {
            // Unknown store is allowed; it can be auto-created during import.
          }
          if (resolvedStore && storeDef) {
            if (targetRow < 1 || targetRow > storeDef.rows) {
              errors.push(`Row out of bounds (1..${storeDef.rows})`);
            }
            if (targetColumn != null && (targetColumn < 1 || targetColumn > storeDef.columns)) {
              errors.push(`Column out of bounds (1..${storeDef.columns})`);
            }
            if (targetColumn != null) {
              const slotKey = `${targetRow}:${targetColumn}`;
              if (usedSlotsByStore.get(resolvedStore)?.has(slotKey)) errors.push('Slot already occupied');
              const planned = plannedSlotsByStore.get(resolvedStore) ?? new Set<string>();
              if (planned.has(slotKey)) errors.push('Duplicate target slot in imported file');
              planned.add(slotKey);
              plannedSlotsByStore.set(resolvedStore, planned);
            }
          }

          const numberKey = value.toLowerCase();
          const existingLocation = existingNumberLocations.get(numberKey);
          if (existingLocation) {
            errors.push(
              `Duplicate existing at ${existingLocation.store} R${existingLocation.row}:C${existingLocation.column} -> excel target R${targetRow}:C${targetColumn ?? '-'}`
            );
          }
          if (duplicateTracker.has(numberKey)) errors.push('Duplicate number in imported file');
          duplicateTracker.add(numberKey);

          preview.push({
            number: value,
            store: targetStore,
            row: targetRow,
            column: targetColumn,
            customer: '',
            order: '',
            notes: `Imported from matrix cell`,
            errors,
            sourceExcelRow: r + 1,
            sourceExcelColumn: c + 1,
          });
        }
      }
    } else {
      for (const rawRow of rawRows) {
        const number = pickValue(rawRow, ['number', 'blanketnumber', 'blanket', 'invoice', 'orderno']);
        const rowRaw = pickValue(rawRow, ['row', 'r']);
        const columnRaw = pickValue(rawRow, ['column', 'col', 'c']);
        const customer = pickValue(rawRow, ['customer', 'customername']);
        const order = pickValue(rawRow, ['order', 'orderno', 'orderid']);
        const notes = pickValue(rawRow, ['notes', 'note', 'remarks']);
        const storeRaw = pickValue(rawRow, ['store', 'storename', 'location']);
        const resolvedStore = storeRaw ? resolveStoreName(storeRaw) : storeName;

        const errors: string[] = [];
        let row = rowRaw ? Number(rowRaw) : null;
        let column = columnRaw ? Number(columnRaw) : null;

        if (!number) {
          continue;
        }
        if (!resolvedStore) errors.push(`Store not recognized: ${storeRaw}`);
        if (resolvedStore && lockedStores[resolvedStore]) errors.push('Target store is locked');
        const storeDef = resolvedStore ? storeByName.get(resolvedStore) : null;
        if (resolvedStore && !storeDef) {
          // Unknown store is allowed; it can be auto-created during import.
        }

        if (!rowRaw && !columnRaw && resolvedStore) {
          const slot = getNextEmptySlot(resolvedStore);
          if (!slot) {
            errors.push('Auto-assign required (store will expand if needed)');
          } else {
            row = slot.row;
            column = slot.column;
          }
        } else if ((rowRaw && !columnRaw) || (!rowRaw && columnRaw)) {
          errors.push('Both Row and Column are required when one is provided');
        }

        if (storeDef && row != null && (!Number.isFinite(row) || row < 1 || row > storeDef.rows)) {
          errors.push(`Row out of bounds (1..${storeDef.rows})`);
        }
        if (storeDef && column != null && (!Number.isFinite(column) || column < 1 || column > storeDef.columns)) {
          errors.push(`Column out of bounds (1..${storeDef.columns})`);
        }

        if (resolvedStore && row != null && column != null) {
          const slotKey = `${Math.trunc(row)}:${Math.trunc(column)}`;
          if (usedSlotsByStore.get(resolvedStore)?.has(slotKey)) errors.push('Slot already occupied');
          const planned = plannedSlotsByStore.get(resolvedStore) ?? new Set<string>();
          if (planned.has(slotKey)) errors.push('Duplicate target slot in imported file');
          planned.add(slotKey);
          plannedSlotsByStore.set(resolvedStore, planned);
        }

        const numberKey = number.toLowerCase();
        const existingLocation = existingNumberLocations.get(numberKey);
        if (existingLocation) {
          errors.push(
            `Duplicate existing at ${existingLocation.store} R${existingLocation.row}:C${existingLocation.column} -> excel target R${row ?? '-'}:C${column ?? '-'}`
          );
        }
        if (duplicateTracker.has(numberKey)) errors.push('Duplicate number in imported file');
        duplicateTracker.add(numberKey);

        preview.push({
          number,
          store: resolvedStore ?? '',
          row: row == null ? null : Math.trunc(row),
          column: column == null ? null : Math.trunc(column),
          customer,
          order,
          notes,
          errors,
        });
      }
    }

    const invalidCount = preview.filter((row) => row.errors.length > 0).length;
    const duplicateCount = preview.filter((row) => row.errors.some((err) => err.toLowerCase().includes('duplicate'))).length;
    const notEnoughSlots = 0;
    const conflictCount = preview.filter((row) => row.errors.some((err) => err.toLowerCase().includes('occupied'))).length;
    const skippedCount = invalidCount;

    const matrixPreview = isMatrixLayout
      ? {
          rowCount: paddedMatrix.length,
          columnCount: matrixColumnCount,
          cells: paddedMatrix.map((row, r) =>
            row.map((value, c) => {
              if (r === 0) return { value, kind: 'header-store' as const, status: 'header' as const };
              if (r === 1) return { value, kind: 'header-column' as const, status: 'header' as const };
              if (!value) return { value: '', kind: 'empty' as const, status: 'empty' as const };
              const mapped = preview.find((item) => item.sourceExcelRow === r + 1 && item.sourceExcelColumn === c + 1);
              if (!mapped) return { value, kind: 'data' as const, status: 'invalid' as const, errors: ['Unmapped data cell'] };
              const hasDuplicate = mapped.errors.some((err) => err.toLowerCase().includes('duplicate'));
              const status = mapped.errors.length === 0 ? 'valid' : hasDuplicate ? 'duplicate' : 'invalid';
              const tooltip = `Store: ${mapped.store || '-'}\nRow: ${mapped.row ?? '-'}\nColumn: ${mapped.column ?? '-'}\nNumber: ${mapped.number}\nStatus: ${status.toUpperCase()}`;
              return {
                value,
                kind: 'data' as const,
                status: status as 'valid' | 'duplicate' | 'invalid',
                tooltip,
                errors: mapped.errors,
              };
            })
          ),
        }
      : undefined;

    const emptySlotsAvailable =
      isMatrixLayout
        ? Array.from(
            new Set(
              preview
                .map((item) => item.store)
                .filter(Boolean)
            )
          ).reduce((acc, s) => acc + getEmptySlots(s).length, 0)
        : getEmptySlots(storeName).length;

    const expansionByStore = new Map<string, { reqRows: number; reqCols: number }>();
    for (const [storeNameKey, req] of matrixRequirements.entries()) {
      expansionByStore.set(storeNameKey, { reqRows: req.reqRows, reqCols: req.reqCols });
    }
    for (const row of preview) {
      if (!row.store || row.row == null || row.column == null) continue;
      const rec = expansionByStore.get(row.store) ?? { reqRows: 0, reqCols: 0 };
      rec.reqRows = Math.max(rec.reqRows, row.row);
      rec.reqCols = Math.max(rec.reqCols, row.column);
      expansionByStore.set(row.store, rec);
    }
    const expansionSummary = Array.from(expansionByStore.entries()).map(([storeNameKey, req]) => {
      const existingStore = storeByName.get(storeNameKey);
      const oldRows = existingStore?.rows ?? 0;
      const oldColumns = existingStore?.columns ?? 0;
      return {
        store: storeNameKey,
        oldRows,
        oldColumns,
        newRows: Math.max(oldRows, req.reqRows),
        newColumns: Math.max(oldColumns, req.reqCols),
      };
    }).filter((entry) => entry.newRows > entry.oldRows || entry.newColumns > entry.oldColumns || entry.oldRows === 0 || entry.oldColumns === 0);

    if (preview.length === 0) {
      throw new Error('The uploaded file is empty or has no importable cells.');
    }

    setImportPreview(preview);
    setImportMeta({
      fileName: file.name,
      layoutType,
      totalRows: preview.length,
      totalCells: matrixColumnCount * Math.max(0, paddedMatrix.length),
      filledCells: preview.length,
      validCount: preview.length - invalidCount,
      invalidCount,
      duplicateCount,
      conflictCount,
      skippedCount,
      notEnoughSlots,
      emptySlotsAvailable,
      expansionSummary,
      matrix: matrixPreview,
    });
  };

  const handleImportFilePicked = async (file: File) => {
    if (!importTargetStore) return;
    try {
      await parseImportFile(file, importTargetStore);
    } catch (error: any) {
      setStoreActionError(error?.message || 'Failed to parse import file.');
    }
  };

  const openStoreManagement = (storeName: string) => {
    setStoreActionError(null);
    setManagementStoreName(storeName);
    setManagementStep('main');
    setMoveStoreName(storeName);
    setMoveTargetStore(stores.find((item) => item.store_name !== storeName)?.store_name ?? '');
    setExportStoreName(storeName);
    setExportScope('current');
    setExportStoredOnly(true);
    setExportIncludeEmptySlots(false);
    setExportIncludeHistory(false);
    setImportTargetStore(storeName);
    setImportPreview(null);
    setImportMeta(null);
    setImportProgress(null);
    setImportResult(null);
    setImportConflictStrategy('fill_empty_only');
    setImportDuplicateStrategy('skip_duplicates');
    setImportUnknownStoreStrategy('auto_create');
    setPrintLabelMode('all');
  };

  const closeStoreManagement = () => {
    setManagementStoreName(null);
    setManagementStep('main');
    setStoreActionError(null);
    setMoveStoreName(null);
    setMoveTargetStore('');
    setImportPreview(null);
    setImportMeta(null);
    setImportProgress(null);
    setImportResult(null);
    setImportBusy(false);
    setEmptyStoreName(null);
    setEmptyConfirmText('');
    setEmptyReason('');
    setEmptyBusy(false);
  };

  const handleManagementAction = (action: StoreManagementAction) => {
    if (!managementStoreName) return;
    setStoreActionError(null);

    if (action === 'toggle_lock') {
      setLockedStores((prev) => ({ ...prev, [managementStoreName]: !prev[managementStoreName] }));
      return;
    }
    if (action === 'clear_empty_cells') {
      setStoreActionError('No persisted empty-cell records to clear. Empty slots are virtual and already clean.');
      return;
    }
    if (action === 'empty_store' && !isAdminUser) {
      setStoreActionError('Empty Store is allowed for admin/super-admin only.');
      return;
    }

    switch (action) {
      case 'summary':
        setManagementStep('summary');
        return;
      case 'import_excel':
        setManagementStep('import');
        return;
      case 'export_excel':
        setManagementStep('export');
        return;
      case 'move_all':
        setManagementStep('move');
        return;
      case 'print_labels':
        setManagementStep('print');
        return;
      case 'health_check':
        setManagementStep('health');
        return;
      case 'history':
        setManagementStep('history');
        return;
      case 'empty_store':
        setEmptyStoreName(managementStoreName);
        setEmptyConfirmText('');
        setEmptyReason('');
        setManagementStep('empty');
        return;
      default:
        return;
    }
  };

  const executeImport = async (mode: 'valid_only' | 'force') => {
    if (!importPreview || importPreview.length === 0) {
      setStoreActionError('No import data found.');
      return;
    }

    const startedAt = Date.now();
    const results = {
      imported: 0,
      skippedEmpty: 0,
      skippedInvalid: 0,
      skippedDuplicates: 0,
      skippedConflicts: 0,
      replaced: 0,
      expandedStores: 0,
      storesUpdated: new Set<string>(),
    };

    const requestMeta = {
      request_id: (globalThis.crypto as any)?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      device: typeof navigator !== 'undefined' ? String(navigator.userAgent || '').slice(0, 280) : '',
    };
    const userName = currentUser?.username || 'system';
    const blanketsBase = isSupabaseEnabled ? '/api/supabase/blankets' : '/api/blankets';
    const updateProgress = (phase: string, current: number, total: number) => {
      const safeTotal = Math.max(1, total);
      setImportProgress({
        phase,
        current,
        total: safeTotal,
        percent: Math.max(0, Math.min(100, Math.round((current / safeTotal) * 100))),
      });
    };

    setImportBusy(true);
    setStoreActionError(null);
    setImportResult(null);

    try {
      updateProgress('Parsing file', 1, 7);
      const previewRows = importPreview.map((row) => ({
        ...row,
        errors: Array.isArray(row.errors) ? [...row.errors] : [],
      }));
      const currentStoreMap = new Map(stores.map((s) => [s.store_name, { ...s }]));
      const storeChangeMap = new Map<
        string,
        { store_name: string; rows: number; columns: number; createIfMissing: boolean; note: string }
      >();

      const ensureStoreInPlan = (
        storeName: string,
        reqRows: number,
        reqCols: number,
        note: string,
        createIfMissing = false
      ) => {
        const existing = currentStoreMap.get(storeName);
        if (!existing && !createIfMissing) return;
        if (!existing && createIfMissing) {
          const provisional = {
            store_name: storeName,
            rows: Math.max(1, reqRows || 1),
            columns: Math.max(1, reqCols || 1),
            store_type: 'grid',
            slot_capacity: 1,
          } as any;
          currentStoreMap.set(storeName, provisional);
          storeChangeMap.set(storeName, {
            store_name: storeName,
            rows: provisional.rows,
            columns: provisional.columns,
            createIfMissing: true,
            note,
          });
          return;
        }
        const storeDef = currentStoreMap.get(storeName)! as any;
        const nextRows = Math.max(Number(storeDef.rows || 1), Math.max(1, Number(reqRows || 1)));
        const nextCols = Math.max(Number(storeDef.columns || 1), Math.max(1, Number(reqCols || 1)));
        storeDef.rows = nextRows;
        storeDef.columns = nextCols;
        const prev = storeChangeMap.get(storeName);
        if (prev) {
          prev.rows = Math.max(prev.rows, nextRows);
          prev.columns = Math.max(prev.columns, nextCols);
          return;
        }
        if (!existing || nextRows !== Number((existing as any).rows || 1) || nextCols !== Number((existing as any).columns || 1)) {
          storeChangeMap.set(storeName, {
            store_name: storeName,
            rows: nextRows,
            columns: nextCols,
            createIfMissing: false,
            note,
          });
        }
      };

      updateProgress('Detecting layout', 2, 7);
      // Apply unknown store strategy.
      for (const row of previewRows) {
        const hasStore = Boolean(row.store && row.store.trim().length > 0);
        if (!hasStore) {
          if (importUnknownStoreStrategy === 'skip_unknown') {
            row.errors.push('Unknown store skipped by strategy');
            continue;
          }
          if (importUnknownStoreStrategy === 'map_to_selected') {
            row.store = importTargetStore || selectedStore || stores[0]?.store_name || '';
            continue;
          }
          const fallback = importTargetStore || selectedStore || stores[0]?.store_name || '';
          row.store = row.store || fallback;
          continue;
        }

        const known = currentStoreMap.has(row.store);
        if (!known && importUnknownStoreStrategy === 'skip_unknown') {
          row.errors.push(`Unknown store skipped: ${row.store}`);
          continue;
        }
        if (!known && importUnknownStoreStrategy === 'map_to_selected') {
          row.store = importTargetStore || selectedStore || stores[0]?.store_name || row.store;
        }
      }

      updateProgress('Calculating store expansion', 3, 7);
      const requirementsByStore = new Map<string, { reqRows: number; reqCols: number }>();
      for (const item of importMeta?.expansionSummary ?? []) {
        if (!item?.store) continue;
        const rec = requirementsByStore.get(item.store) ?? { reqRows: 0, reqCols: 0 };
        rec.reqRows = Math.max(rec.reqRows, Number(item.newRows || 0));
        rec.reqCols = Math.max(rec.reqCols, Number(item.newColumns || 0));
        requirementsByStore.set(item.store, rec);
      }
      for (const row of previewRows) {
        if (!row.store || row.row == null || row.column == null) continue;
        const rec = requirementsByStore.get(row.store) ?? { reqRows: 0, reqCols: 0 };
        rec.reqRows = Math.max(rec.reqRows, row.row);
        rec.reqCols = Math.max(rec.reqCols, row.column);
        requirementsByStore.set(row.store, rec);
      }

      for (const [storeNameKey, req] of requirementsByStore.entries()) {
        const storeDef = currentStoreMap.get(storeNameKey) || null;
        if (!storeDef && importUnknownStoreStrategy === 'auto_create') {
          ensureStoreInPlan(
            storeNameKey,
            Math.max(1, req.reqRows || 1),
            Math.max(1, req.reqCols || 1),
            `Auto-created during import file ${importMeta?.fileName || '-'}`,
            true
          );
          results.expandedStores += 1;
          results.storesUpdated.add(storeNameKey);
          continue;
        }
        if (!storeDef) continue;
        const beforeRows = Number((storeDef as any).rows || 1);
        const beforeCols = Number((storeDef as any).columns || 1);
        ensureStoreInPlan(
          storeNameKey,
          Math.max(beforeRows, req.reqRows || beforeRows),
          Math.max(beforeCols, req.reqCols || beforeCols),
          `Import ${importMeta?.fileName || '-'} size ${beforeRows}x${beforeCols}`
        );
        const afterStore = currentStoreMap.get(storeNameKey) as any;
        if (afterStore && (afterStore.rows !== beforeRows || afterStore.columns !== beforeCols)) {
          results.expandedStores += 1;
          results.storesUpdated.add(storeNameKey);
        }
      }
      const latestStores = Array.from(currentStoreMap.values()) as any[];
      const latestBlankets = blankets.filter((b) => b.status === 'stored');

      updateProgress('Validating cells', 4, 7);
      const byStoreSlot = new Map<string, Blanket[]>();
      const byNumber = new Map<string, Blanket[]>();
      for (const b of latestBlankets) {
        const slotKey = `${b.store}|${b.row}|${b.column}`;
        const slotList = byStoreSlot.get(slotKey) ?? [];
        slotList.push(b);
        byStoreSlot.set(slotKey, slotList);
        const nKey = b.blanket_number.trim().toLowerCase();
        const nList = byNumber.get(nKey) ?? [];
        nList.push(b);
        byNumber.set(nKey, nList);
      }
      const storeDefMap = new Map(latestStores.map((s) => [s.store_name, s]));

      // Auto-assign unresolved row/column using expanded stores.
      for (const row of previewRows) {
        if (!row.store) continue;
        if (row.row != null && row.column != null) continue;
        const storeDef = storeDefMap.get(row.store);
        if (!storeDef) continue;
        let found: { r: number; c: number } | null = null;
        const slotCapacity = storeDef.store_type === 'hanger' ? 1 : Math.max(1, Number((storeDef as any).slot_capacity ?? 1));
        for (let r = 1; r <= storeDef.rows && !found; r += 1) {
          for (let c = 1; c <= storeDef.columns; c += 1) {
            const slotKey = `${row.store}|${r}|${c}`;
            const used = byStoreSlot.get(slotKey)?.length ?? 0;
            if (used < slotCapacity) {
              found = { r, c };
              break;
            }
          }
        }
        if (!found) {
          // Expand one more row and map there.
          const newRows = Number(storeDef.rows || 1) + 1;
          storeDef.rows = newRows;
          ensureStoreInPlan(
            row.store,
            newRows,
            Number(storeDef.columns || 1),
            `Expanded during auto-assign from import file ${importMeta?.fileName || '-'}`
          );
          results.expandedStores += 1;
          results.storesUpdated.add(row.store);
          found = { r: newRows, c: 1 };
        }
        row.row = found.r;
        row.column = found.c;
        row.autoAssigned = true;
      }

      const rowsToProcess = previewRows.filter((row) => {
        const isEmpty = !row.number || row.number.trim().length === 0;
        if (isEmpty) {
          results.skippedEmpty += 1;
          return false;
        }
        if (!row.store || row.row == null || row.column == null) {
          results.skippedInvalid += 1;
          return false;
        }
        return true;
      });

      updateProgress('Importing records', 5, 7);
      type BulkOperation =
        | { op: 'insert'; data: { blanket_number: string; store: string; row: number; column: number; status: 'stored' }; notes?: string }
        | {
            op: 'update';
            id: number;
            data: { blanket_number?: string; store?: string; row?: number; column?: number; status?: string };
            notes?: string;
            forceAction?: string;
          };

      const operations: BulkOperation[] = [];
      let virtualId = -1;
      const removeStoredFromMaps = (blanket: Blanket) => {
        const slotKey = `${blanket.store}|${blanket.row}|${blanket.column}`;
        const slotList = (byStoreSlot.get(slotKey) ?? []).filter((item) => item.id !== blanket.id);
        if (slotList.length > 0) byStoreSlot.set(slotKey, slotList);
        else byStoreSlot.delete(slotKey);
        const numberKey = blanket.blanket_number.trim().toLowerCase();
        const numberList = (byNumber.get(numberKey) ?? []).filter((item) => item.id !== blanket.id);
        if (numberList.length > 0) byNumber.set(numberKey, numberList);
        else byNumber.delete(numberKey);
      };
      const addStoredToMaps = (blanket: Blanket) => {
        const slotKey = `${blanket.store}|${blanket.row}|${blanket.column}`;
        const slotList = byStoreSlot.get(slotKey) ?? [];
        slotList.push(blanket);
        byStoreSlot.set(slotKey, slotList);
        const numberKey = blanket.blanket_number.trim().toLowerCase();
        const numberList = byNumber.get(numberKey) ?? [];
        numberList.push(blanket);
        byNumber.set(numberKey, numberList);
      };

      let processed = 0;
      for (const row of rowsToProcess) {
        const numberKey = row.number.trim().toLowerCase();
        const slotKey = `${row.store}|${row.row}|${row.column}`;
        const slotExisting = byStoreSlot.get(slotKey) ?? [];
        const numberExisting = byNumber.get(numberKey) ?? [];
        const notesChunks = [row.notes];
        if (row.customer) notesChunks.push(`Customer: ${row.customer}`);
        if (row.order) notesChunks.push(`Order: ${row.order}`);
        const composedNotes = notesChunks.filter(Boolean).join(' | ');

        if (numberExisting.length > 0) {
          if (importDuplicateStrategy === 'skip_duplicates') {
            results.skippedDuplicates += 1;
            processed += 1;
            continue;
          }
          if (importDuplicateStrategy === 'move_existing') {
            const existing = numberExisting[0];
            const nextStored = { ...existing, store: row.store!, row: row.row!, column: row.column!, status: 'stored' as const };
            operations.push({
              op: 'update',
              id: existing.id,
              data: { store: row.store!, row: row.row!, column: row.column!, status: 'stored' },
              notes: `Moved by import from ${existing.store} R${existing.row}:C${existing.column} -> ${row.store} R${row.row}:C${row.column}`,
              forceAction: 'moved',
            });
            removeStoredFromMaps(existing);
            addStoredToMaps(nextStored);
            results.replaced += 1;
            results.storesUpdated.add(row.store!);
            processed += 1;
            continue;
          }
          if (importDuplicateStrategy === 'replace_existing_duplicate') {
            const existing = numberExisting[0];
            operations.push({
              op: 'update',
              id: existing.id,
              data: { status: 'retrieved' },
              notes: `Replaced by import to ${row.store} R${row.row}:C${row.column}`,
              forceAction: 'retrieved',
            });
            removeStoredFromMaps(existing);
            results.replaced += 1;
          }
        }

        if (slotExisting.length > 0) {
          if (importConflictStrategy === 'fill_empty_only' || importConflictStrategy === 'keep_existing') {
            results.skippedConflicts += 1;
            processed += 1;
            continue;
          }
          if (importConflictStrategy === 'replace_existing') {
            const target = slotExisting[0];
            const updated = { ...target, blanket_number: row.number };
            operations.push({
              op: 'update',
              id: target.id,
              data: { blanket_number: row.number },
              notes: `Replaced by import old=${target.blanket_number} new=${row.number} | ${composedNotes}`,
              forceAction: 'updated',
            });
            removeStoredFromMaps(target);
            addStoredToMaps(updated);
            results.replaced += 1;
            results.storesUpdated.add(row.store!);
            processed += 1;
            continue;
          }
        }

        const blockingErrors = row.errors.filter((err) => {
          const low = err.toLowerCase();
          if (low.includes('duplicate')) return false;
          if (low.includes('occupied')) return false;
          if (low.includes('auto-assign')) return false;
          return true;
        });
        const rowHasErrors = blockingErrors.length > 0;
        if (rowHasErrors && mode === 'valid_only') {
          results.skippedInvalid += 1;
          processed += 1;
          continue;
        }

        operations.push({
          op: 'insert',
          data: {
            blanket_number: row.number,
            store: row.store!,
            row: row.row!,
            column: row.column!,
            status: 'stored',
          },
          notes: composedNotes,
        });
        addStoredToMaps({
          id: virtualId--,
          blanket_number: row.number,
          store: row.store!,
          row: row.row!,
          column: row.column!,
          status: 'stored',
          created_at: new Date().toISOString(),
        });
        results.imported += 1;
        results.storesUpdated.add(row.store!);
        processed += 1;
      }
      updateProgress('Importing records', processed, Math.max(1, rowsToProcess.length));

      updateProgress('Updating grid', 6, 7);
      const storeChanges = Array.from(storeChangeMap.values()).map((item) => ({
        ...item,
        note: item.note || `Bulk import from ${importMeta?.fileName || '-'}`,
      }));
      const bulkResponse = await axios.post(`${blanketsBase}/bulk-apply`, {
        user: userName,
        fileName: importMeta?.fileName || '',
        storeChanges,
        operations,
        ...requestMeta,
      });

      const touchedStores = new Set<string>(
        Array.isArray(bulkResponse.data?.touchedStores)
          ? bulkResponse.data.touchedStores
          : Array.from(results.storesUpdated)
      );
      const responseStores = Array.isArray(bulkResponse.data?.stores) ? bulkResponse.data.stores : [];
      const responseBlankets = Array.isArray(bulkResponse.data?.blankets) ? bulkResponse.data.blankets : [];

      useStore.setState((state) => ({
        stores:
          responseStores.length > 0
            ? [...state.stores.filter((store) => !touchedStores.has(store.store_name)), ...responseStores]
            : state.stores,
        blankets:
          responseBlankets.length > 0
            ? [...state.blankets.filter((blanket) => !touchedStores.has(blanket.store)), ...responseBlankets]
            : state.blankets,
      }));
      void fetchLogs();

      updateProgress('Finished', 7, 7);
      setImportResult({
        imported: results.imported,
        skippedEmpty: results.skippedEmpty,
        skippedInvalid: results.skippedInvalid,
        skippedDuplicates: results.skippedDuplicates,
        skippedConflicts: results.skippedConflicts,
        replaced: results.replaced,
        expandedStores: results.expandedStores,
        storesUpdated: Array.from(touchedStores),
        durationMs: Date.now() - startedAt,
      });
    } catch (error: any) {
      setStoreActionError(error?.message || 'Import failed.');
    } finally {
      setImportBusy(false);
      setTimeout(() => setImportProgress(null), 900);
    }
  };

  const handleImportValidOnly = async () => {
    await executeImport('force');
  };

  const handleConfirmImport = async () => {
    await executeImport('force');
  };

  const handleForceImportWithReport = async () => {
    await executeImport('force');
  };

  const handleDownloadImportErrorReport = () => {
    if (!importPreview || importPreview.length === 0) return;
    const rows = importPreview
      .filter((row) => row.errors.length > 0)
      .map((row) => ({
        Number: row.number,
        Store: row.store,
        Row: row.row ?? '',
        Column: row.column ?? '',
        ExcelRow: row.sourceExcelRow ?? '',
        ExcelColumn: row.sourceExcelColumn ?? '',
        Customer: row.customer,
        Order: row.order,
        Notes: row.notes,
        Errors: row.errors.join('; '),
      }));
    exportRowsToWorkbook(rows, `import-errors-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.xlsx`);
  };

  const handleExportFromModal = () => {
    const rows = buildExportRows(exportScope, exportStoredOnly, exportIncludeEmptySlots, exportIncludeHistory, exportStoreName);
    const baseName =
      exportScope === 'current' && exportStoreName
        ? `store-export-${exportStoreName}`
        : 'stores-export-all';
    exportRowsToWorkbook(rows, `${baseName}-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.xlsx`);
    setManagementStep('main');
  };

  const handlePrintLabels = () => {
    if (!managementStoreName) return;
    const store = storeByName.get(managementStoreName);
    if (!store) return;

    const occupiedKeySet = new Set(
      (storedBlanketsByStore.get(managementStoreName) ?? []).map((item) => `${item.row}:${item.column}`)
    );

    const labels: string[] = [];
    for (let row = 1; row <= store.rows; row += 1) {
      for (let column = 1; column <= store.columns; column += 1) {
        const key = `${row}:${column}`;
        const occupied = occupiedKeySet.has(key);
        if (printLabelMode === 'occupied' && !occupied) continue;
        if (printLabelMode === 'empty' && occupied) continue;
        labels.push(`${store.store_name} • R${row} C${column}`);
      }
    }

    const html = `
      <html><head><title>${store.store_name} Labels</title></head>
      <body style=\"font-family:Arial;padding:12px;background:#fff;color:#111\">
      <h3>${store.store_name} - QR / Location Labels</h3>
      <div style=\"display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px\">
      ${labels
        .map(
          (label) => `<div style=\"border:1px solid #ddd;border-radius:8px;padding:8px\">
            <div style=\"font-weight:700;font-size:12px\">${label}</div>
            <img src=\"https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(label)}\" />
          </div>`
        )
        .join('')}
      </div></body></html>`;
    const win = window.open('', '_blank', 'width=1000,height=700');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      win.print();
    }
  };

  const handleMoveAll = async () => {
    if (!moveStoreName || !moveTargetStore || moveStoreName === moveTargetStore) return;
    const targetStore = storeByName.get(moveTargetStore);
    if (!targetStore) return;
    const sourceItems = (storedBlanketsByStore.get(moveStoreName) ?? []).slice();
    const targetEmpty = getEmptySlots(moveTargetStore);
    if (targetEmpty.length < sourceItems.length) {
      setStoreActionError(`Not enough empty slots in ${moveTargetStore}. Needed ${sourceItems.length}, available ${targetEmpty.length}.`);
      return;
    }
    setMoveBusy(true);
    setStoreActionError(null);
    try {
      for (let i = 0; i < sourceItems.length; i += 1) {
        const source = sourceItems[i];
        const slot = targetEmpty[i];
        await updateBlanket(source.id, {
          store: moveTargetStore,
          row: slot.row,
          column: slot.column,
          notes: `Moved from ${moveStoreName} to ${moveTargetStore}`,
        });
      }
      await fetchBlankets();
      await fetchLogs();
      setManagementStep('main');
    } catch (error: any) {
      setStoreActionError(error?.message || 'Move failed.');
    } finally {
      setMoveBusy(false);
    }
  };

  const handleSelectSuggestion = (value: string) => {
    setQueryInput(value);
    setSearchQuery(value);
    setSuggestionsOpen(false);
  };

  const beginPanelDrag = (clientY: number) => {
    if (!isMobileViewport || !searchPanelOpen || !hasSearchInput) return;
    panelDragStartYRef.current = clientY;
    panelDragStartSnapRef.current = mobilePanelSnap;
  };

  const endPanelDrag = (clientY: number) => {
    const startY = panelDragStartYRef.current;
    if (startY == null) return;
    panelDragStartYRef.current = null;
    const delta = clientY - startY;

    if (Math.abs(delta) < 24) return;

    if (delta < -40) {
      setMobilePanelSnap('expanded');
      return;
    }

    if (delta > 110 && panelDragStartSnapRef.current === 'peek') {
      setSearchPanelOpen(false);
      setMobilePanelSnap('peek');
      return;
    }

    if (delta > 48 && panelDragStartSnapRef.current === 'expanded') {
      setMobilePanelSnap('peek');
    }
  };

  const mobileOpenPanelClass =
    mobilePanelSnap === 'expanded'
      ? 'h-[min(58dvh,34rem)]'
      : 'h-[clamp(18rem,42dvh,24rem)]';

  const useMobileFigmaSearchLayout = isMobileViewport && hasSearchInput;
  const mobileRetrievalDockVisible = useMobileFigmaSearchLayout && (retrievalMode || storedMatches.length === 1);

  const mobileViewportBottomInsetStyle =
    isMobileViewport && hasSearchInput
      ? mobileRetrievalDockVisible
        ? { paddingBottom: 'calc(16rem + env(safe-area-inset-bottom))' }
        : { paddingBottom: 'calc(3.75rem + env(safe-area-inset-bottom))' }
      : undefined;

  const mobileStoreSelectorBottomStyle =
    isMobileViewport && hasSearchInput
      ? mobileRetrievalDockVisible
        ? { bottom: 'calc(11.7rem + env(safe-area-inset-bottom))' }
        : { bottom: 'calc(0.35rem + env(safe-area-inset-bottom))' }
      : undefined;

  const hideMobileStoreSelector = false;
  const inputModeActive = !hasSearchInput;
  const showInputStoreSelector =
    viewMode === '2D' &&
    (!isMobileViewport || inputModeActive);
  const mobileSafeAreaInsets = isMobileViewport
    ? {
        paddingLeft: 'max(0.5rem, env(safe-area-inset-left))',
        paddingRight: 'max(0.5rem, env(safe-area-inset-right))',
      }
    : undefined;
  const desktopSearchPanelWidthClass =
    'sm:w-[22rem] md:w-[24rem] lg:w-[27rem] xl:w-[30rem] 2xl:w-[31rem]';
  const mobileSearchPanelVisible = hasSearchInput && searchPanelOpen && !useMobileFigmaSearchLayout;
  const searchPanelVisibilityClass = isMobileViewport
    ? mobileSearchPanelVisible
      ? `${mobileOpenPanelClass} pointer-events-auto left-0 right-0 bottom-0 rounded-t-3xl border-t border-slate-800 translate-y-0`
      : 'pointer-events-none left-0 right-0 bottom-0 max-h-[80vh] rounded-t-3xl border-t border-slate-800 translate-y-full'
    : hasSearchInput
      ? `pointer-events-auto sm:inset-y-0 sm:left-0 sm:right-auto sm:bottom-auto sm:h-full sm:max-h-none sm:rounded-none sm:border-t-0 sm:border-r sm:shrink-0 sm:opacity-100 ${desktopSearchPanelWidthClass}`
      : 'pointer-events-none sm:inset-y-0 sm:left-0 sm:right-auto sm:bottom-auto sm:h-full sm:max-h-none sm:rounded-none sm:border-t-0 sm:border-r-0 sm:w-0 sm:opacity-0 sm:shrink-0';

  return (
    <div className="warehouse-search-ui h-full w-full min-w-0 flex flex-col bg-slate-900 text-white overflow-hidden">
      {/* Header / Search Bar */}
      <div className={cn(
        "warehouse-search-header sticky top-0 relative z-[70] px-3 py-3 sm:px-5 lg:px-6 sm:py-4 lg:py-5 bg-slate-900 border-b border-slate-800 flex flex-col md:flex-row gap-3 sm:gap-4 lg:gap-5",
        shouldShowTopSuggestions ? "items-start" : "items-center"
      )}>
        <div className="relative flex-1 max-w-[min(64rem,100%)] w-full">
          <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-500" size={22} />
          <input 
            type="text" 
            placeholder="Enter Blanket Number to Retrieve..." 
            className="warehouse-search-input w-full pl-12 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-3.5 lg:py-4 bg-slate-800 border border-slate-700 rounded-3xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm sm:text-[0.95rem] lg:text-[1.02rem] font-bold placeholder:text-slate-600"
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
                className="p-2 hover:bg-slate-700 rounded-xl text-slate-400 flex items-center justify-center"
              >
                <X size={14} className="sm:hidden" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
            <button
              type="button"
              onClick={openSearchScanner}
              className="warehouse-neon-button p-2 hover:bg-slate-700 rounded-xl text-slate-200 bg-slate-800 border border-slate-700"
              title="Scanner mode"
            >
              <ScanLine size={18} />
            </button>
          </div>
        </div>
        {!currentUser && (
          <div className="rounded-3xl border border-rose-600 bg-rose-950/60 px-4 py-3 text-sm text-rose-200">
            Select a user from the sidebar before picking blankets.
          </div>
        )}

        <div className="warehouse-mode-toggle w-full md:w-auto rounded-2xl border border-slate-700 bg-slate-800/90 px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 text-center">
          <span
            className={cn(
              "text-xs sm:text-sm lg:text-[0.95rem] font-black uppercase tracking-[0.18em]",
              hasSearchInput ? "text-blue-300" : "text-emerald-300"
            )}
          >
            {hasSearchInput ? 'SEARCH MODE / مود البحث' : 'INPUT MODE / مود الإدخال'}
          </span>
        </div>

        <div className="warehouse-mode-toggle flex bg-slate-800 p-1.5 rounded-2xl border border-slate-700 shadow-inner w-full md:w-auto">
          <button 
            onClick={() => setViewMode('2D')}
            className={cn(
              "flex-1 md:flex-none justify-center flex items-center gap-2 px-4 sm:px-5 lg:px-6 py-2.5 sm:py-2.5 lg:py-3 rounded-xl text-sm sm:text-[0.92rem] lg:text-[0.98rem] font-bold transition-all",
              viewMode === '2D' ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            )}
          >
            <MapIcon size={20} />
            2D View
          </button>
          <button 
            onClick={() => setViewMode('3D')}
            className={cn(
              "flex-1 md:flex-none justify-center flex items-center gap-2 px-4 sm:px-5 lg:px-6 py-2.5 sm:py-2.5 lg:py-3 rounded-xl text-sm sm:text-[0.92rem] lg:text-[0.98rem] font-bold transition-all",
              viewMode === '3D' ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            )}
          >
            <Box size={20} />
            3D View
          </button>
        </div>
      </div>

      {shouldShowTopSuggestions && (
        <div className="warehouse-suggestions-top relative z-[65] px-3 sm:px-5 lg:px-6 pb-3 sm:pb-4 bg-slate-900 border-b border-slate-800/70">
          <div className="warehouse-card w-full max-w-[min(64rem,100%)] rounded-3xl border border-slate-700 bg-slate-900/95 backdrop-blur-md shadow-2xl overflow-hidden">
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
        </div>
      )}

      {scannerOpen && (
        <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex flex-col">
          <div className="p-4 sm:p-6 flex items-center justify-between gap-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center">
                <ScanLine size={22} />
              </div>
              <div>
                <div className="text-sm font-black uppercase tracking-widest text-slate-200">{scannerHeaderLabel}</div>
                <div className="text-xs text-slate-400 font-bold">{scannerHint}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={closeScanner}
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
                {scannerFooterHint}
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

      {/* Main Content Area */}
      <div className="warehouse-main-content flex-1 relative flex min-w-0 overflow-hidden">
        {/* Left Sidebar: Results & Guided Retrieval */}
        <div className={cn(
          "warehouse-search-panel bg-slate-900/95 backdrop-blur-md sm:bg-slate-900 flex flex-col transition-all duration-500 z-20 absolute sm:relative overflow-hidden",
          searchPanelVisibilityClass
        )}>
          {hasSearchInput && (
            <div
              className="sm:hidden px-6 pt-3 pb-3 touch-none"
              onTouchStart={(event) => beginPanelDrag(event.touches[0]?.clientY ?? 0)}
              onTouchEnd={(event) => endPanelDrag(event.changedTouches[0]?.clientY ?? 0)}
            >
              <div className="mx-auto h-1.5 w-14 rounded-full bg-slate-600/80" />
              <div className="mt-2 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                Swipe up / down
              </div>
            </div>
          )}
          {hasSearchInput && (
            <div className="flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-7 pt-4 sm:pt-6 lg:pt-7 pb-3 sm:pb-4">
              <div className="flex items-center gap-3 text-blue-400">
                <Target size={24} />
                <h2 className="text-[clamp(1.15rem,1.9vw,1.7rem)] font-black uppercase tracking-tight">Search</h2>
              </div>
              {isMobileViewport && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchPanelOpen(false);
                    setMobilePanelSnap('peek');
                  }}
                  className="rounded-2xl bg-slate-800 border border-slate-700 px-3.5 sm:px-4 py-2.5 sm:py-3 text-[11px] font-black uppercase tracking-widest text-slate-200 hover:bg-slate-700"
                >
                  Hide
                </button>
              )}
            </div>
          )}
          {retrievalMode && storedMatches.length > 0 ? (
            <div className="warehouse-search-panel-scroll p-4 sm:p-5 lg:p-6 flex flex-col h-full min-h-0 overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="bg-slate-800 rounded-3xl p-4 sm:p-5 lg:p-6 border border-slate-700 shadow-2xl mb-4 sm:mb-5 flex-none min-h-[10rem] lg:min-h-[12rem] flex flex-col justify-center items-center text-center space-y-3 sm:space-y-4">
                <div className="w-[clamp(3.25rem,7.8vw,5.75rem)] h-[clamp(3.25rem,7.8vw,5.75rem)] bg-blue-600 rounded-full flex items-center justify-center text-[clamp(1.25rem,2.8vw,2.1rem)] font-black shadow-xl shadow-blue-900/40 animate-pulse">
                  {retrievalIndex + 1}
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs">Pick {retrievalIndex + 1} of {storedMatches.length}</span>
                  <h3 className="text-[clamp(1.35rem,3.1vw,2.2rem)] font-black tracking-tighter">#{currentResult?.blanket_number}</h3>
                </div>
                
                <div className="w-full space-y-2.5 sm:space-y-3 pt-4 border-t border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">STORE</span>
                    <span className="text-[clamp(0.95rem,1.75vw,1.3rem)] font-black text-blue-400">{currentResult?.store}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">POSITION</span>
                    <span className="text-[clamp(0.95rem,1.75vw,1.15rem)] font-black text-white">R{currentResult?.row} : C{currentResult?.column}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">LAST STATUS</span>
                    <span className="text-sm font-black uppercase tracking-widest text-slate-200">
                      {currentResult?.lastStatus ?? currentResult?.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="warehouse-search-actions space-y-3 shrink-0">
                {pickError && (
                  <div className="rounded-3xl border border-rose-600 bg-rose-950/60 px-5 py-4 text-sm font-bold text-rose-200">
                    {pickError}
                  </div>
                )}
                <button 
                  onClick={handleMarkAsPicked}
                  disabled={!canPick}
                  className={cn(
                    "w-full py-3.5 sm:py-3.5 lg:py-4 rounded-3xl font-black text-sm sm:text-[0.95rem] lg:text-base shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2.5",
                    canPick 
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20" 
                      : "bg-slate-700 text-slate-400 cursor-not-allowed shadow-none"
                  )}
                >
                  <CheckCircle2 size={22} />
                  MARK AS PICKED
                </button>

                <button
                  type="button"
                  onClick={() => currentResult && zoomToBlanket(currentResult)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3.5 rounded-3xl font-black text-sm sm:text-[0.92rem] lg:text-base shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2.5"
                >
                  <Crosshair size={18} />
                  ZOOM TO SLOT (3D)
                </button>
                
                <div className="flex gap-2.5">
                  <button 
                    disabled={retrievalIndex === 0}
                    onClick={() => setRetrievalIndex(retrievalIndex - 1)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 p-3 rounded-2xl flex items-center justify-center transition-all"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    disabled={retrievalIndex === storedMatches.length - 1}
                    onClick={() => setRetrievalIndex(retrievalIndex + 1)}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 p-3 rounded-2xl flex items-center justify-center transition-all"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
              </div>

              {exactMatches.length > 0 && (
                <div className="mt-4 rounded-3xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                  <div className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 flex items-center justify-between">
                    <span>All matches (latest first)</span>
                    <span className="text-slate-600">{exactMatches.length}</span>
                  </div>
                  <div className="divide-y divide-slate-800">
                    {visibleExactMatches.map((b) => {
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
                  {hiddenExactMatchesCount > 0 && (
                    <div className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 border-t border-slate-800">
                      +{hiddenExactMatchesCount} more matches
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : storedMatches.length === 1 ? (
            <div className="warehouse-search-panel-scroll p-4 sm:p-5 lg:p-6 flex flex-col h-full min-h-0 overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="bg-slate-800 rounded-3xl p-4 sm:p-5 lg:p-6 border border-slate-700 shadow-2xl mb-4 sm:mb-5 flex-none min-h-[10rem] lg:min-h-[12rem] flex flex-col justify-center items-center text-center space-y-3 sm:space-y-4">
                <div className="w-[clamp(3.25rem,7.8vw,5.75rem)] h-[clamp(3.25rem,7.8vw,5.75rem)] bg-emerald-600 rounded-full flex items-center justify-center text-[clamp(1.25rem,2.8vw,2.1rem)] font-black shadow-xl shadow-emerald-900/40">
                  <Package size={34} />
                </div>
                <div className="space-y-1">
                  <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs">Single Match Found</span>
                  <h3 className="text-[clamp(1.35rem,3.1vw,2.2rem)] font-black tracking-tighter">#{currentResult?.blanket_number}</h3>
                </div>
                
                <div className="w-full space-y-2.5 sm:space-y-3 pt-4 border-t border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">STORE</span>
                    <span className="text-[clamp(0.95rem,1.75vw,1.3rem)] font-black text-emerald-400">{currentResult?.store}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">POSITION</span>
                    <span className="text-[clamp(0.95rem,1.75vw,1.15rem)] font-black text-white">R{currentResult?.row} : C{currentResult?.column}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-bold">LAST STATUS</span>
                    <span className="text-sm font-black uppercase tracking-widest text-slate-200">
                      {currentResult?.lastStatus ?? currentResult?.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="warehouse-search-actions space-y-3 shrink-0">
                {pickError && (
                  <div className="rounded-3xl border border-rose-600 bg-rose-950/60 px-5 py-4 text-sm font-bold text-rose-200">
                    {pickError}
                  </div>
                )}
                <button 
                  onClick={handleMarkAsPicked}
                  disabled={!canPick}
                  className={cn(
                    "w-full py-3.5 sm:py-3.5 lg:py-4 rounded-3xl font-black text-sm sm:text-[0.95rem] lg:text-base shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2.5",
                    canPick 
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20" 
                      : "bg-slate-700 text-slate-400 cursor-not-allowed shadow-none"
                  )}
                >
                  <CheckCircle2 size={22} />
                  MARK AS PICKED
                </button>
                <button
                  type="button"
                  onClick={() => currentResult && zoomToBlanket(currentResult)}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3.5 rounded-3xl font-black text-sm sm:text-[0.92rem] lg:text-base shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2.5"
                >
                  <Crosshair size={18} />
                  ZOOM TO SLOT (3D)
                </button>
              </div>

              {exactMatches.length > 0 && (
                <div className="mt-4 rounded-3xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                  <div className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 flex items-center justify-between">
                    <span>All matches (latest first)</span>
                    <span className="text-slate-600">{exactMatches.length}</span>
                  </div>
                  <div className="divide-y divide-slate-800">
                    {visibleExactMatches.map((b) => (
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
                  {hiddenExactMatchesCount > 0 && (
                    <div className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 border-t border-slate-800">
                      +{hiddenExactMatchesCount} more matches
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="warehouse-search-panel-scroll p-4 sm:p-6 flex flex-col h-full min-h-0 overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))]">
              {!hasSearchInput ? (
                <div className="h-full" />
              ) : exactMatches.length === 0 ? (
                <div className="flex flex-col gap-6">
                  <div className="rounded-3xl border border-rose-800/70 bg-rose-950/30 p-6">
                    <div className="flex items-center gap-3 text-rose-300">
                      <AlertCircle size={24} />
                      <div className="text-xl font-black tracking-wide uppercase">NOT FOUND</div>
                    </div>
                    <div className="text-2xl font-black text-white mt-3">#{normalizedQuery}</div>
                    <div className="text-sm text-rose-200/90 font-bold mt-2">
                      This number does not exist in stored blankets.
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setQueryInput('');
                        setSearchQuery('');
                      }}
                      className="mt-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-100"
                    >
                      Clear Search
                    </button>
                  </div>
                  {!isTabletViewport && suggestions.length > 0 ? (
                    <div className="rounded-3xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                      <div className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                        Suggestions
                      </div>
                      <div className="divide-y divide-slate-800">
                        {suggestions.slice(0, panelMatchPreviewCount + 2).map((s) => (
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
                      {suggestions.length > panelMatchPreviewCount + 2 && (
                        <div className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 border-t border-slate-800">
                          +{suggestions.length - (panelMatchPreviewCount + 2)} more suggestions
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-slate-500 font-bold mt-6">
                      {isTabletViewport ? 'Keep typing to refine your search.' : 'No suggestions found.'}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-3xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                  <div className="px-5 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 flex items-center justify-between">
                    <span>Matches (latest first)</span>
                    <span className="text-slate-600">{exactMatches.length}</span>
                  </div>
                  <div className="divide-y divide-slate-800">
                    {visibleExactMatches.map((b) => (
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
                  {hiddenExactMatchesCount > 0 && (
                    <div className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 border-t border-slate-800">
                      +{hiddenExactMatchesCount} more matches
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {isMobileViewport && hasSearchInput && !searchPanelOpen && (
          <button
            type="button"
            onClick={() => {
              setSearchPanelOpen(true);
              setMobilePanelSnap('peek');
            }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:top-6 sm:left-6 sm:bottom-auto z-30 flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-700 text-xs sm:text-sm font-bold text-white shadow-xl"
          >
            <ChevronRight size={16} />
            Show search panel
          </button>
        )}

        {/* Center: Viewport */}
        <div className="warehouse-viewport flex-1 min-w-0 relative bg-slate-950 overflow-hidden" style={mobileViewportBottomInsetStyle}>
          <div className={cn('absolute inset-0', viewMode === '2D' ? 'block' : 'hidden')}>
            <Grid2D
              interactionMode={inputModeActive ? 'input' : 'search'}
              lockedStores={lockedStores}
              onOpenStoreManagement={openStoreManagement}
              showDesktopInputPanel={false}
            />
          </div>
          <div className={cn('absolute inset-0', viewMode === '3D' ? 'block' : 'hidden')}>
            {hasOpened3D ? <Warehouse3D active={viewMode === '3D'} /> : null}
          </div>
          
          {/* Store Selector Overlay */}
          {showInputStoreSelector && (
            <div
              className={cn(
                "absolute bottom-2 sm:bottom-6 lg:bottom-8 left-1 right-1 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 bg-slate-900/80 backdrop-blur-md p-1.5 sm:p-2 rounded-2xl sm:rounded-3xl border border-slate-700 shadow-2xl z-10 sm:max-w-[88%] lg:max-w-[84%] overflow-x-auto no-scrollbar transition-all",
                hideMobileStoreSelector && "hidden sm:block"
              )}
              style={{ ...mobileStoreSelectorBottomStyle, ...mobileSafeAreaInsets }}
            >
              <StoreControlBar
                stores={stores}
                selectedStore={selectedStore}
                lockedStores={lockedStores}
                onSelectStore={setSelectedStore}
                onOpenManagement={openStoreManagement}
                className="sm:max-w-full"
              />
            </div>
          )}

          {mobileRetrievalDockVisible && currentResult && (
            <div className="warehouse-bottom-dock sm:hidden absolute left-2 right-2 bottom-[max(0.5rem,env(safe-area-inset-bottom))] z-20 grid grid-cols-[1fr_1.25fr] gap-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/95 p-3">
                <div className="mx-auto w-11 h-11 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-lg">
                  {retrievalMode ? retrievalIndex + 1 : storedMatches.length}
                </div>
                <div className="mt-1 text-center text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                  {retrievalMode ? `Pick ${retrievalIndex + 1} of ${storedMatches.length}` : 'Single match'}
                </div>
                <div className="mt-1 text-center text-2xl font-black text-white tracking-tight">#{currentResult.blanket_number}</div>
                <div className="mt-3 space-y-1.5 text-[10px] font-bold text-slate-400">
                  <div className="flex items-center justify-between"><span>Store</span><span className="text-blue-300">{currentResult.store}</span></div>
                  <div className="flex items-center justify-between"><span>Position</span><span className="text-slate-200">R{currentResult.row} : C{currentResult.column}</span></div>
                  <div className="flex items-center justify-between"><span>Last status</span><span className="text-slate-200 uppercase">{currentResult.lastStatus ?? currentResult.status}</span></div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/95 p-2.5 flex flex-col gap-2">
                <button
                  onClick={handleMarkAsPicked}
                  disabled={!canPick}
                  className={cn(
                    "warehouse-action-btn warehouse-action-btn--primary w-full py-3 rounded-2xl font-black text-sm transition-all active:scale-95 flex items-center justify-center gap-2",
                    canPick ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-slate-700 text-slate-400 cursor-not-allowed"
                  )}
                >
                  <CheckCircle2 size={17} />
                  MARK AS PICKED
                </button>
                <button
                  type="button"
                  onClick={() => zoomToBlanket(currentResult)}
                  className="warehouse-action-btn w-full bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-2xl font-black text-xs transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Crosshair size={14} />
                  ZOOM TO SLOT (3D)
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    disabled={retrievalIndex === 0}
                    onClick={() => setRetrievalIndex(retrievalIndex - 1)}
                    className="bg-slate-800 hover:bg-slate-700 disabled:opacity-30 py-2 rounded-xl flex items-center justify-center"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    disabled={retrievalIndex === storedMatches.length - 1}
                    onClick={() => setRetrievalIndex(retrievalIndex + 1)}
                    className="bg-slate-800 hover:bg-slate-700 disabled:opacity-30 py-2 rounded-xl flex items-center justify-center"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {storeActionError && (
        <div className="fixed bottom-4 right-4 z-[95] max-w-[min(92vw,34rem)] rounded-2xl border border-rose-700 bg-rose-950/85 px-4 py-3 text-sm font-bold text-rose-100 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <span>{storeActionError}</span>
            <button
              type="button"
              onClick={() => setStoreActionError(null)}
              className="text-rose-200 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {managementStoreName && (
        <StoreManagementModal
          open={Boolean(managementStoreName)}
          title={`${managementStoreName} - Store Management`}
          subtitle={
            summaryStoreData
              ? `${summaryStoreData.storedItems.length} / ${summaryStoreData.totalSlots} used • ${summaryStoreData.occupancy}%`
              : undefined
          }
          onClose={closeStoreManagement}
          allowOverlayClose={managementStep !== 'empty'}
        >
          {managementStep === 'main' && (
            <div className="space-y-2.5">
              {([
                { key: 'summary', label: 'Store Summary' },
                { key: 'import_excel', label: 'Import Numbers from Excel', disabled: Boolean(lockedStores[managementStoreName]) },
                { key: 'export_excel', label: 'Export Store to Excel' },
                { key: 'move_all', label: 'Move All to Another Store' },
                { key: 'toggle_lock', label: lockedStores[managementStoreName] ? 'Unlock Store' : 'Lock Store' },
                { key: 'health_check', label: 'Store Health Check' },
                { key: 'history', label: 'View Store History' },
                { key: 'print_labels', label: 'Print QR / Location Labels' },
                { key: 'clear_empty_cells', label: 'Clear Empty Cells Only' },
              ] as Array<{ key: StoreManagementAction; label: string; disabled?: boolean }>).map((action) => (
                <button
                  key={action.key}
                  type="button"
                  disabled={action.disabled}
                  onClick={() => handleManagementAction(action.key)}
                  className="w-full text-left h-11 rounded-xl border border-[#263B5B] bg-[#101D30] hover:bg-[#17263A] disabled:bg-slate-800 disabled:text-slate-500 px-3 text-sm font-bold text-white"
                >
                  {action.label}
                </button>
              ))}
              <button
                type="button"
                disabled={Boolean(lockedStores[managementStoreName])}
                onClick={() => handleManagementAction('empty_store')}
                className="w-full text-left h-11 rounded-xl border border-rose-700/70 bg-rose-950/25 hover:bg-rose-950/45 disabled:bg-slate-800 disabled:text-slate-500 px-3 text-sm font-black text-rose-200"
              >
                Empty Store
              </button>
            </div>
          )}

          {managementStep !== 'main' && managementStep !== 'empty' && (
            <div className="mb-3">
              <button
                type="button"
                onClick={() => setManagementStep('main')}
                className="h-9 px-3 rounded-xl border border-[#263B5B] bg-[#101D30] text-xs font-bold text-slate-200"
              >
                Back
              </button>
            </div>
          )}

          {managementStep === 'summary' && summaryStoreData && (
            <StoreSummaryStep
              storeName={summaryStoreData.store.store_name}
              usedCells={summaryStoreData.storedItems.length}
              emptyCells={summaryStoreData.emptySlots}
              totalCapacity={summaryStoreData.totalSlots}
              percentageUsed={summaryStoreData.occupancy}
              duplicateCount={summaryStoreData.duplicateCount}
              locked={Boolean(lockedStores[summaryStoreData.store.store_name])}
              lastUpdated={summaryStoreData.lastUpdated}
            />
          )}

          {managementStep === 'health' && storeHealthData && (
            <StoreHealthStep
              duplicateNumbers={storeHealthData.duplicateNumbers}
              invalidNumbers={storeHealthData.invalidNumbers}
              emptyGaps={storeHealthData.emptyGaps}
              oldStoredItems={storeHealthData.oldStoredItems}
              missingScanRecords={storeHealthData.missingScanRecords}
              fullRows={storeHealthData.fullRows}
              suggestedActions={storeHealthData.suggestedActions}
            />
          )}

          {managementStep === 'history' && <StoreHistoryStep rows={storeHistoryRows} />}

          {managementStep === 'import' && (
            <ImportStoreStep
              locked={Boolean(managementStoreName && lockedStores[managementStoreName])}
              preview={importPreview}
              meta={importMeta}
              busy={importBusy}
              onPickFile={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                input.onchange = () => {
                  const file = input.files?.[0];
                  if (!file) return;
                  void handleImportFilePicked(file);
                };
                input.click();
              }}
              onCancel={() => {
                setImportPreview(null);
                setImportMeta(null);
                setImportResult(null);
                setImportProgress(null);
                setManagementStep('main');
              }}
              onDownloadErrors={handleDownloadImportErrorReport}
              onImportValidOnly={() => void handleImportValidOnly()}
              onForceImport={() => void handleForceImportWithReport()}
              onConfirmImport={() => void handleConfirmImport()}
              conflictStrategy={importConflictStrategy}
              duplicateStrategy={importDuplicateStrategy}
              unknownStoreStrategy={importUnknownStoreStrategy}
              onConflictStrategyChange={setImportConflictStrategy}
              onDuplicateStrategyChange={setImportDuplicateStrategy}
              onUnknownStoreStrategyChange={setImportUnknownStoreStrategy}
              progress={importProgress}
              result={importResult}
            />
          )}

          {managementStep === 'export' && (
            <ExportStoreStep
              scope={exportScope}
              storedOnly={exportStoredOnly}
              includeEmptySlots={exportIncludeEmptySlots}
              includeHistory={exportIncludeHistory}
              onScopeChange={setExportScope}
              onStoredOnlyChange={setExportStoredOnly}
              onIncludeEmptySlotsChange={setExportIncludeEmptySlots}
              onIncludeHistoryChange={setExportIncludeHistory}
              onCancel={() => setManagementStep('main')}
              onExport={handleExportFromModal}
            />
          )}

          {managementStep === 'move' && (
            <div className="space-y-3">
              <div className="rounded-xl border border-[#263B5B] bg-[#101D30] px-3 py-2.5 text-xs text-[#8EA2BD]">
                Source count: <span className="font-black text-white">{(moveStoreName ? storedBlanketsByStore.get(moveStoreName) : undefined)?.length ?? 0}</span>
              </div>
              <div className="rounded-xl border border-[#263B5B] bg-[#101D30] px-3 py-2.5 text-xs text-[#8EA2BD]">
                Target empty capacity: <span className="font-black text-white">{moveTargetStore ? getEmptySlots(moveTargetStore).length : 0}</span>
              </div>
              <select
                value={moveTargetStore}
                onChange={(event) => setMoveTargetStore(event.target.value)}
                className="w-full h-11 rounded-xl border border-[#263B5B] bg-[#17263A] px-3 text-sm text-white"
              >
                {stores.filter((s) => s.store_name !== moveStoreName).map((s) => (
                  <option key={s.store_name} value={s.store_name}>{s.store_name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => void handleMoveAll()}
                disabled={
                  moveBusy ||
                  !moveTargetStore ||
                  ((moveStoreName ? storedBlanketsByStore.get(moveStoreName) : undefined)?.length ?? 0) > getEmptySlots(moveTargetStore).length
                }
                className="w-full h-11 rounded-xl bg-[#2F7DFF] hover:bg-blue-500 disabled:bg-slate-700 text-white text-sm font-black"
              >
                {moveBusy ? 'Moving...' : 'Confirm Move'}
              </button>
            </div>
          )}

          {managementStep === 'print' && (
            <div className="space-y-3">
              <label className="flex items-center gap-2 rounded-xl border border-[#263B5B] bg-[#101D30] px-3 py-2.5 text-sm text-white"><input type="radio" checked={printLabelMode === 'all'} onChange={() => setPrintLabelMode('all')} /> Print labels for all cells</label>
              <label className="flex items-center gap-2 rounded-xl border border-[#263B5B] bg-[#101D30] px-3 py-2.5 text-sm text-white"><input type="radio" checked={printLabelMode === 'occupied'} onChange={() => setPrintLabelMode('occupied')} /> Print labels for occupied cells only</label>
              <label className="flex items-center gap-2 rounded-xl border border-[#263B5B] bg-[#101D30] px-3 py-2.5 text-sm text-white"><input type="radio" checked={printLabelMode === 'empty'} onChange={() => setPrintLabelMode('empty')} /> Print labels for empty cells only</label>
              <div className="flex justify-end">
                <button type="button" onClick={handlePrintLabels} className="h-10 px-4 rounded-xl bg-[#2F7DFF] text-xs font-black text-white">Print</button>
              </div>
            </div>
          )}

          {managementStep === 'empty' && emptyStoreName && (
            <EmptyStoreConfirmStep
              storeName={emptyStoreName}
              affectedCount={(storedBlanketsByStore.get(emptyStoreName) ?? []).length}
              confirmText={emptyConfirmText}
              reason={emptyReason}
              busy={emptyBusy}
              onConfirmTextChange={setEmptyConfirmText}
              onReasonChange={setEmptyReason}
              onCancel={() => {
                setEmptyStoreName(null);
                setManagementStep('main');
              }}
              onExportBackup={() => exportCurrentStoreBackup(emptyStoreName)}
              onConfirm={() => void performEmptyStore(emptyStoreName)}
            />
          )}
        </StoreManagementModal>
      )}
    </div>
  );
}
