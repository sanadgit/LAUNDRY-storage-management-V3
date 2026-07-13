import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  HelpCircle,
  LockKeyhole,
  MapPin,
  MessageCircle,
  PackageCheck,
  PackageSearch,
  RefreshCw,
  Search,
  Shirt,
  ShieldCheck,
  Truck,
  WashingMachine,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Order, OrderStatus, SiteConfig } from '../types';
import { localize, SiteLanguage } from '../lib/i18n';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from './ui';
import { cn } from '../lib/utils';
import { customerApi } from '../lib/customerApi';

interface PublicTrackingProps {
  order: Order | null;
  orders: Order[];
  onSearch: (id: string) => void;
  language: SiteLanguage;
  config: SiteConfig;
  isAuthenticated: boolean;
}

type TrackingStage = {
  key: string;
  ar: string;
  en: string;
  icon: React.ElementType;
};

const trackingStages: TrackingStage[] = [
  { key: 'received', ar: 'تم الاستلام', en: 'Received', icon: PackageSearch },
  { key: 'sorting', ar: 'الفرز', en: 'Sorting', icon: Shirt },
  { key: 'washing', ar: 'الغسيل', en: 'Washing', icon: WashingMachine },
  { key: 'drying', ar: 'التجفيف', en: 'Drying', icon: Clock3 },
  { key: 'ironing', ar: 'الكي', en: 'Ironing', icon: Shirt },
  { key: 'qc', ar: 'فحص الجودة', en: 'QC', icon: CheckCircle2 },
  { key: 'packing', ar: 'التغليف', en: 'Packing', icon: PackageCheck },
  { key: 'ready', ar: 'جاهز', en: 'Ready', icon: PackageCheck },
  { key: 'delivery', ar: 'خارج للتوصيل', en: 'Out for Delivery', icon: Truck },
  { key: 'delivered', ar: 'تم التسليم', en: 'Delivered', icon: CheckCircle2 },
];

const statusStageIndex: Record<OrderStatus, number> = {
  new: 0,
  accepted: 1,
  on_the_way: 0,
  pickup: 0,
  washing: 2,
  ready: 7,
  delivery: 8,
  completed: 9,
  delivered: 9,
  cancelled: 0,
};

const statusLabel: Record<OrderStatus, { ar: string; en: string }> = {
  new: { ar: 'طلب جديد', en: 'New order' },
  accepted: { ar: 'تم قبول الطلب', en: 'Accepted' },
  on_the_way: { ar: 'السائق في الطريق', en: 'Driver on the way' },
  pickup: { ar: 'تم الاستلام', en: 'Picked up' },
  washing: { ar: 'قيد المعالجة', en: 'In care' },
  ready: { ar: 'جاهز', en: 'Ready' },
  delivery: { ar: 'خارج للتوصيل', en: 'Out for delivery' },
  completed: { ar: 'مكتمل', en: 'Completed' },
  delivered: { ar: 'تم التسليم', en: 'Delivered' },
  cancelled: { ar: 'ملغي', en: 'Cancelled' },
};

const fallbackOrderId = 'INO-2026-1048';

type VerificationState = {
  orderId: string;
  challengeId: string;
  maskedPhone: string;
  expiresAt: number;
  devCode?: string;
};

