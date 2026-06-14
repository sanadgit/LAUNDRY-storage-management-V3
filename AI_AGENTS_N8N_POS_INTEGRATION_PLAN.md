# خطة وكلاء الذكاء الاصطناعي وربط POS مع n8n

تاريخ التوثيق: 2026-06-01

## الهدف

بناء نظام وكلاء ذكاء اصطناعي لشركة المغسلة يعمل كطبقة تشغيل ذكية بين:

- نظام POS / AiPSoft Connect.
- نظام إدارة وفرز المغسلة الحالي.
- n8n كمنصة أتمتة وربط.
- واتساب لإرسال التقارير والتنبيهات وخدمة العملاء.
- مصادر خارجية مثل Google Reviews، السوشيال ميديا، ونظام تتبع السائقين.

الهدف العملي هو أن يتحول النظام من متابعة يدوية إلى إدارة يومية آلية: تقارير، تنبيهات، تحصيل، خدمة عملاء، متابعة إنتاج، ومراقبة تنفيذ.

## ملاحظة أمان مهمة

لا يتم حفظ أي مفاتيح API أو كلمات مرور داخل هذا الملف. أي مفاتيح مثل OpenAI، WhatsApp، POS، n8n، أو Google يجب أن تبقى داخل `.env` أو داخل Credentials في n8n فقط.

إذا ظهر أي مفتاح API في محادثة أو لقطة شاشة، يجب تدويره أو إلغاؤه من لوحة مزود الخدمة مباشرة.

## الصورة العامة للربط

```text
POS / AiPSoft
    |
    | HTTP Request / API / Webhook / Scheduled Pull
    v
n8n Workflows
    |
    | تنظيف البيانات + حفظ السجلات + استدعاء الوكلاء
    v
AI Agents Layer
    |
    | قرارات + تقارير + تنبيهات + ردود
    v
WhatsApp / Dashboard / Email / Google Sheets / Database
```

## مصادر البيانات المطلوبة

| المصدر | الغرض | طريقة الربط المقترحة | الحالة |
|---|---|---|---|
| رابط تسجيل المصروفات | إدخال المصروفات اليومية | HTTP Request من n8n أو Webhook يستقبل البيانات | بانتظار الرابط |
| رابط تسجيل المشتريات | تسجيل مشتريات الموردين والفواتير | HTTP Request + OCR للفواتير إن وجدت | بانتظار الرابط |
| روابط تقارير المبيعات | سحب مبيعات اليوم والشهر والفروع | Scheduled Workflow في n8n | بانتظار الروابط |
| روابط تقارير المصروفات | تحليل المصروف اليومي/الأسبوعي | Scheduled Workflow | بانتظار الروابط |
| روابط العملاء وكشف الحساب | التحصيل وخدمة العملاء | HTTP Request حسب رقم العميل أو الهاتف | بانتظار الروابط |
| روابط الطلبات والتوصيل | حالات الطلب والتسليم | API Pull أو Webhook | جزئياً موجود في POS API |
| روابط الموظفين | HR، الإقامات، العقود، الرواتب | API أو Google Sheet مؤقتاً | بانتظار المصدر |
| Google Reviews | تقييمات العملاء | Google Business Profile API أو تصدير دوري | بانتظار الربط |
| واتساب الإدارة | إرسال التقارير والتنبيهات | WhatsApp Cloud API / Twilio / 360dialog | بانتظار اختيار المزود |

## روابط POS المعروفة حالياً من فحص المشروع

هذه الروابط والمسارات تم تسجيلها سابقاً في ملفات المشروع، وتحتاج اختبار فعلي قبل اعتمادها في n8n:

### الروابط الأساسية

```text
https://connect.aipsoft.com
https://magnus.aipsoft.com/rc/remote_user
https://beta.aipsoft.com/rc/remote_user
https://magnus.aipsoft.com
https://aipsoft-connect-default-rtdb.firebaseio.com/
```

### تسجيل الدخول

```text
POST {connectapiurl}/purchase_api/login_action
```

Payload المتوقع:

```json
{
  "username": "api_user@company_id",
  "password": "api_pwd",
  "device_id": "device_id"
}
```

### مسارات مفيدة للطلبات والتوصيل

