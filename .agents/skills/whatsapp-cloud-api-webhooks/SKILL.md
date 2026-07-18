---
name: whatsapp-cloud-api-webhooks
description: Build and review WhatsApp Cloud API webhook flows for the In & Out Laundry project, including webhook verification, inbound message parsing, media handling, read receipts, delivery states, idempotency, wamid storage, 24-hour customer care windows, templates, interactive messages, and per-recipient outbound sending. Use when creating or editing WhatsApp webhook handlers, message routers, or delivery logic that must avoid invalid Cloud API usage.
---

# WhatsApp Cloud API Webhooks

## Purpose

Use this skill for any workflow or code that receives WhatsApp webhooks, interprets inbound messages, or sends WhatsApp messages through the Cloud API.
Keep the implementation safe, idempotent, and compliant with the 24-hour messaging rules.

## Core Rules

1. Verify the webhook before accepting events.
2. Process each incoming message exactly once.
3. Store `wamid` for every message you handle.
4. Send to one recipient per outbound request.
5. Use templates outside the 24-hour customer care window.
6. Never use WhatsApp Cloud API for groups.
7. Never pack two phone numbers into a single `to` field.

## What This Skill Covers

- Webhook reception
- Webhook verification
- Text message parsing
- Image and document handling
- Voice message handling
- Location message handling
- Interactive buttons
- List messages
- Template messages
- Mark as read
- Media download
- Per-recipient outbound sending
- 24-hour customer care window
- Delivered/read/failed state handling
- Duplicate message protection
- `wamid` storage

## Inbound Flow

1. Verify the webhook challenge.
2. Parse the envelope and event type.
3. Extract sender, message type, message id, and `wamid`.
4. De-duplicate by message id or `wamid`.
5. Route by message type.
6. Persist the inbound record.
7. Mark the message as read when appropriate.
8. Hand off the payload to the customer agent or workflow.

## Message Types

Handle these inbound types explicitly:

- text
- image
- document
- audio / voice
- location
- interactive button reply
- list reply
- template status event
- delivery status event
- read status event
- failed status event

## Media Handling

For images, documents, and voice notes:

- store the media id or URL reference
- download media only when needed
- keep the original metadata
- preserve the sender and `wamid`
- do not assume the content type without checking the payload

## Outbound Rules

- Send one WhatsApp message per recipient.
- If multiple customers must receive the same update, send separate requests.
- Use plain text, interactive messages, or templates according to the allowed window.
- Use templates for proactive outreach or any message sent outside the 24-hour window.
- Do not send a free-form message outside the window.

## 24-Hour Window

Treat the window as the customer service conversation period.
If a customer message arrived within the window, free-form replies are allowed.
If the window is expired, use a template or stop and escalate the next action to the correct workflow.

## Delivery State Handling

Track these states:

- sent
- delivered
- read
- failed

Use status updates to keep conversation logs and delivery logs accurate.
Do not assume a message was read just because it was sent.

## Duplicate Protection

Protect against duplicate processing by storing and checking:

- `wamid`
- webhook event id if available
- message id
- status event id if available

If the same event arrives again, ignore it safely.

## Guardrails

Do not let Codex:

- put two numbers in `to`
- target a WhatsApp group with Cloud API
- send a non-template message outside the 24-hour window
- skip webhook verification
- ignore duplicate webhook deliveries
- drop `wamid`

## Reference Files

Read [references/whatsapp-cloud-api-webhooks.md](references/whatsapp-cloud-api-webhooks.md) for the project-specific payload checklist, state handling, and safe outbound patterns.
