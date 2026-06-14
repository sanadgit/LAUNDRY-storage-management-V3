# خطة أتمتة المبيعات والتحصيل من POS

## 1. الهدف

إنشاء طبقة مالية موثوقة بين نظام Aipsoft POS وn8n تستطيع:

- مزامنة فواتير المبيعات تلقائياً.
- فصل المبيعات عن التحصيل الفعلي.
- تحليل Cash وCredit Card وBank والآجل.
- حساب أرصدة العملاء والمبالغ المستحقة.
- مقارنة أداء الفروع.
- اكتشاف الانخفاضات والتكرار والفواتير غير الطبيعية.
- الرد على أسئلة الإدارة في Telegram بأرقام موثقة.
- إنتاج تقارير يومية وأسبوعية وشهرية.

هذه الطبقة ستكون مصدراً لوكيل المحاسب ووكيل المدير المالي، وليست مجرد تقرير نصي.

### الملفات المنفذة

```text
Accountant/SALES_AND_COLLECTIONS_AUTOMATION_PLAN.md
n8n-pos-sales-and-collections-sync-auto-login.json
scripts/generate-n8n-sales-order-discovery-workflow.cjs
```

ملف JSON ينفذ مزامنة المبيعات وتفاصيل الفواتير بصورة Read Only، ولا ينشئ أو
يعدل أو يحذف أي فاتورة مبيعات.

متغيرات n8n المطلوبة:

```text
POS_USERNAME
POS_PASSWORD
TELEGRAM_ALLOWED_CHAT_ID
POS_PAYMENT_RESIDUAL_TOLERANCE=0.50
```

بعد الاستيراد:

1. اختر Telegram Credential في نود `Telegram - Send Sales Financial Report`.
2. شغل `Manual Test`.
3. تأكد أن التقرير يعرض آخر أرقام الفواتير.
4. فعّل Workflow لتشغيله كل 5 دقائق.

---

## 2. البيانات المؤكدة من Network

### صفحة المبيعات

```text
GET /transaction/sales_order
```

### قائمة أحدث عمليات المبيعات

```text
POST /transaction/loadLatestTransEntries
Content-Type: application/x-www-form-urlencoded
```

Form Data المؤكد:

```text
draw=1
start=0
length=10
order[0][column]=0
order[0][dir]=DESC
search[value]=
branch_sort=
mode=SALES_ORDER
```

الاستجابة تستخدم تنسيق DataTables:

```json
{
  "draw": "1",
  "recordsTotal": 10,
  "recordsFiltered": 372059,
  "data": []
}
```

كل صف يحتوي HTML وليس JSON منظماً:

```html
<div class="purchase_id_taken" data-id="383138">
  <h3>Sales Account</h3>
  <span>260663</span>
  <p>13-Jun-2026</p>
</div>
```

الحقول التي يمكن استخراجها:

| الحقل | المثال | المعنى |
|---|---:|---|
| `transaction_id` | `383138` | المعرف الداخلي المستخدم لفتح العملية |
| `invoice_no` | `260663` | رقم فاتورة المبيعات الظاهر |
| `transaction_date` | `2026-06-13` | تاريخ الفاتورة بعد توحيده |
| `account_name` | `Sales Account` | حساب المبيعات |

أرقام مثل `Z63504` يجب حفظها كنص، ولا يجوز تحويل رقم الفاتورة إلى Number.

### تفاصيل فاتورة المبيعات

```text
POST /transaction/fetch_purchase_details
```

Form Data المؤكد:

```text
purchase_id=383138
purchase_id_counter=
counter_mode=
hold=0
type=0
mode=SALES_ORDER
```

رغم اسم endpoint، فإنه يعيد تفاصيل Sales Order كاملة عند استخدام
`mode=SALES_ORDER`.

الاستجابة المؤكدة لفاتورة `260663` تحتوي:

| البيانات | الحقل |
|---|---|
| معرف العملية | `purchase_invoice[0].id` |
| رقم الفاتورة | `order_no` |
| العميل | `customer_id`, `customer_name`, `customer_mobile` |
| الفرع | `branch_id`, `city` |
| التاريخ والوقت | `billing_date`, `billing_time` |
| قبل الضريبة | `total_amount` |
| VAT | `tax_amount` |
| الرصيد | `balance` |
| المستلم | `received_amount` |
| حالة الدفع | `paid_status` |
| تفاصيل المنتجات | `purchase_details[]` |
| المدفوعات | `payment_details[]` |

