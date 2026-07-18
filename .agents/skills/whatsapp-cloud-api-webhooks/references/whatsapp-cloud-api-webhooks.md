# WhatsApp Cloud API Webhooks Reference

## Project Use

This skill supports WhatsApp message intake and sending for In & Out Laundry.
It is meant to prevent invalid Cloud API usage and to keep inbound event handling idempotent.

## Required Fields To Persist

- `wamid`
- sender phone
- recipient phone
- message type
- message body or caption
- media id or media URL
- timestamp
- webhook event id if available
- delivery status if available

## Inbound Payload Checklist

When a webhook arrives, confirm:

- webhook verification passed
- sender exists
- message id exists
- message type is known
- payload is not a duplicate
- media references are saved when present
- interactive or list reply data is parsed when present

## Supported Inbound Types

Typical Cloud API payloads that should be handled separately:

- text
- image
- document
- audio
- voice note
- location
- button reply
- list reply
- delivery status
- read status
- failed status

## Outbound Message Rules

For outbound sending:

- one `to` value must equal one phone number
- never join multiple numbers into one string
- send group messages only through a different system if needed; Cloud API is not for groups
- use template messages outside the 24-hour window
- use non-template replies only inside the valid care window

## 24-Hour Care Window

The customer care window starts from the customer's last inbound message.
When the window is open, a free-form reply can be sent.
When it is closed, only approved template-based outreach should be used.

## Message Status Handling

Store and react to:

- `sent`
- `delivered`
- `read`
- `failed`

Recommended behavior:

- `sent`: log outbound attempt
- `delivered`: mark delivery success
- `read`: mark customer read receipt
- `failed`: record failure reason and stop retries unless a retry policy exists

## Idempotency Pattern

Use a dedupe key built from:

- `wamid`
- message id
- direction
- event type

Before writing a new row or firing a workflow, check whether that key already exists.

## Media Download Pattern

If the message contains media:

1. Save the media reference.
2. Resolve the download URL if needed.
3. Download only once.
4. Keep the media metadata linked to the same `wamid`.

## Recommended Workflow Split

- Verify webhook
- Normalize inbound payload
- Dedupe event
- Persist inbound message
- Download media if needed
- Route to customer agent
- Send reply
- Persist outbound message and status updates
