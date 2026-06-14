# خطة Workflow تسجيل المشتريات من Telegram إلى POS

## 1. الهدف

إنشاء Workflow جديد ومستقل في n8n لتسجيل فواتير المشتريات في شاشة:

```text
POS -> Transaction -> Purchase
```

مسار العمل:

```text
Telegram
  -> استلام نص أو صورة أو PDF
  -> استخراج بيانات الفاتورة بالذكاء الاصطناعي
  -> مطابقة المورد مع Vendor Party A/C
  -> مطابقة كل صنف مع المنتجات المسجلة في POS
  -> جلب الوحدة والتكلفة والضريبة وبيانات المخزون
  -> مراجعة الفاتورة في Telegram
  -> تعديل أو إلغاء أو موافقة
  -> تسجيل المشتريات في POS
  -> رفع المرفق إلى رقم Purchase
  -> إرسال نتيجة التسجيل إلى Telegram
```

هذا Workflow سيكون منفصلاً عن Workflow المصروفات، لأن فاتورة المشتريات تؤثر في:

- المخزون.
- تكلفة شراء المنتج.
- حساب المورد.
- ضريبة المدخلات.
- الرصيد المستحق للمورد.
- وسائل الدفع.

---

## 2. المعلومات المؤكدة من Purchase.md

### شاشة المشتريات

```text
https://beta.aipsoft.com/inout/transaction/purchase
```

### Endpoints المؤكدة

| الوظيفة | Method | Endpoint |
|---|---|---|
| إعدادات شاشة المشتريات | POST | `/transaction/fetch_purchase_settings` |
| وسائل الدفع | POST | `/transaction/get_payment_methods` |
| بطاقات الدفع | POST | `/transaction/get_all_cards` |
| حسابات التسوية | POST | `/transaction/get_all_accounts/adjustment` |
| آخر رقم Purchase | POST | `/transaction/latest_invoice_number` |
| قائمة قيود المشتريات | POST | `/transaction/loadAllPurchaseEntries` |
| البحث عن منتج | GET | `/transaction/fetch_product_with_name_hinds/new_search_2/?search_text=...` |
| تفاصيل المنتج | POST | `/transaction/fetch_product_complete_details` |
| البحث عن الموردين | POST | `/transaction/get_vendors` |
| فحص بيانات وضريبة المورد | POST | `/transaction/check_taxable` |
| فحص تكرار رقم فاتورة المورد | POST | `/transaction/checkMultiInvoiceNumber` |
| بيانات اتصال الحساب | POST | `/transaction/fetch_all_head_contacts` |
| فحص خصائص المصروف أو الحساب | POST | `/transaction/check_exp_property_assign` |
| قائمة مندوبي المبيعات | POST | `/transaction/getSalesman` |
| حفظ أو تحديث المشتريات | POST | `/transaction/save_purchase_details_2` |

### آخر رقم Purchase

الـ endpoint أعاد:

```text
1021
```

والشاشة الجديدة عرضت:

```text
Purchase #1022
```

كود شاشة POS يضع القيمة التي يعيدها endpoint مباشرة داخل `invoice_no`.

لذلك Workflow يستخدم:

```text
invoice_no = response from latest_invoice_number
```

ولا يضيف `1` داخل n8n. يجب إعادة طلب الرقم مباشرة قبل الحفظ لمنع تكراره عند تنفيذ عمليتين متزامنتين.

### الفروع المؤكدة

```text
AL FALAH = 1
MBZ = 2
Musaffah = 3
```

### وسائل الدفع المؤكدة

| النوع | Payment Method ID | Linked Account Head |
|---|---:|---:|
| Payment/Receipt | 0 | 0 |
| Cash | 1 | 1 |
| Credit Card | 2 | 33777 |
| Cheque | 3 | 33959 |
| Vouchers | 6 | 36456 |

يجب التمييز بين:

- `Payment Method ID`
- `linked_head_id`

ولا يتم استخدام أحدهما مكان الآخر داخل طلب الحفظ إلا بعد مراجعة Form Data الحقيقي.

### مثال المورد المؤكد

```text
Vendor: globe chemicals company
Account Head ID: 33996
Taxable: 1
```

المورد موجود أيضاً في:

```text
expense_account.md/Creditors_accounts.md
```

### مثال المنتج المؤكد

