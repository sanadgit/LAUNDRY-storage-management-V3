/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { JourneySection } from './components/JourneySection';
import { ServicesGrid, BranchesSection, GallerySection, PricingSection } from './components/CommonSections';
import { Footer } from './components/Footer';
import { PublicHome } from './components/PublicHome';
import { PublicPickup } from './components/PublicPickup';
import { PublicTracking } from './components/PublicTracking';
import { PublicServiceDetails, PublicServicesOverview } from './components/PublicServices';
import { PublicBranches } from './components/PublicBranches';
import { PublicComplaint } from './components/PublicComplaint';
import { PublicStaticPage } from './components/PublicStaticPage';
import { PublicAreaDetails, PublicAreasOverview } from './components/PublicAreaPages';
import { CustomerPortal } from './components/CustomerPortal';
import { AuthWizard } from './components/AuthWizard';
import { Contact } from './components/Contact';
import { OperationsPlatform } from './components/OperationsPlatform';
import { PosTerminal } from './components/PosTerminal';
import { AIOperationsDashboard } from './components/AIOperationsDashboard';
import { ReportsDashboard } from './components/ReportsDashboard';
import { AdminAccessGate } from './components/AdminAccessGate';
import { DriverAccessGate } from './components/DriverAccessGate';
import { DriverPanel } from './components/DriverPanel';
import { LegalPage } from './components/LegalPages';
import { PublicFloatingActions } from './components/PublicFloatingActions';
import { INITIAL_SITE_CONFIG } from './constants';
import { AdminAuthResponse, AdminUser, CustomerAuthResponse, CustomerUser, DriverAuthResponse, DriverAuthUser, Order, SiteConfig, OrderStatus } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Settings } from 'lucide-react';
import { normalizeOrders, normalizeOrderStatus } from './lib/orders';
import { customerApi } from './lib/customerApi';
import { adminApi } from './lib/adminApi';
import { driverApi } from './lib/driverApi';
import { SiteLanguage, localize } from './lib/i18n';

const ROUTES = new Set([
  '/',
  '/about',
  '/track',
  '/dashboard',
  '/portal',
  '/auth',
  '/services',
  '/services/wash-iron',
  '/services/dry-cleaning',
  '/services/kandoora',
  '/services/curtains',
  '/services/carpets',
  '/services/shoes',
  '/services/blankets',
  '/services/luxury-garments',
  '/services/abaya-care',
  '/branches',
  '/areas',
  '/areas/alfalah',
  '/areas/mussaffah',
  '/areas/mbz',
  '/areas/shamkha',
  '/areas/baniyas',
  '/areas/khalifa_city',
  '/areas/musaffah_industrial',
  '/areas/al_tawahi',
  '/areas/al_wahda',
  '/areas/al_khalidiya',
  '/areas/al_reem',
  '/areas/al_muroor',
  '/areas/shakhbout',
  '/areas/riyadh_city',
  '/areas/al_mufraj',
  '/areas/al_wathba',
  '/areas/al_reef',
  '/areas/yas_island',
  '/pricing',
  '/commercial',
  '/commercial/hotels',
  '/commercial/restaurants',
  '/faq',
  '/reviews',
  '/gallery',
  '/blog',
  '/blog/details',
  '/offers',
  '/care-guides',
  '/care-guides/details',
  '/contact',
  '/complaint',
  '/complaints',
  '/careers',
  '/book',
  '/admin',
  '/pos',
  '/ai-dashboard',
  '/reports',
  '/driver',
  '/privacy',
  '/terms',
  '/404',
]);

const normalizeRoute = (value: string) => {
  const route = String(value || '/').trim();
  if (!route || route === '/') return '/';
  return ROUTES.has(route) ? route : '/404';
};