```text
packing_api/searchOrder
packing_api/getOrderDetails
packing_api/getPackingData
packing_api/findPackings
packing_api/savePacking
packing_api/resendNotification
packing_api/save_pickup
packing_api/search_customers
packing_api/get_shipping_addresses_by_customer
packing_api/updatePickup
packing_api/updatePickupLocation
pos_api/getDeliveryData
pos_api/fetchPendingDeliveries
pos_api/findDeliveryOrderDetails
pos_api/deliveryProcess
pos_api/opencounterAction
pos_api/closecounterAction
pos_api/lastClosedCounterReport
```

## جدول تسجيل الروابط القادمة من POS

عند تزويدي بروابط السستم، يتم تعبئة هذا الجدول:

| الاسم | الرابط | Method | المدخلات المطلوبة | المخرجات المتوقعة | يستخدمه أي وكيل | ملاحظات |
|---|---|---|---|---|---|---|
| تسجيل المصروفات |  | POST | التاريخ، الفرع، البند، المبلغ، المرفق | رقم العملية | Finance Agent |  |
| تسجيل المشتريات |  | POST | المورد، الأصناف، الفاتورة، VAT | رقم الشراء | Finance Agent |  |
| تقرير مبيعات اليوم |  | GET/POST | التاريخ، الفرع | إجمالي المبيعات، الكاش، الشبكة | CEO + Finance |  |
| تقرير المصروفات اليومي |  | GET/POST | التاريخ، الفرع | إجمالي وبنود المصروف | CEO + Finance |  |
| تقرير الطلبات المتأخرة |  | GET/POST | التاريخ، الفرع، الحالة | الطلبات المتأخرة | CEO + Drivers + Customer |  |
| كشف حساب عميل |  | GET/POST | رقم الهاتف أو العميل | الرصيد والفواتير | Customer Agent |  |
| تقرير السائقين |  | GET/POST | التاريخ، السائق | الرحلات والتسليم | Drivers Agent |  |
| تقرير الموظفين |  | GET/POST | التاريخ، الفرع | الحضور والغياب | HR + CEO |  |

## ترتيب البناء المقترح

1. وكيل العملاء.
2. وكيل المدير التنفيذي.
3. وكيل الحسابات.
4. وكيل التسويق.
5. وكيل السائقين.
6. وكيل الموارد البشرية.

هذا الترتيب يعطي أعلى عائد سريع لأن خدمة العملاء والتقارير اليومية تؤثر مباشرة على التشغيل والتحصيل والإدارة.

## 1. وكيل العملاء Customer Agent

### الهدف

خدمة العملاء، متابعة الطلبات، التحصيل، والإشعارات.

### المهام

- الرد على واتساب.
- الرد على الشكاوى والأسئلة.
- جلب كشف حساب العميل.
- معرفة رصيد العميل والمبالغ المستحقة.
- إرسال إشعارات مراحل الطلب:
  - تم استلام الطلب.
  - تم الغسيل.
  - تم الكوي.
  - تم التغليف.
  - خرج للتوصيل.
  - تم التسليم.
- تذكير العملاء بالفواتير المستحقة.
- إرسال كشف حساب شهري.
- تحليل العملاء غير النشطين.
- تحديد عملاء VIP.
- تحديد العملاء المتأخرين في السداد.

### مدخلات الوكيل

| البيانات | المصدر |
|---|---|
| رقم الهاتف | واتساب أو POS |
| رقم الطلب | POS أو نظام الفرز |
| حالة الطلب | POS + نظام التخزين |
| رصيد العميل | تقرير كشف الحساب |
| سجل الشكاوى | واتساب / قاعدة بيانات |

### مخرجات الوكيل

- رد واتساب للعميل.
- تنبيه داخلي للإدارة عند وجود شكوى.
- تذكير دفع.
- تحديث سجل العميل.

### n8n Workflows

| Workflow | Trigger | Action |
|---|---|---|
| Customer WhatsApp Inbox | WhatsApp Incoming Webhook | فهم الرسالة، جلب بيانات POS، الرد |
| Order Status Notification | POS Poll كل 5 دقائق | إرسال تحديث حالة الطلب |
| Monthly Statement | Cron شهري | إرسال كشف حساب للعملاء الآجلين |
| Inactive Customers | Cron أسبوعي | استخراج العملاء غير النشطين وإرسال حملة |

## 2. وكيل المدير التنفيذي CEO Agent

### الهدف

مراقبة جميع الوكلاء وإرسال ملخص يومي وتنبيهات تشغيلية.

### يراقب

