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

The employee can send:

```text
review
B2-front: Z63588, Z63590, A260750
FA: M63510, Z63591
Hanger-3: R77210, Z63592
```

Bot response:

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
