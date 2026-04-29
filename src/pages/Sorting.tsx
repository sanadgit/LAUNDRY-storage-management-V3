import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { CheckCircle2, ChevronDown, ChevronUp, Crosshair, Home, Loader2, PackageCheck, Plus, Printer, ScanLine, Shirt, Sparkles, Table2, Volume2, VolumeX, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { allowedSortingTabs } from '../lib/roleAccess';
import { detectClothesPackingType, detectSortingItemCategory } from '../utils/sortingItemCategory';
import { extractTicketNumberFromScan } from '../utils/barcode';

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
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  progress_percent: number;
  items: SortingItem[];
};

type SortingCell = {
  id: number;
  table_id: number;
  row_no: number;
  col_no: number;
  active_order_no: string | null;
  status: 'empty' | 'pending' | 'partial' | 'complete';
  updated_at: string;
  customer_name: string | null;
  total_required: number | null;
  total_sorted: number | null;
  order_status: SortingOrder['status'] | null;
  progress: {
    sorted: number;
    required: number;
  };
};

type SortingTable = {
  id: number;
  name: string;
  rows: number;
  cols: number;
  sort_order: number;
  is_active: number;
  created_at: string;
  updated_at: string;
  cells: SortingCell[];
  summary: {
    empty: number;
    pending: number;
    partial: number;
    complete: number;
  };
};

type SortingStateResponse = {
  tables: SortingTable[];
  orders: {
    all: SortingOrder[];
    sorting: SortingOrder[];
    ready_for_packing: SortingOrder[];
    packed: SortingOrder[];
  };
};

type WorkflowTab = 'sorting' | 'packing' | 'blanket_packing';

type ScanResponse = {
  success: boolean;
  placement: {
    table_id: number;
    table_name: string;
    row_no: number;
    col_no: number;
    label: string;
  };
  scan: {
    consumed: number;
    overflow: number;
  };
  order: SortingOrder | null;
  items: SortingItem[];
  state: SortingStateResponse;
};

type FocusPlacement = ScanResponse['placement'] & {
  order_no: string;
};

type SortingOrderBundleResponse = {
  order: SortingOrder;
  items: SortingItem[];
  placement: {
    table_id: number;
    table_name: string;
    row_no: number;
    col_no: number;
    label: string;
  };
};

type PosSearchResponse = {
  orders: Array<{
    order_no: string;
    orders_id: string;
    invoice_id: string;
  }>;
};

type PosOrderDetailsForPrint = {
  general: {
    order_no: string;
    customer_name: string;
    customer_mobile: string;
    delivery_type: string;
    delivery_date: string;
    grand_total: number;
    balance: number;
  };
  line_items: Array<{
    name: string;
    qty: number;
    unit_price: number;
    total_with_tax: number;
  }>;
};

type IroningAchievementsSummary = {
  total_pieces: number;
  total_starts: number;
  unique_orders: number;
};

type BlanketPackingBundleResponse = {
  order: SortingOrder;
  items: SortingItem[];
  totals: {
    required: number;
    packed: number;
    remaining: number;
    complete: boolean;
  };
};

declare global {
  interface Window {
    qz?: any;
  }
}

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

const cellClass = (status: SortingCell['status']) => {
  switch (status) {
    case 'complete':
      return 'border-emerald-900 bg-emerald-700 text-white shadow-[0_0_18px_rgba(6,95,70,0.45)]';
    case 'partial':
      return 'border-amber-400 bg-amber-100 text-amber-800';
    case 'pending':
      return 'border-rose-400 bg-rose-100 text-rose-800';
    default:
      return 'border-slate-200 bg-slate-100 text-slate-400';
  }
};

const buildCellLookup = (table: SortingTable) => {
  const lookup = new Map<string, SortingCell>();
  for (const cell of table.cells) {
    lookup.set(`${cell.row_no}:${cell.col_no}`, cell);
  }
  return lookup;
};

