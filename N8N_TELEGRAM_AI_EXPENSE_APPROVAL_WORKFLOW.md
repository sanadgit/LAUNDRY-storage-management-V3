# n8n Telegram AI Expense Approval Workflow

هذا الملف يشرح workflow كامل لإدخال فواتير المصروفات من قروب الفرع عبر Telegram.

الفكرة:

```text
Telegram group
  -> manager sends invoice as text / image / PDF
  -> AI extracts invoice data
  -> bot sends review message
  -> manager approves or edits
  -> n8n sends approved payload to Smart Hub
  -> Smart Hub registers expense in POS
  -> bot replies with Expense ID
```

## لماذا عبر Smart Hub وليس POS مباشرة؟

لأننا اختبرنا التسجيل من Smart Hub واشتغل فعلياً، واكتشفنا نقطة مهمة:

```text
Paid By must be saved correctly.
```

إذا لم يصل `paid_by_id` أو `paid_user_id` بشكل صحيح، الفاتورة قد تتسجل لكنها لا تظهر في كشوفات الفواتير المسجلة إلا بعد تعديلها يدوياً داخل POS.

لذلك workflow Telegram يجب أن يسجل عبر endpoint Smart Hub:

```text
POST /api/pos/expenses/test-create
```

وليس عبر POS مباشرة.

## Endpoints المطلوبة من Smart Hub

### 1. Login

```http
POST /api/login
Content-Type: application/json
```

Body:

```json
{
  "username": "SMART_HUB_USERNAME",
  "password": "SMART_HUB_PASSWORD"
}
```

Response:

```json
{
  "token": "APP_SESSION_TOKEN"
}
```

استخدمه في الطلبات التالية:

```http
Authorization: Bearer APP_SESSION_TOKEN
```

### 2. Search Expense Accounts

```http
GET /api/pos/expenses/accounts?q=petrol
Authorization: Bearer APP_SESSION_TOKEN
```

يرجع حسابات المصروفات الموجودة في POS.

### 3. Create Expense

```http
POST /api/pos/expenses/test-create
Authorization: Bearer APP_SESSION_TOKEN
Content-Type: application/json
```

Payload مهم:

```json
{
  "user_id": "AIPSOFT_API_USER_ID",
  "paid_by": "SAOOD",
  "paid_by_id": "SAOOD_USER_ID",
  "branch_id": "1",
  "pay_account": "PAY_ACCOUNT_ID",
  "date": "2026-06-11",
  "bill_date": "2026-06-11",
  "bill_no": "INV-1001",
  "remark": "ADNOC Distribution - fuel invoice",
  "vendor_id": "",
  "project_id": "",
  "order_no": "",
  "expense_type": "2",
  "lines": [
    {
      "account_head": "44291",
      "notes": "ADNOC Distribution - Bill INV-1001",
      "amount": 100,
      "tax_amount": 5,
      "total": 105
    }
  ]
}
```

## n8n Variables

استخدم n8n Variables أو قيم ثابتة داخل Code nodes. لا تستخدم `$env` لأن السيرفر عندك يمنع env access داخل nodes.

```text
SMART_HUB_BASE_URL=https://YOUR_SMART_HUB_DOMAIN
SMART_HUB_USERNAME=YOUR_SMART_HUB_MANAGER_USER
SMART_HUB_PASSWORD=YOUR_SMART_HUB_PASSWORD

TELEGRAM_ALLOWED_CHAT_ID=-100xxxxxxxxxx
TELEGRAM_ADMIN_CHAT_ID=-100xxxxxxxxxx

DEFAULT_BRANCH_ID=1
DEFAULT_BRANCH_NAME=AL FALAH
DEFAULT_PAY_ACCOUNT_ID=PAY_ACCOUNT_ID
DEFAULT_PAID_BY_NAME=SAOOD
DEFAULT_PAID_BY_ID=SAOOD_USER_ID
AIPSOFT_API_USER_ID=SAOOD_USER_ID
```

Credentials:

```text
Telegram Bot Credential
OpenAI / AI Model Credential
```

## Workflow Nodes

### Node 1: Telegram Trigger

Trigger on:

```text
message
callback_query
```

يقبل:

```text
text
photo
document/pdf
```

### Node 2: Guard Chat

