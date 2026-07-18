---
name: customer-identity-resolution
description: Resolve and normalize customer identity for the In & Out Laundry project by standardizing UAE phone numbers, removing separators, matching multiple phone formats, detecting duplicate customer records, linking WhatsApp numbers to customer profiles, and verifying ownership before revealing customer-specific data. Use when a workflow needs to search or secure customer identity from inconsistent phone formats or possible duplicate accounts.
---

# Customer Identity Resolution

## Purpose

Use this skill when Codex needs to identify a customer reliably from phone numbers that may appear in different formats.
Treat identity resolution as both a matching problem and a privacy control.

## Core Rules

1. Normalize UAE phone numbers before searching.
2. Search all supported phone variants before concluding no match exists.
3. Detect duplicates instead of silently picking one record.
4. Link the WhatsApp sender to the customer profile only after normalization and verification.
5. Ask for verification when more than one customer matches.
6. Do not reveal customer orders or account details to an unverified person.

## What This Skill Covers

- UAE phone normalization
- Separator and symbol cleanup
- Multi-format customer search
- Duplicate account detection
- WhatsApp-to-customer linkage
- Verification prompts for ambiguous matches
- Privacy-safe customer lookup

## Phone Normalization Rules

Normalize input by:

- removing spaces
- removing punctuation and symbols
- stripping leading `+`
- stripping leading `00`
- converting local UAE mobile format to a canonical form

Use the canonical form for lookup, but keep the original input for audit and debugging.

## Supported UAE Examples

These should all resolve to the same canonical mobile when they represent the same UAE number:

- `0509998528`
- `971509998528`
- `+971509998528`
- `00971509998528`

## Canonical Search Strategy

When searching customer records, try in this order:

1. exact original string if the source already stores it that way
2. canonical normalized phone
3. local mobile format
4. international UAE format without punctuation
5. WhatsApp sender phone

If any variant returns more than one customer, stop and ask for verification.

## Duplicate Detection

Treat these as duplicate risk signals:

- same normalized phone on multiple rows
- same WhatsApp sender linked to more than one account
- same customer name with multiple phone formats
- same invoice or order history attached to multiple profiles

Do not auto-merge duplicates unless the project explicitly provides a merge workflow.

## Privacy Rules

- Never show someone else’s orders just because a phone number partially matches.
- Never reveal account balances, invoice history, or open complaints without verified ownership.
- If a number is ambiguous, ask for a safe verification step.
- If the user is not authorized, return a generic refusal and route to support or admin flow.

## WhatsApp Linking

If the message comes from WhatsApp:

1. normalize the sender phone
2. search the customer table using normalized variants
3. pick the linked customer only if the match is unique
4. store the WhatsApp sender as the verified channel reference
5. keep the linkage consistent across future lookups

## Verification When Multiple Matches Exist

Ask for one of the following:

- order number
- invoice number
- last four digits of the phone
- registered name
- branch used most recently

Use the minimum verification needed to continue safely.

## Reference Files

Read [references/customer-identity-resolution.md](references/customer-identity-resolution.md) for canonical normalization notes, lookup order, and privacy-safe matching guidance.
