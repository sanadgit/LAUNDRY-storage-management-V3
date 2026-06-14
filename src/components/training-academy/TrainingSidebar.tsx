import {
  AlertTriangle,
  BarChart3,
  Bot,
  CheckSquare,
  ChevronLeft,
  ClipboardList,
  FileBadge,
  GraduationCap,
  Languages,
  Library,
  Presentation,
  ShieldCheck,
  UserCog,
} from 'lucide-react';
import { cn } from '../../lib/cn';
import { t, type TrainingLanguage } from '../../lib/trainingI18n';

export type AcademyView =
  | 'modules'
  | 'sops'
  | 'quick'
  | 'supervisor'
  | 'checklists'
  | 'kpi'
  | 'incidents'
  | 'certificates'
  | 'assistant'
  | 'presentation';

const iconMap = {
  modules: GraduationCap,
  sops: Library,
  quick: ClipboardList,
  supervisor: UserCog,
  checklists: CheckSquare,
  kpi: BarChart3,
  incidents: AlertTriangle,
  certificates: FileBadge,
  assistant: Bot,
  presentation: Presentation,
};

const nav: Array<{ id: AcademyView; labelKey: string; status: string }> = [
  { id: 'modules', labelKey: 'modules', status: '19' },
  { id: 'sops', labelKey: 'sopLibrary', status: '15' },
  { id: 'quick', labelKey: 'quickGuides', status: 'Ready' },
  { id: 'supervisor', labelKey: 'supervisorTools', status: 'Live' },
  { id: 'checklists', labelKey: 'dailyChecklists', status: '5' },
  { id: 'kpi', labelKey: 'kpiCenter', status: 'KPI' },
  { id: 'incidents', labelKey: 'incidentReports', status: 'Forms' },
  { id: 'certificates', labelKey: 'certificatesTitle', status: '1' },
  { id: 'assistant', labelKey: 'aiAssistant', status: 'AI' },
  { id: 'presentation', labelKey: 'presentationMode', status: 'Deck' },
];

export function TrainingSidebar({
  activeView,
  onChange,
  collapsed,
  onToggle,
  language,
  isRtl,
}: {
  activeView: AcademyView;
  onChange: (view: AcademyView) => void;
  collapsed: boolean;
  onToggle: () => void;
  language: TrainingLanguage;
  isRtl: boolean;
}) {
  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-screen shrink-0 border-white/50 bg-white/70 p-4 shadow-2xl shadow-[#6771F5]/10 backdrop-blur-2xl lg:flex lg:flex-col',
        collapsed ? 'w-24' : 'w-80',
        isRtl ? 'order-2 border-s' : 'order-1 border-e'
      )}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#A23EFB] to-[#6771F5] text-white shadow-lg shadow-[#A23EFB]/25">
            <ShieldCheck size={24} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-lg font-black text-slate-950">In & Out Academy</div>
              <div className="truncate text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Operations University</div>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="grid size-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:text-[#A23EFB]"
          aria-label="Toggle training sidebar"
        >
          <ChevronLeft className={cn('transition', collapsed ? 'rotate-180' : '', isRtl ? 'rotate-180' : '')} size={18} />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-2 overflow-y-auto">
        {nav.map((item) => {
          const Icon = iconMap[item.id];
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-3 py-3 text-start transition',
                active
                  ? 'bg-gradient-to-r from-[#A23EFB] to-[#6771F5] text-white shadow-lg shadow-[#A23EFB]/20'
                  : 'text-slate-600 hover:bg-white hover:text-slate-950'
              )}
            >
              <Icon size={20} className="shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 font-black">{t(language, item.labelKey)}</span>
                  <span className={cn('rounded-full px-2 py-1 text-[10px] font-black', active ? 'bg-white/20' : 'bg-slate-100 text-slate-500')}>
                    {item.status}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="mt-4 rounded-3xl border border-[#A23EFB]/15 bg-gradient-to-br from-white to-[#F4EEFF] p-4">
          <div className="flex items-center gap-2 text-sm font-black text-slate-950">
            <Languages size={18} className="text-[#A23EFB]" />
            {t(language, 'firstLogin')}
          </div>
          <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
            RTL is enabled automatically for Arabic and Urdu.
          </p>
        </div>
      )}
    </aside>
  );
}
