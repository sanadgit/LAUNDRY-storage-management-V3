# خطة إصلاح صفحة POS Connect

## الهدف

تجهيز صفحة **POS Connect** لتبحث مباشرة في نظام POS باستخدام:

- رقم الطلب.
- رقم هاتف الزبون.

ثم تعرض بيانات الطلب المطلوبة من مصدر POS نفسه:

- رقم الطلب.
- رقم هاتف الزبون.
- اسم الزبون.
- تاريخ الطلب.
- تاريخ التوصيل.
- عنوان الزبون.
- Remark.
- السعر.
- حالة الطلب، بالقيم المعتمدة:
  - Delivered
  - Fully Packed
  - Partially Packed
  - Pending
  - Pending/Unpaid

## حالة التنفيذ

تم تنفيذ الخطة الأساسية:

- إضافة endpoint موحد: `GET /api/pos/connect-order`.
- إصلاح `/api/pos/find-laundry-orders` ليقبل `q` و `search`.
- تحديث صفحة `src/pages/POSConnect.tsx` للبحث برقم الطلب أو رقم هاتف الزبون.
- عرض الحقول المطلوبة من POS بعد دمج بيانات البحث والتفاصيل.
- دعم حالة تعدد الطلبات عند البحث برقم هاتف.
- تحسين auto-refresh لجلسة POS بحيث يتحقق من endpoint البحث نفسه بدل صفحة `sales`.
- تعديل ترتيب بحث POS إلى عمود آمن لتجنب خطأ SQL في POS على `del_type`.
- جعل auto-refresh يبدأ بجلسة نظيفة بدل استخدام `POS_COOKIE` القديم من `.env`.
- إضافة محاولات بحث تلقائية لصيغ رقم الهاتف المختلفة.
- عرض صيغ البحث التي تم تجربتها عند عدم وجود نتيجة.
- إضافة fallback يسحب دفعات حديثة من POS ويطابق محليا إذا فشل البحث الدقيق في POS.
- تسريع fallback عبر دفعات أكبر، بحث متوازي، وكاش قصير لنتائج POS.
- تشغيل `npm run lint` بنجاح.

## نتيجة الفحص الحالي

### 1. الصفحة موجودة

الصفحة الحالية موجودة في:

`src/pages/POSConnect.tsx`

وهي مربوطة في التطبيق عبر:

`src/App.tsx`

المسار الحالي:

`/pos-connect`

### 2. خلل باراميتر البحث

صفحة `POSConnect.tsx` ترسل الطلب الحالي بهذا الشكل:

`params: { search: searchQuery }`

لكن endpoint في `server.ts` يقرأ:

`req.query.q`

لذلك البحث من صفحة POS Connect قد لا يصل للـ POS فعليا، لأن backend يتوقع `q` وليس `search`.

### 3. البيانات المعروضة حاليا ناقصة

الصفحة الحالية تستخدم فقط:

`GET /api/pos/find-laundry-orders`

وهذا يرجع `PosOrderPreview`.

الـ Preview يحتوي على بعض البيانات مثل رقم الطلب، الهاتف، الاسم، السعر، وبعض flags، لكنه لا يكفي لكل المطلوب، خصوصا:

- عنوان الزبون.
- تاريخ التوصيل الحقيقي.
- Remarks التفصيلية.
- حالة موحدة بالقيم الخمس المطلوبة.

### 4. يوجد endpoint لتفاصيل الطلب

يوجد endpoint جاهز في `server.ts`:

`GET /api/pos/order-details`

وهذا يجلب تفاصيل أوسع من POS عبر `fetchPosOrderDetails` و `parsePosOrderDetails`.

الحقول المهمة الموجودة هناك:

- `general.order_no`
- `general.customer_name`
- `general.customer_mobile`
- `general.customer_address`
- `general.delivery_date`
- `general.delivery_time`
- `general.billing_date`
- `general.grand_total`
- `general.balance`
- `general.invoice_remark1`
- `general.invoice_remark2`
- `general.status`

### 5. يوجد منطق جاهز لتطبيع حالة الطلب

في `server.ts` يوجد منطق جاهز ومناسب:

- `normalizePosStatusFlags`
- `normalizePosPaymentStatus`
- `normalizePosOrderStatus`
- `buildPosSortingMeta`

وهذا ينتج حالة من القيم:

- Delivered
- Fully Packed
- Partially Packed
- Pending
- Pending/Unpaid

الأفضل إعادة استخدام هذا المنطق بدل كتابة منطق جديد داخل الصفحة.

## خطة التنفيذ

### المرحلة 1: إصلاح البحث الأساسي

1. تعديل `POSConnect.tsx` ليستخدم:

   `params: { q: searchQuery }`

2. تعديل endpoint `/api/pos/find-laundry-orders` في `server.ts` ليقبل الاثنين للتوافق:

   `q` و `search`

3. تحديث رسالة الإدخال في الواجهة لتوضح أن البحث يدعم:

   - رقم الطلب.
   - رقم الهاتف.

### المرحلة 2: إنشاء response موحد للصفحة

إنشاء endpoint جديد أفضل للصفحة، مثلا:

`GET /api/pos/connect-order?q=...`

وظيفته:

