# WhatsApp Manager Templates for In & Out Laundry

Use this file when creating templates in Meta WhatsApp Manager.

## Important Rules

- Template names must be lowercase with underscores.
- Use the same language code in `.env` that appears on the approved template.
- Do not put line breaks, tab characters, or long repeated spaces inside dynamic parameter values.
- For the current server implementation, customer/driver alert templates should use one body variable only: `{{1}}`.
- Authentication templates can be either a Meta OTP copy-code template or a custom utility-style OTP template. The `.env` flags must match the template structure.

## Current `.env` Mapping

```env
CUSTOMER_SMS_PROVIDER=meta_whatsapp
CUSTOMER_ALERT_WHATSAPP_PROVIDER=meta_whatsapp

META_WHATSAPP_OTP_TEMPLATE_NAME=inout_login
META_WHATSAPP_OTP_TEMPLATE_LANGUAGE=en
META_WHATSAPP_OTP_INCLUDE_BODY_CODE=true
META_WHATSAPP_OTP_INCLUDE_BUTTON_CODE=true

META_WHATSAPP_ALERT_TEMPLATE_NAME=order_pick_up_1
META_WHATSAPP_ALERT_TEMPLATE_LANGUAGE=en_US
```

If you create the exact templates below, update `.env` to match the names and languages you approve.

---

# Required Templates That Work With The Current Code

## 1. Customer Login OTP

Recommended template name:

```text
inout_login
```

Category:

```text
Authentication
```

Language:

```text
English
```

Current working structure:

```text
Body has 1 variable: {{1}}
Button has OTP/copy-code parameter
```

Suggested visible body if WhatsApp Manager allows editable body text:

```text
{{1}} is your In & Out Laundry verification code. Do not share this code with anyone.
```

Footer:

```text
This code expires in 5 minutes.
```

Button:

```text
Copy code
```

Server `.env` for this structure:

```env
META_WHATSAPP_OTP_TEMPLATE_NAME=inout_login
META_WHATSAPP_OTP_TEMPLATE_LANGUAGE=en
META_WHATSAPP_OTP_INCLUDE_BODY_CODE=true
META_WHATSAPP_OTP_INCLUDE_BUTTON_CODE=true
META_WHATSAPP_OTP_BUTTON_TYPE=url
META_WHATSAPP_OTP_BUTTON_INDEX=0
```

Alternative official Meta authentication copy-code structure:

```text
Body has 0 variables
OTP button receives the code
```

Server `.env` for this structure:

```env
META_WHATSAPP_OTP_INCLUDE_BODY_CODE=false
META_WHATSAPP_OTP_INCLUDE_BUTTON_CODE=true
```

Use this only if Meta tells you the body expects `0` parameters.

---

## 2. General Order Alert

This is required by the current code for driver notifications and general operational notifications.

Template name:

```text
order_pick_up_1
```

Category:

```text
Utility
```

Language:

```text
English (US)
```

Body:

```text
{{1}}
```

Sample value:

```text
New pickup order | Order: 1234 | Customer: Ahmed Ali | Phone: 0500000000 | Address: Khalidiya, Building 10 | Pickup: Today 10 AM to 12 PM | Service: Wash and Iron
```

Notes:

- Keep this as one paragraph.
- Do not use line breaks in the sample.
- This template is flexible and works with the current server because the server passes one sanitized text parameter.

Server `.env`:

```env
META_WHATSAPP_ALERT_TEMPLATE_NAME=order_pick_up_1
META_WHATSAPP_ALERT_TEMPLATE_LANGUAGE=en_US
```

---

# Recommended Templates To Create Next

These are more professional and easier to manage. They need a small code mapping if you want each event to use its own template instead of the current single `order_pick_up_1` alert template.

## 3. Customer Order Confirmation

Template name:

```text
customer_order_confirmation
```

Category:

```text
Utility
```

Language:

```text
English (US)
```

Body:

```text
Hi {{1}}, your In & Out Laundry order {{2}} has been received. Pickup address: {{3}}. Pickup time: {{4}}.
```

Sample values:

```text
{{1}} Ahmed Ali
{{2}} 1234
{{3}} Khalidiya, Building 10
{{4}} Today 10 AM to 12 PM
```

Server `.env`:

```env
META_WHATSAPP_CUSTOMER_ORDER_CONFIRMATION_TEMPLATE_NAME=customer_order_confirmation
META_WHATSAPP_CUSTOMER_ORDER_CONFIRMATION_TEMPLATE_LANGUAGE=en_US
```

If this template is not configured, the server falls back to the order status update template:

```env
META_WHATSAPP_CUSTOMER_ORDER_STATUS_UPDATE_TEMPLATE_NAME=customer_order_status_update
META_WHATSAPP_CUSTOMER_ORDER_STATUS_UPDATE_TEMPLATE_LANGUAGE=en
```

Fallback body values:

```text
{{1}} Customer name
{{2}} Order id
{{3}} Received
{{4}} Pickup confirmation
```

Optional button:

