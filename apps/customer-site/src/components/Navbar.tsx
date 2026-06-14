import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag, User, Waves } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SiteConfig } from '../types';

interface NavbarProps {
  currentRoute: string;
  setRoute: (route: string) => void;
  user: any;
  config: SiteConfig;
}

export const Navbar: React.FC<NavbarProps> = ({ currentRoute, setRoute, user, config }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'الرئيسية', path: '/' },
    { name: 'الخدمات والأسعار', path: '/services' },
    { name: 'تتبع طلبك', path: '/track' },
    { name: 'تواصل معنا', path: '/contact' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-3 bg-white/82 backdrop-blur-2xl border-b border-slate-200/70 shadow-sm' : 'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <button 
          onClick={() => setRoute('/')}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div className="w-11 h-11 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/25 group-hover:rotate-6 transition-transform">
            <Waves size={24} />
          </div>
          <div>
            <h1 className="font-display font-black text-lg tracking-tight leading-none text-secondary text-right uppercase">
              {config.site_name || 'In & Out Laundry'}
            </h1>
            <p className="text-[10px] text-primary font-black tracking-[0.22em] leading-none mt-1 text-right" dir="ltr">
              مصبغة جودة واتقان
            </p>
          </div>
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => setRoute(link.path)}
              className={`text-xs font-bold transition-colors cursor-pointer ${
                currentRoute === link.path ? 'text-primary' : 'text-slate-600 hover:text-primary'
              }`}
            >
              {link.name}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setRoute(user ? '/dashboard' : '/auth')}
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 text-xs font-black bg-white text-secondary rounded-full border border-slate-200 shadow-sm hover:border-primary/30 hover:text-primary transition-all active:scale-95 cursor-pointer"
          >
            <User size={16} />
            <span>{user ? (String(user.name || '').split(' ')[0] || 'حسابي') : 'دخول'}</span>
          </button>
          <button 
            onClick={() => setRoute('/book')}
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-full text-xs font-black shadow-lg shadow-primary/25 hover:bg-[#7400d1] transition-all active:scale-95 cursor-pointer"
          >
            <ShoppingBag size={16} />
            اطلب الآن
          </button>
          
          <button 
            className="md:hidden text-gray-700 p-2 cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/92 backdrop-blur-2xl border-b border-slate-200 mt-4 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => {
                    setRoute(link.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-lg font-black py-2 text-left ${
                    currentRoute === link.path ? 'text-primary' : 'text-secondary'
                  }`}
                >
                  {link.name}
                </button>
              ))}
              <hr className="border-gray-200 my-2" />
              <button 
                onClick={() => {
                  setRoute(user ? '/dashboard' : '/auth');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 text-lg font-black py-2 text-secondary"
              >
                <User size={20} />
                <span>{user ? (String(user.name || '').split(' ')[0] || 'حسابي') : 'تسجيل الدخول'}</span>
              </button>
              <button
                onClick={() => {
                  setRoute('/book');
                  setMobileMenuOpen(false);
                }}
                className="mt-2 flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-black text-white shadow-lg shadow-primary/20"
              >
                <ShoppingBag size={18} />
                اطلب الآن
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
