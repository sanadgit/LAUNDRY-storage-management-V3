import React, { useState } from 'react';
import {
  ArrowUpRight,
  BellRing,
  Bot,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  ConciergeBell,
  Crown,
  Gauge,
  Hotel,
  MapPin,
  MessageCircle,
  Navigation,
  PackageCheck,
  Phone,
  QrCode,
  ScanLine,
  Search,
  ShieldCheck,
  Shirt,
  Sparkles,
  Star,
  Store,
  Truck,
  WandSparkles,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Branch, SiteConfig } from '../types';
import { SiteLanguage, localize } from '../lib/i18n';
import { Button } from './ui';
import { cn } from '../lib/utils';

interface PublicHomeProps {
  config: SiteConfig;
  language: SiteLanguage;
  setRoute: (route: string) => void;
}

type LocalizedText = { ar: string; en: string };

const t = (language: SiteLanguage, value: LocalizedText) => localize(language, value.ar, value.en);

const serviceCards = [
  {
    slug: 'abaya-care',
    title: { ar: 'العناية بالعبايات', en: 'Abaya Care' },
    desc: { ar: 'حماية اللون الأسود، بخار ناعم، وتغليف يليق بالقطع اليومية الفاخرة.', en: 'Dark-fabric protection, soft steam finishing, and premium presentation.' },
    img: '/service-images/abaya-care-premium.png',
    price: { ar: 'من 15 درهم', en: 'From AED 15' },
  },
  {
    slug: 'luxury-garments',
    title: { ar: 'ملابس فاخرة', en: 'Luxury Clothes' },
    desc: { ar: 'بدل، بشت، فساتين، وأقمشة حساسة تمر بفحص قبل التنظيف.', en: 'Suits, bisht, dresses, and delicate fabrics reviewed before cleaning.' },
    img: '/service-images/luxury-garment-care-premium.png',
    price: { ar: 'فحص مخصص', en: 'Custom inspection' },
  },
  {
    slug: 'blankets',
    title: { ar: 'بطانيات ومفارش', en: 'Blankets & Linens' },
    desc: { ar: 'غسيل عميق وتجفيف آمن للقطع المنزلية الكبيرة مع تغليف نظيف.', en: 'Deep cleaning and safe drying for large home textiles.' },
    img: '/service-images/blanket-care-premium.png',
    price: { ar: 'من 15 درهم', en: 'From AED 15' },
  },
  {
    slug: 'curtains',
    title: { ar: 'ستائر', en: 'Curtains' },
    desc: { ar: 'تنظيف منظم للستائر مع مواعيد استلام واضحة حسب المنطقة.', en: 'Structured curtain care with clear collection windows.' },
    img: '/service-images/curtain-care-premium.png',
    price: { ar: 'حسب المقاس', en: 'By size' },
  },
  {
    slug: 'carpets',
    title: { ar: 'سجاد', en: 'Carpets' },
    desc: { ar: 'عناية للسجاد الصغير والمتوسط مع متابعة رقمية من الاستلام.', en: 'Carpet care with digital visibility from collection onward.' },
    img: '/service-images/carpet-care-premium.png',
    price: { ar: 'حسب الحجم', en: 'By size' },
  },
  {
    slug: 'shoes',
    title: { ar: 'أحذية', en: 'Shoes' },
    desc: { ar: 'تنظيف وتجديد للأحذية اليومية والرسمية دون مظهر تقليدي.', en: 'Refresh care for everyday and formal shoes.' },
    img: '/service-images/shoe-care-premium.png',
    price: { ar: 'قريبًا', en: 'Coming soon' },
  },
];

const trustStats = [
  { value: '24h', label: { ar: 'استلام وتسليم سريع', en: 'fast pickup flow' } },
  { value: '5k+', label: { ar: 'عميل موثوق', en: 'trusted customers' } },
  { value: '3', label: { ar: 'فروع في أبوظبي', en: 'Abu Dhabi branches' } },
  { value: '99%', label: { ar: 'رضا وتشطيب', en: 'care satisfaction' } },
];

const processSteps = [
  { icon: CalendarClock, title: { ar: 'Schedule Pickup', en: 'Schedule Pickup' }, desc: { ar: 'اختر العنوان والوقت خلال ثوان.', en: 'Choose address and time in seconds.' } },
  { icon: Truck, title: { ar: 'Driver Collection', en: 'Driver Collection' }, desc: { ar: 'سائقنا يستلم ويؤكد الطلب.', en: 'Driver confirms and tags the order.' } },
  { icon: WandSparkles, title: { ar: 'Professional Cleaning', en: 'Professional Cleaning' }, desc: { ar: 'العناية حسب النسيج والحالة.', en: 'Care route based on fabric and condition.' } },
  { icon: ClipboardCheck, title: { ar: 'Quality Check', en: 'Quality Check' }, desc: { ar: 'فحص نهائي قبل التغليف.', en: 'Final inspection before packaging.' } },
  { icon: PackageCheck, title: { ar: 'Delivery', en: 'Delivery' }, desc: { ar: 'تسليم نظيف مع إشعار فوري.', en: 'Premium delivery with instant alerts.' } },
];

