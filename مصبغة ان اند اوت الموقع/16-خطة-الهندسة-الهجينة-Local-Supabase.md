# خطة قوية لتشغيل الموقع بقاعدة داخلية + Supabase

## الهدف

تشغيل موقع مصبغة In & Out بطريقة لا تتوقف إذا تعطلت Supabase أو انقطعت الشبكة الخارجية.

المبدأ الأساسي:

- القاعدة الداخلية في السيرفر هي المصدر التشغيلي الأول.
- Supabase طبقة مزامنة ونسخة خارجية وواجهة مستقبلية للبوابة.
- أي عملية مهمة تحفظ محليا أولا، ثم تتم مزامنتها خارجيا بدون تعطيل العميل.

## التصميم المعتمد

### 1. Local-first

كل عمليات التشغيل الحساسة تبدأ من قاعدة السيرفر الداخلية:

- Book Pickup
- Track Order
- Customer Orders
- OTP security state
- Driver assignment
- WhatsApp notification status
- Site configuration الحرجة

إذا توقفت Supabase، يستمر الموقع في الحجز والتتبع من الداخل.

### 2. Supabase mirror

Supabase تستخدم كنسخة خارجية قابلة للقراءة والمزامنة:

- عرض Customer Portal مستقبلا.
- لوحات خارجية.
- تقارير.
- نسخ احتياطي قريب من الوقت الحقيقي.
- مزامنة بيانات العملاء والطلبات.

### 3. Sync Queue

أي فشل في مزامنة Supabase لا يفشل الطلب.

بدلا من ذلك:

1. نحفظ العملية محليا.
2. نحاول المزامنة مع Supabase.
3. إذا فشلت، نضع العملية في `sync_queue`.
4. عامل خلفي يعيد المحاولة لاحقا.
5. عند نجاح المزامنة، يتم تعليم السجل بأنه `synced`.

## الجداول المطلوبة

### محلي في SQLite

```sql
sync_queue
- id
- entity_type
- entity_id
- operation
- target
- payload
- status
- attempts
- last_error
- next_attempt_at
- created_at
- updated_at
```

### في Supabase

```sql
customer_orders
- id text primary key
- status text
- payload jsonb
- created_at timestamptz
- updated_at timestamptz
```

لاحقا نضيف:

- customer_users
- customer_site_config
- customer_alert_logs
- ai_conversations
- ai_messages

## مسار إنشاء طلب Book Pickup

### الوضع الصحيح

1. العميل يؤكد الطلب.
2. السيرفر يحفظ الطلب في SQLite فورا.
3. السيرفر يرسل واتساب للعميل والسائق.
4. السيرفر يحاول عمل upsert في Supabase.
5. إذا فشلت Supabase، الطلب يبقى ناجحا للعميل.
6. يتم إنشاء سجل في `sync_queue`.
7. عامل المزامنة يعيد المحاولة.

## مسار Track Order

الترتيب المقترح للبحث:

1. البحث في الطلبات المحلية `customer_orders`.
2. البحث في POS إذا الرقم من النظام الخارجي.
3. البحث في Supabase كنسخة مساعدة فقط.
4. إذا Supabase متوقفة، لا يتأثر التتبع المحلي.

## مراحل التنفيذ

### المرحلة 1: الأساس

- إنشاء ملف الخطة.
- إنشاء جدول `sync_queue`.
- إضافة helper لإدخال عمليات المزامنة.
- إضافة helper لمحاولة مزامنة `customer_orders` إلى Supabase.
- تشغيل retry worker بسيط داخل السيرفر.

### المرحلة 2: أوامر الإدارة

- API لفحص حالة المزامنة.
- API لإعادة محاولة المزامنة يدويا.
- عرض آخر أخطاء Supabase.

### المرحلة 3: Supabase schema

- إضافة `customer_orders` إلى `supabase-schema.sql`.
- إضافة indexes مناسبة.
- توثيق أوامر SQL المطلوبة في Supabase.

### المرحلة 4: القراءة الذكية

- Local-first reads.
- Supabase fallback reads فقط عند الحاجة.
- منع أي route من الاعتماد على Supabase وحدها.

### المرحلة 5: مراقبة وتشغيل

- Health endpoint يظهر:
  - local database ok
  - Supabase configured
  - Supabase reachable
  - pending sync count
  - failed sync count
- PM2 logs واضحة للمزامنة.

## قواعد مهمة

- لا تجعل Supabase شرطا لنجاح حجز العميل.
- لا ترسل بيانات ناقصة إلى Supabase.
- لا تفشل الطلب بسبب sync خارجي.
- لا تستخدم Supabase كقاعدة التشغيل الوحيدة إلا للبيانات غير الحساسة.
- أي فشل خارجي يتحول إلى pending sync.

## الحالة الحالية

تم تنفيذ بداية المرحلة 1 و 2 و 3:

- إضافة خطة الهندسة الهجينة.
- إضافة جدول `sync_queue`.
- ربط `customer_orders` بمزامنة Supabase غير معطلة للتشغيل.
- إضافة عامل خلفي يعيد محاولة المزامنة.
- إضافة API لفحص حالة المزامنة.
- إضافة API لإعادة محاولة المزامنة يدويا.
- إضافة جدول `customer_orders` إلى `supabase-schema.sql`.
- إضافة متغيرات البيئة المطلوبة في `.env.example`.

## المرحلة التالية مباشرة

1. تطبيق `supabase-schema.sql` على مشروع Supabase.
2. ضبط `VITE_SUPABASE_URL` و `SUPABASE_SERVICE_ROLE_KEY` في السيرفر.
3. تشغيل `/api/sync/status` من حساب مدير للتأكد من الحالة.
4. إنشاء طلب Book Pickup تجريبي.
5. التأكد أن الطلب يظهر محليا أولا، ثم يظهر في Supabase.
6. إضافة Supabase fallback read للطلبات عند الحاجة فقط.
