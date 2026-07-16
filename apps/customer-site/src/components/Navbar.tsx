import React, { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  ChevronDown,
  Languages,
  Menu,
  Moon,
  Search,
  Shirt,
  Sparkles,
  Sun,
  Truck,
  User,
  X,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { SiteConfig } from '../types';
import { SiteLanguage, localize } from '../lib/i18n';
import { BrandLogo } from './BrandLogo';
import { Button } from './ui';
import { cn } from '../lib/utils';

interface NavbarProps {
  currentRoute: string;
  setRoute: (route: string) => void;
  user: any;
  config: SiteConfig;
  language: SiteLanguage;
  onLanguageChange: (language: SiteLanguage) => void;
  isDarkMode: boolean;
  onDarkModeChange: (value: boolean) => void;
}

type NavItem = {
  label: string;
  path: string;
  description?: string;
};

const serviceSlugs = [
  ['curtains', 'الستائر', 'Curtains'],
  ['carpets', 'السجاد', 'Carpets'],
  ['shoes', 'الأحذية', 'Shoes'],
  ['blankets', 'البطانيات', 'Blankets'],
  ['luxury-garments', 'الملابس الفاخرة', 'Luxury garments'],
  ['abaya-care', 'العناية بالعبايات', 'Abaya care'],
] as const;

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  setRoute,
  user,
  config: _config,
  language,
  onLanguageChange,
  isDarkMode,
  onDarkModeChange,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const rtl = language === 'ar';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = useMemo<NavItem[]>(
    () => [
      { label: localize(language, 'الأسعار', 'Pricing'), path: '/pricing' },
      { label: localize(language, 'الفروع', 'Branches'), path: '/branches' },
      { label: localize(language, 'المناطق', 'Areas'), path: '/areas' },
      { label: localize(language, 'تتبع الطلب', 'Track Order'), path: '/track' },
      { label: localize(language, 'تواصل معنا', 'Contact'), path: '/contact' },
    ],
    [language],
  );

  const megaColumns = useMemo(
    () => [
      {
        title: localize(language, 'خدمات الأفراد', 'Personal care'),
        items: serviceSlugs.map(([slug, ar, en]) => ({
          label: localize(language, ar, en),
          path: `/services/${slug}`,
          description: localize(language, 'عناية فاخرة مع فحص وترميز واضح.', 'Premium care with inspection and clear tagging.'),
        })),
      },
      {
        title: localize(language, 'تجاري', 'Commercial'),
        items: [
          { label: localize(language, 'الغسيل التجاري', 'Commercial laundry'), path: '/commercial', description: localize(language, 'حلول عقود للشركات والمؤسسات.', 'Contract-ready laundry for businesses.') },
          { label: localize(language, 'الفنادق', 'Hotels'), path: '/commercial/hotels', description: localize(language, 'حجم كبير وتسليم مضبوط.', 'High-volume linen and guest care.') },
          { label: localize(language, 'المطاعم', 'Restaurants'), path: '/commercial/restaurants', description: localize(language, 'مفارش، يونيفورم، ومواعيد ثابتة.', 'Uniforms, linens, and scheduled pickups.') },
        ],
      },
      {
        title: localize(language, 'المساعدة والثقة', 'Help and trust'),
        items: [
          { label: localize(language, 'تتبع الطلب', 'Order tracking'), path: '/track', description: localize(language, 'رحلة الطلب خطوة بخطوة.', 'Step-by-step order visibility.') },
          { label: localize(language, 'مناطق الخدمة', 'Service areas'), path: '/areas', description: localize(language, 'استلام وتوصيل حسب المنطقة.', 'Pickup and delivery by area.') },
          { label: localize(language, 'الأسئلة الشائعة', 'FAQ'), path: '/faq', description: localize(language, 'إجابات سريعة قبل الحجز.', 'Quick answers before booking.') },
          { label: localize(language, 'الشكاوى', 'Complaint'), path: '/complaint', description: localize(language, 'تذكرة واضحة ومتابعة شفافة.', 'Transparent ticket and resolution flow.') },
        ],
      },
    ],
    [language],
  );

  const navigate = (path: string) => {
    setRoute(path);
    setDrawerOpen(false);
    setMegaOpen(false);
  };

  const languageLabel = language === 'ar' ? 'English' : 'العربية';

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b transition duration-base motion-reduce:transition-none',
        isScrolled
          ? 'border-white/60 bg-white/68 shadow-glass backdrop-blur-3xl dark:border-white/10 dark:bg-surface/72'
          : 'border-transparent bg-background/62 backdrop-blur-2xl',
      )}
    >
      <nav className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8" aria-label={localize(language, 'التنقل الرئيسي', 'Primary navigation')}>
        <span className="sm:hidden">
          <BrandLogo language={language} compact onClick={() => navigate('/')} />
        </span>
        <span className="hidden sm:block">
          <BrandLogo language={language} onClick={() => navigate('/')} />
        </span>

        <div className="hidden items-center gap-1 lg:flex">
          <div
            className="relative"
            onMouseEnter={() => setMegaOpen(true)}
            onMouseLeave={() => setMegaOpen(false)}
          >
            <button
              type="button"
              onClick={() => setMegaOpen((open) => !open)}
              aria-expanded={megaOpen}
              aria-controls="public-mega-menu"
              className="flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-bold text-muted-foreground transition hover:bg-white/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {localize(language, 'الخدمات', 'Services')}
              <ChevronDown data-icon="inline-end" aria-hidden="true" className={cn('size-4 transition', megaOpen && 'rotate-180')} />
            </button>

            <AnimatePresence>
              {megaOpen ? (
                <motion.div
                  id="public-mega-menu"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
                  transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
                  className={cn(
                    'absolute top-full mt-3 w-[760px] rounded-[1.5rem] border border-white/70 bg-white/76 p-4 text-card-foreground shadow-high backdrop-blur-3xl dark:border-white/10 dark:bg-surface/86',
                    rtl ? 'right-0' : 'left-0',
                  )}
                >
                  <div className="grid grid-cols-3 gap-3">
                    {megaColumns.map((column) => (
                      <section key={column.title} className="rounded-[1.1rem] bg-[#F4F1FF]/80 p-3 dark:bg-white/[0.04]">
                        <h3 className="mb-2 font-mono text-xs font-bold uppercase tracking-[0.1em] text-primary">{column.title}</h3>
                        <div className="flex flex-col gap-1">
                          {column.items.map((item) => (
                            <button
                              key={item.path}
                              type="button"
                              onClick={() => navigate(item.path)}
                              className="rounded-lg p-3 text-start transition hover:bg-white hover:shadow-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none dark:hover:bg-surface"
                            >
                              <span className="block text-sm font-bold text-foreground">{item.label}</span>
                              <span className="mt-1 block text-xs leading-5 text-muted-foreground">{item.description}</span>
                            </button>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {navLinks.map((link) => (
            <button
              key={link.path}
              type="button"
              onClick={() => navigate(link.path)}
              className={cn(
                'min-h-11 rounded-md px-3 text-sm font-bold text-muted-foreground transition hover:bg-white/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                currentRoute === link.path && 'text-primary',
              )}
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onLanguageChange(language === 'ar' ? 'en' : 'ar')}
            className="hidden min-h-11 items-center gap-2 rounded-md border border-border bg-surface px-3 text-sm font-bold text-foreground shadow-low transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex"
            aria-label={localize(language, 'تغيير اللغة', 'Change language')}
          >
            <Languages aria-hidden="true" className="size-4" />
            <span dir="ltr">{languageLabel}</span>
          </button>

          <button
            type="button"
            onClick={() => onDarkModeChange(!isDarkMode)}
            className="hidden size-11 items-center justify-center rounded-md border border-border bg-surface text-foreground shadow-low transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex"
            aria-label={isDarkMode ? localize(language, 'تفعيل الوضع الفاتح', 'Switch to light mode') : localize(language, 'تفعيل الوضع الداكن', 'Switch to dark mode')}
          >
            {isDarkMode ? <Sun aria-hidden="true" className="size-4" /> : <Moon aria-hidden="true" className="size-4" />}
          </button>

          <Button variant="secondary" className="!hidden lg:!inline-flex" onClick={() => navigate(user ? '/dashboard' : '/auth')}>
            <User data-icon="inline-start" aria-hidden="true" />
            {user ? localize(language, 'حسابي', 'Account') : localize(language, 'دخول', 'Login')}
          </Button>
          <Button variant="accent" onClick={() => navigate('/book')}>
            <Truck data-icon="inline-start" aria-hidden="true" />
            {localize(language, 'احجز استلام', 'Book Pickup')}
          </Button>
          <button
            type="button"
            className="size-11 rounded-md border border-border bg-surface text-foreground shadow-low focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label={localize(language, 'فتح القائمة', 'Open menu')}
          >
            <Menu aria-hidden="true" className="mx-auto size-5" />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {drawerOpen ? (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              className="absolute inset-0 bg-secondary/55 backdrop-blur-sm"
              aria-label={localize(language, 'إغلاق القائمة', 'Close menu')}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              initial={shouldReduceMotion ? false : { x: rtl ? 320 : -320 }}
              animate={{ x: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { x: rtl ? 320 : -320 }}
              transition={{ duration: 0.32, ease: [0, 0, 0.2, 1] }}
              className={cn(
                'absolute top-0 flex h-full w-[min(88vw,390px)] flex-col overflow-y-auto border-border bg-background p-5 shadow-high',
                rtl ? 'right-0 border-l' : 'left-0 border-r',
              )}
              role="dialog"
              aria-modal="true"
              aria-label={localize(language, 'قائمة الموقع', 'Site menu')}
            >
              <div className="flex items-center justify-between gap-3">
                <BrandLogo language={language} compact onClick={() => navigate('/')} />
                <button
                  type="button"
                  className="size-11 rounded-md border border-border bg-surface text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => setDrawerOpen(false)}
                  aria-label={localize(language, 'إغلاق القائمة', 'Close menu')}
                >
                  <X aria-hidden="true" className="mx-auto size-5" />
                </button>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-2">
                <Button variant="secondary" onClick={() => onLanguageChange(language === 'ar' ? 'en' : 'ar')}>
                  <Languages data-icon="inline-start" aria-hidden="true" />
                  <span dir="ltr">{languageLabel}</span>
                </Button>
                <Button variant="secondary" onClick={() => onDarkModeChange(!isDarkMode)}>
                  {isDarkMode ? <Sun data-icon="inline-start" aria-hidden="true" /> : <Moon data-icon="inline-start" aria-hidden="true" />}
                  {isDarkMode ? localize(language, 'فاتح', 'Light') : localize(language, 'داكن', 'Dark')}
                </Button>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                {[{ label: localize(language, 'الرئيسية', 'Home'), path: '/' }, ...navLinks].map((link) => (
                  <button
                    key={link.path}
                    type="button"
                    onClick={() => navigate(link.path)}
                    className={cn(
                      'min-h-11 rounded-lg px-3 text-start text-base font-bold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      currentRoute === link.path ? 'bg-primary text-white' : 'hover:bg-muted',
                    )}
                  >
                    {link.label}
                  </button>
                ))}
              </div>

              <section className="mt-6 rounded-2xl border border-border bg-card p-4">
                <h2 className="flex items-center gap-2 text-sm font-black text-accent">
                  <Sparkles aria-hidden="true" className="size-4" />
                  {localize(language, 'الخدمات', 'Services')}
                </h2>
                <div className="mt-3 grid gap-1">
                  {serviceSlugs.map(([slug, ar, en]) => (
                    <button
                      key={slug}
                      type="button"
                      onClick={() => navigate(`/services/${slug}`)}
                      className="flex min-h-11 items-center gap-3 rounded-lg px-2 text-start text-sm font-bold hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Shirt aria-hidden="true" className="size-4 text-primary" />
                      {localize(language, ar, en)}
                    </button>
                  ))}
                </div>
              </section>

              {megaColumns.slice(1).map((column) => (
                <section key={column.title} className="mt-4 rounded-2xl border border-border bg-card p-4">
                  <h2 className="flex items-center gap-2 text-sm font-black text-accent">
                    <Building2 aria-hidden="true" className="size-4" />
                    {column.title}
                  </h2>
                  <div className="mt-3 grid gap-1">
                    {column.items.map((item) => (
                      <button
                        key={item.path}
                        type="button"
                        onClick={() => navigate(item.path)}
                        className="min-h-11 rounded-lg px-2 text-start text-sm font-bold hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span className="block">{item.label}</span>
                        <span className="mt-0.5 block text-xs font-semibold leading-5 text-muted-foreground">{item.description}</span>
                      </button>
                    ))}
                  </div>
                </section>
              ))}

              <div className="mt-auto grid gap-2 pt-6">
                <Button variant="accent" size="lg" onClick={() => navigate('/book')}>
                  <Truck data-icon="inline-start" aria-hidden="true" />
                  {localize(language, 'احجز استلام', 'Book pickup')}
                </Button>
                <Button variant="secondary" size="lg" onClick={() => navigate('/track')}>
                  <Search data-icon="inline-start" aria-hidden="true" />
                  {localize(language, 'تتبع طلبك', 'Track order')}
                </Button>
              </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
};
