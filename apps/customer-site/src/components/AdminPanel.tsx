import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, ClipboardList, Banknote, Image as ImageIcon, 
  MapPin, Truck, Users, Gift, Settings, 
  Bell, Search, Eye, Pencil, Trash2, 
  Plus, Check, X, LogOut, LayoutDashboard,
  Smartphone, MessageCircle, Globe, ToggleRight,
  ChevronLeft, ImagePlus, FolderOpen, Clock, CheckCircle2
} from 'lucide-react';
import { SiteConfig, PricingItem, Order, Driver } from '../types';

interface AdminPanelProps {
  config: SiteConfig;
  onConfigChange: (config: SiteConfig) => void;
  orders: Order[];
  onOrdersChange: (orders: Order[]) => void;
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
  config, onConfigChange, orders, onOrdersChange, onLogout 
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [localConfig, setLocalConfig] = useState<SiteConfig>(config);
  const [isChanged, setIsChanged] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  
  // Pricing tab extensions
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleConfigUpdate = (updates: Partial<SiteConfig>) => {
    setLocalConfig(prev => ({ ...prev, ...updates }));
    setIsChanged(true);
  };

  const saveChanges = () => {
    onConfigChange(localConfig);
    setIsChanged(false);
    showToast('✓ تم حفظ جميع التغييرات بنجاح');
  };

  const cancelChanges = () => {
    setLocalConfig(config);
    setIsChanged(false);
    showToast('تم إلغاء التغييرات');
  };

