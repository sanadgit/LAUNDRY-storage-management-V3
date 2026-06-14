# ملف الأنماط والمكونات - Styles & Components
## Clothes Sorting System

---

## 📦 المكونات الرئيسية

### 1. Keyboard Component | مكون لوحة المفاتيح

**الموقع**: `client/src/pages/Home.tsx` (lines 470-600)

**الخصائص:**
- 5 صفوف من الأزرار
- الصف الأول: الحروف (Z, A, M, R, W)
- الصفوف 2-3: الأرقام (0-9)
- الصف الأخير: أزرار الإجراءات (حذف، مسح، بحث)

**الأزرار:**
```jsx
// الحروف
<motion.button className="key-btn">Z</motion.button>

// الأرقام
<motion.button className="key-btn">0</motion.button>

// أزرار الإجراءات
<motion.button className="key-btn-delete">حذف</motion.button>
<motion.button className="key-btn-special">مسح</motion.button>
<motion.button className="key-btn-enter">بحث</motion.button>
```

**الحركات:**
- `whileTap={{ scale: 0.93, y: 3 }}` - انضغاط عند الضغط
- Transition: 120ms cubic-bezier

---

### 2. Search Input | مكون حقل البحث

**الموقع**: `client/src/pages/Home.tsx` (lines 400-450)

**الخصائص:**
```jsx
<input
  type="text"
  placeholder="البحث برقم الطلب"
  value={searchInput}
  onChange={(e) => setSearchInput(e.target.value)}
  style={{
    borderColor: searchActive ? "oklch(0.42 0.18 255)" : "oklch(0.55 0.18 255 / 0.3)",
    boxShadow: searchActive ? "0 0 0 3px oklch(0.55 0.18 255 / 0.15)" : "none"
  }}
/>
```

**الحالات:**
- العادية: حد أزرق فاتح
- التركيز: حد أزرق داكن + ظل
- البحث النشط: حلقة نبض

---

### 3. Order Details Panel | لوحة تفاصيل الطلب

**الموقع**: `client/src/pages/Home.tsx` (lines 200-350)

**البنية:**
```jsx
<div className="flex-1 rounded-2xl p-6 shadow-lg" style={{ background: "oklch(1 0 0)" }}>
  {/* Header */}
  <div className="mb-6 pb-4 border-b">
    <h2>تفاصيل الطلب</h2>
    <p>رقم الطلب: {orderNumber}</p>
  </div>

  {/* Stats */}
  <div className="grid grid-cols-3 gap-4 mb-6">
    {/* إحصائيات */}
  </div>

  {/* Table */}
  <div className="overflow-x-auto mb-6">
    <table>
      {/* البيانات */}
    </table>
  </div>

  {/* Print Button */}
  <button className="print-btn w-full">طباعة</button>
</div>
```

---

### 4. Progress Indicator | مؤشر التقدم

**الموقع**: `client/src/pages/BlanketsSorting.tsx` (lines 320-380)

**الخصائص:**
```jsx
<div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
  <motion.div
    className="h-full bg-gradient-to-r from-blue-500 to-green-500"
    animate={{ width: `${progress}%` }}
    transition={{ duration: 0.5, ease: "easeOut" }}
  />
</div>
```

**الألوان:**
- الخلفية: رمادي فاتح
- التقدم: تدرج أزرق → أخضر
- النسبة: 0% - 100%

---

### 5. Status Badge | شارة الحالة

**الموقع**: `client/src/pages/Home.tsx` (lines 320-340)

**الأنواع:**
```jsx
// جاري المعالجة
<span className="status-badge status-processing">جاري</span>

// مكتمل
<span className="status-badge status-done">مكتمل</span>
```

