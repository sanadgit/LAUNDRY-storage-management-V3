import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

interface AuthWizardProps {
  onSendOtp: (payload: {
    phone: string;
    purpose: 'register' | 'login';
    channel: 'sms' | 'whatsapp';
  }) => Promise<{
    challengeId: string;
    expires_at: number;
    cooldown_until: number;
    provider: 'twilio' | 'aipsoft' | 'mock';
    channel: 'sms' | 'whatsapp';
    dev_code?: string;
  }>;
  onVerifyOtp: (payload: { challengeId: string; code: string }) => Promise<{
    verified: boolean;
    verificationToken: string;
    expires_at: number;
  }>;
  onLoginWithOtp: (payload: { phone: string; verificationToken: string }) => Promise<void>;
  onRegister: (payload: {
    name: string;
    phone?: string;
    email?: string;
    password?: string;
    verificationToken?: string;
    type?: string;
    area?: string;
    prefService?: number;
    notifType?: string;
  }) => Promise<void>;
}

export const AuthWizard: React.FC<AuthWizardProps> = ({
  onSendOtp,
  onVerifyOtp,
  onLoginWithOtp,
  onRegister,
}) => {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [step, setStep] = useState(0); 
  const [phone, setPhone] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpChallengeId, setOtpChallengeId] = useState('');
  const [otpVerificationToken, setOtpVerificationToken] = useState('');
  const [otpTargetPhone, setOtpTargetPhone] = useState('');
  const [otpChannel, setOtpChannel] = useState<'sms' | 'whatsapp'>('sms');
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    password: '',
    type: 'individual', // 'individual' | 'business'
    area: '',
    prefService: 1,
    notifType: 'whatsapp'
  });
  const [timer, setTimer] = useState(59);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let interval: any;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  useEffect(() => {
    setErrorMessage('');
  }, [step, mode]);

  useEffect(() => {
    setOtp(['', '', '', '', '', '']);
    setOtpChallengeId('');
    setOtpVerificationToken('');
    setOtpTargetPhone('');
    setOtpChannel('sms');
    setTimer(59);
  }, [mode]);

  const toAr = (n: any) => (Number(n) || 0).toLocaleString('ar-SA');

  const parseApiError = (error: unknown) => {
    const raw = error instanceof Error ? error.message : String(error ?? 'حدث خطأ غير متوقع');
    const normalized = raw.trim();
    if (normalized.toLowerCase().includes('invalid credentials')) return 'بيانات الدخول غير صحيحة.';
    if (normalized.toLowerCase().includes('already exists')) return 'هذا الحساب موجود مسبقاً.';
    if (normalized.toLowerCase().includes('no account found')) return 'لا يوجد حساب مرتبط بهذا الرقم.';
    if (normalized.toLowerCase().includes('verification')) return 'رمز التحقق غير صحيح أو منتهي.';
    if (normalized.toLowerCase().includes('wait before requesting')) return 'انتظر قليلاً قبل طلب رمز جديد.';
    if (normalized.toLowerCase().includes('channel is not supported')) return 'قناة التحقق المختارة غير مدعومة حالياً.';
    if (normalized.toLowerCase().includes('password')) return 'كلمة المرور غير مطابقة للشروط.';
    return normalized || 'تعذر إكمال العملية حالياً.';
  };

  const handleRegister = async () => {
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await onRegister({
        ...customer,
        phone,
        verificationToken: otpVerificationToken,
      });
    } catch (error) {
      setErrorMessage(parseApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendOtp = async () => {
    const targetPhone = (mode === 'login' ? loginPhone : phone).trim();
    if (!targetPhone || targetPhone.replace(/\D/g, '').length < 9) {
      setErrorMessage('أدخل رقم جوال صحيح قبل المتابعة.');
      return;
    }
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const purpose = mode === 'login' ? 'login' : 'register';
      const response = await onSendOtp({ phone: targetPhone, purpose, channel: otpChannel });
      setOtpChallengeId(response.challengeId);
      setOtpVerificationToken('');
      setOtp(['', '', '', '', '', '']);
      setOtpTargetPhone(targetPhone);
      setOtpChannel(response.channel ?? otpChannel);
      const remainingMs = Math.max(0, response.cooldown_until - Date.now());
      setTimer(Math.ceil(remainingMs / 1000));
      setStep(2);
      if (response.dev_code && response.dev_code.length === 6) {
        setOtp(response.dev_code.split(''));
      }
    } catch (error) {
      setErrorMessage(parseApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyOtpAndContinue = async () => {
    const code = otp.join('');
    if (!otpChallengeId || code.length !== 6) {
      setErrorMessage('أدخل رمز التحقق المكون من 6 أرقام.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const verification = await onVerifyOtp({ challengeId: otpChallengeId, code });
      setOtpVerificationToken(verification.verificationToken);

      if (mode === 'login') {
        await onLoginWithOtp({
          phone: otpTargetPhone || loginPhone.trim(),
          verificationToken: verification.verificationToken,
        });
        return;
      }

      setStep(3);
    } catch (error) {
      setErrorMessage(parseApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const isRegisterStepBlocked =
    (step === 1 && phone.length < 9) ||
    (step === 2 && otp.join('').length < 6) ||
    (step === 3 && (!customer.name.trim() || (customer.password.length > 0 && customer.password.length < 6)));

  const isLoginStepBlocked =
    (step === 1 && loginPhone.trim().replace(/\D/g, '').length < 9) ||
    (step === 2 && otp.join('').length < 6);

  const handlePrimaryAction = async () => {
    if (mode === 'login') {
      if (step === 1) {
        await sendOtp();
        return;
      }
      if (step === 2) {
        await verifyOtpAndContinue();
        return;
      }
      return;
    }

    if (step === 1) {
      await sendOtp();
      return;
    }
    if (step === 2) {
      await verifyOtpAndContinue();
      return;
    }
    if (step === 4) {
      setStep(5);
      return;
    }
    setStep(step + 1);
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-[3rem] shadow-2xl shadow-primary/10 overflow-hidden border border-gray-100 min-h-[600px] flex flex-col font-sans">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 bg-secondary p-10 flex flex-col items-center justify-center text-center space-y-8"
          >
            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center border-4 border-primary/40 shadow-2xl">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center font-black text-white text-2xl italic tracking-tighter">
                I&O
              </div>
            </div>
            
            <div>
              <h1 className="text-white text-3xl font-black mb-1">In & <span className="text-primary italic">Out</span></h1>
              <p className="text-primary/60 text-xs font-medium">مصبغة ان اند اوت — ملابسك في أيدٍ أمينة</p>
            </div>

            <p className="text-primary/40 text-sm leading-relaxed max-w-[280px]">
              من الاستلام حتى التسليم، نهتم بأدق التفاصيل لنضمن لك نظافة مثالية.
            </p>

            <div className="w-full space-y-3 pt-4">
              <button 
                onClick={() => {
                  setMode('register');
                  setStep(1);
                }}
                className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-black italic shadow-xl shadow-primary/20 transition-all active:scale-95"
              >
                إنشاء حساب جديد
              </button>
              <button 
                onClick={() => {
                  setMode('login');
                  setStep(1);
                }}
                className="w-full text-primary/60 text-xs font-bold hover:text-white transition-colors"
              >
                لديك حساب بالفعل؟ <span className="text-primary underline">تسجيل الدخول</span>
              </button>
            </div>

            <div className="flex justify-between w-full pt-8 border-t border-primary/20">
                {[
                  { val: '+٥٠٠٠', lbl: 'عميل راضٍ' },
                  { val: '٢٤س', lbl: 'تسليم سريع' },
                  { val: '٩٩٪', lbl: 'نسبة الرضا' }
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <p className="text-primary font-black text-lg">{stat.val}</p>
                    <p className="text-primary/60 text-[9px] font-bold uppercase tracking-wider">{stat.lbl}</p>
                  </div>
                ))}
            </div>
          </motion.div>
        )}

        {step > 0 && step < 5 && (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            {/* Top Bar */}
            <div className="bg-secondary p-6 flex items-center gap-4">
              <button 
                onClick={() => step === 1 ? setStep(0) : setStep(step - 1)}
                className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary hover:bg-primary/30 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
              <div className="flex-1">
                <h3 className="text-white font-bold leading-tight">
                  {mode === 'login'
                    ? (step === 1 ? 'رقم الجوال' : 'رمز التحقق')
                    : (step === 1 ? 'رقم الجوال' : step === 2 ? 'رمز التحقق' : step === 3 ? 'بيانات الحساب' : 'تفضيلاتك')}
                </h3>
                {mode === 'register' && <p className="text-primary/60 text-[10px] font-bold uppercase tracking-widest">{toAr(step)} من {toAr(4)} خطوات</p>}
              </div>
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-bold text-white text-xs italic">I&O</div>
            </div>

            {/* Progress Dots */}
            {mode === 'register' && (
              <div className="bg-gray-50 flex justify-center gap-2 py-4 border-b border-gray-100">
                {[1, 2, 3, 4].map(i => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${step === i ? 'w-8 bg-primary' : i < step ? 'w-4 bg-primary/40' : 'w-4 bg-gray-200'}`} 
                  />
                ))}
              </div>
            )}

            <div className="flex-1 p-8 overflow-y-auto space-y-8">
              {mode === 'login' && step === 1 && (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-2xl shadow-inner">🔑</div>
                    <h2 className="text-2xl font-black italic tracking-tight text-gray-900">مرحباً بك <span className="text-primary italic">من جديد</span></h2>
                    <p className="text-gray-500 font-medium text-xs leading-relaxed">أدخل رقم الجوال واختر قناة التحقق المناسبة.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">قناة التحقق</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setOtpChannel('sms')}
                          className={`p-3 rounded-xl border-2 text-xs font-black transition-all ${otpChannel === 'sms' ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-gray-200 text-gray-500'}`}
                        >
                          SMS
                        </button>
                        <button
                          onClick={() => setOtpChannel('whatsapp')}
                          className={`p-3 rounded-xl border-2 text-xs font-black transition-all ${otpChannel === 'whatsapp' ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-gray-200 text-gray-500'}`}
                        >
                          WhatsApp
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">رقم الجوال</label>
                      <input 
                        type="tel"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                        placeholder="05X XXX XXXX"
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-primary p-4 rounded-2xl font-bold outline-none text-sm text-left transition-all"
                        dir="ltr"
                      />
                    </div>
                    <p className={`text-[10px] font-bold transition-all ${loginPhone.replace(/\D/g, '').length >= 9 ? 'text-primary' : 'text-gray-400'}`}>
                      {loginPhone.replace(/\D/g, '').length >= 9 ? '✓ رقم جوال صالح' : 'أدخل رقم الجوال المكون من ٩-١٠ أرقام'}
                    </p>
                  </div>
                </div>
              )}

              {mode === 'register' && step === 1 && (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-2xl shadow-inner">📱</div>
                    <h2 className="text-2xl font-black italic tracking-tight text-gray-900">أدخل رقم <span className="text-primary italic">جوالك</span></h2>
                    <p className="text-gray-500 font-medium text-xs leading-relaxed">اختر قناة التحقق وسنرسل لك رمز التأكيد.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">قناة التحقق</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setOtpChannel('sms')}
                          className={`p-3 rounded-xl border-2 text-xs font-black transition-all ${otpChannel === 'sms' ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-gray-200 text-gray-500'}`}
                        >
                          SMS
                        </button>
                        <button
                          onClick={() => setOtpChannel('whatsapp')}
                          className={`p-3 rounded-xl border-2 text-xs font-black transition-all ${otpChannel === 'whatsapp' ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-gray-200 text-gray-500'}`}
                        >
                          WhatsApp
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <select className="bg-gray-50 border-2 border-transparent focus:border-primary p-4 rounded-2xl font-bold outline-none text-sm appearance-none">
                        <option>🇦🇪 +971</option>
                        <option>🇸🇦 +966</option>
                      </select>
                      <input 
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="05X XXX XXXX"
                        className="flex-1 bg-gray-50 border-2 border-transparent focus:border-primary p-4 rounded-2xl font-bold outline-none text-sm text-left"
                        dir="ltr"
                      />
                    </div>
                    <p className={`text-[10px] font-bold transition-all ${phone.length >= 9 ? 'text-primary' : 'text-gray-400'}`}>
                      {phone.length >= 9 ? '✓ رقم جوال صالح' : 'أدخل رقم الجوال المكون من ٩-١٠ أرقام'}
                    </p>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8 text-center">
                  <div className="space-y-2 text-right">
                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-2xl shadow-inner mx-auto mb-4">🔐</div>
                    <h2 className="text-2xl font-black italic tracking-tight text-gray-900 text-center">أدخل رمز <span className="text-primary italic">التحقق</span></h2>
                    <p className="text-gray-500 font-medium text-xs leading-relaxed text-center">
                      أرسلنا رمزاً من ٦ أرقام عبر {otpChannel === 'whatsapp' ? 'WhatsApp' : 'SMS'} للهاتف{' '}
                      <span className="dir-ltr text-gray-900 font-bold">{otpTargetPhone || (mode === 'login' ? loginPhone : phone)}</span>
                    </p>
                  </div>

                  <div className="flex justify-between gap-2 max-w-[300px] mx-auto">
                    {otp.map((digit, i) => (
                      <input 
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !digit && i > 0) {
                            document.getElementById(`otp-${i-1}`)?.focus();
                          }
                        }}
                        className="w-12 h-14 bg-gray-50 border-2 border-transparent focus:border-primary rounded-xl text-center text-xl font-black outline-none transition-all"
                      />
                    ))}
                  </div>

                  <div className="space-y-2">
                    <p className="text-primary font-black text-sm">٠:{timer < 10 ? `٠${timer}` : timer}</p>
                    <button 
                      disabled={timer > 0}
                      onClick={() => {
                        void sendOtp();
                      }}
                      className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-primary transition-colors disabled:opacity-50"
                    >
                      إعادة إرسال الرمز
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-2xl shadow-inner italic font-black">I&O</div>
                    <h2 className="text-2xl font-black italic tracking-tight text-gray-900">أكمل <span className="text-primary italic">ملفك الشخصي</span></h2>
                    <p className="text-gray-500 font-medium text-xs leading-relaxed">هذه البيانات تساعدنا على تخصيص خدمتنا لك.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">الاسم الكامل</label>
                      <input 
                        type="text"
                        value={customer.name}
                        onChange={(e) => setCustomer({...customer, name: e.target.value})}
                        placeholder="مثال: محمد عبدالله"
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-primary p-4 rounded-2xl font-bold outline-none text-sm transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">كلمة المرور (اختياري)</label>
                      <input 
                        type="password"
                        value={customer.password}
                        onChange={(e) => setCustomer({...customer, password: e.target.value})}
                        placeholder="إن أردت الدخول مستقبلاً بكلمة مرور"
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-primary p-4 rounded-2xl font-bold outline-none text-sm transition-all"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">نوع العميل</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => setCustomer({...customer, type: 'individual'})}
                          className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${customer.type === 'individual' ? 'bg-primary/5 border-primary shadow-lg' : 'bg-white border-gray-100'}`}
                        >
                          <span className="text-2xl">🏠</span>
                          <span className="text-xs font-bold text-gray-900">أفراد</span>
                        </button>
                        <button 
                          onClick={() => setCustomer({...customer, type: 'business'})}
                          className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${customer.type === 'business' ? 'bg-primary/5 border-primary shadow-lg' : 'bg-white border-gray-100'}`}
                        >
                          <span className="text-2xl">🏢</span>
                          <span className="text-xs font-bold text-gray-900">أعمال</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-2xl shadow-inner">⚙️</div>
                    <h2 className="text-2xl font-black italic tracking-tight text-gray-900">تفضيلات <span className="text-primary italic">الخدمة</span></h2>
                    <p className="text-gray-500 font-medium text-xs leading-relaxed">اضبط إعداداتك لنجعل تجربتك أسرع.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">المنطقة الافتراضية</label>
                      <select 
                        value={customer.area}
                        onChange={(e) => setCustomer({...customer, area: e.target.value})}
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-primary p-4 rounded-2xl font-bold outline-none text-sm transition-all"
                      >
                        <option value="">— اختر منطقتك —</option>
                        <option>الخالدية</option><option>المصفح</option><option>جزيرة ياس</option>
                      </select>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">طريقة الإشعارات</label>
                      <div className="flex gap-2">
                        {['whatsapp', 'sms', 'app'].map(type => (
                          <button 
                            key={type}
                            onClick={() => setCustomer({...customer, notifType: type})}
                            className={`flex-1 p-3 rounded-2xl border-2 transition-all text-xs font-bold ${customer.notifType === type ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-100'}`}
                          >
                            {type === 'whatsapp' ? 'واتساب' : type === 'sms' ? 'SMS' : 'تطبيق'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="rounded-2xl border border-danger/20 bg-danger/5 px-4 py-3 text-xs font-bold text-danger">
                  {errorMessage}
                </div>
              )}
            </div>

            <div className="p-8 border-t border-gray-100 bg-gray-50 flex flex-col gap-3">
               <button 
                 onClick={() => {
                   void handlePrimaryAction();
                 }}
                 disabled={
                   isSubmitting ||
                   (mode === 'login' ? isLoginStepBlocked : isRegisterStepBlocked)
                 }
                 className="w-full bg-primary text-white py-4 rounded-2xl font-black italic shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
               >
                 {isSubmitting ? 'جاري التنفيذ...' : (mode === 'login' ? (step === 1 ? 'إرسال رمز التحقق' : 'تحقق ودخول') : (step === 4 ? 'بدء الاستخدام واكتساب النقاط' : 'التالي'))} <ChevronLeft size={18} />
               </button>
               {mode === 'login' ? (
                  <button onClick={() => {setMode('register'); setStep(1);}} className="text-xs font-bold text-gray-400 text-center uppercase">ليس لديك حساب؟ سجل الآن</button>
               ) : (
                 step >= 3 && <button onClick={() => setStep(5)} className="text-xs font-bold text-gray-400 text-center uppercase tracking-widest">تخطّي هذه الخطوة</button>
               )}
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div
            key="welcome"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-8"
          >
            <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center border-2 border-primary/20 shadow-inner">
               <Sparkles size={40} className="animate-pulse" />
            </div>
            <h2 className="text-3xl font-black italic tracking-tight text-secondary">أهلاً بك، <span className="text-primary">{customer.name.split(' ')[0] || 'ضيفنا'}!</span></h2>
            <p className="text-gray-500 font-medium text-sm">حسابك أصبح جاهزاً الآن.</p>
            <button 
              onClick={() => {
                void handleRegister();
              }}
              disabled={isSubmitting || !customer.name.trim() || !otpVerificationToken || (customer.password.length > 0 && customer.password.length < 6)}
              className="w-full bg-primary text-white py-5 rounded-[2rem] font-black italic shadow-2xl shadow-primary/30 text-xl disabled:opacity-50"
            >
              {isSubmitting ? 'جاري إنشاء الحساب...' : 'ابدأ طلبك الأول'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
