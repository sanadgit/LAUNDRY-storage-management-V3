import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Phone, MessageCircle, MapPin, Clock, 
  Instagram, Facebook, Mail, Send, 
  Car, Store, Globe, ChevronLeft, Sparkles
} from 'lucide-react';
import { LaundryIcon } from './LaundryIcon';
import { SiteLanguage, localize } from '../lib/i18n';

export const Contact: React.FC<{ language?: SiteLanguage }> = ({ language = 'ar' }) => {
  const [activeBranch, setActiveBranch] = useState(1);
  const [activeMap, setActiveMap] = useState('falah');

  const branches = [
    { id: 1, name: localize(language, 'فرع الفلاح', 'Al Falah Branch'), phone: '02 586 4164', key: 'falah' },
    { id: 2, name: localize(language, 'فرع المصفح', 'Mussafah Branch'), phone: '02 563 1778', key: 'musaffah' },
    { id: 3, name: localize(language, 'فرع محمد بن زايد', 'Mohammed Bin Zayed Branch'), phone: '02 555 5929', key: 'mbz' },
  ];

  const drivers = [
    { name: localize(language, 'سائق ١', 'Driver 1'), phone: '056 586 5506' },
    { name: localize(language, 'سائق ٢', 'Driver 2'), phone: '056 427 0050' },
    { name: localize(language, 'سائق ٣', 'Driver 3'), phone: '055 709 9998' },
  ];

  const maps: Record<string, string> = {
    falah: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d428.6093021670851!2d54.73065573556334!3d24.42420086473464!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5e4b999a38450f%3A0x8f39170f5a0e023d!2z2YXYtdix2LrYqSDYpdmGINij2YbYryDYo9mI2KogSW4mT3V0IExhdW5kcnk!5e0!3m2!1sar!2sae!4v1776829191134!5m2!1sar!2sae',
    musaffah: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d227.1316917411851!2d54.520150889893294!3d24.377578529156047!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5e412ae444bce7%3A0xf384760d3a59adb1!2sIn%20%26%20Out%20Laundry%20(Main%20Branch)!5e0!3m2!1sar!2sae!4v1776830011443!5m2!1sar!2sae',
    mbz: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d227.17496212863!2d54.55915472514885!3d24.353479647417085!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5e47c1f3a1427d%3A0x5c023caf4004e15!2z2YXYtdio2LrYqSDYpdmGINij2YbYryDYo9mI2KogSW4mT3V0IExhdW5kcnk!5e0!3m2!1sar!2sae!4v1776830138457!5m2!1sar!2sae'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      {/* Hero Header */}
      <div className="bg-secondary rounded-[2rem] p-12 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <LaundryIcon
          name="outty-support"
          alt=""
          className="pointer-events-none absolute bottom-5 left-5 hidden h-32 w-32 rounded-[2rem] bg-white/10 p-2 shadow-2xl shadow-primary/10 md:inline-flex"
          imageClassName="h-full w-full rounded-3xl object-contain"
        />
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full border border-primary/30 text-[10px] font-bold uppercase">
             {localize(language, 'الإمارات العربية المتحدة — أبوظبي', 'United Arab Emirates - Abu Dhabi')}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white italic">
            {localize(language, 'تواصل', 'Contact')} <span className="text-primary">{localize(language, 'معنا', 'Us')}</span>
          </h1>
          <p className="text-primary/60 text-sm md:text-base max-w-2xl mx-auto">
            {localize(language, 'نحن هنا لخدمتك — فريق خدمة العملاء متاح ٧ أيام في الأسبوع لاستقبال طلباتك وملاحظاتك.', 'We are here to help. Our customer support team is available 7 days a week for your orders and feedback.')}
          </p>
        </div>
      </div>

      {/* Quick Stats/Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col items-center text-center space-y-4 hover:border-primary transition-all group">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <Phone size={32} />
          </div>
          <div>
            <h3 className="font-bold text-secondary">{localize(language, 'اتصل بنا', 'Call Us')}</h3>
            <p className="text-xs text-gray-500 font-medium mt-1">{localize(language, '٣ فروع في خدمتكم', '3 branches ready to serve you')}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col items-center text-center space-y-4 hover:border-primary transition-all group">
          <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center text-success group-hover:scale-110 transition-transform">
            <MessageCircle size={32} />
          </div>
          <div>
            <h3 className="font-bold text-secondary">{localize(language, 'واتساب', 'WhatsApp')}</h3>
            <p className="text-xs text-gray-500 font-medium mt-1">{localize(language, 'رد فوري واستلام سريع', 'Fast replies and pickup')}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col items-center text-center space-y-4 hover:border-primary transition-all group">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <MapPin size={32} />
          </div>
          <div>
            <h3 className="font-bold text-secondary">{localize(language, 'ابحث عنّا', 'Find Us')}</h3>
            <p className="text-xs text-gray-500 font-medium mt-1">{localize(language, 'مواقعنا على الخريطة', 'Our locations on the map')}</p>
          </div>
        </div>
      </div>

      {/* Branches with Interaction */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 px-2">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
            <Store size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-secondary">{localize(language, 'فروعنا الرسمية', 'Official Branches')}</h2>
            <p className="text-xs text-gray-500 font-medium">{localize(language, 'اختر الفرع للتواصل المباشر', 'Choose a branch for direct contact')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {branches.map(branch => (
            <motion.div
              layoutId={`branch-${branch.id}`}
              onClick={() => {
                setActiveBranch(branch.id);
                setActiveMap(branch.key);
              }}
              key={branch.id}
              className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${
                activeBranch === branch.id 
                  ? 'bg-primary/5 border-primary shadow-xl shadow-primary/10' 
                  : 'bg-white border-transparent shadow-lg shadow-gray-100 hover:border-gray-200'
              }`}
            >
              <div className={`w-3 h-3 rounded-full mb-4 ${activeBranch === branch.id ? 'bg-primary animate-pulse' : 'bg-gray-300'}`} />
              <h3 className="font-bold text-secondary mb-2">{branch.name}</h3>
              <p className="text-xl font-black text-secondary italic mb-6" dir="ltr">{branch.phone}</p>
              <div className="flex gap-2">
                <button className="flex-1 bg-white border border-gray-100 rounded-xl py-2 text-[10px] font-bold text-gray-600 hover:bg-gray-50 transition-colors">{localize(language, 'اتصال', 'Call')}</button>
                <button className="flex-1 bg-white border border-gray-100 rounded-xl py-2 text-[10px] font-bold text-gray-600 hover:bg-gray-50 transition-colors">{localize(language, 'واتساب', 'WhatsApp')}</button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Drivers Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 px-2">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
            <Car size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-secondary">{localize(language, 'خدمة الاستلام المنزلي', 'Home Pickup Service')}</h2>
            <p className="text-xs text-gray-500 font-medium">{localize(language, 'أرقام السائقين المباشرة (واتساب متاح)', 'Direct driver numbers (WhatsApp available)')}</p>
          </div>
        </div>

        <div className="space-y-3">
          {drivers.map((driver, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-bg rounded-full flex items-center justify-center text-xl grayscale hover:grayscale-0 transition-all border border-gray-100">🧑</div>
                <div>
                  <div className="font-bold text-secondary text-sm">{driver.name}</div>
                  <div className="text-primary font-black text-lg italic tracking-tighter" dir="ltr">{driver.phone}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-secondary hover:bg-gray-100 transition-all">
                  <Phone size={18} />
                </button>
                <button className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-all">
                  <MessageCircle size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Map Integration */}
      <section className="space-y-6">
        <div className="flex justify-between items-end px-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
              <Globe size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-secondary">{localize(language, 'مواقعنا على الخريطة', 'Locations on the Map')}</h2>
              <p className="text-xs text-gray-500 font-medium text-right">{localize(language, 'مفتوح الآن لخدمتكم', 'Open now to serve you')}</p>
            </div>
          </div>
          <div className="hidden sm:flex gap-2">
            {branches.map(b => (
              <button 
                key={b.id}
                onClick={() => {setActiveMap(b.key); setActiveBranch(b.id);}}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold transition-all ${
                  activeMap === b.key ? 'bg-primary text-white' : 'bg-white text-gray-400 border border-gray-100'
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-2xl relative">
          <iframe 
            src={maps[activeMap]}
            className="w-full h-[400px] border-0"
            allowFullScreen={true}
            loading="lazy"
          />
          <LaundryIcon
            name="outty-branch-map"
            alt=""
            className="pointer-events-none absolute bottom-4 left-4 hidden h-28 w-28 rounded-3xl bg-white/80 p-2 shadow-2xl shadow-primary/10 backdrop-blur md:inline-flex"
            imageClassName="h-full w-full rounded-2xl object-contain"
          />
        </div>
      </section>

      {/* Business Hours */}
      <section className="bg-brand-bg rounded-[2rem] p-8 border border-gray-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-white text-primary rounded-2xl flex items-center justify-center shadow-sm">
            <Clock size={24} />
          </div>
          <h3 className="text-xl font-bold text-secondary">{localize(language, 'ساعات العمل', 'Working Hours')}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { day: localize(language, 'السبت – الثلاثاء', 'Saturday - Tuesday'), time: localize(language, '٨ ص – ١٠ م', '8 AM - 10 PM') },
            { day: localize(language, 'الأربعاء', 'Wednesday'), time: localize(language, '٨ ص – ١٠ م', '8 AM - 10 PM') },
            { day: localize(language, 'الخميس', 'Thursday'), time: localize(language, '٨ ص – ١١ م', '8 AM - 11 PM') },
            { day: localize(language, 'الجمعة', 'Friday'), time: localize(language, '٢ م – ١١ م', '2 PM - 11 PM') },
          ].map((h, i) => (
            <div key={i} className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-50 shadow-sm">
              <span className="text-xs font-bold text-gray-500">{h.day}</span>
              <span className="text-sm font-black text-secondary italic">{h.time}</span>
            </div>
          ))}
        </div>
        <div className="mt-8 bg-primary/5 rounded-2xl p-4 flex items-center gap-4 text-xs font-medium text-primary">
          <Sparkles size={20} />
          {localize(language, 'خدمة الاستلام والتوصيل مخصصة لتوفير وقتكم — نوصي بالطلب قبل موعد الإغلاق بساعة واحدة.', 'Pickup and delivery are designed to save your time. We recommend ordering at least one hour before closing.')}
        </div>
      </section>

      {/* Contact Form */}
      <section className="space-y-6">
        <div className="flex items-center gap-4 px-2">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
            <Mail size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-secondary">{localize(language, 'أرسل لنا رسالة', 'Send Us a Message')}</h2>
            <p className="text-xs text-gray-500 font-medium">{localize(language, 'سنرد عليك خلال ٢٤ ساعة', 'We will reply within 24 hours')}</p>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 px-1">{localize(language, 'الاسم الكامل', 'Full Name')}</label>
              <input type="text" className={`w-full bg-gray-50 border-2 border-transparent focus:border-primary p-4 rounded-2xl font-bold outline-none text-sm transition-all ${language === 'ar' ? 'text-right' : 'text-left'}`} placeholder={localize(language, 'أدخل اسمك هنا', 'Enter your name here')} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 px-1">{localize(language, 'رقم الجوال', 'Mobile Number')}</label>
              <input type="tel" className="w-full bg-gray-50 border-2 border-transparent focus:border-primary p-4 rounded-2xl font-bold outline-none text-sm transition-all text-left" placeholder="05X XXX XXXX" dir="ltr" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 px-1">{localize(language, 'نوع الاستفسار', 'Inquiry Type')}</label>
              <select className={`w-full bg-gray-50 border-2 border-transparent focus:border-primary p-4 rounded-2xl font-bold outline-none text-sm transition-all appearance-none ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                <option>{localize(language, 'استفسار عن خدمة', 'Service Inquiry')}</option>
                <option>{localize(language, 'شكوى أو ملاحظة', 'Complaint or Feedback')}</option>
                <option>{localize(language, 'طلب عروض أسعار', 'Quotation Request')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 px-1">{localize(language, 'الفرع المعني', 'Related Branch')}</label>
              <select className={`w-full bg-gray-50 border-2 border-transparent focus:border-primary p-4 rounded-2xl font-bold outline-none text-sm transition-all appearance-none ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                {branches.map((branch) => <option key={branch.id}>{branch.name}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 px-1">{localize(language, 'نص الرسالة', 'Message')}</label>
            <textarea className={`w-full bg-gray-50 border-2 border-transparent focus:border-primary p-4 rounded-2xl font-bold outline-none text-sm transition-all min-h-[120px] ${language === 'ar' ? 'text-right' : 'text-left'}`} placeholder={localize(language, 'كيف يمكننا مساعدتك؟', 'How can we help you?')} />
          </div>
          <button className="w-full bg-secondary text-white py-5 rounded-[2rem] font-black italic shadow-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all text-lg">
             {localize(language, 'إرسال الرسالة', 'Send Message')} <Send size={20} className="text-primary" />
          </button>
        </div>
      </section>

      {/* Social Media Linkers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <Instagram />, name: localize(language, 'انستقرام', 'Instagram'), handle: '@inandoutuae' },
          { icon: <Facebook />, name: localize(language, 'فيسبوك', 'Facebook'), handle: 'inandoutuae' },
          { icon: <Mail />, name: localize(language, 'البريد الإلكتروني', 'Email'), handle: 'inandoutuae@gmail.com' },
          { icon: <Store />, name: localize(language, 'مواقعنا', 'Locations'), handle: localize(language, 'أبوظبي، الإمارات', 'Abu Dhabi, UAE') },
        ].map((soc, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 text-center space-y-2">
            <div className="text-primary flex justify-center">{soc.icon}</div>
            <div className="font-bold text-secondary text-xs">{soc.name}</div>
            <div className="text-[10px] text-gray-400 font-medium">{soc.handle}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
