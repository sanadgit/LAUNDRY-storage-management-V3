import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, Truck, ClipboardList, User, Bell, 
  Search, MapPin, Phone, Clock, Navigation, 
  LogOut, Camera, CheckCircle2, AlertCircle,
  TrendingUp, CreditCard, Wallet, Smartphone,
  ExternalLink, ChevronRight, Star, Settings,
  Map as MapIcon, X as CloseIcon
} from 'lucide-react';
import { Order, Driver, OrderStatus } from '../types';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet marker icon issue
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const DriverIcon = L.divIcon({
  className: 'custom-driver-icon',
  html: `<div style="background-color: #1D9E75; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; display: flex; items-center; justify-content: center; box-shadow: 0 0 15px rgba(29, 158, 117, 0.5); transform: rotate(-45deg) translate(5px, -5px); position: relative;">
          <div style="transform: rotate(45deg); font-size: 14px;">🚗</div>
          <div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #1D9E75;"></div>
         </div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30]
});

// Component to handle map center updates
const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom());
  }, [center, map]);
  return null;
};

interface DriverPanelProps {
  driver: Driver;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onLogout: () => void;
}

export const DriverPanel: React.FC<DriverPanelProps> = ({ 
  driver, orders, onUpdateOrderStatus, onLogout 
}) => {
  const [activeTab, setActiveTab] = useState<'pickup' | 'delivery' | 'history' | 'profile'>('pickup');
  const [isOnline, setIsOnline] = useState(driver.status !== 'offline');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);
  
  // Location state
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const toAr = (n: any) => (Number(n) || 0).toLocaleString('ar-SA');

  // Watch location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('المتصفح لا يدعم تحديد الموقع');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setLocation([pos.coords.latitude, pos.coords.longitude]);
        setLocationError(null);
      },
      (err) => {
        setLocationError('تعذر تحديد الموقع. يرجى تفعيل GPS');
        console.error(err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Filter orders
  const pickupOrders = orders.filter(o => 
    o.status === 'new' && 
    (o.assignedDriverId === driver.id || !o.assignedDriverId)
  );

  const deliveryOrders = orders.filter(o => 
    o.status === 'ready' && o.assignedDriverId === driver.id
  );

  const historyOrders = orders.filter(o => 
    (o.status === 'completed' || o.status === 'delivered' || o.status === 'cancelled') && 
    o.assignedDriverId === driver.id
  );

  const activeMissions = orders.filter(o => 
    o.assignedDriverId === driver.id && 
    ['accepted', 'on_the_way', 'pickup', 'delivery'].includes(o.status)
  );

  const activeMission = activeMissions[0];

  const colors = {
    primary: '#9333ea', // Royal Purple
    primaryLight: '#a855f7',
    primaryDark: '#581c87',
    bg: '#0f0914',
    card: '#1a1221',
    border: '#2d1b3d',
    text: '#f3e8ff',
    muted: '#94a3b8'
  };

  return (
    <div className="max-w-[480px] mx-auto min-h-screen flex flex-col font-sans relative overflow-hidden shadow-2xl" style={{ backgroundColor: colors.bg, color: colors.text }}>
      
      {/* STATUS BAR */}
      <div className="bg-[#1e142b] p-4 flex justify-between items-center sticky top-0 z-50 shadow-lg border-b border-[#2d1b3d]">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsOnline(!isOnline)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
              isOnline ? 'bg-[#9333ea]/20 border-[#9333ea]' : 'bg-[#1a1221] border-[#2d1b3d]'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#c084fc] animate-pulse' : 'bg-[#4a3b5a]'}`} />
            <span className={`text-[10px] font-bold ${isOnline ? 'text-[#e9d5ff]' : 'text-[#64748b]'}`}>
              {isOnline ? 'متصل' : 'غير متصل'}
            </span>
          </button>
          <span className="text-[11px] text-[#e9d5ff] font-bold">{driver.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {(activeTab === 'pickup' || activeTab === 'delivery') && (
            <button 
              onClick={() => setShowMap(!showMap)}
              className={`p-2 rounded-full transition-all ${showMap ? 'bg-[#9333ea] text-white' : 'bg-[#1a1221] text-[#64748b]'}`}
            >
              <MapIcon size={18} />
            </button>
          )}
          <button className="relative p-2 hover:bg-[#9333ea]/20 rounded-full transition-colors">
            <Bell size={18} />
            <div className="absolute top-1.5 right-1.5 w-3 h-3 bg-[#ec4899] rounded-full border-2 border-[#1e142b]" />
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex bg-[#1a1221] border-b border-[#2d1b3d] sticky top-[68px] z-40">
        {[
          { id: 'pickup', label: 'استلام', icon: <Package size={16} />, badge: pickupOrders.length, badgeClr: 'bg-[#fbbf24]' },
          { id: 'delivery', label: 'تسليم', icon: <Truck size={16} />, badge: deliveryOrders.length, badgeClr: 'bg-[#9333ea]' },
          { id: 'history', label: 'السجل', icon: <ClipboardList size={16} /> },
          { id: 'profile', label: 'حسابي', icon: <User size={16} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex flex-col items-center gap-1.5 py-3 border-b-2 transition-all ${
              activeTab === tab.id 
                ? 'text-[#c084fc] border-[#9333ea] bg-[#1a1221]' 
                : 'text-[#64748b] border-transparent hover:text-[#94a3b8]'
            }`}
          >
            <div className="flex items-center gap-1.5">
              {tab.icon}
              <span className="text-[11px] font-bold">{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`${tab.badgeClr} text-white text-[8px] px-1.5 py-0.5 rounded-full font-black`}>
                  {toAr(tab.badge)}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* MAP OVERLAY (Optional) */}
      <AnimatePresence>
        {(activeTab === 'pickup' || activeTab === 'delivery') && showMap && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 250, opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            className="w-full relative bg-[#161B22] flex-shrink-0 z-10 overflow-hidden border-b border-[#21262D]"
          >
            {locationError ? (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0D1117]/80 z-20">
                <div className="text-center p-4">
                  <AlertCircle size={32} className="text-[#E24B4A] mx-auto mb-2" />
                  <p className="text-xs font-bold text-[#E6EDF3]">{locationError}</p>
                </div>
              </div>
            ) : location ? (
              <MapContainer 
                center={location} 
                zoom={15} 
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                <Marker position={location} icon={DriverIcon}>
                  <Popup>موقعك الحالي 🚗</Popup>
                </Marker>
                <Circle 
                  center={location} 
                  radius={100} 
                  pathOptions={{ color: '#1D9E75', fillColor: '#1D9E75', fillOpacity: 0.1 }} 
                />
                <MapUpdater center={location} />
                
                {/* Visual markers for orders if they had coordinates (simulated here) */}
                {activeMission && (
                  <Marker 
                    position={[location[0] + 0.005, location[1] + 0.005]} 
                    icon={DefaultIcon}
                  >
                    <Popup>
                      <div className="text-right rtl">
                        <p className="font-black text-[#0D1117] mb-1">{activeMission.id}</p>
                        <p className="text-[10px] text-gray-600">{activeMission.customerName}</p>
                      </div>
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0D1117]">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-[#1D9E75] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[10px] font-bold text-[#656D76]">جاري تحديد الموقع…</p>
                </div>
              </div>
            )}
            
            <button 
              onClick={() => setShowMap(false)}
              className="absolute top-4 right-4 z-[1000] bg-black/50 p-1.5 rounded-full text-white backdrop-blur-sm"
            >
              <CloseIcon size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 relative">
        
        <AnimatePresence mode="wait">
          {(activeTab === 'pickup' || activeTab === 'delivery') && (
            <motion.div 
              key={activeTab} 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Active Missions */}
              {activeMissions.length > 0 && (
                <div className="space-y-4">
                  <div className="text-[10px] text-[#94a3b8] font-black uppercase tracking-[0.2em]">المهام الجارية ({activeMissions.length})</div>
                  {activeMissions.map(mission => (
                    <div key={mission.id} className="bg-gradient-to-br from-[#2d1b3d] to-[#1a1221] border border-[#9333ea] rounded-2xl p-4 shadow-xl">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#c084fc] animate-pulse" />
                          <span className="text-[10px] font-black text-[#c084fc] uppercase tracking-widest">
                            {mission.status === 'on_the_way' ? 'في الطريق' : mission.status === 'pickup' ? 'تم الاستلام' : 'مهمة نشطة'}
                          </span>
                        </div>
                        <span className="bg-[#581c87] text-[#e9d5ff] px-2 py-0.5 rounded-lg text-[9px] font-black">{mission.id}</span>
                      </div>
                      
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="text-sm font-black text-[#f3e8ff]">{mission.customerName}</div>
                          <div className="text-[11px] text-[#94a3b8] mt-1 flex items-start gap-1">
                            <MapPin size={12} className="mt-0.5 flex-shrink-0" />
                            <span>{mission.deliveryAddress}</span>
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="text-[10px] text-[#94a3b8] font-bold">المسافة</div>
                          <div className="text-xs font-black text-[#f3e8ff]">{toAr(mission.distanceKm || 0)} كم</div>
                        </div>
                      </div>

                      {/* Steps Visualization */}
                      <div className="flex justify-between items-center mb-6 px-1">
                        {(mission.steps || [
                          { key: 'accepted', label: 'قبول', status: 'done' },
                          { key: 'on_the_way', label: 'الطريق', status: mission.status === 'on_the_way' ? 'active' : 'done' },
                          { key: 'pickup', label: 'استلام', status: mission.status === 'on_the_way' ? 'pending' : 'active' },
                          { key: 'completed', label: 'اكتمل', status: 'pending' }
                        ]).map((step, idx, arr) => (
                          <React.Fragment key={step.key}>
                            <div className="flex flex-col items-center gap-1.5 relative z-10">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black border ${
                                step.status === 'done' ? 'bg-[#9333ea] border-[#9333ea] text-white' :
                                step.status === 'active' ? 'bg-[#c084fc]/20 border-[#c084fc] text-[#c084fc] animate-pulse' :
                                'bg-[#1a1221] border-[#2d1b3d] text-[#64748b]'
                              }`}>
                                {step.status === 'done' ? '✓' : idx + 1}
                              </div>
                              <span className={`text-[8px] font-bold ${step.status === 'active' ? 'text-[#c084fc]' : 'text-[#64748b]'}`}>{step.label}</span>
                            </div>
                            {idx < arr.length - 1 && (
                              <div className={`flex-1 h-0.5 mx-1 mb-4 ${step.status === 'done' ? 'bg-[#9333ea]' : 'bg-[#2d1b3d]'}`} />
                            )}
                          </React.Fragment>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => { setSelectedOrder(mission); setShowConfirmModal(true); }}
                          className="flex-1 bg-[#9333ea] hover:bg-[#a855f7] text-white py-3 rounded-xl text-xs font-bold shadow-lg shadow-[#9333ea]/20 transition-all active:scale-95"
                        >
                          {mission.status === 'delivery' ? 'تأكيد التسليم ✓' : 'تأكيد الاستلام 📦'}
                        </button>
                        <button className="bg-[#1a1221] p-3 rounded-xl border border-[#2d1b3d] hover:bg-[#9333ea]/10 group transition-all">
                          <Navigation size={18} className="text-[#c084fc] group-hover:scale-110 transition-transform" />
                        </button>
                        <button className="bg-[#1a1221] p-3 rounded-xl border border-[#2d1b3d] hover:bg-[#9333ea]/10 group transition-all">
                          <Phone size={18} className="text-[#94a3b8] group-hover:scale-110 transition-transform" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Available Orders */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] text-[#94a3b8] font-black uppercase tracking-[0.2em]">
                  <span>{activeTab === 'pickup' ? 'طلبات الاستلام المتاحة' : 'طلبات جاهزة للتسليم'} ({activeTab === 'pickup' ? pickupOrders.length : deliveryOrders.length})</span>
                  <span className="text-[#c084fc] cursor-pointer hover:underline">تحديث ↺</span>
                </div>

                {(activeTab === 'pickup' ? pickupOrders : deliveryOrders).map(order => (
                  <motion.div 
                    key={order.id}
                    layoutId={order.id}
                    className={`bg-[#1a1221] border border-[#2d1b3d] rounded-2xl p-4 cursor-pointer hover:border-[#9333ea] transition-all group ${
                      order.priority === 'express' || order.priority === 'urgent' ? 'border-r-4 border-r-[#ec4899]' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-[9px] font-black text-[#c084fc] mb-0.5">{order.id}</div>
                        <div className="text-sm font-bold text-[#f3e8ff]">{order.customerName}</div>
                      </div>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                        activeTab === 'pickup' 
                          ? 'bg-[#fbbf24]/10 text-[#fbbf24] border-[#fbbf24]/30' 
                          : 'bg-[#9333ea]/10 text-[#9333ea] border-[#9333ea]/30'
                      }`}>
                        {activeTab === 'pickup' ? '📦 استلام' : '🚗 تسليم'}
                      </span>
                    </div>

                    <div className="flex items-start gap-2 mb-3">
                      <MapPin size={14} className="text-[#9333ea] mt-0.5 flex-shrink-0" />
                      <span className="text-[11px] text-[#94a3b8] leading-relaxed flex-1 line-clamp-1">{order.deliveryAddress}</span>
                      <span className="text-[9px] font-bold text-[#c084fc] flex-shrink-0">{toAr(order.distanceKm || 0)} كم</span>
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {order.items.map((item, idx) => (
                          <span key={idx} className="bg-[#1e142b] text-[#94a3b8] text-[9px] px-2 py-1 rounded-lg border border-[#2d1b3d]">
                            {item.icon} {item.name} ×{toAr(item.qty)}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-3 border-t border-[#2d1b3d]">
                      <div className="flex items-center gap-1.5 text-[10px] text-[#94a3b8]">
                        <Clock size={12} />
                        <span>{order.timeSlot ? `${toAr(order.timeSlot.from)} - ${toAr(order.timeSlot.to)}` : order.dateReceived}</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="bg-[#1e142b] p-2 rounded-lg border border-[#2d1b3d] hover:bg-[#9333ea]/10 transition-colors text-[#94a3b8]"><Phone size={14} /></button>
                        <button 
                          onClick={() => onUpdateOrderStatus(order.id, 'accepted')}
                          className="bg-[#9333ea] text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-[#a855f7] transition-all active:scale-95"
                        >
                          {activeTab === 'pickup' ? 'قبول' : 'توصيل'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {(activeTab === 'pickup' ? pickupOrders : deliveryOrders).length === 0 && (
                  <div className="py-12 text-center text-[#64748b]">
                    <div className="text-4xl mb-4">✨</div>
                    <p className="text-xs font-bold italic">لا توجد طلبات متاحة حالياً</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div 
              key="history" 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 pb-24"
            >
              <div className="bg-[#1a1221] border border-[#2d1b3d] rounded-2xl p-4 flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#581c87]/30 text-[#c084fc] rounded-full flex items-center justify-center font-bold">🎯</div>
                  <div>
                    <div className="text-lg font-black text-[#f3e8ff]">{toAr(historyOrders.length)}</div>
                    <div className="text-[10px] text-[#94a3b8] uppercase font-bold">إنجازات اليوم</div>
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-lg font-black text-[#c084fc]">{toAr(driver.earnings_today)} د</div>
                  <div className="text-[10px] text-[#94a3b8] uppercase font-bold">أرباح اليوم</div>
                </div>
              </div>

              <div className="space-y-px bg-[#2d1b3d] rounded-2xl overflow-hidden border border-[#2d1b3d]">
                {historyOrders.map(order => (
                  <div key={order.id} className="bg-[#1a1221] p-4 flex items-center justify-between hover:bg-[#1e142b] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                        order.status === 'completed' || order.status === 'delivered' 
                          ? 'bg-[#1a3a2e] text-[#3fb950]' 
                          : 'bg-[#451225] text-[#ec4899]'
                      }`}>
                        {order.status === 'completed' || order.status === 'delivered' ? '✅' : '❌'}
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-[#f3e8ff]">{order.customerName}</div>
                        <div className="text-[9px] text-[#c084fc] font-black">{order.id}</div>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="text-[11px] font-black text-[#c084fc]">+{toAr(12)} د</div>
                      <div className="text-[9px] text-[#94a3b8] font-bold uppercase">{order.dateReceived}</div>
                    </div>
                  </div>
                ))}
                {historyOrders.length === 0 && (
                  <div className="bg-[#1a1221] p-12 text-center text-[#64748b]">
                    <ClipboardList size={48} className="mx-auto mb-4 opacity-10" />
                    <p className="text-xs font-bold italic">لا توجد سجلات لليوم بعد</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div 
              key="profile" 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 pb-24"
            >
              <div className="text-center py-4">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-[#581c87] rounded-full flex items-center justify-center text-4xl border-4 border-[#9333ea] shadow-2xl mx-auto mb-3">🧑</div>
                  <div className="absolute bottom-2 right-0 w-8 h-8 bg-[#9333ea] rounded-full flex items-center justify-center border-2 border-[#1a1221]"><Camera size={14} /></div>
                </div>
                <h2 className="text-2xl font-black text-[#f3e8ff]">{driver.name}</h2>
                <p className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-widest mt-1">المعرف: {driver.id} — {driver.branch}</p>
                <div className="flex items-center justify-center gap-1.5 mt-3">
                  <div className="flex text-[#fbbf24] gap-0.5">
                    {[1,2,3,4,5].map(i => <Star key={i} size={14} fill={i <= Math.round(driver.rating) ? 'currentColor' : 'none'} />)}
                  </div>
                  <span className="text-[11px] text-[#f3e8ff] font-bold">{toAr(driver.rating)} / ٥</span>
                  <span className="text-[9px] text-[#94a3b8]">({toAr(driver.total_ratings || 0)} تقييم)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1a1221] border border-[#2d1b3d] rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={16} className="text-[#9333ea]" />
                    <span className="text-[9px] font-black text-[#94a3b8] uppercase">كفاءة العمل</span>
                  </div>
                  <div className="text-2xl font-black text-[#f3e8ff]">٩٧٪</div>
                  <div className="w-full h-1.5 bg-[#2d1b3d] rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-[#9333ea] w-[97%]" />
                  </div>
                </div>
                <div className="bg-[#1a1221] border border-[#2d1b3d] rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard size={16} className="text-[#c084fc]" />
                    <span className="text-[9px] font-black text-[#94a3b8] uppercase">المحفظة</span>
                  </div>
                  <div className="text-2xl font-black text-[#f3e8ff]">{toAr(850)} د</div>
                  <button className="text-[10px] font-bold text-[#c084fc] mt-2 underline">سحب الأرباح</button>
                </div>
              </div>

              <div className="bg-[#1a1221] border border-[#2d1b3d] rounded-2xl overflow-hidden divide-y divide-[#2d1b3d]">
                <button className="w-full flex items-center justify-between p-4 hover:bg-[#2d1b3d]/30 transition-all text-right">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#2d1b3d] rounded-xl flex items-center justify-center text-[#c084fc]"><Smartphone size={20} /></div>
                    <div>
                      <div className="text-sm font-bold text-[#f3e8ff]">وضع استقبال الطلبات</div>
                      <div className="text-[9px] text-[#94a3b8]">تنبيه صوتي ومرئي للطلبات الجديدة</div>
                    </div>
                  </div>
                  <div className="w-12 h-6 bg-[#9333ea] rounded-full relative"><div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full shadow-sm" /></div>
                </button>
                <button className="w-full flex items-center justify-between p-4 hover:bg-[#2d1b3d]/30 transition-all text-right">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#2d1b3d] rounded-xl flex items-center justify-center text-[#fbbf24]"><Settings size={20} /></div>
                    <div>
                      <div className="text-sm font-bold text-[#f3e8ff]">إعدادات النظام</div>
                      <div className="text-[9px] text-[#94a3b8]">اللغة، التنسيق، الحساب</div>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-[#94a3b8] opacity-30" />
                </button>
              </div>

              <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 p-5 bg-[#451225] border border-[#ec4899]/30 text-[#ec4899] rounded-2xl font-black italic transition-all hover:bg-[#451225]/80 active:scale-95"
              >
                <LogOut size={20} /> تسجيل الخروج من النظام
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CONFIRMATION OVERLAY */}
      <AnimatePresence>
        {showConfirmModal && selectedOrder && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-end sm:items-center justify-center overflow-hidden backdrop-blur-sm"
          >
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              className="bg-[#1a1221] border border-[#2d1b3d] w-full max-w-[480px] rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="w-12 h-1.5 rounded-full bg-[#2d1b3d] mx-auto mb-8" />
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-2xl font-black text-[#f3e8ff] italic tracking-tighter">{selectedOrder.id}</h3>
                  <p className="text-[10px] text-[#94a3b8] font-black uppercase tracking-widest mt-1">تأكيد عملية {selectedOrder.status === 'delivery' ? 'التسليم للعميل' : 'الاستلام من العميل'}</p>
                </div>
                <div className="bg-[#9333ea] text-white p-4 rounded-2xl shadow-lg shadow-[#9333ea]/20"><Package size={28} /></div>
              </div>

              <div className="space-y-5 mb-10">
                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <div className="bg-[#1e142b] p-5 rounded-2xl border border-[#2d1b3d]">
                    <div className="text-[10px] text-[#94a3b8] font-black uppercase tracking-widest mb-4">قائمة التفاصيل</div>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[12px] font-bold text-[#f3e8ff]">
                          <span className="flex items-center gap-2">{item.icon} {item.name}</span>
                          <span className="text-[#c084fc] font-black text-sm">× {toAr(item.qty)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-[#1e142b] p-5 rounded-2xl border border-[#2d1b3d]">
                  <div className="text-[10px] text-[#94a3b8] font-black uppercase tracking-widest mb-4">التوثيق بالصور (مطلوب)</div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="aspect-square bg-[#1a1221] border border-dashed border-[#2d1b3d] rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-[#9333ea] transition-all cursor-pointer group">
                      <Camera size={24} className="text-[#64748b] group-hover:text-[#c084fc]" />
                      <span className="text-[9px] text-[#64748b] font-black">الكمية</span>
                    </div>
                    <div className="aspect-square bg-[#1a1221] border border-dashed border-[#2d1b3d] rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-[#9333ea] transition-all cursor-pointer group">
                      <Camera size={24} className="text-[#64748b] group-hover:text-[#c084fc]" />
                      <span className="text-[9px] text-[#64748b] font-black">الحالة</span>
                    </div>
                    <div className="aspect-square bg-[#9333ea]/10 border border-[#9333ea] rounded-2xl flex flex-col items-center justify-center shadow-inner">
                      <CheckCircle2 size={32} className="text-[#c084fc]" />
                      <span className="text-[9px] text-[#c084fc] font-black uppercase mt-1">تمت</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 bg-[#1e142b] text-[#94a3b8] py-4 rounded-2xl font-black text-sm border border-[#2d1b3d] transition-all hover:bg-[#1a1221]"
                >
                  إلغاء
                </button>
                <button 
                  onClick={() => {
                    onUpdateOrderStatus(selectedOrder.id, selectedOrder.status === 'delivery' ? 'delivered' : 'pickup');
                    setShowConfirmModal(false);
                    showToast(`✅ تم ${selectedOrder.status === 'delivery' ? 'تسليم' : 'استلام'} الطلب بنجاح`);
                  }}
                  className="flex-[2] bg-[#9333ea] text-white py-4 rounded-2xl font-black italic text-sm shadow-2xl shadow-[#9333ea]/30 transition-all hover:bg-[#a855f7] active:scale-95"
                >
                  {selectedOrder.status === 'delivery' ? 'إتمام التسليم ✓' : 'إتمام الاستلام 📦'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOAST SYSTEM */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[110] bg-[#9333ea] text-white px-6 py-3 rounded-full text-xs font-black shadow-2xl flex items-center gap-2 whitespace-nowrap"
          >
            <CheckCircle2 size={16} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FIXED BOTTOM NAV FOR MOBILE FLOW */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-[#1a1221] border-t border-[#2d1b3d] grid grid-cols-4 px-2 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        {[
          { id: 'pickup', label: 'استلام', icon: '📦' },
          { id: 'delivery', label: 'تسليم', icon: '🚗' },
          { id: 'history', label: 'السجل', icon: '📋' },
          { id: 'profile', label: 'حسابي', icon: '👤' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`flex flex-col items-center gap-1 py-3 transition-all ${activeTab === item.id ? 'text-[#c084fc] scale-110' : 'text-[#64748b] opacity-60'}`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[9px] font-black">{item.label}</span>
            {activeTab === item.id && <motion.div layoutId="nav-dot" className="w-1 h-1 bg-[#c084fc] rounded-full mt-0.5" />}
          </button>
        ))}
      </div>

    </div>
  );
};
