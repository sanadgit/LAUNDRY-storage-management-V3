import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { AlertCircle, AlertTriangle, Box, CheckCircle2, Clock, Crosshair, Delete, Flame, Home, Loader2, Package, PackageCheck, Plus, Printer, RefreshCw, ScanLine, Search, Shirt, Sparkles, Star, Table2, Tag, TrendingUp, Users, Volume2, VolumeX, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { allowedSortingTabs } from '../lib/roleAccess';
import { detectClothesPackingType, detectSortingItemCategory } from '../utils/sortingItemCategory';
import { extractTicketNumberFromScan } from '../utils/barcode';

const BLANKET_KEYBOARD_ROWS = [
  ['B', '1', '2', '3', '4'],
  ['5', '6', '7', '8', '9'],
  ['0', 'A', 'C', 'D', 'E'],
];

const IRONING_KEYBOARD_ROWS = [
  ['S', 'T', 'K', '-', 'A'],
  ['1', '2', '3', '4', '5'],
  ['6', '7', '8', '9', '0'],
];

const SORTING_KEYBOARD_ROWS = [
  ['Z', 'A', 'M', 'R', 'W'],
  ['1', '2', '3', '4', '5'],
  ['6', '7', '8', '9', '0'],
];

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

type SortingPageProps = {
  workflow?: WorkflowTab;
  showWorkflowTabs?: boolean;
};

const WORKFLOW_PAGE_META: Record<WorkflowTab, { eyebrow: string; title: string; description: string }> = {
  sorting: {
    eyebrow: 'Clothes Sorting System',
    title: 'فرز الملابس',
    description:
      'امسح رقم الطلب أو اكتبه يدويًا. النظام يوجه العامل تلقائيًا إلى الطاولة والخلية المناسبة، ويتابع اكتمال عدد القطع لكل طلب.',
  },
  packing: {
    eyebrow: 'Ironing Station',
    title: 'الكي',
    description:
      'امسح رقم الطلب أو اكتبه يدويًا لتسجيل الكي والتعبئة ومتابعة الكميات المتبقية لكل طلب.',
  },
  blanket_packing: {
    eyebrow: 'Blankets Sorting & Packing',
    title: 'تعبئة البطانيات',
    description:
      'ابحث برقم طلب البطانيات، اطبع الملصق التالي، وتابع حالة التعبئة حتى يكتمل الطلب.',
  },
};

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
  pos_sync: {
    success: boolean;
    verified: boolean;
    description?: string;
    sales_order_id?: string;
    updated_line_ids?: string[];
    financial_unchanged?: boolean;
    error?: string;
  } | null;
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
  ironing_sessions?: IroningSession[];
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

type IroningSession = {
  id: number;
  order_no: string;
  status: 'in_progress' | 'completed' | 'paused';
  worker: string;
  team_members: string[];
  started_at: string;
  ended_at: string | null;
  pieces_target: number;
  pieces_ironed: number;
  quality_score: number | null;
  notes: string | null;
  request_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  duration_minutes: number | null;
  customer_name?: string | null;
  customer_phone?: string | null;
};

type BlanketActivityEntry = {
  id: number;
  order_number: string;
  customer_name: string | null;
  customer_phone: string | null;
  blanket_index: number;
  total_blankets: number;
  action: 'printed' | 'reprinted' | 'packed';
  status: 'not_packed' | 'partially_packed' | 'fully_packed' | 'error';
  printed_at: string | null;
  packed_by: string | null;
  created_at: string | null;
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
  packing: {
    quantity_in_order: number;
    quantity_in_store: number;
    matched: boolean;
    status: 'not_packed' | 'partially_packed' | 'fully_packed' | 'error';
    status_label: string;
    can_print_next: boolean;
    next_blanket_index: number | null;
    sequence_label: string;
  };
  label_preview: {
    order_no: string;
    customer_name: string;
    blanket_index: number;
    total_blankets: number;
    sequence_label: string;
    barcode_payload: string;
    printed_at: string;
    date_text: string;
    lines: string[];
  } | null;
  last_label: {
    blanket_index: number;
    total_blankets: number;
    action: 'printed' | 'reprinted' | 'packed';
    printed_at: string | null;
    packed_by: string | null;
  } | null;
  activity: BlanketActivityEntry[];
};

type BlanketPackingHistoryResponse = {
  success: boolean;
  entries: BlanketActivityEntry[];
  total: number;
  page: number;
  limit: number;
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

const isBlanketOnlyItem = (itemName: string) => detectSortingItemCategory(itemName) === 'blanket_phase3';

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

const posOrderStatusLabel = (order?: SortingOrder | null) => String(order?.pos_order_status || 'Pending');
const posRemarkLabel = (order?: SortingOrder | null) => String(order?.pos_remark || '').trim();

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

const getInitialWorkflow = (workflow: WorkflowTab | undefined, role: unknown): WorkflowTab => {
  const initialTabs = allowedSortingTabs(role);
  if (workflow && initialTabs.includes(workflow)) return workflow;
  return initialTabs[0] ?? 'sorting';
};

export default function SortingPage({ workflow, showWorkflowTabs = true }: SortingPageProps) {
  const { currentUser } = useStore();
  const [activeTab, setActiveTab] = useState<WorkflowTab>(() => getInitialWorkflow(workflow, currentUser?.role));
  const [stateBusy, setStateBusy] = useState(false);
  const [stateError, setStateError] = useState<string | null>(null);
  const [sortingState, setSortingState] = useState<SortingStateResponse | null>(null);

  const [scanOrderNo, setScanOrderNo] = useState('');
  const [sortingPressedKey, setSortingPressedKey] = useState<string | null>(null);
  const [scanQty, setScanQty] = useState(1);
  const [scanBusy, setScanBusy] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [posSyncRetryBusy, setPosSyncRetryBusy] = useState(false);
  const [focusPlacement, setFocusPlacement] = useState<FocusPlacement | null>(null);
  const [itemPickerOpen, setItemPickerOpen] = useState(false);
  const [itemPickerData, setItemPickerData] = useState<SortingOrderBundleResponse | null>(null);
  const [itemPickerSelection, setItemPickerSelection] = useState<string>('');
  const [itemPickerError, setItemPickerError] = useState<string | null>(null);
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

  const scanInputRef = useRef<HTMLInputElement | null>(null);
  const [packingBusyOrder, setPackingBusyOrder] = useState<string | null>(null);
  const [ironingOrderInput, setIroningOrderInput] = useState('');
  const [ironingPressedKey, setIroningPressedKey] = useState<string | null>(null);
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
  const [activeIroningSession, setActiveIroningSession] = useState<IroningSession | null>(null);
  const [ironingSessions, setIroningSessions] = useState<IroningSession[]>([]);
  const [ironingTeamInput, setIroningTeamInput] = useState('');
  const [ironingQualityScore, setIroningQualityScore] = useState(5);
  const [ironingSessionNotes, setIroningSessionNotes] = useState('');
  const [ironingSessionBusy, setIroningSessionBusy] = useState<'start' | 'end' | null>(null);
  const [blanketOrderInput, setBlanketOrderInput] = useState('');
  const [blanketPressedKey, setBlanketPressedKey] = useState<string | null>(null);
  const [blanketBusy, setBlanketBusy] = useState(false);
  const [blanketError, setBlanketError] = useState<string | null>(null);
  const [blanketBundle, setBlanketBundle] = useState<BlanketPackingBundleResponse | null>(null);
  const [blanketPackingModalOpen, setBlanketPackingModalOpen] = useState(false);
  const [blanketActionBusy, setBlanketActionBusy] = useState<'print' | 'reprint' | null>(null);
  const [blanketActivityFilterText, setBlanketActivityFilterText] = useState('');
  const [blanketActivityFilterAction, setBlanketActivityFilterAction] = useState<'all' | 'printed' | 'reprinted' | 'packed'>('all');
  const [blanketHistoryOpen, setBlanketHistoryOpen] = useState(false);
  const [blanketHistoryBusy, setBlanketHistoryBusy] = useState(false);
  const [blanketHistoryError, setBlanketHistoryError] = useState<string | null>(null);
  const [blanketHistoryEntries, setBlanketHistoryEntries] = useState<BlanketActivityEntry[]>([]);
  const [blanketHistoryTotal, setBlanketHistoryTotal] = useState(0);
  const [blanketHistoryPage, setBlanketHistoryPage] = useState(1);
  const [blanketHistoryLimit] = useState(40);
  const [blanketHistoryQuery, setBlanketHistoryQuery] = useState('');
  const [blanketHistoryAction, setBlanketHistoryAction] = useState<'all' | 'printed' | 'reprinted' | 'packed'>('all');
  const [blanketHistoryStatus, setBlanketHistoryStatus] = useState<'all' | 'not_packed' | 'partially_packed' | 'fully_packed' | 'error'>('all');
  const tableRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const cellRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const ironingInputRef = useRef<HTMLInputElement | null>(null);
  const blanketInputRef = useRef<HTMLInputElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastAnnouncedTargetRef = useRef<string>('');
  const roleAllowedTabs = useMemo<Array<WorkflowTab>>(() => allowedSortingTabs(currentUser?.role), [currentUser?.role]);
  const pageMeta = WORKFLOW_PAGE_META[activeTab];

  useEffect(() => {
    if (workflow && roleAllowedTabs.includes(workflow)) {
      setActiveTab(workflow);
      return;
    }
    if (roleAllowedTabs.includes(activeTab)) return;
    setActiveTab(roleAllowedTabs[0] || 'sorting');
  }, [activeTab, roleAllowedTabs, workflow]);

  useEffect(() => {
    if (activeTab !== 'sorting') return;
    const timer = window.setTimeout(() => {
      scanInputRef.current?.focus();
      scanInputRef.current?.select();
    }, 120);
    return () => window.clearTimeout(timer);
  }, [activeTab, scanResult?.order?.order_no]);

  useEffect(() => {
    if (activeTab !== 'packing') return;
    const timer = window.setTimeout(() => {
      ironingInputRef.current?.focus();
      ironingInputRef.current?.select();
    }, 120);
    return () => window.clearTimeout(timer);
  }, [activeTab, packingOrderBundle?.order.order_no]);

  useEffect(() => {
    if (activeTab !== 'blanket_packing') return;
    const timer = window.setTimeout(() => {
      blanketInputRef.current?.focus();
      blanketInputRef.current?.select();
    }, 120);
    return () => window.clearTimeout(timer);
  }, [activeTab, blanketBundle?.order.order_no]);


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
      allOrders.filter((order) => order.items.some((item) => isBlanketOnlyItem(item.item_name))),
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
  const syncIroningSessionsFromBundle = useCallback((bundle: SortingOrderBundleResponse | null) => {
    const sessions = bundle?.ironing_sessions ?? [];
    setIroningSessions(sessions);
    const active = sessions.find((session) => session.status === 'in_progress') ?? null;
    setActiveIroningSession(active);
    if (active) {
      setIroningTeamInput(active.team_members.join(', '));
    }
  }, []);
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
    async (orderNo: string, itemName?: string, qty = 1) => {
      try {
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
        window.setTimeout(() => {
          void loadState();
        }, 2500);
        return response.data;
      } catch (error: any) {
        setScanError(error?.response?.data?.error || error?.message || 'Failed to process sorting scan.');
        return null;
      } finally {
        setScanBusy(false);
      }
    },
    [announcePlacement, loadState]
  );

  const handleScanSubmit = async () => {
    const orderNo = extractTicketNumberFromScan(scanOrderNo.trim()).trim();
    if (!orderNo) {
      setScanError('Order number is required.');
      return;
    }

    const result = await executeScan(orderNo, undefined, Math.max(1, Math.floor(scanQty) || 1));
    if (result) {
      setScanOrderNo('');
    }
  };

  const handleRetryPosStageSync = async () => {
    const orderNo = scanResult?.order?.order_no;
    if (!orderNo) return;
    try {
      setPosSyncRetryBusy(true);
      setScanError(null);
      const response = await axios.post<{
        success: true;
        pos_sync: NonNullable<ScanResponse['pos_sync']>;
      }>(`/api/sorting/orders/${encodeURIComponent(orderNo)}/sync-pos-stage`);
      setScanResult((current) =>
        current
          ? {
              ...current,
              pos_sync: response.data.pos_sync,
            }
          : current
      );
    } catch (error: any) {
      setScanError(error?.response?.data?.error || error?.message || 'Failed to retry POS stage sync.');
    } finally {
      setPosSyncRetryBusy(false);
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

  const handleSortingKeyPress = useCallback((key: string) => {
    setSortingPressedKey(key);
    window.setTimeout(() => setSortingPressedKey(null), 150);
    setScanOrderNo((prev) => `${prev}${key}`.toUpperCase());
    setScanError(null);
  }, []);

  const handleSortingDelete = useCallback(() => {
    setSortingPressedKey('DEL');
    window.setTimeout(() => setSortingPressedKey(null), 150);
    setScanOrderNo((prev) => prev.slice(0, -1));
    setScanError(null);
  }, []);

  const handleSortingClear = useCallback(() => {
    setSortingPressedKey('CLR');
    window.setTimeout(() => setSortingPressedKey(null), 150);
    setScanOrderNo('');
    setScanError(null);
  }, []);

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
        syncIroningSessionsFromBundle(loaded.data);
      } catch {
        // Keep trying start; server will return a user-facing error if invalid.
      }
      const response = await axios.post<{
        state: SortingStateResponse;
        event?: {
          session?: IroningSession | null;
        };
      }>('/api/sorting/ironing/start', {
        order_no: orderNo,
        qty: Math.max(1, Math.floor(ironingQty) || 1),
        session_id: activeIroningSession?.id,
      });
      if (response.data?.state) {
        setSortingState(response.data.state);
      } else {
        await loadState();
      }
      if (response.data?.event?.session) {
        setActiveIroningSession(response.data.event.session);
      }
      try {
        const refreshed = await axios.get<SortingOrderBundleResponse>(`/api/sorting/order/${encodeURIComponent(orderNo)}`);
        setPackingOrderBundle(refreshed.data);
        syncIroningSessionsFromBundle(refreshed.data);
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
      syncIroningSessionsFromBundle(loaded.data);
    } catch (error: any) {
      setPackingOrderBundle(null);
      setActiveIroningSession(null);
      setIroningSessions([]);
      setIroningError(error?.response?.data?.error || error?.message || 'Failed to load order packing details.');
    } finally {
      setIroningBusy(false);
    }
  };

  const handleStartIroningSession = async () => {
    const orderNo = ironingOrderInput.trim().toUpperCase() || packingOrderBundle?.order.order_no || '';
    if (!orderNo) {
      setIroningError('Order number is required.');
      return;
    }
    try {
      setIroningSessionBusy('start');
      setIroningError(null);
      const teamMembers = ironingTeamInput
        .split(/[,\n،]+/g)
        .map((entry) => entry.trim())
        .filter(Boolean);
      const response = await axios.post<{ session: IroningSession; sessions: IroningSession[] }>(
        '/api/sorting/ironing/session/start',
        {
          order_no: orderNo,
          team_members: teamMembers.length > 0 ? teamMembers : undefined,
          pieces_target: Math.max(1, Math.floor(ironingQty) || 1),
        }
      );
      setActiveIroningSession(response.data.session);
      setIroningSessions(response.data.sessions ?? [response.data.session]);
      if (!packingOrderBundle || packingOrderBundle.order.order_no !== orderNo) {
        const loaded = await axios.get<SortingOrderBundleResponse>(`/api/sorting/order/${encodeURIComponent(orderNo)}`);
        setPackingOrderBundle(loaded.data);
        syncIroningSessionsFromBundle(loaded.data);
      }
    } catch (error: any) {
      setIroningError(error?.response?.data?.error || error?.message || 'Failed to start ironing session.');
    } finally {
      setIroningSessionBusy(null);
    }
  };

  const handleEndIroningSession = async () => {
    if (!activeIroningSession) {
      setIroningError('No active ironing session.');
      return;
    }
    try {
      setIroningSessionBusy('end');
      setIroningError(null);
      const response = await axios.post<{ session: IroningSession; sessions: IroningSession[] }>(
        `/api/sorting/ironing/session/${activeIroningSession.id}/end`,
        {
          quality_score: ironingQualityScore,
          notes: ironingSessionNotes,
        }
      );
      setActiveIroningSession(null);
      setIroningSessions(response.data.sessions ?? [response.data.session]);
      setIroningSessionNotes('');
      if (packingOrderBundle?.order.order_no) {
        const refreshed = await axios.get<SortingOrderBundleResponse>(
          `/api/sorting/order/${encodeURIComponent(packingOrderBundle.order.order_no)}`
        );
        setPackingOrderBundle(refreshed.data);
        syncIroningSessionsFromBundle(refreshed.data);
      }
    } catch (error: any) {
      setIroningError(error?.response?.data?.error || error?.message || 'Failed to end ironing session.');
    } finally {
      setIroningSessionBusy(null);
    }
  };

  const handleIroningKeyPress = useCallback((key: string) => {
    setIroningPressedKey(key);
    window.setTimeout(() => setIroningPressedKey(null), 150);
    setIroningOrderInput((prev) => `${prev}${key}`.toUpperCase());
    setIroningError(null);
  }, []);

  const handleIroningDelete = useCallback(() => {
    setIroningPressedKey('DEL');
    window.setTimeout(() => setIroningPressedKey(null), 150);
    setIroningOrderInput((prev) => prev.slice(0, -1));
    setIroningError(null);
  }, []);

  const handleIroningClear = useCallback(() => {
    setIroningPressedKey('CLR');
    window.setTimeout(() => setIroningPressedKey(null), 150);
    setIroningOrderInput('');
    setIroningError(null);
  }, []);

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

  const escapePrintHtml = (value: unknown) =>
    String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const printBlanketPackLabelViaBrowser = async (payload: {
    order_no: string;
    customer_name: string;
    blanket_index: number;
    total_blankets: number;
    barcode_payload: string;
    printed_at?: string;
  }) => {
    const now = payload.printed_at ? new Date(payload.printed_at) : new Date();
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      iframe.remove();
      throw new Error('Browser print is not available.');
    }

    doc.open();
    doc.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Blanket Label ${escapePrintHtml(payload.order_no)}</title>
          <style>
            @page { size: 80mm 50mm; margin: 4mm; }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              color: #111827;
              font-family: Arial, Helvetica, sans-serif;
              font-weight: 800;
            }
            .label {
              width: 72mm;
              min-height: 42mm;
              border: 1px solid #111827;
              padding: 4mm;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              gap: 2mm;
            }
            .brand { font-size: 13px; letter-spacing: 0.4px; }
            .line { font-size: 15px; }
            .big { font-size: 22px; }
            .barcode {
              margin-top: 2mm;
              border: 1px dashed #111827;
              padding: 2mm;
              text-align: center;
              font-family: "Courier New", monospace;
              font-size: 20px;
              letter-spacing: 1px;
            }
            .meta { font-size: 10px; font-weight: 700; color: #4b5563; }
          </style>
        </head>
        <body>
          <div class="label">
            <div>
              <div class="brand">IN &amp; OUT LAUNDRY</div>
              <div class="line big">ORDER: ${escapePrintHtml(payload.order_no)}</div>
              <div class="line">BLANKET: ${escapePrintHtml(payload.blanket_index)} of ${escapePrintHtml(payload.total_blankets)}</div>
              <div class="line">CUSTOMER: ${escapePrintHtml(payload.customer_name || '-')}</div>
            </div>
            <div>
              <div class="barcode">${escapePrintHtml(payload.barcode_payload)}</div>
              <div class="meta">Printed: ${escapePrintHtml(now.toLocaleDateString())} ${escapePrintHtml(now.toLocaleTimeString())}</div>
            </div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    await new Promise<void>((resolve) => window.setTimeout(resolve, 150));
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    window.setTimeout(() => iframe.remove(), 1500);
  };

  const printBlanketPackLabelViaQzTray = async (payload: {
    order_no: string;
    customer_name: string;
    blanket_index: number;
    total_blankets: number;
    barcode_payload: string;
    printed_at?: string;
  }) => {
    const qz = window.qz;
    if (!qz) {
      await printBlanketPackLabelViaBrowser(payload);
      return;
    }
    const now = payload.printed_at ? new Date(payload.printed_at) : new Date();
    const lines = [
      'IN & OUT LAUNDRY',
      '------------------------------',
      `ORDER: ${payload.order_no}`,
      `CUSTOMER: ${payload.customer_name || '-'}`,
      `BLANKET: ${payload.blanket_index} of ${payload.total_blankets}`,
      `BARCODE: ${payload.barcode_payload}`,
      '------------------------------',
      `Printed: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
      '\n\n\n',
    ];
    const textPayload = lines.join('\n');

    try {
      if (!qz.websocket.isActive()) {
        await qz.websocket.connect({ retries: 2, delay: 1 });
      }
      const defaultPrinter = await qz.printers.getDefault();
      const config = qz.configs.create(defaultPrinter);
      await qz.print(config, [textPayload]);
    } catch (error) {
      console.warn('QZ print failed; falling back to browser print.', error);
      await printBlanketPackLabelViaBrowser(payload);
    }
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
      setBlanketPackingModalOpen(true);
      setBlanketOrderInput(orderNo);
    } catch (error: any) {
      setBlanketBundle(null);
      setBlanketPackingModalOpen(false);
      setBlanketError(error?.response?.data?.error || error?.message || 'Failed to load blanket packing order.');
    } finally {
      setBlanketBusy(false);
      blanketInputRef.current?.focus();
      blanketInputRef.current?.select();
    }
  };

  const handleBlanketKeyPress = useCallback((key: string) => {
    setBlanketPressedKey(key);
    window.setTimeout(() => setBlanketPressedKey(null), 150);
    setBlanketOrderInput((prev) => `${prev}${key}`.toUpperCase());
    setBlanketError(null);
  }, []);

  const handleBlanketDelete = useCallback(() => {
    setBlanketPressedKey('DEL');
    window.setTimeout(() => setBlanketPressedKey(null), 150);
    setBlanketOrderInput((prev) => prev.slice(0, -1));
    setBlanketError(null);
  }, []);

  const handleBlanketClear = useCallback(() => {
    setBlanketPressedKey('CLR');
    window.setTimeout(() => setBlanketPressedKey(null), 150);
    setBlanketOrderInput('');
    setBlanketError(null);
  }, []);

  const handlePrintNextBlanketLabel = async () => {
    const orderNo = blanketBundle?.order?.order_no || extractTicketNumberFromScan(blanketOrderInput.trim()).trim().toUpperCase();
    if (!orderNo) {
      setBlanketError('Order number is required.');
      return;
    }
    if (!blanketBundle?.packing?.can_print_next) {
      setBlanketError('All blankets are already packed for this order.');
      return;
    }

    try {
      setBlanketActionBusy('print');
      setBlanketError(null);
      const response = await axios.post<{ success: boolean } & BlanketPackingBundleResponse>('/api/sorting/blanket/print-next', {
        order_no: orderNo,
      });
      const updated: BlanketPackingBundleResponse = {
        order: response.data.order,
        items: response.data.items,
        totals: response.data.totals,
        packing: response.data.packing,
        label_preview: response.data.label_preview,
        last_label: response.data.last_label,
        activity: response.data.activity,
      };
      setBlanketBundle(updated);
      if (updated.label_preview) {
        await printBlanketPackLabelViaQzTray({
          order_no: updated.label_preview.order_no,
          customer_name: updated.label_preview.customer_name,
          blanket_index: updated.label_preview.blanket_index,
          total_blankets: updated.label_preview.total_blankets,
          barcode_payload: updated.label_preview.barcode_payload,
          printed_at: updated.label_preview.printed_at,
        });
      }
      setBlanketPackingModalOpen(false);
      setBlanketBundle(null);
      setBlanketOrderInput('');
      void loadState();
    } catch (error: any) {
      setBlanketError(error?.response?.data?.error || error?.message || 'Failed to print next blanket label.');
    } finally {
      setBlanketActionBusy(null);
      window.setTimeout(() => {
        blanketInputRef.current?.focus();
        blanketInputRef.current?.select();
      }, 80);
    }
  };

  const handleReprintLastBlanketLabel = async () => {
    const orderNo = blanketBundle?.order?.order_no || extractTicketNumberFromScan(blanketOrderInput.trim()).trim().toUpperCase();
    if (!orderNo) {
      setBlanketError('Order number is required.');
      return;
    }
    const confirmed = window.confirm('Are you sure you want to reprint the last blanket label?');
    if (!confirmed) return;

    try {
      setBlanketActionBusy('reprint');
      setBlanketError(null);
      const response = await axios.post<{ success: boolean } & BlanketPackingBundleResponse>('/api/sorting/blanket/reprint-last', {
        order_no: orderNo,
        confirm: true,
      });
      const updated: BlanketPackingBundleResponse = {
        order: response.data.order,
        items: response.data.items,
        totals: response.data.totals,
        packing: response.data.packing,
        label_preview: response.data.label_preview,
        last_label: response.data.last_label,
        activity: response.data.activity,
      };
      setBlanketBundle(updated);
      if (updated.label_preview) {
        await printBlanketPackLabelViaQzTray({
          order_no: updated.label_preview.order_no,
          customer_name: updated.label_preview.customer_name,
          blanket_index: updated.label_preview.blanket_index,
          total_blankets: updated.label_preview.total_blankets,
          barcode_payload: updated.label_preview.barcode_payload,
          printed_at: updated.label_preview.printed_at,
        });
      }
    } catch (error: any) {
      setBlanketError(error?.response?.data?.error || error?.message || 'Failed to reprint blanket label.');
    } finally {
      setBlanketActionBusy(null);
      blanketInputRef.current?.focus();
      blanketInputRef.current?.select();
    }
  };

  const blanketStatusBadgeClass = (status: BlanketPackingBundleResponse['packing']['status']) => {
    if (status === 'fully_packed') return 'border-emerald-300 bg-emerald-50 text-emerald-700';
    if (status === 'partially_packed') return 'border-amber-300 bg-amber-50 text-amber-700';
    if (status === 'error') return 'border-rose-300 bg-rose-50 text-rose-700';
    return 'border-slate-300 bg-slate-50 text-slate-700';
  };

  const filteredRecentBlanketActivity = useMemo(() => {
    const entries = blanketBundle?.activity ?? [];
    const q = blanketActivityFilterText.trim().toLowerCase();
    return entries.filter((entry) => {
      if (blanketActivityFilterAction !== 'all' && entry.action !== blanketActivityFilterAction) return false;
      if (!q) return true;
      const haystack = [
        entry.order_number,
        entry.customer_name ?? '',
        entry.customer_phone ?? '',
        entry.packed_by ?? '',
        entry.action,
        entry.status,
        `${entry.blanket_index}`,
        `${entry.total_blankets}`,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [blanketBundle?.activity, blanketActivityFilterAction, blanketActivityFilterText]);

  const loadBlanketHistory = useCallback(
    async (pageOverride?: number) => {
      const page = Math.max(1, pageOverride ?? blanketHistoryPage);
      const orderNo = blanketBundle?.order.order_no || extractTicketNumberFromScan(blanketOrderInput).trim().toUpperCase();
      try {
        setBlanketHistoryBusy(true);
        setBlanketHistoryError(null);
        const response = await axios.get<BlanketPackingHistoryResponse>('/api/sorting/blanket/history', {
          params: {
            order_no: orderNo || undefined,
            page,
            limit: blanketHistoryLimit,
            q: blanketHistoryQuery.trim() || undefined,
            action: blanketHistoryAction === 'all' ? undefined : blanketHistoryAction,
            status: blanketHistoryStatus === 'all' ? undefined : blanketHistoryStatus,
          },
        });
        setBlanketHistoryEntries(response.data.entries ?? []);
        setBlanketHistoryTotal(Math.max(0, Number(response.data.total ?? 0) || 0));
        setBlanketHistoryPage(Math.max(1, Number(response.data.page ?? page) || page));
      } catch (error: any) {
        setBlanketHistoryEntries([]);
        setBlanketHistoryError(error?.response?.data?.error || error?.message || 'Failed to load blanket history.');
      } finally {
        setBlanketHistoryBusy(false);
      }
    },
    [
      blanketBundle?.order.order_no,
      blanketHistoryAction,
      blanketHistoryLimit,
      blanketHistoryPage,
      blanketHistoryQuery,
      blanketHistoryStatus,
      blanketOrderInput,
    ]
  );

  useEffect(() => {
    if (!blanketHistoryOpen) return;
    void loadBlanketHistory(1);
  }, [blanketHistoryOpen, loadBlanketHistory]);

  const scanDisplayDetails = useMemo(() => {
    if (!scanResult) return null;
    return {
      tableNumber: scanResult.placement.table_name || `T${scanResult.placement.table_id}`,
      cellNumber: `R${scanResult.placement.row_no}:C${scanResult.placement.col_no}`,
      requestedQty: Math.max(1, scanResult.scan.consumed + scanResult.scan.overflow),
      consumedQty: scanResult.scan.consumed,
      customerPhone: scanResult.order?.customer_phone || '-',
    };
  }, [scanResult]);

  return (
    <div className="clothes-sorting-system min-h-full overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 space-y-5 sm:space-y-6">
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
                className="cs-primary-action rounded-xl bg-blue-600 text-white px-4 py-2 text-xs font-black uppercase tracking-[0.2em] inline-flex items-center gap-2 disabled:opacity-50"
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
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-black">POS Status</div>
                    <span className={`mt-1 inline-flex rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-wider ${posOrderStatusBadgeClass(selectedCell.order.pos_order_status)}`}>
                      {posOrderStatusLabel(selectedCell.order)}
                    </span>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-black">Payment</div>
                    <div className="font-black text-slate-900">{selectedCell.order.pos_payment_status || '-'}</div>
                  </div>
                </div>

                <div className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-sm">
                  <div className="text-[10px] uppercase tracking-wider text-violet-500 font-black">POS Remark / Store Location</div>
                  <div className="mt-1 font-bold text-violet-950" dir="ltr">
                    {posRemarkLabel(selectedCell.order) || 'No remark from POS'}
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
          <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-5">
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

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <Shirt size={22} />
                </div>
                <div>
                  <div className="text-lg font-black text-slate-900">واجهة فرز الملابس</div>
                  <div className="text-xs font-bold text-blue-500">Clothes Sorting Interface</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAudioGuidanceEnabled((prev) => !prev)}
                className={`rounded-xl border px-3 py-2 text-[11px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 ${
                  audioGuidanceEnabled
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                    : 'border-slate-300 bg-white text-slate-600'
                }`}
              >
                {audioGuidanceEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                Voice {audioGuidanceEnabled ? 'On' : 'Off'}
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[minmax(340px,0.44fr)_minmax(0,1fr)] gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-700">
                    <Search size={18} className="text-blue-700" />
                    البحث برقم الطلب
                  </div>
                  <div className="relative mb-3 overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-50 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100">
                    <div className="flex items-center gap-3 px-4 py-3">
                      <Tag size={18} className="text-blue-600" />
                      <input
                        ref={scanInputRef}
                        type="text"
                        dir="ltr"
                        value={scanOrderNo}
                        onChange={(event) => {
                          setScanOrderNo(event.target.value.toUpperCase());
                          setScanError(null);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            void handleScanSubmit();
                          }
                          if (event.key === 'Escape') {
                            event.preventDefault();
                            handleSortingClear();
                          }
                        }}
                        placeholder="_ _ _ _ _"
                        className="cs-blanket-order-field min-h-10 flex-1 border-0 bg-transparent px-0 py-0 font-mono text-2xl font-black uppercase tracking-[0.2em] text-slate-900 shadow-none focus:ring-0"
                      />
                      {scanOrderNo && (
                        <button
                          type="button"
                          onClick={handleSortingClear}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-600"
                          aria-label="Clear scan order"
                        >
                          <X size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mb-3 grid grid-cols-[1fr_auto] gap-2">
                    <label className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Qty</span>
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={scanQty}
                        onChange={(event) => setScanQty(Number(event.target.value))}
                        placeholder="Qty"
                        className="mt-1 w-full border-0 bg-transparent p-0 text-sm font-black text-slate-900 shadow-none focus:ring-0"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        void handleScanSubmit();
                      }}
                      disabled={scanBusy}
                      className="cs-primary-action flex min-w-28 items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-black text-white disabled:opacity-50"
                    >
                      {scanBusy ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                      بحث
                    </button>
                  </div>
                  {scanError && (
                    <div className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                      {scanError}
                    </div>
                  )}
                  {scanResult && (
                    <div className="space-y-2">
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
                      {scanResult.pos_sync?.success ? (
                        <div className="flex items-center gap-2 rounded-xl border border-blue-300 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-800">
                          <CheckCircle2 size={16} />
                          تم تحديث POS والتحقق منه: Other Description = {scanResult.pos_sync.description}
                        </div>
                      ) : scanResult.pos_sync ? (
                        <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
                          <div className="flex items-start gap-2">
                            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                            تم تسجيل الفرز محليًا، لكن تعذر تحديث POS: {scanResult.pos_sync.error}
                          </div>
                          <button
                            type="button"
                            disabled={posSyncRetryBusy}
                            onClick={() => {
                              void handleRetryPosStageSync();
                            }}
                            className="mt-2 inline-flex items-center gap-2 rounded-lg border border-amber-400 bg-white px-3 py-1.5 text-[11px] font-black text-amber-900 disabled:opacity-50"
                          >
                            {posSyncRetryBusy ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                            إعادة مزامنة POS
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                <div className="cs-input-panel rounded-2xl border p-5">
                  <div className="mb-5 flex items-center justify-between border-b border-blue-900/60 pb-4">
                    <div>
                      <h3 className="text-sm font-black text-white">Clothes Sorting System</h3>
                      <p className="text-xs font-bold text-blue-300">نظام فرز الملابس</p>
                    </div>
                    <div className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                      <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                      <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    {SORTING_KEYBOARD_ROWS.map((row, rowIndex) => (
                      <div key={`sorting-key-row-${rowIndex}`} dir="ltr" className="grid grid-cols-5 gap-3">
                        {row.map((key) => (
                          <button
                            key={`sorting-key-${key}`}
                            type="button"
                            onClick={() => handleSortingKeyPress(key)}
                            className={`cs-key-btn flex items-center justify-center ${sortingPressedKey === key ? 'cs-key-btn-active' : ''}`}
                          >
                            {key}
                          </button>
                        ))}
                      </div>
                    ))}
                    <div dir="ltr" className="mt-1 grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={handleSortingDelete}
                        className={`cs-key-btn cs-key-btn-delete flex items-center justify-center gap-2 text-sm ${sortingPressedKey === 'DEL' ? 'cs-key-btn-active' : ''}`}
                      >
                        <Delete size={18} />
                        حذف
                      </button>
                      <button
                        type="button"
                        onClick={handleSortingClear}
                        className={`cs-key-btn cs-key-btn-special flex items-center justify-center gap-2 text-sm ${sortingPressedKey === 'CLR' ? 'cs-key-btn-active' : ''}`}
                      >
                        <X size={18} />
                        مسح
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          void handleScanSubmit();
                        }}
                        disabled={scanBusy}
                        className="cs-key-btn cs-key-btn-enter flex items-center justify-center gap-2 text-sm disabled:opacity-60"
                      >
                        {scanBusy ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                        بحث
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-blue-900/50 pt-3 text-center text-xs font-bold text-blue-300">
                    أمثلة: Z61303 · M35427 · 253983
                  </div>
                </div>
              </div>

              <div className="min-h-[560px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {!scanResult ? (
                  <div className="flex h-full min-h-[560px] flex-col items-center justify-center gap-4 px-8 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-300">
                      <Package size={38} />
                    </div>
                    <div>
                      <p className="text-lg font-black text-slate-400">لا يوجد طلب محدد</p>
                      <p className="mt-1 text-sm font-bold text-slate-300">ابحث برقم الطلب لعرض التفاصيل</p>
                    </div>
                  </div>
                ) : scanDisplayDetails ? (
                  <div className="flex h-full flex-col bg-slate-950 text-white">
                    <div className="cs-detail-header bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 px-6 py-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-200">
                            <Package size={17} />
                            نتيجة الفرز
                          </div>
                          <div dir="ltr" className="font-mono text-xl font-black tracking-wider text-white">
                            #{scanResult.order?.order_no || focusPlacement?.order_no || '-'}
                          </div>
                          <div className="mt-1 text-sm font-black text-blue-100">{scanResult.order?.customer_name || 'Unknown customer'}</div>
                        </div>
                        <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${scanResult.order ? statusBadgeClass(scanResult.order.status) : 'border-blue-200 bg-blue-50 text-blue-700'}`}>
                          {scanResult.order ? formatOrderStatus(scanResult.order.status) : 'Processing'}
                        </span>
                        {scanResult.order && (
                          <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${posOrderStatusBadgeClass(scanResult.order.pos_order_status)}`}>
                            POS: {posOrderStatusLabel(scanResult.order)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-5 py-6 text-center">
                      <div className="space-y-2">
                        <div className="text-xs font-black uppercase tracking-[0.35em] text-blue-200">رقم الطاولة</div>
                        <div dir="ltr" className="font-mono text-[4.5rem] font-black leading-none tracking-tight text-white sm:text-[5.5rem]">
                          {scanDisplayDetails.tableNumber}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs font-black uppercase tracking-[0.32em] text-emerald-200">رقم الخانة</div>
                        <div dir="ltr" className="rounded-[2rem] border border-emerald-300/40 bg-emerald-400/15 px-8 py-4 font-mono text-5xl font-black leading-none text-emerald-300 shadow-[0_0_36px_rgba(16,185,129,0.22)] sm:text-6xl">
                          {scanDisplayDetails.cellNumber}
                        </div>
                      </div>

                      <div className="grid w-full grid-cols-1 gap-3 text-right sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3">
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">الكمية التي بحثت عنها</div>
                          <div dir="ltr" className="mt-1 font-mono text-2xl font-black text-white">{scanDisplayDetails.requestedQty}</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3">
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">تم إرساله للخانة</div>
                          <div dir="ltr" className="mt-1 font-mono text-2xl font-black text-emerald-300">{scanDisplayDetails.consumedQty}</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3">
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">رقم الزبون</div>
                          <div dir="ltr" className="mt-1 font-mono text-xl font-black text-white">{scanDisplayDetails.customerPhone}</div>
                        </div>
                        <div className="rounded-2xl border border-violet-300/20 bg-violet-400/10 px-4 py-3 sm:col-span-2">
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-200">Remark / Store Location</div>
                          <div dir="ltr" className="mt-1 text-sm font-black text-white">
                            {posRemarkLabel(scanResult.order) || 'No remark from POS'}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setFocusPlacement({
                            ...scanResult.placement,
                            order_no: scanResult.order?.order_no || focusPlacement?.order_no || '',
                          })
                        }
                        className="cs-print-action flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-black text-white"
                      >
                        <Sparkles size={20} />
                        معالجة
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full min-h-[560px] flex-col items-center justify-center gap-3 px-8 text-center">
                    <AlertCircle size={34} className="text-rose-400" />
                    <div className="text-sm font-black text-slate-500">لا يمكن عرض نتيجة الفرز.</div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-800">
                <Plus size={16} />
                Add Sorting Table
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_100px_100px_auto]">
                <input
                  type="text"
                  value={tableName}
                  onChange={(event) => setTableName(event.target.value)}
                  placeholder="Table name (e.g. Table 2)"
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900"
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
              </div>
              {tableError && (
                <div className="mt-3 rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                  {tableError}
                </div>
              )}
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

        </>
      )}

      {activeTab === 'packing' && (
        <>
          <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <Flame size={22} />
                </div>
                <div>
                  <div className="text-lg font-black text-slate-900">محطة كوي الملابس</div>
                  <div className="text-xs font-bold text-blue-500">Ironing Station</div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-black text-blue-700">
                  <TrendingUp size={15} />
                  {readyOrders.length} ready orders
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
                <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-black text-emerald-700">
                  ● متصل
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[minmax(340px,0.44fr)_minmax(0,1fr)] gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-700">
                    <Tag size={18} className="text-blue-700" />
                    ماسح رقم الطلب / الاستيكر
                  </div>
                  <div className="relative mb-3 overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-50 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100">
                    <div className="flex items-center gap-3 px-4 py-3">
                      <Tag size={18} className="text-blue-600" />
                      <input
                        ref={ironingInputRef}
                        type="text"
                        dir="ltr"
                        value={ironingOrderInput}
                        onChange={(event) => {
                          setIroningOrderInput(event.target.value.toUpperCase());
                          setIroningError(null);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            void handleIroningStart();
                          }
                          if (event.key === 'Escape') {
                            event.preventDefault();
                            handleIroningClear();
                          }
                        }}
                        placeholder="ORDER / STK-XXXXX"
                        className="cs-blanket-order-field min-h-10 flex-1 border-0 bg-transparent px-0 py-0 font-mono text-xl font-black uppercase tracking-[0.12em] text-slate-900 shadow-none focus:ring-0"
                      />
                      {ironingOrderInput && (
                        <button
                          type="button"
                          onClick={handleIroningClear}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-600"
                          aria-label="Clear ironing input"
                        >
                          <X size={15} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mb-3 grid grid-cols-[1fr_auto] gap-2">
                    <label className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Pieces</span>
                      <input
                        type="number"
                        min={1}
                        step={1}
                        value={ironingQty}
                        onChange={(event) => setIroningQty(Math.max(1, Number(event.target.value) || 1))}
                        className="mt-1 w-full border-0 bg-transparent p-0 text-sm font-black text-slate-900 shadow-none focus:ring-0"
                        title="Pieces"
                        placeholder="Qty"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        void handleLoadPackingOrder();
                      }}
                      disabled={ironingBusy}
                      className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700 disabled:opacity-60"
                    >
                      {ironingBusy ? '...' : 'Load'}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      void handleIroningStart();
                    }}
                    disabled={ironingBusy}
                    className="cs-primary-action flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black text-white disabled:opacity-60"
                  >
                    {ironingBusy ? <Loader2 size={18} className="animate-spin" /> : <Flame size={18} />}
                    {ironingBusy ? 'جاري التسجيل...' : 'تسجيل قطعة مكوية'}
                  </button>
                  {ironingError && (
                    <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm font-bold text-rose-700">
                      {ironingError}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                      <Users size={18} className="text-blue-700" />
                      جلسة الكوي
                    </div>
                    {activeIroningSession ? (
                      <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Optional
                      </span>
                    )}
                  </div>

                  <label className="mb-2 block rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Team Members</span>
                    <input
                      type="text"
                      value={ironingTeamInput}
                      onChange={(event) => setIroningTeamInput(event.target.value)}
                      placeholder={currentUser?.username || 'worker1, worker2'}
                      className="mt-1 w-full border-0 bg-transparent p-0 text-sm font-bold text-slate-900 shadow-none focus:ring-0"
                    />
                  </label>

                  <div className="mb-2 grid grid-cols-2 gap-2">
                    <label className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                        <Star size={12} />
                        Quality
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={5}
                        step={0.5}
                        value={ironingQualityScore}
                        onChange={(event) => setIroningQualityScore(Math.max(0, Math.min(5, Number(event.target.value) || 0)))}
                        className="mt-1 w-full border-0 bg-transparent p-0 text-sm font-black text-slate-900 shadow-none focus:ring-0"
                      />
                    </label>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                      <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Session Pieces</span>
                      <div dir="ltr" className="mt-1 text-sm font-black text-slate-900">
                        {activeIroningSession ? `${activeIroningSession.pieces_ironed} / ${activeIroningSession.pieces_target}` : '-'}
                      </div>
                    </div>
                  </div>

                  <textarea
                    value={ironingSessionNotes}
                    onChange={(event) => setIroningSessionNotes(event.target.value)}
                    placeholder="Notes before ending session..."
                    className="mb-3 min-h-16 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        void handleStartIroningSession();
                      }}
                      disabled={ironingSessionBusy !== null || Boolean(activeIroningSession)}
                      className="rounded-xl border border-blue-300 bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 disabled:opacity-50"
                    >
                      {ironingSessionBusy === 'start' ? 'Starting...' : 'Start Session'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void handleEndIroningSession();
                      }}
                      disabled={ironingSessionBusy !== null || !activeIroningSession}
                      className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 disabled:opacity-50"
                    >
                      {ironingSessionBusy === 'end' ? 'Ending...' : 'End Session'}
                    </button>
                  </div>
                </div>

                <div className="cs-input-panel rounded-2xl border p-5">
                  <div className="mb-5 flex items-center justify-between border-b border-blue-900/60 pb-4">
                    <div>
                      <h3 className="text-sm font-black text-white">Clothes Sorting System</h3>
                      <p className="text-xs font-bold text-blue-300">لوحة إدخال الكي</p>
                    </div>
                    <div className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                      <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                      <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    {IRONING_KEYBOARD_ROWS.map((row, rowIndex) => (
                      <div key={`ironing-key-row-${rowIndex}`} dir="ltr" className="grid grid-cols-5 gap-3">
                        {row.map((key) => (
                          <button
                            key={`ironing-key-${key}`}
                            type="button"
                            onClick={() => handleIroningKeyPress(key)}
                            className={`cs-key-btn flex items-center justify-center ${ironingPressedKey === key ? 'cs-key-btn-active' : ''}`}
                          >
                            {key}
                          </button>
                        ))}
                      </div>
                    ))}
                    <div dir="ltr" className="mt-1 grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={handleIroningDelete}
                        className={`cs-key-btn cs-key-btn-delete flex items-center justify-center gap-2 text-sm ${ironingPressedKey === 'DEL' ? 'cs-key-btn-active' : ''}`}
                      >
                        <Delete size={18} />
                        حذف
                      </button>
                      <button
                        type="button"
                        onClick={handleIroningClear}
                        className={`cs-key-btn cs-key-btn-special flex items-center justify-center gap-2 text-sm ${ironingPressedKey === 'CLR' ? 'cs-key-btn-active' : ''}`}
                      >
                        <X size={18} />
                        مسح
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          void handleIroningStart();
                        }}
                        disabled={ironingBusy}
                        className="cs-key-btn cs-key-btn-enter flex items-center justify-center gap-2 text-sm disabled:opacity-60"
                      >
                        {ironingBusy ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                        إدخال
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-blue-900/50 pt-3 text-center text-xs font-bold text-blue-300">
                    أمثلة: STK-A1234-001 أو رقم الطلب المباشر
                  </div>
                </div>
              </div>

              <div className="min-h-[560px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {!packingOrderBundle ? (
                  <div className="flex h-full min-h-[560px] flex-col items-center justify-center gap-4 px-8 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-300">
                      <Flame size={38} />
                    </div>
                    <div>
                      <p className="text-lg font-black text-slate-400">لا توجد قطعة محددة</p>
                      <p className="mt-1 text-sm font-bold text-slate-300">ابحث برقم الطلب لعرض تفاصيل الكي والتعبئة</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full flex-col">
                    <div className="cs-detail-header bg-gradient-to-br from-slate-900 to-blue-950 px-6 py-5 text-white">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="mb-1 flex items-center gap-2 text-sm font-bold text-blue-200">
                            <Flame size={18} />
                            تفاصيل الطلب
                          </div>
                          <h2 dir="ltr" className="font-mono text-3xl font-black tracking-wider">#{packingOrderBundle.order.order_no}</h2>
                          <div className="mt-2 text-sm font-black text-white">{packingOrderBundle.order.customer_name || 'Unknown customer'}</div>
                          <div className="text-xs font-bold text-blue-200">{packingOrderBundle.order.customer_phone || 'No phone available'}</div>
                        </div>
                        <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${statusBadgeClass(packingOrderBundle.order.status)}`}>
                          {formatOrderStatus(packingOrderBundle.order.status)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 border-b border-slate-100 sm:grid-cols-4">
                      {[
                        { label: 'Sorted', value: packingClothesBreakdown.totals.sorted, icon: Package, color: 'text-blue-700', bg: 'bg-blue-50' },
                        { label: 'Ironed', value: packingClothesBreakdown.totals.ironed, icon: Flame, color: 'text-amber-700', bg: 'bg-amber-50' },
                        { label: 'Remaining', value: Math.max(0, packingClothesBreakdown.totals.sorted - packingClothesBreakdown.totals.ironed), icon: AlertCircle, color: 'text-rose-700', bg: 'bg-rose-50' },
                        { label: 'Orders Today', value: myIroningSummary.unique_orders, icon: TrendingUp, color: 'text-emerald-700', bg: 'bg-emerald-50' },
                      ].map((stat) => (
                        <div key={stat.label} className="flex flex-col items-center gap-1.5 border-l border-slate-100 px-3 py-4 text-center first:border-l-0">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}>
                            <stat.icon size={17} />
                          </div>
                          <span dir="ltr" className={`font-mono text-2xl font-black ${stat.color}`}>{stat.value}</span>
                          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">{stat.label}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4 border-b border-slate-100 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-black text-slate-700">تقدم الكي</div>
                        <div className="font-mono text-sm font-black text-blue-700">
                          {packingClothesBreakdown.totals.sorted > 0
                            ? `${Math.round((packingClothesBreakdown.totals.ironed / packingClothesBreakdown.totals.sorted) * 100)}%`
                            : '0%'}
                        </div>
                      </div>
                      <div className="h-4 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300"
                          style={{
                            width: `${packingClothesBreakdown.totals.sorted > 0 ? Math.min(100, Math.round((packingClothesBreakdown.totals.ironed / packingClothesBreakdown.totals.sorted) * 100)) : 0}%`,
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pieces Per Scan</div>
                          <div dir="ltr" className="font-black text-slate-900">{ironingQty}</div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Hanging</div>
                          <div dir="ltr" className="font-black text-slate-900">
                            {packingClothesBreakdown.hangingTotals.ironed} / {packingClothesBreakdown.hangingTotals.sorted}
                          </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Folded</div>
                          <div dir="ltr" className="font-black text-slate-900">
                            {packingClothesBreakdown.foldedTotals.ironed} / {packingClothesBreakdown.foldedTotals.sorted}
                          </div>
                        </div>
                      </div>
                      {Math.max(0, packingClothesBreakdown.totals.sorted - packingClothesBreakdown.totals.ironed) > 0 ? (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
                          <AlertTriangle size={14} className="me-1 inline" />
                          لا يزال هناك قطع غير مكوية. أكمل الكي قبل إغلاق التعبئة.
                        </div>
                      ) : (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">
                          <CheckCircle2 size={14} className="me-1 inline" />
                          كل القطع المسجلة للكي مكتملة.
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          void handleIroningStart();
                        }}
                        disabled={ironingBusy || !ironingOrderInput.trim()}
                        className="cs-print-action flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-black text-white disabled:opacity-50"
                      >
                        {ironingBusy ? <Loader2 size={18} className="animate-spin" /> : <Flame size={18} />}
                        {ironingBusy ? 'Saving...' : 'تسجيل الكمية المكوية'}
                      </button>
                    </div>

                    <div className="border-b border-slate-100 px-6 py-4">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                          <Clock size={16} />
                          Ironing Sessions
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          {ironingSessions.length} records
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                        {ironingSessions.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center text-xs font-bold text-slate-400 lg:col-span-2">
                            No ironing sessions yet.
                          </div>
                        ) : (
                          ironingSessions.slice(0, 4).map((session) => (
                            <div
                              key={`ironing-session-${session.id}`}
                              className={`rounded-xl border px-3 py-2 ${
                                session.status === 'in_progress'
                                  ? 'border-emerald-300 bg-emerald-50'
                                  : 'border-slate-200 bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="truncate text-xs font-black text-slate-900">
                                  {session.team_members.length > 0 ? session.team_members.join(', ') : session.worker}
                                </div>
                                <span
                                  className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                                    session.status === 'in_progress'
                                      ? 'border-emerald-300 bg-white text-emerald-700'
                                      : 'border-slate-300 bg-white text-slate-600'
                                  }`}
                                >
                                  {session.status}
                                </span>
                              </div>
                              <div dir="ltr" className="mt-1 font-mono text-xs font-bold text-slate-600">
                                {session.pieces_ironed} / {session.pieces_target} pieces
                              </div>
                              <div className="mt-1 flex items-center justify-between gap-2 text-[10px] font-bold text-slate-500">
                                <span>{new Date(session.started_at).toLocaleString()}</span>
                                <span>
                                  {session.duration_minutes !== null ? `${session.duration_minutes} min` : 'running'}
                                </span>
                              </div>
                              {session.quality_score !== null && (
                                <div className="mt-1 text-[10px] font-black text-amber-700">
                                  Quality {session.quality_score}/5
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="grid flex-1 grid-cols-1 gap-4 overflow-auto p-4 xl:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                          <Shirt size={15} />
                          Hanging Clothes
                        </div>
                        <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                          {packingClothesBreakdown.hanging.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm font-bold text-slate-400">
                              No hanging items.
                            </div>
                          ) : (
                            packingClothesBreakdown.hanging.map((item) => (
                              <div key={`hang-${item.id}`} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                                <div className="truncate text-sm font-black text-slate-900">{item.item_name}</div>
                                <div dir="ltr" className="mt-1 font-mono text-xs font-bold text-slate-600">
                                  {item.qty_ironed ?? 0} / {item.qty_sorted}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                          <PackageCheck size={15} />
                          Folded Clothes
                        </div>
                        <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                          {packingClothesBreakdown.folded.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm font-bold text-slate-400">
                              No folded items.
                            </div>
                          ) : (
                            packingClothesBreakdown.folded.map((item) => (
                              <div key={`fold-${item.id}`} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                                <div className="truncate text-sm font-black text-slate-900">{item.item_name}</div>
                                <div dir="ltr" className="mt-1 font-mono text-xs font-bold text-slate-600">
                                  {item.qty_ironed ?? 0} / {item.qty_sorted}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">My Starts</div>
                <div className="text-2xl font-black text-slate-900">{myIroningSummary.total_starts}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">My Ironed Pieces</div>
                <div className="text-2xl font-black text-slate-900">{myIroningSummary.total_pieces}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-black">My Orders</div>
                <div className="text-2xl font-black text-slate-900">{myIroningSummary.unique_orders}</div>
              </div>
            </div>
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
          <section className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <Box size={22} />
                </div>
                <div>
                  <div className="text-lg font-black text-slate-900">نظام فرز وتعبئة البطانيات</div>
                  <div className="text-xs font-bold text-blue-500">Blankets Sorting & Packing</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setBlanketHistoryOpen(true);
                  }}
                  className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-[11px] font-black text-blue-700"
                >
                  السجل
                </button>
                <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-black text-emerald-700">
                  ● متصل
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[minmax(340px,0.44fr)_minmax(0,1fr)] gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-700">
                    <Search size={18} className="text-blue-700" />
                    البحث برقم الطلب
                  </div>
                  <div className="relative mb-3 overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-50 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100">
                    <div className="flex items-center gap-3 px-4 py-3">
                      <Tag size={18} className="text-blue-600" />
                      <input
                        ref={blanketInputRef}
                        type="text"
                        dir="ltr"
                        value={blanketOrderInput}
                        onChange={(event) => {
                          setBlanketOrderInput(event.target.value.toUpperCase());
                          setBlanketError(null);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            void loadBlanketPackingOrder();
                          }
                        }}
                        placeholder="_ _ _ _ _"
                        className="cs-blanket-order-field min-h-10 flex-1 border-0 bg-transparent px-0 py-0 font-mono text-2xl font-black uppercase tracking-[0.2em] text-slate-900 shadow-none focus:ring-0"
                      />
                      {blanketOrderInput && (
                        <button
                          type="button"
                          onClick={handleBlanketClear}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-600"
                          aria-label="Clear order number"
                        >
                          <X size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      void loadBlanketPackingOrder();
                    }}
                    disabled={blanketBusy || blanketActionBusy !== null}
                    className="cs-primary-action flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-black text-white disabled:opacity-60"
                  >
                    {blanketBusy ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                    {blanketBusy ? 'جاري التحميل...' : 'بحث'}
                  </button>
                  {blanketError && (
                    <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm font-bold text-rose-700">
                      {blanketError}
                    </div>
                  )}
                </div>

                <div className="cs-input-panel rounded-2xl border p-5">
                  <div className="mb-5 flex items-center justify-between border-b border-blue-900/60 pb-4">
                    <div>
                      <h3 className="text-sm font-black text-white">Clothes Sorting System</h3>
                      <p className="text-xs font-bold text-blue-300">لوحة إدخال البطانيات</p>
                    </div>
                    <div className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                      <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                      <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    {BLANKET_KEYBOARD_ROWS.map((row, rowIndex) => (
                      <div key={`blanket-key-row-${rowIndex}`} className="grid grid-cols-5 gap-3">
                        {row.map((key) => (
                          <button
                            key={`blanket-key-${key}`}
                            type="button"
                            onClick={() => handleBlanketKeyPress(key)}
                            className={`cs-key-btn flex items-center justify-center ${blanketPressedKey === key ? 'cs-key-btn-active' : ''}`}
                          >
                            {key}
                          </button>
                        ))}
                      </div>
                    ))}
                    <div className="mt-1 grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={handleBlanketDelete}
                        className={`cs-key-btn cs-key-btn-delete flex items-center justify-center gap-2 text-sm ${blanketPressedKey === 'DEL' ? 'cs-key-btn-active' : ''}`}
                      >
                        <Delete size={18} />
                        حذف
                      </button>
                      <button
                        type="button"
                        onClick={handleBlanketClear}
                        className={`cs-key-btn cs-key-btn-special flex items-center justify-center gap-2 text-sm ${blanketPressedKey === 'CLR' ? 'cs-key-btn-active' : ''}`}
                      >
                        <X size={18} />
                        مسح
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          void loadBlanketPackingOrder();
                        }}
                        disabled={blanketBusy || blanketActionBusy !== null}
                        className="cs-key-btn cs-key-btn-enter flex items-center justify-center gap-2 text-sm disabled:opacity-60"
                      >
                        {blanketBusy ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                        بحث
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-blue-900/50 pt-3 text-center text-xs font-bold text-blue-300">
                    استخدم لوحة الأرقام أو امسح باركود الطلب مباشرة
                  </div>
                </div>
              </div>

              <div className="min-h-[560px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {!blanketBundle ? (
                  <div className="flex h-full min-h-[560px] flex-col items-center justify-center gap-4 px-8 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-300">
                      <Box size={38} />
                    </div>
                    <div>
                      <p className="text-lg font-black text-slate-400">لا يوجد طلب محدد</p>
                      <p className="mt-1 text-sm font-bold text-slate-300">ابحث برقم الطلب لعرض تفاصيل التعبئة والطباعة</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full flex-col">
                    <div className="cs-detail-header bg-gradient-to-br from-slate-900 to-blue-950 px-6 py-5 text-white">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="mb-1 flex items-center gap-2 text-sm font-bold text-blue-200">
                            <Box size={18} />
                            تفاصيل الطلب
                          </div>
                          <h2 dir="ltr" className="font-mono text-3xl font-black tracking-wider">#{blanketBundle.order.order_no}</h2>
                          <div className="mt-2 text-sm font-black text-white">{blanketBundle.order.customer_name || 'Unknown customer'}</div>
                          <div className="text-xs font-bold text-blue-200">{blanketBundle.order.customer_phone || 'No phone available'}</div>
                        </div>
                        <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider ${blanketStatusBadgeClass(blanketBundle.packing.status)}`}>
                          {blanketBundle.packing.status_label}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 border-b border-slate-100 sm:grid-cols-4">
                      {[
                        { label: 'Quantity In Order', value: blanketBundle.packing.quantity_in_order, icon: Box, color: 'text-blue-700', bg: 'bg-blue-50' },
                        { label: 'Quantity In Store', value: blanketBundle.packing.quantity_in_store, icon: PackageCheck, color: 'text-amber-700', bg: 'bg-amber-50' },
                        { label: 'Packed', value: blanketBundle.totals.packed, icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-50' },
                        { label: 'Remaining', value: blanketBundle.totals.remaining, icon: AlertCircle, color: 'text-rose-700', bg: 'bg-rose-50' },
                      ].map((stat) => (
                        <div key={stat.label} className="flex flex-col items-center gap-1.5 border-l border-slate-100 px-3 py-4 text-center first:border-l-0">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}>
                            <stat.icon size={17} />
                          </div>
                          <span dir="ltr" className={`font-mono text-2xl font-black ${stat.color}`}>{stat.value}</span>
                          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">{stat.label}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4 border-b border-slate-100 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-black text-slate-700">تقدم التعبئة</div>
                        <div className="font-mono text-sm font-black text-blue-700">
                          {blanketBundle.totals.required > 0
                            ? `${Math.round((blanketBundle.totals.packed / blanketBundle.totals.required) * 100)}%`
                            : '0%'}
                        </div>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-300"
                          style={{
                            width: `${blanketBundle.totals.required > 0 ? Math.min(100, Math.round((blanketBundle.totals.packed / blanketBundle.totals.required) * 100)) : 0}%`,
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Matched</div>
                          <div className={`font-black ${blanketBundle.packing.matched ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {blanketBundle.packing.matched ? 'Yes' : 'No'}
                          </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Next</div>
                          <div dir="ltr" className="font-black text-slate-900">{blanketBundle.packing.sequence_label}</div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                          <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total</div>
                          <div dir="ltr" className="font-black text-slate-900">
                            {blanketBundle.totals.packed} / {blanketBundle.totals.required}
                          </div>
                        </div>
                      </div>
                      {!blanketBundle.packing.matched && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
                          Quantity is not matched yet. Delivery should stay blocked until matched is complete.
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={!blanketBundle.packing.can_print_next || blanketActionBusy !== null}
                          onClick={() => {
                            void handlePrintNextBlanketLabel();
                          }}
                          className="cs-print-action flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-black text-white disabled:opacity-50"
                        >
                          {blanketActionBusy === 'print' ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
                          {blanketActionBusy === 'print' ? 'Printing...' : 'Print & Pack'}
                        </button>
                        <button
                          type="button"
                          disabled={blanketActionBusy !== null}
                          onClick={() => {
                            void handleReprintLastBlanketLabel();
                          }}
                          className="flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-4 text-xs font-black text-slate-700 disabled:opacity-50"
                        >
                          {blanketActionBusy === 'reprint' ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
                          {blanketActionBusy === 'reprint' ? 'Reprinting...' : 'Reprint Last Label'}
                        </button>
                      </div>
                    </div>

                    <div className="grid flex-1 grid-cols-1 gap-4 overflow-auto p-4 xl:grid-cols-[0.9fr_1.1fr]">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                          <Tag size={15} />
                          Label Preview
                        </div>
                        {blanketBundle.label_preview ? (
                          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="text-sm font-black text-slate-900">IN & OUT LAUNDRY</div>
                            <div className="mt-2 space-y-1 text-sm font-bold text-slate-700">
                              <div dir="ltr">Order: {blanketBundle.label_preview.order_no}</div>
                              <div>Customer: {blanketBundle.label_preview.customer_name || '-'}</div>
                              <div dir="ltr">
                                Blanket: {blanketBundle.label_preview.blanket_index} of {blanketBundle.label_preview.total_blankets}
                              </div>
                            </div>
                            <div dir="ltr" className="mt-3 break-all rounded-lg bg-slate-100 px-3 py-2 font-mono text-xs font-bold text-slate-600">
                              {blanketBundle.label_preview.barcode_payload}
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm font-bold text-slate-400">
                            No label preview yet.
                          </div>
                        )}
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                            <Table2 size={15} />
                            Recent Activity
                          </div>
                        </div>
                        <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <input
                            type="text"
                            value={blanketActivityFilterText}
                            onChange={(event) => setBlanketActivityFilterText(event.target.value)}
                            placeholder="Search activity..."
                            className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold text-slate-800"
                          />
                          <select
                            value={blanketActivityFilterAction}
                            onChange={(event) =>
                              setBlanketActivityFilterAction(
                                (event.target.value as 'all' | 'printed' | 'reprinted' | 'packed') ?? 'all'
                              )
                            }
                            className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold text-slate-800"
                          >
                            <option value="all">All Actions</option>
                            <option value="printed">Printed</option>
                            <option value="reprinted">Reprinted</option>
                            <option value="packed">Packed</option>
                          </select>
                        </div>
                        <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                          {filteredRecentBlanketActivity.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm font-bold text-slate-400">
                              No activity yet.
                            </div>
                          ) : (
                            filteredRecentBlanketActivity.slice(0, 10).map((entry) => (
                              <div key={`blanket-log-${entry.id}`} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                                <div dir="ltr" className="text-xs font-black text-slate-800">
                                  {entry.action.toUpperCase()} - {entry.blanket_index} of {entry.total_blankets}
                                </div>
                                <div className="text-[11px] font-semibold text-slate-600">
                                  {entry.packed_by || 'system'} - {entry.printed_at ? new Date(entry.printed_at).toLocaleString() : '-'}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-800">
                <Table2 size={18} />
                طلبات البطانيات المتاحة
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr className="text-left">
                      <th className="px-3 py-2 font-black uppercase tracking-wider">Order</th>
                      <th className="px-3 py-2 font-black uppercase tracking-wider">Customer</th>
                      <th className="px-3 py-2 font-black uppercase tracking-wider">Blankets</th>
                      <th className="px-3 py-2 font-black uppercase tracking-wider">Qty Required</th>
                      <th className="px-3 py-2 font-black uppercase tracking-wider">Quick Open</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blanketPackingOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-3 py-6 text-center text-slate-500 font-semibold">
                          No orders with blanket items.
                        </td>
                      </tr>
                    ) : (
                      blanketPackingOrders.map((order) => {
                        const blanketItems = order.items.filter((item) => isBlanketOnlyItem(item.item_name));
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
                                className="rounded-lg border border-blue-300 bg-blue-50 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-blue-700"
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
            </div>
          </section>
        </>
      )}

      {blanketPackingModalOpen && blanketBundle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-3 backdrop-blur-sm sm:p-5">
          <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-3 bg-slate-950 px-5 py-4 text-white sm:px-6">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.24em] text-blue-200">Blanket Packing</div>
                <h2 dir="ltr" className="mt-1 font-mono text-3xl font-black tracking-wider sm:text-4xl">
                  #{blanketBundle.order.order_no}
                </h2>
                <div className="mt-1 text-sm font-bold text-slate-200">
                  {blanketBundle.order.customer_name || 'Unknown customer'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setBlanketPackingModalOpen(false);
                  setBlanketBundle(null);
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
                aria-label="Close blanket packing"
              >
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-[1fr_0.9fr]">
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                  <div className="text-sm font-black text-blue-700">إجمالي البطانيات</div>
                  <div dir="ltr" className="mt-2 font-mono text-6xl font-black text-blue-950">
                    {blanketBundle.totals.required}
                  </div>
                  <div className="mt-2 text-sm font-bold text-blue-700">بطانيات فقط</div>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                  <div className="text-sm font-black text-emerald-700">تمت التعبئة</div>
                  <div dir="ltr" className="mt-2 font-mono text-6xl font-black text-emerald-950">
                    {blanketBundle.totals.packed} / {blanketBundle.totals.required}
                  </div>
                  <div className="mt-2 text-sm font-bold text-emerald-700">
                    {blanketBundle.packing.can_print_next
                      ? `${blanketBundle.packing.next_blanket_index} من ${blanketBundle.totals.required}`
                      : 'مكتمل'}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-800">
                  <Box size={18} className="text-blue-700" />
                  عناصر البطانيات في الطلب
                </div>
                <div className="space-y-2">
                  {blanketBundle.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-black text-slate-900">{item.item_name}</div>
                        <div className="text-xs font-bold text-slate-500">Packed {item.qty_packed ?? 0} of {item.qty_required}</div>
                      </div>
                      <div dir="ltr" className="font-mono text-2xl font-black text-slate-900">
                        {item.qty_required}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {blanketBundle.label_preview && (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Sticker Preview</div>
                  <div className="mt-3 rounded-xl border border-slate-300 bg-white p-4 font-mono text-sm font-black text-slate-900">
                    <div>ORDER: {blanketBundle.label_preview.order_no}</div>
                    <div>
                      BLANKET: {blanketBundle.label_preview.blanket_index} of {blanketBundle.label_preview.total_blankets}
                    </div>
                    <div>BARCODE: {blanketBundle.label_preview.barcode_payload}</div>
                  </div>
                </div>
              )}

              {blanketError && (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm font-bold text-rose-700">
                  {blanketError}
                </div>
              )}

              <button
                type="button"
                disabled={!blanketBundle.packing.can_print_next || blanketActionBusy !== null}
                onClick={() => {
                  void handlePrintNextBlanketLabel();
                }}
                className="mt-5 flex min-h-24 w-full items-center justify-center gap-3 rounded-3xl bg-blue-700 px-6 py-6 text-2xl font-black text-white shadow-lg shadow-blue-700/25 transition hover:bg-blue-800 disabled:bg-slate-300 disabled:shadow-none"
              >
                {blanketActionBusy === 'print' ? <Loader2 size={30} className="animate-spin" /> : <Printer size={30} />}
                {blanketBundle.packing.can_print_next
                  ? blanketActionBusy === 'print'
                    ? 'جاري الطباعة والتعبئة...'
                    : 'طباعة وتعبئة'
                  : 'اكتملت التعبئة'}
              </button>
            </div>
          </div>
        </div>
      )}

      {blanketHistoryOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-5xl rounded-3xl border border-slate-200 bg-white shadow-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.2em] font-black text-slate-500">Blanket Packing</div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">Print History</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setBlanketHistoryOpen(false);
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-700"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                value={blanketHistoryQuery}
                onChange={(event) => setBlanketHistoryQuery(event.target.value)}
                placeholder="Search order / customer / user"
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800"
              />
              <select
                value={blanketHistoryAction}
                onChange={(event) =>
                  setBlanketHistoryAction((event.target.value as 'all' | 'printed' | 'reprinted' | 'packed') ?? 'all')
                }
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800"
              >
                <option value="all">All Actions</option>
                <option value="printed">Printed</option>
                <option value="reprinted">Reprinted</option>
                <option value="packed">Packed</option>
              </select>
              <select
                value={blanketHistoryStatus}
                onChange={(event) =>
                  setBlanketHistoryStatus(
                    (event.target.value as 'all' | 'not_packed' | 'partially_packed' | 'fully_packed' | 'error') ?? 'all'
                  )
                }
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800"
              >
                <option value="all">All Statuses</option>
                <option value="not_packed">Not Packed</option>
                <option value="partially_packed">Partially Packed</option>
                <option value="fully_packed">Fully Packed</option>
                <option value="error">Error</option>
              </select>
              <button
                type="button"
                onClick={() => {
                  void loadBlanketHistory(1);
                }}
                disabled={blanketHistoryBusy}
                className="rounded-xl border border-violet-300 bg-violet-50 px-3 py-2 text-xs font-black uppercase tracking-wider text-violet-700 disabled:opacity-50"
              >
                {blanketHistoryBusy ? 'Loading…' : 'Apply Filters'}
              </button>
            </div>

            {blanketHistoryError && (
              <div className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                {blanketHistoryError}
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto max-h-[52vh]">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-100 text-slate-700 sticky top-0">
                    <tr className="text-left">
                      <th className="px-3 py-2 font-black uppercase tracking-wider">Order</th>
                      <th className="px-3 py-2 font-black uppercase tracking-wider">Customer</th>
                      <th className="px-3 py-2 font-black uppercase tracking-wider">Sequence</th>
                      <th className="px-3 py-2 font-black uppercase tracking-wider">Action</th>
                      <th className="px-3 py-2 font-black uppercase tracking-wider">Status</th>
                      <th className="px-3 py-2 font-black uppercase tracking-wider">User</th>
                      <th className="px-3 py-2 font-black uppercase tracking-wider">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blanketHistoryEntries.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-3 py-6 text-center text-slate-500 font-semibold">
                          No history records found.
                        </td>
                      </tr>
                    ) : (
                      blanketHistoryEntries.map((entry) => (
                        <tr key={`history-${entry.id}`} className="border-t border-slate-200">
                          <td className="px-3 py-2 font-black text-slate-900">{entry.order_number}</td>
                          <td className="px-3 py-2 font-semibold text-slate-700">{entry.customer_name || '-'}</td>
                          <td className="px-3 py-2 font-semibold text-slate-700">
                            {entry.blanket_index} / {entry.total_blankets}
                          </td>
                          <td className="px-3 py-2 font-semibold text-slate-700">{entry.action}</td>
                          <td className="px-3 py-2 font-semibold text-slate-700">{entry.status}</td>
                          <td className="px-3 py-2 font-semibold text-slate-700">{entry.packed_by || '-'}</td>
                          <td className="px-3 py-2 font-semibold text-slate-700">
                            {entry.printed_at ? new Date(entry.printed_at).toLocaleString() : '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-semibold text-slate-600">
                Total: {blanketHistoryTotal}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={blanketHistoryBusy || blanketHistoryPage <= 1}
                  onClick={() => {
                    void loadBlanketHistory(blanketHistoryPage - 1);
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-slate-700 disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-xs font-black text-slate-700">Page {blanketHistoryPage}</span>
                <button
                  type="button"
                  disabled={blanketHistoryBusy || blanketHistoryPage * blanketHistoryLimit >= blanketHistoryTotal}
                  onClick={() => {
                    void loadBlanketHistory(blanketHistoryPage + 1);
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-slate-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
