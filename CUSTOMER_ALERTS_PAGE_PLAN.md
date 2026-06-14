# خطة تنفيذ صفحة تنبيه العملاء (قبل التنفيذ)

## 1) الهدف
إنشاء صفحة داخل النظام مخصصة لتنبيه العملاء تلقائيًا باستخدام **أرقام الطلبات المخزنة داخل الخلايا/الاستور**، مع جلب تفاصيل كل طلب من نظام POS:
- رقم الطلب
- اسم العميل
- عدد القطع
- الإجمالي
- رقم جوال العميل (لإرسال واتساب)

ثم عرضها في قائمة عمليات مع:
- زر إرسال تنبيه لكل صف
- زر إرسال للكل
- محرر نماذج رسائل متعددة (تنبيه/خصومات/متابعة)

---

## 2) ما الموجود حاليًا ويمكن البناء عليه
- يوجد backend endpoint جاهز للبحث عن الطلبات في POS: `/api/pos/find-laundry-orders`
- يوجد backend endpoint جاهز لجلب تفاصيل الطلب: `/api/pos/order-details`
- يوجد parsing جاهز في السيرفر لحقول العميل والجوال والقطع والإجمالي.
- يوجد نظام صلاحيات + routing + صفحة React قابلة للإضافة بسهولة.
- يوجد تكامل AIPSoft حاليًا لرسائل OTP فقط؛ نحتاج مسار جديد للرسائل العامة (تنبيه العملاء).

---

## 3) تصور الصفحة (UI/UX)

### A) أعلى الصفحة (Control Bar)
- زر `تحديث القائمة` (إعادة سحب الأرقام من الاستور + تحديث بيانات POS).
- زر `إرسال للكل`.
- فلتر حالة الإرسال:
  - الكل
  - لم يُرسل
  - تم الإرسال
  - فشل
- فلتر المتجر/القسم (اختياري إذا عندنا أكثر من Store).
- إحصاءات سريعة:
  - إجمالي العملاء المستهدفين
  - المرسل بنجاح
  - الفاشل

### B) محرر الرسائل الذكي
- Dropdown لاختيار قالب:
  - تنبيه استلام الطلب
  - خصومات
  - متابعة نهائية
- Textarea للرسالة الحالية.
- دعم متغيرات ديناميكية (Placeholders):
  - `{{name}}`, `{{order_no}}`, `{{pieces}}`, `{{total}}`, `{{store}}`
- Preview مباشر للرسالة على عميل محدد قبل الإرسال.
- زر `حفظ كقالب`.

### C) جدول العملاء المستهدفين
كل صف يحتوي على:
- رقم الطلب
- اسم العميل
- الجوال
- الكمية (في الطلب من POS)
- الكمية (في الاستور)
- مطابق (Matched): `Yes/No`
- حالة المطابقة: `مكتمل/ناقص/زائد`
- الإجمالي
- حالة الإرسال الأخيرة + وقت آخر إرسال
- زر `إرسال واتساب`
- زر `معاينة الرسالة`
- زر `تحقق من الطلب`

### D) تحسينات ذكية إضافية
- منع التكرار: لا نرسل لنفس الطلب/العميل أكثر من مرة خلال فترة حماية (مثل 12 ساعة).
- ترتيب الأولوية: الطلبات الأقدم في المخزن أولًا.
- إرسال تجريبي (Dry Run) لرقم داخلي قبل حملة جماعية.
- Retry للفاشل (إعادة المحاولة فقط للفشل).

---

## 4) تدفق البيانات (Data Flow)
1. قراءة أرقام الطلبات من جدول التخزين (غالبًا `blankets.blanket_number` مع `status='stored'`).
2. إزالة التكرار + تنظيف القيم غير الصالحة.
3. لكل رقم طلب:
   - نبحث عبر `/api/pos/find-laundry-orders`
   - ثم نجلب التفاصيل عبر `/api/pos/order-details`
4. حساب المطابقة:
   - `qty_in_order` = إجمالي الكمية المطلوبة من POS.
   - `qty_in_store` = إجمالي القطع الموجودة في كل الـStores لنفس رقم الطلب.
   - إذا متساويان: `matched = yes` و`match_state = complete`.
   - إذا `qty_in_store < qty_in_order`: `matched = no` و`match_state = missing`.
   - إذا `qty_in_store > qty_in_order`: `matched = no` و`match_state = extra`.
5. تحويل البيانات إلى نموذج موحد للواجهة.
6. عند الإرسال:
   - بناء الرسالة من القالب + المتغيرات
   - إرسال واتساب عبر endpoint backend جديد
   - تسجيل النتيجة في سجل الإشعارات

---

## 5) التعديلات المطلوبة Backend

