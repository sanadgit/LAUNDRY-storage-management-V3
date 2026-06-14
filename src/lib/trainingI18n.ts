import en from '../locales/en.json';
import ar from '../locales/ar.json';
import ur from '../locales/ur.json';
import hi from '../locales/hi.json';
import tl from '../locales/tl.json';

export type TrainingLanguage = 'en' | 'ar' | 'ur' | 'hi' | 'tl';

export const trainingLanguages: Array<{
  code: TrainingLanguage;
  label: string;
  nativeLabel: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}> = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', flag: '🇦🇪', dir: 'rtl' },
  { code: 'ur', label: 'Urdu', nativeLabel: 'اردو', flag: '🇵🇰', dir: 'rtl' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
  { code: 'tl', label: 'Filipino / Tagalog', nativeLabel: 'Filipino / Tagalog', flag: '🇵🇭', dir: 'ltr' },
];

const dictionaries: Record<TrainingLanguage, Record<string, string>> = { en, ar, ur, hi, tl };

export const getStoredTrainingLanguage = (): TrainingLanguage => {
  if (typeof window === 'undefined') return 'en';
  const value = window.localStorage.getItem('training-academy-language') as TrainingLanguage | null;
  return trainingLanguages.some((language) => language.code === value) ? value! : 'en';
};

export const storeTrainingLanguage = (language: TrainingLanguage) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('training-academy-language', language);
};

export const languageDirection = (language: TrainingLanguage): 'ltr' | 'rtl' =>
  trainingLanguages.find((item) => item.code === language)?.dir ?? 'ltr';

export const t = (language: TrainingLanguage, key: string) =>
  dictionaries[language]?.[key] ?? dictionaries.en[key] ?? key;

const moduleTitleTranslations: Record<TrainingLanguage, Record<string, string>> = {
  en: {},
  ar: {
    'Company Introduction': 'مقدمة الشركة',
    'Customer Reception Process': 'عملية استقبال العملاء',
    'Tagging & Barcode Workflow': 'سير عمل الوسوم والباركود',
    'Clothes Sorting Operations': 'عمليات فرز الملابس',
    'Washing Procedures': 'إجراءات الغسيل',
    'Blanket Processing System': 'نظام معالجة البطانيات',
    'Drying Procedures': 'إجراءات التجفيف',
    'Ironing & Pressing': 'الكي والضغط',
    'Packaging Standards': 'معايير التغليف',
    'Storage & Warehouse Handling': 'التخزين وإدارة المستودع',
    'Delivery & Pickup Workflow': 'سير عمل التوصيل والاستلام',
    'POS System Usage': 'استخدام نظام نقاط البيع',
    'Handling Lost or Damaged Items': 'التعامل مع المفقودات والتلف',
    'Customer Complaint Handling': 'التعامل مع شكاوى العملاء',
    'Hygiene & Safety': 'النظافة والسلامة',
    'Staff Behavior & Professionalism': 'سلوك الموظفين والاحترافية',
    'KPI & Productivity': 'مؤشرات الأداء والإنتاجية',
    'AI & Automation in Laundry': 'الذكاء الاصطناعي والأتمتة في المغسلة',
    'Emergency Procedures': 'إجراءات الطوارئ'
  },
  ur: {
    'Company Introduction': 'کمپنی کا تعارف',
    'Customer Reception Process': 'کسٹمر ریسیپشن عمل',
    'Tagging & Barcode Workflow': 'ٹیگنگ اور بارکوڈ ورک فلو',
    'Clothes Sorting Operations': 'کپڑوں کی چھانٹی',
    'Washing Procedures': 'دھلائی کے طریقہ کار',
    'Blanket Processing System': 'کمبل پروسیسنگ سسٹم',
    'Drying Procedures': 'خشک کرنے کے طریقہ کار',
    'Ironing & Pressing': 'استری اور پریسنگ',
    'Packaging Standards': 'پیکجنگ معیار',
    'Storage & Warehouse Handling': 'اسٹوریج اور ویئر ہاؤس ہینڈلنگ',
    'Delivery & Pickup Workflow': 'ڈیلیوری اور پک اپ ورک فلو',
    'POS System Usage': 'POS سسٹم استعمال',
    'Handling Lost or Damaged Items': 'گمشدہ یا خراب اشیاء کا حل',
    'Customer Complaint Handling': 'کسٹمر شکایت ہینڈلنگ',
    'Hygiene & Safety': 'صفائی اور حفاظت',
    'Staff Behavior & Professionalism': 'عملے کا رویہ اور پیشہ ورانہ معیار',
    'KPI & Productivity': 'KPI اور پیداواری صلاحیت',
    'AI & Automation in Laundry': 'لانڈری میں AI اور آٹومیشن',
    'Emergency Procedures': 'ایمرجنسی طریقہ کار'
  },
  hi: {
    'Company Introduction': 'कंपनी परिचय',
    'Customer Reception Process': 'ग्राहक रिसेप्शन प्रक्रिया',
    'Tagging & Barcode Workflow': 'टैगिंग और बारकोड वर्कफ़्लो',
    'Clothes Sorting Operations': 'कपड़ों की छंटाई',
    'Washing Procedures': 'धुलाई प्रक्रियाएं',
    'Blanket Processing System': 'कंबल प्रोसेसिंग सिस्टम',
    'Drying Procedures': 'सुखाने की प्रक्रियाएं',
    'Ironing & Pressing': 'इस्त्री और प्रेसिंग',
    'Packaging Standards': 'पैकेजिंग मानक',
    'Storage & Warehouse Handling': 'स्टोरेज और वेयरहाउस हैंडलिंग',
    'Delivery & Pickup Workflow': 'डिलीवरी और पिकअप वर्कफ़्लो',
    'POS System Usage': 'POS सिस्टम उपयोग',
    'Handling Lost or Damaged Items': 'खोई या क्षतिग्रस्त वस्तुओं को संभालना',
    'Customer Complaint Handling': 'ग्राहक शिकायत प्रबंधन',
    'Hygiene & Safety': 'स्वच्छता और सुरक्षा',
    'Staff Behavior & Professionalism': 'स्टाफ व्यवहार और प्रोफेशनलिज्म',
    'KPI & Productivity': 'KPI और उत्पादकता',
    'AI & Automation in Laundry': 'लॉन्ड्री में AI और ऑटोमेशन',
    'Emergency Procedures': 'आपातकालीन प्रक्रियाएं'
  },
  tl: {
    'Company Introduction': 'Company Introduction',
    'Customer Reception Process': 'Customer Reception Process',
    'Tagging & Barcode Workflow': 'Tagging at Barcode Workflow',
    'Clothes Sorting Operations': 'Clothes Sorting Operations',
    'Washing Procedures': 'Washing Procedures',
    'Blanket Processing System': 'Blanket Processing System',
    'Drying Procedures': 'Drying Procedures',
    'Ironing & Pressing': 'Ironing at Pressing',
    'Packaging Standards': 'Packaging Standards',
    'Storage & Warehouse Handling': 'Storage at Warehouse Handling',
    'Delivery & Pickup Workflow': 'Delivery at Pickup Workflow',
    'POS System Usage': 'POS System Usage',
    'Handling Lost or Damaged Items': 'Handling Lost or Damaged Items',
    'Customer Complaint Handling': 'Customer Complaint Handling',
    'Hygiene & Safety': 'Hygiene at Safety',
    'Staff Behavior & Professionalism': 'Staff Behavior at Professionalism',
    'KPI & Productivity': 'KPI at Productivity',
    'AI & Automation in Laundry': 'AI at Automation sa Laundry',
    'Emergency Procedures': 'Emergency Procedures'
  }
};

