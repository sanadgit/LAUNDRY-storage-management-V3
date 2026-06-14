import { useState } from 'react';
import { Maximize2, Play, SkipBack, SkipForward } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { type ChecklistItem } from '../../lib/trainingAcademyData';
import { translateContent, type TrainingLanguage, t } from '../../lib/trainingI18n';

export function PresentationViewer({ slides, language }: { slides: ChecklistItem[]; language: TrainingLanguage }) {
  const [index, setIndex] = useState(0);
  const active = slides[index] ?? slides[0];

  return (
    <section className="flex flex-col gap-5">
      <div className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-slate-200/70">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-black text-slate-950">{t(language, 'presentationMode')}</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">Slide preview, fullscreen training mode, and carousel viewer.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIndex(Math.max(0, index - 1))} className="grid size-11 place-items-center rounded-2xl bg-slate-100 text-slate-700" type="button"><SkipBack size={18} /></button>
            <button onClick={() => setIndex(Math.min(slides.length - 1, index + 1))} className="grid size-11 place-items-center rounded-2xl bg-[#A23EFB] text-white" type="button"><SkipForward size={18} /></button>
          </div>
        </div>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_22rem]">
        <div className="min-h-[34rem] rounded-[2rem] bg-gradient-to-br from-slate-950 via-[#312266] to-[#6771F5] p-8 text-white shadow-2xl shadow-[#6771F5]/20">
          <div className="flex items-center justify-between gap-4">
            <div className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em]">Slide {index + 1}/{slides.length}</div>
            <div className="flex gap-2">
              <button type="button" className="grid size-10 place-items-center rounded-2xl bg-white/10"><Play size={18} /></button>
              <button type="button" onClick={() => document.documentElement.requestFullscreen?.()} className="grid size-10 place-items-center rounded-2xl bg-white/10"><Maximize2 size={18} /></button>
            </div>
          </div>
          <h3 className="mt-12 max-w-3xl text-5xl font-black leading-tight">{active.title}</h3>
          <div className="mt-8 max-w-3xl rounded-3xl border border-white/15 bg-white/10 p-5 text-white backdrop-blur">
            <MarkdownRenderer markdown={translateContent(active.body.split('\n').slice(0, 12).join('\n'), language)} compact />
          </div>
        </div>
        <div className="flex max-h-[38rem] flex-col gap-2 overflow-y-auto">
          {slides.map((slide, slideIndex) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setIndex(slideIndex)}
              className={`rounded-2xl border p-4 text-start font-black transition ${slideIndex === index ? 'border-[#A23EFB]/35 bg-[#F5EAFE] text-[#6421C8]' : 'border-white bg-white/80 text-slate-700'}`}
            >
              <span className="text-xs text-slate-400">Slide {slideIndex + 1}</span>
              <div>{slide.title}</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
