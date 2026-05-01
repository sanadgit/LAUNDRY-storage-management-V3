import { useEffect, useRef } from 'react';
import { EllipsisVertical, Lock } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type StoreControlBarProps = {
  stores: Array<{ store_name: string }>;
  selectedStore: string | null;
  lockedStores: Record<string, boolean>;
  onSelectStore: (storeName: string) => void;
  onOpenManagement: (storeName: string) => void;
  className?: string;
};

const LONG_PRESS_MS = 520;

export default function StoreControlBar({
  stores,
  selectedStore,
  lockedStores,
  onSelectStore,
  onOpenManagement,
  className,
}: StoreControlBarProps) {
  const longPressRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (longPressRef.current != null) {
        window.clearTimeout(longPressRef.current);
      }
    };
  }, []);

  return (
    <div
      dir="ltr"
      className={cn(
        'warehouse-store-tabs flex items-center justify-start gap-1.5 overflow-x-auto no-scrollbar [direction:ltr]',
        className
      )}
    >
      {stores.map((store) => {
        const active = selectedStore === store.store_name;
        const locked = Boolean(lockedStores[store.store_name]);
        return (
          <button
            key={store.store_name}
            type="button"
            onClick={() => onSelectStore(store.store_name)}
            onContextMenu={(event) => {
              event.preventDefault();
              onOpenManagement(store.store_name);
            }}
            onPointerDown={(event) => {
              if (event.pointerType !== 'touch') return;
              if (longPressRef.current != null) {
                window.clearTimeout(longPressRef.current);
              }
              longPressRef.current = window.setTimeout(() => {
                onOpenManagement(store.store_name);
              }, LONG_PRESS_MS);
            }}
            onPointerUp={() => {
              if (longPressRef.current != null) {
                window.clearTimeout(longPressRef.current);
                longPressRef.current = null;
              }
            }}
            onPointerCancel={() => {
              if (longPressRef.current != null) {
                window.clearTimeout(longPressRef.current);
                longPressRef.current = null;
              }
            }}
            className={cn(
              'warehouse-store-tab px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3 rounded-xl sm:rounded-2xl font-bold whitespace-nowrap transition-all text-[11px] sm:text-[13px] lg:text-[15px] flex items-center gap-2',
              active
                ? 'warehouse-store-tab--active bg-[#2F7DFF] text-white shadow-[0_0_16px_rgba(47,125,255,0.45)] border border-blue-300/25'
                : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'
            )}
            title={locked ? `${store.store_name} (Locked)` : store.store_name}
          >
            <span>{store.store_name}</span>
            {locked ? <Lock size={12} className="opacity-85 text-amber-300" /> : null}
            {active ? (
              <span
                role="button"
                tabIndex={0}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onOpenManagement(store.store_name);
                }}
                className="ml-0.5 rounded-lg p-0.5 bg-white/10 hover:bg-white/20"
                title="Store actions"
              >
                <EllipsisVertical size={13} />
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
