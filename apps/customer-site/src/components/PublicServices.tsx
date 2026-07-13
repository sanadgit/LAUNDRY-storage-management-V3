import React, { useMemo } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { SiteConfig } from '../types';
import { formatCurrency, localize, SiteLanguage } from '../lib/i18n';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui';
import { LaundryIcon } from './LaundryIcon';

interface PublicServicesProps {
  config: SiteConfig;
  language: SiteLanguage;
  setRoute: (route: string) => void;
}

interface PublicServiceDetailsProps extends PublicServicesProps {
  slug: string;
}

type ServiceDetail = {
  slug: string;
  icon: string;
  image?: {
    src: string;
    alt: { ar: string; en: string };
  };
  title: { ar: string; en: string };
  summary: { ar: string; en: string };
  care: { ar: string; en: string }[];
  idealFor: { ar: string; en: string }[];
  details?: {
    title: { ar: string; en: string };
    text: { ar: string; en: string };
  }[];
  materials?: {
    ar: string;
    en: string;
  }[];
  priceFrom: number;
};

const PACKAGING_SYSTEM_IMAGES = {
  concept: '/service-images/packaging-system-concept.png',
  folded: '/service-images/folded-clothes-packaging.png',
  label: '/service-images/barcode-label-packaging.png',
  glass: '/service-images/glass-storage-packaging.png',
};
const packagingAlt = {
  ar: 'نظام تعبئة وتخزين In & Out Laundry بأكياس فروستد وملصقات باركود وخزائن زجاجية',
  en: 'In & Out Laundry storage and packaging system with frosted bags, barcode labels, and glass cabinets',
};
const packagingHighlights = [
  {
    ar: 'أكياس frosted شبه شفافة للملابس المطوية مع شعار وملصق طلب واضح.',
    en: 'Frosted semi-transparent folded-clothes bags with logo and visible order label.',
  },
  {
    ar: 'ملصق ديناميكي من نظام الطلبات يوضح الكمية، الرف، والباركود.',
    en: 'Dynamic order-system label showing quantity, shelf code, and barcode.',
  },
  {
    ar: 'خزائن زجاجية مقفلة للأحذية والقبعات قرب المدخل لعرض العناية premium بأمان.',
    en: 'Lockable glass cabinets for shoes and caps near the entrance, showing premium care securely.',
  },
];

