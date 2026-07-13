import React, { useMemo, useState } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, FileText, ImagePlus, MessageSquare, PhoneCall, ShieldCheck } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { SiteConfig } from '../types';
import { localize, SiteLanguage } from '../lib/i18n';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Textarea } from './ui';
import { cn } from '../lib/utils';

interface PublicComplaintProps {
  config: SiteConfig;
  language: SiteLanguage;
  setRoute: (route: string) => void;
}

type ComplaintStep = 'identify' | 'details' | 'evidence' | 'review' | 'created';

type ComplaintForm = {
  orderId: string;
  name: string;
  phone: string;
  category: string;
  severity: string;
  message: string;
  preferredContact: string;
  hasEvidence: boolean;
};

type SupportContext = {
  orderId?: string;
  serviceType?: string;
  branch?: string;
  status?: string;
};

const readSupportContext = (): SupportContext | null => {
  if (typeof window === 'undefined') return null;
  try {
    const saved = window.localStorage.getItem('io_support_context');
    return saved ? JSON.parse(saved) as SupportContext : null;
  } catch {
    return null;
  }
};

const steps: ComplaintStep[] = ['identify', 'details', 'evidence', 'review', 'created'];

const stepCopy: Record<ComplaintStep, { ar: string; en: string }> = {
  identify: { ar: 'التعريف', en: 'Identify' },
  details: { ar: 'التفاصيل', en: 'Details' },
  evidence: { ar: 'المرفقات', en: 'Evidence' },
  review: { ar: 'المراجعة', en: 'Review' },
  created: { ar: 'التذكرة', en: 'Ticket' },
};

const categories = [
  { id: 'quality', ar: 'جودة الخدمة', en: 'Service quality' },
  { id: 'delay', ar: 'تأخير الاستلام أو التسليم', en: 'Pickup or delivery delay' },
  { id: 'item', ar: 'قطعة مفقودة أو تالفة', en: 'Missing or damaged item' },
  { id: 'billing', ar: 'الفاتورة أو الدفع', en: 'Billing or payment' },
];

const severities = [
  { id: 'normal', ar: 'عادي', en: 'Normal' },
  { id: 'high', ar: 'مهم', en: 'High' },
  { id: 'urgent', ar: 'عاجل', en: 'Urgent' },
];

