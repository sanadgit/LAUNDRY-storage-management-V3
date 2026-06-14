# خطة الحسابات والذمم

## الهدف

بناء سجل مالي موثوق للعملاء والموردين يستطيع:

- معرفة رصيد كل عميل ومورد.
- فصل الفواتير الجديدة عن تحصيل ديون سابقة.
- عرض الفواتير المفتوحة والمدفوعة جزئيا والمتأخرة.
- حساب أعمار الديون: 0-30، 31-60، 61-90، وأكثر من 90 يوما.
- مطابقة Receipt مع الفاتورة والعميل وطريقة الدفع.
- إرسال تنبيهات التحصيل وكشوف الحساب.
- منع اعتبار فروق POS الصغيرة ذمما قابلة للتحصيل.

---

## البيانات المطلوبة من POS

## تقرير مؤكد: فواتير المبيعات غير المدفوعة

تم تأكيد تقرير:

```text
POST /reports/generate/unpaid_sales_invoices
```

صفحة التقرير:

```text
Unpaid Sales Invoices
```

### تعريف الأعمدة

```text
POST /reports/getTableColumns
report_name=unpaid_sales_invoices
```

الأعمدة المؤكدة:

```text
SI Id
Ord Id
Branch
Invoice#
Order#
Ref#
Billing Date / Time
Order Date / Time
Invoiced Staff
Ordered Staff
Salesman
Customer Mobile
Customer Name
Order Type
Gross Amount
Discount
VAT
Round Off
Vatable Amount
Net Sale Amount
Paid Amount
Balance
Payment Info
Payment
Remark
Status
Driver
```

### معادلات POS المؤكدة

```text
Net Sale Amount =
  Sales Invoice Grand Total
  أو Sales Order Grand Total عند عدم وجود Invoice

Paid Amount =
  Sales Invoice Received Amount
  أو Sales Order Received Amount

Balance =
  Grand Total - Received Amount
```

معلومات الدفع تؤخذ من `aip_payment_history` وتفصل:

```text
Advance Payment on Sales Order
Payment on Sales Invoice
Payment Method
Payment Amount
```

### الفلاتر المكتشفة

التقرير يدعم:

- الفترة، والافتراضي في المثال `Last Month`.
- الفرع، والافتراضي `all_branches`.
- Delivery Type.
- Payment Account بواسطة `PHIST.linked_account_id`.
- Driver بواسطة `SI.driver_id`.
- Pagination والبحث والترتيب عبر DataTables.

فلتر التاريخ متصل بـ:

```text
IF(
  SI.id IS NOT NULL,
  TIMESTAMP(SI.billing_date, SI.billing_time),
  TIMESTAMP(O.billing_date, O.billing_time)
)
```

### نتيجة المثال المؤكدة

```text
recordsFiltered: 844
Gross Amount: AED 158,797.02
VAT: AED 7,585.87
Net Sale Amount: AED 158,797.30
Paid Amount: AED 139,541.69
Balance: AED 19,255.61
```

الصفحة الأولى:

```text
Rows: 10
Net Sale: AED 689.97
Paid: AED 10.00
Balance: AED 679.97
```

وتحتوي مثال دفع جزئي:

```text
Invoice: 223704
Order: 252704
Net: AED 10.50
Paid with Credit Card: AED 10.00
Balance: AED 0.50
Status: Delivered
```

### معرفات الفاتورة

الرقم الظاهر `Invoice#` ليس المعرف الداخلي. روابط الصفوف تحتوي المعرف الداخلي:

```text
/sales_invoice/indr/317290/view
```

لذلك يحفظ النظام:

```text
sales_invoice_id = 317290
invoice_no = 223688
order_no = 254305
```

ولا يستخدم الرقم التسلسلي الظاهر في أول عمود كمعرف.

### هل هذا تقرير الذمم النهائي؟

هذا التقرير مصدر أساسي للرصيد المفتوح، لكنه ليس كشف الحساب النهائي؛ لأن Query
يستخدم Sales Order عندما لا توجد Sales Invoice:

```text
IF(SI.id IS NOT NULL, SI values, O values)
```

لذلك يصنف كل صف إلى:

```text
confirmed_unpaid_invoice
  عند وجود Sales Invoice ID ورابط Invoice

unpaid_sales_order
  عند عدم وجود Sales Invoice
```

