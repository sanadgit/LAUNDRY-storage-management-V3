import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BriefcaseBusiness, Building2, CalendarDays, Gift, HelpCircle, Images, MessageCircle, Newspaper, Search, ShieldCheck, Sparkles, Star, Tag, Users } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { PricingItem, SiteConfig } from '../types';
import { formatCurrency, localize, SiteLanguage } from '../lib/i18n';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui';
import { LaundryIcon, resolvePricingItemIcon } from './LaundryIcon';

interface PublicStaticPageProps {
  route: string;
  config: SiteConfig;
  language: SiteLanguage;
  setRoute: (route: string) => void;
}

type PageMeta = {
  title: { ar: string; en: string };
  eyebrow: { ar: string; en: string };
  description: { ar: string; en: string };
  icon: React.ElementType;
};

const pageMeta: Record<string, PageMeta> = {
  '/about': {
    eyebrow: { ar: 'عن الشركة', en: 'About' },
    title: { ar: 'مصممة لتكون مغسلة فاخرة مدعومة بالذكاء الاصطناعي.', en: 'Built as a premium AI-powered laundry company.' },
    description: { ar: 'In & Out Laundry تجمع التشغيل الدقيق، تجربة رقمية واضحة، وعناية راقية بالملابس في الإمارات.', en: 'In & Out Laundry combines precise operations, a clear digital journey, and premium garment care in the UAE.' },
    icon: Sparkles,
  },
  '/pricing': {
    eyebrow: { ar: 'الأسعار', en: 'Pricing' },
    title: { ar: 'قائمة الأسعار الكاملة حسب نوع الملابس والخدمة.', en: 'Full pricing by garment type and service.' },
    description: { ar: 'كل الأصناف الأصلية من نظام التسعير: ملابس رجالية، نسائية، أطفال، ومنزليات مع أسعار الغسيل والكوي والتنظيف.', en: 'All original pricing items: men, women, kids, and home textiles with wash, press, and dry-clean prices.' },
    icon: Tag,
  },
  '/commercial': {
    eyebrow: { ar: 'قطاع الأعمال', en: 'Commercial' },
    title: { ar: 'تشغيل غسيل موثوق للفنادق والمطاعم والشركات.', en: 'Reliable laundry operations for hotels, restaurants, and businesses.' },
    description: { ar: 'حلول B2B مع جداول ثابتة، تقارير، ومتابعة تشغيلية.', en: 'B2B solutions with fixed schedules, reporting, and operational follow-up.' },
    icon: Building2,
  },
  '/commercial/hotels': {
    eyebrow: { ar: 'الفنادق', en: 'Hotels' },
    title: { ar: 'عناية منظمة بمفارش وغسيل الضيافة.', en: 'Structured linen and hospitality laundry care.' },
    description: { ar: 'مناسب للفنادق والشقق الفندقية التي تحتاج اتساقًا في الجودة والتسليم.', en: 'For hotels and serviced apartments needing consistent quality and delivery.' },
    icon: Building2,
  },
  '/commercial/restaurants': {
    eyebrow: { ar: 'المطاعم', en: 'Restaurants' },
    title: { ar: 'غسيل موحد للمفارش واليونيفورم.', en: 'Consistent laundry for table linen and uniforms.' },
    description: { ar: 'حلول دورية للمطاعم والمقاهي مع مرونة في أوقات الاستلام.', en: 'Recurring solutions for restaurants and cafes with flexible pickup windows.' },
    icon: BriefcaseBusiness,
  },
  '/faq': {
    eyebrow: { ar: 'الأسئلة الشائعة', en: 'FAQ' },
    title: { ar: 'إجابات سريعة قبل الحجز.', en: 'Fast answers before booking.' },
    description: { ar: 'أهم الأسئلة حول الاستلام، التوصيل، الأسعار، والتتبع.', en: 'Key questions about pickup, delivery, pricing, and tracking.' },
    icon: HelpCircle,
  },
  '/reviews': {
    eyebrow: { ar: 'آراء العملاء', en: 'Reviews' },
    title: { ar: 'ثقة مبنية على وضوح الخدمة.', en: 'Trust built through clear service.' },
    description: { ar: 'نماذج مبسطة لآراء العملاء في هذه المرحلة.', en: 'Simplified customer review samples for this phase.' },
    icon: Star,
  },
  '/gallery': {
    eyebrow: { ar: 'المعرض', en: 'Gallery' },
    title: { ar: 'لمحات من التشغيل والعناية.', en: 'A look inside operations and care.' },
    description: { ar: 'صور وأصول مرئية من رحلة الطلب، سيتم توسيعها لاحقًا.', en: 'Visual assets from the order journey, ready for expansion later.' },
    icon: Images,
  },
  '/blog': {
    eyebrow: { ar: 'المدونة', en: 'Blog' },
    title: { ar: 'محتوى قصير عن العناية والتشغيل.', en: 'Short notes about care and operations.' },
    description: { ar: 'مقالات أولية قابلة للتحويل لاحقًا إلى CMS.', en: 'Starter articles that can later move into a CMS.' },
    icon: Newspaper,
  },
  '/blog/details': {
    eyebrow: { ar: 'تفاصيل المقال', en: 'Blog details' },
    title: { ar: 'كيف تحافظ على العباية السوداء بعد الغسيل؟', en: 'How to preserve a black abaya after cleaning.' },
    description: { ar: 'مقال تفصيلي مبسط ضمن المرحلة الأولى.', en: 'A simplified article detail page for phase one.' },
    icon: Newspaper,
  },
  '/offers': {
    eyebrow: { ar: 'العروض', en: 'Offers' },
    title: { ar: 'عروض واضحة بدون ازدحام بصري.', en: 'Clear offers without visual clutter.' },
    description: { ar: 'العروض الحالية من إعدادات الموقع، مع إمكانية التوسع لاحقًا.', en: 'Current offers from site settings, ready to expand later.' },
    icon: Gift,
  },
  '/care-guides': {
    eyebrow: { ar: 'أدلة العناية', en: 'Care guides' },
    title: { ar: 'إرشادات مختصرة للعناية بالقطع الحساسة.', en: 'Short guidance for delicate item care.' },
    description: { ar: 'محتوى تثقيفي مبسط يدعم تجربة العميل قبل وبعد الخدمة.', en: 'Simple educational content supporting the customer before and after service.' },
    icon: ShieldCheck,
  },
  '/care-guides/details': {
    eyebrow: { ar: 'تفاصيل الدليل', en: 'Guide details' },
    title: { ar: 'دليل العناية بالملابس الفاخرة.', en: 'Luxury garment care guide.' },
    description: { ar: 'صفحة تفاصيل مبسطة لشرح خطوات العناية الأساسية.', en: 'A simplified detail page explaining core care steps.' },
    icon: ShieldCheck,
  },
  '/careers': {
    eyebrow: { ar: 'الوظائف', en: 'Careers' },
    title: { ar: 'انضم إلى فريق تشغيل راقٍ ومنظم.', en: 'Join a polished and organized operations team.' },
    description: { ar: 'صفحة أولية لعرض ثقافة العمل والفرص المستقبلية.', en: 'A starter page for work culture and future opportunities.' },
    icon: Users,
  },
  '/404': {
    eyebrow: { ar: '404', en: '404' },
    title: { ar: 'الصفحة غير موجودة.', en: 'Page not found.' },
    description: { ar: 'ربما تغير الرابط أو لم يتم بناء الصفحة بعد.', en: 'The link may have changed or the page has not been built yet.' },
    icon: HelpCircle,
  },
};