Code node يتأكد أن الرسالة من قروب الفرع أو الإدارة فقط.

يرفض أي chat غير مصرح:

```js
const allowed = String($vars.TELEGRAM_ALLOWED_CHAT_ID || '');
const chatId = String($json.message?.chat?.id || $json.callback_query?.message?.chat?.id || '');
if (allowed && chatId !== allowed) return [];
return items;
```

### Node 3: Detect Input Type

Code node يحدد نوع المدخل:

```json
{
  "input_type": "text | image | pdf",
  "telegram_file_id": "...",
  "caption": "...",
  "message_text": "..."
}
```

المنطق:

```text
message.text -> text
message.photo[last].file_id -> image
message.document.mime_type == application/pdf -> pdf
```

### Node 4: Download Telegram File

للصور و PDF:

1. Telegram node: `Get File`
2. HTTP Request node: download file from:

```text
https://api.telegram.org/file/bot<TOKEN>/<file_path>
```

الناتج يكون binary.

### Node 5: AI Invoice Extraction

AI يستخرج بيانات الفاتورة من النص/الصورة/PDF.

Prompt مقترح:

```text
You are an accounting assistant for IN AND OUT LAUNDRY UAE.
Extract invoice expense data from the provided text/image/PDF.
Return JSON only. No markdown.

Required JSON schema:
{
  "supplier_name": "string",
  "invoice_no": "string",
  "invoice_date": "YYYY-MM-DD",
  "currency": "AED",
  "subtotal": number,
  "vat_amount": number,
  "total": number,
  "description": "string",
  "suggested_account_query": "string",
  "suggested_account_name": "string",
  "confidence": number,
  "needs_human_review": boolean,
  "warnings": ["string"]
}

Rules:
- UAE VAT is usually 5%.
- If total includes VAT, split subtotal and VAT if possible.
- If invoice number is missing, use empty string.
- If date is missing, use today's Dubai date and add warning.
- suggested_account_query should be short: petrol, chemicals, rent, water, electricity, internet, software, visa, insurance, maintenance, salary.
- Never invent supplier TRN or invoice number.
```

### Node 6: Login to Smart Hub

HTTP Request:

```http
POST {{$vars.SMART_HUB_BASE_URL}}/api/login
```

Body:

```json
{
  "username": "={{$vars.SMART_HUB_USERNAME}}",
  "password": "={{$vars.SMART_HUB_PASSWORD}}"
}
```

Save token:

```text
{{$json.token}}
```

### Node 7: Search POS Expense Account

HTTP Request:

```http
GET {{$vars.SMART_HUB_BASE_URL}}/api/pos/expenses/accounts?q={{$json.suggested_account_query}}
Authorization: Bearer {{Smart Hub token}}
```

### Node 8: Match Account

Code node يختار أفضل حساب.

قواعد مقترحة:

```text
petrol/fuel/adnoc -> 44291 petrol exp
chemical/detergent/laundry supplies -> 36460 Chemicals Purchases
car/vehicle/repair -> 44337 Car Expenses
maintenance/machine -> 44775 maintenance machine
rent -> 46298 rents
internet/phone/du/etisalat -> 52253 Internet+Phone
water/electricity/taqa -> 54265 WATER-Electricity
software/it -> 61639 IT & Software
insurance -> 66280 or 66285
traffic/fine/police -> 66287 Traffic Fines
unknown -> 33958 Miscellaneous Account
```

إذا الثقة أقل من `0.75`:

```json
{
  "needs_human_review": true
}
```

ولا يتم التسجيل حتى الموافقة.

### Node 9: Save Draft

استخدم n8n Data Store أو Google Sheet أو DB.

Draft shape:

```json
{
  "draft_id": "EXP-20260611-001",
  "telegram_chat_id": "-100xxxx",
  "telegram_message_id": "123",
  "status": "pending_approval",
  "extracted": {},
  "payload": {}
}
```

### Node 10: Send Approval Message

Telegram message إلى قروب الفرع أو الإدارة:

