# خطة العملاء والطلبات

## الهدف

بناء وكيل خدمة عملاء يستطيع:

- البحث عن العميل بالهاتف أوالاسم أوCustomer ID.
- عرض الطلبات الحالية والسابقة.
- معرفة حالة كل طلب بدقة.
- إرسال إشعارات الاستلام والتجهيز والتسليم.
- متابعة الطلبات المتأخرة والعالقة.
- عرض المبلغ والمدفوع والمتبقي.
- استقبال الشكاوى وربطها بالطلب.
- اكتشاف العملاء VIP وغير النشطين.
- منع إرسال إشعار خاطئ عندما تكون حالة POS قديمة أوغير مغلقة.

---

## البيانات المؤكدة حاليًا

من `fetch_purchase_details` نستطيع قراءة:

```text
Customer ID
Customer Account ID
Customer Type ID
Customer Name
Mobile
Address
TRN
Order ID
Invoice ID
Order Number
Order Date / Time
Billing Date / Time
Delivery Date / Time
Delivery Type
Order Status
Paid Status
Total / Paid / Balance
Driver ID
Salesman ID
Products and Quantities
Payment Details
Logs
```

حالات الطلب المكتشفة:

```text
0 = Active / JOB Received
1 = Processing
2 = Completed
3 = Delivered
4 = Cancelled
5 = Partially Delivered
6 = Order Merged، في Sales Order
```

## حقل مرحلة الإنتاج داخل منتج POS

تم تأكيد أن حفظ الطلب يستخدم:

```text
POST /inout/sales/saveOrder
Content-Type: application/x-www-form-urlencoded
```

وأن كل منتج يملك حقلًا مستقلاً:

```text
final_product_list[final_sale_product_list][INDEX][other_description]
```

مثال مؤكد:

```text
final_product_list[final_sale_product_list][0][prdt_id] = 105
final_product_list[final_sale_product_list][0][other_description] = Job Received

final_product_list[final_sale_product_list][1][prdt_id] = 225
final_product_list[final_sale_product_list][1][other_description] = Job Received
```

هذا يسمح بعرض مرحلة الإنتاج بجانب كل منتج، مثل:

```text
Job Received
Sorting
Sorted
Packing
Packed
Quality Check
Approved
Sent to Branch
Received by Branch
```

لكن قاعدة بيانات Smart Hub تبقى المصدر الأساسي للحالة والتاريخ والمستخدم.
حقل POS يكون نسخة مختصرة للحالة الحالية، لأن `saveOrder` يرسل كامل بيانات
الطلب والمنتجات والأسعار والضريبة والدفع، وأي Payload ناقص أو خاطئ قد يعدل
الفاتورة ماليًا.

الطلب المؤكد احتوى أيضًا على:

```text
order_selected_details[order_number] = 227623
order_selected_details[branch_id] = 1
order_selected_details[driver_id] = 21
order_selected_details[triggered_action] = hold
operation = save
```

ويحتوي كل سطر منتج على:

```text
prdt_id
sale_unit_price
qty
sale_unit
sub_total
tax_amount
barcode
product_specific_taxes
other_description
others
cloth_id
```

لذلك لا يجوز إرسال تحديث `other_description` وحده قبل التأكد من طريقة تعديل
طلب موجود وإعادة إرسال جميع بياناته دون فقدانها.

### قراءة طلب موجود

تم تأكيد Endpoint فتح Sales Order:

```text
POST /inout/sales/findOrderDetails
```

Payload المؤكد:

```text
order_id=0
s_order_id=383197
mode=0
open_type=open
```

التمييز بين الأرقام مهم:

```text
s_order_id = 383197       # المعرّف الداخلي للطلب في POS
order_no = 260696         # رقم الطلب الظاهر للمستخدم
sales_invoice_id = null   # لم يتحول إلى Sales Invoice
sales_invoice_created = 0
```

كل عنصر داخل أول Array في Response يمثل سطر منتج، وليس طلبًا منفصلاً.
الحقول المؤكدة لكل سطر:

```text
each_sale_entry_id        # معرّف سطر المنتج
sale_prdt_id              # Product ID
barcode
sale_unit_id
sale_unit_price
sale_qty
sale_sub_total
sale_tax_amount
remark                    # قيمة other_description
others
cloth_id
delivered_qty
```

خريطة القراءة والحفظ:

```text
Response remark
    <=>
Save payload final_product_list[final_sale_product_list][INDEX][other_description]
```

مثال الطلب `383197`:

