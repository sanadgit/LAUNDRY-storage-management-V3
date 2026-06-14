/**
 * صفحة كوي الملابس - Ironing Station
 * Design: Clean Professional Blue (نفس النسق)
 * - نظام إدخال رقم الاستيكر على اليسار
 * - عرض تفاصيل القطعة والكمية المتبقية على اليمين
 * - خطوط Cairo + Nunito + JetBrains Mono
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  Search,
  Printer,
  Package,
  Shirt,
  Tag,
  BarChart3,
  X,
  Delete,
  Zap,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronLeft,
  Flame,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface IroningItem {
  id: string;
  name: string;
  size: string;
  color: string;
  totalQuantity: number;
  ironedCount: number;
  priority: "normal" | "urgent";
}

interface IroningOrder {
  orderId: string;
  stickerNumber: string;
  status: "pending" | "in_progress" | "completed";
  item: IroningItem;
  date: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_IRONING_DATA: Record<string, IroningOrder> = {
  "STK-A1234-001": {
    orderId: "A1234",
    stickerNumber: "STK-A1234-001",
    status: "in_progress",
    date: "2026-05-16",
    item: {
      id: "1",
      name: "قميص رجالي",
      size: "XL",
      color: "أبيض",
      totalQuantity: 12,
      ironedCount: 7,
      priority: "normal",
    },
  },
  "STK-A1234-002": {
    orderId: "A1234",
    stickerNumber: "STK-A1234-002",
    status: "pending",
    date: "2026-05-16",
    item: {
      id: "2",
      name: "بنطلون جينز",
      size: "32",
      color: "أزرق",
      totalQuantity: 8,
      ironedCount: 0,
      priority: "normal",
    },
  },
  "STK-A1234-003": {
    orderId: "A1234",
    stickerNumber: "STK-A1234-003",
    status: "pending",
    date: "2026-05-16",
    item: {
      id: "3",
      name: "تيشيرت",
      size: "L",
      color: "أسود",
      totalQuantity: 20,
      ironedCount: 0,
      priority: "urgent",
    },
  },
  "STK-M5678-001": {
    orderId: "M5678",
    stickerNumber: "STK-M5678-001",
    status: "completed",
    date: "2026-05-15",
    item: {
      id: "1",
      name: "فستان نسائي",
      size: "M",
      color: "أحمر",
      totalQuantity: 15,
      ironedCount: 15,
      priority: "normal",
    },
  },
  "STK-R9012-001": {
    orderId: "R9012",
    stickerNumber: "STK-R9012-001",
    status: "in_progress",
    date: "2026-05-16",
    item: {
      id: "1",
      name: "جاكيت شتوي",
      size: "XXL",
      color: "رمادي",
      totalQuantity: 5,
      ironedCount: 2,
      priority: "urgent",
    },
  },
  "STK-W3456-001": {
    orderId: "W3456",
    stickerNumber: "STK-W3456-001",
    status: "pending",
    date: "2026-05-16",
    item: {
      id: "1",
      name: "عباءة",
      size: "فري",
      color: "أسود",
      totalQuantity: 7,
      ironedCount: 0,
      priority: "urgent",
    },
  },
  "STK-Z7890-001": {
    orderId: "Z7890",
    stickerNumber: "STK-Z7890-001",
    status: "completed",
    date: "2026-05-14",
    item: {
      id: "1",
      name: "بدلة رسمية",
      size: "52",
      color: "كحلي",
      totalQuantity: 3,
      ironedCount: 3,
      priority: "normal",
    },
  },
};

// ─── Keyboard Layout ──────────────────────────────────────────────────────────
const KEYBOARD_ROWS = [
  ["S", "T", "K", "-", "A"],
  ["1", "2", "3", "4", "5"],
  ["6", "7", "8", "9", "0"],
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status, priority }: { status: IroningOrder["status"]; priority: string }) {
  const config = {
    pending: { label: "في الانتظار", icon: Clock, cls: "bg-amber-50 text-amber-700 border border-amber-200" },
    in_progress: { label: "جاري الكي", icon: Flame, cls: "status-processing" },
    completed: { label: "مكتمل", icon: CheckCircle2, cls: "status-done" },
  }[status];

  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2">
      <span className={`status-badge ${config.cls}`}>
        <Icon size={12} />
        {config.label}
      </span>
      {priority === "urgent" && (
        <span
          className="status-badge flex items-center gap-1"
          style={{
            background: "oklch(0.6 0.22 25 / 0.12)",
            color: "oklch(0.5 0.22 25)",
            border: "1px solid oklch(0.6 0.22 25 / 0.2)",
          }}
        >
          <AlertTriangle size={12} />
          عاجل
        </span>
      )}
    </div>
  );
}

function EmptyIroningPanel() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
      <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center">
        <Flame size={36} className="text-blue-300" />
      </div>
      <div>
        <p className="text-lg font-bold text-slate-400" style={{ fontFamily: "Cairo, sans-serif" }}>
          لا توجد قطعة محددة
        </p>
        <p className="text-sm text-slate-300 mt-1" style={{ fontFamily: "Cairo, sans-serif" }}>
          ابحث برقم الاستيكر لعرض التفاصيل
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function IroningClothes() {
  const [, setLocation] = useLocation();
  const [searchValue, setSearchValue] = useState("");
  const [currentOrder, setCurrentOrder] = useState<IroningOrder | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [ironedCount, setIronedCount] = useState(0);
  const [lastScannedTime, setLastScannedTime] = useState<number | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Auto-focus على حقل الإدخال
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearch();
      } else if (e.key === "Backspace") {
        handleDelete();
      } else if (e.key === "Escape") {
        handleClear();
      } else if (/^[A-Z0-9\-]$/.test(e.key.toUpperCase())) {
        handleKeyPress(e.key.toUpperCase());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchValue]);

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
    setIronedCount(0);
  }, []);

  const handleSearch = useCallback(() => {
    const val = searchValue.trim().toUpperCase();
    if (!val) return;
    const order = MOCK_IRONING_DATA[val];
    if (order) {
      setCurrentOrder(order);
      setIronedCount(order.item.ironedCount);
      setNotFound(false);
      setLastScannedTime(Date.now());
      // تصفير الحقل بعد المسح الناجح
      setSearchValue("");
    } else {
      setCurrentOrder(null);
      setNotFound(true);
    }
  }, [searchValue]);

  const handleIncrementIroned = useCallback(() => {
    if (currentOrder && ironedCount < currentOrder.item.totalQuantity) {
      setIronedCount((prev) => prev + 1);
      setLastScannedTime(Date.now());
    }
  }, [currentOrder, ironedCount]);

  const handlePrint = useCallback(() => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 300);
  }, []);

  const ironingProgress = currentOrder ? (ironedCount / currentOrder.item.totalQuantity) * 100 : 0;
  const remainingCount = currentOrder ? currentOrder.item.totalQuantity - ironedCount : 0;

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
            <Flame size={22} className="text-blue-300" />
          </div>
          <div>
            <h1
              className="text-white font-extrabold text-lg leading-tight"
              style={{ fontFamily: "Cairo, sans-serif" }}
            >
              محطة كوي الملابس
            </h1>
            <p className="text-blue-300 text-xs font-medium">Ironing Station</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-blue-200 text-sm">
            <TrendingUp size={16} />
            <span style={{ fontFamily: "Nunito, sans-serif" }}>
              {Object.keys(MOCK_IRONING_DATA).length} قطع نشطة
            </span>
          </div>
          <div className="flex gap-2">
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
              onClick={() => setLocation("/blankets")}
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
                <Package size={14} />
                البطانيات
              </span>
            </button>
          </div>
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
            LEFT PANEL — Sticker Scanner
        ══════════════════════════════════════════ */}
        <motion.div
          className="flex flex-col gap-4 animate-slide-in-left"
          style={{ width: "44%", minWidth: 340 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
        >
          {/* Scanner Box */}
          <div
            className="rounded-2xl p-5 shadow-lg"
            style={{
              background: "white",
              border: "1px solid oklch(0.88 0.01 240)",
              boxShadow: "0 4px 24px oklch(0.22 0.06 255 / 0.08)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Tag size={18} style={{ color: "oklch(0.42 0.18 255)" }} />
              <span
                className="font-bold text-slate-600 text-sm"
                style={{ fontFamily: "Cairo, sans-serif" }}
              >
                ماسح الاستيكر
              </span>
            </div>

            {/* Sticker Input Display */}
            <div
              className="relative rounded-xl overflow-hidden mb-3"
              style={{
                background: "oklch(0.96 0.008 240)",
                border: `2px solid ${searchValue ? "oklch(0.42 0.18 255)" : "oklch(0.88 0.01 240)"}`,
                transition: "border-color 0.2s ease",
                boxShadow: searchValue ? "0 0 0 4px oklch(0.55 0.18 255 / 0.1)" : "none",
              }}
              ref={inputRef}
            >
              <div className="flex items-center px-4 py-3 gap-3">
                <Tag size={18} style={{ color: "oklch(0.55 0.18 255)" }} />
                <span
                  className="flex-1 text-xl font-black tracking-wider"
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    color: searchValue ? "oklch(0.22 0.06 255)" : "oklch(0.75 0.02 255)",
                    minHeight: "2rem",
                    letterSpacing: "0.1em",
                  }}
                >
                  {searchValue || "STK-XXXXX-XXX"}
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
                  لم يتم العثور على الاستيكر "{searchValue}"
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
                أمثلة: STK-A1234-001 · STK-M5678-001
              </span>
            </div>
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════
            RIGHT PANEL — Ironing Details
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
                key={currentOrder.stickerNumber}
                className="flex flex-col h-full"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              >
                {/* Header */}
                <div
                  className="px-6 py-5"
                  style={{
                    background: "linear-gradient(135deg, oklch(0.22 0.06 255) 0%, oklch(0.3 0.1 255) 100%)",
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Flame size={18} className="text-blue-300" />
                        <span
                          className="text-blue-200 text-sm font-medium"
                          style={{ fontFamily: "Cairo, sans-serif" }}
                        >
                          تفاصيل القطعة
                        </span>
                      </div>
                      <h2
                        className="text-white font-black text-2xl tracking-wider"
                        style={{ fontFamily: "JetBrains Mono, monospace" }}
                      >
                        {currentOrder.stickerNumber}
                      </h2>
                    </div>
                    <StatusBadge status={currentOrder.status} priority={currentOrder.item.priority} />
                  </div>
                </div>

                {/* Item Info */}
                <div
                  className="px-6 py-4"
                  style={{ borderBottom: "1px solid oklch(0.92 0.005 240)" }}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p
                        className="text-xs font-semibold text-slate-400 mb-1"
                        style={{ fontFamily: "Cairo, sans-serif" }}
                      >
                        نوع القطعة
                      </p>
                      <p
                        className="text-lg font-bold text-slate-800"
                        style={{ fontFamily: "Cairo, sans-serif" }}
                      >
                        {currentOrder.item.name}
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-xs font-semibold text-slate-400 mb-1"
                        style={{ fontFamily: "Cairo, sans-serif" }}
                      >
                        الحجم
                      </p>
                      <p
                        className="text-lg font-bold text-slate-800"
                        style={{ fontFamily: "Nunito, sans-serif" }}
                      >
                        {currentOrder.item.size}
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-xs font-semibold text-slate-400 mb-1"
                        style={{ fontFamily: "Cairo, sans-serif" }}
                      >
                        اللون
                      </p>
                      <span
                        className="inline-block px-3 py-1 rounded-full text-sm font-bold"
                        style={{
                          background: "oklch(0.6 0.18 45 / 0.1)",
                          color: "oklch(0.5 0.18 45)",
                          border: "1px solid oklch(0.6 0.18 45 / 0.2)",
                          fontFamily: "Cairo, sans-serif",
                        }}
                      >
                        {currentOrder.item.color}
                      </span>
                    </div>
                    <div>
                      <p
                        className="text-xs font-semibold text-slate-400 mb-1"
                        style={{ fontFamily: "Cairo, sans-serif" }}
                      >
                        رقم الطلب
                      </p>
                      <p
                        className="text-lg font-black text-slate-800"
                        style={{ fontFamily: "JetBrains Mono, monospace" }}
                      >
                        #{currentOrder.orderId}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Ironing Stats */}
                <div
                  className="grid grid-cols-3 gap-0"
                  style={{ borderBottom: "1px solid oklch(0.92 0.005 240)" }}
                >
                  {[
                    {
                      label: "الإجمالي",
                      value: currentOrder.item.totalQuantity,
                      icon: Package,
                      color: "oklch(0.42 0.18 255)",
                      bg: "oklch(0.42 0.18 255 / 0.08)",
                    },
                    {
                      label: "المكوية",
                      value: ironedCount,
                      icon: Flame,
                      color: "oklch(0.6 0.18 45)",
                      bg: "oklch(0.6 0.18 45 / 0.08)",
                    },
                    {
                      label: "المتبقية",
                      value: remainingCount,
                      icon: AlertCircle,
                      color: remainingCount === 0 ? "oklch(0.62 0.18 145)" : "oklch(0.55 0.18 255)",
                      bg: remainingCount === 0 ? "oklch(0.62 0.18 145 / 0.08)" : "oklch(0.55 0.18 255 / 0.08)",
                    },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="px-4 py-5 flex flex-col items-center gap-2"
                      style={{
                        borderLeft: i < 2 ? "1px solid oklch(0.92 0.005 240)" : "none",
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: stat.bg }}
                      >
                        <stat.icon size={18} style={{ color: stat.color }} />
                      </div>
                      <span
                        className="text-3xl font-black"
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

                {/* Ironing Progress */}
                <div className="px-6 py-5" style={{ borderBottom: "1px solid oklch(0.92 0.005 240)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-sm font-bold text-slate-600"
                      style={{ fontFamily: "Cairo, sans-serif" }}
                    >
                      تقدم الكي
                    </span>
                    <span
                      className="text-sm font-black"
                      style={{
                        color: "oklch(0.42 0.18 255)",
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >
                      {Math.round(ironingProgress)}%
                    </span>
                  </div>
                  <div
                    className="w-full h-4 rounded-full overflow-hidden"
                    style={{ background: "oklch(0.92 0.005 240)" }}
                  >
                    <motion.div
                      className="h-full"
                      style={{
                        background: ironingProgress === 100
                          ? "linear-gradient(90deg, oklch(0.62 0.18 145), oklch(0.68 0.2 140))"
                          : "linear-gradient(90deg, oklch(0.6 0.18 45), oklch(0.65 0.2 40))",
                        width: `${ironingProgress}%`,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${ironingProgress}%` }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Ironing Controls */}
                <div className="px-6 py-5 flex-1 flex flex-col gap-4" style={{ borderBottom: "1px solid oklch(0.92 0.005 240)" }}>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Zap size={16} style={{ color: "oklch(0.42 0.18 255)" }} />
                      <span
                        className="text-sm font-bold text-slate-600"
                        style={{ fontFamily: "Cairo, sans-serif" }}
                      >
                        تسجيل الكمية المكوية
                      </span>
                    </div>
                    <motion.button
                      className="w-full py-4 rounded-xl font-bold text-white text-lg transition-all"
                      style={{
                        background: "linear-gradient(135deg, oklch(0.6 0.18 45), oklch(0.65 0.2 40))",
                        boxShadow: "0 4px 15px oklch(0.6 0.18 45 / 0.35)",
                        fontFamily: "Cairo, sans-serif",
                      }}
                      onClick={handleIncrementIroned}
                      disabled={ironedCount === currentOrder.item.totalQuantity}
                      whileTap={{ scale: 0.97 }}
                      onMouseEnter={(e) => {
                        if (ironedCount < currentOrder.item.totalQuantity) {
                          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                          (e.currentTarget as HTMLButtonElement).style.boxShadow =
                            "0 6px 20px oklch(0.6 0.18 45 / 0.45)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                        (e.currentTarget as HTMLButtonElement).style.boxShadow =
                          "0 4px 15px oklch(0.6 0.18 45 / 0.35)";
                      }}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Flame size={20} />
                        {ironedCount === currentOrder.item.totalQuantity ? "مكتمل ✓" : "تسجيل قطعة مكوية"}
                      </span>
                    </motion.button>
                  </div>

                  {/* Last Scanned Time */}
                  {lastScannedTime && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="px-4 py-2.5 rounded-lg text-center text-xs"
                      style={{
                        background: "oklch(0.62 0.18 145 / 0.1)",
                        color: "oklch(0.45 0.18 145)",
                        border: "1px solid oklch(0.62 0.18 145 / 0.2)",
                        fontFamily: "Cairo, sans-serif",
                      }}
                    >
                      آخر تحديث: {new Date(lastScannedTime).toLocaleTimeString("ar-SA")}
                    </motion.div>
                  )}
                </div>

                {/* Print Button */}
                <div className="px-6 py-4">
                  <motion.button
                    className="print-btn w-full py-4 flex items-center justify-center gap-3 text-lg font-black"
                    onClick={handlePrint}
                    disabled={isPrinting}
                    whileTap={{ scale: 0.97 }}
                    style={{ fontFamily: "Cairo, sans-serif" }}
                  >
                    <Printer size={22} />
                    {isPrinting ? "جاري الطباعة..." : "طباعة التقرير"}
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
                <EmptyIroningPanel />
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
        <span>محطة كوي الملابس — الإصدار 1.0</span>
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
