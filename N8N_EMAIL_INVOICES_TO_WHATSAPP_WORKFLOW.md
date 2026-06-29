# n8n Email Invoices To WhatsApp Official

Workflow file:

`n8n-email-invoices-to-whatsapp-official.json`

Recommended Gmail workflow:

`n8n-gmail-invoices-to-whatsapp-official.json`

If the invoice mailbox is Gmail, use the Gmail workflow above. Keep this IMAP workflow as a fallback for non-Gmail inboxes or if OAuth setup is blocked.

## Important Limitation

Meta WhatsApp Business API الرسمي لا يدعم الإرسال إلى WhatsApp Groups.

البديل في هذا workflow:

- ضع أرقام الإدارة أو المالية في `WHATSAPP_INVOICE_RECIPIENTS`.
- سيرسل نفس ملخص الفاتورة وملف PDF لكل رقم بشكل فردي.

إذا أردت قروب واتساب فعلي، فهذا يحتاج مزود غير رسمي مبني على WhatsApp Web، وهذا ليس Meta الرسمي.

## Required n8n Credentials

Create one IMAP credential:

- Host: حسب مزود البريد
- Port: غالبا `993`
- SSL/TLS: enabled
- User: بريد استلام الفواتير
- Password/App Password

Then open the node:

`Invoice Email Trigger`

and select the IMAP credential.

## Required n8n Variables

Add these in n8n Variables:

```txt
META_WHATSAPP_ACCESS_TOKEN=EA...
META_WHATSAPP_PHONE_NUMBER_ID=1190287117501375
META_GRAPH_API_VERSION=v20.0
WHATSAPP_INVOICE_RECIPIENTS=971568720885,9715XXXXXXXX
```

Optional:

```txt
INVOICE_ALLOWED_SENDERS=taxinvoice@network.ae,digital.services@taqadistribution.com
INVOICE_IMAP_SEARCH=[UNSEEN]
```

## Supported Email Examples

The parser recognizes:

- Network International:
  - `taxinvoice@network.ae`
  - Subject like `Tax Invoice for the period 11-06-2026 to 20-06-2026`

- TAQA Arabic:
  - `digital.services@taqadistribution.com`
  - رقم الحساب
  - رقم الفاتورة
  - الكهرباء
  - المياه
  - الإجمالي المستحق للدفع

- TAQA English:
  - ACCOUNT NUMBER
  - BILL NUMBER
  - Electricity
  - Water
  - TOTAL TO PAY

- Etisalat / e&
- Bank fee / transaction fee emails

## What The WhatsApp Message Contains

The message includes:

- Provider
- Category
- Account number
- Bill or invoice number
- Invoice period
- Invoice date
- Due date
- Total amount
- Electricity amount, if found
- Water amount, if found
- Branch/location line, if found
- Sender email
- Email subject
- PDF document, if attached

## Test Steps

1. Import `n8n-email-invoices-to-whatsapp-official.json` into n8n.
2. Select your IMAP credential in `Invoice Email Trigger`.
3. Add the required Variables.
4. Send a test email from one of the allowed senders, or temporarily add your own test sender to `INVOICE_ALLOWED_SENDERS`.
5. Attach a PDF invoice.
6. Run the workflow manually once.
7. Confirm WhatsApp receives:
   - Summary text
   - PDF document if attachment exists

## Notes

- If the email has no PDF, the workflow sends text only.
- If several recipients are configured, every recipient receives the same invoice.
- If you use Meta official WhatsApp, every recipient must be reachable according to your WhatsApp Business rules and template/session policy.
