import React from 'react';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, ArrowRight, MessageSquare } from 'lucide-react';
import { SiteConfig } from '../types';

interface FooterProps {
  setRoute: (route: string) => void;
  config: SiteConfig;
}

export const Footer: React.FC<FooterProps> = ({ setRoute, config }) => {
  return (
    <footer className="bg-gray-900 text-white pt-24 pb-12 overflow-hidden relative">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">IO</div>
              <div>
                <h1 className="font-display font-bold text-lg tracking-tight leading-none uppercase">{config.site_name || 'IN & OUT'}</h1>
                <p className="text-[10px] text-white/50 font-medium tracking-[0.2em] uppercase leading-none mt-1">Laundry</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              {config.hero.subtitle}
            </p>
            <div className="flex gap-4">
              <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer"><Instagram size={18} /></button>
              <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer"><Facebook size={18} /></button>
              <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer"><Twitter size={18} /></button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-8 uppercase text-xs tracking-widest text-primary">روابط سريعة</h4>
            <ul className="space-y-4">
              {['الرئيسية', 'تتبع الطلب', 'الخدمات', 'الفروع', 'من نحن', 'تواصل معنا'].map(link => (
                <li key={link}>
                  <button className="text-gray-400 text-sm hover:text-white transition-colors flex items-center gap-2 group cursor-pointer">
                    <ArrowRight size={14} className="opacity-0 -mr-4 group-hover:opacity-100 group-hover:mr-0 transition-all rotate-180" />
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-8 uppercase text-xs tracking-widest text-primary">تواصل معنا</h4>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <MapPin size={20} className="text-primary flex-shrink-0" />
                <a 
                  href={config.google_maps_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 text-sm text-right hover:text-white transition-colors"
                >
                  {config.business_address}
                </a>
              </li>
              <li className="flex gap-4">
                <Phone size={20} className="text-primary flex-shrink-0" />
                <div className="text-right">
                  <p className="text-gray-400 text-sm" dir="ltr">{config.whatsapp_number}</p>
                </div>
              </li>
              <li className="flex gap-4">
                <Mail size={20} className="text-primary flex-shrink-0" />
                <p className="text-gray-400 text-sm text-right">{config.contact_email}</p>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold mb-8 uppercase text-xs tracking-widest text-primary">القائمة البريدية</h4>
            <p className="text-gray-400 text-sm mb-6 text-right">ابقَ على اطلاع بأحدث عروضنا وخدماتنا.</p>
            <div className="flex bg-white/5 p-2 rounded-2xl border border-white/10">
              <input type="email" placeholder="البريد الإلكتروني" className="bg-transparent border-none focus:ring-0 text-sm px-3 flex-1 text-right" />
              <button className="bg-primary p-3 rounded-xl hover:bg-opacity-90 transition-all rotate-180 cursor-pointer">
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        <hr className="border-white/5 mb-12" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
          <p>{config.footer_text}</p>
          <div className="flex gap-8">
            <button className="hover:text-white transition-colors cursor-pointer">سياسة الخصوصية</button>
            <button className="hover:text-white transition-colors cursor-pointer">الشروط والأحكام</button>
            <button 
              onClick={() => setRoute('/driver')}
              className="text-white/20 hover:text-primary transition-colors cursor-pointer border-r border-white/10 pr-8"
            >
              تطبيق السائق
            </button>
            <button 
              onClick={() => setRoute('/admin')}
              className="text-white/20 hover:text-primary transition-colors cursor-pointer border-r border-white/10 pr-8"
            >
              دخول الإدارة
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
