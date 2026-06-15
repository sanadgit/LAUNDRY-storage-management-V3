import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  Camera,
  CheckCircle2,
  CreditCard,
  Eye,
  FileText,
  Loader2,
  Package,
  PackageCheck,
  Phone,
  RotateCcw,
  ScanBarcode,
  Search,
  Shirt,
  Sofa,
  Truck,
  X,
  type LucideIcon,
} from 'lucide-react';
import {
  extractTicketNumberFromScan,
  isAipLinkOrderUrl,
  normalizeAipLinkOrderUrl,
} from '../utils/barcode';
import { getScannerSupportMessage, startCameraBarcodeScanner } from '../utils/cameraScanner';

type LineItemCategory = 'clothes' | 'home_phase2' | 'blanket_phase3';
type PickupCategory = 'hanging_clothes' | 'folded_clothes' | 'home_phase2' | 'blanket_phase3';

type PickupLineItem = {
  line_key: string;
  name: string;
  service: string;
  qty: number;
  unit_price: number;
  total_with_tax: number;
  category: LineItemCategory;
};

type PickupStorageSlot = {
  blanket_id: number;
  store: string;
  row: number;
  column: number;
  store_rows?: number;
  store_columns?: number;
  store_type?: string;
  status: string;
  created_at: string | null;
};

type PickupOrder = {
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
  customer_outstanding_balance: number;
  customer_ledger_balance: number;
  customer_credit_limit: number;
  order_status: string;
  source_orders_id: string;
  source_invoice_id: string;
  line_items: PickupLineItem[];
  blanket_storage: {
    order_no: string;
    qty_in_store: number;
    first_stored_at: string | null;
    store_slots: PickupStorageSlot[];
  } | null;
  details_error?: string;
};

type PickupSearchResponse = {
  query?: string;
  phone?: string;
  mode?: 'phone' | 'order';
  orders: PickupOrder[];
  count: number;
  searched_queries: string[];
  attempts?: Array<{
    query: string;
    records_total: number;
    records_filtered: number;
    parsed_orders: number;
  }>;
};

type HomeStorageCode = {
  code: string;
  store: string;
  row: string;
  column: string;
};

type ParsedRemark = {
  clothes: string[];
  home: HomeStorageCode[];
  unknown: string[];
};

type PickTarget = {
  order: PickupOrder;
  category: PickupCategory;
  requiredCategories: PickupCategory[];
};

type PickLocation = {
  store: string;
  row: number | null;
  column: number | null;
  label: string;
  rowLabel?: string;
  columnLabel?: string;
  storeRows?: number | null;
  storeColumns?: number | null;
  storeType?: string;
};

const emptyValue = '-';
const NUMBER_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
const BRANCH_KEYS = [
  {
    key: 'A',
    label: 'Al Falah',
    className: 'border-emerald-700 bg-emerald-600 text-white hover:bg-emerald-500',
  },
  {
    key: 'M',
    label: 'Musaffah',
    className: 'border-blue-700 bg-blue-600 text-white hover:bg-blue-500',
  },
  {
    key: 'Z',
    label: 'MBZ',
    className: 'border-violet-700 bg-violet-600 text-white hover:bg-violet-500',
  },
  {
    key: 'R',
    label: 'Al Riyadh',
    className: 'border-orange-700 bg-orange-500 text-white hover:bg-orange-400',
  },
] as const;
const ARABIC_SCRIPT_PATTERN = /\p{Script=Arabic}/u;

const getEnglishApiError = (error: any, fallback: string) => {
  const message = String(error?.response?.data?.error || error?.message || '').trim();
  return message && !ARABIC_SCRIPT_PATTERN.test(message) ? message : fallback;
};

const categoryLabels: Record<PickupCategory, string> = {
  hanging_clothes: 'Hanging Clothes',
  folded_clothes: 'Folded Clothes',
  home_phase2: 'Home Items (Phase 2)',
  blanket_phase3: 'Blankets (Phase 3)',
};

const lineItemCategoryLabels: Record<LineItemCategory, string> = {
  clothes: 'Clothes',
  home_phase2: 'Home Items (Phase 2)',
  blanket_phase3: 'Blankets (Phase 3)',
};

const categoryIcons: Record<PickupCategory, LucideIcon> = {
  hanging_clothes: Shirt,
  folded_clothes: Shirt,
  home_phase2: Sofa,
  blanket_phase3: PackageCheck,
};

const FOLDABLE_CLOTHES_KEYWORDS = [
  'pants',
  'pant',
  't-shirt',
  'tshirt',
  't shirt',
  'wezar',
  'wizar',
  'fanela',
  'flannel',
  'shirt',
  'underwear',
  'under wear',
  'short',
  'shorts',
  'takiya',
  'bra',
];

const normalizeStatus = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');

const isDelivered = (status: string) => normalizeStatus(status) === 'delivered';

const formatText = (value: unknown) => {
  const text = String(value ?? '').trim();
  return text || emptyValue;
};

const formatMoney = (value: unknown) => {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return 'AED 0.00';
  return `AED ${amount.toFixed(2)}`;
};

const formatDateTime = (date: unknown, time?: unknown) => {
  const rawDate = String(date ?? '').trim();
  const rawTime = String(time ?? '').trim();
  if (!rawDate && !rawTime) return emptyValue;
  const combined = [rawDate, rawTime].filter(Boolean).join(' ');
  const parsed = new Date(combined);
  if (Number.isNaN(parsed.getTime())) return combined;
  return parsed.toLocaleString();
};

const statusBadgeClass = (status: string) => {
  const normalized = normalizeStatus(status);
  if (normalized === 'delivered') return 'border-emerald-300 bg-emerald-50 text-emerald-700';
  if (normalized === 'fully packed') return 'border-blue-300 bg-blue-50 text-blue-700';
  if (normalized === 'partially packed' || normalized === 'packed partially') return 'border-amber-300 bg-amber-50 text-amber-700';
  if (normalized === 'pending/unpaid') return 'border-rose-300 bg-rose-50 text-rose-700';
  return 'border-slate-300 bg-slate-50 text-slate-700';
};

const cleanRemarkToken = (value: string) =>
  value
    .replace(/\bpack\s*:/gi, '')
    .replace(/:\s*pack\b/gi, '')
    .replace(/<\/?br\s*\/?>/gi, '')
    .replace(/\s+/g, '')
    .replace(/^,+|,+$/g, '')
    .trim();

const extractPackRemarkText = (remark: string) => {
  const normalized = String(remark ?? '')
    .replace(/<\/?br\s*\/?>/gi, '|')
    .replace(/\\n/g, '|')
    .replace(/\r?\n/g, '|');
  const matches = Array.from(normalized.matchAll(/\bpack\s*:\s*([^|]+)/gi));
  if (matches.length > 0) {
    return matches.map((match) => match[1]).join(',');
  }
  return normalized;
};

