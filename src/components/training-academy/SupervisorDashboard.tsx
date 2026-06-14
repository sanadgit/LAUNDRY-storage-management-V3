import { ClipboardCheck, Clock, ShieldCheck, UserCheck } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { translateContent, type TrainingLanguage, t } from '../../lib/trainingI18n';

export function SupervisorDashboard({ markdown, language }: { markdown: string; language: TrainingLanguage }) {
  const cards = [
    { label: 'Staff monitoring', value: '12 active', icon: UserCheck },
    { label: 'Quality inspections', value: '38 today', icon: ClipboardCheck },
    { label: 'Shift handovers', value: '2 pending', icon: Clock },
    { label: 'Safety actions', value: 'Clear', icon: ShieldCheck },
  ];

  return (
    <section className="flex flex-col gap-5">
      <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl shadow-slate-300">
        <h2 className="text-3xl font-black">{t(language, 'supervisorTools')}</h2>
        <p className="mt-2 text-sm font-semibold text-white/65">Team monitoring, shift management, quality inspection, attendance, and escalation control.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-3xl border border-white/70 bg-white p-5 shadow-xl shadow-slate-200/60">
              <Icon className="text-[#A23EFB]" size={24} />
              <div className="mt-4 text-sm font-black text-slate-500">{card.label}</div>
              <div className="mt-1 text-2xl font-black text-slate-950">{card.value}</div>
            </div>
          );
        })}
      </div>
      <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-3xl border border-white/70 bg-white p-5 shadow-xl shadow-slate-200/60">
          <h3 className="mb-4 text-xl font-black text-slate-950">Shift command board</h3>
          {['Urgent orders staged', 'Packaging audit at 4 PM', 'Machine 2 maintenance note', 'Evening handover needed'].map((item, index) => (
            <label key={item} className="flex items-center gap-3 border-b border-slate-100 py-3 last:border-0">
              <input type="checkbox" defaultChecked={index < 2} className="size-5 accent-[#A23EFB]" />
              <span className="font-bold text-slate-700">{item}</span>
            </label>
          ))}
        </div>
        <div className="rounded-3xl border border-white/70 bg-white p-5 shadow-xl shadow-slate-200/60">
          <MarkdownRenderer markdown={translateContent(markdown, language)} compact />
        </div>
      </div>
    </section>
  );
}