```text
فاتورة جاهزة للمراجعة

Draft: EXP-20260611-001
الفرع: AL FALAH
Paid By: SAOOD
Paid By ID: 123
Pay Account: Credit

المورد: ADNOC Distribution
رقم الفاتورة: 327
التاريخ: 2026-06-11
حساب المصروف: petrol exp (44291)
الوصف: Fuel purchase
المبلغ قبل الضريبة: AED 100.00
VAT: AED 5.00
الإجمالي: AED 105.00

اكتب:
موافق EXP-20260611-001

أو للتعديل:
تعديل EXP-20260611-001 account_head=36460 amount=120 vat=6 bill_no=12345

أو:
إلغاء EXP-20260611-001
```

يمكن استخدام inline keyboard:

```text
✅ موافق
✏️ تعديل
❌ إلغاء
```

لكن النص بالأوامر أسهل وأثبت في البداية.

## Approval Flow

### Case 1: Approve

المدير يكتب:

```text
موافق EXP-20260611-001
```

n8n:

1. يقرأ draft من Data Store.
2. يعمل Login إلى Smart Hub.
3. يرسل payload إلى:

```text
POST /api/pos/expenses/test-create
```

4. يرد في Telegram:

```text
تم تسجيل المصروف بنجاح
Expense ID: 3087
الإجمالي: AED 105.00
الحساب: petrol exp
Paid By: SAOOD
```

### Case 2: Need Edit

المدير يكتب:

```text
تعديل EXP-20260611-001 amount=110 tax_amount=5.50 total=115.50 account_head=44291
```

أو بلغة طبيعية:

```text
تعديل EXP-20260611-001
غير الحساب إلى Chemicals Purchases وخلي المبلغ 250 والضريبة 12.5
```

n8n:

1. AI parses edit instruction.
2. Updates draft.
3. Sends review message again.

### Case 3: Cancel

```text
إلغاء EXP-20260611-001
```

n8n updates draft:

```json
{
  "status": "cancelled"
}
```

ويرد:

```text
تم إلغاء تسجيل الفاتورة.
```

## Final Smart Hub Payload

بعد الموافقة، payload النهائي يجب أن يحتوي `paid_by_id`:

```json
{
  "user_id": "SAOOD_USER_ID",
  "paid_by": "SAOOD",
  "paid_by_id": "SAOOD_USER_ID",
  "branch_id": "1",
  "pay_account": "PAY_ACCOUNT_ID",
  "date": "2026-06-11",
  "bill_date": "2026-06-11",
  "bill_no": "327",
  "remark": "ADNOC Distribution - Fuel purchase",
  "vendor_id": "",
  "project_id": "",
  "order_no": "",
  "expense_type": "2",
  "lines": [
    {
      "account_head": "44291",
      "notes": "ADNOC Distribution - Bill #327",
      "amount": 100,
      "tax_amount": 5,
      "total": 105
    }
  ]
}
```

## Important Checks

قبل تسجيل المصروف:

- `paid_by_id` موجود.
- `pay_account` موجود.
- `account_head` موجود.
- `total > 0`.
- إذا VAT موجودة، `amount + tax_amount = total`.
- إذا رقم الفاتورة فارغ، يطلب موافقة بشرية.
- إذا الحساب غير مؤكد، لا يسجل تلقائياً.

## Create New Account

حالياً لا ننشئ حساب جديد تلقائياً لأننا لم نحصل بعد على Network request الخاص بزر:

```text
+ Add Account
```

المسار الصحيح حالياً:

```text
Account not found
  -> ask manager to choose existing account
  -> or wait for create-account endpoint
```

بعد تزويدي بملف Network لإنشاء حساب جديد، نضيف خطوة:

```text
No account found
  -> create account under correct group
  -> use returned account id
  -> continue approval
```

## Recommended First Version

ابدأ بـ 3 workflows منفصلة:

### Workflow A: Telegram Intake + AI Extraction

يستقبل الرسالة، يحللها، يحفظ draft، ويرسل طلب موافقة.

### Workflow B: Telegram Approval/Edit Handler

يتعامل مع:

```text
موافق
تعديل
إلغاء
```

### Workflow C: Register Approved Expense

يسجل في Smart Hub/POS ويرجع `Expense ID`.

هذا التقسيم أسهل في الاختبار من workflow واحد ضخم.

## Test Scenario

1. أرسل صورة فاتورة في قروب Telegram.
2. تأكد أن البوت رد بملخص.
3. اكتب:

```text
موافق DRAFT_ID
```

