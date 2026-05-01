export type StoreHistoryRow = {
  id: number;
  action: string;
  user: string;
  timestamp: string;
  reason?: string;
};

type StoreHistoryStepProps = {
  rows: StoreHistoryRow[];
};

export default function StoreHistoryStep({ rows }: StoreHistoryStepProps) {
  return (
    <div className="space-y-2">
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-[#263B5B] bg-[#101D30] px-4 py-6 text-center text-sm text-[#8EA2BD]">
          No store history records found.
        </div>
      ) : (
        rows.map((row) => (
          <div key={row.id} className="rounded-xl border border-[#263B5B] bg-[#101D30] px-3 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-black text-white uppercase">{row.action}</div>
              <div className="text-[11px] text-[#8EA2BD]">{row.timestamp}</div>
            </div>
            <div className="mt-1.5 text-xs text-[#8EA2BD]">User: <span className="text-white font-bold">{row.user}</span></div>
            {row.reason ? <div className="mt-1 text-xs text-[#8EA2BD]">Reason: <span className="text-slate-200">{row.reason}</span></div> : null}
          </div>
        ))
      )}
    </div>
  );
}
