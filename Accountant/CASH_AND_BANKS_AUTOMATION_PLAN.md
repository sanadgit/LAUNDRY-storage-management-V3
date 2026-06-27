# خطة الكاش والبنوك

## الهدف

بناء رقابة مالية يومية تربط:

```text
المبيعات والتحصيل
+ المقبوضات الأخرى
- المصروفات النقدية
- الإيداعات البنكية
- التحويلات والسحوبات
= الرصيد المتوقع للكاش والبنك
```

ويستطيع وكيل الحسابات:

- حساب الكاش المطلوب وجوده في كل فرع.
- تحديد المبلغ المطلوب إيداعه.
- متابعة إيصال الإيداع واعتماده.
- مطابقة Credit Card مع حساب البطاقة والبنك.
- اكتشاف نقص أوزيادة الصندوق.
- متابعة أرصدة البنك والحركات غير المطابقة.
- فصل رصيد POS عن الرصيد البنكي الفعلي.

---

## السياسة التشغيلية المؤكدة

العملية الأساسية في المغسلة أسبوعية:

```text
استخراج تقرير الأسبوع لكل فرع
-> حساب صافي الكاش المطلوب إيداعه
-> إرسال أمر إيداع لمدير الفرع
-> المدير يودع المبلغ ويرسل الإيصال
-> مراجعة مبلغ وتاريخ ومرجع الإيصال
-> إنشاء Journal Entry
-> Credit Cash Account / Debit ADIB BANK
-> رفع الإيصال على Journal
-> إعادة فتح Journal والمرفق للتحقق
-> إغلاق تسوية الأسبوع
```

الجرد الفعلي للكاش إجراء رقابي مساعد، لكنه ليس بديلًا عن تقرير الإيداع
الأسبوعي والتسوية المحاسبية.

---

## البيانات المؤكدة حاليًا

### تقرير Counter Cash

```text
POST /sales/generate_report
report_type=counter_cash
```

يعيد حسب الفترة والفرع:

- Cash Account Receipts.
- Credit Card Receipts.
- Cash Expenses.
- Credit Card Expenses.
- Balance لكل طريقة دفع.
- عدد الفواتير.

### Account IDs المؤكدة

```text
Cash Account = 1
Credit Card = 33777
ADIB BANK = 34127
Credit = 0
```

### معادلة الكاش الأولية

```text
Cash Available =
  Cash Receipts
  - Cash Expenses
  - Recorded Cash Deposits
  - Other Cash Outflows
  + Cash Inflows
```

ملاحظة: `Counter Cash Balance` وحده لا يثبت أن المبلغ ما زال في خزنة الفرع؛
قد يكون أودع في البنك دون تسجيل صحيح أو سلمه المدير ولم يغلق الحركة.

---

## المطلوب من POS

## 1. Cash A/c Flow Report

من قائمة Reports افتح:

```text
Accounts > Cash A/c Flow Report
```

اختر:

```text
فرع واحد
فترة يوم واحد توجد فيها مبيعات ومصروفات
Cash Account
```

أرسل:

```text
Request URL
Request Method
Form Data أو Payload
Response كاملة
```

نحتاج الحقول:

```text
Opening Balance
Date / Time
Voucher / Transaction ID
Transaction Type
Account
Narration
Debit
Credit
Running Balance
Closing Balance
Branch
Created By
```

هذا هو الطلب الأول والأهم.

### البيانات المؤكدة

تم تأكيد صفحة التقرير:

```text
POST /reports/generate/accounts_cash_flow
```

وطلب استخراج التقرير:

```text
POST /reports/generate_report
```

Form Data:

```text
report_type=accounts_cash_flow
from_date=2026-05-01
from_time=12:00 AM
to_date=2026-05-01
to_time=11:59 PM
no_of_decimal_places=2
save=1
branch_id=1
predefined_date=Custom Range
```

عنوان التقرير:

```text
Account Cash Flow Report
Branch: AL FALAH / 1
Period: 2026-05-01 00:00:00 to 2026-05-01 23:59:59
```

الحركات المؤكدة:

```text
2026-05-01
Reference: E-3096
Description: Payment on Expence-3096, Bill#:INV2027292216, etisalat
Cash Outflow: AED 1,233.75
Running Balance: AED -1,233.75

2026-05-01
Reference: Counter Sale
Description: Counter Sale - Cash
Cash Inflow: AED 1,938.11
Running Balance: AED 704.36
```

ملخص التقرير:

```text
Total Income: AED 1,938.11
Total Expense & PI Payments: AED 1,233.75
Total Cash Balance: AED 704.36
Total Transfer-Journal/Bank: AED 0.00
```

