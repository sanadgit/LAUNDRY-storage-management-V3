# Meta WhatsApp Cloud API Direct Setup

This project can send customer login and registration OTP codes through the official Meta WhatsApp Cloud API.

## What You Need From Meta

- Meta Business account with WhatsApp enabled.
- WhatsApp Business Account connected to the app.
- A verified or active WhatsApp phone number.
- Phone Number ID from WhatsApp > API Setup.
- Permanent access token or a long-lived system user token with WhatsApp messaging permissions.
- An approved WhatsApp message template for OTP/authentication.

Official Meta references:

- Cloud API: https://developers.facebook.com/docs/whatsapp/cloud-api
- Send message templates: https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-message-templates/
- Message templates: https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates
- Webhooks: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks

## Environment Variables

Add these values to the production environment where `server.ts` runs:

```env
CUSTOMER_SMS_PROVIDER=meta_whatsapp
CUSTOMER_ALERT_WHATSAPP_PROVIDER=meta_whatsapp
META_WHATSAPP_API_VERSION=v20.0
META_WHATSAPP_ACCESS_TOKEN=your_meta_access_token
META_WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
META_WHATSAPP_OTP_TEMPLATE_NAME=your_approved_template_name
META_WHATSAPP_OTP_TEMPLATE_LANGUAGE=en_US
META_WHATSAPP_ALERT_TEMPLATE_NAME=your_approved_order_alert_template_name
META_WHATSAPP_ALERT_TEMPLATE_LANGUAGE=en_US
```

For Meta Authentication templates created with an OTP `copy_code` button, the body usually has no localizable parameters. The project therefore sends the OTP code as a template button parameter by default:

```env
META_WHATSAPP_OTP_INCLUDE_BODY_CODE=false
META_WHATSAPP_OTP_INCLUDE_BUTTON_CODE=true
META_WHATSAPP_OTP_BUTTON_TYPE=url
META_WHATSAPP_OTP_BUTTON_INDEX=0
```

The template creation request in Meta may look like this:

```json
{
  "category": "authentication",
  "components": [
    {
      "type": "body",
      "add_security_recommendation": true
    },
    {
      "type": "footer",
      "code_expiration_minutes": 5
    },
    {
      "type": "buttons",
      "buttons": [
        {
          "type": "otp",
          "otp_type": "copy_code"
        }
      ]
    }
  ]
}
```

That is the template creation shape. The runtime send request uses `/messages` and passes the generated code into the template button component.

If you intentionally use a custom utility template with a body variable such as `Your verification code is {{1}}`, enable body parameters and disable the button parameter:

```env
META_WHATSAPP_OTP_INCLUDE_BODY_CODE=true
META_WHATSAPP_OTP_INCLUDE_BUTTON_CODE=false
```

For order confirmations, order status updates, delivery notifications, invoices, and customer support messages, use an approved utility template with one body parameter:

```text
{{1}}
```

The server sends the rendered customer alert text as that first parameter. If Meta rejects broad free-text templates in your account, create separate approved templates for each notification type and extend the server mapping accordingly.

## How It Works

- The customer site requests an OTP with `channel: whatsapp`.
- The server generates a 6-digit code.
- The code is stored locally as a hash and expires after 5 minutes.
- Meta WhatsApp Cloud API sends the approved template message to the customer.
- The customer enters the code on the site.
- The server verifies the code locally.
- Customer alert endpoints can also send through Meta using `CUSTOMER_ALERT_WHATSAPP_PROVIDER=meta_whatsapp`.

Meta webhooks are useful for delivery statuses and inbound messages, but they are not required for this OTP verification flow.

## Important Notes

- Never expose `META_WHATSAPP_ACCESS_TOKEN` in frontend code or n8n public workflows.
- The WhatsApp template name and language must exactly match the approved template in Meta.
- Customer phone numbers are sent to Meta in E.164 format without the leading `+`.
- In development, `CUSTOMER_SMS_PROVIDER=mock` can still be used to test without sending real WhatsApp messages.
