import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag, Search, User } from 'lucide-react';
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
    { name: 'الأسعار', path: '/services' },
    { name: 'تتبع طلبك', path: '/track' },
    { name: 'تواصل معنا', path: '/contact' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-4 glass border-b border-gray-200' : 'py-6 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <button 
          onClick={() => setRoute('/')}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:rotate-6 transition-transform">
            I&O
          </div>
          <div>
            <h1 className="font-display font-bold text-lg tracking-tight leading-none text-gray-900 text-right uppercase">
              {config.site_name || 'In & Out Laundry'}
            </h1>
            <p className="text-[10px] text-gray-500 font-medium tracking-normal leading-none mt-1 text-right">
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
                currentRoute === link.path ? 'text-primary' : 'text-gray-600 hover:text-primary'
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
            className="hidden sm:flex items-center gap-2 px-6 py-2.5 text-xs font-bold bg-primary text-white rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:bg-opacity-90 transition-all active:scale-95 cursor-pointer"
          >
            <User size={16} />
            <span>{user ? (String(user.name || '').split(' ')[0] || 'حسابي') : 'دخول'}</span>
          </button>
          <button 
            onClick={() => setRoute('/book')}
            className="bg-gray-900 text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-lg shadow-gray-200/10 hover:bg-gray-800 transition-all active:scale-95 cursor-pointer"
          >
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
            className="md:hidden glass border-b border-gray-200 mt-4 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => {
                    setRoute(link.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-lg font-semibold py-2 text-left ${
                    currentRoute === link.path ? 'text-primary' : 'text-gray-800'
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
                className="flex items-center gap-2 text-lg font-semibold py-2 text-gray-800"
              >
                <User size={20} />
                <span>{user ? (String(user.name || '').split(' ')[0] || 'حسابي') : 'تسجيل الدخول'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
