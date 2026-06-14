# n8n Telegram AI Purchase Approval Workflow

## الملفات

```text
n8n-telegram-ai-purchase-approval-direct-pos.json
scripts/generate-n8n-telegram-ai-purchase-workflow.cjs
N8N_TELEGRAM_AI_PURCHASE_APPROVAL_WORKFLOW_PLAN.md
```

## وظيفة Workflow

```text
Telegram text / image / PDF
  -> OpenAI extracts purchase invoice
  -> POS matches Vendor
  -> POS matches every Product
  -> Telegram sends review and buttons
  -> Manager approves, edits, changes branch, or cancels
  -> POS creates each product line separately with save_type=1
  -> POS finalizes purchase with save_type=2
  -> Original Telegram attachment uploads to Purchase ID
```

النسخة الأولى تسجل **شراء آجل**:

```text
Paid Amount = 0
Balance Amount = Grand Total
```

سيتم إضافة Cash وCredit Card بعد التقاط Payload الدفع من POS.

## إدخال فاتورة كنص

يدعم Workflow الحقول العربية بعلامة `:` أو بدونها:

```text
الفرع: AL FALAH / 1
المورد: globe chemicals company / 33996
رقم فاتورة المورد: 28472
تاريخ الفاتورة: 2026-05-14
المبلغ قبل الضريبة 6585
الضريبة 329.25
الاجمالي 6914.25
المنتج items
```

عند وجود منتج واحد دون كمية، يستخدم Workflow كمية `1` ويوزع إجمالي الفاتورة
على هذا المنتج. الربط المؤكد للمنتج `items` هو:

```text
Product ID = 211
Barcode = 95343
```

## حوار التعديل بالذكاء الاصطناعي

بعد الضغط على زر **تعديل**، أرسل التغيير مباشرة خلال 30 دقيقة دون كتابة رقم
`Draft` أو كلمة `تعديل`.

أمثلة:

```text
غير المنتج إلى items وخلي الكمية 2
المبلغ قبل الضريبة 200 والضريبة 10 والإجمالي 210
احذف المنتج الثاني
أضف منتج items بكمية 3 وسعر الوحدة 50 وضريبة 5%
غير المورد إلى globe chemicals company / 33996
غير الفرع إلى Musaffah / 3
رقم فاتورة المورد الصحيح 28499 والتاريخ 2026-05-15
```

يعيد الذكاء الاصطناعي بناء الفاتورة كاملة، ثم يعيد Workflow:

1. مطابقة المورد والمنتجات مع POS.
2. حساب Gross وVAT وGrand Total.
3. عرض مسودة جديدة للموافقة أو تعديل إضافي.

في الصور وملفات PDF يقرأ Workflow رأس الفاتورة وصفوف المنتجات والإجماليات،
ويتجنب اعتبار عناوين الجدول مثل `Product` أو `Description` أسماء منتجات.

## الاستيراد

1. افتح n8n.
2. اختر `Import from File`.
3. استورد:

```text
n8n-telegram-ai-purchase-approval-direct-pos.json
```

4. اختر Telegram Credential في جميع عقد Telegram.
5. اختر OpenAI Credential في:

```text
OpenAI - Extract Purchase Invoice
OpenAI - Parse Purchase Edit
```

6. اضغط `Save`.
7. فعّل Workflow من زر `Active` أعلى الصفحة.

ملف JSON يُستورد بحالة:

```text
Inactive
```

لذلك زر `Execute/Test workflow` يستقبل الرسائل مؤقتاً فقط. بعد انتهاء الاختبار لن تصل رسائل جديدة حتى تفعيل Workflow.

## تنبيه Telegram Bot

Telegram يسمح بـWebhook واحد لكل Bot.

إذا كان Workflow المصروفات يعمل حالياً بنفس Telegram Credential، استخدم أحد الحلين:

1. Bot منفصل للمشتريات، وهو الأسهل لهذه النسخة المستقلة.
2. تعطيل Workflow المصروفات أثناء اختبار Workflow المشتريات.
3. لاحقاً دمج المصروفات والمشتريات خلف Telegram Trigger واحد وعقدة Router.

لا تفعّل Workflowين يحتويان Telegram Trigger مستقلًا بنفس Bot في الوقت نفسه.

## إعداد Bot داخل القروب

من `@BotFather`:

```text
/setprivacy
اختر Purchase Bot
Disable
```

بعدها:

1. احذف Bot من القروب وأضفه مرة أخرى، أو اجعله Admin.
2. أرسل `/start` للبوت في المحادثة الخاصة مرة واحدة.
3. تأكد أن `TELEGRAM_ALLOWED_CHAT_ID` يحتوي رقم قروب Purchase بصيغة `-100...`.
4. افتح `Telegram Trigger - Purchase` وتأكد من:

```text
Download Images/Files = ON
Image Size = Large
Restrict to Chat IDs = TELEGRAM_ALLOWED_CHAT_ID
```

ثم احفظ وفعّل Workflow.

## n8n Variables

مطلوب:

```text
TELEGRAM_ALLOWED_CHAT_ID
POS_USERNAME
POS_PASSWORD
```

اختياري:

```text
OPENAI_MODEL=gpt-4.1-mini
AIPSOFT_API_BASE_URL=https://beta.aipsoft.com/inout
AIPSOFT_CLIENT_IDENTIFIER=inout
POS_LOGIN_ENDPOINT=https://beta.aipsoft.com/inout/login/check
POS_PURCHASE_REFERER=https://beta.aipsoft.com/inout/transaction/purchase
POS_ORIGIN=https://beta.aipsoft.com
```

لا يستخدم Workflow:

```text
$env
Telegram Bot Token داخل Code
OpenAI API Key داخل Code
POS Cookie منسوخ يدوياً
```

## الثوابت المؤكدة

```text
Purchase Account = 11
AED Currency = 2
VAT (5%) Tax ID = 1

AL FALAH = 1
MBZ = 2
Musaffah = 3
```

## مسار التسجيل

### طلبات حفظ المنتجات

```text
POST /transaction/save_purchase_details_2

hold=1
save_type=1
final_purchase_product_list[0][...]
purchase_tax_values[0][...]
```

يرسل Workflow طلباً مستقلاً لكل منتج:

```text
المنتج الأول: invoice_id=
المنتج الثاني وما بعده: invoice_id=p_id
```

يجب أن يعيد POS لكل منتج:

```text
response_code=200
status=1
p_id=Purchase ID
details_id=Product Detail ID
```

لن ينتقل Workflow إلى الحفظ النهائي إذا لم يرجع `details_id` لأي منتج.

### طلب الحفظ النهائي

```text
POST /transaction/save_purchase_details_2

hold=0
save_type=2
invoice_id=p_id
```

يجب أن يعيد:

```text
response_code=200
status=2
```

لا يرسل Workflow قيمة في `remark1` أو `remark2`. ملاحظات سطر المنتج تحفظ في
`final_purchase_product_list[0][item_note]`.

### التحقق من القيد بعد الحفظ

بعد نجاح `save_type=2` يطلب Workflow:

```text
POST /transaction/journalEntryData
order_id=Purchase ID
order_type=PI
```

ثم يطابق:

```text
Purchase Account Debit = Gross
VAT on Purchase Debit = VAT
Vendor Credit = Grand Total
Debit Total = Credit Total
```

فشل جلب القيد لا يؤدي إلى إعادة إنشاء Purchase؛ يظهر في Telegram أن الحفظ
نجح ولكن التحقق غير متاح.

### إعادة فتح الشراء والتحقق من المنتجات

بعد الحفظ النهائي يطلب Workflow أيضًا:

```text
POST /transaction/fetch_purchase_details

purchase_id=Purchase ID
hold=0
type=0
mode=PURCHASE
```

ويطابق بيانات الرأس والإجماليات وكل صف منتج. التحقق يشمل `details_id`,
`product_id`, `barcode`, `unit_id`, الكمية، المبلغ، VAT، صافي السطر وTax ID.

مثال POS المؤكد:

```text
Purchase ID: 1023
Product: items
details_id: 2609
product_id: 211
barcode: 95343
unit_id: 8
tax_id: 1
```

رسالة النجاح الكامل:

```text
التحقق: القيد والمنتجات متطابقة مع POS
```

إذا نجح أحد الفحصين فقط تظهر نتيجة `تحقق جزئي`. لا يعيد Workflow إنشاء
المشتريات عند تعذر الفحص، حتى لا تتكرر الفاتورة.

## مطابقة المورد والمنتجات

المورد يطابق أولاً مع الحسابات الموجودة في:

```text
expense_account.md/Creditors_accounts.md
```

المنتجات تؤخذ مباشرة من POS:

```text
GET /transaction/fetch_product_with_name_hinds/new_search_2/
POST /transaction/fetch_product_complete_details
```

لا يختار الذكاء الاصطناعي `vendor_id`, `product_id`, `unit_id`, أو `tax_id`.

إذا لم تتم مطابقة مورد أو منتج:

- تحفظ المسودة.
- تظهر أسباب المنع في Telegram.
- يمنع التسجيل.
- يمكن تعديل اسم المورد أو المنتج ثم إعادة المطابقة.

## المرفقات

بعد نجاح التسجيل:

```text
Telegram file_id
  -> binary.data
  -> POST /transaction/save_attachments
```

Multipart:

```text
module_id = Purchase ID
attach_module = purchase
attachments[] = binary.data
```

يرسل Telegram رسالة ثانية توضح نجاح أو فشل رفع المرفق.

## الأزرار

```text
AL FALAH / MBZ / Musaffah
موافق / تعديل / إلغاء
```

اختيار فرع جديد يعيد مطابقة المورد والمنتجات مع الفرع قبل إرسال المراجعة الجديدة.

## إعادة توليد JSON

```powershell
node scripts/generate-n8n-telegram-ai-purchase-workflow.cjs
```

## حدود النسخة الأولى

- الدفع آجل فقط.
- لا تنشئ مورداً جديداً تلقائياً.
- لا تنشئ منتجاً جديداً تلقائياً.
- لا تسجل إذا كان فرق الإجمالي أكبر من `AED 0.01`.
- لا تنفذ اختبار كتابة تلقائياً على POS حتى لا تنشئ فاتورة مشتريات حقيقية دون موافقة.
