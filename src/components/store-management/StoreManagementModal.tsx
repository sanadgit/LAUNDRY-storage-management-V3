import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type StoreManagementModalProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  allowOverlayClose?: boolean;
  children: ReactNode;
  className?: string;
};

export default function StoreManagementModal({
  open,
  title,
  subtitle,
  onClose,
  allowOverlayClose = true,
  children,
  className,
}: StoreManagementModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (!allowOverlayClose) return;
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, allowOverlayClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
      onMouseDown={() => {
        if (!allowOverlayClose) return;
        onClose();
      }}
    >
      <div
        className={cn(
          'w-full max-w-3xl rounded-[20px] border border-[#263B5B] bg-[#0D1B2E] shadow-[0_24px_60px_rgba(0,0,0,0.5),0_0_24px_rgba(47,125,255,0.16)]',
          className
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3 border-b border-[#263B5B] flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-white text-base sm:text-lg font-black truncate">{title}</h2>
            {subtitle ? <p className="mt-1 text-[11px] sm:text-xs text-[#8EA2BD]">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-xl border border-[#263B5B] text-slate-200 hover:text-white hover:bg-[#17263A] shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[76vh] overflow-y-auto p-4 sm:p-5">{children}</div>
      </div>
    </div>
  );
}
