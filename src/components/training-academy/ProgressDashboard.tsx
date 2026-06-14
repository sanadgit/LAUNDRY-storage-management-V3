import { Award, Bookmark, CalendarCheck, CheckCircle2, Clock, Flame } from 'lucide-react';
import { cn } from '../../lib/cn';
import { type TrainingProgress } from '../../lib/trainingAcademyData';
import { t, type TrainingLanguage } from '../../lib/trainingI18n';

export function ProgressDashboard({
  progress,
  totalModules,
  language,
}: {
  progress: TrainingProgress;
  totalModules: number;
  language: TrainingLanguage;
}) {
  const completion = Math.round((progress.completedModules.length / Math.max(totalModules, 1)) * 100);
  const cards = [
    { label: t(language, 'overallProgress'), value: `${completion}%`, icon: CheckCircle2, color: 'from-emerald-500 to-teal-500' },
    { label: 'Learning streak', value: `${progress.streak} days`, icon: Flame, color: 'from-orange-500 to-rose-500' },
    { label: t(language, 'certificates'), value: progress.certificates.length, icon: Award, color: 'from-amber-500 to-yellow-500' },
    { label: 'Bookmarks', value: progress.favoriteSops.length, icon: Bookmark, color: 'from-[#A23EFB] to-[#6771F5]' },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-xl shadow-slate-200/70 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-black text-slate-500">{card.label}</div>
                <div className="mt-2 text-3xl font-black text-slate-950">{card.value}</div>
              </div>
              <div className={cn('grid size-12 place-items-center rounded-2xl bg-gradient-to-br text-white', card.color)}>
                <Icon size={22} />
              </div>
            </div>
          </div>
        );
      })}
      <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-xl shadow-slate-200/70 backdrop-blur md:col-span-2 xl:col-span-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-black text-slate-950">
            <CalendarCheck size={18} className="text-[#A23EFB]" />
            Continue learning timeline
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Clock size={14} /> {progress.completedModules.length}/{totalModules}
          </div>
        </div>
        <div className="h-3 rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-gradient-to-r from-[#A23EFB] to-[#6771F5]" style={{ width: `${completion}%` }} />
        </div>
      </div>
    </section>
  );
}