```text
Product ID: 211
Name: items
Barcode: 95343
Product Type: Stock
Unit ID: 8
Purchase Unit ID: 8
Base Unit ID: 8
Purchase Unit: n
Purchase Rate: 6960
Tax ID: 1
VAT: 5%
Product Tax Detail ID: 356
```

### الضريبة

```text
VAT (5%) Tax ID = 1
```

يجب الاحتفاظ أيضاً بالقيمة التالية القادمة من تفاصيل المنتج:

```text
Product Tax Detail ID = 356
```

إلى أن نتأكد أي الحقلين يرسله نموذج الحفظ.

### استجابة الحفظ

حالة Hold:

```json
{
  "message": "This Purchase is Holded, Invoice id was : 1021",
  "response_code": 200,
  "status": 1,
  "p_id": 1021,
  "details_id": 2606
}
```

حالة التحديث النهائي:

```json
{
  "message": "Purchase Updated Successfully, Invoice id was : 1021",
  "response_code": 200,
  "status": 2,
  "p_id": "1021",
  "details_id": null
}
```

`p_id` هو الرقم الذي سنستخدمه كـ Purchase ID عند النجاح.

### Form Data المؤكد لعملية التحديث النهائي

تم التقاط طلب فعلي إلى:

```text
POST /transaction/save_purchase_details_2
Content-Type: application/x-www-form-urlencoded
```

الحقول المؤكدة:

| الحقل | المعنى | مثال |
|---|---|---|
| `hold` | حالة Hold | `0` |
| `invoice_no` | رقم Purchase | `1023` |
| `branch_id` | الفرع | `1` |
| `vendors` | Vendor Account ID | `33996` |
| `purchase_account` | حساب المشتريات | `11` |
| `currencies` | Currency ID | `2` |
| `purchase_date` | تاريخ المشتريات بصيغة DD-MM-YYYY | `07-05-2026` |
| `due_date` | تاريخ الاستحقاق | `13-06-2026` |
| `partys_name` | اسم الطرف عند الحاجة | فارغ |
| `partys_no` | رقم فاتورة المورد | `28264` |
| `partys_inv_date` | تاريخ فاتورة المورد بصيغة DD-MM-YYYY | `07-05-2026` |
| `remark1` | ملاحظة 1 | فارغ |
| `remark2` | ملاحظة 2 | فارغ |
| `purchase_order_no` | Purchase Order No. | فارغ |
| `grn_no` | GRN No. | فارغ |
| `total_quantity` | مجموع الكمية | `1` |
| `total_gross` | الإجمالي قبل الضريبة | `5179.047619047619` |
| `total_net_amount` | صافي المنتجات | `5438` |
| `final_total_tax` | إجمالي الضريبة | `258.95238095238096` |
| `total_disc` | إجمالي الخصم | `0` |
| `total_additional_discount_per` | نسبة الخصم الإضافي | فارغ |
| `total_additional_discount` | قيمة الخصم الإضافي | `0` |
| `round_off` | التقريب | فارغ |
| `adjustment` | التسوية | فارغ |
| `grand_total` | الإجمالي النهائي | `5438.00` |
| `paid_amount` | المدفوع | `0` |
| `balance_amount` | الرصيد المستحق | `5438` |
| `update_purchase_rate` | تحديث سعر الشراء | `1` |
| `invoice_id` | Purchase ID المستخدم في التحديث | `1023` |
| `project_id` | المشروع | فارغ |
| `disable_tax` | علم الضريبة كما ترسله الشاشة | `1` |
| `save_type` | نوع عملية الحفظ أو التحديث | `2` |
| `page_custom_fields[form_validation]` | نجاح تحقق النموذج | `true` |
| `manual_total` | إجمالي يدوي | فارغ |

ملاحظة: رغم اسم `disable_tax`، العينة التي تحتوي VAT أرسلت:

```text
disable_tax = 1
```

لذلك سنحاكي قيمة الشاشة المؤكدة ولن نفسر الاسم حرفياً.

حقول Adjustment المؤكدة:

```text
adjustment_details[0][adjustment_id]
adjustment_details[0][add_or_less]
adjustment_details[0][adjust_account]
adjustment_details[0][adjust_narration]
adjustment_details[0][adjust_amount]
```

حقول Misc المؤكدة:

```text
new_misc_fields[0][field_name]
new_misc_fields[0][field_type]
```

