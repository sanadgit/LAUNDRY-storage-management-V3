# فكرة Workflow: تحديث الطلبات عبر الدردشة

## الهدف

بناء مساعد دردشة عبر Telegram أو WhatsApp يسمح للموظف بتحديث طلبات Smart Storage Hub وPOS بدون فتح الواجهة.

الفكرة تشبه صفحة `Pickup Search` و `Stores`، لكن الأوامر تتم برسائل قصيرة:

- البحث برقم الطلب.
- البحث برقم هاتف الزبون.
- معرفة مكان الطلب داخل الاستور.
- تحديث حالة الطلب: معلق، مطبق، تم أخذه، تم تسليمه.
- تسجيل رقم الاستور أو الموقع داخل المخزن.
- تنفيذ بعض العمليات بمساعدة AI يفهم الكلام الطبيعي.

## مثال الاستخدام

### بحث برقم الطلب

الموظف يرسل:

```text
ابحث 260750
```

الرد:

```text
Order: Z63588
Customer: Ahmed Ali
Phone: 0500000000
Status: Packed / Pending Delivery
Balance: AED 8.40
Store Location:
- B2-front / Row 4 / Column 6
Actions:
1. Mark picked
2. Move store
3. Deliver cash
4. No Pay monthly account
```

### بحث برقم الهاتف

الموظف يرسل:

```text
0504635888
```

الرد:

```text
Found 3 open orders:
1. Z63588 - AED 6.95 - Packed - B2-front R4 C6
2. A260750 - AED 8.40 - Pending - FA R2 C8
3. M63510 - Delivered

Reply with:
order 1
order 2
```

### تحديث مكان الطلب في الاستور

الموظف يرسل:

```text
Z63588 في B2-front R4 C6
```

أو:

```text
حط الطلب Z63588 في الاستور B2-front رف 4 خانة 6
```

الرد:

```text
تم تحديث مكان الطلب:
Order Z63588
Store: B2-front
Row: 4
Column: 6
```

### تحديث حالة معلق أو مطبق

الموظف يرسل:

```text
Z63588 معلق
```

أو:

```text
Z63588 مطبق
```

الرد:

```text
تم تحديث حالة الطلب:
Order Z63588
Status: Hanging
```

أو:

```text
تم تحديث حالة الطلب:
Order Z63588
Status: Folded
```

### No Pay Monthly Account

الموظف يرسل:

```text
Z63588 no pay monthly account
```

المساعد يرد قبل التنفيذ:

```text
Confirm No Pay Delivery?
Order: Z63588
Balance: AED 6.95
Reason: monthly account

Reply: confirm
```

بعد التأكيد:

```text
تم التسليم بنجاح.
Remark updated: monthly account
Remaining balance: AED 6.95
```

## القنوات المقترحة

### Telegram

الأفضل كبداية لأنه أسهل في التطوير:

- Telegram Bot API بسيط.
- يدعم أزرار تفاعلية Inline Buttons.
- مناسب للموظفين والمديرين.
- يمكن ربطه بسهولة مع n8n أو مع API مباشر في السيرفر.

### WhatsApp

مفيد لاحقاً لأن الموظفين يستخدمونه يومياً:

- يحتاج WhatsApp Cloud API أو مزود مثل AIPSoft/TextConnect.
- يحتاج إدارة قوالب ورسائل إذا كانت الرسائل تبدأ من النظام.
- لو الرسالة من الموظف إلى البوت داخل نافذة session يكون أسهل.

## شكل النظام المقترح

```text
Employee Chat
   |
   v
Telegram Bot / WhatsApp Webhook
   |
   v
Chat Automation API
   |
   +--> AI Intent Parser
   |
   +--> Smart Storage Hub DB
   |
   +--> POS APIs
   |
   +--> Activity Logs
```

## مكونات الـ API المطلوبة

### 1. Webhook استقبال الرسائل

Endpoint مقترح:

```text
POST /api/chat-automation/webhook
```

يستقبل:

```json
{
  "channel": "telegram",
  "chat_id": "123456",
  "from": {
    "id": "123",
    "name": "Mohamed",
    "phone": "0500000000"
  },
  "message": "Z63588 في B2-front R4 C6"
}
```

### 2. Parser يفهم الرسالة

يرجع intent منظم:

```json
{
  "intent": "update_store_location",
  "order_no": "Z63588",
  "store": "B2-front",
  "row": "4",
  "column": "6",
  "confidence": 0.94
}
```

أمثلة intents:

- `search_order`
- `search_customer_phone`
- `update_store_location`
- `mark_hanging`
- `mark_folded`
- `mark_picked`
- `pay_and_deliver_cash`
- `pay_and_deliver_card`
- `no_pay_monthly_account`
- `no_pay_other_reason`
- `help`
- `unknown`

### 3. تنفيذ الأوامر

كل intent يتحول إلى عملية داخل النظام:

| Intent | العملية |
|---|---|
| `search_order` | نفس منطق Pickup Search / POS Connect |
| `search_customer_phone` | جلب كل طلبات الزبون المفتوحة |
| `update_store_location` | تحديث مكان التخزين في Smart Hub |
| `mark_hanging` | تحديث التصنيف أو الحالة إلى Hanging |
| `mark_folded` | تحديث التصنيف أو الحالة إلى Folded |
| `mark_picked` | نفس زر Pick |
| `pay_and_deliver_cash` | نفس Cash Delivery |
| `pay_and_deliver_card` | نفس Credit Card Delivery |
| `no_pay_monthly_account` | نفس No Pay + remark monthly account |
| `no_pay_other_reason` | حفظ السبب في other description |

### 4. سجل العمليات

كل أمر دردشة يجب أن يسجل في Activity Log:

```text
Action: Chat Automation - Update Store Location
User: Telegram / Mohamed
Order: Z63588
Details: B2-front R4 C6
Channel: telegram
Message ID: 12345
```

## طبقة الذكاء الاصطناعي

الذكاء الاصطناعي لا ينفذ مباشرة. دوره فقط:

1. فهم الرسالة.
2. استخراج رقم الطلب أو الهاتف أو الاستور.
3. تحديد intent.
4. طلب تأكيد إذا العملية حساسة.

مثال:

```text
الطلب 63588 خليه مطبق وحطه في B2 خانة 4-6
```

AI parser يرجع:

```json
{
  "intent": "multi_action",
  "actions": [
    {
      "intent": "mark_folded",
      "order_no": "63588"
    },
    {
      "intent": "update_store_location",
      "order_no": "63588",
      "store": "B2",
      "row": "4",
      "column": "6"
    }
  ],
  "needs_confirmation": true
}
```

## قواعد الأمان

### أوامر بدون تأكيد

مسموح تنفيذها مباشرة:

- البحث عن طلب.
- البحث عن زبون.
- عرض مكان الطلب.
- عرض الرصيد.

### أوامر تحتاج تأكيد

يجب أن يرد الموظف بـ `confirm`:

- التوصيل.
- الدفع.
- No Pay.
- حذف أو نقل موقع طلب من استور إلى استور.
- أي تعديل في POS.

### صلاحيات المستخدم

يجب ربط Telegram ID أو WhatsApp Phone بموظف داخل النظام:

```text
chat_user_id -> smart_hub_user_id -> pos_user_id
```

كل موظف ينفذ باسمه، وليس باسم مستخدم ثابت.

## نموذج المحادثة المقترح

### أمر بحث

```text
User:
Z63588

Bot:
Order Z63588
Customer: Ahmed
Phone: 0500000000
Status: Packed
Balance: AED 6.95
Store: B2-front R4 C6

Quick actions:
[Picked] [Cash Delivery] [Card Delivery] [No Pay]
```

