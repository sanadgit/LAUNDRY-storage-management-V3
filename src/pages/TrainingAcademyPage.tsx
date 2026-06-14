import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, FileText, Languages, Menu, X } from 'lucide-react';
import { cn } from '../lib/cn';
import {
  academyData,
  readTrainingProgress,
  writeTrainingProgress,
  type TrainingProgress,
} from '../lib/trainingAcademyData';
import {
  getStoredTrainingLanguage,
  languageDirection,
  storeTrainingLanguage,
  t,
  translateContent,
  type TrainingLanguage,
} from '../lib/trainingI18n';
import { AITrainingAssistant } from '../components/training-academy/AITrainingAssistant';
import { ChecklistTracker } from '../components/training-academy/ChecklistTracker';
import { IncidentCenter } from '../components/training-academy/IncidentCenter';
import { KPIAnalytics } from '../components/training-academy/KPIAnalytics';
import { LanguageSelector } from '../components/training-academy/LanguageSelector';
import { MarkdownRenderer } from '../components/training-academy/MarkdownRenderer';
import { ModuleViewer } from '../components/training-academy/ModuleViewer';
import { PresentationViewer } from '../components/training-academy/PresentationViewer';
import { ProgressDashboard } from '../components/training-academy/ProgressDashboard';
import { SOPViewer } from '../components/training-academy/SOPViewer';
import { SupervisorDashboard } from '../components/training-academy/SupervisorDashboard';
import { TrainingHero } from '../components/training-academy/TrainingHero';
import { TrainingSidebar, type AcademyView } from '../components/training-academy/TrainingSidebar';

function AcademyMobileNav({
  activeView,
  onChange,
  language,
}: {
  activeView: AcademyView;
  onChange: (view: AcademyView) => void;
  language: TrainingLanguage;
}) {
  const [open, setOpen] = useState(false);
  const items: Array<{ id: AcademyView; label: string }> = [
    { id: 'modules', label: t(language, 'modules') },
    { id: 'sops', label: t(language, 'sopLibrary') },
    { id: 'checklists', label: t(language, 'dailyChecklists') },
    { id: 'kpi', label: t(language, 'kpiCenter') },
    { id: 'assistant', label: t(language, 'aiAssistant') },
  ];

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-2xl border border-white/70 bg-white/90 px-4 py-3 font-black text-slate-900 shadow-lg shadow-slate-200/60"
      >
        <span>{items.find((item) => item.id === activeView)?.label ?? t(language, 'modules')}</span>
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>
      {open && (
        <div className="mt-2 grid gap-2 rounded-3xl border border-white/70 bg-white/95 p-3 shadow-xl">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onChange(item.id);
                setOpen(false);
              }}
              className={cn('rounded-2xl px-4 py-3 text-start font-black', activeView === item.id ? 'bg-[#F1E6FF] text-[#A23EFB]' : 'text-slate-700')}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TrainingAcademyPage() {
  const [language, setLanguage] = useState<TrainingLanguage>(() => getStoredTrainingLanguage());
  const [activeView, setActiveView] = useState<AcademyView>('modules');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [progress, setProgress] = useState<TrainingProgress>(() => readTrainingProgress());
  const isRtl = languageDirection(language) === 'rtl';

  useEffect(() => {
    storeTrainingLanguage(language);
  }, [language]);

  useEffect(() => {
    writeTrainingProgress(progress);
  }, [progress]);

  const completion = useMemo(
    () => Math.round((progress.completedModules.length / Math.max(academyData.modules.length, 1)) * 100),
    [progress.completedModules.length]
  );

  const content = () => {
    if (activeView === 'modules') {
      return <ModuleViewer modules={academyData.modules} progress={progress} onProgressChange={setProgress} language={language} />;
    }
    if (activeView === 'sops') {
      return <SOPViewer sops={academyData.sops} progress={progress} onProgressChange={setProgress} language={language} />;
    }
    if (activeView === 'quick') {
      return (
        <section className="rounded-3xl border border-white/70 bg-white p-6 shadow-xl shadow-slate-200/60">
          <h2 className="mb-5 text-3xl font-black text-slate-950">{t(language, 'quickGuides')}</h2>
          <MarkdownRenderer markdown={translateContent(academyData.quickGuide, language)} />
        </section>
      );
    }
    if (activeView === 'supervisor') {
      return <SupervisorDashboard markdown={academyData.supervisor} language={language} />;
    }
    if (activeView === 'checklists') {
      return <ChecklistTracker checklists={academyData.checklists} progress={progress} onProgressChange={setProgress} language={language} />;
    }
    if (activeView === 'kpi') {
      return <KPIAnalytics markdown={academyData.kpi} language={language} />;
    }
    if (activeView === 'incidents') {
      return <IncidentCenter incidents={academyData.incidents} language={language} />;
    }
    if (activeView === 'presentation') {
      return <PresentationViewer slides={academyData.slides} language={language} />;
    }
    if (activeView === 'assistant') {
      return <AITrainingAssistant modules={academyData.modules} sops={academyData.sops} language={language} />;
    }
    return (
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {progress.certificates.map((certificate) => (
          <div key={certificate} className="rounded-[2rem] border border-amber-200 bg-gradient-to-br from-white to-amber-50 p-6 shadow-xl shadow-amber-100">
            <Award className="text-amber-500" size={34} />
            <div className="mt-6 text-2xl font-black text-slate-950">{certificate}</div>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">Issued by In & Out Laundry Operations Academy.</p>
          </div>
        ))}
        <Link to="/training-academy/translations" className="rounded-[2rem] border border-[#A23EFB]/20 bg-white p-6 shadow-xl shadow-slate-200/60">
          <Languages className="text-[#A23EFB]" size={34} />
          <div className="mt-6 text-2xl font-black text-slate-950">{t(language, 'translations')}</div>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">Open admin translation management.</p>
        </Link>
      </section>
    );
  };

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'} className="min-h-screen bg-[#F8FAFC] text-slate-950">
      <div className={cn('flex', isRtl ? 'flex-row-reverse' : 'flex-row')}>
        <TrainingSidebar
          activeView={activeView}
          onChange={setActiveView}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((value) => !value)}
          language={language}
          isRtl={isRtl}
        />
        <main className={cn('order-2 min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8', isRtl && 'order-1')}>
          <div className="mx-auto flex max-w-[96rem] flex-col gap-6">
            <header className="flex flex-col gap-4 rounded-3xl border border-white/70 bg-white/75 p-4 shadow-lg shadow-slate-200/60 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-2xl bg-slate-950 text-white">
                  <FileText size={22} />
                </div>
                <div>
                  <div className="text-sm font-black text-slate-500">{t(language, 'welcome')}</div>
                  <div className="text-xl font-black text-slate-950">In & Out Laundry Team</div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/training-academy/translations"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:text-[#A23EFB]"
                >
                  {t(language, 'translations')}
                </Link>
                <LanguageSelector language={language} onChange={setLanguage} />
              </div>
            </header>

            <AcademyMobileNav activeView={activeView} onChange={setActiveView} language={language} />

            <TrainingHero
              language={language}
              progress={completion}
              moduleCount={academyData.modules.length}
              certificates={progress.certificates.length}
              onContinue={() => setActiveView('modules')}
            />

            <ProgressDashboard progress={progress} totalModules={academyData.modules.length} language={language} />

            {content()}
          </div>
        </main>
      </div>
    </div>
  );
}