### A) API جديد لتجهيز قائمة التنبيه
- `GET /api/customer-alerts/candidates`
- يرجع قائمة المرشحين من أرقام الطلبات المخزنة + تفاصيل POS + نتيجة المطابقة.
- نموذج الحقول المقترح:
  - `order_no`
  - `customer_name`
  - `phone`
  - `qty_in_order`
  - `qty_in_store`
  - `matched` (`yes` | `no`)
  - `match_state` (`complete` | `missing` | `extra`)
  - `store_slots` (المواقع/الـcells عبر كل Stores)
  - `last_alert_status`

### B) API إرسال رسالة لعميل واحد
- `POST /api/customer-alerts/send-one`
- body:
  - `orderNo`
  - `phone`
  - `templateId` أو `message`
  - `context` (name/pieces/total...)

### C) API إرسال جماعي
- `POST /api/customer-alerts/send-bulk`
- يدعم:
  - `candidateIds[]` أو `orderNos[]`
  - `templateId`/`message`
  - `dryRun`
  - `retryFailedOnly`
  - `sendOnlyMatched` (افتراضي `true`)

### C.1) API تحقق من الطلب (Matching Check)
- `POST /api/customer-alerts/check-order`
- body:
  - `orderNo`
- يرجع:
  - `qty_in_order`
  - `qty_in_store`
  - `matched`
  - `match_state`
  - `store_slots`
  - `warnings[]` (مثل: قطعة ناقصة/زيادة)

### D) API إدارة القوالب
- `GET /api/customer-alerts/templates`
- `POST /api/customer-alerts/templates`
- `PUT /api/customer-alerts/templates/:id`
- `DELETE /api/customer-alerts/templates/:id`

### E) إرسال واتساب فعلي
- إضافة دالة جديدة مستقلة عن OTP داخل `server.ts` أو service module:
  - `sendWhatsAppNotification(phone, message)`
- دعم provider حسب `.env` (AIPSoft/أي مزود لاحقًا)
- Validation قوي للرقم
- Timeout + retry محدود + logging

---

## 6) التعديلات المطلوبة Database

### جداول جديدة مقترحة
1. `customer_alert_templates`
- `id`
- `name`
- `channel` (whatsapp)
- `body`
- `is_active`
- `created_by`
- `created_at`
- `updated_at`

2. `customer_alert_logs`
- `id`
- `order_no`
- `customer_name`
- `phone`
- `message_body`
- `template_id`
- `status` (sent/failed/skipped)
- `provider_response`
- `error_message`
- `sent_by`
- `sent_at`

3. `customer_alert_guard` (اختياري لمنع التكرار)
- `order_no`
- `phone`
- `last_sent_at`
- `last_status`

---

## 7) التعديلات المطلوبة Frontend

### صفحة جديدة
- ملف جديد مثل: `src/pages/CustomerAlerts.tsx`
- إضافة route جديدة: `/customer-alerts`
- إضافة عنصر Sidebar باسم `Customer Alerts` / `تنبيه العملاء`

### صلاحيات الوصول
- مبدئيًا: `super-admin`, `admin`, `manager`, `branch-manager`, `cashier`
- منع sorter/packer من الإرسال الجماعي (حسب السياسة التشغيلية)

### State Management
- استخدام local state أو hook منظم داخل الصفحة (بداية)
- وإذا الصفحة كبرت ننقل logic إلى store module مستقل

---

## 8) خطة التنفيذ المرحلية

### المرحلة 1: Foundation
- إنشاء جداول templates + logs.
- إنشاء API القوالب + المرشحين.
- إنشاء service موحد لجلب بيانات الطلبات من POS batch-by-batch.
- إضافة service مطابقة الكميات (`matching service`) وتجميع القطع من كل Stores.

### المرحلة 2: Messaging Core
- تنفيذ API `send-one` و`send-bulk`.
- دمج مزود واتساب الفعلي.
- إضافة guard لمنع التكرار + retry للفاشل.
- تطبيق قاعدة الأمان: منع الإرسال أو التسليم عندما `matched = no` (إلا بصلاحية override للمدير).

### المرحلة 3: UI Page
- بناء صفحة كاملة مع toolbar + editor + table + statuses.
- إضافة preview ديناميكي + progress أثناء الإرسال الجماعي.
- إضافة عمود `مطابق` + Badge حالة `مكتمل/ناقص/زائد`.
- إضافة زر `تحقق من الطلب` مع إبراز مواقع الطلب في المخزن (Highlight).

### المرحلة 4: Hardening
- rate-limit داخلي للإرسال الجماعي.
- تحسين error handling ورسائل عربية واضحة.
- اختبارات تكامل أساسية + سيناريو fallback.

### المرحلة 5: Rollout
- تفعيل تجريبي على فرع/بيئة اختبار.
- تشغيل dry-run على بيانات حقيقية.
- اعتماد نهائي بعد التحقق من معدل النجاح.

---

