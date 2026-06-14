# دليل التصميم - Clothes Sorting System
## Design Guide - نظام فرز الملابس

---

## 📋 نظرة عامة على التصميم

### Philosophy | الفلسفة
نظام فرز الملابس مبني على فلسفة **Clean Professional Blue** - تصميم احترافي نظيف يجمع بين:
- **الوضوح**: واجهة بسيطة وسهلة الاستخدام للعاملين
- **الكفاءة**: تصميم محسّن لسرعة الإدخال والبحث
- **الاحترافية**: مظهر عصري وموثوق

---

## 🎨 نظام الألوان

### Color Palette | لوحة الألوان

| الاسم | OKLCH | الاستخدام |
|------|-------|----------|
| **Primary Blue** | `oklch(0.42 0.18 255)` | الأزرار الرئيسية، الروابط |
| **Orange Accent** | `oklch(0.7 0.18 45)` | أزرار الإجراءات (بحث، طباعة) |
| **Green Success** | `oklch(0.62 0.18 145)` | حالة النجاح، المؤشرات الإيجابية |
| **Red Destructive** | `oklch(0.6 0.22 25)` | أزرار الحذف، التحذيرات |
| **Background Light** | `oklch(0.97 0.005 240)` | خلفية الصفحة الرئيسية |
| **Card White** | `oklch(1 0 0)` | خلفية البطاقات والمحتوى |
| **Dark Keyboard** | `oklch(0.22 0.06 255)` | خلفية لوحة المفاتيح |
| **Text Dark** | `oklch(0.18 0.02 255)` | النصوص الأساسية |
| **Text Light** | `oklch(0.95 0.005 240)` | النصوص على الخلفيات الداكنة |

### Color Usage | استخدام الألوان

**الأزرار:**
- البحث والإرسال: برتقالي (`--orange-accent`)
- الحذف والإلغاء: أحمر (`--destructive`)
- المسح والتعديل: أزرق (`--primary`)

**المؤشرات:**
- نجاح: أخضر (`--green-success`)
- جاري: أزرق (`--primary`)
- خطأ: أحمر (`--destructive`)

---

## 🔤 نظام الخطوط

### Font Stack | مكدس الخطوط

```css
Font Family: 'Cairo', 'Nunito', 'JetBrains Mono', sans-serif
```

| الخط | الاستخدام | الأوزان |
|-----|----------|--------|
| **Cairo** | النصوص العربية، العناوين | 400, 500, 600, 700, 800, 900 |
| **Nunito** | النصوص الإنجليزية، الأرقام | 400, 600, 700, 800, 900 |
| **JetBrains Mono** | الأرقام التسلسلية، الأكواد | 600, 700 |

### Typography Hierarchy | هرمية الخطوط

| المستوى | الحجم | الوزن | الاستخدام |
|--------|------|------|----------|
| **H1** | 2rem (32px) | 900 | عناوين الصفحات الرئيسية |
| **H2** | 1.5rem (24px) | 800 | عناوين الأقسام |
| **H3** | 1.25rem (20px) | 700 | عناوين فرعية |
| **Body** | 1rem (16px) | 400 | النصوص الأساسية |
| **Small** | 0.875rem (14px) | 500 | النصوص الثانوية |
| **Tiny** | 0.75rem (12px) | 600 | التسميات والملصقات |

---

## 🎯 مكونات التصميم

### 1. Keyboard Panel | لوحة المفاتيح

**الخصائص:**
- خلفية: `linear-gradient(145deg, oklch(0.2 0.05 255) 0%, oklch(0.25 0.07 255) 100%)`
- الحد: `1px solid oklch(0.3 0.06 255)`
- الظل: `0 8px 32px oklch(0.15 0.05 255 / 0.4)`
- الزوايا المستديرة: `2xl` (24px)

**مفاتيح:**
```css
.key-btn {
  background: oklch(0.22 0.06 255);
  color: oklch(0.98 0 0);
  border-radius: 0.6rem;
  font-weight: 700;
  box-shadow: 0 4px 0 oklch(0.15 0.05 255), 0 6px 12px rgba(0,0,0,0.25);
  transition: all 0.12s cubic-bezier(0.23, 1, 0.32, 1);
}

.key-btn:hover {
  background: oklch(0.3 0.08 255);
  transform: translateY(-1px);
}

.key-btn:active {
  transform: translateY(3px);
}
```

