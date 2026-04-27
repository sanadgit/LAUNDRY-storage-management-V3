import React, { useState } from 'react';

interface DriverAccessGateProps {
  onLogin: (payload: { driverId: string; phone: string }) => Promise<void>;
}

type DriverLanguage = 'ar' | 'en';

const DRIVER_LANGUAGE_STORAGE_KEY = 'io_driver_lang';

const ACCESS_COPY: Record<DriverLanguage, Record<string, string>> = {
  ar: {
    title: 'دخول السائق',
    subtitle: 'سجّل الدخول كسائق لفتح شاشة المهام والاستلام والتسليم.',
    driverIdPlaceholder: 'معرّف السائق (مثال: DRV-001)',
    phonePlaceholder: 'رقم هاتف السائق',
    signIn: 'تسجيل الدخول',
    signingIn: 'جاري تسجيل الدخول...',
    required: 'الرجاء إدخال المعرّف ورقم الهاتف',
    language: 'اللغة',
    arabic: 'العربية',
    english: 'English',
    authFailed: 'فشل تسجيل الدخول',
  },
  en: {
    title: 'Driver Access',
    subtitle: 'Sign in as a driver to open dispatch, pickup, and delivery controls.',
    driverIdPlaceholder: 'Driver ID (e.g. DRV-001)',
    phonePlaceholder: 'Driver phone',
    signIn: 'Sign In',
    signingIn: 'Signing in...',
    required: 'Please enter driver ID and phone',
    language: 'Language',
    arabic: 'Arabic',
    english: 'English',
    authFailed: 'Authentication failed',
  },
};

export const DriverAccessGate: React.FC<DriverAccessGateProps> = ({ onLogin }) => {
  const [driverLanguage, setDriverLanguage] = useState<DriverLanguage>(() => {
    if (typeof window === 'undefined') return 'ar';
    const saved = window.localStorage.getItem(DRIVER_LANGUAGE_STORAGE_KEY);
    return saved === 'en' ? 'en' : 'ar';
  });
  const [driverId, setDriverId] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const isArabic = driverLanguage === 'ar';
  const copy = ACCESS_COPY[driverLanguage];

  const submit = async () => {
    if (!driverId.trim() || !phone.trim()) {
      setError(copy.required);
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await onLogin({ driverId: driverId.trim(), phone: phone.trim() });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err ?? copy.authFailed);
      setError(message || copy.authFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-2xl font-black text-gray-900 italic mb-1">{copy.title}</h2>
            <p className="text-xs text-gray-500">{copy.subtitle}</p>
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-gray-200 p-1 bg-gray-50">
            <button
              onClick={() => {
                setDriverLanguage('ar');
                if (typeof window !== 'undefined') window.localStorage.setItem(DRIVER_LANGUAGE_STORAGE_KEY, 'ar');
              }}
              className={`px-2.5 py-1 text-[11px] font-black rounded-lg ${
                driverLanguage === 'ar' ? 'bg-primary text-white' : 'text-gray-600'
              }`}
              type="button"
            >
              {copy.arabic}
            </button>
            <button
              onClick={() => {
                setDriverLanguage('en');
                if (typeof window !== 'undefined') window.localStorage.setItem(DRIVER_LANGUAGE_STORAGE_KEY, 'en');
              }}
              className={`px-2.5 py-1 text-[11px] font-black rounded-lg ${
                driverLanguage === 'en' ? 'bg-primary text-white' : 'text-gray-600'
              }`}
              type="button"
            >
              {copy.english}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <input
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            placeholder={copy.driverIdPlaceholder}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold outline-none focus:border-primary"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={copy.phonePlaceholder}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold outline-none focus:border-primary"
          />
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-danger/20 bg-danger/5 px-3 py-2 text-xs font-semibold text-danger">
            {error}
          </div>
        )}

        <button
          onClick={() => {
            void submit();
          }}
          disabled={isSubmitting || !driverId.trim() || !phone.trim()}
          className="mt-6 w-full rounded-2xl bg-primary py-3 text-sm font-black text-white disabled:opacity-50"
        >
          {isSubmitting ? copy.signingIn : copy.signIn}
        </button>
      </div>
    </div>
  );
};
