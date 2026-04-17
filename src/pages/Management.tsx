import { useState, useEffect, useMemo, useRef } from 'react';
import { useStore, Blanket, Store } from '../store/useStore';
import { Plus, Edit2, Trash2, Search, X, Check, ChevronLeft, ChevronRight, LayoutGrid, Zap, AlertCircle, Package, Settings, History, Download, Filter, RefreshCcw, Printer } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Management() {
  const { 
    blankets, 
    logs,
    stores, 
    fetchLogs,
    fetchStores,
    fetchBlankets,
    addBlanket, 
    updateBlanket, 
    deleteBlanket, 
    addStore,
    updateStore,
    deleteStore,
    lastUsedStore, 
    lastInsertedCell,
    setLastUsedStore,
    currentUser,
  } = useStore();
  const isAdmin = ['admin', 'super-admin'].includes(currentUser?.role || '');
  
  const [activeTab, setActiveTab] = useState<'blankets' | 'stores' | 'activity' | 'backup' | 'labels'>('blankets');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [editingBlanket, setEditingBlanket] = useState<Blanket | null>(null);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [movingBlanket, setMovingBlanket] = useState<Blanket | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Activity log filters
  const [activityQuery, setActivityQuery] = useState('');
  const [activityAction, setActivityAction] = useState('all');
  const [activityUser, setActivityUser] = useState('all');
  const [activityStore, setActivityStore] = useState('all');
  const [activityFrom, setActivityFrom] = useState('');
  const [activityTo, setActivityTo] = useState('');
  const [activityLimit, setActivityLimit] = useState(500);

  // Backup / Restore
  const [backupBusy, setBackupBusy] = useState(false);
  const [backupError, setBackupError] = useState<string | null>(null);
  const [restoreBusy, setRestoreBusy] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreSnapshot, setRestoreSnapshot] = useState<any | null>(null);
  const [restoreSource, setRestoreSource] = useState<'sqlite' | 'supabase'>('sqlite');
  const [restoreTarget, setRestoreTarget] = useState<'sqlite' | 'supabase'>('sqlite');
  const [restoreConfirm, setRestoreConfirm] = useState('');
  const [backupLogsLimit, setBackupLogsLimit] = useState(20000);

  // Labels / Stickers
  const [labelText, setLabelText] = useState('');
  const [labelIncludeContext, setLabelIncludeContext] = useState(true);
  const [labelLimit, setLabelLimit] = useState(30);
  const [labelStatus, setLabelStatus] = useState<'stored' | 'all'>('stored');
  const [labelStore, setLabelStore] = useState<string>('all');

  const qrImageUrl = (value: string, sizePx = 220) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=${sizePx}x${sizePx}&data=${encodeURIComponent(value)}`;

  const normalizeLabelNumbers = (raw: string) =>
    raw
      .split(/[\r\n,;]+/g)
      .map((v) => v.trim())
      .filter(Boolean)
      .slice(0, 200);

  const labelNumbersFromText = useMemo(() => normalizeLabelNumbers(labelText), [labelText]);

  const labelCandidatesFromDb = useMemo(() => {
    const filtered = blankets.filter((b) => {
      if (labelStatus !== 'all' && b.status !== labelStatus) return false;
      if (labelStore !== 'all' && b.store !== labelStore) return false;
      return true;
    });
    // newest first
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const nums = filtered.map((b) => b.blanket_number);
    return nums.slice(0, Math.max(1, Math.min(200, labelLimit)));
  }, [blankets, labelStatus, labelStore, labelLimit]);

  const blanketContextByNumber = useMemo(() => {
    if (!labelIncludeContext) return new Map<string, { store: string; row: number; column: number; status: string }>();
    const map = new Map<string, { store: string; row: number; column: number; status: string; t: number }>();
    for (const b of blankets) {
      const t = new Date(b.created_at).getTime();
      const existing = map.get(b.blanket_number);
      if (!existing || t > existing.t) {
        map.set(b.blanket_number, { store: b.store, row: b.row, column: b.column, status: b.status, t });
      }
    }
    const clean = new Map<string, { store: string; row: number; column: number; status: string }>();
    for (const [k, v] of map.entries()) clean.set(k, { store: v.store, row: v.row, column: v.column, status: v.status });
    return clean;
  }, [blankets, labelIncludeContext]);

  const labelNumbers = useMemo(() => {
    if (labelNumbersFromText.length > 0) return labelNumbersFromText;
    return labelCandidatesFromDb;
  }, [labelNumbersFromText, labelCandidatesFromDb]);

  const openLabelsForNumber = (number: string) => {
    const normalized = String(number ?? '').trim();
    if (!normalized) return;
    setActiveTab('labels');
    setLabelText((prev) => {
      const existing = normalizeLabelNumbers(prev);
      if (existing.some((n) => n.toLowerCase() === normalized.toLowerCase())) return prev;
      return [...existing, normalized].join('\n');
    });
  };

  const printLabels = () => {
    window.print();
  };
  
  // Quick Add State
  const [quickAddStore, setQuickAddStore] = useState<string>(lastUsedStore || (stores[0]?.store_name || ''));
  const [selectedCell, setSelectedCell] = useState<{ row: number, col: number } | null>(null);
  const [quickAddNumber, setQuickAddNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<{
    blanket_number: string;
    store: string;
    row: number;
    column: number;
    status: 'stored' | 'retrieved' | 'picked';
    notes?: string;
  }>({
    blanket_number: '',
    store: '',
    row: 1,
    column: 1,
    status: 'stored',
    notes: '',
  });

  const [storeFormData, setStoreFormData] = useState({
    store_name: '',
    rows: 10,
    columns: 10,
    store_type: 'grid' as 'grid' | 'hanger',
    hanger_slots: 10,
    slot_capacity: 1,
    auto_settle: true,
    store_color: '#3b82f6',
    store_opacity: 1,
    cell_width: 0.5,
    cell_depth: 0.5,
  });

  useEffect(() => {
    if (editingStore) return;
    if (storeFormData.store_type !== 'grid') return;
    if (!/^folding\\b/i.test(storeFormData.store_name)) return;
    if (storeFormData.slot_capacity !== 1) return;
    setStoreFormData((prev) => ({ ...prev, slot_capacity: 20 }));
  }, [storeFormData.store_name, storeFormData.store_type, storeFormData.slot_capacity, editingStore]);

  useEffect(() => {
    if (activeTab !== 'activity') return;
    fetchLogs(activityLimit);
  }, [activeTab, activityLimit]);

  const downloadBackupSnapshot = async () => {
    setBackupBusy(true);
    setBackupError(null);
    try {
      if (!currentUser) {
        throw new Error('Select a user first.');
      }
      const params = new URLSearchParams({
        user: currentUser.username,
        logsLimit: String(Math.max(0, Math.min(200000, backupLogsLimit))),
        blanketsLimit: '100000',
      });
      const res = await fetch(`/api/backup/snapshot?${params.toString()}`);
      if (!res.ok) {
        const raw = await res.text().catch(() => '');
        const data = (() => {
          try {
            return JSON.parse(raw);
          } catch {
            return null;
          }
        })();
        const msg =
          data?.error ||
          (typeof raw === 'string' && raw.trim().length > 0 ? raw.trim().slice(0, 220) : null) ||
          `HTTP ${res.status}`;
        throw new Error(msg);
      }

      const contentDisposition = res.headers.get('content-disposition') || '';
      const match = contentDisposition.match(/filename=\"?([^\";]+)\"?/i);
      const filename = match?.[1] || `backup-snapshot-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      setBackupError(error?.message || 'Failed to create backup.');
    } finally {
      setBackupBusy(false);
    }
  };

  const handleRestoreFile = async (file: File | null) => {
    setRestoreError(null);
    setRestoreSnapshot(null);
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      setRestoreSnapshot(parsed);

      const hasSqlite =
        Array.isArray(parsed?.sqlite?.stores) &&
        Array.isArray(parsed?.sqlite?.blankets) &&
        Array.isArray(parsed?.sqlite?.logs);
      const hasSupabase =
        Array.isArray(parsed?.supabase?.stores) &&
        Array.isArray(parsed?.supabase?.blankets) &&
        Array.isArray(parsed?.supabase?.logs);

      if (!hasSqlite && hasSupabase) setRestoreSource('supabase');
      if (hasSqlite && !hasSupabase) setRestoreSource('sqlite');
    } catch (error: any) {
      setRestoreError(error?.message || 'Invalid backup file.');
    }
  };

  const runRestore = async () => {
    if (!restoreSnapshot) return;
    if (!currentUser) {
      setRestoreError('Select a user first.');
      return;
    }
    if (!isAdmin) {
      setRestoreError('Admin only.');
      return;
    }
    if (restoreConfirm !== 'RESTORE') {
      setRestoreError('Type RESTORE to confirm.');
      return;
    }

    setRestoreBusy(true);
    setRestoreError(null);
    try {
      const endpoint = restoreTarget === 'supabase' ? '/api/restore/supabase' : '/api/restore/sqlite';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          snapshot: restoreSnapshot,
          source: restoreSource,
          confirm: restoreConfirm,
          user: currentUser.username,
        }),
      });

      const raw = await res.text().catch(() => '');
      const data = (() => {
        try {
          return JSON.parse(raw);
        } catch {
          return null;
        }
      })();
      if (!res.ok) {
        const msg =
          data?.error ||
          (typeof raw === 'string' && raw.trim().length > 0 ? raw.trim().slice(0, 220) : null) ||
          `HTTP ${res.status}`;
        throw new Error(msg);
      }

      setRestoreConfirm('');
      await fetchStores();
      await fetchBlankets();
      await fetchLogs(activityLimit);
    } catch (error: any) {
      setRestoreError(error?.message || 'Restore failed.');
    } finally {
      setRestoreBusy(false);
    }
  };

  const currentStore = useMemo(() => 
    stores.find(s => s.store_name === quickAddStore)
  , [stores, quickAddStore]);

  const storeBlankets = useMemo(() => 
    blankets.filter(b => b.store === quickAddStore && b.status === 'stored')
  , [blankets, quickAddStore]);

  const currentSlotCapacity = useMemo(() => {
    if (!currentStore) return 1;
    if (currentStore.store_type === 'hanger') return 1;
    // Folding stores default to 20 if not explicitly set.
    const guessed = /^folding\b/i.test(currentStore.store_name) ? 20 : 1;
    return Math.max(1, Number((currentStore as any).slot_capacity ?? guessed));
  }, [currentStore]);

  const cellCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const blanket of storeBlankets) {
      const key = `${blanket.row},${blanket.column}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [storeBlankets]);

  const cellBlanketsMap = useMemo(() => {
    const map = new Map<string, Blanket[]>();
    for (const blanket of storeBlankets) {
      const key = `${blanket.row},${blanket.column}`;
      const list = map.get(key);
      if (list) {
        list.push(blanket);
      } else {
        map.set(key, [blanket]);
      }
    }
    for (const list of map.values()) {
      list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }
    return map;
  }, [storeBlankets]);

  // Find first empty cell suggestion
  const suggestedCell = useMemo(() => {
    if (!currentStore) return null;
    for (let r = 1; r <= currentStore.rows; r++) {
      for (let c = 1; c <= currentStore.columns; c++) {
        const count = cellCounts.get(`${r},${c}`) ?? 0;
        if (count < currentSlotCapacity) return { row: r, col: c };
      }
    }
    return null;
  }, [currentStore, cellCounts, currentSlotCapacity]);

  useEffect(() => {
    if (isQuickAddOpen && !selectedCell && suggestedCell) {
      setSelectedCell(suggestedCell);
    }
  }, [isQuickAddOpen, suggestedCell]);

  useEffect(() => {
    if (selectedCell && isQuickAddOpen) {
      inputRef.current?.focus();
      
      // Check for skip warning
      if (suggestedCell && (selectedCell.row > suggestedCell.row || (selectedCell.row === suggestedCell.row && selectedCell.col > suggestedCell.col))) {
        setWarning("Note: There are empty cells before this position.");
      } else {
        setWarning(null);
      }
    }
  }, [selectedCell, isQuickAddOpen, suggestedCell]);

  const blanketUsers = useMemo(() => {
    const storedLogs = logs.filter((log) => log.action === 'stored');

    return new Map(
      blankets.map((blanket) => {
        const matchingLogs = storedLogs.filter(
          (log) => log.blanket_number === blanket.blanket_number && log.store === blanket.store
        );
        const exactPositionLogs = matchingLogs.filter(
          (log) => Number(log.row) === blanket.row && Number(log.column) === blanket.column
        );
        const candidateLogs = exactPositionLogs.length > 0 ? exactPositionLogs : matchingLogs;
        const createdAt = new Date(blanket.created_at).getTime();
        const matchedLog = candidateLogs
          .slice()
          .sort(
            (a, b) =>
              Math.abs(new Date(a.timestamp).getTime() - createdAt) -
              Math.abs(new Date(b.timestamp).getTime() - createdAt)
          )[0];

        return [blanket.id, matchedLog?.user || 'Unknown'] as const;
      })
    );
  }, [blankets, logs]);

  const filteredBlankets = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return blankets;

    return blankets.filter((blanket) => {
      const storedByUser = blanketUsers.get(blanket.id) || '';
      return (
        blanket.blanket_number.toLowerCase().includes(query) ||
        blanket.store.toLowerCase().includes(query) ||
        storedByUser.toLowerCase().includes(query)
      );
    });
  }, [blankets, blanketUsers, searchQuery]);

  const activityLogs = useMemo(
    () => logs.filter((log) => log.action === 'stored' || log.action === 'picked'),
    [logs]
  );

  const activityActionOptions = useMemo(() => {
    const set = new Set<string>();
    for (const log of logs) set.add(String(log.action ?? ''));
    return Array.from(set).filter(Boolean).sort();
  }, [logs]);

  const activityUserOptions = useMemo(() => {
    const set = new Set<string>();
    for (const log of logs) set.add(String(log.user ?? ''));
    return Array.from(set).filter(Boolean).sort();
  }, [logs]);

  const activityStoreOptions = useMemo(() => {
    const set = new Set<string>();
    for (const log of logs) set.add(String(log.store ?? ''));
    return Array.from(set).filter(Boolean).sort();
  }, [logs]);

  const filteredActivityLogs = useMemo(() => {
    const query = activityQuery.trim().toLowerCase();
    const fromTime = activityFrom ? new Date(`${activityFrom}T00:00:00`).getTime() : null;
    const toTime = activityTo ? new Date(`${activityTo}T23:59:59.999`).getTime() : null;

    return logs.filter((log) => {
      if (activityAction !== 'all' && log.action !== activityAction) return false;
      if (activityUser !== 'all' && log.user !== activityUser) return false;
      if (activityStore !== 'all' && log.store !== activityStore) return false;

      const time = new Date(log.timestamp).getTime();
      if (fromTime != null && time < fromTime) return false;
      if (toTime != null && time > toTime) return false;

      if (!query) return true;

      const haystack = [
        log.blanket_number,
        log.action,
        log.user,
        log.store,
        log.status,
        (log as any).notes,
        (log as any).request_id,
        (log as any).ip,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [logs, activityQuery, activityAction, activityUser, activityStore, activityFrom, activityTo]);

  const exportActivityCsv = () => {
    const escapeCell = (value: unknown) => `"${String(value ?? '').replace(/\"/g, '""')}"`;
    const header = [
      'id',
      'timestamp',
      'blanket_number',
      'action',
      'user',
      'store',
      'row',
      'column',
      'status',
      'request_id',
      'device',
      'ip',
      'notes',
    ];
    const rows = filteredActivityLogs.map((log: any) => [
      log.id,
      log.timestamp,
      log.blanket_number,
      log.action,
      log.user,
      log.store,
      log.row,
      log.column,
      log.status,
      log.request_id,
      log.device,
      log.ip,
      log.notes,
    ]);

    const csv = [header.map(escapeCell).join(','), ...rows.map((row) => row.map(escapeCell).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity-logs-${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBlanket) {
      await updateBlanket(editingBlanket.id, formData);
    } else {
      await addBlanket(formData);
    }
    closeModal();
  };

  const handleStoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedColor = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(storeFormData.store_color)
      ? storeFormData.store_color
      : '#3b82f6';
    const storeData = {
      store_name: storeFormData.store_name,
      rows: storeFormData.store_type === 'hanger' ? 1 : storeFormData.rows,
      columns: storeFormData.store_type === 'hanger' ? storeFormData.hanger_slots : storeFormData.columns,
      store_type: storeFormData.store_type,
      hanger_slots: storeFormData.store_type === 'hanger' ? storeFormData.hanger_slots : 0,
      slot_capacity: storeFormData.store_type === 'hanger' ? 1 : Math.max(1, Number(storeFormData.slot_capacity || 1)),
      auto_settle: storeFormData.auto_settle,
      store_color: normalizedColor,
      store_opacity: Math.min(1, Math.max(0.1, Number(storeFormData.store_opacity || 1))),
      cell_width: Math.min(20, Math.max(0.1, Number(storeFormData.cell_width || 0.5))),
      cell_depth: Math.min(20, Math.max(0.1, Number(storeFormData.cell_depth || 0.5))),
    };

    if (editingStore) {
      await updateStore(editingStore.store_name, storeData);
    } else {
      await addStore(storeData);
    }
    setIsStoreModalOpen(false);
  };

  const handleQuickAdd = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selectedCell || !quickAddNumber) return;

    const count = cellCounts.get(`${selectedCell.row},${selectedCell.col}`) ?? 0;
    if (count >= currentSlotCapacity) {
      setError("Cell is full!");
      return;
    }

    setError(null);
    await addBlanket({
      blanket_number: quickAddNumber,
      store: quickAddStore,
      row: selectedCell.row,
      column: selectedCell.col,
      status: 'stored'
    });

    setQuickAddNumber('');
    // Auto-move to next cell is handled by suggestedCell update if we don't manually set selectedCell
    // But user might want to continue from where they are.
    // Let's just let the suggestedCell logic pick the next one.
    setSelectedCell(null); 
  };

  const handleMoveBlanket = async (direction: 'up' | 'down' | 'left' | 'right') => {
    if (!movingBlanket || !currentStore) return;

    let newRow = movingBlanket.row;
    let newCol = movingBlanket.column;

    if (direction === 'up') newRow--;
    if (direction === 'down') newRow++;
    if (direction === 'left') newCol--;
    if (direction === 'right') newCol++;

    // Bounds check
    if (newRow < 1 || newRow > currentStore.rows || newCol < 1 || newCol > currentStore.columns) {
      setError("Out of bounds!");
      return;
    }

    // Occupancy check
    const count = storeBlankets.filter((b) => b.row === newRow && b.column === newCol && b.id !== movingBlanket.id).length;
    if (count >= currentSlotCapacity) {
      setError("Target cell is full!");
      return;
    }

    setError(null);
    await updateBlanket(movingBlanket.id, { row: newRow, column: newCol });
    setMovingBlanket({ ...movingBlanket, row: newRow, column: newCol });
  };

  const openModal = (blanket?: Blanket) => {
    if (blanket) {
      setEditingBlanket(blanket);
      setFormData({
        blanket_number: blanket.blanket_number,
        store: blanket.store,
        row: blanket.row,
        column: blanket.column,
        status: blanket.status,
        notes: '',
      });
    } else {
      setEditingBlanket(null);
      setFormData({
        blanket_number: '',
        store: stores[0]?.store_name || '',
        row: 1,
        column: 1,
        status: 'stored',
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const openStoreModal = (store?: Store, type: 'grid' | 'hanger' = 'grid') => {
    if (store) {
      setEditingStore(store);
      setStoreFormData({
        store_name: store.store_name,
        rows: store.store_type === 'hanger' ? 1 : store.rows,
        columns: store.store_type === 'hanger' ? store.hanger_slots : store.columns,
        store_type: store.store_type || 'grid',
        hanger_slots: store.store_type === 'hanger' ? store.hanger_slots : 10,
        slot_capacity:
          store.store_type === 'hanger'
            ? 1
            : Math.max(1, Number((store as any).slot_capacity ?? (/^folding\\b/i.test(store.store_name) ? 20 : 1))),
        auto_settle: store.auto_settle !== false,
        store_color: /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test((store as any).store_color || '')
          ? (store as any).store_color
          : '#3b82f6',
        store_opacity: Math.min(1, Math.max(0.1, Number((store as any).store_opacity ?? 1))),
        cell_width: Math.min(20, Math.max(0.1, Number((store as any).cell_width ?? (5 / Math.max(1, store.columns))))),
        cell_depth: Math.min(20, Math.max(0.1, Number((store as any).cell_depth ?? (5 / Math.max(1, store.rows))))),
      });
    } else {
      setEditingStore(null);
      setStoreFormData({
        store_name: '',
        rows: 10,
        columns: 10,
        store_type: type,
        hanger_slots: type === 'hanger' ? 10 : 10,
        slot_capacity: type === 'hanger' ? 1 : 1,
        auto_settle: true,
        store_color: '#3b82f6',
        store_opacity: 1,
        cell_width: 0.5,
        cell_depth: type === 'hanger' ? 5 : 0.5,
      });
    }
    setIsStoreModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBlanket(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {!isAdmin && (
        <div className="rounded-3xl border border-amber-300/40 bg-amber-50/70 p-6 text-amber-900">
          <p className="font-semibold">Read-only access</p>
          <p className="mt-2 text-sm text-amber-700">You are signed in as a cashier. Management actions are restricted to admin users only.</p>
        </div>
      )}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">Warehouse Management</h1>
          <p className="text-slate-500 text-base sm:text-lg">Manage blankets and storage configurations.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setIsQuickAddOpen(true)}
            disabled={!isAdmin}
            className={cn(
              "px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95",
              isAdmin
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                : "bg-slate-700 text-slate-400 cursor-not-allowed shadow-none"
            )}
          >
            <Zap size={20} />
            Quick Add
          </button>
          <button 
            onClick={() => openModal()}
            disabled={!isAdmin}
            className={cn(
              "px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95",
              isAdmin
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20"
                : "bg-slate-700 text-slate-400 cursor-not-allowed shadow-none"
            )}
          >
            <Plus size={20} />
            Add Blanket
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex bg-slate-100 p-1 rounded-2xl w-fit border border-slate-200">
          <button 
            onClick={() => setActiveTab('blankets')}
            className={cn(
              "px-8 py-3 rounded-xl font-bold transition-all",
              activeTab === 'blankets' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Blankets
          </button>
          <button 
            onClick={() => setActiveTab('stores')}
            className={cn(
              "px-8 py-3 rounded-xl font-bold transition-all",
              activeTab === 'stores' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Stores
          </button>
          <button 
            onClick={() => setActiveTab('activity')}
            className={cn(
              "px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2",
              activeTab === 'activity' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Filter size={16} />
            Activity
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={cn(
              "px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2",
              activeTab === 'backup' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Download size={16} />
            Backup
          </button>
          <button
            onClick={() => setActiveTab('labels')}
            className={cn(
              "px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2",
              activeTab === 'labels' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Printer size={16} />
            Labels
          </button>
        </div>

        {activeTab === 'stores' && (
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => openStoreModal()}
              disabled={!isAdmin}
              className={cn(
                "px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95",
                isAdmin
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20"
                  : "bg-slate-700 text-slate-400 cursor-not-allowed shadow-none"
              )}
            >
              <Plus size={20} />
              New Store
            </button>
            <button 
              onClick={() => openStoreModal(undefined, 'hanger')}
              disabled={!isAdmin}
              className={cn(
                "px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95",
                isAdmin
                  ? "bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20"
                  : "bg-slate-700 text-slate-400 cursor-not-allowed shadow-none"
              )}
            >
              <Plus size={20} />
              New Hanger Store
            </button>
          </div>
        )}
      </div>

       {activeTab === 'blankets' ? (
         <>
           {/* Stats / Last Used */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
                <LayoutGrid size={24} />
              </div>
              <div>
                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest block">Last Used Store</span>
                <span className="text-xl font-black text-slate-900">{lastUsedStore || 'None'}</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600">
                <Check size={24} />
              </div>
              <div>
                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest block">Last Inserted</span>
                <span className="text-xl font-black text-slate-900">
                  {lastInsertedCell ? `R${lastInsertedCell.row} : C${lastInsertedCell.column}` : 'None'}
                </span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600">
                <Package size={24} />
              </div>
              <div>
                <span className="text-slate-500 text-xs font-bold uppercase tracking-widest block">Total Stored</span>
                <span className="text-xl font-black text-slate-900">{blankets.filter(b => b.status === 'stored').length}</span>
              </div>
             </div>
           </div>

           {/* Recent Activity (Stored / Picked) */}
           <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
             <div className="flex items-center justify-between mb-8">
               <h2 className="text-2xl font-bold flex items-center gap-3">
                 <History className="text-blue-500" />
                 Recent Activity
               </h2>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left border-separate border-spacing-y-3">
                 <thead>
                   <tr className="text-slate-500 text-sm uppercase tracking-[0.2em]">
                     <th className="px-4 py-3">By User</th>
                     <th className="px-4 py-3">Number</th>
                     <th className="px-4 py-3">Store</th>
                     <th className="px-4 py-3">Position</th>
                     <th className="px-4 py-3">Status</th>
                     <th className="px-4 py-3">Created At</th>
                   </tr>
                 </thead>
                 <tbody>
                   {activityLogs.slice(0, 10).map((log) => (
                     <tr
                       key={log.id}
                       className="bg-slate-50 border border-slate-100 rounded-3xl align-middle transition-colors hover:bg-slate-100"
                     >
                       <td className="px-4 py-4 text-sm font-medium text-slate-900">{log.user || 'Unknown'}</td>
                       <td className="px-4 py-4 text-sm text-slate-700">#{log.blanket_number}</td>
                       <td className="px-4 py-4 text-sm text-slate-700">{log.store}</td>
                       <td className="px-4 py-4 text-sm text-slate-700">
                         {log.row != null && log.column != null ? `${log.row},${log.column}` : '-'}
                       </td>
                       <td className="px-4 py-4 text-sm capitalize text-slate-700">{log.status}</td>
                       <td className="px-4 py-4 text-sm text-slate-500">
                         {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                       </td>
                     </tr>
                   ))}
                   {activityLogs.length === 0 && (
                     <tr>
                       <td colSpan={6} className="py-12 text-center text-slate-400">
                         No recent activity found.
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
           </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by number or store..." 
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <span>Showing {filteredBlankets.length} of {blankets.length} blankets</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Number</th>
                    <th className="px-6 py-4 hidden sm:table-cell">Store</th>
                    <th className="px-6 py-4 hidden sm:table-cell">Position</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 hidden md:table-cell">By User</th>
                    <th className="px-6 py-4 hidden lg:table-cell">Created At</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBlankets.map((blanket) => (
                    <tr key={blanket.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900">#{blanket.blanket_number}</span>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold border border-blue-100">
                          {blanket.store}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className="text-slate-600 font-medium">R{blanket.row} : C{blanket.column}</span>
                      </td>
                      <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                          blanket.status === 'stored' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                            : blanket.status === 'retrieved'
                              ? 'bg-amber-50 text-amber-700 border-amber-100'
                              : 'bg-sky-50 text-sky-700 border-sky-100'
                        }`}>
                          {blanket.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm font-medium hidden md:table-cell">
                        {blanketUsers.get(blanket.id) || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm hidden lg:table-cell">
                        {format(new Date(blanket.created_at), 'MMM dd, yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => openLabelsForNumber(blanket.blanket_number)}
                            className="p-2 rounded-lg transition-all text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                            title="Print label"
                          >
                            <Printer size={18} />
                          </button>
                          <button 
                            onClick={() => openModal(blanket)}
                            disabled={!isAdmin}
                            className={cn(
                              "p-2 rounded-lg transition-all",
                              isAdmin
                                ? "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                : "text-slate-400 bg-slate-100 cursor-not-allowed"
                            )}
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => deleteBlanket(blanket.id)}
                            disabled={!isAdmin}
                            className={cn(
                              "p-2 rounded-lg transition-all",
                              isAdmin
                                ? "text-slate-400 hover:text-red-600 hover:bg-red-50"
                                : "text-slate-400 bg-slate-100 cursor-not-allowed"
                            )}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredBlankets.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                        No blankets found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : activeTab === 'stores' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div key={store.store_name} className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-6">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl border border-black/10"
                  style={{
                    backgroundColor: /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test((store as any).store_color || '')
                      ? (store as any).store_color
                      : '#3b82f6',
                    opacity: Math.min(1, Math.max(0.4, Number((store as any).store_opacity ?? 1))),
                  }}
                >
                  {store.store_name[0]}
                </div>
                <button 
                  onClick={() => openStoreModal(store)}
                  disabled={!isAdmin}
                  className={cn(
                    "p-3 rounded-xl transition-all opacity-0 group-hover:opacity-100",
                    isAdmin
                      ? "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                      : "text-slate-400 bg-slate-100 cursor-not-allowed"
                  )}
                >
                  <Settings size={20} />
                </button>
                <button 
                  onClick={() => deleteStore(store.store_name)}
                  disabled={!isAdmin}
                  className={cn(
                    "p-3 rounded-xl transition-all opacity-0 group-hover:opacity-100",
                    isAdmin
                      ? "text-slate-400 hover:text-red-600 hover:bg-red-50"
                      : "text-slate-400 bg-slate-100 cursor-not-allowed"
                  )}
                >
                  <Trash2 size={20} />
                </button>
              </div>
              <h3 className="text-2xl font-black tracking-tighter text-slate-900 mb-2 uppercase">{store.store_name}</h3>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-bold uppercase tracking-widest">Type</span>
                  <span className="text-slate-900 font-black uppercase tracking-widest text-xs">
                    {store.store_type === 'hanger' ? 'Hanger' : 'Grid'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-bold uppercase tracking-widest">Configuration</span>
                  <span className="text-slate-900 font-black">
                    {store.store_type === 'hanger' ? `1R × ${store.hanger_slots}H` : `${store.rows}R × ${store.columns}C`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-bold uppercase tracking-widest">Capacity</span>
                  <span className="text-slate-900 font-black">
                    {store.store_type === 'hanger'
                      ? `${store.hanger_slots} Hanger Slots`
                      : `${store.rows * store.columns} Cells × ${store.slot_capacity}`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-bold uppercase tracking-widest">Occupancy</span>
                  <span className="text-blue-600 font-black">
                    {blankets.filter(b => b.store === store.store_name && b.status === 'stored').length} / {store.store_type === 'hanger' ? store.hanger_slots : store.rows * store.columns * store.slot_capacity}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-bold uppercase tracking-widest">Auto-settle</span>
                  <button
                    onClick={() => updateStore(store.store_name, { auto_settle: store.auto_settle !== false ? false : true })}
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest transition ${store.auto_settle !== false ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}
                  >
                    {store.auto_settle !== false ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-50 flex items-center gap-2">
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full" 
                    style={{ width: `${(blankets.filter(b => b.store === store.store_name && b.status === 'stored').length / Math.max(1, store.store_type === 'hanger' ? store.hanger_slots : store.rows * store.columns * store.slot_capacity)) * 100}%` }}
                  ></div>
                </div>
                <span className="text-[10px] font-black text-slate-400">
                  {Math.round((blankets.filter(b => b.store === store.store_name && b.status === 'stored').length / Math.max(1, store.store_type === 'hanger' ? store.hanger_slots : store.rows * store.columns * store.slot_capacity)) * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : activeTab === 'backup' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-black tracking-tight text-slate-900">Backup to file</div>
                <div className="text-sm text-slate-500 font-medium">Downloads a JSON snapshot (SQLite export + Supabase snapshot).</div>
              </div>
              <div className="bg-blue-50 text-blue-700 rounded-2xl px-3 py-2 text-xs font-black uppercase tracking-widest border border-blue-100">
                Admin
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">Logs limit</label>
              <input
                type="number"
                min={0}
                max={200000}
                value={backupLogsLimit}
                onChange={(e) => setBackupLogsLimit(Math.max(0, Math.min(200000, Number(e.target.value) || 0)))}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-900"
              />
              <div className="text-xs text-slate-400">Large limits make bigger files. Stores/blankets are always included.</div>
            </div>

            {backupError && (
              <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700">
                {backupError}
              </div>
            )}

            <button
              type="button"
              onClick={downloadBackupSnapshot}
              disabled={!isAdmin || backupBusy}
              className={cn(
                "w-full rounded-2xl py-4 font-black uppercase tracking-widest transition-all active:scale-95",
                !isAdmin
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : backupBusy
                    ? "bg-slate-200 text-slate-500 cursor-wait"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
              )}
            >
              {backupBusy ? 'Creating backup…' : 'Backup to file'}
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-black tracking-tight text-slate-900">Restore</div>
                <div className="text-sm text-slate-500 font-medium">Upload a backup JSON and restore to SQLite or Supabase.</div>
              </div>
              <div className="bg-amber-50 text-amber-800 rounded-2xl px-3 py-2 text-xs font-black uppercase tracking-widest border border-amber-100">
                Destructive
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">Backup file</label>
              <input
                type="file"
                accept="application/json,.json"
                onChange={(e) => handleRestoreFile(e.target.files?.[0] ?? null)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              />
            </div>

            {restoreSnapshot && (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 space-y-3">
                <div className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">Snapshot contents</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl bg-white border border-slate-200 px-4 py-3">
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">SQLite</div>
                    <div className="mt-1 font-black text-slate-900">
                      Stores: {Array.isArray(restoreSnapshot?.sqlite?.stores) ? restoreSnapshot.sqlite.stores.length : 0} · Blankets:{' '}
                      {Array.isArray(restoreSnapshot?.sqlite?.blankets) ? restoreSnapshot.sqlite.blankets.length : 0} · Logs:{' '}
                      {Array.isArray(restoreSnapshot?.sqlite?.logs) ? restoreSnapshot.sqlite.logs.length : 0}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white border border-slate-200 px-4 py-3">
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">Supabase</div>
                    <div className="mt-1 font-black text-slate-900">
                      Stores: {Array.isArray(restoreSnapshot?.supabase?.stores) ? restoreSnapshot.supabase.stores.length : 0} · Blankets:{' '}
                      {Array.isArray(restoreSnapshot?.supabase?.blankets) ? restoreSnapshot.supabase.blankets.length : 0} · Logs:{' '}
                      {Array.isArray(restoreSnapshot?.supabase?.logs) ? restoreSnapshot.supabase.logs.length : 0}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">Source</label>
                <select
                  value={restoreSource}
                  onChange={(e) => setRestoreSource(e.target.value as any)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-900"
                >
                  <option value="sqlite">SQLite export</option>
                  <option value="supabase">Supabase snapshot</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">Target</label>
                <select
                  value={restoreTarget}
                  onChange={(e) => setRestoreTarget(e.target.value as any)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-900"
                >
                  <option value="sqlite">Restore SQLite</option>
                  <option value="supabase">Restore Supabase</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">Type RESTORE to confirm</label>
              <input
                value={restoreConfirm}
                onChange={(e) => setRestoreConfirm(e.target.value)}
                placeholder="RESTORE"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-black tracking-widest text-slate-900"
              />
              <div className="text-xs text-slate-400">
                This overwrites {restoreTarget === 'supabase' ? 'Supabase' : 'SQLite'} stores/blankets/logs.
              </div>
            </div>

            {restoreError && (
              <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-bold text-rose-700">
                {restoreError}
              </div>
            )}

            <button
              type="button"
              onClick={runRestore}
              disabled={!isAdmin || restoreBusy || !restoreSnapshot}
              className={cn(
                "w-full rounded-2xl py-4 font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2",
                !isAdmin || !restoreSnapshot
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : restoreBusy
                    ? "bg-slate-200 text-slate-500 cursor-wait"
                    : "bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20"
              )}
            >
              <RefreshCcw size={18} />
              {restoreBusy ? 'Restoring…' : 'Restore now'}
            </button>
          </div>
        </div>
      ) : activeTab === 'labels' ? (
        <div className="space-y-6">
          <style>{`
            @media print {
              @page { margin: 10mm; }
              html, body {
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
              }
              body * {
                visibility: hidden !important;
              }
              .no-print {
                display: none !important;
              }
              .print-area,
              .print-area * {
                visibility: visible !important;
              }
              .print-area {
                display: block !important;
                position: absolute !important;
                inset: 0 !important;
                width: 100% !important;
                background: white !important;
                padding: 10mm !important;
                box-sizing: border-box !important;
              }
            }
          `}</style>

          <div className="no-print bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="text-2xl font-black tracking-tight text-slate-900">Sticker labels (QR)</div>
                <div className="text-sm text-slate-500 font-medium">
                  اطبع ملصقات QR للرقم — ثم الصقها على كيس البطانية. عند المسح بالكاميرا لاحقًا سيُدخل الرقم مباشرة.
                </div>
              </div>
              <button
                type="button"
                onClick={printLabels}
                disabled={!isAdmin || labelNumbers.length === 0}
                className={cn(
                  "rounded-2xl px-6 py-4 font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2",
                  !isAdmin || labelNumbers.length === 0
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
                )}
              >
                <Printer size={18} />
                Print
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">Custom numbers (optional)</div>
                <textarea
                  rows={8}
                  value={labelText}
                  onChange={(e) => setLabelText(e.target.value)}
                  placeholder="اكتب الأرقام (رقم في كل سطر) — مثال:\n1024\n1025\n1026"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 font-bold text-slate-900 placeholder:text-slate-400 resize-y"
                />
                <div className="text-xs text-slate-400">
                  إذا تركته فارغًا: سيتم أخذ الأرقام من قاعدة البيانات حسب الفلاتر.
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">From database (fallback)</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">Status</label>
                    <select
                      value={labelStatus}
                      onChange={(e) => setLabelStatus(e.target.value as any)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-900"
                    >
                      <option value="stored">Stored only</option>
                      <option value="all">All</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">Store</label>
                    <select
                      value={labelStore}
                      onChange={(e) => setLabelStore(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-900"
                    >
                      <option value="all">All stores</option>
                      {stores.map((s) => (
                        <option key={`lbl-store-${s.store_name}`} value={s.store_name}>
                          {s.store_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">Limit</label>
                    <input
                      type="number"
                      min={1}
                      max={200}
                      value={labelLimit}
                      onChange={(e) => setLabelLimit(Math.max(1, Math.min(200, Number(e.target.value) || 1)))}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-900"
                    />
                  </div>
                  <label className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={labelIncludeContext}
                      onChange={(e) => setLabelIncludeContext(e.target.checked)}
                      className="accent-blue-600"
                    />
                    <span className="text-sm font-bold text-slate-900">Include store/slot (if known)</span>
                  </label>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
                  <div className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">Ready to print</div>
                  <div className="mt-2 text-lg font-black text-slate-900">{labelNumbers.length} labels</div>
                  <div className="text-xs text-slate-400 mt-1">
                    QR content = blanket number only (to keep scanning simple).
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Print area */}
          <div className="print-area hidden bg-white p-6">
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(62mm, 1fr))',
              }}
            >
              {labelNumbers.map((num, idx) => {
                const ctx = blanketContextByNumber.get(num);
                return (
                  <div
                    key={`lbl-${num}-${idx}`}
                    style={{
                      width: '62mm',
                      height: '38mm',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6mm',
                      padding: '3mm',
                      display: 'flex',
                      gap: '3mm',
                      alignItems: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={qrImageUrl(num, 180)}
                      alt={`QR ${num}`}
                      style={{ width: '26mm', height: '26mm' }}
                      loading="eager"
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '18pt', fontWeight: 900, lineHeight: 1, letterSpacing: '0.02em' }}>
                        {num}
                      </div>
                      {ctx && (
                        <div style={{ marginTop: '2mm', fontSize: '9pt', fontWeight: 700, color: '#334155' }}>
                          {ctx.store} · R{ctx.row} C{ctx.column} · {ctx.status}
                        </div>
                      )}
                      <div style={{ marginTop: '2mm', fontSize: '7pt', color: '#64748b' }}>
                        Blanket Hub
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <History className="text-blue-500" />
                Activity Log
              </h2>
              <p className="text-sm text-slate-500 mt-2">Filter, search, and export warehouse log events.</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fetchLogs(activityLimit)}
                className="px-4 py-2.5 rounded-2xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all flex items-center gap-2"
              >
                <RefreshCcw size={16} />
                Refresh
              </button>
              <button
                type="button"
                onClick={exportActivityCsv}
                className="px-4 py-2.5 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <div className="md:col-span-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                <Filter size={14} />
                Search
              </label>
              <input
                value={activityQuery}
                onChange={(e) => setActivityQuery(e.target.value)}
                placeholder="Blanket/user/store/request/notes..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Action</label>
              <select
                value={activityAction}
                onChange={(e) => setActivityAction(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-semibold"
              >
                <option value="all">All</option>
                {activityActionOptions.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">User</label>
              <select
                value={activityUser}
                onChange={(e) => setActivityUser(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-semibold"
              >
                <option value="all">All</option>
                {activityUserOptions.map((user) => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Store</label>
              <select
                value={activityStore}
                onChange={(e) => setActivityStore(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-semibold"
              >
                <option value="all">All</option>
                {activityStoreOptions.map((store) => (
                  <option key={store} value={store}>
                    {store}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">From</label>
              <input
                type="date"
                value={activityFrom}
                onChange={(e) => setActivityFrom(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">To</label>
              <input
                type="date"
                value={activityTo}
                onChange={(e) => setActivityTo(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-semibold"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="text-sm text-slate-500 font-semibold">
              Showing <span className="text-slate-900 font-black">{filteredActivityLogs.length}</span> of{' '}
              <span className="text-slate-900 font-black">{logs.length}</span> loaded logs
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Load</span>
              <button
                type="button"
                onClick={() => setActivityLimit(500)}
                className={cn(
                  'px-4 py-2 rounded-2xl font-bold transition-all border',
                  activityLimit === 500 ? 'bg-white border-slate-300 text-slate-900 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                )}
              >
                500
              </button>
              <button
                type="button"
                onClick={() => setActivityLimit(1000)}
                className={cn(
                  'px-4 py-2 rounded-2xl font-bold transition-all border',
                  activityLimit === 1000 ? 'bg-white border-slate-300 text-slate-900 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                )}
              >
                1000
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-black tracking-widest">
                <tr>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Blanket</th>
                  <th className="px-6 py-4 hidden md:table-cell">Store</th>
                  <th className="px-6 py-4 hidden lg:table-cell">Pos</th>
                  <th className="px-6 py-4 hidden md:table-cell">Status</th>
                  <th className="px-6 py-4 hidden lg:table-cell">Request</th>
                  <th className="px-6 py-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredActivityLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-700 whitespace-nowrap">
                      {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm')}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{log.action}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{log.user || 'system'}</td>
                    <td className="px-6 py-4 text-sm font-black text-slate-900">#{log.blanket_number}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 hidden md:table-cell">{log.store ?? '-'}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 hidden lg:table-cell tabular-nums">
                      {log.row != null && log.column != null ? `${log.row},${log.column}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 hidden md:table-cell">{log.status ?? '-'}</td>
                    <td className="px-6 py-4 text-xs text-slate-500 hidden lg:table-cell font-mono">
                      {log.request_id ? String(log.request_id).slice(0, 8) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {log.notes ? String(log.notes) : <span className="text-slate-300">-</span>}
                    </td>
                  </tr>
                ))}
                {filteredActivityLogs.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-400 font-semibold">
                      No log entries match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Store Edit Modal */}
      {isStoreModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">
                  {editingStore ? 'Edit Store' : 'New Store'}
                </h2>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">
                  {editingStore ? editingStore.store_name : 'Create a new storage unit'}
                </p>
              </div>
              <button onClick={() => setIsStoreModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleStoreSubmit} className="p-8 space-y-6">
              {!editingStore && (
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Store Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. B5-back"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold"
                    value={storeFormData.store_name}
                    onChange={(e) => setStoreFormData({ ...storeFormData, store_name: e.target.value })}
                  />
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Store Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setStoreFormData({ ...storeFormData, store_type: 'grid' })}
                      className={cn(
                        "px-4 py-3 rounded-2xl font-bold transition-all border",
                        storeFormData.store_type === 'grid'
                          ? 'bg-white text-slate-900 border-slate-300 shadow-sm'
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                      )}
                    >
                      Grid
                    </button>
                    <button
                      type="button"
                      onClick={() => setStoreFormData({ ...storeFormData, store_type: 'hanger' })}
                      className={cn(
                        "px-4 py-3 rounded-2xl font-bold transition-all border",
                        storeFormData.store_type === 'hanger'
                          ? 'bg-white text-slate-900 border-slate-300 shadow-sm'
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                      )}
                    >
                      Hanger
                    </button>
                  </div>
                </div>

                {storeFormData.store_type === 'hanger' ? (
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Hanger Slots</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={50}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold"
                      value={storeFormData.hanger_slots}
                      onChange={(e) => setStoreFormData({ ...storeFormData, hanger_slots: parseInt(e.target.value) })}
                    />
                    <p className="text-xs text-slate-500">Hanger stores always use a single row with one hanger slot per column.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Rows</label>
                      <input 
                        type="number" 
                        required 
                        min={1}
                        max={50}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold"
                        value={storeFormData.rows}
                        onChange={(e) => setStoreFormData({ ...storeFormData, rows: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Columns</label>
                      <input 
                        type="number" 
                        required 
                        min={1}
                        max={50}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold"
                        value={storeFormData.columns}
                        onChange={(e) => setStoreFormData({ ...storeFormData, columns: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        Slot Capacity (bags per cell)
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        max={100}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold"
                        value={storeFormData.slot_capacity}
                        onChange={(e) => setStoreFormData({ ...storeFormData, slot_capacity: parseInt(e.target.value) })}
                      />
                      <p className="text-xs text-slate-500">
                        Folding shelves example: set to 20 (two stacks of 10).
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">3D Cell Size</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Cell Width</label>
                    <input
                      type="number"
                      min={0.1}
                      max={20}
                      step={0.1}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold"
                      value={storeFormData.cell_width}
                      onChange={(e) => setStoreFormData({ ...storeFormData, cell_width: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Cell Depth</label>
                    <input
                      type="number"
                      min={0.1}
                      max={20}
                      step={0.1}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold"
                      value={storeFormData.cell_depth}
                      onChange={(e) => setStoreFormData({ ...storeFormData, cell_depth: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500">Controls the 3D overlay cell dimensions independently from rows/columns.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Auto-settle</label>
                <label className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={storeFormData.auto_settle}
                    onChange={(e) => setStoreFormData({ ...storeFormData, auto_settle: e.target.checked })}
                    className="accent-blue-600 w-5 h-5"
                  />
                  <span className="font-semibold text-slate-700">Enable auto settle for this store</span>
                </label>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">3D Appearance</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Color</label>
                    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 border border-slate-200 px-3 py-2">
                      <input
                        type="color"
                        value={storeFormData.store_color}
                        onChange={(e) => setStoreFormData({ ...storeFormData, store_color: e.target.value })}
                        className="h-10 w-12 rounded-lg border border-slate-300 bg-white"
                      />
                      <input
                        type="text"
                        value={storeFormData.store_color}
                        onChange={(e) => setStoreFormData({ ...storeFormData, store_color: e.target.value })}
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700"
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Opacity</label>
                    <div className="rounded-2xl bg-slate-50 border border-slate-200 px-3 py-3 space-y-2">
                      <input
                        type="range"
                        min={0.1}
                        max={1}
                        step={0.05}
                        value={storeFormData.store_opacity}
                        onChange={(e) => setStoreFormData({ ...storeFormData, store_opacity: Number(e.target.value) })}
                        className="w-full accent-blue-600"
                      />
                      <div className="text-xs font-black text-slate-500 tabular-nums">
                        {Math.round(storeFormData.store_opacity * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <div
                    className="w-10 h-10 rounded-lg border border-black/10"
                    style={{
                      backgroundColor: storeFormData.store_color,
                      opacity: Math.min(1, Math.max(0.1, Number(storeFormData.store_opacity || 1))),
                    }}
                  />
                  <div className="text-xs text-slate-500 font-semibold">
                    Solid material in 3D. Use opacity only for extra visual separation.
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-3">
                <AlertCircle className="text-blue-600 shrink-0" size={20} />
                <p className="text-xs text-blue-700 font-medium leading-relaxed">
                  Changing dimensions will update the grid layout. Existing blankets will remain in their positions but may be outside the new bounds if you decrease rows/columns.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsStoreModalOpen(false)}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                >
                  {editingStore ? 'Save Changes' : 'Create Store'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add Modal */}
      {isQuickAddOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-auto">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-6xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col md:flex-row h-[90vh]">
            {/* Left: Store & Input */}
            <div className="w-full md:w-80 bg-slate-50 border-r border-slate-100 p-8 flex flex-col gap-8 overflow-y-auto">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black tracking-tighter text-slate-900">QUICK ADD</h2>
                <button onClick={() => setIsQuickAddOpen(false)} className="md:hidden p-2 hover:bg-slate-200 rounded-xl">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Select Store</label>
                <div className="grid grid-cols-1 gap-2">
                  {stores.map(s => (
                    <button
                      key={s.store_name}
                      onClick={() => {
                        setQuickAddStore(s.store_name);
                        setSelectedCell(null);
                      }}
                      className={cn(
                        "p-4 rounded-2xl font-bold text-left transition-all border",
                        quickAddStore === s.store_name 
                          ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20" 
                          : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                      )}
                    >
                      {s.store_name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-auto space-y-6">
                <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Selected Position</span>
                  {selectedCell ? (
                    <div className="text-3xl font-black text-slate-900">R{selectedCell.row} : C{selectedCell.col}</div>
                  ) : (
                    <div className="text-xl font-bold text-slate-300 italic">Select a cell...</div>
                  )}
                </div>

                <form onSubmit={handleQuickAdd} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Blanket Number</label>
                    <input 
                      ref={inputRef}
                      type="text" 
                      placeholder="Type number..."
                      className="w-full p-5 bg-white border-2 border-slate-200 rounded-3xl focus:border-blue-600 outline-none transition-all text-2xl font-black"
                      value={quickAddNumber}
                      onChange={(e) => setQuickAddNumber(e.target.value)}
                    />
                  </div>
                  <button 
                    disabled={!selectedCell || !quickAddNumber}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-5 rounded-3xl font-black text-xl shadow-xl shadow-blue-600/20 transition-all active:scale-95"
                  >
                    SAVE & NEXT
                  </button>
                </form>

                {movingBlanket && (
                  <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Move Blanket #{movingBlanket.blanket_number}</span>
                      <button onClick={() => setMovingBlanket(null)} className="text-indigo-400 hover:text-indigo-600">
                        <X size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div />
                      <button 
                        onClick={() => handleMoveBlanket('up')}
                        className="p-3 bg-white border border-indigo-200 rounded-xl hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center"
                      >
                        <ChevronLeft className="rotate-90" size={20} />
                      </button>
                      <div />
                      <button 
                        onClick={() => handleMoveBlanket('left')}
                        className="p-3 bg-white border border-indigo-200 rounded-xl hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <div className="flex items-center justify-center font-black text-indigo-600">MOVE</div>
                      <button 
                        onClick={() => handleMoveBlanket('right')}
                        className="p-3 bg-white border border-indigo-200 rounded-xl hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center"
                      >
                        <ChevronRight size={20} />
                      </button>
                      <div />
                      <button 
                        onClick={() => handleMoveBlanket('down')}
                        className="p-3 bg-white border border-indigo-200 rounded-xl hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center"
                      >
                        <ChevronRight className="rotate-90" size={20} />
                      </button>
                      <div />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 border border-red-100 animate-bounce">
                    <AlertCircle size={20} />
                    <span className="font-bold text-sm">{error}</span>
                  </div>
                )}
                {warning && (
                  <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl flex items-center gap-3 border border-amber-100">
                    <AlertCircle size={20} />
                    <span className="font-bold text-sm">{warning}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Grid Display */}
            <div className="flex-1 bg-white p-8 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black">
                    {quickAddStore[0]}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">{quickAddStore}</h3>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                      Capacity: {storeBlankets.length} / {(currentStore?.rows || 0) * (currentStore?.columns || 0) * currentSlotCapacity}
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsQuickAddOpen(false)} className="hidden md:block p-3 hover:bg-slate-100 rounded-2xl transition-colors">
                  <X size={32} className="text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-50 rounded-[32px] border border-slate-100">
                <div 
                  className="grid gap-2 p-6"
                  style={{ 
                    gridTemplateColumns: `repeat(${currentStore?.columns || 1}, minmax(0, 1fr))`,
                  }}
                >
                  {Array.from({ length: currentStore?.rows || 0 }).map((_, r) => (
                    Array.from({ length: currentStore?.columns || 0 }).map((_, idx) => {
                      const row = r + 1;
                      const col = currentStore ? currentStore.columns - idx : 0;
                      const key = `${row},${col}`;
                      const items = cellBlanketsMap.get(key) ?? [];
                      const count = items.length;
                      const representative = items.at(-1);
                      const isFull = count >= currentSlotCapacity;
                      const isSelected = selectedCell?.row === row && selectedCell?.col === col;
                      const isSuggested = suggestedCell?.row === row && suggestedCell?.col === col;
                      const isLastInserted = lastInsertedCell?.row === row && lastInsertedCell?.column === col;
                      const isMoving = movingBlanket ? items.some((b) => b.id === movingBlanket.id) : false;

                      return (
                        <button
                          key={`${row}-${col}`}
                          onClick={async (event) => {
                            // If we're moving a specific blanket, this click is the target cell.
                            if (movingBlanket) {
                              const adjustedCount = count - (items.some((b) => b.id === movingBlanket.id) ? 1 : 0);
                              if (adjustedCount >= currentSlotCapacity) {
                                setError("Target cell is full!");
                                return;
                              }
                              await updateBlanket(movingBlanket.id, { row, column: col });
                              setMovingBlanket(null);
                              setError(null);
                              return;
                            }

                            // Multi-occupancy: select a cell for adding even if it already has items.
                            if (count < currentSlotCapacity) {
                              setSelectedCell({ row, col });
                              setError(null);
                            } else {
                              setSelectedCell(null);
                              setError("Cell is full!");
                            }

                            // Optional: hold Shift to move the latest item from this cell (single-item move helper).
                            if (event.shiftKey && representative) {
                              setMovingBlanket(representative);
                              setSelectedCell(null);
                              setError(null);
                            }
                          }}
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center text-[10px] font-black transition-all duration-200 relative group",
                            isSelected 
                              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 scale-110 z-10 ring-4 ring-emerald-200" 
                              : isMoving
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 scale-110 z-10 ring-4 ring-indigo-200"
                                : isSuggested && !selectedCell && !movingBlanket
                                  ? "bg-blue-100 text-blue-600 border-2 border-dashed border-blue-400 animate-pulse"
                                  : count > 0
                                    ? isFull
                                      ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                                      : "bg-slate-200 text-slate-500 hover:bg-indigo-100 hover:text-indigo-600"
                                    : isLastInserted
                                      ? "bg-indigo-100 text-indigo-600 border-2 border-indigo-400"
                                      : "bg-white text-slate-300 border border-slate-200 hover:border-blue-400 hover:text-blue-500"
                          )}
                        >
                          {count > 0 ? (
                            <span className="tabular-nums">{count}x</span>
                          ) : isSelected ? (
                            <Check size={16} />
                          ) : (
                            <span className="opacity-0 group-hover:opacity-100">{row}:{col}</span>
                          )}

                          {isSuggested && !selectedCell && !movingBlanket && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
                          )}

                          {count > 0 && representative && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 border border-slate-700 shadow-2xl">
                              R{row}, C{col} · {count}/{currentSlotCapacity}
                              <div className="text-blue-300">Latest #{representative.blanket_number}</div>
                              <div className="text-[10px] text-slate-400">Shift+Click to move latest</div>
                            </div>
                          )}
                        </button>
                      );
                    })
                  ))}
                </div>
              </div>

              <div className="mt-8 flex items-center gap-8 text-xs font-black text-slate-400 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-emerald-500 rounded-md"></div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 border-2 border-dashed border-blue-400 rounded-md"></div>
                  <span>Suggested</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-slate-200 rounded-md"></div>
                  <span>Occupied</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-indigo-100 border-2 border-indigo-400 rounded-md"></div>
                  <span>Last Inserted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Standard Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingBlanket ? 'Edit Blanket' : 'Add New Blanket'}
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Blanket Number</label>
                <input 
                  required
                  type="text" 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-lg font-bold"
                  value={formData.blanket_number}
                  onChange={(e) => setFormData({ ...formData, blanket_number: e.target.value })}
                  placeholder="e.g. 1024"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Store</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-semibold"
                    value={formData.store}
                    onChange={(e) => setFormData({ ...formData, store: e.target.value })}
                  >
                    {stores.map(s => (
                      <option key={s.store_name} value={s.store_name}>{s.store_name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Status</label>
                  <select 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-semibold"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  >
                    <option value="stored">Stored</option>
                    <option value="retrieved">Retrieved</option>
                    <option value="picked">Picked</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Row</label>
                  <input 
                    required
                    type="number" 
                    min="1"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold"
                    value={formData.row}
                    onChange={(e) => setFormData({ ...formData, row: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Column</label>
                  <input 
                    required
                    type="number" 
                    min="1"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold"
                    value={formData.column}
                    onChange={(e) => setFormData({ ...formData, column: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Notes (optional)</label>
                <textarea
                  rows={3}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium resize-y"
                  value={formData.notes ?? ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any notes to attach to the log entry..."
                />
                <div className="text-xs text-slate-400">Saved in activity logs only (not on the blanket record).</div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 rounded-2xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                >
                  {editingBlanket ? 'Save Changes' : 'Add Blanket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
