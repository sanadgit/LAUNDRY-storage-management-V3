# تقرير فحص Aipsost API

تاريخ الفحص: 2026-05-23

## الخلاصة

نعم، داخل مجلد `Aipsost` توجد روابط `https/http` ونداءات API واضحة.

التطبيق المفكك يبدو أنه Android WebView: الواجهة الأساسية موجودة كملفات HTML/JS داخل `resources/assets`، والـ Java native دوره تشغيل WebView، الباركود، الطباعة، الموقع، وFirebase tracking. العمليات التجارية نفسها تتم عبر AJAX إلى API خارجي.

## الروابط الأساسية

- `https://connect.aipsoft.com`
  - موجود كـ `main_url` في `Aipsost/sources/com/aipsoft/aipsoftconnect/MainActivity.java`.

- `https://magnus.aipsoft.com/rc/remote_user`
  - endpoint أولي في `Aipsost/resources/assets/login.html` لاختيار/التحقق من الشركة والجهاز.

- `https://beta.aipsoft.com/rc/remote_user`
  - يستخدم إذا كان `beta_enabled = 1`.

- `https://magnus.aipsoft.com`
  - موجود في `Aipsost/resources/assets/packing/server.js`.

- `https://aipsoft-connect-default-rtdb.firebaseio.com/`
  - مستخدم في `TrackingService.java` لتتبع موقع التوصيل.

- التطبيق يسمح بـ HTTP أيضا:
  - `AndroidManifest.xml` يحتوي `android:usesCleartextTraffic="true"`.
  - `login.html` فيه أمثلة مثل `http://192.168...` و `http://localhost/...`.

## طريقة تسجيل الدخول

الملف: `Aipsost/resources/assets/login.html`

الخطوات الظاهرة:

1. يرسل بيانات مشفرة إلى:

```text
POST https://magnus.aipsoft.com/rc/remote_user
```

2. بعد اختيار/تأكيد الجهاز يأخذ `server_url`.

3. يدخل فعليا على POS/Connect عبر:

```text
POST {connectapiurl}/purchase_api/login_action
```

Payload ظاهر:

```text
username = api_user + "@" + company_id
password = api_pwd
device_id = device_id
```

الاستجابة تحفظ في `localStorage`:

- `api_url`
- `api_user_id`
- `client_identifier`
- `branch_id`
- `branch_code`
- `currency_id`
- `order_id`

## أهم endpoints الموجودة

### Packing API

أهم مسارات `packing_api`:

- `packing_api/searchOrder`
- `packing_api/getOrderDetails`
- `packing_api/getPackingData`
- `packing_api/findPackings`
- `packing_api/savePacking`
- `packing_api/deletePacking`
- `packing_api/resendNotification`
- `packing_api/searchjob`
- `packing_api/saveJobProcess`
- `packing_api/save_pickup`
- `packing_api/search_customers`
- `packing_api/get_shipping_addresses_by_customer`
- `packing_api/updatePickup`
- `packing_api/updatePickupLocation`

### POS API

أهم مسارات `pos_api`:

- `pos_api/getDeliveryData`
- `pos_api/fetchPendingDeliveries`
- `pos_api/findDeliveryOrderDetails`
- `pos_api/deliveryProcess`
- `pos_api/androidPrint`
- `pos_api/opencounterAction`
- `pos_api/closecounterAction`
- `pos_api/lastClosedCounterReport`
- `pos_api/rt_db_op_log`

### Purchase API

- `purchase_api/login_action`

## المسار الأقرب لتحديث remark

أقوى دليل موجود في:

`Aipsost/resources/assets/packing/js/packing.js`

الدالة:

```text
submitPacking()
```

ترسل:

```text
POST {api_url}/packing_api/savePacking
```

Payload المهم:

```text
client_identifier
order_id
branch_id
packing_date
packing_time
del_date
del_time
salesman
send_sms
send_whatsapp
final_packed_product_list
time_zone
user_id
full_packed
remark
packing_note
file_ids
```

هذا هو المرشح الأقوى لسلوك:

```text
Order -> Store -> update remark in POS
```

لأن الحقل `remark` يتم بناؤه من واجهة packing ثم يرسل مع `order_id`.

## كيف يتم البحث عن الطلب

في:

`Aipsost/resources/assets/packing/landing.html`

يوجد:

```text
POST {api_url}/packing_api/searchOrder
```

Payload:

```text
pre_char
main_txt
client_identifier
```

إذا رجع `order_id`، يحفظه في:

```text
localStorage.current_order_id
```

ثم يفتح صفحة `split.html`، وبعدها `savePacking` يستخدم هذا `order_id`.

## ملاحظات مهمة

- لم أجد endpoint صريح باسم مثل:
  - `updateRemark`
  - `updateOrderRemark`
  - `invoice_remark`
  - `remark1`
  - `remark2`

- لم أجد نصوص ثابتة مثل:
  - `STORE:`
  - `Store 300`
  - `Storage Location`

- لذلك لا يوجد دليل داخل الملفات أن التطبيق يملك API منفصل فقط لتحديث remark. الأقرب أنه يرسل الـ remark ضمن `packing_api/savePacking`.

## توصية الربط داخل مشروعنا

لإضافة نفس السلوك في backend الحالي:

1. البحث عن الطلب أو استخدام رقم الطلب الموجود لدينا.
2. استدعاء endpoint:

```text
POST {POS_CONNECT_API_URL}/packing_api/savePacking
```

3. إرسال `remark` بصيغة منظمة مثل:

```text
[STORE:300]
```

4. عدم مسح remark القديم إلا إذا تأكدنا أن `savePacking` يدمج الملاحظة ولا يستبدلها.

5. قبل التنفيذ النهائي نحتاج اختبار request حقيقي على طلب تجريبي، لأن `savePacking` قد يتطلب `final_packed_product_list` وليس فقط `order_id + remark`.

## نقطة الخطر

إذا كان هدفنا فقط تحديث remark بدون تنفيذ packing، فقد يكون `savePacking` غير مناسب إذا كان يغير حالة الطلب إلى packed. لذلك نحتاج اختبار واحد آمن:

- طلب تجريبي
- `remark = [STORE:300]`
- `final_packed_product_list = []` أو قائمة فعلية حسب قبول API
- مراقبة هل تغير فقط الـ remark أو تغيرت حالة packing أيضا

إذا تغيرت حالة packing، نحتاج نبحث عن endpoint backend غير ظاهر في التطبيق أو نطلبه من مزود POS.