المعادلة متطابقة:

```text
AED 1,938.11 - AED 1,233.75 - AED 0.00 = AED 704.36
```

### تنبيه عن أسماء الأعمدة

ترتيب أعمدة التقرير هو:

```text
Credit | Debit | Balance
```

لكن استخدام POS داخل هذا التقرير هو:

```text
Credit = Cash Inflow
Debit = Cash Outflow
```

وهذا عكس العرض المحاسبي المعتاد لحساب الأصل النقدي. لذلك يحول Workflow
الأعمدة إلى أسماء واضحة:

```text
cash_inflow
cash_outflow
running_balance
```

ولا يستخدم `Credit` و`Debit` مباشرة في التحليلات.

### ما أثبته التقرير

- يمكن حساب رصيد الكاش اليومي حسب الفرع.
- المصروف `E-3096` خرج من Cash Account.
- Counter Sale دخل إلى Cash Account.
- التحويلات إلىJournal أوBank تظهر في ملخص مستقل.
- Reference يسمح بربط الحركة بالمصروف أوالمبيعات.

### ما لا يعيده التقرير

- الرصيد الافتتاحي الصريح.
- Voucher ID الداخلي.
- اسم المستخدم الذي سجل الحركة.
- تفاصيل حساب البنك المستلم للتحويل.
- جرد الكاش الفعلي الموجود بالخزنة.

---

## 2. Cash & Bank Flow Report

ظهر اسم التقرير في قائمة النظام، لكن واجهة المستخدم المتاحة لا توفر تقريرًا
منفصلًا له. الطلب الوحيد الذي أمكن تشغيله هو:

```text
report_type=accounts_cash_flow
```

ولذلك حالة هذه الخطوة:

```text
Unavailable in current POS UI or current user permissions
```

لن نعتمد على Endpoint مفترض باسم `cash_flow`. سنستخرج حركة البنك والبطاقة
من تقارير الحسابات أوLedger المتاحة فعليًا.

---

## 3. Account Balance

افتح:

```text
Accounts > Account Balance
```

استخرج أرصدة:

```text
Cash Account / 1
Credit Card / 33777
ADIB BANK / 34127
```

وأرسل Request وResponse.

نحتاج معرفة:

```text
الرصيد الحالي
Debit Total
Credit Total
Opening Balance
الرصيد حسب الفرع
الرصيد حسب التاريخ
```

### Ledger مؤكد: ADIB BANK

تم تأكيد الطلب:

```text
POST /reports/generate_report

report_type=ledger_report
from_date=2026-06-01
from_time=12:00 AM
to_date=2026-06-30
to_time=11:59 PM
ledger_name=34127
ledger_name_txt=ADIB BANK
branch_id=1
predefined_date=This Month
post_dated_chks=0
enable_aging=0
```

الاستجابة:

```text
Account: ADIB BANK / 34127
Branch: AL FALAH / 1
Opening Balance: AED 435,281.50 Cr
Period Debit: AED 0.00
Period Credit: AED 141,750.00
Closing Balance: AED 577,031.50 Cr
Records: 2
```

الحركات:

```text
2026-06-03 17:27:30
Voucher Type: E
Expense ID: 3083
Description: Payment on Expense-3083, Bill #0009-35
Debit: AED 0.00
Credit: AED 73,500.00
Balance: AED 508,781.50 Cr

2026-06-04 02:09:23
Voucher Type: E
Expense ID: 3090
Description: Payment on Expense-3090, Bill #0009-37, shop rental
Debit: AED 0.00
Credit: AED 68,250.00
Balance: AED 577,031.50 Cr
```

المعادلة متطابقة:

```text
AED 435,281.50 Cr
+ AED 73,500.00 Cr
+ AED 68,250.00 Cr
= AED 577,031.50 Cr
```

### تفسير مهم

مصروفات البنك تظهر `Credit` لأنها تخفض حساب البنك محاسبيًا. لكن الرصيد
الافتتاحي والختامي كلاهما `Cr`، لذلك لا يجوز تفسير:

```text
577,031.50 Cr
```

على أنه «نقد متاح في ADIB». إذا كان ADIB مصنفًا كأصل بنكي، فالرصيد الدائن قد
يعني رصيدًا سالبًا أوأن إعداد الحساب/الرصيد الافتتاحي معكوس. نحتاج بيانات
الحساب من Chart of Accounts أوAccount Details لتأكيد نوعه.

يحفظ Workflow الرصيد بهذه الصورة:

```text
opening_balance_amount = 435281.50
opening_balance_side = credit
period_debit = 0.00
period_credit = 141750.00
closing_balance_amount = 577031.50
closing_balance_side = credit
```