## 9) الاختبارات المطلوبة
- اختبار جلب المرشحين من الأرقام المخزنة.
- اختبار صف واحد: إرسال ناجح + فشل + رقم غير صالح.
- اختبار إرسال للكل مع 50+ طلب.
- اختبار منع التكرار ضمن النافذة الزمنية.
- اختبار القوالب والمتغيرات (عدم كسر الرسالة عند غياب حقل).
- اختبار matching:
  - `qty_in_order == qty_in_store` -> `مكتمل`.
  - `qty_in_order > qty_in_store` -> `ناقص`.
  - `qty_in_order < qty_in_store` -> `زائد`.
- اختبار منع التسليم عند عدم التطابق.
- اختبار Highlight لمواقع القطع عبر أكثر من Store.

---

## 10) المخاطر ونقاط الحسم قبل التنفيذ
1. هل كل `blanket_number` يمثل دائمًا `order_no` صالح في POS؟
2. هل مزود AIPSoft يسمح بإرسال WhatsApp نصي عام (غير OTP) من نفس الحساب؟
3. ما سياسة التكرار المعتمدة؟ (12 ساعة/24 ساعة/مرة واحدة يوميًا)
4. هل نحتاج دعم مرفقات لاحقًا (صورة عرض خصم/QR)؟

---

## 11) النسخة الأولى (MVP) المقترحة
- صفحة تعمل بالكامل على:
  - جلب المرشحين
  - قوالب أساسية (3 نماذج)
  - إرسال فردي + إرسال جماعي
  - سجل نتائج الإرسال
- بدون جدولة زمنية في أول نسخة.
- الجدولة + الأتمتة التلقائية تكون في V2.

---

## 12) إضافات V2 (بعد MVP)
- جدولة حملات تلقائية (مثلا يوميًا 8 مساءً).
- Trigger ذكي حسب عمر الطلب داخل المخزن.
- A/B test بين نماذج الرسائل لمعرفة الأفضل استجابة.
- Dashboard أداء التنبيهات (نسبة نجاح/فشل/تحويل).

---

## 13) نظام التحقق من الكمية (Matching System) - اعتماد رسمي
- هذا النظام جزء أساسي من الإصدار الأول وليس تحسينًا لاحقًا.
- لا يعتبر الطلب جاهزًا للتسليم إلا إذا:
  - `matched = yes`
  - `match_state = complete`
- رسائل الخطأ القياسية:
  - `ناقص`: "لا يمكن التسليم، توجد قطعة ناقصة."
  - `زائد`: "لا يمكن التسليم، توجد قطعة زائدة أو مكررة."
- اللون المقترح:
  - `مكتمل`: أخضر
  - `ناقص`: أحمر
  - `زائد`: أصفر

---

## 14) Store Scan & Order Verification (Incremental Patch)

### قاعدة تنفيذ إلزامية
- التنفيذ يكون **Incremental Patch** على النظام الحالي.
- ممنوع إعادة بناء النظام من الصفر.

### الهدف
- فحص كل البطاطين/القطع المخزنة.
- تجميعها حسب `order_number`.
- مطابقة الكميات مع بيانات POS قبل أي إرسال أو تسليم.

### 1) Scan Storage
- قراءة كل `blanket_number` بالحالة `stored`.
- تجميع السجلات حسب `order_number`.
- دمج التكرارات في مدخل واحد لكل طلب.

### 2) Aggregate Quantity
- حساب إجمالي القطع لكل طلب داخل المخزن.
- حفظ الناتج كحقل: `quantity_in_store`.

### 3) Fetch POS Data
- استخدام `order_number` لجلب:
  - `customer_name`
  - `total_quantity`
- حفظ الناتج كحقل: `quantity_in_order`.

### 4) Comparison Logic
- إذا `quantity_in_order == quantity_in_store` -> `matched = true`.
- إذا `quantity_in_store < quantity_in_order` -> `missing`.
- إذا `quantity_in_store > quantity_in_order` -> `extra`.

### 5) Table UI
- الأعمدة الأساسية:
  - `order_number`
  - `customer_name`
  - `quantity_in_order`
  - `quantity_in_store`
  - `matched`
  - `send_button`

### 6) Prevent Errors
- تعطيل الإرسال عندما `matched != true`.
- إظهار تحذيرات واضحة عند `missing` أو `extra`.

### 7) Optional (Phase 2)
- إضافة `View Locations`.
- Highlight لمواقع القطع في عرض 2D/3D.

### المخرجات المتوقعة
- Smart scanning system.
- Aggregated order view.
- Accurate quantity validation.
- Ready for delivery confirmation.

### معايير الجودة
- Reliability: نتائج متسقة حتى مع البيانات المتكررة أو غير المكتملة.
- Clarity: حالات مطابقة واضحة ومقروءة للمشغل.
- Real-world workflow: يمنع الأخطاء التشغيلية قبل التواصل مع العميل أو التسليم.