const headingTranslations: Record<TrainingLanguage, Record<string, string>> = {
  en: {},
  ar: {
    'Training Objectives': 'أهداف التدريب',
    'Importance of the Task': 'أهمية المهمة',
    'Required Tools & Equipment': 'الأدوات والمعدات المطلوبة',
    'Step-by-Step Workflow': 'سير العمل خطوة بخطوة',
    'Standard Operating Procedures': 'إجراءات العمل القياسية',
    'Safety Instructions': 'تعليمات السلامة',
    'Quality Standards': 'معايير الجودة',
    'Common Mistakes': 'الأخطاء الشائعة',
    'Troubleshooting Guide': 'دليل حل المشكلات',
    'Real-World Examples': 'أمثلة عملية',
    "Do & Don't": 'افعل ولا تفعل',
    'Staff Productivity Tips': 'نصائح إنتاجية الموظفين',
    'Supervisor Monitoring Checklist': 'قائمة متابعة المشرف',
    'Daily Checklist': 'قائمة الفحص اليومية',
    'Quiz / Worker Questions': 'اختبار / أسئلة العمال',
    'KPI Metrics': 'مقاييس الأداء',
    'Visual Slide Suggestions': 'اقتراحات الشرائح المرئية',
    'Suggested Icons & Images': 'الأيقونات والصور المقترحة',
    'Short Summary': 'ملخص قصير'
  },
  ur: {
    'Training Objectives': 'تربیتی مقاصد',
    'Importance of the Task': 'کام کی اہمیت',
    'Required Tools & Equipment': 'ضروری اوزار اور سامان',
    'Step-by-Step Workflow': 'مرحلہ وار ورک فلو',
    'Standard Operating Procedures': 'معیاری عملی طریقہ کار',
    'Safety Instructions': 'حفاظتی ہدایات',
    'Quality Standards': 'معیار کے اصول',
    'Common Mistakes': 'عام غلطیاں',
    'Troubleshooting Guide': 'مسئلہ حل گائیڈ',
    'Real-World Examples': 'حقیقی مثالیں',
    "Do & Don't": 'کریں اور نہ کریں',
    'Staff Productivity Tips': 'عملے کی پیداواری تجاویز',
    'Supervisor Monitoring Checklist': 'سپروائزر مانیٹرنگ چیک لسٹ',
    'Daily Checklist': 'روزانہ چیک لسٹ',
    'Quiz / Worker Questions': 'کوئز / ورکر سوالات',
    'KPI Metrics': 'KPI میٹرکس',
    'Visual Slide Suggestions': 'ویژول سلائیڈ تجاویز',
    'Suggested Icons & Images': 'تجویز کردہ آئیکنز اور تصاویر',
    'Short Summary': 'مختصر خلاصہ'
  },
  hi: {
    'Training Objectives': 'ट्रेनिंग उद्देश्य',
    'Importance of the Task': 'कार्य का महत्व',
    'Required Tools & Equipment': 'आवश्यक उपकरण',
    'Step-by-Step Workflow': 'स्टेप-बाय-स्टेप वर्कफ़्लो',
    'Standard Operating Procedures': 'मानक संचालन प्रक्रियाएं',
    'Safety Instructions': 'सुरक्षा निर्देश',
    'Quality Standards': 'गुणवत्ता मानक',
    'Common Mistakes': 'सामान्य गलतियाँ',
    'Troubleshooting Guide': 'समस्या समाधान गाइड',
    'Real-World Examples': 'वास्तविक उदाहरण',
    "Do & Don't": 'करें और न करें',
    'Staff Productivity Tips': 'स्टाफ उत्पादकता टिप्स',
    'Supervisor Monitoring Checklist': 'सुपरवाइजर मॉनिटरिंग चेकलिस्ट',
    'Daily Checklist': 'दैनिक चेकलिस्ट',
    'Quiz / Worker Questions': 'क्विज़ / कर्मचारी प्रश्न',
    'KPI Metrics': 'KPI मेट्रिक्स',
    'Visual Slide Suggestions': 'विजुअल स्लाइड सुझाव',
    'Suggested Icons & Images': 'सुझाए गए आइकन और इमेज',
    'Short Summary': 'संक्षिप्त सारांश'
  },
  tl: {
    'Training Objectives': 'Training Objectives',
    'Importance of the Task': 'Kahalagahan ng Task',
    'Required Tools & Equipment': 'Kailangang Tools at Equipment',
    'Step-by-Step Workflow': 'Step-by-Step Workflow',
    'Standard Operating Procedures': 'Standard Operating Procedures',
    'Safety Instructions': 'Safety Instructions',
    'Quality Standards': 'Quality Standards',
    'Common Mistakes': 'Common Mistakes',
    'Troubleshooting Guide': 'Troubleshooting Guide',
    'Real-World Examples': 'Real-World Examples',
    "Do & Don't": 'Gawin at Huwag Gawin',
    'Staff Productivity Tips': 'Staff Productivity Tips',
    'Supervisor Monitoring Checklist': 'Supervisor Monitoring Checklist',
    'Daily Checklist': 'Daily Checklist',
    'Quiz / Worker Questions': 'Quiz / Worker Questions',
    'KPI Metrics': 'KPI Metrics',
    'Visual Slide Suggestions': 'Visual Slide Suggestions',
    'Suggested Icons & Images': 'Suggested Icons at Images',
    'Short Summary': 'Short Summary'
  }
};

