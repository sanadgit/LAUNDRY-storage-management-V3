import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { CheckCircle2, CircleDotDashed } from 'lucide-react';
import { JOURNEY_STEPS } from '../constants';
import { LaundryIcon } from './LaundryIcon';
import { SiteLanguage, localize } from '../lib/i18n';

const JOURNEY_EN = [
  {
    fullLabel: 'In: Pickup Request',
    note: 'Your order starts with a clear pickup request, driver assignment, and WhatsApp confirmation.',
    chips: ['Pickup', 'Driver', 'WhatsApp'],
  },
  {
    fullLabel: 'In: Branch Receiving',
    note: 'The branch receives and counts the clothes, then links the pickup order with the system order.',
    chips: ['Receiving', 'Counting', 'POS Sync'],
  },
  {
    fullLabel: 'Care: Sorting & Cleaning',
    note: 'Items are sorted by garment type and service, then processed through the right cleaning workflow.',
    chips: ['Sorting', 'Washing', 'Dry Cleaning'],
  },
  {
    fullLabel: 'Care: Pressing & Finishing',
    note: 'Every item is pressed, checked, and prepared with the finish expected from In & Out Laundry.',
    chips: ['Ironing', 'Quality Check', 'Finishing'],
  },
  {
    fullLabel: 'Out: Ready Invoice',
    note: 'Once ready, the invoice and status become visible in the customer dashboard.',
    chips: ['Invoice', 'Dashboard', 'Ready'],
  },
  {
    fullLabel: 'Out: Delivery',
    note: 'The driver receives the delivery details and location link to complete the order smoothly.',
    chips: ['Delivery', 'Location Link', 'Done'],
  },
];

export const JourneySection: React.FC<{ language?: SiteLanguage }> = ({ language = 'ar' }) => {
  const [activeStep, setActiveStep] = useState(0);
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const progressWidth = useTransform(scrollYProgress, [0.1, 0.88], ['0%', '100%']);
  const sceneRotate = useTransform(scrollYProgress, [0, 1], [-8, 8]);
  const sceneY = useTransform(scrollYProgress, [0, 1], [34, -34]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-brand-bg py-24 lg:py-32" id="journey">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <p className="mb-3 text-sm font-black text-primary">{localize(language, 'رحلة الطلب', 'Order Journey')}</p>
          <h2 className="text-balance text-4xl font-black leading-tight text-secondary md:text-6xl">
            {localize(language, 'كل قطعة تدخل من باب واضح وتخرج جاهزة بثقة.', 'Every item enters through a clear door and leaves ready with confidence.')}
          </h2>
          <p className="mt-6 max-w-xl text-base font-semibold leading-8 text-slate-600">
            {localize(language, 'نفس فكرة الاسم تتحول إلى تجربة مرئية: دخول، معالجة، ثم خروج. كل مرحلة موثقة وقابلة للتتبع من أول الاستلام حتى آخر تسليم.', 'The brand idea becomes a visible workflow: in, care, and out. Every step is documented and trackable from pickup to delivery.')}
          </p>

          <motion.div style={{ y: sceneY, rotate: sceneRotate }} className="mt-12 hidden h-[360px] lg:block" dir="ltr">
            <div className="relative h-full rounded-[36px] bg-white shadow-[0_30px_100px_rgba(15,23,42,0.08)]">
              <div className="absolute left-8 top-10 h-36 w-36 rounded-full bg-[#fbf0ff] shadow-inner" />
              <div className="absolute right-8 top-10 h-36 w-36 rounded-full bg-[#f5e7ff] shadow-inner" />
              <div className="water-ribbon absolute left-16 right-16 top-[46%] h-16 -rotate-3 rounded-full" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                className="washer-glass absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border-[18px] border-white shadow-xl"
              />
              <div className="absolute bottom-8 left-10 text-left">
                <p className="text-4xl font-black text-primary">IN</p>
                <p className="text-xs font-black tracking-[0.28em] text-slate-400">PICKUP</p>
              </div>
              <div className="absolute bottom-8 right-10 text-right">
                <p className="text-4xl font-black text-primary">OUT</p>
                <p className="text-xs font-black tracking-[0.28em] text-slate-400">DELIVERY</p>
              </div>
            </div>
          </motion.div>
        </div>

        <div>
          <div className="relative mb-10 h-2 overflow-hidden rounded-full bg-white shadow-inner">
            <motion.div style={{ width: progressWidth }} className="h-full rounded-full bg-gradient-to-l from-success via-primary to-secondary" />
          </div>

          <div className="space-y-5">
            {JOURNEY_STEPS.map((step, idx) => {
              const englishStep = JOURNEY_EN[idx] ?? JOURNEY_EN[0];
              const fullLabel = language === 'ar' ? step.fullLabel : englishStep.fullLabel;
              const note = language === 'ar' ? step.note : englishStep.note;
              const chips = language === 'ar' ? step.chips : englishStep.chips;
              const isActive = activeStep === idx;
              return (
                <motion.button
                  key={fullLabel}
                  onClick={() => setActiveStep(idx)}
                  onViewportEnter={() => setActiveStep(idx)}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ amount: 0.5, once: false }}
                  transition={{ duration: 0.45, delay: idx * 0.03 }}
                  className={`group relative w-full overflow-hidden rounded-[24px] border p-5 text-right transition-all md:p-7 ${
                    isActive
                      ? 'border-primary/30 bg-white shadow-[0_24px_70px_rgba(89,46,242,0.12)]'
                      : 'border-white/80 bg-white/70 shadow-[0_12px_36px_rgba(15,23,42,0.04)] hover:border-primary/20'
                  }`}
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-start">
                    <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl shadow-inner ${
                      isActive ? 'bg-primary text-white' : 'bg-[#F4F1FF] text-secondary'
                    }`}>
                      <LaundryIcon name={step.key} alt={fullLabel} className="h-14 w-14" />
                    </div>
                    <div className="flex-1">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-2xl font-black text-secondary">{fullLabel}</h3>
                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black ${
                          isActive ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {isActive ? <CheckCircle2 size={14} /> : <CircleDotDashed size={14} />}
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <p className="text-sm font-semibold leading-7 text-slate-600">{note}</p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {chips.map((chip) => (
                          <span key={chip} className="rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-[11px] font-black text-primary">
                            {chip}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
