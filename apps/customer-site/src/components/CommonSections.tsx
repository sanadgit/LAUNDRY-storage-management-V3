import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import { SERVICES } from '../constants';
import { PricingItem, Branch } from '../types';

export const ServicesGrid: React.FC = () => {
  return (
    <section className="py-24 bg-brand-bg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-2xl text-right">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 italic tracking-tight">خدماتنا <span className="text-primary italic">الأساسية</span></h2>
            <p className="text-gray-500 font-medium">نغطي جميع احتياجات الغسيل بأعلى معايير الجودة والاحترافية.</p>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-8 mask-fade-right">
          {SERVICES.map((service, idx) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass p-8 rounded-[2rem] min-w-[240px] text-center hover:border-primary/20 transition-all border border-transparent shadow-lg"
            >
              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="text-lg font-bold mb-2">{service.title}</h3>
              <p className="text-primary font-bold text-sm">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const PricingSection: React.FC<{ pricing?: PricingItem[] }> = ({ pricing }) => {
  const [activeTab, setActiveTab] = useState<'men' | 'women' | 'kids' | 'home'>('men');
  const [serviceType, setServiceType] = useState<'wash_dry' | 'iron' | 'wash_iron' | 'dry'>('wash_dry');
  const [prices, setPrices] = useState<PricingItem[]>(pricing || []);

  useEffect(() => {
    if (pricing) setPrices(pricing);
  }, [pricing]);

  const tabs = [
    { id: 'men', label: 'رجال 👔' },
    { id: 'women', label: 'نساء 👗' },
    { id: 'kids', label: 'أطفال 🧒' },
    { id: 'home', label: 'منزلية 🛏️' },
  ];

  const serviceTypes = [
    { id: 'wash_dry', label: 'غسيل وتنشيف' },
    { id: 'iron', label: 'كوي فقط' },
    { id: 'wash_iron', label: 'غسيل وكوي' },
    { id: 'dry', label: 'تنظيف جاف' },
  ];

  const filteredPrices = prices.filter(item => item.category === activeTab && item.active !== false);

  return (
    <section id="pricing" className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4 italic tracking-tight">قائمة <span className="text-primary italic">الأسعار</span></h2>
          <p className="text-gray-500 font-medium max-w-lg mx-auto leading-relaxed">أسعار شفافة ومنافسة لكل فئة، مع خيارات متعددة للخدمة العادية والمستعجلة.</p>
        </div>

        {/* Categories */}
        <div className="flex justify-center mb-8">
          <div className="grid grid-cols-2 md:flex bg-gray-50 p-1.5 rounded-3xl gap-1 border border-gray-100 overflow-hidden w-full max-w-4xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-4 px-2 rounded-2xl text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-primary text-white shadow-xl shadow-primary/20' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Service Type Selector */}
        <div className="flex justify-center mb-12 overflow-x-auto no-scrollbar pb-2">
          <div className="flex flex-nowrap md:flex-wrap justify-start md:justify-center gap-2">
            {serviceTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setServiceType(type.id as any)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border whitespace-nowrap ${
                  serviceType === type.id 
                    ? 'bg-gray-900 text-white border-gray-900 shadow-xl' 
                    : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + serviceType}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredPrices.map((item, idx) => {
              const priceValue = item[serviceType as keyof PricingItem];
              // Skip items that don't have a price for the selected service type
              if (!priceValue || priceValue === 0 || priceValue === '0' || priceValue === '') return null;

              return (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-6 rounded-[2.5rem] border transition-all bg-white border-gray-100 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 group"
              >
                <div className="flex items-center gap-6">
                  <div className="text-4xl w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    {item.icon || '👕'}
                  </div>
                  <div className="text-right">
                    <h4 className="text-lg font-black text-gray-900">{item.name_ar}</h4>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{item.name_en}</p>
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-2xl font-black text-primary">
                    {priceValue} <span className="text-xs">درهم</span>
                  </div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">للقطعة</div>
                </div>
              </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export const GallerySection: React.FC<{ items: { id: string, icon: string, label: string }[] }> = ({ items }) => {
  return (
    <section className="py-24 bg-brand-bg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-right mb-16">
          <h2 className="text-3xl font-extrabold mb-2 italic">من داخل <span className="text-primary italic">المصبغة</span></h2>
          <p className="text-gray-500 font-medium">لقطات حقيقية من عملنا اليومي لضمان أعلى مستويات النظافة.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`glass rounded-[2rem] overflow-hidden group cursor-pointer border-transparent hover:border-primary/20 h-48`}
            >
              <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-4 transition-colors group-hover:bg-primary/5">
                <span className="text-5xl transition-transform group-hover:scale-110 duration-500">{item.icon}</span>
                <span className="text-xs font-bold text-gray-400 group-hover:text-primary uppercase tracking-widest">{item.label}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const BranchesSection: React.FC<{ branches: Branch[] }> = ({ branches }) => {
  return (
    <section className="py-24 bg-white" id="branches">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4 italic tracking-tight">تواصل <span className="text-primary italic">معنا</span></h2>
          <p className="text-gray-500 font-medium">فريقنا جاهز لخدمتكم في جميع فروعنا.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {branches.filter(b => b.status === 'active').map((branch) => (
            <div key={branch.id} className="glass p-8 rounded-[2.5rem] text-center border-transparent hover:border-primary/20 transition-all shadow-xl">
               <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-6">
                 <Icons.MapPin size={32} />
               </div>
               <h3 className="text-2xl font-bold mb-4">{branch.name}</h3>
               <p className="text-gray-500 mb-6 font-medium">{branch.address}</p>
               
               <div className="space-y-4">
                 <div className="flex items-center justify-center gap-2 text-gray-900 font-bold">
                   <Icons.Phone size={18} className="text-primary" />
                   <span>{branch.phone}</span>
                 </div>
                 <div className="flex items-center justify-center gap-2 text-gray-900 font-bold">
                   <Icons.Clock size={18} className="text-primary" />
                   <span>{branch.hours}</span>
                 </div>
               </div>

               <div className="mt-8 flex gap-3">
                 <button className="flex-1 bg-gray-900 text-white py-3 rounded-2xl text-xs font-bold shadow-lg cursor-pointer">اتصل الآن</button>
                 <button className="flex-1 bg-success text-white py-3 rounded-2xl text-xs font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer">
                   <Icons.MessageCircle size={16} /> واتساب
                 </button>
               </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
