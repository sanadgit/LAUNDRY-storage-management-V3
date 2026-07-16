import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { SERVICES } from '../constants';
import { Branch, PricingItem } from '../types';
import { LaundryIcon, resolvePricingItemIcon } from './LaundryIcon';
import { SiteLanguage, formatCurrency, localize } from '../lib/i18n';

const SERVICE_COPY_EN: Record<string, { title: string; description: string }> = {
  wash: { title: 'Regular Wash', description: 'From AED 2' },
  dry: { title: 'Dry Cleaning', description: 'From AED 15' },
  iron: { title: 'Iron Only', description: 'From AED 3' },
  bedding: { title: 'Linens & Blankets', description: 'From AED 20' },
  dresses: { title: 'Evening Dresses', description: 'From AED 30' },
};

const GALLERY_LABEL_EN: Record<string, string> = {
  '1': 'Industrial Washers',
  '2': 'Order Pickup',
  '3': 'Steam Ironing',
  '4': 'Packing & Delivery',
  '5': 'Garment Tagging',
  '6': 'Dry Cleaning',
};

export const ServicesGrid: React.FC<{ language?: SiteLanguage }> = ({ language = 'ar' }) => {
  return (
    <section className="relative overflow-hidden bg-secondary py-24 text-white">
      <div className="absolute inset-0 opacity-[0.08] hero-grid" />
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 grid gap-6 md:grid-cols-[1fr_0.9fr] md:items-end">
          <div className="text-right">
            <p className="mb-3 text-sm font-black text-success">{localize(language, 'خدماتنا', 'Services')}</p>
            <h2 className="text-balance text-4xl font-black leading-tight md:text-6xl">
              {localize(language, 'خدمات الغسيل تتحرك في خط واحد واضح.', 'Laundry services in one clear flow.')}
            </h2>
          </div>
          <p className="text-sm font-semibold leading-7 text-white/62 md:text-right">
            {localize(language, 'من الملابس اليومية إلى المفارش والقطع الحساسة، كل خدمة تدخل نفس نظام العناية والتتبع.', 'From daily garments to delicate pieces and home linens, every service follows the same care and tracking system.')}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          {SERVICES.map((service, idx) => (
            (() => {
              const serviceCopy = language === 'ar' ? service : SERVICE_COPY_EN[service.id] ?? service;
              return (
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
                <LaundryIcon name={service.icon} alt={serviceCopy.title} className="h-20 w-20 drop-shadow-xl" />
                <div>
                  <h3 className="mb-2 text-xl font-black">{serviceCopy.title}</h3>
                  <p className="text-sm font-black text-success">{serviceCopy.description}</p>
                </div>
              </div>
            </motion.div>
              );
            })()
          ))}
        </div>
      </div>
    </section>
  );
};

