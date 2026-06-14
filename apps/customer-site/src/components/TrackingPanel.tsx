import React from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, Calendar, Layers, Clock, CheckCircle, Package } from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { ORDER_STATUS_LABEL_AR } from '../lib/orders';
import { LaundryIcon } from './LaundryIcon';

interface TrackingPanelProps {
  order: Order | null;
  onSearch: (id: string) => void;
}

export const TrackingPanel: React.FC<TrackingPanelProps> = ({ order, onSearch }) => {
  const [searchValue, setSearchValue] = React.useState('');

  const statusStages = [
    { label: 'تم الاستلام', icon: 'pickup_van' },
    { label: 'تم إدخال البيانات في النظام', icon: 'garment_tag' },
    { label: 'الغسيل والكوي جارٍ الآن', icon: 'washing_machine', active: true },
    { label: 'الفرز والتغليف', icon: 'sorting_rack' },
    { label: 'التخزين المؤقت', icon: 'laundry_bag' },
    { label: 'التسليم للعميل', icon: 'delivery_scooter' }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-12 text-right">
      <div className="text-center mb-12">
        <LaundryIcon
          name="outty-tracking-phone"
          alt=""
          className="mx-auto mb-4 h-28 w-28 rounded-[2rem] bg-white/70 p-2 shadow-2xl shadow-primary/10"
          imageClassName="h-full w-full rounded-3xl object-contain"
        />
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 italic">تتبع <span className="text-primary italic">طلبك</span></h1>
        <p className="text-gray-500 font-medium max-w-lg mx-auto">ادخل رقم الطلب لمعرفة مرحلته الحالية في رحلة العناية بملابسك.</p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-12">
        <div className="glass p-2 rounded-3xl flex items-center gap-2 shadow-2xl shadow-primary/5">
          <input 
            type="text" 
            placeholder="رقم الطلب (مثال: INO-2024-1048)"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="flex-1 bg-transparent border-none focus:ring-0 px-6 py-4 text-lg font-bold placeholder:text-gray-300 text-right"
          />
          <button 
            onClick={() => onSearch(searchValue)}
            className="bg-primary text-white p-4 rounded-2xl hover:bg-opacity-90 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Search size={24} />
            <span className="hidden sm:inline font-bold">تتبع الآن</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {order ? (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Order Info Card */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="glass p-6 rounded-3xl border-r-4 border-r-primary">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">رقم الطلب</p>
                <p className="text-xl font-bold font-display tracking-tight">{order.id}</p>
              </div>
              <div className="glass p-6 rounded-3xl">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">القطع</p>
                <div className="flex items-center gap-2">
                  <Layers size={18} className="text-primary" />
                  <p className="text-xl font-bold font-display">{order.itemCount} قطع</p>
                </div>
              </div>
              <div className="glass p-6 rounded-3xl">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">الخدمة</p>
                <p className="text-sm font-bold text-gray-700">{order.serviceType}</p>
              </div>
              <div className="glass p-6 rounded-3xl bg-gray-900 text-white">
                <p className="text-[10px] text-white/60 font-bold uppercase mb-1">موعد الاستلام</p>
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-primary" />
                  <p className="text-sm font-bold">{order.eta}</p>
                </div>
              </div>
            </div>

            {/* Vertical Timeline */}
            <div className="glass p-8 md:p-12 rounded-[3rem] relative overflow-hidden">
               <div className="mb-8 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                  <div className="flex items-center gap-3">
                    <LaundryIcon
                      name="outty-washing-machine"
                      alt=""
                      className="h-14 w-14 animate-pulse rounded-2xl bg-white/70 p-1"
                      imageClassName="h-full w-full rounded-xl object-contain"
                    />
                    <p className="text-primary font-bold text-lg italic">ملابسك حالياً في مرحلة {ORDER_STATUS_LABEL_AR[order.status] ?? order.status}</p>
                  </div>
               </div>

               <div className="space-y-0">
                  {statusStages.map((stage, idx) => {
                    const isDone = idx < 2; // Mock logic for visual matches
                    const isActive = idx === 2;
                    
                    return (
                      <div key={idx} className="flex gap-6 relative">
                        {/* Timeline Column */}
                        <div className="flex flex-col items-center">
                          <div className={`w-6 h-6 rounded-full border-4 flex-shrink-0 transition-all duration-500 z-10 ${
                            isDone ? 'bg-primary border-primary shadow-lg shadow-primary/20' : 
                            isActive ? 'bg-white border-primary animate-pulse' : 'bg-gray-100 border-gray-100'
                          }`} />
                          {idx < statusStages.length - 1 && (
                            <div className={`w-0.5 flex-1 min-h-[40px] ${isDone ? 'bg-primary' : 'bg-gray-100'}`} />
                          )}
                        </div>

                        {/* Info Column */}
                        <div className={`pb-8 flex-1 ${isActive ? 'scale-105' : ''} transition-all`}>
                          <div className="flex items-center gap-2 mb-1">
                            <LaundryIcon name={stage.icon} alt="" className="h-8 w-8" />
                            <h4 className={`text-sm font-bold ${isActive ? 'text-primary' : isDone ? 'text-gray-900' : 'text-gray-400'}`}>
                              {stage.label}
                            </h4>
                          </div>
                          <p className="text-[10px] text-gray-400 font-medium">
                            {isDone ? 'تم التنفيذ بنجاح' : isActive ? 'جاري العمل الآن...' : 'قريباً'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
               </div>
            </div>

            {/* Support Info */}
            <div className="glass p-8 rounded-[2.5rem] bg-success/5 border-success/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-success text-white rounded-2xl flex items-center justify-center">
                    <MapPin size={24} />
                 </div>
                 <div>
                    <h5 className="font-bold text-gray-900">فرع الاستلام</h5>
                    <p className="text-xs text-gray-500">{order.branch}</p>
                 </div>
              </div>
              <button className="text-success font-bold text-sm hover:underline cursor-pointer">
                تواصل مع الفرع
              </button>
            </div>
          </motion.div>
        ) : searchValue && (
           <div className="text-center py-20">
             <LaundryIcon
               name="outty-empty-state"
               alt=""
               className="mx-auto mb-4 h-28 w-28 rounded-[2rem] bg-white/70 p-2 shadow-xl shadow-primary/10"
               imageClassName="h-full w-full rounded-3xl object-contain"
             />
             <p className="text-gray-500 font-bold">عذراً، لم نجد طلب بهذا الرقم {searchValue}</p>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
};

import { AnimatePresence } from 'motion/react';
