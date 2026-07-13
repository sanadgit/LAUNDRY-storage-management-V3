import React, { useMemo } from 'react';
import { ArrowLeft, ArrowRight, Building2, Clock3, MapPin, Navigation, ShieldCheck, Truck } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { ServiceArea, SiteConfig } from '../types';
import { formatCurrency, localize, SiteLanguage } from '../lib/i18n';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui';

interface AreaPageProps {
  config: SiteConfig;
  language: SiteLanguage;
  setRoute: (route: string) => void;
  areaId?: string;
}

const areaNameEn: Record<string, string> = {
  alfalah: 'Al Falah',
  mussaffah: 'Mussaffah',
  mbz: 'Mohammed Bin Zayed City',
  shamkha: 'Al Shamkha',
  baniyas: 'Baniyas',
  khalifa_city: 'Khalifa City',
  musaffah_industrial: 'Mussaffah Industrial',
};

export const PublicAreasOverview: React.FC<AreaPageProps> = ({ config, language, setRoute }) => {
  const areas = useMemo(() => config.service_areas.filter((area) => area.active !== false), [config.service_areas]);
  const reduceMotion = useReducedMotion();
  const t = (ar: string, en: string) => localize(language, ar, en);

  return (
    <main className="min-h-screen bg-background pt-24 text-foreground md:pt-28">
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="max-w-3xl"
          >
            <Badge variant="accent" className="mb-5">{t('مناطق الخدمة', 'Service areas')}</Badge>
            <h1 className="text-4xl font-black leading-tight text-primary md:text-6xl">
              {t('استلام وتوصيل مغسلة In & Out في أبوظبي.', 'In & Out Laundry pickup and delivery in Abu Dhabi.')}
            </h1>
            <p className="mt-5 text-base leading-8 text-muted-foreground md:text-lg">
              {t(
                'اختر منطقتك لمعرفة الفرع الأقرب، رسوم التوصيل، الحد الأدنى، وطريقة الحجز.',
                'Choose your area to see the nearest branch, delivery fee, minimum order, and booking path.',
              )}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-8">
        {areas.map((area) => (
          <AreaCard key={area.id} area={area} config={config} language={language} setRoute={setRoute} />
        ))}
      </section>
    </main>
  );
};

