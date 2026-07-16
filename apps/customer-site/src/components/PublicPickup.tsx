import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  CalendarDays,
  Camera,
  CheckCircle2,
  CreditCard,
  FileText,
  Home,
  MapPin,
  Mic,
  Navigation,
  Phone,
  ShieldCheck,
  Sparkles,
  Truck,
  User,
  WashingMachine,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Order, SiteConfig } from '../types';
import { localize, SiteLanguage } from '../lib/i18n';
import { cn } from '../lib/utils';

interface PublicPickupProps {
  config: SiteConfig;
  language: SiteLanguage;
  onOrderSuccess: (order: Order) => Promise<Order>;
  setRoute: (route: string) => void;
}

const buildOrderId = () => `INO-${Math.floor(1000 + Math.random() * 9000)}`;

interface ReorderTemplate {
  sourceOrderId?: string;
  serviceType?: string;
  branch?: string;
  deliveryAddress?: string;
}

const readReorderTemplate = (): ReorderTemplate | null => {
  if (typeof window === 'undefined') return null;
  try {
    const saved = window.localStorage.getItem('io_reorder_template');
    return saved ? JSON.parse(saved) as ReorderTemplate : null;
  } catch {
    return null;
  }
};

const buildPickupDates = (language: SiteLanguage) => {
  const locale = language === 'ar' ? 'ar-AE' : 'en-AE';
  return Array.from({ length: 6 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return {
      id: `date-${index}`,
      label: index === 0 ? localize(language, 'اليوم', 'TODAY') : date.toLocaleDateString(locale, { weekday: 'short' }),
      day: date.toLocaleDateString(locale, { day: '2-digit' }),
      month: date.toLocaleDateString(locale, { month: 'short' }),
    };
  });
};

function ScheduleIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid size-5 place-items-center text-primary" aria-hidden="true">
      {children}
    </span>
  );
}

function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-[32px] border border-white/40 bg-white/60 p-8 shadow-sm backdrop-blur-[20px]', className)}>
      {children}
    </section>
  );
}

const getServiceBasePrice = (config: SiteConfig, priceKey: 'wash_dry' | 'wash_iron' | 'iron' | 'dry') => {
  const item = config.pricing.find((entry) => entry.active !== false && Number(entry[priceKey]) > 0);
  return Number(item?.[priceKey] || 25);
};

