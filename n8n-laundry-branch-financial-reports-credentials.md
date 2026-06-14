# n8n Credentials Setup - Laundry Financial Reports

هذا الملف يشرح الـ Credentials والمتغيرات المطلوبة لتشغيل:

`n8n-laundry-branch-financial-reports-automation.json`

## إذا ظهر خطأ access to env vars denied

إذا كان n8n عندك يعرض الخطأ:

```text
access to env vars denied
N8N_BLOCK_ENV_ACCESS_IN_NODE
```

استخدم هذا الملف بدلاً من النسخة الأصلية:

```text
n8n-laundry-branch-financial-reports-automation-no-env.json
```

هذه النسخة لا تستخدم `$env` نهائياً. بعد الاستيراد عدل القيم مباشرة داخل nodes التالية:

- `Smart Hub Login - Daily`
- `Smart Hub Login - Weekly`
- `Smart Hub Login - Monthly`
- `Fetch POS Daily Report`
- `Fetch POS Weekly Report`
- `Fetch POS Monthly Report`
- كل nodes إرسال واتساب التي تحتوي `REPLACE_PHONE_NUMBER_ID`
- `Build Daily WhatsApp Message`
- `Build Weekly Deposit Messages`
- `Build Monthly WhatsApp Message`
- `Check Deposit Receipt Status`
- `Upload Receipt To Storage`

القيمة الافتراضية للـ Smart Hub في نسخة no-env:

```text
http://host.docker.internal:3002
```

إذا n8n ليس داخل Docker أو السيرفر على IP مختلف، غيّرها إلى عنوان جهازك/السيرفر، مثال:

```text
http://192.168.1.50:3002
```

## نسخة Hostinger التي تسحب من POS مباشرة

لأن n8n عندك على:

```text
https://n8n.inandoutuae.com
```

ولأن endpoint التالي غير منشور حالياً على الموقع العام:

```text
https://www.inandoutuae.com/api/pos/report/counter-cash
```

استخدم النسخة الجديدة المفضلة التي تعمل Auto Login بدون نسخ Cookie:

```text
n8n-laundry-branch-financial-reports-auto-login-hostinger.json
```

هذه النسخة:

- لا تستخدم `$env`.
- لا تستخدم `localhost`.
- لا تستخدم `host.docker.internal`.
- لا تحتاج نسخ Cookie يومياً.
- تسجل دخول إلى POS في بداية كل تشغيل، ثم تسحب التقرير مباشرة.

### إعداد POS Login مرة واحدة

بعد استيراد workflow في n8n، افتح كل node من هذه الثلاثة:

```text
Fetch POS Daily Report Auto Login
Fetch POS Weekly Report Auto Login
Fetch POS Monthly Report Auto Login
```

إما تضيف n8n Variables من واجهة n8n:

```text
POS_USERNAME=YOUR_POS_USERNAME
POS_PASSWORD=YOUR_POS_PASSWORD
```

أو تعدل القيم داخل Code node مرة واحدة:

```js
const POS_USERNAME = String(vars.POS_USERNAME || 'REPLACE_POS_USERNAME').trim();
const POS_PASSWORD = String(vars.POS_PASSWORD || 'REPLACE_POS_PASSWORD').trim();
```

وتجعلها مثلاً:

```js
const POS_USERNAME = String(vars.POS_USERNAME || 'your_pos_username').trim();
const POS_PASSWORD = String(vars.POS_PASSWORD || 'your_pos_password').trim();
```

القيم الافتراضية المستخدمة للـ POS:

```text
POS_CLIENT_IDENTIFIER=inout
POS_LOGIN_ENDPOINT=https://beta.aipsoft.com/inout/login/check
POS_LOGIN_REFERER=https://beta.aipsoft.com/inout/sales
POS_ORIGIN=https://beta.aipsoft.com
POS_REPORT_URL=https://beta.aipsoft.com/inout/sales/generate_report
```

إذا تغير رابط POS لاحقاً، يمكن تعديلها بنفس طريقة `POS_USERNAME` و`POS_PASSWORD` من n8n Variables أو داخل Code node.

### نسخة Cookie للاختبار السريع فقط

إذا أردت اختباراً سريعاً بدون وضع username/password، يمكن استخدام النسخة القديمة التي تضرب POS مباشرة:

```text
n8n-laundry-branch-financial-reports-direct-pos-hostinger.json
```

هذه النسخة:

- لا تستخدم `$env`.
- لا تستخدم `localhost`.
- لا تستخدم `host.docker.internal`.
- تسحب مباشرة من:

```text
https://beta.aipsoft.com/inout/sales/generate_report
```

### Credential مطلوب للـ POS

أنشئ Credential في n8n:

