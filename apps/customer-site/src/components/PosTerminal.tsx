import React, { useMemo, useState } from 'react';
import {
  Banknote,
  Barcode,
  CheckCircle2,
  CreditCard,
  Minus,
  Plus,
  Printer,
  ReceiptText,
  RotateCcw,
  Search,
  Send,
  ShieldAlert,
  ShoppingCart,
  User,
  WalletCards,
  XCircle,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Order, PricingItem } from '../types';
import { formatCurrency, localize, SiteLanguage } from '../lib/i18n';
import { cn } from '../lib/utils';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { LaundryIcon, resolvePricingItemIcon } from './LaundryIcon';

interface PosTerminalProps {
  pricing: PricingItem[];
  orders: Order[];
  onOrdersChange: (orders: Order[]) => void;
  language?: SiteLanguage;
}

type PosStep = 'customer' | 'items' | 'barcode' | 'review' | 'payment' | 'receipt';
type PaymentMethod = 'cash' | 'card' | 'wallet' | 'split';
type ScanState = 'idle' | 'success' | 'error';

type CartItem = {
  barcode: string;
  name: string;
  service: 'wash_iron' | 'wash_dry' | 'dry' | 'iron';
  quantity: number;
  unitPrice: number;
  icon?: string;
};

const posSteps: PosStep[] = ['customer', 'items', 'barcode', 'review', 'payment', 'receipt'];

const serviceOptions: Array<{ id: CartItem['service']; ar: string; en: string }> = [
  { id: 'wash_iron', ar: 'غسيل + كوي', en: 'Wash + Iron' },
  { id: 'wash_dry', ar: 'غسيل وتنشيف', en: 'Wash + Dry' },
  { id: 'dry', ar: 'تنظيف جاف', en: 'Dry Clean' },
  { id: 'iron', ar: 'كوي فقط', en: 'Iron Only' },
];

const paymentMethods: Array<{ id: PaymentMethod; icon: React.ElementType; ar: string; en: string }> = [
  { id: 'cash', icon: Banknote, ar: 'نقدي', en: 'Cash' },
  { id: 'card', icon: CreditCard, ar: 'بطاقة', en: 'Card' },
  { id: 'wallet', icon: WalletCards, ar: 'محفظة', en: 'Wallet' },
  { id: 'split', icon: ReceiptText, ar: 'تقسيم', en: 'Split' },
];

