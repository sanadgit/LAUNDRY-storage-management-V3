/**
 * واجهة فرز الملابس - Clothes Sorting Interface
 * Design: Clean Professional Blue
 * - خلفية فاتحة مع أزرق ملكي وبرتقالي للتمييز
 * - لوحة مفاتيح صناعية على اليسار
 * - عرض الطاولة والخانة بحجم كبير على اليمين
 * - خطوط Cairo + Nunito + JetBrains Mono
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";
import LanguageToggle from "@/components/LanguageToggle";
import FinalPackagingLabel from "@/components/FinalPackagingLabel";
import PrintableFinalLabel from "@/components/PrintableFinalLabel";
import {
  Search,
  Printer,
  Package,
  User,
  Hash,
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
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  size: string;
  color: string;
}

interface Order {
  orderId: string;
  clientId: string;
  status: "processing" | "done" | "pending";
  items: OrderItem[];
  totalPieces: number;
  totalQuantity: number;
  date: string;
}

interface TableSlot {
  tableId: string;
  slotNumber: number;
  itemName: string;
  quantity: number;
}

// ─── Table & Slot System ──────────────────────────────────────────────────────
const TABLE_SLOTS: Record<string, TableSlot> = {
  "A1234": { tableId: "T1", slotNumber: 1, itemName: "قميص رجالي", quantity: 12 },
  "M5678": { tableId: "T2", slotNumber: 3, itemName: "فستان نسائي", quantity: 15 },
  "R9012": { tableId: "T1", slotNumber: 5, itemName: "جاكيت شتوي", quantity: 5 },
  "W3456": { tableId: "T3", slotNumber: 2, itemName: "عباءة", quantity: 7 },
  "Z7890": { tableId: "T2", slotNumber: 4, itemName: "بدلة رسمية", quantity: 3 },
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_ORDERS: Record<string, Order> = {
  "A1234": {
    orderId: "A1234",
    clientId: "C-5521",
    status: "processing",
    date: "2026-05-16",
    items: [
      { id: "1", name: "قميص رجالي", quantity: 12, size: "XL", color: "أبيض" },
      { id: "2", name: "بنطلون جينز", quantity: 8, size: "32", color: "أزرق" },
      { id: "3", name: "تيشيرت", quantity: 20, size: "L", color: "أسود" },
    ],
    totalPieces: 3,
    totalQuantity: 40,
  },
  "M5678": {
    orderId: "M5678",
    clientId: "C-8834",
    status: "done",
    date: "2026-05-15",
    items: [
      { id: "1", name: "فستان نسائي", quantity: 15, size: "M", color: "أحمر" },
      { id: "2", name: "بلوزة", quantity: 10, size: "S", color: "بيج" },
    ],
    totalPieces: 2,
    totalQuantity: 25,
  },
  "R9012": {
    orderId: "R9012",
    clientId: "C-3317",
    status: "pending",
    date: "2026-05-16",
    items: [
      { id: "1", name: "جاكيت شتوي", quantity: 5, size: "XXL", color: "رمادي" },
      { id: "2", name: "كنزة صوف", quantity: 18, size: "L", color: "أخضر" },
      { id: "3", name: "شورت رياضي", quantity: 30, size: "M", color: "أسود" },
      { id: "4", name: "قميص كاجوال", quantity: 12, size: "XL", color: "أزرق" },
    ],
    totalPieces: 4,
    totalQuantity: 65,
  },
  "W3456": {
    orderId: "W3456",
    clientId: "C-9901",
    status: "processing",
    date: "2026-05-16",
    items: [
      { id: "1", name: "عباءة", quantity: 7, size: "فري", color: "أسود" },
      { id: "2", name: "حجاب", quantity: 25, size: "فري", color: "متعدد" },
    ],
    totalPieces: 2,
    totalQuantity: 32,
  },
  "Z7890": {
    orderId: "Z7890",
    clientId: "C-6643",
    status: "done",
    date: "2026-05-14",
    items: [
      { id: "1", name: "بدلة رسمية", quantity: 3, size: "52", color: "كحلي" },
      { id: "2", name: "قميص رسمي", quantity: 6, size: "42", color: "أبيض" },
      { id: "3", name: "ربطة عنق", quantity: 6, size: "فري", color: "متعدد" },
    ],
    totalPieces: 3,
    totalQuantity: 15,
  },
};

// ─── Keyboard Layout ──────────────────────────────────────────────────────────
const KEYBOARD_ROWS = [
  ["Z", "A", "M", "R", "W"],
  ["1", "2", "3", "4", "5"],
  ["6", "7", "8", "9", "0"],
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Order["status"] }) {
  const config = {
    processing: { label: "جاري الفرز", icon: Clock, cls: "status-processing" },
    done: { label: "مكتمل", icon: CheckCircle2, cls: "status-done" },
    pending: {
      label: "في الانتظار",
      icon: Clock,
      cls: "bg-amber-50 text-amber-700 border border-amber-200",
    },
  }[status];
  const Icon = config.icon;
  return (
    <span className={`status-badge ${config.cls}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
}

function EmptyOrderPanel() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
      <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center">
        <Package size={36} className="text-blue-300" />
      </div>
      <div>
        <p className="text-lg font-bold text-slate-400" style={{ fontFamily: "Cairo, sans-serif" }}>
          لا يوجد طلب محدد
        </p>
        <p className="text-sm text-slate-300 mt-1" style={{ fontFamily: "Cairo, sans-serif" }}>
          ابحث برقم الطلب لعرض التفاصيل
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Home() {
  const { language } = useLanguage();
  const [, setLocation] = useLocation();
  const [searchValue, setSearchValue] = useState("");
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showFinalLabel, setShowFinalLabel] = useState(false);
  const [printingFinalLabel, setPrintingFinalLabel] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const printLabelRef = useRef<HTMLDivElement>(null);

  // Check if all items are completed
  const allItemsCompleted = currentOrder
    ? currentOrder.items.every((item) => item.quantity === 0)
    : false;

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
  }, []);

  const handleSearch = useCallback(() => {
    const val = searchValue.trim().toUpperCase();
    if (!val) return;
    const order = MOCK_ORDERS[val];
    if (order) {
      setCurrentOrder(order);
      setNotFound(false);
    } else {
      setCurrentOrder(null);
      setNotFound(true);
    }
  }, [searchValue]);

  const handlePrint = useCallback(() => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 300);
  }, []);

  const handlePrintFinalLabel = useCallback(() => {
    setPrintingFinalLabel(true);
    setTimeout(() => {
      window.print();
      setPrintingFinalLabel(false);
      setShowFinalLabel(false);
      // Reset after printing
      handleClear();
    }, 500);
  }, [handleClear]);

  // Show final label when all items are completed
  useEffect(() => {
    if (allItemsCompleted && currentOrder) {
      setShowFinalLabel(true);
    }
  }, [allItemsCompleted, currentOrder]);

  const statusColors: Record<Order["status"], string> = {
    processing: "text-blue-600",
    done: "text-green-600",
    pending: "text-amber-600",
  };

  const getTableInfo = (orderId: string): TableSlot | undefined => {
    return TABLE_SLOTS[orderId];
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "oklch(0.97 0.005 240)" }}>
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between shadow-sm"
        style={{
          background: "linear-gradient(135deg, oklch(0.22 0.04 255) 0%, oklch(0.18 0.03 255) 100%)",
          borderBottom: "2px solid oklch(0.3 0.06 255)",
        }}
      >
        <div className="flex items-center gap-3">
          <Zap size={28} className="text-yellow-400" />
          <div>
            <h1
              className="text-2xl font-black"
              style={{ color: "oklch(0.95 0.005 240)", fontFamily: "Cairo, sans-serif" }}
            >
              {language === "ar" ? "نظام فرز الملابس" : "Clothes Sorting System"}
            </h1>
            <p
              className="text-xs"
              style={{ color: "oklch(0.7 0.005 240)", fontFamily: "Cairo, sans-serif" }}
            >
              {language === "ar" ? "Clothes Sorting System" : "نظام فرز الملابس"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "oklch(0.3 0.06 255)" }}>
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-semibold" style={{ color: "oklch(0.95 0.005 240)" }}>
              {language === "ar" ? "متصل" : "Online"}
            </span>
          </div>
          <LanguageToggle />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 p-6 overflow-hidden">
        {/* Left Panel: Search & Keyboard */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-2/5 flex flex-col gap-4"
        >
          {/* Search Input */}
          <div className="flex flex-col gap-2">
            <label
              className="text-sm font-bold"
              style={{ color: "oklch(0.42 0.18 255)", fontFamily: "Cairo, sans-serif" }}
            >
              {language === "ar" ? "البحث برقم الطلب" : "Search by Order Number"}
            </label>
            <motion.input
              type="text"
              placeholder={language === "ar" ? "أدخل رقم الطلب..." : "Enter order number..."}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="px-4 py-3 rounded-lg font-bold text-lg"
              style={{
                borderColor: searchValue ? "oklch(0.42 0.18 255)" : "oklch(0.55 0.18 255 / 0.3)",
                border: "2px solid",
                boxShadow: searchValue ? "0 0 0 3px oklch(0.55 0.18 255 / 0.15)" : "none",
                fontFamily: "JetBrains Mono, monospace",
                transition: "all 0.2s",
              }}
              animate={{
                boxShadow: searchValue
                  ? "0 0 0 3px oklch(0.55 0.18 255 / 0.15)"
                  : "0 0 0 0px oklch(0.55 0.18 255 / 0)",
              }}
            />
            {notFound && (
              <p className="text-sm text-red-600" style={{ fontFamily: "Cairo, sans-serif" }}>
                {language === "ar" ? "لم يتم العثور على الطلب" : "Order not found"}
              </p>
            )}
          </div>

          {/* Keyboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 rounded-2xl p-6 shadow-lg overflow-auto"
            style={{
              background: "linear-gradient(145deg, oklch(0.2 0.05 255) 0%, oklch(0.25 0.07 255) 100%)",
              border: "1px solid oklch(0.3 0.06 255)",
            }}
          >
            <div className="flex flex-col gap-4">
              {/* Keyboard Header */}
              <div className="text-center mb-2">
                <p
                  className="text-xs font-bold uppercase"
                  style={{ color: "oklch(0.95 0.005 240)", fontFamily: "Cairo, sans-serif" }}
                >
                  {language === "ar" ? "لوحة المفاتيح" : "Keyboard"}
                </p>
              </div>

              {/* Key Rows */}
              {KEYBOARD_ROWS.map((row, rowIdx) => (
                <div key={rowIdx} className="flex gap-2 justify-center">
                  {row.map((key) => (
                    <motion.button
                      key={key}
                      onClick={() => handleKeyPress(key)}
                      className="key-btn flex-1 py-3"
                      whileTap={{ scale: 0.93, y: 3 }}
                      transition={{ duration: 0.12 }}
                      style={{
                        opacity: pressedKey === key ? 0.7 : 1,
                      }}
                    >
                      {key}
                    </motion.button>
                  ))}
                </div>
              ))}

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <motion.button
                  onClick={handleDelete}
                  className="key-btn-delete flex-1 py-3 font-bold"
                  whileTap={{ scale: 0.93, y: 3 }}
                >
                  <Delete size={18} className="mx-auto" />
                </motion.button>
                <motion.button
                  onClick={handleClear}
                  className="key-btn-special flex-1 py-3 font-bold"
                  whileTap={{ scale: 0.93, y: 3 }}
                >
                  {language === "ar" ? "مسح" : "Clear"}
                </motion.button>
                <motion.button
                  onClick={handleSearch}
                  className="key-btn-enter flex-1 py-3 font-bold"
                  whileTap={{ scale: 0.93, y: 3 }}
                >
                  <Search size={18} className="mx-auto" />
                </motion.button>
              </div>

              {/* Examples */}
              <div className="text-center mt-4 pt-4 border-t" style={{ borderColor: "oklch(0.3 0.06 255)" }}>
                <p
                  className="text-xs font-semibold mb-2"
                  style={{ color: "oklch(0.7 0.005 240)", fontFamily: "Cairo, sans-serif" }}
                >
                  {language === "ar" ? "أمثلة" : "Examples"}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "oklch(0.6 0.005 240)", fontFamily: "JetBrains Mono, monospace" }}
                >
                  A1234 · M5678 · R9012 · W3456 · Z7890
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Panel: Table & Slot Display */}
        <AnimatePresence mode="wait">
          {currentOrder ? (
            <motion.div
              key="order"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-3/5 rounded-2xl p-8 shadow-lg flex flex-col justify-center items-center"
              style={{
                background: "linear-gradient(135deg, oklch(1 0 0) 0%, oklch(0.98 0.001 286.375) 100%)",
                border: "2px solid oklch(0.88 0.01 240)",
              }}
            >
              {/* Table & Slot Info - Large Display */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="text-center w-full mb-8"
              >
                {(() => {
                  const tableInfo = getTableInfo(currentOrder.orderId);
                  return tableInfo ? (
                    <>
                      {/* Table ID - Extra Large */}
                      <div className="mb-8">
                        <p
                          className="text-sm font-semibold uppercase mb-2"
                          style={{ color: "oklch(0.52 0.02 255)", fontFamily: "Cairo, sans-serif" }}
                        >
                          {language === "ar" ? "الطاولة" : "Table"}
                        </p>
                        <p
                          className="text-9xl font-black"
                          style={{ color: "oklch(0.42 0.18 255)", fontFamily: "JetBrains Mono, monospace" }}
                        >
                          {tableInfo.tableId}
                        </p>
                      </div>

                      {/* Slot Number - Extra Large */}
                      <div className="mb-8 p-6 rounded-2xl" style={{ background: "var(--orange-accent) / 0.1" }}>
                        <p
                          className="text-sm font-semibold uppercase mb-2"
                          style={{ color: "oklch(0.52 0.02 255)", fontFamily: "Cairo, sans-serif" }}
                        >
                          {language === "ar" ? "الخانة" : "Slot"}
                        </p>
                        <p
                          className="text-8xl font-black"
                          style={{ color: "var(--orange-accent)", fontFamily: "JetBrains Mono, monospace" }}
                        >
                          {tableInfo.slotNumber}
                        </p>
                      </div>

                      {/* Item Name */}
                      <div className="mb-6 p-4 rounded-lg" style={{ background: "oklch(0.94 0.008 240)" }}>
                        <p
                          className="text-lg font-semibold"
                          style={{ color: "oklch(0.18 0.02 255)", fontFamily: "Cairo, sans-serif" }}
                        >
                          {tableInfo.itemName}
                        </p>
                      </div>

                      {/* Quantity - Large */}
                      <div className="mb-8 p-4 rounded-lg" style={{ background: "oklch(0.62 0.18 145 / 0.1)" }}>
                        <p
                          className="text-sm font-semibold uppercase mb-2"
                          style={{ color: "oklch(0.52 0.02 255)", fontFamily: "Cairo, sans-serif" }}
                        >
                          {language === "ar" ? "الكمية" : "Quantity"}
                        </p>
                        <p
                          className="text-7xl font-black"
                          style={{ color: "oklch(0.62 0.18 145)", fontFamily: "JetBrains Mono, monospace" }}
                        >
                          {tableInfo.quantity}
                        </p>
                      </div>
                    </>
                  ) : null;
                })()}
              </motion.div>

              {/* Order Details - Small */}
              <div className="w-full mt-auto pt-6 border-t-2" style={{ borderColor: "oklch(0.88 0.01 240)" }}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p
                      className="text-xs font-semibold"
                      style={{ color: "oklch(0.52 0.02 255)", fontFamily: "Cairo, sans-serif" }}
                    >
                      {language === "ar" ? "رقم الطلب" : "Order #"}
                    </p>
                    <p
                      className="font-bold text-2xl"
                      style={{ color: "oklch(0.42 0.18 255)", fontFamily: "JetBrains Mono, monospace" }}
                    >
                      {currentOrder.orderId}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-xs font-semibold"
                      style={{ color: "oklch(0.52 0.02 255)", fontFamily: "Cairo, sans-serif" }}
                    >
                      {language === "ar" ? "رقم العميل" : "Client #"}
                    </p>
                    <p
                      className="font-bold text-2xl"
                      style={{ color: "oklch(0.42 0.18 255)", fontFamily: "JetBrains Mono, monospace" }}
                    >
                      {currentOrder.clientId}
                    </p>
                  </div>
                </div>

                {/* Print Button */}
                <motion.button
                  className="print-btn w-full py-4 flex items-center justify-center gap-3 text-lg font-black"
                  onClick={handlePrint}
                  disabled={isPrinting}
                  whileTap={{ scale: 0.97 }}
                  style={{ fontFamily: "Cairo, sans-serif" }}
                >
                  <Printer size={22} />
                  {isPrinting
                    ? language === "ar"
                      ? "جاري الطباعة..."
                      : "Printing..."
                    : language === "ar"
                    ? "طباعة الطلب"
                    : "Print Order"}
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              className="w-3/5 rounded-2xl p-8 shadow-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ background: "oklch(1 0 0)" }}
            >
              <EmptyOrderPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Final Label Modal */}
      <AnimatePresence>
        {showFinalLabel && currentOrder && (
          <FinalPackagingLabel
            orderId={currentOrder.orderId}
            totalItems={currentOrder.totalPieces}
            totalQuantity={currentOrder.totalQuantity}
            date={currentOrder.date}
            onClose={() => setShowFinalLabel(false)}
            onPrint={handlePrintFinalLabel}
          />
        )}
      </AnimatePresence>

      {/* Printable Final Label */}
      <div ref={printLabelRef} style={{ display: "none" }}>
        {currentOrder && (
          <PrintableFinalLabel
            orderId={currentOrder.orderId}
            totalItems={currentOrder.totalPieces}
            totalQuantity={currentOrder.totalQuantity}
            date={currentOrder.date}
          />
        )}
      </div>
    </div>
  );
}