const parseHomeCode = (token: string): HomeStorageCode | null => {
  const bsMatch = token.match(/^bs([a-z])(\d{1,2})$/i);
  if (bsMatch) {
    return {
      code: token,
      store: 'Bs',
      column: bsMatch[1].toUpperCase(),
      row: bsMatch[2],
    };
  }

  const fMatch = token.match(/^f([a-z])(\d{1,2})$/i);
  if (fMatch) {
    return {
      code: token,
      store: 'F',
      column: fMatch[1].toUpperCase(),
      row: fMatch[2],
    };
  }

  return null;
};

const parseRemark = (remark: string): ParsedRemark => {
  const tokens = extractPackRemarkText(remark)
    .split(/[,\|]+/)
    .map(cleanRemarkToken)
    .filter((token) => token && !/^mbk$/i.test(token));

  const clothes: string[] = [];
  const home: HomeStorageCode[] = [];
  const unknown: string[] = [];

  for (const token of tokens) {
    const homeCode = parseHomeCode(token);
    if (homeCode) {
      home.push(homeCode);
      continue;
    }

    const numeric = Number(token);
    const isClothesNumber = Number.isInteger(numeric) && numeric >= 1 && numeric <= 300;
    const isClothesCode = /^(a|b|c|d|up)$/i.test(token);
    if (isClothesNumber || isClothesCode) {
      clothes.push(token.toUpperCase());
      continue;
    }

    unknown.push(token);
  }

  return { clothes, home, unknown };
};

const normalizeItemName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ');

const isFoldableClothesItem = (name: string) => {
  const normalized = normalizeItemName(name);
  return FOLDABLE_CLOTHES_KEYWORDS.some((keyword) => normalized.includes(normalizeItemName(keyword)));
};

const splitItems = (items: PickupLineItem[], parsedRemark: ParsedRemark) => {
  const groups: Record<PickupCategory, PickupLineItem[]> = {
    hanging_clothes: [],
    folded_clothes: [],
    home_phase2: [],
    blanket_phase3: [],
  };

  for (const item of items) {
    if (item.category === 'clothes') {
      if (parsedRemark.home.length > 0 && isFoldableClothesItem(item.name)) {
        groups.folded_clothes.push(item);
      } else {
        groups.hanging_clothes.push(item);
      }
      continue;
    }

    groups[item.category]?.push(item);
  }

  return groups;
};

const columnLetterToNumber = (value: string) => {
  const letter = value.trim().toUpperCase();
  if (!/^[A-Z]$/.test(letter)) return null;
  return letter.charCodeAt(0) - 64;
};

const numberToColumnLetter = (value: number | null) => {
  if (!value || value < 1 || value > 26) return '';
  return String.fromCharCode(64 + value);
};

const buildPickLocations = (target: PickTarget, parsedRemark: ParsedRemark): PickLocation[] => {
  if (target.category === 'hanging_clothes') {
    return parsedRemark.clothes.map((pack) => ({
      store: 'Hanger',
      row: null,
      column: Number.isFinite(Number(pack)) ? Number(pack) : null,
      label: `Hanger: ${pack}`,
      columnLabel: pack,
    }));
  }

  if (target.category === 'folded_clothes' || target.category === 'home_phase2') {
    return parsedRemark.home.map((code) => ({
      store: code.store,
      row: Number.isFinite(Number(code.row)) ? Number(code.row) : null,
      column: columnLetterToNumber(code.column),
      label: `Store: ${code.store}, Column: ${code.column}, Row: ${code.row}, Code: ${code.code}`,
      rowLabel: code.row,
      columnLabel: code.column,
    }));
  }

  return (target.order.blanket_storage?.store_slots ?? []).map((slot) => ({
    store: formatText(slot.store),
    row: Number.isFinite(Number(slot.row)) ? Number(slot.row) : null,
    column: Number.isFinite(Number(slot.column)) ? Number(slot.column) : null,
    label: `Store: ${formatText(slot.store)}, Row: ${slot.row}, Column: ${slot.column}`,
    rowLabel: String(slot.row),
    columnLabel: String(slot.column),
    storeRows: Number.isFinite(Number(slot.store_rows)) ? Number(slot.store_rows) : null,
    storeColumns: Number.isFinite(Number(slot.store_columns)) ? Number(slot.store_columns) : null,
    storeType: slot.store_type,
  }));
};

const rangeLabels = (count: number, mapper: (value: number) => string) =>
  Array.from({ length: Math.max(1, count) }, (_unused, index) => mapper(index + 1));

const getSlotGridSpec = (location: PickLocation) => {
  const storeKey = location.store.trim().toLowerCase();
  if (storeKey === 'f') {
    return {
      columns: ['A', 'B', 'C', 'D', 'E', 'F'],
      rows: ['1', '2', '3', '4', '5', '6'],
      activeColumn: location.columnLabel || numberToColumnLetter(location.column),
      activeRow: location.rowLabel || String(location.row ?? ''),
    };
  }

  if (storeKey === 'bs') {
    return {
      columns: ['A', 'B'],
      rows: ['1', '2', '3', '4', '5'],
      activeColumn: location.columnLabel || numberToColumnLetter(location.column),
      activeRow: location.rowLabel || String(location.row ?? ''),
    };
  }

  const isStoredBlanketStore = /^b\d*(?:-|$)/i.test(location.store.trim()) || storeKey === 'b';
  const columnCount = isStoredBlanketStore
    ? Math.max(1, Math.min(30, Number(location.storeColumns ?? location.column ?? 0) || 10))
    : Math.max(3, Math.min(12, Number(location.column ?? 0) || 3));
  const rowCount = isStoredBlanketStore
    ? Math.max(1, Math.min(30, Number(location.storeRows ?? location.row ?? 0) || 10))
    : Math.max(3, Math.min(12, Number(location.row ?? 0) || 3));
  return {
    columns: rangeLabels(columnCount, String),
    rows: rangeLabels(rowCount, String),
    activeColumn: location.columnLabel || String(location.column ?? ''),
    activeRow: location.rowLabel || String(location.row ?? ''),
  };
};