const serviceDetails: ServiceDetail[] = [
  {
    slug: 'wash-iron',
    icon: 'washing_machine',
    image: {
      src: '/service-images/folded-clothes-packaging.png',
      alt: {
        ar: 'ملابس يومية مطوية ومغلفة بعد الغسيل والكوي',
        en: 'Everyday garments folded and packed after wash and press',
      },
    },
    title: { ar: 'غسيل وكوي يومي', en: 'Wash & Press' },
    summary: {
      ar: 'الخدمة اليومية الأسرع للقمصان، الكنادير، الملابس المنزلية، والقطع التي تحتاج نتيجة نظيفة ومنظمة.',
      en: 'The fast everyday service for shirts, kandooras, home garments, and items that need a clean, neat finish.',
    },
    care: [
      { ar: 'فرز القطع حسب اللون والنسيج قبل الغسيل.', en: 'Items are sorted by color and fabric before washing.' },
      { ar: 'غسيل مناسب للقطع اليومية بدون حرارة قاسية.', en: 'Washing suited to daily garments without harsh heat.' },
      { ar: 'كوي وتشطيب ثم تغليف واضح قابل للتتبع.', en: 'Pressing, finishing, then clear trackable packing.' },
    ],
    idealFor: [
      { ar: 'القمصان والبناطيل اليومية', en: 'Daily shirts and trousers' },
      { ar: 'ملابس العمل', en: 'Workwear' },
      { ar: 'طلبات العائلة الأسبوعية', en: 'Weekly family orders' },
    ],
    priceFrom: 8,
  },
  {
    slug: 'dry-cleaning',
    icon: 'dry_cleaning_suit',
    image: {
      src: '/service-images/luxury-garment-care-premium.png',
      alt: {
        ar: 'تنظيف جاف للبدلات والملابس الحساسة مع تشطيب فاخر',
        en: 'Dry cleaning for suits and delicate garments with premium finishing',
      },
    },
    title: { ar: 'تنظيف جاف', en: 'Dry Cleaning' },
    summary: {
      ar: 'مسار عناية للبدلات، المعاطف، الفساتين، والأقمشة التي لا يناسبها الغسيل التقليدي.',
      en: 'A care route for suits, coats, dresses, and fabrics that are not suited for regular washing.',
    },
    care: [
      { ar: 'قراءة تعليمات العناية وفحص البقع قبل المعالجة.', en: 'Care-label review and stain check before treatment.' },
      { ar: 'اختيار طريقة تنظيف تناسب القماش والتبطين.', en: 'Cleaning method selected by fabric and lining.' },
      { ar: 'تشطيب بالبخار وتعليق يحافظ على شكل القطعة.', en: 'Steam finishing and hanging to preserve garment shape.' },
    ],
    idealFor: [
      { ar: 'البدلات والمعاطف', en: 'Suits and coats' },
      { ar: 'فساتين المناسبات', en: 'Occasion dresses' },
      { ar: 'الأقمشة الحساسة', en: 'Delicate fabrics' },
    ],
    priceFrom: 20,
  },
  {
    slug: 'kandoora',
    icon: 'men_kandoora',
    image: {
      src: '/service-images/luxury-garment-care-premium.png',
      alt: {
        ar: 'عناية بالكندورة والغترة مع كوي وتشطيب مرتب',
        en: 'Kandoora and ghutra care with neat pressing and finishing',
      },
    },
    title: { ar: 'الكندورة والغترة', en: 'Kandoora & Ghutra' },
    summary: {
      ar: 'عناية يومية دقيقة بالكندورة والغترة، مع تركيز على البياض، الخطوط، والكوي المرتب.',
      en: 'Precise daily care for kandoora and ghutra, focused on whiteness, lines, and neat pressing.',
    },
    care: [
      { ar: 'فصل القطع البيضاء والحساسة قبل الغسيل.', en: 'White and delicate items are separated before washing.' },
      { ar: 'كوي مضبوط يحافظ على الخطوط والمظهر الرسمي.', en: 'Controlled pressing preserves lines and formal appearance.' },
      { ar: 'تغليف وتعليق مناسب للاستلام أو التوصيل.', en: 'Packing and hanging suited for pickup or delivery.' },
    ],
    idealFor: [
      { ar: 'الكندورة اليومية', en: 'Daily kandoora' },
      { ar: 'الغترة والشيلة', en: 'Ghutra and sheila' },
      { ar: 'ملابس العمل والمناسبات', en: 'Work and occasion garments' },
    ],
    priceFrom: 10,
  },
  {
    slug: 'curtains',
    icon: 'home_curtain_big',
    image: {
      src: '/service-images/curtain-care-premium.png',
      alt: {
        ar: 'تنظيف ستائر فاخر بالبخار وأدوات عناية بالقماش',
        en: 'Premium curtain steam cleaning with fabric care tools',
      },
    },
    title: { ar: 'تنظيف الستائر', en: 'Curtains' },
    summary: {
      ar: 'فك، تنظيف عميق، تعقيم بالبخار، وتجهيز يحافظ على نسيج الستائر ومظهرها.',
      en: 'Deep cleaning, steam sanitizing, and finishing that protects curtain texture and drape.',
    },
    care: [
      { ar: 'فحص نوع القماش والبطانة قبل التنظيف.', en: 'Fabric and lining inspection before care.' },
      { ar: 'إزالة الغبار والرائحة بدون مواد قاسية.', en: 'Dust and odor removal without harsh chemicals.' },
      { ar: 'تغليف يحافظ على الطي والنظافة أثناء التسليم.', en: 'Packing that preserves shape and cleanliness.' },
    ],
    idealFor: [
      { ar: 'الفلل والشقق الراقية', en: 'Premium homes and apartments' },
      { ar: 'الستائر الثقيلة والشفافة', en: 'Heavy and sheer curtains' },
      { ar: 'تنظيف موسمي أو بعد الانتقال', en: 'Seasonal or move-in cleaning' },
    ],
    priceFrom: 35,
  },
  {
    slug: 'carpets',
    icon: 'home_sofa_cover',
    image: {
      src: '/service-images/carpet-care-premium.png',
      alt: {
        ar: 'تنظيف سجاد فاخر مع فرش وأدوات إزالة البقع',
        en: 'Premium carpet cleaning with brushes and stain care tools',
      },
    },
    title: { ar: 'تنظيف السجاد', en: 'Carpets' },
    summary: {
      ar: 'تنظيف وإزالة بقع وتجفيف مضبوط للسجاد المنزلي والقطع الصغيرة.',
      en: 'Stain treatment, controlled washing, and drying for home carpets and small rugs.',
    },
    care: [
      { ar: 'معاينة البقع ومسار الألياف.', en: 'Spot and fiber-direction inspection.' },
      { ar: 'تجفيف مراقب لتجنب الروائح والرطوبة.', en: 'Controlled drying to prevent odor and moisture.' },
      { ar: 'تقرير حالة مختصر عند الحاجة.', en: 'Short condition note when needed.' },
    ],
    idealFor: [
      { ar: 'السجاد اليومي', en: 'Daily-use carpets' },
      { ar: 'قطع المجالس', en: 'Majlis rugs' },
      { ar: 'الروائح والبقع الخفيفة', en: 'Odor and light stain care' },
    ],
    priceFrom: 45,
  },
  {
    slug: 'shoes',
    icon: 'dry_cleaning_suit',
    image: {
      src: '/service-images/shoe-care-premium.png',
      alt: {
        ar: 'تنظيف أحذية فاخر باستخدام فرشاة وأدوات عناية',
        en: 'Premium shoe cleaning with brush and care tools',
      },
    },
    title: { ar: 'العناية بالأحذية', en: 'Shoes' },
    summary: {
      ar: 'تنظيف يدوي وتشطيب للأحذية الجلدية، القماشية، والسنيكرز الفاخر مع تعقيم داخلي وحماية للشكل.',
      en: 'Manual cleaning and finishing for leather shoes, fabric footwear, and premium sneakers with interior sanitizing and shape protection.',
    },
    care: [
      { ar: 'فحص الخامة، اللون، النعل، الأربطة، ومناطق الاحتكاك قبل بدء التنظيف.', en: 'Inspection of material, color, sole, laces, and high-friction areas before cleaning.' },
      { ar: 'إزالة الغبار الجاف والأوساخ السطحية بفرش ناعمة حتى لا تتضرر الخامة.', en: 'Dry dust and surface dirt removal with soft brushes to protect the material.' },
      { ar: 'تنظيف يدوي مخصص حسب الجلد، القماش، الشامواه، أو خامات السنيكرز المختلطة.', en: 'Manual cleaning tailored to leather, fabric, suede, or mixed sneaker materials.' },
      { ar: 'تعقيم داخلي وتقليل الروائح مع تجفيف لطيف بدون حرارة مباشرة.', en: 'Interior sanitizing and odor reduction with gentle drying and no direct heat.' },
      { ar: 'تشطيب نهائي، ترتيب الأربطة، وتغليف يحافظ على شكل الحذاء أثناء التسليم.', en: 'Final finishing, lace reset, and packaging that preserves shoe shape during delivery.' },
    ],
    idealFor: [
      { ar: 'الأحذية الجلدية', en: 'Leather shoes' },
      { ar: 'السنيكرز الفاخر', en: 'Premium sneakers' },
      { ar: 'أحذية المناسبات', en: 'Occasion footwear' },
      { ar: 'الشامواه والأقمشة الحساسة', en: 'Suede and delicate fabrics' },
    ],
    details: [
      {
        title: { ar: 'تنظيف حسب الخامة', en: 'Material-specific cleaning' },
        text: {
          ar: 'لا نستخدم طريقة واحدة لكل الأحذية. يتم تحديد الفرشاة والمنظف وكمية الرطوبة حسب الخامة واللون.',
          en: 'We do not use one method for every shoe. Brush type, cleaner, and moisture level are selected by material and color.',
        },
      },
      {
        title: { ar: 'العناية بالنعل والحواف', en: 'Sole and edge care' },
        text: {
          ar: 'يتم التركيز على النعل الأبيض، الحواف، ومناطق الاتساخ المتكرر لأنها أكثر ما يغيّر مظهر الحذاء.',
          en: 'White soles, edges, and high-soil areas receive focused attention because they define the final look.',
        },
      },
      {
        title: { ar: 'تعقيم وتقليل روائح', en: 'Sanitizing and odor control' },
        text: {
          ar: 'يتم التعامل مع الداخل بلطف لتقليل الروائح والرطوبة بدون إغراق الحذاء أو تعريضه لحرارة قاسية.',
          en: 'Interior care reduces odor and moisture gently without soaking the shoe or exposing it to harsh heat.',
        },
      },
    ],
    materials: [
      { ar: 'جلد طبيعي وصناعي', en: 'Natural and synthetic leather' },
      { ar: 'سنيكرز أبيض وملون', en: 'White and colored sneakers' },
      { ar: 'قماش وشبك رياضي', en: 'Fabric and athletic mesh' },
      { ar: 'شامواه مع فحص مسبق', en: 'Suede with pre-check' },
    ],
    priceFrom: 25,
  },
  {
    slug: 'blankets',
    icon: 'home_blanket_big',
    image: {
      src: '/service-images/blanket-care-premium.png',
      alt: {
        ar: 'غسيل بطانيات ومفارش فاخرة مع تغليف نظيف',
        en: 'Premium blanket and bedding cleaning with clean packaging',
      },
    },
    title: { ar: 'البطانيات والمفارش', en: 'Blankets' },
    summary: {
      ar: 'غسيل عميق وتجفيف صحي للبطانيات والمفارش الكبيرة مع عناية بالحجم والرائحة.',
      en: 'Deep washing and hygienic drying for blankets and large bedding with odor care.',
    },
    care: [
      { ar: 'فرز حسب الحجم وسماكة النسيج.', en: 'Sorting by size and fabric weight.' },
      { ar: 'دورات غسيل مناسبة للأقمشة الكبيرة.', en: 'Wash cycles suited for large textiles.' },
      { ar: 'تغليف نظيف للتخزين أو الاستخدام المباشر.', en: 'Clean packing for storage or immediate use.' },
    ],
    idealFor: [
      { ar: 'البطانيات الشتوية', en: 'Winter blankets' },
      { ar: 'المفارش الكبيرة', en: 'Large bedspreads' },
      { ar: 'تجهيز غرف الضيوف', en: 'Guest-room refresh' },
    ],
    priceFrom: 30,
  },
  {
    slug: 'luxury-garments',
    icon: 'women_blouse',
    image: {
      src: '/service-images/luxury-garment-care-premium.png',
      alt: {
        ar: 'عناية بالملابس الفاخرة والبدلات مع تشطيب بالبخار',
        en: 'Luxury garment and suit care with steam finishing',
      },
    },
    title: { ar: 'الملابس الفاخرة', en: 'Luxury Garments' },
    summary: {
      ar: 'عناية مخصصة للفساتين والبدلات والقطع الحساسة مع فحص قبل وبعد.',
      en: 'Specialized care for dresses, suits, and delicate garments with before and after checks.',
    },
    care: [
      { ar: 'قراءة تعليمات العناية وتحديد الخطة.', en: 'Care-label review and care-plan selection.' },
      { ar: 'تنظيف جاف أو بخار حسب القطعة.', en: 'Dry clean or steam care depending on the item.' },
      { ar: 'تشطيب وتعليق فاخر للتسليم.', en: 'Premium finishing and hanging for delivery.' },
    ],
    idealFor: [
      { ar: 'البدلات الرسمية', en: 'Formal suits' },
      { ar: 'فساتين السهرة', en: 'Evening dresses' },
      { ar: 'الأقمشة الحساسة', en: 'Delicate fabrics' },
    ],
    priceFrom: 40,
  },
  {
    slug: 'abaya-care',
    icon: 'women_abaya',
    image: {
      src: '/service-images/abaya-care-premium.png',
      alt: {
        ar: 'عناية فاخرة بالعبايات السوداء والتطريز',
        en: 'Premium care for black abayas and embroidery',
      },
    },
    title: { ar: 'العناية بالعبايات', en: 'Abaya Care' },
    summary: {
      ar: 'تنظيف وتشطيب يحافظ على اللون، التطريز، والأقمشة السوداء الفاخرة.',
      en: 'Cleaning and finishing that protects color, embroidery, and premium black fabrics.',
    },
    care: [
      { ar: 'فصل العبايات حسب التطريز ونوع القماش.', en: 'Sorting by embroidery and fabric type.' },
      { ar: 'عناية لطيفة للون الأسود والتفاصيل.', en: 'Gentle care for black fabric and details.' },
      { ar: 'تسليم مع تعليق وتغليف أنيق.', en: 'Delivery with elegant hanging and packing.' },
    ],
    idealFor: [
      { ar: 'العبايات اليومية', en: 'Daily abayas' },
      { ar: 'عبايات المناسبات', en: 'Occasion abayas' },
      { ar: 'التطريز والخرز', en: 'Embroidery and beading' },
    ],
    priceFrom: 22,
  },
];

