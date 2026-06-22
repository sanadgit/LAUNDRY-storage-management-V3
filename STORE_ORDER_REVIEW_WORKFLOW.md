# Store Order Review Workflow

## Idea

Create a review page or chat workflow named **Order Review & Verification**.

The employee sends one or more store names with the order numbers currently found in each store. The workflow checks every order against POS, brings the customer details, phone number, payment/balance status, order status, and remark, then groups the result by customer phone.

The main goal is to detect when the same customer has multiple orders spread across different stores or hangers, then alert the employee to collect those orders into one place.

## Problem

Sometimes a customer has more than one order stored in different locations:

- One order in Store A.
- Another order in Store B.
- Another order on a different hanger.

When the customer arrives, the employee may deliver only one order and miss the others. This creates delay, confusion, and repeated customer handling.

## Input Format

The employee can enter the stores and their orders manually, paste from a checklist, or send them through Telegram.

Example:

```text
Store B2-front:
Z63588
Z63590
A260750

Store FA:
M63510
Z63591

Store Hanger-3:
R77210
Z63592
```

Alternative compact format:

```text
B2-front: Z63588, Z63590, A260750
FA: M63510, Z63591
Hanger-3: R77210, Z63592
```

## Processing Steps

1. Parse the submitted store names and order numbers.
2. Normalize order references such as `A`, `M`, `Z`, and `R` branch prefixes.
3. For each order number, call the same POS lookup logic used by Pickup Search.
4. Load these fields:
   - Order number
   - Customer name
   - Customer phone
   - Order status
   - Payment balance
   - Remark
   - Store name submitted by the employee
5. Group all loaded orders by normalized customer phone number.
6. Filter the result to show only phone numbers that have more than one order in the submitted stores.
7. Produce a clear alert for the employee.

## Output Example

If the workflow finds that phone `0568720885` has multiple orders:

```text
Review Result

Customer Phone: 0568720885
Customer Name: Ahmed Ali
Orders found: 3

1. Z63588
   Store: B2-front
   Status: Pending/Unpaid
   Balance: AED 8.40
   Remark: monthly account

2. A260750
   Store: FA
   Status: Fully Packed
   Balance: AED 0.00
   Remark: -

3. M63510
   Store: Hanger-3
   Status: Fully Packed
   Balance: AED 15.75
   Remark: call before delivery

Action Required:
Collect these orders into one store or one hanger before customer pickup.
```

If no duplicate phone numbers are found:

```text
No customers with multiple orders were found in the submitted stores.
```

## Page Version

Suggested page name:

```text
Order Review & Verification
```

Suggested route:

```text
/smart-storage-hub/order-review
```

Page sections:

- Store/order input box.
- Parse preview before sync.
- Sync button.
- Progress indicator while POS data is loading.
- Duplicate customer groups.
- Export or copy result button.
- Mark as reviewed button.

## Telegram Version

Telegram should support two input modes:

1. Guided step-by-step mode.
2. One-message paste mode.

### Guided Telegram Flow

The guided mode is better for daily store checking because the bot walks with the employee store by store.

The bot starts with a ready button:

```text
Order Review & Verification

Press Start to begin checking stores.

[Start Review]
```

After the employee taps `Start Review`, the bot asks for the first store:

```text
Please send the orders currently in Store A.

Send all order numbers in one message, one order per line.

Example:
256580
255560
260555

[Skip Store A] [Cancel]
```

Employee sends:

```text
256580
255560
260555
```

The bot saves these orders under `Store A`, then asks for the next store:

```text
Received 3 orders for Store A.

Please send the orders currently in Store B.

Send all order numbers in one message, one order per line.

[Skip Store B] [Cancel]
```

Then the same process continues:

```text
Please send the orders currently in Store C.
```

```text
Please send the orders currently in Store D.
```

```text
Please send the orders currently in Store upp1.
```

```text
Please send the orders currently in Store upp2.
```

```text
Please send the orders currently in Store Convery.
```

The store list should be dynamic. The workflow should load store names from Smart Storage Hub, then ask the employee in order.

Example store sequence:

```text
A
B
C
D
upp1
upp2
Convery
```

If the system has more stores, they should be added automatically to the guided flow.

### Finishing Guided Mode

After the last store is submitted, the bot sends:

```text
All stores received.

Processing now. This may take some time because POS details must be loaded for every order.

The result will be sent shortly.
```

Then the bot starts processing:

1. Parse all submitted order numbers.
2. Remove duplicate order numbers inside the same review batch.
3. Fetch POS details for each order.
4. Group orders by customer phone.
5. Filter only customers with two or more orders.
6. Send the final review result.

### Empty Store

If a store has no orders, the employee can tap:

