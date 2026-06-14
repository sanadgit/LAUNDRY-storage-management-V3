import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { SERVICES } from '../constants';
import { Branch, PricingItem } from '../types';
import { LaundryIcon, resolvePricingItemIcon } from './LaundryIcon';

export const ServicesGrid: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-secondary py-24 text-white">
      <div className="absolute inset-0 opacity-[0.08] hero-grid" />
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 grid gap-6 md:grid-cols-[1fr_0.9fr] md:items-end">
          <div className="text-right">
            <p className="mb-3 text-sm font-black text-success">خدماتنا</p>
            <h2 className="text-balance text-4xl font-black leading-tight md:text-6xl">
              خدمات الغسيل تتحرك في خط واحد واضح.
            </h2>
          </div>
          <p className="text-sm font-semibold leading-7 text-white/62 md:text-right">
            من الملابس اليومية إلى المفارش والقطع الحساسة، كل خدمة تدخل نفس نظام العناية والتتبع.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          {SERVICES.map((service, idx) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: idx * 0.06 }}
              className="group relative min-h-[230px] overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.18)]"
            >
              <div className="absolute inset-x-6 top-8 h-1 rounded-full bg-white/10" />
              <div className="absolute -left-14 -top-14 h-32 w-32 rounded-full bg-primary/25 blur-3xl transition group-hover:bg-success/30" />
              <div className="relative flex h-full flex-col justify-between">
                <LaundryIcon name={service.icon} alt={service.title} className="h-20 w-20 drop-shadow-xl" />
                <div>
                  <h3 className="mb-2 text-xl font-black">{service.title}</h3>
                  <p className="text-sm font-black text-success">{service.description}</p>
                </div>
              </div>
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
    { id: 'men', label: 'رجال' },
    { id: 'women', label: 'نساء' },
    { id: 'kids', label: 'أطفال' },
    { id: 'home', label: 'منزلية' },
  ];

  const serviceTypes = [
    { id: 'wash_dry', label: 'غسيل وتنشيف' },
    { id: 'iron', label: 'كوي فقط' },
    { id: 'wash_iron', label: 'غسيل وكوي' },
    { id: 'dry', label: 'تنظيف جاف' },
  ];

  const filteredPrices = prices.filter((item) => item.category === activeTab && item.active !== false);

  return (
    <section id="pricing" className="relative overflow-hidden bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 grid gap-6 md:grid-cols-[0.8fr_1.2fr] md:items-end">
          <div className="text-right">
            <p className="mb-3 text-sm font-black text-primary">الأسعار</p>
            <h2 className="text-balance text-4xl font-black leading-tight text-secondary md:text-6xl">
              اختر الخدمة وشاهد السعر فوراً.
            </h2>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-brand-bg p-3">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                    activeTab === tab.id ? 'bg-secondary text-white shadow-lg' : 'text-slate-500 hover:bg-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-10 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {serviceTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setServiceType(type.id as typeof serviceType)}
              className={`whitespace-nowrap rounded-full border px-5 py-3 text-xs font-black transition ${
                serviceType === type.id
                  ? 'border-primary bg-primary text-white shadow-[0_14px_35px_rgba(143,0,255,0.22)]'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-primary/30'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeTab}-${serviceType}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredPrices.map((item, idx) => {
              const priceValue = item[serviceType as keyof PricingItem];
              if (!priceValue || priceValue === 0 || priceValue === '0' || priceValue === '') return null;

              return (
                <motion.div
                  key={`${item.barcode}-${serviceType}`}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.025 }}
                  className="group flex items-center justify-between gap-4 rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_14px_44px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_24px_70px_rgba(143,0,255,0.11)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fbf4ff] transition group-hover:scale-105">
                      <LaundryIcon
                        name={resolvePricingItemIcon(item)}
                        alt={item.name_ar}
                        className="h-14 w-14"
                      />
                    </div>
                    <div className="text-right">
                      <h4 className="text-lg font-black text-secondary">{item.name_ar}</h4>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.name_en}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-black text-primary">
                      {priceValue} <span className="text-xs">درهم</span>
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">للقطعة</div>
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

export const GallerySection: React.FC<{ items: { id: string; icon: string; label: string }[] }> = ({ items }) => {
  return (
    <section className="relative overflow-hidden bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl text-right">
            <p className="mb-3 text-sm font-black text-success">داخل المصبغة</p>
            <h2 className="text-balance text-4xl font-black leading-tight text-secondary md:text-6xl">
              تفاصيل صغيرة تصنع خروجاً مرتباً.
            </h2>
          </div>
          <p className="max-w-md text-sm font-semibold leading-7 text-slate-600 md:text-right">
            لمسات نظيفة من واقع العمل: أجهزة، ترميز، كوي، وتغليف يحافظ على الملابس حتى تصل.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: idx * 0.06 }}
              className={`relative overflow-hidden rounded-[30px] border border-slate-200 bg-brand-bg p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] ${
                idx === 0 || idx === 3 ? 'lg:col-span-2 lg:row-span-2 min-h-[260px]' : 'min-h-[190px]'
              }`}
            >
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-primary/10 to-transparent" />
              <div className="relative flex h-full flex-col justify-between">
                <LaundryIcon name={item.icon} alt={item.label} className="h-24 w-24 drop-shadow-sm" />
                <div>
                  <p className="text-xs font-black text-primary">0{idx + 1}</p>
                  <h3 className="mt-1 text-lg font-black text-secondary">{item.label}</h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const BranchesSection: React.FC<{ branches: Branch[] }> = ({ branches }) => {
  const activeBranches = branches.filter((branch) => branch.status === 'active');

  return (
    <section className="bg-brand-bg py-24" id="branches">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-black text-primary">الفروع</p>
          <h2 className="text-balance text-4xl font-black leading-tight text-secondary md:text-6xl">
            أقرب نقطة دخول لطلبك.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm font-semibold leading-7 text-slate-600">
            تواصل معنا أو ابدأ الطلب من الموقع، والفريق ينسق الاستلام والتسليم حسب الفرع الأقرب.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {activeBranches.map((branch, idx) => (
            <motion.div
              key={branch.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="rounded-[30px] border border-white bg-white p-7 shadow-[0_24px_70px_rgba(15,23,42,0.07)]"
            >
              <div className="mb-7 flex items-center justify-between gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_16px_34px_rgba(143,0,255,0.24)]">
                  <Icons.MapPin size={28} />
                </div>
                <span className="rounded-full bg-success/10 px-3 py-1 text-[11px] font-black text-success">متاح الآن</span>
              </div>
              <h3 className="mb-3 text-2xl font-black text-secondary">{branch.name}</h3>
              <p className="mb-6 text-sm font-semibold leading-7 text-slate-500">{branch.address}</p>
              <div className="space-y-3 border-t border-slate-100 pt-5">
                <p className="flex items-center justify-between gap-3 text-sm font-black text-secondary">
                  <span>{branch.phone}</span>
                  <Icons.Phone size={18} className="text-primary" />
                </p>
                <p className="flex items-center justify-between gap-3 text-sm font-black text-secondary">
                  <span>{branch.hours}</span>
                  <Icons.Clock size={18} className="text-primary" />
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
