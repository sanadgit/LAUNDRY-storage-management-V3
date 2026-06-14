import { useMemo, useState } from 'react';
import { Bot, Send, Sparkles } from 'lucide-react';
import { type TrainingModule, type SopItem } from '../../lib/trainingAcademyData';
import { type TrainingLanguage, t } from '../../lib/trainingI18n';

export function AITrainingAssistant({
  modules,
  sops,
  language,
}: {
  modules: TrainingModule[];
  sops: SopItem[];
  language: TrainingLanguage;
}) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    { role: 'assistant', text: 'Ask me about SOPs, safety, complaints, delivery, or which module to study next.' },
  ]);
  const recommendations = useMemo(() => modules.slice(0, 4), [modules]);

  const answer = () => {
    if (!question.trim()) return;
    const q = question.toLowerCase();
    const sop = sops.find((item) => `${item.title} ${item.body}`.toLowerCase().includes(q.split(' ')[0] ?? ''));
    const module = modules.find((item) => `${item.title} ${item.raw}`.toLowerCase().includes(q.split(' ')[0] ?? ''));
    const text = sop
      ? `Recommended SOP: ${sop.title}. Start with its purpose, follow the listed steps, and escalate if any control point fails.`
      : module
        ? `Recommended module: ${module.title}. Review objectives, SOP, safety instructions, and quiz questions.`
        : 'I recommend checking Barcode Workflow, Packaging Standards, and Incident Handling when you are not sure. Always scan, verify, document, and call the supervisor for exceptions.';
    setMessages((current) => [...current, { role: 'user', text: question }, { role: 'assistant', text }]);
    setQuestion('');
  };

  return (
    <section className="grid gap-5 xl:grid-cols-[1fr_22rem]">
      <div className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-slate-200/70">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-3xl bg-gradient-to-br from-[#A23EFB] to-[#6771F5] text-white">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-950">{t(language, 'aiAssistant')}</h2>
            <p className="text-sm font-semibold text-slate-500">Local helper that searches academy modules and SOPs.</p>
          </div>
        </div>
        <div className="flex h-[32rem] flex-col rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex-1 overflow-y-auto">
            {messages.map((message, index) => (
              <div key={index} className={`mb-3 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-3xl px-4 py-3 text-sm font-semibold leading-6 ${message.role === 'user' ? 'bg-[#A23EFB] text-white' : 'bg-white text-slate-700 shadow-sm'}`}>
                  {message.text}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') answer();
              }}
              placeholder="Ask: how to handle damaged item?"
              className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none focus:border-[#A23EFB]"
            />
            <button type="button" onClick={answer} className="grid size-12 place-items-center rounded-2xl bg-slate-950 text-white">
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
      <aside className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-xl shadow-slate-200/70">
        <div className="mb-4 flex items-center gap-2 text-xl font-black text-slate-950">
          <Sparkles className="text-[#A23EFB]" size={22} />
          Smart recommendations
        </div>
        <div className="flex flex-col gap-3">
          {recommendations.map((module) => (
            <div key={module.id} className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-black text-[#A23EFB]">Module {module.number}</div>
              <div className="mt-1 font-black text-slate-900">{module.title}</div>
              <div className="mt-2 text-xs font-bold text-slate-500">{module.department} • {module.duration}</div>
            </div>
          ))}
        </div>
      </aside>
    </section>
  );
}