4. تأكد أن الرد يحتوي:

```text
Expense ID: ####
```

5. افتح POS وتأكد أنها تظهر في كشف الفواتير المسجلة، خصوصاً أن `Paid By` ظاهر كـ `SAOOD`.

إذا لم تظهر، افحص أولاً:

```text
paid_by_id
pay_account
branch_id
expense_type
```

## Importable n8n JSON

تم تجهيز ملف workflow قابل للاستيراد في n8n:

```text
n8n-telegram-ai-expense-approval-smart-hub.json
```

وفيه 3 nodes:

```text
Setup Notes
Telegram Webhook
Telegram AI Expense Bot
```

الـ Webhook path:

```text
telegram-ai-expense-approval
```

وعلى سيرفر n8n عندك يكون الرابط:

```text
https://n8n.inandoutuae.com/webhook/telegram-ai-expense-approval
```

بعد استيراد وتشغيل الـ workflow، اربط Telegram webhook:

```text
https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://n8n.inandoutuae.com/webhook/telegram-ai-expense-approval
```

### Variables Required in n8n

لا تستخدم `$env` داخل nodes. أضف هذه القيم من n8n Variables:

```text
TELEGRAM_BOT_TOKEN
TELEGRAM_ALLOWED_CHAT_ID
OPENAI_API_KEY
OPENAI_MODEL
SMART_HUB_BASE_URL
SMART_HUB_USERNAME
SMART_HUB_PASSWORD
DEFAULT_BRANCH_ID
DEFAULT_BRANCH_NAME
DEFAULT_PAY_ACCOUNT_ID
DEFAULT_PAY_ACCOUNT_NAME
DEFAULT_PAID_BY_NAME
DEFAULT_PAID_BY_ID
AIPSOFT_API_USER_ID
DEFAULT_EXPENSE_TYPE
```

أهم قيمة للتأكد منها:

```text
DEFAULT_PAID_BY_ID
```

لأنها تحفظ `Paid By` في POS، وبدونها قد تتسجل الفاتورة لكن لا تظهر بشكل صحيح في كشوفات الفواتير المسجلة.

### Generator File

تم أيضاً إضافة مولد للملف حتى نقدر نعدل workflow لاحقاً بسهولة:

```text
scripts/generate-n8n-telegram-ai-expense-workflow.cjs
```

لإعادة توليد JSON:

```bash
node scripts/generate-n8n-telegram-ai-expense-workflow.cjs
```

## Direct POS Importable JSON

تم تجهيز نسخة ثانية لا تستخدم Smart Hub، بل تسجل في POS مباشرة عن طريق login:

```text
n8n-telegram-ai-expense-approval-direct-pos.json
```

هذه النسخة تستخدم:

```text
Telegram
-> AI extraction
-> Approval/Edit in Telegram
-> POS auto login
-> purchase_api/hold_expense
-> purchase_api/save_expense_details
-> purchase_api/approve_expense_data
```

Webhook path:

```text
telegram-ai-expense-direct-pos
```

رابط webhook على سيرفر n8n:

```text
https://n8n.inandoutuae.com/webhook/telegram-ai-expense-direct-pos
```

ربط Telegram لهذه النسخة:

```text
https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://n8n.inandoutuae.com/webhook/telegram-ai-expense-direct-pos
```

### Direct POS Variables

هذه النسخة لا تحتاج:

```text
SMART_HUB_BASE_URL
SMART_HUB_USERNAME
SMART_HUB_PASSWORD
```

وتحتاج بدلاً منها:

```text
POS_USERNAME
POS_PASSWORD
AIPSOFT_CLIENT_IDENTIFIER=inout
AIPSOFT_API_BASE_URL=https://beta.aipsoft.com/inout
```

وباقي القيم كما هي:

```text
TELEGRAM_BOT_TOKEN
TELEGRAM_ALLOWED_CHAT_ID
OPENAI_API_KEY
OPENAI_MODEL
DEFAULT_BRANCH_ID
DEFAULT_BRANCH_NAME
DEFAULT_PAY_ACCOUNT_ID
DEFAULT_PAY_ACCOUNT_NAME
DEFAULT_PAID_BY_NAME
DEFAULT_PAID_BY_ID
AIPSOFT_API_USER_ID
DEFAULT_EXPENSE_TYPE
```