export const PublicAreaDetails: React.FC<AreaPageProps> = ({ config, language, setRoute, areaId = '' }) => {
  const areas = useMemo(() => config.service_areas.filter((area) => area.active !== false), [config.service_areas]);
  const area = areas.find((item) => item.id === areaId) || areas[0];
  const branch = config.branches.find((item) => item.id === area?.branch_id) || config.branches[0];
  const relatedAreas = areas.filter((item) => item.branch_id === area?.branch_id && item.id !== area?.id).slice(0, 3);
  const reduceMotion = useReducedMotion();
  const t = (ar: string, en: string) => localize(language, ar, en);

  if (!area) {
    return <PublicAreasOverview config={config} language={language} setRoute={setRoute} />;
  }

  const name = areaLabel(area, language);
  const chooseArea = () => {
    if (typeof window !== 'undefined') window.localStorage.setItem('io_selected_pickup_area', area.id);
    setRoute('/book');
  };

  return (
    <main className="min-h-screen bg-background pt-24 text-foreground md:pt-28">
      <section className="border-b border-border bg-primary text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1fr_.75fr] md:items-center md:py-16 lg:px-8">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Badge variant="accent" className="mb-5 border-white/20 bg-white/10 text-white">{t('صفحة منطقة', 'Local area page')}</Badge>
            <h1 className="text-4xl font-black leading-tight md:text-6xl">
              {t(`مغسلة وتوصيل في ${name}`, `Laundry pickup and delivery in ${name}`)}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/78 md:text-lg">
              {t(
                `خدمة استلام وتنظيف وتوصيل واضحة لسكان ${name} مع تتبع للطلب وفرع مرتبط قريب.`,
                `Clear pickup, garment care, and delivery for ${name} with order tracking and a linked nearby branch.`,
              )}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button variant="accent" size="lg" onClick={chooseArea}>
                <Truck aria-hidden="true" className="size-5" />
                {t('احجز من هذه المنطقة', 'Book from this area')}
              </Button>
              <Button variant="secondary" size="lg" onClick={() => setRoute('/areas')}>
                {language === 'ar' ? <ArrowRight aria-hidden="true" className="size-5" /> : <ArrowLeft aria-hidden="true" className="size-5" />}
                {t('كل المناطق', 'All areas')}
              </Button>
            </div>
          </motion.div>

          <Card className="bg-white text-foreground">
            <CardHeader>
              <CardTitle>{t('معلومات الخدمة', 'Service details')}</CardTitle>
              <CardDescription>{t('بيانات مباشرة من إعدادات الموقع.', 'Live values from site configuration.')}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <InfoRow icon={Building2} label={t('الفرع الأقرب', 'Nearest branch')} value={branch?.name || config.site_name} />
              <InfoRow icon={Truck} label={t('رسوم التوصيل', 'Delivery fee')} value={formatCurrency(language, area.delivery_fee ?? config.delivery_fee)} />
              <InfoRow icon={ShieldCheck} label={t('الحد الأدنى', 'Minimum order')} value={formatCurrency(language, area.min_order_amount ?? config.min_order_amount)} />
              <InfoRow icon={Clock3} label={t('ساعات العمل', 'Hours')} value={branch?.hours || t('حسب توفر المواعيد', 'Based on slot availability')} />
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_.9fr] lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('كيف تعمل الخدمة؟', 'How it works')}</CardTitle>
            <CardDescription>{t('رحلة بسيطة من الحجز إلى التسليم.', 'A simple journey from booking to delivery.')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {[
              [t('اختر المنطقة والموعد', 'Choose area and slot'), t('يتم حفظ منطقتك تلقائيًا عند بدء الحجز.', 'Your area is saved automatically when starting booking.')],
              [t('نستلم القطع من العنوان', 'We collect from your address'), t('السائق يحصل على تفاصيل المهمة داخل لوحة السائق.', 'The driver receives mission details in the driver panel.')],
              [t('تتبع وتنبيه واضح', 'Clear tracking and updates'), t('يمكنك متابعة رقم الطلب من صفحة التتبع.', 'You can follow the order ID from tracking.')],
            ].map(([title, text], index) => (
              <div key={title} className="flex gap-4 rounded-lg border border-border bg-muted p-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-pill bg-primary text-sm font-black text-white">{index + 1}</span>
                <div>
                  <p className="font-black">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('مناطق قريبة', 'Nearby areas')}</CardTitle>
            <CardDescription>{t('مناطق مرتبطة بنفس الفرع أو قريبة منه.', 'Areas served by the same or nearby branch.')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {(relatedAreas.length ? relatedAreas : areas.filter((item) => item.id !== area.id).slice(0, 3)).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setRoute(`/areas/${item.id}`)}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4 text-start transition hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span>
                  <span className="block font-black">{areaLabel(item, language)}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{formatCurrency(language, item.delivery_fee ?? config.delivery_fee)}</span>
                </span>
                {language === 'ar' ? <ArrowLeft aria-hidden="true" className="size-4 text-primary" /> : <ArrowRight aria-hidden="true" className="size-4 text-primary" />}
              </button>
            ))}
            <Button variant="secondary" onClick={() => branch && window.open(mapUrl(branch.coordinates.lat, branch.coordinates.lng), '_blank', 'noopener,noreferrer')}>
              <Navigation aria-hidden="true" className="size-5" />
              {t('فتح خريطة الفرع', 'Open branch map')}
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

const AreaCard = ({ area, config, language, setRoute }: { area: ServiceArea; config: SiteConfig; language: SiteLanguage; setRoute: (route: string) => void }) => {
  const branch = config.branches.find((item) => item.id === area.branch_id);
  const t = (ar: string, en: string) => localize(language, ar, en);
  return (
    <Card>
      <CardHeader>
        <div className="mb-4 grid size-12 place-items-center rounded-md bg-primary text-white">
          <MapPin aria-hidden="true" className="size-6" />
        </div>
        <CardTitle>{areaLabel(area, language)}</CardTitle>
        <CardDescription>{branch?.name || t('فرع قريب', 'Nearby branch')}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        <InfoRow icon={Truck} label={t('رسوم التوصيل', 'Delivery fee')} value={formatCurrency(language, area.delivery_fee ?? config.delivery_fee)} />
        <InfoRow icon={ShieldCheck} label={t('الحد الأدنى', 'Minimum order')} value={formatCurrency(language, area.min_order_amount ?? config.min_order_amount)} />
        <Button variant="accent" onClick={() => setRoute(`/areas/${area.id}`)}>{t('فتح صفحة المنطقة', 'Open area page')}</Button>
      </CardContent>
    </Card>
  );
};

const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="flex items-start gap-3 rounded-lg border border-border bg-muted p-4">
    <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
    <div>
      <p className="text-xs font-bold text-muted-foreground">{label}</p>
      <p className="mt-1 font-black">{value}</p>
    </div>
  </div>
);

const areaLabel = (area: ServiceArea, language: SiteLanguage) => language === 'ar' ? area.name : areaNameEn[area.id] || area.name;
const mapUrl = (lat: number, lng: number) => `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
