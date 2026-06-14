s
# 🎨 UI Design: Blanket Packing (Penpot)

## 📌 Type
UI/UX Design Specification (Pre-Development)

---

## 🎯 Goal

Design a simple, fast, and worker-friendly interface for the **Blanket Packing** module using Penpot before development.

The UI must:
- Be easy for workers to use
- Minimize clicks
- Support fast scanning and printing workflow
- Clearly show order and packing status

---

## 🧱 Frame Setup

### Recommended Sizes:

- Desktop: 1440 × 900
- Tablet (preferred): 1024 × 768

---

## 🧩 Layout Structure

---

## 1. 🟦 Header

### Elements:

- Title: `Blanket Packing`
- Back button
- History button

### Layout:

```

[ 🧺 Blanket Packing ]        [ ← Back ] [ History ]

```

---

## 2. 🟨 Input Section

### Purpose:
Quick order search (keyboard / scanner)

### Elements:

- Large input field
- Search button

### Layout:

```

Scan / Enter Order Number

[ 100245____________ ] [ Search ]

```

### UX Notes:

- Auto focus on load
- Press Enter triggers search
- Clear input after successful operation

---

## 3. 🟩 Order Details Card

### Display:

- Order Number
- Customer Name
- Phone Number
- Total Blankets
- Packed Quantity
- Status

### Layout:

```

Order: 100245
Customer: Ahmed Ali
Phone: 05xxxxxxx
Total Blankets: 2
Packed: 1 / 2
Status: 🟡 Partially Packed

```

---

## 4. 🟧 Progress Section

### Elements:

- Progress text
- Progress bar
- Next label indicator

### Layout:

```

Packed: 1 / 2

[██████░░░░] 50%

Next: 2 of 2

```

---

## 5. 🟥 Main Action Button

### Button:

```

[ PRINT NEXT LABEL ]

```

### Behavior:

- Large and centered
- Disabled if fully packed
- Shows loading state when printing

---

## 6. 🟪 Label Preview Card

### Purpose:
Preview printed sticker

### Layout:

```

IN & OUT LAUNDRY

Order: 100245
Customer: Ahmed Ali
Blanket: 2 of 2
Date: Today

[ Barcode / QR ]

```

---

## 7. ⬜ Activity Panel

### Purpose:
Show recent actions

### Layout:

```

Recent Activity:

10:35 → Printed 1 of 2
10:36 → Printed 2 of 2
10:36 → Fully Packed

```

---

## 8. ⚙️ Secondary Actions

### Buttons:

- Reprint Last Label
- Mark as Packed
- Reset Order

### UX:

- Reprint requires confirmation
- Small secondary buttons

---

## 9. 🚫 Error States

### Examples:

- Order not found
- Already fully packed
- POS connection error

### Messages:

```

Order not found
This order is fully packed
Unable to fetch order data

```

---

## 10. 🧠 UX Guidelines

- Large buttons for workers
- High contrast colors
- Minimal text
- Fast keyboard interaction
- Auto focus input after each action
- Sound feedback (optional)

---

## 11. 🎨 Design System

### Colors:

- Primary: #A23EFB
- Secondary: #6771F5
- Background: #FFFFFF

### Status Colors:

- Not Packed → Gray
- Partially Packed → Yellow
- Fully Packed → Green
- Error → Red

---

## 12. 🧩 Components (Penpot)

Create reusable components:

- Input Field
- Button (Primary / Secondary)
- Card
- Progress Bar
- Status Badge

---

## 13. 🔗 Prototype (Optional)

Link interactions:

- Search → Show Order Card
- Print → Update Progress
- Complete → Show Success State

---

## 🚀 Output

After completing design:

- Export screens
- Validate workflow
- Prepare for React implementation

---

## 🔚 Notes

- Design must match real worker behavior
- Keep UI extremely simple
- Avoid unnecessary steps
- Optimize for speed and clarity

```