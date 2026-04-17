import { useStore } from '../store/useStore';
import { useMemo } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Grid2D() {
  const { stores, selectedStore, blankets, searchQuery } = useStore();

  const store = useMemo(() => 
    stores.find(s => s.store_name === selectedStore) || stores[0]
  , [stores, selectedStore]);

  const storeBlankets = useMemo(() => 
    blankets.filter(b => b.store === store?.store_name && b.status === 'stored')
  , [blankets, store]);

  const targetBlankets = useMemo(() => 
    storeBlankets.filter(b => b.blanket_number.toLowerCase() === searchQuery.toLowerCase())
  , [storeBlankets, searchQuery]);

  if (!store) return null;

  const cellMap = new Map<string, { count: number; latest?: string }>();
  for (const b of storeBlankets) {
    const key = `${b.row},${b.column}`;
    const prev = cellMap.get(key);
    if (prev) {
      prev.count += 1;
      prev.latest = b.blanket_number;
    } else {
      cellMap.set(key, { count: 1, latest: b.blanket_number });
    }
  }

  const grid = [];
  for (let r = 1; r <= store.rows; r++) {
    const row = [];
    for (let c = store.columns; c >= 1; c--) {
      const cell = cellMap.get(`${r},${c}`);
      const isTarget = targetBlankets.some(b => b.row === r && b.column === c);
      row.push({ r, c, cell, isTarget });
    }
    grid.push(row);
  }

  const storeCapacity = Math.max(1, store.rows * store.columns * Math.max(1, store.slot_capacity || 1));

  return (
    <div className="h-full w-full flex flex-col p-4 sm:p-8 lg:p-12 overflow-auto bg-slate-950">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-12">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tighter text-white uppercase">{store.store_name}</h2>
          <p className="text-slate-500 font-bold text-sm sm:text-lg uppercase tracking-widest">
            {store.rows} Rows × {store.columns} Columns • {storeBlankets.length} Items Stored
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col items-center justify-center min-w-[120px]">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Capacity</span>
            <span className="text-3xl font-black text-white">{Math.round((storeBlankets.length / storeCapacity) * 100)}%</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div 
          className="grid gap-1 sm:gap-2 p-4 sm:p-8 bg-slate-900 rounded-[32px] sm:rounded-[40px] border border-slate-800 shadow-2xl"
          style={{ 
            gridTemplateColumns: `repeat(${store.columns}, minmax(0, 1fr))`,
          }}
        >
          {grid.map((row, rIdx) => (
            row.map((cell, cIdx) => (
              <div 
                key={`${rIdx}-${cIdx}`}
                className={cn(
                  "w-9 h-9 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-[10px] sm:text-xs font-black transition-all duration-300 cursor-pointer group relative",
                  cell.isTarget 
                    ? "bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] scale-110 z-10 ring-4 ring-emerald-400/50" 
                    : cell.cell
                      ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/40" 
                      : "bg-slate-800/50 text-slate-700 border border-slate-700/50 hover:bg-slate-800"
                )}
              >
                {cell.isTarget ? (
                  <span className="animate-bounce tabular-nums">{cell.cell?.count || 1}x</span>
                ) : cell.cell ? (
                  <span className="opacity-50 group-hover:opacity-100 tabular-nums">{cell.cell.count}x</span>
                ) : (
                  <span className="opacity-0 group-hover:opacity-20">{cell.r}:{cell.c}</span>
                )}
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 border border-slate-700 shadow-2xl">
                  Row {cell.r}, Column {cell.c}
                  {cell.cell && (
                    <div className="text-blue-400">
                      {cell.cell.count}/{store.slot_capacity} bags {cell.cell.latest ? `· Latest #${cell.cell.latest}` : ''}
                    </div>
                  )}
                </div>
              </div>
            ))
          ))}
        </div>
      </div>
    </div>
  );
}