هذا الطلب يمثل التحديث النهائي لفاتورة موجودة، ولا يحتوي سطور المنتجات. وجود:

```text
invoice_id=1023
save_type=2
```

مع عدم وجود `product_id` أو `quantity` يؤكد أن تفاصيل المنتج حُفظت في طلب سابق منفصل، غالباً طلب Hold الأول إلى نفس endpoint.

### Form Data المؤكد لعملية إنشاء الفاتورة وسطور المنتجات

تم التقاط الطلب الأول إلى نفس endpoint:

```text
POST /transaction/save_purchase_details_2
Content-Type: application/x-www-form-urlencoded
```

علامات طلب الإنشاء الأول:

```text
hold = 1
save_type = 1
invoice_id = فارغ
update_purchase_rate = 0
```

ويحتوي رأس الفاتورة والإجماليات نفسها، بالإضافة إلى:

```text
final_purchase_product_list[index][...]
purchase_tax_values[index][...]
```

حقول المنتج المؤكدة:

| الحقل | المعنى | مثال |
|---|---|---|
| `details_id` | Detail ID عند التعديل | فارغ عند الإنشاء |
| `barcode` | Barcode | `95343` |
| `product_id` | Product ID | `211` |
| `unit_id` | Unit ID | `8` |
| `quantity` | الكمية | `1` |
| `purchase_rate` | سعر الشراء قبل الضريبة | `5179.047619047619` |
| `amount` | المبلغ قبل الضريبة | `5179.047619047619` |
| `total_tax` | ضريبة السطر | `258.95238095238096` |
| `net_amount` | المبلغ شامل الضريبة | `5438` |
| `mr_no` | MR No. | `0` |
| `spl_discount` | خصم خاص | `0` |
| `spl_disc_percentage` | نسبة الخصم الخاص | `0` |
| `add_discount` | خصم إضافي | `0` |
| `discount` | الخصم | `0` |
| `free` | كمية مجانية أو علم المجاني | `0` |
| `inc_rate` | السعر شامل الضريبة | `5438` |
| `item_note` | ملاحظة الصنف أو اسم التصنيف | `Consumables` |
| `net_rate` | السعر الصافي قبل الضريبة | `5179.047619047619` |
| `foc_link_id` | رابط FOC | `0` |
| `sale_price` | سعر البيع المسجل للمنتج | `19.95` |
| `margin_per` | هامش الربح المحسوب في الشاشة | `-25860.14` |
| `base_qty` | الكمية الأساسية | `1` |
| `unique_record` | معرف فريد مؤقت للسطر | قيمة نصية فريدة |
| `multi_rate_id` | Multi-rate ID | فارغ |

مثال اسم الحقل الكامل:

```text
final_purchase_product_list[0][product_id] = 211
```

حقول ضريبة المنتج المؤكدة:

| الحقل | المعنى | مثال |
|---|---|---|
| `tax_id` | VAT Tax ID | `1` |
| `tax_amount` | مبلغ VAT | `258.95238095238096` |
| `tax_value` | نسبة VAT كنص | `5%` |
| `product_id` | المنتج المرتبط بالضريبة | `211` |

مثال:

```text
purchase_tax_values[0][tax_id] = 1
purchase_tax_values[0][tax_amount] = 258.95238095238096
purchase_tax_values[0][tax_value] = 5%
purchase_tax_values[0][product_id] = 211
```

### العلاقة الحسابية المؤكدة

في العينة، السعر `5438` شامل VAT بنسبة 5%:

```text
السعر قبل VAT = 5438 / 1.05
                = 5179.047619047619

VAT = 5438 - 5179.047619047619
    = 258.95238095238096
```

لذلك ترسل الشاشة:

```text
purchase_rate = السعر قبل VAT
amount = السعر قبل VAT × quantity
inc_rate = السعر شامل VAT
net_rate = السعر قبل VAT
total_tax = VAT
net_amount = السعر شامل VAT
```

وعلى مستوى رأس الفاتورة:

```text
total_gross = مجموع amount
final_total_tax = مجموع total_tax
total_net_amount = مجموع net_amount
grand_total = total_net_amount بعد الخصم والتسويات
```

### تسلسل الحفظ المؤكد

عملية Save في واجهة POS تحفظ كل Product Row بطلب مستقل، ثم تنفذ طلب الحفظ النهائي:

```text
1. أول Product Row
   hold=1
   save_type=1
   invoice_id=''
   + final_purchase_product_list[0]
   + purchase_tax_values[0]

2. كل Product Row تالٍ
   hold=1
   save_type=1
   invoice_id=p_id الناتج من أول سطر
   + final_purchase_product_list[0]
   + purchase_tax_values[0]

3. Finalize/Update
   hold=0
   save_type=2
   invoice_id=p_id الناتج من الطلب الأول
   + adjustment_details
   + new_misc_fields
```

يجب ألا ينتقل Workflow للسطر التالي أو الحفظ النهائي إلا إذا أعاد كل طلب سطر:

```text
response_code = 200
status = 1
p_id
details_id
```

---

## 3. الفرق عن Workflow المصروفات

| المصروفات | المشتريات |
|---|---|
| Expense Account واحد أو أكثر | Product ID لكل سطر |
| Party Account اختياري حسب نوع الدفع | Vendor Party A/C مطلوب |
| لا تزيد مخزون المنتجات | تزيد مخزون المنتجات |
| Amount + Tax + Total | Qty + Unit + Cost + Amount + VAT + Net Amount |
| Expense ID | Purchase ID |
| Pay Account | Payment Methods وتوزيع المبلغ |
| خطأ المطابقة قابل للتعديل لاحقاً | خطأ المنتج قد يفسد المخزون والتكلفة |

لهذا السبب لا يجوز للذكاء الاصطناعي اختراع:

- `vendor_id`
- `product_id`
- `unit_id`
- `tax_id`
- `purchase_no`

يجب أخذ هذه القيم من POS فقط.

---

## 4. البيانات التي يستخرجها الذكاء الاصطناعي

المخرجات تكون JSON منظم:

```json
{
  "supplier_name": "globe chemicals company",
  "supplier_invoice_no": "27699",
  "supplier_invoice_date": "2026-04-16",
  "purchase_date": "2026-04-16",
  "currency": "AED",
  "tax_billing": true,
  "items": [
    {
      "description": "items",
      "barcode": "95343",
      "quantity": 1,
      "unit_text": "n",
      "unit_price": 5438,
      "amount": 5438,
      "vat_rate": 5,
      "tax_amount": 271.9,
      "net_amount": 5709.9
    }
  ],
  "discount": 0,
  "adjustment": 0,
  "round_off": 0,
  "invoice_total": 5709.9,
  "notes": "",
  "confidence": 0.99
}
```

يدعم التصميم أكثر من صنف في الفاتورة الواحدة.

---

## 5. مطابقة المورد

### ترتيب المطابقة

1. تطبيع اسم المورد.
2. البحث داخل القائمة المحلية `Creditors_accounts.md`.
3. البحث المباشر داخل `/transaction/get_vendors`.
4. مقارنة الاسم الكامل والكلمات الأساسية.
5. استدعاء `/transaction/check_taxable` للحساب المختار.

### نتيجة المطابقة

```json
{
  "vendor_id": "33996",
  "vendor_name": "globe chemicals company",
  "taxable": true,
  "match_score": 1
}
```

### عند وجود أكثر من نتيجة

يرسل Telegram أزراراً بأسماء الموردين الأقرب ولا يسمح بالحفظ حتى يختار المدير المورد الصحيح.

### عند عدم وجود المورد

الإصدار الأول لا ينشئ مورداً تلقائياً، لأن Endpoint إنشاء المورد غير موجود في `Purchase.md`.

يكون الرد:

```text
المورد غير موجود في POS.
يجب إنشاء المورد أو اختياره يدوياً قبل تسجيل المشتريات.
```

يمكن إضافة إنشاء المورد في مرحلة لاحقة بعد التقاط Network Request الخاص به.

---

## 6. مطابقة المنتجات

تنفذ المطابقة لكل سطر بشكل مستقل.

### ترتيب البحث

1. Barcode إذا كان موجوداً.
2. الاسم الكامل.
3. كلمات الاسم الأساسية.
4. البحث في:

```text
/transaction/fetch_product_with_name_hinds/new_search_2/
```

5. جلب البيانات الكاملة للمنتج المختار من:

```text
/transaction/fetch_product_complete_details
```

### البيانات المحفوظة لكل سطر

