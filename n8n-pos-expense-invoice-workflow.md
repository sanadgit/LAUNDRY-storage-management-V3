# n8n POS Expense Invoice Workflow

الملف الجاهز للاستيراد في n8n:

```text
n8n-pos-expense-invoice-auto-login.json
```

يعتمد على طريقة Aipsost الواضحة من الملفات:

```text
/purchase_api/hold_expense
/purchase_api/save_expense_details
/purchase_api/approve_expense_data
```

## n8n Variables المطلوبة

```text
POS_USERNAME=YOUR_POS_USERNAME
POS_PASSWORD=YOUR_POS_PASSWORD
AIPSOFT_API_USER_ID=YOUR_API_USER_ID
```

اختياري:

```text
AIPSOFT_CLIENT_IDENTIFIER=inout
AIPSOFT_API_BASE_URL=https://beta.aipsoft.com/inout
AIPSOFT_DEFAULT_BRANCH_ID=1
AIPSOFT_DEFAULT_PAY_ACCOUNT_ID=YOUR_PAY_ACCOUNT_ID
```

## Webhook Payload

```json
{
  "branch_id": "1",
  "pay_account": "PAY_ACCOUNT_ID",
  "date": "2026-06-10",
  "bill_date": "2026-06-10",
  "bill_no": "INV-1001",
  "remark": "Supplier invoice",
  "vendor_id": "",
  "lines": [
    {
      "account_head": "36460",
      "notes": "Chemicals purchase",
      "amount": 100,
      "tax_rate": 5
    }
  ]
}
```

يمكن استخدام `tax_amount` و`total` بدلاً من `tax_rate`.

## بعض Expense Account IDs من `expense.md`

```text
11    Purchase Account
33958 Miscellaneous Account
36460 Chemicals Purchases
43383 Salaries
44291 petrol exp
44337 Car Expenses
44775 maintenance machine
46298 rents
52253 Internet+Phone
54265 WATER-Electricity
61639 IT & Software
61640 Printing and Stationeries
66280 Health Insurance Expense
66281 Trade License Fees
66285 Insurance Expense
66287 Traffic Fines
```

مهم: `pay_account` هو حساب الدفع، وليس حساب المصروف. إذا لم تعرف رقمه من POS، ضعه في payload لكل فاتورة بعد التأكد من السستم.