ولا يحوله إلى رقم موجب متاح للصرف.

### ملاحظات إضافية

- `Voucher Type=E` يربط الحركة بالمصروفات.
- رقم العملية مستخرج من HTML داخل عمود Order ID.
- `debit_credit_total=[null,"141750"]` يعني أن إجمالي الفترة كله Credit.
- قيمة `Days=-10` لا تستخدم ماليًا قبل فهم طريقة حسابها في POS.
- التقرير يدعم Pagination، البحث، الفترة، الفرع، Aging وPost-dated Cheques.

### Ledger مؤكد: Cash Account

تم تأكيد الطلب:

```text
POST /reports/generate_report

report_type=ledger_report
from_date=2026-06-01
from_time=12:00 AM
to_date=2026-06-30
to_time=11:59 PM
ledger_name=1
ledger_name_txt=Cash Account
branch_id=1
predefined_date=This Month
post_dated_chks=0
enable_aging=0
```

الاستجابة:

```text
Account: Cash Account / 1
Branch: AL FALAH / 1
Opening Balance: AED 503,442.42 Dr
Period Debit: AED 4,958.259985866543
Period Credit: AED 819.00
Closing Balance: AED 507,581.68 Dr
Records: 184
```

المعادلة:

```text
Opening Dr + Period Debit - Period Credit = Closing Dr

503,442.42 + 4,958.259985866543 - 819.00
= 507,581.679985866543
= 507,581.68 بعد التقريب
```

### أنواع الحركات المكتشفة

```text
CR = تحصيل نقدي من Sales Invoice
ADP = Advance Payment علىSales Order
```

أمثلة:

```text
CR / 321681
Sale - 226410, Pay Cash
Debit Cash: AED 29.40

ADP / 380022
Advance Payment, Order - 258557, Pay Cash
Debit Cash: AED 31.50
```

الصفحة الأولى تحتوي 10 حركات فقط، بينما `recordsFiltered=184`. يجب قراءة كل
الصفحات للحصول على إجمالي التفاصيل، وعدم جمع الصفحة الأولى وحدها.

### اتجاه Debit وCredit في Ledger

في `ledger_report` لحساب الأصل النقدي:

```text
Debit = زيادة Cash Account
Credit = نقص Cash Account
```

هذا هو الاتجاه المحاسبي الطبيعي، ويختلف عن تسميات أعمدة تقرير
`accounts_cash_flow` التي تعاملنا معها كتدفقات.

يجب أن يعرف Parser نوع التقرير قبل تفسير الأعمدة:

```text
ledger_report:
  debit = account increase
  credit = account decrease

accounts_cash_flow:
  Credit column = cash inflow
  Debit column = cash outflow
```

### تنبيه مهم عن الرصيد

```text
Closing Balance: AED 507,581.68 Dr
```

هذا رصيد دفتري تراكمي منذ فترات سابقة، وليس دليلًا أن خزنة فرع الفلاح تحتوي
فعليًا على هذا المبلغ. الرصيد الكبير يشير إلى أن:

- إيداعات البنك قد لا تسجل بانتظام مقابل Cash Account.
- الرصيد الافتتاحي قديم أوغير مصفّر.
- الحساب قد يكون مشتركًا بين عمليات تاريخية متعددة.

لذلك حساب الإيداع اليومي يعتمد على حركات الفترة والجرد الفعلي، وليس Closing
Balance التراكمي وحده.

### Ledger مؤكد: Credit Card

تم تأكيد الطلب:

```text
POST /reports/generate_report

report_type=ledger_report
from_date=2026-06-01
from_time=12:00 AM
to_date=2026-06-30
to_time=11:59 PM
ledger_name=33777
ledger_name_txt=Credit Card
branch_id=1
predefined_date=This Month
post_dated_chks=0
enable_aging=0
```

الاستجابة:

```text
Account: Credit Card / 33777
Branch: AL FALAH / 1
Opening Balance: AED 7,835,479.33 Dr
Period Debit: AED 59,195.898665590255
Period Credit: AED 1,387.74
Closing Balance: AED 7,893,287.49 Dr
Records: 1,324
```

المعادلة:

```text
7,835,479.33
+ 59,195.898665590255
- 1,387.74
= 7,893,287.48866559
= AED 7,893,287.49 Dr
```

### أنواع الحركات المكتشفة

```text
ADP = Advance Payment علىSales Order بواسطة البطاقة
BR = تحصيل Sales Invoice بواسطة البطاقة
```

أمثلة:

```text
ADP / 379581
Advance Payment, Order - 258239, Pay Credit-Card
Debit Credit Card: AED 12.60

BR / 320313
Sale - 225539, Pay Credit-Card
Debit Credit Card: AED 12.60
```

ملاحظة: POS استخدم `BR` لتحصيل فاتورة البطاقة، بينما ظهر `CR` في Cash
Ledger. لذلك لا يعتمد Parser على Voucher Type وحده لتحديد طريقة الدفع؛ يقرأ
الحساب والوصف معًا.

### دلالة الرصيد الكبير

```text
Closing Balance: AED 7,893,287.49 Dr
```

هذا يمثل قيمة متراكمة على حساب وسيط البطاقات، وليس مبلغًا متوقعًا وصوله في
تسوية شهر يونيو فقط. ارتفاع الرصيد يعني غالبًا واحدًا أوأكثر من:

- تسويات Credit Card إلى البنك غير مسجلة.
- الحساب لم تتم تسويته منذ سنوات.
- الرصيد الافتتاحي تاريخي.
- بعض رسوم وتسويات البطاقات تسجل خارج POS.

قيمة البطاقة المطلوب تسويتها للفترة تحسب من حركات الفترة غير المطابقة، وليس
من Closing Balance الكامل.

### مقارنة الحسابات الثلاثة

```text
Cash Account Closing:       AED   507,581.68 Dr
Credit Card Closing:        AED 7,893,287.49 Dr
ADIB BANK Closing:          AED   577,031.50 Cr
```

هذه الأرصدة غير متصالحة محاسبيًا مع بعضها حتى الآن. لا يمكن استخراج «رصيد
البنك الحقيقي» أو«المبلغ المعلق لدى البطاقة» منها دون حركات التحويل والتسوية.

---

## 4. تسجيل إيداع كاش في البنك

نحتاج معرفة العملية الصحيحة داخل POS لنقل:

```text
Cash Account -> ADIB BANK
```

افتح شاشة الإيداع أوContra Voucher أوBank Deposit، وسجل عملية اختبار صغيرة
فقط بعد التأكد أنها قابلة للحذف أوالعكس.

أرسل:

```text
طلب فتح العملية أوجلب الرقم التالي
طلب الحفظ مع Form Data
Response
طلب فتح العملية بعد الحفظ
القيد المحاسبي
```

القيد المتوقع:

```text
Debit  ADIB BANK
Credit Cash Account
```

الحقول المطلوبة:

```text
Voucher ID
Voucher Number
Date
Branch
From Account ID
To Account ID
Amount
Reference Number
Deposit Slip Number
Remarks
Created By / Paid By
Attachment Module
```

لن ينفذ n8n الإيداع تلقائيًا قبل إضافة موافقة مدير الفرع والمحاسب.

### Journal Entry مؤكد لنقل الأموال

تم تأكيد طلب فتح تفاصيل Journal:

```text
POST /accounts/fecthJournalDetails
journal_id=119
```

ملاحظة: اسم Endpoint في POS مكتوب `fecth` وليس `fetch`.

بيانات الرأس:

```text
Journal ID / No: 119
Branch: AL FALAH / 1
Journal Date: 2024-10-02
Created Date: 2024-11-26 21:00:50
Status: 1
Hold: 0
Created By: Sanad Manger
Transaction Type: JE
```

القيد:

```text
Credit Cash Account / 1          AED 3,000.00
Debit  Credit Card / 33777       AED 3,000.00
```

تفاصيل الأسطر:

```text
Details ID 245
Account: Cash Account / 1
Debit: 0
Credit: 3000

Details ID 246
Account: Credit Card / 33777
Debit: 3000
Credit: 0
```

التحقق:

```text
Total Debit = AED 3,000.00
Total Credit = AED 3,000.00
Journal Balanced = Yes
```

هذا القيد نقل الرصيد من Cash Account إلىCredit Card. لا يمثل إيداعًا بنكيًا
لأن `ADIB BANK / 34127` غير موجود في أطراف القيد.

### سجل التدقيق

العملية:

- أنشئت في `26-November-2024 09:00 PM`.
- عُدلت ثلاث مرات حتى `09:05 PM`.
- نفذها `Sanad Manger`.
- تاريخ القيد المحاسبي `2024-10-02` أقدم من تاريخ الإنشاء.

لذلك يجب على وكيل التدقيق تنبيه العمليات ذات التاريخ الرجعي
`backdated_journal` وحفظ كل تعديلات Logs.

### قاعدة إيداع البنك

يعتبر Journal إيداع Cash إلىADIB فقط إذا احتوى:

```text
Debit  ADIB BANK / 34127
Credit Cash Account / 1
```

