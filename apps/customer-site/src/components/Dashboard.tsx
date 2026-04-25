import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, ShoppingBag, MapPin, FileText, Settings, LogOut, 
  TrendingUp, CheckCircle2, Clock, Crown, ArrowUpRight, Info, ChevronLeft, ChevronRight,
  Package, X
} from 'lucide-react';
import { MOCK_ORDERS, JOURNEY_STEPS } from '../constants';
import { Order } from '../types';

interface DashboardProps {
  orders: Order[];
  onNewOrderClick: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ orders, onNewOrderClick }) => {
  const activeOrder = orders[0];
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(2); // Default to Ironing (index 2)
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [filterTab, setFilterTab] = useState<'All' | 'Delivered' | 'Active' | 'Cancelled'>('All');

  const filteredOrders = orders.filter(order => {
    if (filterTab === 'All') return true;
    if (filterTab === 'Delivered') return order.status === 'Delivered';
    if (filterTab === 'Cancelled') return order.status === 'Cancelled';
    if (filterTab === 'Active') return order.status !== 'Delivered' && order.status !== 'Cancelled';
    return true;
  });

  const sidebarItems = [
    { label: 'الرئيسية', icon: LayoutDashboard, active: true },
    { label: 'طلباتي', icon: ShoppingBag },
    { label: 'العناوين', icon: MapPin },
    { label: 'الفواتير', icon: FileText },
    { label: 'الملف الشخصي', icon: Settings },
  ];

  return (
    <div className="pt-24 min-h-screen bg-brand-bg flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col p-8 border-r border-gray-200">
        <div className="flex items-center gap-3 mb-12 p-3 bg-white rounded-2xl shadow-sm">
          <div className="w-12 h-12 bg-primary rounded-xl overflow-hidden">
            <img src="https://picsum.photos/seed/user/200/200" alt="User" />
          </div>
          <div>
            <p className="font-bold text-gray-900 leading-tight">Saleh Ahmed</p>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1">
              <Crown size={10} /> Gold Member
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all cursor-pointer ${
                item.active 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <button className="flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-danger hover:bg-danger/5 transition-all mt-auto cursor-pointer">
          <LogOut size={20} />
          تسجيل الخروج
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 text-right">
            <div className="w-full">
              <h1 className="text-3xl font-extrabold mb-2 italic">أهلاً بك مرة أخرى، <span className="text-primary italic">صالح</span></h1>
              <p className="text-gray-500 font-medium tracking-tight">إليك نظرة سريعة على حالة طلباتك اليوم.</p>
            </div>
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex gap-2">
              <button 
                onClick={onNewOrderClick}
                className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-lg cursor-pointer whitespace-nowrap"
              >
                طلب جديد
              </button>
              <button className="px-6 py-3 bg-primary/10 text-primary rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap">إعادة طلب سابق</button>
            </div>
          </header>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'طلبات نشطة', value: '٠٣', icon: Clock, color: 'text-secondary' },
              { label: 'طلب مكتمل', value: '٤٢', icon: CheckCircle2, color: 'text-success' },
              { label: 'إجمالي الإنفاق', value: '١,٢٠٠ درهم', icon: TrendingUp, color: 'text-primary' },
              { label: 'نقاط الولاء', value: '١,٢٥٠', icon: Crown, color: 'text-amber-500' }
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50 group hover:shadow-xl transition-all"
              >
                <div className={`${stat.color} mb-4 flex justify-between items-center`}>
                  <stat.icon size={24} />
                  <ArrowUpRight size={16} className="text-gray-300 group-hover:text-primary transition-colors" />
                </div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-extrabold font-display leading-tight">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Sections */}
          <div className="grid grid-cols-1 gap-12 text-right">
            {/* Active Order Widget - Enhanced Interactive Timeline */}
            <section className="bg-gray-900 text-white rounded-[3rem] p-8 md:p-12 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
              
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-6">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 bg-primary rounded-full mb-4 inline-block">تتبع مباشر</span>
                    <h2 className="text-3xl font-extrabold italic leading-tight">طلبك حالياً في مرحلة <span className="text-primary italic">{JOURNEY_STEPS[2].label}</span></h2>
                    <p className="text-white/40 text-sm mt-1 font-medium">اضغط على الأيقونات أدناه لمعرفة تفاصيل كل مرحلة.</p>
                  </div>
                  <div className="md:text-left text-right bg-white/5 p-4 rounded-2xl border border-white/10 min-w-[140px]">
                    <p className="text-white/40 text-[10px] font-bold uppercase mb-1">رقم الطلب</p>
                    <p className="text-2xl font-bold font-display tracking-tight text-primary">#{activeOrder.id}</p>
                  </div>
                </div>

                {/* Interactive Timeline Grid */}
                <div className="relative mb-12">
                   {/* Connection Line Background */}
                   <div className="absolute top-6 left-0 right-0 h-1 bg-white/10 z-0 hidden md:block" />
                   
                   <div className="grid grid-cols-3 md:grid-cols-6 gap-4 relative z-10">
                      {JOURNEY_STEPS.map((step, idx) => {
                        const isCurrent = idx === 2; // Fixed for now for demo purposes
                        const isCompleted = idx < 2;
                        const isSelected = selectedStepIndex === idx;

                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedStepIndex(idx)}
                            className="flex flex-col items-center gap-4 group cursor-pointer outline-none"
                          >
                            <motion.div 
                              animate={isSelected ? { scale: 1.25, y: -5 } : { scale: 1, y: 0 }}
                              className={`
                                w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-300
                                ${isCurrent ? 'bg-primary text-white shadow-[0_0_20px_rgba(162,62,251,0.5)] ring-2 ring-primary ring-offset-4 ring-offset-gray-900 animate-pulse' : 
                                  isCompleted ? 'bg-success/20 text-success border-2 border-success/30' : 
                                  'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'}
                                ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-gray-900 z-20' : ''}
                              `}
                            >
                              {isCompleted ? <CheckCircle2 size={24} /> : <span>{step.key}</span>}
                            </motion.div>
                            <span className={`
                              text-[11px] font-bold uppercase tracking-tight transition-colors duration-300
                              ${isSelected ? 'text-primary' : isCurrent ? 'text-primary' : isCompleted ? 'text-success' : 'text-white/40'}
                            `}>
                              {step.label}
                            </span>
                          </button>
                        );
                      })}
                   </div>
                </div>

                {/* Step Details Display */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedStepIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="glass border-white/10 p-6 md:p-8 rounded-[2.5rem] bg-white/[0.03] backdrop-blur-md"
                  >
                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                      <div className="w-16 h-16 bg-primary/20 rounded-3xl flex items-center justify-center text-3xl flex-shrink-0">
                        {JOURNEY_STEPS[selectedStepIndex].key}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h4 className="text-xl font-bold">{JOURNEY_STEPS[selectedStepIndex].fullLabel}</h4>
                          <div className="flex gap-2">
                             {JOURNEY_STEPS[selectedStepIndex].chips.map(chip => (
                               <span key={chip} className="text-[9px] font-black uppercase px-2 py-0.5 bg-white/10 rounded-lg text-primary">{chip}</span>
                             ))}
                          </div>
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed font-medium">
                          {JOURNEY_STEPS[selectedStepIndex].note}
                        </p>
                      </div>
                      <div className="w-full md:w-auto bg-primary/10 p-4 rounded-2xl border border-primary/20 text-center flex flex-col justify-center min-w-[180px]">
                        <p className="text-white/40 text-[10px] font-bold mb-1 uppercase tracking-widest">الموعد المتوقع</p>
                        <p className="text-xl font-bold">{activeOrder.eta}</p>
                        <button className="mt-3 text-[10px] font-bold text-primary hover:underline cursor-pointer uppercase tracking-widest">تتبع كلي</button>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Additional Info: Address & Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  {/* Address Section */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/5 rounded-3xl p-6 border border-white/10 flex items-start gap-4"
                  >
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-white/40 text-[10px] font-bold uppercase mb-1 tracking-widest">عنوان التسليم</p>
                      <p className="text-sm font-medium leading-relaxed">{activeOrder.deliveryAddress || 'لم يتم تحديد عنوان'}</p>
                    </div>
                  </motion.div>

                  {/* Items Summary Section */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/5 rounded-3xl p-6 border border-white/10 flex items-start gap-4"
                  >
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                      <Package size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-white/40 text-[10px] font-bold uppercase mb-1 tracking-widest">محتويات الطلب ({activeOrder.itemCount} قطع)</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {activeOrder.bags.flatMap(b => b.items).slice(0, 4).map((item, i) => (
                          <span key={i} className="text-[10px] px-2 py-1 bg-white/5 rounded-lg border border-white/5">
                            {item}
                          </span>
                        ))}
                        {activeOrder.itemCount > 4 && (
                          <span className="text-[10px] px-2 py-1 bg-white/5 rounded-lg border border-white/5 text-primary">+{activeOrder.itemCount - 4} أخرى</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* Recent Orders Table */}
            <section>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h3 className="text-xl font-bold italic tracking-tight">النشاط <span className="text-gray-400 text-sm">الأخير</span></h3>
                
                {/* Status Filters */}
                <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 gap-1 self-start">
                   {[
                     { id: 'All', label: 'الكل' },
                     { id: 'Active', label: 'قيد التنفيذ' },
                     { id: 'Delivered', label: 'مكتمل' },
                     { id: 'Cancelled', label: 'ملغي' }
                   ].map(tab => (
                     <button
                       key={tab.id}
                       onClick={() => setFilterTab(tab.id as any)}
                       className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                         filterTab === tab.id 
                           ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                           : 'text-gray-500 hover:bg-gray-50'
                       }`}
                     >
                       {tab.label}
                     </button>
                   ))}
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto text-sm">
                  <table className="w-full text-right">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-8 py-5 font-bold uppercase text-[10px] tracking-widest text-gray-400">رقم الطلب</th>
                        <th className="px-8 py-5 font-bold uppercase text-[10px] tracking-widest text-gray-400">التاريخ</th>
                        <th className="px-8 py-5 font-bold uppercase text-[10px] tracking-widest text-gray-400">الخدمة</th>
                        <th className="px-8 py-5 font-bold uppercase text-[10px] tracking-widest text-gray-400">الحالة</th>
                        <th className="px-8 py-5 font-bold uppercase text-[10px] tracking-widest text-gray-400 text-left">الإجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                          <td className="px-8 py-6 font-bold text-gray-900 group-hover:text-primary transition-colors">#{order.id}</td>
                          <td className="px-8 py-6 text-gray-500 font-medium">{order.dateReceived}</td>
                          <td className="px-8 py-6 text-gray-900 font-medium whitespace-nowrap">{order.serviceType}</td>
                          <td className="px-8 py-6">
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${
                              order.status === 'Delivered' ? 'bg-success/10 text-success' :
                              order.status === 'Cancelled' ? 'bg-danger/10 text-danger' :
                              'bg-primary/10 text-primary'
                            }`}>
                              {order.status === 'Delivered' ? 'تم التسليم' :
                               order.status === 'Cancelled' ? 'ملغي' :
                               'قيد التنفيذ'}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-left">
                             <button 
                               onClick={() => setViewingOrder(order)}
                               className="text-primary font-bold hover:underline cursor-pointer"
                             >
                               تفاصيل
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {filteredOrders.length === 0 && (
                    <div className="p-20 text-center">
                       <p className="text-gray-400 font-bold">لا توجد طلبات في هذه الفئة حالياً</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Order Details Modal */}
      <AnimatePresence>
        {viewingOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-hidden">
             {/* Backdrop */}
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setViewingOrder(null)}
               className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
             />

             {/* Modal Content */}
             <motion.div
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl shadow-primary/20 overflow-hidden flex flex-col max-h-[90vh]"
             >
                {/* Header */}
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                   <div className="text-right">
                      <h3 className="text-2xl font-black italic">تفاصيل <span className="text-primary italic">الطلب</span></h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">الرقم المرجعي: {viewingOrder.id}</p>
                   </div>
                   <button 
                     onClick={() => setViewingOrder(null)}
                     className="w-12 h-12 glass shadow-lg flex items-center justify-center rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer"
                   >
                     <X size={24} className="text-gray-900" />
                   </button>
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto space-y-8 text-right">
                   {/* Status & Date */}
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-2xl">
                         <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">حالة الطلب</p>
                         <span className="text-success font-bold flex items-center gap-2">
                           <CheckCircle2 size={16} /> مكتمل
                         </span>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-2xl">
                         <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">تاريخ الاستلام</p>
                         <p className="font-bold text-gray-900">{viewingOrder.dateReceived}</p>
                      </div>
                   </div>

                   {/* Address */}
                   <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 flex gap-4 items-start">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm flex-shrink-0">
                         <MapPin size={22} />
                      </div>
                      <div className="flex-1">
                         <p className="text-[10px] font-bold text-primary uppercase mb-1">عنوان التسليم</p>
                         <p className="text-sm font-bold text-gray-900 leading-relaxed">{viewingOrder.deliveryAddress}</p>
                      </div>
                   </div>

                   {/* Bags & Items */}
                   <div className="space-y-4">
                      <h4 className="text-lg font-bold flex items-center gap-2">
                        <Package size={20} className="text-primary" />
                        محتويات الأكياس
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {viewingOrder.bags.map((bag, idx) => (
                           <div key={idx} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                              <p className="font-black text-xs text-primary uppercase mb-4 tracking-widest flex items-center justify-between">
                                {bag.label}
                                <span className="bg-primary/10 px-2 py-0.5 rounded-lg">{bag.items.length} قطع</span>
                              </p>
                              <ul className="space-y-3">
                                 {bag.items.map((item, i) => (
                                   <li key={i} className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                      <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                                      {item}
                                   </li>
                                 ))}
                              </ul>
                           </div>
                         ))}
                      </div>
                   </div>

                   {/* Summary */}
                   <div className="bg-gray-900 text-white p-8 rounded-[2.5rem] flex justify-between items-center">
                      <div>
                         <p className="text-white/40 text-[10px] font-bold uppercase mb-1 leading-none">إجمالي الدفع</p>
                         <p className="text-3xl font-black font-display italic leading-none">٤٥.٠٠ <span className="text-primary tracking-tighter">درهم</span></p>
                      </div>
                      <button className="bg-primary text-white px-8 py-3 rounded-2xl font-bold hover:bg-opacity-90 transition-all cursor-pointer">تحميل الفاتورة</button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