export const PublicStaticPage: React.FC<PublicStaticPageProps> = ({ route, config, language, setRoute }) => {
  const meta = pageMeta[route] || pageMeta['/404'];
  const Icon = meta.icon;
  const reduceMotion = useReducedMotion();
  const t = (ar: string, en: string) => localize(language, ar, en);

  return (
    <main className="min-h-screen bg-background pt-24 text-foreground md:pt-28">
      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1fr_.72fr] md:items-center md:py-16 lg:px-8">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Badge variant="accent" className="mb-5">{localize(language, meta.eyebrow.ar, meta.eyebrow.en)}</Badge>
            <h1 className="max-w-3xl text-4xl font-black leading-tight text-primary md:text-6xl">
              {localize(language, meta.title.ar, meta.title.en)}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
              {localize(language, meta.description.ar, meta.description.en)}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button variant="accent" size="lg" onClick={() => setRoute('/book')}>
                {t('احجز استلام', 'Book pickup')}
              </Button>
              <Button variant="secondary" size="lg" onClick={() => setRoute('/contact')}>
                {t('تواصل معنا', 'Contact us')}
              </Button>
            </div>
          </motion.div>

          <div className="rounded-xl border border-border bg-muted p-8">
            <div className="mx-auto grid size-24 place-items-center rounded-pill bg-primary text-white">
              <Icon aria-hidden="true" className="size-10" />
            </div>
            <div className="mt-8 grid gap-3">
              {[t('RTL/LTR جاهز', 'RTL/LTR ready'), t('Light/Dark mode', 'Light/Dark mode'), t('قابل للتفصيل لاحقًا', 'Ready for detail later')].map((item) => (
                <div key={item} className="rounded-lg bg-surface p-3 text-center font-bold">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <DynamicContent route={route} config={config} language={language} setRoute={setRoute} />
      </section>
    </main>
  );
};

const DynamicContent = ({ route, config, language, setRoute }: PublicStaticPageProps) => {
  const t = (ar: string, en: string) => localize(language, ar, en);

  if (route === '/pricing') {
    return <FullPricingList pricing={config.pricing} language={language} setRoute={setRoute} />;
  }

  if (route.startsWith('/commercial')) {
    const items: Array<[React.ElementType, string, string, string]> = route === '/commercial'
      ? [
          [Building2, t('الفنادق', 'Hotels'), t('مفارش، مناشف، ويونيفورم بجداول ثابتة.', 'Linen, towels, and uniforms on fixed schedules.'), '/commercial/hotels'],
          [BriefcaseBusiness, t('المطاعم', 'Restaurants'), t('مفارش طاولات ويونيفورم مع استلام مرن.', 'Table linen and uniforms with flexible pickup.'), '/commercial/restaurants'],
          [CalendarDays, t('تقارير دورية', 'Recurring reports'), t('ملخصات تشغيلية قابلة للربط لاحقًا.', 'Operational summaries ready for later integration.'), '/contact'],
        ]
      : [
          [ShieldCheck, t('SLA واضح', 'Clear SLA'), t('اتفاق خدمة ومواعيد تشغيل محددة.', 'Defined service agreement and operating windows.'), '/contact'],
          [CalendarDays, t('جدولة ثابتة', 'Fixed schedule'), t('استلام وتسليم متكرر حسب احتياج المنشأة.', 'Recurring pickup and delivery by business need.'), '/book'],
          [MessageCircle, t('مدير حساب', 'Account manager'), t('قناة تواصل مباشرة للحالات التجارية.', 'Direct contact channel for commercial cases.'), '/contact'],
        ];

    return <ActionGrid items={items} language={language} setRoute={setRoute} />;
  }

  if (route === '/faq') {
    return (
      <Grid title={t('أسئلة شائعة', 'Common questions')}>
        {[
          [t('هل يمكن تتبع الطلب؟', 'Can I track my order?'), t('نعم، من صفحة التتبع برقم الطلب.', 'Yes, from the tracking page using the order ID.')],
          [t('هل تدعمون الاستلام من المنزل؟', 'Do you support home pickup?'), t('نعم، حسب المناطق النشطة والفروع المتاحة.', 'Yes, based on active areas and available branches.')],
          [t('هل يوجد دفع عند الاستلام؟', 'Is cash payment available?'), t('نعم، حسب طرق الدفع المفعلة في النظام.', 'Yes, depending on enabled payment methods.')],
        ].map(([q, a]) => <InfoCard key={q} title={q} text={a} />)}
      </Grid>
    );
  }

  if (route === '/reviews') {
    return (
      <Grid title={t('نماذج آراء', 'Review samples')}>
        {[
          [t('خدمة راقية وسريعة.', 'Premium and fast service.'), 'Fatima H.'],
          [t('التتبع واضح جدًا.', 'The tracking is very clear.'), 'Omar A.'],
          [t('اهتمام ممتاز بالعبايات.', 'Excellent abaya care.'), 'Mariam S.'],
        ].map(([text, name]) => <ReviewCard key={name} text={text} name={name} />)}
      </Grid>
    );
  }

  if (route === '/gallery') {
    return (
      <Grid title={t('معرض مبسط', 'Simple gallery')}>
        {config.gallery.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <LaundryIcon name={item.icon} alt={item.label} className="mb-4 h-24 w-24" />
              <CardTitle>{item.label}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </Grid>
    );
  }

  if (route === '/offers') {
    return (
      <Grid title={t('العروض الحالية', 'Current offers')}>
        {config.offers.map((offer) => (
          <Card key={offer.id}>
            <CardHeader>
              <Badge variant={offer.active ? 'success' : 'neutral'}>{offer.active ? t('نشط', 'Active') : t('متوقف', 'Paused')}</Badge>
              <CardTitle>{offer.name}</CardTitle>
              <CardDescription>{offer.condition}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black text-accent">{offer.discount}</p>
            </CardContent>
          </Card>
        ))}
      </Grid>
    );
  }

  if (route === '/blog' || route === '/care-guides') {
    const isBlog = route === '/blog';
    const target = isBlog ? '/blog/details' : '/care-guides/details';
    const items = isBlog
      ? [
          [t('العناية بالعبايات السوداء', 'Caring for black abayas'), t('نصائح قصيرة للحفاظ على اللون والتطريز.', 'Short tips for color and embroidery care.')],
          [t('متى تختار التنظيف الجاف؟', 'When to choose dry cleaning'), t('شرح مبسط للقطع الحساسة.', 'A simple guide for delicate garments.')],
          [t('تجهيز المفارش للموسم', 'Seasonal bedding refresh'), t('متى تنظف البطانيات والمفارش الكبيرة.', 'When to clean blankets and large bedding.')],
        ]
      : [
          [t('دليل الملابس الفاخرة', 'Luxury garment guide'), t('خطوات قبل وبعد التنظيف.', 'Steps before and after cleaning.')],
          [t('دليل الستائر', 'Curtain guide'), t('كيف تقلل الغبار وتحافظ على القماش.', 'How to reduce dust and preserve fabric.')],
          [t('دليل الأحذية', 'Shoe guide'), t('عناية بسيطة قبل التسليم.', 'Simple care before handoff.')],
        ];
    return (
      <Grid title={isBlog ? t('مقالات أولية', 'Starter posts') : t('أدلة أولية', 'Starter guides')}>
        {items.map(([title, text]) => <ArticleCard key={title} title={title} text={text} onOpen={() => setRoute(target)} language={language} />)}
      </Grid>
    );
  }

  if (route === '/blog/details' || route === '/care-guides/details') {
    return (
      <article className="mx-auto max-w-3xl rounded-xl border border-border bg-surface p-6 md:p-8">
        <p className="text-sm font-bold text-accent">{t('محتوى المرحلة الأولى', 'Phase one content')}</p>
        <h2 className="mt-3 text-3xl font-black">{route === '/blog/details' ? t('العناية بالعبايات السوداء', 'Caring for black abayas') : t('دليل الملابس الفاخرة', 'Luxury garment guide')}</h2>
        <p className="mt-5 leading-8 text-muted-foreground">
          {t(
            'احفظ القطع بعيدًا عن الرطوبة، لا تستخدم حرارة عالية مباشرة، واتبع تعليمات العناية الخاصة بكل قماش. عند وجود تطريز أو جلد أو أقمشة حساسة، الأفضل اختيار خدمة متخصصة.',
            'Store items away from moisture, avoid direct high heat, and follow each fabric care label. For embroidery, leather, or delicate fabrics, specialized care is recommended.',
          )}
        </p>
      </article>
    );
  }

  if (route === '/careers') {
    return (
      <Grid title={t('فرص مستقبلية', 'Future roles')}>
        {[
          [t('خدمة عملاء', 'Customer care'), t('تواصل واضح وحل مشكلات.', 'Clear communication and issue resolution.')],
          [t('عمليات الفروع', 'Branch operations'), t('تنظيم الطلبات وجودة التسليم.', 'Order organization and delivery quality.')],
          [t('التوصيل', 'Delivery'), t('استلام وتسليم باحترافية.', 'Professional pickup and delivery.')],
        ].map(([title, text]) => <InfoCard key={title} title={title} text={text} />)}
      </Grid>
    );
  }

  if (route === '/404') {
    return (
      <div className="mx-auto max-w-xl text-center">
        <Button variant="accent" size="lg" onClick={() => setRoute('/')}>{t('العودة للرئيسية', 'Back home')}</Button>
      </div>
    );
  }

  return (
    <Grid title={t('محتوى مبسط', 'Simple content')}>
      {[
        [t('رؤية فاخرة', 'Premium vision'), t('تجربة رقمية لا تشبه مواقع المغاسل التقليدية.', 'A digital experience beyond typical laundry websites.')],
        [t('تشغيل واضح', 'Clear operations'), t('حجز، تتبع، وتواصل في مسارات مفهومة.', 'Booking, tracking, and contact in understandable flows.')],
        [t('جاهز للتوسع', 'Ready to scale'), t('كل قسم قابل للتفصيل في مرحلة لاحقة.', 'Every section can be detailed in a later phase.')],
      ].map(([title, text]) => <InfoCard key={title} title={title} text={text} />)}
    </Grid>
  );
};

const categoryCopy: Record<string, { ar: string; en: string }> = {
  all: { ar: 'كل الأصناف', en: 'All items' },
  men: { ar: 'رجالي', en: 'Men' },
  women: { ar: 'نسائي', en: 'Women' },
  kids: { ar: 'أطفال', en: 'Kids' },
  home: { ar: 'منزليات', en: 'Home' },
};

const serviceColumns: Array<{
  key: keyof Pick<PricingItem, 'wash_dry' | 'wash_iron' | 'iron' | 'dry'>;
  label: { ar: string; en: string };
}> = [
  { key: 'wash_dry', label: { ar: 'غسيل', en: 'Wash' } },
  { key: 'wash_iron', label: { ar: 'غسيل + كوي', en: 'Wash + press' } },
  { key: 'iron', label: { ar: 'كوي فقط', en: 'Press only' } },
  { key: 'dry', label: { ar: 'تنظيف جاف', en: 'Dry clean' } },
];

const FullPricingList = ({
  pricing,
  language,
  setRoute,
}: {
  pricing: PricingItem[];
  language: SiteLanguage;
  setRoute: (route: string) => void;
}) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [query, setQuery] = useState('');
  const t = (ar: string, en: string) => localize(language, ar, en);

  const activePricing = useMemo(
    () => pricing.filter((item) => item.active !== false),
    [pricing],
  );

  const categories = useMemo(() => {
    const ids = ['all', ...Array.from(new Set(activePricing.map((item) => item.category).filter(Boolean)))];
    return ids.filter((id) => categoryCopy[id]);
  }, [activePricing]);

  const filteredPricing = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return activePricing.filter((item) => {
      const categoryMatches = activeCategory === 'all' || item.category === activeCategory;
      if (!categoryMatches) return false;
      if (!normalizedQuery) return true;
      return [item.barcode, item.name_ar, item.name_en, item.category]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery));
    });
  }, [activeCategory, activePricing, query]);

  const featuredItems = useMemo(() => {
    const wanted = ['12', '3', '19', '1', '23', '58'];
    return wanted
      .map((barcode) => activePricing.find((item) => item.barcode === barcode))
      .filter((item): item is PricingItem => Boolean(item));
  }, [activePricing]);
  const showFeaturedItems = activeCategory === 'all' && query.trim().length === 0;

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/72 shadow-glass backdrop-blur-3xl">
        <div className="grid gap-6 p-5 md:grid-cols-[1fr_auto] md:items-end md:p-7">
          <div>
            <Badge variant="accent" className="mb-4">{t('القائمة الأصلية كاملة', 'Complete original list')}</Badge>
            <h2 className="text-3xl font-black text-foreground md:text-4xl">
              {t('كل قطعة بسعرها حسب الخدمة.', 'Every item priced by service.')}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
              {t(
                'اختر التصنيف أو ابحث باسم القطعة، وستظهر الأسعار كما هي في نظام التسعير الأولي.',
                'Choose a category or search by item name; prices are shown from the original pricing system.',
              )}
            </p>
          </div>
          <Button size="lg" onClick={() => setRoute('/book')}>
            {t('احجز استلام', 'Book pickup')}
          </Button>
        </div>

        <div className="border-t border-border bg-white/48 p-4 md:p-5">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
            <label className="relative block">
              <Search aria-hidden="true" className="pointer-events-none absolute start-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('ابحث: كندورة، عباءة، بطانية، ستارة...', 'Search: Kandoora, abaya, blanket, curtain...')}
                className="h-14 w-full rounded-2xl border border-input bg-white px-12 text-sm font-semibold shadow-flat outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
              />
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((category) => {
                const active = activeCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`whitespace-nowrap rounded-2xl border px-4 py-3 text-sm font-black transition ${
                      active
                        ? 'border-primary bg-primary text-white shadow-medium'
                        : 'border-border bg-white text-muted-foreground hover:border-primary/30 hover:text-primary'
                    }`}
                  >
                    {localize(language, categoryCopy[category].ar, categoryCopy[category].en)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {showFeaturedItems ? (
        <section className="grid gap-4 md:grid-cols-3">
          {featuredItems.map((item) => (
            <Card key={item.barcode} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <LaundryIcon name={resolvePricingItemIcon(item)} alt={language === 'ar' ? item.name_ar : item.name_en} className="h-16 w-16" />
                  <Badge variant="info">{localize(language, categoryCopy[item.category]?.ar || item.category, categoryCopy[item.category]?.en || item.category)}</Badge>
                </div>
                <CardTitle>{language === 'ar' ? item.name_ar : item.name_en}</CardTitle>
                <CardDescription>{item.name_en}</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                {serviceColumns.slice(0, 2).map((service) => (
                  <PriceCell key={service.key} item={item} serviceKey={service.key} label={localize(language, service.label.ar, service.label.en)} language={language} />
                ))}
              </CardContent>
            </Card>
          ))}
        </section>
      ) : null}

      <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-glass">
        <div className="flex flex-col justify-between gap-3 border-b border-border p-5 md:flex-row md:items-center">
          <div>
            <h3 className="text-2xl font-black text-foreground">{t('جدول الأسعار الكامل', 'Full price table')}</h3>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">
              {t('عدد الأصناف المعروضة:', 'Visible items:')} <span className="text-primary">{filteredPricing.length}</span>
            </p>
          </div>
          <Badge variant="neutral">{t('الأسعار بالدرهم الإماراتي', 'Prices in AED')}</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-sm">
            <thead>
              <tr className="bg-[#fbf0fe] text-start">
                <th className="px-5 py-4 text-start font-black text-foreground">{t('القطعة', 'Item')}</th>
                <th className="px-4 py-4 text-start font-black text-foreground">{t('التصنيف', 'Category')}</th>
                {serviceColumns.map((service) => (
                  <th key={service.key} className="px-4 py-4 text-start font-black text-foreground">
                    {localize(language, service.label.ar, service.label.en)}
                  </th>
                ))}
                <th className="px-4 py-4 text-start font-black text-foreground">{t('باركود', 'Barcode')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredPricing.map((item) => (
                <tr key={item.barcode} className="border-t border-border transition hover:bg-[#F2F2F2]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <LaundryIcon name={resolvePricingItemIcon(item)} alt={language === 'ar' ? item.name_ar : item.name_en} className="h-12 w-12 shrink-0" />
                      <div>
                        <p className="font-black text-foreground">{language === 'ar' ? item.name_ar : item.name_en}</p>
                        <p className="mt-0.5 font-mono text-[11px] font-bold uppercase text-muted-foreground">{item.name_en}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="info">{localize(language, categoryCopy[item.category]?.ar || item.category, categoryCopy[item.category]?.en || item.category)}</Badge>
                  </td>
                  {serviceColumns.map((service) => (
                    <td key={service.key} className="px-4 py-4 font-black tabular-nums text-foreground">
                      {formatPriceValue(language, Number(item[service.key]))}
                    </td>
                  ))}
                  <td className="px-4 py-4 font-mono text-xs font-bold text-muted-foreground">{item.barcode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const PriceCell = ({
  item,
  serviceKey,
  label,
  language,
}: {
  item: PricingItem;
  serviceKey: keyof Pick<PricingItem, 'wash_dry' | 'wash_iron' | 'iron' | 'dry'>;
  label: string;
  language: SiteLanguage;
}) => (
  <div className="rounded-2xl border border-border bg-white/70 p-3">
    <p className="text-xs font-bold text-muted-foreground">{label}</p>
    <p className="mt-1 text-lg font-black text-primary">{formatPriceValue(language, Number(item[serviceKey]))}</p>
  </div>
);

const formatPriceValue = (language: SiteLanguage, value: number) => {
  if (!Number.isFinite(value) || value <= 0) return '-';
  return formatCurrency(language, value);
};

const Grid = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h2 className="mb-6 text-3xl font-black">{title}</h2>
    <div className="grid gap-4 md:grid-cols-3">{children}</div>
  </div>
);

const InfoCard = ({ title, text }: { title: string; text: string }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{text}</CardDescription>
    </CardHeader>
  </Card>
);

const ReviewCard = ({ text, name }: { text: string; name: string }) => (
  <Card>
    <CardHeader>
      <div className="mb-3 flex gap-1 text-accent">{[0, 1, 2, 3, 4].map((item) => <Star key={item} aria-hidden="true" className="size-4 fill-current" />)}</div>
      <CardTitle>{text}</CardTitle>
      <CardDescription>{name}</CardDescription>
    </CardHeader>
  </Card>
);

const ArticleCard = ({ title, text, onOpen, language }: { title: string; text: string; onOpen: () => void; language: SiteLanguage }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{text}</CardDescription>
    </CardHeader>
    <CardContent>
      <Button variant="ghost" onClick={onOpen}>
        {localize(language, 'اقرأ المزيد', 'Read more')}
        {language === 'ar' ? <ArrowLeft aria-hidden="true" className="size-4" /> : <ArrowRight aria-hidden="true" className="size-4" />}
      </Button>
    </CardContent>
  </Card>
);

const ActionGrid = ({
  items,
  language,
  setRoute,
}: {
  items: Array<[React.ElementType, string, string, string]>;
  language: SiteLanguage;
  setRoute: (route: string) => void;
}) => (
  <Grid title={localize(language, 'خيارات الخدمة', 'Service options')}>
    {items.map(([Icon, title, text, route]) => (
      <Card key={title}>
        <CardHeader>
          <div className="mb-4 grid size-12 place-items-center rounded-md bg-primary text-white">
            <Icon aria-hidden="true" className="size-6" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{text}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="secondary" onClick={() => setRoute(route)}>
            {localize(language, 'فتح', 'Open')}
          </Button>
        </CardContent>
      </Card>
    ))}
  </Grid>
);