export const PosTerminal: React.FC<PosTerminalProps> = ({ pricing, orders, onOrdersChange, language = 'ar' }) => {
  const [step, setStep] = useState<PosStep>('customer');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [query, setQuery] = useState('');
  const [selectedService, setSelectedService] = useState<CartItem['service']>('wash_iron');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [scanValue, setScanValue] = useState('');
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashReceived, setCashReceived] = useState('0');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const reduceMotion = useReducedMotion();
  const t = (ar: string, en: string) => localize(language, ar, en);

  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pricing
      .filter((item) => item.active !== false)
      .filter((item) => Number(item[selectedService]) > 0)
      .filter((item) => !q || item.name_ar.includes(query) || item.name_en.toLowerCase().includes(q) || item.barcode.includes(q))
      .slice(0, 18);
  }, [pricing, query, selectedService]);

  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const vat = subtotal * 0.05;
  const total = subtotal + vat;
  const changeDue = Math.max(Number(cashReceived || 0) - total, 0);
  const activeIndex = posSteps.indexOf(step);
  const canProceed = step === 'customer' ? Boolean(customerName.trim() && customerPhone.trim()) : step === 'items' ? cart.length > 0 : true;

  const addItem = (item: PricingItem) => {
    const unitPrice = Number(item[selectedService]) || 0;
    setCart((current) => {
      const existing = current.find((cartItem) => cartItem.barcode === item.barcode && cartItem.service === selectedService);
      if (existing) {
        return current.map((cartItem) => cartItem === existing ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem);
      }
      return [
        ...current,
        {
          barcode: item.barcode,
          name: language === 'ar' ? item.name_ar : item.name_en,
          service: selectedService,
          quantity: 1,
          unitPrice,
          icon: resolvePricingItemIcon(item),
        },
      ];
    });
  };

  const updateQty = (barcode: string, service: CartItem['service'], delta: number) => {
    setCart((current) =>
      current
        .map((item) => item.barcode === barcode && item.service === service ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item)
        .filter((item) => item.quantity > 0),
    );
  };

  const runScan = () => {
    const found = pricing.find((item) => item.barcode === scanValue.trim());
    if (found && Number(found[selectedService]) > 0) {
      addItem(found);
      setScanState('success');
      setScanValue('');
    } else {
      setScanState('error');
    }
    window.setTimeout(() => setScanState('idle'), 1200);
  };

  const next = () => {
    if (!canProceed) return;
    setStep(posSteps[Math.min(activeIndex + 1, posSteps.length - 1)]);
  };

  const back = () => setStep(posSteps[Math.max(activeIndex - 1, 0)]);

  const checkout = () => {
    const order: Order = {
      id: `POS-${Date.now().toString().slice(-6)}`,
      customerName,
      customerPhone,
      dateReceived: new Date().toISOString(),
      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
      serviceType: t('طلب POS', 'POS Order'),
      branch: t('فرع الكاونتر', 'Counter Branch'),
      status: 'accepted',
      amount: total,
      totalPrice: total,
      priority: 'normal',
      paymentStatus: paymentMethod === 'cash' && Number(cashReceived || 0) < total ? 'pending' : 'paid',
      paymentMethod: paymentMethod === 'wallet' ? 'wallet' : paymentMethod === 'card' ? 'card' : 'cash',
      items: cart.map((item) => ({ icon: item.icon || 'folded_laundry', name: item.name, qty: item.quantity })),
      eta: t('اليوم', 'Today'),
    };
    setCreatedOrder(order);
    onOrdersChange([order, ...orders.filter((item) => item.id !== order.id)]);
    setStep('receipt');
  };

  const resetSale = () => {
    setStep('customer');
    setCustomerName('');
    setCustomerPhone('');
    setQuery('');
    setCart([]);
    setScanValue('');
    setPaymentMethod('cash');
    setCashReceived('0');
    setCreatedOrder(null);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[1fr_380px]">
        <section className="min-w-0 p-4 md:p-6">
          <header className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-bold text-accent">POS</p>
              <h1 className="text-3xl font-black text-primary">{t('كاونتر الطلبات', 'Counter Terminal')}</h1>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {posSteps.map((item, index) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setStep(item)}
                  className={cn('min-h-11 whitespace-nowrap rounded-md border px-3 text-sm font-bold', step === item ? 'border-primary bg-primary text-white' : index < activeIndex ? 'border-success bg-success/10 text-success' : 'border-border bg-surface text-muted-foreground')}
                >
                  {index + 1}. {stepLabel(item, language)}
                </button>
              ))}
            </div>
          </header>

          <motion.div
            key={step}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16 }}
          >
            {step === 'customer' ? (
              <Card>
                <CardHeader>
                  <CardTitle>{t('Customer lookup / new customer', 'Customer lookup / new customer')}</CardTitle>
                  <CardDescription>{t('ابدأ برقم الهاتف والاسم، ولا تعيد إدخالها لاحقًا.', 'Capture phone and name once for the full transaction.')}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <Input label={t('رقم الهاتف', 'Phone')} value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} inputMode="tel" dir="ltr" required />
                  <Input label={t('اسم العميل', 'Customer name')} value={customerName} onChange={(event) => setCustomerName(event.target.value)} required />
                  <div className="rounded-lg border border-border bg-muted p-4 md:col-span-2">
                    <User aria-hidden="true" className="mb-3 size-6 text-primary" />
                    <p className="font-bold">{t('سيظهر سجل العميل والتفضيلات هنا عند ربط قاعدة البيانات.', 'Customer history and preferences appear here when connected.')}</p>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {step === 'items' ? (
              <div className="grid gap-5">
                <Card>
                  <CardHeader>
                    <CardTitle>{t('Items / service selection', 'Items / service selection')}</CardTitle>
                    <CardDescription>{t('أهداف لمس كبيرة وقائمة أسعار قابلة للبحث.', 'Large touch targets and searchable pricing list.')}</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div className="grid gap-2 md:grid-cols-4">
                      {serviceOptions.map((service) => (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => setSelectedService(service.id)}
                          className={cn('min-h-14 rounded-md border px-4 text-sm font-black', selectedService === service.id ? 'border-accent bg-accent text-white' : 'border-border bg-surface')}
                        >
                          {localize(language, service.ar, service.en)}
                        </button>
                      ))}
                    </div>
                    <Input value={query} onChange={(event) => setQuery(event.target.value)} label={t('بحث / باركود', 'Search / barcode')} placeholder={t('اسم القطعة أو الباركود', 'Item name or barcode')} />
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {visibleItems.map((item) => (
                        <button
                          key={`${item.barcode}-${selectedService}`}
                          type="button"
                          onClick={() => addItem(item)}
                          className="min-h-28 rounded-lg border border-border bg-surface p-4 text-start transition-colors hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <LaundryIcon name={resolvePricingItemIcon(item)} alt="" className="mb-3 h-10 w-10" />
                          <span className="block font-black">{language === 'ar' ? item.name_ar : item.name_en}</span>
                          <span className="mt-1 block text-sm text-muted-foreground">{formatCurrency(language, Number(item[selectedService]))}</span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}

            {step === 'barcode' ? (
              <Card>
                <CardHeader>
                  <CardTitle>{t('Barcode / tag scan', 'Barcode / tag scan')}</CardTitle>
                  <CardDescription>{t('نجاح أو فشل واضح فورًا، بدون فشل صامت.', 'Immediate success or error feedback, never silent failure.')}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-5">
                  <div className={cn('rounded-xl border p-6 text-center', scanState === 'success' ? 'border-success bg-success/10' : scanState === 'error' ? 'border-danger bg-danger/10' : 'border-border bg-muted')}>
                    {scanState === 'success' ? <CheckCircle2 className="mx-auto size-14 text-success" /> : scanState === 'error' ? <XCircle className="mx-auto size-14 text-danger" /> : <Barcode className="mx-auto size-14 text-primary" />}
                    <p className="mt-3 text-2xl font-black">
                      {scanState === 'success' ? t('تمت الإضافة', 'Item added') : scanState === 'error' ? t('لم يتم العثور على الباركود', 'Barcode not found') : t('جاهز للمسح', 'Ready to scan')}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">{t('ملاحظة: يمكن إضافة cue صوتي لاحقًا عند ربط جهاز POS.', 'Note: an optional sound cue can be added when POS hardware is connected.')}</p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                    <Input value={scanValue} onChange={(event) => setScanValue(event.target.value)} label={t('باركود', 'Barcode')} dir="ltr" />
                    <Button variant="accent" size="lg" onClick={runScan}>
                      <Barcode aria-hidden="true" className="size-5" />
                      {t('مسح / إضافة', 'Scan / add')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {step === 'review' ? (
              <Card>
                <CardHeader>
                  <CardTitle>{t('Review order', 'Review order')}</CardTitle>
                  <CardDescription>{t('تأكيد القطع والخدمات قبل الدفع.', 'Confirm items and services before payment.')}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {cart.map((item) => <CartRow key={`${item.barcode}-${item.service}`} item={item} language={language} updateQty={updateQty} />)}
                </CardContent>
              </Card>
            ) : null}

            {step === 'payment' ? (
              <Card>
                <CardHeader>
                  <CardTitle>{t('Payment', 'Payment')}</CardTitle>
                  <CardDescription>{t('طرق دفع واضحة والتغيير ظاهر عند الدفع النقدي.', 'Clear payment methods and prominent cash change due.')}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-5">
                  <div className="grid gap-3 md:grid-cols-4">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setPaymentMethod(method.id)}
                          className={cn('min-h-24 rounded-lg border p-4 font-black', paymentMethod === method.id ? 'border-accent bg-accent text-white' : 'border-border bg-surface')}
                        >
                          <Icon aria-hidden="true" className="mx-auto mb-2 size-7" />
                          {localize(language, method.ar, method.en)}
                        </button>
                      );
                    })}
                  </div>
                  {paymentMethod === 'cash' ? (
                    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
                      <div className="rounded-lg border border-border bg-muted p-4">
                        <p className="text-sm text-muted-foreground">{t('المبلغ المستلم', 'Cash received')}</p>
                        <p className="mt-2 text-4xl font-black text-primary">{formatCurrency(language, Number(cashReceived || 0))}</p>
                        <p className="mt-3 text-sm text-muted-foreground">{t('الباقي', 'Change due')}</p>
                        <p className="mt-1 text-3xl font-black text-accent">{formatCurrency(language, changeDue)}</p>
                      </div>
                      <Numpad value={cashReceived} onChange={setCashReceived} />
                    </div>
                  ) : null}
                  <Button variant="accent" size="lg" onClick={checkout}>
                    <ShieldAlert aria-hidden="true" className="size-5" />
                    {t('تأكيد الدفع', 'Confirm payment')}
                  </Button>
                </CardContent>
              </Card>
            ) : null}

            {step === 'receipt' ? (
              <Card>
                <CardHeader>
                  <CardTitle>{t('Receipt', 'Receipt')}</CardTitle>
                  <CardDescription>{t('طباعة أو إرسال إيصال رقمي.', 'Print or send a digital receipt.')}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-5 lg:grid-cols-[1fr_.8fr]">
                  <div className="rounded-lg border border-border bg-muted p-5">
                    <p className="text-sm text-muted-foreground">{t('رقم الطلب', 'Order ID')}</p>
                    <p className="mt-1 text-3xl font-black text-primary" dir="ltr">{createdOrder?.id}</p>
                    <div className="mt-5 grid gap-2">
                      {cart.map((item) => (
                        <div key={`${item.barcode}-${item.service}`} className="flex justify-between gap-3 border-b border-border pb-2 text-sm">
                          <span>{item.quantity} x {item.name}</span>
                          <span>{formatCurrency(language, item.quantity * item.unitPrice)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 flex justify-between text-xl font-black">
                      <span>{t('الإجمالي', 'Total')}</span>
                      <span>{formatCurrency(language, total)}</span>
                    </div>
                  </div>
                  <div className="grid content-start gap-3">
                    <Button variant="secondary" size="lg"><Printer aria-hidden="true" className="size-5" />{t('طباعة', 'Print')}</Button>
                    <Button variant="secondary" size="lg"><Send aria-hidden="true" className="size-5" />{t('إرسال واتساب', 'Send WhatsApp')}</Button>
                    <Button variant="accent" size="lg" onClick={resetSale}><RotateCcw aria-hidden="true" className="size-5" />{t('طلب جديد', 'New sale')}</Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </motion.div>

          {step !== 'receipt' ? (
            <div className="mt-5 flex justify-between gap-3">
              <Button variant="ghost" onClick={back} disabled={activeIndex === 0}>{t('السابق', 'Back')}</Button>
              <Button variant="accent" onClick={next} disabled={!canProceed}>{t('التالي', 'Next')}</Button>
            </div>
          ) : null}
        </section>

        <aside className="border-t border-border bg-surface p-4 lg:border-s lg:border-t-0">
          <Card className="lg:sticky lg:top-4">
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>{t('ملخص الطلب', 'Running summary')}</CardTitle>
                  <CardDescription>{customerName || t('عميل جديد', 'New customer')}</CardDescription>
                </div>
                <ShoppingCart aria-hidden="true" className="size-6 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="max-h-[46vh] overflow-y-auto pe-1">
                {cart.length ? cart.map((item) => <CartRow key={`${item.barcode}-${item.service}-side`} item={item} language={language} updateQty={updateQty} compact />) : (
                  <div className="rounded-lg border border-dashed border-border bg-muted p-6 text-center text-sm text-muted-foreground">
                    {t('أضف قطعًا لبدء الطلب.', 'Add items to start the order.')}
                  </div>
                )}
              </div>
              <div className="grid gap-2 border-t border-border pt-4 text-sm">
                <SummaryLine label={t('المجموع', 'Subtotal')} value={formatCurrency(language, subtotal)} />
                <SummaryLine label="VAT 5%" value={formatCurrency(language, vat)} />
                <SummaryLine label={t('الإجمالي', 'Total')} value={formatCurrency(language, total)} strong />
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
};

const CartRow = ({ item, language, updateQty, compact = false }: { item: CartItem; language: SiteLanguage; updateQty: (barcode: string, service: CartItem['service'], delta: number) => void; compact?: boolean }) => (
  <div className={cn('flex items-center gap-3 rounded-lg border border-border bg-surface p-3', compact && 'p-2')}>
    <LaundryIcon name={item.icon} alt="" className="size-10" />
    <div className="min-w-0 flex-1">
      <p className="truncate font-black">{item.name}</p>
      <p className="text-xs text-muted-foreground">{serviceOptions.find((service) => service.id === item.service)?.[language === 'ar' ? 'ar' : 'en']}</p>
    </div>
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" onClick={() => updateQty(item.barcode, item.service, -1)} aria-label="Decrease quantity"><Minus className="size-4" /></Button>
      <span className="min-w-8 text-center font-black">{item.quantity}</span>
      <Button variant="ghost" size="icon" onClick={() => updateQty(item.barcode, item.service, 1)} aria-label="Increase quantity"><Plus className="size-4" /></Button>
    </div>
    <p className="w-20 text-end font-black">{formatCurrency(language, item.quantity * item.unitPrice)}</p>
  </div>
);

const Numpad = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '.', '⌫'];
  return (
    <div className="grid grid-cols-3 gap-2">
      {keys.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => {
            if (key === '⌫') onChange(value.slice(0, -1) || '0');
            else onChange(value === '0' ? key : `${value}${key}`);
          }}
          className="min-h-16 rounded-md border border-border bg-surface text-xl font-black transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {key}
        </button>
      ))}
    </div>
  );
};

const SummaryLine = ({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) => (
  <div className={cn('flex justify-between gap-3', strong && 'text-xl font-black text-primary')}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

const stepLabel = (step: PosStep, language: SiteLanguage) => {
  const copy: Record<PosStep, { ar: string; en: string }> = {
    customer: { ar: 'العميل', en: 'Customer' },
    items: { ar: 'القطع', en: 'Items' },
    barcode: { ar: 'الباركود', en: 'Barcode' },
    review: { ar: 'المراجعة', en: 'Review' },
    payment: { ar: 'الدفع', en: 'Payment' },
    receipt: { ar: 'الإيصال', en: 'Receipt' },
  };
  return localize(language, copy[step].ar, copy[step].en);
};
