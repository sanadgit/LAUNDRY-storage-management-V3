/**
 * مكون الملصق القابل للطباعة - Printable Final Label
 * مصمم بحجم قياسي للملصقات اللاصقة
 */

interface PrintableFinalLabelProps {
  orderId: string;
  totalItems: number;
  totalQuantity: number;
  date: string;
}

export default function PrintableFinalLabel({
  orderId,
  totalItems,
  totalQuantity,
  date,
}: PrintableFinalLabelProps) {
  return (
    <div
      className="final-label-print w-full h-screen flex items-center justify-center p-8"
      style={{
        background: "white",
        fontFamily: "Cairo, sans-serif",
        direction: "rtl",
      }}
    >
      {/* Label Container - 4x6 inches (common label size) */}
      <div
        className="w-full max-w-2xl border-4 border-slate-800 rounded-lg p-8 text-center"
        style={{
          background: "white",
          aspectRatio: "4/6",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Top Section - Title */}
        <div>
          <div
            className="text-sm font-bold text-slate-600 mb-2"
            style={{ fontFamily: "Cairo, sans-serif" }}
          >
            ✓ جاهز للشحن
          </div>
          <div
            className="text-3xl font-black text-slate-800 mb-4"
            style={{ fontFamily: "Cairo, sans-serif" }}
          >
            طلب مكتمل
          </div>
        </div>

        {/* Middle Section - Order Number (Large) */}
        <div
          className="py-6 border-t-4 border-b-4 border-slate-800"
          style={{ borderColor: "oklch(0.62 0.18 145)" }}
        >
          <div
            className="text-xs font-bold text-slate-500 mb-2"
            style={{ fontFamily: "Cairo, sans-serif" }}
          >
            رقم الطلب
          </div>
          <div
            className="text-6xl font-black text-slate-800 tracking-wider"
            style={{ fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.1em" }}
          >
            {orderId}
          </div>
          <div
            className="text-xs font-bold text-slate-500 mt-2"
            style={{ fontFamily: "Cairo, sans-serif" }}
          >
            Order ID
          </div>
        </div>

        {/* Bottom Section - Details */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div
                className="text-xs font-semibold text-slate-500 mb-1"
                style={{ fontFamily: "Cairo, sans-serif" }}
              >
                عدد القطع
              </div>
              <div
                className="text-2xl font-black text-slate-800"
                style={{ fontFamily: "JetBrains Mono, monospace" }}
              >
                {totalItems}
              </div>
            </div>
            <div>
              <div
                className="text-xs font-semibold text-slate-500 mb-1"
                style={{ fontFamily: "Cairo, sans-serif" }}
              >
                الكمية
              </div>
              <div
                className="text-2xl font-black text-slate-800"
                style={{ fontFamily: "JetBrains Mono, monospace" }}
              >
                {totalQuantity}
              </div>
            </div>
          </div>

          <div
            className="text-xs font-semibold text-slate-600"
            style={{ fontFamily: "Nunito, sans-serif" }}
          >
            {new Date(date).toLocaleDateString("ar-SA", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
            background: white;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          .final-label-print {
            display: flex !important;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
}