### أمر تحديث

```text
User:
حطه في FA R2 C10

Bot:
تقصد الطلب Z63588؟
Store: FA
Row: 2
Column: 10

Reply confirm للتحديث.
```

### أمر توصيل

```text
User:
cash delivery

Bot:
Confirm Cash Delivery?
Order: Z63588
Amount: AED 6.95

Reply confirm.
```

## التصميم الداخلي للـ Workflow

### المرحلة الأولى: Telegram فقط

1. إنشاء Telegram Bot.
2. إضافة endpoint webhook في السيرفر.
3. ربط Telegram ID بمستخدم Smart Hub.
4. تنفيذ:
   - البحث برقم الطلب.
   - البحث برقم الهاتف.
   - عرض مكان الطلب.
   - تحديث مكان الطلب.
5. تسجيل كل العمليات في Activity Log.

### المرحلة الثانية: أوامر التوصيل والدفع

1. إضافة أزرار:
   - Cash Delivery
   - Card Delivery
   - No Pay Monthly Account
   - No Pay Other
2. طلب تأكيد قبل التنفيذ.
3. استخدام نفس منطق `/api/pickup-search/pay-deliver`.
4. عرض نتيجة واضحة للموظف.

### المرحلة الثالثة: WhatsApp

1. ربط WhatsApp webhook.
2. إعادة استخدام نفس Chat Automation API.
3. دعم الرسائل النصية فقط في البداية.
4. لاحقاً دعم أزرار WhatsApp interactive إذا المزود يسمح.

### المرحلة الرابعة: AI Natural Language

1. استخدام AI parser للأوامر غير المنظمة.
2. حفظ intent والثقة confidence.
3. إذا confidence أقل من 0.8 يسأل المستخدم للتوضيح.
4. إذا الأمر حساس يطلب confirm دائماً.

## أوامر مقترحة للموظفين

```text
help
بحث Z63588
بحث 0504635888
مكان Z63588
Z63588 معلق
Z63588 مطبق
Z63588 في B2-front R4 C6
Z63588 picked
Z63588 cash delivery
Z63588 card delivery
Z63588 no pay monthly account
Z63588 no pay other: manager approval
```

## نقاط مهمة قبل التنفيذ

1. يجب ألا يستخدم البوت مستخدم POS ثابت.
2. كل موظف يجب أن يكون مربوطاً بحساب POS الخاص به.
3. الدفع والتوصيل يحتاجان شفت مفتوح لنفس المستخدم أو مستخدم التسليم.
4. لا نعتمد على AI وحده في العمليات الحساسة.
5. يجب وجود audit log كامل لكل رسالة وتنفيذ.
6. يجب منع تكرار نفس العملية لنفس الطلب إذا الموظف أرسل confirm مرتين.

## API endpoints مقترحة

```text
POST /api/chat-automation/webhook
POST /api/chat-automation/telegram/webhook
POST /api/chat-automation/whatsapp/webhook
POST /api/chat-automation/confirm
GET  /api/chat-automation/users
POST /api/chat-automation/users/link
```

## جداول قاعدة بيانات مقترحة

### chat_users

```sql
CREATE TABLE chat_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel TEXT NOT NULL,
  chat_user_id TEXT NOT NULL,
  chat_phone TEXT,
  display_name TEXT,
  smart_hub_user_id INTEGER,
  pos_user_id TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### chat_messages

```sql
CREATE TABLE chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel TEXT NOT NULL,
  chat_user_id TEXT NOT NULL,
  message_id TEXT,
  direction TEXT NOT NULL,
  body TEXT NOT NULL,
  parsed_intent TEXT,
  order_no TEXT,
  status TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### chat_pending_confirmations