مثال الفاتورة المؤكدة:

```text
Invoice: 260663
Transaction ID: 383138
Customer: 1E 475 / 65378
Branch: AL FALAH / 1
Quantity: 30
Gross: AED 75.00
VAT: AED 3.75
Invoice Total: AED 78.75
Collected: AED 0.00
Balance: AED 78.75
Status: Unpaid
Items: 4
```

ملاحظة مهمة: الحقل `grand_total` كان `0` في هذه الاستجابة، ولذلك يعيد
Workflow حساب الإجمالي من:

```text
total_amount - discount + tax_amount + adjustment + round_off
```

---

## 3. ما نستطيع تنفيذه الآن

باستخدام الاستجابات الحالية تم بناء مزامنة تقوم بـ:

1. تسجيل الدخول التلقائي إلى POS.
2. استدعاء `loadLatestTransEntries`.
3. تحليل HTML واستخراج المعرف والرقم والتاريخ.
4. منع تكرار العمليات بواسطة `transaction_id`.
5. حفظ مؤشر آخر عملية تمت مزامنتها.
6. اكتشاف وصول فواتير جديدة.
7. جلب تفاصيل كل فاتورة جديدة.
8. استخراج العميل والفرع والمنتجات والكميات.
9. حساب Gross وVAT وInvoice Total.
10. حساب المحصل والمتبقي وحالة الدفع.
11. التحقق من تطابق رأس الفاتورة مع مجموع الأصناف.
12. إرسال تقرير Telegram مالي منظم.

تم تأكيد تصنيف Cash وCredit Card من القيد المحاسبي حتى عندما تكون
`payment_details` فارغة. ما زال يلزم مثال Bank فقط لتأكيد اسم حسابه.

---

## 4. التصميم المقترح للـWorkflow

```text
Schedule Trigger / Telegram Question
  -> POS Auto Login
  -> Fetch Latest Sales Transactions
  -> Parse DataTables HTML
  -> Normalize Invoice Numbers and Dates
  -> Stop at Last Synced Transaction ID
  -> Fetch Full Details for Every New Transaction
  -> Fetch Payments and Customer
  -> Validate Financial Equation
  -> Upsert Database
  -> Calculate Branch and Collection Metrics
  -> Financial Review Agent
  -> Telegram / Management Report
```

### النودات الأساسية

| النود | الوظيفة |
|---|---|
| `POS - Create Session` | تسجيل الدخول وتجميع Cookies |
| `POS - Fetch Latest Sales` | طلب آخر العمليات مع Pagination |
| `Sales - Parse Transaction Rows` | تحويل HTML إلى بيانات منظمة |
| `Sales - Stop At Watermark` | إيقاف القراءة عند آخر عملية محفوظة |
| `POS - Fetch Sale Details` | جلب رأس الفاتورة والعميل والإجماليات |
| `POS - Fetch Sale Payments` | جلب طرق وقيم التحصيل |
| `Sales - Validate Transaction` | فحص الإجماليات والمدفوع والمتبقي |
| `Database - Upsert Sale` | حفظ أو تحديث العملية دون تكرار |
| `Finance - Aggregate Metrics` | بناء مؤشرات اليوم والأسبوع والشهر |
| `AI CFO - Analyze Results` | تفسير الأرقام واقتراح الإجراءات |
| `Telegram - Send Report` | إرسال تقرير منظم مع أزرار التفاصيل |

---

## 5. استراتيجية المزامنة

لا نسحب جميع السجلات البالغ عددها أكثر من `372,000` في كل تشغيل.

### المزامنة اللحظية

```text
كل 5 دقائق
length=10 افتراضياً
order=DESC
```

نقرأ الصفحات حتى نصل إلى آخر `transaction_id` محفوظ.
يمكن رفع حجم الصفحة بواسطة `POS_SALES_SYNC_PAGE_SIZE` بعد التأكد من قدرة
خادم n8n وPOS، لكن القيمة الصغيرة أكثر أماناً لتجنب `504 Gateway Timeout`.

### المزامنة اليومية

- إعادة فحص عمليات اليوم بالكامل.
- تحديث العمليات التي تغير دفعها أو حالتها.
- مقارنة عدد وقيمة الفواتير مع التقرير المالي اليومي.

### المزامنة التاريخية

