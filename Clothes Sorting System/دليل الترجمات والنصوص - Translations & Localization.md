# دليل الترجمات والنصوص - Translations & Localization
## Clothes Sorting System

---

## 📋 نظرة عامة

النظام يدعم اللغتين:
- **العربية** (AR) - RTL (من اليمين إلى اليسار)
- **الإنجليزية** (EN) - LTR (من اليسار إلى اليمين)

يمكن تبديل اللغة من خلال زر اللغة في الرأس (AR/EN).

---

## 🌐 نظام الترجمات

### ملف الترجمات | Translations File

**الموقع**: `client/src/lib/translations.ts`

**البنية:**
```typescript
export const translations = {
  ar: {
    // النصوص العربية
    clothesSortingSystem: "نظام فرز الملابس",
    orderNumber: "رقم الطلب",
    // ...
  },
  en: {
    // النصوص الإنجليزية
    clothesSortingSystem: "Clothes Sorting System",
    orderNumber: "Order Number",
    // ...
  }
};
```

### استخدام الترجمات | Using Translations

```typescript
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";

export function MyComponent() {
  const { language } = useLanguage();
  
  return (
    <h1>{t("clothesSortingSystem", language)}</h1>
  );
}
```

---

## 📚 قائمة الترجمات الكاملة

### 1. الرأس والملاحة | Header & Navigation

| المفتاح | العربية | الإنجليزية |
|--------|--------|-----------|
| `clothesSortingSystem` | نظام فرز الملابس | Clothes Sorting System |
| `blanketsTitle` | محطة فرز وتعبئة البطانيات | Blankets Sorting & Packing |
| `ironingStationTitle` | محطة كوي الملابس | Ironing Station |
| `activeOrders` | طلبات نشطة | Active Orders |
| `activeBatches` | دفعات نشطة | Active Batches |
| `activeItems` | قطع نشطة | Active Items |
| `online` | متصل | Online |

### 2. الملاحة | Navigation

| المفتاح | العربية | الإنجليزية |
|--------|--------|-----------|
| `clothes` | الملابس | Clothes |
| `blankets` | البطانيات | Blankets |
| `ironing` | الكي | Ironing |

### 3. البحث والإدخال | Search & Input

| المفتاح | العربية | الإنجليزية |
|--------|--------|-----------|
| `searchByOrderNumber` | البحث برقم الطلب | Search by Order Number |
| `searchByStickerNumber` | ماسح الاستيكر | Sticker Scanner |
| `search` | بحث | Search |
| `clear` | مسح | Clear |
| `delete` | حذف | Delete |
| `notFound` | لم يتم العثور على | Not Found |

### 4. تفاصيل الطلب | Order Details

| المفتاح | العربية | الإنجليزية |
|--------|--------|-----------|
| `orderNumber` | رقم الطلب | Order Number |
| `clientNumber` | رقم العميل | Client Number |
| `orderDetails` | تفاصيل الطلب | Order Details |
| `itemDetails` | تفاصيل القطعة | Item Details |
| `pieces` | القطع | Pieces |
| `quantity` | الكمية | Quantity |
| `count` | العدد | Count |
| `total` | الإجمالي | Total |
| `size` | الحجم | Size |
| `color` | اللون | Color |
| `type` | النوع | Type |
| `weight` | الوزن | Weight |
| `date` | التاريخ | Date |

### 5. البطانيات | Blankets

| المفتاح | العربية | الإنجليزية |
|--------|--------|-----------|
| `batchNumber` | رقم الدفعة | Batch Number |
| `totalWeight` | الوزن الإجمالي | Total Weight |
| `packingProgress` | تقدم التعبئة | Packing Progress |
| `packed` | المعبأة | Packed |
| `remaining` | المتبقية | Remaining |
| `addOne` | إضافة واحدة | Add One |
| `subtractOne` | إنقاص واحدة | Subtract One |
| `updatePacking` | تحديث التعبئة | Update Packing |

### 6. الكي | Ironing

| المفتاح | العربية | الإنجليزية |
|--------|--------|-----------|
| `stickerScanner` | ماسح الاستيكر | Sticker Scanner |
| `ironingDetails` | تفاصيل القطعة | Item Details |
| `ironingProgress` | تقدم الكي | Ironing Progress |
| `ironed` | المكوية | Ironed |
| `recordIroned` | تسجيل قطعة مكوية | Record Ironed Item |
| `lastUpdate` | آخر تحديث | Last Update |