- مبيعات اليوم والشهر.
- أفضل فرع وأقل فرع.
- الطلبات المتأخرة.
- أخطاء الإنتاج.
- إنتاجية العمال.
- الإيرادات والمصروفات والربح اليومي.
- الغياب والتأخير وانتهاء الإقامات.
- الشكاوى الجديدة.
- تقييمات Google.
- أداء السائقين.

### مخرجات الوكيل

- تقرير يومي للإدارة.
- تنبيهات فورية للحالات الحرجة.
- ملخص أسبوعي للإدارة العليا.
- توصيات تشغيلية مختصرة.

### n8n Workflows

| Workflow | Trigger | Action |
|---|---|---|
| CEO Daily Report | Cron يومي، نهاية اليوم | جمع بيانات الوكلاء وإرسال واتساب |
| CEO Morning Brief | Cron صباحي | ملخص الوضع قبل بداية العمل |
| Critical Alerts | Webhook/Interval | تنبيه عند انخفاض المبيعات أو تأخر الطلبات |

## 3. وكيل الحسابات Finance Agent

### الهدف

إدارة الأموال، المصروفات، الإيرادات، VAT، والتقارير.

### المهام

- تسجيل المصروفات اليومية تلقائياً.
- قراءة فواتير الموردين.
- تسجيل المشتريات.
- مطابقة الإيرادات مع POS.
- متابعة الذمم المدينة والدائنة.
- إعداد تقارير يومية، أسبوعية، شهرية، وسنوية.
- حساب الأرباح والخسائر.
- تحليل المصروفات غير الطبيعية.
- متابعة VAT.
- إرسال تقرير الإيراد والمصروف اليومي إلى قروب واتساب الإدارة.
- إرسال تقرير أسبوعي لمدير الفرع لتنبيهه بإيداع الكاش المتبقي.

### التنبيهات

- تجاوز ميزانية.
- فاتورة مستحقة.
- انخفاض المبيعات.
- زيادة المصروفات.
- فرق بين كاش POS والكاش الفعلي.

### معادلات أولية

```text
Net Sales = Cash Sales + Card Sales + Online Sales - Refunds
Net Profit Estimate = Net Sales - Daily Expenses - Purchases - Estimated Operational Cost
Cash To Deposit = POS Cash Sales - Approved Cash Expenses - Cash Already Deposited
VAT Payable Estimate = Output VAT - Input VAT
```

### n8n Workflows

| Workflow | Trigger | Action |
|---|---|---|
| Daily Finance Report | Cron يومي | سحب المبيعات والمصروفات وإرسال تقرير |
| Expense Entry | Form/Webhook | تسجيل مصروف واعتماده |
| Supplier Invoice OCR | Upload/Webhook | قراءة فاتورة، استخراج VAT، تسجيل شراء |
| Weekly Cash Deposit Alert | Cron أسبوعي | تنبيه مدير الفرع بالمبلغ المطلوب إيداعه |
| VAT Monthly Summary | Cron شهري | تجهيز ملخص VAT |

## 4. وكيل التسويق Marketing Agent

### الهدف

زيادة العملاء والمبيعات عبر المحتوى، العروض، وتحليل الحملات.

### المهام

- تصميم منشورات يومية.
- كتابة محتوى عربي/إنجليزي.
- إنشاء أفكار فيديوهات قصيرة.
- تصميم العروض.
- إدارة حملات Instagram وFacebook وTikTok وSnapchat.
- تحليل عدد العملاء الجدد.
- معرفة أفضل المنشورات والعروض.
- تجهيز حملات رمضان، العيد، الشتاء، والبطاطين.

### n8n Workflows

| Workflow | Trigger | Action |
|---|---|---|
| Daily Content Ideas | Cron يومي | توليد محتوى ومنشورات |
| Campaign Performance | Cron أسبوعي | قراءة النتائج وتحليلها |
| Offer Generator | Manual Trigger | اقتراح عرض بناءً على المبيعات |
| Inactive Customer Campaign | Cron أسبوعي | إرسال عروض للعملاء غير النشطين |

## 5. وكيل السائقين Drivers Agent

### الهدف

إدارة الاستلام والتوصيل وتحسين المسارات.

### المهام

- توزيع الطلبات على السائقين.
- تحديد أفضل مسار.
- متابعة مواقع السائقين.
- حساب عدد الطلبات اليومية.
- تقرير عدد الرحلات والطلبات المسلمة وزمن التوصيل.
- تنبيه عند تأخير التوصيل.
- تنبيه عند طلب لم يتم تسليمه.
- مراقبة زيادة استهلاك الوقود.
- اقتراح دمج الطلبات القريبة.