```json
{
  "product_id": "211",
  "product_name": "items",
  "barcode": "95343",
  "product_type": "Stock",
  "unit_id": "8",
  "purchase_unit_id": "8",
  "base_unit_id": "8",
  "purchase_unit": "n",
  "purchase_eq_to_base": 1,
  "quantity": 1,
  "base_quantity": 1,
  "price_includes_tax": true,
  "invoice_unit_price": 5438,
  "purchase_rate": 5179.047619047619,
  "amount": 5179.047619047619,
  "tax_id": "1",
  "product_tax_detail_id": "356",
  "vat_rate": 5,
  "tax_amount": 258.95238095238096,
  "net_amount": 5438
}
```

### عند وجود أكثر من منتج مطابق

يرسل Telegram رسالة اختيار منفصلة للسطر:

```text
اختر المنتج المطابق للسطر رقم 1
```

وتظهر أزرار تحتوي اسم المنتج وBarcode وProduct ID.

### عند عدم وجود المنتج

لا يتم إنشاء Product تلقائياً في الإصدار الأول.

السبب أن إنشاء منتج ناقص قد يؤدي إلى:

- وحدة خاطئة.
- تصنيف مخزون خاطئ.
- ضريبة خاطئة.
- تكلفة أو سعر بيع خاطئ.

يتم إيقاف المسودة حتى يختار المدير منتجاً موجوداً أو ينشئ المنتج في POS.

---

## 7. الحسابات والتحقق

إذا كان السعر في الفاتورة **غير شامل VAT**:

```text
Amount = Quantity × Cost
Tax Amount = Amount × VAT Rate / 100
Net Amount = Amount + Tax Amount
```

إذا كان السعر في الفاتورة **شامل VAT**:

```text
Net Amount = Quantity × Invoice Unit Price
Amount = Net Amount / (1 + VAT Rate / 100)
Tax Amount = Net Amount - Amount
```

يحدد Workflow الوضع بمقارنة:

- مجموع أسعار الأصناف.
- VAT الظاهر في الفاتورة.
- Invoice Total.

إذا تعذر تحديد هل السعر شامل الضريبة، يجب أن يطلب اختيار المدير قبل الموافقة.

إجماليات الفاتورة:

```text
Gross = مجموع Amount
Total Tax = مجموع Tax Amount
Net Total = مجموع Net Amount
Grand Total = Net Total - Discount + Adjustment + Round Off
Difference = Invoice Total - Grand Total
```

شروط الموافقة:

- المورد محدد.
- جميع المنتجات محددة.
- جميع الوحدات محددة.
- الكميات أكبر من صفر.
- التكلفة ليست سالبة.
- الضريبة متوافقة مع Tax Billing.
- الفرق يساوي صفراً أو ضمن هامش `0.01 AED`.
- رقم فاتورة المورد موجود.
- تاريخ فاتورة المورد موجود.

إذا كان الفرق أكبر من `0.01` لا يظهر زر الموافقة، ويظهر زر التعديل فقط.

---

## 8. خيارات الدفع في Telegram

الخيارات الأساسية:

```text
آجل / Credit Purchase
Cash / 1
Credit Card / 2
Cheque / 3
Vouchers / 6
```

### الشراء الآجل

كما يظهر في الصورة:

```text
Payment values = 0
Paid = 0
Balance = Grand Total
```

### الدفع الكامل

عند اختيار Cash أو Credit Card أو غيره:

```text
Selected payment amount = Grand Total
Paid = Grand Total
Balance = 0
```

الدفع المختلط سيكون مرحلة لاحقة لأنه يحتاج واجهة تعديل مبالغ كل وسيلة.

---

## 9. رسالة المراجعة

مثال:

```text
فاتورة مشتريات جاهزة للمراجعة

Draft: PUR-20260613-XXXX
Purchase #: سيُجلب عند الحفظ
الفرع: AL FALAH / 1
المورد: globe chemicals company / 33996
رقم فاتورة المورد: 27699
تاريخ الفاتورة: 2026-04-16
Tax Billing: نعم

1. items
Product ID: 211
Barcode: 95343
Qty: 1 n
Cost: AED 5438.00
VAT 5%: AED 271.90
Net: AED 5709.90

Gross: AED 5438.00
Tax: AED 271.90
Grand Total: AED 5709.90
Payment: Credit Purchase
Balance: AED 5709.90
Difference: AED 0.00
```