كما يجب التمييز بين:

```text
حساب عميل آجل حقيقي
فاتورة Cash Customer نسي الكاشير تسجيل دفعها
فرق POS صغير بعد الإغلاق
فاتورة مسلمة ولم يدفع العميل فعلا
```

ملاحظة محاسبية: العملاء الذين عليهم مبالغ للمغسلة هم **مدينون للمغسلة**،
وتصنف أرصدتهم `Accounts Receivable` أوالذمم المدينة، حتى لو سُمّوا في الكلام
اليومي "الزبائن الدائنين".

### قواعد الاعتماد

لا ترسل مطالبة دفع تلقائية اعتمادًا على التقرير وحده. قبل اعتماد الرصيد:

1. افتح الفاتورة بواسطة `sales_invoice_id`.
2. طابق `grand_total`, `received_amount`, `balance` و`paid_status`.
3. افحص `journalSalesEntryData`.
4. افحص Payment History.
5. طابق Customer ID ونوع حساب العميل.
6. استبعد فرق POS الصغير وفق `POS_PAYMENT_RESIDUAL_TOLERANCE`.

الفاتورة `Delivered` ذات الرصيد تدخل قائمة المراجعة المالية، بينما الفاتورة
القديمة الخاصة بـCash Customer تحتاج تأكيد مدير الفرع قبل التواصل مع العميل.

### حالة مؤكدة: فرق POS بعد الدفع بالبطاقة

تم فتح العملية:

```text
POST /transaction/fetch_purchase_details
purchase_id=322647
hold=0
type=0
mode=SALES
```

البيانات المؤكدة:

```text
Invoice: Z49202
Transaction ID: 322647
Order ID: 381726
Branch: MBZ / 2
Customer: KAT LITTLE NAS / 64659
Customer Account: 64738
Status: Delivered
Grand Total: AED 30.10
Received: AED 30.03
Displayed Balance: AED 0.07
Paid Status: Partially Paid / 1
```

تفاصيل الدفع:

```text
Payment ID: 381214
Method: Credit-Card
Linked Account: Credit Card / 33777
Card: Visa
Transaction No: 1783991
Amount: AED 30.03
Status: Active / 1
```

سجل POS يوضح أن الطلب كان:

```text
Original Grand Total: AED 30.03
Original VAT: AED 1.365
```

ثم عند المعالجة أصبح:

```text
Final Grand Total: AED 30.10
Final VAT: AED 1.43325
```

وبذلك نشأ فرق `AED 0.07` بعد الدفع، وليس بسبب عدم دفع العميل.

القيد المؤكد:

```text
Credit VAT on Sales       1.43325
Credit Sales Account     28.66000
Debit  Customer          30.10000
Debit  Credit Card       30.03000
Credit Customer          30.03000
```

فرق توازن القيد أقل من `AED 0.01` بسبب دقة الكسور. التصنيف الصحيح:

```text
status = paid_with_pos_residual
balance_amount = 0.07
pos_residual_amount = 0.07
collectible_balance_amount = 0.00
payment_method = Credit Card
```

لا يرسل النظام مطالبة دفع للعميل، ولا يضيف `AED 0.07` إلى الذمم القابلة
للتحصيل. يظهر الفرق فقط في تقرير أخطاء POS للمراجعة التقنية.

### حالة مؤكدة: رصيد مسجل يحتاج مراجعة الفرع

تم فتح العملية:

```text
POST /transaction/fetch_purchase_details
purchase_id=322679
hold=0
type=0
mode=SALES
```

البيانات:

```text
Invoice: 227051
Transaction ID: 322679
Order ID: 380901
Branch: AL FALAH / 1
Customer: ABDU / 24067
Customer Account: 25076
Mobile: 0566137573
Status: Delivered
Grand Total: AED 12.60
Paid: AED 10.30
Balance: AED 2.30
Paid Status: Partially Paid / 1
```

المدفوعات المسجلة:

```text
Credit Card: AED 6.30
Payment ID: 381249
Account ID: 33777

Cash: AED 4.00
Payment ID: 381250
Account ID: 1

Total Payments: AED 10.30
```

المعادلة مطابقة تمامًا:

```text
AED 12.60 - AED 10.30 = AED 2.30
```

