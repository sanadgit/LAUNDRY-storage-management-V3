export type SortingItemCategory = 'clothes' | 'home_phase2' | 'blanket_phase3';
export type ClothesPackingType = 'hanging' | 'folded';

const BLANKET_KEYWORDS = [
  'blanket',
  'duvet',
  'comforter',
  'quilt',
  'dofid',
  'doveid',
  'بطانية',
  'بطانيات',
  'دوفيد',
  'لحاف',
];

const HOME_PHASE2_KEYWORDS = [
  'sheet',
  'bedsheet',
  'bed sheet',
  'pillowcase',
  'pillow case',
  'curtain',
  'شرشف',
  'شراشف',
  'كيس مخدة',
  'اكياس مخدة',
  'ستارة',
  'ستائر',
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
  const normalized = value.trim().toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword));
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

export const detectClothesPackingType = (itemName: string): ClothesPackingType => {
  const normalized = itemName.trim().toLowerCase();
  if (HANGING_CLOTHES_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return 'hanging';
  }
  return 'folded';
};
