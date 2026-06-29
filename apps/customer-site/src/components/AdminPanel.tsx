import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Banknote,
  Bell,
  Bot,
  Building2,
  Check,
  CheckCircle2,
  ChevronLeft,
  ClipboardList,
  Clock,
  Database,
  Eye,
  Gift,
  Globe,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageCircle,
  Pencil,
  Plus,
  Save,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  ToggleRight,
  Trash2,
  Truck,
  Users,
  X,
} from 'lucide-react';
import {
  Branch,
  Driver,
  Offer,
  Order,
  PaymentMethodOption,
  PickupDayOption,
  PricingItem,
  ServiceArea,
  ServiceOption,
  SiteConfig,
  TimeSlotOption,
} from '../types';

interface AdminPanelProps {
  config: SiteConfig;
  onConfigChange: (config: SiteConfig) => void;
  orders: Order[];
  onOrdersChange: (orders: Order[]) => void;
  onLogout: () => void;
}

type SectionId = 'overview' | 'orders' | 'dispatch' | 'pricing' | 'content' | 'ai' | 'system';
type DispatchTab = 'areas' | 'drivers' | 'branches' | 'rules' | 'times';

const DEFAULT_AI_SETTINGS: NonNullable<SiteConfig['ai_settings']> = {
  auto_pickup_enabled: true,
  manual_review_enabled: true,
  min_confidence: 'medium',
  require_customer_name: true,
  require_customer_phone: true,
  require_area: false,
  require_address: false,
  require_location_link: false,
  require_pickup_time: false,
  ask_missing_name_only: true,
  notify_driver: true,
  natural_customer_reply: true,
  template_fallback_enabled: false,
};

const sectionGroups: Array<{
  title: string;
  items: Array<{ id: SectionId; label: string; hint: string; icon: React.ReactNode }>;
}> = [
  {
    title: 'Operations',
    items: [
      { id: 'overview', label: 'لوحة التحكم', hint: 'Overview', icon: <LayoutDashboard size={18} /> },
      { id: 'orders', label: 'الطلبات', hint: 'Orders', icon: <ClipboardList size={18} /> },
    ],
  },
  {
    title: 'Dispatch',
    items: [{ id: 'dispatch', label: 'التوزيع والتوصيل', hint: 'Areas & Drivers', icon: <Truck size={18} /> }],
  },
  {
    title: 'Website',
    items: [
      { id: 'pricing', label: 'الأسعار والخدمات', hint: 'Pricing', icon: <Banknote size={18} /> },
      { id: 'content', label: 'المحتوى والعروض', hint: 'Content', icon: <Gift size={18} /> },
    ],
  },
  {
    title: 'Automation',
    items: [{ id: 'ai', label: 'AI وواتساب', hint: 'AI & WhatsApp', icon: <Bot size={18} /> }],
  },
  {
    title: 'System',
    items: [{ id: 'system', label: 'إعدادات النظام', hint: 'Settings', icon: <Settings size={18} /> }],
  },
];

const cx = (...items: Array<string | false | null | undefined>) => items.filter(Boolean).join(' ');

const inputClass =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10';

const smallInputClass =
  'w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10';

const sectionTitle: Record<SectionId, { title: string; subtitle: string }> = {
  overview: { title: 'لوحة التحكم التشغيلية', subtitle: 'نظرة عامة على الطلبات، السائقين، الموقع، والذكاء الاصطناعي.' },
  orders: { title: 'إدارة الطلبات', subtitle: 'عرض الطلبات وتغيير الحالة ومراجعة الطلبات القادمة من الموقع أو واتساب.' },
  dispatch: { title: 'التوزيع والتوصيل', subtitle: 'إدارة المناطق والسائقين والفروع وقواعد التعيين.' },
  pricing: { title: 'الأسعار والخدمات', subtitle: 'تفعيل الخدمات وتحديث الأسعار والأيقونات والقطع.' },
  content: { title: 'المحتوى والعروض', subtitle: 'النصوص الرئيسية والمعرض والعروض وحسابات التواصل.' },
  ai: { title: 'AI وواتساب', subtitle: 'قواعد الوكيل الذكي، وضع التشغيل التلقائي، وصحة WhatsApp Business API.' },
  system: { title: 'إعدادات النظام', subtitle: 'معلومات الشركة، استقبال الطلبات، الدفع، والرسوم العامة.' },
};

const statusLabel: Record<string, string> = {
  new: 'جديد',
  accepted: 'مقبول',
  on_the_way: 'في الطريق',
  pickup: 'تم الاستلام',
  washing: 'قيد المعالجة',
  ready: 'جاهز',
  delivery: 'توصيل',
  completed: 'مكتمل',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
};

const driverStatusLabel: Record<string, string> = {
  online: 'متصل',
  available: 'متاح',
  busy: 'في مهمة',
  offline: 'غير متصل',
  off: 'خارج العمل',
};

const formatMoney = (value: unknown) => `${Number(value || 0).toFixed(2)} AED`;

const safeNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const makeId = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

const normalizeAiSettings = (config: SiteConfig) => ({ ...DEFAULT_AI_SETTINGS, ...(config.ai_settings || {}) });

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cx(
        'inline-flex items-center gap-2 rounded-full border px-2 py-1 text-xs font-black transition',
        checked ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-500'
      )}
      aria-pressed={checked}
    >
      <span className={cx('h-4 w-7 rounded-full p-0.5 transition', checked ? 'bg-emerald-500' : 'bg-slate-300')}>
        <span className={cx('block h-3 w-3 rounded-full bg-white transition', checked ? 'translate-x-0' : '-translate-x-3')} />
      </span>
      {label && <span>{label}</span>}
    </button>
  );
}

function StatusPill({ value, tone = 'neutral' }: { value: string; tone?: 'neutral' | 'good' | 'warn' | 'danger' | 'info' }) {
  const cls =
    tone === 'good'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : tone === 'warn'
        ? 'border-amber-200 bg-amber-50 text-amber-700'
        : tone === 'danger'
          ? 'border-rose-200 bg-rose-50 text-rose-700'
          : tone === 'info'
            ? 'border-cyan-200 bg-cyan-50 text-cyan-700'
            : 'border-slate-200 bg-slate-50 text-slate-600';
  return <span className={cx('inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black', cls)}>{value}</span>;
}