const technologyCards = [
  { icon: Bot, title: { ar: 'AI Assistant', en: 'AI Assistant' }, desc: { ar: 'مساعد Layla للحجز، الأسعار، والتصعيد للموظف.', en: 'Layla helps with booking, pricing, and handoff.' } },
  { icon: ScanLine, title: { ar: 'Smart Tracking', en: 'Smart Tracking' }, desc: { ar: 'كل طلب يتحرك برقم تتبع ومراحل واضحة.', en: 'Each order moves through visible tracked stages.' } },
  { icon: BellRing, title: { ar: 'Instant Notifications', en: 'Instant Notifications' }, desc: { ar: 'تنبيهات واتساب عند تغيّر حالة الطلب.', en: 'WhatsApp alerts when order status changes.' } },
  { icon: ShieldCheck, title: { ar: 'Quality Control', en: 'Quality Control' }, desc: { ar: 'نظام فحص يحمي القطع القيمة قبل التسليم.', en: 'Inspection checkpoints protect valuable garments.' } },
];

const reviews = [
  { name: 'Fatima H.', location: 'Abu Dhabi', text: { ar: 'تتبع الطلب أعطاني ثقة مع العبايات الغالية. واضح ومرتب من أول استلام.', en: 'The tracking gave me confidence with premium abayas. Clear from pickup to delivery.' } },
  { name: 'Khalid A.', location: 'MBZ City', text: { ar: 'الإحساس أقرب لخدمة فندق من مصبغة عادية. حجز سريع وتغليف محترم.', en: 'It feels closer to hotel service than a normal laundry. Fast booking and proper packaging.' } },
  { name: 'Mariam S.', location: 'Al Falah', text: { ar: 'تعاملهم مع فستان المناسبة كان دقيقًا، والتسليم جاء بالوقت.', en: 'They handled my occasion dress carefully and delivered on time.' } },
];

const faqs = [
  { q: { ar: 'هل يمكن تتبع الطلب؟', en: 'Can I track my order?' }, a: { ar: 'نعم، أدخل رقم الطلب وسترى مرحلة الطلب من الاستلام حتى التسليم.', en: 'Yes, enter your order number to see each stage from intake to delivery.' } },
  { q: { ar: 'هل يوجد حجز استلام من المنزل؟', en: 'Do you offer home pickup?' }, a: { ar: 'نعم، نموذج الاستلام مصمم ليكون سريعًا مثل تطبيقات التوصيل.', en: 'Yes, the pickup form is designed to feel as fast as a delivery app.' } },
  { q: { ar: 'هل تتعاملون مع القطع الفاخرة؟', en: 'Do you handle luxury garments?' }, a: { ar: 'نعم، العبايات، البشت، فساتين الزفاف، والأقمشة الحساسة لها مسار عناية خاص.', en: 'Yes. Abayas, bisht, wedding dresses, and delicate fabrics receive a dedicated care route.' } },
];