const normalizeTrackingReference = (value: unknown) =>
  String(value ?? '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

const orderMatchesTrackingQuery = (order: Order, query: string) => {
  const normalizedQuery = normalizeTrackingReference(query);
  if (!normalizedQuery) return false;
  return [
    order.id,
    order.systemOrderId,
    order.posOrderNo,
    order.pos?.order_no,
    order.pos?.system_order_id,
    order.pos?.source_orders_id,
    order.pos?.invoice_no,
  ].some((value) => normalizeTrackingReference(value) === normalizedQuery);
};

const getRouteFromLocation = () => {
  if (typeof window === 'undefined') return '/';
  return normalizeRoute(window.location.pathname);
};

const setMetaTag = (name: string, content: string, attribute: 'name' | 'property' = 'name') => {
  if (typeof document === 'undefined') return;
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const upsertJsonLd = (id: string, data: unknown) => {
  if (typeof document === 'undefined') return;
  let tag = document.getElementById(id) as HTMLScriptElement | null;
  if (!tag) {
    tag = document.createElement('script');
    tag.id = id;
    tag.type = 'application/ld+json';
    document.head.appendChild(tag);
  }
  tag.textContent = JSON.stringify(data);
};

const removeJsonLd = (id: string) => {
  if (typeof document === 'undefined') return;
  document.getElementById(id)?.remove();
};

const areaNameForSeo: Record<string, { ar: string; en: string }> = {
  alfalah: { ar: 'الفلاح', en: 'Al Falah' },
  mussaffah: { ar: 'المصفح', en: 'Mussaffah' },
  mbz: { ar: 'مدينة محمد بن زايد', en: 'Mohammed Bin Zayed City' },
  shamkha: { ar: 'الشامخة', en: 'Al Shamkha' },
  baniyas: { ar: 'بني ياس', en: 'Baniyas' },
  khalifa_city: { ar: 'مدينة خليفة', en: 'Khalifa City' },
  musaffah_industrial: { ar: 'مصفح الصناعية', en: 'Mussaffah Industrial' },
  al_tawahi: { ar: 'التواهي', en: 'Al Tawahi' },
  al_wahda: { ar: 'الوحدة', en: 'Al Wahda' },
  al_khalidiya: { ar: 'الخالدية', en: 'Al Khalidiya' },
  al_reem: { ar: 'الريم', en: 'Al Reem' },
  al_muroor: { ar: 'المُرور', en: 'Al Muroor' },
  shakhbout: { ar: 'شخبوط', en: 'Shakhbout' },
  riyadh_city: { ar: 'مدينة الرياض', en: 'Riyadh City' },
  al_mufraj: { ar: 'المفراج', en: 'Al Mufraj' },
  al_wathba: { ar: 'الوثبة', en: 'Al Wathba' },
  al_reef: { ar: 'الريف', en: 'Al Reef' },
  yas_island: { ar: 'جزيرة ياس', en: 'Yas Island' },

};

const pageSeo = (route: string, config: SiteConfig, language: SiteLanguage) => {
  const t = (ar: string, en: string) => localize(language, ar, en);
  const siteName = config.site_name || 'In & Out Laundry';
  const defaultDescription = t(
    'مصبغة In & Out في أبوظبي للحجز، الاستلام، التوصيل، التتبع، وخدمة العملاء الذكية.',
    'In & Out Laundry in Abu Dhabi for booking, pickup, delivery, tracking, and smart customer care.',
  );

  if (route === '/') return {
    title: t('In & Out Laundry | مصبغة في أبوظبي مع استلام وتوصيل', 'In & Out Laundry | Abu Dhabi pickup and delivery laundry'),
    description: defaultDescription,
  };
  if (route.startsWith('/services/')) return {
    title: `${t('خدمات المغسلة', 'Laundry services')} | ${siteName}`,
    description: t('غسيل وكي، تنظيف جاف، كندورة وغترة، عبايات، بطانيات، ستائر، وسجاد مع تتبع واضح.', 'Wash and press, dry cleaning, kandoora and ghutra, abayas, blankets, curtains, and carpets with clear tracking.'),
  };
  if (route === '/services') return {
    title: `${t('كل خدمات المغسلة', 'All laundry services')} | ${siteName}`,
    description: t('استعرض خدمات In & Out Laundry للأفراد والشركات مع رحلة حجز وتتبع واضحة.', 'Explore In & Out Laundry services for individuals and businesses with clear booking and tracking.'),
  };
  if (route === '/pricing') return {
    title: `${t('أسعار المغسلة', 'Laundry prices')} | ${siteName}`,
    description: t('قائمة أسعار الغسيل والكوي والتنظيف الجاف حسب نوع القطعة والخدمة.', 'Laundry, press, and dry-cleaning prices by item and service.'),
  };
  if (route === '/branches') return {
    title: `${t('فروع مغسلة In & Out', 'In & Out Laundry branches')} | ${siteName}`,
    description: t('فروع ومناطق خدمة In & Out Laundry في أبوظبي مع خرائط واتساب وحجز استلام.', 'In & Out Laundry branches and service areas in Abu Dhabi with maps, WhatsApp, and pickup booking.'),
  };
  if (route === '/areas') return {
    title: `${t('مناطق خدمة المغسلة في أبوظبي', 'Laundry service areas in Abu Dhabi')} | ${siteName}`,
    description: t('استلام وتوصيل مغسلة In & Out في الفلاح، المصفح، محمد بن زايد، الشامخة، بني ياس، ومدينة خليفة.', 'In & Out Laundry pickup and delivery in Al Falah, Mussaffah, MBZ, Al Shamkha, Baniyas, and Khalifa City.'),
  };
  if (route.startsWith('/areas/')) {
    const id = route.replace('/areas/', '');
    const area = areaNameForSeo[id];
    const name = area ? localize(language, area.ar, area.en) : id;
    return {
      title: t(`مغسلة في ${name} | استلام وتوصيل`, `Laundry in ${name} | Pickup and delivery`),
      description: t(`خدمة مغسلة In & Out في ${name}: حجز استلام، توصيل، أسعار واضحة، وتتبع الطلب.`, `In & Out Laundry service in ${name}: pickup booking, delivery, clear pricing, and order tracking.`),
    };
  }
  if (route === '/faq') return {
    title: `${t('الأسئلة الشائعة', 'FAQ')} | ${siteName}`,
    description: t('إجابات عن الحجز، التتبع، الأسعار، الاستلام، والتوصيل.', 'Answers about booking, tracking, prices, pickup, and delivery.'),
  };
  return {
    title: `${siteName} | ${t('مصبغة فاخرة في أبوظبي', 'Premium laundry in Abu Dhabi')}`,
    description: defaultDescription,
  };
};

const buildLocalBusinessSchema = (config: SiteConfig, origin: string) => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${origin}/#localbusiness`,
  name: config.site_name || 'In & Out Laundry',
  image: `${origin}/brand/logo-in-and-out-laundry.png`,
  url: origin,
  telephone: config.whatsapp_number,
  email: config.contact_email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: config.business_address,
    addressLocality: 'Abu Dhabi',
    addressCountry: 'AE',
  },
  areaServed: config.service_areas.filter((area) => area.active !== false).map((area) => area.name),
  branchOf: {
    '@type': 'Organization',
    name: config.site_name || 'In & Out Laundry',
  },
  department: config.branches.map((branch) => ({
    '@type': 'LocalBusiness',
    name: branch.name,
    address: branch.address,
    telephone: branch.phone,
    openingHours: branch.hours,
    geo: {
      '@type': 'GeoCoordinates',
      latitude: branch.coordinates.lat,
      longitude: branch.coordinates.lng,
    },
  })),
});

