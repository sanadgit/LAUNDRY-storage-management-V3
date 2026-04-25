import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, PackageOpen, Waves, CheckCircle, Truck, Search } from 'lucide-react';

import { SiteConfig } from '../types';

interface HeroProps {
  onTrackClick: () => void;
  onBookClick: () => void;
  config: SiteConfig;
}

export const Hero: React.FC<HeroProps> = ({ onTrackClick, onBookClick, config }) => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-brand-bg">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider mb-6">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            ✦ الجودة والسرعة في خدمة واحدة
          </div>
          <h1 className="text-5xl lg:text-7xl font-display font-extrabold leading-[1.2] text-gray-900 mb-6 drop-shadow-sm">
            {config.hero.title.split(' ').map((word, i) => i === 2 ? <span key={i} className="text-primary italic">{word} </span> : word + ' ')}
          </h1>
          <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-lg">
            {config.hero.subtitle}
          </p>

          <div className="flex flex-wrap gap-4">
            <button 
              onClick={onBookClick}
              className="flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-opacity-90 transition-all hover:shadow-xl active:scale-95 cursor-pointer shadow-lg shadow-primary/20"
            >
              {config.hero.cta_primary}
            </button>
            <button 
              onClick={onTrackClick}
              className="flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-2xl font-bold border border-gray-200 hover:border-primary transition-all hover:shadow-lg active:scale-95 cursor-pointer"
            >
              {config.hero.cta_secondary}
              <Search size={20} className="text-primary" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mt-12 pt-8 border-t border-gray-100">
            <div className="text-center">
              <div className="text-3xl font-black text-primary italic">{config.stats.delivery_hours}</div>
              <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">{config.stats.delivery_label}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-secondary italic">{config.stats.satisfied_customers}</div>
              <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">{config.stats.satisfied_label}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-primary italic">{config.stats.process_steps}</div>
              <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">مراحل متكاملة</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-secondary italic">{config.stats.satisfaction_rate}</div>
              <div className="text-[10px] text-gray-500 font-bold uppercase mt-1">نسبة الرضا</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative"
        >
          {/* Animated Journey Visual */}
          <div className="relative aspect-square max-w-[500px] mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-[3rem] -rotate-6" />
            <div className="absolute inset-0 glass rounded-[3rem] shadow-2xl flex flex-col justify-center gap-8 p-12 translate-x-6 translate-y-6">
              
              {/* Step 1: IN */}
              <motion.div 
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center gap-6"
              >
                <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
                  <PackageOpen size={32} />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900 italic">IN</h3>
                  <p className="text-sm text-gray-500 font-medium">Receiving & Sorting</p>
                </div>
              </motion.div>

              {/* Connector */}
              <div className="ml-8 w-0.5 h-12 bg-gradient-to-b from-primary to-secondary opacity-20" />

              {/* Step 2: & */}
              <motion.div 
                animate={{ x: [0, -5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center gap-6"
              >
                <div className="w-16 h-16 bg-secondary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-secondary/30">
                  <Waves size={32} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-900 italic">&</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-bold uppercase">Wash</span>
                    <span className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-bold uppercase">Iron</span>
                    <span className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-bold uppercase">Pack</span>
                  </div>
                </div>
              </motion.div>

              {/* Connector */}
              <div className="ml-8 w-0.5 h-12 bg-gradient-to-b from-secondary to-success opacity-20" />

              {/* Step 3: OUT */}
              <motion.div 
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="flex items-center gap-6"
              >
                <div className="w-16 h-16 bg-success text-white rounded-2xl flex items-center justify-center shadow-lg shadow-success/30">
                  <Truck size={32} />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900 italic">OUT</h3>
                  <p className="text-sm text-gray-500 font-medium">Ready & Delivered</p>
                </div>
              </motion.div>

              {/* Floating elements */}
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-10 -right-10 w-32 h-32 glass rounded-3xl hidden md:flex flex-col items-center justify-center p-4 border-primary/20"
              >
                <span className="text-2xl font-bold text-primary italic">98%</span>
                <span className="text-[10px] text-gray-500 text-center font-bold uppercase">Visibility Rate</span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
