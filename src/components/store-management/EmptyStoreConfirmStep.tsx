import { AlertTriangle } from 'lucide-react';

type EmptyStoreConfirmStepProps = {
  storeName: string;
  affectedCount: number;
  confirmText: string;
  reason: string;
  busy: boolean;
  onConfirmTextChange: (value: string) => void;
  onReasonChange: (value: string) => void;
  onCancel: () => void;
  onExportBackup: () => void;
  onConfirm: () => void;
};

export default function EmptyStoreConfirmStep({
  storeName,
  affectedCount,
  confirmText,
  reason,
  busy,
  onConfirmTextChange,
  onReasonChange,
  onCancel,
  onExportBackup,
  onConfirm,
}: EmptyStoreConfirmStepProps) {
  const canConfirm = confirmText.trim() === storeName && reason.trim().length > 0 && !busy;

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-rose-700/70 bg-rose-950/35 px-4 py-3 text-rose-100 text-sm">
        <div className="flex items-center gap-2 text-rose-200 font-black"><AlertTriangle size={16} /> Danger Action</div>
        <p className="mt-2">You are about to empty <span className="font-black">{storeName}</span>. This will remove all current numbers from this store but will not delete history.</p>
        <p className="mt-1">Affected item count: <span className="font-black">{affectedCount}</span></p>
      </div>

      <input
        value={confirmText}
        onChange={(event) => onConfirmTextChange(event.target.value)}
        placeholder={`Type ${storeName} to confirm`}
        className="w-full h-11 rounded-xl border border-rose-700 bg-rose-950/25 px-3 text-sm text-white"
      />

      <textarea
        value={reason}
        onChange={(event) => onReasonChange(event.target.value)}
        placeholder="Reason (required)"
        className="w-full min-h-24 rounded-xl border border-rose-700 bg-rose-950/25 px-3 py-2 text-sm text-white"
      />

      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" onClick={onCancel} className="h-10 px-3 rounded-xl border border-[#263B5B] bg-[#17263A] text-xs font-bold text-slate-200">Cancel</button>
        <button type="button" onClick={onExportBackup} className="h-10 px-3 rounded-xl border border-[#263B5B] bg-[#17263A] text-xs font-bold text-slate-200">Export Backup First</button>
        <button type="button" onClick={onConfirm} disabled={!canConfirm} className="h-10 px-4 rounded-xl bg-rose-600 disabled:bg-rose-950/50 text-xs font-black text-white">{busy ? 'Clearing...' : 'Confirm Empty Store'}</button>
      </div>
    </div>
  );
}