const buildFaqSchema = (language: SiteLanguage) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: localize(language, 'هل يمكن تتبع الطلب؟', 'Can I track my order?'),
      acceptedAnswer: {
        '@type': 'Answer',
        text: localize(language, 'نعم، يمكنك تتبع الطلب من صفحة التتبع باستخدام رقم الطلب.', 'Yes, you can track the order from the tracking page using the order ID.'),
      },
    },
    {
      '@type': 'Question',
      name: localize(language, 'هل يوجد استلام وتوصيل؟', 'Do you offer pickup and delivery?'),
      acceptedAnswer: {
        '@type': 'Answer',
        text: localize(language, 'نعم، حسب المناطق النشطة والفروع المتاحة في أبوظبي.', 'Yes, based on active service areas and available branches in Abu Dhabi.'),
      },
    },
    {
      '@type': 'Question',
      name: localize(language, 'كيف أعرف الأسعار؟', 'How can I see prices?'),
      acceptedAnswer: {
        '@type': 'Answer',
        text: localize(language, 'يمكنك مراجعة صفحة الأسعار أو التواصل عبر واتساب لتقدير حسب نوع القطعة.', 'You can view the pricing page or contact WhatsApp for an estimate by item type.'),
      },
    },
  ],
});

const CUSTOMER_AUTH_TOKEN_KEY = 'io_customer_auth_token';
const CUSTOMER_AUTH_USER_KEY = 'io_customer_auth_user';
const ADMIN_AUTH_TOKEN_KEY = 'io_admin_auth_token';
const ADMIN_AUTH_USER_KEY = 'io_admin_auth_user';
const DRIVER_AUTH_TOKEN_KEY = 'io_driver_auth_token';
const DRIVER_AUTH_USER_KEY = 'io_driver_auth_user';
const SITE_LANGUAGE_KEY = 'io_site_language';
const SITE_DARK_MODE_KEY = 'io_site_dark_mode';

const mergeById = <T extends { id: string | number }>(defaults: T[], saved?: T[]): T[] => {
  const merged = new Map<string | number, T>(defaults.map((item) => [item.id, item]));
  saved?.forEach((item) => {
    merged.set(item.id, { ...(merged.get(item.id) || {}), ...item });
  });
  return Array.from(merged.values());
};

const normalizeSiteConfig = (config?: Partial<SiteConfig> | null): SiteConfig => {
  if (!config) return INITIAL_SITE_CONFIG;

  const mergedPricing = [...INITIAL_SITE_CONFIG.pricing];
  config.pricing?.forEach((savedItem) => {
    const idx = mergedPricing.findIndex((item) => item.barcode === savedItem.barcode);
    if (idx !== -1) {
      mergedPricing[idx] = { ...mergedPricing[idx], ...savedItem };
    } else {
      mergedPricing.push(savedItem);
    }
  });

  return {
    ...INITIAL_SITE_CONFIG,
    ...config,
    hero: { ...INITIAL_SITE_CONFIG.hero, ...(config.hero || {}) },
    social_media: { ...INITIAL_SITE_CONFIG.social_media, ...(config.social_media || {}) },
    ai_settings: { ...INITIAL_SITE_CONFIG.ai_settings, ...(config.ai_settings || {}) },
    pricing: mergedPricing,
    service_areas: mergeById(INITIAL_SITE_CONFIG.service_areas, config.service_areas),
    branches: mergeById(INITIAL_SITE_CONFIG.branches, config.branches),
    drivers: mergeById(INITIAL_SITE_CONFIG.drivers, config.drivers),
    pickup_days: mergeById(INITIAL_SITE_CONFIG.pickup_days, config.pickup_days),
    time_slots: mergeById(INITIAL_SITE_CONFIG.time_slots, config.time_slots),
    payment_methods: mergeById(INITIAL_SITE_CONFIG.payment_methods, config.payment_methods),
    service_options: mergeById(INITIAL_SITE_CONFIG.service_options, config.service_options),
    offers: mergeById(INITIAL_SITE_CONFIG.offers, config.offers),
    gallery: mergeById(INITIAL_SITE_CONFIG.gallery, config.gallery),
  };
};

