export type SiteLanguage = 'ar' | 'en';

export const isArabic = (language: SiteLanguage) => language === 'ar';

export const localize = (language: SiteLanguage, ar: string, en: string) => (isArabic(language) ? ar : en);

export const formatNumber = (language: SiteLanguage, value: number) =>
  (Number(value) || 0).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US');

export const formatCurrency = (language: SiteLanguage, value: number) =>
  language === 'ar'
    ? `${formatNumber(language, value)} درهم`
    : `AED ${formatNumber(language, value)}`;