تم إضافة `paid_by`, `paid_by_id`, و `paid_user_id` داخل خطوات POS المباشرة حتى لا تتكرر مشكلة عدم ظهور الفاتورة في كشوفات الفواتير المسجلة.

### Direct POS Generator

ملف التوليد:

```text
scripts/generate-n8n-telegram-ai-expense-direct-pos-workflow.cjs
```

لإعادة توليد JSON:

```bash
node scripts/generate-n8n-telegram-ai-expense-direct-pos-workflow.cjs
```

## Split Nodes Direct POS Version

تم تجهيز نسخة أوضح للقراءة داخل n8n، مقسمة إلى نودز منفصلة بدل وضع كل المنطق في Code node واحد:

```text
n8n-telegram-ai-expense-approval-split-nodes-direct-pos.json
```

عدد النودز:

```text
15 nodes
```

أهم النودز:

```text
Telegram Webhook
Telegram - Normalize And Route
Intake - Prepare File And Prompt
OpenAI - Extract Invoice
OpenAI - Parse Extraction JSON
System POS - Find Expense Account
Draft - Save And Send Approval
Approve - Load Draft
System POS - Register Expense
Telegram - Send Registration Result
Edit - Load Draft And Prepare AI
OpenAI - Parse Edit Request
Draft - Apply Edit And Resend Approval
Cancel - Mark Draft Cancelled
```

Webhook path:

```text
telegram-ai-expense-split-pos
```

رابط webhook:

```text
https://n8n.inandoutuae.com/webhook/telegram-ai-expense-split-pos
```

ربط Telegram:

```text
https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://n8n.inandoutuae.com/webhook/telegram-ai-expense-split-pos
```

هذه النسخة فيها نود OpenAI واضحة:

```text
OpenAI - Extract Invoice
OpenAI - Parse Edit Request
```

وفيها نودز السستم/POS واضحة:

```text
System POS - Find Expense Account
System POS - Register Expense
```

متغيراتها نفس نسخة Direct POS:

```text
TELEGRAM_BOT_TOKEN
TELEGRAM_ALLOWED_CHAT_ID
OPENAI_API_KEY
OPENAI_MODEL
POS_USERNAME
POS_PASSWORD
AIPSOFT_CLIENT_IDENTIFIER
AIPSOFT_API_BASE_URL
DEFAULT_BRANCH_ID
DEFAULT_BRANCH_NAME
DEFAULT_PAY_ACCOUNT_ID
DEFAULT_PAY_ACCOUNT_NAME
DEFAULT_PAID_BY_NAME
DEFAULT_PAID_BY_ID
AIPSOFT_API_USER_ID
DEFAULT_EXPENSE_TYPE
```

ملف التوليد:

```text
scripts/generate-n8n-telegram-ai-expense-split-nodes-workflow.cjs
```

لإعادة توليد JSON:

```bash
node scripts/generate-n8n-telegram-ai-expense-split-nodes-workflow.cjs
```

## Credentials Nodes Version

تم تجهيز نسخة جديدة تعتمد على Credentials الموجودة في n8n بدل كتابة Telegram token أو OpenAI API key داخل الكود:

```text
n8n-telegram-ai-expense-approval-credentials-nodes-direct-pos.json
```

هذه النسخة تستخدم:

```text
Telegram Trigger Credential
Telegram Send Message Credential
OpenAI Credential
POS Variables
```

ولا تستخدم:

```text
TELEGRAM_BOT_TOKEN
OPENAI_API_KEY
```

عدد النودز:

```text
26 nodes
```

أهم النودز:

```text
Telegram Trigger
Telegram - Send Intake Notice
OpenAI - Extract Invoice
System POS - Find Expense Account
Draft - Save And Prepare Approval
Telegram - Send Approval Review
System POS - Register Expense
Telegram - Send Registration Result
OpenAI - Parse Edit Request
Telegram - Send Edit Review
Telegram - Send Cancelled
```

بعد الاستيراد، اختر الـ Credentials الحقيقية في هذه النودز:

```text
Telegram Trigger
Telegram - Send Intake Notice
Telegram - Send Approval Review
Telegram - Send Registration Result
Telegram - Send Edit Review
Telegram - Send Cancelled
OpenAI - Extract Invoice
OpenAI - Parse Edit Request
```