export const getServiceDetail = (slug: string) => serviceDetails.find((service) => service.slug === slug) || serviceDetails[0];

export const PublicServicesOverview: React.FC<PublicServicesProps> = ({ config, language, setRoute }) => {
  const reduceMotion = useReducedMotion();
  const activeServices = config.service_options.filter((service) => service.active !== false);
  const t = (ar: string, en: string) => localize(language, ar, en);

  return (
    <main className="min-h-screen bg-background pt-24 text-foreground md:pt-28">
      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1fr_.8fr] md:items-center md:py-16 lg:px-8">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Badge variant="accent" className="mb-5">{t('خدمات عامة وفاخرة', 'Everyday and premium care')}</Badge>
            <h1 className="max-w-3xl text-4xl font-black leading-tight text-primary md:text-6xl">
              {t('كل خدمة تدخل نفس نظام العناية والتتبع.', 'Every service follows the same care and tracking system.')}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
              {t(
                'من الغسيل اليومي إلى العبايات والستائر، صممنا الخدمات لتكون واضحة، قابلة للتتبع، ومناسبة لتوقعات عميل فاخر.',
                'From daily laundry to abayas and curtains, services are built to be clear, trackable, and suited to premium expectations.',
              )}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" variant="accent" onClick={() => setRoute('/book')}>
                <Truck aria-hidden="true" className="size-5" />
                {t('احجز استلام', 'Book pickup')}
              </Button>
              <Button size="lg" variant="secondary" onClick={() => setRoute('/pricing')}>
                {t('عرض الأسعار', 'View pricing')}
              </Button>
            </div>
          </motion.div>

          <div className="grid gap-3 rounded-xl border border-border bg-muted p-4">
            {activeServices.slice(0, 4).map((service) => (
              <div key={service.id} className="flex items-center justify-between gap-4 rounded-lg bg-surface p-4">
                <div>
                  <p className="font-black">{language === 'ar' ? service.name : serviceNameEn(service.name)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{language === 'ar' ? service.desc : serviceDescEn(service.desc)}</p>
                </div>
                <Badge variant="info">{formatCurrency(language, getPriceForService(config, service.priceKey))}</Badge>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-black text-foreground md:text-4xl">{t('خدمات متخصصة', 'Specialized services')}</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              {t('قالب واحد يعرض كل خدمة بمحتوى ديناميكي، حتى تبقى التجربة متسقة وسهلة الصيانة.', 'One reusable template presents each service with dynamic content for a consistent experience.')}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {serviceDetails.map((service, index) => (
            <motion.article
              key={service.slug}
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.2) }}
            >
              <Card className="h-full transition-transform duration-300 hover:-translate-y-1">
                {service.image ? (
                  <div className="aspect-[16/10] overflow-hidden rounded-t-lg border-b border-border bg-muted">
                    <img
                      src={service.image.src}
                      alt={localize(language, service.image.alt.ar, service.image.alt.en)}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : null}
                <CardHeader>
                  {!service.image ? <LaundryIcon name={service.icon} alt={localize(language, service.title.ar, service.title.en)} className="mb-5 h-20 w-20" /> : null}
                  <CardTitle>{localize(language, service.title.ar, service.title.en)}</CardTitle>
                  <CardDescription>{localize(language, service.summary.ar, service.summary.en)}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-3">
                  <Badge variant="accent">
                    {t('من', 'From')} {formatCurrency(language, service.priceFrom)}
                  </Badge>
                  <Button variant="ghost" onClick={() => setRoute(`/services/${service.slug}`)}>
                    {t('التفاصيل', 'Details')}
                    {language === 'ar' ? <ArrowLeft aria-hidden="true" className="size-4" /> : <ArrowRight aria-hidden="true" className="size-4" />}
                  </Button>
                </CardContent>
              </Card>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-xl border border-border bg-primary text-white md:grid-cols-[.8fr_1fr]">
          <div className="grid gap-3 bg-white/8 p-4 sm:grid-cols-2 md:grid-cols-1 md:p-6">
            <img
              src={PACKAGING_SYSTEM_IMAGES.folded}
              alt={localize(language, packagingAlt.ar, packagingAlt.en)}
              className="h-48 w-full rounded-lg border border-white/12 object-cover shadow-high md:h-52"
              loading="lazy"
            />
            <img
              src={PACKAGING_SYSTEM_IMAGES.glass}
              alt={localize(language, 'خزائن زجاجية لتخزين الأحذية والقبعات قرب المدخل', 'Glass cabinets for shoes and caps storage near the entrance')}
              className="h-48 w-full rounded-lg border border-white/12 object-cover shadow-high md:h-52"
              loading="lazy"
            />
          </div>
          <div className="p-6 md:p-8">
            <Badge variant="accent" className="mb-4">{t('نظام التعبئة والتخزين', 'Storage and packaging system')}</Badge>
            <h2 className="text-3xl font-black md:text-4xl">{t('تعبئة مرئية، قابلة للتتبع، وتليق بتجربة مغسلة فاخرة.', 'Visible, trackable packaging for a premium laundry experience.')}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78 md:text-base">
              {t(
                'حسب مواصفة التخزين، يتم تجهيز الملابس المطوية داخل أكياس frosted شبه شفافة مع ملصق باركود، بينما تحفظ الأحذية والقبعات في خزائن زجاجية مقفلة قرب المدخل.',
                'Per the storage specification, folded garments are prepared in frosted semi-transparent bags with barcode labels, while shoes and caps are kept in lockable glass cabinets near the entrance.',
              )}
            </p>
            <div className="mt-6 grid gap-3">
              {packagingHighlights.map((item) => (
                <div key={localize(language, item.ar, item.en)} className="flex gap-3 rounded-lg bg-white/10 p-3">
                  <PackageCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-accent" />
                  <p className="text-sm font-semibold leading-6">{localize(language, item.ar, item.en)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export const PublicServiceDetails: React.FC<PublicServiceDetailsProps> = ({ config, language, setRoute, slug }) => {
  const service = getServiceDetail(slug);
  const reduceMotion = useReducedMotion();
  const t = (ar: string, en: string) => localize(language, ar, en);

  const relatedPrices = useMemo(
    () => config.pricing.filter((item) => item.active !== false).slice(0, 4),
    [config.pricing],
  );

  return (
    <main className="min-h-screen bg-background pt-24 text-foreground md:pt-28">
      <section className="border-b border-border bg-primary text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1fr_.75fr] md:items-center md:py-16 lg:px-8">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Button variant="ghost" className="mb-5 border border-white/20 text-white hover:bg-white/10" onClick={() => setRoute('/services')}>
              {language === 'ar' ? <ArrowRight aria-hidden="true" className="size-4" /> : <ArrowLeft aria-hidden="true" className="size-4" />}
              {t('كل الخدمات', 'All services')}
            </Button>
            <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-6xl">
              {localize(language, service.title.ar, service.title.en)}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/78 md:text-lg">
              {localize(language, service.summary.ar, service.summary.en)}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" variant="accent" onClick={() => setRoute('/book')}>
                <Truck aria-hidden="true" className="size-5" />
                {t('احجز هذه الخدمة', 'Book this service')}
              </Button>
              <Button size="lg" variant="secondary" onClick={() => setRoute('/track')}>
                {t('تتبع طلب قائم', 'Track existing order')}
              </Button>
            </div>
          </motion.div>

          <div className="overflow-hidden rounded-xl border border-white/15 bg-white/10 backdrop-blur">
            {service.image ? (
              <img
                src={service.image.src}
                alt={localize(language, service.image.alt.ar, service.image.alt.en)}
                className="h-72 w-full object-cover"
              />
            ) : (
              <div className="p-8">
                <LaundryIcon name={service.icon} alt={localize(language, service.title.ar, service.title.en)} className="mx-auto h-40 w-40" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 p-5 text-center">
              <div className="rounded-lg bg-white/10 p-4">
                <p className="text-sm text-white/70">{t('سعر يبدأ من', 'Starts from')}</p>
                <p className="mt-1 text-2xl font-black text-accent">{formatCurrency(language, service.priceFrom)}</p>
              </div>
              <div className="rounded-lg bg-white/10 p-4">
                <p className="text-sm text-white/70">{t('تتبع', 'Tracking')}</p>
                <p className="mt-1 text-2xl font-black text-accent">{t('10 مراحل', '10 stages')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {service.details?.length ? (
        <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-border bg-surface p-5 md:p-6">
            <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <h2 className="text-2xl font-black">{t('تفاصيل خدمة الأحذية', 'Shoe care details')}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {t(
                    'الخدمة مصممة للأحذية التي تحتاج عناية دقيقة، وليس تنظيفًا سريعًا فقط.',
                    'This service is built for shoes that need careful treatment, not only quick cleaning.',
                  )}
                </p>
              </div>
              {service.materials?.length ? (
                <div className="flex flex-wrap gap-2">
                  {service.materials.map((material) => (
                    <Badge key={localize(language, material.ar, material.en)} variant="info">
                      {localize(language, material.ar, material.en)}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {service.details.map((item, index) => (
                <div key={localize(language, item.title.ar, item.title.en)} className="rounded-lg border border-border bg-muted p-4">
                  <div className="mb-4 grid size-10 place-items-center rounded-pill bg-accent text-white">
                    {index + 1}
                  </div>
                  <h3 className="font-black">{localize(language, item.title.ar, item.title.en)}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{localize(language, item.text.ar, item.text.en)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('كيف تتم العناية؟', 'How care works')}</CardTitle>
            <CardDescription>{t('نفس منطق التشغيل مع تفاصيل خاصة بكل خدمة.', 'The same operating logic with service-specific details.')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {service.care.map((item, index) => (
              <div key={localize(language, item.ar, item.en)} className="flex gap-4 rounded-lg border border-border bg-muted p-4">
                <div className="grid size-10 shrink-0 place-items-center rounded-pill bg-primary text-white">
                  {index + 1}
                </div>
                <p className="text-sm font-semibold leading-6">{localize(language, item.ar, item.en)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('مناسب لـ', 'Ideal for')}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {service.idealFor.map((item) => (
                <div key={localize(language, item.ar, item.en)} className="flex items-center gap-3">
                  <CheckCircle2 aria-hidden="true" className="size-5 text-success" />
                  <span className="font-semibold">{localize(language, item.ar, item.en)}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('مزايا مشتركة', 'Shared advantages')}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {[
                [ShieldCheck, t('فحص قبل وبعد', 'Before and after checks')],
                [Sparkles, t('تشطيب فاخر', 'Premium finishing')],
                [Clock3, t('تحديثات تتبع واضحة', 'Clear tracking updates')],
                [PackageCheck, t('تغليف يحمي القطعة', 'Protective packing')],
              ].map(([Icon, label]) => {
                const TileIcon = Icon as React.ElementType;
                return (
                  <div key={String(label)} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <TileIcon aria-hidden="true" className="size-5 text-primary" />
                    <span className="font-bold">{label as string}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
        <Card className="overflow-hidden">
          <div className="grid md:grid-cols-[.85fr_1fr]">
            <div className="grid gap-3 bg-muted p-4 sm:grid-cols-2 md:grid-cols-1 md:p-6">
              <img
                src={PACKAGING_SYSTEM_IMAGES.concept}
                alt={localize(language, packagingAlt.ar, packagingAlt.en)}
                className="h-44 w-full rounded-lg border border-border object-cover shadow-low md:h-48"
                loading="lazy"
              />
              <img
                src={PACKAGING_SYSTEM_IMAGES.label}
                alt={localize(language, 'قوالب ملصقات باركود لأكياس الملابس وصناديق الأحذية', 'Barcode label templates for garment bags and shoe boxes')}
                className="h-32 w-full rounded-lg border border-border object-cover shadow-low md:h-36"
                loading="lazy"
              />
            </div>
            <div className="p-5 md:p-6">
              <Badge variant="info" className="mb-4">{t('مرحلة التعبئة والتخزين', 'Packing and storage stage')}</Badge>
              <h2 className="text-2xl font-black text-primary">{t('كل طلب ينتهي بتغليف قابل للتتبع وتخزين واضح.', 'Every order ends with trackable packing and clear storage.')}</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {t(
                  'بعد انتهاء العناية، يتم تجهيز الملابس المطوية في أكياس frosted مع ملصق يقرأه فريق التشغيل بدون تحريك الطلب، وتوضع القطع الخاصة في تخزين زجاجي آمن.',
                  'After care is complete, folded items are prepared in frosted bags with a scannable label, while special items are placed in secure glass storage.',
                )}
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {packagingHighlights.map((item) => (
                  <div key={localize(language, item.ar, item.en)} className="rounded-lg border border-border bg-surface p-3">
                    <PackageCheck aria-hidden="true" className="mb-3 size-5 text-accent" />
                    <p className="text-xs font-bold leading-5">{localize(language, item.ar, item.en)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">{t('أسعار قريبة', 'Related pricing')}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t('نماذج أسعار من نظام التسعير الحالي.', 'Sample prices from the current pricing system.')}</p>
          </div>
          <Button variant="ghost" onClick={() => setRoute('/pricing')}>{t('كل الأسعار', 'All pricing')}</Button>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          {relatedPrices.map((item) => (
            <div key={item.barcode} className="rounded-lg border border-border bg-surface p-4">
              <p className="font-black">{language === 'ar' ? item.name_ar : item.name_en}</p>
              <p className="mt-2 text-sm text-muted-foreground">{formatCurrency(language, Number(item.wash_iron || item.wash_dry || item.dry || item.iron || 0))}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

const getPriceForService = (config: SiteConfig, priceKey: string) => {
  const item = config.pricing.find((entry) => entry.active !== false && Number(entry[priceKey as keyof typeof entry]) > 0);
  return Number(item?.[priceKey as keyof typeof item] || 0);
};

const serviceNameEn = (name: string) => {
  if (name.includes('جاف')) return 'Dry cleaning';
  if (name.includes('كوي') && !name.includes('غسيل')) return 'Iron only';
  if (name.includes('منزلية')) return 'Home linens';
  return 'Wash and iron';
};

const serviceDescEn = (desc: string) => {
  if (desc.includes('حساسة')) return 'For delicate garments and premium fabrics';
  if (desc.includes('كوي')) return 'Steam pressing and neat finishing';
  if (desc.includes('مفارش')) return 'For bedding, blankets, and home textiles';
  return 'Full cleaning with premium finishing';
};
