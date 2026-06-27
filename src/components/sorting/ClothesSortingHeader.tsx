import { Shirt, Sparkles, Volume2, VolumeX } from 'lucide-react';

type ClothesSortingFocusTarget = {
  order_no: string;
  label: string;
} | null;

type ClothesSortingHeaderProps = {
  focusPlacement: ClothesSortingFocusTarget;
  audioGuidanceEnabled: boolean;
  onClearFocus: () => void;
  onToggleAudioGuidance: () => void;
};

export default function ClothesSortingHeader({
  focusPlacement,
  audioGuidanceEnabled,
  onClearFocus,
  onToggleAudioGuidance,
}: ClothesSortingHeaderProps) {
  // Note: This component is the first visible extraction from the clothes-sorting workflow.
  return (
    <>
      {focusPlacement && (
        <div className="rounded-2xl border border-indigo-300 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 px-3 py-3 text-white shadow-[0_0_35px_rgba(59,130,246,0.35)] animate-pulse">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-indigo-100">
              <Sparkles size={14} /> Focus Mode
            </div>
            <button
              type="button"
              onClick={onClearFocus}
              className="rounded-lg border border-white/40 bg-white/15 px-2 py-1 text-[10px] font-black uppercase tracking-wider"
            >
              Clear Focus
            </button>
          </div>
          <div className="mt-2 text-sm sm:text-base font-black">
            Order {focusPlacement.order_no} → {focusPlacement.label}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
            <Shirt size={22} />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900">Clothes Sorting</div>
            <div className="text-xs font-bold text-blue-500">Operator sorting interface</div>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleAudioGuidance}
          className={`rounded-xl border px-3 py-2 text-[11px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 ${
            audioGuidanceEnabled
              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
              : 'border-slate-300 bg-white text-slate-600'
          }`}
        >
          {audioGuidanceEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          Voice {audioGuidanceEnabled ? 'On' : 'Off'}
        </button>
      </div>
    </>
  );
}
