import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { SiteLanguage, formatNumber, localize } from '../lib/i18n';


interface AuthWizardProps {
  onSendOtp: (payload: {
    phone: string;
    purpose: 'register' | 'login';
    channel: 'sms' | 'whatsapp';
  }) => Promise<{
    challengeId: string;
    expires_at: number;
    cooldown_until: number;
    provider: 'twilio' | 'aipsoft' | 'meta_whatsapp' | 'mock';
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
  language?: SiteLanguage;
}

export const AuthWizard: React.FC<AuthWizardProps> = ({
  onSendOtp,
  onVerifyOtp,
  onLoginWithOtp,
  onRegister,
  language = 'ar',
}) => {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [step, setStep] = useState(0); 
  const [phone, setPhone] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpChallengeId, setOtpChallengeId] = useState('');
  const [otpVerificationToken, setOtpVerificationToken] = useState('');
  const [otpTargetPhone, setOtpTargetPhone] = useState('');
  const [otpChannel, setOtpChannel] = useState<'sms' | 'whatsapp'>('whatsapp');
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
    setOtpChannel('whatsapp');
    setTimer(59);
  }, [mode]);

  const num = (value: number) => formatNumber(language, value);

  const parseApiError = (error: unknown) => {
    const raw = error instanceof Error ? error.message : String(error ?? localize(language, 'حدث خطأ غير متوقع', 'An unexpected error occurred'));
    const normalized = raw.trim();
    if (normalized.toLowerCase().includes('invalid credentials')) return localize(language, 'بيانات الدخول غير صحيحة.', 'Invalid login details.');
    if (normalized.toLowerCase().includes('already exists')) return localize(language, 'هذا الحساب موجود مسبقاً.', 'This account already exists.');
    if (normalized.toLowerCase().includes('no account found')) return localize(language, 'لا يوجد حساب مرتبط بهذا الرقم.', 'No account is linked to this phone number.');
    if (normalized.toLowerCase().includes('verification')) return localize(language, 'رمز التحقق غير صحيح أو منتهي.', 'The verification code is invalid or expired.');
    if (normalized.toLowerCase().includes('wait before requesting')) return localize(language, 'انتظر قليلاً قبل طلب رمز جديد.', 'Please wait before requesting a new code.');
    if (normalized.toLowerCase().includes('channel is not supported')) return localize(language, 'قناة التحقق المختارة غير مدعومة حالياً.', 'The selected verification channel is not supported.');
    if (normalized.toLowerCase().includes('password')) return localize(language, 'كلمة المرور غير مطابقة للشروط.', 'The password does not meet the requirements.');
    return normalized || localize(language, 'تعذر إكمال العملية حالياً.', 'Could not complete the request right now.');
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
      setErrorMessage(localize(language, 'أدخل رقم جوال صحيح قبل المتابعة.', 'Enter a valid mobile number before continuing.'));
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
      setErrorMessage(localize(language, 'أدخل رمز التحقق المكون من 6 أرقام.', 'Enter the 6-digit verification code.'));
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
            initial={{ opacity: 0, scale: 0.96, y: 40 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              transition: {
                duration: .7,
                ease: [0.22, 1, 0.36, 1]
              }
            }}
            exit={{
              opacity: 0,
              scale: .98,
              y: -20,
              transition: { duration: .35 }
            }}
            className="flex-1 bg-secondary p-10 flex flex-col items-center justify-center text-center space-y-8"
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, -3, 3, 0],
                boxShadow: [
                  "0 0 0 rgba(0,0,0,0)",
                  "0 0 35px rgba(255,180,0,.35)",
                  "0 0 0 rgba(0,0,0,0)"
                ]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center border-4 border-primary/40 shadow-2xl"
            >
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center font-black text-white text-2xl italic tracking-tighter">
                I&O
              </div>
            </motion.div>
            
            <div>
              <h1 className="text-white text-3xl font-black mb-1">In & <span className="text-primary text-white ">Out Laundry</span></h1> 
              <p className="text-primary text-white/90 text-xs font-medium">
                {localize(language, 'مصبغة ان اند اوت — ملابسك في أيدٍ أمينة', 'In & Out Laundry - Your clothes are in good hands')}
              </p>
            </div>

            <p className="text-primary text-white/90 text-sm leading-relaxed max-w-[280px]">
              {localize(language, 'من الاستلام حتى التسليم، نهتم بأدق التفاصيل لنضمن لك نظافة مثالية.', 'From pickup to delivery, we care for every detail for a cleaner experience.')}
            </p>

            <div className="w-full space-y-3 pt-4">
              <button 
                onClick={() => {
                  setMode('register');
                  setStep(1);
                }}
                className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-black italic shadow-xl shadow-primary/20 transition-all active:scale-95"
              >
                {localize(language, 'إنشاء حساب جديد', 'Create New Account')}
              </button>
              <button 
                onClick={() => {
                  setMode('login');
                  setStep(1);
                }}
                className="w-full text-primary text-white/80 text-xs font-bold hover:text-white transition-colors"
              >
                {localize(language, 'لديك حساب بالفعل؟', 'Already have an account?')} <span className="text-primary underline text-white ">{localize(language, 'تسجيل الدخول', 'Log In')}</span>
              </button>
            </div>

            <div className="flex justify-between w-full pt-8 border-t border-primary/20">
                {[
                  { val: language === 'ar' ? '+٥٠٠٠' : '+5,000', lbl: localize(language, 'عميل راضٍ', 'Happy Customers') },
                  { val: language === 'ar' ? '٢٤س' : '24h', lbl: localize(language, 'تسليم سريع', 'Fast Delivery') },
                  { val: language === 'ar' ? '٩٩٪' : '99%', lbl: localize(language, 'نسبة الرضا', 'Satisfaction') }
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{
                      opacity:0,
                      y:20
                    }}
                    animate={{
                      opacity:1,
                      y:0
                    }}
                    transition={{
                      delay:i*.15,
                      duration:.5
                    }}
                    whileHover={{
                      scale:1.08
                    }}
                    className="text-center"
                  >
                    <motion.p
                      animate={{
                        scale:[1,1.12,1]
                      }}
                      transition={{
                        delay:i*.3,
                        duration:1.5,
                        repeat:Infinity,
                        repeatDelay:5
                      }}
                      className="text-logo text-xl font-black"
                    >
                      {stat.val}
                    </motion.p>
                    <p className="text-primary text-white/80 text-[9px] font-bold uppercase tracking-wider">{stat.lbl}</p>
                  </motion.div>
                ))}
            </div>
          </motion.div>
        )}

        {step > 0 && step < 5 && (
          <motion.div
            key="form"
            initial={{
              opacity: 0,
              x: 80,
              scale: .98
            }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
              transition: {
                duration: .55,
                ease: [0.22, 1, 0.36, 1]
              }
            }}
            exit={{
              opacity: 0,
              x: -80,
              scale: .98,
              transition: {
                duration: .35
              }
            }}
            className="flex-1 flex flex-col"
          >
            {/* Top Bar */}
            <div className="relative overflow-hidden p-6 flex items-center gap-4" style={{
              background: 'linear-gradient(145deg,#071B35,#0D2E5C,#0B4A6F)'
            }}>
              <motion.div
                className="absolute inset-0 opacity-20"
                animate={{
                  backgroundPosition: [
                    '0% 50%',
                    '100% 50%',
                    '0% 50%'
                  ]
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                style={{
                  backgroundImage: 'radial-gradient(circle,#ffffff55 1px,transparent 1px)',
                  backgroundSize: '30px 30px'
                }}
              />
              <button 
                onClick={() => step === 1 ? setStep(0) : setStep(step - 1)}
                className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary hover:bg-primary/30 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
              <div className="flex-1">
                <h3 className="text-white font-bold leading-tight">
                  {mode === 'login'
                    ? (step === 1 ? localize(language, 'رقم الجوال', 'Mobile Number') : localize(language, 'رمز التحقق', 'Verification Code'))
                    : (step === 1 ? localize(language, 'رقم الجوال', 'Mobile Number') : step === 2 ? localize(language, 'رمز التحقق', 'Verification Code') : step === 3 ? localize(language, 'بيانات الحساب', 'Account Details') : localize(language, 'تفضيلاتك', 'Preferences'))}
                </h3>
                {mode === 'register' && (
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">
                    {num(step)} {localize(language, 'من', 'of')} {num(4)} {localize(language, 'خطوات', 'steps')}
                  </p>
                )}
              </div>
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-bold text-white text-xs italic">I&O</div>
            </div>

            {/* Progress Dots */}
            {mode === 'register' && (
              <div className="bg-gray-50 flex justify-center gap-2 py-4 border-b border-gray-100">
                {[1, 2, 3, 4].map(i => (
                  <motion.div
                    key={i}
                    layout
                    transition={{
                      type: "spring",
                      stiffness: 250,
                      damping: 22
                    }}
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
                    <h2 className="text-2xl font-black italic tracking-tight text-secondary">
                      {localize(language, 'مرحباً بك', 'Welcome')} <span className="text-primary italic">{localize(language, 'من جديد', 'Back')}</span>
                    </h2>
                    <p className="text-gray-500 font-medium text-xs leading-relaxed">
                      {localize(language, 'أدخل رقم الجوال واختر قناة التحقق المناسبة.', 'Enter your mobile number and choose a verification channel.')}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{localize(language, 'قناة التحقق', 'Verification Channel')}</label>
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
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{localize(language, 'رقم الجوال', 'Mobile Number')}</label>
                      <input 
                        type="tel"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                        placeholder="05X XXX XXXX"
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-primary focus:shadow-xl focus:shadow-primary/20 focus:scale-[1.02] p-4 rounded-2xl font-bold outline-none text-sm text-left transition-all duration-300"
                        dir="ltr"
                      />
                    </div>
                    <p className={`text-[10px] font-bold transition-all ${loginPhone.replace(/\D/g, '').length >= 9 ? 'text-primary' : 'text-gray-400'}`}>
                      {loginPhone.replace(/\D/g, '').length >= 9
                        ? localize(language, '✓ رقم جوال صالح', 'Valid mobile number')
                        : localize(language, 'أدخل رقم الجوال المكون من ٩-١٠ أرقام', 'Enter a 9-10 digit mobile number')}
                    </p>
                  </div>
                </div>
              )}

              {mode === 'register' && step === 1 && (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-2xl shadow-inner">📱</div>
                    <h2 className="text-2xl font-black italic tracking-tight text-secondary">
                      {localize(language, 'أدخل رقم', 'Enter Your')} <span className="text-primary italic">{localize(language, 'جوالك', 'Mobile Number')}</span>
                    </h2>
                    <p className="text-gray-500 font-medium text-xs leading-relaxed">
                      {localize(language, 'اختر قناة التحقق وسنرسل لك رمز التأكيد.', 'Choose a verification channel and we will send your code.')}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{localize(language, 'قناة التحقق', 'Verification Channel')}</label>
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
                      <select className="bg-gray-50 border-2 border-transparent focus:border-primary focus:shadow-xl focus:shadow-primary/20 focus:scale-[1.02] p-4 rounded-2xl font-bold outline-none text-sm appearance-none duration-300">
                        <option>🇦🇪 +971</option>
                        <option>🇸🇦 +966</option>
                      </select>
                      <input 
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="05X XXX XXXX"
                        className="flex-1 bg-gray-50 border-2 border-transparent focus:border-primary focus:shadow-xl focus:shadow-primary/20 focus:scale-[1.02] p-4 rounded-2xl font-bold outline-none text-sm text-left transition-all duration-300"
                        dir="ltr"
                      />
                    </div>
                    <p className={`text-[10px] font-bold transition-all ${phone.length >= 9 ? 'text-primary' : 'text-gray-400'}`}>
                      {phone.length >= 9
                        ? localize(language, '✓ رقم جوال صالح', 'Valid mobile number')
                        : localize(language, 'أدخل رقم الجوال المكون من ٩-١٠ أرقام', 'Enter a 9-10 digit mobile number')}
                    </p>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8 text-center">
                  <div className="space-y-2 text-right">
                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-2xl shadow-inner mx-auto mb-4">🔐</div>
                    <h2 className="text-2xl font-black italic tracking-tight text-secondary text-center">
                      {localize(language, 'أدخل رمز', 'Enter the')} <span className="text-primary italic">{localize(language, 'التحقق', 'Verification Code')}</span>
                    </h2>
                    <p className="text-gray-500 font-medium text-xs leading-relaxed text-center">
                      {localize(language, 'أرسلنا رمزاً من ٦ أرقام عبر', 'We sent a 6-digit code via')} {otpChannel === 'whatsapp' ? 'WhatsApp' : 'SMS'} {localize(language, 'للهاتف', 'to')}{' '}
                      <span className="dir-ltr text-secondary font-bold">{otpTargetPhone || (mode === 'login' ? loginPhone : phone)}</span>
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
                        className="w-12 h-14 bg-gray-50 border-2 border-transparent focus:border-primary focus:shadow-xl focus:shadow-primary/20 focus:scale-[1.02] rounded-xl text-center text-xl font-black outline-none transition-all duration-300"
                      />
                    ))}
                  </div>

                  <div className="space-y-2">
                    <p className="text-primary font-black text-sm">{language === 'ar' ? `٠:${timer < 10 ? `٠${timer}` : timer}` : `0:${String(timer).padStart(2, '0')}`}</p>
                    <button 
                      disabled={timer > 0}
                      onClick={() => {
                        void sendOtp();
                      }}
                      className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-primary transition-colors disabled:opacity-50"
                    >
                      {localize(language, 'إعادة إرسال الرمز', 'Resend Code')}
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-2xl shadow-inner italic font-black">I&O</div>
                    <h2 className="text-2xl font-black italic tracking-tight text-secondary">
                      {localize(language, 'أكمل', 'Complete Your')} <span className="text-primary italic">{localize(language, 'ملفك الشخصي', 'Profile')}</span>
                    </h2>
                    <p className="text-gray-500 font-medium text-xs leading-relaxed">
                      {localize(language, 'هذه البيانات تساعدنا على تخصيص خدمتنا لك.', 'These details help us personalize your service.')}
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{localize(language, 'الاسم الكامل', 'Full Name')}</label>
                      <input 
                        type="text"
                        value={customer.name}
                        onChange={(e) => setCustomer({...customer, name: e.target.value})}
                        placeholder={localize(language, 'مثال: محمد عبدالله', 'Example: Mohammed Abdullah')}
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-primary focus:shadow-xl focus:shadow-primary/20 focus:scale-[1.02] p-4 rounded-2xl font-bold outline-none text-sm transition-all duration-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{localize(language, 'كلمة المرور (اختياري)', 'Password (Optional)')}</label>
                      <input 
                        type="password"
                        value={customer.password}
                        onChange={(e) => setCustomer({...customer, password: e.target.value})}
                        placeholder={localize(language, 'إن أردت الدخول مستقبلاً بكلمة مرور', 'Use it later if you prefer password login')}
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-primary focus:shadow-xl focus:shadow-primary/20 focus:scale-[1.02] p-4 rounded-2xl font-bold outline-none text-sm transition-all duration-300"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{localize(language, 'نوع العميل', 'Customer Type')}</label>
                      <div className="grid grid-cols-2 gap-4">
                        <motion.button 
                          onClick={() => setCustomer({...customer, type: 'individual'})}
                          whileHover={{
                            y: -5,
                            scale: 1.04
                          }}
                          whileTap={{
                            scale: .97
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 350
                          }}
                          className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${customer.type === 'individual' ? 'bg-primary/5 border-primary shadow-lg' : 'bg-white border-gray-100'}`}
                        >
                          <span className="text-2xl">🏠</span>
                          <span className="text-xs font-bold text-secondary">{localize(language, 'أفراد', 'Individual')}</span>
                        </motion.button>
                        <motion.button 
                          onClick={() => setCustomer({...customer, type: 'business'})}
                          whileHover={{
                            y: -5,
                            scale: 1.04
                          }}
                          whileTap={{
                            scale: .97
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 350
                          }}
                          className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${customer.type === 'business' ? 'bg-primary/5 border-primary shadow-lg' : 'bg-white border-gray-100'}`}
                        >
                          <span className="text-2xl">🏢</span>
                          <span className="text-xs font-bold text-secondary">{localize(language, 'أعمال', 'Business')}</span>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center text-2xl shadow-inner">⚙️</div>
                    <h2 className="text-2xl font-black italic tracking-tight text-secondary">
                      {localize(language, 'تفضيلات', 'Service')} <span className="text-primary italic">{localize(language, 'الخدمة', 'Preferences')}</span>
                    </h2>
                    <p className="text-gray-500 font-medium text-xs leading-relaxed">
                      {localize(language, 'اضبط إعداداتك لنجعل تجربتك أسرع.', 'Set your preferences so future orders are faster.')}
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{localize(language, 'المنطقة الافتراضية', 'Default Area')}</label>
                      <select 
                        value={customer.area}
                        onChange={(e) => setCustomer({...customer, area: e.target.value})}
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-primary focus:shadow-xl focus:shadow-primary/20 focus:scale-[1.02] p-4 rounded-2xl font-bold outline-none text-sm transition-all duration-300"
                      >
                        <option value="">{localize(language, '— اختر منطقتك —', '-- Choose your area --')}</option>
                        <option>{localize(language, 'الخالدية', 'Al Khalidiyah')}</option><option>{localize(language, 'المصفح', 'Mussafah')}</option><option>{localize(language, 'جزيرة ياس', 'Yas Island')}</option>
                      </select>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{localize(language, 'طريقة الإشعارات', 'Notification Method')}</label>
                      <div className="flex gap-2">
                        {['whatsapp', 'sms', 'app'].map(type => (
                          <button 
                            key={type}
                            onClick={() => setCustomer({...customer, notifType: type})}
                            className={`flex-1 p-3 rounded-2xl border-2 transition-all text-xs font-bold ${customer.notifType === type ? 'bg-secondary text-white border-secondary' : 'bg-white border-gray-100'}`}
                          >
                            {type === 'whatsapp' ? localize(language, 'واتساب', 'WhatsApp') : type === 'sms' ? 'SMS' : localize(language, 'تطبيق', 'App')}
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
                 {isSubmitting
                   ? localize(language, 'جاري التنفيذ...', 'Processing...')
                   : (mode === 'login'
                     ? (step === 1 ? localize(language, 'إرسال رمز التحقق', 'Send Verification Code') : localize(language, 'تحقق ودخول', 'Verify & Log In'))
                     : (step === 4 ? localize(language, 'بدء الاستخدام واكتساب النقاط', 'Start Using & Earn Points') : localize(language, 'التالي', 'Next')))} <ChevronLeft size={18} />
               </button>
               {mode === 'login' ? (
                  <button onClick={() => {setMode('register'); setStep(1);}} className="text-xs font-bold text-gray-400 text-center uppercase">
                    {localize(language, 'ليس لديك حساب؟ سجل الآن', 'No account? Register now')}
                  </button>
               ) : (
                 step >= 3 && (
                   <button onClick={() => setStep(5)} className="text-xs font-bold text-gray-400 text-center uppercase tracking-widest">
                    {localize(language, 'تخطّي هذه الخطوة', 'Skip This Step')}
                   </button>
                 )
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
               <motion.div
                 animate={{
                   rotate: [0, 360],
                   scale: [1, 1.12, 1]
                 }}
                 transition={{
                   repeat: Infinity,
                   duration: 6,
                   ease: "linear"
                 }}
               >
                 <Sparkles size={40} />
               </motion.div>
            </div>
            <h2 className="text-3xl font-black italic tracking-tight text-secondary">
              {localize(language, 'أهلاً بك،', 'Welcome,')} <span className="text-primary">{customer.name.split(' ')[0] || localize(language, 'ضيفنا', 'Guest')}!</span>
            </h2>
            <p className="text-gray-500 font-medium text-sm">{localize(language, 'حسابك أصبح جاهزاً الآن.', 'Your account is ready now.')}</p>
            <button 
              onClick={() => {
                void handleRegister();
              }}
              disabled={isSubmitting || !customer.name.trim() || !otpVerificationToken || (customer.password.length > 0 && customer.password.length < 6)}
              className="w-full bg-primary text-white py-5 rounded-[2rem] font-black italic shadow-2xl shadow-primary/30 text-xl disabled:opacity-50"
            >
              {isSubmitting ? localize(language, 'جاري إنشاء الحساب...', 'Creating account...') : localize(language, 'ابدأ طلبك الأول', 'Start Your First Order')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
