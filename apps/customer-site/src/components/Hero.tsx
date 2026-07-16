import React from 'react';
import { ShoppingBag, User, Waves } from 'lucide-react';

import { SiteConfig } from '../types';
import { LaundryIcon } from './LaundryIcon';
import { BrandLogo } from './BrandLogo';
import { SiteLanguage, localize } from '../lib/i18n';

interface HeroProps {
  onTrackClick: () => void;
  onBookClick: () => void;
  onNavigate?: (route: string) => void;
  config: SiteConfig;
  language: SiteLanguage;
  onLanguageChange: (language: SiteLanguage) => void;
}

const HERO_IMAGE = '/inandout-hero-concept.png?v=edited-20260519';

export const Hero: React.FC<HeroProps> = ({ onTrackClick, onBookClick, onNavigate, config, language, onLanguageChange }) => {
  const navLinks = [
    { name: localize(language, 'الرئيسية', 'Home'), path: '/' },
    { name: localize(language, 'خدماتنا', 'Services'), path: '/services' },
    { name: localize(language, 'كيف نعمل', 'How It Works'), path: '#journey' },
    { name: localize(language, 'الأسعار', 'Pricing'), path: '/services' },
    { name: localize(language, 'تواصل معنا', 'Contact'), path: '/contact' },
  ];

  const goTo = (path: string) => {
    if (path.startsWith('#')) {
      document.querySelector(path)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    onNavigate?.(path);
  };

  return (
    <section className="relative overflow-hidden bg-white">
      <h1 className="sr-only">IN & OUT LAUNDRY</h1>
      <div className="relative mx-auto min-h-[680px] w-full max-w-[1536px] md:min-h-0">
        <img
          src={HERO_IMAGE}
          alt=""
          aria-hidden="true"
          className="hidden h-auto w-full select-none md:block"
          style={{ filter: 'hue-rotate(94deg) saturate(1.14)' }}
          draggable={false}
        />

        <div
          className="relative block min-h-[844px] bg-white bg-no-repeat md:hidden"
          style={{
            backgroundImage: `url('${HERO_IMAGE}')`,
            backgroundSize: 'auto 100%',
            backgroundPosition: '56% top',
            filter: 'hue-rotate(94deg) saturate(1.14)',
          }}
          aria-hidden="true"
        />

        <header dir="ltr" className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-6 md:px-[3.6%] md:py-[2%]">
          <div className="flex items-center gap-2 sm:gap-3">
            <BrandLogo language={language} onClick={() => goTo('/')} />
            {language === 'ar' ? (
              <button onClick={() => goTo('/')} className="hidden cursor-pointer sm:block transition hover:opacity-80 font-black text-secondary text-xs md:text-sm">
                مصبغة<br/>ان اند اوت
              </button>
            ) : (
              <button onClick={() => goTo('/')} className="hidden cursor-pointer sm:block transition hover:opacity-80 font-black text-secondary text-xs md:text-sm leading-tight text-left">
                In & Out<br/>Laundry
              </button>
            )}
          </div>

          <nav className="hidden items-center gap-11 md:flex" dir="rtl">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => goTo(link.path)}
                className={`relative text-sm font-bold transition hover:text-primary ${
                  link.path === '/' ? 'text-primary' : 'text-secondary'
                }`}
              >
                {link.name}
                {link.path === '/' && (
                  <span className="absolute -bottom-4 left-1/2 h-0.5 w-5 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4 md:gap-7" dir="rtl">
            <div className="hidden items-center rounded-full border border-slate-200 bg-white/80 p-1 text-[10px] font-black shadow-sm backdrop-blur sm:flex" dir="ltr">
              {(['ar', 'en'] as SiteLanguage[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => onLanguageChange(item)}
                  className={`rounded-full px-3 py-1.5 transition ${
                    language === item ? 'bg-primary text-white shadow-sm' : 'text-secondary hover:text-primary'
                  }`}
                >
                  {item.toUpperCase()}
                </button>
              ))}
            </div>
            <button
              onClick={() => goTo('/auth')}
              aria-label={localize(language, 'دخول', 'Login')}
              className="hidden text-secondary transition hover:text-primary sm:block"
            >
              <User size={25} strokeWidth={2.1} />
            </button>
            <button
              onClick={onBookClick}
              aria-label={localize(language, 'اطلب الآن', 'Book Now')}
              className="hidden text-secondary transition hover:text-primary sm:block"
            >
              <ShoppingBag size={25} strokeWidth={2.1} />
            </button>
            <button
              onClick={onBookClick}
              className="rounded-full bg-primary px-5 py-2.5 text-xs font-black text-white shadow-[0_18px_42px_rgba(89,46,242,0.24)] transition hover:bg-[#4520d6] active:scale-95 md:px-10 md:py-3.5 md:text-base"
            >
              {localize(language, 'اطلب الآن', 'Book Now')}
            </button>
          </div>
        </header>

        <div className="absolute left-[63%] top-[19.5%] z-10 hidden w-[30%] -translate-x-1/2 text-center md:block" dir="ltr">
          <div className="text-[66px] font-black leading-[1.08] tracking-normal xl:text-[78px]">
            <span className="text-primary">IN</span>
            <span className="text-secondary"> & </span>
            <span className="text-primary">OUT</span>
            <span className="block text-secondary">LAUNDRY</span>
          </div>
          <div className="mx-auto mt-7 flex max-w-[340px] items-center gap-3">
            <span className="h-px flex-1 bg-slate-300" />
            <span className="text-primary">
              <Waves size={18} strokeWidth={2.8} />
            </span>
            <span className="h-px flex-1 bg-slate-300" />
          </div>
          <p className="sr-only">{config.hero.subtitle}</p>
          <div className="mx-auto mt-5 space-y-3">
            <span className="mx-auto block h-1.5 w-[72%] rounded-full bg-slate-300/80" />
            <span className="mx-auto block h-1.5 w-[59%] rounded-full bg-slate-300/80" />
            <span className="mx-auto block h-1.5 w-[42%] rounded-full bg-slate-300/80" />
          </div>
          <div className="mx-auto mt-8 flex w-[210px] flex-col gap-3">
            <button
              type="button"
              onClick={onBookClick}
              className="rounded-full bg-primary py-3 text-xl font-black text-white shadow-[0_18px_42px_rgba(89,46,242,0.24)] transition hover:bg-[#4520d6] active:scale-95"
            >
              {localize(language, 'اطلب الآن', 'Book Now')}
            </button>
            <button
              type="button"
              onClick={onTrackClick}
              className="rounded-full border border-secondary bg-white/82 py-3 text-xl font-black text-secondary shadow-sm transition hover:border-primary hover:text-primary active:scale-95"
            >
              {localize(language, 'تتبع طلبك', 'Track Order')}
            </button>
          </div>
          <LaundryIcon
            name="outty-hero"
            alt=""
            className="pointer-events-none mx-auto mt-5 hidden h-24 w-24 rounded-3xl bg-white/80 p-1.5 shadow-2xl shadow-primary/10 xl:inline-flex"
            imageClassName="h-full w-full rounded-2xl object-contain"
          />
        </div>

        <div className="absolute left-[64%] top-[18%] z-10 w-[68%] -translate-x-1/2 text-center md:hidden" dir="ltr">
          <div className="text-[42px] font-black leading-[1.08] tracking-normal">
            <span className="text-primary">IN</span>
            <span className="text-secondary"> & </span>
            <span className="text-primary">OUT</span>
            <span className="block text-secondary">LAUNDRY</span>
          </div>
          <div className="mx-auto mt-5 flex w-[70%] flex-col gap-3">
            <button
              type="button"
              onClick={onBookClick}
              className="rounded-full bg-primary py-3 text-base font-black text-white shadow-[0_18px_42px_rgba(89,46,242,0.24)]"
            >
              {localize(language, 'اطلب الآن', 'Book Now')}
            </button>
            <button
              type="button"
              onClick={onTrackClick}
              className="rounded-full border border-secondary bg-white/88 py-3 text-base font-black text-secondary shadow-sm"
            >
              {localize(language, 'تتبع طلبك', 'Track Order')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