  const renderStats = () => {
    const totalRevenue = orders.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const inProgress = orders.filter(o => ['new', 'waiting', 'washing'].includes(o.status)).length;
    const ready = orders.filter(o => o.status === 'ready').length;

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'إجمالي الطلبات', val: orders.length.toString(), icon: <ClipboardList size={20} />, change: 'الكل', color: 'text-primary' },
          { label: 'إجمالي الإيرادات', val: `${totalRevenue} د`, icon: <Banknote size={20} />, change: 'حتى الآن', color: 'text-success' },
          { label: 'قيد التنفيذ', val: inProgress.toString(), icon: <Truck size={20} />, change: `${ready} جاهز`, color: 'text-amber-500' },
          { label: 'العملاء', val: new Set(orders.map(o => o.customerName)).size.toString(), icon: <Users size={20} />, change: 'نشطون', color: 'text-sky-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-gray-50 ${stat.color}`}>{stat.icon}</div>
              <span className={`text-[10px] font-black ${stat.color} bg-white px-2 py-1 rounded-lg border border-gray-100 shadow-sm`}>{stat.change}</span>
            </div>
            <div className="text-2xl font-black text-gray-900 mb-1">{stat.val}</div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-brand-bg font-sans rtl">
      {/* SIDEBAR */}
      <aside className="w-full lg:w-64 bg-secondary text-white flex flex-col p-6 gap-8 relative z-50">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center font-black text-xl italic shadow-lg shadow-primary/20">I&O</div>
            <span className="text-xl font-black italic">In & Out</span>
          </div>
          <div className="text-[10px] font-bold text-primary tracking-[0.2em] uppercase">Control Panel</div>
        </div>

        <nav className="flex-1 space-y-1">
          <div className="text-[9px] font-black text-primary/40 uppercase tracking-widest mb-4 px-2">Main Menu</div>
          {[
            { id: 'dashboard', label: 'الإحصائيات', icon: <LayoutDashboard size={18} /> },
            { id: 'orders', label: 'الطلبات', icon: <ClipboardList size={18} />, badge: orders.length },
            { id: 'prices', label: 'الأسعار', icon: <Banknote size={18} /> },
            { id: 'content', label: 'المحتوى', icon: <ImageIcon size={18} /> },
            { id: 'branches', label: 'الفروع', icon: <MapPin size={18} /> },
            { id: 'drivers', label: 'السواقين', icon: <Truck size={18} /> },
            { id: 'offers', label: 'العروض', icon: <Gift size={18} /> },
            { id: 'settings', label: 'الإعدادات', icon: <Settings size={18} /> },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                activeTab === item.id 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'hover:bg-white/5 text-primary/60'
              }`}
            >
              {item.icon}
              <span className="text-sm font-bold flex-1 text-right">{item.label}</span>
              {item.badge && <span className="bg-primary-foreground text-primary text-[10px] font-black w-5 h-5 rounded-lg flex items-center justify-center">{item.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-white/5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-bold text-primary">A</div>
          <div className="flex-1">
            <div className="text-xs font-bold">Admin User</div>
            <div className="text-[10px] text-primary/40">sanad@inandout.ae</div>
          </div>
          <button onClick={onLogout} className="p-2 text-red-400 hover:bg-red-400/10 rounded-xl transition-all">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* TOPBAR */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40">
          <div>
            <h1 className="text-lg font-black text-gray-900 italic">
              {activeTab === 'dashboard' ? 'Overview' : activeTab.toUpperCase()}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell size={20} className="text-gray-400" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </div>
            <div className="h-8 w-px bg-gray-100" />
            <div className="text-[11px] font-bold text-gray-500 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
              ٢٢ أبريل ٢٠٢٥
            </div>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                {renderStats()}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/20">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-md font-black italic uppercase tracking-widest text-gray-400">Recent Orders</h3>
                      <button className="text-[10px] font-black text-primary underline">View All</button>
                    </div>
                    <div className="space-y-4">
                      {orders.slice(0, 5).map(order => (
                        <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-primary transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-[10px] text-gray-400 border border-gray-100 italic group-hover:text-primary group-hover:border-primary/20">{order.id.split('-').pop()}</div>
                            <div>
                              <div className="text-xs font-bold text-gray-900">{order.customerName}</div>
                              <div className="text-[10px] text-gray-400">{order.branch}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black bg-white px-3 py-1 rounded-full border border-gray-100 text-gray-500 italic lowercase">{order.status}</span>
                            <ChevronLeft size={16} className="text-gray-300" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/20">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-md font-black italic uppercase tracking-widest text-gray-400">Branch Status</h3>
                    </div>
                    <div className="space-y-6">
                      {['الفلاح', 'المصفح', 'محمد بن زايد'].map((branch, i) => (
                        <div key={i} className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0 pb-6 last:pb-0">
                          <div className="flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full ${i === 1 ? 'bg-amber-500' : 'bg-primary'} animate-pulse`} />
                            <div>
                              <div className="text-sm font-bold text-gray-900">{branch}</div>
                              <div className="text-[10px] text-gray-400">{i === 1 ? 'Busy' : 'Active'} — ٨ صباحاً : ١٠ مساءً</div>
                            </div>
                          </div>
                          <div className="w-20 h-2 bg-gray-50 rounded-full overflow-hidden">
                            <div className={`h-full ${i === 1 ? 'bg-amber-500 w-4/5' : 'bg-primary w-2/5'}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="bg-white px-8 py-4 rounded-[2rem] border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-black italic text-gray-900">إدارة الطلبات</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">عرض وتحديث جميع الطلبات</p>
                  </div>
                  <button 
                    onClick={() => showToast('سيتم فتح نظام إنشاء الطلبات قريباً')}
                    className="bg-primary text-white px-8 py-4 rounded-[2rem] font-black italic shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 cursor-pointer"
                  >
                    <Plus size={20} /> طلب جديد
                  </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'طلبات جديدة', val: orders.filter(o => o.status === 'new').length, icon: <Clock size={20} />, color: 'bg-primary/10 text-primary' },
                    { label: 'قيد الغسيل', val: orders.filter(o => o.status === 'washing').length, icon: <Truck size={20} />, color: 'bg-indigo-500/10 text-indigo-500' },
                    { label: 'جاهز للتسليم', val: orders.filter(o => o.status === 'ready').length, icon: <CheckCircle2 size={20} />, color: 'bg-success/10 text-success' },
                    { label: 'إجمالي المبيعات', val: `${orders.reduce((acc, curr) => acc + (curr.amount || 0), 0)} د`, icon: <Banknote size={20} />, color: 'bg-amber-500/10 text-amber-500' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/20 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
                        <h4 className="text-2xl font-black italic text-gray-900">{stat.val}</h4>
                      </div>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color}`}>
                        {stat.icon}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden">
                  {/* Filters & Search */}
                  <div className="p-8 border-b border-gray-50 flex flex-col lg:flex-row justify-between items-center gap-6">
                    <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100 w-full lg:w-auto overflow-x-auto no-scrollbar">
                      {[
                        { id: 'all', label: 'الكل' },
                        { id: 'new', label: 'جديد' },
                        { id: 'washing', label: 'غسيل' },
                        { id: 'ready', label: 'جاهز' },
                        { id: 'delivered', label: 'تسليم' },
                        { id: 'cancelled', label: 'ملغي' }
                      ].map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setOrderStatusFilter(f.id)}
                          className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                            orderStatusFilter === f.id
                              ? 'bg-white text-primary shadow-md'
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>

                    <div className="relative w-full lg:w-96">
                      <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input 
                        type="text"
                        placeholder="🔍 ابحث برقم الطلب أو اسم العميل…"
                        value={orderSearchQuery}
                        onChange={(e) => setOrderSearchQuery(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 p-4 pr-12 rounded-2xl font-bold text-sm outline-none focus:border-primary transition-all text-right"
                      />
                    </div>
                  </div>

                  {/* Orders Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50/50">
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">رقم</th>
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">العميل</th>
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">الفرع</th>
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">الخدمة</th>
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">الحالة</th>
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">الدفع</th>
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">المبلغ</th>
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">التاريخ</th>
                          <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {orders
                          .filter(order => {
                            if (orderStatusFilter !== 'all' && order.status !== orderStatusFilter) return false;
                            if (orderSearchQuery && !order.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) && !order.customerName.includes(orderSearchQuery)) return false;
                            return true;
                          })
                          .map((order) => {
                            const statusConfig: Record<string, { label: string, color: string, next?: string, nextLabel?: string }> = {
                              new: { label: 'جديد', color: 'bg-primary/10 text-primary', next: 'washing', nextLabel: 'بدء الغسيل' },
                              washing: { label: 'غسيل', color: 'bg-indigo-500/10 text-indigo-500', next: 'ready', nextLabel: 'جاهز للتسليم' },
                              ready: { label: 'جاهز', color: 'bg-success/10 text-success', next: 'delivered', nextLabel: 'تم التسليم' },
                              delivered: { label: 'تسليم', color: 'bg-gray-500/10 text-gray-500' },
                              cancelled: { label: 'ملغي', color: 'bg-danger/10 text-danger' },
                            };
                            const status = statusConfig[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-600', next: undefined, nextLabel: undefined };

                            const payStatus: Record<string, { label: string, color: string }> = {
                              paid: { label: 'مدفوع', color: 'text-success' },
                              unpaid: { label: 'غير مدفوع', color: 'text-danger' },
                              pending: { label: 'معلق', color: 'text-amber-500' }
                            };
                            const pStatus = payStatus[order.paymentStatus] || { label: '—', color: 'text-gray-400' };

                            return (
                              <tr key={order.id} className="hover:bg-gray-50/50 transition-all border-b border-gray-50 last:border-0 group">
                                <td className="p-6">
                                  <div className="flex flex-col">
                                    <span className="font-black italic text-gray-900">{order.id}</span>
                                    {order.priority === 'express' && (
                                      <span className="text-[8px] font-black uppercase text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100 mt-1 self-start">Express</span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-6">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-400 text-xs">
                                      {order.customerName[0]}
                                    </div>
                                    <div className="flex flex-col text-right">
                                      <span className="font-bold text-gray-900 leading-none mb-1">{order.customerName}</span>
                                      <span className="text-[10px] text-gray-400">{order.customerPhone}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-6 text-right">
                                  <span className="text-xs font-bold text-gray-400">{order.branch}</span>
                                </td>
                                <td className="p-6 text-right">
                                  <span className="text-xs font-bold text-gray-900">{order.serviceType}</span>
                                </td>
                                <td className="p-6 text-center">
                                  <div className="flex flex-col items-center gap-2">
                                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                                      {status.label}
                                    </span>
                                    {status.next && (
                                      <button 
                                        onClick={() => {
                                          const newOrders = orders.map(o => o.id === order.id ? { ...o, status: status.next as any } : o);
                                          onOrdersChange(newOrders);
                                          showToast(`تم تحديث حالة الطلب إلى: ${status.nextLabel}`);
                                        }}
                                        className="text-[9px] font-black text-primary hover:underline cursor-pointer"
                                      >
                                        {status.nextLabel} »
                                      </button>
                                    )}
                                  </div>
                                </td>
                                <td className="p-6 text-center">
                                  <span className={`text-[10px] font-black ${pStatus.color}`}>{pStatus.label}</span>
                                </td>
                                <td className="p-6 text-right">
                                  <span className="font-black italic text-primary">{order.amount || '—'} د</span>
                                </td>
                                <td className="p-6 text-right">
                                  <div className="text-xs font-bold text-gray-400 leading-none">{order.dateReceived}</div>
                                </td>
                                <td className="p-6">
                                  <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    {order.customerPhone && (
                                      <a 
                                        href={`https://wa.me/${order.customerPhone}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-success/5 text-success hover:bg-success hover:text-white rounded-xl transition-all"
                                      >
                                        <MessageCircle size={16} />
                                      </a>
                                    )}
                                    <button className="p-2 bg-gray-50 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all cursor-pointer">
                                      <Eye size={16} />
                                    </button>
                                    <button className="p-2 bg-gray-50 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all cursor-pointer">
                                      <Pencil size={16} />
                                    </button>
                                    <button 
                                      onClick={() => {
                                        onOrdersChange(orders.filter(o => o.id !== order.id));
                                        showToast('تم حذف الطلب بنجاح');
                                      }}
                                      className="p-2 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'prices' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/20 overflow-hidden">
                  <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-xl font-black italic text-gray-900">إدارة قوائم الأسعار</h2>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                        إجمالي الأصناف: {localConfig.pricing.length}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                      {/* Search Bar */}
                      <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                          type="text"
                          placeholder="بحث بالاسم (عربي/إنجليزي)..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-100 pl-10 pr-4 py-3 rounded-xl text-xs font-bold outline-none focus:border-primary transition-all"
                        />
                      </div>

                      <button 
                        onClick={() => {
                          const newPricing = [
                            { barcode: Date.now().toString(), name_ar: 'صنف جديد', name_en: 'New Item', category: 'men', wash_iron: 10, iron: 5, wash_dry: 5, dry: 5, active: true },
                            ...localConfig.pricing
                          ];
                          handleConfigUpdate({ pricing: newPricing });
                          showToast('تم إضافة صنف جديد');
                        }}
                        className="bg-primary text-white p-3 rounded-xl hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-lg shadow-primary/20"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Bulk Actions Bar */}
                  <AnimatePresence>
                    {selectedItems.length > 0 && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-primary/5 border-b border-primary/10 px-8 py-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-black italic text-primary">تم تحديد {selectedItems.length} أصناف</span>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                const newPricing = localConfig.pricing.map(item => 
                                  selectedItems.includes(item.barcode) ? { ...item, active: true } : item
                                );
                                handleConfigUpdate({ pricing: newPricing });
                                showToast('تم تفعيل الأصناف المحددة');
                                setSelectedItems([]);
                              }}
                              className="text-[10px] font-black uppercase tracking-widest bg-white text-primary border border-primary/20 px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition-all cursor-pointer"
                            >
                              تفعيل الكل
                            </button>
                            <button 
                              onClick={() => {
                                const newPricing = localConfig.pricing.map(item => 
                                  selectedItems.includes(item.barcode) ? { ...item, active: false } : item
                                );
                                handleConfigUpdate({ pricing: newPricing });
                                showToast('تم إخفاء الأصناف المحددة');
                                setSelectedItems([]);
                              }}
                              className="text-[10px] font-black uppercase tracking-widest bg-white text-gray-500 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
                            >
                              إخفاء الكل
                            </button>
                            <button 
                              onClick={() => {
                                const newPricing = localConfig.pricing.filter(item => !selectedItems.includes(item.barcode));
                                handleConfigUpdate({ pricing: newPricing });
                                showToast('تم حذف الأصناف المختارة');
                                setSelectedItems([]);
                              }}
                              className="text-[10px] font-black uppercase tracking-widest bg-white text-red-500 border border-red-100 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                            >
                              حذف المختار
                            </button>
                          </div>
                        </div>
                        <button onClick={() => setSelectedItems([])} className="text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"><X size={16} /></button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="p-4 px-8 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center w-10">
                            <input 
                              type="checkbox"
                              checked={selectedItems.length === localConfig.pricing.length && localConfig.pricing.length > 0}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedItems(localConfig.pricing.map(p => p.barcode));
                                else setSelectedItems([]);
                              }}
                              className="w-4 h-4 rounded-md accent-primary cursor-pointer"
                            />
                          </th>
                          <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">الصنف</th>
                          <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">الفئة</th>
                          <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">غسيل+كوي</th>
                          <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">كوي فقط</th>
                          <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">غسيل+تنشيف</th>
                          <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">تنشيف فقط</th>
                          <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">الحالة</th>
                          <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">حذف</th>
                        </tr>
                      </thead>
                      <tbody>
                        {localConfig.pricing
                          .filter(item => 
                            item.name_ar.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.name_en.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map((item) => {
                            const actualIdx = localConfig.pricing.findIndex(p => p.barcode === item.barcode);
                            return (
                              <tr 
                                key={item.barcode} 
                                className={`border-b border-gray-50 hover:bg-gray-50/50 transition-all ${!item.active ? 'opacity-60 bg-gray-50/30' : ''}`}
                              >
                                <td className="p-4 px-8 text-center">
                                  <input 
                                    type="checkbox"
                                    checked={selectedItems.includes(item.barcode)}
                                    onChange={(e) => {
                                      if (e.target.checked) setSelectedItems([...selectedItems, item.barcode]);
                                      else setSelectedItems(selectedItems.filter(id => id !== item.barcode));
                                    }}
                                    className="w-4 h-4 rounded-md accent-primary cursor-pointer"
                                  />
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${item.active ? 'bg-primary shadow-[0_0_8px_rgba(29,158,117,0.5)]' : 'bg-gray-300'}`} />
                                    <div>
                                      <div className="text-sm font-bold text-gray-900">{item.name_ar}</div>
                                      <div className="text-[10px] text-gray-400 italic" dir="ltr">{item.name_en}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4 text-center">
                                  <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-3 py-1 rounded-full uppercase italic tracking-tighter">{item.category}</span>
                                </td>
                                <td className="p-4 text-center">
                                  <input 
                                    type="number" 
                                    value={item.wash_iron}
                                    onChange={(e) => {
                                      const newPricing = [...localConfig.pricing];
                                      newPricing[actualIdx] = { ...item, wash_iron: parseFloat(e.target.value) || 0 };
                                      handleConfigUpdate({ pricing: newPricing });
                                    }}
                                    className="w-16 bg-gray-50 border border-gray-100 p-2 rounded-xl text-center font-black italic text-primary outline-none focus:border-primary"
                                  />
                                </td>
                                <td className="p-4 text-center">
                                  <input 
                                    type="number" 
                                    value={item.iron}
                                    onChange={(e) => {
                                      const newPricing = [...localConfig.pricing];
                                      newPricing[actualIdx] = { ...item, iron: parseFloat(e.target.value) || 0 };
                                      handleConfigUpdate({ pricing: newPricing });
                                    }}
                                    className="w-16 bg-gray-50 border border-gray-100 p-2 rounded-xl text-center font-black italic text-secondary outline-none focus:border-primary"
                                  />
                                </td>
                                <td className="p-4 text-center">
                                  <input 
                                    type="number" 
                                    value={item.wash_dry}
                                    onChange={(e) => {
                                      const newPricing = [...localConfig.pricing];
                                      newPricing[actualIdx] = { ...item, wash_dry: parseFloat(e.target.value) || 0 };
                                      handleConfigUpdate({ pricing: newPricing });
                                    }}
                                    className="w-16 bg-gray-50 border border-gray-100 p-2 rounded-xl text-center font-black italic text-primary outline-none focus:border-primary"
                                  />
                                </td>
                                <td className="p-4 text-center">
                                  <input 
                                    type="number" 
                                    value={item.dry}
                                    onChange={(e) => {
                                      const newPricing = [...localConfig.pricing];
                                      newPricing[actualIdx] = { ...item, dry: parseFloat(e.target.value) || 0 };
                                      handleConfigUpdate({ pricing: newPricing });
                                    }}
                                    className="w-16 bg-gray-50 border border-gray-100 p-2 rounded-xl text-center font-black italic text-secondary outline-none focus:border-primary"
                                  />
                                </td>
                                <td className="p-4 text-center text-[0]">
                                  <button 
                                    onClick={() => {
                                      const newPricing = [...localConfig.pricing];
                                      newPricing[actualIdx] = { ...item, active: !item.active };
                                      handleConfigUpdate({ pricing: newPricing });
                                    }}
                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black italic uppercase tracking-widest transition-all cursor-pointer ${
                                      item.active 
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                        : 'bg-gray-100 text-gray-400 border border-gray-200 shadow-inner'
                                    }`}
                                  >
                                    {item.active ? 'Active' : 'Hidden'}
                                  </button>
                                </td>
                                <td className="p-4 text-center">
                                  <button 
                                    onClick={() => {
                                      const newPricing = localConfig.pricing.filter(p => p.barcode !== item.barcode);
                                      handleConfigUpdate({ pricing: newPricing });
                                      showToast('تم حذف الصنف بنجاح');
                                    }}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'content' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Hero Section */}
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/20 border border-gray-100 space-y-6">
                    <h3 className="text-md font-black italic uppercase tracking-widest text-primary flex items-center gap-3">
                      <LayoutDashboard size={20} /> الصفحة الرئيسية (الهيرو)
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">العنوان الرئيسي</label>
                        <input 
                          type="text" 
                          value={localConfig.hero.title}
                          onChange={(e) => handleConfigUpdate({ hero: { ...localConfig.hero, title: e.target.value } })}
                          className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-primary transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">النص التعريفي</label>
                        <textarea 
                          rows={3}
                          value={localConfig.hero.subtitle}
                          onChange={(e) => handleConfigUpdate({ hero: { ...localConfig.hero, subtitle: e.target.value } })}
                          className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-primary resize-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">نص الزر الرئيسي</label>
                        <input 
                          type="text" 
                          value={localConfig.hero.cta_primary}
                          onChange={(e) => handleConfigUpdate({ hero: { ...localConfig.hero, cta_primary: e.target.value } })}
                          className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Stats Section */}
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/20 border border-gray-100 space-y-6">
                    <h3 className="text-md font-black italic uppercase tracking-widest text-primary flex items-center gap-3">
                      <BarChart3 size={20} /> الأرقام الإحصائية
                    </h3>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">رقم ١ — القيمة</label>
                          <input 
                            type="text" 
                            value={localConfig.stats.delivery_hours}
                            onChange={(e) => handleConfigUpdate({ stats: { ...localConfig.stats, delivery_hours: e.target.value } })}
                            className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-black text-center text-primary"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">رقم ١ — التسمية</label>
                          <input 
                            type="text" 
                            value={localConfig.stats.delivery_label}
                            onChange={(e) => handleConfigUpdate({ stats: { ...localConfig.stats, delivery_label: e.target.value } })}
                            className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-xs outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">رقم ٢ — القيمة</label>
                          <input 
                            type="text" 
                            value={localConfig.stats.satisfied_customers}
                            onChange={(e) => handleConfigUpdate({ stats: { ...localConfig.stats, satisfied_customers: e.target.value } })}
                            className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-black text-center text-primary"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">رقم ٢ — التسمية</label>
                          <input 
                            type="text" 
                            value={localConfig.stats.satisfied_label}
                            onChange={(e) => handleConfigUpdate({ stats: { ...localConfig.stats, satisfied_label: e.target.value } })}
                            className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-xs outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gallery Section */}
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/20 border border-gray-100 space-y-6 lg:col-span-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-md font-black italic uppercase tracking-widest text-primary flex items-center gap-3">
                        <ImagePlus size={20} /> صور المعرض ({localConfig.gallery.length} صور)
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {localConfig.gallery.map((img, idx) => (
                        <div key={img.id} className="relative group bg-gray-50 p-6 rounded-3xl border border-gray-100 transition-all hover:bg-primary/5 hover:border-primary/20">
                          <div className="text-4xl text-center mb-2">{img.icon}</div>
                          <input 
                            type="text" 
                            value={img.label}
                            onChange={(e) => {
                              const newGallery = [...localConfig.gallery];
                              newGallery[idx] = { ...img, label: e.target.value };
                              handleConfigUpdate({ gallery: newGallery });
                            }}
                            className="w-full bg-transparent text-[10px] font-bold text-center text-gray-400 outline-none"
                          />
                          <button 
                            onClick={() => {
                              const newGallery = localConfig.gallery.filter(g => g.id !== img.id);
                              handleConfigUpdate({ gallery: newGallery });
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      
                      <button 
                        onClick={() => {
                          const newGallery = [...localConfig.gallery, { id: Date.now().toString(), icon: '📷', label: 'تسمية الصورة' }];
                          handleConfigUpdate({ gallery: newGallery });
                        }}
                        className="p-6 rounded-3xl border-2 border-dashed border-gray-100 text-gray-300 hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer"
                      >
                        <Plus size={24} />
                        <span className="text-[10px] font-black uppercase tracking-widest">إضافة صورة</span>
                      </button>
                    </div>

                    <div className="bg-gray-50 border border-gray-100 p-8 rounded-[2rem] border-dashed text-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <FolderOpen size={24} />
                      </div>
                      <p className="text-sm font-bold text-gray-900">اسحب صورة أو اضغط للرفع</p>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase font-black tracking-widest">JPG, PNG, WebP — Max 5MB</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'branches' && (
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                   <div className="bg-white px-8 py-4 rounded-[2rem] border border-gray-100 shadow-sm">
                     <h2 className="text-xl font-black italic text-gray-900">إدارة الفروع</h2>
                     <p className="text-[10px] font-black uppercase tracking-widest text-primary">بيانات وتفعيل الفروع الثلاثة</p>
                   </div>
                   <button 
                    onClick={() => {
                      const newBranch = {
                        id: Date.now().toString(),
                        name: 'فرع جديد',
                        address: 'العنوان هنا',
                        phone: '',
                        whatsapp: '',
                        hours: '٨ص – ١٠م',
                        coordinates: { lat: 24, lng: 54 },
                        status: 'active' as const
                      };
                      handleConfigUpdate({ branches: [...localConfig.branches, newBranch] });
                    }}
                    className="bg-primary text-white px-8 py-4 rounded-[2rem] font-black italic shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 cursor-pointer"
                   >
                     <Plus size={20} /> إضافة فرع جديد
                   </button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {localConfig.branches.map((branch, idx) => (
                     <div key={branch.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/20 border border-gray-100 space-y-6 relative group border-t-4 border-t-primary/20 hover:border-t-primary transition-all">
                        <div className="flex justify-between items-start">
                          <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                            <MapPin size={28} />
                          </div>
                          <button 
                            onClick={() => {
                              const newBranches = localConfig.branches.filter(b => b.id !== branch.id);
                              handleConfigUpdate({ branches: newBranches });
                            }}
                            className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">اسم الفرع</label>
                            <input 
                              type="text" 
                              value={branch.name}
                              onChange={(e) => {
                                const newBranches = [...localConfig.branches];
                                newBranches[idx] = { ...branch, name: e.target.value };
                                handleConfigUpdate({ branches: newBranches });
                              }}
                              className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-primary transition-all"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">رقم الهاتف</label>
                            <input 
                              type="text" 
                              value={branch.phone}
                              onChange={(e) => {
                                const newBranches = [...localConfig.branches];
                                newBranches[idx] = { ...branch, phone: e.target.value, whatsapp: e.target.value };
                                handleConfigUpdate({ branches: newBranches });
                              }}
                              className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-primary transition-all"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">ساعات العمل</label>
                            <input 
                              type="text" 
                              value={branch.hours}
                              onChange={(e) => {
                                const newBranches = [...localConfig.branches];
                                newBranches[idx] = { ...branch, hours: e.target.value };
                                handleConfigUpdate({ branches: newBranches });
                              }}
                              className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-primary transition-all"
                            />
                          </div>

                          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100 mt-6">
                             <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">تفعيل الفرع</div>
                             <button 
                               onClick={() => {
                                 const newBranches = [...localConfig.branches];
                                 newBranches[idx] = { ...branch, status: branch.status === 'active' ? 'closed' : 'active' };
                                 handleConfigUpdate({ branches: newBranches });
                               }}
                               className={`w-12 h-7 rounded-full relative transition-all ${branch.status === 'active' ? 'bg-success' : 'bg-gray-200'}`}
                             >
                               <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${branch.status === 'active' ? 'right-6' : 'right-1 shadow-sm'}`} />
                             </button>
                          </div>
                        </div>
                     </div>
                   ))}
                 </div>
               </motion.div>
            )}

            {activeTab === 'offers' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="bg-white px-8 py-4 rounded-[2rem] border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-black italic text-gray-900">العروض والخصومات</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">إدارة الكوبونات والعروض</p>
                  </div>
                  <button 
                    onClick={() => {
                      const newOffer = {
                        id: Date.now().toString(),
                        name: 'عرض جديد',
                        discount: '١٠٪',
                        condition: 'شروط العرض',
                        active: true
                      };
                      handleConfigUpdate({ offers: [...localConfig.offers, newOffer] });
                    }}
                    className="bg-primary text-white px-8 py-4 rounded-[2rem] font-black italic shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 cursor-pointer"
                  >
                    <Plus size={20} /> إضافة عرض جديد
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {localConfig.offers.map((offer, idx) => (
                    <div key={offer.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/20 border border-gray-100 space-y-6 relative group border-t-4 border-t-primary/20 hover:border-t-primary transition-all">
                      <div className="flex justify-between items-start">
                        <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                          <Gift size={28} />
                        </div>
                        <button 
                          onClick={() => {
                            const newOffers = localConfig.offers.filter(o => o.id !== offer.id);
                            handleConfigUpdate({ offers: newOffers });
                          }}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">اسم العرض</label>
                          <input 
                            type="text" 
                            value={offer.name}
                            onChange={(e) => {
                              const newOffers = [...localConfig.offers];
                              newOffers[idx] = { ...offer, name: e.target.value };
                              handleConfigUpdate({ offers: newOffers });
                            }}
                            className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-primary transition-all"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">نسبة الخصم</label>
                             <input 
                               type="text" 
                               value={offer.discount}
                               onChange={(e) => {
                                 const newOffers = [...localConfig.offers];
                                 newOffers[idx] = { ...offer, discount: e.target.value };
                                 handleConfigUpdate({ offers: newOffers });
                               }}
                               className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-primary transition-all text-center text-primary"
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">الحالة</label>
                             <div className={`p-4 rounded-2xl text-center font-black text-[10px] uppercase tracking-widest ${offer.active ? 'bg-success/10 text-success' : 'bg-amber-500/10 text-amber-500'}`}>
                               {offer.active ? 'مفعّل' : 'معلّق'}
                             </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">الشرط</label>
                          <input 
                             type="text" 
                             value={offer.condition}
                             onChange={(e) => {
                               const newOffers = [...localConfig.offers];
                               newOffers[idx] = { ...offer, condition: e.target.value };
                               handleConfigUpdate({ offers: newOffers });
                             }}
                             className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-primary transition-all"
                          />
                        </div>

                        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100 mt-6">
                           <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">تفعيل العرض</div>
                           <button 
                             onClick={() => {
                               const newOffers = [...localConfig.offers];
                               newOffers[idx] = { ...offer, active: !offer.active };
                               handleConfigUpdate({ offers: newOffers });
                             }}
                             className={`w-12 h-7 rounded-full relative transition-all ${offer.active ? 'bg-success' : 'bg-gray-200'}`}
                           >
                             <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${offer.active ? 'right-6' : 'right-1 shadow-sm'}`} />
                           </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'drivers' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="bg-white px-8 py-4 rounded-[2rem] border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-black italic text-gray-900">إدارة السواقين</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">أرقام وحالة السواقين</p>
                  </div>
                  <button 
                    onClick={() => {
                      const newDriver: Driver = {
                        id: Date.now().toString(),
                        name: 'سائق جديد',
                        phone: '',
                        branch: localConfig.branches[0]?.name || '',
                        branch_id: localConfig.branches[0]?.id || '',
                        status: 'available',
                        rating: 5,
                        orders_completed: 0,
                        earnings_today: 0
                      };
                      handleConfigUpdate({ drivers: [...localConfig.drivers, newDriver] });
                    }}
                    className="bg-primary text-white px-8 py-4 rounded-[2rem] font-black italic shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 cursor-pointer"
                  >
                    <Plus size={20} /> إضافة سائق جديد
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {localConfig.drivers.map((driver, idx) => (
                    <div key={driver.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/20 border border-gray-100 space-y-6 relative group border-t-4 border-t-secondary/20 hover:border-t-secondary transition-all">
                      <div className="flex justify-between items-start">
                        <div className="w-14 h-14 bg-secondary/10 text-secondary rounded-2xl flex items-center justify-center">
                          <Truck size={28} />
                        </div>
                        <button 
                          onClick={() => {
                            const newDrivers = localConfig.drivers.filter(d => d.id !== driver.id);
                            handleConfigUpdate({ drivers: newDrivers });
                          }}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">الاسم</label>
                          <input 
                            type="text" 
                            value={driver.name}
                            onChange={(e) => {
                              const newDrivers = [...localConfig.drivers];
                              newDrivers[idx] = { ...driver, name: e.target.value };
                              handleConfigUpdate({ drivers: newDrivers });
                            }}
                            className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-secondary transition-all"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">رقم الجوال</label>
                          <input 
                            type="text" 
                            value={driver.phone}
                            onChange={(e) => {
                              const newDrivers = [...localConfig.drivers];
                              newDrivers[idx] = { ...driver, phone: e.target.value };
                              handleConfigUpdate({ drivers: newDrivers });
                            }}
                            className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-secondary transition-all"
                            dir="ltr"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">الفرع المخصص</label>
                          <select 
                            value={driver.branch_id}
                            onChange={(e) => {
                              const newDrivers = [...localConfig.drivers];
                              newDrivers[idx] = { ...driver, branch_id: e.target.value };
                              handleConfigUpdate({ drivers: newDrivers });
                            }}
                            className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-secondary transition-all"
                          >
                            {localConfig.branches.map(branch => (
                              <option key={branch.id} value={branch.id}>{branch.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">الحالة</label>
                          <div className="flex gap-2">
                            {[
                              { id: 'available', label: 'متاح', color: 'bg-success' },
                              { id: 'busy', label: 'في مهمة', color: 'bg-amber-500' },
                              { id: 'off', label: 'خارج العمل', color: 'bg-gray-400' }
                            ].map(status => (
                              <button
                                key={status.id}
                                onClick={() => {
                                  const newDrivers = [...localConfig.drivers];
                                  newDrivers[idx] = { ...driver, status: status.id as any };
                                  handleConfigUpdate({ drivers: newDrivers });
                                }}
                                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${driver.status === status.id ? `${status.color} text-white shadow-lg` : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                              >
                                {status.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="bg-white px-8 py-4 rounded-[2rem] border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-black italic text-gray-900">الإعدادات العامة</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">إعدادات الموقع والنظام</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Basic Site Info */}
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/20 border border-gray-100 space-y-6">
                    <h3 className="text-md font-black italic uppercase tracking-widest text-primary flex items-center gap-3">
                      <Globe size={20} /> إعدادات الموقع
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">اسم الموقع</label>
                        <p className="text-[10px] text-gray-400 leading-none mb-1">يظهر في شريط المتصفح ونتائج البحث</p>
                        <input 
                          type="text" 
                          value={localConfig.site_name}
                          onChange={(e) => handleConfigUpdate({ site_name: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-primary transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">البريد الإلكتروني للتواصل</label>
                        <input 
                          type="email" 
                          value={localConfig.contact_email}
                          onChange={(e) => handleConfigUpdate({ contact_email: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-primary transition-all text-left"
                          dir="ltr"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">عنوان المكتب الرئيسي</label>
                        <input 
                          type="text" 
                          value={localConfig.business_address}
                          onChange={(e) => handleConfigUpdate({ business_address: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-primary transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">رقم الضريبة (VAT)</label>
                          <input 
                            type="text" 
                            value={localConfig.vat_number}
                            onChange={(e) => handleConfigUpdate({ vat_number: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-primary transition-all text-left"
                            dir="ltr"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">رابط خرائط جوجل</label>
                          <input 
                            type="text" 
                            value={localConfig.google_maps_url}
                            onChange={(e) => handleConfigUpdate({ google_maps_url: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-primary transition-all text-left"
                            dir="ltr"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">نص التذييل (Footer)</label>
                        <input 
                          type="text" 
                          value={localConfig.footer_text}
                          onChange={(e) => handleConfigUpdate({ footer_text: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Operational Settings */}
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/20 border border-gray-100 space-y-6">
                    <h3 className="text-md font-black italic uppercase tracking-widest text-primary flex items-center gap-3">
                      <Settings size={20} /> إعدادات النظام
                    </h3>

                    <div className="space-y-4">
                      {[
                        { 
                          id: 'maintenance_mode', 
                          label: 'وضع الصيانة', 
                          desc: 'إيقاف الموقع مؤقتاً للزوار مع إبقاء اللوحة تعمل',
                          active: localConfig.maintenance_mode 
                        },
                        { 
                          id: 'accept_orders', 
                          label: 'استقبال الطلبات', 
                          desc: 'السماح بإنشاء طلبات جديدة من الموقع',
                          active: localConfig.accept_orders 
                        },
                        { 
                          id: 'whatsapp_notifications', 
                          label: 'إشعارات واتساب', 
                          desc: 'إرسال تأكيد تلقائي لكل طلب جديد',
                          active: localConfig.whatsapp_notifications 
                        }
                      ].map((toggle) => (
                        <div key={toggle.id} className="flex justify-between items-center bg-gray-50 p-6 rounded-3xl border border-gray-100">
                          <div>
                            <div className="text-sm font-bold text-gray-900">{toggle.label}</div>
                            <div className="text-[10px] text-gray-400 font-medium">{toggle.desc}</div>
                          </div>
                          <button 
                            onClick={() => handleConfigUpdate({ [toggle.id]: !toggle.active })}
                            className={`w-12 h-7 rounded-full relative transition-all ${toggle.active ? 'bg-primary' : 'bg-gray-200'}`}
                          >
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${toggle.active ? 'right-6' : 'right-1 shadow-sm'}`} />
                          </button>
                        </div>
                      ))}

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">رقم واتساب الرئيسي</label>
                        <p className="text-[10px] text-gray-400 leading-none mb-1">للإشعارات والتواصل التلقائي</p>
                        <input 
                          type="text" 
                          value={localConfig.whatsapp_number}
                          onChange={(e) => handleConfigUpdate({ whatsapp_number: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-primary transition-all text-left"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social Media */}
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/20 border border-gray-100 space-y-6 lg:col-span-2">
                    <h3 className="text-md font-black italic uppercase tracking-widest text-primary flex items-center gap-3">
                      <Smartphone size={20} /> حسابات التواصل الاجتماعي
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">انستقرام</label>
                        <input 
                          type="text" 
                          value={localConfig.social_media.instagram}
                          onChange={(e) => handleConfigUpdate({ social_media: { ...localConfig.social_media, instagram: e.target.value } })}
                          className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-primary transition-all text-left"
                          dir="ltr"
                          placeholder="@username"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">تيك توك</label>
                        <input 
                          type="text" 
                          value={localConfig.social_media.tiktok}
                          onChange={(e) => handleConfigUpdate({ social_media: { ...localConfig.social_media, tiktok: e.target.value } })}
                          className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-primary transition-all text-left"
                          dir="ltr"
                          placeholder="@username"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">فيسبوك</label>
                        <input 
                          type="text" 
                          value={localConfig.social_media.facebook}
                          onChange={(e) => handleConfigUpdate({ social_media: { ...localConfig.social_media, facebook: e.target.value } })}
                          className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-primary transition-all text-left"
                          dir="ltr"
                          placeholder="username"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Business Rules */}
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/20 border border-gray-100 space-y-6 lg:col-span-2">
                    <h3 className="text-md font-black italic uppercase tracking-widest text-primary flex items-center gap-3">
                      <Banknote size={20} /> قواعد العمل والأسعار
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">رسوم التوصيل (درهم)</label>
                        <input 
                          type="number" 
                          value={localConfig.delivery_fee}
                          onChange={(e) => handleConfigUpdate({ delivery_fee: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-primary transition-all text-right"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">الحد الأدنى للطلب (درهم)</label>
                        <input 
                          type="number" 
                          value={localConfig.min_order_amount}
                          onChange={(e) => handleConfigUpdate({ min_order_amount: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-primary transition-all text-right"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">نسبة الضريبة (%)</label>
                        <input 
                          type="number" 
                          value={localConfig.vat_percentage}
                          onChange={(e) => handleConfigUpdate({ vat_percentage: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-sm outline-none focus:border-primary transition-all text-right"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SAVE BAR */}
        <AnimatePresence>
          {isChanged && (
            <motion.footer 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-white border-t border-gray-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-0 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center animate-pulse"><Settings size={20} /></div>
                <div>
                  <div className="text-sm font-bold text-gray-900">تغييرات غير محفوظة</div>
                  <p className="text-[10px] text-gray-400 font-medium">سيتم تحديث الموقع فوراً عند الضغط على حفظ.</p>
                </div>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button onClick={cancelChanges} className="flex-1 sm:flex-initial px-8 py-3 rounded-2xl border border-gray-100 font-bold text-xs text-gray-500 hover:bg-gray-50 transition-all">إلغاء</button>
                <button onClick={saveChanges} className="flex-1 sm:flex-initial px-10 py-4 bg-primary text-white rounded-2xl font-black italic shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">حفظ التغييرات</button>
              </div>
            </motion.footer>
          )}
        </AnimatePresence>
      </main>

      {/* TOAST PANEL */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-secondary text-white px-8 py-4 rounded-[2rem] shadow-2xl font-bold text-sm italic z-[60] border border-white/5 backdrop-blur-xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