export const PublicComplaint: React.FC<PublicComplaintProps> = ({ config, language, setRoute }) => {
  const supportContext = useMemo(() => readSupportContext(), []);
  const [activeStep, setActiveStep] = useState<ComplaintStep>('identify');
  const [ticketId, setTicketId] = useState('');
  const [form, setForm] = useState<ComplaintForm>({
    orderId: supportContext?.orderId || '',
    name: '',
    phone: '',
    category: 'quality',
    severity: 'normal',
    message: supportContext?.orderId
      ? localize(language, `طلب دعم مرتبط بالطلب ${supportContext.orderId} - ${supportContext.serviceType || ''} - ${supportContext.branch || ''}`, `Support request for order ${supportContext.orderId} - ${supportContext.serviceType || ''} - ${supportContext.branch || ''}`)
      : '',
    preferredContact: 'whatsapp',
    hasEvidence: false,
  });
  const reduceMotion = useReducedMotion();
  const activeIndex = steps.indexOf(activeStep);
  const t = (ar: string, en: string) => localize(language, ar, en);

  const selectedCategory = useMemo(() => categories.find((item) => item.id === form.category) || categories[0], [form.category]);
  const selectedSeverity = useMemo(() => severities.find((item) => item.id === form.severity) || severities[0], [form.severity]);
  const canContinue = isStepValid(activeStep, form);

  const update = <K extends keyof ComplaintForm>(key: K, value: ComplaintForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const next = () => {
    if (!canContinue) return;
    const index = steps.indexOf(activeStep);
    if (activeStep === 'review') {
      setTicketId(`CMP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
      setActiveStep('created');
      return;
    }
    setActiveStep(steps[Math.min(index + 1, steps.length - 1)]);
  };

  const back = () => {
    const index = steps.indexOf(activeStep);
    setActiveStep(steps[Math.max(index - 1, 0)]);
  };

  return (
    <main className="min-h-screen bg-background pt-24 text-foreground md:pt-28">
      <section className="border-b border-border bg-primary text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1fr_.8fr] md:items-center md:py-16 lg:px-8">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Badge variant="accent" className="mb-5 border-white/20 bg-white/10 text-white">
              {t('تذكرة واضحة', 'Clear ticket flow')}
            </Badge>
            <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-6xl">
              {t('أرسل ملاحظة أو شكوى وسيتم التعامل معها كحالة متابعة.', 'Submit feedback or a complaint as a tracked case.')}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/78 md:text-lg">
              {t(
                'نفس أسلوب المنصة: معلومات قليلة، خطوة واحدة لكل فعل رئيسي، ورقم تذكرة واضح في النهاية.',
                'The same platform logic: few fields, one main action per step, and a clear ticket ID at the end.',
              )}
            </p>
          </motion.div>

          <Card className="border-white/15 bg-white/10 text-white shadow-none backdrop-blur">
            <CardHeader>
              <CardTitle>{t('وعد المعالجة', 'Resolution promise')}</CardTitle>
              <CardDescription className="text-white/70">
                {t('تراجع الحالات حسب الأولوية وسجل الطلب.', 'Cases are reviewed by priority and order history.')}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {[
                [ShieldCheck, t('حفظ كل التفاصيل', 'Every detail is logged')],
                [PhoneCall, t('تواصل بالقناة المفضلة', 'Preferred contact channel')],
                [CheckCircle2, t('رقم تذكرة للمتابعة', 'Ticket ID for follow-up')],
              ].map(([Icon, text]) => {
                const RowIcon = Icon as React.ElementType;
                return (
                  <div key={String(text)} className="flex items-center gap-3 rounded-lg bg-white/10 p-3">
                    <RowIcon aria-hidden="true" className="size-5 text-accent" />
                    <span className="font-bold">{text as string}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[.78fr_1.22fr] lg:px-8">
        <Card className="lg:self-start">
          <CardHeader>
            <CardTitle>{t('خطوات التذكرة', 'Ticket steps')}</CardTitle>
            <CardDescription>{t('كل خطوة لها فعل واضح واحد.', 'Each step has one clear action.')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="grid gap-3">
              {steps.map((step, index) => {
                const done = index < activeIndex;
                const active = index === activeIndex;
                return (
                  <li key={step} className={cn('flex items-center gap-3 rounded-lg border p-3', active ? 'border-accent bg-accent/5' : 'border-border bg-muted')}>
                    <span className={cn('grid size-9 place-items-center rounded-pill text-sm font-black', done ? 'bg-success text-white' : active ? 'bg-accent text-white' : 'bg-surface text-muted-foreground')}>
                      {done ? <CheckCircle2 aria-hidden="true" className="size-5" /> : index + 1}
                    </span>
                    <span className="font-bold">{localize(language, stepCopy[step].ar, stepCopy[step].en)}</span>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border">
            <CardTitle>{localize(language, stepCopy[activeStep].ar, stepCopy[activeStep].en)}</CardTitle>
            <CardDescription>{stepDescription(activeStep, language)}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={reduceMotion ? false : { opacity: 0, x: language === 'ar' ? -18 : 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: language === 'ar' ? 18 : -18 }}
                transition={{ duration: 0.25 }}
                className="grid gap-5 p-5 md:p-7"
              >
                {activeStep === 'identify' ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input label={t('رقم الطلب', 'Order ID')} value={form.orderId} onChange={(event) => update('orderId', event.target.value)} placeholder="INO-2026-1048" dir="ltr" required />
                    <Input label={t('رقم الهاتف', 'Phone')} value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder="+971" dir="ltr" inputMode="tel" required />
                    <Input label={t('الاسم', 'Name')} value={form.name} onChange={(event) => update('name', event.target.value)} className="md:col-span-2" required />
                  </div>
                ) : null}

                {activeStep === 'details' ? (
                  <div className="grid gap-5">
                    <div className="grid gap-3 md:grid-cols-2">
                      {categories.map((category) => (
                        <Choice key={category.id} selected={form.category === category.id} onClick={() => update('category', category.id)}>
                          <MessageSquare aria-hidden="true" className="mb-3 size-6 text-primary" />
                          <span className="font-black">{localize(language, category.ar, category.en)}</span>
                        </Choice>
                      ))}
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-bold">{t('الأولوية', 'Priority')}</p>
                      <div className="flex flex-wrap gap-2">
                        {severities.map((severity) => (
                          <button
                            key={severity.id}
                            type="button"
                            onClick={() => update('severity', severity.id)}
                            className={cn('min-h-10 rounded-pill border px-4 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', form.severity === severity.id ? 'border-accent bg-accent text-white' : 'border-border bg-surface')}
                          >
                            {localize(language, severity.ar, severity.en)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}

                {activeStep === 'evidence' ? (
                  <div className="grid gap-5">
                    <Textarea label={t('وصف المشكلة', 'Issue description')} value={form.message} onChange={(event) => update('message', event.target.value)} required placeholder={t('اكتب ما حدث باختصار واضح...', 'Briefly describe what happened...')} />
                    <button
                      type="button"
                      onClick={() => update('hasEvidence', !form.hasEvidence)}
                      className={cn('flex min-h-24 items-center gap-4 rounded-lg border border-dashed p-4 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', form.hasEvidence ? 'border-accent bg-accent/10' : 'border-border bg-muted')}
                    >
                      <ImagePlus aria-hidden="true" className="size-8 text-primary" />
                      <span>
                        <span className="block font-black">{t('صور أو مرفقات', 'Photos or attachments')}</span>
                        <span className="mt-1 block text-sm text-muted-foreground">
                          {form.hasEvidence ? t('تم تسجيل وجود مرفقات، سيتم رفعها عند ربط النظام.', 'Evidence noted. Upload can be connected later.') : t('اختياري الآن، وسيتم تفعيل الرفع لاحقًا.', 'Optional now. Upload can be enabled later.')}
                        </span>
                      </span>
                    </button>
                  </div>
                ) : null}

                {activeStep === 'review' ? (
                  <div className="grid gap-3">
                    <Summary label={t('رقم الطلب', 'Order ID')} value={form.orderId} />
                    <Summary label={t('العميل', 'Customer')} value={form.name} />
                    <Summary label={t('الهاتف', 'Phone')} value={form.phone} dir="ltr" />
                    <Summary label={t('النوع', 'Category')} value={localize(language, selectedCategory.ar, selectedCategory.en)} />
                    <Summary label={t('الأولوية', 'Priority')} value={localize(language, selectedSeverity.ar, selectedSeverity.en)} />
                    <Summary label={t('الوصف', 'Description')} value={form.message} />
                    <Summary label={t('المرفقات', 'Evidence')} value={form.hasEvidence ? t('نعم', 'Yes') : t('لا', 'No')} />
                  </div>
                ) : null}

                {activeStep === 'created' ? (
                  <div className="py-8 text-center">
                    <div className="mx-auto grid size-16 place-items-center rounded-pill bg-success text-white">
                      <CheckCircle2 aria-hidden="true" className="size-8" />
                    </div>
                    <h2 className="mt-5 text-3xl font-black">{t('تم إنشاء التذكرة', 'Ticket created')}</h2>
                    <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                      {t('احتفظ بهذا الرقم للمتابعة مع فريق خدمة العملاء.', 'Keep this number for follow-up with customer care.')}
                    </p>
                    <div className="mx-auto mt-6 max-w-sm rounded-lg border border-border bg-muted p-4">
                      <p className="text-xs font-bold text-muted-foreground">{t('رقم التذكرة', 'Ticket ID')}</p>
                      <p className="mt-1 text-2xl font-black text-primary" dir="ltr">{ticketId}</p>
                    </div>
                    <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                      <Button variant="accent" onClick={() => window.open(`https://wa.me/${config.whatsapp_number.replace(/\D/g, '')}`, '_blank', 'noopener,noreferrer')}>
                        <PhoneCall aria-hidden="true" className="size-5" />
                        {t('تواصل واتساب', 'WhatsApp follow-up')}
                      </Button>
                      <Button variant="secondary" onClick={() => setRoute('/track')}>{t('تتبع طلب', 'Track order')}</Button>
                    </div>
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>

            {activeStep !== 'created' ? (
              <div className="flex items-center justify-between gap-3 border-t border-border p-5 md:p-7">
                <Button variant="ghost" onClick={back} disabled={activeIndex === 0}>
                  {language === 'ar' ? <ArrowRight aria-hidden="true" className="size-4" /> : <ArrowLeft aria-hidden="true" className="size-4" />}
                  {t('السابق', 'Back')}
                </Button>
                <Button variant="accent" onClick={next} disabled={!canContinue}>
                  {activeStep === 'review' ? t('إنشاء التذكرة', 'Create ticket') : t('التالي', 'Next')}
                  {activeStep === 'review' ? <FileText aria-hidden="true" className="size-4" /> : language === 'ar' ? <ArrowLeft aria-hidden="true" className="size-4" /> : <ArrowRight aria-hidden="true" className="size-4" />}
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

const Choice = ({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn('min-h-32 rounded-lg border p-4 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', selected ? 'border-accent bg-accent/10' : 'border-border bg-surface hover:border-accent/50')}
  >
    {children}
  </button>
);

const Summary = ({ label, value, dir }: { label: string; value: string; dir?: 'rtl' | 'ltr' }) => (
  <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-muted p-4">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="max-w-[65%] text-end font-bold" dir={dir}>{value}</span>
  </div>
);

const isStepValid = (step: ComplaintStep, form: ComplaintForm) => {
  if (step === 'identify') return Boolean(form.orderId.trim() && form.name.trim() && form.phone.trim());
  if (step === 'evidence') return form.message.trim().length >= 10;
  return true;
};

const stepDescription = (step: ComplaintStep, language: SiteLanguage) => {
  const copy: Record<ComplaintStep, { ar: string; en: string }> = {
    identify: { ar: 'ابدأ بتحديد الطلب وطريقة التواصل.', en: 'Start by identifying the order and contact details.' },
    details: { ar: 'اختر نوع المشكلة وأولويتها.', en: 'Choose the issue type and priority.' },
    evidence: { ar: 'اكتب الوصف وسجل وجود مرفقات عند الحاجة.', en: 'Describe the issue and note evidence when needed.' },
    review: { ar: 'راجع البيانات قبل إنشاء التذكرة.', en: 'Review the information before creating the ticket.' },
    created: { ar: 'تم إنشاء رقم متابعة واضح.', en: 'A clear follow-up number has been created.' },
  };
  return localize(language, copy[step].ar, copy[step].en);
};
