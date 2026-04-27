import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shirt, Scissors, Package, Calendar, User, CheckCircle2, 
  ChevronLeft, ChevronRight, Minus, Plus, CreditCard, 
  Banknote, Smartphone, Link as LinkIcon, MapPin, Phone, 
  Clock, Info, Sparkles, Wand2, Briefcase
} from 'lucide-react';
import { PricingItem, SiteConfig } from '../types';

interface OrderWizardProps {
  onOrderSuccess: (order: any) => void;
  onBack: () => void;
  pricing: PricingItem[];
  config?: SiteConfig;
}

const SERVICES = [
  { id: 1, name: 'غسيل + كوي', desc: 'تنظيف كامل مع كوي بخاري وتعطير', icon: '🫧', priceKey: 'wash_dry' },
  { id: 2, name: 'تنظيف جاف', desc: 'للملابس الحساسة والبدل والمفارش الثمينة', icon: '🥼', priceKey: 'wash_dry' },
  { id: 3, name: 'كوي فقط', desc: 'ملابسك نظيفة وتحتاج فقط للكوي', icon: '♨️', priceKey: 'iron' },
  { id: 4, name: 'مفارش ومنزلية', desc: 'فراش، ستائر، بطاطين، سجاد صغير', icon: '🛏️', priceKey: 'wash_dry' },
];

const URGENCY = [
  { id: 1, name: 'عادي', time: '٤٨ ساعة', extra: 0, desc: 'بدون رسوم إضافية' },
  { id: 2, name: 'سريع', time: '٢٤ ساعة', extra: 5, desc: '+ ٥ درهم' },
  { id: 3, name: 'إكسبريس', time: '٦ ساعات', extra: 15, desc: '+ ١٥ درهم' },
];

const PAYMENT_METHODS = [
  { id: 1, name: 'بطاقة عند التسليم', desc: 'فيزا / مدى', icon: CreditCard },
  { id: 2, name: 'نقد عند التسليم', desc: 'مبلغ مضبوط', icon: Banknote },
  { id: 3, name: 'تحويل مسبق', desc: 'STC Pay / محافظ', icon: Smartphone },
  { id: 4, name: 'رابط دفع', desc: 'يُرسَل واتساب', icon: LinkIcon },
];