export default function App() {
  const [route, setRouteState] = useState(getRouteFromLocation);
  const [language, setLanguage] = useState<SiteLanguage>(() => {
    const saved = localStorage.getItem(SITE_LANGUAGE_KEY);
    return saved === 'ar' ? 'ar' : 'en';
  });
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem(SITE_DARK_MODE_KEY) === 'true');
  const [searchOrder, setSearchOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('io_orders');
    const initial = saved ? JSON.parse(saved) : [];
    return normalizeOrders(initial);
  });
  const [user, setUser] = useState<CustomerUser | null>(() => {
    const saved = localStorage.getItem(CUSTOMER_AUTH_USER_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved) as CustomerUser;
    } catch {
      return null;
    }
  });
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem(CUSTOMER_AUTH_TOKEN_KEY));
  const [authReady, setAuthReady] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem(ADMIN_AUTH_TOKEN_KEY));
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem(ADMIN_AUTH_USER_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved) as AdminUser;
    } catch {
      return null;
    }
  });
  const [adminReady, setAdminReady] = useState(false);
  const [driverToken, setDriverToken] = useState<string | null>(() => localStorage.getItem(DRIVER_AUTH_TOKEN_KEY));
  const [driverUser, setDriverUser] = useState<DriverAuthUser | null>(() => {
    const saved = localStorage.getItem(DRIVER_AUTH_USER_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved) as DriverAuthUser;
    } catch {
      return null;
    }
  });
  const [driverReady, setDriverReady] = useState(false);
  const [loadedRemoteData, setLoadedRemoteData] = useState(false);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    const saved = localStorage.getItem('io_site_config');
    if (!saved) return INITIAL_SITE_CONFIG;
    
    return normalizeSiteConfig(JSON.parse(saved) as SiteConfig);
  });

  // Persist state
  const setRoute = (nextRoute: string) => {
    const normalized = normalizeRoute(nextRoute);
    if (typeof window !== 'undefined') {
      if (window.location.pathname !== normalized) {
        window.history.pushState({}, '', normalized);
      }
    }
    setRouteState(normalized);
  };

  useEffect(() => {
    const onPopState = () => setRouteState(getRouteFromLocation());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    customerApi.setAuthToken(authToken);
    if (authToken) {
      localStorage.setItem(CUSTOMER_AUTH_TOKEN_KEY, authToken);
    } else {
      localStorage.removeItem(CUSTOMER_AUTH_TOKEN_KEY);
    }
  }, [authToken]);

  useEffect(() => {
    localStorage.setItem(SITE_LANGUAGE_KEY, language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  useEffect(() => {
    localStorage.setItem(SITE_DARK_MODE_KEY, String(isDarkMode));
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(CUSTOMER_AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CUSTOMER_AUTH_USER_KEY);
    }
  }, [user]);

  useEffect(() => {
    if (adminToken) {
      localStorage.setItem(ADMIN_AUTH_TOKEN_KEY, adminToken);
    } else {
      localStorage.removeItem(ADMIN_AUTH_TOKEN_KEY);
    }
  }, [adminToken]);

  useEffect(() => {
    if (adminUser) {
      localStorage.setItem(ADMIN_AUTH_USER_KEY, JSON.stringify(adminUser));
    } else {
      localStorage.removeItem(ADMIN_AUTH_USER_KEY);
    }
  }, [adminUser]);

  useEffect(() => {
    if (driverToken) {
      localStorage.setItem(DRIVER_AUTH_TOKEN_KEY, driverToken);
    } else {
      localStorage.removeItem(DRIVER_AUTH_TOKEN_KEY);
    }
  }, [driverToken]);

  useEffect(() => {
    if (driverUser) {
      localStorage.setItem(DRIVER_AUTH_USER_KEY, JSON.stringify(driverUser));
    } else {
      localStorage.removeItem(DRIVER_AUTH_USER_KEY);
    }
  }, [driverUser]);

  useEffect(() => {
    let cancelled = false;

    const hydrateSession = async () => {
      if (!authToken) {
        if (!cancelled) setUser(null);
        if (!cancelled) setAuthReady(true);
        return;
      }

      try {
        const activeUser = await customerApi.getSession();
        if (cancelled) return;
        setUser(activeUser);
      } catch {
        if (cancelled) return;
        setUser(null);
        setAuthToken(null);
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    };

    void hydrateSession();

    return () => {
      cancelled = true;
    };
  }, [authToken]);

  useEffect(() => {
    let cancelled = false;

    const hydrateAdminSession = async () => {
      if (!adminToken) {
        if (!cancelled) setAdminUser(null);
        if (!cancelled) setAdminReady(true);
        return;
      }

      try {
        const userSession = await adminApi.getSession(adminToken);
        if (cancelled) return;
        const role = String(userSession.role ?? '').toLowerCase();
        if (role !== 'admin' && role !== 'super-admin') {
          setAdminUser(null);
          setAdminToken(null);
          return;
        }
        setAdminUser(userSession);
      } catch {
        if (cancelled) return;
        setAdminUser(null);
        setAdminToken(null);
      } finally {
        if (!cancelled) setAdminReady(true);
      }
    };

    void hydrateAdminSession();

    return () => {
      cancelled = true;
    };
  }, [adminToken]);

  useEffect(() => {
    let cancelled = false;

    const hydrateDriverSession = async () => {
      if (!driverToken) {
        if (!cancelled) setDriverUser(null);
        if (!cancelled) setDriverReady(true);
        return;
      }

      try {
        const activeDriver = await driverApi.getSession(driverToken);
        if (cancelled) return;
        setDriverUser(activeDriver);
      } catch {
        if (cancelled) return;
        setDriverUser(null);
        setDriverToken(null);
      } finally {
        if (!cancelled) setDriverReady(true);
      }
    };

    void hydrateDriverSession();

    return () => {
      cancelled = true;
    };
  }, [driverToken]);

  useEffect(() => {
    let cancelled = false;

    const loadRemote = async () => {
      try {
        setLoadedRemoteData(false);

        const canLoad = Boolean(adminToken || driverToken || authToken);
        if (!canLoad) return;

        const fetchOrders = adminToken
          ? adminApi.getOrders(adminToken)
          : driverToken
            ? driverApi.getOrders(driverToken)
            : customerApi.getOrders();

        const fetchConfig = adminToken
          ? adminApi.getSiteConfig(adminToken)
          : customerApi.getSiteConfig();

        const [remoteOrders, remoteConfig] = await Promise.all([
          fetchOrders.catch(() => null),
          fetchConfig.catch(() => null),
        ]);

        if (cancelled) return;

        if (Array.isArray(remoteOrders)) {
          setOrders(normalizeOrders(remoteOrders));
        }

        if (remoteConfig && typeof remoteConfig === 'object') setSiteConfig(normalizeSiteConfig(remoteConfig));
      } finally {
        if (!cancelled) setLoadedRemoteData(true);
      }
    };

    void loadRemote();

    return () => {
      cancelled = true;
    };
  }, [authToken, adminToken, driverToken]);

  useEffect(() => {
    if ((route === '/dashboard' || route === '/portal') && authReady && !user) {
      setRoute('/auth');
    }
    if (route === '/auth' && authReady && user) {
      setRoute('/dashboard');
    }
  }, [route, user, authReady]);

  useEffect(() => {
    localStorage.setItem('io_site_config', JSON.stringify(siteConfig));
  }, [siteConfig]);

  useEffect(() => {
    localStorage.setItem('io_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const seo = pageSeo(route, siteConfig, language);
    const origin = window.location.origin;
    const canonicalUrl = `${origin}${route === '/' ? '/' : route}`;

    document.title = seo.title;
    setMetaTag('description', seo.description);
    setMetaTag('og:title', seo.title, 'property');
    setMetaTag('og:description', seo.description, 'property');
    setMetaTag('og:type', 'website', 'property');
    setMetaTag('og:url', canonicalUrl, 'property');
    setMetaTag('og:image', `${origin}/brand/logo-in-and-out-laundry.png`, 'property');
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', seo.title);
    setMetaTag('twitter:description', seo.description);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    upsertJsonLd('local-business-schema', buildLocalBusinessSchema(siteConfig, origin));
    if (route === '/faq') {
      upsertJsonLd('faq-schema', buildFaqSchema(language));
    } else {
      removeJsonLd('faq-schema');
    }
  }, [route, siteConfig, language]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  useEffect(() => {
    if (route !== '/track') return;
    if (typeof window === 'undefined') return;
    if (!user) {
      setSearchOrder(null);
      return;
    }
    const ticketId = new URLSearchParams(window.location.search).get('id');
    if (!ticketId) return;
    const found = orders.find((order) => orderMatchesTrackingQuery(order, ticketId));
    setSearchOrder(found || null);
  }, [route, orders, user]);

  const handleSearch = (id: string) => {
    const normalizedId = String(id ?? '').trim();
    const found = user ? orders.find((order) => orderMatchesTrackingQuery(order, normalizedId)) : null;
    setSearchOrder(found || null);
    if (typeof window !== 'undefined') {
      const nextUrl = normalizedId ? `/track?id=${encodeURIComponent(normalizedId)}` : '/track';
      window.history.pushState({}, '', nextUrl);
      setRouteState('/track');
      return;
    }
    if (route !== '/track') setRoute('/track');
  };

  const handleNewOrder = async (newOrder: Order) => {
    const normalized = normalizeOrders([newOrder])[0];
    if (!normalized) throw new Error(localize(language, 'تعذر تجهيز بيانات الطلب.', 'Could not prepare order data.'));
    try {
      const createdOrder = authToken
        ? await customerApi.createOrder(normalized)
        : await customerApi.createPublicPickupOrder(normalized);
      const created = normalizeOrders([createdOrder])[0];
      if (!created) throw new Error(localize(language, 'تعذر حفظ الطلب في النظام.', 'Could not save the order in the system.'));
      setOrders((prev) => [created, ...prev.filter((order) => order.id !== created.id)]);
      return created;
    } catch (error) {
      console.warn('Falling back to local public order storage.', error);
      setOrders((prev) => [normalized, ...prev.filter((order) => order.id !== normalized.id)]);
      return normalized;
    }
  };

  const handleSyncOrderWithPos = async (orderId: string) => {
    const syncedOrder = await customerApi.syncOrderWithPos(orderId);
    const synced = normalizeOrders([syncedOrder])[0];
    if (!synced) throw new Error(localize(language, 'تعذر مزامنة الطلب مع POS.', 'Could not sync the order with POS.'));
    setOrders((prev) => prev.map((order) => (order.id === synced.id ? synced : order)));
    return synced;
  };

  const handleTrackOrderFromPortal = (order: Order) => {
    setSearchOrder(order);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', `/track?id=${encodeURIComponent(order.id)}`);
      setRouteState('/track');
      return;
    }
    setRoute('/track');
  };

  const handleReorderFromPortal = (order: Order) => {
    localStorage.setItem('io_reorder_template', JSON.stringify({
      sourceOrderId: order.id,
      serviceType: order.serviceType,
      branch: order.branch,
      deliveryAddress: order.deliveryAddress,
      pickupSlot: order.pickupSlot,
      items: order.items || [],
    }));
    setRoute('/book');
  };

  const handleSupportFromPortal = (order?: Order) => {
    if (order) {
      localStorage.setItem('io_support_context', JSON.stringify({
        orderId: order.id,
        serviceType: order.serviceType,
        branch: order.branch,
        status: order.status,
      }));
    }
    setRoute('/complaint');
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: normalizeOrderStatus(status),
            }
          : order
      )
    );
    if (adminToken) {
      void adminApi.updateOrderStatus(adminToken, orderId, status).catch(() => {
        // Keep local state resilient when API is temporarily unavailable.
      });
      return;
    }
    if (driverToken) {
      void driverApi.updateOrderStatus(driverToken, orderId, status).catch(() => {
        // Keep local state resilient when API is temporarily unavailable.
      });
      return;
    }
    // Customer sessions cannot modify operational statuses.
    return;
  };

  const handleOrdersChange = (nextOrders: Order[]) => {
    const normalized = normalizeOrders(nextOrders);
    setOrders(normalized);
    if (!adminToken) return;
    void Promise.all(normalized.map((order) => adminApi.upsertOrder(adminToken, order))).catch(() => {
      // Keep local state resilient when API is temporarily unavailable.
    });
  };

  const handleSiteConfigChange = (nextConfig: SiteConfig) => {
    setSiteConfig(nextConfig);
    if (!adminToken) return;
    void adminApi.updateSiteConfig(adminToken, nextConfig).catch(() => {
      // Keep local state resilient when API is temporarily unavailable.
    });
  };

  const handleCustomerAuthSuccess = (result: CustomerAuthResponse) => {
    setUser(result.user);
    setAuthToken(result.token);
    setRoute('/dashboard');
  };

  const handleCustomerSendOtp = async (payload: {
    phone: string;
    purpose: 'register' | 'login';
    channel: 'sms' | 'whatsapp';
  }) => {
    return customerApi.sendOtp(payload);
  };

  const handleCustomerVerifyOtp = async (payload: { challengeId: string; code: string }) => {
    return customerApi.verifyOtp(payload);
  };

  const handleCustomerLoginWithOtp = async (payload: { phone: string; verificationToken: string }) => {
    const result = await customerApi.loginWithOtp(payload);
    handleCustomerAuthSuccess(result);
  };

  const handleCustomerRegister = async (payload: {
    name: string;
    phone?: string;
    email?: string;
    password?: string;
    verificationToken?: string;
    type?: string;
    area?: string;
    prefService?: number;
    notifType?: string;
  }) => {
    const result = await customerApi.register(payload);
    handleCustomerAuthSuccess(result);
  };

  const handleCustomerLogout = async () => {
    try {
      await customerApi.logout();
    } catch {
      // Logout should still clear local session even if server call fails.
    } finally {
      setUser(null);
      setAuthToken(null);
      setRoute('/');
    }
  };

  const handleAdminAuthSuccess = (result: AdminAuthResponse) => {
    const role = String(result.user?.role ?? '').toLowerCase();
    if (role !== 'admin' && role !== 'super-admin') {
      throw new Error('Admin permissions are required.');
    }
    setAdminUser(result.user);
    setAdminToken(result.token);
  };

  const handleAdminLogin = async (payload: { username: string; password: string }) => {
    const result = await adminApi.login(payload);
    handleAdminAuthSuccess(result);
  };

  const handleAdminLogout = async () => {
    try {
      if (adminToken) await adminApi.logout(adminToken);
    } catch {
      // Logout should still clear local admin session even if server call fails.
    } finally {
      setAdminUser(null);
      setAdminToken(null);
      setRoute('/');
    }
  };

  const handleDriverAuthSuccess = (result: DriverAuthResponse) => {
    setDriverUser(result.driver);
    setDriverToken(result.token);
  };

  const handleDriverLogin = async (payload: { driverId: string; phone: string }) => {
    const result = await driverApi.login(payload);
    handleDriverAuthSuccess(result);
  };

  const handleDriverLogout = async () => {
    try {
      if (driverToken) await driverApi.logout(driverToken);
    } catch {
      // Logout should still clear local driver session even if server call fails.
    } finally {
      setDriverUser(null);
      setDriverToken(null);
      setRoute('/');
    }
  };

  const renderPage = () => {
    if (siteConfig.maintenance_mode && route !== '/admin' && route !== '/auth') {
      return (
        <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 text-primary animate-pulse">
             <Settings size={40} />
          </div>
          <h1 className="text-3xl font-black text-white italic mb-4">
            {localize(language, 'الموقع تحت الصيانة', 'Website Under Maintenance')}
          </h1>
          <p className="text-primary/60 text-sm max-w-xs">
            {localize(language, 'نحن بصدد إجراء بعض التحسينات السريعة. سنعود إليكم قريباً بمظهر جديد وخدمة أفضل.', 'We are making quick improvements and will be back shortly.')}
          </p>
          <button onClick={() => setRoute('/admin')} className="mt-8 text-[10px] font-bold text-white/20 hover:text-white uppercase tracking-widest">Admin Access</button>
        </div>
      );
    }

    switch (route) {
      case '/':
        return <PublicHome config={siteConfig} language={language} setRoute={setRoute} />;
      case '/track':
        return <PublicTracking order={searchOrder} orders={orders} onSearch={handleSearch} language={language} config={siteConfig} isAuthenticated={Boolean(user)} />;
      case '/dashboard':
      case '/portal':
        if (!authReady) return null;
        if (!user) return null;
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CustomerPortal
              user={user}
              orders={orders}
              pricing={siteConfig.pricing}
              onNewOrderClick={() => setRoute('/book')}
              onReorderClick={handleReorderFromPortal}
              onTrackOrderClick={handleTrackOrderFromPortal}
              onSupportClick={handleSupportFromPortal}
              onLogout={handleCustomerLogout}
              onSyncOrderWithPos={handleSyncOrderWithPos}
              language={language}
            />
          </motion.div>
        );
      case '/auth':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-24 pb-20 md:pt-32 min-h-screen bg-brand-bg px-4"
          >
            <AuthWizard
              onSendOtp={handleCustomerSendOtp}
              onVerifyOtp={handleCustomerVerifyOtp}
              onLoginWithOtp={handleCustomerLoginWithOtp}
              onRegister={handleCustomerRegister}
              language={language}
            />
          </motion.div>
        );
      case '/services':
        return <PublicServicesOverview config={siteConfig} language={language} setRoute={setRoute} />;
      case '/services/wash-iron':
      case '/services/dry-cleaning':
      case '/services/kandoora':
      case '/services/curtains':
      case '/services/carpets':
      case '/services/shoes':
      case '/services/blankets':
      case '/services/luxury-garments':
      case '/services/abaya-care':
        return <PublicServiceDetails config={siteConfig} language={language} setRoute={setRoute} slug={route.replace('/services/', '')} />;
      case '/branches':
        return <PublicBranches config={siteConfig} language={language} setRoute={setRoute} />;
      case '/areas':
        return <PublicAreasOverview config={siteConfig} language={language} setRoute={setRoute} />;
      case '/areas/alfalah':
      case '/areas/mussaffah':
      case '/areas/mbz':
      case '/areas/shamkha':
      case '/areas/baniyas':
      case '/areas/khalifa_city':
      case '/areas/musaffah_industrial':
        return <PublicAreaDetails config={siteConfig} language={language} setRoute={setRoute} areaId={route.replace('/areas/', '')} />;
      case '/about':
      case '/pricing':
      case '/commercial':
      case '/commercial/hotels':
      case '/commercial/restaurants':
      case '/faq':
      case '/reviews':
      case '/gallery':
      case '/blog':
      case '/blog/details':
      case '/offers':
      case '/care-guides':
      case '/care-guides/details':
      case '/careers':
      case '/404':
        return <PublicStaticPage route={route} config={siteConfig} language={language} setRoute={setRoute} />;
      case '/contact':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-24 pb-20 md:pt-32 min-h-screen bg-brand-bg px-4"
          >
            <Contact config={siteConfig} language={language} />
          </motion.div>
        );
      case '/complaint':
      case '/complaints':
        return <PublicComplaint config={siteConfig} language={language} setRoute={setRoute} />;
      case '/book':
        return <PublicPickup config={siteConfig} language={language} onOrderSuccess={handleNewOrder} setRoute={setRoute} />;
      case '/admin':
        if (!adminReady) return null;
        if (!adminUser || !adminToken) {
          return <AdminAccessGate onLogin={handleAdminLogin} language={language} />;
        }
        return (
          <OperationsPlatform 
            config={siteConfig}
            onConfigChange={handleSiteConfigChange}
            orders={orders}
            onOrdersChange={handleOrdersChange}
            onLogout={handleAdminLogout}
            setRoute={setRoute}
            language={language}
          />
        );
      case '/pos':
        if (!adminReady) return null;
        if (!adminUser || !adminToken) {
          return <AdminAccessGate onLogin={handleAdminLogin} language={language} />;
        }
        return (
          <PosTerminal
            pricing={siteConfig.pricing}
            orders={orders}
            onOrdersChange={handleOrdersChange}
            language={language}
          />
        );
      case '/ai-dashboard':
        if (!adminReady) return null;
        if (!adminUser || !adminToken) {
          return <AdminAccessGate onLogin={handleAdminLogin} language={language} />;
        }
        return (
          <AIOperationsDashboard
            config={siteConfig}
            orders={orders}
            language={language}
          />
        );
      case '/reports':
        if (!adminReady) return null;
        if (!adminUser || !adminToken) {
          return <AdminAccessGate onLogin={handleAdminLogin} language={language} />;
        }
        return (
          <ReportsDashboard
            orders={orders}
            branches={siteConfig.branches}
            drivers={siteConfig.drivers}
            pricing={siteConfig.pricing}
            language={language}
          />
        );
      case '/driver':
        if (!driverReady) return null;
        if (!driverUser) return <DriverAccessGate onLogin={handleDriverLogin} />;
        return (
          <DriverPanel 
            driver={
              siteConfig.drivers.find((item) => item.id === driverUser.id) || {
                id: driverUser.id,
                name: driverUser.name,
                phone: driverUser.phone,
                branch: '',
                status: 'online',
                rating: 5,
                orders_completed: 0,
                earnings_today: 0,
              }
            }
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onLogout={handleDriverLogout}
            language={language}
          />
        );
      case '/privacy':
        return (
          <LegalPage
            kind="privacy"
            config={siteConfig}
            onNavigate={setRoute}
          />
        );
      case '/terms':
        return (
          <LegalPage
            kind="terms"
            config={siteConfig}
            onNavigate={setRoute}
          />
        );
      default:
        return <PublicStaticPage route="/404" config={siteConfig} language={language} setRoute={setRoute} />;
    }
  };

  const isAdminRoute = route === '/admin';
  const isPosRoute = route === '/pos';
  const isAiDashboardRoute = route === '/ai-dashboard';
  const isReportsRoute = route === '/reports';
  const isDriverRoute = route === '/driver';
  const isDashboardRoute = route === '/dashboard' || route === '/portal';
  const isBookRoute = route === '/book';
  const hidesPublicLayout = isAdminRoute || isPosRoute || isAiDashboardRoute || isReportsRoute || isDriverRoute || isBookRoute;
  const hidesFloatingActions = hidesPublicLayout || isDashboardRoute;

  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen flex flex-col bg-background font-sans text-foreground selection:bg-primary/20">
      {!hidesPublicLayout && (
        <Navbar
          currentRoute={route}
          setRoute={setRoute}
          user={user}
          config={siteConfig}
          language={language}
          onLanguageChange={setLanguage}
          isDarkMode={isDarkMode}
          onDarkModeChange={setIsDarkMode}
        />
      )}
      
      <main className="flex-1">
        {!loadedRemoteData && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[70] px-4 py-2 rounded-full bg-secondary text-white text-[11px] font-bold tracking-wider">
            {localize(language, 'جاري تحديث البيانات...', 'Loading latest data...')}
          </div>
        )}
        {(!authReady || !adminReady || !driverReady) && (
          <div className={`fixed left-1/2 -translate-x-1/2 z-[70] px-4 py-2 rounded-full bg-primary text-white text-[11px] font-bold tracking-wider ${isDriverRoute ? 'top-4' : 'top-16'}`}>
            {localize(language, 'جاري استعادة الجلسة...', 'Restoring your session...')}
          </div>
        )}
        <AnimatePresence mode="wait">
          {renderPage()}
        </AnimatePresence>
      </main>

      {route !== '/dashboard' && route !== '/portal' && route !== '/admin' && route !== '/driver' && route !== '/book' && <Footer setRoute={setRoute} config={siteConfig} language={language} />}

      {!hidesFloatingActions && <PublicFloatingActions config={siteConfig} language={language} setRoute={setRoute} />}
    </div>
  );
}