والقيد المحاسبي متوازن:

```text
Credit Sales Account     12.00
Credit VAT on Sales       0.60
Debit  Customer          12.60

Debit  Credit Card        6.30
Credit Customer           6.30

Debit  Cash Account       4.00
Credit Customer           4.00

Total Debit = Total Credit = AED 22.90
```

إذن `AED 2.30` ليس فرق تقريب ولاPOS residual. هو رصيد مفتوح حقيقي داخل
دفاتر POS.

لكن لا يرسل النظام مطالبة تلقائية بعد، للأسباب التالية:

- بيانات العملية تشير إلى استخدام حساب Cash.
- قد يكون الكاشير استلم الباقي ولم يسجله.
- `delivery_date=2026-06-04` أقدم من `order_date=2026-06-08`.
- سجل Logs يبدأ من `2026-06-02`، ما يشير إلى تحويل أوتعديل في التواريخ.
- الفاتورة Delivered ولا يوجد Driver مسجل.

التصنيف:

```text
status = branch_confirmation_required
balance_amount = 2.30
pos_residual_amount = 0.00
collectible_balance_amount = 0.00 مؤقتًا
review_reason = delivered_cash_customer_with_unpaid_balance
```

يسأل وكيل الحسابات مدير الفرع:

```text
فاتورة 227051 للعميل ABDU مسلمة وباقي عليها AED 2.30.
هل تم استلام المبلغ ولم يسجل، أم أن المبلغ مستحق على العميل؟

[تم الدفع ولم يسجل] [المبلغ مستحق] [لم تسلم فعليًا] [فتح الفاتورة]
```

بعد اختيار `المبلغ مستحق` يصبح:

```text
status = confirmed_receivable
collectible_balance_amount = 2.30
```

أما `تم الدفع ولم يسجل` فينشئ مهمة لتصحيح الدفع داخل POS بعد موافقة المدير.

### حالة حدية مؤكدة: الرصيد الصغير ليس دائمًا POS residual

تم فتح العملية:

```text
POST /transaction/fetch_purchase_details
purchase_id=322737
hold=0
type=0
mode=SALES
```

البيانات:

```text
Invoice: 227098
Transaction ID: 322737
Order ID: 382127
Branch: AL FALAH / 1
Customer ID: 67292
Customer Name: فارغ
Customer Account: 67394
Status: Delivered
Grand Total: AED 10.50
Cash Paid: AED 10.00
Balance: AED 0.50
```

القيد متوازن:

```text
Credit Sales Account     10.00
Credit VAT on Sales       0.50
Debit  Customer          10.50
Debit  Cash Account      10.00
Credit Customer          10.00

Total Debit = Total Credit = AED 20.50
```

سجل POS يحتوي `grand_total=10.50` فقط، ولا يحتوي إجماليًا سابقًا بقيمة
`AED 10.00`. لذلك الرصيد ليس ناتجًا عن إعادة حساب POS.

التصنيف:

```text
status = branch_confirmation_required
balance_amount = 0.50
pos_residual_amount = 0.00
branch_review_balance_amount = 0.50
collectible_balance_amount = 0.00 مؤقتًا
```

قاعدة `POS_PAYMENT_RESIDUAL_TOLERANCE` أصبحت حدًا أعلى فقط، وليست دليلًا
كافيًا. يجب أيضًا أن يثبت Logs أن مبلغ الدفع يساوي Grand Total سابقًا، وأن
الإجمالي ارتفع بعد تسجيل الدفع.

### حالة مؤكدة: فاتورة غير مدفوعة بالكامل

تم فتح العملية:

```text
POST /transaction/fetch_purchase_details
purchase_id=322716
hold=0
type=0
mode=SALES
```

النتيجة:

```text
Invoice: 227080
Transaction ID: 322716
Order ID: 381638
Branch: AL FALAH / 1
Customer: k LITTLE nas / 49022
Customer Account: 49009
Customer Type ID: 76
Mobile: 0569990131
Status: Delivered
Gross: AED 82.00
VAT: AED 4.10
Grand Total: AED 86.10
Paid: AED 0.00
Balance: AED 86.10
Payment Details: لا توجد
```

القيد المحاسبي:

```text
Credit Sales Account     82.00
Credit VAT on Sales       4.10
Debit  Customer          86.10

Total Debit = Total Credit = AED 86.10
```

هذه ذمة كاملة ومؤكدة داخل POS:

```text
payment_status = unpaid
balance_amount = 86.10
pos_residual_amount = 0.00
branch_review_balance_amount = 0.00
collectible_balance_amount = 86.10
```

لا يوجد دفع منسي ظاهر أوفرق إعادة حساب. لكن قبل إرسال مطالبة آلية للعميل
نحتاج تأكيد معنى `customer_type_id=76` من بيانات حساب العميل، لأن تفاصيل
الفاتورة لا تعيد اسم نوع الحساب أوشروط الائتمان أوتاريخ الاستحقاق.

---

## تقرير مؤكد: الطلبات غير المسلمة وغير المدفوعة

تم تأكيد التقرير:

```text
POST /reports/generate/pending_orders_notpaid
```

واسم التقرير الديناميكي:

```text
pending_orders_notpaid
Pending Orders (Not Delivered & Not Paid)
```

### تعريف أعمدة التقرير

```text
POST /reports/getTableColumns
report_name=pending_orders_notpaid
```

الأعمدة المؤكدة:

```text
Order ID
Branch
Order No
Invoice No
Order Date
Billing Date
Delivery Date
Delivery Type
Mobile
Customer Name
Customer Type
Remark
Total
Paid
Balance
Sales man
Driver
Paid Status
Order Status
JOB Type
Payments Done
```

### جلب البيانات

```text
POST /reports/generate_report
report_type=dynamic_report
report_name=pending_orders_notpaid
```

يدعم الطلب:

- Pagination بواسطة `start` و`length`.
- البحث بواسطة `search[value]`.
- ترتيب الأعمدة.
- الفترة الزمنية.
- الفرع.
- Delivery Type.
- Job Type.
- Customer Type.
- Payment Account.
- Customer ID.
- Salesman.
- Driver.

فلتر العميل المؤكد:

```text
Customer: 1E 475
Mobile: 0509473800
Customer ID: 65460
connected_to=head.id
```

### نتيجة المثال

```text
recordsFiltered: 20
Report Total: AED 1,058.88
Paid: AED 0.00
Balance: AED 1,058.88
First Page Rows: 10
First Page Balance: AED 507.13
Branch: AL FALAH
Paid Status: Not paid
Order Status: JOB Received
```

بعض الطلبات لها `Invoice No` وبعضها لم تتحول بعد إلى فاتورة.

### التصنيف المالي الصحيح

هذا التقرير ليس كشف حساب محاسبيًا كاملاً، بل تقرير تشغيلي للطلبات التي تحقق
شرطين معًا:

```text
Not Delivered
Not Paid
```

لذلك تحفظ مبالغه في:

```text
operational_pending_balance
```

ولا تضاف مباشرة إلى:

```text
accounts_receivable
```

إلا بعد التأكد أن الطلب أنشأ Sales Invoice أوظهر كمدين في كشف حساب العميل.
هذا يمنع حساب الطلب نفسه مرتين: مرة من الطلب ومرة من الفاتورة.

### الطلبات القديمة غير المغلقة

أحيانًا يكون طلب `Home Delivery` قد تم تسليمه فعليًا، لكن الكاشير نسي:

- تنفيذ Delivery داخل POS.
- إغلاق الطلب.
- تسجيل الدفع.
- تحويل الطلب إلى Sales Invoice.

لذلك لا يصنف النظام الطلب القديم تلقائيًا كذمة مؤكدة أو سرقة أو مبلغ مطلوب
من العميل. يصنف أولًا:

```text
stale_operational_order
```

ويظهر كحالة تحتاج مراجعة الفرع.

#### قواعد التنبيه المقترحة

```text
بعد موعد التسليم بـ24 ساعة: تنبيه متابعة
بعد موعد التسليم بـ3 أيام: طلب تأكيد من مدير الفرع
بعد 7 أيام: طلب قديم عالي الأولوية
بعد 30 يومًا: استثناء مالي وتشغيلي حرج
```

تكون أولوية المراجعة أعلى عندما:

- Delivery Type يساوي `Home Delivery`.
- يوجد Driver مسجل.
- تاريخ التسليم مضى منذ عدة أيام.
- الطلب ما زال `JOB Received` أو`Processing`.
- Paid يساوي صفرًا.
- لا يوجد Invoice No.
- توجد طلبات قديمة متعددة للعميل نفسه.

#### إجراء مدير الفرع

يرسل Telegram لكل طلب قديم أزرار:

```text
[تم التسليم والدفع] [تم التسليم ولم يدفع]
[لم يتم التسليم] [طلب ملغي] [فتح التفاصيل]
```

الاختيار لا يغيّر POS مباشرة في المرحلة الأولى، بل يسجل نتيجة المراجعة:

| الاختيار | التصنيف |
|---|---|
| تم التسليم والدفع | يحتاج تسجيل الدفع وإغلاق الطلب |
| تم التسليم ولم يدفع | ذمة محتملة تحتاج مطابقة كشف العميل |
| لم يتم التسليم | طلب تشغيلي مفتوح |
| طلب ملغي | يحتاج إلغاء رسمي ومراجعة السبب |

بعد التأكد من Endpoint التعديل، يمكن تنفيذ الإغلاق أوالدفع في POS فقط بعد
موافقة مدير الفرع، مع حفظ اسم الموافق والوقت والقيم قبل وبعد.

### ملاحظات تنفيذية

- `recordsFiltered=20` بينما Response الحالي يحتوي أول 10 صفوف فقط؛ يجب قراءة
  جميع الصفحات بواسطة `start=0,10,...`.
- `summable_column.Balance` هو إجمالي التقرير الكامل، وليس مجموع الصفحة فقط.
- فترة `All` أرسلت تاريخ بداية `1776-06-14`؛ لا يعتمد Workflow هذا التاريخ
  كتاريخ عمل، بل يحتفظ به كقيمة فلتر مولدة من POS.
- يجب حفظ `Order No` و`Invoice No` كنص.
- عمود `Order ID` في المثال ظهر كقيم `1..10`. يجب التحقق هل هو معرف حقيقي أم
  ترقيم صف قبل استخدامه لفتح الطلب.
- لا ترسل مطالبة دفع للعميل اعتمادًا على هذا التقرير وحده.
- يجب مطابقة الطلب مع فاتورة المبيعات، سجل الدفع، كشف العميل وحالة التوصيل.
- يحتفظ النظام بتاريخ أول ظهور للطلب في التقرير، حتى يميز الطلب الجديد عن
  الطلب الذي بقي عالقًا عدة أيام.

---

### 1. كشف حساب عميل عليه رصيد

اختر عميلا لديه فاتورة غير مدفوعة، وافتح كشف حسابه لفترة تشمل الفاتورة.

من Network أرسل:

```text
Request URL
Request Method
Form Data أو Request Payload
Response كاملة
```

يجب أن تظهر في Response، إن كانت متاحة:

```text
Customer ID
Customer Name
Mobile
Opening Balance
Invoice Number
Invoice Date
Due Date
Debit
Credit
Running Balance
Outstanding Balance
Branch
Transaction ID
Transaction Type
```

### 2. تفاصيل فاتورة آجلة

افتح فاتورة داخل كشف الحساب ما زال عليها رصيد، وأرسل طلب التفاصيل وResponse.

نحتاج مطابقة:

```text
Customer ID
Sales Transaction ID
Invoice Number
Invoice Total
Paid Amount
Balance
Paid Status
Payment Details
Due Date
```

### 3. تحصيل مبلغ من فاتورة قديمة

على فاتورة اختبارية، سجل Receipt صغيرا أو افتح Receipt موجودا مسبقا.

أرسل طلب الحفظ أو العرض:

```text
Request URL
Request Method
Form Data أو Request Payload
Response
```

الحقول المهمة:

```text
Receipt ID / Voucher
Customer ID
Invoice ID
Amount
Payment Method
Cash / Card / Bank Account ID
Reference Number
Receipt Date
Branch ID
Paid By / Created By
Remaining Balance
```

يفضل في البداية إرسال Receipt موجود دون إنشاء عملية جديدة. لن نفعّل الكتابة
من n8n قبل التأكد من جميع الحقول وإضافة موافقة بشرية.

### 4. القيد المحاسبي للتحصيل

بعد فتح Receipt، ابحث في Network عن طلب Journal أوLedger وأرسل Response.