أما:

```text
Debit  Credit Card / 33777
Credit Cash Account / 1
```

فيصنف:

```text
cash_to_card_reclassification
```

ولا يخفض مبلغ الإيداع المطلوب إلا بعد مراجعة واعتماد المحاسب، لأنه ليس حركة
بنكية مؤكدة.

### إيداع Cash إلىADIB مؤكد

تم تأكيد:

```text
POST /accounts/fecthJournalDetails
journal_id=105
```

بيانات القيد:

```text
Journal ID / No: 105
Journal Date: 2023-05-13
Created Date: 2023-05-13 23:48:29
Branch: AL FALAH / 1
Remark / Deposit Reference: 8239
Notes: from 1 may to 10 may
Status: 1
Hold: 0
Created By: Sanad Manger
```

القيد:

```text
Debit  ADIB BANK / 34127       AED 12,030.00
Credit Cash Account / 1        AED 12,030.00
```

تفاصيل الأسطر:

```text
Details ID 217
Cash Account / 1
Debit: 0
Credit: 12030

Details ID 218
ADIB BANK / 34127
Debit: 12030
Credit: 0
```

التحقق:

```text
Total Debit = Total Credit = AED 12,030.00
Journal Balanced = Yes
Classification = cash_bank_deposit
```

هذا القيد يخفض الكاش المطلوب إيداعه، ويزيد رصيد ADIB الدفتري.

### ربط فترة الإيداع

الملاحظة:

```text
from 1 may to 10 may
```

تعني أن مبلغ `AED 12,030` يغطي فترة تحصيل، وليس يوم القيد فقط. يجب تخزين:

```text
coverage_from = 2023-05-01
coverage_to = 2023-05-10
deposit_date = 2023-05-13
deposit_reference = 8239
```

في المرحلة الأولى يستخرج AI فترة التغطية من Notes، ثم يراجعها المحاسب قبل
اعتماد المطابقة.

### ملاحظة تدقيق عن الفرع

Logs تعرض:

```text
Added: Branch From 2
Updated: Branch From 1
```

بينما البيانات النهائية:

```text
branch_from=1
city=AL FALAH
```

إذن القيد تغير فرعه بعد الإنشاء. يحفظ النظام:

```text
branch_changed_after_creation = true
original_branch_id = 2
final_branch_id = 1
```

ويظهر تنبيه تدقيق، لأن تغيير الفرع يمكن أن يغيّر مسؤولية الإيداع بين مديري
الفروع.

### المرفق

الطلب:

```text
module=journal_entry
module_id=105
```

أعاد:

```text
recordsTotal=0
```

أي أن الإيداع `105` لا يحتوي إيصالًا مرفقًا. يصنف:

```text
attachment_status = missing
```

### طلب حفظ إيداع البنك المؤكد

```text
POST /accounts/save_journal_entry
Content-Type: application/x-www-form-urlencoded
```

Form Data:

```text
hold=0
action=save
journal_no=121
branch_id=1
journal_date=14-06-2026
remark1=
journal_id=
transaction_type=JE

journal_entry_details[0][details_id]=
journal_entry_details[0][account_head]=1
journal_entry_details[0][segment_id]=
journal_entry_details[0][class_id]=
journal_entry_details[0][account_debit]=0
journal_entry_details[0][account_credit]=3770
journal_entry_details[0][notes]=

journal_entry_details[1][details_id]=
journal_entry_details[1][account_head]=34127
journal_entry_details[1][segment_id]=
journal_entry_details[1][class_id]=
journal_entry_details[1][account_debit]=3770
journal_entry_details[1][account_credit]=0
journal_entry_details[1][notes]=

new_misc_fields[0][field_name]=
new_misc_fields[0][field_type]=
```

المعنى المحاسبي:

```text
Credit Cash Account / 1       AED 3,770.00
Debit  ADIB BANK / 34127      AED 3,770.00
```

التصنيف المتوقع:

```text
cash_bank_deposit
```

ملاحظات:

- `journal_id` فارغ عند الإنشاء.
- `details_id` فارغ لكل سطر جديد.
- `journal_no=121` هو Voucher الظاهر.
- التاريخ يرسل بصيغة `DD-MM-YYYY`.
- `transaction_type=JE`.
- الطلب ظهر مكررًا في النص المرسل، لكنه Payload واحد ولا يجوز إرساله مرتين.
- يفضل وضع رقم إيصال الإيداع في `remark1`.
- توضع فترة التغطية أوالمرجع البنكي داخل `notes`.

لا تعتبر العملية مؤكدة بعد الحفظ إلا إذا:

1. أعاد Response نجاحًا ومعرف Journal.
2. أعيد فتح Journal بواسطة `fecthJournalDetails`.
3. ظهر السطران بالقيم والحسابات الصحيحة.
4. كان إجمالي Debit مساويًا لإجمالي Credit.
5. لم يكن Journal في حالة Hold.

### نتيجة الحفظ وإعادة التحقق

Response الحفظ:

```json
{
  "message": "Journal Entry Created Successfully",
  "response_code": 200,
  "status": 1,
  "p_id": 121
}
```

تمت إعادة فتح العملية:

```text
POST /accounts/fecthJournalDetails
journal_id=121
```

والنتيجة المؤكدة:

```text
Journal ID / No: 121
Branch: AL FALAH / 1
Journal Date: 2026-06-14
Created Date: 2026-06-14 04:05:51
Status: 1
Hold: 0
Created By: Sanad Manger

Details ID 248
Cash Account / 1
Debit: AED 0.00
Credit: AED 3,770.00

Details ID 249
ADIB BANK / 34127
Debit: AED 3,770.00
Credit: AED 0.00
```

التحقق النهائي:

```text
Total Debit: AED 3,770.00
Total Credit: AED 3,770.00
Balanced: Yes
Created Once: Yes
Status: Approved/Active
Hold: No
Classification: cash_bank_deposit
```

تأثير الأرصدة الذي أعاده POS:

```text
Cash Account Balance: 1,447,771.2661907
ADIB BANK Balance: 361,481.20
```

هذه القيم أرصدة حسابات حالية أعادها Endpoint، وليست بديلًا عن إعادة تشغيل
Ledger للفترة عند المطابقة اليومية.

### منطق التسجيل الآمن في n8n

```text
Create Journal
-> Require response_code=200, status=1, p_id
-> Store p_id immediately
-> Reopen with fecthJournalDetails
-> Verify branch, date, accounts and amount
-> Verify debit=credit
-> Mark deposit registered
-> Upload receipt in a separate step
-> Send Telegram confirmation
```

إذا نجح الحفظ وتعذر إعادة الفتح، لا يعيد Workflow طلب الحفظ لتجنب إنشاء
إيداع مكرر.

---

## 5. إيصال الإيداع

بعد تسجيل إيداع، ارفع صورة أوPDF للإيصال من واجهة POS، ثم أرسل:

```text
Request URL
Multipart Form Data
Response
طلب loadAttachmentData
```

نحتاج ربط:

```text
Deposit Voucher ID
Attachment ID
File Name
Uploaded By
Uploaded At
```

بعدها يستطيع Telegram:

```text
مدير الفرع يرسل الإيصال
-> AI يقرأ المبلغ والتاريخ والمرجع
-> يطابق المبلغ المطلوب
-> المحاسب يوافق
-> يحفظ المرفق ويربطه بالإيداع
```

### رفع إيصال Journal مؤكد

طلب الرفع:

```text
POST /purchase/save_attachments
Content-Type: multipart/form-data
```

Multipart Form Data:

```text
attachments[] = binary file
module_id = 121
attach_module = journal_entry
```

Response:

```json
{
  "message": "Attachment Uploaded Successfully !",
  "response_code": 200
}
```

طلب عرض المرفقات:

```text
POST /purchase/loadAttachmentData

module=journal_entry
module_id=121
```

الاستجابة الأولى قبل تحديث القائمة:

```json
{
  "draw": "1",
  "recordsTotal": 0,
  "recordsFiltered": 0,
  "data": []
}
```

يبدو أن طلب العرض تم قبل الرفع أوأن القائمة لم تُحدّث بعد. لذلك نجاح
`save_attachments` وحده لا يكفي لإثبات الربط النهائي. يجب إعادة
`loadAttachmentData` بعد الرفع والتأكد من:

```text
recordsTotal >= 1
File Name
Attachment ID
Module ID = 121
Uploaded Date
```

منطق n8n:

```text
Upload Receipt
-> Require response_code=200
-> Wait briefly
-> Load Attachment Data
-> Verify at least one attachment belongs to Journal 121
-> Mark attachment_status=verified
```

إذا نجح الرفع ولم يظهر الملف في القائمة:

```text
attachment_status=uploaded_unverified
```

ولا يعيد رفع الملف تلقائيًا حتى لا ينشئ مرفقات مكررة.

### التحقق النهائي من إيصال Journal 121

بعد إعادة فتح المرفقات أعاد POS:

```text
recordsTotal: 1
recordsFiltered: 1
Attachment ID: 1800
File Name: download.png
Module: journal_entry
Uploaded At: 2026-06-14 04:12:27
Uploaded By: Sanad Manger
```