```text
Order No: 260696
Branch: 1
Customer ID: 54580
Customer: sanad

Line ID: 986943
Product ID: 105
Product: PANTS
Barcode: 6
remark: Job Received

Line ID: 986942
Product ID: 225
Product: Special Takeya
Barcode: 40
remark: Job Received
```

ويمكن للنظام استخدام `each_sale_entry_id` لربط حالة كل سطر منتج بسجل ثابت
داخل قاعدة بيانات Smart Hub، بدل الاعتماد على اسم المنتج وحده.

### نتيجة اختبار التعديل

تمت إعادة فتح الطلب بعد التعديل بنجاح، وأكد `findOrderDetails` أن
`other_description` يُحفظ ويعود في `remark`.

النتيجة:

```text
Sales Order ID: 383197
Order No: 260696

Line ID: 986943
Product: PANTS
Previous remark: Job Received
Current remark: shorting

Line ID: 986942
Product: Special Takeya
Previous remark: Job Received
Current remark: Sorting
```

ولم تتغير البيانات المالية:

```text
Total Amount: 15.00
VAT: 0.75
Grand Total: 15.75
Received: 0.00
Balance: 15.75
```

كما بقيت الكمية والسعر والضريبة لكل منتج دون تغيير. وأكد سجل POS أن التحديث
تم بواسطة المستخدم `sanad` بتاريخ `2026-06-14`.

هذا يثبت إمكانية تحديث مرحلة كل منتج داخل POS، لكن ظهور `shorting` بدل
`Sorting` يثبت ضرورة منع الكتابة الحرة من تطبيق التشغيل.

يجب أن يرسل التطبيق قيمًا ثابتة فقط:

```text
JOB_RECEIVED       -> Job Received
SORTING            -> Sorting
SORTED             -> Sorted
PACKING            -> Packing
PACKED             -> Packed
QUALITY_CHECK      -> Quality Check
QUALITY_REJECTED   -> Returned to Packing
QUALITY_APPROVED   -> Quality Approved
SENT_TO_BRANCH     -> Sent to Branch
RECEIVED_BY_BRANCH -> Received by Branch
READY_FOR_CUSTOMER -> Ready for Customer
```

وتحفظ قاعدة البيانات `status_code` الإنجليزي الثابت، بينما النص الظاهر في POS
يُنشأ من الخريطة ولا يُكتب يدويًا.

التقارير المؤكدة:

```text
Pending Orders (Not Delivered & Not Paid)
Unpaid Sales Invoices
Latest Sales Transactions
Sales Order Details
```

---

## قواعد مهمة

- لا يرسل إشعار `تم التسليم` اعتمادًا على موعد التسليم فقط.
- يجب أن تكون `order_status=3`.
- الطلب القديم غير المغلق يذهب لمراجعة الفرع.
- لا يطالب العميل بالدفع من تقرير Pending Orders وحده.
- فرق POS الصغير لا يرسل كتذكير دفع.
- أي تغيير حالة داخل POS يحتاج تحقق بعد الحفظ.

---

## المطلوب من POS

## 1. تحديث مرحلة الإنتاج داخل منتجات الطلب

هذه أهم خطوة.

تم اكتشاف أن POS لا يوفر اختيارًا مباشرًا لتحويل `JOB Received` إلى
`Processing`. سنستخدم Smart Hub لإدارة مراحل الإنتاج، ثم ننسخ المرحلة إلى
`other_description` لكل منتج.

الاختبار التالي المطلوب:

1. افتح الطلب التجريبي `227623` للتعديل.
2. غيّر `Other Description` لمنتج واحد فقط من:

```text
Job Received -> Sorting
```

من Network أرسل:

```text
Request URL
Request Method
Form Data أوRequest Payload
Response
```

يجب أن يكون الاختبار على طلب تجريبي فقط، مع عدم تغيير الكمية أوالسعر أوالضريبة
أوالدفع. بعد الحفظ أعد فتح الطلب وأرسل Response التفاصيل للتأكد أن
`other_description` تم حفظه ولم تتغير القيم المالية.

نحتاج معرفة:

```text
order_id الداخلي
order_number
triggered_action عند التعديل
operation عند التعديل
affected_action
affected_inv
sale_order_id
invoice_tbl_id
Response الحفظ
قيمة other_description بعد إعادة فتح الطلب
```

لا تستخدم طلب عميل حقيقي حساس إذا كان التغيير سيؤثر على التشغيل.

---

## 2. البحث عن العميل

من شاشة إنشاء طلب أوالعملاء:

1. ابحث برقم الهاتف.
2. ابحث بالاسم.
3. اختر العميل.

