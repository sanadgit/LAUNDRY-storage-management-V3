# Layla AI - ورك فلو خدمة العملاء عبر n8n

## الهدف

إنشاء وكيل خدمة عملاء ذكي باسم **Layla AI** لمغسلة In & Out Laundry يعمل على واتساب، مربوط بموديل OpenAI، ويخدم العميل في:

- الحجز والاستلام.
- تتبع الطلبات.
- الأسعار والخدمات.
- الفروع والمناطق.
- الشكاوى والملاحظات.
- التصعيد لموظف خدمة العملاء.

## الملفات الجاهزة

- `n8n-layla-ai-customer-service-workflow.json`
- `n8n-layla-ai-customer-service-brain-v1.js`

## طريقة الاستيراد في n8n

1. افتح n8n.
2. اختر Import workflow.
3. استورد الملف:

```text
n8n-layla-ai-customer-service-workflow.json
```

4. افتح عقدة `Layla AI Customer Service Brain`.
5. تأكد من وجود المتغيرات المطلوبة.
6. فعّل الـ workflow.
7. اربط مزود واتساب على رابط الويبهوك:

```text
https://YOUR_N8N_DOMAIN/webhook/layla-ai-customer-service
```

## متغيرات n8n المطلوبة

```env
OPENAI_API_KEY=your_openai_api_key
LAYLA_OPENAI_MODEL=your_selected_openai_model
TEXTCONNECT_SECRET=your_textconnect_secret
TEXTCONNECT_ACCOUNT=your_textconnect_account
```

## متغيرات موصى بها

```env
LAYLA_SITE_URL=https://www.inandoutuae.com
LAYLA_ESCALATION_WHATSAPP=9715xxxxxxx
TEXTCONNECT_INCOMING_SECRET=your_incoming_webhook_secret
```

## متغيرات اختيارية للربط الداخلي

```env
LAYLA_APP_BEARER_TOKEN=internal_api_token
```

هذا المتغير يسمح لـ Layla بقراءة حالة الطلب من API المحمي. بدون هذا المتغير، ستعطي Layla رابط التتبع فقط حفاظًا على خصوصية العميل.

## أمثلة اختبار

```text
مرحبا
```

```text
أبغى أحجز استلام اليوم
```

```text
وين طلبي INO-1234؟
```

```text
كم سعر تنظيف الكندورة والغترة؟
```

```text
عندي شكوى على طلب INO-1234
```

```text
أبغى أكلم موظف
```

## قواعد Layla

- ترد بنفس لغة العميل: عربي أو إنجليزي.
- لا تخترع سعرًا دقيقًا إذا لم يكن موجودًا في بيانات الموقع.
- لا تكشف تفاصيل طلب إلا عند توفر سياق آمن من API.
- تجمع أقل معلومات ممكنة لإكمال الحجز.
- تصعّد الحالات الحساسة: تلف، فقدان، غضب، تعويض، طلب موظف.
- تجعل الرد قصيرًا ومناسبًا لواتساب.

## المرحلة الحالية

المرحلة مكتملة كـ V1:

- Webhook جاهز.
- OpenAI Responses API جاهز عبر متغيرات n8n.
- TextConnect WhatsApp send جاهز.
- معرفة أساسية عن الخدمات والفروع.
- قراءة إعدادات الموقع من `/api/customer/site-config` عند توفره.
- تتبع آمن عبر الرابط أو API token اختياري.
- تصعيد لموظف عبر واتساب.

## التطوير التالي

- ربط إنشاء الطلب مباشرة من محادثة Layla.
- إضافة ذاكرة محادثة لكل عميل.
- ربط Meta WhatsApp Cloud API بدل TextConnect عند الحاجة.
- تسجيل كل محادثة داخل لوحة الإدارة.
- لوحة قياس: عدد المحادثات، النوايا، التصعيد، الحجوزات المكتملة.