رابط العرض:

```text
/userdatas/clients/inout/attachments/journal_entry/download.png
```

النتيجة النهائية:

```text
journal_id = 121
deposit_amount = AED 3,770.00
attachment_id = 1800
attachment_status = verified
deposit_status = registered_with_receipt
```

أصبح لدينا مسار إيداع كامل ومؤكد:

```text
Create Journal
-> Verify Journal Details
-> Upload Receipt
-> Reload Attachments
-> Verify Attachment ID
-> Confirm Registration in Telegram
```

---

## 6. تسوية Credit Card

المبيعات بالبطاقة تدخل في:

```text
Credit Card / 33777
```

لكن المبلغ قد يصل إلى البنك:

- في يوم لاحق.
- بعد خصم رسوم.
- مجمعًا لعدة أيام.

نحتاج مثال عملية تحويل أوتسوية:

```text
Credit Card -> ADIB BANK
```

أرسل طلب الحفظ والقيد.

القيد المتوقع دون رسوم:

```text
Debit  ADIB BANK
Credit Credit Card
```

ومع الرسوم:

```text
Debit  ADIB BANK
Debit  Bank & Transaction Fees / 62645
Credit Credit Card
```

نحتاج كذلك:

```text
Settlement Reference
Settlement Date
Gross Card Amount
Bank Received Amount
Fee Amount
Batch Number
```

### حالة الاستخدام الحالية

أكد المستخدم أن تسويات Credit Card إلىADIB BANK لا تسجل داخل POS حاليًا.
لذلك:

```text
status = not_used
```

لن نبني Workflow كتابة لهذه العملية. تبقى مطابقة البطاقة ممكنة مستقبلًا من
كشف البنك أوكشف شركة الدفع، خارج POS.

---

## 7. كشف البنك الفعلي

POS يعرض الرصيد الدفتري فقط. المطابقة النهائية تحتاج كشف ADIB:

```text
CSV / XLSX / PDF
```

الحقول المطلوبة:

```text
Transaction Date
Value Date
Reference
Description
Debit
Credit
Balance
```

سيطابق النظام:

- إيداعات الكاش.
- تسويات البطاقات.
- رسوم البنك.
- التحويلات.
- المصروفات البنكية.
- الحركات غير المعروفة.

---

## 8. الجرد الفعلي للصندوق

الرصيد الدفتري لا يكفي. نحتاج إدخال:

```text
Actual Cash Count
Counted By
Counted At
Branch
Photo / Evidence
```

المعادلة:

```text
Cash Variance = Actual Cash Count - Expected Cash Balance
```

التصنيف:

```text
0.00                 Matched
±0.01 إلى ±1.00      Small Variance
أكبر من ±1.00        Requires Explanation
أكبر من حد الإدارة   Escalation
```

---

## Workflow الإيداع الأسبوعي المؤكد

### 1. حساب المبلغ

لكل فرع وفترة أسبوعية مغلقة:

```text
Gross Cash Available =
  Cash Receipts
  - Approved Cash Expenses

Pending Deposit =
  Gross Cash Available
  - Cash Bank Deposits already registered for the same coverage period
  +/- Approved Previous Variance
```

مصدر Cash Receipts وCash Expenses:

```text
Counter Cash Report
Cash Account Flow Report
Cash Account Ledger
```

مصدر الإيداعات السابقة:

```text
Journal Entries:
Credit Cash Account / 1
Debit ADIB BANK / 34127
```

### 2. إرسال أمر الإيداع

مثال Telegram:

```text
تقرير الإيداع الأسبوعي
الفرع: AL FALAH
الفترة: 08-06-2026 إلى 14-06-2026

Cash Received: AED ...
Cash Expenses: AED ...
Deposits Already Registered: AED ...
Required Deposit: AED ...

يرجى إيداع المبلغ في ADIB وإرسال صورة الإيصال.
```

الأزرار:

```text
[تم الإيداع] [طلب مراجعة المبلغ] [يوجد فرق] [عرض التفاصيل]
```

### 3. استلام الإيصال

يستخرج AI من الصورة أوPDF:

```text
Deposit Amount
Deposit Date
Bank Reference
Branch
Account / Bank
```

ثم يطابق:

```text
Receipt Amount = Required Deposit
Receipt Date ضمن الفترة المسموحة
Bank = ADIB
Reference غير مستخدم سابقًا
```

أي اختلاف يذهب للمحاسب للموافقة أوالتعديل.

### 4. إنشاء التسوية بعد الموافقة

```text
POST /accounts/save_journal_entry
```