القيد المتوقع:

```text
Debit  Cash / Credit Card / Bank
Credit Customer Account
```

يجب أن يكون:

```text
Total Debit = Total Credit = Receipt Amount
```

### 5. قائمة العملاء وأرصدتهم

افتح شاشة العملاء أو Debtors أوReceivables، ثم أرسل:

```text
طلب قائمة العملاء
Form Data مع Pagination
Response لصفحة واحدة
طلب البحث باسم عميل
طلب فلتر الفرع
```

نحتاج معرفة هل الرصيد يأتي من القائمة مباشرة أم يحتاج طلبا مستقلا لكل عميل.

### 6. كشف حساب مورد عليه رصيد

كرر تجربة كشف الحساب مع مورد من `Creditors` وأرسل نفس بيانات Network.

نحتاج:

```text
Vendor ID
Purchase ID
Supplier Invoice Number
Purchase Total
Paid Amount
Balance
Due Date
Debit / Credit
Running Balance
```

### 7. أعمار الديون

إذا كان POS يحتوي تقرير:

```text
Receivables Aging
Payables Aging
Outstanding
Debtors / Creditors
```

شغله لكل الفروع وللفترة الحالية، ثم أرسل Request وResponse.

إذا لم يوجد تقرير جاهز، سيحسب n8n الأعمار من تاريخ الاستحقاق والفواتير المفتوحة.

---

## ترتيب الإرسال

الأولوية:

1. تم تأكيد تقرير فواتير المبيعات غير المدفوعة.
2. تم تأكيد تقرير الطلبات غير المسلمة وغير المدفوعة.
3. افتح فاتورة غير مدفوعة من رابط التقرير وأرسل تفاصيلها والقيد.
4. كشف حساب عميل عليه ذمة محاسبية.
5. Receipt لتحصيل قديم مع القيد المحاسبي.
6. قائمة العملاء وأرصدتهم.
7. كشف حساب مورد.
8. تقرير أعمار الديون.

تم تأكيد مثال الرصيد المفتوح داخل POS، لكنه خاص بعملية Cash وتحتاج مراجعة
الفرع. الخطوة التالية: افتح فاتورة `Delivered` لعميل Credit حقيقي وبها رصيد،
حتى نثبت حالة يمكن اعتمادها مباشرة كذمة قابلة للتحصيل.

---

## نموذج التخزين المقترح

### `pos_accounts`

```text
account_id
account_type
account_name
branch_id
mobile
opening_balance
current_balance
last_synced_at
```

### `pos_open_invoices`

```text
transaction_id
sales_invoice_id
sales_order_id
invoice_no
order_no
account_id
invoice_type
invoice_date
due_date
invoice_total
paid_amount
pos_residual_amount
collectible_balance
status
delivery_type
driver
payment_info
payment_mode
review_status
```

### `pos_pending_orders`

```text
order_no
invoice_no
customer_id
customer_name
mobile
branch_name
order_date
delivery_date
delivery_type
order_total
paid_amount
balance_amount
paid_status
order_status
job_type
salesman
driver
first_seen_at
last_seen_at
days_past_delivery
review_status
reviewed_by
reviewed_at
review_note
synced_at
```

### `pos_receipts`

```text
receipt_id
voucher_no
account_id
invoice_id
receipt_date
amount
payment_method
payment_account_id
reference_no
branch_id
```

### `pos_account_ledger`

```text
entry_id
account_id
transaction_id
transaction_type
entry_date
debit
credit
running_balance
narration
```

---

## التقارير الناتجة

- إجمالي ذمم العملاء.
- إجمالي ذمم الموردين.
- العملاء المتأخرون حسب العمر والقيمة.
- تحصيل اليوم من ديون سابقة.
- نسبة التحصيل.
- أكبر عشرة أرصدة.
- فواتير تجاوزت تاريخ الاستحقاق.
- Receipts غير المرتبطة بفاتورة.
- فروقات بين كشف الحساب وإجمالي الفواتير المفتوحة.
- طلبات Home Delivery القديمة التي لم يغلقها الفرع.
- قيمة الطلبات المسلمة فعليًا وغير المسجلة كمدفوعة.
- أداء الفروع والكاشير في إغلاق الطلبات بعد التسليم.
