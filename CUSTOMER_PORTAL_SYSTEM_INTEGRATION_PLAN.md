# Customer Portal System Integration Plan

## Goal

Connect the customer website dashboard to the operational system so each signed-in customer sees only their own orders, can manage useful account pages, and can create pickup orders that notify the assigned driver through the official Meta WhatsApp API path already configured in the server.

## Scope

1. Customer dashboard reads orders from the backend by the phone number used during OTP login/registration.
2. Customer dashboard tabs become functional:
   - Dashboard overview
   - My Orders
   - Addresses
   - Invoices
   - Profile
3. New customer website orders are persisted to the system with customer identity metadata.
4. After a new order is created, the backend notifies the most relevant driver by WhatsApp based on the submitted address/area.

## Backend Plan

### Customer Order Ownership

- Add server-side filtering for customer sessions on `GET /api/customer/orders`.
- Admin sessions continue to see all orders.
- Customer sessions only see orders whose stored payload matches:
  - `customerId`, or
  - normalized `customerPhone`, `phoneNumber`, or `phone`.
- `GET /api/customer/orders/:id` also enforces the same access rule for customer sessions.
- `POST /api/customer/orders` enriches payloads created by customer sessions with:
  - `customerId`
  - `customerName`
  - `customerPhone`
  - `customerPhoneNormalized`
  - `customerEmail`
  - `deliveryAddress`

### Driver Notification

- On new customer order creation, select a driver from configured site drivers.
- Current first implementation assigns the first available configured driver because the existing driver model does not yet contain address zones.
- Persist driver notification metadata in the order payload:
  - `assignedDriverId`
  - `assignedDriverName`
  - `driverNotification.status`
  - `driverNotification.sent_at`
  - `driverNotification.error`
- Send a WhatsApp message to the driver using the existing `sendCustomerAlertWhatsapp` helper.
- The message includes order id, customer name, phone, address, pickup slot, service type, and notes.

## Frontend Plan

### Dashboard

- Replace fixed stats with values calculated from the real `orders` prop.
- Track active tab state inside `Dashboard.tsx`.
- Show active order timeline only when relevant data exists.
- Add empty states for customers with no orders.

### My Orders

- Use the customer-filtered `orders` returned by `/api/customer/orders`.
- Support status filtering.
- Keep details modal for each order.
- Show two order references:
  - website pickup request id
  - POS/system order number when a POS match is available.
- Display POS line items when synced:
  - product name
  - service/unit
  - quantity
  - unit price
  - line total
  - matching pricing icon from the website pricing catalog when barcode/name matches.
- Keep website order data visible as a fallback when POS has not been synced yet.

### POS Order Sync

- Add `POST /api/customer/orders/:id/sync-pos`.
- The endpoint enforces the same customer ownership checks as the order detail endpoint.
- Matching strategy:
  - use a saved POS order number/system id if the order already has one.
  - otherwise search POS by the customer's normalized phone number.
  - save the best matched POS order into the website order payload under `pos`.
- Stored POS snapshot includes:
  - `order_no`
  - `system_order_id`
  - invoice reference
  - POS status
  - payment status
  - total, paid, balance
  - synced timestamp
  - line items with barcode, quantity, unit price, and total.
- The dashboard can update one order on demand and auto-attempts a small first-page sync when the customer opens My Orders.

### Addresses

- Derive saved addresses from:
  - customer profile area
  - delivery addresses used in previous orders.
- Present address cards and highlight the profile/default address.

### Invoices

- Derive invoice rows from completed, delivered, paid, or amount-bearing orders.
- Show invoice/order id, date, status, payment status, and amount.

### Profile

- Render customer name, phone, email, customer type, notification preference, and account dates.
- Keep this as read-only for now until profile update APIs are added.

## Follow-Up Items

- Add a persistent customer addresses table if customers need multiple editable saved addresses.
- Add driver service zones/areas in Admin Panel so driver selection can be based on address instead of the first configured driver.
- Add a dedicated Meta template per notification type if the current general alert template is rejected by Meta.
- Add invoice PDF/download endpoint once POS invoice ids are available in the website order payload.
