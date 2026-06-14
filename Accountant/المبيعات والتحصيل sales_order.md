https://beta.aipsoft.com/inout/transaction/sales_order#


Request URL
https://beta.aipsoft.com/inout/transaction/loadLatestTransEntries
Request Method
POST
https://beta.aipsoft.com/inout/transaction/loadAllSalesOrders
https://beta.aipsoft.com/inout/transaction/fetch_sales_estimation_settings
https://beta.aipsoft.com/inout/transaction/get_payment_methods
https://beta.aipsoft.com/inout/transaction/get_all_cards
https://beta.aipsoft.com/inout/transaction/get_all_accounts/adjustment
https://beta.aipsoft.com/inout/transaction/fetch_purchase_details
https://beta.aipsoft.com/inout/transaction/loadLatestTransEntries
https://beta.aipsoft.com/inout/transaction/loadAttachmentData
draw
1
columns[0][data]
0
columns[0][name]
columns[0][searchable]
false
columns[0][orderable]
false
columns[0][search][value]
columns[0][search][regex]
false
columns[1][data]
1
columns[1][name]
columns[1][searchable]
false
columns[1][orderable]
false
columns[1][search][value]
columns[1][search][regex]
false
order[0][column]
0
order[0][dir]
DESC
start
0
length
10
search[value]
search[regex]
false
branch_sort
mode
SALES_ORDER
{"draw":"1","recordsTotal":10,"recordsFiltered":372059,"data":[["<div class=\"li_left purchase_id_taken\" data-id=\"383138\"><h3>Sales Account<\/h5><span style=\"color:#209ed8 !important\">260663<\/span><p class=\"left_table_date\">13-Jun-2026<\/p><\/div>","<div class=\"li_right statusTxt\"><h4>&nbsp;<\/h4><\/div>"],["<div class=\"li_left purchase_id_taken\" data-id=\"383137\"><h3>Sales Account<\/h5><span style=\"color:#209ed8 !important\">260662<\/span><p class=\"left_table_date\">13-Jun-2026<\/p><\/div>","<div class=\"li_right statusTxt\"><h4>&nbsp;<\/h4><\/div>"],["<div class=\"li_left purchase_id_taken\" data-id=\"383136\"><h3>Sales Account<\/h5><span style=\"color:#209ed8 !important\">Z63504<\/span><p class=\"left_table_date\">13-Jun-2026<\/p><\/div>","<div class=\"li_right statusTxt\"><h4>&nbsp;<\/h4><\/div>"],["<div class=\"li_left purchase_id_taken\" data-id=\"383135\"><h3>Sales Account<\/h5><span style=\"color:#209ed8 !important\">260661<\/span><p class=\"left_table_date\">13-Jun-2026<\/p><\/div>","<div class=\"li_right statusTxt\"><h4>&nbsp;<\/h4><\/div>"],["<div class=\"li_left purchase_id_taken\" data-id=\"383134\"><h3>Sales Account<\/h5><span style=\"color:#209ed8 !important\">260660<\/span><p class=\"left_table_date\">13-Jun-2026<\/p><\/div>","<div class=\"li_right statusTxt\"><h4>&nbsp;<\/h4><\/div>"],["<div class=\"li_left purchase_id_taken\" data-id=\"383133\"><h3>Sales Account<\/h5><span style=\"color:#209ed8 !important\">260659<\/span><p class=\"left_table_date\">13-Jun-2026<\/p><\/div>","<div class=\"li_right statusTxt\"><h4>&nbsp;<\/h4><\/div>"],["<div class=\"li_left purchase_id_taken\" data-id=\"383132\"><h3>Sales Account<\/h5><span style=\"color:#209ed8 !important\">260658<\/span><p class=\"left_table_date\">13-Jun-2026<\/p><\/div>","<div class=\"li_right statusTxt\"><h4>&nbsp;<\/h4><\/div>"],["<div class=\"li_left purchase_id_taken\" data-id=\"383131\"><h3>Sales Account<\/h5><span style=\"color:#209ed8 !important\">260657<\/span><p class=\"left_table_date\">13-Jun-2026<\/p><\/div>","<div class=\"li_right statusTxt\"><h4>&nbsp;<\/h4><\/div>"],["<div class=\"li_left purchase_id_taken\" data-id=\"383130\"><h3>Sales Account<\/h5><span style=\"color:#209ed8 !important\">Z63503<\/span><p class=\"left_table_date\">13-Jun-2026<\/p><\/div>","<div class=\"li_right statusTxt\"><h4>&nbsp;<\/h4><\/div>"],["<div class=\"li_left purchase_id_taken\" data-id=\"383129\"><h3>Sales Account<\/h5><span style=\"color:#209ed8 !important\">260656<\/span><p class=\"left_table_date\">13-Jun-2026<\/p><\/div>","<div class=\"li_right statusTxt\"><h4>&nbsp;<\/h4><\/div>"]]}