export const translateModuleTitle = (title: string, language: TrainingLanguage) =>
  moduleTitleTranslations[language]?.[title] ?? title;

export const translateHeading = (heading: string, language: TrainingLanguage) =>
  headingTranslations[language]?.[heading] ?? heading;

export const translationStorageKey = 'training-academy-translations';

export type TranslationOverride = {
  key: string;
  source: string;
  translations: Partial<Record<TrainingLanguage, string>>;
  reviewed?: boolean;
};

export const readTranslationOverrides = (): Record<string, TranslationOverride> => {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(translationStorageKey) || '{}');
  } catch {
    return {};
  }
};

export const writeTranslationOverrides = (overrides: Record<string, TranslationOverride>) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(translationStorageKey, JSON.stringify(overrides));
};

export const translateContent = (text: string, language: TrainingLanguage) => {
  if (language === 'en') return text;
  const overrides = readTranslationOverrides();
  const override = overrides[text]?.translations?.[language];
  if (override) return override;

  let translated = text;
  translated = translated.replace(/^### (.+)$/gm, (_, heading) => `### ${translateHeading(heading.trim(), language)}`);
  translated = translated.replace(/^## Module (\d+) - (.+)$/gm, (_, number, title) => `## Module ${number} - ${translateModuleTitle(title.trim(), language)}`);
  return translated;
};