**الأنماط:**
```css
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

### 6. Final Label Modal | نافذة الملصق النهائي

**الموقع**: `client/src/components/FinalPackagingLabel.tsx`

**الخصائص:**
```jsx
<AnimatePresence>
  {showFinalLabel && (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
      >
        {/* محتوى الملصق */}
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

---

## 🎨 أنماط CSS المخصصة

### Keyboard Styles | أنماط لوحة المفاتيح

```css
/* الزر الأساسي */
.key-btn {
  background: var(--key-bg);                    /* oklch(0.22 0.06 255) */
  color: var(--key-text);                       /* oklch(0.98 0 0) */
  border-radius: 0.6rem;
  font-weight: 700;
  font-size: 1.4rem;
  letter-spacing: 0.05em;
  box-shadow:
    0 4px 0 var(--key-shadow),                  /* oklch(0.15 0.05 255) */
    0 6px 12px rgba(0,0,0,0.25);
  transition: all 0.12s cubic-bezier(0.23, 1, 0.32, 1);
  border: 1px solid oklch(0.35 0.06 255);
  position: relative;
  user-select: none;
}

/* عند التمرير */
.key-btn:hover {
  background: var(--key-bg-hover);              /* oklch(0.3 0.08 255) */
  box-shadow:
    0 4px 0 var(--key-shadow),
    0 8px 20px rgba(0,0,0,0.3);
  transform: translateY(-1px);
}

/* عند الضغط */
.key-btn:active {
  transform: translateY(3px);
  box-shadow:
    0 1px 0 var(--key-shadow),
    0 2px 6px rgba(0,0,0,0.2);
}
```

### Button Variations | تنويعات الأزرار

```css
/* زر خاص (مسح) */
.key-btn-special {
  background: oklch(0.42 0.18 255);
  border-color: oklch(0.35 0.15 255);
  box-shadow:
    0 4px 0 oklch(0.28 0.14 255),
    0 6px 12px rgba(0,0,0,0.25);
}

.key-btn-special:hover {
  background: oklch(0.48 0.2 255);
}

/* زر حذف */
.key-btn-delete {
  background: oklch(0.52 0.2 25);
  border-color: oklch(0.42 0.18 25);
  box-shadow:
    0 4px 0 oklch(0.35 0.16 25),
    0 6px 12px rgba(0,0,0,0.25);
}

.key-btn-delete:hover {
  background: oklch(0.58 0.22 25);
}

/* زر البحث */
.key-btn-enter {
  background: var(--orange-accent);             /* oklch(0.7 0.18 45) */
  border-color: oklch(0.62 0.16 45);
  box-shadow:
    0 4px 0 oklch(0.55 0.16 45),
    0 6px 12px rgba(0,0,0,0.25);
}

.key-btn-enter:hover {
  background: var(--orange-accent-hover);      /* oklch(0.63 0.2 45) */
}
```

### Print Button | زر الطباعة

```css
.print-btn {
  background: linear-gradient(135deg, var(--orange-accent), oklch(0.65 0.2 35));
  color: white;
  font-weight: 700;
  border-radius: 0.75rem;
  box-shadow: 0 4px 15px oklch(0.7 0.18 45 / 0.4);
  transition: all 0.2s cubic-bezier(0.23, 1, 0.32, 1);
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.print-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px oklch(0.7 0.18 45 / 0.5);
}

.print-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px oklch(0.7 0.18 45 / 0.3);
}
```

---

## 🎬 الحركات المخصصة

### Animations | الحركات المعرّفة

```css
/* حلقة النبض للبحث النشط */
@keyframes pulse-ring {
  0% { box-shadow: 0 0 0 0 oklch(0.55 0.18 255 / 0.4); }
  70% { box-shadow: 0 0 0 8px oklch(0.55 0.18 255 / 0); }
  100% { box-shadow: 0 0 0 0 oklch(0.55 0.18 255 / 0); }
}

.search-active {
  animation: pulse-ring 1.5s ease-out infinite;
}

/* الانزلاق من اليمين */
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

.animate-slide-in-right {
  animation: slideInRight 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}

/* الانزلاق من اليسار */
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

.animate-slide-in-left {
  animation: slideInLeft 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}

/* الظهور من الأسفل */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in-up {
  animation: fadeInUp 0.25s cubic-bezier(0.23, 1, 0.32, 1);
}
```

### Framer Motion | حركات Framer Motion

```jsx
// ضغط المفتاح
<motion.button
  whileTap={{ scale: 0.93, y: 3 }}
  transition={{ duration: 0.12 }}
>
  Key
</motion.button>

// ظهور النافذة
<motion.div
  initial={{ scale: 0.95, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  exit={{ scale: 0.95, opacity: 0 }}
  transition={{ duration: 0.2 }}
>
  Content
</motion.div>

// تحديث التقدم
<motion.div
  animate={{ width: `${progress}%` }}
  transition={{ duration: 0.5, ease: "easeOut" }}
/>
```

---

## 📊 الجداول والقوائم

### Table Styling | نمط الجدول

```jsx
<table className="w-full">
  <thead>
    <tr className="bg-blue-50 border-b-2 border-blue-200">
      <th className="px-4 py-3 text-right font-bold text-blue-900">النوع</th>
      <th className="px-4 py-3 text-right font-bold text-blue-900">الحجم</th>
      <th className="px-4 py-3 text-right font-bold text-blue-900">اللون</th>
      <th className="px-4 py-3 text-right font-bold text-blue-900">الكمية</th>
    </tr>
  </thead>
  <tbody>
    {items.map((item, idx) => (
      <tr
        key={idx}
        className={`border-b ${
          idx % 2 === 0 ? "bg-white" : "bg-gray-50"
        } hover:bg-blue-50 transition-colors`}
      >
        <td className="px-4 py-3">{item.type}</td>
        <td className="px-4 py-3">{item.size}</td>
        <td className="px-4 py-3">{item.color}</td>
        <td className="px-4 py-3 font-bold">{item.quantity}</td>
      </tr>
    ))}
  </tbody>
</table>
```

---

## 🔄 حالات الاستجابة

### Responsive Classes | فئات الاستجابة

```jsx
{/* Desktop: عمودان */}
<div className="flex gap-6">
  {/* Search Panel: 40% */}
  <div className="w-2/5">...</div>
  
  {/* Details Panel: 60% */}
  <div className="w-3/5">...</div>
</div>

{/* Tablet: عمود واحد مع تعديلات */}
<div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
  ...
</div>

{/* Mobile: عمود واحد كامل */}
<div className="flex flex-col gap-4">
  ...
</div>
```

---

## 🎯 أفضل الممارسات

### 1. استخدام متغيرات CSS

```css
/* بدلاً من */
background: oklch(0.22 0.06 255);

/* استخدم */
background: var(--key-bg);
```

### 2. استخدام Tailwind Classes

```jsx
/* بدلاً من */
style={{ padding: "1.5rem", borderRadius: "1rem" }}

/* استخدم */
className="p-6 rounded-2xl"
```

### 3. استخدام Framer Motion للحركات

```jsx
/* بدلاً من */
style={{ transition: "all 0.3s" }}

/* استخدم */
<motion.div animate={{ x: 100 }} transition={{ duration: 0.3 }} />
```

### 4. الحفاظ على التناسق

- استخدم نفس الألوان في جميع الصفحات
- استخدم نفس المسافات والزوايا المستديرة
- استخدم نفس الخطوط والأحجام

---

## 📝 ملاحظات التطوير

### إضافة مكون جديد

1. أنشئ ملف جديد في `client/src/components/`
2. استخدم Tailwind classes للتنسيق
3. استخدم متغيرات CSS للألوان
4. أضف حركات Framer Motion إذا لزم الأمر
5. تأكد من التجاوب على جميع الأحجام

### تعديل الألوان

1. عدّل متغيرات CSS في `client/src/index.css`
2. استخدم OKLCH بدلاً من HEX
3. اختبر على خلفيات مختلفة
4. تأكد من التباين الكافي

### إضافة حركة جديدة

1. أضف `@keyframes` في `client/src/index.css`
2. أو استخدم Framer Motion مباشرة في المكون
3. اختبر على أجهزة مختلفة
4. تأكد من عدم تأثيرها على الأداء

---

**آخر تحديث**: 16 مايو 2026
**الإصدار**: 1.0
**الحالة**: جاهز للإنتاج ✅
