export type SortingItemCategory = 'clothes' | 'home_phase2' | 'blanket_phase3';
export type ClothesPackingType = 'hanging' | 'folded';

const BLANKET_KEYWORDS = [
  'blanket',
  'duvet',
  'duvet cover',
  'comforter',
  'comforter cover',
  'quilt',
  'bed cover',
  'bedcover',
  'dofid',
  'doveid',
  'dovet',
  'بطانية',
  'بطانيات',
  'بطاطين',
  'بطاينة',
  'بطاينات',
  'دوفيد',
  'لحاف',
  'مفرش',
  'مفارش',
];

const HOME_PHASE2_KEYWORDS = [
  'sheet',
  'bedsheet',
  'bed sheet',
  'flat sheet',
  'fitted sheet',
  'pillow',
  'pilow',
  'pillowcase',
  'pillow case',
  'pillow cover',
  'pillow bag',
  'pillow slip',
  'p/case',
  'p case',
  'curtain',
  'curtains',
  'drape',
  'drapes',
  'شرشف',
  'شراشف',
  'الشراشف',
  'ملاية',
  'ملايات',
  'ملايه',
  'ملاءة',
  'مخدة',
  'مخدات',
  'مخده',
  'مخد',
  'وسادة',
  'وساده',
  'وسادات',
  'غطاء الوسادة',
  'غطاء الوساده',
  'كفر مخدة',
  'كفر مخده',
  'كفرات مخدة',
  'كفرات مخده',
  'غلاف مخدة',
  'غلاف مخده',
  'تلبيسة مخدة',
  'تلبيسة مخده',
  'كيس مخدة',
  'كيس المخدة',
  'اكياس مخدة',
  'اكياس المخدة',
  'ستارة',
  'ستاره',
  'ستائر',
  'ستاير',
  'الستائر',
];

const HANGING_CLOTHES_KEYWORDS = [
  'shirt',
  'dress',
  'jacket',
  'coat',
  'thobe',
  'abaya',
  'suit',
  'blazer',
  'gown',
  'uniform',
  'قميص',
  'فستان',
  'جاكيت',
  'معطف',
  'ثوب',
  'عباية',
  'بدلة',
  'يونيفورم',
];

const normalizedIncludesAny = (value: string, keywords: string[]) => {
  const normalizeText = (input: string) =>
    input
      .trim()
      .toLowerCase()
      .replace(/[أإآ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .replace(/\s+/g, ' ');
  const normalized = normalizeText(value);
  return keywords.some((keyword) => normalized.includes(normalizeText(keyword)));
};

export const detectSortingItemCategory = (itemName: string): SortingItemCategory => {
  if (normalizedIncludesAny(itemName, BLANKET_KEYWORDS)) {
    return 'blanket_phase3';
  }
  if (normalizedIncludesAny(itemName, HOME_PHASE2_KEYWORDS)) {
    return 'home_phase2';
  }
  return 'clothes';
};

export const isBlanketPackingItem = (itemName: string) => {
  return normalizedIncludesAny(itemName, [...BLANKET_KEYWORDS, ...HOME_PHASE2_KEYWORDS]);
};

export const detectClothesPackingType = (itemName: string): ClothesPackingType => {
  const normalized = itemName.trim().toLowerCase();
  if (HANGING_CLOTHES_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return 'hanging';
  }
  return 'folded';
};
