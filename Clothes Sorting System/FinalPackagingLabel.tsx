/**
 * مكون ملصق التجميع النهائي - Final Packaging Label
 * يظهر عند إكمال جميع قطع الطلب بالكامل
 * مصمم للطباعة على ملصقات لاصقة
 */

import { motion } from "framer-motion";
import { CheckCircle2, Package, Printer, X } from "lucide-react";

interface FinalPackagingLabelProps {
  orderId: string;
  totalItems: number;
  totalQuantity: number;
  date: string;
  onPrint: () => void;
  onClose: () => void;
}

export default function FinalPackagingLabel({
  orderId,
  totalItems,
  totalQuantity,
  date,
  onPrint,
  onClose,
}: FinalPackagingLabelProps) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{
            background: "linear-gradient(135deg, oklch(0.62 0.18 145) 0%, oklch(0.68 0.2 140) 100%)",
          }}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 size={24} className="text-white" />
            <span
              className="font-black text-white text-lg"
              style={{ fontFamily: "Cairo, sans-serif" }}
            >
              مكتمل!
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Message */}
          <div className="mb-6 text-center">
            <p
              className="text-sm text-slate-600 mb-2"
              style={{ fontFamily: "Cairo, sans-serif" }}
            >
              تم إكمال جميع قطع الطلب بنجاح
            </p>
            <p
              className="text-xs text-slate-400"
              style={{ fontFamily: "Cairo, sans-serif" }}
            >
              جاهز للتجميع والشحن
            </p>
          </div>

          {/* Label Preview */}
          <div
            className="border-2 border-dashed rounded-xl p-6 mb-6 text-center"
            style={{
              background: "oklch(0.98 0.003 240)",
              borderColor: "oklch(0.62 0.18 145)",
            }}
          >
            {/* Barcode Area */}
            <div
              className="mb-4 p-3 rounded-lg flex items-center justify-center"
              style={{ background: "white", border: "1px solid oklch(0.88 0.01 240)" }}
            >
              <div
                className="text-center"
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  letterSpacing: "0.15em",
                }}
              >
                <div className="text-xs text-slate-400 mb-1">رقم الطلب</div>
                <div className="text-2xl font-black text-slate-800">#{orderId}</div>
              </div>
            </div>

            {/* Order Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-semibold text-slate-500"
                  style={{ fontFamily: "Cairo, sans-serif" }}
                >
                  عدد القطع:
                </span>
                <span
                  className="text-lg font-black text-slate-800"
                  style={{ fontFamily: "JetBrains Mono, monospace" }}
                >
                  {totalItems}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-semibold text-slate-500"
                  style={{ fontFamily: "Cairo, sans-serif" }}
                >
                  الكمية الإجمالية:
                </span>
                <span
                  className="text-lg font-black text-slate-800"
                  style={{ fontFamily: "JetBrains Mono, monospace" }}
                >
                  {totalQuantity}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-semibold text-slate-500"
                  style={{ fontFamily: "Cairo, sans-serif" }}
                >
                  التاريخ:
                </span>
                <span
                  className="text-xs font-semibold text-slate-600"
                  style={{ fontFamily: "Nunito, sans-serif" }}
                >
                  {new Date(date).toLocaleDateString("ar-SA")}
                </span>
              </div>
            </div>

            {/* Status Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: "oklch(0.62 0.18 145 / 0.15)",
                border: "1px solid oklch(0.62 0.18 145 / 0.3)",
              }}
            >
              <CheckCircle2 size={14} style={{ color: "oklch(0.62 0.18 145)" }} />
              <span
                className="text-xs font-bold"
                style={{
                  color: "oklch(0.45 0.18 145)",
                  fontFamily: "Cairo, sans-serif",
                }}
              >
                جاهز للشحن
              </span>
            </div>
          </div>

          {/* Info Text */}
          <p
            className="text-xs text-slate-500 text-center mb-6"
            style={{ fontFamily: "Cairo, sans-serif" }}
          >
            اطبع هذا الملصق والصقه على الصندوق الخارجي
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg font-bold text-slate-700 transition-all"
              style={{
                background: "oklch(0.92 0.005 240)",
                border: "1px solid oklch(0.88 0.01 240)",
                fontFamily: "Cairo, sans-serif",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.88 0.01 240)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.92 0.005 240)";
              }}
            >
              إغلاق
            </button>
            <motion.button
              onClick={onPrint}
              className="flex-1 py-2.5 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, oklch(0.62 0.18 145), oklch(0.68 0.2 140))",
                boxShadow: "0 4px 12px oklch(0.62 0.18 145 / 0.3)",
                fontFamily: "Cairo, sans-serif",
              }}
              whileTap={{ scale: 0.97 }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 6px 20px oklch(0.62 0.18 145 / 0.4)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 4px 12px oklch(0.62 0.18 145 / 0.3)";
              }}
            >
              <Printer size={18} />
              طباعة الملصق
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body > * {
            display: none !important;
          }
          
          .final-label-print {
            display: block !important;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            background: white;
          }
        }
      `}</style>
    </motion.div>
  );
}