### 2. Order Details Panel | لوحة تفاصيل الطلب

**التخطيط:**
- عرض: 40% من الشاشة
- خلفية: بيضاء (`oklch(1 0 0)`)
- الحد: رمادي فاتح (`oklch(0.88 0.01 240)`)
- الزوايا المستديرة: `2xl` (24px)

**الأقسام:**
- الرأس: أزرق داكن مع نص أبيض
- الجدول: صفوف متناوبة بألوان فاتحة
- الأزرار: برتقالي للطباعة، أحمر للحذف

### 3. Search Input | حقل البحث

**الخصائص:**
- الارتفاع: 3.5rem (56px)
- الحد: `2px solid oklch(0.55 0.18 255)`
- الزوايا المستديرة: `lg` (12px)
- الخط: `Nunito` 1.1rem
- الحشوة: 1.5rem

**الحالات:**
- العادية: حد أزرق فاتح
- التركيز: حد أزرق داكن + ظل
- البحث النشط: حلقة نبض (`pulse-ring`)

### 4. Status Badges | شارات الحالة

```css
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-processing {
  background: oklch(0.55 0.18 255 / 0.12);
  color: oklch(0.42 0.18 255);
  border: 1px solid oklch(0.55 0.18 255 / 0.3);
}

.status-done {
  background: oklch(0.62 0.18 145 / 0.12);
  color: oklch(0.45 0.18 145);
  border: 1px solid oklch(0.62 0.18 145 / 0.3);
}
```

---

## ✨ الحركات والانتقالات

### Animations | الحركات

| الحركة | المدة | التأثير | الاستخدام |
|--------|------|--------|----------|
| **Slide In** | 300ms | `cubic-bezier(0.23, 1, 0.32, 1)` | ظهور البيانات |
| **Fade In** | 250ms | `cubic-bezier(0.23, 1, 0.32, 1)` | ظهور الرسائل |
| **Pulse** | 1500ms | ease-out | حلقة النبض للبحث النشط |
| **Key Press** | 120ms | `cubic-bezier(0.23, 1, 0.32, 1)` | ضغط المفاتيح |

### Easing Functions | دوال التسريع

```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);    /* سريع وسلس */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1); /* حركة طبيعية */
```

---

## 📐 نظام المسافات

### Spacing Scale | مقياس المسافات

```
4px   = 0.25rem
8px   = 0.5rem
12px  = 0.75rem
16px  = 1rem
20px  = 1.25rem
24px  = 1.5rem
32px  = 2rem
40px  = 2.5rem
48px  = 3rem
64px  = 4rem
```

### Padding & Margin | الحشوة والهوامش

| العنصر | الحشوة | الهامش |
|--------|-------|--------|
| **Card** | 1.5rem (24px) | 1rem (16px) |
| **Button** | 0.75rem (12px) 1.5rem (24px) | 0.5rem (8px) |
| **Input** | 1rem (16px) | 0.75rem (12px) |
| **Section** | 2rem (32px) | 1.5rem (24px) |

---

## 🔲 الحدود والزوايا المستديرة

### Border Radius | نصف قطر الحدود

| الحجم | القيمة | الاستخدام |
|------|--------|----------|
| **sm** | 0.375rem (6px) | العناصر الصغيرة |
| **md** | 0.5rem (8px) | الأزرار والمدخلات |
| **lg** | 0.75rem (12px) | البطاقات الصغيرة |
| **xl** | 1rem (16px) | البطاقات الكبيرة |
| **2xl** | 1.5rem (24px) | الأقسام الرئيسية |
| **full** | 9999px | الشارات والأيقونات |

### Borders | الحدود

```css
Border Color: oklch(0.88 0.01 240);     /* رمادي فاتح */
Border Width: 1px - 2px
```

---

## 🌓 الوضع الفاتح (Light Mode)

### الألوان الأساسية:
- الخلفية: `oklch(0.97 0.005 240)` - أبيض ناعم
- النص: `oklch(0.18 0.02 255)` - أزرق غامق جداً
- البطاقات: `oklch(1 0 0)` - أبيض نقي
- الحدود: `oklch(0.88 0.01 240)` - رمادي فاتح

