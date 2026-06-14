# Smart Hub POS Auto Login Setup

استخدم هذه الإعدادات في `.env` الخاص بسيرفر Smart Hub Storage حتى يتصل بـ POS عن طريق تسجيل الدخول، وليس Cookie ثابت.

```env
POS_AUTO_REFRESH_ENABLED=1

POS_BASE_URL=https://beta.aipsoft.com/inout/sales
POS_REFERER=https://beta.aipsoft.com/inout/sales
POS_ORIGIN=https://beta.aipsoft.com

POS_LOGIN_USERNAME=YOUR_POS_USERNAME
POS_LOGIN_PASSWORD=YOUR_POS_PASSWORD
POS_LOGIN_CLIENT_IDENTIFIER=inout
POS_LOGIN_ENDPOINT=https://beta.aipsoft.com/inout/login/check
POS_LOGIN_REFERER=https://beta.aipsoft.com/inout/sales

POS_COUNTER_CASH_REPORT_PATH=/generate_report
POS_FIND_ORDERS_PATH=/findLaundryOrders
POS_FIND_ORDER_DETAILS_PATH=/findOrderDetails
POS_GET_PRODUCTS_PATH=/getProducts

POS_PURCHASE_API_BASE_URL=https://beta.aipsoft.com/inout
POS_EXPENSES_REFERER=https://beta.aipsoft.com/inout/accounts/expenses
AIPSOFT_API_USER_ID=YOUR_AIPSOFT_API_USER_ID
AIPSOFT_DEFAULT_PAY_ACCOUNT_ID=YOUR_DEFAULT_PAY_ACCOUNT_ID
```

بعد تعديل `.env` أعد تشغيل السيرفر.

لفحص الحالة من Smart Hub بعد تسجيل الدخول للنظام:

```text
GET /api/pos/session-status
```

النتيجة المهمة:

```json
{
  "auto_login_enabled": true,
  "auto_login_configured": true,
  "session_available": true
}
```

ملاحظة: `POS_COOKIE` أصبح فقط fallback مؤقت. التشغيل الصحيح الآن يكون عبر `POS_AUTO_REFRESH_ENABLED=1` وبيانات `POS_LOGIN_*`.

## صفحة اختبار المصروفات

بعد تشغيل السيرفر افتح:

```text
/expense-test
```

هذه الصفحة تسجل مصروف فعلي في POS عبر:

```text
/purchase_api/hold_expense
/purchase_api/save_expense_details
/purchase_api/approve_expense_data
```

استخدم مبلغ صغير ورقم فاتورة يبدأ بـ `TEST-` أثناء التجربة.
