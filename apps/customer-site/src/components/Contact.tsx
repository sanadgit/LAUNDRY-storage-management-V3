import React, { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Send,
  ShieldCheck,
  Store,
  Truck,
} from 'lucide-react';
import { SiteConfig } from '../types';
import { SiteLanguage, localize } from '../lib/i18n';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui';
import { cn } from '../lib/utils';

interface ContactProps {
  config: SiteConfig;
  language?: SiteLanguage;
}

const branchNameEn: Record<string, string> = {
  alfalah: 'Al Falah Branch',
  mussaffah: 'Mussaffah Branch',
  mbz: 'Mohammed Bin Zayed Branch',
};

export const Contact: React.FC<ContactProps> = ({ config, language = 'ar' }) => {
  const branches = useMemo(() => config.branches.filter((branch) => branch.status !== 'closed'), [config.branches]);
  const [activeBranchId, setActiveBranchId] = useState(branches[0]?.id || '');
  const activeBranch = branches.find((branch) => branch.id === activeBranchId) || branches[0];
  const reduceMotion = useReducedMotion();
  const t = (ar: string, en: string) => localize(language, ar, en);

  return (
    <div className="mx-auto max-w-6xl space-y-10 pb-20">
      <section className="overflow-hidden rounded-[2rem] bg-primary text-white shadow-high">
        <div className="grid gap-8 p-6 md:grid-cols-[1fr_.8fr] md:p-10">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Badge variant="accent" className="mb-5 border-white/20 bg-white/10 text-white">
              {t('خدمة العملاء', 'Customer support')}
            </Badge>
            <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-6xl">
              {t('تواصل معنا بالطريقة الأسرع لك.', 'Reach us through the fastest channel for you.')}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/75">
              {t(
                'اتصال مباشر، واتساب، بريد، وخريطة الفروع. اختر الفرع أو ابدأ حجز استلام جديد خلال ثوان.',
                'Direct calls, WhatsApp, email, and branch maps. Choose a branch or start a new pickup booking in seconds.',
              )}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" variant="accent" onClick={() => openWhatsApp(config.whatsapp_number, t('أريد حجز استلام', 'I want to book a pickup'))}>
                <MessageCircle aria-hidden="true" className="size-5" />
                {t('واتساب عام', 'Main WhatsApp')}
              </Button>
              <Button size="lg" variant="secondary" onClick={() => window.location.href = `mailto:${config.contact_email}`}>
                <Mail aria-hidden="true" className="size-5" />
                {t('البريد الإلكتروني', 'Email')}
              </Button>
            </div>
          </motion.div>

          <div className="grid gap-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
            <SupportMetric icon={Store} label={t('الفروع', 'Branches')} value={String(branches.length)} />
            <SupportMetric icon={Truck} label={t('الاستلام والتوصيل', 'Pickup & delivery')} value={config.accept_orders ? t('مفعل', 'Enabled') : t('متوقف', 'Paused')} />
            <SupportMetric icon={ShieldCheck} label={t('التذاكر', 'Tickets')} value={t('متابعة واضحة', 'Tracked flow')} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <QuickAction
          icon={Phone}
          title={t('اتصال مباشر', 'Direct call')}
          text={activeBranch?.phone || config.whatsapp_number}
          onClick={() => activeBranch?.phone && (window.location.href = `tel:${normalizePhoneForTel(activeBranch.phone)}`)}
        />
        <QuickAction
          icon={MessageCircle}
          title={t('واتساب', 'WhatsApp')}
          text={t('حجز، تتبع، دعم', 'Booking, tracking, support')}
          onClick={() => openWhatsApp(activeBranch?.whatsapp || config.whatsapp_number, t('مرحبًا، أحتاج مساعدة من In & Out Laundry', 'Hi, I need help from In & Out Laundry'))}
        />
        <QuickAction
          icon={MapPin}
          title={t('الفروع', 'Branches')}
          text={t('اختر أقرب فرع', 'Choose nearest branch')}
          onClick={() => activeBranch && window.open(mapUrl(activeBranch.coordinates.lat, activeBranch.coordinates.lng), '_blank', 'noopener,noreferrer')}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t('الفروع الرسمية', 'Official branches')}</CardTitle>
            <CardDescription>{t('اختر الفرع للتواصل أو فتح الخريطة.', 'Choose a branch to contact or open the map.')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {branches.map((branch) => {
              const active = activeBranch?.id === branch.id;
              return (
                <button
                  key={branch.id}
                  type="button"
                  onClick={() => setActiveBranchId(branch.id)}
                  className={cn(
                    'rounded-lg border p-4 text-start transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    active ? 'border-primary bg-primary/5' : 'border-border bg-surface hover:border-primary/50',
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-black">{branchLabel(branch.id, branch.name, language)}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{branch.address}</p>
                    </div>
                    <Badge variant={branch.status === 'busy' ? 'warning' : 'success'}>
                      {branch.status === 'busy' ? t('مشغول', 'Busy') : t('متاح', 'Available')}
                    </Badge>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <BranchAction
                      icon={Phone}
                      label={branch.phone}
                      onClick={(event) => {
                        event.stopPropagation();
                        window.location.href = `tel:${normalizePhoneForTel(branch.phone)}`;
                      }}
                    />
                    <BranchAction
                      icon={MessageCircle}
                      label={t('واتساب', 'WhatsApp')}
                      onClick={(event) => {
                        event.stopPropagation();
                        openWhatsApp(branch.whatsapp || branch.phone, t('أريد التواصل مع الفرع', 'I want to contact this branch'));
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border">
            <CardTitle>{activeBranch ? branchLabel(activeBranch.id, activeBranch.name, language) : t('الخريطة', 'Map')}</CardTitle>
            <CardDescription>{activeBranch?.address || config.business_address}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {activeBranch ? (
              <iframe
                src={mapEmbedUrl(activeBranch.coordinates.lat, activeBranch.coordinates.lng)}
                title={branchLabel(activeBranch.id, activeBranch.name, language)}
                className="h-[420px] w-full border-0"
                loading="lazy"
                allowFullScreen
              />
            ) : null}
            <div className="grid gap-2 border-t border-border p-4 sm:grid-cols-2">
              <Button variant="secondary" onClick={() => activeBranch && window.open(mapUrl(activeBranch.coordinates.lat, activeBranch.coordinates.lng), '_blank', 'noopener,noreferrer')}>
                <Navigation aria-hidden="true" className="size-5" />
                {t('فتح الاتجاهات', 'Open directions')}
              </Button>
              <Button variant="accent" onClick={() => openWhatsApp(activeBranch?.whatsapp || config.whatsapp_number, t('أريد حجز استلام من هذا الفرع', 'I want to book pickup from this branch'))}>
                <MessageCircle aria-hidden="true" className="size-5" />
                {t('حجز عبر واتساب', 'Book via WhatsApp')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
        <Card>
          <CardHeader>
            <CardTitle>{t('ساعات العمل', 'Working hours')}</CardTitle>
            <CardDescription>{t('الجدول العام للفروع الحالية.', 'General schedule for current branches.')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {[
              [t('السبت - الأربعاء', 'Saturday - Wednesday'), t('8 ص - 10 م', '8 AM - 10 PM')],
              [t('الخميس', 'Thursday'), t('8 ص - 11 م', '8 AM - 11 PM')],
              [t('الجمعة', 'Friday'), t('2 م - 11 م', '2 PM - 11 PM')],
            ].map(([day, time]) => (
              <div key={day} className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted p-4">
                <span className="font-bold">{day}</span>
                <span className="font-black text-primary">{time}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('أرسل رسالة', 'Send a message')}</CardTitle>
            <CardDescription>{t('النموذج يجهز رسالة بريد واضحة لفريق الدعم.', 'The form prepares a clear email for support.')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ContactForm config={config} language={language} branchName={activeBranch ? branchLabel(activeBranch.id, activeBranch.name, language) : config.site_name} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

const ContactForm = ({ config, language, branchName }: { config: SiteConfig; language: SiteLanguage; branchName: string }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [topic, setTopic] = useState('service');
  const [message, setMessage] = useState('');
  const t = (ar: string, en: string) => localize(language, ar, en);

  const sendEmail = () => {
    const subject = encodeURIComponent(`${config.site_name} - ${topic}`);
    const body = encodeURIComponent([
      `${t('الاسم', 'Name')}: ${name}`,
      `${t('الهاتف', 'Phone')}: ${phone}`,
      `${t('الفرع', 'Branch')}: ${branchName}`,
      `${t('النوع', 'Topic')}: ${topic}`,
      '',
      message,
    ].join('\n'));
    window.location.href = `mailto:${config.contact_email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label={t('الاسم الكامل', 'Full name')} value={name} onChange={setName} />
        <Field label={t('رقم الجوال', 'Mobile number')} value={phone} onChange={setPhone} dir="ltr" />
      </div>
      <label className="grid gap-2 text-xs font-black">
        {t('نوع الاستفسار', 'Inquiry type')}
        <select
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          className="min-h-12 rounded-lg border border-input bg-surface px-4 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="service">{t('استفسار عن خدمة', 'Service inquiry')}</option>
          <option value="complaint">{t('شكوى أو ملاحظة', 'Complaint or feedback')}</option>
          <option value="commercial">{t('طلب عرض سعر تجاري', 'Commercial quote')}</option>
        </select>
      </label>
      <label className="grid gap-2 text-xs font-black">
        {t('الرسالة', 'Message')}
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="min-h-32 rounded-lg border border-input bg-surface p-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder={t('كيف يمكننا مساعدتك؟', 'How can we help you?')}
        />
      </label>
      <Button variant="accent" size="lg" onClick={sendEmail} disabled={!name.trim() || !phone.trim() || !message.trim()}>
        <Send aria-hidden="true" className="size-5" />
        {t('إرسال عبر البريد', 'Send via email')}
      </Button>
    </div>
  );
};

const Field = ({ label, value, onChange, dir }: { label: string; value: string; onChange: (value: string) => void; dir?: 'rtl' | 'ltr' }) => (
  <label className="grid gap-2 text-xs font-black">
    {label}
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      dir={dir}
      className="min-h-12 rounded-lg border border-input bg-surface px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    />
  </label>
);

const SupportMetric = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="flex items-center gap-3 rounded-lg bg-white/10 p-3">
    <Icon aria-hidden="true" className="size-5 text-accent" />
    <div>
      <p className="text-xs text-white/65">{label}</p>
      <p className="font-black">{value}</p>
    </div>
  </div>
);

const QuickAction = ({ icon: Icon, title, text, onClick }: { icon: React.ElementType; title: string; text: string; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="rounded-xl border border-border bg-surface p-6 text-center shadow-low transition hover:-translate-y-1 hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    <div className="mx-auto mb-4 grid size-14 place-items-center rounded-lg bg-primary text-white">
      <Icon aria-hidden="true" className="size-6" />
    </div>
    <h2 className="font-black">{title}</h2>
    <p className="mt-2 text-sm text-muted-foreground">{text}</p>
  </button>
);

const BranchAction = ({ icon: Icon, label, onClick }: { icon: React.ElementType; label: string; onClick: (event: React.MouseEvent) => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex min-h-10 items-center justify-center gap-2 rounded-md border border-border bg-muted px-3 text-xs font-bold transition hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    <Icon aria-hidden="true" className="size-4 text-primary" />
    {label}
  </button>
);

const branchLabel = (id: string, name: string, language: SiteLanguage) => language === 'ar' ? name : branchNameEn[id] || name;
const mapUrl = (lat: number, lng: number) => `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
const mapEmbedUrl = (lat: number, lng: number) => `https://maps.google.com/maps?q=${lat},${lng}&z=14&output=embed`;
const normalizePhoneForTel = (phone: string) => String(phone || '').replace(/[^\d+]/g, '');

const openWhatsApp = (phone: string | undefined, message: string) => {
  const raw = String(phone || '').replace(/[^\d]/g, '');
  if (!raw) return;
  const normalized = raw.startsWith('971') ? raw : `971${raw.replace(/^0+/, '')}`;
  window.open(`https://wa.me/${normalized}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
};