```text
Track order
```

Button type:

```text
Website URL
```

URL:

```text
https://www.inandoutuae.com/track?id={{1}}
```

Button sample:

```text
1234
```

## 4. Driver New Pickup Assignment

Template name:

```text
driver_pickup_assignment
```

Category:

```text
Utility
```

Language:

```text
English (US)
```

Body:

```text
New pickup assigned. Order {{1}} for {{2}}. Phone: {{3}}. Address: {{4}}. Pickup time: {{5}}. Service: {{6}}.
```

Alternative body matching the website wording:

```text
New pickup order | Order: {{1}} | Customer: {{2}} | Phone: {{3}} | Address: {{4}} | Pickup: {{5}} | Service: {{6}}.

Implementation note:
- Keep this template at 6 body parameters.
- The website may append the selected map link inside `Address: {{4}}` in this format:
  `Address text | Location: https://www.google.com/maps?q=24.000000,54.000000`
- Do not add a seventh parameter unless the server template sender is updated too.
```

Sample values:

```text
{{1}} 1234
{{2}} Ahmed Ali
{{3}}   
{{4}} Khalidiya, Building 10
{{5}} Today 10 AM to 12 PM
{{6}} Wash and Iron
```

Server `.env`:

```env
META_WHATSAPP_DRIVER_PICKUP_TEMPLATE_NAME=driver_pickup_assignment
META_WHATSAPP_DRIVER_PICKUP_TEMPLATE_LANGUAGE=en_US
```

The server sends exactly 6 body parameters to this template:

```text
{{1}} Order id
{{2}} Customer name
{{3}} Customer phone
{{4}} Delivery address
{{5}} Pickup time
{{6}} Service type
```

## 5. Order Status Update

Template name:

```text
customer_order_status_update
```

Category:

```text
Utility
```

Language:

```text
English (US)
```

Body:

```text
Hi {{1}}, your In & Out Laundry order {{2}} is now {{3}}. Estimated next step: {{4}}.
```

Sample values:

```text
{{1}} Ahmed Ali
{{2}} 1234
{{3}} Ready for delivery
{{4}} Driver assignment
```

## 6. Delivery Notification

Template name:

```text
customer_delivery_notification
```

Category:

```text
Utility
```

Language:

```text
English (US)
```

Body:

```text
Hi {{1}}, your In & Out Laundry order {{2}} is out for delivery. Driver: {{3}}. Expected arrival: {{4}}.
```

Sample values:

```text
{{1}} Ahmed Ali
{{2}} 1234
{{3}} Driver 1
{{4}} 30 minutes
```

## 7. Invoice Ready

Template name:

```text
customer_invoice_ready
```

Category:

```text
Utility
```

Language:

```text
English (US)
```

Body:

```text
Hi {{1}}, invoice {{2}} for order {{3}} is ready. Amount due: AED {{4}}. Payment status: {{5}}.
```

Sample values:

```text
{{1}} Ahmed Ali
{{2}} INV-1234
{{3}} 1234
{{4}} 45.00
{{5}} Pending
```

## 8. Customer Support Reply

Template name:

```text
customer_support_reply
```

Category:

```text
Utility
```

Language:

```text
English (US)
```

Body:

```text
Hi {{1}}, our support team has reviewed your request about order {{2}}. Update: {{3}}.
```

Sample values:

```text
{{1}} Ahmed Ali
{{2}} 1234
{{3}} We will contact you shortly to confirm the details
```

---

# Optional Arabic Versions

Create Arabic versions only if you want customers and drivers to receive Arabic messages. Keep the same template names if WhatsApp Manager allows adding a new language translation, or create separate names with `_ar`.

## Arabic Order Confirmation

Template name:

```text
customer_order_confirmation_ar
```

Category:

```text
Utility
```

Language:

```text
Arabic
```

Body:

```text
مرحباً {{1}}، تم استلام طلبك رقم {{2}} لدى In & Out Laundry. عنوان الاستلام: {{3}}. موعد الاستلام: {{4}}.
```

## Arabic Driver Pickup Assignment

Template name:

```text
driver_pickup_assignment_ar
```

Category:

```text
Utility
```

Language:

```text
Arabic
```

Body:

```text
طلب استلام جديد. رقم الطلب {{1}} للعميل {{2}}. الهاتف: {{3}}. العنوان: {{4}}. موعد الاستلام: {{5}}. الخدمة: {{6}}.
```

---

# Implementation Notes

The project currently sends:

- OTP through `META_WHATSAPP_OTP_TEMPLATE_NAME`.
- All alert messages through `META_WHATSAPP_ALERT_TEMPLATE_NAME` with one body parameter.

If you want to use the separate templates above, add template routing in `server.ts`, for example:

- New customer order -> `customer_order_confirmation`
- New driver assignment -> `driver_pickup_assignment`
- Status change -> `customer_order_status_update`
- Delivery status -> `customer_delivery_notification`
- Invoice event -> `customer_invoice_ready`
- Support event -> `customer_support_reply`
