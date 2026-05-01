type StoreHealthStepProps = {
  duplicateNumbers: number;
  invalidNumbers: number;
  emptyGaps: number;
  oldStoredItems: number;
  missingScanRecords: number;
  fullRows: number;
  suggestedActions: string[];
};

const rowStyle = 'rounded-xl border border-[#263B5B] bg-[#101D30] px-3 py-2.5 flex items-center justify-between gap-3 text-xs';

export default function StoreHealthStep({
  duplicateNumbers,
  invalidNumbers,
  emptyGaps,
  oldStoredItems,
  missingScanRecords,
  fullRows,
  suggestedActions,
}: StoreHealthStepProps) {
  return (
    <div className="space-y-2.5">
      <div className={rowStyle}><span className="text-[#8EA2BD]">Duplicate numbers</span><span className={duplicateNumbers > 0 ? 'text-rose-300 font-black' : 'text-emerald-300 font-black'}>{duplicateNumbers}</span></div>
      <div className={rowStyle}><span className="text-[#8EA2BD]">Invalid numbers</span><span className={invalidNumbers > 0 ? 'text-rose-300 font-black' : 'text-emerald-300 font-black'}>{invalidNumbers}</span></div>
      <div className={rowStyle}><span className="text-[#8EA2BD]">Empty gaps</span><span className="text-white font-black">{emptyGaps}</span></div>
      <div className={rowStyle}><span className="text-[#8EA2BD]">Old stored items</span><span className={oldStoredItems > 0 ? 'text-amber-300 font-black' : 'text-emerald-300 font-black'}>{oldStoredItems}</span></div>
      <div className={rowStyle}><span className="text-[#8EA2BD]">Missing scan records</span><span className={missingScanRecords > 0 ? 'text-amber-300 font-black' : 'text-emerald-300 font-black'}>{missingScanRecords}</span></div>
      <div className={rowStyle}><span className="text-[#8EA2BD]">Full rows</span><span className="text-white font-black">{fullRows}</span></div>

      <div className="rounded-2xl border border-[#263B5B] bg-[#101D30] px-3 py-3">
        <div className="text-[10px] uppercase tracking-[0.16em] text-[#8EA2BD]">Suggested Cleanup Actions</div>
        <div className="mt-2 space-y-1.5 text-xs text-white">
          {suggestedActions.length === 0 ? (
            <div className="text-emerald-300 font-bold">No action required.</div>
          ) : (
            suggestedActions.map((action) => (
              <div key={action} className="rounded-lg bg-[#17263A] border border-[#263B5B] px-2.5 py-2">
                {action}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