---

## 📱 التجاوب (Responsive Design)

### Breakpoints | نقاط التوقف

```
Mobile:   < 640px
Tablet:   640px - 1024px
Desktop:  > 1024px
```

### Layout Adjustments | تعديلات التخطيط

**Mobile (< 640px):**
- عمود واحد
- لوحة المفاتيح بحجم كامل
- الأزرار بحجم أكبر للمس

**Tablet (640px - 1024px):**
- عمودان متوازنان
- لوحة المفاتيح مضغوطة قليلاً

**Desktop (> 1024px):**
- عمودان (40% - 60%)
- لوحة مفاتيح كاملة الحجم
- تخطيط محسّن

---

## 🎬 حالات الاستخدام

### Search State | حالة البحث

```
العادية → التركيز → البحث النشط → النتيجة
```

### Button States | حالات الأزرار

```
Default → Hover → Active → Disabled
```

### Loading State | حالة التحميل

- شريط تقدم: أزرق متحرك
- نص: "جاري البحث..."
- المؤشر: دوار

---

## 🖨️ طباعة (Print Styles)

### Print Button Style | نمط زر الطباعة

```css
.print-btn {
  background: linear-gradient(135deg, oklch(0.7 0.18 45), oklch(0.65 0.2 35));
  color: white;
  font-weight: 700;
  border-radius: 0.75rem;
  box-shadow: 0 4px 15px oklch(0.7 0.18 45 / 0.4);
}
```

### Label Design | تصميم الملصق

- الحجم: 4x6 بوصة (10x15 سم)
- الخط: Cairo Bold 24px للرقم
- الحدود: 1cm من جميع الجوانب
- الألوان: أزرق داكن على أبيض

---

## 🌐 دعم اللغات

### RTL/LTR Support | دعم الكتابة من اليمين لليسار

```html
<!-- العربية: RTL -->
<html lang="ar" dir="rtl">

<!-- الإنجليزية: LTR -->
<html lang="en" dir="ltr">
```

### Text Direction | اتجاه النص

- **العربية**: من اليمين إلى اليسار
- **الإنجليزية**: من اليسار إلى اليمين
- **الأرقام**: محايدة (نفس الاتجاه في كلا اللغتين)

---

## 📊 مقاييس الأداء

### Performance Targets | أهداف الأداء

- **Load Time**: < 2 ثانية
- **First Paint**: < 1 ثانية
- **Animation FPS**: 60 FPS
- **Keyboard Response**: < 100ms

---

## ♿ إمكانية الوصول (Accessibility)

### WCAG 2.1 Compliance | الامتثال

- **Contrast Ratio**: 4.5:1 على الأقل للنصوص
- **Focus Indicators**: حد واضح عند التركيز
- **Keyboard Navigation**: جميع العناصر قابلة للوصول عبر لوحة المفاتيح
- **Screen Reader**: دعم قارئات الشاشة

---

## 📝 ملاحظات التطوير

### CSS Variables | متغيرات CSS

```css
:root {
  --primary: oklch(0.42 0.18 255);
  --orange-accent: oklch(0.7 0.18 45);
  --green-success: oklch(0.62 0.18 145);
  --key-bg: oklch(0.22 0.06 255);
  --key-bg-hover: oklch(0.3 0.08 255);
  --key-text: oklch(0.98 0 0);
  --key-shadow: oklch(0.15 0.05 255);
}
```

### Best Practices | أفضل الممارسات

1. استخدم متغيرات CSS للألوان
2. استخدم OKLCH بدلاً من HEX للألوان الديناميكية
3. حافظ على التناسق في المسافات
4. اختبر على أحجام شاشات مختلفة
5. تأكد من سهولة الوصول للجميع

---

## 📞 الدعم والمراجع

- **Google Fonts**: Cairo, Nunito, JetBrains Mono
- **Color Space**: OKLCH (Oklab Color Space)
- **Framework**: Tailwind CSS 4 + shadcn/ui
- **Animations**: Framer Motion

---

**آخر تحديث**: 16 مايو 2026
**الإصدار**: 1.0
**الحالة**: جاهز للإنتاج ✅
