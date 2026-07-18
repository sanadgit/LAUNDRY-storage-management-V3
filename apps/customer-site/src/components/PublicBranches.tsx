import React, { useMemo } from 'react';
import { Clock3, MapPin, MessageCircle, Navigation, Phone, Store, Truck } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Branch, ServiceArea, SiteConfig } from '../types';
import { formatCurrency, localize, SiteLanguage } from '../lib/i18n';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui';

interface PublicBranchesProps {
  config: SiteConfig;
  language: SiteLanguage;
  setRoute: (route: string) => void;
}

const branchNameEn: Record<string, string> = {
  alfalah: 'Al Falah Branch',
  mussaffah: 'Mussaffah Branch',
  mbz: 'Mohammed Bin Zayed Branch',
};

const branchAreaEn: Record<string, string> = {
  alfalah: 'Al Falah, Abu Dhabi, United Arab Emirates',
  mussaffah: 'Mussaffah M-13, Abu Dhabi, United Arab Emirates',
  mbz: 'Mohammed Bin Zayed City, Abu Dhabi, United Arab Emirates',
};

const serviceAreaNameEn: Record<string, string> = {
  alfalah: 'Al Falah',
  mussaffah: 'Mussaffah',
  mbz: 'Mohammed Bin Zayed City',
  shamkha: 'Al Shamkha',
  baniyas: 'Baniyas',
  khalifa_city: 'Khalifa City',
  musaffah_industrial: 'Mussaffah Industrial',
};