1. يأخذ `q` أو `search`.
2. يستدعي `fetchPosOrderSearch(query)`.
3. يحدد أفضل نتيجة:
   - إذا المدخل يشبه رقم طلب، يفضل التطابق التام مع `order_no`.
   - إذا المدخل يشبه رقم هاتف، يطابق على أرقام الهاتف بعد إزالة المسافات والرموز.
   - إذا وجد أكثر من طلب لنفس رقم الهاتف، يرجع قائمة نتائج مختصرة للمستخدم ليختار.
4. بعد اختيار أفضل نتيجة، يستدعي `fetchPosOrderDetails` باستخدام:
   - `orders_id`
   - `invoice_id`
5. يبني كائن بيانات موحد للصفحة.

الشكل المقترح للـ response:

```ts
type PosConnectOrder = {
  order_no: string;
  customer_phone: string;
  customer_name: string;
  order_date: string;
  delivery_date: string;
  delivery_time: string;
  customer_address: string;
  remark: string;
  price: number;
  balance: number;
  order_status: 'Delivered' | 'Fully Packed' | 'Partially Packed' | 'Pending' | 'Pending/Unpaid';
  source_orders_id: string;
  source_invoice_id: string;
};
```

### المرحلة 3: ترتيب مصادر البيانات

عند دمج Preview و Details، تكون الأولوية كالتالي:

1. `order_no`
   - من `details.general.order_no`
   - fallback إلى `preview.order_no`

2. `customer_phone`
   - من `details.general.customer_mobile`
   - fallback إلى `preview.customer_phone`

3. `customer_name`
   - من `details.general.customer_name`
   - fallback إلى `preview.customer_name`

4. `order_date`
   - من `details.general.billing_date`
   - fallback إلى `preview.invoice_date`
   - fallback إلى `preview.created_at`

5. `delivery_date`
   - من `details.general.delivery_date`

6. `delivery_time`
   - من `details.general.delivery_time`

7. `customer_address`
   - من `details.general.customer_address`

8. `remark`
   - دمج `preview.notes`
   - مع `details.general.invoice_remark1`
   - مع `details.general.invoice_remark2`
   - بدون تكرار، باستخدام `joinPosRemarks`

9. `price`
   - من `details.general.grand_total`
   - fallback إلى `details.general.total_amount`
   - fallback إلى `preview.total`

10. `order_status`
    - من `buildPosSortingMeta(preview, details).pos_order_status`

### المرحلة 4: تعديل واجهة POS Connect

تحديث `src/pages/POSConnect.tsx` بحيث تصبح الصفحة مخصصة للبحث التشغيلي:

1. حقل بحث واحد بعنوان:

   `Search by Order Number or Customer Phone`

2. عند البحث:
   - تستدعي `/api/pos/connect-order`.
   - تعرض loading واضح.
   - تعرض أخطاء POS بوضوح.

3. إذا رجع أكثر من طلب لنفس الهاتف:
   - تعرض جدول نتائج مختصر:
     - رقم الطلب.
     - اسم الزبون.
     - الهاتف.
     - تاريخ الطلب.
     - السعر.
     - الحالة.
   - المستخدم يضغط على طلب لعرض التفاصيل الكاملة.

4. بطاقة التفاصيل الكاملة تعرض:
   - Order Number.
   - Customer Phone.
   - Customer Name.
   - Order Date.
   - Delivery Date + Time.
   - Customer Address.
   - Remark.
   - Price.
   - Order Status.

5. عرض حالة الطلب كبادج ملون:
   - Delivered: أخضر.
   - Fully Packed: أزرق.
   - Partially Packed: أصفر.
   - Pending: رمادي.
   - Pending/Unpaid: أحمر.

### المرحلة 5: التحقق من الاتصال بالـ POS

بعد التنفيذ:

1. تشغيل:

   `npm run lint`

2. تشغيل السيرفر محليا:

   `npm run dev`

3. تسجيل الدخول في النظام.

4. اختبار صفحة:

   `/pos-connect`

5. اختبار الحالات التالية:

   - البحث برقم طلب صحيح.
   - البحث برقم هاتف صحيح له طلب واحد.
   - البحث برقم هاتف له أكثر من طلب.
   - البحث بقيمة غير موجودة.
   - حالة POS session منتهية أو cookie غير صالح.

6. التأكد من أن البيانات المعروضة تأتي من POS وليست من جدول محلي.

## ملاحظات مهمة

- لا نحتاج حفظ البيانات في قاعدة بيانات التخزين لهذه الصفحة إذا كان الهدف هو الفحص والبحث فقط.
- إذا احتجنا لاحقا ربط POS Connect مع نظام الفرز، يمكن استخدام نفس endpoint الموحد لتعبئة `sorting_orders`.
- يجب عدم كشف أو طباعة قيمة `POS_COOKIE` في الواجهة أو logs الجديدة.
- يفضل إبقاء endpoint القديم `/api/pos/find-laundry-orders` كما هو للتوافق مع صفحات أخرى مثل `Sorting.tsx`.

## معايير القبول

تعتبر الصفحة جاهزة عندما:

- البحث برقم الطلب يعمل.
- البحث برقم هاتف الزبون يعمل.
- الصفحة تعرض الحقول المطلوبة كاملة.
- حالة الطلب تظهر فقط ضمن القيم الخمس المعتمدة.
- إذا كان رقم الهاتف يرجع أكثر من طلب، تظهر قائمة اختيار بدل عرض أول طلب عشوائيا.
- أخطاء POS session تظهر برسالة مفهومة للمستخدم.
- `npm run lint` ينجح بدون أخطاء TypeScript جديدة.
