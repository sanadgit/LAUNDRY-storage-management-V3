import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shirt, Scissors, Package, Calendar, User, CheckCircle2, 
  ChevronLeft, ChevronRight, Minus, Plus, CreditCard, 
  Banknote, Smartphone, Link as LinkIcon, MapPin, Phone, 
  Clock, Info, Sparkles, Wand2, Briefcase, Navigation, Copy
} from 'lucide-react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { CustomerUser, PricingItem, SiteConfig } from '../types';
import { LaundryIcon, resolvePricingItemIcon } from './LaundryIcon';
import { SiteLanguage, formatCurrency, formatNumber, localize } from '../lib/i18n';

interface OrderWizardProps {
  onOrderSuccess: (order: any) => Promise<any>;
  onBack: () => void;
  pricing: PricingItem[];
  config?: SiteConfig;
  user?: CustomerUser | null;
  language?: SiteLanguage;
}

type LatLngTuple = [number, number];

const DEFAULT_MAP_CENTER: LatLngTuple = [24.4539, 54.3773];

const buildMapLocationLink = (coords?: LatLngTuple | null) =>
  coords ? `https://www.google.com/maps?q=${coords[0].toFixed(6)},${coords[1].toFixed(6)}` : '';

const MapClickPicker: React.FC<{ onPick: (coords: LatLngTuple) => void }> = ({ onPick }) => {
  useMapEvents({
    click: (event) => onPick([event.latlng.lat, event.latlng.lng]),
  });
  return null;
};

const MapCenterUpdater: React.FC<{ center: LatLngTuple }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
};

const DEFAULT_SERVICES = [
  { id: 1, name: 'غسيل + كوي', desc: 'تنظيف كامل مع كوي بخاري وتعطير', icon: 'washing_machine', priceKey: 'wash_dry' },
  { id: 2, name: 'تنظيف جاف', desc: 'للملابس الحساسة والبدل والمفارش الثمينة', icon: 'dry_cleaning_suit', priceKey: 'wash_dry' },
  { id: 3, name: 'كوي فقط', desc: 'ملابسك نظيفة وتحتاج فقط للكوي', icon: 'steam_iron', priceKey: 'iron' },
  { id: 4, name: 'مفارش ومنزلية', desc: 'فراش، ستائر، بطاطين، سجاد صغير', icon: 'folded_laundry', priceKey: 'wash_dry' },
];

const DEFAULT_URGENCY = [
  { id: 1, name: 'عادي', time: '٤٨ ساعة', extra: 0, desc: 'بدون رسوم إضافية' },
  { id: 2, name: 'سريع', time: '٢٤ ساعة', extra: 5, desc: '+ ٥ درهم' },
  { id: 3, name: 'إكسبريس', time: '٦ ساعات', extra: 15, desc: '+ ١٥ درهم' },
];

const DEFAULT_PAYMENT_METHODS = [
  { id: 1, name: 'بطاقة عند التسليم', desc: 'فيزا / مدى', kind: 'card' as const },
  { id: 2, name: 'نقد عند التسليم', desc: 'مبلغ مضبوط', kind: 'cash' as const },
  { id: 3, name: 'تحويل مسبق', desc: 'STC Pay / محافظ', kind: 'wallet' as const },
  { id: 4, name: 'رابط دفع', desc: 'يُرسَل واتساب', kind: 'wallet' as const },
];

const DEFAULT_PICKUP_DAYS = [
  { id: 'today', label: 'اليوم' },
  { id: 'tomorrow', label: 'الغد' },
  { id: 'day_3', label: 'بعد غد' },
];

const DEFAULT_TIME_SLOTS: Array<{ id: string; time: string; avail: string; busy?: boolean; active?: boolean }> = [
  { id: '08-10', time: '٨ ص – ١٠ ص', avail: '٣ أماكن متاحة' },
  { id: '10-12', time: '١٠ ص – ١٢ م', avail: '٥ أماكن متاحة' },
  { id: '14-16', time: '٢ م – ٤ م', avail: '٤ أماكن متاحة' },
];

const SERVICE_COPY_EN: Record<number, { name: string; desc: string }> = {
  1: { name: 'Wash + Iron', desc: 'Full cleaning with steam ironing and fresh finishing' },
  2: { name: 'Dry Cleaning', desc: 'For delicate garments, suits, and premium linens' },
  3: { name: 'Iron Only', desc: 'Clean clothes that only need professional pressing' },
  4: { name: 'Home Linens', desc: 'Bedding, curtains, blankets, and small rugs' },
};

const URGENCY_COPY_EN: Record<number, { name: string; time: string; desc: string }> = {
  1: { name: 'Normal', time: '48 hours', desc: 'No extra fees' },
  2: { name: 'Fast', time: '24 hours', desc: '+ AED 5' },
  3: { name: 'Express', time: '6 hours', desc: '+ AED 15' },
};

const PAYMENT_COPY_EN: Record<string, { name: string; desc: string }> = {
  card: { name: 'Card on Delivery', desc: 'Visa / Mada' },
  cash: { name: 'Cash on Delivery', desc: 'Exact amount' },
  wallet: { name: 'Payment Link', desc: 'Sent by WhatsApp' },
  link: { name: 'Payment Link', desc: 'Sent by WhatsApp' },
};

const AREA_COPY_EN: Record<string, string> = {
  khalidiya: 'Al Khalidiyah',
  mussaffah: 'Mussafah',
  musaffah: 'Mussafah',
  yas: 'Yas Island',
  mbz: 'Mohammed Bin Zayed City',
  muroor: 'Al Muroor',
  bateen: 'Al Bateen',
  saadiyat: 'Saadiyat Island',
};

const PICKUP_DAY_COPY_EN: Record<string, string> = {
  today: 'Today',
  tomorrow: 'Tomorrow',
  day_3: 'Day After Tomorrow',
  day_4: 'After 3 Days',
};

