# Weekly Cash Deposit Reconciliation Workflow

## الملفات

```text
n8n-pos-weekly-cash-deposit-reconciliation.json
scripts/generate-n8n-weekly-cash-deposit-workflow.cjs
```

أعد توليد ملف الاستيراد بعد أي تعديل:

```bash
node scripts/generate-n8n-weekly-cash-deposit-workflow.cjs
```

## ما ينفذه

1. يعمل كل يوم اثنين الساعة 08:00 بتوقيت دبي على الأسبوع السابق.
2. يقرأ `Account Cash Flow Report` وLedger حساب الكاش لكل فرع.
3. يحسب المقبوضات والمصروفات والإيداعات المسجلة والمبلغ المطلوب إيداعه.
4. يرسل أمر الإيداع إلى مدير الفرع في Telegram.
5. يستقبل صورة أوPDF لإيصال ADIB ويستخرج المبلغ والتاريخ والمرجع.
6. يرسل النتيجة للمحاسب ولا يكتب في POS قبل موافقته الصريحة.
7. ينشئ قيدًا واحدًا: Credit Cash Account وDebit ADIB BANK.
8. يعيد فتح Journal ويتحقق من الحسابات والمبلغ وعدم وجود Hold.
9. يرفع الإيصال ويراجع ظهوره في مرفقات Journal.
10. يمنع تكرار القيد لنفس التسوية أوBank Reference.

## المتغيرات المطلوبة في n8n

```text
POS_USERNAME
POS_PASSWORD
TELEGRAM_ALLOWED_CHAT_ID
CASH_ACCOUNTANT_CHAT_ID
CASH_BRANCHES_JSON
```

مثال الفروع:

```json
[
  {
    "id": "1",
    "name": "AL FALAH",
    "manager_chat_id": "123456789"
  }
]
```

متغيرات اختيارية:

```text
AIPSOFT_API_BASE_URL=https://beta.aipsoft.com/inout
AIPSOFT_CLIENT_IDENTIFIER=inout
OPENAI_MODEL=gpt-4.1-mini
CASH_ACCOUNT_ID=1
CASH_ACCOUNT_NAME=Cash Account
CASH_BANK_ACCOUNT_ID=34127
CASH_RECEIPT_AMOUNT_TOLERANCE=0.50
CASH_COVERAGE_FROM=2026-06-08
CASH_COVERAGE_TO=2026-06-14
CASH_NEXT_JOURNAL_NO=
```

استخدم `CASH_COVERAGE_FROM` و`CASH_COVERAGE_TO` في الاختبار فقط، ثم احذفهما ليحسب Workflow الأسبوع السابق تلقائيًا.

## الإعداد والاختبار الآمن

1. استورد ملف JSON واترك Workflow في حالة Inactive.
2. اختر Telegram Credential في جميع عقد Telegram.
3. اختر OpenAI Credential في عقدة استخراج الإيصال.
4. أدخل فترة اختبار وفرعًا واحدًا.
5. شغّل `Manual Test` وتأكد أن أرقام التقرير تطابق POS.
6. اختبر دورة Telegram حتى شاشة موافقة المحاسب.
7. استخدم إيصالًا وقيمة اختبار معتمدة قبل الضغط على إنشاء القيد.
8. تأكد من Journal والمرفق داخل POS، ثم فعّل الجدولة.

> Telegram يسمح Webhook واحدًا لكل Bot. استخدم Bot مستقلًا لهذا Workflow، أو ادمج مساراته في Workflow البوت الحالي قبل التفعيل.