```text
Name: POS Session Cookie
Type: HTTP Header Auth
Header Name: Cookie
Header Value: language=english; direction=ltr; inout=...; dont_show_today=true; ci_session_aip_dev=...; inout_last_activity_time=...
```

تحصل على `Header Value` من Network في المتصفح من request:

```text
POST https://beta.aipsoft.com/inout/sales/generate_report
```

انسخ قيمة `cookie` كاملة كما هي.

### ملاحظات عن جلسة POS

- إذا رجع التقرير صفحة login أو خطأ session، حدث قيمة `POS Session Cookie`.
- الأفضل استخدام نسخة Auto Login الجديدة حتى لا تحتاج تحديث Cookie يدوياً.
- الكوكي لا تضعه داخل JSON، فقط داخل Credential في n8n.

## فكرة النسخ القديمة المعتمدة على Smart Hub

الـ workflow لا يضع أسرار POS أو WhatsApp داخل JSON. بدلاً من ذلك:

- يسجل دخول إلى Smart Storage Hub.
- يستدعي endpoint:

```text
POST /api/pos/report/counter-cash
```

هذا endpoint يسحب التقرير من POS مباشرة باستخدام إعدادات POS الموجودة في `.env` داخل مشروعك.

## Environment Variables داخل n8n

اضبط هذه المتغيرات في n8n:

```text
SMART_HUB_BASE_URL=http://YOUR_SERVER:3002
SMART_HUB_USERNAME=sanad
SMART_HUB_PASSWORD=YOUR_SMART_HUB_PASSWORD

WHATSAPP_API_URL=https://graph.facebook.com/v20.0/YOUR_PHONE_NUMBER_ID/messages
WHATSAPP_PHONE_NUMBER_ID=YOUR_PHONE_NUMBER_ID
WHATSAPP_MANAGEMENT_GROUP_ID=YOUR_MANAGEMENT_GROUP_OR_PHONE

DEFAULT_BRANCH_NAME=AL FALAH
BRANCH_MANAGER_NAME=Manager Name
BRANCH_MANAGER_WHATSAPP=9715XXXXXXXX

STORAGE_UPLOAD_URL=https://YOUR_STORAGE_UPLOAD_ENDPOINT
DEPOSIT_RECEIPT_STATUS_URL=https://YOUR_RECEIPT_STATUS_ENDPOINT
```

## Credentials داخل n8n

### 1. WhatsApp API Bearer Token

الاسم المطلوب في workflow:

```text
WhatsApp API Bearer Token
```

النوع:

```text
HTTP Bearer Auth
```

القيمة:

```text
Bearer token from WhatsApp provider
```

مستخدم في:

- Send Daily WhatsApp
- Send Weekly To Branch Manager
- Send Weekly Copy To Management
- Send Receipt Reminder
- Send Receipt Confirmation
- Send Monthly WhatsApp
- Send Error WhatsApp Alert

## 2. Storage Upload API Key

الاسم المطلوب في workflow:

```text
Storage Upload API Key
```

النوع:

```text
HTTP Header Auth
```

مثال:

```text
Header Name: Authorization
Header Value: Bearer YOUR_STORAGE_TOKEN
```

مستخدم في:

- Upload Receipt To Storage

## إعدادات POS في مشروع Smart Storage Hub

لأن workflow يستدعي backend المشروع، يجب أن تكون هذه القيم موجودة في `.env` الخاص بالمشروع:

```text
POS_BASE_URL=https://beta.aipsoft.com/inout/sales
POS_REFERER=https://beta.aipsoft.com/inout/sales
POS_ORIGIN=https://beta.aipsoft.com
POS_COOKIE=language=english; direction=ltr; inout=...; ci_session_aip_dev=...; inout_last_activity_time=...
POS_COUNTER_CASH_REPORT_PATH=/generate_report
```

إذا انتهت جلسة POS، حدث `POS_COOKIE` أو فعل auto-refresh إذا كانت بيانات login متوفرة.

## ملاحظات مهمة

- Meta WhatsApp Cloud API لا يدعم إرسال رسائل إلى Groups بنفس طريقة WhatsApp العادي. إذا كنت تريد قروبات واتساب فعلية، استخدم provider يدعم group id مثل 360dialog/Ultramsg/WAHA/Green API أو API داخلي.
- إذا كان لديك أكثر من فرع وكل فرع يحتاج POS session مختلفة، اعمل نسخة credential/session لكل فرع أو نضيف branch loop لاحقاً بعد معرفة parameter الفرع في POS.
- جزء إيصال الإيداع يحتاج endpoint تخزين فعلي. حالياً workflow يستخدم `STORAGE_UPLOAD_URL` كـ placeholder.
- جزء فحص إيصال الإيداع بعد 24 ساعة يحتاج endpoint فعلي يرجع:

```json
{
  "status": "received"
}
```

أو أي قيمة غير `received` حتى يرسل التذكير.