- تنفذ مرة واحدة على دفعات.
- حجم الدفعة المقترح: `100-250`.
- تحفظ نقطة استكمال بعد كل دفعة.
- تستخدم Retry وRate Limit حتى لا يتوقف POS أوn8n.

---

## 6. نموذج البيانات المالي

### جدول `pos_sales`

```text
transaction_id       Primary Key
invoice_no
branch_id
branch_name
invoice_date
customer_id
customer_name
currency
gross_amount
discount_amount
tax_amount
net_amount
paid_amount
balance_amount
status
source_updated_at
synced_at
raw_hash
```

### جدول `pos_sale_payments`

```text
payment_id
transaction_id
payment_method_id
payment_method_name
card_id
account_id
amount
payment_date
reference_no
```

### جدول `pos_sale_items`

```text
detail_id
transaction_id
product_id
barcode
description
quantity
unit_price
discount
tax
net_amount
```

### جدول `pos_sales_sync_state`

```text
workflow_name
branch_id
last_transaction_id
last_invoice_date
last_success_at
last_error
```

### جدول `finance_alerts`

```text
alert_id
transaction_id
alert_type
risk_score
message
status
created_at
resolved_at
```

---

## 7. قواعد التحقق المحاسبي

يجب فحص كل فاتورة بالقواعد التالية:

```text
Gross - Discount + VAT + Adjustment = Net Sales
Paid Amount + Balance Amount = Invoice Total
Cash + Card + Bank + Credit = Paid Amount
```

تنشأ ملاحظة مراجعة عند:

- وجود فرق أكبر من `AED 0.01`.
- دفع أكبر من قيمة الفاتورة.
- فاتورة بلا عميل مع رصيد آجل.
- طريقة دفع مفقودة.
- رقم فاتورة مكرر في نفس الفرع.
- فاتورة سالبة ليست Return أوCredit Note.
- خصم أعلى من النسبة المعتمدة.
- تعديل فاتورة قديمة بعد إغلاق تقرير اليوم.

---

## 8. مؤشرات المبيعات والتحصيل

### مؤشرات يومية

```text
Gross Sales
Discounts
Returns
Net Sales
VAT Output
Cash Collected
Card Collected
Bank Collected
Credit Sales
Outstanding Balance
Invoice Count
Average Invoice Value
```

### مؤشرات الفروع

- مبيعات كل فرع.
- نسبة النمو مقارنة باليوم والأسبوع والشهر السابق.
- متوسط قيمة الطلب.
- نسبة Cash إلىCard.
- نسبة البيع الآجل.
- قيمة التحصيل من ديون سابقة.
- الفروع التي لم تودع الكاش المطلوب.

### معادلات مهمة

```text
Net Sales = Gross Sales - Discounts - Returns
Collection Rate = Amount Collected / Amount Due
Credit Sales = Invoice Total - Amount Paid At Sale
Cash To Deposit = Cash Collected - Approved Cash Expenses - Deposits
```

يجب عدم اعتبار **التحصيل من فاتورة قديمة** مبيعات جديدة.

---

## 9. دور وكيل المدير المالي

بعد توفر التفاصيل، يستطيع الوكيل الإجابة عن أسئلة مثل:

```text
كم مبيعات الفلاح اليوم؟
كم تم تحصيله فعلياً وليس فوترته فقط؟
لماذا انخفضت المبيعات هذا الأسبوع؟
قارن Cash وCard بين الفروع.
ما العملاء المتأخرون في السداد؟
ما المبلغ المطلوب إيداعه من كل فرع؟
هل توجد فواتير أو خصومات غير طبيعية؟
```

الإجابة يجب أن تحتوي دائماً على:

1. الفترة والفرع.
2. الرقم والعملة.
3. المقارنة المرجعية.
4. سبب الاستنتاج.
5. درجة الثقة.
6. الإجراء المقترح.
7. رابط أو رقم العمليات الداعمة.

لا يستخدم الذكاء الاصطناعي لحساب الأرقام. الحساب يتم في Code/SQL، والذكاء
الاصطناعي يفسر النتائج ويقترح الإجراءات.

---

## 10. التقرير اليومي المقترح

```text
التقرير المالي للمبيعات والتحصيل
التاريخ: 13-06-2026

Net Sales: AED 00,000.00
Cash Collected: AED 00,000.00
Card Collected: AED 00,000.00
Credit Sales: AED 00,000.00
Old Debt Collected: AED 00,000.00
Outstanding: AED 00,000.00
Invoices: 000
Average Invoice: AED 000.00

Best Branch: ...
Lowest Branch: ...

Alerts:
- ...

Recommended Actions:
- ...
```