export const PublicPickup: React.FC<PublicPickupProps> = ({ config, language, onOrderSuccess, setRoute }) => {
  const activeAreas = config.service_areas.filter((area) => area.active !== false);
  const defaultArea = activeAreas[0]?.id || '';
  const activeServiceOptions = config.service_options.filter((service) => service.active !== false);
  const [reorderTemplate, setReorderTemplate] = useState<ReorderTemplate | null>(() => readReorderTemplate());
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedArea, setSelectedArea] = useState(() => {
    if (typeof window === 'undefined') return defaultArea;
    const saved = window.localStorage.getItem('io_selected_pickup_area');
    return activeAreas.some((area) => area.id === saved) ? String(saved) : defaultArea;
  });
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>(() => {
    const first = activeServiceOptions[0]?.id;
    return first ? [first] : [];
  });
  const [selectedDate, setSelectedDate] = useState('date-0');
  const [selectedTime, setSelectedTime] = useState(() => config.time_slots.find((slot) => slot.active !== false && !slot.busy)?.id || config.time_slots[0]?.id || '');
  const [delivery, setDelivery] = useState<'standard' | 'express'>('standard');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [addressDetails, setAddressDetails] = useState(() => reorderTemplate?.deliveryAddress || '');
  const [validationError, setValidationError] = useState('');
  const [notes, setNotes] = useState(() => reorderTemplate?.sourceOrderId ? localize(language, `إعادة طلب من ${reorderTemplate.sourceOrderId}`, `Reorder from ${reorderTemplate.sourceOrderId}`) : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = (ar: string, en: string) => localize(language, ar, en);

  const dates = useMemo(() => buildPickupDates(language), [language]);
  const timeSlots = useMemo(
    () => config.time_slots.filter((slot) => slot.active !== false).map((slot, index) => ({
      id: slot.id,
      label: index === 0 ? t('الأقرب', 'EARLIEST') : t('متاح', 'AVAILABLE'),
      time: slot.time,
      busy: slot.busy,
    })),
    [config.time_slots, language],
  );
  const selectedDateLabel = dates.find((date) => date.id === selectedDate);
  const selectedTimeLabel = timeSlots.find((slot) => slot.id === selectedTime);
  const selectedAreaData = activeAreas.find((area) => area.id === selectedArea) || activeAreas[0];
  const selectedBranch = config.branches.find((branch) => branch.id === selectedAreaData?.branch_id) || config.branches[0];
  const selectedServices = activeServiceOptions.filter((service) => selectedServiceIds.includes(service.id));
  const deliveryFee = selectedAreaData?.delivery_fee ?? config.delivery_fee;
  const minimumOrder = selectedAreaData?.min_order_amount ?? config.min_order_amount;
  const rawServiceEstimate = selectedServices.reduce((sum, service) => sum + getServiceBasePrice(config, service.priceKey), 0);
  const baseServiceEstimate = Math.max(rawServiceEstimate || minimumOrder, minimumOrder);
  const bookingSteps = [
    t('منطقة الاستلام', 'Pickup area'),
    t('اختيار الخدمات', 'Services'),
    t('الموعد', 'Schedule'),
    t('بيانات العميل', 'Customer'),
    t('المراجعة', 'Review'),
  ];

  const total = useMemo(() => {
    const expressFee = delivery === 'express' ? 50 : 0;
    return baseServiceEstimate + deliveryFee + expressFee;
  }, [baseServiceEstimate, delivery, deliveryFee]);

  useEffect(() => {
    if (!selectedArea && defaultArea) setSelectedArea(defaultArea);
    if (selectedArea && !activeAreas.some((area) => area.id === selectedArea)) setSelectedArea(defaultArea);
  }, [activeAreas, defaultArea, selectedArea]);

  useEffect(() => {
    if (typeof window === 'undefined' || !selectedArea) return;
    window.localStorage.setItem('io_selected_pickup_area', selectedArea);
  }, [selectedArea]);

  useEffect(() => {
    const firstAvailable = timeSlots.find((slot) => !slot.busy)?.id || timeSlots[0]?.id || '';
    if (!selectedTime || timeSlots.every((slot) => slot.id !== selectedTime)) {
      setSelectedTime(firstAvailable);
    }
  }, [selectedTime, timeSlots]);

  const areaAddress = [selectedAreaData?.name, addressDetails.trim()].filter(Boolean).join('، ');
  const canConfirm = Boolean(selectedAreaData && selectedServices.length && selectedTimeLabel && customerName.trim() && customerPhone.trim() && addressDetails.trim());

  const toggleService = (serviceId: number) => {
    setSelectedServiceIds((prev) => {
      if (prev.includes(serviceId)) {
        return prev.length > 1 ? prev.filter((id) => id !== serviceId) : prev;
      }
      return [...prev, serviceId];
    });
  };

  const validateStep = (step: number) => {
    if (step === 0 && !selectedAreaData) return t('اختر منطقة الاستلام أولًا.', 'Choose a pickup area first.');
    if (step === 1 && selectedServices.length === 0) return t('اختر خدمة واحدة على الأقل.', 'Choose at least one service.');
    if (step === 2 && !selectedTimeLabel) return t('اختر موعد الاستلام.', 'Choose a pickup window.');
    if (step === 3 && (!customerName.trim() || !customerPhone.trim() || !addressDetails.trim())) {
      return t('أكمل الاسم ورقم الهاتف والعنوان.', 'Complete name, phone, and address.');
    }
    return '';
  };

  const goNext = () => {
    const message = validateStep(currentStep);
    if (message) {
      setValidationError(message);
      return;
    }
    setValidationError('');
    setCurrentStep((step) => Math.min(step + 1, bookingSteps.length - 1));
  };

  const saveDraft = () => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('io_pickup_draft', JSON.stringify({
      selectedArea,
      selectedDate,
      selectedTime,
      delivery,
      selectedServiceIds,
      customerName,
      customerPhone,
      addressDetails,
      notes,
      savedAt: new Date().toISOString(),
    }));
    setValidationError(t('تم حفظ المسودة على هذا الجهاز.', 'Draft saved on this device.'));
  };

  const confirmPickup = async () => {
    if (isSubmitting) return;
    setValidationError('');
    if (!activeAreas.length) {
      setValidationError(t('لا توجد مناطق استلام فعالة حاليًا.', 'No active pickup areas are currently available.'));
      return;
    }
    if (!canConfirm) {
      setValidationError(t('أكمل خطوات الحجز: المنطقة، الخدمات، الموعد، وبيانات العميل.', 'Complete booking steps: area, services, schedule, and customer details.'));
      return;
    }
    setIsSubmitting(true);
    const order: Order = {
      id: buildOrderId(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerNotes: notes,
      dateReceived: new Date().toISOString(),
      itemCount: Math.max(1, selectedServices.length),
      serviceType: reorderTemplate?.serviceType || selectedServices.map((service) => service.name).join(' + '),
      branch: selectedBranch?.name || reorderTemplate?.branch || 'In & Out Laundry',
      assignedDriverId: config.drivers.find((driver) => driver.branch_id === selectedBranch?.id || driver.service_areas?.includes(selectedAreaData?.name || ''))?.id,
      status: 'new',
      amount: total,
      totalPrice: total,
      priority: delivery === 'express' ? 'urgent' : 'normal',
      paymentStatus: 'pending',
      deliveryAddress: areaAddress || selectedAreaData?.name || config.business_address,
      distanceKm: deliveryFee > 0 ? Math.max(1, deliveryFee / 5) : undefined,
      paymentMethod: 'card',
      pickupSlot: `${selectedDateLabel?.label || t('اليوم', 'TODAY')} ${selectedDateLabel?.day || ''} ${selectedDateLabel?.month || ''} / ${selectedTimeLabel?.time || config.time_slots[0]?.time || ''}`,
      progressPercentage: 8,
      steps: [
        { key: 'scheduled', label: 'Pickup scheduled', status: 'active' },
        { key: 'services', label: selectedServices.map((service) => service.name).join(', '), status: 'pending' },
        { key: 'collection', label: 'Driver collection', status: 'pending' },
        { key: 'care', label: 'Premium care', status: 'pending' },
      ],
    };

    try {
      const created = await onOrderSuccess(order);
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', `/track?id=${encodeURIComponent(created.id)}`);
      }
      setRoute('/track');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[max(884px,100dvh)] overflow-x-hidden bg-[#F2F2F2] font-sans text-[#0D0D0D]"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <header className="fixed left-0 top-0 z-50 flex w-full items-center justify-between border-b border-white/40 bg-white/40 px-6 py-4 shadow-sm backdrop-blur-xl">
        <div className="flex min-w-0 items-center gap-4">
          <button
            type="button"
            onClick={() => setRoute('/')}
            className="grid size-9 place-items-center rounded-full text-primary transition hover:bg-white/40 active:scale-95"
            aria-label="Back"
          >
            {language === 'ar' ? <ArrowRight className="size-5" /> : <ArrowLeft className="size-5" />}
          </button>
          <h1 className="truncate font-display text-2xl font-extrabold text-primary md:text-[24px] md:leading-8">In & Out Laundry</h1>
        </div>
        <div className="flex items-center gap-3">
          <Bell className="size-5 text-primary" aria-hidden="true" />
          <div className="grid size-8 place-items-center rounded-full border border-primary/20 bg-[#F2F2F2] text-xs font-bold text-primary">AS</div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 pb-36 pt-24 md:px-16">
        <div className="mb-12 text-center md:text-start">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#F2F2F2] px-3 py-1 font-mono text-[12px] font-semibold uppercase leading-4 tracking-[0.1em] text-[#0D0D0D]">
            <CalendarDays className="size-3.5" aria-hidden="true" />
            {t('خطوة الحجز: الموعد والاستلام', 'BOOKING STEP: PICKUP SCHEDULE')}
          </div>
          <h2 className="font-display text-[32px] font-bold leading-[40px] text-[#0D0D0D] md:text-[48px] md:leading-[56px] md:tracking-[-0.02em]">
            {t('متى نمر عليك؟', 'When shall we visit?')}
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-[18px] font-normal leading-[28px] text-[#464350] md:mx-0">
            {t('ابدأ بالمنطقة، اختر الخدمات، ثم حدّد الموعد وأكمل بيانات الاستلام.', 'Start with area, choose services, then schedule pickup and complete customer details.')}
          </p>
        </div>

        <div className="mb-8 grid gap-2 rounded-[28px] border border-white/50 bg-white/60 p-3 shadow-sm backdrop-blur md:grid-cols-5">
          {bookingSteps.map((step, index) => {
            const done = index < currentStep;
            const active = index === currentStep;
            return (
              <button
                key={step}
                type="button"
                onClick={() => setCurrentStep(index)}
                className={cn(
                  'flex min-h-12 items-center gap-3 rounded-2xl px-3 text-start transition',
                  active && 'bg-primary text-white shadow-sm',
                  done && !active && 'bg-primary/10 text-primary',
                  !done && !active && 'text-[#464350] hover:bg-white/70',
                )}
              >
                <span className={cn('grid size-7 shrink-0 place-items-center rounded-full text-xs font-black', active ? 'bg-white text-primary' : done ? 'bg-primary text-white' : 'bg-[#F2F2F2] text-[#464350]')}>
                  {done ? <CheckCircle2 className="size-4" aria-hidden="true" /> : index + 1}
                </span>
                <span className="min-w-0 truncate text-sm font-black">{step}</span>
              </button>
            );
          })}
        </div>

        {reorderTemplate?.sourceOrderId ? (
          <div className="mb-8 rounded-[24px] border border-primary/20 bg-primary/5 p-5 text-start">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-black text-primary">{t('إعادة طلب محفوظة', 'Saved reorder')}</p>
                <p className="mt-1 text-sm leading-6 text-[#464350]">
                  {t(`سيتم استخدام بيانات الطلب ${reorderTemplate.sourceOrderId} كنقطة بداية للحجز.`, `Order ${reorderTemplate.sourceOrderId} details will be used as a starting point.`)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  window.localStorage.removeItem('io_reorder_template');
                  setReorderTemplate(null);
                  setNotes('');
                }}
                className="min-h-10 rounded-full border border-primary/20 px-4 text-xs font-black text-primary transition hover:bg-primary hover:text-white"
              >
                {t('إلغاء القالب', 'Clear template')}
              </button>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-8">
            {currentStep === 0 ? <GlassCard>
              <div className="mb-6 flex items-center justify-between gap-4">
                <h3 className="flex items-center gap-2 font-display text-[24px] font-semibold leading-8">
                  <ScheduleIcon><MapPin className="size-5" /></ScheduleIcon>
                  {t('منطقة الاستلام', 'Pickup Area')}
                </h3>
                <span className="font-mono text-[12px] font-semibold uppercase leading-4 tracking-[0.1em] text-[#464350]">
                  {selectedBranch?.name || 'In & Out Laundry'}
                </span>
              </div>
              {!activeAreas.length ? (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 text-sm font-bold text-primary">
                  {t('لا توجد مناطق استلام فعالة حاليًا. يمكن تفعيل المناطق من لوحة الإدارة.', 'No active pickup areas are currently available. Areas can be enabled from admin.')}
                </div>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2">
                {activeAreas.map((area) => {
                  const active = selectedArea === area.id;
                  const branch = config.branches.find((item) => item.id === area.branch_id) || config.branches[0];
                  return (
                    <button
                      key={area.id}
                      type="button"
                      onClick={() => setSelectedArea(area.id)}
                      className={cn(
                        'flex min-h-20 items-center justify-between rounded-2xl border bg-white px-5 py-4 text-start transition duration-300 hover:border-primary',
                        active ? 'border-primary bg-[#F2F2F2]/30 ring-1 ring-primary' : 'border-[#B7A7F2]',
                      )}
                    >
                      <span>
                        <span className="block text-base font-bold text-[#0D0D0D]">{area.name}</span>
                        <span className="mt-1 block text-xs font-semibold text-[#464350]">
                          AED {area.delivery_fee ?? config.delivery_fee} {t('توصيل', 'delivery')} · {t('حد أدنى', 'min')} AED {area.min_order_amount ?? config.min_order_amount}
                        </span>
                        <span className="mt-1 block text-xs font-semibold text-primary">{branch?.name || config.site_name}</span>
                      </span>
                      <CheckCircle2 className={cn('size-5 text-primary transition-opacity', active ? 'opacity-100' : 'opacity-0')} />
                    </button>
                  );
                })}
              </div>
            </GlassCard> : null}

            {currentStep === 1 ? <GlassCard>
              <div className="mb-6 flex items-center justify-between gap-4">
                <h3 className="flex items-center gap-2 font-display text-[24px] font-semibold leading-8">
                  <ScheduleIcon><WashingMachine className="size-5" /></ScheduleIcon>
                  {t('اختيار الخدمات', 'Choose Services')}
                </h3>
                <span className="font-mono text-[12px] font-semibold uppercase leading-4 tracking-[0.1em] text-[#464350]">
                  {t('يمكن اختيار أكثر من خدمة', 'Multiple services allowed')}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {activeServiceOptions.map((service) => {
                  const active = selectedServiceIds.includes(service.id);
                  const price = getServiceBasePrice(config, service.priceKey);
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => toggleService(service.id)}
                      className={cn(
                        'flex min-h-28 items-start justify-between gap-4 rounded-2xl border bg-white px-5 py-4 text-start transition duration-300 hover:border-primary',
                        active ? 'border-primary bg-[#F2F2F2]/30 ring-1 ring-primary' : 'border-[#B7A7F2]',
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block text-base font-bold text-[#0D0D0D]">{service.name}</span>
                        <span className="mt-1 block text-sm leading-6 text-[#464350]">{service.desc}</span>
                        <span className="mt-2 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
                          {t('يبدأ من', 'From')} AED {price.toFixed(2)}
                        </span>
                      </span>
                      <CheckCircle2 className={cn('mt-1 size-5 shrink-0 text-primary transition-opacity', active ? 'opacity-100' : 'opacity-0')} />
                    </button>
                  );
                })}
              </div>
              <div className="mt-5 rounded-2xl border border-primary/10 bg-primary/5 p-4 text-sm leading-6 text-[#464350]">
                {t('الأسعار هنا تقديرية. سيتم فرز القطع وعدّها في الفرع ثم تحديث الفاتورة النهائية في النظام.', 'Prices are estimates. Items will be counted at the branch and the final invoice will be updated in the system.')}
              </div>
            </GlassCard> : null}

            {currentStep === 3 ? <GlassCard>
              <div className="mb-6 flex items-center justify-between gap-4">
                <h3 className="flex items-center gap-2 font-display text-[24px] font-semibold leading-8">
                  <ScheduleIcon><User className="size-5" /></ScheduleIcon>
                  {t('بيانات الاستلام', 'Pickup Details')}
                </h3>
                <span className="font-mono text-[12px] font-semibold uppercase leading-4 tracking-[0.1em] text-[#464350]">
                  {t('مطلوبة للتتبع', 'Required for tracking')}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.08em] text-[#464350]">
                    <User className="size-4 text-primary" aria-hidden="true" />
                    {t('اسم العميل', 'Customer name')}
                  </span>
                  <input
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    className="min-h-12 rounded-2xl border border-[#B7A7F2] bg-white px-4 text-[#0D0D0D] outline-none transition placeholder:text-[#6d667d] focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder={t('مثال: محمد الكعبي', 'Example: Mohammed Al Kaabi')}
                    autoComplete="name"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.08em] text-[#464350]">
                    <Phone className="size-4 text-primary" aria-hidden="true" />
                    {t('رقم الهاتف', 'Phone number')}
                  </span>
                  <input
                    value={customerPhone}
                    onChange={(event) => setCustomerPhone(event.target.value)}
                    className="min-h-12 rounded-2xl border border-[#B7A7F2] bg-white px-4 text-[#0D0D0D] outline-none transition placeholder:text-[#6d667d] focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="0568720885"
                    autoComplete="tel"
                    inputMode="tel"
                    dir="ltr"
                  />
                </label>
              </div>

              <label className="mt-5 grid gap-2">
                <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.08em] text-[#464350]">
                  <Home className="size-4 text-primary" aria-hidden="true" />
                  {t('العنوان التفصيلي', 'Detailed address')}
                </span>
                <textarea
                  value={addressDetails}
                  onChange={(event) => setAddressDetails(event.target.value)}
                  className="min-h-24 resize-none rounded-2xl border border-[#B7A7F2] bg-white px-4 py-3 text-[#0D0D0D] outline-none transition placeholder:text-[#6d667d] focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder={t('اسم الشارع، رقم الفيلا أو البناية، أقرب علامة...', 'Street, villa/building number, nearest landmark...')}
                  rows={3}
                />
              </label>

              <div className="mt-5 grid gap-3 rounded-2xl border border-primary/10 bg-primary/5 p-4 text-sm md:grid-cols-3">
                <InfoMini label={t('المنطقة', 'Area')} value={selectedAreaData?.name || '-'} />
                <InfoMini label={t('الفرع', 'Branch')} value={selectedBranch?.name || config.site_name} />
                <InfoMini label={t('الحد الأدنى', 'Minimum')} value={`AED ${minimumOrder}`} />
              </div>
            </GlassCard> : null}

            {currentStep === 2 ? <GlassCard>
              <div className="mb-6 flex items-center justify-between gap-4">
                <h3 className="flex items-center gap-2 font-display text-[24px] font-semibold leading-8">
                  <ScheduleIcon><CalendarDays className="size-5" /></ScheduleIcon>
                  {t('تاريخ الاستلام', 'Pickup Date')}
                </h3>
                <span className="font-mono text-[12px] font-semibold uppercase leading-4 tracking-[0.1em] text-[#464350]">{t('توقيت الإمارات', 'UAE TIME (GMT+4)')}</span>
              </div>
              <div className="hide-scrollbar flex snap-x gap-4 overflow-x-auto pb-2">
                {dates.map((date) => {
                  const active = selectedDate === date.id;
                  return (
                    <button
                      key={date.id}
                      type="button"
                      onClick={() => setSelectedDate(date.id)}
                      className={cn(
                        'flex h-32 w-24 flex-shrink-0 snap-center flex-col items-center justify-center rounded-2xl border bg-white transition duration-300 hover:border-primary',
                        active ? 'border-primary ring-2 ring-primary/20' : 'border-[#B7A7F2]',
                      )}
                    >
                      <span className={cn('mb-2 font-mono text-[12px] font-semibold uppercase leading-4 tracking-[0.1em]', active ? 'text-primary' : 'text-[#464350]')}>
                        {date.label}
                      </span>
                      <span className="text-2xl font-bold text-[#0D0D0D]">{date.day}</span>
                      <span className="text-xs font-medium text-[#464350]">{date.month}</span>
                    </button>
                  );
                })}
              </div>
            </GlassCard> : null}

            {currentStep === 2 ? <GlassCard>
              <h3 className="mb-6 flex items-center gap-2 font-display text-[24px] font-semibold leading-8">
                <ScheduleIcon><CalendarDays className="size-5" /></ScheduleIcon>
                {t('وقت الاستلام', 'Pickup Window')}
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {timeSlots.map((slot) => {
                  const active = selectedTime === slot.id;
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={slot.busy}
                      onClick={() => setSelectedTime(slot.id)}
                      className={cn(
                        'group flex items-center justify-between rounded-2xl border bg-white px-6 py-5 text-start transition duration-300 hover:border-primary disabled:cursor-not-allowed disabled:opacity-50',
                        active ? 'border-primary bg-[#F2F2F2]/30 ring-1 ring-primary' : 'border-[#B7A7F2]',
                      )}
                    >
                      <span className="flex flex-col items-start">
                        <span className="font-mono text-sm font-semibold uppercase text-[#464350] group-hover:text-primary">{slot.label}</span>
                        <span className="text-lg font-bold text-[#0D0D0D]">{slot.time}</span>
                      </span>
                      <CheckCircle2 className={cn('size-5 text-primary transition-opacity', active ? 'opacity-100' : 'opacity-0')} />
                    </button>
                  );
                })}
              </div>
            </GlassCard> : null}

            {currentStep === 2 ? <GlassCard>
              <h3 className="mb-6 flex items-center gap-2 font-display text-[24px] font-semibold leading-8">
                <ScheduleIcon><Truck className="size-5" /></ScheduleIcon>
                {t('تفضيل التسليم', 'Delivery Preference')}
              </h3>
              <div className="space-y-4">
                <label className={cn('relative flex cursor-pointer items-center rounded-2xl border p-6 transition hover:bg-[#F2F2F2]/20', delivery === 'standard' ? 'border-primary bg-[#F2F2F2]/10' : 'border-[#B7A7F2] bg-white')}>
                  <input
                    checked={delivery === 'standard'}
                    className="size-5 accent-primary"
                    name="delivery"
                    type="radio"
                    value="standard"
                    onChange={() => setDelivery('standard')}
                  />
                  <div className="ms-4 flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-lg font-bold text-[#0D0D0D]">{t('توصيل عادي', 'Standard Delivery')}</span>
                      <span className="font-medium text-[#464350]">{t('مشمول', 'Included')}</span>
                    </div>
                    <p className="mt-1 text-sm text-[#464350]">{t('إرجاع خلال 48 ساعة مع تنظيف وفحص جودة.', 'Returned within 48 hours. Thorough cleaning and quality check included.')}</p>
                  </div>
                </label>

                <label className={cn('relative flex cursor-pointer items-center rounded-2xl border p-6 transition hover:border-primary', delivery === 'express' ? 'border-primary bg-[#F2F2F2]/10' : 'border-[#B7A7F2] bg-white')}>
                  <input
                    checked={delivery === 'express'}
                    className="size-5 accent-primary"
                    name="delivery"
                    type="radio"
                    value="express"
                    onChange={() => setDelivery('express')}
                  />
                  <div className="ms-4 flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-lg font-bold text-[#0D0D0D]">{t('توصيل سريع', 'Express Delivery')}</span>
                        <span className="rounded bg-accent px-2 py-0.5 text-[10px] font-bold uppercase text-primary">{t('أولوية', 'Priority')}</span>
                      </div>
                      <span className="font-bold text-primary">+AED 50</span>
                    </div>
                    <p className="mt-1 text-sm text-[#464350]">{t('إرجاع خلال 24 ساعة للمواعيد العاجلة.', 'Returned within 24 hours. Perfect for urgent events and tight schedules.')}</p>
                  </div>
                </label>
              </div>
            </GlassCard> : null}

            {currentStep === 2 ? <GlassCard>
              <h3 className="mb-6 flex items-center gap-2 font-display text-[24px] font-semibold leading-8">
                <ScheduleIcon><FileText className="size-5" /></ScheduleIcon>
                {t('ملاحظات للسائق', 'Driver Notes')}
              </h3>
              <div className="relative">
                <textarea
                  className="min-h-32 w-full resize-none rounded-2xl border border-[#B7A7F2] bg-white px-6 py-4 text-[#0D0D0D] outline-none transition placeholder:text-[#6d667d] focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder={t('مثال: اتصل قبل الوصول بعشر دقائق...', 'Example: Gate code is 1234, please leave bags with the concierge...')}
                  rows={4}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
                <div className="absolute bottom-4 right-4 flex gap-2 text-[#B7A7F2]">
                  <Mic className="size-4" aria-hidden="true" />
                  <Camera className="size-4" aria-hidden="true" />
                </div>
              </div>
            </GlassCard> : null}

            {currentStep === 4 ? <GlassCard>
              <h3 className="mb-6 flex items-center gap-2 font-display text-[24px] font-semibold leading-8">
                <ScheduleIcon><ShieldCheck className="size-5" /></ScheduleIcon>
                {t('مراجعة الطلب', 'Review Booking')}
              </h3>
              <div className="grid gap-3 rounded-2xl border border-primary/10 bg-primary/5 p-4 text-sm md:grid-cols-2">
                <InfoMini label={t('المنطقة', 'Area')} value={selectedAreaData?.name || '-'} />
                <InfoMini label={t('الخدمات', 'Services')} value={selectedServices.map((service) => service.name).join(' + ') || '-'} />
                <InfoMini label={t('الموعد', 'Pickup')} value={`${selectedDateLabel?.label || '-'} / ${selectedTimeLabel?.time || '-'}`} />
                <InfoMini label={t('العميل', 'Customer')} value={customerName || '-'} />
                <InfoMini label={t('الهاتف', 'Phone')} value={customerPhone || '-'} />
                <InfoMini label={t('العنوان', 'Address')} value={areaAddress || '-'} />
              </div>
              <p className="mt-5 text-sm leading-7 text-[#464350]">
                {t('بعد التأكيد سيتم إنشاء رقم طلب قابل للتتبع، وسيتم استخدام رقم الهاتف للتأكيد الآمن عبر واتساب عند التتبع.', 'After confirmation, a trackable order number will be created. The phone number will be used for secure WhatsApp verification when tracking.')}
              </p>
            </GlassCard> : null}
          </div>

          <aside className="space-y-6 lg:col-span-4 lg:sticky lg:top-28">
            <GlassCard>
              <h4 className="mb-6 font-display text-xl font-semibold">{t('ملخص الطلب', 'Summary')}</h4>
              <div className="mb-6 space-y-4 border-b border-[#B7A7F2] pb-6">
                <div className="flex justify-between text-[#464350]">
                  <span>{t('الخدمات', 'Services')} (8)</span>
                  <span className="font-medium text-[#0D0D0D]">AED {baseServiceEstimate.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#464350]">
                  <span>{t('رسوم السرعة', 'Express Surcharge')}</span>
                  <span className="font-medium text-[#0D0D0D]">AED {delivery === 'express' ? '50.00' : '0.00'}</span>
                </div>
                <div className="flex justify-between text-[#464350]">
                  <span>{t('رسوم التوصيل', 'Delivery Fee')}</span>
                  <span className="font-medium text-[#0D0D0D]">AED {deliveryFee.toFixed(2)}</span>
                </div>
              </div>
              <div className="mb-8 flex items-end justify-between">
                <div>
                  <p className="font-mono text-[12px] font-semibold uppercase leading-4 tracking-[0.1em] text-[#6d667d]">{t('الإجمالي التقريبي', 'ESTIMATED TOTAL')}</p>
                  <p className="text-3xl font-extrabold text-primary">AED {total.toFixed(2)}</p>
                </div>
                <span className="text-end text-xs text-[#464350]">{t('شامل الضريبة', 'VAT included')}</span>
              </div>
              {validationError ? (
                <div className="mb-5 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm font-bold leading-6 text-primary">
                  {validationError}
                </div>
              ) : null}
              <div className="flex gap-4 rounded-2xl bg-[#F4F1FF] p-4">
                <div className="grid size-12 flex-shrink-0 place-items-center rounded-xl border border-[#B7A7F2] bg-white shadow-sm">
                  <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-bold">{t('ضمان العناية', 'Premium Assurance')}</p>
                  <p className="text-xs text-[#464350]">{t('يتم التعامل مع القطع بعناية وفحص جودة قبل التسليم.', 'Your items are handled with care and quality checked before delivery.')}</p>
                </div>
              </div>
            </GlassCard>

            <div className="group relative h-48 overflow-hidden rounded-[32px] shadow-lg">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: "url('/service-images/luxury-garment-care-premium.png')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/85 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="mb-1 font-mono text-[12px] font-semibold uppercase leading-4 tracking-[0.1em] text-white/80">{t('نوع الخدمة', 'SERVICE TYPE')}</p>
                <p className="text-lg font-bold text-white">{t('عناية فاخرة بالقطع الحساسة', 'Delicate Care & Preservation')}</p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-white/40 bg-white/60 px-4 pb-8 pt-4 backdrop-blur-2xl">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-between gap-4 md:flex-row">
          <div className="hidden items-center gap-6 md:flex">
            <div className="flex items-center gap-2">
              <MapPin className="size-5 text-primary" aria-hidden="true" />
              <span className="text-sm font-medium">{selectedAreaData?.name || config.business_address}</span>
            </div>
            <div className="h-6 w-px bg-[#B7A7F2]" />
            <div className="flex items-center gap-2">
              <CreditCard className="size-5 text-primary" aria-hidden="true" />
              <span className="text-sm font-medium">{selectedBranch?.name || config.site_name}</span>
            </div>
          </div>
          <div className="flex w-full gap-4 md:w-auto">
            <button
              type="button"
              onClick={currentStep === 0 ? saveDraft : () => {
                setValidationError('');
                setCurrentStep((step) => Math.max(step - 1, 0));
              }}
              className="h-12 flex-1 rounded-full border border-primary px-8 font-bold text-primary transition hover:bg-[#F2F2F2] active:scale-95 md:h-14 md:w-48"
            >
              {currentStep === 0 ? t('حفظ كمسودة', 'Save Draft') : t('السابق', 'Back')}
            </button>
            <button
              type="button"
              onClick={currentStep === bookingSteps.length - 1 ? confirmPickup : goNext}
              disabled={isSubmitting}
              className="flex h-12 flex-[2] items-center justify-center gap-3 rounded-full bg-primary px-12 font-bold text-white shadow-lg shadow-primary/30 transition hover:bg-[#592EF2] active:scale-95 disabled:opacity-60 md:h-14 md:w-72"
            >
              {isSubmitting
                ? t('جاري التأكيد...', 'Confirming...')
                : currentStep === bookingSteps.length - 1
                  ? t('تأكيد الاستلام', 'Confirm Pickup')
                  : t('التالي', 'Next')}
              <ArrowRight className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </nav>

      <div className="fixed bottom-28 right-6 z-40">
        <button className="group relative grid size-16 place-items-center overflow-hidden rounded-full bg-primary text-white shadow-2xl transition hover:scale-110 active:scale-95" aria-label="AI assistant">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary opacity-0 transition-opacity group-hover:opacity-100" />
          <Sparkles className="relative z-10 size-8" aria-hidden="true" />
        </button>
      </div>
    </motion.div>
  );
};

const InfoMini = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0">
    <p className="text-[11px] font-black uppercase tracking-[0.08em] text-[#6d667d]">{label}</p>
    <p className="mt-1 truncate text-sm font-bold text-[#0D0D0D]">{value}</p>
  </div>
);