---

## فتح تفاصيل Sales Order

```text
Request URL
https://beta.aipsoft.com/inout/transaction/fetch_purchase_details

Request Method
POST
```

Form Data:

```text
purchase_id=383138
purchase_id_counter=
counter_mode=
hold=0
type=0
mode=SALES_ORDER
```

الاستجابة المؤكدة:

```text
response_code=200
purchase_id=383138
order_no=260663
branch_id=1
city=AL FALAH
customer_id=65378
customer_name=1E 475
total_quantity=30
total_amount=75
tax_amount=3.75
received_amount=0
balance=78.75
payment_details=[]
purchase_details count=4
```

الأصناف:

```text
KANDOORA | Qty 6  | Ironing Only | Gross 21.00 | VAT 1.05
GUTRA    | Qty 12 | Ironing Only | Gross 36.00 | VAT 1.80
WEZAR    | Qty 6  | Ironing Only | Gross 9.00  | VAT 0.45
FANELA   | Qty 6  | Ironing Only | Gross 9.00  | VAT 0.45
```

الإجمالي المحاسبي:

```text
Sales Before VAT = 75.00
VAT = 3.75
Invoice Total = 78.75
Collected = 0.00
Outstanding = 78.75
Payment Status = Unpaid
```

ملاحظة: `grand_total=0` في الاستجابة، لذلك لا يعتمد عليه Workflow منفرداً.

---

## القيد المحاسبي لفاتورة المبيعات

```text
Request URL
https://beta.aipsoft.com/inout/transaction/journalSalesEntryData

Request Method
POST
```

Form Data:

```text
sales_id=323534
```

Referer:

```text
https://beta.aipsoft.com/inout/transaction/sales_invoice
```

هذا الطلب يبدو مخصصاً لجلب القيد المحاسبي المرتبط بفاتورة المبيعات.

Response مؤكدة لفاتورة Cash:

```text
Invoice: M32845
Branch: Musaffah / 3

Credit VAT on Sales: AED 1.50
Credit Sales Account: AED 30.00
Debit Customer/Sale Account: AED 31.50

Debit Cash Account: AED 31.50
Credit Customer/Sale Account: AED 31.50
```

النتيجة:

```text
Sales Before VAT = AED 30.00
VAT = AED 1.50
Invoice Total = AED 31.50
Cash Collected = AED 31.50
Outstanding = AED 0.00
Payment Status = Paid
```

إجمالي القيد:

```text
Debit = AED 63.00
Credit = AED 63.00
Balanced = Yes
```

قيمة `63.00` لا تعني أن المبيعات تضاعفت. القيد يحتوي مرحلتين:

1. إثبات المبيعات والضريبة على حساب العميل.
2. تحصيل حساب العميل في Cash Account.

### Response مؤكدة لفاتورة Credit Card

```text
Invoice: Z49398
Branch: MBZ / 2

Credit VAT on Sales: AED 5.5125
Credit Sales Account: AED 110.25
Debit Customer/Sale Account: AED 115.76

Debit Credit Card: AED 115.50
Credit Customer/Sale Account: AED 115.50
```

النتيجة:

```text
Sales Before VAT = AED 110.25
VAT = AED 5.51
Invoice Total = AED 115.76
Credit Card Collected = AED 115.50
Unexplained Difference = AED 0.26
```

أكد المستخدم أن فرق `AED 0.26` ناتج عن خلل معروف في POS عند قفل الفاتورة
بعد الدفع، وليس مبلغاً مطلوب تحصيله من العميل.

يحفظ Workflow الفرق كالتالي:

```text
balance_amount = 0.26
pos_residual_amount = 0.26
collectible_balance_amount = 0.00
payment_status = paid_with_pos_residual
```

الحد الافتراضي للفروق المعروفة هو `AED 0.50` ويمكن تغييره بواسطة:

```text
POS_PAYMENT_RESIDUAL_TOLERANCE
```