```text
[Skip Store A]
```

Or send:

```text
empty
```

The bot records the store as checked with zero orders and moves to the next store.

### Cancel

At any point:

```text
[Cancel]
```

The bot stops the review and discards the current batch:

```text
Review cancelled. No changes were made.
```

### One-Message Paste Mode

The employee can also send:

```text
review
B2-front: Z63588, Z63590, A260750
FA: M63510, Z63591
Hanger-3: R77210, Z63592
```

Bot response after processing:

```text
Review completed.
2 customers have multiple orders in these stores.

[Open Customer 0568720885]
[Open Customer 0504635888]
```

When the employee taps a customer button:

```text
Customer Phone: 0568720885
Orders found: 3

Z63588 | B2-front | Pending/Unpaid | AED 8.40
A260750 | FA | Fully Packed | AED 0.00
M63510 | Hanger-3 | Fully Packed | AED 15.75

Action Required:
Collect all listed orders into one store or one hanger.
```

## Data Model

Optional tables if we want audit history:

```sql
CREATE TABLE order_review_batches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel TEXT NOT NULL DEFAULT 'web',
  submitted_by TEXT,
  submitted_text TEXT NOT NULL,
  duplicate_groups_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_review_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  batch_id INTEGER NOT NULL,
  store_name TEXT NOT NULL,
  order_no TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  order_status TEXT,
  balance REAL DEFAULT 0,
  remark TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_review_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  channel TEXT NOT NULL,
  chat_user_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'collecting',
  current_store_index INTEGER DEFAULT 0,
  store_sequence_json TEXT NOT NULL,
  batch_payload_json TEXT NOT NULL DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);
```

`order_review_sessions` stores the active Telegram step-by-step conversation:

- Which store the employee is currently entering.
- Which stores were already submitted.
- Which stores were skipped.
- The raw order numbers before POS sync.
- Whether the workflow is `collecting`, `processing`, `completed`, or `cancelled`.

## Telegram State Machine

```text
idle
  |
  | Start Review
  v
collecting_store_orders
  |
  | employee sends order list / skip
  v
next_store
  |
  | more stores
  v
collecting_store_orders
  |
  | last store received
  v
processing
  |
  | POS sync completed
  v
completed
```

If the employee sends `cancel` or taps `Cancel`, the session moves to:

```text
cancelled
```

## Rules

- Only show groups where the same phone number has two or more orders.
- Ignore delivered orders if the page is used only for pickup preparation.
- Show delivered orders only if the user enables `Include delivered`.
- If POS details fail for one order, keep it in the result with a warning.
- Do not change storage automatically in the first version.
- The workflow only alerts the employee; moving orders remains a manual action until confirmation flow is added.

## MVP Scope

First version:

1. Web page only or Telegram text command only.
2. Paste store/order text.
3. Parse store names and order numbers.
4. Fetch POS details.
5. Group by phone.
6. Show only duplicate customer phones.
7. Alert employee to collect the orders into one store or hanger.

Second version:

1. Add buttons to assign all orders to one target store.
2. Require confirmation before any storage update.
3. Save audit log for reviewed and moved groups.

## Success Result

The employee can paste the current content of multiple stores, click sync, and immediately know:

- Which customers have multiple orders.
- Where each order currently is.
- Whether any order has balance or special remark.
- Which orders should be collected into one place before pickup.

## Implementation Status

Telegram guided review has been implemented in the existing bot.

A dedicated Smart Storage Hub page has also been implemented:

```text
/smart-storage-hub/order-review
```

The page is available from the sidebar as:

```text
Order Review
```

Web page workflow:

1. Store names load dynamically from Smart Storage Hub.
2. Employee enters all orders for the current store.
3. Employee uses `Save & Next` or `Skip Store`.
4. After every store is reviewed, `Start Processing` becomes available.
5. The server loads POS details and groups orders by normalized customer phone.
6. The page shows only customers with multiple unique orders.
7. Each group displays customer name, phone, store, order status, balance, remark, and the required collection action.

Current supported flow:

1. Employee sends:

```text
review
```

2. Bot shows:

```text
[Start Review]
```

3. Bot asks for each store from the Smart Hub `stores` table.
4. Employee sends all order numbers for the current store in one message.
5. Employee can use `Skip Store` or `Cancel`.
6. After the last store, bot replies:

```text
Processing now. This may take some time because POS details must be loaded for every order.
The result will be sent shortly.
```

7. Bot sends the final duplicate-phone review result with customer buttons.

Optional environment override:

```bash
ORDER_REVIEW_STORE_SEQUENCE=A,B,C,D,upp1,upp2,Convery
```

If this variable is not set, the bot loads store names dynamically from the `stores` table.
