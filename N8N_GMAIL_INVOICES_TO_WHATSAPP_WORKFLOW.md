# n8n Gmail Invoices To WhatsApp Official

Workflow file:

`n8n-gmail-invoices-to-whatsapp-official.json`

This is the recommended Gmail version. It uses the official n8n Gmail node with OAuth2 instead of IMAP.

## Important Limitation

Meta WhatsApp Business API الرسمي لا يدعم الإرسال إلى WhatsApp Groups.

البديل في هذا workflow:

- ضع أرقام الإدارة أو المالية في `WHATSAPP_INVOICE_RECIPIENTS`.
- سيرسل نفس ملخص الفاتورة وملف PDF لكل رقم بشكل فردي.

## Required n8n Credential

Create a Gmail OAuth2 credential in n8n:

1. n8n > Credentials
2. New credential
3. Search `Gmail`
4. Select OAuth2
5. Sign in with the Gmail account that receives invoices
6. Save

For self-hosted n8n, you may need Google Cloud OAuth Client ID and Client Secret. Use the redirect URL shown inside the n8n Gmail credential screen.

## Required Inline Config

This workflow does not require paid n8n Variables.

Open the node:

`Parse Invoice Email`

At the top of the code, paste your values in this config block:

```js
const vars = {
  META_GRAPH_API_VERSION: 'v20.0',
  META_WHATSAPP_PHONE_NUMBER_ID: '1190287117501375',
  META_WHATSAPP_ACCESS_TOKEN: 'EA...',
  WHATSAPP_INVOICE_RECIPIENTS: '971568720885,9715XXXXXXXX',
  INVOICE_ALLOWED_SENDERS: 'taxinvoice@network.ae,digital.services@taqadistribution.com'
};
```

Do not add `Bearer` before the token. The HTTP nodes add `Bearer` automatically.

To change the Gmail search query, open:

`Gmail Get Unread Invoice Messages`

Then edit the `Search` field.

## Workflow Logic

1. Runs every 15 minutes.
2. Gmail `Get Many Messages` searches unread invoice emails.
3. Downloads attachments with prefix `attachment_`.
4. Parses provider, account, bill number, amount, due date, and branch/location.
5. Uploads the PDF to Meta WhatsApp Cloud API.
6. Sends the document or text-only summary to every configured recipient.
7. Marks the Gmail message as read after WhatsApp sending.

## Recommended Search Query

Start with:

```txt
is:unread has:attachment (from:taxinvoice@network.ae OR from:digital.services@taqadistribution.com OR from:etisalat OR from:eand OR from:bank)
```

For testing with your own sender, temporarily use:

```txt
is:unread has:attachment newer_than:7d
```

## Test Steps

1. Import `n8n-gmail-invoices-to-whatsapp-official.json` into n8n.
2. Open `Parse Invoice Email` and paste your Meta token, phone number ID, and recipients in the config block.
3. Open these Gmail nodes and select your Gmail credential:
   - `Gmail Get Unread Invoice Messages`
   - `Mark Document Gmail Message Read`
   - `Mark Text Gmail Message Read`
4. Send a test email with PDF attachment to the Gmail inbox.
5. Run the workflow manually once.
6. Confirm WhatsApp receives the invoice summary and PDF.
7. Confirm the Gmail message becomes read after success.

## Notes

- If the email has no PDF, the workflow sends text only.
- If several recipients are configured, every recipient receives the same invoice.
- If the message should not repeat, keep the search query using `is:unread`.
- Keep the old IMAP workflow only as a fallback.
