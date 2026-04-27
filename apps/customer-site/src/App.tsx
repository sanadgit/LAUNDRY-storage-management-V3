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
import { Hero } from './components/Hero';
import { JourneySection } from './components/JourneySection';
import { TrackingPanel } from './components/TrackingPanel';
import { ServicesGrid, BranchesSection, GallerySection, PricingSection } from './components/CommonSections';
import { Footer } from './components/Footer';
import { Dashboard } from './components/Dashboard';
import { OrderWizard } from './components/OrderWizard';
import { AuthWizard } from './components/AuthWizard';
import { Contact } from './components/Contact';
import { AdminPanel } from './components/AdminPanel';
import { AdminAccessGate } from './components/AdminAccessGate';
import { DriverAccessGate } from './components/DriverAccessGate';
import { DriverPanel } from './components/DriverPanel';
import { INITIAL_SITE_CONFIG } from './constants';
import { AdminAuthResponse, AdminUser, CustomerAuthResponse, CustomerUser, DriverAuthResponse, DriverAuthUser, Order, SiteConfig, OrderStatus } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Settings } from 'lucide-react';
import { normalizeOrders, normalizeOrderStatus } from './lib/orders';
import { customerApi } from './lib/customerApi';
import { adminApi } from './lib/adminApi';
import { driverApi } from './lib/driverApi';

const ROUTES = new Set([
  '/',
  '/track',
  '/dashboard',
  '/auth',
  '/services',
  '/branches',
  '/contact',
  '/book',
  '/admin',
  '/driver',
]);

const normalizeRoute = (value: string) => {
  const route = String(value || '/').trim();
  return ROUTES.has(route) ? route : '/';
};

const getRouteFromLocation = () => {
  if (typeof window === 'undefined') return '/';
  return normalizeRoute(window.location.pathname);
};

const CUSTOMER_AUTH_TOKEN_KEY = 'io_customer_auth_token';
const CUSTOMER_AUTH_USER_KEY = 'io_customer_auth_user';
const ADMIN_AUTH_TOKEN_KEY = 'io_admin_auth_token';
const ADMIN_AUTH_USER_KEY = 'io_admin_auth_user';
const DRIVER_AUTH_TOKEN_KEY = 'io_driver_auth_token';
const DRIVER_AUTH_USER_KEY = 'io_driver_auth_user';

