# خطة تفاصيل المصروفات والمشتريات

## الهدف

إنشاء طبقة مراجعة مالية تستطيع فتح أي Expense أوPurchase بعد تسجيله، ومطابقة:

- بيانات الرأس.
- حساب المصروف أو المنتجات.
- المورد والحساب الدائن.
- الفرع وPaid By وPay Account.
- VAT والإجمالي.
- المدفوع والمتبقي.
- القيد المحاسبي.
- المرفقات.
- سجل الإنشاء والتعديل والاعتماد.

لا يكفي أن يعيد POS رسالة نجاح؛ يجب إعادة فتح العملية والتأكد أن البيانات
حفظت في أماكنها الصحيحة.

---

## تفاصيل المصروفات المؤكدة

### الطلب

```text
POST /accounts/fecthExpenseDetails2
```

ملاحظة: اسم endpoint في POS مكتوب `fecth` وليس `fetch`.

Form Data:

```text
expense_id=3099
```

### أقسام الاستجابة

```text
branches[]
journal_data[]
journal_entries[]
logs[]
taxes[]
```

### البيانات المتاحة

| المجموعة | البيانات |
|---|---|
| الرأس | Expense ID, Voucher, Date, Branch, Status, Hold |
| المستخدم | Paid By ID واسم المستخدم |
| الدفع | Pay Account ID واسم الحساب |
| المورد | Party Account ID، الاسم وTRN |
| الفاتورة | Bill No، Bill Date وOrder No |
| المصروف | Account Head، الاسم، الوصف والمبلغ |
| الضريبة | Tax ID، VAT Amount وVAT Account |
| التسوية | Paid Amount وBalance Amount |
| التدقيق | Journal Entries وسجل Logs |

---

## المثال المؤكد: Expense 3099

```text
Expense ID / Voucher: 3099
Branch: AL FALAH / 1
Paid By: SAOOD / 1
Pay Account: Credit Card / 33777
Party Account: etisalat / 34014
Expense Account: Internet+Phone / 52253
Bill No: INV2021818813
Bill Date: 2026-04-01
Amount Before VAT: AED 1,203.26
VAT: AED 60.16
Total: AED 1,263.42
Paid: AED 1,263.42
Balance: AED 0.00
Status: Approved
Hold: 0
```

### القيد المحاسبي

```text
Debit  Internet+Phone       1,203.26
Debit  VAT on Expense         60.16
Credit etisalat            1,263.42

Debit  etisalat            1,263.42
Credit Credit Card         1,263.42
```

```text
Total Debit  = AED 2,526.84
Total Credit = AED 2,526.84
Balanced     = Yes
```

القيد يحتوي مرحلتين:

1. إثبات المصروف وInput VAT على حساب المورد.
2. سداد المورد من Credit Card.

### Pay Account IDs المؤكدة

```text
Credit = 0
Cash Account = 1
Credit Card = 33777
ADIB BANK = 34127
```

### ملاحظة مهمة عن الإجماليات

في Response كان:

```text
journal_data.sub_total = 1263.42
journal_data.amount = 1203.26
journal_data.tax_amount = 60.16
journal_data.grand_total = 1263.42
```

لذلك لا يعتمد المدقق على `sub_total` كرَقْم قبل الضريبة. الرقم الصحيح قبل
الضريبة يؤخذ من مجموع `journal_data[].amount`.

### سجل التدقيق المكتشف

```text
Approved:
VAT 60.17
Grand Total 1263.43

Updated:
VAT 60.16
Grand Total 1263.42
```

هذا يسمح لوكيل التدقيق بمعرفة من عدّل العملية، ومتى، وما القيم قبل وبعد.

---

## التحقق التلقائي بعد تسجيل المصروف

تم تحديث:

```text
n8n-telegram-ai-expense-approval-credentials-nodes-direct-pos.json
```

النود المعدلة:

```text
System POS - Register Expense
Telegram - Prepare Registration Result
```

بعد `save_expenses2` ينفذ Workflow:

```text
POST /accounts/fecthExpenseDetails2
expense_id=Expense ID الجديد
```

ثم يطابق:

- Expense ID وVoucher.
- Branch.
- Paid By.
- Pay Account.
- Party Account.
- Bill No وBill Date.
- Amount وVAT وTotal.
- Tax ID `1` عند وجود VAT.
- توازن Debit وCredit.

نتيجة Telegram:

```text
التحقق: تم تأكيد البيانات والقيد من POS
```

أو:

```text
التحقق: توجد فروقات - ...
```

إذا تعذر فتح المصروف بعد الحفظ، لا يعيد Workflow إنشاء المصروف لتجنب التكرار.

