import { BarChart3, Medal, TrendingDown, TrendingUp, Users } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { translateContent, type TrainingLanguage, t } from '../../lib/trainingI18n';

const kpis = [
  { label: 'Pieces / labor hour', value: '42', trend: '+8%', good: true },
  { label: 'Rewash rate', value: '2.4%', trend: '-1.1%', good: true },
  { label: 'On-time delivery', value: '96%', trend: '+3%', good: true },
  { label: 'Scan compliance', value: '98%', trend: '+2%', good: true },
  { label: 'Complaint closure', value: '1.6h', trend: '-24m', good: true },
];

export function KPIAnalytics({ markdown, language }: { markdown: string; language: TrainingLanguage }) {
  return (
    <section className="flex flex-col gap-5">
      <div className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-xl shadow-slate-200/70">
        <div className="flex items-center gap-3">
          <div className="grid size-14 place-items-center rounded-3xl bg-gradient-to-br from-[#A23EFB] to-[#6771F5] text-white">
            <BarChart3 size={26} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-950">{t(language, 'kpiCenter')}</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">Productivity, quality, delivery, and team performance learning center.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {kpis.map((item) => (
          <div key={item.label} className="rounded-3xl border border-white/70 bg-white p-5 shadow-xl shadow-slate-200/60">
            <div className="text-sm font-black text-slate-500">{item.label}</div>
            <div className="mt-3 text-3xl font-black text-slate-950">{item.value}</div>
            <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-600">
              {item.good ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {item.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/70 bg-white p-5 shadow-xl shadow-slate-200/60">
          <h3 className="mb-4 text-xl font-black text-slate-950">Performance heatmap</h3>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, index) => {
              const intensity = index % 5;
              const colors = ['bg-slate-100', 'bg-[#E8DDFF]', 'bg-[#C9B1FF]', 'bg-[#9B74FF]', 'bg-[#6B4DFF]'];
              return <div key={index} className={`h-12 rounded-xl ${colors[intensity]}`} title={`Training score ${70 + intensity * 7}%`} />;
            })}
          </div>
        </div>
        <div className="rounded-3xl border border-white/70 bg-white p-5 shadow-xl shadow-slate-200/60">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-black text-slate-950">
            <Medal className="text-amber-500" size={22} />
            Employee ranking
          </h3>
          {['Amina - Reception', 'Ravi - Pressing', 'Mariam - QC', 'Khalid - Delivery'].map((name, index) => (
            <div key={name} className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0">
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-2xl bg-slate-100 font-black text-slate-700">{index + 1}</div>
                <div className="font-black text-slate-800">{name}</div>
              </div>
              <div className="font-black text-[#A23EFB]">{98 - index * 3}%</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-white/70 bg-white p-5 shadow-xl shadow-slate-200/60">
        <h3 className="mb-4 flex items-center gap-2 text-xl font-black text-slate-950">
          <Users size={22} className="text-[#A23EFB]" />
          KPI source guide
        </h3>
        <MarkdownRenderer markdown={translateContent(markdown, language)} compact />
      </div>
    </section>
  );
}