export const PublicBranches: React.FC<PublicBranchesProps> = ({ config, language, setRoute }) => {
  const reduceMotion = useReducedMotion();
  const branches = config.branches.filter((branch) => branch.status !== 'closed');
  const activeAreas = config.service_areas.filter((area) => area.active !== false);
  const bounds = useMemo(() => getBounds(branches), [branches]);
  const t = (ar: string, en: string) => localize(language, ar, en);

  return (
    <main className="min-h-screen bg-background pt-24 text-foreground md:pt-28">
      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[.95fr_1.05fr] md:items-center md:py-16 lg:px-8">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Badge variant="accent" className="mb-5">{t('فروع أبوظبي', 'Abu Dhabi branches')}</Badge>
            <h1 className="max-w-3xl text-4xl font-black leading-tight text-primary md:text-6xl">
              {t('اختر أقرب نقطة دخول لطلبك.', 'Choose the nearest starting point for your order.')}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
              {t(
                'كل فرع متصل بتجربة الحجز والتتبع، حتى تبدأ رحلة الغسيل من أقرب فريق تشغيلي.',
                'Each branch connects booking and tracking so your laundry journey starts with the nearest operations team.',
              )}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" variant="accent" onClick={() => setRoute('/book')}>
                <Truck aria-hidden="true" className="size-5" />
                {t('احجز استلام', 'Book pickup')}
              </Button>
              <Button size="lg" variant="secondary" onClick={() => setRoute('/contact')}>
                <Phone aria-hidden="true" className="size-5" />
                {t('تواصل معنا', 'Contact us')}
              </Button>
            </div>
          </motion.div>

          <BranchMap branches={branches} bounds={bounds} language={language} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-black md:text-4xl">{t('بطاقات الفروع', 'Branch cards')}</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              {t('بيانات مباشرة من إعدادات الموقع، جاهزة للتوسعة عند إضافة فروع جديدة.', 'Live data from site settings, ready to scale when new branches are added.')}
            </p>
          </div>
          <Badge variant="info">{branches.length} {t('فروع نشطة', 'active branches')}</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {branches.map((branch, index) => (
            <motion.article
              key={branch.id}
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.2) }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="grid size-12 place-items-center rounded-md bg-primary text-white">
                      <Store aria-hidden="true" className="size-6" />
                    </div>
                    <Badge variant={branch.status === 'busy' ? 'warning' : 'success'}>
                      {branch.status === 'busy' ? t('مشغول', 'Busy') : t('متاح', 'Available')}
                    </Badge>
                  </div>
                  <CardTitle>{branchLabel(branch, language)}</CardTitle>
                  <CardDescription>{branchAddress(branch, language)}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <Info icon={Phone} label={t('الهاتف', 'Phone')} value={branch.phone} dir="ltr" />
                  <Info icon={Clock3} label={t('ساعات العمل', 'Hours')} value={language === 'ar' ? branch.hours : '8 AM - 10 PM'} />
                  <Info icon={MapPin} label={t('الإحداثيات', 'Coordinates')} value={`${branch.coordinates.lat.toFixed(3)}, ${branch.coordinates.lng.toFixed(3)}`} dir="ltr" />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button
                      variant="secondary"
                      onClick={() => window.open(mapUrl(branch), '_blank', 'noopener,noreferrer')}
                    >
                      <Navigation aria-hidden="true" className="size-5" />
                      {t('الخريطة', 'Map')}
                    </Button>
                    <Button
                      variant="accent"
                      onClick={() => window.open(whatsappUrl(branch, t('أريد الاستفسار عن الفرع', 'I want to ask about this branch')), '_blank', 'noopener,noreferrer')}
                    >
                      <MessageCircle aria-hidden="true" className="size-5" />
                      {t('واتساب', 'WhatsApp')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Badge variant="accent" className="mb-4">{t('مناطق الخدمة', 'Service areas')}</Badge>
            <h2 className="text-3xl font-black md:text-4xl">{t('هل نخدم منطقتك؟', 'Do we serve your area?')}</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              {t(
                'كل منطقة مرتبطة بفرع تشغيل ورسوم توصيل وحد أدنى واضح',
                'Each area is connected to an operating branch with delivery fee and minimum order clearly shown before booking.',
              )}
            </p>
          </div>
          <Badge variant="info">{activeAreas.length} {t('مناطق نشطة', 'active areas')}</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {activeAreas.map((area, index) => {
            const branch = branches.find((item) => item.id === area.branch_id) || branches[0];
            return (
              <motion.article
                key={area.id}
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.035, 0.18) }}
                className="rounded-xl border border-border bg-surface p-5 shadow-low"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-foreground">{areaLabel(area, language)}</h3>
                    <p className="mt-1 text-sm font-semibold text-muted-foreground">{branch ? branchLabel(branch, language) : config.site_name}</p>
                  </div>
                  <div className="grid size-11 place-items-center rounded-md bg-accent text-white">
                    <Truck aria-hidden="true" className="size-5" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <AreaMetric label={t('رسوم التوصيل', 'Delivery fee')} value={formatCurrency(language, area.delivery_fee ?? config.delivery_fee)} />
                  <AreaMetric label={t('الحد الأدنى', 'Minimum')} value={formatCurrency(language, area.min_order_amount ?? config.min_order_amount)} />
                </div>
                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <Button className="flex-1" onClick={() => {
                    if (typeof window !== 'undefined') window.localStorage.setItem('io_selected_pickup_area', area.id);
                    setRoute('/book');
                  }}>
                    {t('احجز هنا', 'Book here')}
                  </Button>
                  {branch ? (
                    <Button className="flex-1" variant="secondary" onClick={() => window.open(mapUrl(branch), '_blank', 'noopener,noreferrer')}>
                      <Navigation aria-hidden="true" className="size-4" />
                      {t('الخريطة', 'Map')}
                    </Button>
                  ) : null}
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>
    </main>
  );
};

const BranchMap = ({
  branches,
  bounds,
  language,
}: {
  branches: Branch[];
  bounds: ReturnType<typeof getBounds>;
  language: SiteLanguage;
}) => (
  <Card className="overflow-hidden">
    <CardHeader className="border-b border-border">
      <CardTitle>{localize(language, 'الخريطة', 'Map')}</CardTitle>
      <CardDescription>{localize(language, 'تمثيل بصري لمواقع الفروع الحالية.', 'A visual map of the current branch locations.')}</CardDescription>
    </CardHeader>
    <CardContent className="p-0">
      <div className="relative h-[360px] overflow-hidden bg-muted">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(19,119,174,.11)_50%,transparent_51%),linear-gradient(0deg,transparent_49%,rgba(206,21,103,.10)_50%,transparent_51%)] bg-[size:58px_58px]" />
        <div className="absolute inset-6 rounded-xl border border-border bg-surface/60" />
        <div className="absolute left-[12%] top-[22%] h-24 w-48 rounded-full border border-primary/20" />
        <div className="absolute bottom-[16%] right-[10%] h-28 w-56 rounded-full border border-accent/20" />
        {branches.map((branch, index) => {
          const position = getPosition(branch, bounds);
          return (
            <div
              key={branch.id}
              className="absolute"
              style={{ left: `${position.x}%`, top: `${position.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className="group relative">
                <div className="grid size-12 place-items-center rounded-pill bg-accent text-white shadow-high">
                  <MapPin aria-hidden="true" className="size-6" />
                </div>
                <div className="absolute bottom-14 start-1/2 min-w-44 -translate-x-1/2 rounded-lg border border-border bg-surface p-3 text-center text-sm opacity-0 shadow-medium transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                  <p className="font-black">{branchLabel(branch, language)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{index + 1}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </CardContent>
  </Card>
);

const Info = ({
  icon: Icon,
  label,
  value,
  dir,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  dir?: 'rtl' | 'ltr';
}) => (
  <div className="flex items-start gap-3 rounded-lg border border-border bg-muted p-3">
    <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
    <div className="min-w-0">
      <p className="text-xs font-bold text-muted-foreground">{label}</p>
      <p className="mt-1 break-words font-bold" dir={dir}>{value}</p>
    </div>
  </div>
);

const branchLabel = (branch: Branch, language: SiteLanguage) => language === 'ar' ? branch.name : branchNameEn[branch.id] || branch.name;
const branchAddress = (branch: Branch, language: SiteLanguage) => language === 'ar' ? branch.address : branchAreaEn[branch.id] || branch.address;
const areaLabel = (area: ServiceArea, language: SiteLanguage) => language === 'ar' ? area.name : serviceAreaNameEn[area.id] || area.name;
const mapUrl = (branch: Branch) => `https://www.google.com/maps/search/?api=1&query=${branch.coordinates.lat},${branch.coordinates.lng}`;
const whatsappUrl = (branch: Branch, message: string) => {
  const rawNumber = String(branch.whatsapp || branch.phone || '').replace(/[^\d]/g, '');
  const normalized = rawNumber.startsWith('971') ? rawNumber : `971${rawNumber.replace(/^0+/, '')}`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(`${message}: ${branch.name}`)}`;
};

const AreaMetric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-border bg-muted p-3">
    <p className="text-xs font-bold text-muted-foreground">{label}</p>
    <p className="mt-1 font-black text-primary">{value}</p>
  </div>
);

const getBounds = (branches: Branch[]) => {
  const lat = branches.map((branch) => branch.coordinates.lat);
  const lng = branches.map((branch) => branch.coordinates.lng);
  return {
    minLat: Math.min(...lat),
    maxLat: Math.max(...lat),
    minLng: Math.min(...lng),
    maxLng: Math.max(...lng),
  };
};

const getPosition = (branch: Branch, bounds: ReturnType<typeof getBounds>) => {
  const latRange = Math.max(bounds.maxLat - bounds.minLat, 0.001);
  const lngRange = Math.max(bounds.maxLng - bounds.minLng, 0.001);
  const x = 18 + ((branch.coordinates.lng - bounds.minLng) / lngRange) * 64;
  const y = 82 - ((branch.coordinates.lat - bounds.minLat) / latRange) * 64;
  return { x, y };
};
