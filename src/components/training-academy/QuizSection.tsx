import { useMemo, useState } from 'react';
import { Check, HelpCircle } from 'lucide-react';
import { cn } from '../../lib/cn';
import { type TrainingSection } from '../../lib/trainingAcademyData';
import { t, type TrainingLanguage, translateContent } from '../../lib/trainingI18n';

export function QuizSection({ sections, language }: { sections: TrainingSection[]; language: TrainingLanguage }) {
  const quiz = useMemo(() => {
    const section = sections.find((item) => item.title.includes('Quiz')) ?? sections.find((item) => item.title.includes('Worker Questions'));
    return (section?.body ?? '')
      .split('\n')
      .map((line) => line.replace(/^-\s+/, '').trim())
      .filter(Boolean)
      .slice(0, 5);
  }, [sections]);
  const [answered, setAnswered] = useState<Record<string, boolean>>({});

  if (!quiz.length) return null;

  return (
    <section className="rounded-3xl border border-[#A23EFB]/15 bg-white p-5 shadow-xl shadow-slate-200/60">
      <div className="mb-4 flex items-center gap-2 text-xl font-black text-slate-950">
        <HelpCircle className="text-[#A23EFB]" size={22} />
        {t(language, 'quiz')}
      </div>
      <div className="grid gap-3">
        {quiz.map((question) => {
          const active = answered[question];
          return (
            <button
              key={question}
              type="button"
              onClick={() => setAnswered((current) => ({ ...current, [question]: !current[question] }))}
              className={cn(
                'flex items-start gap-3 rounded-2xl border px-4 py-3 text-start transition',
                active ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-[#A23EFB]/30'
              )}
            >
              <span className={cn('mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border', active ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white')}>
                {active && <Check size={14} />}
              </span>
              <span className="font-bold">{translateContent(question, language)}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