أزرار Telegram:

```text
[تفاصيل الفروع] [طرق الدفع]
[الذمم] [الخصومات]
[الفواتير المشكوك فيها] [تقرير PDF]
```

---

## 11. البيانات الناقصة المطلوبة من Network

### الأولوية التالية

افتح فاتورة مبيعات مدفوعة **Bank** إن وجدت، وانسخ Response لطلبي التفاصيل
والقيد:

```text
POST /transaction/fetch_purchase_details
mode=SALES_ORDER

POST /transaction/journalSalesEntryData
sales_id=Transaction ID
```

نحتاج رؤية محتوى:

```text
payment_details
received_amount
tender_cash
paid_status
balance
```

تم تأكيد Cash وCredit Card. هذا المثال سيؤكد Bank بدقة.

### طلبات مطلوبة بعدها

1. `loadAllSalesOrders`
   - Form Data كاملة.
   - Response كاملة لصفحة واحدة.
   - تجربة فلتر الفرع والتاريخ والبحث.

2. `get_payment_methods`
   - Form Data والاستجابة.

3. `get_all_cards`
   - Form Data والاستجابة.

4. طلب حفظ أو عرض Payments داخل فاتورة مبيعات موجودة.

5. طلب تسجيل Receipt من عميل لفاتورة آجلة.

6. طلب Sales Return أوCredit Note.

7. طلب كشف حساب العميل والرصيد المستحق.

8. طلب تعديل أو إلغاء فاتورة مبيعات.

9. طلب تفاصيل المرفقات إن كانت فواتير المبيعات تدعمها.

### القيد المحاسبي المكتشف

تم تأكيد الطلب:

```text
POST /transaction/journalSalesEntryData
sales_id=323534
```

تمت إضافة نود `POS - Fetch Sale Journal Entries` إلى Workflow. تستخدم
`transaction_id` كقيمة `sales_id` ثم:

- تتحقق من توازن Debit وCredit.
- تقرأ Sales Account وVAT on Sales.
- تعتبر حساب التحصيل المدين طريقة الدفع.
- صنفت الاستجابة المؤكدة `Cash Account` بقيمة `AED 31.50`.

القيد المؤكد لفاتورة `M32845`:

```text
Credit Sales Account = 30.00
Credit VAT on Sales = 1.50
Debit Customer/Sale Account = 31.50
Debit Cash Account = 31.50
Credit Customer/Sale Account = 31.50
```

وبذلك:

```text
Invoice Total = 31.50
Cash Collected = 31.50
Collection Rate = 100%
Journal Debit = 63.00
Journal Credit = 63.00
Journal Balanced = true
```

تم تأكيد Credit Card أيضاً من القيد التالي:

```text
Invoice = Z49398
Branch = MBZ / 2
Credit Sales Account = 110.25
Credit VAT on Sales = 5.5125
Debit Credit Card = 115.50
```

القيمة المحاسبية للفاتورة بعد التقريب `115.76` بينما Card Collected تساوي
`115.50`. أكد المستخدم أن هذا فرق ناتج عن خلل معروف في POS عند إغلاق الدفع،
وليس ذمة حقيقية على العميل.

يعامل Workflow الفروق الصغيرة كـ `POS Payment Residual` وفق الحد:

```text
POS_PAYMENT_RESIDUAL_TOLERANCE=0.50
```

- الحد `0.50` لا يكفي وحده لتصنيف الفرق.
- يجب أن يطابق الدفع Grand Total سابقًا موجودًا في Logs.
- يجب أن يكون الإجمالي الحالي قد ارتفع بعد الدفع بمقدار داخل الحد.
- يحتفظ بالرصيد الأصلي في `balance_amount`.
- يسجل الفرق في `pos_residual_amount`.
- يستبعده من `collectible_balance_amount`.
- يصنف الفاتورة `paid_with_pos_residual`.
- يعرض مجموع الفروق منفصلاً في التقرير.
- لا يخفي أي فرق يتجاوز الحد المحدد.

تم تأكيد هذه القاعدة بعملية ثانية:

```text
Invoice: Z49202
Transaction ID: 322647
Branch: MBZ
Grand Total: AED 30.10
Credit Card Collected: AED 30.03
POS Balance: AED 0.07
Original Total Before POS Recalculation: AED 30.03
```