export default function SortingPage() {
  const { currentUser } = useStore();
  const [activeTab, setActiveTab] = useState<WorkflowTab>(() => {
    const initialTabs = allowedSortingTabs(currentUser?.role);
    return initialTabs[0] ?? 'sorting';
  });
  const [stateBusy, setStateBusy] = useState(false);
  const [stateError, setStateError] = useState<string | null>(null);
  const [sortingState, setSortingState] = useState<SortingStateResponse | null>(null);

  const [scanOrderNo, setScanOrderNo] = useState('');
  const [scanQty, setScanQty] = useState(1);
  const [scanBusy, setScanBusy] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [focusPlacement, setFocusPlacement] = useState<FocusPlacement | null>(null);
  const [itemPickerOpen, setItemPickerOpen] = useState(false);
  const [itemPickerData, setItemPickerData] = useState<SortingOrderBundleResponse | null>(null);
  const [itemPickerSelection, setItemPickerSelection] = useState<string>('');
  const [itemPickerError, setItemPickerError] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  const [itemScanBusyKey, setItemScanBusyKey] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState<{
    table: SortingTable;
    cell: SortingCell;
    order: SortingOrder | null;
  } | null>(null);
  const [cellActionBusy, setCellActionBusy] = useState(false);
  const [cellActionError, setCellActionError] = useState<string | null>(null);

  const [tableName, setTableName] = useState('');
  const [tableRows, setTableRows] = useState(2);
  const [tableCols, setTableCols] = useState(6);
  const [tableBusy, setTableBusy] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);
  const [audioGuidanceEnabled, setAudioGuidanceEnabled] = useState(true);

  const [packingBusyOrder, setPackingBusyOrder] = useState<string | null>(null);
  const [ironingOrderInput, setIroningOrderInput] = useState('');
  const [ironingQty, setIroningQty] = useState(1);
  const [ironingBusy, setIroningBusy] = useState(false);
  const [ironingError, setIroningError] = useState<string | null>(null);
  const [packingOrderBundle, setPackingOrderBundle] = useState<SortingOrderBundleResponse | null>(null);
  const [myIroningSummary, setMyIroningSummary] = useState<IroningAchievementsSummary>({
    total_pieces: 0,
    total_starts: 0,
    unique_orders: 0,
  });
  const [myIroningPeriod, setMyIroningPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [blanketOrderInput, setBlanketOrderInput] = useState('');
  const [blanketBusy, setBlanketBusy] = useState(false);
  const [blanketError, setBlanketError] = useState<string | null>(null);
  const [blanketBundle, setBlanketBundle] = useState<BlanketPackingBundleResponse | null>(null);
  const [blanketSelectedItem, setBlanketSelectedItem] = useState<string>('');
  const [blanketScanBusy, setBlanketScanBusy] = useState<string | null>(null);
  const tableRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const cellRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastAnnouncedTargetRef = useRef<string>('');
  const roleAllowedTabs = useMemo<Array<WorkflowTab>>(() => allowedSortingTabs(currentUser?.role), [currentUser?.role]);

  useEffect(() => {
    if (roleAllowedTabs.includes(activeTab)) return;
    setActiveTab(roleAllowedTabs[0] || 'sorting');
  }, [activeTab, roleAllowedTabs]);

  const loadState = useCallback(async () => {
    try {
      setStateBusy(true);
      setStateError(null);
      const response = await axios.get<SortingStateResponse>('/api/sorting/state');
      setSortingState(response.data);
    } catch (error: any) {
      setStateError(error?.response?.data?.error || error?.message || 'Failed to load sorting state.');
    } finally {
      setStateBusy(false);
    }
  }, []);

  const loadMyIroningSummary = useCallback(async () => {
    try {
      const response = await axios.get('/api/achievements/ironing', {
        params: { scope: 'me', period: myIroningPeriod },
      });
      const summary = response.data?.summary ?? {};
      setMyIroningSummary({
        total_pieces: Number(summary.total_pieces ?? 0),
        total_starts: Number(summary.total_starts ?? 0),
        unique_orders: Number(summary.unique_orders ?? 0),
      });
    } catch {
      // Keep UI resilient if achievements endpoint is temporarily unavailable.
    }
  }, [myIroningPeriod]);

  useEffect(() => {
    void loadState();
    void loadMyIroningSummary();
    const interval = window.setInterval(() => {
      void loadState();
      void loadMyIroningSummary();
    }, 15000);
    return () => window.clearInterval(interval);
  }, [loadState, loadMyIroningSummary]);

  useEffect(() => {
    if (!focusPlacement) return;
    const tableEl = tableRefs.current[focusPlacement.table_id];
    tableEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const key = `${focusPlacement.table_id}:${focusPlacement.row_no}:${focusPlacement.col_no}`;
    const timer = window.setTimeout(() => {
      const cellEl = cellRefs.current[key];
      cellEl?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }, 220);
    return () => window.clearTimeout(timer);
  }, [focusPlacement, sortingState?.tables]);

  const sortingOrders = sortingState?.orders.sorting ?? [];
  const readyOrders = sortingState?.orders.ready_for_packing ?? [];
  const packedOrders = sortingState?.orders.packed ?? [];
  const allOrders = sortingState?.orders.all ?? [];
  const blanketPackingOrders = useMemo(
    () =>
      allOrders.filter((order) =>
        order.items.some((item) => detectSortingItemCategory(item.item_name) === 'blanket_phase3')
      ),
    [allOrders]
  );
  const packingClothesBreakdown = useMemo(() => {
    const items = packingOrderBundle?.items ?? [];
    const clothesItems = items.filter((item) => detectSortingItemCategory(item.item_name) === 'clothes');
    const hanging = clothesItems.filter((item) => detectClothesPackingType(item.item_name) === 'hanging');
    const folded = clothesItems.filter((item) => detectClothesPackingType(item.item_name) === 'folded');
    const sum = (list: SortingItem[], field: 'qty_required' | 'qty_sorted' | 'qty_ironed') =>
      list.reduce((acc, item) => acc + Math.max(0, Number(item[field] ?? 0) || 0), 0);

    return {
      clothesItems,
      hanging,
      folded,
      totals: {
        sorted: sum(clothesItems, 'qty_sorted'),
        ironed: sum(clothesItems, 'qty_ironed'),
        required: sum(clothesItems, 'qty_required'),
      },
      hangingTotals: {
        sorted: sum(hanging, 'qty_sorted'),
        ironed: sum(hanging, 'qty_ironed'),
      },
      foldedTotals: {
        sorted: sum(folded, 'qty_sorted'),
        ironed: sum(folded, 'qty_ironed'),
      },
    };
  }, [packingOrderBundle]);
  const ordersByNo = useMemo(() => {
    const map = new Map<string, SortingOrder>();
    for (const order of allOrders) {
      map.set(order.order_no, order);
    }
    return map;
  }, [allOrders]);
  useEffect(() => {
    if (!packingOrderBundle) return;
    const latest = ordersByNo.get(packingOrderBundle.order.order_no);
    if (!latest) return;
    setPackingOrderBundle((current) =>
      current
        ? {
            ...current,
            order: latest,
            items: latest.items,
          }
        : current
    );
  }, [ordersByNo, packingOrderBundle?.order.order_no]);

  const totalCells = useMemo(
    () =>
      (sortingState?.tables ?? []).reduce((sum, table) => {
        return sum + table.rows * table.cols;
      }, 0),
    [sortingState?.tables]
  );

  const occupiedCells = useMemo(
    () =>
      (sortingState?.tables ?? []).reduce((sum, table) => {
        return sum + table.cells.filter((cell) => Boolean(cell.active_order_no)).length;
      }, 0),
    [sortingState?.tables]
  );

  useEffect(() => {
    if (!selectedCell || !sortingState) return;
    const table = sortingState.tables.find((entry) => entry.id === selectedCell.table.id);
    if (!table) {
      setSelectedCell(null);
      return;
    }
    const cell = table.cells.find((entry) => entry.id === selectedCell.cell.id);
    if (!cell) {
      setSelectedCell(null);
      return;
    }
    const order = cell.active_order_no ? ordersByNo.get(cell.active_order_no) ?? null : null;
    setSelectedCell({ table, cell, order });
  }, [sortingState, ordersByNo, selectedCell?.table.id, selectedCell?.cell.id]);

  const openCellDetails = useCallback(
    (table: SortingTable, rowNo: number, colNo: number, cell: SortingCell | undefined) => {
      const resolvedCell: SortingCell =
        cell ??
        ({
          id: -1,
          table_id: table.id,
          row_no: rowNo,
          col_no: colNo,
          active_order_no: null,
          status: 'empty',
          updated_at: new Date().toISOString(),
          customer_name: null,
          total_required: null,
          total_sorted: null,
          order_status: null,
          progress: {
            sorted: 0,
            required: 0,
          },
        } as SortingCell);
      const order = resolvedCell.active_order_no ? ordersByNo.get(resolvedCell.active_order_no) ?? null : null;
      setCellActionError(null);
      setSelectedCell({ table, cell: resolvedCell, order });
    },
    [ordersByNo]
  );

  const playPlacementTone = useCallback(() => {
    if (!audioGuidanceEnabled || typeof window === 'undefined') return;
    const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextCtor) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextCtor();
      }
      const context = audioContextRef.current;
      const now = context.currentTime;
      const makeBeep = (frequency: number, offset: number, duration: number) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = 'triangle';
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.12, now + offset + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + duration);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(now + offset);
        oscillator.stop(now + offset + duration);
      };
      makeBeep(780, 0, 0.14);
      makeBeep(980, 0.18, 0.18);
    } catch {
      // No-op: audio alert is best-effort.
    }
  }, [audioGuidanceEnabled]);

  const speakPlacementGuidance = useCallback(
    (placement: ScanResponse['placement'], orderNo: string) => {
      if (!audioGuidanceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
      const spokenOrder = orderNo.trim().toUpperCase();
      const message = `الطلب ${spokenOrder}. ضع القطعة في ${placement.table_name}. صف ${placement.row_no}. عمود ${placement.col_no}.`;
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'ar-AE';
        utterance.rate = 0.95;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
      } catch {
        // No-op: voice alert is best-effort.
      }
    },
    [audioGuidanceEnabled]
  );

  const announcePlacement = useCallback(
    (placement: ScanResponse['placement'], orderNo: string) => {
      const normalizedOrder = orderNo.trim().toUpperCase();
      const targetKey = `${normalizedOrder}:${placement.table_id}:${placement.row_no}:${placement.col_no}`;
      if (lastAnnouncedTargetRef.current === targetKey) return;
      lastAnnouncedTargetRef.current = targetKey;
      playPlacementTone();
      speakPlacementGuidance(placement, normalizedOrder);
    },
    [playPlacementTone, speakPlacementGuidance]
  );

  useEffect(() => {
    if (audioGuidanceEnabled) return;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [audioGuidanceEnabled]);

  const executeScan = useCallback(
    async (orderNo: string, itemName?: string, qty = 1, busyKey?: string) => {
      try {
        if (busyKey) setItemScanBusyKey(busyKey);
        setScanBusy(true);
        setScanError(null);
        const response = await axios.post<ScanResponse>('/api/sorting/scan', {
          order_no: orderNo,
          qty: Math.max(1, Math.floor(qty) || 1),
          item_name: itemName || undefined,
        });
        setScanResult(response.data);
        setSortingState(response.data.state);
        setFocusPlacement({
          ...response.data.placement,
          order_no: response.data.order?.order_no || orderNo.toUpperCase(),
        });
        announcePlacement(response.data.placement, response.data.order?.order_no || orderNo.toUpperCase());
        return response.data;
      } catch (error: any) {
        setScanError(error?.response?.data?.error || error?.message || 'Failed to process sorting scan.');
        return null;
      } finally {
        setScanBusy(false);
        if (busyKey) setItemScanBusyKey(null);
      }
    },
    [announcePlacement]
  );

  const handleScanSubmit = async () => {
    const orderNo = extractTicketNumberFromScan(scanOrderNo.trim()).trim();
    if (!orderNo) {
      setScanError('Order number is required.');
      return;
    }

    try {
      setScanBusy(true);
      setScanError(null);
      setItemPickerError(null);
      const response = await axios.post<SortingOrderBundleResponse>('/api/sorting/orders/prepare', {
        order_no: orderNo,
      });
      const remaining = response.data.items.filter((item) => item.qty_sorted < item.qty_required);
      if (remaining.length === 0) {
        setScanError('This order is already fully sorted.');
        return;
      }
      setItemPickerData(response.data);
      setItemPickerSelection(remaining[0].item_name);
      setItemPickerOpen(true);
      setScanOrderNo('');
    } catch (error: any) {
      setScanError(error?.response?.data?.error || error?.message || 'Failed to prepare sorting order.');
    } finally {
      setScanBusy(false);
    }
  };

  const handleConfirmItemScan = async () => {
    const picker = itemPickerData;
    if (!picker) return;
    const selectedName = itemPickerSelection.trim();
    if (!selectedName) {
      setItemPickerError('Choose an item type first.');
      return;
    }
    const result = await executeScan(picker.order.order_no, selectedName, scanQty);
    if (result) {
      setItemPickerOpen(false);
      setItemPickerData(null);
      setItemPickerSelection('');
      setItemPickerError(null);
      setScanQty(1);
    }
  };

  const handleAddTable = async () => {
    const normalizedName = tableName.trim();
    if (!normalizedName) {
      setTableError('Table name is required.');
      return;
    }
    try {
      setTableBusy(true);
      setTableError(null);
      await axios.post('/api/sorting/tables', {
        name: normalizedName,
        rows: Math.max(1, Math.floor(tableRows) || 1),
        cols: Math.max(1, Math.floor(tableCols) || 1),
      });
      setTableName('');
      setTableRows(2);
      setTableCols(6);
      await loadState();
    } catch (error: any) {
      setTableError(error?.response?.data?.error || error?.message || 'Failed to add sorting table.');
    } finally {
      setTableBusy(false);
    }
  };

  const handlePackingAction = async (orderNo: string, action: 'start' | 'complete') => {
    try {
      setPackingBusyOrder(orderNo);
      const response = await axios.post<{ state: SortingStateResponse }>(`/api/sorting/orders/${encodeURIComponent(orderNo)}/packing`, {
        action,
      });
      setSortingState(response.data.state);
      await loadMyIroningSummary();
    } catch (error: any) {
      setStateError(error?.response?.data?.error || error?.message || 'Failed to update packing status.');
    } finally {
      setPackingBusyOrder(null);
    }
  };

  const handleIroningStart = async () => {
    const orderNo = ironingOrderInput.trim().toUpperCase();
    if (!orderNo) {
      setIroningError('Order number is required.');
      return;
    }
    try {
      setIroningBusy(true);
      setIroningError(null);
      try {
        const loaded = await axios.get<SortingOrderBundleResponse>(`/api/sorting/order/${encodeURIComponent(orderNo)}`);
        setPackingOrderBundle(loaded.data);
      } catch {
        // Keep trying start; server will return a user-facing error if invalid.
      }
      const response = await axios.post<{ state: SortingStateResponse }>('/api/sorting/ironing/start', {
        order_no: orderNo,
        qty: Math.max(1, Math.floor(ironingQty) || 1),
      });
      if (response.data?.state) {
        setSortingState(response.data.state);
      } else {
        await loadState();
      }
      try {
        const refreshed = await axios.get<SortingOrderBundleResponse>(`/api/sorting/order/${encodeURIComponent(orderNo)}`);
        setPackingOrderBundle(refreshed.data);
      } catch {
        // no-op
      }
      await loadMyIroningSummary();
    } catch (error: any) {
      setIroningError(error?.response?.data?.error || error?.message || 'Failed to record ironing start.');
    } finally {
      setIroningBusy(false);
    }
  };

  const handleLoadPackingOrder = async () => {
    const orderNo = ironingOrderInput.trim().toUpperCase();
    if (!orderNo) {
      setIroningError('Order number is required.');
      return;
    }
    try {
      setIroningBusy(true);
      setIroningError(null);
      const loaded = await axios.get<SortingOrderBundleResponse>(`/api/sorting/order/${encodeURIComponent(orderNo)}`);
      setPackingOrderBundle(loaded.data);
    } catch (error: any) {
      setPackingOrderBundle(null);
      setIroningError(error?.response?.data?.error || error?.message || 'Failed to load order packing details.');
    } finally {
      setIroningBusy(false);
    }
  };

  const toggleOrderExpanded = (orderNo: string) => {
    setExpandedOrders((current) => ({
      ...current,
      [orderNo]: !current[orderNo],
    }));
  };

  const handleQuickItemScan = async (orderNo: string, itemName: string) => {
    const key = `${orderNo}:${itemName}`;
    await executeScan(orderNo, itemName, 1, key);
  };

  const fetchPosDetailsForOrder = async (order: SortingOrder): Promise<PosOrderDetailsForPrint> => {
    let ordersId = (order.source_orders_id || '').trim();
    let invoiceId = (order.source_invoice_id || '').trim();

    if (!ordersId && !invoiceId) {
      const search = await axios.get<PosSearchResponse>('/api/pos/find-laundry-orders', {
        params: { q: order.order_no },
      });
      const exact =
        (search.data?.orders ?? []).find((entry) => entry.order_no?.toUpperCase() === order.order_no.toUpperCase()) ??
        (search.data?.orders ?? [])[0];
      if (!exact) {
        throw new Error('Could not resolve POS order ids for this order.');
      }
      ordersId = String(exact.orders_id ?? '').trim();
      invoiceId = String(exact.invoice_id ?? '').trim();
    }

    const details = await axios.get<PosOrderDetailsForPrint>('/api/pos/order-details', {
      params: {
        orders_id: ordersId || undefined,
        invoice_id: invoiceId || undefined,
        open_type: 'preview',
        mode: '0',
      },
    });
    return details.data;
  };

  const printOrderViaQzTray = async (order: SortingOrder) => {
    const qz = window.qz;
    if (!qz) {
      throw new Error('QZ Tray is not available in this browser. Install and run QZ Tray first.');
    }
    const details = await fetchPosDetailsForOrder(order);
    const now = new Date();

    const lines = [
      'IN & OUT LAUNDRY',
      'SMART STORAGE HUB',
      '------------------------------',
      `ORDER: ${details.general.order_no || order.order_no}`,
      `CUSTOMER: ${details.general.customer_name || order.customer_name || '-'}`,
      `PHONE: ${details.general.customer_mobile || '-'}`,
      `DELIVERY: ${details.general.delivery_type || '-'} ${details.general.delivery_date || ''}`.trim(),
      '------------------------------',
      ...details.line_items.map((item) => {
        const qty = Number(item.qty || 0);
        const total = Number(item.total_with_tax || 0);
        return `${qty}x ${item.name}  ${total.toFixed(2)}`;
      }),
      '------------------------------',
      `GRAND TOTAL: ${Number(details.general.grand_total || 0).toFixed(2)}`,
      `BALANCE: ${Number(details.general.balance || 0).toFixed(2)}`,
      '------------------------------',
      `Printed: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
      '\n\n\n',
    ];
    const payload = lines.join('\n');

    if (!qz.websocket.isActive()) {
      await qz.websocket.connect({ retries: 2, delay: 1 });
    }
    const defaultPrinter = await qz.printers.getDefault();
    const config = qz.configs.create(defaultPrinter);
    await qz.print(config, [payload]);
  };

  const handleCellPrint = async () => {
    if (!selectedCell?.order) return;
    try {
      setCellActionBusy(true);
      setCellActionError(null);
      await printOrderViaQzTray(selectedCell.order);
    } catch (error: any) {
      setCellActionError(error?.message || 'Printing via QZ Tray failed.');
    } finally {
      setCellActionBusy(false);
    }
  };

  const handleCellClear = async () => {
    if (!selectedCell?.order) return;
    try {
      setCellActionBusy(true);
      setCellActionError(null);
      const response = await axios.post<{ state: SortingStateResponse }>(
        `/api/sorting/orders/${encodeURIComponent(selectedCell.order.order_no)}/packing`,
        { action: 'complete' }
      );
      setSortingState(response.data.state);
      setSelectedCell(null);
    } catch (error: any) {
      setCellActionError(error?.response?.data?.error || error?.message || 'Failed to clear completed cell.');
    } finally {
      setCellActionBusy(false);
    }
  };

  const handleCellPrintAndClear = async () => {
    if (!selectedCell?.order) return;
    try {
      setCellActionBusy(true);
      setCellActionError(null);
      await printOrderViaQzTray(selectedCell.order);
      const response = await axios.post<{ state: SortingStateResponse }>(
        `/api/sorting/orders/${encodeURIComponent(selectedCell.order.order_no)}/packing`,
        { action: 'complete' }
      );
      setSortingState(response.data.state);
      setSelectedCell(null);
    } catch (error: any) {
      setCellActionError(error?.response?.data?.error || error?.message || 'Failed to print and clear completed cell.');
    } finally {
      setCellActionBusy(false);
    }
  };

  const printBlanketPackLabelViaQzTray = async (payload: {
    orderNo: string;
    customerName: string;
    itemName: string;
    packed: number;
    required: number;
  }) => {
    const qz = window.qz;
    if (!qz) return;
    const now = new Date();
    const barcodeText = `*${payload.orderNo}*`;
    const lines = [
      'IN & OUT LAUNDRY',
      'BLANKET PACKING LABEL',
      '------------------------------',
      `ORDER: ${payload.orderNo}`,
      `CUSTOMER: ${payload.customerName || '-'}`,
      `ITEM: ${payload.itemName}`,
      `PROGRESS: ${payload.packed} / ${payload.required}`,
      `BARCODE: ${barcodeText}`,
      '------------------------------',
      `Printed: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
      '\n\n\n',
    ];
    const textPayload = lines.join('\n');

    if (!qz.websocket.isActive()) {
      await qz.websocket.connect({ retries: 2, delay: 1 });
    }
    const defaultPrinter = await qz.printers.getDefault();
    const config = qz.configs.create(defaultPrinter);
    await qz.print(config, [textPayload]);
  };

  const loadBlanketPackingOrder = async (explicitOrderNo?: string) => {
    const raw = String(explicitOrderNo ?? blanketOrderInput).trim();
    const orderNo = extractTicketNumberFromScan(raw).trim().toUpperCase();
    if (!orderNo) {
      setBlanketError('Order number is required.');
      return;
    }
    try {
      setBlanketBusy(true);
      setBlanketError(null);
      const response = await axios.get<BlanketPackingBundleResponse>(`/api/sorting/blanket/order/${encodeURIComponent(orderNo)}`);
      setBlanketBundle(response.data);
      const firstItemWithRemaining =
        (response.data.items ?? []).find((item) => (item.qty_packed ?? 0) < item.qty_required) ?? response.data.items?.[0];
      setBlanketSelectedItem(firstItemWithRemaining?.item_name ?? '');
    } catch (error: any) {
      setBlanketBundle(null);
      setBlanketError(error?.response?.data?.error || error?.message || 'Failed to load blanket packing order.');
    } finally {
      setBlanketBusy(false);
    }
  };

  const processBlanketPiece = async (itemName?: string) => {
    const orderNo = blanketBundle?.order?.order_no || extractTicketNumberFromScan(blanketOrderInput.trim()).trim().toUpperCase();
    if (!orderNo) {
      setBlanketError('Order number is required.');
      return;
    }
    const chosen = String(itemName || blanketSelectedItem || '').trim();
    if (!chosen) {
      setBlanketError('Select item type first (blanket/pillow).');
      return;
    }

    try {
      setBlanketScanBusy(chosen);
      setBlanketError(null);
      const response = await axios.post<{
        order: SortingOrder;
        items: SortingItem[];
        totals: BlanketPackingBundleResponse['totals'];
      }>('/api/sorting/blanket/scan', {
        order_no: orderNo,
        item_name: chosen,
        qty: 1,
      });

      const updated: BlanketPackingBundleResponse = {
        order: response.data.order,
        items: response.data.items,
        totals: response.data.totals,
      };
      setBlanketBundle(updated);
      const justUpdated = updated.items.find((item) => item.item_name === chosen);
      if (justUpdated) {
        await printBlanketPackLabelViaQzTray({
          orderNo: updated.order.order_no,
          customerName: updated.order.customer_name || '',
          itemName: justUpdated.item_name,
          packed: Math.max(0, Number(justUpdated.qty_packed ?? 0)),
          required: Math.max(0, Number(justUpdated.qty_required ?? 0)),
        });
      }

      const nextItem =
        updated.items.find((item) => (item.qty_packed ?? 0) < item.qty_required) ??
        updated.items.find((item) => item.item_name === chosen) ??
        updated.items[0];
      setBlanketSelectedItem(nextItem?.item_name ?? '');
    } catch (error: any) {
      setBlanketError(error?.response?.data?.error || error?.message || 'Failed to process blanket packing scan.');
    } finally {
      setBlanketScanBusy(null);
    }
  };

  return (
    <div className="px-4 sm:px-8 py-4 sm:py-8 space-y-5 sm:space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.25em] text-slate-500 font-black">Smart Storage Hub</div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">فرز الملابس</h1>
            <p className="mt-2 text-sm text-slate-600 font-medium max-w-3xl">
              امسح رقم الطلب أو اكتبه يدويًا. النظام يوجه العامل تلقائيًا إلى الطاولة والخلية المناسبة، ويتابع اكتمال عدد القطع لكل طلب.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              void loadState();
            }}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-700"
          >
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">Tables</div>
            <div className="text-xl font-black text-slate-900">{sortingState?.tables.length ?? 0}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">Cells</div>
            <div className="text-xl font-black text-slate-900">{occupiedCells} / {totalCells}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">Sorting</div>
            <div className="text-xl font-black text-slate-900">{sortingOrders.length}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
            <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">Ready For Packing</div>
            <div className="text-xl font-black text-slate-900">{readyOrders.length}</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex rounded-2xl border border-slate-300 bg-slate-100 p-1">
            {roleAllowedTabs.includes('sorting') && (
              <button
                type="button"
                onClick={() => setActiveTab('sorting')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider ${
                  activeTab === 'sorting' ? 'bg-blue-600 text-white' : 'text-slate-600'
                }`}
              >
                فرز الملابس
              </button>
            )}
            {roleAllowedTabs.includes('packing') && (
              <button
                type="button"
                onClick={() => setActiveTab('packing')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider ${
                  activeTab === 'packing' ? 'bg-blue-600 text-white' : 'text-slate-600'
                }`}
              >
                الكي والتعبئة
              </button>
            )}
            {roleAllowedTabs.includes('blanket_packing') && (
              <button
                type="button"
                onClick={() => setActiveTab('blanket_packing')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider ${
                  activeTab === 'blanket_packing' ? 'bg-blue-600 text-white' : 'text-slate-600'
                }`}
              >
                blanket packing
              </button>
            )}
          </div>
          {roleAllowedTabs.length === 1 && (
            <div className="text-xs font-semibold text-slate-600">
              Your role has access to one workflow tab in this page.
            </div>
          )}
        </div>
      </section>

      {stateError && (
        <div className="rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {stateError}
        </div>
      )}

      {itemPickerOpen && itemPickerData && (
        <div className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.2em] font-black text-slate-500">Select Piece Type</div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  Order {itemPickerData.order.order_no} → {itemPickerData.placement.label}
                </h3>
                <div className="text-xs text-slate-600 font-semibold mt-1">
                  اختر نوع القطعة أولًا ثم اضغط Confirm ليتم توجيه العامل لنفس الخلية.
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setItemPickerOpen(false);
                  setItemPickerData(null);
                  setItemPickerSelection('');
                  setItemPickerError(null);
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-700"
              >
                Close
              </button>
            </div>

            {(() => {
              const remainingItems = itemPickerData.items.filter((item) => item.qty_sorted < item.qty_required);
              const { clothes, homePhase2, blanketPhase3 } = splitOrderItems(remainingItems);
              const renderGroup = (
                title: string,
                icon: 'clothes' | 'home' | 'blanket',
                items: SortingItem[],
                tone: 'blue' | 'emerald' | 'violet'
              ) => {
                if (items.length === 0) return null;
                const tileClass =
                  tone === 'blue'
                    ? 'border-blue-500 bg-blue-50 shadow-[0_0_20px_rgba(59,130,246,0.28)]'
                    : tone === 'emerald'
                      ? 'border-emerald-500 bg-emerald-50 shadow-[0_0_20px_rgba(16,185,129,0.22)]'
                      : 'border-violet-500 bg-violet-50 shadow-[0_0_20px_rgba(139,92,246,0.22)]';
                return (
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-600">
                      {icon === 'clothes' ? <Shirt size={14} /> : icon === 'home' ? <Home size={14} /> : <PackageCheck size={14} />}
                      {title}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {items.map((item) => {
                        const remaining = Math.max(0, item.qty_required - item.qty_sorted);
                        const active = itemPickerSelection === item.item_name;
                        return (
                          <button
                            key={`${item.order_no}:${item.id}`}
                            type="button"
                            onClick={() => {
                              setItemPickerSelection(item.item_name);
                              setItemPickerError(null);
                            }}
                            className={`aspect-square rounded-xl border p-2 text-left transition-all ${
                              active
                                ? tileClass
                                : 'border-slate-300 bg-white hover:border-slate-400'
                            }`}
                          >
                            <div className="text-[11px] font-black text-slate-900 line-clamp-2">{item.item_name}</div>
                            <div className="mt-2 text-[10px] font-semibold text-slate-600">
                              Sorted {item.qty_sorted} / {item.qty_required}
                            </div>
                            <div className={`mt-1 text-[10px] font-black ${remaining > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                              Remaining: {remaining}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              };

              return (
                <div className="space-y-3 max-h-[52vh] overflow-y-auto pr-1">
                  {renderGroup('Clothes Pieces (Stage 1)', 'clothes', clothes, 'blue')}
                  {renderGroup('Home Items (Phase 2: Sheets / Pillow Cases / Curtains)', 'home', homePhase2, 'emerald')}
                  {renderGroup('Blankets (Phase 3)', 'blanket', blanketPhase3, 'violet')}
                  {remainingItems.length === 0 && (
                    <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                      All pieces already completed for this order.
                    </div>
                  )}
                </div>
              );
            })()}

            {itemPickerError && (
              <div className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                {itemPickerError}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-600 font-semibold">
                Scan Qty: <span className="font-black text-slate-900">{Math.max(1, Math.floor(scanQty) || 1)}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  void handleConfirmItemScan();
                }}
                disabled={scanBusy}
                className="rounded-xl bg-blue-600 text-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] inline-flex items-center gap-2 disabled:opacity-50"
              >
                {scanBusy ? <Loader2 size={14} className="animate-spin" /> : <Crosshair size={14} />}
                Confirm & Scan
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedCell && (
        <div className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white shadow-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.2em] font-black text-slate-500">Cell Details</div>
                <h3 className="text-lg font-black text-slate-900">
                  {selectedCell.table.name} • R{selectedCell.cell.row_no}:C{selectedCell.cell.col_no}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedCell(null);
                  setCellActionError(null);
                }}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-slate-600 hover:text-slate-900"
                aria-label="Close cell details"
              >
                <X size={16} />
              </button>
            </div>

            {!selectedCell.cell.active_order_no || !selectedCell.order ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-600">
                This cell is empty.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-black">Order</div>
                    <div className="font-black text-slate-900">{selectedCell.order.order_no}</div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-black">Progress</div>
                    <div className="font-black text-slate-900">
                      {selectedCell.order.total_sorted}/{selectedCell.order.total_required} ({formatPercent(selectedCell.order.progress_percent)})
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-3 py-2 bg-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-600">
                    Items In This Order
                  </div>
                  <div className="max-h-44 overflow-y-auto divide-y divide-slate-100">
                    {selectedCell.order.items.length === 0 ? (
                      <div className="px-3 py-3 text-xs text-slate-500 font-semibold">No item details.</div>
                    ) : (
                      selectedCell.order.items.map((item) => (
                        <div key={`${selectedCell.order!.order_no}:${item.id}`} className="px-3 py-2 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-xs font-black text-slate-900 truncate">{item.item_name}</div>
                            <div className="text-[11px] text-slate-600 font-semibold">
                              {item.qty_sorted}/{item.qty_required}
                            </div>
                          </div>
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full border ${
                              item.status === 'complete'
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                                : item.status === 'partial'
                                  ? 'bg-amber-100 text-amber-700 border-amber-300'
                                  : 'bg-rose-100 text-rose-700 border-rose-300'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {selectedCell.cell.status === 'complete' && (
                  <div className="rounded-xl border border-emerald-800 bg-emerald-700 px-3 py-3 text-white text-sm font-semibold">
                    This cell is complete. Worker should clear this cell now and print invoice via QZ Tray.
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      void handleCellPrint();
                    }}
                    disabled={cellActionBusy}
                    className="rounded-xl border border-indigo-300 bg-indigo-50 px-3 py-2 text-xs font-black uppercase tracking-wider text-indigo-700 inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    {cellActionBusy ? <Loader2 size={13} className="animate-spin" /> : <Printer size={13} />}
                    Print via QZ Tray
                  </button>

                  {selectedCell.cell.status === 'complete' && (
                    <button
                      type="button"
                      onClick={() => {
                        void handleCellPrintAndClear();
                      }}
                      disabled={cellActionBusy}
                      className="rounded-xl border border-slate-900 bg-slate-900 px-3 py-2 text-xs font-black uppercase tracking-wider text-white inline-flex items-center gap-2 disabled:opacity-50"
                    >
                      {cellActionBusy ? <Loader2 size={13} className="animate-spin" /> : <PackageCheck size={13} />}
                      Print + Clear
                    </button>
                  )}

                  {selectedCell.cell.status === 'complete' && (
                    <button
                      type="button"
                      onClick={() => {
                        void handleCellClear();
                      }}
                      disabled={cellActionBusy}
                      className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-black uppercase tracking-wider text-emerald-700 inline-flex items-center gap-2 disabled:opacity-50"
                    >
                      {cellActionBusy ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                      Clear Cell (Packed)
                    </button>
                  )}
                </div>
              </>
            )}

            {cellActionError && (
              <div className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                {cellActionError}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'sorting' && (
        <>
          <section className="rounded-3xl border border-slate-200 bg-white p-3 sm:p-4 shadow-sm space-y-3">
            {focusPlacement && (
              <div className="rounded-2xl border border-indigo-300 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-3 py-3 text-white shadow-[0_0_35px_rgba(59,130,246,0.35)] animate-pulse">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-indigo-100">
                    <Sparkles size={14} /> Focus Mode
                  </div>
                  <button
                    type="button"
                    onClick={() => setFocusPlacement(null)}
                    className="rounded-lg border border-white/40 bg-white/15 px-2 py-1 text-[10px] font-black uppercase tracking-wider"
                  >
                    Clear Focus
                  </button>
                </div>
                <div className="mt-2 text-sm sm:text-base font-black">
                  Order {focusPlacement.order_no} → {focusPlacement.label}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-slate-800 font-black text-sm">
                    <ScanLine size={16} />
                    Scan / Manual Entry
                  </div>
                  <button
                    type="button"
                    onClick={() => setAudioGuidanceEnabled((prev) => !prev)}
                    className={`rounded-xl border px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 ${
                      audioGuidanceEnabled
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                        : 'border-slate-300 bg-white text-slate-600'
                    }`}
                  >
                    {audioGuidanceEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
                    Voice {audioGuidanceEnabled ? 'On' : 'Off'}
                  </button>
                </div>
                <div className="text-[11px] font-semibold text-slate-600">
                  بعد نجاح المعالجة: تنبيه صوتي + توجيه نطق بمكان الوضع (الطاولة/الصف/العمود).
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={scanOrderNo}
                    onChange={(event) => setScanOrderNo(event.target.value)}
                    placeholder="Order number (e.g. M35427)"
                    className="sm:col-span-3 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900"
                  />
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={scanQty}
                    onChange={(event) => setScanQty(Number(event.target.value))}
                    placeholder="Qty"
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void handleScanSubmit();
                  }}
                  disabled={scanBusy}
                  className="rounded-xl bg-blue-600 text-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {scanBusy ? <Loader2 size={14} className="animate-spin" /> : <Crosshair size={14} />}
                  Process Scan (Pick Item)
                </button>
                {scanError && (
                  <div className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                    {scanError}
                  </div>
                )}
                {scanResult && (
                  <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 space-y-1">
                    <div>
                      Placed at: <span className="font-black">{scanResult.placement.label}</span>
                    </div>
                    <div>
                      Consumed: <span className="font-black">{scanResult.scan.consumed}</span>
                      {scanResult.scan.overflow > 0 ? (
                        <span className="ml-2 text-amber-700">Overflow not counted: {scanResult.scan.overflow}</span>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-black text-sm">
                  <Plus size={16} />
                  Add Sorting Table
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={tableName}
                    onChange={(event) => setTableName(event.target.value)}
                    placeholder="Table name (e.g. Table 2)"
                    className="sm:col-span-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900"
                  />
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={tableRows}
                    onChange={(event) => setTableRows(Number(event.target.value))}
                    placeholder="Rows"
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900"
                  />
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={tableCols}
                    onChange={(event) => setTableCols(Number(event.target.value))}
                    placeholder="Columns"
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void handleAddTable();
                  }}
                  disabled={tableBusy}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-slate-700 disabled:opacity-50"
                >
                  {tableBusy ? 'Adding...' : 'Add Table'}
                </button>
                {tableError && (
                  <div className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                    {tableError}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-black">
              <Table2 size={18} />
              Sorting Tables
            </div>

            {stateBusy && !sortingState ? (
              <div className="text-sm text-slate-500 font-semibold inline-flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Loading tables...
              </div>
            ) : (sortingState?.tables.length ?? 0) === 0 ? (
              <div className="text-sm text-slate-500 font-semibold">No sorting tables found.</div>
            ) : (
              <div className="space-y-4">
                {sortingState?.tables.map((table) => {
                  const lookup = buildCellLookup(table);
                  const isFocusedTable = focusPlacement?.table_id === table.id;
                  return (
                    <div
                      key={table.id}
                      ref={(element) => {
                        tableRefs.current[table.id] = element;
                      }}
                      className={`rounded-2xl border p-3 sm:p-4 space-y-3 transition-all duration-500 ${
                        isFocusedTable
                          ? 'border-blue-400 bg-blue-50/60 shadow-[0_0_35px_rgba(37,99,235,0.28)]'
                          : focusPlacement
                            ? 'border-slate-200 bg-white/70 opacity-75'
                            : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="font-black text-slate-900">{table.name}</div>
                          <div className="text-xs text-slate-500 font-semibold">
                            {table.rows} Rows × {table.cols} Columns
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-black uppercase tracking-wider">
                          <span className="px-2 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-700">Empty {table.summary.empty}</span>
                          <span className="px-2 py-1 rounded-full bg-rose-100 border border-rose-300 text-rose-700">Pending {table.summary.pending}</span>
                          <span className="px-2 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-700">Partial {table.summary.partial}</span>
                          <span className="px-2 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700">Complete {table.summary.complete}</span>
                        </div>
                      </div>

                      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${table.cols}, minmax(0, 1fr))` }}>
                        {Array.from({ length: table.rows * table.cols }).map((_, index) => {
                          const rowNo = Math.floor(index / table.cols) + 1;
                          const colNo = (index % table.cols) + 1;
                          const cell = lookup.get(`${rowNo}:${colNo}`);
                          const isFocusCell =
                            focusPlacement?.table_id === table.id &&
                            focusPlacement?.row_no === rowNo &&
                            focusPlacement?.col_no === colNo;
                          const cellKey = `${table.id}:${rowNo}:${colNo}`;
                          return (
                            <div
                              key={cellKey}
                              ref={(element) => {
                                cellRefs.current[cellKey] = element;
                              }}
                              role="button"
                              tabIndex={0}
                              onClick={() => {
                                openCellDetails(table, rowNo, colNo, cell);
                              }}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault();
                                  openCellDetails(table, rowNo, colNo, cell);
                                }
                              }}
                              className={`relative min-h-[68px] rounded-xl border p-2 text-[10px] font-semibold transition-all duration-500 ${
                                cellClass(cell?.status ?? 'empty')
                              } ${
                                isFocusCell
                                  ? 'ring-2 ring-cyan-400 animate-pulse scale-[1.04] z-10 shadow-[0_0_30px_rgba(34,211,238,0.65)]'
                                  : focusPlacement
                                    ? 'opacity-70'
                                    : ''
                              } cursor-pointer`}
                            >
                              <div className="font-black text-[10px]">R{rowNo}:C{colNo}</div>
                              {isFocusCell && (
                                <div className="absolute -top-2 -right-2 rounded-full bg-cyan-500 text-white text-[9px] font-black px-1.5 py-0.5 shadow-md">
                                  TARGET
                                </div>
                              )}
                              {cell?.active_order_no ? (
                                <>
                                  <div className="mt-1 font-black text-[11px] truncate">{cell.active_order_no}</div>
                                  <div className="text-[10px]">
                                    {cell.progress.sorted}/{cell.progress.required}
                                  </div>
                                </>
                              ) : (
                                <div className="mt-2">Empty</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-black">
              <PackageCheck size={18} />
              Active Sorting Orders
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr className="text-left">
                    <th className="px-3 py-2 font-black uppercase tracking-wider">Order</th>
                    <th className="px-3 py-2 font-black uppercase tracking-wider">Customer</th>
                    <th className="px-3 py-2 font-black uppercase tracking-wider">Progress</th>
                    <th className="px-3 py-2 font-black uppercase tracking-wider">Status</th>
                    <th className="px-3 py-2 font-black uppercase tracking-wider">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {sortingOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-slate-500 font-semibold">
                        No active sorting orders.
                      </td>
                    </tr>
                  ) : (
                    sortingOrders.map((order) => {
                      const expanded = Boolean(expandedOrders[order.order_no]);
                      const split = splitOrderItems(order.items);
                      return (
                        <Fragment key={order.order_no}>
                          <tr key={`${order.order_no}-row`} className="border-t border-slate-200">
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
                              <div className="font-semibold text-slate-700">
                                {order.total_sorted}/{order.total_required} ({formatPercent(order.progress_percent)})
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <span className={`inline-flex px-2 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${statusBadgeClass(order.status)}`}>
                                {formatOrderStatus(order.status)}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-slate-700 font-semibold">
                              {order.table_id && order.row_no && order.col_no ? `T${order.table_id} • R${order.row_no}:C${order.col_no}` : '-'}
                            </td>
                          </tr>

                          {expanded && (
                            <tr key={`${order.order_no}-expand`} className="border-t border-slate-100 bg-slate-50">
                              <td colSpan={5} className="px-3 py-3">
                                <div className="space-y-3">
                                  <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-600">
                                    Piece Processing
                                  </div>

                                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                                    <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                                      <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-slate-600">
                                        <Shirt size={13} /> Clothes
                                      </div>
                                      <div className="space-y-2">
                                        {split.clothes.length === 0 ? (
                                          <div className="text-xs text-slate-500 font-semibold">No clothes pieces.</div>
                                        ) : (
                                          split.clothes.map((item) => {
                                            const remain = Math.max(0, item.qty_required - item.qty_sorted);
                                            const busyKey = `${order.order_no}:${item.item_name}`;
                                            const busy = itemScanBusyKey === busyKey;
                                            return (
                                              <div key={item.id} className="rounded-lg border border-slate-200 px-2.5 py-2 flex items-center justify-between gap-2">
                                                <div className="min-w-0">
                                                  <div className="text-xs font-black text-slate-900 truncate">{item.item_name}</div>
                                                  <div className="text-[11px] text-slate-600 font-semibold">
                                                    {item.qty_sorted}/{item.qty_required} • Remaining {remain}
                                                  </div>
                                                </div>
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    void handleQuickItemScan(order.order_no, item.item_name);
                                                  }}
                                                  disabled={busy || remain <= 0}
                                                  className="shrink-0 rounded-md border border-blue-300 bg-blue-50 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-blue-700 disabled:opacity-50"
                                                >
                                                  {busy ? '...' : '+1'}
                                                </button>
                                              </div>
                                            );
                                          })
                                        )}
                                      </div>
                                    </div>

                                    <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                                      <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-slate-600">
                                        <Home size={13} /> Home Items (Phase 2)
                                      </div>
                                      <div className="space-y-2">
                                        {split.homePhase2.length === 0 ? (
                                          <div className="text-xs text-slate-500 font-semibold">No home items in this order.</div>
                                        ) : (
                                          split.homePhase2.map((item) => {
                                            const remain = Math.max(0, item.qty_required - item.qty_sorted);
                                            const busyKey = `${order.order_no}:${item.item_name}`;
                                            const busy = itemScanBusyKey === busyKey;
                                            return (
                                              <div key={item.id} className="rounded-lg border border-slate-200 px-2.5 py-2 flex items-center justify-between gap-2">
                                                <div className="min-w-0">
                                                  <div className="text-xs font-black text-slate-900 truncate">{item.item_name}</div>
                                                  <div className="text-[11px] text-slate-600 font-semibold">
                                                    {item.qty_sorted}/{item.qty_required} • Remaining {remain}
                                                  </div>
                                                </div>
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    void handleQuickItemScan(order.order_no, item.item_name);
                                                  }}
                                                  disabled={busy || remain <= 0}
                                                  className="shrink-0 rounded-md border border-emerald-300 bg-emerald-50 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 disabled:opacity-50"
                                                >
                                                  {busy ? '...' : '+1'}
                                                </button>
                                              </div>
                                            );
                                          })
                                        )}
                                      </div>
                                    </div>

                                    <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                                      <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-slate-600">
                                        <PackageCheck size={13} /> Blankets (Phase 3)
                                      </div>
                                      <div className="space-y-2">
                                        {split.blanketPhase3.length === 0 ? (
                                          <div className="text-xs text-slate-500 font-semibold">No blanket items in this order.</div>
                                        ) : (
                                          split.blanketPhase3.map((item) => {
                                            const remain = Math.max(0, item.qty_required - item.qty_sorted);
                                            const busyKey = `${order.order_no}:${item.item_name}`;
                                            const busy = itemScanBusyKey === busyKey;
                                            return (
                                              <div key={item.id} className="rounded-lg border border-slate-200 px-2.5 py-2 flex items-center justify-between gap-2">
                                                <div className="min-w-0">
                                                  <div className="text-xs font-black text-slate-900 truncate">{item.item_name}</div>
                                                  <div className="text-[11px] text-slate-600 font-semibold">
                                                    {item.qty_sorted}/{item.qty_required} • Remaining {remain}
                                                  </div>
                                                </div>
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    void handleQuickItemScan(order.order_no, item.item_name);
                                                  }}
                                                  disabled={busy || remain <= 0}
                                                  className="shrink-0 rounded-md border border-violet-300 bg-violet-50 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-violet-700 disabled:opacity-50"
                                                >
                                                  {busy ? '...' : '+1'}
                                                </button>
                                              </div>
                                            );
                                          })
                                        )}
                                      </div>
                                    </div>
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
          </section>
        </>
      )}

      {activeTab === 'packing' && (
        <>
          <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500 font-black">Ironing Start</div>
                <div className="text-lg font-black text-slate-900">اكتب رقم الطلب ثم Enter لكل قطعة تم كيّها</div>
              </div>
              <select
                value={myIroningPeriod}
                onChange={(event) => setMyIroningPeriod(event.target.value as 'today' | 'week' | 'month')}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-700"
                title="My achievements period"
              >
                <option value="today">Today</option>
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">My Starts</div>
                <div className="text-2xl font-black text-slate-900">{myIroningSummary.total_starts}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">My Ironed Pieces</div>
                <div className="text-2xl font-black text-slate-900">{myIroningSummary.total_pieces}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">My Orders</div>
                <div className="text-2xl font-black text-slate-900">{myIroningSummary.unique_orders}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={ironingOrderInput}
                onChange={(event) => setIroningOrderInput(event.target.value.toUpperCase())}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    void handleIroningStart();
                  }
                }}
                placeholder="Order number (example: M35427)"
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-900 uppercase tracking-wide"
              />
              <input
                type="number"
                min={1}
                step={1}
                value={ironingQty}
                onChange={(event) => setIroningQty(Math.max(1, Number(event.target.value) || 1))}
                className="w-full sm:w-24 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-900"
                title="Pieces"
                placeholder="Qty"
              />
              <button
                type="button"
                onClick={() => {
                  void handleLoadPackingOrder();
                }}
                disabled={ironingBusy}
                className="rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 px-4 py-2.5 text-xs font-black uppercase tracking-[0.2em] disabled:opacity-60"
              >
                {ironingBusy ? '...' : 'Load'}
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleIroningStart();
                }}
                disabled={ironingBusy}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 text-xs font-black uppercase tracking-[0.2em] disabled:opacity-60"
              >
                {ironingBusy ? 'Saving…' : 'Start Ironing'}
              </button>
            </div>

            {packingOrderBundle && (
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-black text-indigo-900">
                    Order {packingOrderBundle.order.order_no} • {packingOrderBundle.order.customer_name || 'Unknown customer'}
                  </div>
                  <div className="text-xs font-black uppercase tracking-wider text-indigo-700">
                    Sorted clothes: {packingClothesBreakdown.totals.sorted} • Ironed: {packingClothesBreakdown.totals.ironed}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="rounded-xl border border-indigo-200 bg-white px-3 py-2">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">Sorted From Sorting Tab</div>
                    <div className="text-lg font-black text-slate-900">{packingClothesBreakdown.totals.sorted}</div>
                  </div>
                  <div className="rounded-xl border border-indigo-200 bg-white px-3 py-2">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">Ironed</div>
                    <div className="text-lg font-black text-slate-900">{packingClothesBreakdown.totals.ironed}</div>
                  </div>
                  <div className="rounded-xl border border-indigo-200 bg-white px-3 py-2">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">Remaining</div>
                    <div className="text-lg font-black text-slate-900">
                      {Math.max(0, packingClothesBreakdown.totals.sorted - packingClothesBreakdown.totals.ironed)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                    <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-600">Hanging Clothes</div>
                    <div className="text-xs font-semibold text-slate-600">
                      Sorted {packingClothesBreakdown.hangingTotals.sorted} • Ironed {packingClothesBreakdown.hangingTotals.ironed}
                    </div>
                    <div className="max-h-32 overflow-auto space-y-1">
                      {packingClothesBreakdown.hanging.length === 0 ? (
                        <div className="text-xs text-slate-500 font-semibold">No hanging items.</div>
                      ) : (
                        packingClothesBreakdown.hanging.map((item) => (
                          <div key={`hang-${item.id}`} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-2 py-1.5">
                            <div className="text-xs font-black text-slate-900 truncate">{item.item_name}</div>
                            <div className="text-[11px] font-semibold text-slate-700">
                              {item.qty_ironed ?? 0}/{item.qty_sorted}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                    <div className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-600">Folded Clothes</div>
                    <div className="text-xs font-semibold text-slate-600">
                      Sorted {packingClothesBreakdown.foldedTotals.sorted} • Ironed {packingClothesBreakdown.foldedTotals.ironed}
                    </div>
                    <div className="max-h-32 overflow-auto space-y-1">
                      {packingClothesBreakdown.folded.length === 0 ? (
                        <div className="text-xs text-slate-500 font-semibold">No folded items.</div>
                      ) : (
                        packingClothesBreakdown.folded.map((item) => (
                          <div key={`fold-${item.id}`} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-2 py-1.5">
                            <div className="text-xs font-black text-slate-900 truncate">{item.item_name}</div>
                            <div className="text-[11px] font-semibold text-slate-700">
                              {item.qty_ironed ?? 0}/{item.qty_sorted}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {ironingError && (
              <div className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                {ironingError}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-black">
              <CheckCircle2 size={18} />
              Ready For Packing
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr className="text-left">
                    <th className="px-3 py-2 font-black uppercase tracking-wider">Order</th>
                    <th className="px-3 py-2 font-black uppercase tracking-wider">Customer</th>
                    <th className="px-3 py-2 font-black uppercase tracking-wider">Progress</th>
                    <th className="px-3 py-2 font-black uppercase tracking-wider">Status</th>
                    <th className="px-3 py-2 font-black uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {readyOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-slate-500 font-semibold">
                        No orders are ready for packing.
                      </td>
                    </tr>
                  ) : (
                    readyOrders.map((order) => {
                      const isBusy = packingBusyOrder === order.order_no;
                      return (
                        <tr key={order.order_no} className="border-t border-slate-200">
                          <td className="px-3 py-2 font-black text-slate-900">{order.order_no}</td>
                          <td className="px-3 py-2 font-semibold text-slate-700">{order.customer_name || '-'}</td>
                          <td className="px-3 py-2 font-semibold text-slate-700">
                            {order.total_sorted}/{order.total_required}
                          </td>
                          <td className="px-3 py-2">
                            <span className={`inline-flex px-2 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider ${statusBadgeClass(order.status)}`}>
                              {formatOrderStatus(order.status)}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex flex-wrap gap-2">
                              {order.status === 'sorted_complete' && (
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => {
                                    void handlePackingAction(order.order_no, 'start');
                                  }}
                                  className="rounded-lg border border-indigo-300 bg-indigo-50 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-700 disabled:opacity-50"
                                >
                                  {isBusy ? '...' : 'Start Packing'}
                                </button>
                              )}
                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => {
                                  void handlePackingAction(order.order_no, 'complete');
                                }}
                                className="rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 disabled:opacity-50"
                              >
                                {isBusy ? '...' : 'Mark Packed'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-black">
              <PackageCheck size={18} />
              Packed History
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr className="text-left">
                    <th className="px-3 py-2 font-black uppercase tracking-wider">Order</th>
                    <th className="px-3 py-2 font-black uppercase tracking-wider">Customer</th>
                    <th className="px-3 py-2 font-black uppercase tracking-wider">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {packedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-3 py-6 text-center text-slate-500 font-semibold">
                        No packed orders yet.
                      </td>
                    </tr>
                  ) : (
                    packedOrders.map((order) => (
                      <tr key={order.order_no} className="border-t border-slate-200">
                        <td className="px-3 py-2 font-black text-slate-900">{order.order_no}</td>
                        <td className="px-3 py-2 font-semibold text-slate-700">{order.customer_name || '-'}</td>
                        <td className="px-3 py-2 font-semibold text-slate-700">{order.updated_at || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {activeTab === 'blanket_packing' && (
        <>
          <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-slate-800 font-black">
                <PackageCheck size={18} />
                Blanket Packing (Phase 3)
              </div>
              <span className="rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-violet-700">
                Live Workflow
              </span>
            </div>

            <div className="text-sm text-slate-600 font-semibold">
              اكتب أو امسح رقم الطلب. النظام يجلب البطانيات والمخدات فقط من POS، ويحدّث التقدم تلقائيًا (1 من 2) مع طباعة ملصق بعد كل قطعة.
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={blanketOrderInput}
                onChange={(event) => setBlanketOrderInput(event.target.value.toUpperCase())}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    void loadBlanketPackingOrder();
                  }
                }}
                placeholder="Order number (example: M35427)"
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-slate-900 uppercase tracking-wide"
              />
              <button
                type="button"
                onClick={() => {
                  void loadBlanketPackingOrder();
                }}
                disabled={blanketBusy}
                className="rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 px-4 py-2.5 text-xs font-black uppercase tracking-[0.2em] disabled:opacity-60"
              >
                {blanketBusy ? 'Loading…' : 'Load Order'}
              </button>
            </div>

            {blanketError && (
              <div className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                {blanketError}
              </div>
            )}

            {blanketBundle && (
              <div className="rounded-2xl border border-violet-200 bg-violet-50/40 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-lg font-black text-violet-900">ORDER {blanketBundle.order.order_no}</div>
                  <div className="text-sm font-black text-violet-800">{blanketBundle.order.customer_name || 'Unknown customer'}</div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="rounded-xl border border-violet-200 bg-white px-3 py-2">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">Required</div>
                    <div className="text-2xl font-black text-slate-900">{blanketBundle.totals.required}</div>
                  </div>
                  <div className="rounded-xl border border-violet-200 bg-white px-3 py-2">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">Packed</div>
                    <div className="text-2xl font-black text-slate-900">{blanketBundle.totals.packed}</div>
                  </div>
                  <div className={`rounded-xl border px-3 py-2 ${blanketBundle.totals.complete ? 'border-emerald-400 bg-emerald-100' : 'border-amber-300 bg-amber-50'}`}>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">Status</div>
                    <div className={`text-lg font-black ${blanketBundle.totals.complete ? 'text-emerald-800' : 'text-amber-700'}`}>
                      {blanketBundle.totals.complete ? 'PACKED COMPLETE' : `${blanketBundle.totals.remaining} REMAINING`}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {blanketBundle.items.map((item) => {
                    const packed = Math.max(0, Number(item.qty_packed ?? 0));
                    const required = Math.max(0, Number(item.qty_required ?? 0));
                    const remain = Math.max(0, required - packed);
                    const busy = blanketScanBusy === item.item_name;
                    const selected = blanketSelectedItem === item.item_name;
                    const done = remain <= 0;
                    return (
                      <div
                        key={`blanket-item-${item.id}`}
                        className={`rounded-xl border p-3 space-y-2 ${done ? 'border-emerald-400 bg-emerald-100' : selected ? 'border-violet-500 bg-violet-100' : 'border-slate-200 bg-white'}`}
                      >
                        <div className="text-sm font-black text-slate-900 truncate">{item.item_name}</div>
                        <div className="text-xs font-bold text-slate-700">{packed} / {required}</div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setBlanketSelectedItem(item.item_name)}
                            className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider ${selected ? 'border-violet-500 bg-violet-600 text-white' : 'border-slate-300 bg-slate-50 text-slate-700'}`}
                          >
                            Select
                          </button>
                          <button
                            type="button"
                            disabled={busy || done}
                            onClick={() => {
                              void processBlanketPiece(item.item_name);
                            }}
                            className="rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 disabled:opacity-50"
                          >
                            {busy ? '...' : done ? 'Done' : '+1 Process'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={!blanketSelectedItem || !!blanketScanBusy || blanketBundle.totals.complete}
                    onClick={() => {
                      void processBlanketPiece(blanketSelectedItem);
                    }}
                    className="rounded-xl bg-violet-700 hover:bg-violet-800 text-white px-4 py-2.5 text-xs font-black uppercase tracking-[0.2em] disabled:opacity-60"
                  >
                    {blanketScanBusy ? 'Processing…' : `Process Selected (${blanketSelectedItem || 'item'})`}
                  </button>
                  <div className="text-xs font-semibold text-slate-600">Auto print label runs after every successful piece.</div>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr className="text-left">
                    <th className="px-3 py-2 font-black uppercase tracking-wider">Order</th>
                    <th className="px-3 py-2 font-black uppercase tracking-wider">Customer</th>
                    <th className="px-3 py-2 font-black uppercase tracking-wider">Blanket Items</th>
                    <th className="px-3 py-2 font-black uppercase tracking-wider">Qty Required</th>
                    <th className="px-3 py-2 font-black uppercase tracking-wider">Quick Open</th>
                  </tr>
                </thead>
                <tbody>
                  {blanketPackingOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-slate-500 font-semibold">
                        No orders with blanket/pillow items.
                      </td>
                    </tr>
                  ) : (
                    blanketPackingOrders.map((order) => {
                      const blanketItems = order.items.filter(
                        (item) => detectSortingItemCategory(item.item_name) === 'blanket_phase3'
                      );
                      const required = blanketItems.reduce((sum, item) => sum + item.qty_required, 0);
                      return (
                        <tr key={`blanket-${order.order_no}`} className="border-t border-slate-200">
                          <td className="px-3 py-2 font-black text-slate-900">{order.order_no}</td>
                          <td className="px-3 py-2 font-semibold text-slate-700">{order.customer_name || '-'}</td>
                          <td className="px-3 py-2 text-slate-700 font-semibold">{blanketItems.length}</td>
                          <td className="px-3 py-2 text-slate-700 font-semibold">{required}</td>
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              onClick={() => {
                                setBlanketOrderInput(order.order_no);
                                void loadBlanketPackingOrder(order.order_no);
                              }}
                              className="rounded-lg border border-violet-300 bg-violet-50 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-violet-700"
                            >
                              Open
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