function HangerSlot2D({ location }: { location: PickLocation }) {
  const slot = Number(location.column ?? location.columnLabel);
  const safeSlot = Number.isFinite(slot) ? Math.max(1, Math.min(300, slot)) : null;
  const percent = safeSlot ? ((safeSlot - 1) / 299) * 100 : 0;

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-black uppercase tracking-widest text-blue-500">Hanger Slot</div>
          <div dir="ltr" className="mt-1 text-3xl font-black text-blue-950">
            {location.columnLabel || formatText(location.column)}
          </div>
        </div>
        <div className="rounded-xl bg-blue-900 px-3 py-2 text-xs font-black text-white">1 - 300</div>
      </div>
      <div className="mt-4 rounded-full bg-white p-2 shadow-inner">
        <div className="relative h-5 rounded-full bg-blue-100">
          <div className="absolute inset-y-0 left-0 rounded-full bg-blue-300" style={{ width: `${percent}%` }} />
          <div
            className="absolute top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-blue-700 shadow-lg"
            style={{ left: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function SlotGrid2D({ location }: { location: PickLocation }) {
  const spec = getSlotGridSpec(location);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-black uppercase tracking-widest text-slate-500">Store</div>
          <div className="text-2xl font-black text-slate-950">{location.store}</div>
        </div>
        <div dir="ltr" className="rounded-xl bg-emerald-700 px-3 py-2 text-xs font-black text-white">
          {location.label}
        </div>
      </div>
      <div className="overflow-auto">
        <div
          className="grid min-w-max gap-1.5"
          style={{ gridTemplateColumns: `2.25rem repeat(${spec.columns.length}, minmax(2.75rem, 1fr))` }}
        >
          <div />
          {spec.columns.map((column) => (
            <div key={column} className="flex h-9 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-600">
              {column}
            </div>
          ))}
          {spec.rows.map((row) => (
            <div key={row} className="contents">
              <div className="flex h-11 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-600">{row}</div>
              {spec.columns.map((column) => {
                const active = row === spec.activeRow && column === spec.activeColumn;
                return (
                  <div
                    key={`${row}-${column}`}
                    className={`flex h-11 min-w-11 items-center justify-center rounded-lg border text-xs font-black ${
                      active
                        ? 'border-emerald-700 bg-emerald-600 text-white shadow-md shadow-emerald-200'
                        : 'border-slate-200 bg-slate-50 text-slate-300'
                    }`}
                  >
                    {active ? 'HERE' : ''}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Slot2DView({ category, locations }: { category: PickupCategory; locations: PickLocation[] }) {
  return (
    <section>
      <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
        <Eye size={16} className="text-emerald-700" />
        SHOW SLOT (2D)
      </div>
      {locations.length > 0 ? (
        <div className="grid gap-3">
          {locations.map((location, index) =>
            category === 'hanging_clothes' ? (
              <HangerSlot2D key={`${location.label}-${index}`} location={location} />
            ) : (
              <SlotGrid2D key={`${location.label}-${index}`} location={location} />
            )
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
          No slot location is available to show.
        </div>
      )}
    </section>
  );
}

function Field({ label, value, ltr = false }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</div>
      <div dir={ltr ? 'ltr' : undefined} className="mt-1 text-sm font-black text-slate-900 break-words">
        {value}
      </div>
    </div>
  );
}

function ItemsTable({ items }: { items: PickupLineItem[] }) {
  return (
    <div className="overflow-auto rounded-xl border border-slate-200">
      <table className="min-w-[620px] w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="px-3 py-2 text-left font-black">Item</th>
            <th className="px-3 py-2 text-left font-black">Group</th>
            <th className="px-3 py-2 text-right font-black">Qty</th>
            <th className="px-3 py-2 text-right font-black">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item) => (
            <tr key={item.line_key}>
              <td className="px-3 py-2 font-bold text-slate-900">{formatText(item.name)}</td>
              <td className="px-3 py-2 text-slate-600">{lineItemCategoryLabels[item.category]}</td>
              <td className="px-3 py-2 text-right font-black text-slate-800">{Number(item.qty || 0)}</td>
              <td className="px-3 py-2 text-right font-bold text-slate-700">{formatMoney(item.total_with_tax)}</td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={4} className="px-3 py-8 text-center font-bold text-slate-500">
                Invoice items are not available for this order.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function PickModal({
  target,
  onClose,
  onNextPick,
  onDelivered,
}: {
  target: PickTarget;
  onClose: () => void;
  onNextPick: (category: PickupCategory) => void;
  onDelivered: (orderNo: string, remainingBalance: number) => void;
}) {
  const { order, category, requiredCategories } = target;
  const [pickLoading, setPickLoading] = useState(false);
  const [pickError, setPickError] = useState<string | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);
  const [pickedCategories, setPickedCategories] = useState<PickupCategory[]>([]);
  const [showDeliveryPayment, setShowDeliveryPayment] = useState(false);
  const [barcodeValue, setBarcodeValue] = useState('');
  const [barcodeVerified, setBarcodeVerified] = useState(false);
  const [barcodeError, setBarcodeError] = useState<string | null>(null);
  const [barcodeResolving, setBarcodeResolving] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [scannerPreview, setScannerPreview] = useState<{ raw: string; extracted: string } | null>(null);
  const [deliveryLoading, setDeliveryLoading] = useState<'cash' | 'credit_card' | 'no_pay' | null>(null);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const [showNoPayReasons, setShowNoPayReasons] = useState(false);
  const [noPayReasonType, setNoPayReasonType] = useState<'monthly_account' | 'other' | null>(null);
  const [noPayOtherReason, setNoPayOtherReason] = useState('');
  const [deliverySuccess, setDeliverySuccess] = useState<{
    amountPaid: number;
    remainingBalance: number;
    paymentMethod: 'cash' | 'credit_card' | 'no_pay';
  } | null>(null);
  const [showSlot2d, setShowSlot2d] = useState(false);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const scannerVideoRef = useRef<HTMLVideoElement>(null);
  const parsedRemark = useMemo(() => parseRemark(order.remark), [order.remark]);
  const groups = useMemo(() => splitItems(order.line_items, parsedRemark), [order.line_items, parsedRemark]);
  const items = groups[category];
  const locations = useMemo(() => buildPickLocations(target, parsedRemark), [target, parsedRemark]);
  const Icon = categoryIcons[category];
  const currentPicked = pickedCategories.includes(category);
  const pendingCategories = requiredCategories.filter((candidate) => !pickedCategories.includes(candidate));
  const allPicked = requiredCategories.length > 0 && pendingCategories.length === 0;
  const nextCategory = pendingCategories[0] ?? null;

  useEffect(() => {
    let active = true;
    setProgressLoading(true);
    setPickError(null);
    axios
      .get<{ picked_categories?: PickupCategory[] }>('/api/pickup-search/pick-progress', {
        params: { order_no: order.order_no },
      })
      .then((response) => {
        if (!active) return;
        setPickedCategories(
          (response.data?.picked_categories ?? []).filter((candidate) => requiredCategories.includes(candidate))
        );
      })
      .catch((err: any) => {
        if (!active) return;
        setPickError(getEnglishApiError(err, 'Could not load pick progress.'));
      })
      .finally(() => {
        if (active) setProgressLoading(false);
      });
    return () => {
      active = false;
    };
  }, [order.order_no, requiredCategories]);

  useEffect(() => {
    setShowDeliveryPayment(false);
    setBarcodeValue('');
    setBarcodeVerified(false);
    setBarcodeError(null);
    setBarcodeResolving(false);
    setShowNoPayReasons(false);
    setNoPayReasonType(null);
    setNoPayOtherReason('');
    setScannerOpen(false);
    setScannerError(null);
    setScannerPreview(null);
  }, [category]);

  const normalizeBarcode = useCallback(
    (value: string) => value.trim().toUpperCase().replace(/[^A-Z0-9]/g, ''),
    []
  );

  const resolveScannedOrderNo = useCallback(async (rawValue: string) => {
    const raw = String(rawValue ?? '').trim();
    if (!raw) return '';
    if (!isAipLinkOrderUrl(raw)) return extractTicketNumberFromScan(raw);

    const response = await axios.post<{ order_no?: string }>('/api/pickup-search/resolve-barcode', {
      barcode: normalizeAipLinkOrderUrl(raw),
    });
    return String(response.data?.order_no ?? '').trim();
  }, []);

  const verifyBarcodeValue = useCallback(async (value: string, focusManualInput = true) => {
    setBarcodeError(null);
    setShowDeliveryPayment(false);
    if (!value.trim()) {
      setBarcodeVerified(false);
      setBarcodeError('Scan the invoice barcode attached to the bag.');
      if (focusManualInput) barcodeInputRef.current?.focus();
      return;
    }

    setBarcodeResolving(true);
    try {
      const resolvedValue = await resolveScannedOrderNo(value);
      if (!resolvedValue) {
        setBarcodeVerified(false);
        setBarcodeError('No order number was found in the barcode.');
        if (focusManualInput) barcodeInputRef.current?.focus();
        return;
      }
      if (normalizeBarcode(resolvedValue) !== normalizeBarcode(order.order_no)) {
        setBarcodeVerified(false);
        setBarcodeError('The barcode does not match this order. Scan the correct bag.');
        setBarcodeValue('');
        if (focusManualInput) barcodeInputRef.current?.focus();
        return;
      }
      setBarcodeValue(resolvedValue);
      setBarcodeVerified(true);
    } catch (error: any) {
      setBarcodeVerified(false);
      setBarcodeError(getEnglishApiError(error, 'Could not extract the order number from the barcode.'));
      if (focusManualInput) barcodeInputRef.current?.focus();
    } finally {
      setBarcodeResolving(false);
    }
  }, [normalizeBarcode, order.order_no, resolveScannedOrderNo]);

  const verifyBarcode = () => void verifyBarcodeValue(barcodeValue);

  const closeScanner = () => {
    setScannerOpen(false);
    setScannerError(null);
    setScannerPreview(null);
  };

  useEffect(() => {
    if (!scannerOpen) return;

    let cancelled = false;
    let consumed = false;
    let resolving = false;
    let stopSession: (() => void) | null = null;
    setScannerError(null);
    setScannerPreview(null);

    const start = async () => {
      try {
        const video = scannerVideoRef.current;
        if (!video) throw new Error('Scanner video element not ready.');

        const session = await startCameraBarcodeScanner({
          videoElement: video,
          onDetected: async (rawValue) => {
            if (cancelled || consumed || resolving) return;
            const raw = String(rawValue ?? '').trim();
            const localValue = extractTicketNumberFromScan(raw);
            const needsAipLinkResolution = isAipLinkOrderUrl(raw);
            setScannerPreview({
              raw,
              extracted: needsAipLinkResolution ? 'Resolving AIPLink order...' : localValue,
            });
            if (!localValue && !needsAipLinkResolution) return;

            resolving = true;
            let extracted = '';
            try {
              extracted = await resolveScannedOrderNo(raw);
            } catch (error: any) {
              if (!cancelled) {
                const message = getEnglishApiError(
                  error,
                  'Could not extract the order number from the barcode link.'
                );
                setScannerError(message);
                setBarcodeError(message);
              }
              resolving = false;
              return;
            }
            resolving = false;
            if (cancelled || consumed || !extracted) return;
            setScannerPreview({ raw, extracted });

            setBarcodeValue(extracted);
            if (normalizeBarcode(extracted) !== normalizeBarcode(order.order_no)) {
              try {
                navigator.vibrate?.([40, 40, 40]);
              } catch {
                // Ignore vibration errors.
              }
              const message = `Barcode ${extracted} does not match order ${order.order_no}.`;
              setScannerError(message);
              setBarcodeError(message);
              return;
            }

            consumed = true;
            stopSession?.();
            try {
              navigator.vibrate?.(70);
            } catch {
              // Ignore vibration errors.
            }
            void verifyBarcodeValue(extracted, false);
            setScannerError(null);
            setScannerOpen(false);
          },
          onRuntimeError: (error) => {
            if (!cancelled) setScannerError(getScannerSupportMessage(error));
          },
        });

        if (cancelled) {
          session.stop();
          return;
        }
        stopSession = session.stop;
      } catch (error) {
        if (!cancelled) setScannerError(getScannerSupportMessage(error));
      }
    };

    void start();
    return () => {
      cancelled = true;
      stopSession?.();
    };
  }, [normalizeBarcode, order.order_no, resolveScannedOrderNo, scannerOpen, verifyBarcodeValue]);

  const pickIt = async () => {
    try {
      setPickLoading(true);
      setPickError(null);
      const response = await axios.post<{ picked_categories?: PickupCategory[] }>('/api/pickup-search/pick', {
        order_no: order.order_no,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        category,
        category_label: categoryLabels[category],
        required_categories: requiredCategories,
        locations,
        items: items.map((item) => ({
          name: item.name,
          qty: item.qty,
          service: item.service,
        })),
        remark: order.remark,
      });
      setPickedCategories(
        (response.data?.picked_categories ?? [...pickedCategories, category]).filter((candidate) =>
          requiredCategories.includes(candidate)
        )
      );
    } catch (err: any) {
      setPickError(getEnglishApiError(err, 'Failed to record the pickup from storage.'));
    } finally {
      setPickLoading(false);
    }
  };

  const payAndDeliver = async (
    paymentMethod: 'cash' | 'credit_card' | 'no_pay',
    noPayReasonTypeValue?: 'monthly_account' | 'other'
  ) => {
    try {
      const noPayReason = noPayReasonTypeValue === 'other' ? noPayOtherReason.trim() : '';
      if (paymentMethod === 'no_pay' && noPayReasonTypeValue === 'other' && !noPayReason) {
        setDeliveryError('Enter the other No Pay reason.');
        return;
      }
      setDeliveryLoading(paymentMethod);
      setDeliveryError(null);
      const response = await axios.post('/api/pickup-search/pay-deliver', {
        order_no: order.order_no,
        source_orders_id: order.source_orders_id,
        payment_method: paymentMethod,
        no_pay_reason_type: paymentMethod === 'no_pay' ? noPayReasonTypeValue : undefined,
        no_pay_reason: paymentMethod === 'no_pay' ? noPayReason : undefined,
        required_categories: requiredCategories,
        barcode: barcodeValue,
      });
      const amountPaid = Number(response.data?.amount_paid ?? order.balance ?? 0);
      const remainingBalance = Number(response.data?.remaining_balance ?? 0);
      setDeliverySuccess({ amountPaid, remainingBalance, paymentMethod });
      setShowDeliveryPayment(false);
      setShowNoPayReasons(false);
      onDelivered(order.order_no, remainingBalance);
    } catch (err: any) {
      setDeliveryError(getEnglishApiError(err, 'Could not complete payment and delivery in POS.'));
    } finally {
      setDeliveryLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 bg-slate-950 px-5 py-4 text-white">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
              <Icon size={22} />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black uppercase tracking-[0.22em] text-blue-200">Pick Location</div>
              <h2 className="truncate text-2xl font-black">{categoryLabels[category]}</h2>
              <div className="mt-1 text-xs font-bold text-slate-300">
                Order #{formatText(order.order_no)} · {formatText(order.customer_name)}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white hover:bg-white/20"
            aria-label="Close pick popup"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-5 space-y-5">
          <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-slate-500">Pick Progress</div>
                <div className="mt-1 text-sm font-black text-slate-900">
                  {progressLoading
                    ? 'Loading progress...'
                    : `${pickedCategories.length} / ${requiredCategories.length} completed`}
                </div>
              </div>
              {allPicked && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-2 text-xs font-black text-emerald-800">
                  <CheckCircle2 size={16} />
                  All items are ready
                </span>
              )}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {requiredCategories.map((candidate, index) => {
                const completed = pickedCategories.includes(candidate);
                const CurrentIcon = categoryIcons[candidate];
                return (
                  <div
                    key={candidate}
                    className={`flex min-h-12 items-center gap-3 rounded-xl border px-3 py-2 ${
                      completed
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                        : candidate === category
                          ? 'border-blue-300 bg-blue-50 text-blue-950'
                          : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-black shadow-sm">
                      {completed ? <CheckCircle2 size={17} className="text-emerald-700" /> : index + 1}
                    </span>
                    <CurrentIcon size={17} className="shrink-0" />
                    <span className="min-w-0 truncate text-xs font-black">{categoryLabels[candidate]}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {category === 'hanging_clothes' && (
            <section>
              <div className="mb-2 text-xs font-black uppercase tracking-widest text-slate-500">Hanger Store</div>
              {parsedRemark.clothes.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {parsedRemark.clothes.map((pack) => (
                    <div key={pack} className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                      <div className="text-[11px] font-black uppercase tracking-widest text-blue-500">Hanger Number</div>
                      <div dir="ltr" className="mt-1 text-3xl font-black text-blue-900">{pack}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
                  No clothes storage code found in the order remark.
                </div>
              )}
            </section>
          )}

          {(category === 'folded_clothes' || category === 'home_phase2') && (
            <section>
              <div className="mb-2 text-xs font-black uppercase tracking-widest text-slate-500">
                {category === 'folded_clothes' ? 'Folded Clothes Store' : 'Folded Store'}
              </div>
              {parsedRemark.home.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {parsedRemark.home.map((code) => (
                    <div key={code.code} className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                      <div className="text-[11px] font-black uppercase tracking-widest text-emerald-600">Store</div>
                      <div className="mt-1 text-4xl font-black text-emerald-950">{code.store}</div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <Field label="Column" value={code.column} ltr />
                        <Field label="Row" value={code.row} ltr />
                      </div>
                      <div dir="ltr" className="mt-3 text-xs font-black text-emerald-700">Code: {code.code}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
                  No folded storage code found in the order remark.
                </div>
              )}
            </section>
          )}

          {category === 'blanket_phase3' && (
            <section>
              <div className="mb-2 text-xs font-black uppercase tracking-widest text-slate-500">Blankets Storage</div>
              {(order.blanket_storage?.store_slots ?? []).length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {order.blanket_storage!.store_slots.map((slot) => (
                    <div key={slot.blanket_id} className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                      <div className="text-[11px] font-black uppercase tracking-widest text-indigo-600">Store</div>
                      <div className="mt-1 text-3xl font-black text-indigo-950">{formatText(slot.store)}</div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <Field label="Row" value={String(slot.row)} ltr />
                        <Field label="Column" value={String(slot.column)} ltr />
                      </div>
                      <div className="mt-3 text-xs font-bold text-indigo-700">Status: {formatText(slot.status)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
                  No blanket storage location found for this order.
                </div>
              )}
            </section>
          )}

          {parsedRemark.unknown.length > 0 && category !== 'blanket_phase3' && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
              Unrecognized remark: {parsedRemark.unknown.join(', ')}
            </div>
          )}

          {showSlot2d && <Slot2DView category={category} locations={locations} />}

          <section>
            <div className="mb-2 text-xs font-black uppercase tracking-widest text-slate-500">Items</div>
            <ItemsTable items={items} />
          </section>

          <section>
            <div className="mb-2 text-xs font-black uppercase tracking-widest text-slate-500">Remark</div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 whitespace-pre-wrap">
              {formatText(order.remark)}
            </div>
          </section>
        </div>

        <div className="max-h-[55dvh] shrink-0 space-y-3 overflow-y-auto border-t border-slate-200 bg-slate-50 px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-h-5 text-sm font-bold">
              {deliverySuccess ? (
                <span className="inline-flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 size={18} />
                  {deliverySuccess.paymentMethod === 'no_pay'
                    ? `Delivered without payment. Remaining balance: AED ${deliverySuccess.remainingBalance.toFixed(2)}.`
                    : `Payment and delivery completed in POS for AED ${deliverySuccess.amountPaid.toFixed(2)}.`}
                </span>
              ) : deliveryError ? (
                <span className="inline-flex items-center gap-2 text-rose-700">
                  <AlertCircle size={18} />
                  {deliveryError}
                </span>
              ) : pickError ? (
                <span className="inline-flex items-center gap-2 text-rose-700">
                  <AlertCircle size={18} />
                  {pickError}
                </span>
              ) : progressLoading ? (
                <span className="inline-flex items-center gap-2 text-slate-500">
                  <Loader2 size={18} className="animate-spin" />
                  Checking pick tasks...
                </span>
              ) : currentPicked && nextCategory ? (
                <span className="inline-flex items-center gap-2 text-blue-700">
                  <ArrowRight size={18} />
                  Next task: {categoryLabels[nextCategory]}
                </span>
              ) : currentPicked && allPicked ? (
                <span className="inline-flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 size={18} />
                  All pick tasks are complete. Scan the bag barcode to continue.
                </span>
              ) : (
                <span className="text-slate-500">Record this task to continue automatically to the next one.</span>
              )}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setShowSlot2d((prev) => !prev)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-black text-slate-800 hover:bg-slate-100"
              >
                <Eye size={18} />
                {showSlot2d ? 'HIDE SLOT (2D)' : 'SHOW SLOT (2D)'}
              </button>
              {!currentPicked ? (
                <button
                  type="button"
                  onClick={() => void pickIt()}
                  disabled={pickLoading || progressLoading}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 text-sm font-black text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pickLoading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  PICK IT
                </button>
              ) : nextCategory ? (
                <button
                  type="button"
                  onClick={() => onNextPick(nextCategory)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 text-sm font-black text-white hover:bg-blue-600"
                >
                  <ArrowRight size={18} />
                  NEXT PICK
                </button>
              ) : barcodeVerified ? (
                <button
                  type="button"
                  onClick={() => setShowDeliveryPayment((prev) => !prev)}
                  disabled={Boolean(deliveryLoading) || Boolean(deliverySuccess)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 text-sm font-black text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Truck size={18} />
                  {deliverySuccess ? 'Delivered' : 'Pay and Deliver'}
                </button>
              ) : null}
            </div>
          </div>

          {allPicked && !deliverySuccess && (
            <div className={`rounded-xl border p-3 ${barcodeVerified ? 'border-emerald-200 bg-emerald-50' : 'border-amber-300 bg-amber-50'}`}>
              <div className="mb-3 flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${barcodeVerified ? 'bg-emerald-700 text-white' : 'bg-amber-500 text-slate-950'}`}>
                  {barcodeVerified ? <CheckCircle2 size={21} /> : <ScanBarcode size={22} />}
                </div>
                <div>
                  <div className={`text-sm font-black ${barcodeVerified ? 'text-emerald-950' : 'text-amber-950'}`}>
                    {barcodeVerified ? 'Correct bag verified' : 'Scan the invoice barcode attached to the bag'}
                  </div>
                  <div className={`mt-1 text-xs font-bold ${barcodeVerified ? 'text-emerald-700' : 'text-amber-800'}`}>
                    Payment and delivery are available only after the barcode matches this order.
                  </div>
                </div>
              </div>
              {!barcodeVerified && (
                <div>
                  <button
                    type="button"
                    onClick={() => setScannerOpen(true)}
                    className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-xl bg-blue-700 px-5 text-base font-black text-white shadow-sm hover:bg-blue-600"
                  >
                    <Camera size={21} />
                    Open Camera and Scan Barcode
                  </button>
                  <details className="mt-3 rounded-xl border border-amber-200 bg-white/70">
                    <summary className="cursor-pointer px-4 py-3 text-xs font-black text-amber-900">
                      Camera unavailable? Enter manually
                    </summary>
                    <div className="flex flex-col gap-2 border-t border-amber-200 p-3 sm:flex-row">
                      <input
                        ref={barcodeInputRef}
                        value={barcodeValue}
                        onChange={(event) => {
                          setBarcodeValue(event.target.value);
                          setBarcodeError(null);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') verifyBarcode();
                        }}
                        disabled={barcodeResolving}
                        dir="ltr"
                        inputMode="text"
                        autoComplete="off"
                        placeholder="ORDER BARCODE"
                        aria-label="Enter order barcode manually"
                        className="min-h-12 min-w-0 flex-1 rounded-xl border-2 border-amber-300 bg-white px-4 font-mono text-lg font-black tracking-widest text-slate-950 outline-none focus:border-blue-600"
                      />
                      <button
                        type="button"
                        onClick={verifyBarcode}
                        disabled={barcodeResolving}
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-black text-white hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
                      >
                        {barcodeResolving ? <Loader2 size={18} className="animate-spin" /> : <ScanBarcode size={18} />}
                        {barcodeResolving ? 'Reading link...' : 'Verify'}
                      </button>
                    </div>
                  </details>
                </div>
              )}
              {barcodeError && (
                <div className="mt-2 inline-flex items-center gap-2 text-sm font-black text-rose-700">
                  <AlertCircle size={17} />
                  {barcodeError}
                </div>
              )}
            </div>
          )}

          {showDeliveryPayment && barcodeVerified && !deliverySuccess && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-black text-blue-950">Select payment method or a No Pay reason</div>
                <div dir="ltr" className="rounded-lg bg-white px-3 py-1.5 text-sm font-black text-blue-900">
                  Invoice: AED {Number(order.balance || 0).toFixed(2)}
                </div>
              </div>
              {Number(order.customer_outstanding_balance || 0) > 0 && (
                <div className="mb-3 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-100 px-4 py-3 text-amber-950">
                  <AlertCircle size={21} className="mt-0.5 shrink-0 text-amber-700" />
                  <div>
                    <div className="text-sm font-black">Customer Outstanding Balance</div>
                    <div className="mt-1 text-xs font-bold text-amber-800">
                      This is the customer's total outstanding balance before this transaction.
                    </div>
                  </div>
                  <div dir="ltr" className="ml-auto shrink-0 rounded-lg bg-white px-3 py-2 text-sm font-black text-amber-900">
                    AED {Number(order.customer_outstanding_balance).toFixed(2)}
                  </div>
                </div>
              )}
              <div className="grid gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => void payAndDeliver('cash')}
                  disabled={Boolean(deliveryLoading)}
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-black text-white hover:bg-emerald-600 disabled:opacity-60"
                >
                  {deliveryLoading === 'cash' ? <Loader2 size={19} className="animate-spin" /> : <Banknote size={20} />}
                  Cash paid Delivery
                </button>
                <button
                  type="button"
                  onClick={() => void payAndDeliver('credit_card')}
                  disabled={Boolean(deliveryLoading)}
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-black text-white hover:bg-slate-700 disabled:opacity-60"
                >
                  {deliveryLoading === 'credit_card' ? <Loader2 size={19} className="animate-spin" /> : <CreditCard size={20} />}
                  Credit Card Delivery
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNoPayReasons(true);
                    setNoPayReasonType(null);
                    setDeliveryError(null);
                  }}
                  disabled={Boolean(deliveryLoading)}
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 text-sm font-black text-white hover:bg-amber-500 disabled:opacity-60"
                >
                  {deliveryLoading === 'no_pay' ? <Loader2 size={19} className="animate-spin" /> : <AlertCircle size={20} />}
                  No Pay Delivery
                </button>
              </div>

              {showNoPayReasons && (
                <div className="mt-3 rounded-xl border border-amber-300 bg-white p-3">
                  <div className="text-sm font-black text-slate-950">Select the No Pay reason</div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => {
                        setNoPayReasonType('monthly_account');
                        setNoPayOtherReason('');
                      }}
                      disabled={Boolean(deliveryLoading)}
                      className={`min-h-12 rounded-xl border px-4 text-sm font-black ${
                        noPayReasonType === 'monthly_account'
                          ? 'border-blue-700 bg-blue-700 text-white'
                          : 'border-slate-300 bg-slate-50 text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      1. Monthly Account
                    </button>
                    <button
                      type="button"
                      onClick={() => setNoPayReasonType('other')}
                      disabled={Boolean(deliveryLoading)}
                      className={`min-h-12 rounded-xl border px-4 text-sm font-black ${
                        noPayReasonType === 'other'
                          ? 'border-blue-700 bg-blue-700 text-white'
                          : 'border-slate-300 bg-slate-50 text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      2. Other Reason
                    </button>
                  </div>

                  {noPayReasonType === 'other' && (
                    <textarea
                      value={noPayOtherReason}
                      onChange={(event) => {
                        setNoPayOtherReason(event.target.value);
                        setDeliveryError(null);
                      }}
                      maxLength={500}
                      rows={3}
                      placeholder="Enter the No Pay reason..."
                      className="mt-3 w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-950 outline-none focus:border-blue-600"
                    />
                  )}

                  {noPayReasonType && (
                    <button
                      type="button"
                      onClick={() => void payAndDeliver('no_pay', noPayReasonType)}
                      disabled={Boolean(deliveryLoading)}
                      className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-700 px-5 text-sm font-black text-white hover:bg-amber-600 disabled:opacity-60"
                    >
                      {deliveryLoading === 'no_pay' ? <Loader2 size={18} className="animate-spin" /> : <Truck size={18} />}
                      Confirm No Pay and Deliver
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {scannerOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/95 p-3 backdrop-blur-sm">
          <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-800 px-4 py-3 text-white">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600">
                  <Camera size={22} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-black">Scan Invoice Barcode</div>
                  <div dir="ltr" className="truncate font-mono text-xs font-bold text-slate-400">
                    Required: #{order.order_no}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={closeScanner}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-white hover:bg-slate-700"
                aria-label="Close camera"
              >
                <X size={21} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
              <div className="relative aspect-[3/4] max-h-[62dvh] overflow-hidden rounded-2xl border border-slate-700 bg-black sm:aspect-video">
                <video ref={scannerVideoRef} className="h-full w-full object-cover" muted playsInline />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="h-44 w-[82%] rounded-2xl border-2 border-emerald-400 shadow-[0_0_0_999px_rgba(2,6,23,0.45)] sm:h-40 sm:w-80" />
                </div>
              </div>

              {scannerError ? (
                <div className="mt-3 rounded-2xl border border-rose-500/40 bg-rose-950/70 px-4 py-3 text-sm font-bold text-rose-100">
                  {scannerError}
                </div>
              ) : (
                <div className="mt-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/50 px-4 py-3 text-sm font-bold text-emerald-100">
                  Point the camera at the barcode. It will verify and close automatically after a correct scan.
                </div>
              )}

              {scannerPreview && (
                <div dir="ltr" className="mt-3 rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 font-mono text-xs font-bold text-slate-300">
                  Scanned: {scannerPreview.extracted || scannerPreview.raw || '-'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InvoiceModal({ order, onClose }: { order: PickupOrder; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">Invoice</div>
            <h2 className="text-2xl font-black text-slate-950">Order #{formatText(order.order_no)}</h2>
            <div className="mt-1 text-sm font-bold text-slate-500">{formatText(order.customer_name)}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
            aria-label="Close invoice"
          >
            <X size={20} />
          </button>
        </div>
        <div className="max-h-[72vh] overflow-auto p-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Phone" value={formatText(order.customer_phone)} ltr />
            <Field label="Status" value={formatText(order.order_status)} />
            <Field label="Total" value={formatMoney(order.price)} ltr />
            <Field label="Balance" value={formatMoney(order.balance)} ltr />
          </div>
          <ItemsTable items={order.line_items} />
          {order.details_error && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
              POS details warning: {order.details_error}
            </div>
          )}
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 whitespace-pre-wrap">
            Remark: {formatText(order.remark)}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderCard({
  order,
  onOpenInvoice,
  onPick,
}: {
  order: PickupOrder;
  onOpenInvoice: (order: PickupOrder) => void;
  onPick: (target: PickTarget) => void;
}) {
  const parsedRemark = useMemo(() => parseRemark(order.remark), [order.remark]);
  const groups = useMemo(() => splitItems(order.line_items, parsedRemark), [order.line_items, parsedRemark]);
  const visibleGroups = (Object.keys(groups) as PickupCategory[]).filter((category) => groups[category].length > 0);
  const delivered = isDelivered(order.order_status);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 dir="ltr" className="text-2xl font-black text-slate-950">#{formatText(order.order_no)}</h2>
            <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${statusBadgeClass(order.order_status)}`}>
              {formatText(order.order_status)}
            </span>
          </div>
          <div className="mt-1 text-sm font-bold text-slate-500">{formatText(order.customer_name)}</div>
        </div>
        <button
          type="button"
          onClick={() => onOpenInvoice(order)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50"
        >
          <FileText size={16} />
          Open Invoice
        </button>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <Field label="Phone" value={formatText(order.customer_phone)} ltr />
        <Field label="Order Date" value={formatDateTime(order.order_date)} />
        <Field label="Delivery" value={formatDateTime(order.delivery_date, order.delivery_time)} />
        <Field label="Balance" value={formatMoney(order.balance)} ltr />
      </div>

      {delivered ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-800">
          This order was delivered on: {formatDateTime(order.delivery_date, order.delivery_time)}
        </div>
      ) : (
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {visibleGroups.map((category) => {
            const Icon = categoryIcons[category];
            return (
              <div key={category} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                      <Icon size={17} className="text-blue-700" />
                      <span className="truncate">{categoryLabels[category]}</span>
                    </div>
                    <div className="mt-1 text-xs font-bold text-slate-500">
                      {groups[category].reduce((sum, item) => sum + Number(item.qty || 0), 0)} pcs · {groups[category].length} lines
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onPick({ order, category, requiredCategories: visibleGroups })}
                    className="shrink-0 rounded-xl bg-slate-900 px-3 py-2 text-xs font-black text-white hover:bg-slate-700"
                  >
                    Pick
                  </button>
                </div>
              </div>
            );
          })}
          {visibleGroups.length === 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800 lg:col-span-3">
              Invoice items are not available. Open the invoice to review POS details.
            </div>
          )}
        </div>
      )}

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 whitespace-pre-wrap">
        Remark: {formatText(order.remark)}
      </div>
    </article>
  );
}

export default function PickupSearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<PickupSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mobileKeypadHidden, setMobileKeypadHidden] = useState(false);
  const [pickTarget, setPickTarget] = useState<PickTarget | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<PickupOrder | null>(null);

  const summary = useMemo(() => {
    const orders = data?.orders ?? [];
    return {
      total: orders.length,
      active: orders.filter((order) => !isDelivered(order.order_status)).length,
      delivered: orders.filter((order) => isDelivered(order.order_status)).length,
    };
  }, [data]);

  const hasSubmitted = Boolean(data || error || loading);

  const addKey = (key: string) => {
    setSearchQuery((prev) => `${prev}${key}`);
    setError(null);
  };

  const selectBranch = (branchKey: string) => {
    setSearchQuery((prev) => {
      const normalized = prev.trim().toUpperCase().replace(/^[AMZR]/, '');
      return `${branchKey}${normalized}`;
    });
    setError(null);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setData(null);
    setError(null);
    setMobileKeypadHidden(false);
  };

  const runSearch = async () => {
    const query = searchQuery.trim();
    if (!query) {
      setError('Enter a phone number or order number first.');
      setMobileKeypadHidden(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setData(null);
      const response = await axios.get<PickupSearchResponse>('/api/pickup-search/phone', {
        params: { q: query, limit: 30 },
      });
      setData(response.data);
      setMobileKeypadHidden(true);
    } catch (err: any) {
      setError(getEnglishApiError(err, 'Failed to search for pickup orders.'));
      setMobileKeypadHidden(query.replace(/\D+/g, '').length >= 5);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-slate-100 p-4 sm:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl content-center gap-5 pb-20 pt-12 sm:min-h-0 sm:content-start sm:pb-0 sm:pt-0 lg:grid-cols-[minmax(320px,0.42fr)_minmax(0,1fr)]">
        <section className={`${mobileKeypadHidden ? 'hidden lg:block' : ''} rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.25em] text-blue-600">Pickup Finder</div>
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
              value={searchQuery}
              dir="ltr"
              inputMode="text"
              autoCapitalize="characters"
              onChange={(event) => setSearchQuery(event.target.value.toUpperCase())}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void runSearch();
              }}
              placeholder="PHONE / ORDER"
              className="w-full border-0 bg-transparent text-center font-mono text-3xl font-black tracking-[0.12em] text-slate-950 outline-none placeholder:tracking-normal"
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

          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {BRANCH_KEYS.map((branch) => (
              <button
                key={branch.key}
                type="button"
                onClick={() => selectBranch(branch.key)}
                aria-label={`${branch.label} branch (${branch.key})`}
                className={`flex min-h-16 items-center justify-center gap-2 rounded-2xl border px-2 shadow-sm transition active:scale-95 sm:flex-col sm:gap-0.5 ${branch.className}`}
              >
                <span className="text-2xl font-black leading-none">{branch.key}</span>
                <span className="text-[10px] font-black uppercase tracking-wide">{branch.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSearchQuery((prev) => prev.slice(0, -1))}
              className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white text-sm font-black text-slate-700"
            >
              <RotateCcw size={17} />
              Delete
            </button>
            <button
              type="button"
              onClick={() => void runSearch()}
              disabled={loading}
              className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-blue-700 text-sm font-black text-white disabled:opacity-60"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              Search
            </button>
          </div>

          {error && !mobileKeypadHidden && (
            <div className="mt-3 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </section>

        <section className={`${!hasSubmitted ? 'hidden lg:block' : ''} min-h-[520px] rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6`}>
          {!hasSubmitted ? (
            <div className="flex h-full min-h-[480px] flex-col items-center justify-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
                <Phone size={38} />
              </div>
              <div className="mt-4 text-2xl font-black text-slate-900">Enter a phone number or order number</div>
              <div className="mt-2 text-sm font-bold text-slate-500">
                Matching orders will appear with Pick buttons for each item category.
              </div>
            </div>
          ) : loading ? (
            <div className="flex h-full min-h-[480px] items-center justify-center gap-3 text-lg font-black text-slate-700">
              <Loader2 className="animate-spin text-blue-700" />
              Searching pickup orders...
            </div>
          ) : error && !data ? (
            <div className="flex h-full min-h-[480px] flex-col items-center justify-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 text-rose-600">
                <AlertCircle size={38} />
              </div>
              <div className="mt-4 text-2xl font-black text-slate-900">Search Failed</div>
              <div className="mt-2 max-w-lg text-sm font-bold text-rose-700">{error}</div>
              <button
                type="button"
                onClick={clearSearch}
                className="mt-5 flex min-h-12 min-w-44 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-black text-white lg:hidden"
              >
                New Search
              </button>
            </div>
          ) : data && data.orders.length === 0 ? (
            <div className="flex h-full min-h-[480px] flex-col items-center justify-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
                <Package size={38} />
              </div>
              <div className="mt-4 text-2xl font-black text-slate-900">No Matching Orders</div>
              <div className="mt-2 max-w-xl text-sm font-bold text-slate-500">
                The system responded, but no orders with the required statuses matched this search.
              </div>
              {(data.attempts ?? []).length > 0 && (
                <div className="mt-4 w-full max-w-2xl rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left">
                  <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500">POS Search Attempts</div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {data.attempts!.map((attempt) => (
                      <div key={attempt.query} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                        <div dir="ltr" className="text-xs font-black text-slate-900">{attempt.query}</div>
                        <div className="mt-1 text-[11px] font-bold text-slate-500">
                          parsed {attempt.parsed_orders} / filtered {attempt.records_filtered}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={clearSearch}
                className="mt-5 flex min-h-12 min-w-44 items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-black text-white lg:hidden"
              >
                New Search
              </button>
            </div>
          ) : data ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <div className="text-2xl font-black text-slate-950">{summary.total}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total</div>
                </div>
                <div className="rounded-2xl border border-blue-200 bg-blue-50 px-3 py-3">
                  <div className="text-2xl font-black text-blue-800">{summary.active}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-blue-500">Pick</div>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-3">
                  <div className="text-2xl font-black text-emerald-800">{summary.delivered}</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Delivered</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <div className="inline-flex items-center gap-2 text-sm font-black text-slate-700">
                  <CheckCircle2 size={18} className="text-blue-700" />
                  {data.mode === 'order' ? 'Order search' : `${data.orders.length} orders found`}
                </div>
                <button
                  type="button"
                  onClick={clearSearch}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-black text-slate-700 lg:hidden"
                >
                  New Search
                </button>
              </div>

              {data.orders.map((order) => (
                <OrderCard
                  key={`${order.source_orders_id}-${order.source_invoice_id}-${order.order_no}`}
                  order={order}
                  onOpenInvoice={setInvoiceOrder}
                  onPick={setPickTarget}
                />
              ))}
            </div>
          ) : null}
        </section>
      </div>

      {pickTarget && (
        <PickModal
          target={pickTarget}
          onClose={() => setPickTarget(null)}
          onNextPick={(category) => setPickTarget((current) => (current ? { ...current, category } : current))}
          onDelivered={(orderNo, remainingBalance) => {
            setData((current) =>
              current
                ? {
                    ...current,
                    orders: current.orders.map((order) =>
                      order.order_no === orderNo
                        ? { ...order, order_status: 'Delivered', balance: remainingBalance }
                        : order
                    ),
                  }
                : current
            );
          }}
        />
      )}
      {invoiceOrder && <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />}
    </div>
  );
}