export default function App() {
  const [route, setRouteState] = useState(getRouteFromLocation);
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
    
    // Merge logic: ensure all items from INITIAL_SITE_CONFIG exist 
    const parsed = JSON.parse(saved) as SiteConfig;
    const mergedPricing = [...INITIAL_SITE_CONFIG.pricing];
    
    parsed.pricing.forEach(savedItem => {
      const idx = mergedPricing.findIndex(p => p.barcode === savedItem.barcode);
      if (idx !== -1) {
        mergedPricing[idx] = savedItem; // Use saved values for existing items
      }
    });

    return { ...INITIAL_SITE_CONFIG, ...parsed, pricing: mergedPricing };
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

        if (remoteConfig && typeof remoteConfig === 'object') {
          const mergedPricing = [...INITIAL_SITE_CONFIG.pricing];
          remoteConfig.pricing?.forEach((savedItem) => {
            const idx = mergedPricing.findIndex((item) => item.barcode === savedItem.barcode);
            if (idx !== -1) mergedPricing[idx] = savedItem;
          });

          setSiteConfig({
            ...INITIAL_SITE_CONFIG,
            ...remoteConfig,
            pricing: mergedPricing,
          });
        }
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
    if (route === '/dashboard' && authReady && !user) {
      setRoute('/auth');
    }
    if (route === '/book' && authReady && !user) {
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

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  useEffect(() => {
    if (route !== '/track') return;
    if (typeof window === 'undefined') return;
    const ticketId = new URLSearchParams(window.location.search).get('id');
    if (!ticketId) return;
    const found = orders.find((order) => order.id.toLowerCase() === ticketId.toLowerCase());
    setSearchOrder(found || null);
  }, [route, orders]);

  const handleSearch = (id: string) => {
    const normalizedId = String(id ?? '').trim();
    const found = orders.find(o => o.id.toLowerCase() === normalizedId.toLowerCase());
    setSearchOrder(found || null);
    if (typeof window !== 'undefined') {
      const nextUrl = normalizedId ? `/track?id=${encodeURIComponent(normalizedId)}` : '/track';
      window.history.pushState({}, '', nextUrl);
      setRouteState('/track');
      return;
    }
    if (route !== '/track') setRoute('/track');
  };

  const handleNewOrder = (newOrder: Order) => {
    const normalized = normalizeOrders([newOrder])[0];
    if (!normalized) return;
    setOrders((prev) => [normalized, ...prev]);
    void customerApi.createOrder(normalized).catch(() => {
      // Keep local state resilient when API is temporarily unavailable.
    });
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

  const handleCustomerLogin = async (payload: { identifier: string; password: string }) => {
    const result = await customerApi.login(payload);
    handleCustomerAuthSuccess(result);
  };

  const handleCustomerRegister = async (payload: {
    name: string;
    phone?: string;
    email?: string;
    password: string;
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
          <h1 className="text-3xl font-black text-white italic mb-4">الموقع تحت الصيانة</h1>
          <p className="text-primary/60 text-sm max-w-xs">نحن بصدد إجراء بعض التحسينات السريعة. سنعود إليكم قريباً بمظهر جديد وخدمة أفضل.</p>
          <button onClick={() => setRoute('/admin')} className="mt-8 text-[10px] font-bold text-white/20 hover:text-white uppercase tracking-widest">Admin Access</button>
        </div>
      );
    }

    switch (route) {
      case '/':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Hero 
              onTrackClick={() => setRoute('/track')} 
              onBookClick={() => setRoute('/contact')} 
              config={siteConfig}
            />
            <JourneySection />
            <GallerySection items={siteConfig.gallery} />
            <ServicesGrid />
            <PricingSection pricing={siteConfig.pricing} />
            <BranchesSection branches={siteConfig.branches} />
          </motion.div>
        );
      case '/track':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-24 min-h-screen bg-brand-bg pb-20"
          >
            <TrackingPanel order={searchOrder} onSearch={handleSearch} />
          </motion.div>
        );
      case '/dashboard':
        if (!authReady) return null;
        if (!user) return null;
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Dashboard
              user={user}
              orders={orders}
              onNewOrderClick={() => setRoute('/book')}
              onLogout={handleCustomerLogout}
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
            <AuthWizard onLogin={handleCustomerLogin} onRegister={handleCustomerRegister} />
          </motion.div>
        );
      case '/services':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-24 min-h-screen bg-brand-bg"
          >
            <PricingSection pricing={siteConfig.pricing} />
            <ServicesGrid />
          </motion.div>
        );
      case '/branches':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-24 min-h-screen bg-brand-bg"
          >
            <BranchesSection branches={siteConfig.branches} />
          </motion.div>
        );
      case '/contact':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-24 pb-20 md:pt-32 min-h-screen bg-brand-bg px-4"
          >
            <Contact />
          </motion.div>
        );
      case '/book':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-24 pb-20 md:pt-32 min-h-screen bg-brand-bg px-4"
          >
            <OrderWizard 
              onOrderSuccess={handleNewOrder} 
              onBack={() => setRoute('/')} 
              pricing={siteConfig.pricing}
              config={siteConfig}
            />
          </motion.div>
        );
      case '/admin':
        if (!adminReady) return null;
        if (!adminUser || !adminToken) {
          return <AdminAccessGate onLogin={handleAdminLogin} />;
        }
        return (
          <AdminPanel 
            config={siteConfig}
            onConfigChange={handleSiteConfigChange}
            orders={orders}
            onOrdersChange={handleOrdersChange}
            onLogout={handleAdminLogout}
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
          />
        );
      default:
        return <div>404</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans select-none selection:bg-primary/20">
      <Navbar currentRoute={route} setRoute={setRoute} user={user} config={siteConfig} />
      
      <main className="flex-1">
        {!loadedRemoteData && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[70] px-4 py-2 rounded-full bg-gray-900 text-white text-[11px] font-bold tracking-wider">
            Loading latest data...
          </div>
        )}
        {(!authReady || !adminReady || !driverReady) && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[70] px-4 py-2 rounded-full bg-primary text-white text-[11px] font-bold tracking-wider">
            Restoring your session...
          </div>
        )}
        <AnimatePresence mode="wait">
          {renderPage()}
        </AnimatePresence>
      </main>

      {route !== '/dashboard' && route !== '/admin' && route !== '/driver' && <Footer setRoute={setRoute} config={siteConfig} />}

      {/* Floating WhatsApp CTA */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-24 md:bottom-8 right-8 z-50 w-16 h-16 bg-success text-white rounded-full flex items-center justify-center shadow-2xl shadow-success/40 cursor-pointer"
      >
        <MessageCircle size={32} />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger rounded-full flex items-center justify-center text-[10px] font-bold">1</span>
      </motion.button>

      {/* Sticky Bottom Nav (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass h-20 px-6 flex items-center justify-between z-40 border-t border-gray-100">
        <button 
          onClick={() => setRoute('/')}
          className={`flex flex-col items-center gap-1 ${route === '/' ? 'text-primary' : 'text-gray-400'}`}
        >
          <div className={`w-1 h-1 rounded-full mb-1 ${route === '/' ? 'bg-primary' : 'transparent'}`} />
          <span className="text-[10px] font-bold uppercase tracking-widest leading-none">الرئيسية</span>
        </button>
        <button 
          onClick={() => setRoute('/track')}
          className={`flex flex-col items-center gap-1 ${route === '/track' ? 'text-primary' : 'text-gray-400'}`}
        >
          <div className={`w-1 h-1 rounded-full mb-1 ${route === '/track' ? 'bg-primary' : 'transparent'}`} />
          <span className="text-[10px] font-bold uppercase tracking-widest leading-none">تتبع</span>
        </button>
        <button 
          onClick={() => setRoute(user ? '/dashboard' : '/auth')}
          className={`flex flex-col items-center gap-1 ${route === '/dashboard' || route === '/auth' ? 'text-primary' : 'text-gray-400'}`}
        >
          <div className={`w-1 h-1 rounded-full mb-1 ${route === '/dashboard' || route === '/auth' ? 'bg-primary' : 'transparent'}`} />
          <span className="text-[10px] font-bold uppercase tracking-widest leading-none">
            {user ? 'حسابي' : 'دخول'}
          </span>
        </button>
      </div>
    </div>
  );
}