### n8n Workflows

| Workflow | Trigger | Action |
|---|---|---|
| Dispatch Planner | Cron أو Manual | توزيع الطلبات على السائقين |
| Delivery Delay Alert | Interval | فحص الطلبات المتأخرة |
| Driver Daily Report | Cron يومي | تقرير لكل سائق |
| Route Optimization | Manual/Cron | دمج الطلبات القريبة |

## 6. وكيل الموارد البشرية HR Agent

### الهدف

إدارة الموظفين، الملفات، الرواتب، الإقامات، والتقييم.

### التوظيف

- استقبال السير الذاتية.
- فرز المرشحين.
- تحديد مواعيد المقابلات.

### الموظفين

- العقود.
- الإقامات.
- التأمين الصحي.
- الإجازات.
- الرواتب.
- الإنذارات.
- المكافآت.

### تقييم الأداء

- الحضور.
- الإنتاجية.
- الأخطاء.
- رضا العملاء.

### التنبيهات

- انتهاء إقامة.
- انتهاء تأمين.
- انتهاء عقد.
- موظف منخفض الأداء.

### n8n Workflows

| Workflow | Trigger | Action |
|---|---|---|
| Document Expiry Alerts | Cron يومي | تنبيه قبل انتهاء الوثائق |
| Attendance Summary | Cron يومي | تقرير حضور وغياب |
| Payroll Prep | Cron شهري | تجهيز بيانات الرواتب |
| Performance Review | Cron شهري | تقييم إنتاجية وأخطاء |

## طبقة وكيل المدير التنفيذي فوق الوكلاء

وكيل المدير التنفيذي لا ينفذ كل العمليات بنفسه. دوره أن يستقبل مخرجات الوكلاء، يختصرها، ويرتب الأولويات.

```text
Finance Agent  \
HR Agent        \
Marketing Agent  ---> CEO Agent ---> WhatsApp Management Group
Customer Agent   /
Drivers Agent   /
Operations Data /
```

## نموذج التقرير اليومي للإدارة

```text
IN & OUT DAILY REPORT

Date: 01/06/2026

Sales
Today: 12,450 AED
Month: 285,300 AED

Expenses
Today: 620 AED

Net Profit
Today: 11,830 AED

Best Branch
Al Falah

Alerts
- 3 delayed orders
- 1 customer complaint
- Residence expires in 12 days (Employee #14)

Deliveries
Completed: 87
Pending: 4

Google Reviews
4 New Reviews
Average: 4.8

Employees
Present: 37
Absent: 2
```

## نموذج تقرير الإيراد والمصروف اليومي

```text
IN & OUT FINANCE DAILY

Date: {{date}}
Branch: {{branch_name}}

Sales
Cash: {{cash_sales}} AED
Card: {{card_sales}} AED
Online: {{online_sales}} AED
Total: {{total_sales}} AED

Expenses
Approved Expenses: {{daily_expenses}} AED
Purchases: {{daily_purchases}} AED

Cash Control
Expected Cash: {{expected_cash}} AED
Cash Expenses: {{cash_expenses}} AED
Cash To Deposit: {{cash_to_deposit}} AED

Alerts
{{alerts}}
```

## هيكلة بيانات موحدة للوكلاء

يفضل أن يقوم n8n بتحويل كل بيانات POS إلى شكل موحد قبل إرسالها لأي وكيل.

```json
{
  "date": "2026-06-01",
  "branch": {
    "id": "branch_id",
    "name": "Al Falah"
  },
  "sales": {
    "cash": 0,
    "card": 0,
    "online": 0,
    "refunds": 0,
    "total": 0
  },
  "expenses": {
    "daily_total": 0,
    "items": []
  },
  "orders": {
    "new": 0,
    "completed": 0,
    "delayed": 0,
    "pending_delivery": 0
  },
  "customers": {
    "new": 0,
    "complaints": 0,
    "vip": 0,
    "overdue_accounts": 0
  },
  "drivers": {
    "completed_deliveries": 0,
    "pending_deliveries": 0,
    "delayed_deliveries": 0
  },
  "employees": {
    "present": 0,
    "absent": 0,
    "late": 0,
    "document_alerts": []
  },
  "alerts": []
}
```

## تصميم n8n Workflows الأساسي

### Workflow 1: POS Login Session

الهدف: إنشاء جلسة صالحة مع POS وتخزين Cookies/Token لاستخدام باقي الـ Workflows.

