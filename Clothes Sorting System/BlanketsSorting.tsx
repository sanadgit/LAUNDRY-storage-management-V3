/**
 * صفحة فرز وتعبئة البطانيات - Blankets Sorting & Packing
 * Design: Clean Professional Blue (نفس النسق)
 * - لوحة بحث وإدخال على اليسار
 * - عرض تفاصيل البطانية وحالة التعبئة على اليمين
 * - خطوط Cairo + Nunito + JetBrains Mono
 */

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  Search,
  Printer,
  Package,
  Layers,
  CheckCircle2,
  Clock,
  ChevronLeft,
  Shirt,
  Tag,
  BarChart3,
  X,
  Delete,
  Box,
  Zap,
  AlertCircle,
  Plus,
  Minus,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface BlanketItem {
  id: string;
  type: string;
  size: string;
  color: string;
  weight: string;
  quantity: number;
}

interface BlanketOrder {
  orderId: string;
  batchId: string;
  status: "pending" | "packing" | "completed";
  items: BlanketItem[];
  totalBlankets: number;
  totalWeight: number;
  packedCount: number;
  date: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_BLANKET_ORDERS: Record<string, BlanketOrder> = {
  "B1001": {
    orderId: "B1001",
    batchId: "BATCH-2026-001",
    status: "packing",
    date: "2026-05-16",
    items: [
      { id: "1", type: "بطانية قطن", size: "فردي", color: "أبيض", weight: "800g", quantity: 50 },
      { id: "2", type: "بطانية صوف", size: "مزدوج", color: "أحمر", weight: "1.2kg", quantity: 30 },
      { id: "3", type: "بطانية حرير", size: "فردي", color: "أزرق", weight: "600g", quantity: 40 },
    ],
    totalBlankets: 120,
    totalWeight: 98.4,
    packedCount: 45,
  },
  "B2002": {
    orderId: "B2002",
    batchId: "BATCH-2026-002",
    status: "pending",
    date: "2026-05-16",
    items: [
      { id: "1", type: "بطانية قطن", size: "مزدوج", color: "بيج", weight: "1kg", quantity: 25 },
      { id: "2", type: "بطانية صوف", size: "فردي", color: "رمادي", weight: "900g", quantity: 35 },
    ],
    totalBlankets: 60,
    totalWeight: 43.5,
    packedCount: 0,
  },
  "B3003": {
    orderId: "B3003",
    batchId: "BATCH-2026-003",
    status: "completed",
    date: "2026-05-15",
    items: [
      { id: "1", type: "بطانية قطن", size: "فردي", color: "أخضر", weight: "800g", quantity: 60 },
      { id: "2", type: "بطانية حرير", size: "مزدوج", color: "أرجواني", weight: "700g", quantity: 40 },
      { id: "3", type: "بطانية صوف", size: "فردي", color: "أسود", weight: "850g", quantity: 50 },
    ],
    totalBlankets: 150,
    totalWeight: 127.5,
    packedCount: 150,
  },
  "B4004": {
    orderId: "B4004",
    batchId: "BATCH-2026-004",
    status: "packing",
    date: "2026-05-16",
    items: [
      { id: "1", type: "بطانية قطن", size: "مزدوج", color: "أبيض", weight: "1kg", quantity: 80 },
    ],
    totalBlankets: 80,
    totalWeight: 80,
    packedCount: 55,
  },
  "B5005": {
    orderId: "B5005",
    batchId: "BATCH-2026-005",
    status: "pending",
    date: "2026-05-16",
    items: [
      { id: "1", type: "بطانية صوف", size: "مزدوج", color: "كحلي", weight: "1.3kg", quantity: 45 },
      { id: "2", type: "بطانية حرير", size: "فردي", color: "ذهبي", weight: "650g", quantity: 55 },
    ],
    totalBlankets: 100,
    totalWeight: 94.5,
    packedCount: 0,
  },
};

// ─── Keyboard Layout ──────────────────────────────────────────────────────────
const KEYBOARD_ROWS = [
  ["B", "1", "2", "3", "4"],
  ["5", "6", "7", "8", "9"],
  ["0", "A", "C", "D", "E"],
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: BlanketOrder["status"] }) {
  const config = {
    pending: { label: "في الانتظار", icon: Clock, cls: "bg-amber-50 text-amber-700 border border-amber-200" },
    packing: { label: "جاري التعبئة", icon: Zap, cls: "status-processing" },
    completed: { label: "مكتمل", icon: CheckCircle2, cls: "status-done" },
  }[status];
  const Icon = config.icon;
  return (
    <span className={`status-badge ${config.cls}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
}

function EmptyBlanketPanel() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
      <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center">
        <Box size={36} className="text-blue-300" />
      </div>
      <div>
        <p className="text-lg font-bold text-slate-400" style={{ fontFamily: "Cairo, sans-serif" }}>
          لا يوجد دفعة محددة
        </p>
        <p className="text-sm text-slate-300 mt-1" style={{ fontFamily: "Cairo, sans-serif" }}>
          ابحث برقم الدفعة لعرض التفاصيل
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BlanketsSorting() {
  const [, setLocation] = useLocation();
  const [searchValue, setSearchValue] = useState("");
  const [currentOrder, setCurrentOrder] = useState<BlanketOrder | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [packedCount, setPackedCount] = useState(0);
  const [isPrinting, setIsPrinting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handleKeyPress = useCallback((key: string) => {
    setPressedKey(key);
    setTimeout(() => setPressedKey(null), 150);
    setSearchValue((prev) => prev + key);
    setNotFound(false);
  }, []);

  const handleDelete = useCallback(() => {
    setPressedKey("DEL");
    setTimeout(() => setPressedKey(null), 150);
    setSearchValue((prev) => prev.slice(0, -1));
    setNotFound(false);
  }, []);

  const handleClear = useCallback(() => {
    setSearchValue("");
    setCurrentOrder(null);
    setNotFound(false);
    setPackedCount(0);
  }, []);

  const handleSearch = useCallback(() => {
    const val = searchValue.trim().toUpperCase();
    if (!val) return;
    const order = MOCK_BLANKET_ORDERS[val];
    if (order) {
      setCurrentOrder(order);
      setPackedCount(order.packedCount);
      setNotFound(false);
    } else {
      setCurrentOrder(null);
      setNotFound(true);
    }
  }, [searchValue]);

  const handleIncrementPacked = useCallback(() => {
    if (currentOrder && packedCount < currentOrder.totalBlankets) {
      setPackedCount((prev) => prev + 1);
    }
  }, [currentOrder, packedCount]);

  const handleDecrementPacked = useCallback(() => {
    if (packedCount > 0) {
      setPackedCount((prev) => prev - 1);
    }
  }, [packedCount]);

  const handlePrint = useCallback(() => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 300);
  }, []);

  const packingProgress = currentOrder ? (packedCount / currentOrder.totalBlankets) * 100 : 0;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "linear-gradient(145deg, oklch(0.96 0.008 240) 0%, oklch(0.98 0.004 255) 100%)",
        fontFamily: "Cairo, sans-serif",
        direction: "rtl",
      }}
    >
      {/* ── Header ── */}
      <header
        className="flex items-center justify-between px-6 py-3 shadow-sm"
        style={{
          background: "linear-gradient(135deg, oklch(0.22 0.06 255) 0%, oklch(0.28 0.08 255) 100%)",
          borderBottom: "1px solid oklch(0.35 0.06 255)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "oklch(0.55 0.18 255 / 0.3)" }}
          >
            <Box size={22} className="text-blue-300" />
          </div>
          <div>
            <h1
              className="text-white font-extrabold text-lg leading-tight"
              style={{ fontFamily: "Cairo, sans-serif" }}
            >
              نظام فرز وتعبئة البطانيات
            </h1>
            <p className="text-blue-300 text-xs font-medium">Blankets Sorting & Packing</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-blue-200 text-sm">
            <BarChart3 size={16} />
            <span style={{ fontFamily: "Nunito, sans-serif" }}>
              {Object.keys(MOCK_BLANKET_ORDERS).length} دفعات نشطة
            </span>
          </div>
          <button
            onClick={() => setLocation("/")}
            className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
            style={{
              background: "oklch(0.3 0.1 255)",
              color: "oklch(0.85 0.01 255)",
              border: "1px solid oklch(0.4 0.1 255)",
              fontFamily: "Cairo, sans-serif",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.35 0.12 255)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.3 0.1 255)";
            }}
          >
            <span className="flex items-center gap-2">
              <Shirt size={14} />
              الملابس
            </span>
          </button>
          <button
            onClick={() => setLocation("/ironing")}
            className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
            style={{
              background: "oklch(0.3 0.1 255)",
              color: "oklch(0.85 0.01 255)",
              border: "1px solid oklch(0.4 0.1 255)",
              fontFamily: "Cairo, sans-serif",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.35 0.12 255)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.3 0.1 255)";
            }}
          >
            <span className="flex items-center gap-2">
              <Zap size={14} />
              الكي
            </span>
          </button>
          <div
            className="px-3 py-1.5 rounded-lg text-xs font-bold"
            style={{
              background: "oklch(0.62 0.18 145 / 0.2)",
              color: "oklch(0.75 0.18 145)",
              border: "1px solid oklch(0.62 0.18 145 / 0.3)",
              fontFamily: "Nunito, sans-serif",
            }}
          >
            ● متصل
          </div>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <main className="flex-1 flex gap-4 p-4" style={{ minHeight: 0 }}>

        {/* ══════════════════════════════════════════
            LEFT PANEL — Search + Keyboard
        ══════════════════════════════════════════ */}
        <motion.div
          className="flex flex-col gap-4 animate-slide-in-left"
          style={{ width: "44%", minWidth: 340 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Search Box */}
          <div
            className="rounded-2xl p-5 shadow-lg"
            style={{
              background: "white",
              border: "1px solid oklch(0.88 0.01 240)",
              boxShadow: "0 4px 24px oklch(0.22 0.06 255 / 0.08)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Search size={18} style={{ color: "oklch(0.42 0.18 255)" }} />
              <span
                className="font-bold text-slate-600 text-sm"
                style={{ fontFamily: "Cairo, sans-serif" }}
              >
                البحث برقم الدفعة
              </span>
            </div>

            {/* Search Input Display */}
            <div
              className="relative rounded-xl overflow-hidden mb-3"
              style={{
                background: "oklch(0.96 0.008 240)",
                border: `2px solid ${searchValue ? "oklch(0.42 0.18 255)" : "oklch(0.88 0.01 240)"}`,
                transition: "border-color 0.2s ease",
                boxShadow: searchValue ? "0 0 0 4px oklch(0.55 0.18 255 / 0.1)" : "none",
              }}
            >
              <div className="flex items-center px-4 py-3 gap-3">
                <Tag size={18} style={{ color: "oklch(0.55 0.18 255)" }} />
                <span
                  className="flex-1 text-2xl font-black tracking-widest"
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    color: searchValue ? "oklch(0.22 0.06 255)" : "oklch(0.75 0.02 255)",
                    minHeight: "2rem",
                    letterSpacing: "0.2em",
                  }}
                >
                  {searchValue || "_ _ _ _ _"}
                </span>
                {searchValue && (
                  <button
                    onClick={handleClear}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                    style={{
                      background: "oklch(0.88 0.01 240)",
                      color: "oklch(0.52 0.02 255)",
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="w-full py-3 rounded-xl font-bold text-white text-base transition-all"
              style={{
                background: "linear-gradient(135deg, oklch(0.42 0.18 255), oklch(0.5 0.2 255))",
                boxShadow: "0 4px 15px oklch(0.42 0.18 255 / 0.35)",
                fontFamily: "Cairo, sans-serif",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 6px 20px oklch(0.42 0.18 255 / 0.45)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 4px 15px oklch(0.42 0.18 255 / 0.35)";
              }}
            >
              <span className="flex items-center justify-center gap-2">
                <Search size={18} />
                بحث
              </span>
            </button>

            {/* Not Found Message */}
            <AnimatePresence>
              {notFound && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mt-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-center"
                  style={{
                    background: "oklch(0.6 0.22 25 / 0.08)",
                    color: "oklch(0.5 0.22 25)",
                    border: "1px solid oklch(0.6 0.22 25 / 0.2)",
                    fontFamily: "Cairo, sans-serif",
                  }}
                >
                  لم يتم العثور على الدفعة "{searchValue}"
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Keyboard Panel */}
          <div
            className="flex-1 rounded-2xl p-5 shadow-lg"
            style={{
              background: "linear-gradient(145deg, oklch(0.2 0.05 255) 0%, oklch(0.25 0.07 255) 100%)",
              border: "1px solid oklch(0.3 0.06 255)",
              boxShadow: "0 8px 32px oklch(0.15 0.05 255 / 0.4)",
            }}
          >
            {/* Keyboard Header - Branded */}
            <div className="mb-5 pb-4 border-b" style={{ borderColor: "oklch(0.3 0.06 255)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3
                    className="text-white font-black text-sm mb-1"
                    style={{ fontFamily: "Cairo, sans-serif" }}
                  >
                    Clothes Sorting System
                  </h3>
                  <p
                    className="text-blue-300 text-xs"
                    style={{ fontFamily: "Cairo, sans-serif" }}
                  >
                    نظام فرز الملابس
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400 opacity-60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 opacity-60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400 opacity-60" />
                </div>
              </div>
            </div>

            {/* Keys */}
            <div className="flex flex-col gap-3">
              {KEYBOARD_ROWS.map((row, rowIdx) => (
                <div key={rowIdx} className="flex gap-3 justify-center">
                  {row.map((key) => (
                    <motion.button
                      key={key}
                      className="key-btn flex-1 h-16 flex items-center justify-center"
                      style={{
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: "1.5rem",
                        background: pressedKey === key
                          ? "oklch(0.42 0.18 255)"
                          : undefined,
                      }}
                      onClick={() => handleKeyPress(key)}
                      whileTap={{ scale: 0.93, y: 3 }}
                    >
                      {key}
                    </motion.button>
                  ))}
                </div>
              ))}

              {/* Bottom row: Clear + Delete + Enter */}
              <div className="flex gap-3 mt-1">
                <motion.button
                  className="key-btn key-btn-delete flex-1 h-14 flex items-center justify-center gap-2 text-base"
                  onClick={handleDelete}
                  whileTap={{ scale: 0.93, y: 3 }}
                  style={{ fontFamily: "Cairo, sans-serif", fontSize: "0.9rem" }}
                >
                  <Delete size={18} />
                  حذف
                </motion.button>

                <motion.button
                  className="key-btn key-btn-special flex-1 h-14 flex items-center justify-center gap-2 text-base"
                  onClick={handleClear}
                  whileTap={{ scale: 0.93, y: 3 }}
                  style={{ fontFamily: "Cairo, sans-serif", fontSize: "0.9rem" }}
                >
                  <X size={18} />
                  مسح
                </motion.button>

                <motion.button
                  className="key-btn key-btn-enter flex-1 h-14 flex items-center justify-center gap-2 text-base"
                  onClick={handleSearch}
                  whileTap={{ scale: 0.93, y: 3 }}
                  style={{ fontFamily: "Cairo, sans-serif", fontSize: "0.9rem" }}
                >
                  <ChevronLeft size={18} />
                  بحث
                </motion.button>
              </div>
            </div>

            {/* Quick Access Hint */}
            <div
              className="mt-4 pt-3 flex items-center justify-center gap-2"
              style={{ borderTop: "1px solid oklch(0.3 0.06 255 / 0.5)" }}
            >
              <span className="text-blue-400 text-xs" style={{ fontFamily: "Cairo, sans-serif" }}>
                أمثلة: B1001 · B2002 · B3003 · B4004 · B5005
              </span>
            </div>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════
            RIGHT PANEL — Order Details
        ══════════════════════════════════════════ */}
        <motion.div
          className="flex-1 rounded-2xl shadow-lg overflow-hidden"
          style={{
            background: "white",
            border: "1px solid oklch(0.88 0.01 240)",
            boxShadow: "0 4px 24px oklch(0.22 0.06 255 / 0.08)",
          }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1], delay: 0.05 }}
        >
          <AnimatePresence mode="wait">
            {currentOrder ? (
              <motion.div
                key={currentOrder.orderId}
                className="flex flex-col h-full"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              >
                {/* Order Header */}
                <div
                  className="px-6 py-5"
                  style={{
                    background: "linear-gradient(135deg, oklch(0.22 0.06 255) 0%, oklch(0.3 0.1 255) 100%)",
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Box size={18} className="text-blue-300" />
                        <span
                          className="text-blue-200 text-sm font-medium"
                          style={{ fontFamily: "Cairo, sans-serif" }}
                        >
                          تفاصيل الدفعة
                        </span>
                      </div>
                      <h2
                        className="text-white font-black text-3xl tracking-wider"
                        style={{ fontFamily: "JetBrains Mono, monospace" }}
                      >
                        #{currentOrder.orderId}
                      </h2>
                    </div>
                    <StatusBadge status={currentOrder.status} />
                  </div>
                </div>

                {/* Order Meta */}
                <div
                  className="grid grid-cols-2 gap-0"
                  style={{ borderBottom: "1px solid oklch(0.92 0.005 240)" }}
                >
                  <div
                    className="px-6 py-4 flex items-center gap-3"
                    style={{ borderLeft: "1px solid oklch(0.92 0.005 240)" }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: "oklch(0.42 0.18 255 / 0.1)" }}
                    >
                      <Tag size={18} style={{ color: "oklch(0.42 0.18 255)" }} />
                    </div>
                    <div>
                      <p
                        className="text-xs font-semibold text-slate-400 mb-0.5"
                        style={{ fontFamily: "Cairo, sans-serif" }}
                      >
                        رقم الدفعة
                      </p>
                      <p
                        className="font-black text-lg text-slate-800"
                        style={{ fontFamily: "JetBrains Mono, monospace" }}
                      >
                        {currentOrder.batchId}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 py-4 flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: "oklch(0.7 0.18 45 / 0.1)" }}
                    >
                      <Package size={18} style={{ color: "oklch(0.6 0.18 45)" }} />
                    </div>
                    <div>
                      <p
                        className="text-xs font-semibold text-slate-400 mb-0.5"
                        style={{ fontFamily: "Cairo, sans-serif" }}
                      >
                        الوزن الإجمالي
                      </p>
                      <p
                        className="font-black text-lg text-slate-800"
                        style={{ fontFamily: "JetBrains Mono, monospace" }}
                      >
                        {currentOrder.totalWeight} كغ
                      </p>
                    </div>
                  </div>
                </div>

                {/* Summary Stats */}
                <div
                  className="grid grid-cols-3 gap-0"
                  style={{ borderBottom: "1px solid oklch(0.92 0.005 240)" }}
                >
                  {[
                    {
                      label: "إجمالي البطانيات",
                      value: currentOrder.totalBlankets,
                      icon: Box,
                      color: "oklch(0.42 0.18 255)",
                      bg: "oklch(0.42 0.18 255 / 0.08)",
                    },
                    {
                      label: "المعبأة",
                      value: packedCount,
                      icon: CheckCircle2,
                      color: "oklch(0.62 0.18 145)",
                      bg: "oklch(0.62 0.18 145 / 0.08)",
                    },
                    {
                      label: "المتبقية",
                      value: currentOrder.totalBlankets - packedCount,
                      icon: AlertCircle,
                      color: "oklch(0.6 0.22 25)",
                      bg: "oklch(0.6 0.22 25 / 0.08)",
                    },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="px-4 py-4 flex flex-col items-center gap-1.5"
                      style={{
                        borderLeft: i < 2 ? "1px solid oklch(0.92 0.005 240)" : "none",
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: stat.bg }}
                      >
                        <stat.icon size={17} style={{ color: stat.color }} />
                      </div>
                      <span
                        className="text-2xl font-black"
                        style={{ color: stat.color, fontFamily: "JetBrains Mono, monospace" }}
                      >
                        {stat.value}
                      </span>
                      <span
                        className="text-xs font-semibold text-slate-400"
                        style={{ fontFamily: "Cairo, sans-serif" }}
                      >
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Packing Progress */}
                <div className="px-6 py-4" style={{ borderBottom: "1px solid oklch(0.92 0.005 240)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-sm font-bold text-slate-600"
                      style={{ fontFamily: "Cairo, sans-serif" }}
                    >
                      تقدم التعبئة
                    </span>
                    <span
                      className="text-sm font-black"
                      style={{
                        color: "oklch(0.42 0.18 255)",
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >
                      {Math.round(packingProgress)}%
                    </span>
                  </div>
                  <div
                    className="w-full h-3 rounded-full overflow-hidden"
                    style={{ background: "oklch(0.92 0.005 240)" }}
                  >
                    <motion.div
                      className="h-full"
                      style={{
                        background: "linear-gradient(90deg, oklch(0.42 0.18 255), oklch(0.62 0.18 145))",
                        width: `${packingProgress}%`,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${packingProgress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Packing Controls */}
                <div className="px-6 py-4" style={{ borderBottom: "1px solid oklch(0.92 0.005 240)" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Zap size={16} style={{ color: "oklch(0.42 0.18 255)" }} />
                    <span
                      className="text-sm font-bold text-slate-600"
                      style={{ fontFamily: "Cairo, sans-serif" }}
                    >
                      تحديث عدد المعبأة
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <motion.button
                      className="flex-1 py-3 rounded-xl font-bold text-white text-base transition-all"
                      style={{
                        background: "linear-gradient(135deg, oklch(0.6 0.22 25), oklch(0.65 0.24 20))",
                        boxShadow: "0 4px 12px oklch(0.6 0.22 25 / 0.3)",
                      }}
                      onClick={handleDecrementPacked}
                      disabled={packedCount === 0}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Minus size={20} />
                    </motion.button>
                    <div
                      className="flex-1 py-3 rounded-xl font-black text-2xl flex items-center justify-center"
                      style={{
                        background: "oklch(0.95 0.01 255)",
                        color: "oklch(0.42 0.18 255)",
                        border: "2px solid oklch(0.88 0.01 240)",
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >
                      {packedCount}
                    </div>
                    <motion.button
                      className="flex-1 py-3 rounded-xl font-bold text-white text-base transition-all"
                      style={{
                        background: "linear-gradient(135deg, oklch(0.62 0.18 145), oklch(0.68 0.2 140))",
                        boxShadow: "0 4px 12px oklch(0.62 0.18 145 / 0.3)",
                      }}
                      onClick={handleIncrementPacked}
                      disabled={packedCount === currentOrder.totalBlankets}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Plus size={20} />
                    </motion.button>
                  </div>
                </div>

                {/* Items Table */}
                <div className="flex-1 overflow-auto px-6 py-4" ref={printRef}>
                  <div className="flex items-center gap-2 mb-3">
                    <Shirt size={16} style={{ color: "oklch(0.42 0.18 255)" }} />
                    <span
                      className="text-sm font-bold text-slate-600"
                      style={{ fontFamily: "Cairo, sans-serif" }}
                    >
                      تفاصيل البطانيات
                    </span>
                  </div>

                  <div className="rounded-xl overflow-hidden" style={{ border: "1px solid oklch(0.9 0.008 240)" }}>
                    {/* Table Header */}
                    <div
                      className="grid grid-cols-5 px-4 py-2.5"
                      style={{
                        background: "oklch(0.95 0.01 255)",
                        borderBottom: "1px solid oklch(0.9 0.008 240)",
                      }}
                    >
                      {["النوع", "الحجم", "اللون", "الوزن", "الكمية"].map((h) => (
                        <span
                          key={h}
                          className="text-xs font-bold text-slate-500 text-center"
                          style={{ fontFamily: "Cairo, sans-serif" }}
                        >
                          {h}
                        </span>
                      ))}
                    </div>

                    {/* Table Rows */}
                    {currentOrder.items.map((item, idx) => (
                      <motion.div
                        key={item.id}
                        className="grid grid-cols-5 px-4 py-3 items-center"
                        style={{
                          background: idx % 2 === 0 ? "white" : "oklch(0.98 0.003 240)",
                          borderBottom:
                            idx < currentOrder.items.length - 1
                              ? "1px solid oklch(0.93 0.005 240)"
                              : "none",
                        }}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.06, duration: 0.2 }}
                      >
                        <span
                          className="text-sm font-bold text-slate-700 text-center"
                          style={{ fontFamily: "Cairo, sans-serif" }}
                        >
                          {item.type}
                        </span>
                        <span
                          className="text-center text-sm font-semibold"
                          style={{
                            color: "oklch(0.55 0.02 255)",
                            fontFamily: "Nunito, sans-serif",
                          }}
                        >
                          {item.size}
                        </span>
                        <div className="flex justify-center">
                          <span
                            className="px-2.5 py-1 rounded-full text-xs font-bold"
                            style={{
                              background: "oklch(0.6 0.18 45 / 0.1)",
                              color: "oklch(0.5 0.18 45)",
                              border: "1px solid oklch(0.6 0.18 45 / 0.2)",
                              fontFamily: "Cairo, sans-serif",
                            }}
                          >
                            {item.color}
                          </span>
                        </div>
                        <span
                          className="text-center text-sm font-semibold"
                          style={{
                            color: "oklch(0.55 0.02 255)",
                            fontFamily: "Nunito, sans-serif",
                          }}
                        >
                          {item.weight}
                        </span>
                        <span
                          className="text-center font-black text-lg"
                          style={{
                            color: "oklch(0.42 0.18 255)",
                            fontFamily: "JetBrains Mono, monospace",
                          }}
                        >
                          {item.quantity}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Print Button */}
                <div
                  className="px-6 py-4"
                  style={{ borderTop: "1px solid oklch(0.92 0.005 240)" }}
                >
                  <motion.button
                    className="print-btn w-full py-4 flex items-center justify-center gap-3 text-lg font-black"
                    onClick={handlePrint}
                    disabled={isPrinting}
                    whileTap={{ scale: 0.97 }}
                    style={{ fontFamily: "Cairo, sans-serif" }}
                  >
                    <Printer size={22} />
                    {isPrinting ? "جاري الطباعة..." : "طباعة الدفعة"}
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                className="h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <EmptyBlanketPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* ── Footer ── */}
      <footer
        className="px-6 py-2.5 flex items-center justify-between text-xs"
        style={{
          background: "oklch(0.96 0.008 240)",
          borderTop: "1px solid oklch(0.88 0.01 240)",
          color: "oklch(0.6 0.02 255)",
          fontFamily: "Cairo, sans-serif",
        }}
      >
        <span>نظام فرز وتعبئة البطانيات — الإصدار 1.0</span>
        <span style={{ fontFamily: "Nunito, sans-serif" }}>
          {new Date().toLocaleDateString("ar-SA", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      </footer>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          header, footer, .key-btn, button { display: none !important; }
        }
      `}</style>
    </div>
  );
}