تفاصيل الدفع تؤكد:

```text
Credit Card Account ID: 33777
Payment ID: 381214
Payment Amount: AED 30.03
Payment Status: Active
```

لذلك يصنف Workflow مبلغ `AED 0.07` كـPOS residual ويجعل
`collectible_balance_amount=0`.

تم تأكيد حالة دفع مختلط برصيد حقيقي داخل POS:

```text
Invoice: 227051
Transaction ID: 322679
Branch: AL FALAH
Grand Total: AED 12.60
Credit Card: AED 6.30
Cash: AED 4.00
Total Collected: AED 10.30
Balance: AED 2.30
Journal Balanced: true
```

هذا الفرق ليس POS residual لأن المدفوعات والقيد يثبتان الرصيد كاملًا. لكنه
يبقى `branch_confirmation_required` لأن العملية Cash وDelivered؛ فقد يكون
الكاشير استلم الباقي ولم يسجله. لا يدخل مبلغ `AED 2.30` في التحصيل المطلوب
ولا ترسل مطالبة للعميل قبل تأكيد مدير الفرع.

تم تأكيد حالة حدية تثبت أن المبلغ الصغير قد يكون رصيدًا حقيقيًا:

```text
Invoice: 227098
Transaction ID: 322737
Grand Total: AED 10.50
Cash Paid: AED 10.00
Balance: AED 0.50
Logged Grand Total: AED 10.50 فقط
```

لا يوجد في Logs إجمالي سابق يساوي مبلغ الدفع؛ لذلك لا يصنف `AED 0.50`
كـPOS residual. يظهر في التقرير:

```text
payment_status = branch_confirmation_required
pending_branch_review = AED 0.50
confirmed_outstanding = AED 0.00
```

تم تأكيد فاتورة غير مدفوعة بالكامل:

```text
Invoice: 227080
Transaction ID: 322716
Customer: k LITTLE nas / 49022
Customer Account: 49009
Grand Total: AED 86.10
Paid: AED 0.00
Balance: AED 86.10
Journal Balanced: true
```

يصنفها Workflow:

```text
payment_status = unpaid
collectible_balance_amount = AED 86.10
pos_residual_amount = AED 0.00
```

---

## 12. مراحل التنفيذ

### المرحلة الأولى: Discovery Workflow

- تسجيل الدخول التلقائي.
- طلب `loadLatestTransEntries`.
- تحليل القائمة وحفظ آخر Transaction ID.
- إرسال آخر عشر فواتير إلى Telegram للاختبار.

### المرحلة الثانية: Full Sale Sync

- جلب تفاصيل كل فاتورة.
- جلب المنتجات والمدفوعات.
- التخزين في قاعدة البيانات.
- التحقق من المعادلات المالية.

### المرحلة الثالثة: Collections

- فصل تحصيل اليوم عن مبيعات اليوم.
- مزامنة Receipts وCustomer Balances.
- تقرير الذمم والتحصيل.

### المرحلة الرابعة: Financial Intelligence

- المقارنات والتنبيهات.
- أسئلة المدير المالي عبر Telegram.
- تقارير يومية وأسبوعية وشهرية.
- اقتراحات قابلة للموافقة.

### المرحلة الخامسة: Audit

- مطابقة تقرير Counter Cash مع المبيعات والمدفوعات.
- مطابقة Card مع كشف مزود الدفع.
- مطابقة Cash مع الإيداعات والمصروفات.
- سجل تدقيق لكل فرق أو تعديل.

---

## 13. معيار النجاح

تعتبر المنظومة جاهزة عندما:

- تتم مزامنة كل فاتورة مرة واحدة دون تكرار.
- يمكن استرجاع الفاتورة الكاملة بواسطة `transaction_id`.
- تتطابق إجماليات المبيعات مع تقرير POS بفارق لا يتجاوز `AED 0.01`.
- تتطابق طرق الدفع مع إجمالي التحصيل.
- يمكن فصل مبيعات اليوم عن تحصيل الديون القديمة.
- تظهر الفروع والعملاء والخصومات والمرتجعات بصورة صحيحة.
- كل تقرير يحمل وقت آخر مزامنة وأي بيانات ناقصة.
- لا ينفذ الوكيل تعديلاً أو إلغاءً دون موافقة بشرية.
