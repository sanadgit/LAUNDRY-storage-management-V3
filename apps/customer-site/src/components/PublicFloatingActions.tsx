import React, { useMemo, useState } from 'react';
import { Bot, CalendarClock, MessageCircle, PhoneCall, Search, Send, Sparkles, Store, Tag, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { SiteConfig } from '../types';
import { SiteLanguage, localize } from '../lib/i18n';
import { Button } from './ui';

interface PublicFloatingActionsProps {
  config: SiteConfig;
  language: SiteLanguage;
  setRoute: (route: string) => void;
}

const toWhatsAppUrl = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  const normalized = digits.startsWith('0') ? `971${digits.slice(1)}` : digits;
  return `https://wa.me/${normalized}`;
};

export const PublicFloatingActions: React.FC<PublicFloatingActionsProps> = ({ config, language, setRoute }) => {
  const [aiOpen, setAiOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const whatsappUrl = useMemo(() => toWhatsAppUrl(config.whatsapp_number), [config.whatsapp_number]);

  return (
    <>
      <div className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-40 flex flex-col gap-3 ltr:right-4 rtl:left-4 md:bottom-6 md:ltr:right-6 md:rtl:left-6">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group grid size-13 place-items-center rounded-pill bg-secondary text-white shadow-high transition duration-base hover:-translate-y-1 hover:shadow-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transform-none motion-reduce:transition-none md:size-14"
          aria-label={localize(language, 'تواصل عبر واتساب', 'Contact us on WhatsApp')}
        >
          <MessageCircle aria-hidden="true" className="size-6" />
          <span className="absolute -top-1 -end-1 grid size-5 place-items-center rounded-pill bg-accent text-[10px] font-black text-white">1</span>
        </a>

        <button
          type="button"
          onClick={() => setAiOpen((open) => !open)}
          className="relative grid size-13 place-items-center rounded-pill border border-white/60 bg-gradient-to-br from-primary to-[#592EF2] text-white shadow-high transition duration-base hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transform-none motion-reduce:transition-none md:size-14"
          aria-expanded={aiOpen}
          aria-controls="ai-assistant-placeholder"
          aria-label={localize(language, 'فتح مساعد الذكاء الاصطناعي', 'Open AI assistant')}
        >
          <span className="absolute inset-0 rounded-pill bg-accent/20 motion-safe:animate-ping" aria-hidden="true" />
          <Bot aria-hidden="true" className="relative size-6" />
        </button>
      </div>

      <AnimatePresence>
        {aiOpen ? (
          <motion.section
            id="ai-assistant-placeholder"
            role="dialog"
            aria-modal="false"
            aria-labelledby="ai-assistant-title"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
            className="fixed bottom-36 z-40 w-[calc(100vw-2rem)] max-w-sm rounded-[1.75rem] border border-white/60 bg-white/72 p-4 text-card-foreground shadow-high backdrop-blur-3xl ltr:right-4 rtl:left-4 md:bottom-24 md:ltr:right-6 md:rtl:left-6 dark:border-white/10 dark:bg-surface/82"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.1em] text-primary">
                  <Sparkles aria-hidden="true" className="size-4" />
                  Layla AI
                </p>
                <h2 id="ai-assistant-title" className="mt-2 text-lg font-black text-foreground">
                  {localize(language, 'مساعد الغسيل الذكي', 'Intelligent laundry concierge')}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setAiOpen(false)}
                className="grid size-10 place-items-center rounded-md border border-border bg-surface text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={localize(language, 'إغلاق مساعد الذكاء الاصطناعي', 'Close AI assistant')}
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>

            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {localize(
                language,
                'مرحبًا، أنا Layla. أساعدك في الحجز، التتبع، الأسعار، الفروع، أو تحويلك لفريق الدعم عند الحاجة.',
                'Hi, I am Layla. I can help with booking, tracking, prices, branches, or route you to support.',
              )}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                { icon: CalendarClock, label: localize(language, 'حجز', 'Book'), route: '/book' },
                { icon: Search, label: localize(language, 'تتبع', 'Track'), route: '/track' },
                { icon: Tag, label: localize(language, 'الأسعار', 'Prices'), route: '/pricing' },
                { icon: Store, label: localize(language, 'الفروع', 'Branches'), route: '/branches' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.route}
                    type="button"
                    onClick={() => setRoute(item.route)}
                    className="flex min-h-12 items-center justify-center gap-2 rounded-lg border border-white/70 bg-white/72 px-3 text-sm font-bold text-foreground shadow-low transition hover:border-primary/30 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-white/10 dark:bg-white/[0.04]"
                  >
                    <Icon aria-hidden="true" className="size-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 grid gap-2">
              <Button variant="primary" onClick={() => setRoute('/contact')}>
                <Send data-icon="inline-start" aria-hidden="true" />
                {localize(language, 'إرسال رسالة واتساب', 'Send WhatsApp message')}
              </Button>
              <Button variant="secondary" onClick={() => setRoute('/complaint')}>
                <PhoneCall data-icon="inline-start" aria-hidden="true" />
                {localize(language, 'شكوى أو تصعيد', 'Complaint or escalation')}
              </Button>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </>
  );
};