القيد:

```text
Credit Cash Account / 1
Debit  ADIB BANK / 34127
```

يحفظ في:

```text
remark1 = Bank Deposit Reference
Cash line notes = Weekly deposit coverage period
ADIB line notes = Weekly deposit coverage period
```

### 5. التحقق والمرفق

```text
Create Journal
-> Save p_id
-> POST /accounts/fecthJournalDetails
-> Verify amount, accounts, branch, date and balance
-> POST /purchase/save_attachments
   module_id = Journal ID
   attach_module = journal_entry
-> POST /purchase/loadAttachmentData
-> Verify Attachment ID
```

### 6. منع التكرار

مفتاح التسوية:

```text
branch_id + coverage_from + coverage_to + deposit_reference
```

لا ينشئ Workflow Journal جديدًا إذا:

- توجد تسوية مكتملة للفترة والفرع.
- مرجع الإيداع مستخدم سابقًا.
- Response الحفظ نجح حتى لو تعذر التحقق اللاحق.

حالات العملية:

```text
calculated
awaiting_branch_deposit
receipt_received
awaiting_accountant_approval
journal_created
attachment_verified
reconciled
exception
```

---

## Workflow المقترح

```text
Weekly Schedule
-> Fetch Counter Cash
-> Fetch Cash Ledger
-> Fetch Existing Cash-to-ADIB Journals
-> Calculate Required Deposit
-> Send Deposit Order to Branch Manager
-> Receive and Analyze Deposit Receipt
-> Accountant Approval
-> Create Cash-to-ADIB Journal
-> Verify Journal
-> Upload and Verify Receipt
-> Close Weekly Reconciliation
```

أزرار Telegram:

```text
[تم الإيداع] [رفع الإيصال]
[تأكيد الجرد] [شرح الفرق]
[اعتماد التسوية] [فتح الحركات]
```

---

## التقارير الناتجة

### تقرير الفرع اليومي

```text
Cash Collected
Cash Expenses
Expected Cash
Actual Cash
Cash Variance
Deposited Today
Pending Deposit
Card Collected
Card Settled
Card Pending Settlement
Bank Balance
Unmatched Bank Transactions
```

### تنبيه الإيداع

```text
الفرع: AL FALAH
الفترة: ...
الكاش المحصل: AED ...
المصروفات النقدية: AED ...
الإيداعات المسجلة: AED ...
المبلغ المطلوب إيداعه: AED ...
```

---

## ترتيب جمع البيانات

1. تم تأكيد `Cash A/c Flow Report` ليوم واحد وفرع واحد.
2. `Cash & Bank Flow Report` غير متاح في الواجهة الحالية.
3. تم تأكيد Ledger حساب `ADIB BANK / 34127`.
4. تم تأكيد Ledger حساب `Cash Account / 1`.
5. تم تأكيد Ledger حساب `Credit Card / 33777`.
6. بيانات وتصنيف حساب ADIB من Chart of Accounts.
7. تم تأكيد طريقة فتح Journal Entry والتحقق من توازنه.
8. تم تأكيد Journal إيداع Cash إلىADIB BANK.
9. تم تأكيد حفظ Journal Entry وإعادة فتحه والتحقق منه.
10. تم تأكيد رفع إيصال Journal والتحقق من ظهوره وربطه بالقيد.
11. تسوية Credit Card داخل POS غير مستخدمة وتم تجاوزها.
12. نموذج كشف ADIB.

## حالة التنفيذ

تم إنشاء الإصدار الأول من Workflow التقرير والإيداع الأسبوعي في:

```text
n8n-pos-weekly-cash-deposit-reconciliation.json
scripts/generate-n8n-weekly-cash-deposit-workflow.cjs
N8N_WEEKLY_CASH_DEPOSIT_WORKFLOW.md
```

يشمل الإصدار الحالي:

- قراءة تقرير Cash Flow وLedger الكاش لكل فرع.
- حساب مبلغ الإيداع للأسبوع السابق.
- موافقة مدير الفرع واستقبال إيصال Telegram.
- استخراج بيانات الإيصال وإرسالها لموافقة المحاسب.
- إنشاء قيد Cash إلىADIB مرة واحدة بعد الموافقة.
- إعادة فتح Journal والتحقق منه.
- رفع الإيصال والتحقق من ظهوره في المرفقات.
- منع التكرار حسب التسوية وBank Reference.

الخطوة التالية هي استيراد Workflow بحالة Inactive، وتشغيل `Manual Test` على
فرع وفترة محددين، ومطابقة أرقام التقرير مع POS قبل السماح بأول Journal حي.