export const OrderWizard: React.FC<OrderWizardProps> = ({ onOrderSuccess, onBack, pricing, config }) => {
  const [step, setStep] = useState(1);
  const [selSvcs, setSelSvcs] = useState<number[]>([1]);
  const [selUrg, setSelUrg] = useState(2);
  const [qtys, setQtys] = useState<Record<string, number>>({});
  const [isBagSelected, setIsBagSelected] = useState(false);
  const [bagItemEstimate, setBagItemEstimate] = useState<string>('');
  const [selDate, setSelDate] = useState('اليوم — الأربعاء ٢٢ يناير');
  const [selSlot, setSelSlot] = useState('١٠ ص – ١٢ م');
  const [notes, setNotes] = useState('');
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    area: '',
    address: '',
    payment: 1
  });

  const subTotal = useMemo(() => {
    if (isBagSelected) return 0;
    
    // Determine which price key to use (default to first selected service)
    const activeService = SERVICES.find(s => selSvcs.includes(s.id));
    const priceKey = (activeService?.priceKey || 'wash_dry') as keyof PricingItem;

    const itemsTotal = pricing.reduce((acc, item) => {
      const qty = qtys[item.barcode] || 0;
      const price = (item[priceKey] as number) || 0;
      return acc + qty * price;
    }, 0);

    const urgencyExtra = URGENCY.find(u => u.id === selUrg)?.extra || 0;
    return itemsTotal > 0 ? itemsTotal + urgencyExtra : 0;
  }, [qtys, selUrg, selSvcs, isBagSelected]);

  const vatAmount = useMemo(() => subTotal * (config?.vat_percentage ? config.vat_percentage / 100 : 0.05), [subTotal, config?.vat_percentage]);
  const deliveryFee = config?.delivery_fee || 0;
  const totalPrice = useMemo(() => subTotal > 0 ? subTotal + vatAmount + deliveryFee : 0, [subTotal, vatAmount, deliveryFee]);

  const totalItems = useMemo(() => {
    if (isBagSelected) return 0;
    return Object.values(qtys).reduce((a: number, b: number) => a + b, 0);
  }, [qtys, isBagSelected]);

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
    { id: 1, label: 'الخدمة', icon: Sparkles },
    { id: 2, label: 'الملابس', icon: Shirt },
    { id: 3, label: 'الموعد', icon: Calendar },
    { id: 4, label: 'بياناتك', icon: User },
    { id: 5, label: 'تأكيد', icon: CheckCircle2 },
  ];

  const goNext = () => step < 5 && setStep(step + 1);
  const goBack = () => step > 1 ? setStep(step - 1) : onBack();

  const handleFinalSubmit = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const newOrder = {
      id: code,
      dateReceived: new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' }),
      serviceType: SERVICES.filter(s => selSvcs.includes(s.id)).map(s => s.name).join(' + '),
      status: 'new',
      customerName: customer.name || 'عميل جديد',
      phoneNumber: customer.phone,
      itemCount: isBagSelected ? 0 : totalItems,
      totalPrice: totalPrice,
      deliveryAddress: customer.area + (customer.address ? `، ${customer.address}` : ''),
      eta: 'في انتظار الاستلام',
      bags: isBagSelected ? [
        { 
          label: 'حقيبة ملابس مرسلة (Bag Laundry)', 
          items: bagItemEstimate ? [`العدد التقديري: ${toAr(parseInt(bagItemEstimate))} قطعة`] : ['جاري الفرز والعد'] 
        }
      ] : [
        { 
          label: 'ملابس مفروزة', 
          items: pricing.filter(p => qtys[p.barcode] > 0).map(p => `${p.name_ar} (×${qtys[p.barcode]})`) 
        }
      ]
    };
    
    onOrderSuccess(newOrder);
    setOrderCode(`INO-2025-${code}`);
    setStep(6);
  };

  const toAr = (n: any) => (Number(n) || 0).toLocaleString('ar-SA');
  const [orderCode, setOrderCode] = useState('');

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-2xl shadow-primary/10 overflow-hidden border border-gray-100 min-h-[600px]">
      {/* Top Bar */}
      <div className="bg-secondary p-6 flex items-center gap-4">
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center font-black text-white italic">I&O</div>
        <div>
          <h2 className="text-white font-bold leading-tight">اطلب الآن — In & Out Laundry</h2>
          <p className="text-primary/60 text-xs font-medium">طلب استلام وتوصيل جديد</p>
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
                {step > s.id ? <CheckCircle2 size={18} /> : <span>{toAr(s.id)}</span>}
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
                    <h3 className="text-2xl font-black italic mb-2 tracking-tight">اختر نوع <span className="text-primary">الخدمة</span></h3>
                    <p className="text-gray-500 font-medium">ما الذي تحتاج إليه اليوم؟</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {SERVICES.map((svc) => (
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
                        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{svc.icon}</div>
                        <h4 className={`text-lg font-bold mb-1 ${selSvcs.includes(svc.id) ? 'text-primary' : 'text-gray-900'}`}>{svc.name}</h4>
                        <p className="text-gray-500 text-xs font-medium leading-relaxed">{svc.desc}</p>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                       سرعة الإنجاز
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {URGENCY.map((urg) => (
                        <button
                          key={urg.id}
                          onClick={() => setSelUrg(urg.id)}
                          className={`p-5 rounded-[1.5rem] border-2 text-center transition-all ${
                            selUrg === urg.id 
                              ? 'bg-gray-900 text-white border-gray-900 shadow-xl' 
                              : 'bg-white border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          <p className="text-sm font-bold mb-1">{urg.name}</p>
                          <p className={`text-[10px] font-medium opacity-60 mb-1`}>{urg.time}</p>
                          <p className={`text-[10px] font-black ${selUrg === urg.id ? 'text-primary' : 'text-primary'}`}>{urg.desc}</p>
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
                    <h3 className="text-2xl font-black italic mb-2 tracking-tight">أضف <span className="text-primary">الملابس</span></h3>
                    <p className="text-gray-500 font-medium">حدد القطع وكمياتها أو اختر التسليم المباشر عبر الحقيبة</p>
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
                          <h4 className={`text-lg font-bold mb-1 ${isBagSelected ? 'text-white' : 'text-gray-900'}`}>تسليم بحقيبة (Bag Laundry)</h4>
                          <p className={`text-xs font-medium leading-relaxed ${isBagSelected ? 'text-white/80' : 'text-gray-500'}`}>
                            سلمنا الملابس في حقيبة، وسنقوم بفرزها وعدها في المحل وإخطارك بالعدد عبر الداش بورد.
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
                          كم عدد القطع تقريباً في الحقيبة؟ (اختياري)
                        </label>
                        <div className="relative">
                          <input 
                            type="text" 
                            inputMode="numeric"
                            value={bagItemEstimate}
                            onChange={(e) => setBagItemEstimate(e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="مثال: 15"
                            className="w-full p-4 pr-12 rounded-xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none font-bold transition-all text-right"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs pointer-events-none">
                            قطعة
                          </div>
                        </div>
                        <p className="text-[9px] text-gray-500 font-medium italic">
                          * هذا العدد تقديري فقط لمساعدتنا في التخطيط، وسيتم العد الدقيق عند الاستلام.
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
                              {cat === 'men' ? 'رجال' : cat === 'women' ? 'نساء' : cat === 'kids' ? 'أطفال' : 'منزلية'}
                            </h4>
                            <div className="space-y-2">
                              {pricing.filter(p => p.category === cat).map((item) => {
                                // Default to first selected service price
                                const activeService = SERVICES.find(s => selSvcs.includes(s.id));
                                const priceKey = (activeService?.priceKey || 'wash_dry') as keyof PricingItem;
                                const itemPrice = item[priceKey] as string;

                                return (
                                  <div key={item.barcode} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-all">
                                    <div className="flex items-center gap-4">
                                      <span className="text-2xl">{item.icon}</span>
                                      <div>
                                        <p className="font-bold text-gray-900 text-sm">{item.name_ar}</p>
                                        <p className="text-[10px] font-medium text-gray-400">{item.name_en} — {toAr(parseFloat(itemPrice) || 0)} درهم / قطعة</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <button 
                                        onClick={() => updateQty(item.barcode, -1)}
                                        className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
                                      >
                                        <Minus size={16} />
                                      </button>
                                      <span className="text-lg font-black text-gray-900 min-w-[2ch] text-center">
                                        {toAr(qtys[item.barcode] || 0)}
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
                    <h3 className="text-2xl font-black italic mb-2 tracking-tight">موعد <span className="text-primary">الاستلام</span></h3>
                    <p className="text-gray-500 font-medium">متى تريد أن نأتي لاستلام ملابسك؟</p>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">اليوم</label>
                    <select 
                      value={selDate}
                      onChange={(e) => setSelDate(e.target.value)}
                      className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none font-bold transition-all"
                    >
                      <option>اليوم — الأربعاء ٢٢ يناير</option>
                      <option>الغد — الخميس ٢٣ يناير</option>
                      <option>الجمعة ٢٤ يناير</option>
                      <option>السبت ٢٥ يناير</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 font-display">الفترة الزمنية</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { time: '٨ ص – ١٠ ص', avail: '٣ أماكن متاحة' },
                        { time: '١٠ ص – ١٢ م', avail: '٥ أماكن متاحة' },
                        { time: '١٢ م – ٢ م', avail: 'محجوز بالكامل', busy: true },
                        { time: '٢ م – ٤ م', avail: '٤ أماكن متاحة' },
                        { time: '٤ م – ٦ م', avail: '٧ أماكن متاحة' },
                        { time: '٦ م – ٨ م', avail: '٢ أماكن متاحة' },
                      ].map((slot, i) => (
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
                          <p className={`text-sm font-black mb-1 ${selSlot === slot.time ? 'text-primary' : 'text-gray-900'}`}>{slot.time}</p>
                          <p className="text-[9px] font-bold text-gray-400">{slot.avail}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">ملاحظات للسائق (اختياري)</label>
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="مثال: الطابق الثالث، اضغط الجرس مرتين…"
                      className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none font-bold transition-all min-h-[100px] resize-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: CUSTOMER INFO */}
              {step === 4 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-black italic mb-2 tracking-tight">بياناتك <span className="text-primary">الشخصية</span></h3>
                    <p className="text-gray-500 font-medium">حتى نتواصل معك ونصل إليك بسهولة</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">الاسم الكامل</label>
                       <input 
                         type="text" 
                         value={customer.name}
                         onChange={(e) => setCustomer({...customer, name: e.target.value})}
                         placeholder="محمد عبدالله الأحمد"
                         className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none font-bold transition-all"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">رقم الجوال</label>
                       <input 
                         type="tel" 
                         value={customer.phone}
                         onChange={(e) => setCustomer({...customer, phone: e.target.value})}
                         placeholder="05X XXX XXXX"
                         className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none font-bold transition-all text-left"
                         dir="ltr"
                       />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">المنطقة / الحي</label>
                    <select 
                      value={customer.area}
                      onChange={(e) => setCustomer({...customer, area: e.target.value})}
                      className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none font-bold transition-all"
                    >
                      <option value="">— اختر المنطقة —</option>
                      <option>الخالدية</option>
                      <option>المصفح</option>
                      <option>جزيرة ياس</option>
                      <option>مدينة محمد بن زايد</option>
                      <option>منطقة المرور</option>
                      <option>البطين</option>
                      <option>جزيرة السعديات</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">العنوان التفصيلي</label>
                    <textarea 
                      value={customer.address}
                      onChange={(e) => setCustomer({...customer, address: e.target.value})}
                      placeholder="اسم الشارع، رقم المبنى، رقم الشقة…"
                      className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white outline-none font-bold transition-all min-h-[100px] resize-none"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">طريقة الدفع</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {PAYMENT_METHODS.map((pay) => (
                        <button
                          key={pay.id}
                          onClick={() => setCustomer({...customer, payment: pay.id})}
                          className={`p-4 rounded-2xl border-2 text-center transition-all ${
                            customer.payment === pay.id 
                              ? 'bg-gray-900 text-white border-gray-900 shadow-xl' 
                              : 'bg-white border-gray-100 hover:border-primary/20'
                          }`}
                        >
                          <pay.icon size={20} className="mx-auto mb-2" />
                          <p className="text-[9px] font-bold uppercase tracking-tight">{pay.name}</p>
                          <p className="text-[7px] opacity-60">{pay.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: CONFIRMATION */}
              {step === 5 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-black italic mb-2 tracking-tight">مراجعة <span className="text-primary">الطلب</span></h3>
                    <p className="text-gray-500 font-medium">تحقق من التفاصيل قبل الإرسال</p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-[2rem] p-6 space-y-4 border border-gray-100">
                       <p className="text-[10px] font-black uppercase tracking-widest text-primary border-b border-primary/10 pb-2">تفاصيل العميل</p>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[9px] font-bold text-gray-400">الاسم</p>
                            <p className="text-sm font-bold">{customer.name || '—'}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-gray-400">الجوال</p>
                            <p className="text-sm font-bold" dir="ltr">{customer.phone || '—'}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-[9px] font-bold text-gray-400">العنوان</p>
                            <p className="text-sm font-bold">{customer.area} {customer.address ? `، ${customer.address}` : ''}</p>
                          </div>
                       </div>
                    </div>

                    <div className="bg-gray-50 rounded-[2rem] p-6 space-y-4 border border-gray-100">
                       <p className="text-[10px] font-black uppercase tracking-widest text-primary border-b border-primary/10 pb-2">تفاصيل الخدمة</p>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[9px] font-bold text-gray-400">الخدمة</p>
                            <p className="text-sm font-bold">
                              {SERVICES.filter(s => selSvcs.includes(s.id)).map(s => s.name).join(' + ')}
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-gray-400">السرعة</p>
                            <p className="text-sm font-bold">{URGENCY.find(u => u.id === selUrg)?.name}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-gray-400">موعد الاستلام</p>
                            <p className="text-sm font-bold">{selDate} — {selSlot}</p>
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-gray-400">طريقة الدفع</p>
                            <p className="text-sm font-bold">{PAYMENT_METHODS.find(p => p.id === customer.payment)?.name}</p>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="bg-primary text-white rounded-[2rem] p-8 space-y-4 shadow-2xl shadow-primary/30">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4 text-white/70 text-xs font-bold uppercase">
                       <span>المجموع الفرعي</span>
                       <span>{isBagSelected ? '—' : `${toAr(subTotal)} درهم`}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/10 pb-4 text-white/70 text-xs font-bold uppercase">
                       <span>رسوم التوصيل</span>
                       <span>{isBagSelected ? '—' : `${toAr(deliveryFee)} درهم`}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/10 pb-4 text-white/70 text-xs font-bold uppercase">
                       <span>ضريبة القيمة المضافة ({toAr(config?.vat_percentage || 5)}٪)</span>
                       <span>{isBagSelected ? '—' : `${toAr(vatAmount)} درهم`}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <div>
                        <p className="text-white/60 text-xs font-bold uppercase mb-1">المبلغ الإجمالي</p>
                        <p className="text-4xl font-black italic">
                          {isBagSelected ? '—' : toAr(totalPrice)} <span className="text-lg">درهم</span>
                        </p>
                      </div>
                      <div className="text-right hidden md:block">
                        <p className="text-white/60 text-[10px] font-bold mb-1">عدد القطع</p>
                        <p className="text-xl font-bold">
                          {isBagSelected 
                            ? (bagItemEstimate ? `~ ${toAr(parseInt(bagItemEstimate))} قطعة` : 'جاري التحديد') 
                            : `${toAr(totalItems)} قطعة`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 p-4 bg-primary/10 rounded-2xl text-primary border border-primary/20">
                    <Info size={20} className="flex-shrink-0" />
                    <p className="text-[10px] font-bold leading-relaxed">
                      هذا مبلغ تقديري أولي. السعر النهائي يتم حسابه بدقة بعد استلام الملابس والعد الفعلي وفحص حالة القطع في المصبغة.
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
                  <div className="w-24 h-24 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 size={48} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black italic mb-2">تم استلام طلبك <span className="text-success">بنجاح!</span></h3>
                    <p className="text-gray-500 font-medium max-w-sm mx-auto">
                      سيتواصل معك فريقنا خلال دقائق لتأكيد الموعد وستصلك رسالة واتساب بتفاصيل الطلب.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 inline-block">
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">رقم تتبع الطلب</p>
                    <p className="text-3xl font-black text-primary tracking-[0.2em]">{orderCode}</p>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 justify-center pt-8">
                     <button 
                       onClick={() => { setStep(1); setQtys({}); }}
                       className="px-12 py-4 bg-primary text-white rounded-2xl font-black italic shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                     >
                       طلب جديد
                     </button>
                     <button 
                       onClick={onBack}
                       className="px-12 py-4 bg-white border border-gray-100 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                     >
                       العودة للرئيسية <ChevronLeft size={18} />
                     </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons (Hidden on Step 6) */}
          {step < 6 && (
            <div className="mt-12 pt-8 border-t border-gray-100 flex gap-4">
               <button 
                 onClick={goBack}
                 className="px-8 py-4 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all flex items-center gap-2"
               >
                 <ChevronRight size={18} /> رجوع
               </button>
               <button 
                 onClick={step === 5 ? handleFinalSubmit : goNext}
                 disabled={step === 2 && !isBagSelected && totalItems === 0}
                 className="flex-1 bg-primary text-white py-4 rounded-2xl text-sm font-black italic shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
               >
                 {step === 5 ? '✓ تأكيد وإرسال الطلب' : 'التالي — خطوة إضافية'} <ChevronLeft size={18} />
               </button>
            </div>
          )}
        </div>

        {/* Floating Cart / Summary */}
        <aside className="w-full lg:w-80 bg-gray-50/50 p-8 md:p-10 space-y-8 flex flex-col">
          <div className="space-y-4">
             <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
               <Package size={16} /> ملخص الطلب
             </h4>
             <div className="space-y-4 max-h-[350px] overflow-y-auto no-scrollbar">
                {isBagSelected ? (
                  <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 space-y-2">
                    <p className="text-sm font-bold text-primary flex items-center gap-2">
                      <Briefcase size={16} /> حقيبة ملابس
                    </p>
                    {bagItemEstimate && (
                      <p className="text-xs font-bold text-gray-900">
                        العدد التقديري: {toAr(parseInt(bagItemEstimate))} قطعة
                      </p>
                    )}
                    <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                      سيتم فرز عدد القطع في المصبغة وتحديثها في نظامك لاحقاً.
                    </p>
                  </div>
                ) : (
                  <>
                    {pricing.filter(p => qtys[p.barcode] > 0).map((item) => {
                      const activeService = SERVICES.find(s => selSvcs.includes(s.id));
                      const priceKey = (activeService?.priceKey || 'wash_dry') as keyof PricingItem;
                      const itemPrice = parseFloat(item[priceKey] as string) || 0;

                      return (
                        <div key={item.barcode} className="flex justify-between items-center group">
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-900">{item.name_ar}</p>
                            <p className="text-[10px] text-gray-400 font-medium">× {toAr(qtys[item.barcode])}</p>
                          </div>
                          <p className="text-sm font-black text-primary">{toAr(qtys[item.barcode] * itemPrice)} درهم</p>
                        </div>
                      );
                    })}
                    {totalItems === 0 && (
                      <p className="text-sm text-gray-400 italic text-center py-8">لم يتم اختيار أي قطع بعد</p>
                    )}
                  </>
                )}
             </div>
          </div>

          <div className="mt-auto space-y-4 pt-6 border-t border-gray-200">
             <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <span>المجموع</span>
                  <span>{toAr(subTotal)} درهم</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <span>التوصيل</span>
                  <span>{toAr(deliveryFee)} درهم</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <span>الضريبة ({toAr(config?.vat_percentage || 5)}٪)</span>
                  <span>{toAr(vatAmount)} درهم</span>
                </div>
             </div>
             
             <div className="flex justify-between items-end border-t border-gray-100 pt-4">
               <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">الإجمالي</p>
               <p className="text-3xl font-black italic text-primary">{toAr(totalPrice)} <span className="text-sm">درهم</span></p>
             </div>
             
             {totalItems > 0 && (
               <div className="p-4 bg-primary/10 rounded-2xl text-[10px] font-bold text-primary flex items-center gap-2">
                  <Wand2 size={14} className="animate-pulse" />
                  {URGENCY.find(u => u.id === selUrg)?.name} (+ {toAr(URGENCY.find(u => u.id === selUrg)?.extra || 0)} درهم)
               </div>
             )}

             <div className="p-4 bg-white/50 rounded-2xl border border-gray-100 text-[9px] font-medium text-gray-500 leading-relaxed italic">
               * سيتم إرسال نسخة من الفاتورة التقديرية إلى رقم جوالك المسجل بمجرد تأكيد الطلب.
             </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
