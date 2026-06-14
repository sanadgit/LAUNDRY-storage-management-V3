import { useMemo, useState } from 'react';
import { CheckCircle2, ClipboardCheck, ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/cn';
import { MarkdownRenderer } from './MarkdownRenderer';
import { type ChecklistItem, type TrainingProgress } from '../../lib/trainingAcademyData';
import { t, translateContent, type TrainingLanguage } from '../../lib/trainingI18n';

const extractTasks = (body: string) =>
  body
    .split('\n')
    .filter((line) => line.includes('|') && !line.includes('---') && !line.includes('Done'))
    .map((line) => line.split('|')[1]?.trim())
    .filter(Boolean);

export function ChecklistTracker({
  checklists,
  progress,
  onProgressChange,
  language,
}: {
  checklists: ChecklistItem[];
  progress: TrainingProgress;
  onProgressChange: (progress: TrainingProgress) => void;
  language: TrainingLanguage;
}) {
  const [activeId, setActiveId] = useState(checklists[0]?.id ?? '');
  const active = checklists.find((item) => item.id === activeId) ?? checklists[0];
  const tasks = useMemo(() => extractTasks(active.body).slice(0, 18), [active.body]);
  const doneCount = tasks.filter((task) => progress.completedTasks.includes(`${active.id}:${task}`)).length;
  const percent = Math.round((doneCount / Math.max(tasks.length, 1)) * 100);

  const toggle = (task: string) => {
    const key = `${active.id}:${task}`;
    const completedTasks = progress.completedTasks.includes(key)
      ? progress.completedTasks.filter((item) => item !== key)
      : [...progress.completedTasks, key];
    onProgressChange({ ...progress, completedTasks });
  };

  return (
    <section className="grid gap-5 xl:grid-cols-[20rem_1fr]">
      <div className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-xl shadow-slate-200/70">
        <h2 className="mb-4 text-2xl font-black text-slate-950">{t(language, 'dailyChecklists')}</h2>
        <div className="flex flex-col gap-2">
          {checklists.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveId(item.id)}
              className={cn('rounded-2xl border p-3 text-start font-black transition', active.id === item.id ? 'border-[#A23EFB]/35 bg-[#F5EAFE] text-[#6421C8]' : 'border-slate-100 bg-white text-slate-700')}
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-200/70">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-3xl font-black text-slate-950">{active.title}</h3>
              <p className="mt-1 text-sm font-bold text-slate-500">Interactive shift status with supervisor approval.</p>
            </div>
            <div className="rounded-3xl bg-slate-950 p-5 text-white">
              <div className="text-sm font-bold text-white/60">Completion</div>
              <div className="mt-1 text-4xl font-black">{percent}%</div>
            </div>
          </div>
          <div className="mt-5 h-3 rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-gradient-to-r from-[#A23EFB] to-[#6771F5]" style={{ width: `${percent}%` }} />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {tasks.map((task) => {
            const key = `${active.id}:${task}`;
            const checked = progress.completedTasks.includes(key);
            return (
              <button
                key={task}
                type="button"
                onClick={() => toggle(task)}
                className={cn('flex items-start gap-3 rounded-2xl border p-4 text-start transition', checked ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-white bg-white/85 text-slate-700 hover:border-[#A23EFB]/30')}
              >
                <CheckCircle2 className={cn('shrink-0', checked ? 'text-emerald-500' : 'text-slate-300')} size={22} />
                <span className="font-bold">{translateContent(task, language)}</span>
              </button>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-white/70 bg-white p-5 shadow-lg shadow-slate-200/50">
            <div className="mb-3 flex items-center gap-2 font-black text-slate-950">
              <ClipboardCheck size={20} className="text-[#A23EFB]" />
              Source checklist document
            </div>
            <MarkdownRenderer markdown={translateContent(active.body, language)} compact />
          </div>
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
            <div className="flex items-center gap-2 text-xl font-black text-emerald-900">
              <ShieldCheck size={22} />
              {t(language, 'approved')}
            </div>
            <p className="mt-2 text-sm font-semibold leading-6 text-emerald-800">Supervisor signs after all critical checks are completed and incidents are recorded.</p>
            <label className="mt-4 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 font-black text-emerald-900">
              <input type="checkbox" className="size-5 accent-emerald-500" /> {t(language, 'approved')}
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}