### 7. الحالات | Status

| المفتاح | العربية | الإنجليزية |
|--------|--------|-----------|
| `pending` | في الانتظار | Pending |
| `inProgress` | جاري | In Progress |
| `completed` | مكتمل | Completed |
| `ready` | جاهز | Ready |
| `urgent` | عاجل | Urgent |
| `readyForShipping` | جاهز للشحن | Ready for Shipping |

### 8. الطباعة | Printing

| المفتاح | العربية | الإنجليزية |
|--------|--------|-----------|
| `print` | طباعة | Print |
| `printOrder` | طباعة الطلب | Print Order |
| `printReport` | طباعة التقرير | Print Report |
| `printLabel` | طباعة الملصق | Print Label |
| `printing` | جاري الطباعة... | Printing... |

### 9. الملصق النهائي | Final Label

| المفتاح | العربية | الإنجليزية |
|--------|--------|-----------|
| `completedLabel` | مكتمل! | Completed! |
| `allItemsCompletedLabel` | تم إكمال جميع قطع الطلب بنجاح | All order items completed successfully |
| `readyForAssemblyLabel` | جاهز للتجميع والشحن | Ready for assembly and shipping |
| `printThisLabel` | اطبع هذا الملصق والصقه على الصندوق الخارجي | Print this label and stick it on the outer box |
| `closeLabel` | إغلاق | Close |

### 10. لوحة المفاتيح | Keyboard

| المفتاح | العربية | الإنجليزية |
|--------|--------|-----------|
| `keyboard` | لوحة المفاتيح | Keyboard |

### 11. التذييل | Footer

| المفتاح | العربية | الإنجليزية |
|--------|--------|-----------|
| `version` | الإصدار | Version |
| `systemVersion` | نظام فرز الملابس — الإصدار 1.0 | Clothes Sorting System — Version 1.0 |

### 12. الرسائل | Messages

| المفتاح | العربية | الإنجليزية |
|--------|--------|-----------|
| `noOrderSelected` | لا توجد قطعة محددة | No item selected |
| `searchForOrder` | ابحث برقم الطلب لعرض التفاصيل | Search by order number to view details |
| `searchForSticker` | ابحث برقم الاستيكر لعرض التفاصيل | Search by sticker number to view details |
| `examples` | أمثلة | Examples |

---

## 🔧 Context اللغة

### ملف Context | Language Context File

**الموقع**: `client/src/contexts/LanguageContext.tsx`

**الخصائص:**
```typescript
interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
```

### الاستخدام | Usage

```typescript
import { useLanguage } from "@/contexts/LanguageContext";

export function MyComponent() {
  const { language, toggleLanguage } = useLanguage();
  
  return (
    <button onClick={toggleLanguage}>
      {language === "ar" ? "EN" : "AR"}
    </button>
  );
}
```

---

## 🎛️ مكون تبديل اللغة

### ملف المكون | Component File

**الموقع**: `client/src/components/LanguageToggle.tsx`

**الخصائص:**
```typescript
export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();
  
  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-1 rounded-lg bg-blue-600 text-white font-bold"
    >
      {language === "ar" ? "EN" : "AR"}
    </button>
  );
}
```

**الموقع في الواجهة:**
- الرأس العلوي
- بجانب اسم النظام
- يعرض اللغة الحالية

---

## 🌍 دعم RTL/LTR

### HTML Setup | إعداد HTML

```html
<!-- العربية: RTL -->
<html lang="ar" dir="rtl">

<!-- الإنجليزية: LTR -->
<html lang="en" dir="ltr">
```

### CSS Adjustments | تعديلات CSS

```css
/* العربية */
[dir="rtl"] {
  direction: rtl;
  text-align: right;
}

/* الإنجليزية */
[dir="ltr"] {
  direction: ltr;
  text-align: left;
}
```

### Tailwind Classes | فئات Tailwind

```jsx
{/* النص يتكيف تلقائياً */}
<p className="text-right">النص العربي</p>
<p className="text-left">English Text</p>

{/* الهوامش والحشوة */}
<div className="mr-4">هامش يميني</div>
<div className="ml-4">هامش يساري</div>
```

---

## 📝 إضافة ترجمة جديدة

### الخطوات:

1. **افتح ملف الترجمات**
   ```bash
   client/src/lib/translations.ts
   ```

2. **أضف المفتاح والنصوص**
   ```typescript
   export const translations = {
     ar: {
       myNewKey: "النص العربي",
     },
     en: {
       myNewKey: "English Text",
     }
   };
   ```

3. **استخدم الترجمة في المكون**
   ```typescript
   const { language } = useLanguage();
   const text = t("myNewKey", language);
   ```

4. **اختبر على كلا اللغتين**

---

## 🔍 أمثلة الاستخدام

### مثال 1: عنوان بسيط

```typescript
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";

export function Header() {
  const { language } = useLanguage();
  
  return (
    <h1>{t("clothesSortingSystem", language)}</h1>
  );
}
```

### مثال 2: نص مع متغيرات

```typescript
export function OrderInfo({ orderId }) {
  const { language } = useLanguage();
  
  return (
    <p>
      {t("orderNumber", language)}: {orderId}
    </p>
  );
}
```

### مثال 3: قائمة مترجمة

```typescript
export function Navigation() {
  const { language } = useLanguage();
  
  const items = [
    { key: "clothes", label: t("clothes", language) },
    { key: "blankets", label: t("blankets", language) },
    { key: "ironing", label: t("ironing", language) },
  ];
  
  return (
    <nav>
      {items.map(item => (
        <a key={item.key}>{item.label}</a>
      ))}
    </nav>
  );
}
```

### مثال 4: تبديل اللغة

```typescript
export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();
  
  return (
    <button onClick={toggleLanguage}>
      {language === "ar" ? "EN" : "AR"}
    </button>
  );
}
```

---

## 💾 حفظ التفضيل

### localStorage | تخزين محلي

```typescript
// حفظ اللغة المختارة
localStorage.setItem("language", language);

// استرجاع اللغة المحفوظة
const savedLanguage = localStorage.getItem("language") || "ar";
```

### في LanguageContext:

```typescript
useEffect(() => {
  localStorage.setItem("language", language);
}, [language]);
```

---

## 🎯 أفضل الممارسات

### 1. استخدم مفاتيح واضحة

```typescript
// ✅ جيد
clothesSortingSystem: "نظام فرز الملابس"

// ❌ سيء
title: "نظام فرز الملابس"
```

### 2. حافظ على التناسق

```typescript
// ✅ جيد - نفس الترتيب
ar: { orderNumber: "رقم الطلب" },
en: { orderNumber: "Order Number" },

// ❌ سيء - ترتيب مختلف
ar: { orderNumber: "رقم الطلب" },
en: { orderNum: "Order Number" },
```

### 3. تجنب الترجمات المختلطة

```typescript
// ❌ سيء - مختلط
<h1>{t("orderNumber", language)} {orderId}</h1>

// ✅ جيد - منفصل
<h1>
  {t("orderNumber", language)}: {orderId}
</h1>
```

### 4. اختبر كلا اللغتين

- تحقق من الطول النصي
- تأكد من عدم تجاوز النص للحدود
- اختبر على أحجام شاشات مختلفة

---

## 📊 إحصائيات الترجمات

| الفئة | عدد المفاتيح |
|------|------------|
| الرأس والملاحة | 7 |
| الملاحة | 3 |
| البحث والإدخال | 6 |
| تفاصيل الطلب | 13 |
| البطانيات | 8 |
| الكي | 6 |
| الحالات | 6 |
| الطباعة | 5 |
| الملصق النهائي | 5 |
| لوحة المفاتيح | 1 |
| التذييل | 2 |
| الرسائل | 4 |
| **الإجمالي** | **66** |

---

## 🔗 الملفات ذات الصلة

- `client/src/lib/translations.ts` - ملف الترجمات الرئيسي
- `client/src/contexts/LanguageContext.tsx` - Context اللغة
- `client/src/components/LanguageToggle.tsx` - مكون تبديل اللغة
- `client/index.html` - إعداد HTML

---

## 📞 الدعم والمراجع

- **Google Translate API**: للترجمات الإضافية
- **i18n Libraries**: للمشاريع الأكبر
- **Locale Data**: للتواريخ والأرقام

---

**آخر تحديث**: 16 مايو 2026
**الإصدار**: 1.0
**عدد الترجمات**: 66 مفتاح
**الحالة**: جاهز للإنتاج ✅
