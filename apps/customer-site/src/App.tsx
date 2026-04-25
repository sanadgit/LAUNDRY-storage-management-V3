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
import { DriverPanel } from './components/DriverPanel';
import { MOCK_ORDERS, INITIAL_SITE_CONFIG } from './constants';
import { Order, SiteConfig, OrderStatus } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Settings } from 'lucide-react';

export default function App() {
  const [route, setRoute] = useState('/');
  const [searchOrder, setSearchOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('io_orders');
    return saved ? JSON.parse(saved) : MOCK_ORDERS;
  });
  const [user, setUser] = useState<any>(null);
  const [driver, setDriver] = useState<any>(null);
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

  const handleSearch = (id: string) => {
    const found = orders.find(o => o.id.toLowerCase() === id.toLowerCase());
    setSearchOrder(found || null);
    if (route !== '/track') setRoute('/track');
  };

  const handleNewOrder = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
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
        if (!user) {
          setRoute('/auth');
          return null;
        }
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Dashboard orders={orders} onNewOrderClick={() => setRoute('/book')} />
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
            <AuthWizard onComplete={(userData) => {
              setUser(userData);
              setRoute('/dashboard');
            }} />
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
            <BranchesSection />
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
        return (
          <AdminPanel 
            config={siteConfig}
            onConfigChange={setSiteConfig}
            orders={orders}
            onOrdersChange={setOrders}
            onLogout={() => setRoute('/')}
          />
        );
      case '/driver':
        return (
          <DriverPanel 
            driver={driver || siteConfig.drivers[0]} 
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onLogout={() => { setDriver(null); setRoute('/'); }}
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
        <AnimatePresence mode="wait">
          {renderPage()}
        </AnimatePresence>
      </main>

      {route !== '/dashboard' && route !== '/admin' && <Footer setRoute={setRoute} config={siteConfig} />}

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