```sql
CREATE TABLE chat_pending_confirmations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel TEXT NOT NULL,
  chat_user_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  consumed_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## MVP المقترح

أقترح نبدأ صغير:

1. Telegram فقط.
2. أوامر واضحة بدون AI في أول نسخة:
   - `بحث`
   - `مكان`
   - `في STORE ROW COLUMN`
   - `معلق`
   - `مطبق`
3. بعد نجاحها نضيف AI parser.
4. بعد ذلك نضيف الدفع والتوصيل.

هذا يقلل المخاطر لأن التحديثات الحساسة في POS تحتاج اختبار دقيق.

## بداية التنفيذ: Telegram MVP

تم بدء نسخة Telegram الأولى في السيرفر.

### ما يدعمه الآن

- Webhook لتلقي رسائل Telegram.
- حفظ مستخدم Telegram في جدول `chat_users`.
- حفظ الرسائل الداخلة والخارجة في جدول `chat_messages`.
- ربط Telegram بحساب موظف POS عبر أمر `login`.
- أمر `help`.
- أمر `whoami` لمعرفة الحساب المربوط.
- أمر `logout` لفك الربط.
- البحث برقم الطلب.
- البحث برقم الهاتف.
- عرض مكان الطلب في الاستور إذا كان موجوداً.
- أوامر التحديث والدفع حالياً لا تنفذ؛ ترجع رسالة توضيح إلى أن يتم إضافة التأكيد والتنفيذ.

### Endpoints المضافة

```text
GET  /api/chat-automation/telegram/status
POST /api/chat-automation/telegram/webhook
```

### متغيرات البيئة

```bash
TELEGRAM_BOT_TOKEN=123456:ABC...
TELEGRAM_WEBHOOK_SECRET=ضع_كلمة_سر_طويلة
```

`TELEGRAM_WEBHOOK_SECRET` اختياري لكنه مهم. Telegram سيرسله في الهيدر:

```text
X-Telegram-Bot-Api-Secret-Token
```

### ربط webhook في Telegram

بعد نشر السيرفر على الدومين:

```bash
curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
  -d "url=https://www.inandoutuae.com/api/chat-automation/telegram/webhook" \
  -d "secret_token=$TELEGRAM_WEBHOOK_SECRET"
```

### اختبار الحالة

```bash
curl https://www.inandoutuae.com/api/chat-automation/telegram/status
```

### أوامر تجربة أولى

```text
help
login USERNAME PASSWORD
whoami
logout
بحث Z63588
مكان Z63588
بحث 0504635888
```

### ربط موظف POS مع Telegram

الموظف يرسل للبوت:

```text
login HAPY3 password_here
```

البوت يتحقق من بيانات POS باستخدام نفس منطق تسجيل الدخول في Smart Hub، ثم يحفظ:

- `smart_hub_user_id`
- `pos_user_id`
- `pos_username`
- `pos_display_name`
- `pos_branch_id`
- `pos_branch_code`

كلمة المرور لا تحفظ في قاعدة البيانات، ورسالة `login` تسجل في `chat_messages` بشكل مخفي:

```text
login HAPY3 ********
```

لمعرفة الحساب المربوط:

```text
whoami
```

لفك الربط:

```text
logout
```

### المرحلة التالية بعد الاختبار

1. إضافة جدول صلاحيات أو استخدام role المستخدم الحالي.
2. تفعيل أوامر التحديث:
   - `Z63588 في B2-front R4 C6`
   - `Z63588 معلق`
   - `Z63588 مطبق`
3. إضافة تأكيد قبل أي تحديث:
   - الموظف يرسل الأمر.
   - البوت يرد بملخص.
   - الموظف يرد `confirm`.
   - التنفيذ يتم باسمه ويسجل في Activity Log.

## النتيجة المتوقعة

الموظف يستطيع من الهاتف كتابة:

```text
Z63588 في B2-front R4 C6
```

أو:

```text
0504635888
```

ويحصل على نفس قوة صفحة البحث والتخزين، لكن من داخل الدردشة، مع سرعة أعلى وسجل كامل لكل عملية.