### الأزرار

السطر الأول:

```text
AL FALAH | MBZ | Musaffah
```

السطر الثاني:

```text
آجل | Cash | Credit Card
```

السطر الثالث:

```text
Cheque | Vouchers
```

السطر الأخير:

```text
موافق | تعديل | إلغاء
```

---

## 10. عقد n8n المقترحة

### الاستقبال والتحليل

1. `Telegram Trigger - Purchase`
2. `Telegram - Normalize Purchase Input`
3. `Telegram - Send Analysis Notice`
4. `Telegram - Download Purchase File`
5. `OpenAI - Extract Purchase Invoice`
6. `OpenAI - Parse Purchase JSON`
7. `Purchase - Validate Extracted Data`

### جلسة POS والمطابقة

8. `POS - Login And Create Session`
9. `POS - Find Vendor`
10. `POS - Check Vendor Taxable`
11. `Purchase - Split Invoice Items`
12. `POS - Search Product`
13. `POS - Fetch Product Complete Details`
14. `Purchase - Merge Matched Items`
15. `Purchase - Calculate Totals`
16. `Draft - Save Purchase Draft`

### المراجعة

17. `Telegram - Send Purchase Review`
18. `Telegram - Handle Branch Selection`
19. `Telegram - Handle Payment Selection`
20. `Telegram - Handle Vendor Selection`
21. `Telegram - Handle Product Selection`
22. `OpenAI - Parse Purchase Edit`
23. `Draft - Apply Purchase Edit`
24. `Telegram - Send Updated Review`

### التسجيل

25. `Approve - Load Purchase Draft`
26. `Purchase - Final Validation`
27. `POS - Get Latest Purchase Number`
28. `POS - Build Purchase Hold Payload`
29. `POS HTTP - Create Purchase And Product Lines`
30. `Purchase - Verify Hold And Capture Purchase ID`
31. `POS - Build Purchase Finalize Payload`
32. `POS HTTP - Finalize Purchase`
33. `Purchase - Verify Final Save Response`

### المرفقات والنتيجة

34. `Telegram - Download Registered Purchase File`
35. `POS - Prepare Purchase Attachment Session`
36. `POS HTTP - Upload Purchase Attachment`
37. `Purchase - Finalize Attachment Result`
38. `Telegram - Send Purchase Registration Result`

كل عملية كبيرة لها Node مستقلة حتى يكون Workflow واضحاً وقابلاً للصيانة.

---

## 11. تخزين المسودة

المسودة تحفظ في Workflow Static Data:

```json
{
  "draft_id": "PUR-20260613-XXXX",
  "status": "pending_approval",
  "chat_id": "-100...",
  "message_id": "123",
  "telegram_file_id": "...",
  "branch": {},
  "vendor": {},
  "items": [],
  "payment": {},
  "totals": {},
  "extracted": {},
  "created_at": "2026-06-13T00:00:00Z"
}
```

لا يتم حفظ Base64 داخل Static Data.

يتم حفظ `telegram_file_id` فقط، ثم يعاد تنزيل المرفق بعد نجاح التسجيل.

---

## 12. رفع المرفق

سيتم اتباع نفس الأسلوب الذي تم تصحيحه في Workflow المصروفات:

```text
Telegram file_id
  -> Telegram Download File
  -> binary.data
  -> HTTP Request multipart/form-data
```

تم تأكيد مسار مرفقات المشتريات من كود شاشة POS:

```text
POST /transaction/save_attachments

module_id = p_id
attach_module = purchase
attachments[] = الملف
```

---

## 13. المعلومات المتبقية

أصبحت بنية التسجيل الأساسية مؤكدة ويمكن بناء النسخة الأولى من Workflow.

المعلومات التالية مطلوبة لتوسيع التغطية، لكنها ليست مانعة لبدء التنفيذ:

1. Payload لشراء مدفوع Cash لمعرفة حقول توزيع الدفع.
2. Payload لفاتورة تحتوي أكثر من منتج للتأكد أن الفهارس تكون `[0]`, `[1]`, وهكذا.
3. Payload لمنتج بدون VAT لمقارنة `disable_tax` وحقول الضريبة.
4. التأكد من سلوك الخصومات والتسويات غير الصفرية.

---

## 14. استراتيجية التنفيذ

### المرحلة الأولى: اختبار POS مباشر