export const PublicTracking: React.FC<PublicTrackingProps> = ({ order, orders, onSearch, language, config, isAuthenticated }) => {
  const [query, setQuery] = useState(order?.id || '');
  const [verification, setVerification] = useState<VerificationState | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifiedGuestOrder, setVerifiedGuestOrder] = useState<Order | null>(null);
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [trackError, setTrackError] = useState('');
  const reduceMotion = useReducedMotion();
  const activeOrder = isAuthenticated ? order : verifiedGuestOrder;
  const activeIndex = activeOrder ? statusStageIndex[activeOrder.status] : -1;
  const recentOrders = useMemo(() => (isAuthenticated ? orders.slice(0, 3) : []), [isAuthenticated, orders]);
  const fallbackBranch = config.branches.find((branch) => branch.status !== 'closed') || config.branches[0];
  const supportNumber = String(config.whatsapp_number || fallbackBranch?.whatsapp || fallbackBranch?.phone || '').replace(/[^\d]/g, '');
  const supportUrl = supportNumber
    ? `https://wa.me/${supportNumber.startsWith('971') ? supportNumber : `971${supportNumber.replace(/^0+/, '')}`}`
    : '#';

  useEffect(() => {
    if (order?.id) setQuery(order.id);
  }, [order?.id]);

  useEffect(() => {
    if (typeof window === 'undefined' || isAuthenticated) return;
    const ticketId = new URLSearchParams(window.location.search).get('id');
    if (ticketId) setQuery(ticketId);
  }, [isAuthenticated]);

  const submitSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    const orderId = query.trim();
    setTrackError('');
    setVerifiedGuestOrder(null);
    setVerificationCode('');
    if (!orderId) {
      setTrackError(t('اكتب رقم الطلب أولًا.', 'Enter the order number first.'));
      return;
    }

    onSearch(orderId);

    if (isAuthenticated) return;

    setIsRequestingCode(true);
    try {
      const response = await customerApi.requestPublicTrackVerification({ orderId });
      setVerification({
        orderId,
        challengeId: response.challengeId,
        maskedPhone: response.maskedPhone,
        expiresAt: response.expires_at,
        devCode: response.dev_code,
      });
    } catch (error: any) {
      setVerification(null);
      setTrackError(error?.message || t('تعذر إرسال رمز التحقق.', 'Could not send the verification code.'));
    } finally {
      setIsRequestingCode(false);
    }
  };

  const verifyCode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!verification) return;
    const code = verificationCode.replace(/\D/g, '');
    if (code.length < 4) {
      setTrackError(t('اكتب رمز التحقق المرسل إلى واتساب.', 'Enter the verification code sent to WhatsApp.'));
      return;
    }

    setTrackError('');
    setIsVerifyingCode(true);
    try {
      const response = await customerApi.verifyPublicTrackOrder({
        orderId: verification.orderId,
        challengeId: verification.challengeId,
        code,
      });
      setVerifiedGuestOrder(response.order);
      setVerification(null);
      setVerificationCode('');
    } catch (error: any) {
      setTrackError(error?.message || t('رمز التحقق غير صحيح.', 'The verification code is not valid.'));
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const t = (ar: string, en: string) => localize(language, ar, en);
  const displayStatus = activeOrder ? statusLabel[activeOrder.status] : null;

  return (
    <main className="min-h-screen bg-background pt-24 text-foreground md:pt-28">
      <section className="border-b border-border bg-primary text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.15fr_.85fr] md:py-16 lg:px-8">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="max-w-3xl"
          >
            <Badge variant="accent" className="mb-5 border-white/20 bg-white/10 text-white">
              {t('تتبع مباشر', 'Live tracking')}
            </Badge>
            <h1 className="text-4xl font-black leading-tight md:text-6xl">
              {t('تابع رحلة طلبك من الاستلام حتى التسليم.', 'Follow your order from pickup to delivery.')}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/78 md:text-lg">
              {t(
                'اكتب رقم الطلب لمعرفة المرحلة الحالية، الفرع، ووقت التسليم المتوقع ضمن تجربة واضحة وسريعة.',
                'Enter the order ID to see the current stage, branch, and expected delivery window in a clear flow.',
              )}
            </p>
          </motion.div>

          <Card className="border-white/15 bg-white/10 text-white shadow-none backdrop-blur">
            <CardHeader>
              <CardTitle>{t('بحث سريع', 'Quick search')}</CardTitle>
              <CardDescription className="text-white/70">
                {isAuthenticated
                  ? t('استخدم رقم الطلب من حسابك أو من POS.', 'Use your account order ID or POS order number.')
                  : t('للأمان سنرسل كود واتساب إلى رقم الهاتف المرتبط بالطلب قبل عرض التفاصيل.', 'For security, we send a WhatsApp code to the phone linked to the order before showing details.')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitSearch} className="grid gap-3">
                <Input
                  aria-label={t('رقم الطلب', 'Order ID')}
                  dir="ltr"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={fallbackOrderId}
                  className="border-white/20 bg-white text-slate-950 placeholder:text-slate-400"
                />
                <Button type="submit" variant="accent" size="lg">
                  {isRequestingCode ? <RefreshCw aria-hidden="true" className="size-5 animate-spin" /> : <Search aria-hidden="true" className="size-5" />}
                  {isAuthenticated ? t('تتبع الآن', 'Track now') : t('إرسال كود التحقق', 'Send verification code')}
                </Button>
              </form>

              {!isAuthenticated && verification ? (
                <form onSubmit={verifyCode} className="mt-5 rounded-lg border border-white/15 bg-white/10 p-4">
                  <div className="flex gap-3">
                    <div className="grid size-11 shrink-0 place-items-center rounded-md bg-white text-primary">
                      <MessageCircle aria-hidden="true" className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black">{t('تأكيد رقم الهاتف', 'Phone verification')}</p>
                      <p className="mt-1 text-sm leading-6 text-white/75">
                        {t(
                          `تم إرسال كود لتأكيد رقم الهاتف للأمان إلى الرقم ${verification.maskedPhone}`,
                          `A security code was sent to the phone ending ${verification.maskedPhone}`,
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                    <Input
                      aria-label={t('كود التحقق', 'Verification code')}
                      value={verificationCode}
                      onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      inputMode="numeric"
                      dir="ltr"
                      className="border-white/20 bg-white text-slate-950 placeholder:text-slate-400"
                    />
                    <Button type="submit" variant="accent" disabled={isVerifyingCode}>
                      {isVerifyingCode ? <RefreshCw aria-hidden="true" className="size-5 animate-spin" /> : <ShieldCheck aria-hidden="true" className="size-5" />}
                      {t('تأكيد', 'Verify')}
                    </Button>
                  </div>
                  {verification.devCode ? (
                    <p className="mt-3 rounded-md bg-black/20 px-3 py-2 font-mono text-xs text-white/80" dir="ltr">
                      DEV CODE: {verification.devCode}
                    </p>
                  ) : null}
                </form>
              ) : null}

              {trackError ? (
                <div className="mt-4 flex gap-2 rounded-lg border border-white/15 bg-white/10 p-3 text-sm text-white">
                  <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                  <p>{trackError}</p>
                </div>
              ) : null}

              {recentOrders.length ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {recentOrders.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setQuery(item.id);
                        onSearch(item.id);
                      }}
                      className="min-h-10 rounded-pill border border-white/20 px-3 text-sm font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      {item.id}
                    </button>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
        <div className="grid gap-6 lg:self-start">
          <Card>
            <CardHeader>
              <CardTitle>{activeOrder ? activeOrder.id : t('نتيجة التتبع محمية', 'Tracking result is protected')}</CardTitle>
              <CardDescription>
                {activeOrder
                  ? t('آخر تحديث من النظام.', 'Latest update from the system.')
                  : t('اكتب رقم الطلب وأكد كود واتساب لعرض تفاصيله.', 'Enter the order number and verify the WhatsApp code to view details.')}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {activeOrder ? (
                <>
                  <div className="rounded-lg border border-border bg-muted p-4">
                    <p className="text-xs font-bold text-muted-foreground">{t('الحالة الحالية', 'Current status')}</p>
                    <p className="mt-1 text-2xl font-black text-primary">
                      {displayStatus ? localize(language, displayStatus.ar, displayStatus.en) : t('قيد المتابعة', 'In tracking')}
                    </p>
                  </div>

                  <div className="grid gap-3 text-sm">
                    <InfoRow label={t('الخدمة', 'Service')} value={activeOrder.serviceType || t('طلب مغسلة', 'Laundry order')} />
                    <InfoRow label={t('الفرع', 'Branch')} value={activeOrder.branch || fallbackBranch?.name || config.site_name} />
                    <InfoRow label={t('عدد القطع', 'Items')} value={String(activeOrder.itemCount || activeOrder.pos?.item_count || 0)} />
                    <InfoRow label={t('موعد الاستلام', 'Pickup slot')} value={activeOrder.pickupSlot || activeOrder.eta || activeOrder.pos?.delivery_date || t('يحدد من النظام', 'Confirmed by system')} />
                    <InfoRow label={t('حالة الدفع', 'Payment')} value={paymentLabel(activeOrder.paymentStatus, language)} />
                    <InfoRow label={t('المبلغ', 'Amount')} value={`AED ${Number(activeOrder.totalPrice ?? activeOrder.amount ?? activeOrder.pos?.total ?? 0).toFixed(2)}`} />
                  </div>
                </>
              ) : (
                <div className="rounded-lg border border-border bg-muted p-5 text-center">
                  <div className="mx-auto grid size-14 place-items-center rounded-pill bg-primary/10 text-primary">
                    <LockKeyhole aria-hidden="true" className="size-6" />
                  </div>
                  <p className="mt-3 font-black">{t('لا يتم عرض بيانات الطلب بدون تحقق.', 'Order details are hidden until verification.')}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {t('نستخدم رقم الهاتف المسجل في POS أو الطلب لإرسال كود واتساب.', 'We use the phone saved in POS or the order to send a WhatsApp code.')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('الدعم', 'Support')}</CardTitle>
              <CardDescription>{t('فريق خدمة العملاء جاهز عند الحاجة.', 'Customer care is ready when needed.')}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  if (supportUrl !== '#') window.open(`${supportUrl}?text=${encodeURIComponent(t(`أريد متابعة الطلب ${activeOrder?.id || ''}`, `I want to follow up on order ${activeOrder?.id || ''}`))}`, '_blank', 'noopener,noreferrer');
                }}
              >
                <HelpCircle aria-hidden="true" className="size-5" />
                {t('واتساب الدعم', 'WhatsApp support')}
              </Button>
              <div className="rounded-lg border border-border bg-muted p-4 text-sm text-muted-foreground">
                {t(
                  'سيتم ربط Layla AI لاحقًا لتقديم تحديثات ذكية ومساعدة مباشرة داخل نفس الصفحة.',
                  'Layla AI will later provide intelligent updates and direct support inside this page.',
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border">
            <CardTitle>{t('خط سير الطلب', 'Tracking timeline')}</CardTitle>
            <CardDescription>
              {t(
                'Received → Sorting → Washing → Drying → Ironing → QC → Packing → Ready → Out for Delivery → Delivered',
                'Received → Sorting → Washing → Drying → Ironing → QC → Packing → Ready → Out for Delivery → Delivered',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ol className="divide-y divide-border">
              {trackingStages.map((stage, index) => {
                const done = activeOrder?.status === 'cancelled' ? false : index < activeIndex;
                const active = activeOrder?.status === 'cancelled' ? index === 0 : index === activeIndex;
                const Icon = stage.icon;

                return (
                  <motion.li
                    key={stage.key}
                    initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.28, delay: Math.min(index * 0.025, 0.18) }}
                    className={cn('grid grid-cols-[auto_1fr] gap-4 p-5 md:p-6', active && 'bg-accent/5')}
                  >
                    <div className="relative flex flex-col items-center">
                      <div
                        className={cn(
                          'grid size-12 place-items-center rounded-pill border transition-colors',
                          done && 'border-success bg-success text-white',
                          active && 'border-accent bg-accent text-white shadow-medium',
                          !done && !active && 'border-border bg-muted text-muted-foreground',
                        )}
                      >
                        <Icon aria-hidden="true" className="size-5" />
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-black">{localize(language, stage.ar, stage.en)}</h2>
                        {active ? <Badge variant="accent">{t('المرحلة الحالية', 'Current stage')}</Badge> : null}
                        {done ? <Badge variant="success">{t('مكتملة', 'Done')}</Badge> : null}
                      </div>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {done
                          ? t('تمت هذه المرحلة بنجاح وتوثيقها في النظام.', 'This stage has been completed and logged.')
                          : active
                            ? t('يعمل الفريق على هذه المرحلة الآن.', 'The team is working on this stage now.')
                            : t('ستبدأ تلقائيًا عند انتهاء المرحلة السابقة.', 'Starts automatically after the previous stage.')}
                      </p>
                    </div>
                  </motion.li>
                );
              })}
            </ol>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 rounded-xl border border-border bg-muted p-5 md:grid-cols-3 md:p-6">
          {[
            [MapPin, t('تغطية أبوظبي', 'Abu Dhabi coverage'), t('فروع ومناطق خدمة واضحة داخل أبوظبي.', 'Clear branch and service-area coverage in Abu Dhabi.')],
            [Truck, t('تحديثات التوصيل', 'Delivery updates'), t('تظهر مرحلة الخروج للتوصيل فور تفعيلها.', 'Out-for-delivery appears when activated.')],
            [CheckCircle2, t('جودة موثقة', 'Logged quality'), t('مرحلة QC موجودة قبل التغليف والتسليم.', 'QC is included before packing and delivery.')],
          ].map(([Icon, title, text]) => {
            const TileIcon = Icon as React.ElementType;
            return (
              <div key={String(title)} className="flex gap-3">
                <div className="grid size-11 shrink-0 place-items-center rounded-md bg-primary text-white">
                  <TileIcon aria-hidden="true" className="size-5" />
                </div>
                <div>
                  <h3 className="font-black">{title as string}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{text as string}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-b-0 last:pb-0">
    <span className="text-muted-foreground">{label}</span>
    <span className="max-w-[60%] text-end font-bold text-foreground">{value}</span>
  </div>
);

const paymentLabel = (status: Order['paymentStatus'] | undefined, language: SiteLanguage) => {
  if (status === 'paid') return localize(language, 'مدفوع', 'Paid');
  if (status === 'pending') return localize(language, 'قيد الانتظار', 'Pending');
  if (status === 'unpaid') return localize(language, 'غير مدفوع', 'Unpaid');
  return localize(language, 'يحدد لاحقًا', 'To be confirmed');
};
