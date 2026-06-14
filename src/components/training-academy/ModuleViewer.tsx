import { useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, ClipboardCheck, Download, FileText, PlaySquare, Printer, Shield, Star, Video } from 'lucide-react';
import { cn } from '../../lib/cn';
import { MarkdownRenderer } from './MarkdownRenderer';
import { QuizSection } from './QuizSection';
import { type TrainingModule, type TrainingProgress } from '../../lib/trainingAcademyData';
import { t, translateContent, translateHeading, translateModuleTitle, type TrainingLanguage } from '../../lib/trainingI18n';

export function ModuleViewer({
  modules,
  progress,
  onProgressChange,
  language,
}: {
  modules: TrainingModule[];
  progress: TrainingProgress;
  onProgressChange: (progress: TrainingProgress) => void;
  language: TrainingLanguage;
}) {
  const [selectedId, setSelectedId] = useState(modules[0]?.id ?? '');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const selected = modules.find((module) => module.id === selectedId) ?? modules[0];
  if (!selected) {
    return (
      <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
        <h2 className="text-2xl font-black">Training modules could not be loaded</h2>
        <p className="mt-2 text-sm font-semibold">Please check the Markdown training files and parser configuration.</p>
      </section>
    );
  }
  const isCompleted = progress.completedModules.includes(selected.id);
  const moduleProgress = isCompleted ? 100 : 58;

  const prioritySections = useMemo(
    () =>
      selected.sections.filter((section) =>
        ['Training Objectives', 'Step-by-Step Workflow', 'Standard Operating Procedures', 'Safety Instructions', 'Quality Standards', 'Common Mistakes', "Do & Don't", 'Real-World Examples'].some((name) =>
          section.title.includes(name)
        )
      ),
    [selected]
  );

  const markComplete = () => {
    const completedModules = isCompleted
      ? progress.completedModules.filter((id) => id !== selected.id)
      : [...new Set([...progress.completedModules, selected.id])];
    const certificates = completedModules.length >= 5 && !progress.certificates.includes('Operations Bronze')
      ? [...progress.certificates, 'Operations Bronze']
      : progress.certificates;
    onProgressChange({ ...progress, completedModules, certificates });
  };

  return (
    <section className="grid gap-6 xl:grid-cols-[22rem_1fr]">
      <div className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-xl shadow-slate-200/70 backdrop-blur">
        <div className="mb-4 flex items-center gap-2 text-lg font-black text-slate-950">
          <BookOpen className="text-[#A23EFB]" size={20} />
          {t(language, 'modules')}
        </div>
        <div className="flex max-h-[42rem] flex-col gap-2 overflow-y-auto pe-1">
          {modules.map((module) => {
            const active = module.id === selected.id;
            const done = progress.completedModules.includes(module.id);
            return (
              <button
                key={module.id}
                type="button"
                onClick={() => setSelectedId(module.id)}
                className={cn(
                  'rounded-2xl border p-3 text-start transition',
                  active ? 'border-[#A23EFB]/35 bg-[#F5EAFE] shadow-lg shadow-[#A23EFB]/10' : 'border-slate-100 bg-white hover:border-[#A23EFB]/25'
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-[#A23EFB]">Module {module.number}</span>
                  {done && <CheckCircle2 size={16} className="text-emerald-500" />}
                </div>
                <div className="mt-1 line-clamp-2 font-black text-slate-950">{translateModuleTitle(module.title, language)}</div>
                <div className="mt-2 flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>{module.department}</span>
                  <span>{module.duration}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <article className="flex flex-col gap-6">
        <header className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-200/70 backdrop-blur">
          <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#F1E6FF] px-3 py-1 text-xs font-black text-[#A23EFB]">Module {selected.number}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{selected.difficulty}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{selected.department}</span>
              </div>
              <h2 className="mt-4 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">
                {translateModuleTitle(selected.title, language)}
              </h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  [t(language, 'difficulty'), selected.difficulty],
                  [t(language, 'duration'), selected.duration],
                  [t(language, 'completionStatus'), isCompleted ? 'Complete' : 'In progress'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</div>
                    <div className="mt-1 font-black text-slate-900">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-slate-950 to-[#312266] p-5 text-white">
              <div className="flex items-center gap-2 text-sm font-black">
                <Star size={18} className="text-amber-300" />
                Module progress
              </div>
              <div className="mt-5 text-5xl font-black">{moduleProgress}%</div>
              <div className="mt-4 h-2 rounded-full bg-white/15">
                <div className="h-full rounded-full bg-gradient-to-r from-white to-amber-200" style={{ width: `${moduleProgress}%` }} />
              </div>
              <button
                type="button"
                onClick={markComplete}
                className="mt-5 w-full rounded-2xl bg-white px-4 py-3 text-sm font-black text-[#43209B]"
              >
                {isCompleted ? 'Reopen module' : t(language, 'completeTask')}
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Video, title: 'Training video', text: 'Placeholder for branch demonstration video.' },
            { icon: ClipboardCheck, title: 'Workflow timeline', text: 'Interactive cards convert SOP steps into live practice.' },
            { icon: Shield, title: 'Safety focus', text: 'Safety warnings stay visible during every operational module.' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-lg shadow-slate-200/60">
                <Icon className="text-[#A23EFB]" size={24} />
                <div className="mt-3 font-black text-slate-950">{item.title}</div>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{item.text}</p>
              </div>
            );
          })}
        </section>

        <section className="grid gap-4">
          {prioritySections.map((section, index) => {
            const open = openSections[section.title] ?? index < 3;
            return (
              <div key={section.title} className="overflow-hidden rounded-3xl border border-white/70 bg-white shadow-xl shadow-slate-200/60">
                <button
                  type="button"
                  onClick={() => setOpenSections((current) => ({ ...current, [section.title]: !open }))}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-start"
                >
                  <span className="text-lg font-black text-slate-950">{translateHeading(section.title, language)}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">{open ? 'Open' : 'View'}</span>
                </button>
                {open && (
                  <div className="border-t border-slate-100 p-5">
                    <MarkdownRenderer markdown={translateContent(section.body, language)} />
                  </div>
                )}
              </div>
            );
          })}
        </section>

        <QuizSection sections={selected.sections} language={language} />

        <section className="grid gap-3 rounded-3xl border border-white/70 bg-white/80 p-5 shadow-xl shadow-slate-200/70 md:grid-cols-3">
          <button type="button" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white">
            <Download size={17} /> {t(language, 'downloadPdf')}
          </button>
          <button type="button" onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F1E6FF] px-4 py-3 text-sm font-black text-[#A23EFB]">
            <Printer size={17} /> {t(language, 'printSop')}
          </button>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700">
            <FileText size={17} className="text-[#A23EFB]" />
            <input type="text" placeholder={t(language, 'notes')} className="min-w-0 flex-1 bg-transparent outline-none" />
          </label>
        </section>
      </article>
    </section>
  );
}