function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.48, delay, ease: [0, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionShell({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={cn('px-5 py-20 sm:px-8 lg:px-12 lg:py-32', className)}>
      <div className="mx-auto max-w-[1440px]">{children}</div>
    </section>
  );
}

function SectionHeader({
  title,
  description,
  align = 'center',
}: {
  title: string;
  description?: string;
  align?: 'center' | 'start';
}) {
  return (
    <div className={cn('flex max-w-3xl flex-col gap-5', align === 'center' ? 'mx-auto text-center' : 'text-start')}>
      <h2 className="text-balance font-display text-[32px] font-extrabold leading-[40px] text-foreground md:text-[48px] md:leading-[56px]">
        {title}
      </h2>
      {description ? <p className="text-base leading-7 text-muted-foreground md:text-lg md:leading-8">{description}</p> : null}
    </div>
  );
}

function HeroVisual({ language }: Pick<PublicHomeProps, 'language'>) {
  const tracker = [
    { label: 'Received', done: true },
    { label: 'Sorting', done: true },
    { label: 'Cleaning', done: true },
    { label: 'Ironing', done: false, active: true },
    { label: 'Packing', done: false },
    { label: 'Delivery', done: false },
  ];

  return (
    <div className="relative min-h-[560px] w-full min-w-0 overflow-hidden lg:min-h-[690px] lg:overflow-visible">
      <div className="hero-grid absolute inset-0 opacity-70" aria-hidden="true" />
      <div className="absolute inset-x-8 top-8 h-28 rounded-[2rem] bg-gradient-to-r from-primary/10 via-accent/20 to-transparent blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-[570px] min-w-0">
        <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-high">
          <img
            src="/inandout-hero-concept.png"
            alt={localize(language, 'قطع فاخرة جاهزة لعناية In & Out Laundry', 'Luxury garments prepared for In & Out Laundry care')}
            className="h-[430px] w-full min-w-0 object-cover object-center md:h-[500px]"
            draggable={false}
          />
        </div>

        <div className="absolute -bottom-12 left-4 right-4 rounded-[1.5rem] border border-white/70 bg-white/72 p-5 shadow-glass backdrop-blur-3xl md:-bottom-16 md:left-10 md:right-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] font-bold uppercase leading-4 text-primary">ORDER STATUS: IN-PROCESS</p>
              <h3 className="mt-2 font-display text-xl font-extrabold text-foreground">INO-4827</h3>
            </div>
            <span className="grid size-11 place-items-center rounded-full bg-secondary text-white">
              <PackageCheck aria-hidden="true" className="size-5" />
            </span>
          </div>
          <div className="mt-5">
            <div className="relative h-2 overflow-hidden rounded-full bg-[#BF88B0]">
              <div className="absolute inset-y-0 start-0 w-[58%] rounded-full bg-gradient-to-r from-secondary to-accent" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 md:grid-cols-6">
              {tracker.map((step) => (
                <div key={step.label} className="flex flex-col items-center gap-2 text-center">
                  <span
                    className={cn(
                      'grid size-6 place-items-center rounded-full border text-[10px]',
                      step.done || step.active ? 'border-secondary bg-secondary text-white' : 'border-outline/30 bg-white text-muted-foreground',
                    )}
                  >
                    {step.done ? <CheckCircle2 aria-hidden="true" className="size-3.5" /> : ''}
                  </span>
                  <span className="font-mono text-[10px] font-bold uppercase leading-4 text-muted-foreground">{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute -left-5 top-10 hidden w-48 rounded-[1.25rem] border border-white/70 bg-white/74 p-4 shadow-glass backdrop-blur-3xl md:block">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-white">
            <Crown aria-hidden="true" className="size-5" />
          </span>
          <p className="mt-3 text-sm font-extrabold text-foreground">{localize(language, 'Luxury fabric route', 'Luxury fabric route')}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{localize(language, 'فحص قبل التنظيف للقطع الحساسة.', 'Pre-cleaning inspection for delicate garments.')}</p>
        </div>

        <div className="absolute -right-4 top-52 hidden w-52 rounded-[1.25rem] border border-white/70 bg-white/74 p-4 shadow-glass backdrop-blur-3xl md:block">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-secondary text-white">
              <BellRing aria-hidden="true" className="size-5" />
            </span>
            <div>
              <p className="text-sm font-extrabold text-foreground">WhatsApp alert</p>
              <p className="font-mono text-[10px] font-bold uppercase text-secondary">QC completed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroBookingPanel({ config, language, setRoute }: PublicHomeProps) {
  const activeAreas = config.service_areas.filter((area) => area.active !== false).slice(0, 5);
  const firstArea = activeAreas[0]?.id || '';
  const [selectedArea, setSelectedArea] = useState(firstArea);
  const selectedAreaLabel = activeAreas.find((area) => area.id === selectedArea)?.name || activeAreas[0]?.name || localize(language, 'أبوظبي', 'Abu Dhabi');
  const nextSlot = config.time_slots.find((slot) => slot.active !== false && !slot.busy) || config.time_slots[0];
  const deliveryFee = activeAreas.find((area) => area.id === selectedArea)?.delivery_fee ?? config.delivery_fee;

  const startBooking = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('io_selected_pickup_area', selectedArea);
    }
    setRoute('/book');
  };

  return (
    <div className="w-full max-w-[calc(100vw-40px)] rounded-[1.75rem] border border-white/70 bg-white/76 p-4 text-start shadow-glass backdrop-blur-3xl md:max-w-3xl md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="hero-area" className="mb-2 flex items-center gap-2 font-mono text-[11px] font-bold uppercase leading-4 text-muted-foreground">
            <MapPin aria-hidden="true" className="size-4 text-primary" />
            {localize(language, 'اختر منطقة الاستلام', 'Choose pickup area')}
          </label>
          <select
            id="hero-area"
            value={selectedArea}
            onChange={(event) => setSelectedArea(event.target.value)}
            className="min-h-12 w-full rounded-lg border border-input bg-white px-4 text-sm font-bold text-foreground shadow-flat outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
          >
            {activeAreas.map((area) => (
              <option key={area.id} value={area.id}>{area.name}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-2 rounded-xl border border-border bg-muted px-4 py-3 sm:min-w-56">
          <span className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <CalendarClock aria-hidden="true" className="size-4 text-secondary" />
            {localize(language, 'أقرب موعد', 'Next available slot')}
          </span>
          <strong className="text-sm font-black text-foreground">{nextSlot?.time || localize(language, 'اليوم', 'Today')}</strong>
          <span className="text-xs font-semibold text-muted-foreground">
            {localize(language, 'رسوم التوصيل', 'Delivery fee')}: AED {deliveryFee}
          </span>
        </div>

        <Button size="lg" className="lg:min-w-48" onClick={startBooking}>
          <Truck data-icon="inline-start" aria-hidden="true" />
          {localize(language, 'احجز في ', 'Book in ')}{selectedAreaLabel}
        </Button>
      </div>
    </div>
  );
}

function HeroSection({ config, language, setRoute }: PublicHomeProps) {
  return (
    <section className="relative overflow-hidden bg-background px-5 pb-28 pt-28 sm:px-8 lg:px-12 lg:pb-32 lg:pt-36">
      <div className="mx-auto grid max-w-[1440px] min-w-0 gap-12 lg:grid-cols-[1fr_0.94fr] lg:items-center">
        <Reveal className="flex w-full min-w-0 max-w-[calc(100vw-40px)] flex-col items-center gap-8 text-center lg:max-w-4xl lg:items-start lg:text-start">
          <p className="max-w-full truncate font-mono text-[11px] font-bold uppercase leading-5 tracking-[0.1em] text-primary sm:whitespace-normal sm:text-xs">
            {localize(language, 'خدمات غسيل فاخرة في أبوظبي', 'Luxury laundry in Abu Dhabi powered by smart technology')}
          </p>
          <h1 className="w-full max-w-[calc(100vw-40px)] text-balance break-words font-display text-[32px] font-extrabold leading-[40px] text-foreground sm:text-[42px] sm:leading-[48px] md:max-w-5xl md:text-[72px] md:leading-[80px]">
            {localize(language, 'استلام وتنظيف وتوصيل بوضوح يطمئنك.', 'Pickup, premium care, and delivery with calm live tracking.')}
          </h1>
          <p className="w-full max-w-[calc(100vw-40px)] text-base leading-8 text-muted-foreground md:max-w-2xl md:text-lg">
            {localize(
              language,
              'اختر منطقتك، احجز أقرب موعد، وتابع طلبك من الاستلام حتى التغليف والتوصيل. In & Out Laundry يجعل الغسيل تجربة سريعة وواضحة.',
              'Choose your area, book the next pickup slot, and track your order from collection to packaging and delivery.',
            )}
          </p>
          <HeroBookingPanel config={config} language={language} setRoute={setRoute} />
          <div className="flex w-full min-w-0 max-w-[calc(100vw-40px)] flex-col gap-3 sm:w-auto sm:flex-row">
            <Button size="lg" onClick={() => setRoute('/book')}>
              <Truck data-icon="inline-start" aria-hidden="true" />
              {localize(language, config.hero.cta_primary, 'Schedule Pickup')}
            </Button>
            <Button size="lg" variant="secondary" onClick={() => setRoute('/track')}>
              <Search data-icon="inline-start" aria-hidden="true" />
              {localize(language, config.hero.cta_secondary, 'Track Order')}
            </Button>
            <Button size="lg" variant="accent" onClick={() => setRoute('/contact')}>
              <MessageCircle data-icon="inline-start" aria-hidden="true" />
              {localize(language, 'WhatsApp Assistant', 'WhatsApp Assistant')}
            </Button>
          </div>
          <div className="grid w-full min-w-0 max-w-[calc(100vw-40px)] grid-cols-2 gap-3 md:max-w-3xl md:grid-cols-4">
            {trustStats.map((stat) => (
              <div key={stat.value} className="rounded-[1.25rem] border border-white/70 bg-white/68 p-5 shadow-low backdrop-blur-2xl">
                <strong className="block font-display text-3xl font-extrabold text-primary tabular-nums">{stat.value}</strong>
                <span className="mt-2 block text-sm font-semibold leading-5 text-muted-foreground">{t(language, stat.label)}</span>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <HeroVisual language={language} />
        </Reveal>
      </div>
    </section>
  );
}

function QuickActionRail({ language, setRoute }: Pick<PublicHomeProps, 'language' | 'setRoute'>) {
  const actions = [
    { icon: Truck, title: { ar: 'Book Pickup', en: 'Book Pickup' }, desc: { ar: 'نموذج سريع مثل Uber.', en: 'Fast, app-like booking.' }, path: '/book' },
    { icon: Search, title: { ar: 'Track Order', en: 'Track Order' }, desc: { ar: 'مراحل واضحة وفورية.', en: 'Clear live stages.' }, path: '/track' },
    { icon: MessageCircle, title: { ar: 'WhatsApp', en: 'WhatsApp' }, desc: { ar: 'مساعد فوري للعميل.', en: 'Instant customer help.' }, path: '/contact' },
  ];

  return (
    <SectionShell className="-mt-20 py-0">
      <div className="grid gap-4 rounded-[2rem] border border-white/70 bg-white/66 p-4 shadow-glass backdrop-blur-3xl md:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.path}
              type="button"
              onClick={() => setRoute(action.path)}
              className="group flex min-h-28 items-center gap-4 rounded-[1.35rem] p-4 text-start transition hover:bg-white hover:shadow-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-[#8C2370] text-white shadow-medium">
                <Icon aria-hidden="true" className="size-6" />
              </span>
              <span>
                <span className="block font-display text-lg font-extrabold text-foreground">{t(language, action.title)}</span>
                <span className="mt-1 block text-sm leading-6 text-muted-foreground">{t(language, action.desc)}</span>
              </span>
              <ArrowUpRight aria-hidden="true" className="ms-auto size-5 shrink-0 text-primary transition group-hover:translate-x-0.5 rtl:rotate-[-90deg]" />
            </button>
          );
        })}
      </div>
    </SectionShell>
  );
}

function TrustSection({ language }: Pick<PublicHomeProps, 'language'>) {
  return (
    <SectionShell>
      <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <Reveal>
          <SectionHeader
            align="start"
            title={localize(language, 'نظافة تشبه المختبر، وطمأنينة تشبه الفندق.', 'Laboratory-clean precision with hotel-level reassurance.')}
            description={localize(
              language,
              'Laundry is personal. The interface must make customers feel that valuable garments are inspected, tagged, cleaned, checked, and returned with absolute reliability.',
              'Laundry is personal. Every interaction shows that valuable garments are inspected, tagged, cleaned, checked, and returned with absolute reliability.',
            )}
          />
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { icon: ShieldCheck, title: { ar: 'ثقة للقطع الحساسة', en: 'Delicate-care trust' }, desc: { ar: 'فحص وترميز قبل بدء العناية.', en: 'Inspection and tagging before care starts.' } },
            { icon: Gauge, title: { ar: 'سرعة بلا فوضى', en: 'Speed without chaos' }, desc: { ar: 'الحجز والتتبع والواتساب خلال ثوان.', en: 'Booking, tracking, and WhatsApp within seconds.' } },
            { icon: Sparkles, title: { ar: 'تشطيب فاخر', en: 'Premium finishing' }, desc: { ar: 'كوي وتغليف يحافظان على الشكل.', en: 'Pressing and packaging preserve presentation.' } },
            { icon: QrCode, title: { ar: 'نظام رقمي', en: 'Digital operations' }, desc: { ar: 'حالة واضحة بدلاً من اتصالات متكررة.', en: 'Visible status replaces repeated calls.' } },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title.en} delay={index * 0.04}>
                <div className="h-full rounded-[1.75rem] border border-white/70 bg-white p-7 shadow-low transition hover:-translate-y-1 hover:shadow-medium">
                  <span className="grid size-13 place-items-center rounded-2xl bg-[#F2F2F2] text-primary">
                    <Icon aria-hidden="true" className="size-6" />
                  </span>
                  <h3 className="mt-6 font-display text-xl font-extrabold text-foreground">{t(language, item.title)}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{t(language, item.desc)}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}

function ServicesSection({ language, setRoute }: Pick<PublicHomeProps, 'language' | 'setRoute'>) {
  return (
    <SectionShell id="services" className="bg-white/50">
      <div className="flex flex-col gap-12">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeader
            align="start"
            title={localize(language, 'خدمات مصممة للقطع المهمة، لا لقائمة أسعار فقط.', 'Services designed around important garments, not just a price list.')}
            description={localize(language, 'كل بطاقة تستخدم صورة واضحة ونصًا قصيرًا وقرارًا سريعًا: هل هذه هي القطعة التي تحتاج عناية؟', 'Each card uses clear imagery, concise copy, and a fast decision: is this the garment that needs care?')}
          />
          <Button variant="secondary" onClick={() => setRoute('/services')}>
            {localize(language, 'عرض كل الخدمات', 'View all services')}
            <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
          </Button>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {serviceCards.map((service, index) => (
            <Reveal key={service.slug} delay={index * 0.04}>
              <button
                type="button"
                onClick={() => setRoute(`/services/${service.slug}`)}
                className="group relative h-[390px] w-full overflow-hidden rounded-[2rem] bg-secondary text-start shadow-medium transition hover:-translate-y-1 hover:shadow-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <img src={service.img} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" draggable={false} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1f1a23]/78 via-[#1f1a23]/12 to-transparent" aria-hidden="true" />
                <div className="absolute inset-x-4 bottom-4 rounded-[1.5rem] border border-white/30 bg-white/66 p-5 shadow-glass backdrop-blur-3xl">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-2xl font-extrabold text-foreground">{t(language, service.title)}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{t(language, service.desc)}</p>
                    </div>
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-white">
                      <ArrowUpRight aria-hidden="true" className="size-5 rtl:rotate-[-90deg]" />
                    </span>
                  </div>
                  <p className="mt-4 font-mono text-xs font-bold uppercase text-secondary">{t(language, service.price)}</p>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function ProcessSection({ language }: Pick<PublicHomeProps, 'language'>) {
  return (
    <SectionShell>
      <SectionHeader
        title={localize(language, 'How It Works', 'How It Works')}
        description={localize(language, 'رحلة قصيرة ومقروءة من الحجز إلى التسليم. لا ازدحام، لا غموض، ولا خطوات مخفية.', 'A readable journey from booking to delivery. No clutter, no ambiguity, no hidden steps.')}
      />
      <div className="relative mt-14">
        <div className="absolute left-0 right-0 top-10 hidden h-1 rounded-full bg-[#BF88B0] md:block" aria-hidden="true" />
        <div className="absolute left-0 top-10 hidden h-1 w-[72%] rounded-full bg-gradient-to-r from-secondary to-accent md:block" aria-hidden="true" />
        <div className="grid gap-4 md:grid-cols-5">
          {processSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Reveal key={step.title.en} delay={index * 0.04}>
                <div className="relative h-full rounded-[1.5rem] border border-white/70 bg-white p-5 shadow-low">
                  <span className="relative z-10 grid size-20 place-items-center rounded-[1.35rem] bg-gradient-to-br from-primary to-[#8C2370] text-white shadow-medium">
                    <Icon aria-hidden="true" className="size-7" />
                  </span>
                  <h3 className="mt-6 font-display text-lg font-extrabold text-foreground">{t(language, step.title)}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{t(language, step.desc)}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}

function TechnologySection({ language, setRoute }: Pick<PublicHomeProps, 'language' | 'setRoute'>) {
  return (
    <SectionShell className="bg-[#1f1a23] text-white">
      <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <Reveal className="flex flex-col gap-7">
          <span className="grid size-16 place-items-center rounded-2xl bg-white/10 text-accent">
            <WandSparkles aria-hidden="true" className="size-7" />
          </span>
          <h2 className="text-balance font-display text-[32px] font-extrabold leading-[40px] text-white md:text-[48px] md:leading-[56px]">
            {localize(language, 'Smart technology that feels useful, not noisy.', 'Smart technology that feels useful, not noisy.')}
          </h2>
          <p className="max-w-2xl text-lg leading-8 text-white/68">
            {localize(language, 'الذكاء الاصطناعي، التتبع، التنبيهات، ومراقبة الجودة تظهر كطبقات SaaS هادئة حول تجربة العميل.', 'AI, tracking, alerts, and quality control appear as calm SaaS layers around the customer journey.')}
          </p>
          <div>
            <Button variant="accent" onClick={() => setRoute('/track')}>
              {localize(language, 'جرّب التتبع الذكي', 'Try smart tracking')}
            </Button>
          </div>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2">
          {technologyCards.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title.en} delay={index * 0.04}>
                <div className="h-full rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-6 shadow-high backdrop-blur-2xl">
                  <span className="grid size-12 place-items-center rounded-2xl bg-accent/15 text-accent">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <h3 className="mt-6 font-display text-xl font-extrabold text-white">{t(language, item.title)}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/62">{t(language, item.desc)}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}

function TrackingSection({ language, setRoute }: Pick<PublicHomeProps, 'language' | 'setRoute'>) {
  const stages = ['Received', 'Sorting', 'Washing', 'Ironing', 'Packing', 'Delivery'];
  return (
    <SectionShell>
      <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <Reveal>
          <SectionHeader
            align="start"
            title={localize(language, 'Order tracking built for calm customers.', 'Order tracking built for calm customers.')}
            description={localize(language, 'العميل يرى المرحلة الحالية، موعد التسليم، وآخر إشعار واتساب بدون الاتصال بالفرع.', 'Customers see the current stage, delivery estimate, and latest WhatsApp alert without calling the branch.')}
          />
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button onClick={() => setRoute('/track')}>
              <Search data-icon="inline-start" aria-hidden="true" />
              {localize(language, 'تتبع طلب', 'Track Order')}
            </Button>
            <Button variant="secondary" onClick={() => setRoute('/contact')}>
              <Phone data-icon="inline-start" aria-hidden="true" />
              {localize(language, 'تواصل مع الدعم', 'Contact Support')}
            </Button>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="rounded-[2rem] border border-white/70 bg-white p-6 shadow-high">
            <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-mono text-xs font-bold uppercase text-primary">ORDER INO-4827</p>
                <h3 className="mt-2 font-display text-2xl font-extrabold text-foreground">{localize(language, 'Quality check active', 'Quality check active')}</h3>
              </div>
              <span className="w-fit rounded-full bg-secondary px-4 py-2 font-mono text-xs font-bold uppercase text-white">ETA 7:30 PM</span>
            </div>
            <div className="mt-7">
              <div className="relative hidden h-2 rounded-full bg-[#BF88B0] md:block">
                <div className="absolute inset-y-0 start-0 w-[66%] rounded-full bg-gradient-to-r from-secondary to-accent" />
              </div>
              <div className="mt-0 grid gap-4 md:mt-6 md:grid-cols-6">
                {stages.map((stage, index) => {
                  const active = index === 3;
                  const done = index < 3;
                  return (
                    <div key={stage} className="grid grid-cols-[2rem_1fr] gap-3 md:flex md:flex-col md:items-center md:text-center">
                      <span className={cn('grid size-8 place-items-center rounded-full border', done || active ? 'border-secondary bg-secondary text-white' : 'border-outline/25 bg-white text-muted-foreground')}>
                        {done ? <CheckCircle2 aria-hidden="true" className="size-4" /> : active ? <span className="size-2 rounded-full bg-accent" /> : null}
                      </span>
                      <span className="font-mono text-[11px] font-bold uppercase leading-5 text-muted-foreground">{stage}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-8 rounded-[1.5rem] bg-[#fbf0fe] p-5">
              <p className="text-sm font-bold text-foreground">{localize(language, 'آخر تحديث', 'Latest update')}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {localize(language, 'تم فحص القطع الحساسة، وسيتم التغليف بعد الكوي النهائي.', 'Delicate pieces passed inspection and will move to packaging after final pressing.')}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}

function PickupBookingSection({ config, language, setRoute }: PublicHomeProps) {
  return (
    <SectionShell className="bg-white/50">
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <Reveal>
          <SectionHeader
            align="start"
            title={localize(language, 'Pickup booking that feels simple like Uber.', 'Pickup booking that feels simple like Uber.')}
            description={localize(language, 'حقول قليلة، أهداف واضحة، وتركيز على أسرع طريق للحجز.', 'Few fields, clear intent, and the fastest path to pickup.')}
          />
        </Reveal>
        <Reveal delay={0.08}>
          <form
            className="rounded-[2rem] border border-white/70 bg-white p-6 shadow-high"
            onSubmit={(event) => {
              event.preventDefault();
              setRoute('/book');
            }}
          >
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ['name', localize(language, 'Name', 'Name'), localize(language, 'Fatima Al Mansoori', 'Fatima Al Mansoori')],
                ['phone', localize(language, 'Phone', 'Phone'), '056 586 5506'],
                ['location', localize(language, 'Location', 'Location'), localize(language, 'Al Falah, Abu Dhabi', 'Al Falah, Abu Dhabi')],
                ['service', localize(language, 'Service', 'Service'), localize(language, 'Abaya Care', 'Abaya Care')],
                ['time', localize(language, 'Time', 'Time'), config.time_slots[0]?.time || '08:00 - 10:00'],
                ['notes', localize(language, 'Notes', 'Notes'), localize(language, 'Designer abaya, gentle steam', 'Designer abaya, gentle steam')],
              ].map(([id, label, value]) => (
                <label key={id} className="group relative block">
                  <span className="absolute start-4 top-2 z-10 bg-white px-1 font-mono text-[10px] font-bold uppercase leading-4 text-muted-foreground transition group-focus-within:text-primary">
                    {label}
                  </span>
                  <input
                    readOnly
                    value={value}
                    className="h-16 w-full rounded-lg border border-input bg-white px-4 pt-5 text-sm font-semibold text-foreground shadow-flat transition focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
                  />
                </label>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" type="submit">
                <Truck data-icon="inline-start" aria-hidden="true" />
                {localize(language, 'Schedule Pickup', 'Schedule Pickup')}
              </Button>
              <Button size="lg" variant="secondary" type="button" onClick={() => setRoute('/pricing')}>
                {localize(language, 'Check Prices', 'Check Prices')}
              </Button>
            </div>
          </form>
        </Reveal>
      </div>
    </SectionShell>
  );
}

function BranchesSection({ config, language, setRoute }: PublicHomeProps) {
  const activeBranches = config.branches.filter((branch: Branch) => branch.status !== 'closed').slice(0, 3);
  return (
    <SectionShell>
      <div className="flex flex-col gap-10">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeader
            align="start"
            title={localize(language, 'Branches ready for daily residential and corporate care.', 'Branches ready for daily residential and corporate care.')}
            description={localize(language, 'كل فرع يظهر العنوان، الهاتف، ساعات العمل، واتجاهات الوصول بوضوح.', 'Each branch surfaces address, phone, opening hours, WhatsApp, and directions clearly.')}
          />
          <Button variant="secondary" onClick={() => setRoute('/branches')}>
            <MapPin data-icon="inline-start" aria-hidden="true" />
            {localize(language, 'كل الفروع', 'All branches')}
          </Button>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {activeBranches.map((branch, index) => (
            <Reveal key={branch.id} delay={index * 0.04}>
              <div className="h-full rounded-[1.75rem] border border-white/70 bg-white p-6 shadow-low transition hover:-translate-y-1 hover:shadow-medium">
                <div className="flex items-start justify-between gap-4">
                  <span className="grid size-12 place-items-center rounded-2xl bg-[#F2F2F2] text-primary">
                    <Store aria-hidden="true" className="size-5" />
                  </span>
                  <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary">{localize(language, 'Open', 'Open')}</span>
                </div>
                <h3 className="mt-6 font-display text-xl font-extrabold text-foreground">{branch.name}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{branch.address}</p>
                <div className="mt-5 grid gap-3 text-sm font-semibold text-foreground">
                  <p className="flex items-center gap-2" dir="ltr"><Phone aria-hidden="true" className="size-4 text-primary" />{branch.phone}</p>
                  <p className="flex items-center gap-2"><Clock3 aria-hidden="true" className="size-4 text-primary" />{branch.hours}</p>
                </div>
                <Button className="mt-6 w-full" variant="secondary" onClick={() => setRoute('/branches')}>
                  <Navigation data-icon="inline-start" aria-hidden="true" />
                  {localize(language, 'Directions', 'Directions')}
                </Button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function ReviewsSection({ language }: Pick<PublicHomeProps, 'language'>) {
  return (
    <SectionShell className="bg-white/50">
      <SectionHeader
        title={localize(language, 'Reviews that create trust before pickup.', 'Reviews that create trust before pickup.')}
        description={localize(language, 'Premium customers need confidence before they hand over valuable garments.', 'Premium customers need confidence before they hand over valuable garments.')}
      />
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {reviews.map((review, index) => (
          <Reveal key={review.name} delay={index * 0.04}>
            <div className="h-full rounded-[1.75rem] border border-white/70 bg-white p-7 shadow-low">
              <div className="flex gap-1 text-primary" aria-label="5 stars">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Star key={starIndex} aria-hidden="true" className="size-4 fill-current" />
                ))}
              </div>
              <p className="mt-6 text-base leading-8 text-muted-foreground">{t(language, review.text)}</p>
              <div className="mt-8">
                <p className="font-display text-lg font-extrabold text-foreground">{review.name}</p>
                <p className="mt-1 font-mono text-[11px] font-bold uppercase text-secondary">{review.location}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}

function CorporateSection({ language, setRoute }: Pick<PublicHomeProps, 'language' | 'setRoute'>) {
  const clients = [
    { icon: Hotel, title: { ar: 'Hotels', en: 'Hotels' }, desc: { ar: 'مفارش وضيافة بمواعيد ثابتة.', en: 'Guest linens with reliable schedules.' }, path: '/commercial/hotels' },
    { icon: Store, title: { ar: 'Restaurants', en: 'Restaurants' }, desc: { ar: 'يونيفورم ومفارش تشغيلية.', en: 'Uniforms and operational linens.' }, path: '/commercial/restaurants' },
    { icon: ConciergeBell, title: { ar: 'Corporate', en: 'Corporate' }, desc: { ar: 'عقود، فواتير، وخدمة دورية.', en: 'Contracts, invoices, and recurring care.' }, path: '/commercial' },
  ];
  return (
    <SectionShell>
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <SectionHeader
          align="start"
          title={localize(language, 'Residential luxury and corporate reliability in one system.', 'Residential luxury and corporate reliability in one system.')}
          description={localize(language, 'النظام جاهز للنمو إلى بوابة عملاء، POS، وتقارير تشغيلية دون تغيير لغة التصميم.', 'The design language is ready to grow into a customer portal, POS, and operations reporting.')}
        />
        <div className="grid gap-4 md:grid-cols-3">
          {clients.map((client) => {
            const Icon = client.icon;
            return (
              <button
                key={client.path}
                type="button"
                onClick={() => setRoute(client.path)}
                className="rounded-[1.5rem] border border-white/70 bg-white p-6 text-start shadow-low transition hover:-translate-y-1 hover:shadow-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Icon aria-hidden="true" className="size-8 text-primary" />
                <span className="mt-6 block font-display text-lg font-extrabold text-foreground">{t(language, client.title)}</span>
                <span className="mt-2 block text-sm leading-6 text-muted-foreground">{t(language, client.desc)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </SectionShell>
  );
}

function FaqSection({ language, setRoute }: Pick<PublicHomeProps, 'language' | 'setRoute'>) {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <SectionShell className="bg-white/50">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <SectionHeader
            align="start"
            title={localize(language, 'Clear answers before customers trust you with garments.', 'Clear answers before customers trust you with garments.')}
            description={localize(language, 'FAQ behaves like a compact premium support surface, not a long article.', 'FAQ behaves like a compact premium support surface, not a long article.')}
          />
          <Button className="mt-8" variant="secondary" onClick={() => setRoute('/faq')}>
            {localize(language, 'كل الأسئلة', 'All FAQ')}
          </Button>
        </div>
        <div className="grid gap-3">
          {faqs.map((item, index) => (
            <div key={item.q.en} className="rounded-[1.25rem] border border-white/70 bg-white p-5 shadow-low">
              <button
                type="button"
                onClick={() => setOpenIndex((current) => (current === index ? -1 : index))}
                className="flex w-full items-center justify-between gap-4 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-expanded={openIndex === index}
              >
                <span className="font-display text-lg font-extrabold text-foreground">{t(language, item.q)}</span>
                <ChevronDown aria-hidden="true" className={cn('size-5 text-primary transition', openIndex === index && 'rotate-180')} />
              </button>
              {openIndex === index ? <p className="mt-4 text-sm leading-7 text-muted-foreground">{t(language, item.a)}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function FinalCta({ language, setRoute }: Pick<PublicHomeProps, 'language' | 'setRoute'>) {
  return (
    <SectionShell>
      <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-[#8C2370] to-secondary p-8 text-white shadow-high md:p-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="font-mono text-xs font-bold uppercase leading-5 text-white/70">Premium Digital Care</p>
            <h2 className="mt-4 max-w-3xl font-display text-[32px] font-extrabold leading-[40px] md:text-[48px] md:leading-[56px]">
              {localize(language, 'Book pickup, track instantly, and let smart care handle the rest.', 'Book pickup, track instantly, and let smart care handle the rest.')}
            </h2>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Button className="bg-white text-primary hover:bg-white" size="lg" onClick={() => setRoute('/book')}>
              <Truck data-icon="inline-start" aria-hidden="true" />
              {localize(language, 'Schedule Pickup', 'Schedule Pickup')}
            </Button>
            <Button className="border-white/30 bg-white/10 text-white hover:bg-white/15 hover:text-white" size="lg" variant="secondary" onClick={() => setRoute('/track')}>
              <Search data-icon="inline-start" aria-hidden="true" />
              {localize(language, 'Track Order', 'Track Order')}
            </Button>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

export const PublicHome: React.FC<PublicHomeProps> = ({ config, language, setRoute }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overflow-x-hidden bg-background text-foreground">
      <HeroSection config={config} language={language} setRoute={setRoute} />
      <QuickActionRail language={language} setRoute={setRoute} />
      <TrustSection language={language} />
      <ServicesSection language={language} setRoute={setRoute} />
      <ProcessSection language={language} />
      <TechnologySection language={language} setRoute={setRoute} />
      <TrackingSection language={language} setRoute={setRoute} />
      <PickupBookingSection config={config} language={language} setRoute={setRoute} />
      <BranchesSection config={config} language={language} setRoute={setRoute} />
      <ReviewsSection language={language} />
      <CorporateSection language={language} setRoute={setRoute} />
      <FaqSection language={language} setRoute={setRoute} />
      <FinalCta language={language} setRoute={setRoute} />
    </motion.div>
  );
};
