import { motion } from 'motion/react';
import { Award, Bell, BookOpenCheck, PlayCircle, Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/cn';
import { t, type TrainingLanguage } from '../../lib/trainingI18n';

export function TrainingHero({
  language,
  progress,
  moduleCount,
  certificates,
  onContinue,
}: {
  language: TrainingLanguage;
  progress: number;
  moduleCount: number;
  certificates: number;
  onContinue: () => void;
}) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#A23EFB] via-[#6771F5] to-[#111827] p-6 text-white shadow-2xl shadow-[#6771F5]/25 sm:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.22),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.16),transparent_26%)]" />
      <div className="relative z-10 grid gap-8 xl:grid-cols-[1fr_28rem]">
        <div className="flex flex-col justify-between gap-8">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] backdrop-blur">
              <Sparkles size={16} />
              Smart Laundry Operations University
            </div>
            <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">
              {t(language, 'academy')}
            </h1>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-white/78">
              Enterprise learning dashboard for reception, barcode tracking, production, storage, delivery, safety, supervisors, and KPI excellence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onContinue}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#5528BE] shadow-xl shadow-black/10 transition hover:-translate-y-0.5"
            >
              <PlayCircle size={18} />
              {t(language, 'continueLearning')}
            </button>
            <div className="rounded-2xl border border-white/25 bg-white/10 px-4 py-3 text-sm font-bold backdrop-blur">
              {t(language, 'dailyReminder')}: <span className="text-white/80">{t(language, 'dailyReminderText')}</span>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          {[
            { icon: TrendingUp, label: t(language, 'overallProgress'), value: `${progress}%` },
            { icon: BookOpenCheck, label: t(language, 'totalModules'), value: String(moduleCount) },
            { icon: Award, label: t(language, 'certificates'), value: String(certificates) },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="rounded-3xl border border-white/25 bg-white/15 p-5 shadow-2xl shadow-black/10 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-bold text-white/70">{item.label}</div>
                    <div className="mt-2 text-4xl font-black">{item.value}</div>
                  </div>
                  <div className="grid size-14 place-items-center rounded-2xl bg-white/18">
                    <Icon size={26} />
                  </div>
                </div>
                <div className="mt-4 h-2 rounded-full bg-white/15">
                  <div className={cn('h-full rounded-full bg-white', item.label === t(language, 'overallProgress') ? '' : 'w-3/4')} style={{ width: item.label === t(language, 'overallProgress') ? `${progress}%` : undefined }} />
                </div>
              </motion.div>
            );
          })}

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-3xl border border-white/25 bg-white/10 p-5 backdrop-blur-xl"
          >
            <div className="flex items-start gap-3">
              <Bell className="mt-1 shrink-0" size={20} />
              <div>
                <div className="font-black">Next supervisor review</div>
                <p className="mt-1 text-sm font-semibold leading-6 text-white/72">Packaging audit and scan compliance check at 4:00 PM.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