function Panel({
  title,
  subtitle,
  icon,
  action,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cx('rounded-lg border border-slate-200 bg-white shadow-sm', className)}>
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div className="flex min-w-0 items-start gap-3">
          {icon && <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">{icon}</div>}
          <div className="min-w-0">
            <h3 className="text-sm font-black text-slate-950">{title}</h3>
            {subtitle && <p className="mt-1 text-xs font-semibold text-slate-500">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ config, onConfigChange, orders, onOrdersChange, onLogout }) => {
  const [activeSection, setActiveSection] = useState<SectionId>('overview');
  const [dispatchTab, setDispatchTab] = useState<DispatchTab>('areas');
  const [localConfig, setLocalConfig] = useState<SiteConfig>(config);
  const [isChanged, setIsChanged] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [priceSearch, setPriceSearch] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState<string>(() => config.drivers[0]?.id || '');

  useEffect(() => {
    setLocalConfig(config);
    setSelectedDriverId((current) => current || config.drivers[0]?.id || '');
  }, [config]);

  const aiSettings = useMemo(() => normalizeAiSettings(localConfig), [localConfig]);
  const selectedDriver = localConfig.drivers.find((driver) => driver.id === selectedDriverId) || localConfig.drivers[0] || null;

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2800);
  };

  const updateConfig = (updates: Partial<SiteConfig>) => {
    setLocalConfig((prev) => ({ ...prev, ...updates }));
    setIsChanged(true);
  };

  const updateAiSettings = (updates: Partial<NonNullable<SiteConfig['ai_settings']>>) => {
    updateConfig({ ai_settings: { ...aiSettings, ...updates } });
  };

  const saveChanges = () => {
    onConfigChange({ ...localConfig, ai_settings: aiSettings });
    setIsChanged(false);
    showToast('تم حفظ التغييرات بنجاح');
  };

  const cancelChanges = () => {
    setLocalConfig(config);
    setIsChanged(false);
    showToast('تم إلغاء التغييرات');
  };

  const updateArea = (index: number, patch: Partial<ServiceArea>) => {
    const service_areas = [...localConfig.service_areas];
    service_areas[index] = { ...service_areas[index], ...patch };
    updateConfig({ service_areas });
  };

  const updateDriver = (index: number, patch: Partial<Driver>) => {
    const drivers = [...localConfig.drivers];
    drivers[index] = { ...drivers[index], ...patch };
    updateConfig({ drivers });
  };

  const updateBranch = (index: number, patch: Partial<Branch>) => {
    const branches = [...localConfig.branches];
    branches[index] = { ...branches[index], ...patch };
    updateConfig({ branches });
  };

  const updateServiceOption = (index: number, patch: Partial<ServiceOption>) => {
    const service_options = [...localConfig.service_options];
    service_options[index] = { ...service_options[index], ...patch };
    updateConfig({ service_options });
  };

  const updateTimeSlot = (index: number, patch: Partial<TimeSlotOption>) => {
    const time_slots = [...localConfig.time_slots];
    time_slots[index] = { ...time_slots[index], ...patch };
    updateConfig({ time_slots });
  };

  const updatePickupDay = (index: number, patch: Partial<PickupDayOption>) => {
    const pickup_days = [...localConfig.pickup_days];
    pickup_days[index] = { ...pickup_days[index], ...patch };
    updateConfig({ pickup_days });
  };

  const updatePaymentMethod = (index: number, patch: Partial<PaymentMethodOption>) => {
    const payment_methods = [...localConfig.payment_methods];
    payment_methods[index] = { ...payment_methods[index], ...patch };
    updateConfig({ payment_methods });
  };

  const updatePricingItem = (index: number, patch: Partial<PricingItem>) => {
    const pricing = [...localConfig.pricing];
    pricing[index] = { ...pricing[index], ...patch };
    updateConfig({ pricing });
  };

  const updateOffer = (index: number, patch: Partial<Offer>) => {
    const offers = [...localConfig.offers];
    offers[index] = { ...offers[index], ...patch };
    updateConfig({ offers });
  };

  const filteredOrders = orders.filter((order) => {
    const text = [order.id, order.customerName, order.customerPhone, order.branch, order.deliveryAddress]
      .map((value) => String(value || '').toLowerCase())
      .join(' ');
    const statusOk = orderStatusFilter === 'all' || order.status === orderStatusFilter;
    return statusOk && text.includes(orderSearch.trim().toLowerCase());
  });

  const filteredPricing = localConfig.pricing.filter((item) => {
    const text = [item.barcode, item.name_ar, item.name_en, item.category].join(' ').toLowerCase();
    return text.includes(priceSearch.trim().toLowerCase());
  });

  const todayOrders = orders.filter((order) => /today|اليوم/i.test(String(order.dateReceived || ''))).length || orders.length;
  const pickupOrders = orders.filter((order) => order.status === 'new' || order.status === 'on_the_way' || order.status === 'pickup').length;
  const driversOnline = localConfig.drivers.filter((driver) => ['online', 'available'].includes(driver.status)).length;
  const aiOrders = orders.filter((order) => String((order as any).source || '').includes('ai') || order.id.startsWith('AI-')).length;
  const revenue = orders.reduce((sum, order) => sum + safeNumber(order.amount || order.totalPrice), 0);

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    onOrdersChange(orders.map((order) => (order.id === orderId ? { ...order, status } : order)));
  };

  const addArea = () => {
    updateConfig({
      service_areas: [
        ...localConfig.service_areas,
        {
          id: makeId('area'),
          name: 'منطقة جديدة',
          active: true,
          delivery_fee: localConfig.delivery_fee,
          min_order_amount: localConfig.min_order_amount,
          branch_id: localConfig.branches[0]?.id || '',
        },
      ],
    });
  };

  const addDriver = () => {
    const driver: Driver = {
      id: `DRV-${String(localConfig.drivers.length + 1).padStart(3, '0')}`,
      name: 'سائق جديد',
      phone: '',
      branch: localConfig.branches[0]?.name || '',
      branch_id: localConfig.branches[0]?.id || '',
      service_areas: [],
      status: 'available',
      rating: 5,
      total_ratings: 0,
      orders_completed: 0,
      earnings_today: 0,
    };
    updateConfig({ drivers: [...localConfig.drivers, driver] });
    setSelectedDriverId(driver.id);
  };

  const addBranch = () => {
    updateConfig({
      branches: [
        ...localConfig.branches,
        {
          id: makeId('branch'),
          name: 'فرع جديد',
          address: 'أبوظبي، الإمارات العربية المتحدة',
          phone: '',
          whatsapp: '',
          hours: '٨ص – ١٠م',
          coordinates: { lat: 24.4539, lng: 54.3773 },
          status: 'active',
        },
      ],
    });
  };

  const addService = () => {
    const nextId = Math.max(0, ...localConfig.service_options.map((item) => item.id)) + 1;
    updateConfig({
      service_options: [
        ...localConfig.service_options,
        { id: nextId, name: 'خدمة جديدة', desc: 'وصف الخدمة', icon: 'washing_machine', priceKey: 'wash_dry', active: true },
      ],
    });
  };

  const addPriceItem = () => {
    updateConfig({
      pricing: [
        {
          barcode: String(Date.now()).slice(-6),
          name_ar: 'قطعة جديدة',
          name_en: 'New item',
          category: 'general',
          icon: 'shirt',
          wash_iron: 0,
          iron: 0,
          wash_dry: 0,
          dry: 0,
          active: true,
        },
        ...localConfig.pricing,
      ],
    });
  };

  const renderOverview = () => (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'طلبات اليوم', value: todayOrders, icon: <ClipboardList size={18} />, tone: 'info', sub: `${orders.length} كل الطلبات` },
          { label: 'طلبات الاستلام', value: pickupOrders, icon: <Truck size={18} />, tone: 'good', sub: 'موقع + واتساب' },
          { label: 'السائقون المتصلون', value: `${driversOnline}/${localConfig.drivers.length}`, icon: <Users size={18} />, tone: 'good', sub: 'Online / available' },
          { label: 'طلبات AI', value: aiOrders, icon: <Bot size={18} />, tone: 'warn', sub: 'WhatsApp automation' },
        ].map((card) => (
          <div key={card.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">{card.icon}</div>
              <StatusPill value={card.sub} tone={card.tone as any} />
            </div>
            <div className="mt-5 text-2xl font-black text-slate-950">{card.value}</div>
            <div className="mt-1 text-xs font-bold text-slate-500">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Panel title="آخر الطلبات" subtitle="Recent customer orders" icon={<ClipboardList size={18} />} action={<button onClick={() => setActiveSection('orders')} className="text-xs font-black text-cyan-700">عرض الكل</button>}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-right text-sm">
              <thead className="text-xs text-slate-500">
                <tr className="border-b border-slate-100">
                  <th className="py-2 font-black">الطلب</th>
                  <th className="py-2 font-black">العميل</th>
                  <th className="py-2 font-black">الخدمة</th>
                  <th className="py-2 font-black">الحالة</th>
                  <th className="py-2 font-black">السائق</th>
                  <th className="py-2 font-black">المبلغ</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 8).map((order) => (
                  <tr key={order.id} className="border-b border-slate-50">
                    <td className="py-3 font-black text-slate-900">{order.id}</td>
                    <td className="py-3">
                      <div className="font-bold text-slate-800">{order.customerName}</div>
                      <div className="text-xs font-semibold text-slate-400" dir="ltr">{order.customerPhone || '-'}</div>
                    </td>
                    <td className="py-3 font-semibold text-slate-600">{order.serviceType}</td>
                    <td className="py-3"><StatusPill value={statusLabel[order.status] || order.status} tone={order.status === 'cancelled' ? 'danger' : order.status === 'ready' ? 'good' : 'info'} /></td>
                    <td className="py-3 text-xs font-bold text-slate-500">{order.assignedDriverId || '-'}</td>
                    <td className="py-3 font-black text-slate-900">{formatMoney(order.amount || order.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="صحة التشغيل" subtitle="Operational Health" icon={<Activity size={18} />}>
          <div className="space-y-3">
            {[
              { label: 'استقبال الطلبات', value: localConfig.accept_orders, note: 'Website Orders' },
              { label: 'WhatsApp API', value: localConfig.whatsapp_notifications, note: 'Business API templates' },
              { label: 'التعيين التلقائي للسائقين', value: aiSettings.notify_driver, note: 'Driver Assignment' },
              { label: 'Auto AI Pickup', value: aiSettings.auto_pickup_enabled, note: 'AI Agent' },
              { label: 'وضع الصيانة', value: !localConfig.maintenance_mode, note: 'Website Availability' },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                <div>
                  <div className="text-sm font-black text-slate-800">{row.label}</div>
                  <div className="text-[11px] font-bold text-slate-400">{row.note}</div>
                </div>
                {row.value ? <StatusPill value="OK" tone="good" /> : <StatusPill value="Check" tone="warn" />}
              </div>
            ))}
            <div className="rounded-lg bg-slate-950 p-4 text-white">
              <div className="text-xs font-bold text-cyan-200">Revenue snapshot</div>
              <div className="mt-1 text-2xl font-black">{formatMoney(revenue)}</div>
              <div className="mt-1 text-[11px] text-slate-400">من الطلبات المحملة في اللوحة</div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );

  const renderOrders = () => (
    <Panel title="جدول الطلبات" subtitle="فلترة وتحديث سريع للحالات" icon={<ClipboardList size={18} />}>
      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_12rem]">
        <label className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input value={orderSearch} onChange={(event) => setOrderSearch(event.target.value)} className={cx(inputClass, 'pr-9')} placeholder="بحث بالعميل، رقم الطلب، الهاتف، العنوان" />
        </label>
        <select value={orderStatusFilter} onChange={(event) => setOrderStatusFilter(event.target.value)} className={inputClass}>
          <option value="all">كل الحالات</option>
          {Object.entries(statusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-right text-sm">
          <thead className="text-xs text-slate-500">
            <tr className="border-b border-slate-100">
              <th className="py-2 font-black">رقم الطلب</th>
              <th className="py-2 font-black">العميل</th>
              <th className="py-2 font-black">العنوان</th>
              <th className="py-2 font-black">الخدمة</th>
              <th className="py-2 font-black">الأولوية</th>
              <th className="py-2 font-black">السائق</th>
              <th className="py-2 font-black">الحالة</th>
              <th className="py-2 font-black">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className="border-b border-slate-50 align-top">
                <td className="py-3 font-black text-slate-950">{order.id}</td>
                <td className="py-3">
                  <div className="font-bold text-slate-800">{order.customerName}</div>
                  <div className="text-xs font-semibold text-slate-400" dir="ltr">{order.customerPhone || '-'}</div>
                </td>
                <td className="max-w-[18rem] py-3 text-xs font-semibold leading-5 text-slate-500">{order.deliveryAddress || '-'}</td>
                <td className="py-3 font-semibold text-slate-600">{order.serviceType}</td>
                <td className="py-3"><StatusPill value={order.priority || 'normal'} tone={order.priority === 'urgent' ? 'danger' : order.priority === 'high' ? 'warn' : 'neutral'} /></td>
                <td className="py-3 text-xs font-bold text-slate-500">{order.assignedDriverId || '-'}</td>
                <td className="py-3">
                  <select value={order.status} onChange={(event) => updateOrderStatus(order.id, event.target.value as Order['status'])} className={smallInputClass}>
                    {Object.entries(statusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </td>
                <td className="py-3">
                  <div className="flex gap-2">
                    <button className="rounded-md border border-slate-200 p-2 text-slate-500 hover:bg-slate-50" title="عرض"><Eye size={15} /></button>
                    <button className="rounded-md border border-slate-200 p-2 text-slate-500 hover:bg-slate-50" title="تعديل"><Pencil size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );

  const renderDispatchAreas = () => (
    <Panel
      title="المناطق المتاحة"
      subtitle="إدارة مناطق الخدمة، الفرع الافتراضي، الرسوم والحد الأدنى"
      icon={<MapPin size={18} />}
      action={<button onClick={addArea} className="inline-flex items-center gap-2 rounded-lg bg-cyan-700 px-3 py-2 text-xs font-black text-white"><Plus size={15} /> إضافة منطقة</button>}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-right text-sm">
          <thead className="text-xs text-slate-500">
            <tr className="border-b border-slate-100">
              <th className="py-2 font-black">المنطقة</th>
              <th className="py-2 font-black">الفرع الافتراضي</th>
              <th className="py-2 font-black">رسوم التوصيل</th>
              <th className="py-2 font-black">الحد الأدنى</th>
              <th className="py-2 font-black">الحالة</th>
              <th className="py-2 font-black">حذف</th>
            </tr>
          </thead>
          <tbody>
            {localConfig.service_areas.map((area, index) => (
              <tr key={area.id} className="border-b border-slate-50">
                <td className="py-3"><input value={area.name} onChange={(event) => updateArea(index, { name: event.target.value })} className={smallInputClass} /></td>
                <td className="py-3">
                  <select value={area.branch_id || ''} onChange={(event) => updateArea(index, { branch_id: event.target.value })} className={smallInputClass}>
                    <option value="">بدون فرع</option>
                    {localConfig.branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
                  </select>
                </td>
                <td className="py-3"><input type="number" value={area.delivery_fee ?? localConfig.delivery_fee} onChange={(event) => updateArea(index, { delivery_fee: safeNumber(event.target.value) })} className={smallInputClass} /></td>
                <td className="py-3"><input type="number" value={area.min_order_amount ?? localConfig.min_order_amount} onChange={(event) => updateArea(index, { min_order_amount: safeNumber(event.target.value) })} className={smallInputClass} /></td>
                <td className="py-3"><Toggle checked={area.active !== false} onChange={(next) => updateArea(index, { active: next })} label={area.active === false ? 'موقفة' : 'فعالة'} /></td>
                <td className="py-3"><button onClick={() => updateConfig({ service_areas: localConfig.service_areas.filter((item) => item.id !== area.id) })} className="rounded-md p-2 text-rose-600 hover:bg-rose-50"><Trash2 size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );

  const driverHasArea = (driver: Driver, area: ServiceArea) => {
    const items = driver.service_areas || [];
    return items.includes(area.name) || items.includes(area.id);
  };

  const toggleDriverArea = (driver: Driver, driverIndex: number, area: ServiceArea, checked: boolean) => {
    const current = new Set(driver.service_areas || []);
    current.delete(area.id);
    current.delete(area.name);
    if (checked) current.add(area.name);
    updateDriver(driverIndex, { service_areas: Array.from(current) });
  };

  const renderDispatchDrivers = () => (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <Panel
        title="مصفوفة تعيين السائقين"
        subtitle="السائق × المنطقة. إذا لم تحدد مناطق، يعتبر السائق احتياطيا عاما."
        icon={<Truck size={18} />}
        action={<button onClick={addDriver} className="inline-flex items-center gap-2 rounded-lg bg-cyan-700 px-3 py-2 text-xs font-black text-white"><Plus size={15} /> إضافة سائق</button>}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-right text-sm">
            <thead className="text-xs text-slate-500">
              <tr className="border-b border-slate-100">
                <th className="sticky right-0 z-10 bg-white py-2 font-black">السائق</th>
                <th className="py-2 font-black">الهاتف</th>
                <th className="py-2 font-black">الفرع</th>
                <th className="py-2 font-black">الحالة</th>
                {localConfig.service_areas.map((area) => <th key={area.id} className="whitespace-nowrap px-2 py-2 text-center font-black">{area.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {localConfig.drivers.map((driver, driverIndex) => (
                <tr key={driver.id} className={cx('border-b border-slate-50', selectedDriverId === driver.id && 'bg-cyan-50/40')}>
                  <td className="sticky right-0 z-10 bg-inherit py-3">
                    <button onClick={() => setSelectedDriverId(driver.id)} className="font-black text-slate-900 hover:text-cyan-700">{driver.name}</button>
                    <div className="text-[11px] font-bold text-slate-400">{driver.id}</div>
                  </td>
                  <td className="py-3 text-xs font-bold text-slate-500" dir="ltr">{driver.phone || '-'}</td>
                  <td className="py-3 text-xs font-bold text-slate-500">{driver.branch || localConfig.branches.find((branch) => branch.id === driver.branch_id)?.name || '-'}</td>
                  <td className="py-3"><StatusPill value={driverStatusLabel[driver.status] || driver.status} tone={['online', 'available'].includes(driver.status) ? 'good' : driver.status === 'busy' ? 'warn' : 'neutral'} /></td>
                  {localConfig.service_areas.map((area) => (
                    <td key={area.id} className="px-2 py-3 text-center">
                      <input type="checkbox" checked={driverHasArea(driver, area)} onChange={(event) => toggleDriverArea(driver, driverIndex, area, event.target.checked)} className="h-4 w-4 accent-cyan-700" aria-label={`${driver.name} ${area.name}`} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="تفاصيل السائق" subtitle="Driver detail drawer" icon={<SlidersHorizontal size={18} />}>
        {selectedDriver ? (
          <div className="space-y-4">
            {(() => {
              const index = localConfig.drivers.findIndex((driver) => driver.id === selectedDriver.id);
              return (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="space-y-1">
                      <span className="text-[11px] font-black text-slate-500">الاسم</span>
                      <input value={selectedDriver.name} onChange={(event) => updateDriver(index, { name: event.target.value })} className={smallInputClass} />
                    </label>
                    <label className="space-y-1">
                      <span className="text-[11px] font-black text-slate-500">المعرف</span>
                      <input value={selectedDriver.id} onChange={(event) => updateDriver(index, { id: event.target.value })} className={smallInputClass} dir="ltr" />
                    </label>
                  </div>
                  <label className="block space-y-1">
                    <span className="text-[11px] font-black text-slate-500">رقم واتساب</span>
                    <input value={selectedDriver.phone} onChange={(event) => updateDriver(index, { phone: event.target.value })} className={smallInputClass} dir="ltr" />
                    <span className="text-[11px] font-bold text-slate-400">يفضل رقم UAE بصيغة 05xxxxxxxx أو 9715xxxxxxxx.</span>
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[11px] font-black text-slate-500">الفرع</span>
                    <select
                      value={selectedDriver.branch_id || ''}
                      onChange={(event) => {
                        const branch = localConfig.branches.find((item) => item.id === event.target.value);
                        updateDriver(index, { branch_id: event.target.value, branch: branch?.name || selectedDriver.branch });
                      }}
                      className={smallInputClass}
                    >
                      <option value="">بدون فرع</option>
                      {localConfig.branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
                    </select>
                  </label>
                  <div className="space-y-2">
                    <span className="text-[11px] font-black text-slate-500">الحالة</span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        ['available', 'متاح'],
                        ['busy', 'في مهمة'],
                        ['off', 'خارج العمل'],
                      ].map(([value, label]) => (
                        <button key={value} onClick={() => updateDriver(index, { status: value as Driver['status'] })} className={cx('rounded-md border px-2 py-2 text-xs font-black', selectedDriver.status === value ? 'border-cyan-700 bg-cyan-700 text-white' : 'border-slate-200 text-slate-600')}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="text-[11px] font-black text-slate-500">المناطق المسندة</div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(selectedDriver.service_areas || []).length ? selectedDriver.service_areas?.map((area) => <StatusPill key={area} value={area} tone="info" />) : <span className="text-xs font-bold text-slate-400">احتياطي عام</span>}
                    </div>
                  </div>
                  <button onClick={() => updateConfig({ drivers: localConfig.drivers.filter((driver) => driver.id !== selectedDriver.id) })} className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-black text-rose-700">
                    <Trash2 size={15} /> حذف السائق
                  </button>
                </>
              );
            })()}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-sm font-bold text-slate-400">لا يوجد سائقون بعد.</div>
        )}
      </Panel>
    </div>
  );

  const renderDispatchBranches = () => (
    <Panel title="الفروع" subtitle="بيانات فروع الإمارات كما تظهر في الموقع والتعيين" icon={<Building2 size={18} />} action={<button onClick={addBranch} className="inline-flex items-center gap-2 rounded-lg bg-cyan-700 px-3 py-2 text-xs font-black text-white"><Plus size={15} /> إضافة فرع</button>}>
      <div className="space-y-3">
        {localConfig.branches.map((branch, index) => (
          <div key={branch.id} className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 lg:grid-cols-[1fr_1.5fr_9rem_9rem_8rem_7rem_auto]">
            <input value={branch.name} onChange={(event) => updateBranch(index, { name: event.target.value })} className={smallInputClass} placeholder="اسم الفرع" />
            <input value={branch.address} onChange={(event) => updateBranch(index, { address: event.target.value })} className={smallInputClass} placeholder="العنوان" />
            <input value={branch.phone} onChange={(event) => updateBranch(index, { phone: event.target.value })} className={smallInputClass} placeholder="هاتف" dir="ltr" />
            <input value={branch.whatsapp} onChange={(event) => updateBranch(index, { whatsapp: event.target.value })} className={smallInputClass} placeholder="واتساب" dir="ltr" />
            <input value={branch.hours} onChange={(event) => updateBranch(index, { hours: event.target.value })} className={smallInputClass} placeholder="الدوام" />
            <select value={branch.status || 'active'} onChange={(event) => updateBranch(index, { status: event.target.value as Branch['status'] })} className={smallInputClass}>
              <option value="active">فعال</option>
              <option value="busy">مشغول</option>
              <option value="closed">مغلق</option>
            </select>
            <button onClick={() => updateConfig({ branches: localConfig.branches.filter((item) => item.id !== branch.id) })} className="rounded-md p-2 text-rose-600 hover:bg-rose-50"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </Panel>
  );

  const renderDispatchRules = () => (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel title="قواعد التعيين" subtitle="كيف يختار النظام السائق المناسب" icon={<ShieldCheck size={18} />}>
        <div className="space-y-4">
          {[
            'يطابق النظام المنطقة أو العنوان مع service_areas الخاصة بالسائق.',
            'إذا لم يجد تطابقا يستخدم أول سائق متاح كاحتياطي عام.',
            'السائقون بحالة off/offline لا يدخلون في الترشيح إلا إذا لم يوجد بديل.',
            'رابط الموقع يرسل للسائق إذا كان متوفرا، لكنه ليس شرطا لإنشاء الطلب.',
          ].map((text) => (
            <div key={text} className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm font-semibold text-slate-700">
              <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={17} />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="قواعد الطلب" subtitle="رسوم وحدود عامة للموقع" icon={<Banknote size={18} />}>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="space-y-1">
            <span className="text-xs font-black text-slate-500">رسوم التوصيل</span>
            <input type="number" value={localConfig.delivery_fee} onChange={(event) => updateConfig({ delivery_fee: safeNumber(event.target.value) })} className={inputClass} />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-black text-slate-500">الحد الأدنى</span>
            <input type="number" value={localConfig.min_order_amount} onChange={(event) => updateConfig({ min_order_amount: safeNumber(event.target.value) })} className={inputClass} />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-black text-slate-500">VAT %</span>
            <input type="number" value={localConfig.vat_percentage} onChange={(event) => updateConfig({ vat_percentage: safeNumber(event.target.value) })} className={inputClass} />
          </label>
        </div>
      </Panel>
    </div>
  );

  const renderDispatchTimes = () => (
    <div className="grid gap-5 xl:grid-cols-3">
      <Panel title="أيام الاستلام" subtitle="Pickup Days" icon={<Clock size={18} />}>
        <div className="space-y-2">
          {localConfig.pickup_days.map((day, index) => (
            <div key={day.id} className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2">
              <input value={day.label} onChange={(event) => updatePickupDay(index, { label: event.target.value })} className={smallInputClass} />
              <Toggle checked={day.active !== false} onChange={(next) => updatePickupDay(index, { active: next })} />
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="أوقات الاستلام" subtitle="Time Slots" icon={<Clock size={18} />} className="xl:col-span-2">
        <div className="grid gap-2 md:grid-cols-2">
          {localConfig.time_slots.map((slot, index) => (
            <div key={slot.id} className="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2">
              <input value={slot.time} onChange={(event) => updateTimeSlot(index, { time: event.target.value })} className={smallInputClass} />
              <input value={slot.avail} onChange={(event) => updateTimeSlot(index, { avail: event.target.value })} className={smallInputClass} />
              <Toggle checked={slot.busy !== true} onChange={(next) => updateTimeSlot(index, { busy: !next })} />
              <Toggle checked={slot.active !== false} onChange={(next) => updateTimeSlot(index, { active: next })} />
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="طرق الدفع" subtitle="Payment Methods" icon={<Banknote size={18} />} className="xl:col-span-3">
        <div className="grid gap-3 lg:grid-cols-4">
          {localConfig.payment_methods.map((method, index) => (
            <div key={method.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <input value={method.name} onChange={(event) => updatePaymentMethod(index, { name: event.target.value })} className={smallInputClass} />
              <input value={method.desc} onChange={(event) => updatePaymentMethod(index, { desc: event.target.value })} className={cx(smallInputClass, 'mt-2')} />
              <div className="mt-2 flex items-center justify-between">
                <select value={method.kind} onChange={(event) => updatePaymentMethod(index, { kind: event.target.value as PaymentMethodOption['kind'] })} className={smallInputClass}>
                  <option value="cash">cash</option>
                  <option value="card">card</option>
                  <option value="wallet">wallet</option>
                </select>
                <Toggle checked={method.active !== false} onChange={(next) => updatePaymentMethod(index, { active: next })} />
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );

  const renderDispatch = () => {
    const tabs: Array<{ id: DispatchTab; label: string; icon: React.ReactNode }> = [
      { id: 'areas', label: 'المناطق', icon: <MapPin size={16} /> },
      { id: 'drivers', label: 'السائقون', icon: <Truck size={16} /> },
      { id: 'branches', label: 'الفروع', icon: <Building2 size={16} /> },
      { id: 'rules', label: 'قواعد التعيين', icon: <ShieldCheck size={16} /> },
      { id: 'times', label: 'أوقات الاستلام', icon: <Clock size={16} /> },
    ];
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2 rounded-lg border border-slate-200 bg-white p-2">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setDispatchTab(tab.id)} className={cx('inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-black transition', dispatchTab === tab.id ? 'bg-cyan-700 text-white' : 'text-slate-600 hover:bg-slate-50')}>
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        {dispatchTab === 'areas' && renderDispatchAreas()}
        {dispatchTab === 'drivers' && renderDispatchDrivers()}
        {dispatchTab === 'branches' && renderDispatchBranches()}
        {dispatchTab === 'rules' && renderDispatchRules()}
        {dispatchTab === 'times' && renderDispatchTimes()}
      </div>
    );
  };

  const renderPricing = () => (
    <div className="space-y-5">
      <Panel title="الخدمات المعروضة في الموقع" subtitle="Service options" icon={<SlidersHorizontal size={18} />} action={<button onClick={addService} className="inline-flex items-center gap-2 rounded-lg bg-cyan-700 px-3 py-2 text-xs font-black text-white"><Plus size={15} /> إضافة خدمة</button>}>
        <div className="grid gap-3 lg:grid-cols-2">
          {localConfig.service_options.map((service, index) => (
            <div key={service.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="grid gap-2 md:grid-cols-2">
                <input value={service.name} onChange={(event) => updateServiceOption(index, { name: event.target.value })} className={smallInputClass} />
                <input value={service.icon} onChange={(event) => updateServiceOption(index, { icon: event.target.value })} className={smallInputClass} dir="ltr" />
              </div>
              <textarea value={service.desc} onChange={(event) => updateServiceOption(index, { desc: event.target.value })} className={cx(smallInputClass, 'mt-2 min-h-16')} />
              <div className="mt-2 flex items-center justify-between">
                <select value={service.priceKey} onChange={(event) => updateServiceOption(index, { priceKey: event.target.value as ServiceOption['priceKey'] })} className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold">
                  <option value="wash_dry">wash_dry</option>
                  <option value="wash_iron">wash_iron</option>
                  <option value="iron">iron</option>
                  <option value="dry">dry</option>
                </select>
                <Toggle checked={service.active !== false} onChange={(next) => updateServiceOption(index, { active: next })} label={service.active === false ? 'موقفة' : 'فعالة'} />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="جدول الأسعار والقطع" subtitle="Pricing items with icons and active state" icon={<Banknote size={18} />} action={<button onClick={addPriceItem} className="inline-flex items-center gap-2 rounded-lg bg-cyan-700 px-3 py-2 text-xs font-black text-white"><Plus size={15} /> إضافة قطعة</button>}>
        <div className="mb-4">
          <label className="relative block">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input value={priceSearch} onChange={(event) => setPriceSearch(event.target.value)} className={cx(inputClass, 'pr-9')} placeholder="بحث بالباركود، الاسم، التصنيف" />
          </label>
        </div>
        <div className="max-h-[34rem] overflow-auto">
          <table className="w-full min-w-[980px] text-right text-sm">
            <thead className="sticky top-0 bg-white text-xs text-slate-500">
              <tr className="border-b border-slate-100">
                <th className="py-2 font-black">Barcode</th>
                <th className="py-2 font-black">عربي</th>
                <th className="py-2 font-black">English</th>
                <th className="py-2 font-black">Icon</th>
                <th className="py-2 font-black">Wash+Iron</th>
                <th className="py-2 font-black">Iron</th>
                <th className="py-2 font-black">Wash/Dry</th>
                <th className="py-2 font-black">Dry</th>
                <th className="py-2 font-black">فعال</th>
              </tr>
            </thead>
            <tbody>
              {filteredPricing.map((item) => {
                const index = localConfig.pricing.findIndex((entry) => entry.barcode === item.barcode);
                return (
                  <tr key={item.barcode} className="border-b border-slate-50">
                    <td className="py-2"><input value={item.barcode} onChange={(event) => updatePricingItem(index, { barcode: event.target.value })} className={smallInputClass} dir="ltr" /></td>
                    <td className="py-2"><input value={item.name_ar} onChange={(event) => updatePricingItem(index, { name_ar: event.target.value })} className={smallInputClass} /></td>
                    <td className="py-2"><input value={item.name_en} onChange={(event) => updatePricingItem(index, { name_en: event.target.value })} className={smallInputClass} dir="ltr" /></td>
                    <td className="py-2"><input value={item.icon || ''} onChange={(event) => updatePricingItem(index, { icon: event.target.value })} className={smallInputClass} dir="ltr" /></td>
                    <td className="py-2"><input type="number" value={item.wash_iron} onChange={(event) => updatePricingItem(index, { wash_iron: safeNumber(event.target.value) })} className={smallInputClass} /></td>
                    <td className="py-2"><input type="number" value={item.iron} onChange={(event) => updatePricingItem(index, { iron: safeNumber(event.target.value) })} className={smallInputClass} /></td>
                    <td className="py-2"><input type="number" value={item.wash_dry} onChange={(event) => updatePricingItem(index, { wash_dry: safeNumber(event.target.value) })} className={smallInputClass} /></td>
                    <td className="py-2"><input type="number" value={item.dry} onChange={(event) => updatePricingItem(index, { dry: safeNumber(event.target.value) })} className={smallInputClass} /></td>
                    <td className="py-2"><Toggle checked={item.active !== false} onChange={(next) => updatePricingItem(index, { active: next })} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );

  const renderContent = () => (
    <div className="grid gap-5 xl:grid-cols-2">
      <Panel title="واجهة الموقع" subtitle="Hero copy and calls to action" icon={<Globe size={18} />}>
        <div className="space-y-3">
          <input value={localConfig.hero.title} onChange={(event) => updateConfig({ hero: { ...localConfig.hero, title: event.target.value } })} className={inputClass} />
          <textarea value={localConfig.hero.subtitle} onChange={(event) => updateConfig({ hero: { ...localConfig.hero, subtitle: event.target.value } })} className={cx(inputClass, 'min-h-24')} />
          <div className="grid gap-3 md:grid-cols-2">
            <input value={localConfig.hero.cta_primary} onChange={(event) => updateConfig({ hero: { ...localConfig.hero, cta_primary: event.target.value } })} className={inputClass} />
            <input value={localConfig.hero.cta_secondary} onChange={(event) => updateConfig({ hero: { ...localConfig.hero, cta_secondary: event.target.value } })} className={inputClass} />
          </div>
        </div>
      </Panel>
      <Panel title="العروض" subtitle="Offers shown on website" icon={<Gift size={18} />} action={<button onClick={() => updateConfig({ offers: [...localConfig.offers, { id: makeId('offer'), name: 'عرض جديد', discount: '10%', condition: 'شرط العرض', active: true }] })} className="rounded-lg bg-cyan-700 px-3 py-2 text-xs font-black text-white"><Plus size={15} /></button>}>
        <div className="space-y-3">
          {localConfig.offers.map((offer, index) => (
            <div key={offer.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="grid gap-2 md:grid-cols-3">
                <input value={offer.name} onChange={(event) => updateOffer(index, { name: event.target.value })} className={smallInputClass} />
                <input value={offer.discount} onChange={(event) => updateOffer(index, { discount: event.target.value })} className={smallInputClass} />
                <Toggle checked={offer.active} onChange={(next) => updateOffer(index, { active: next })} label={offer.active ? 'فعال' : 'موقوف'} />
              </div>
              <input value={offer.condition} onChange={(event) => updateOffer(index, { condition: event.target.value })} className={cx(smallInputClass, 'mt-2')} />
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="المعرض" subtitle="Gallery labels and icon keys" icon={<Eye size={18} />} className="xl:col-span-2">
        <div className="grid gap-3 md:grid-cols-3">
          {localConfig.gallery.map((item, index) => (
            <div key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <input value={item.label} onChange={(event) => {
                const gallery = [...localConfig.gallery];
                gallery[index] = { ...item, label: event.target.value };
                updateConfig({ gallery });
              }} className={smallInputClass} />
              <input value={item.icon} onChange={(event) => {
                const gallery = [...localConfig.gallery];
                gallery[index] = { ...item, icon: event.target.value };
                updateConfig({ gallery });
              }} className={cx(smallInputClass, 'mt-2')} dir="ltr" />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );

  const renderAi = () => {
    const requiredRows = [
      ['require_customer_name', 'اسم العميل', true],
      ['require_customer_phone', 'رقم الهاتف', true],
      ['require_area', 'المنطقة', false],
      ['require_address', 'العنوان', false],
      ['require_location_link', 'رابط الموقع', false],
      ['require_pickup_time', 'وقت الاستلام', false],
    ] as const;
    const aiDecisionRows = orders
      .filter((order) => String((order as any).source || '').includes('ai') || order.id.startsWith('AI-'))
      .slice(0, 8);

    return (
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="space-y-5">
          <Panel title="وضع الوكيل الذكي" subtitle="Manual review remains optional; auto mode can run when minimum fields exist." icon={<Bot size={18} />}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-black text-emerald-900">Auto Pickup</div>
                    <div className="text-xs font-bold text-emerald-700">إنشاء الطلب تلقائيا عند توفر الاسم ورقم الهاتف</div>
                  </div>
                  <Toggle checked={aiSettings.auto_pickup_enabled} onChange={(next) => updateAiSettings({ auto_pickup_enabled: next })} />
                </div>
              </div>
              <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-black text-cyan-900">Manual Review</div>
                    <div className="text-xs font-bold text-cyan-700">إبقاء صفحة AI Conversations للمراجعة والتعديل</div>
                  </div>
                  <Toggle checked={aiSettings.manual_review_enabled} onChange={(next) => updateAiSettings({ manual_review_enabled: next })} />
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="الحقول المطلوبة" subtitle="المطلوب فقط: الاسم + الهاتف. باقي الحقول اختيارية." icon={<CheckCircle2 size={18} />}>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {requiredRows.map(([key, label, locked]) => (
                <div key={key} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div>
                    <div className="text-sm font-black text-slate-800">{label}</div>
                    <div className="text-[11px] font-bold text-slate-400">{locked ? 'Required' : 'Optional'}</div>
                  </div>
                  <Toggle checked={Boolean(aiSettings[key])} onChange={(next) => updateAiSettings({ [key]: locked ? true : next })} />
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="سجل قرارات AI" subtitle="Recent AI decisions" icon={<Database size={18} />}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-right text-sm">
                <thead className="text-xs text-slate-500">
                  <tr className="border-b border-slate-100">
                    <th className="py-2 font-black">الطلب</th>
                    <th className="py-2 font-black">العميل</th>
                    <th className="py-2 font-black">Intent</th>
                    <th className="py-2 font-black">Action</th>
                    <th className="py-2 font-black">السائق</th>
                  </tr>
                </thead>
                <tbody>
                  {aiDecisionRows.length ? aiDecisionRows.map((order) => (
                    <tr key={order.id} className="border-b border-slate-50">
                      <td className="py-3 font-black">{order.id}</td>
                      <td className="py-3 font-bold">{order.customerName}</td>
                      <td className="py-3"><StatusPill value="pickup_request" tone="info" /></td>
                      <td className="py-3"><StatusPill value="created" tone="good" /></td>
                      <td className="py-3 text-xs font-bold text-slate-500">{order.assignedDriverId || '-'}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="py-8 text-center text-sm font-bold text-slate-400">لا توجد قرارات AI محفوظة بعد.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="حالة الاتصال" subtitle="Connection status" icon={<MessageCircle size={18} />}>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3">
                <div>
                  <div className="text-sm font-black">OpenAI</div>
                  <div className="text-xs font-bold text-slate-400">OPENAI_API_KEY</div>
                </div>
                <StatusPill value="من .env" tone="info" />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3">
                <div>
                  <div className="text-sm font-black">WhatsApp Business API</div>
                  <div className="text-xs font-bold text-slate-400">META_WHATSAPP_* variables</div>
                </div>
                <StatusPill value="من .env" tone="info" />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3">
                <div>
                  <div className="text-sm font-black">Template fallback</div>
                  <div className="text-xs font-bold text-slate-400">استخدم القوالب فقط خارج المحادثة الطبيعية</div>
                </div>
                <Toggle checked={aiSettings.template_fallback_enabled} onChange={(next) => updateAiSettings({ template_fallback_enabled: next })} />
              </div>
            </div>
          </Panel>

          <Panel title="قاعدة pickup_request" subtitle="Rule editor" icon={<SlidersHorizontal size={18} />}>
            <div className="space-y-4">
              <label className="block space-y-1">
                <span className="text-xs font-black text-slate-500">Minimum confidence</span>
                <select value={aiSettings.min_confidence} onChange={(event) => updateAiSettings({ min_confidence: event.target.value as NonNullable<SiteConfig['ai_settings']>['min_confidence'] })} className={inputClass}>
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </select>
              </label>
              {[
                ['ask_missing_name_only', 'اسأل عن الاسم فقط إذا كان ناقصا'],
                ['notify_driver', 'إبلاغ السائق تلقائيا'],
                ['natural_customer_reply', 'رد طبيعي للعميل بدل قالب جامد'],
              ].map(([key, label]) => (
                <div key={key} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <span className="text-sm font-black text-slate-800">{label}</span>
                  <Toggle checked={Boolean((aiSettings as any)[key])} onChange={(next) => updateAiSettings({ [key]: next })} />
                </div>
              ))}
              <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-4">
                <div className="text-xs font-black text-cyan-800">Natural reply preview</div>
                <p className="mt-2 text-sm font-bold leading-6 text-cyan-950">
                  تمام، سجلت لك طلب الاستلام. إذا حبيت تضيف العنوان بالتفصيل أو ترسل موقعك، ارسله هنا في أي وقت.
                </p>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    );
  };

  const renderSystem = () => (
    <div className="grid gap-5 xl:grid-cols-2">
      <Panel title="معلومات الشركة" subtitle="Company profile" icon={<Building2 size={18} />}>
        <div className="grid gap-3">
          <label className="space-y-1"><span className="text-xs font-black text-slate-500">اسم الموقع</span><input value={localConfig.site_name} onChange={(event) => updateConfig({ site_name: event.target.value })} className={inputClass} /></label>
          <label className="space-y-1"><span className="text-xs font-black text-slate-500">البريد</span><input value={localConfig.contact_email} onChange={(event) => updateConfig({ contact_email: event.target.value })} className={inputClass} dir="ltr" /></label>
          <label className="space-y-1"><span className="text-xs font-black text-slate-500">العنوان التجاري</span><input value={localConfig.business_address} onChange={(event) => updateConfig({ business_address: event.target.value })} className={inputClass} /></label>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1"><span className="text-xs font-black text-slate-500">VAT</span><input value={localConfig.vat_number} onChange={(event) => updateConfig({ vat_number: event.target.value })} className={inputClass} dir="ltr" /></label>
            <label className="space-y-1"><span className="text-xs font-black text-slate-500">واتساب الرئيسي</span><input value={localConfig.whatsapp_number} onChange={(event) => updateConfig({ whatsapp_number: event.target.value })} className={inputClass} dir="ltr" /></label>
          </div>
        </div>
      </Panel>
      <Panel title="مفاتيح التشغيل" subtitle="Operational switches" icon={<ToggleRight size={18} />}>
        <div className="space-y-3">
          {[
            ['maintenance_mode', 'وضع الصيانة', 'إيقاف الموقع مؤقتا للزوار'],
            ['accept_orders', 'استقبال الطلبات', 'السماح بطلبات جديدة من الموقع'],
            ['whatsapp_notifications', 'إشعارات واتساب', 'تفعيل إشعارات الطلبات'],
          ].map(([key, label, desc]) => (
            <div key={key} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3">
              <div><div className="text-sm font-black text-slate-800">{label}</div><div className="text-xs font-bold text-slate-400">{desc}</div></div>
              <Toggle checked={Boolean((localConfig as any)[key])} onChange={(next) => updateConfig({ [key]: next } as any)} />
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="التواصل الاجتماعي" subtitle="Social channels" icon={<Globe size={18} />} className="xl:col-span-2">
        <div className="grid gap-3 md:grid-cols-3">
          <input value={localConfig.social_media.instagram} onChange={(event) => updateConfig({ social_media: { ...localConfig.social_media, instagram: event.target.value } })} className={inputClass} dir="ltr" placeholder="Instagram" />
          <input value={localConfig.social_media.tiktok} onChange={(event) => updateConfig({ social_media: { ...localConfig.social_media, tiktok: event.target.value } })} className={inputClass} dir="ltr" placeholder="TikTok" />
          <input value={localConfig.social_media.facebook} onChange={(event) => updateConfig({ social_media: { ...localConfig.social_media, facebook: event.target.value } })} className={inputClass} dir="ltr" placeholder="Facebook" />
        </div>
      </Panel>
    </div>
  );

  const renderActiveSection = () => {
    if (activeSection === 'overview') return renderOverview();
    if (activeSection === 'orders') return renderOrders();
    if (activeSection === 'dispatch') return renderDispatch();
    if (activeSection === 'pricing') return renderPricing();
    if (activeSection === 'content') return renderContent();
    if (activeSection === 'ai') return renderAi();
    return renderSystem();
  };

  return (
    <div className="fixed inset-0 z-[90] min-h-screen w-screen max-w-full overflow-y-auto overflow-x-hidden bg-slate-50 font-sans text-slate-900" dir="rtl">
      {toast && (
        <div className="fixed left-5 top-5 z-[70] rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm font-black text-emerald-700 shadow-xl">
          {toast}
        </div>
      )}

      <div className="flex min-h-screen w-full max-w-full">
        <aside className="hidden w-72 shrink-0 flex-col border-l border-slate-800 bg-[#062f35] text-white lg:flex">
          <div className="border-b border-white/10 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500 text-sm font-black text-white">I&O</div>
              <div>
                <div className="text-lg font-black">In & Out</div>
                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-200">Admin Center</div>
              </div>
            </div>
          </div>
          <nav className="min-h-0 flex-1 overflow-y-auto p-4">
            {sectionGroups.map((group) => (
              <div key={group.title} className="mb-5">
                <div className="mb-2 px-2 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200/60">{group.title}</div>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={cx(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-right transition',
                        activeSection === item.id ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-950/20' : 'text-cyan-50/70 hover:bg-white/8 hover:text-white'
                      )}
                    >
                      {item.icon}
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-black">{item.label}</span>
                        <span className="block text-[10px] font-bold text-current opacity-60">{item.hint}</span>
                      </span>
                      <ChevronLeft size={15} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
          <div className="border-t border-white/10 p-4">
            <div className="mb-3 rounded-lg bg-white/8 p-3">
              <div className="text-sm font-black">Admin User</div>
              <div className="text-[11px] font-bold text-cyan-100/60">inandoutuae.com</div>
            </div>
            <button onClick={onLogout} className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-black text-rose-200 hover:bg-rose-500/10">
              <LogOut size={15} /> تسجيل الخروج
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-x-hidden">
          <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-black text-slate-950">{sectionTitle[activeSection].title}</h1>
                  <StatusPill value={isChanged ? 'تغييرات غير محفوظة' : 'محفوظ'} tone={isChanged ? 'warn' : 'good'} />
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-500">{sectionTitle[activeSection].subtitle}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500 md:flex">
                  <Bell size={15} />
                  آخر تحديث: الآن
                </div>
                <button onClick={cancelChanges} disabled={!isChanged} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-black text-slate-600 disabled:cursor-not-allowed disabled:opacity-40">
                  <X size={15} /> إلغاء
                </button>
                <button onClick={saveChanges} disabled={!isChanged} className="inline-flex items-center gap-2 rounded-lg bg-cyan-700 px-4 py-2 text-xs font-black text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-300">
                  <Save size={15} /> حفظ التغييرات
                </button>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto border-t border-slate-100 px-4 py-2 lg:hidden">
              {sectionGroups.flatMap((group) => group.items).map((item) => (
                <button key={item.id} onClick={() => setActiveSection(item.id)} className={cx('shrink-0 rounded-lg px-3 py-2 text-xs font-black', activeSection === item.id ? 'bg-cyan-700 text-white' : 'bg-slate-100 text-slate-600')}>
                  {item.label}
                </button>
              ))}
            </div>
          </header>

          <div className="p-4 lg:p-6">{renderActiveSection()}</div>
        </main>
      </div>
    </div>
  );
};