---

## المطلوب المتبقي للمصروفات

### 1. المرفقات

افتح مرفق Expense 3099 وسجل:

```text
Request URL
Request Method
Form Data
Response
```

للطلب المتوقع:

```text
/purchase/loadAttachmentData
```

نحتاج معرفة قيمة `module_id` و`attach_module` المستخدمة للمصروفات.

### 2. التعديل

عدّل Expense تجريبيًا ثم أرسل طلب الحفظ وResponse لمعرفة:

- هل يستخدم `save_expenses2`؟
- قيمة `expense_id`.
- قيمة `details_id`.
- طريقة تحديث الضريبة والمرفقات.

### 3. الحذف أو الإلغاء

نحتاج Request وResponse لمعرفة الفرق بين:

- Delete.
- Cancel.
- Hold.
- Reverse Journal.

لا يسمح للوكيل بتنفيذ أي منها دون موافقة بشرية.

### 4. قائمة المصروفات

نحتاج Form Data وResponse للطلبات:

```text
/accounts/loadLatestExpenseEntries
/accounts/loadAllExpenses
```

حتى نبني مزامنة تاريخية وتقارير حسب الفرع والحساب والمورد.

---

## المطلوب الآن للمشتريات

### القيد المحاسبي المؤكد

```text
POST /transaction/journalEntryData
order_id=1023
order_type=PI
```

الاستجابة المؤكدة:

```text
Debit  VAT on Purchase              AED 258.95
Debit  Purchase Account           AED 5,179.05
Credit globe chemicals company    AED 5,438.00

Debit Total                       AED 5,438.00
Credit Total                      AED 5,438.00
Balanced                          Yes
```

تم تحديث Workflow المشتريات ليطلب هذا القيد بعد `save_type=2` ويطابق:

- Purchase Account مع Gross.
- VAT on Purchase مع VAT.
- Credit المورد مع Grand Total.
- توازن Debit وCredit.
- اسم المورد المختار مع اسم حساب المورد في القيد.

الملف والنودات المعدلة:

```text
n8n-telegram-ai-purchase-approval-direct-pos.json
POS - Create And Finalize Purchase
Telegram - Prepare Purchase Result
```

إذا تعذر جلب القيد، لا يعيد Workflow إنشاء Purchase لتجنب التكرار.

### تفاصيل المنتجات المؤكدة

```text
POST /transaction/fetch_purchase_details
```

Form Data المستخدم بعد الحفظ:

```text
purchase_id=Purchase ID
purchase_id_counter=
counter_mode=
hold=0
type=0
mode=PURCHASE
```

الاستجابة المؤكدة لـPurchase `1023` تحتوي:

```text
Purchase ID: 1023
Branch: AL FALAH / 1
Vendor: globe chemicals company / 33996
Purchase Account: 11
Currency: AED / 2
Party Invoice No: 28264
Gross: AED 5,179.047619
VAT: AED 258.952381
Grand Total: AED 5,438.00
Paid: AED 0.00
Balance: AED 5,438.00
Status: 1
Hold: 0
```

صف المنتج المؤكد:

```text
details_id: 2609
product_id: 211
product_name: items
barcode: 95343
unit_id: 8
quantity: 1
amount: AED 5,179.047619
VAT tax_id: 1
VAT amount: AED 258.952381
net_amount: AED 5,438.00
```

تم تحديث `POS - Create And Finalize Purchase` ليعيد فتح الشراء بعد الحفظ
ويطابق:

- Purchase ID وPurchase Number.
- Branch وVendor وPurchase Account وCurrency.
- رقم وتاريخ فاتورة المورد.
- Gross وVAT وNet وGrand Total.
- Paid Amount وBalance.
- عدد صفوف المنتجات.
- `details_id` الذي أعاده طلب إنشاء كل صف.
- Product ID وBarcode وUnit ID.
- Quantity وBase Quantity وAmount وVAT وNet Amount.
- وجود `tax_id=1` عند تطبيق VAT.
- `status=1` و`hold=0`.

حالة `verified` لا تظهر إلا إذا نجح فحص القيد وفحص تفاصيل المنتجات معًا.
تعطل أحد Endpointين يعطي `partial`، وأي اختلاف حقيقي يعطي `mismatch`.

---

## المرحلة التالية

الأولوية الحالية:

1. Response مرفقات Expense.
2. Request تعديل Expense.
3. Request حذف أو إلغاء Expense.
4. قائمة جميع المصروفات مع الفلاتر والتواريخ.
5. اختبار Purchase متعدد المنتجات والمدفوع جزئيًا.
