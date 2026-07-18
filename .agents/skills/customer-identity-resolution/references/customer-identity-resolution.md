# Customer Identity Resolution Reference

## Project Use

This skill protects the customer lookup flow for In & Out Laundry.
It is designed for inconsistent phone formats, duplicate accounts, and privacy-safe access to order data.

## Canonical UAE Normalization

Recommended canonical form:

- digits only
- no spaces
- no symbols
- country code preserved
- local zero stripped when converting to international format

Examples:

- `0509998528` -> `971509998528`
- `+971509998528` -> `971509998528`
- `00971509998528` -> `971509998528`

## Lookup Order

Try these variants when searching:

1. original input
2. digits-only input
3. canonical international UAE form
4. local mobile form
5. WhatsApp sender phone

Stop early only when the match is unique and verified.

## Duplicate Handling

If a phone maps to multiple customers:

- do not guess
- do not auto-pick the most recent record without an explicit rule
- ask for verification
- keep the duplicate flag visible to the workflow

Useful duplicate flags:

- multiple customers with same normalized phone
- same customer name with multiple phones
- same WhatsApp number attached to more than one profile

## Privacy-Safe Output

When the match is not verified, return only:

- that the lookup needs verification
- the minimum clarification question
- no order details
- no balances
- no complaint details

## Verification Options

Ask for one of:

- order number
- invoice number
- last four digits
- registered name
- branch

Prefer the least intrusive option that resolves ambiguity.

## Recommended Data Fields

When storing resolved identity, keep:

- original phone input
- normalized phone
- matched customer id
- match confidence
- verification status
- WhatsApp sender phone
- lookup timestamp

## Safe Behavior For WhatsApp

If the WhatsApp sender is already linked to one verified customer:

- reuse the link
- refresh the verification timestamp if needed
- avoid re-asking the same question unless the account became ambiguous
