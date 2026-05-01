type ExportStoreStepProps = {
  scope: 'current' | 'all';
  storedOnly: boolean;
  includeEmptySlots: boolean;
  includeHistory: boolean;
  onScopeChange: (scope: 'current' | 'all') => void;
  onStoredOnlyChange: (value: boolean) => void;
  onIncludeEmptySlotsChange: (value: boolean) => void;
  onIncludeHistoryChange: (value: boolean) => void;
  onCancel: () => void;
  onExport: () => void;
};

const rowClass = 'rounded-xl border border-[#263B5B] bg-[#101D30] px-3 py-2.5 text-sm text-slate-100 flex items-center gap-2';

export default function ExportStoreStep({
  scope,
  storedOnly,
  includeEmptySlots,
  includeHistory,
  onScopeChange,
  onStoredOnlyChange,
  onIncludeEmptySlotsChange,
  onIncludeHistoryChange,
  onCancel,
  onExport,
}: ExportStoreStepProps) {
  return (
    <div className="space-y-3">
      <label className={rowClass}><input type="radio" checked={scope === 'current'} onChange={() => onScopeChange('current')} /> Export Current Store</label>
      <label className={rowClass}><input type="radio" checked={scope === 'all'} onChange={() => onScopeChange('all')} /> Export All Stores</label>
      <label className={rowClass}><input type="checkbox" checked={storedOnly} onChange={(event) => onStoredOnlyChange(event.target.checked)} /> Export Stored Items Only</label>
      <label className={rowClass}><input type="checkbox" checked={includeEmptySlots} onChange={(event) => onIncludeEmptySlotsChange(event.target.checked)} /> Export Empty Slots</label>
      <label className={rowClass}><input type="checkbox" checked={includeHistory} onChange={(event) => onIncludeHistoryChange(event.target.checked)} /> Export Store History</label>

      <div className="pt-1 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="h-10 px-3 rounded-xl border border-[#263B5B] bg-[#17263A] text-xs font-bold text-slate-200">Cancel</button>
        <button type="button" onClick={onExport} className="h-10 px-4 rounded-xl bg-[#2F7DFF] text-xs font-black text-white">Export</button>
      </div>
    </div>
  );
}