- إنشاء صفحة اختبار Purchase داخل النظام الحالي.
- تسجيل الدخول تلقائياً إلى POS.
- البحث عن المورد.
- البحث عن المنتج.
- بناء Payload مطابق للمتصفح.
- تسجيل Purchase تجريبي بقيمة صغيرة.
- التحقق من ظهوره في قائمة المشتريات.
- التحقق من زيادة المخزون.
- التحقق من حساب المورد والضريبة والرصيد.

### المرحلة الثانية: Workflow Telegram بدون حفظ

- استقبال الفاتورة.
- استخراج البيانات.
- مطابقة المورد والمنتجات.
- إرسال رسالة المراجعة والأزرار.
- تنفيذ التعديل والإلغاء.

### المرحلة الثالثة: تفعيل الحفظ

- جلب آخر Purchase Number.
- إعادة التحقق من المسودة.
- إرسال طلب Create/Hold مستقل لكل منتج مع `save_type=1`.
- إرسال منتج واحد فقط داخل `final_purchase_product_list[0]` في كل طلب.
- أخذ `p_id` من المنتج الأول وتمريره كـ `invoice_id` لكل منتج تالٍ.
- التحقق من `response_code=200` و`status=1` ووجود `details_id` لكل منتج.
- إرسال طلب Finalize مع `save_type=2` و`invoice_id=p_id`.
- التحقق من `response_code=200` و`status=2`.
- حفظ Purchase ID النهائي.
- منع الحفظ المكرر لنفس Draft.

### المرحلة الرابعة: المرفقات

- إعادة تنزيل ملف Telegram.
- رفعه إلى Purchase ID.
- إرسال رسالة نجاح مستقلة.

---

## 15. اختبارات القبول

يعتبر Workflow ناجحاً فقط عند نجاح الحالات التالية:

1. فاتورة نصية بصنف واحد بدون VAT.
2. صورة فاتورة بصنف واحد مع VAT 5%.
3. PDF يحتوي أكثر من صنف.
4. مورد موجود بالاسم نفسه.
5. مورد اسمه مكتوب بطريقة مختلفة قليلاً.
6. منتج يتم التعرف عليه بالـ Barcode.
7. منتج يتم التعرف عليه بالاسم.
8. أكثر من تطابق ويختار المدير المنتج الصحيح.
9. فاتورة شراء آجل.
10. فاتورة مدفوعة Cash.
11. اختيار فرع مختلف.
12. تعديل الكمية أو التكلفة قبل الموافقة.
13. منع الحفظ عند وجود Difference.
14. منع الضغط المكرر على موافق من إنشاء فاتورتين.
15. ظهور Purchase في POS بالرقم الصحيح.
16. تحديث مخزون المنتج بالكمية الصحيحة.
17. تسجيل VAT في مكانه الصحيح.
18. تسجيل حساب المورد والرصيد الصحيح.
19. رفع PDF أو الصورة إلى Purchase الصحيح.
20. وصول رسالة Telegram تحتوي Purchase ID.

---

## 16. الملفات التي سيتم إنشاؤها

بعد اكتمال معلومات Network:

```text
scripts/generate-n8n-telegram-ai-purchase-workflow.cjs
n8n-telegram-ai-purchase-approval-direct-pos.json
N8N_TELEGRAM_AI_PURCHASE_APPROVAL_WORKFLOW.md
```

ويفضل أيضاً إنشاء صفحة اختبار:

```text
src/pages/PurchaseTest.tsx
```

لاختبار POS مباشرة قبل تفعيل التسجيل من Telegram.

---

## 17. القرار الفني

سنستخدم:

- Telegram Credentials الموجودة في n8n.
- OpenAI Credentials الموجودة في n8n.
- n8n Variables لبيانات دخول POS.
- تسجيل دخول POS جديد عند كل عملية حساسة.
- HTTP Request Nodes للملفات وطلبات Multipart.
- Code Nodes صغيرة منفصلة للتحويل والتحقق والحساب.

لن نستخدم:

- Cookie منسوخ يدوياً.
- مفاتيح API داخل Code.
- Product ID يختاره الذكاء الاصطناعي.
- Vendor ID يختاره الذكاء الاصطناعي.
- Base64 داخل Workflow Static Data.
- حفظ Purchase قبل اكتمال مطابقة جميع المنتجات.