const TIME_SLOT_COPY_EN: Record<string, { time: string; avail: string }> = {
  '08-10': { time: '8 AM - 10 AM', avail: '3 slots available' },
  '10-12': { time: '10 AM - 12 PM', avail: '5 slots available' },
  '12-14': { time: '12 PM - 2 PM', avail: 'Fully booked' },
  '14-16': { time: '2 PM - 4 PM', avail: '4 slots available' },
  '16-18': { time: '4 PM - 6 PM', avail: '7 slots available' },
  '18-20': { time: '6 PM - 8 PM', avail: '2 slots available' },
};

const getPaymentIcon = (kind: string) => {
  if (kind === 'cash') return Banknote;
  if (kind === 'wallet') return Smartphone;
  if (kind === 'link') return LinkIcon;
  return CreditCard;
};

export const OrderWizard: React.FC<OrderWizardProps> = ({ onOrderSuccess, onBack, pricing, config, user, language = 'ar' }) => {
  const serviceOptions = (config?.service_options?.filter((item) => item.active !== false) ?? DEFAULT_SERVICES);
  const urgencyOptions = (config?.urgency_options?.filter((item) => item.active !== false) ?? DEFAULT_URGENCY);
  const serviceAreas = config?.service_areas?.filter((item) => item.active !== false) ?? [];
  const pickupDays = (config?.pickup_days?.filter((item) => item.active !== false) ?? DEFAULT_PICKUP_DAYS);
  const timeSlots = (config?.time_slots?.filter((item) => item.active !== false) ?? DEFAULT_TIME_SLOTS);
  const paymentMethods = (config?.payment_methods?.filter((item) => item.active !== false) ?? DEFAULT_PAYMENT_METHODS);
  const [step, setStep] = useState(1);
  const [selSvcs, setSelSvcs] = useState<number[]>([serviceOptions[0]?.id ?? 1]);
  const [selUrg, setSelUrg] = useState(urgencyOptions[0]?.id ?? 1);
  const [qtys, setQtys] = useState<Record<string, number>>({});
  const [isBagSelected, setIsBagSelected] = useState(false);
  const [bagItemEstimate, setBagItemEstimate] = useState<string>('');
  const [selDate, setSelDate] = useState(pickupDays[0]?.label ?? DEFAULT_PICKUP_DAYS[0].label);
  const [selSlot, setSelSlot] = useState(timeSlots.find((slot) => !slot.busy)?.time ?? timeSlots[0]?.time ?? '');
  const [notes, setNotes] = useState('');
  const [customer, setCustomer] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    area: user?.area || '',
    address: '',
    payment: 1,
    latitude: null as number | null,
    longitude: null as number | null,
    locationLink: '',
  });
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [locationError, setLocationError] = useState('');

  const selectedCoords = useMemo<LatLngTuple | null>(
    () =>
      typeof customer.latitude === 'number' && typeof customer.longitude === 'number'
        ? [customer.latitude, customer.longitude]
        : null,
    [customer.latitude, customer.longitude]
  );
  const mapCenter = selectedCoords ?? DEFAULT_MAP_CENTER;

  const setSelectedLocation = (coords: LatLngTuple) => {
    setLocationError('');
    setCustomer((prev) => ({
      ...prev,
      latitude: coords[0],
      longitude: coords[1],
      locationLink: buildMapLocationLink(coords),
    }));
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(localize(language, 'المتصفح لا يدعم تحديد الموقع.', 'Your browser does not support location access.'));
      return;
    }
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (position) => setSelectedLocation([position.coords.latitude, position.coords.longitude]),
      () => setLocationError(localize(language, 'تعذر الحصول على موقعك الحالي. يمكنك تحديد الموقع من الخريطة.', 'Could not access your current location. You can select it from the map.')),
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  const subTotal = useMemo(() => {
    if (isBagSelected) return 0;
    
    // Determine which price key to use (default to first selected service)
    const activeService = serviceOptions.find(s => selSvcs.includes(s.id));
    const priceKey = (activeService?.priceKey || 'wash_dry') as keyof PricingItem;

    const itemsTotal = pricing.reduce((acc, item) => {
      const qty = qtys[item.barcode] || 0;
      const price = (item[priceKey] as number) || 0;
      return acc + qty * price;
    }, 0);

    const urgencyExtra = urgencyOptions.find(u => u.id === selUrg)?.extra || 0;
    return itemsTotal > 0 ? itemsTotal + urgencyExtra : 0;
  }, [qtys, selUrg, selSvcs, isBagSelected, serviceOptions, urgencyOptions]);

  const vatAmount = useMemo(() => subTotal * (config?.vat_percentage ? config.vat_percentage / 100 : 0.05), [subTotal, config?.vat_percentage]);
  const deliveryFee = config?.delivery_fee || 0;
  const totalPrice = useMemo(() => subTotal > 0 ? subTotal + vatAmount + deliveryFee : 0, [subTotal, vatAmount, deliveryFee]);

  const totalItems = useMemo(() => {
    if (isBagSelected) return 0;
    return Object.values(qtys).reduce((a: number, b: number) => a + b, 0);
  }, [qtys, isBagSelected]);

  const num = (value: number) => formatNumber(language, value);
  const money = (value: number) => formatCurrency(language, value);
  const serviceName = (service: typeof serviceOptions[number]) =>
    language === 'ar' ? service.name : SERVICE_COPY_EN[service.id]?.name ?? service.name;
  const serviceDesc = (service: typeof serviceOptions[number]) =>
    language === 'ar' ? service.desc : SERVICE_COPY_EN[service.id]?.desc ?? service.desc;
  const urgencyName = (urgency: typeof urgencyOptions[number]) =>
    language === 'ar' ? urgency.name : URGENCY_COPY_EN[urgency.id]?.name ?? urgency.name;
  const urgencyTime = (urgency: typeof urgencyOptions[number]) =>
    language === 'ar' ? urgency.time : URGENCY_COPY_EN[urgency.id]?.time ?? urgency.time;
  const urgencyDesc = (urgency: typeof urgencyOptions[number]) =>
    language === 'ar' ? urgency.desc : URGENCY_COPY_EN[urgency.id]?.desc ?? urgency.desc;
  const paymentName = (payment: typeof paymentMethods[number]) =>
    language === 'ar' ? payment.name : PAYMENT_COPY_EN[payment.kind]?.name ?? payment.name;
  const paymentDesc = (payment: typeof paymentMethods[number]) =>
    language === 'ar' ? payment.desc : PAYMENT_COPY_EN[payment.kind]?.desc ?? payment.desc;
  const areaName = (area: { id?: string; name: string }) =>
    language === 'ar' ? area.name : AREA_COPY_EN[String(area.id || '').toLowerCase()] ?? AREA_COPY_EN[String(area.name || '').toLowerCase()] ?? area.name;
  const pickupDayLabel = (day: { id: string; label: string }) =>
    language === 'ar' ? day.label : PICKUP_DAY_COPY_EN[day.id] ?? day.label;
  const timeSlotLabel = (slot: { id: string; time: string }) =>
    language === 'ar' ? slot.time : TIME_SLOT_COPY_EN[slot.id]?.time ?? slot.time;
  const timeSlotAvail = (slot: { id: string; avail?: string }) =>
    language === 'ar' ? slot.avail : TIME_SLOT_COPY_EN[slot.id]?.avail ?? slot.avail;
  const itemName = (item: PricingItem) => (language === 'ar' ? item.name_ar : item.name_en || item.name_ar);
  const categoryLabel = (cat: string) =>
    cat === 'men'
      ? localize(language, 'رجال', 'Men')
      : cat === 'women'
        ? localize(language, 'نساء', 'Women')
        : cat === 'kids'
          ? localize(language, 'أطفال', 'Kids')
          : localize(language, 'منزلية', 'Home');

  const updateQty = (id: string, delta: number) => {
    setQtys(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta)
    }));
  };

  const toggleSvc = (id: number) => {
    setSelSvcs(prev => 
      prev.includes(id) 
        ? (prev.length > 1 ? prev.filter(i => i !== id) : prev)
        : [...prev, id]
    );
  };

  const steps = [
    { id: 1, label: localize(language, 'الخدمة', 'Service'), icon: Sparkles },
    { id: 2, label: localize(language, 'الملابس', 'Items'), icon: Shirt },
    { id: 3, label: localize(language, 'الموعد', 'Schedule'), icon: Calendar },
    { id: 4, label: localize(language, 'بياناتك', 'Details'), icon: User },
    { id: 5, label: localize(language, 'تأكيد', 'Confirm'), icon: CheckCircle2 },
  ];

  const goNext = () => step < 5 && setStep(step + 1);
  const goBack = () => step > 1 ? setStep(step - 1) : onBack();

  const handleFinalSubmit = async () => {
    if (isSubmittingOrder) return;
    setSubmitError('');
    if (!user) {
      setSubmitError(localize(language, 'يجب تسجيل الدخول قبل إرسال الطلب.', 'You must log in before sending an order.'));
      return;
    }
    if (!customer.area.trim() || !customer.address.trim()) {
      setSubmitError(localize(language, 'أدخل المنطقة والعنوان التفصيلي قبل إرسال الطلب.', 'Enter the area and detailed address before sending the order.'));
      return;
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const newOrder = {
      id: code,
      dateReceived: new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' }),
      serviceType: serviceOptions.filter(s => selSvcs.includes(s.id)).map(s => s.name).join(' + '),
      status: 'new',
      customerName: customer.name || localize(language, 'عميل جديد', 'New Customer'),
      customerPhone: customer.phone,
      phoneNumber: customer.phone,
      customerNotes: notes,
      itemCount: isBagSelected ? 0 : totalItems,
      amount: totalPrice,
      totalPrice: totalPrice,
      paymentStatus: 'pending',
      priority: selUrg === 3 ? 'urgent' : selUrg === 2 ? 'express' : 'normal',
      paymentMethod: paymentMethods.find((method) => method.id === customer.payment)?.kind || 'wallet',
      branch: config?.branches?.[0]?.name || 'Customer Website',
      deliveryAddress: customer.area + (customer.address ? `، ${customer.address}` : ''),
      locationLat: customer.latitude,
      locationLng: customer.longitude,
      locationLink: customer.locationLink,
      mapLocationLink: customer.locationLink,
      driverLocationLink: customer.locationLink,
      pickupSlot: `${selDate} — ${selSlot}`,
      notes,
      eta: localize(language, 'في انتظار الاستلام', 'Waiting for pickup'),
      bags: isBagSelected ? [
        { 
          label: localize(language, 'حقيبة ملابس مرسلة (Bag Laundry)', 'Bag Laundry'), 
          items: bagItemEstimate
            ? [`${localize(language, 'العدد التقديري', 'Estimated count')}: ${num(parseInt(bagItemEstimate))} ${localize(language, 'قطعة', 'items')}`]
            : [localize(language, 'جاري الفرز والعد', 'Sorting and counting in progress')]
        }
      ] : [
        { 
          label: localize(language, 'ملابس مفروزة', 'Sorted Clothes'), 
          items: pricing.filter(p => qtys[p.barcode] > 0).map(p => `${itemName(p)} (x${qtys[p.barcode]})`) 
        }
      ]
    };

    try {
      setIsSubmittingOrder(true);
      const savedOrder = await onOrderSuccess(newOrder);
      setOrderCode(`INO-2025-${savedOrder?.id || code}`);
      setStep(6);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error ?? '');
      setSubmitError(message || localize(language, 'تعذر إرسال الطلب إلى النظام. حاول مرة أخرى.', 'Could not send the order to the system. Please try again.'));
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const [orderCode, setOrderCode] = useState('');

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-2xl shadow-primary/10 overflow-hidden border border-gray-100 min-h-[600px]">
      {/* Top Bar */}
      <div className="bg-secondary p-6 flex items-center gap-4">
        <LaundryIcon
          name="outty-order-basket"
          alt=""
          className="h-16 w-16 rounded-2xl bg-white/10 p-1"
          imageClassName="h-full w-full rounded-xl object-contain"
        />
        <div>
          <h2 className="text-white font-bold leading-tight">{localize(language, 'اطلب الآن', 'Order Now')} - In & Out Laundry</h2>
          <p className="text-primary/60 text-xs font-medium">{localize(language, 'طلب استلام وتوصيل جديد', 'New pickup and delivery order')}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gray-50/50 border-b border-gray-100 p-6 md:px-12">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2" />
          <div 
            className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary -translate-y-1/2 transition-all duration-500 origin-right"
            style={{ width: `${((step - 1) / 4) * 100}%` }}
          />
          
          {steps.map((s) => (
            <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
              <div 
                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold transition-all duration-300 ${
                  step >= s.id 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' 
                    : 'bg-white text-gray-400 border border-gray-200'
                }`}
              >
                {step > s.id ? <CheckCircle2 size={18} /> : <span>{num(s.id)}</span>}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s.id ? 'text-primary' : 'text-gray-400'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-[500px]">
        {/* Main Form Content */}
        <div className="flex-1 p-8 md:p-12 border-l border-gray-100">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* STEP 1: SERVICE */}
              {step === 1 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-black italic mb-2 tracking-tight">
                      {localize(language, 'اختر نوع', 'Choose Your')} <span className="text-primary">{localize(language, 'الخدمة', 'Service')}</span>
                    </h3>
                    <p className="text-gray-500 font-medium">{localize(language, 'ما الذي تحتاج إليه اليوم؟', 'What do you need today?')}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {serviceOptions.map((svc) => (
                      <button
                        key={svc.id}
                        onClick={() => toggleSvc(svc.id)}
                        className={`p-6 rounded-[2rem] border-2 text-right transition-all group relative ${
                          selSvcs.includes(svc.id) 
                            ? 'bg-primary/5 border-primary shadow-xl shadow-primary/5' 
                            : 'bg-white border-gray-100 hover:border-primary/20'
                        }`}
                      >
                        {selSvcs.includes(svc.id) && (
                          <div className="absolute top-4 left-4 w-6 h-6 bg-primary text-white rounded-lg flex items-center justify-center">
                            <CheckCircle2 size={14} />
                          </div>
                        )}
                        <LaundryIcon name={svc.icon} alt={serviceName(svc)} className="mb-4 h-20 w-20 transition-transform group-hover:scale-110" />
                        <h4 className={`text-lg font-bold mb-1 ${selSvcs.includes(svc.id) ? 'text-primary' : 'text-secondary'}`}>{serviceName(svc)}</h4>
                        <p className="text-gray-500 text-xs font-medium leading-relaxed">{serviceDesc(svc)}</p>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                       {localize(language, 'سرعة الإنجاز', 'Service Speed')}
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {urgencyOptions.map((urg) => (
                        <button
                          key={urg.id}
                          onClick={() => setSelUrg(urg.id)}
                          className={`p-5 rounded-[1.5rem] border-2 text-center transition-all ${
                            selUrg === urg.id 
                              ? 'bg-secondary text-white border-secondary shadow-xl' 
                              : 'bg-white border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          <p className="text-sm font-bold mb-1">{urgencyName(urg)}</p>
                          <p className={`text-[10px] font-medium opacity-60 mb-1`}>{urgencyTime(urg)}</p>
                          <p className={`text-[10px] font-black ${selUrg === urg.id ? 'text-primary' : 'text-primary'}`}>{urgencyDesc(urg)}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: ITEMS */}
              {step === 2 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-black italic mb-2 tracking-tight">
                      {localize(language, 'أضف', 'Add')} <span className="text-primary">{localize(language, 'الملابس', 'Clothes')}</span>
                    </h3>
                    <p className="text-gray-500 font-medium">
                      {localize(language, 'حدد القطع وكمياتها أو اختر التسليم المباشر عبر الحقيبة', 'Select items and quantities or choose direct bag pickup')}
                    </p>
                  </div>

                  {/* Bag Selection Option */}
                  <div className="space-y-4">
                    <button
                      onClick={() => {
                          setIsBagSelected(!isBagSelected);
                          if (!isBagSelected) {
                            setQtys({});
                            setBagItemEstimate('');
                          }
                      }}
                      className={`w-full p-6 rounded-[2rem] border-2 text-right transition-all group relative overflow-hidden ${
                        isBagSelected 
                          ? 'bg-primary border-primary shadow-2xl shadow-primary/30 text-white' 
                          : 'bg-white border-gray-100 hover:border-primary/20'
                      }`}
                    >
                      <div className="flex items-center gap-6 relative z-10">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${isBagSelected ? 'bg-white/20' : 'bg-gray-100'}`}>
                          <Briefcase size={32} className={isBagSelected ? 'text-white' : 'text-primary'} />
                        </div>
                        <div className="flex-1">
                          <h4 className={`text-lg font-bold mb-1 ${isBagSelected ? 'text-white' : 'text-secondary'}`}>{localize(language, 'تسليم بحقيبة (Bag Laundry)', 'Bag Laundry Pickup')}</h4>
                          <p className={`text-xs font-medium leading-relaxed ${isBagSelected ? 'text-white/80' : 'text-gray-500'}`}>
                            {localize(language, 'سلمنا الملابس في حقيبة، وسنقوم بفرزها وعدها في المحل وإخطارك بالعدد عبر الداش بورد.', 'Hand over clothes in a bag. We will sort and count them at the branch, then update you in the dashboard.')}
                          </p>
                        </div>
                        {isBagSelected && <CheckCircle2 size={24} className="text-white" />}
                      </div>
                    </button>

                    {isBagSelected && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-white border-2 border-primary/20 rounded-[2rem] space-y-4 shadow-xl shadow-primary/5"
                      >
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary block mb-2">
                          {localize(language, 'كم عدد القطع تقريباً في الحقيبة؟ (اختياري)', 'Approximate number of items in the bag? (Optional)')}
                        </label>
                        <div className="relative">
                          <input 
                            type="text" 
                            inputMode="numeric"
                            value={bagItemEstimate}
                            onChange={(e) => setBagItemEstimate(e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder={localize(language, 'مثال: 15', 'Example: 15')}
                            className="w-full p-4 pr-12 rounded-xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none font-bold transition-all text-right"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs pointer-events-none">
                            {localize(language, 'قطعة', 'items')}
                          </div>
                        </div>
                        <p className="text-[9px] text-gray-500 font-medium italic">
                          {localize(language, '* هذا العدد تقديري فقط لمساعدتنا في التخطيط، وسيتم العد الدقيق عند الاستلام.', '* This is only an estimate. The final count will be confirmed after pickup.')}
                        </p>
                      </motion.div>
                    )}
                  </div>

                  <AnimatePresence>
                    {!isBagSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-8 overflow-hidden"
                      >
                        {['men', 'women', 'kids', 'home'].map((cat) => (
                          <div key={cat} className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary border-b border-gray-100 pb-2">
                              {categoryLabel(cat)}
                            </h4>
                            <div className="space-y-2">
                              {pricing.filter(p => p.category === cat).map((item) => {
                                // Default to first selected service price
                                const activeService = serviceOptions.find(s => selSvcs.includes(s.id));
                                const priceKey = (activeService?.priceKey || 'wash_dry') as keyof PricingItem;
                                const itemPrice = item[priceKey] as string;

                                return (
                                  <div key={item.barcode} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-all">
                                    <div className="flex items-center gap-4">
                                      <LaundryIcon
                                        name={resolvePricingItemIcon(item)}
                                        alt={itemName(item)}
                                        className="h-10 w-10"
                                      />
                                      <div>
                                        <p className="font-bold text-secondary text-sm">{itemName(item)}</p>
                                        <p className="text-[10px] font-medium text-gray-400">
                                          {item.name_en} - {money(parseFloat(itemPrice) || 0)} / {localize(language, 'قطعة', 'item')}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <button 
                                        onClick={() => updateQty(item.barcode, -1)}
                                        className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
                                      >
                                        <Minus size={16} />
                                      </button>
                                      <span className="text-lg font-black text-secondary min-w-[2ch] text-center">
                                        {num(qtys[item.barcode] || 0)}
                                      </span>
                                      <button 
                                        onClick={() => updateQty(item.barcode, 1)}
                                        className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all"
                                      >
                                        <Plus size={16} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* STEP 3: LOGISTICS */}
              {step === 3 && (
                <div className="space-y-8">
                   <div>
                    <h3 className="text-2xl font-black italic mb-2 tracking-tight">
                      {localize(language, 'موعد', 'Pickup')} <span className="text-primary">{localize(language, 'الاستلام', 'Schedule')}</span>
                    </h3>
                    <p className="text-gray-500 font-medium">{localize(language, 'متى تريد أن نأتي لاستلام ملابسك؟', 'When should we come to pick up your clothes?')}</p>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{localize(language, 'اليوم', 'Day')}</label>
                    <select 
                      value={selDate}
                      onChange={(e) => setSelDate(e.target.value)}
                      className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none font-bold transition-all"
                    >
                      {pickupDays.map((day) => (
                        <option key={day.id} value={day.label}>{pickupDayLabel(day)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 font-display">{localize(language, 'الفترة الزمنية', 'Time Slot')}</label>
                    <div className="grid grid-cols-2 gap-3">
                      {timeSlots.map((slot, i) => (
                        <button
                          key={i}
                          disabled={slot.busy}
                          onClick={() => setSelSlot(slot.time)}
                          className={`p-5 rounded-2xl border-2 text-right transition-all ${
                            selSlot === slot.time 
                              ? 'bg-primary/5 border-primary shadow-lg shadow-primary/5' 
                              : slot.busy 
                                ? 'bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed'
                                : 'bg-white border-gray-100 hover:border-primary/20'
                          }`}
                        >
                          <p className={`text-sm font-black mb-1 ${selSlot === slot.time ? 'text-primary' : 'text-secondary'}`}>{timeSlotLabel(slot)}</p>
                          <p className="text-[9px] font-bold text-gray-400">{timeSlotAvail(slot)}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{localize(language, 'ملاحظات للسائق (اختياري)', 'Driver Notes (Optional)')}</label>
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={localize(language, 'مثال: الطابق الثالث، اضغط الجرس مرتين…', 'Example: third floor, ring twice...')}
                      className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none font-bold transition-all min-h-[100px] resize-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: CUSTOMER INFO */}
              {step === 4 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-black italic mb-2 tracking-tight">
                      {localize(language, 'بياناتك', 'Your')} <span className="text-primary">{localize(language, 'الشخصية', 'Details')}</span>
                    </h3>
                    <p className="text-gray-500 font-medium">{localize(language, 'حتى نتواصل معك ونصل إليك بسهولة', 'So we can contact you and reach you easily')}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{localize(language, 'الاسم الكامل', 'Full Name')}</label>
                       <input 
                         type="text" 
                         value={customer.name}
                         onChange={(e) => setCustomer({...customer, name: e.target.value})}
                         readOnly={Boolean(user)}
                         placeholder={localize(language, 'محمد عبدالله الأحمد', 'Mohammed Abdullah')}
                         className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none font-bold transition-all read-only:text-gray-500"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{localize(language, 'رقم الجوال', 'Mobile Number')}</label>
                       <input 
                         type="tel" 
                         value={customer.phone}
                         onChange={(e) => setCustomer({...customer, phone: e.target.value})}
                         readOnly={Boolean(user)}
                         placeholder="05X XXX XXXX"
                         className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none font-bold transition-all text-left read-only:text-gray-500"
                         dir="ltr"
                       />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-6">
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          {localize(language, 'المنطقة / الحي', 'Area / District')}
                        </label>
                        <select
                          value={customer.area}
                          onChange={(e) => setCustomer({...customer, area: e.target.value})}
                          className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none font-bold transition-all"
                        >
                          <option value="">{localize(language, '— اختر المنطقة —', '-- Choose area --')}</option>
                          {serviceAreas.map((area) => (
                            <option key={area.id} value={area.name}>{areaName(area)}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          {localize(language, 'العنوان التفصيلي', 'Detailed Address')}
                        </label>
                        <textarea
                          value={customer.address}
                          onChange={(e) => setCustomer({...customer, address: e.target.value})}
                          placeholder={localize(language, 'اسم الشارع، رقم المبنى، رقم الشقة…', 'Street name, building number, apartment...')}
                          className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none font-bold transition-all min-h-[100px] resize-none"
                        />
                      </div>

                      <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
                        <div className="mb-3 flex items-center gap-2 text-primary">
                          <LinkIcon size={16} />
                          <p className="text-[10px] font-black uppercase tracking-widest">
                            {localize(language, 'رابط الموقع للسائق', 'Driver Location Link')}
                          </p>
                        </div>
                        {customer.locationLink ? (
                          <div className="flex items-center gap-2 rounded-xl bg-white p-3 shadow-sm">
                            <input
                              readOnly
                              dir="ltr"
                              value={customer.locationLink}
                              className="min-w-0 flex-1 bg-transparent text-left text-[11px] font-bold text-secondary outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => navigator.clipboard?.writeText(customer.locationLink)}
                              className="rounded-lg bg-primary/10 p-2 text-primary"
                              aria-label={localize(language, 'نسخ الرابط', 'Copy link')}
                            >
                              <Copy size={15} />
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs font-bold leading-relaxed text-gray-500">
                            {localize(language, 'اختر موقعك من الخريطة أو استخدم موقعك الحالي ليصل الرابط مباشرة للسائق.', 'Pick your location on the map or use your current location so the driver receives the link.')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-[2rem] border border-primary/15 bg-white shadow-2xl shadow-primary/10">
                      <div className="flex flex-col gap-3 border-b border-gray-100 p-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                            {localize(language, 'اختر من الخريطة', 'Choose from Map')}
                          </p>
                          <p className="text-xs font-bold text-gray-500">
                            {localize(language, 'اضغط على الخريطة لتثبيت موقع الاستلام.', 'Click the map to pin the pickup location.')}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={useCurrentLocation}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-4 py-3 text-xs font-black text-white shadow-lg shadow-secondary/15"
                        >
                          <Navigation size={15} />
                          {localize(language, 'استخدم موقعي الحالي', 'Use Current Location')}
                        </button>
                      </div>

                      <div className="relative h-[320px] bg-brand-bg">
                        <MapContainer
                          center={mapCenter}
                          zoom={selectedCoords ? 16 : 11}
                          zoomControl={false}
                          style={{ height: '100%', width: '100%' }}
                        >
                          <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; OpenStreetMap &copy; CARTO'
                          />
                          <MapClickPicker onPick={setSelectedLocation} />
                          <MapCenterUpdater center={mapCenter} />
                          {selectedCoords && (
                            <CircleMarker
                              center={selectedCoords}
                              radius={14}
                              pathOptions={{ color: '#8f00ff', fillColor: '#8f00ff', fillOpacity: 0.82, weight: 4 }}
                            >
                              <Popup>{localize(language, 'موقع الاستلام', 'Pickup location')}</Popup>
                            </CircleMarker>
                          )}
                        </MapContainer>
                        <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-2xl bg-white/90 p-3 text-right shadow-xl backdrop-blur">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                            {selectedCoords ? localize(language, 'الموقع مثبت', 'Location selected') : localize(language, 'لم يتم تثبيت الموقع', 'No location selected')}
                          </p>
                          <p className="mt-1 text-xs font-black text-secondary" dir="ltr">
                            {selectedCoords ? `${selectedCoords[0].toFixed(5)}, ${selectedCoords[1].toFixed(5)}` : localize(language, 'اضغط على الخريطة', 'Click the map')}
                          </p>
                        </div>
                      </div>
                      {locationError && (
                        <div className="border-t border-danger/10 bg-danger/5 px-4 py-3 text-xs font-bold text-danger">
                          {locationError}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{localize(language, 'طريقة الدفع', 'Payment Method')}</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {paymentMethods.map((pay) => {
                        const PayIcon = getPaymentIcon(pay.kind);
                        return (
                        <button
                          key={pay.id}
                          onClick={() => setCustomer({...customer, payment: pay.id})}
                          className={`p-4 rounded-2xl border-2 text-center transition-all ${
                            customer.payment === pay.id 
                              ? 'bg-secondary text-white border-secondary shadow-xl' 
                              : 'bg-white border-gray-100 hover:border-primary/20'
                          }`}
                        >
                          <PayIcon size={20} className="mx-auto mb-2" />
                          <p className="text-[9px] font-bold uppercase tracking-tight">{paymentName(pay)}</p>
                          <p className="text-[7px] opacity-60">{paymentDesc(pay)}</p>
                        </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: CONFIRMATION */}
              {step === 5 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-black italic mb-2 tracking-tight">
                      {localize(language, 'مراجعة', 'Review')} <span className="text-primary">{localize(language, 'الطلب', 'Order')}</span>
                    </h3>
                    <p className="text-gray-500 font-medium">{localize(language, 'تحقق من التفاصيل قبل الإرسال', 'Check the details before sending')}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-[2rem] p-6 space-y-4 border border-gray-100">
                       <p className="text-[10px] font-black uppercase tracking-widest text-primary border-b border-primary/10 pb-2">{localize(language, 'تفاصيل العميل', 'Customer Details')}</p>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[9px] font-bold text-gray-400">{localize(language, 'الاسم', 'Name')}</p>
                            <p className="text-sm font-bold">{customer.name || '—'}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-gray-400">{localize(language, 'الجوال', 'Mobile')}</p>
                            <p className="text-sm font-bold" dir="ltr">{customer.phone || '—'}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-[9px] font-bold text-gray-400">{localize(language, 'العنوان', 'Address')}</p>
                            <p className="text-sm font-bold">{customer.area} {customer.address ? `، ${customer.address}` : ''}</p>
                          </div>
                          {customer.locationLink && (
                            <div className="col-span-2">
                              <p className="text-[9px] font-bold text-gray-400">
                                {localize(language, 'رابط الموقع', 'Location Link')}
                              </p>
                              <a
                                href={customer.locationLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-black text-primary underline"
                                dir="ltr"
                              >
                                {customer.locationLink}
                              </a>
                            </div>
                          )}
                       </div>
                    </div>

                    <div className="bg-gray-50 rounded-[2rem] p-6 space-y-4 border border-gray-100">
                       <p className="text-[10px] font-black uppercase tracking-widest text-primary border-b border-primary/10 pb-2">{localize(language, 'تفاصيل الخدمة', 'Service Details')}</p>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[9px] font-bold text-gray-400">{localize(language, 'الخدمة', 'Service')}</p>
                            <p className="text-sm font-bold">
                              {serviceOptions.filter(s => selSvcs.includes(s.id)).map(serviceName).join(' + ')}
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-gray-400">{localize(language, 'السرعة', 'Speed')}</p>
                            <p className="text-sm font-bold">{urgencyOptions.find(u => u.id === selUrg) ? urgencyName(urgencyOptions.find(u => u.id === selUrg)!) : '-'}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-gray-400">{localize(language, 'موعد الاستلام', 'Pickup Slot')}</p>
                            <p className="text-sm font-bold">
                              {pickupDays.find((day) => day.label === selDate) ? pickupDayLabel(pickupDays.find((day) => day.label === selDate)!) : selDate} - {timeSlots.find((slot) => slot.time === selSlot) ? timeSlotLabel(timeSlots.find((slot) => slot.time === selSlot)!) : selSlot}
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-gray-400">{localize(language, 'طريقة الدفع', 'Payment Method')}</p>
                            <p className="text-sm font-bold">{paymentMethods.find(p => p.id === customer.payment) ? paymentName(paymentMethods.find(p => p.id === customer.payment)!) : '-'}</p>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="bg-primary text-white rounded-[2rem] p-8 space-y-4 shadow-2xl shadow-primary/30">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4 text-white/70 text-xs font-bold uppercase">
                       <span>{localize(language, 'المجموع الفرعي', 'Subtotal')}</span>
                       <span>{isBagSelected ? '—' : money(subTotal)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/10 pb-4 text-white/70 text-xs font-bold uppercase">
                       <span>{localize(language, 'رسوم التوصيل', 'Delivery Fee')}</span>
                       <span>{isBagSelected ? '—' : money(deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/10 pb-4 text-white/70 text-xs font-bold uppercase">
                       <span>{localize(language, 'ضريبة القيمة المضافة', 'VAT')} ({num(config?.vat_percentage || 5)}%)</span>
                       <span>{isBagSelected ? '—' : money(vatAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <div>
                        <p className="text-white/60 text-xs font-bold uppercase mb-1">{localize(language, 'المبلغ الإجمالي', 'Total Amount')}</p>
                        <p className="text-4xl font-black italic">
                          {isBagSelected ? '—' : money(totalPrice)}
                        </p>
                      </div>
                      <div className="text-right hidden md:block">
                        <p className="text-white/60 text-[10px] font-bold mb-1">{localize(language, 'عدد القطع', 'Item Count')}</p>
                        <p className="text-xl font-bold">
                          {isBagSelected 
                            ? (bagItemEstimate ? `~ ${num(parseInt(bagItemEstimate))} ${localize(language, 'قطعة', 'items')}` : localize(language, 'جاري التحديد', 'Pending')) 
                            : `${num(totalItems)} ${localize(language, 'قطعة', 'items')}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 p-4 bg-primary/10 rounded-2xl text-primary border border-primary/20">
                    <Info size={20} className="flex-shrink-0" />
                    <p className="text-[10px] font-bold leading-relaxed">
                      {localize(language, 'هذا مبلغ تقديري أولي. السعر النهائي يتم حسابه بدقة بعد استلام الملابس والعد الفعلي وفحص حالة القطع في المصبغة.', 'This is an initial estimate. The final price will be calculated after receiving, counting, and checking the clothes at the laundry.')}
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 6: SUCCESS */}
              {step === 6 && (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="py-12 text-center space-y-6"
                >
                  <LaundryIcon
                    name="outty-delivery"
                    alt=""
                    className="mx-auto h-36 w-36 rounded-[2rem] bg-white/70 p-2 shadow-2xl shadow-primary/10"
                    imageClassName="h-full w-full rounded-3xl object-contain"
                  />
                  <div>
                    <h3 className="text-3xl font-black italic mb-2">
                      {localize(language, 'تم استلام طلبك', 'Your order was received')} <span className="text-success">{localize(language, 'بنجاح!', 'successfully!')}</span>
                    </h3>
                    <p className="text-gray-500 font-medium max-w-sm mx-auto">
                      {localize(language, 'سيتواصل معك فريقنا خلال دقائق لتأكيد الموعد وستصلك رسالة واتساب بتفاصيل الطلب.', 'Our team will contact you shortly to confirm the slot, and you will receive WhatsApp order details.')}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 inline-block">
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">{localize(language, 'رقم تتبع الطلب', 'Tracking Number')}</p>
                    <p className="text-3xl font-black text-primary tracking-[0.2em]">{orderCode}</p>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 justify-center pt-8">
                     <button 
                       onClick={() => { setStep(1); setQtys({}); }}
                       className="px-12 py-4 bg-primary text-white rounded-2xl font-black italic shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                     >
                       {localize(language, 'طلب جديد', 'New Order')}
                     </button>
                     <button 
                       onClick={onBack}
                       className="px-12 py-4 bg-white border border-gray-100 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                     >
                       {localize(language, 'العودة للرئيسية', 'Back Home')} <ChevronLeft size={18} />
                     </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons (Hidden on Step 6) */}
          {step < 6 && (
            <div className="mt-12 pt-8 border-t border-gray-100 space-y-4">
              {submitError && (
                <div className="rounded-2xl border border-danger/20 bg-danger/5 px-5 py-4 text-sm font-bold text-danger text-right">
                  {submitError}
                </div>
              )}
              <div className="flex gap-4">
               <button 
                 onClick={goBack}
                 disabled={isSubmittingOrder}
                 className="px-8 py-4 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all flex items-center gap-2"
               >
                 <ChevronRight size={18} /> {localize(language, 'رجوع', 'Back')}
               </button>
               <button 
                 onClick={step === 5 ? handleFinalSubmit : goNext}
                 disabled={isSubmittingOrder || (step === 2 && !isBagSelected && totalItems === 0)}
                 className="flex-1 bg-primary text-white py-4 rounded-2xl text-sm font-black italic shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
               >
                 {isSubmittingOrder
                   ? localize(language, 'جاري إرسال الطلب إلى النظام...', 'Sending order to the system...')
                   : step === 5
                     ? localize(language, '✓ تأكيد وإرسال الطلب', 'Confirm & Send Order')
                     : localize(language, 'التالي — خطوة إضافية', 'Next Step')} <ChevronLeft size={18} />
               </button>
              </div>
            </div>
          )}
        </div>

        {/* Floating Cart / Summary */}
        <aside className="w-full lg:w-80 bg-gray-50/50 p-8 md:p-10 space-y-8 flex flex-col">
          <div className="space-y-4">
             <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
               <Package size={16} /> {localize(language, 'ملخص الطلب', 'Order Summary')}
             </h4>
             <div className="space-y-4 max-h-[350px] overflow-y-auto no-scrollbar">
                {isBagSelected ? (
                  <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 space-y-2">
                    <p className="text-sm font-bold text-primary flex items-center gap-2">
                      <Briefcase size={16} /> {localize(language, 'حقيبة ملابس', 'Bag Laundry')}
                    </p>
                    {bagItemEstimate && (
                      <p className="text-xs font-bold text-secondary">
                        {localize(language, 'العدد التقديري', 'Estimated count')}: {num(parseInt(bagItemEstimate))} {localize(language, 'قطعة', 'items')}
                      </p>
                    )}
                    <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                      {localize(language, 'سيتم فرز عدد القطع في المصبغة وتحديثها في نظامك لاحقاً.', 'Items will be counted at the laundry and updated in your dashboard later.')}
                    </p>
                  </div>
                ) : (
                  <>
                    {pricing.filter(p => qtys[p.barcode] > 0).map((item) => {
                      const activeService = serviceOptions.find(s => selSvcs.includes(s.id));
                      const priceKey = (activeService?.priceKey || 'wash_dry') as keyof PricingItem;
                      const itemPrice = parseFloat(item[priceKey] as string) || 0;

                      return (
                        <div key={item.barcode} className="flex justify-between items-center group">
                          <div className="flex-1">
                            <p className="text-sm font-bold text-secondary">{itemName(item)}</p>
                            <p className="text-[10px] text-gray-400 font-medium">x {num(qtys[item.barcode])}</p>
                          </div>
                          <p className="text-sm font-black text-primary">{money(qtys[item.barcode] * itemPrice)}</p>
                        </div>
                      );
                    })}
                    {totalItems === 0 && (
                      <div className="py-8 text-center">
                        <LaundryIcon
                          name="outty-empty-state"
                          alt=""
                          className="mx-auto mb-3 h-24 w-24 rounded-3xl bg-white/70 p-1.5 shadow-sm"
                          imageClassName="h-full w-full rounded-2xl object-contain opacity-90"
                        />
                        <p className="text-sm text-gray-400 italic">{localize(language, 'لم يتم اختيار أي قطع بعد', 'No items selected yet')}</p>
                      </div>
                    )}
                  </>
                )}
             </div>
          </div>

          <div className="mt-auto space-y-4 pt-6 border-t border-gray-200">
             <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <span>{localize(language, 'المجموع', 'Subtotal')}</span>
                  <span>{money(subTotal)}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <span>{localize(language, 'التوصيل', 'Delivery')}</span>
                  <span>{money(deliveryFee)}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <span>{localize(language, 'الضريبة', 'Tax')} ({num(config?.vat_percentage || 5)}%)</span>
                  <span>{money(vatAmount)}</span>
                </div>
             </div>
             
             <div className="flex justify-between items-end border-t border-gray-100 pt-4">
               <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{localize(language, 'الإجمالي', 'Total')}</p>
               <p className="text-3xl font-black italic text-primary">{money(totalPrice)}</p>
             </div>
             
             {totalItems > 0 && (
               <div className="p-4 bg-primary/10 rounded-2xl text-[10px] font-bold text-primary flex items-center gap-2">
                  <Wand2 size={14} className="animate-pulse" />
                  {urgencyOptions.find(u => u.id === selUrg) ? urgencyName(urgencyOptions.find(u => u.id === selUrg)!) : ''} (+ {money(urgencyOptions.find(u => u.id === selUrg)?.extra || 0)})
               </div>
             )}

             <div className="p-4 bg-white/50 rounded-2xl border border-gray-100 text-[9px] font-medium text-gray-500 leading-relaxed italic">
               {localize(language, '* سيتم إرسال نسخة من الفاتورة التقديرية إلى رقم جوالك المسجل بمجرد تأكيد الطلب.', '* A copy of the estimated invoice will be sent to your registered mobile number after confirmation.')}
             </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
