import { AlertTriangle, FileText, GitBranch, ShieldAlert } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { type ChecklistItem } from '../../lib/trainingAcademyData';
import { translateContent, type TrainingLanguage, t } from '../../lib/trainingI18n';

export function IncidentCenter({ incidents, language }: { incidents: ChecklistItem[]; language: TrainingLanguage }) {
  return (
    <section className="flex flex-col gap-5">
      <div className="rounded-[2rem] bg-gradient-to-br from-rose-600 to-slate-950 p-6 text-white shadow-2xl shadow-rose-200">
        <div className="flex items-center gap-3">
          <ShieldAlert size={30} />
          <div>
            <h2 className="text-3xl font-black">{t(language, 'incidentReports')}</h2>
            <p className="mt-1 text-sm font-semibold text-white/72">Damage, missing items, complaints, machine issues, and handover templates.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {[
          ['Severity triage', 'High value, legal risk, social media, and repeat complaints escalate immediately.', AlertTriangle],
          ['Evidence control', 'Photos, scan history, POS notes, and witness details stay attached to the report.', FileText],
          ['Escalation workflow', 'Staff to supervisor to branch manager, then approved customer response.', GitBranch],
        ].map(([title, text, Icon]) => (
          <div key={title as string} className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-xl shadow-slate-200/60">
            <Icon className="text-rose-500" size={24} />
            <div className="mt-3 font-black text-slate-950">{title as string}</div>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{text as string}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {incidents.map((incident) => (
          <article key={incident.id} className="rounded-3xl border border-white/70 bg-white p-5 shadow-xl shadow-slate-200/60">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-xl font-black text-slate-950">{incident.title}</h3>
              <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-600">Template</span>
            </div>
            <MarkdownRenderer markdown={translateContent(incident.body, language)} compact />
          </article>
        ))}
      </div>
    </section>
  );
}