لا تحتاج تعمل `setWebhook` يدوياً لهذه النسخة، لأن `Telegram Trigger` هو الذي يدير webhook من داخل n8n عند تفعيل workflow.

المتغيرات المطلوبة فقط:

```text
TELEGRAM_ALLOWED_CHAT_ID
POS_USERNAME
POS_PASSWORD
```

والمتغيرات الاختيارية:

```text
OPENAI_MODEL
AIPSOFT_CLIENT_IDENTIFIER
AIPSOFT_API_BASE_URL
DEFAULT_BRANCH_NAME
```

ملاحظة مهمة:

```text
هذه النسخة لا تعتمد على DEFAULT_PAY_ACCOUNT_ID أو DEFAULT_PAID_BY_ID.
القيم ثابتة داخل workflow:
AL FALAH = 1
SAOOD = 1
Credit = 0
Cash Account = 1
Credit Card = 33777
ADIB BANK = 34127
Direct Pay / Without party account = 0
Expense Type 2 = 0
```

أزرار Telegram في رسالة المراجعة:

```text
Credit / 0
Cash Account / 1
Credit Card / 33777
ADIB BANK / 34127
موافق
تعديل
إلغاء
```

اختيار الحسابات:

```text
System POS - Find Expense Account يختار Expense Account Name من القائمة المعتمدة في:
expense_account.md/Expense Account Name.md

ويطابق Party A/C من القائمة المعتمدة في:
expense_account.md/Creditors_accounts.md

ثم يحاول مطابقة Party A/C من صفحة POS مباشرة كاحتياط.
إذا لم يجد المورد في Party A/C يتركها:
Direct Pay / Without party account = 0
```

تسجيل المصروف:

```text
النسخة الحالية تستخدم:
accounts/save_expenses2

وليس:
purchase_api/hold_expense
purchase_api/save_expense_details
purchase_api/approve_expense_data

السبب: save_expenses2 هو endpoint شاشة POS الذي يحفظ Paid By.

قبل التسجيل يستدعي:
accounts/latest_expense_id

ثم يرسل الرقم التالي داخل:
expense_no = Voucher

إذا كان مبلغ VAT أكبر من صفر، يرسل داخل سطر المصروف:
taxes = [1]

Tax ID المؤكد من شاشة POS:
VAT (5%) = 1
```

خيارات الفرع في أزرار Telegram:

```text
تم التأكد من صفحة POS:
AL FALAH = 1
MBZ = 2
Musaffah = 3

ملاحظة: Musaffah في POS رقمها 3، و MBZ رقمها 2.
```

حفظ مرفق الفاتورة:

```text
إذا وصلت الفاتورة من Telegram كصورة أو PDF، يحفظ workflow قيمة Telegram file_id فقط داخل Draft.
لا يحفظ الملف Base64 داخل Workflow Static Data حتى لا يستهلك ذاكرة n8n أو يسبب 504.

بعد نجاح تسجيل المصروف وأخذ Expense ID من save_expenses2، يبدأ مسار مستقل تلقائيا:

Attachment - Prepare Upload Job
Telegram - Download Registered Invoice
POS - Prepare Attachment Upload Session
POS HTTP - Upload Expense Attachment
Attachment - Finalize Upload Result
Telegram - Send Attachment Result

ثم يرفع الملف إلى POS عبر:
purchase/save_attachments

Multipart fields:
module_id = Expense ID
attach_module = expenses
attachments[] = الملف الأصلي القادم من Telegram من binary.data

بعدها تصل رسالة Telegram ثانية توضح نجاح أو فشل رفع المرفق.

تم اختبار endpoint مباشرة على POS ونجح رفع ملف فعلي عند استخدام:
module_id + attach_module=expenses + attachments[]

عقدة HTTP Request هي المسؤولة عن بناء multipart/form-data حتى لا يتم تكوين الملف يدويا داخل Code node.
```

ملف التوليد:

```text
scripts/generate-n8n-telegram-ai-expense-credentials-nodes-workflow.cjs
```

لإعادة توليد JSON:

```bash
node scripts/generate-n8n-telegram-ai-expense-credentials-nodes-workflow.cjs
```
