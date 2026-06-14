# Branch Invoice Image to POS Expense Workflow

هذا هو workflow المطلوب للفواتير التي يرسلها مدير الفرع كصورة في قروب الفرع.

## الهدف

1. المدير يرسل صورة الفاتورة في قروب الفرع.
2. n8n يستقبل الصورة.
3. الذكاء الاصطناعي يقرأ الفاتورة ويستخرج البيانات.
4. النظام يختار حساب المصروف المناسب من الحسابات الموجودة في POS.
5. إذا الحساب موجود، يسجل الفاتورة مباشرة في POS.
6. إذا الحساب غير موجود، يرسل تنبيه اعتماد لإنشاء حساب جديد أو اختيار حساب بديل.

## المسار العملي في n8n

```text
Telegram / WhatsApp Group
        ↓
Receive Invoice Image
        ↓
Download Image
        ↓
AI Invoice OCR + Classification
        ↓
Search POS Expense Accounts
        ↓
IF account found
        ↓
Create POS Expense
        ↓
Send confirmation to branch group
```

وفي حالة عدم وجود الحساب:

```text
AI Invoice OCR + Classification
        ↓
Search POS Expense Accounts
        ↓
No confident account match
        ↓
Send approval message to management
        ↓
Manager chooses:
  - existing account
  - create new account
        ↓
Continue POS Expense Registration
```

## البيانات التي يستخرجها AI من صورة الفاتورة

```json
{
  "supplier_name": "ADNOC Distribution",
  "invoice_no": "327",
  "invoice_date": "2026-06-10",
  "currency": "AED",
  "subtotal": 100.00,
  "vat_amount": 5.00,
  "total": 105.00,
  "expense_category": "petrol exp",
  "description": "Fuel purchase",
  "confidence": 0.92
}
```

## مطابقة الحسابات في POS

الـ workflow يستخدم endpoint الموجود في ملفات Aipsost:

```text
POST /purchase_api/accountHeadList/{client_identifier}/{search}
```

أمثلة حسابات موجودة من `expense.md`:

```text
36460 Chemicals Purchases
44291 petrol exp
44337 Car Expenses
44775 maintenance machine
46298 rents
52253 Internet+Phone
54265 WATER-Electricity
61639 IT & Software
66280 Health Insurance Expense
66281 Trade License Fees
66287 Traffic Fines
```

إذا رجع الحساب بثقة عالية، يتم استخدام `account_head` في تسجيل المصروف.

## تسجيل الفاتورة في POS

يتم استخدام workflow الموجود:

```text
n8n-pos-expense-invoice-auto-login.json
```

وهو يسجل المصروف عبر:

```text
/purchase_api/hold_expense
/purchase_api/save_expense_details
/purchase_api/approve_expense_data
```

## إنشاء حساب جديد

حتى الآن، ملفات Aipsost الموجودة عندنا لا تحتوي endpoint إنشاء حساب جديد. الموجود فقط:

```text
/purchase_api/accountHeadList
```

لذلك لا أنصح أن نخترع endpoint لإنشاء حسابات مالية، لأن هذا قد يسجل الحساب في مكان أو parent group خطأ.

المطلوب منك لاحقاً:

1. افتح شاشة إنشاء حساب جديد في POS.
2. افتح Network.
3. أنشئ حساب تجريبي مثل:

```text
AI TEST EXPENSE ACCOUNT
```

4. انسخ request كامل في ملف جديد مثلاً:

```text
Aipsost/resources/create_account.md
```

بعدها نضيف خطوة:

```text
No account found → create account → use new account id → save expense
```

## قرار الأمان المقترح

في المرحلة الأولى:

- إذا AI وجد حساب مناسب: يسجل تلقائياً.
- إذا لم يجد حساب مناسب: لا ينشئ حساب تلقائياً، بل يرسل طلب اعتماد.

هذا أفضل للمحاسبة لأن إنشاء حسابات مالية بالخطأ يسبب فوضى في شجرة الحسابات.

## Webhook Payload إلى Workflow تسجيل المصروف

بعد قراءة الصورة ومطابقة الحساب، يرسل AI هذه البيانات إلى workflow المصروفات:

```json
{
  "branch_id": "1",
  "pay_account": "PAY_ACCOUNT_ID",
  "date": "2026-06-10",
  "bill_date": "2026-06-10",
  "bill_no": "327",
  "remark": "ADNOC Distribution - Fuel purchase",
  "vendor_id": "",
  "lines": [
    {
      "account_head": "44291",
      "notes": "ADNOC Distribution - Bill #327",
      "amount": 100.00,
      "tax_amount": 5.00,
      "total": 105.00
    }
  ]
}
```

## n8n Variables المطلوبة

```text
POS_USERNAME
POS_PASSWORD
AIPSOFT_API_USER_ID
AIPSOFT_DEFAULT_PAY_ACCOUNT_ID
OPENAI_API_KEY
TELEGRAM_BOT_TOKEN
```

إذا كنت تستخدم WhatsApp بدلاً من Telegram، نستبدل `TELEGRAM_BOT_TOKEN` ببيانات provider الخاص بالواتساب.