```text
Cron / Manual
  -> HTTP Request: login_action
  -> IF success
  -> Store credentials/session in n8n static data or secure DB
  -> Notify admin only on failure
```

### Workflow 2: Daily CEO Report

```text
Cron 10:30 PM
  -> Get POS sales report
  -> Get expenses report
  -> Get delayed orders
  -> Get driver report
  -> Get HR alerts
  -> Get customer complaints
  -> AI summarize
  -> Send WhatsApp to management group
  -> Save report snapshot
```

### Workflow 3: Daily Finance Report

```text
Cron 10:45 PM
  -> Get sales by branch
  -> Get expenses by branch
  -> Calculate cash to deposit
  -> Detect unusual expenses
  -> AI format report
  -> Send WhatsApp to finance/admin group
```

### Workflow 4: Weekly Cash Deposit Alert

```text
Cron every Monday 9:00 AM
  -> Get weekly cash sales
  -> Get cash expenses
  -> Get deposits recorded
  -> Calculate remaining cash
  -> Send alert to branch manager
```

### Workflow 5: Customer WhatsApp Agent

```text
WhatsApp incoming message
  -> Identify intent
  -> Extract phone/order number
  -> Query POS/order system
  -> AI generate reply
  -> Send WhatsApp response
  -> Escalate complaint if needed
```

## صلاحيات الوكلاء

| الوكيل | قراءة POS | كتابة POS | إرسال واتساب | يحتاج موافقة بشرية |
|---|---:|---:|---:|---:|
| Customer Agent | نعم | محدود | نعم | عند الشكاوى أو الخصومات |
| CEO Agent | نعم | لا | نعم | لا |
| Finance Agent | نعم | نعم للمصروفات والمشتريات | نعم | عند مصروف فوق حد معين |
| Marketing Agent | قراءة تقارير فقط | لا | نعم للحملات | قبل نشر عروض كبيرة |
| Drivers Agent | نعم | تحديث حالات التوصيل فقط | نعم | عند تعديل مسار كبير |
| HR Agent | لا/محدود | لا | نعم داخلي | عند قرارات رواتب أو إنذارات |

## قواعد التحكم والمراجعة

- لا يتم حذف أو تعديل بيانات مالية بدون سجل Audit Log.
- أي مصروف فوق حد محدد يحتاج موافقة مدير.
- أي رسالة واتساب تسويقية كبيرة تحتاج موافقة قبل الإرسال.
- أي شكوى عميل يتم تصعيدها للمدير إذا لم تحل خلال وقت محدد.
- لا يرسل الوكيل بيانات مالية أو شخصية إلا للأرقام المصرح بها.
- كل Workflow يجب أن يحفظ آخر نتيجة وسبب الفشل إن حدث.

## متغيرات البيئة المقترحة

```text
POS_BASE_URL=
POS_COMPANY_ID=
POS_API_USER=
POS_API_PASSWORD=
POS_DEVICE_ID=

N8N_WEBHOOK_BASE_URL=

WHATSAPP_PROVIDER=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_MANAGEMENT_GROUP_ID=
WHATSAPP_FINANCE_GROUP_ID=

OPENAI_API_KEY=

GOOGLE_BUSINESS_PROFILE_ACCOUNT_ID=
GOOGLE_BUSINESS_PROFILE_LOCATION_ID=
```

## المطلوب منك في الخطوة القادمة

زوّدني بالروابط التالية من نظام POS حتى أبني لك خريطة n8n التفصيلية لكل Workflow:

1. رابط تسجيل المصروفات.
2. رابط تسجيل المشتريات.
3. رابط تقرير مبيعات اليوم.
4. رابط تقرير المصروفات اليومي.
5. رابط تقرير المبيعات حسب الفرع.
6. رابط تقرير الطلبات المتأخرة.
7. رابط كشف حساب العميل.
8. رابط تقرير التوصيل أو السائقين.
9. طريقة تسجيل الدخول المطلوبة لهذه الروابط.
10. هل الروابط تحتاج Cookie من المتصفح، Token، Username/Password، أو Session ID.

بعد توفر الروابط، يتم تحويل هذا الملف إلى خطة تنفيذ n8n فعلية تشمل:

- أسماء Nodes.
- ترتيب كل Workflow.
- Payload لكل Request.
- Mapping للحقول.
- رسائل واتساب النهائية.
- شروط التنبيه.
- طريقة الاختبار قبل التشغيل الحقيقي.
