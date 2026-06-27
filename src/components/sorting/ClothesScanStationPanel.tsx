import type { RefObject } from 'react';
import { AlertTriangle, CheckCircle2, Delete, Loader2, RefreshCw, Search, Tag, X } from 'lucide-react';

type ClothesScanResult = {
  placement: {
    label: string;
  };
  scan: {
    consumed: number;
    overflow: number;
  };
  pos_sync:
    | {
        success: boolean;
        description?: string;
        error?: string;
      }
    | null;
};

type ClothesScanStationPanelProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  scanOrderNo: string;
  scanQty: number;
  scanBusy: boolean;
  scanError: string | null;
  scanResult: ClothesScanResult | null;
  posSyncRetryBusy: boolean;
  keyboardRows: string[][];
  pressedKey: string | null;
  onScanOrderNoChange: (value: string) => void;
  onScanQtyChange: (value: number) => void;
  onScanErrorClear: () => void;
  onSubmit: () => void;
  onKeyPress: (key: string) => void;
  onDelete: () => void;
  onClear: () => void;
  onRetryPosStageSync: () => void;
};

export default function ClothesScanStationPanel({
  inputRef,
  scanOrderNo,
  scanQty,
  scanBusy,
  scanError,
  scanResult,
  posSyncRetryBusy,
  keyboardRows,
  pressedKey,
  onScanOrderNoChange,
  onScanQtyChange,
  onScanErrorClear,
  onSubmit,
  onKeyPress,
  onDelete,
  onClear,
  onRetryPosStageSync,
}: ClothesScanStationPanelProps) {
  // Note: This panel owns the operator scan controls while Sorting.tsx still owns the workflow state.
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-700">
          <Search size={18} className="text-blue-700" />
          Search by order number
        </div>
        <div className="relative mb-3 overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-50 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100">
          <div className="flex items-center gap-3 px-4 py-3">
            <Tag size={18} className="text-blue-600" />
            <input
              ref={inputRef}
              type="text"
              dir="ltr"
              value={scanOrderNo}
              onChange={(event) => {
                onScanOrderNoChange(event.target.value.toUpperCase());
                onScanErrorClear();
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  onSubmit();
                }
                if (event.key === 'Escape') {
                  event.preventDefault();
                  onClear();
                }
              }}
              placeholder="_ _ _ _ _"
              className="cs-blanket-order-field min-h-10 flex-1 border-0 bg-transparent px-0 py-0 font-mono text-2xl font-black uppercase tracking-[0.2em] text-slate-900 shadow-none focus:ring-0"
            />
            {scanOrderNo && (
              <button
                type="button"
                onClick={onClear}
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
              onChange={(event) => onScanQtyChange(Number(event.target.value))}
              placeholder="Qty"
              className="mt-1 w-full border-0 bg-transparent p-0 text-sm font-black text-slate-900 shadow-none focus:ring-0"
            />
          </label>
          <button
            type="button"
            onClick={onSubmit}
            disabled={scanBusy}
            className="cs-primary-action flex min-w-28 items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-black text-white disabled:opacity-50"
          >
            {scanBusy ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            Search
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
                POS updated and verified: Other Description = {scanResult.pos_sync.description}
              </div>
            ) : scanResult.pos_sync ? (
              <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  Sorting was saved locally, but POS update failed: {scanResult.pos_sync.error}
                </div>
                <button
                  type="button"
                  disabled={posSyncRetryBusy}
                  onClick={onRetryPosStageSync}
                  className="mt-2 inline-flex items-center gap-2 rounded-lg border border-amber-400 bg-white px-3 py-1.5 text-[11px] font-black text-amber-900 disabled:opacity-50"
                >
                  {posSyncRetryBusy ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                  Retry POS Sync
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
            <p className="text-xs font-bold text-blue-300">Worker keypad</p>
          </div>
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {keyboardRows.map((row, rowIndex) => (
            <div key={`sorting-key-row-${rowIndex}`} dir="ltr" className="grid grid-cols-5 gap-3">
              {row.map((key) => (
                <button
                  key={`sorting-key-${key}`}
                  type="button"
                  onClick={() => onKeyPress(key)}
                  className={`cs-key-btn flex items-center justify-center ${pressedKey === key ? 'cs-key-btn-active' : ''}`}
                >
                  {key}
                </button>
              ))}
            </div>
          ))}
          <div dir="ltr" className="mt-1 grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={onDelete}
              className={`cs-key-btn cs-key-btn-delete flex items-center justify-center gap-2 text-sm ${pressedKey === 'DEL' ? 'cs-key-btn-active' : ''}`}
            >
              <Delete size={18} />
              Delete
            </button>
            <button
              type="button"
              onClick={onClear}
              className={`cs-key-btn cs-key-btn-special flex items-center justify-center gap-2 text-sm ${pressedKey === 'CLR' ? 'cs-key-btn-active' : ''}`}
            >
              <X size={18} />
              Clear
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={scanBusy}
              className="cs-key-btn cs-key-btn-enter flex items-center justify-center gap-2 text-sm disabled:opacity-60"
            >
              {scanBusy ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              Search
            </button>
          </div>
        </div>
        <div className="mt-4 border-t border-blue-900/50 pt-3 text-center text-xs font-bold text-blue-300">
          Examples: Z61303 · M35427 · 253983
        </div>
      </div>
    </div>
  );
}
