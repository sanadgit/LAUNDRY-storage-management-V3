import React from 'react';
import {
  ArrowUpRight,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { SiteConfig } from '../types';
import { SiteLanguage, localize } from '../lib/i18n';
import { BrandLogo } from './BrandLogo';
import { Button, Input } from './ui';

interface FooterProps {
  setRoute: (route: string) => void;
  config: SiteConfig;
  language: SiteLanguage;
}

const footerGroups = [
  {
    key: 'company',
    ar: 'الشركة',
    en: 'Company',
    links: [
      ['about', 'من نحن', 'About', '/about'],
      ['reviews', 'آراء العملاء', 'Reviews', '/reviews'],
      ['gallery', 'المعرض', 'Gallery', '/gallery'],
      ['careers', 'الوظائف', 'Careers', '/careers'],
    ],
  },
  {
    key: 'services',
    ar: 'الخدمات',
    en: 'Services',
    links: [
      ['services', 'كل الخدمات', 'All services', '/services'],
      ['abaya', 'العناية بالعبايات', 'Abaya care', '/services/abaya-care'],
      ['blankets', 'البطانيات', 'Blankets', '/services/blankets'],
      ['commercial', 'الغسيل التجاري', 'Commercial', '/commercial'],
    ],
  },
  {
    key: 'support',
    ar: 'الدعم',
    en: 'Support',
    links: [
      ['track', 'تتبع الطلب', 'Track order', '/track'],
      ['areas', 'مناطق الخدمة', 'Service areas', '/areas'],
      ['faq', 'الأسئلة الشائعة', 'FAQ', '/faq'],
      ['complaint', 'شكوى', 'Complaint', '/complaint'],
      ['contact', 'تواصل معنا', 'Contact', '/contact'],
    ],
  },
  {
    key: 'resources',
    ar: 'المحتوى',
    en: 'Resources',
    links: [
      ['blog', 'المدونة', 'Blog', '/blog'],
      ['offers', 'العروض', 'Offers', '/offers'],
      ['care-guides', 'أدلة العناية', 'Care guides', '/care-guides'],
      ['privacy', 'الخصوصية', 'Privacy', '/privacy'],
    ],
  },
];

export const Footer: React.FC<FooterProps> = ({ setRoute, config, language }) => {
  const year = new Date().getFullYear();

  const routeLink = (path: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setRoute(path);
  };

  return (
    <footer className="relative overflow-hidden bg-[#1f1a23] text-white">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" aria-hidden="true" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1.7fr_1fr]">
          <section className="flex flex-col gap-6">
            <BrandLogo language={language} dark />
            <p className="max-w-sm text-sm leading-7 text-white/68">
              {localize(
                language,
                'منصة غسيل فاخرة مدعومة بالذكاء الاصطناعي للحجز، التتبع، وخدمة العملاء في الإمارات.',
                'Premium AI-powered laundry for booking, tracking, and customer care across the UAE.',
              )}
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href={config.social_media.instagram || '#'}
                className="grid size-11 place-items-center rounded-md border border-white/10 bg-white/5 text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Instagram"
              >
                <Instagram aria-hidden="true" className="size-4" />
              </a>
              <a
                href={config.social_media.facebook || '#'}
                className="grid size-11 place-items-center rounded-md border border-white/10 bg-white/5 text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Facebook"
              >
                <Facebook aria-hidden="true" className="size-4" />
              </a>
            </div>
          </section>

          <nav className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4" aria-label={localize(language, 'روابط التذييل', 'Footer navigation')}>
            {footerGroups.map((group) => (
              <section key={group.key}>
                <h2 className="font-mono text-xs font-bold uppercase tracking-[0.1em] text-accent">
                  {localize(language, group.ar, group.en)}
                </h2>
                <ul className="mt-4 flex flex-col gap-3">
                  {group.links.map(([key, ar, en, path]) => (
                    <li key={key}>
                      <a
                        href={path}
                        onClick={routeLink(path)}
                        className="inline-flex min-h-8 items-center gap-2 text-sm font-bold text-white/64 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        {localize(language, ar, en)}
                        <ArrowUpRight aria-hidden="true" className="size-3.5 rtl:rotate-[-90deg]" />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>

          <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5">
            <h2 className="flex items-center gap-2 text-sm font-black text-white">
              <Sparkles aria-hidden="true" className="size-4 text-accent" />
              {localize(language, 'تحديثات وعروض', 'Updates and offers')}
            </h2>
            <p className="mt-3 text-sm leading-6 text-white/60">
              {localize(language, 'اشترك للحصول على عروض الخدمات والتنبيهات المهمة.', 'Get service offers and important updates.')}
            </p>
            <form className="mt-4 flex  flex-col gap-3" onSubmit={(event) => event.preventDefault()}>
              <Input
                type="email"
                label={localize(language, 'البريد الإلكتروني', 'Email')}
                placeholder="name@example.com"
                className="bg-white text-secondary"
              />
              <Button variant="accent" type="submit">
                {localize(language, 'اشتراك', 'Subscribe')}
              </Button>
            </form>
          </section>
        </div>

        <div className="mt-12 grid gap-4 border-t border-white/10 pt-8 md:grid-cols-3">
          <a href={config.google_maps_url} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-start gap-3 text-sm text-white/64 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <MapPin aria-hidden="true" className="mt-1 size-4 shrink-0 text-accent" />
            <span>{localize(language, config.business_address, 'Abu Dhabi, Musaffah M-13, United Arab Emirates')}</span>
          </a>
          <a href={`tel:${config.whatsapp_number || '0568720885'}`} dir="ltr" className="flex min-h-11 items-center gap-3 text-sm text-white/64 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <Phone aria-hidden="true" className="size-4 shrink-0 text-accent" />
            {config.whatsapp_number}
          </a>
          <a href={`mailto:${config.contact_email}`} className="flex min-h-11 items-center gap-3 text-sm text-white/64 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <Mail aria-hidden="true" className="size-4 shrink-0 text-accent" />
            {config.contact_email}
          </a>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs font-bold text-white/45 md:flex-row md:items-center md:justify-between">
          <p>{localize(language, config.footer_text, `In & Out Laundry © ${year}. All rights reserved.`)}</p>
          <div className="flex flex-wrap gap-4">
            <a href="/privacy" onClick={routeLink('/privacy')} className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
              {localize(language, 'سياسة الخصوصية', 'Privacy Policy')}
            </a>
            <a href="/terms" onClick={routeLink('/terms')} className="hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
              {localize(language, 'الشروط والأحكام', 'Terms')}
            </a>
            <span className="inline-flex items-center gap-1 text-white/55">
              <ShieldCheck aria-hidden="true" className="size-3.5 text-accent" />
              {localize(language, 'WCAG AA جاهز', 'WCAG AA ready')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