أرسل Requests وResponses.

نحتاج:

```text
Search Endpoint
Customer ID
Account ID
Name
Mobile
Address
Customer Type
Branch
Credit Terms
Current Balance
```

---

## 3. قائمة طلبات العميل

بعد فتح العميل، افتح Order History أوالطلبات السابقة وأرسل:

```text
Request URL
Form Data
Response
```

نحتاج:

```text
Current Orders
Completed Orders
Delivered Orders
Cancelled Orders
Invoice Numbers
Amounts and Balances
Dates
Branches
Drivers
```

---

## 4. تفاصيل مرحلة الإنتاج

نحتاج معرفة هل POS يخزن حالات منفصلة:

```text
Received
Washing
Ironing
Packing
Ready
Out for Delivery
Delivered
```

إذا كانت موجودة، غيّر مرحلة طلب تجريبي وأرسل طلب Network.

إذا كان POS يستخدم فقط `order_status`, فسنستخرج المراحل من نظام المخزن أو
نضيف جدول تتبع مستقل في Smart Hub.

---

## 5. تعيين السائق والتوصيل

افتح طلب Home Delivery وغيّر السائق في طلب تجريبي، ثم أرسل:

```text
Driver List Endpoint
Assign Driver Request
Response
Reopen Order Response
```

نحتاج:

```text
Driver ID
Driver Name
Order ID
Delivery Date / Time
Delivery Address
Assignment Status
```

---

## 6. بيانات التواصل

حدد القناة التي ستستخدم فعليًا:

```text
WhatsApp
Telegram
SMS
```

لكل إشعار يحفظ النظام:

```text
Customer ID
Order ID
Message Type
Destination
Sent At
Provider Message ID
Delivery Status
Failure Reason
```

ولا يرسل الرسالة نفسها مرتين لنفس الحالة.

---

## 7. الشكاوى

نحتاج معرفة هل توجد شاشة Complaints داخل POS. إن وجدت، افتح شكوى موجودة
وأرسل Requests.

إن لم توجد، تحفظ الشكاوى في Smart Hub:

```text
Complaint ID
Customer ID
Order ID
Category
Description
Priority
Assigned Branch
Assigned Employee
Status
Resolution
Created At
Closed At
```

---

## حالات الإشعارات

```text
order_received
processing_started
ready_for_pickup
out_for_delivery
delivered
payment_due
complaint_received
complaint_resolved
```

مثال:

```text
طلبك رقم 227080 تم استلامه في فرع AL FALAH.
حالة الطلب: قيد التجهيز.
موعد التسليم المتوقع: 10-06-2026 06:25 PM.
```

---

## Workflow المقترح

```text
Schedule / POS Event
-> Fetch Changed Orders
-> Create or Update Smart Hub Production Order
-> Sorter Login: Count and Sort Items
-> Packer Login: Pack Items
-> Inspector Login: Verify Required vs Packed Quantities
-> Approve or Return to Packing
-> Mark Sent to Branch
-> Store Full Production Event History
-> Optionally Sync Current Stage to POS other_description
-> Reopen Full Order Details
-> Compare Previous and Current Status
-> Validate Customer Mobile
-> Apply Notification Rules
-> Send WhatsApp/SMS
-> Store Message Result
-> Alert Branch on Delayed or Invalid Orders
```

---

## ترتيب جمع البيانات

1. تعديل `other_description` في طلب موجود وإعادة فتحه للتحقق.
2. البحث عن عميل برقم الهاتف.
3. قائمة طلبات العميل.
4. مراحل الإنتاج.
5. تعيين السائق.
6. الشكاوى.

تم تأكيد التعديل وإعادة الفتح على الطلب:

```text
POS Internal Sales Order ID: 383197
Visible Order Number: 260696
```

تم تنفيذ مزامنة مرحلة الفرز من Smart Hub إلى POS بنجاح:

```text
Production Stage: Sorting
POS Field: final_product_list[final_sale_product_list][i][other_description]
Read-back Field: remark
Updated Products:
- PANTS
- Special Takeya
```

نتيجة التحقق بعد إعادة فتح الطلب من POS:

```text
Total Amount: AED 15.00
VAT: AED 0.75
Grand Total: AED 15.75
Received: AED 0.00
Balance: AED 15.75
Other Description: Sorting
```

تجربة المزامنة الحالية مقيدة بالطلبات المفتوحة وغير المدفوعة، وتتحقق من أن
القيم المالية لم تتغير قبل اعتبار العملية ناجحة.
