type StoreSummaryStepProps = {
  storeName: string;
  usedCells: number;
  emptyCells: number;
  totalCapacity: number;
  percentageUsed: number;
  duplicateCount: number;
  locked: boolean;
  lastUpdated: string;
};

function tile(label: string, value: string, accent?: string) {
  return (
    <div className="rounded-2xl border border-[#263B5B] bg-[#101D30] px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-[0.16em] text-[#8EA2BD]">{label}</div>
      <div className={accent ? `mt-1 text-sm font-black ${accent}` : 'mt-1 text-sm font-black text-white'}>{value}</div>
    </div>
  );
}

export default function StoreSummaryStep({
  storeName,
  usedCells,
  emptyCells,
  totalCapacity,
  percentageUsed,
  duplicateCount,
  locked,
  lastUpdated,
}: StoreSummaryStepProps) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-[#263B5B] bg-[#101D30] px-3 py-3 text-[#8EA2BD] text-xs">
        <span className="text-white font-black">{storeName}</span> summary and occupancy insights.
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {tile('Used Cells', String(usedCells), 'text-emerald-300')}
        {tile('Empty Cells', String(emptyCells))}
        {tile('Capacity', String(totalCapacity))}
        {tile('Used %', `${percentageUsed}%`, 'text-blue-300')}
        {tile('Duplicates', String(duplicateCount), duplicateCount > 0 ? 'text-rose-300' : 'text-emerald-300')}
        {tile('State', locked ? 'Locked' : 'Unlocked', locked ? 'text-amber-300' : 'text-emerald-300')}
        <div className="rounded-2xl border border-[#263B5B] bg-[#101D30] px-3 py-2.5 col-span-2 sm:col-span-2">
          <div className="text-[10px] uppercase tracking-[0.16em] text-[#8EA2BD]">Last Updated</div>
          <div className="mt-1 text-sm font-black text-white break-all">{lastUpdated}</div>
        </div>
      </div>
    </div>
  );
}
