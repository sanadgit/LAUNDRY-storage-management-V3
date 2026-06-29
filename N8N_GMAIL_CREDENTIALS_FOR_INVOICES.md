# Gmail Credentials For n8n Invoice Workflow

This guide connects Gmail to:

`n8n-email-invoices-to-whatsapp-official.json`

## Recommended: Gmail via IMAP App Password

Use this option with the current workflow node:

`Invoice Email Trigger`

It works well for invoice emails because it can download PDF attachments directly.

### 1. Enable IMAP In Gmail

Open Gmail:

1. Settings
2. See all settings
3. Forwarding and POP/IMAP
4. Enable IMAP
5. Save Changes

### 2. Create Gmail App Password

In Google Account:

1. Security
2. Enable 2-Step Verification if not enabled
3. App passwords
4. Select app: Mail
5. Select device: Other
6. Name it: `n8n invoices`
7. Copy the generated 16-character password

Do not use your normal Gmail password in n8n.

### 3. Create n8n IMAP Credential

In n8n:

1. Credentials
2. New credential
3. Search: `IMAP`
4. Fill:

```txt
User: your-gmail-address@gmail.com
Password: Gmail App Password
Host: imap.gmail.com
Port: 993
SSL/TLS: enabled
```

Save credential.

### 4. Attach Credential To Workflow

Open the imported workflow:

`Email Invoices To WhatsApp Official`

Open node:

`Invoice Email Trigger`

Select your new IMAP credential.

### 5. Recommended Gmail Filters

Create Gmail filters to keep invoices organized:

From:

```txt
taxinvoice@network.ae
digital.services@taqadistribution.com
```

Actions:

- Apply label: `Invoices`
- Never send it to Spam
- Mark as important

Then in n8n, keep:

```txt
INVOICE_IMAP_SEARCH=[UNSEEN]
```

Or use a stricter IMAP search later if needed.

## Optional: Gmail OAuth Credential

Use this only if you want to replace the IMAP Email Trigger with n8n Gmail Trigger.

### n8n Cloud

If your n8n Cloud account supports managed Google OAuth:

1. Create Gmail credential
2. Click `Sign in with Google`
3. Allow Gmail access
4. Save

### Self-hosted n8n

You need Google Cloud:

1. Create Google Cloud project
2. Enable Gmail API
3. Configure OAuth consent screen
4. Create OAuth Client ID
5. Copy n8n redirect URL from the n8n Gmail credential screen
6. Add that URL in Google Cloud authorized redirect URIs
7. Paste Client ID and Client Secret into n8n
8. Sign in with Google

For self-hosted n8n, make sure your public n8n URL is correct:

```txt
N8N_HOST=your-domain.com
N8N_PROTOCOL=https
WEBHOOK_URL=https://your-domain.com/
N8N_EDITOR_BASE_URL=https://your-domain.com/
```

## Which One Should We Use?

For this invoice workflow, use:

`Gmail App Password + IMAP`

Reason:

- Simpler
- Stable
- Downloads attachments directly
- No Google Cloud OAuth setup
- Works with the workflow already created