export const PricingSection: React.FC<{ pricing?: PricingItem[]; language?: SiteLanguage }> = ({ pricing, language = 'ar' }) => {
  const [activeTab, setActiveTab] = useState<'men' | 'women' | 'kids' | 'home'>('men');
  const [serviceType, setServiceType] = useState<'wash_dry' | 'iron' | 'wash_iron' | 'dry'>('wash_dry');
  const [prices, setPrices] = useState<PricingItem[]>(pricing || []);

  useEffect(() => {
    if (pricing) setPrices(pricing);
  }, [pricing]);

  const tabs = [
    { id: 'men', label: localize(language, 'رجال', 'Men') },
    { id: 'women', label: localize(language, 'نساء', 'Women') },
    { id: 'kids', label: localize(language, 'أطفال', 'Kids') },
    { id: 'home', label: localize(language, 'منزلية', 'Home') },
  ];

  const serviceTypes = [
    { id: 'wash_dry', label: localize(language, 'غسيل وتنشيف', 'Wash & Dry') },
    { id: 'iron', label: localize(language, 'كوي فقط', 'Iron Only') },
    { id: 'wash_iron', label: localize(language, 'غسيل وكوي', 'Wash & Iron') },
    { id: 'dry', label: localize(language, 'تنظيف جاف', 'Dry Clean') },
  ];

  const filteredPrices = prices.filter((item) => item.category === activeTab && item.active !== false);

  return (
    <section id="pricing" className="relative overflow-hidden bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 grid gap-6 md:grid-cols-[0.8fr_1.2fr] md:items-end">
          <div className="text-right">
            <p className="mb-3 text-sm font-black text-primary">{localize(language, 'الأسعار', 'Pricing')}</p>
            <h2 className="text-balance text-4xl font-black leading-tight text-secondary md:text-6xl">
              {localize(language, 'اختر الخدمة وشاهد السعر فوراً.', 'Choose a service and see the price instantly.')}
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
                  ? 'border-primary bg-primary text-white shadow-[0_14px_35px_rgba(89,46,242,0.22)]'
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
                  className="group flex items-center justify-between gap-4 rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_14px_44px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_24px_70px_rgba(89,46,242,0.11)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F4F1FF] transition group-hover:scale-105">
                      <LaundryIcon
                        name={resolvePricingItemIcon(item)}
                        alt={item.name_ar}
                        className="h-14 w-14"
                      />
                    </div>
                    <div className="text-right">
                      <h4 className="text-lg font-black text-secondary">{language === 'ar' ? item.name_ar : item.name_en}</h4>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.name_en}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-black text-primary">
                      {formatCurrency(language, Number(priceValue))}
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{localize(language, 'للقطعة', 'Per Item')}</div>
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

export const GallerySection: React.FC<{ items: { id: string; icon: string; label: string }[]; language?: SiteLanguage }> = ({ items, language = 'ar' }) => {
  return (
    <section className="relative overflow-hidden bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl text-right">
            <p className="mb-3 text-sm font-black text-success">{localize(language, 'داخل المصبغة', 'Inside the Laundry')}</p>
            <h2 className="text-balance text-4xl font-black leading-tight text-secondary md:text-6xl">
              {localize(language, 'تفاصيل صغيرة تصنع خروجاً مرتباً.', 'Small details make every order leave neatly.')}
            </h2>
          </div>
          <p className="max-w-md text-sm font-semibold leading-7 text-slate-600 md:text-right">
            {localize(language, 'لمسات نظيفة من واقع العمل: أجهزة، ترميز، كوي، وتغليف يحافظ على الملابس حتى تصل.', 'Real workflow details: machines, tagging, ironing, and packing that protects clothes until delivery.')}
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
                <LaundryIcon name={item.icon} alt={language === 'ar' ? item.label : GALLERY_LABEL_EN[item.id] ?? item.label} className="h-24 w-24 drop-shadow-sm" />
                <div>
                  <p className="text-xs font-black text-primary">0{idx + 1}</p>
                  <h3 className="mt-1 text-lg font-black text-secondary">{language === 'ar' ? item.label : GALLERY_LABEL_EN[item.id] ?? item.label}</h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export const BranchesSection: React.FC<{ branches: Branch[]; language?: SiteLanguage }> = ({ branches, language = 'ar' }) => {
  const activeBranches = branches.filter((branch) => branch.status === 'active');

  return (
    <section className="bg-brand-bg py-24" id="branches">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-black text-primary">{localize(language, 'الفروع', 'Branches')}</p>
          <h2 className="text-balance text-4xl font-black leading-tight text-secondary md:text-6xl">
            {localize(language, 'أقرب نقطة دخول لطلبك.', 'The closest starting point for your order.')}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm font-semibold leading-7 text-slate-600">
            {localize(language, 'تواصل معنا أو ابدأ الطلب من الموقع، والفريق ينسق الاستلام والتسليم حسب الفرع الأقرب.', 'Contact us or start an order online, and the team will coordinate pickup and delivery through the nearest branch.')}
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
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_16px_34px_rgba(89,46,242,0.24)]">
                  <Icons.MapPin size={28} />
                </div>
                <span className="rounded-full bg-success/10 px-3 py-1 text-[11px] font-black text-success">{localize(language, 'متاح الآن', 'Available')}</span>
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
