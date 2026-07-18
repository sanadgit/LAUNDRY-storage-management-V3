# AI Laundry Operations Agent Plan

## In & Out Laundry

## 1. Project Objective

Build a complete AI-powered WhatsApp and website messaging system for In & Out Laundry.

The system must work as:

1. Customer Service Agent
2. Pickup & Delivery Agent
3. Complaint Management Agent
4. Order Tracking Agent
5. Driver Coordination Agent
6. Branch Manager Follow-up Agent
7. Internal Operations Assistant
8. Reports and Escalation Agent

The agent must only answer about:

* In & Out Laundry
* Laundry services
* Prices
* Branches
* Pickup and delivery
* Customer orders
* Complaints
* Garment care
* Laundry operations

The agent must not answer unrelated questions.

---

# 2. Main Channels

## Customer Channels

* Website floating WhatsApp button
* WhatsApp Business Cloud API
* Future website live chat widget

## Internal Channels

* WhatsApp groups
* Branch manager numbers
* Driver numbers
* Admin numbers
* Telegram alerts
* Email alerts if needed

---

# 3. Required System Architecture

## Main Components

```txt
Website WhatsApp Button
        ↓
WhatsApp Cloud API
        ↓
Meta Webhook
        ↓
n8n Webhook Trigger
        ↓
Message Router
        ↓
AI Agent
        ↓
Database / POS / Google Sheets / CRM
        ↓
Reply to Customer / Driver / Manager
```

---

# 4. Required Environment Variables

Create `.env.example`:

```env
# App
APP_NAME="In & Out Laundry AI Agent"
APP_URL="https://www.inandoutuae.com"
NODE_ENV="production"

# OpenAI
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4.1-mini"

# WhatsApp Cloud API
WHATSAPP_ACCESS_TOKEN=""
WHATSAPP_PHONE_NUMBER_ID=""
WHATSAPP_BUSINESS_ACCOUNT_ID=""
WHATSAPP_VERIFY_TOKEN=""
WHATSAPP_API_VERSION="v20.0"

# n8n
N8N_WEBHOOK_BASE_URL=""
N8N_API_KEY=""

# Database
DATABASE_URL=""
DB_HOST=""
DB_PORT=""
DB_NAME="laundry_management_system"
DB_USER=""
DB_PASSWORD=""

# Telegram
TELEGRAM_BOT_TOKEN=""
TELEGRAM_ADMIN_CHAT_ID=""
TELEGRAM_OPERATIONS_CHAT_ID=""
TELEGRAM_COMPLAINTS_CHAT_ID=""

# Google Maps
GOOGLE_MAPS_API_KEY=""

# Admin
GENERAL_MANAGER_PHONE=""
OPERATIONS_MANAGER_PHONE=""
ACCOUNTING_MANAGER_PHONE=""
```

---

# 5. Database Tables Required

## 5.1 ai_contacts

Stores all people who interact with the AI.

```sql
CREATE TABLE ai_contacts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  phone VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(150),
  role ENUM('customer','driver','branch_manager','cashier','accountant','operations_manager','general_manager','unknown') DEFAULT 'unknown',
  branch_id BIGINT NULL,
  language VARCHAR(20) DEFAULT 'auto',
  is_vip BOOLEAN DEFAULT FALSE,
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 5.2 ai_conversations

Stores every conversation.

```sql
CREATE TABLE ai_conversations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  contact_id BIGINT NOT NULL,
  channel ENUM('whatsapp','website','telegram') DEFAULT 'whatsapp',
  status ENUM('open','waiting_customer','waiting_staff','resolved','closed') DEFAULT 'open',
  intent VARCHAR(100),
  priority ENUM('low','normal','high','urgent') DEFAULT 'normal',
  assigned_to_phone VARCHAR(30),
  branch_id BIGINT NULL,
  last_message_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 5.3 ai_messages

Stores all incoming and outgoing messages.

```sql
CREATE TABLE ai_messages (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  conversation_id BIGINT NOT NULL,
  direction ENUM('inbound','outbound') NOT NULL,
  sender_phone VARCHAR(30),
  receiver_phone VARCHAR(30),
  message_type ENUM('text','image','voice','document','location','button','system') DEFAULT 'text',
  message_text TEXT,
  media_url TEXT,
  whatsapp_message_id VARCHAR(255),
  ai_response BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5.4 pickup_requests

```sql
CREATE TABLE pickup_requests (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  customer_name VARCHAR(150),
  customer_phone VARCHAR(30),
  branch_id BIGINT NULL,
  address TEXT,
  google_maps_url TEXT,
  latitude DECIMAL(10,7) NULL,
  longitude DECIMAL(10,7) NULL,
  preferred_time VARCHAR(100),
  status ENUM('new','assigned','accepted','on_the_way','picked_up','cancelled','completed') DEFAULT 'new',
  assigned_driver_phone VARCHAR(30),
  notes TEXT,
  created_by ENUM('ai','admin','customer') DEFAULT 'ai',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 5.5 delivery_requests

```sql
CREATE TABLE delivery_requests (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NULL,
  customer_name VARCHAR(150),
  customer_phone VARCHAR(30),
  branch_id BIGINT NULL,
  address TEXT,
  google_maps_url TEXT,
  status ENUM('new','assigned','accepted','out_for_delivery','delivered','failed','cancelled') DEFAULT 'new',
  assigned_driver_phone VARCHAR(30),
  payment_status ENUM('unknown','paid','cash_on_delivery','card_on_delivery') DEFAULT 'unknown',
  notes TEXT,
  created_by ENUM('ai','admin','customer') DEFAULT 'ai',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 5.6 complaint_tickets

```sql
CREATE TABLE complaint_tickets (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  customer_name VARCHAR(150),
  customer_phone VARCHAR(30),
  order_id BIGINT NULL,
  branch_id BIGINT NULL,
  complaint_type ENUM('quality','delay','price','delivery','lost_item','damage','staff_behavior','other') DEFAULT 'other',
  description TEXT,
  priority ENUM('low','normal','high','urgent') DEFAULT 'normal',
  status ENUM('new','assigned','investigating','waiting_customer','resolved','closed') DEFAULT 'new',
  assigned_to_phone VARCHAR(30),
  resolution TEXT,
  customer_satisfaction INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 5.7 ai_knowledge_base

```sql
CREATE TABLE ai_knowledge_base (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  category VARCHAR(100),
  title VARCHAR(255),
  content TEXT,
  branch_id BIGINT NULL,
  language VARCHAR(20) DEFAULT 'en',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

# 6. Required Admin Dashboard Pages

Codex must create these pages inside the current project.

## 6.1 AI Dashboard

Route:

```txt
/admin/ai-dashboard
```

Show:

* Today conversations
* Open complaints
* Pending pickups
* Pending deliveries
* Unanswered staff requests
* Driver status
* Branch status
* Urgent alerts
* AI failed responses

---

## 6.2 AI Conversations Page

Route:

```txt
/admin/ai-conversations
```

Features:

* View customer conversations
* Filter by branch
* Filter by status
* Filter by intent
* Take over conversation manually
* Reply manually
* Close conversation
* Add internal note

---

## 6.3 Pickup Requests Page

Route:

```txt
/admin/pickups
```

Features:

* New pickup requests
* Assign driver
* Change status
* Open Google Maps
* Send WhatsApp update
* Cancel request
* Convert pickup to POS order if needed

---

## 6.4 Delivery Requests Page

Route:

```txt
/admin/deliveries
```

Features:

* Delivery queue
* Assign driver
* View order details
* Confirm delivery
* Payment status
* Failed delivery reason

---

## 6.5 Complaints Page

Route:

```txt
/admin/complaints
```

Features:

* New complaints
* Assign responsible person
* Priority level
* Internal notes
* Customer updates
* Resolution
* Close ticket
* Ask for rating

---

## 6.6 Knowledge Base Page

Route:

```txt
/admin/ai-knowledge
```

Features:

* Add service prices
* Add branch info
* Add FAQ
* Add SOP
* Add garment care instructions
* Add complaint policy
* Add delivery areas
* Enable / disable knowledge item

---

# 7. API Endpoints Required

Codex must create backend API endpoints.

## 7.1 WhatsApp Webhook

```http
GET /api/webhooks/whatsapp
POST /api/webhooks/whatsapp
```

GET is for Meta verification.

POST receives messages.

---

## 7.2 Send WhatsApp Message

```http
POST /api/whatsapp/send
```

Body:

```json
{
  "to": "9715XXXXXXXX",
  "message": "Text message"
}
```

---

## 7.3 AI Message Router

```http
POST /api/ai/router
```

Responsibilities:

* Detect sender role
* Detect language
* Detect intent
* Decide correct workflow
* Call AI agent
* Save conversation
* Return response

---

## 7.4 Pickup API

```http
GET /api/pickups
POST /api/pickups
PATCH /api/pickups/:id
```

---

## 7.5 Delivery API

```http
GET /api/deliveries
POST /api/deliveries
PATCH /api/deliveries/:id
```

---

## 7.6 Complaints API

```http
GET /api/complaints
POST /api/complaints
PATCH /api/complaints/:id
```

---

## 7.7 Knowledge API

```http
GET /api/ai/knowledge
POST /api/ai/knowledge
PATCH /api/ai/knowledge/:id
DELETE /api/ai/knowledge/:id
```

---

## 7.8 Order Tracking API

```http
GET /api/orders/track/:orderId
```

Return:

```json
{
  "order_id": 256741,
  "customer_name": "Customer",
  "branch": "AL FALAH",
  "status": "Ready",
  "total": 45.00,
  "paid": true,
  "expected_delivery": "Today 8 PM"
}
```

---

# 8. AI Intent Classification

The AI must classify messages into these intents:

```txt
price_inquiry
branch_location
opening_hours
pickup_request
delivery_request
order_tracking
complaint
lost_item
damage_claim
payment_question
service_question
garment_care
driver_update
manager_report
cash_deposit_followup
machine_problem
stock_problem
employee_attendance
unknown
```

---

# 9. AI Agent Rules

## Global Rules

The AI must:

* Speak in the same language as the user
* Be polite
* Be short and clear
* Ask one question at a time
* Never invent prices
* Get prices from database only
* Never promise impossible delivery
* Never blame staff
* Never admit liability for damage before investigation
* Escalate urgent complaints
* Save every conversation
* Use customer name if known
* Stay inside In & Out Laundry scope

---

# 10. Main System Prompt

Use this as the main AI system prompt:

```txt
You are the official AI Operations Assistant for In & Out Laundry in UAE.

You represent the company professionally.

Your job is to help customers, drivers, branch managers, and company staff.

You can answer only about:
- In & Out Laundry
- Laundry services
- Prices
- Branches
- Pickup and delivery
- Orders
- Complaints
- Garment care
- Laundry operations

You must not answer unrelated questions.

If the user asks an unrelated question, politely say:
"I can help you with In & Out Laundry services, orders, pickup, delivery, prices, branches, or complaints."

Always detect the user's role:
- Customer
- Driver
- Branch Manager
- Cashier
- Accountant
- Operations Manager
- General Manager

Always detect the user's language and reply in the same language.

Never invent prices.
Use database knowledge only.

Never confirm pickup or delivery unless all required information is available.

For pickup, collect:
1. Customer name
2. Phone number
3. Location
4. Preferred time
5. Branch if known

For delivery, collect:
1. Order number
2. Customer phone
3. Location
4. Payment status if available

For complaints, collect:
1. Customer name
2. Phone
3. Order number if available
4. Complaint type
5. Description
6. Photo if needed

For drivers, accept these commands:
- ACCEPT
- ON THE WAY
- PICKED UP
- DELIVERED
- FAILED
- LOCATION
- DELAY

For branch managers, collect:
- Staff attendance
- Cash amount
- Pending orders
- Delayed orders
- Machine problems
- Chemical stock
- Customer complaints

Escalate urgent cases to the operations manager.

Keep replies professional, simple, and useful.
```

---

# 11. n8n Workflows Required

## Workflow 1: Incoming WhatsApp Message Router

Name:

```txt
WA - Incoming Message Router
```

Trigger:

```txt
WhatsApp Business Cloud Trigger or Webhook Trigger
```

Steps:

1. Receive message
2. Extract sender phone
3. Extract message text
4. Save inbound message
5. Find contact in database
6. Detect role
7. Detect intent
8. Route to correct workflow
9. Generate AI response
10. Send WhatsApp reply
11. Save outbound message

---

## Workflow 2: Customer Price Inquiry

Name:

```txt
AI - Price Inquiry
```

Steps:

1. Receive service question
2. Search service price from POS database
3. If branch-specific price exists, use branch price
4. Reply with price
5. Offer pickup booking

Example reply:

```txt
Ironing price depends on item type.
Please send the item name, for example: shirt, kandora, abaya, blanket.
```

---

## Workflow 3: Pickup Request

Name:

```txt
AI - Pickup Request
```

Steps:

1. Collect customer name
2. Collect phone
3. Collect location
4. Collect preferred time
5. Detect nearest branch
6. Create pickup request
7. Notify branch manager
8. Notify available driver
9. Send confirmation to customer

---

## Workflow 4: Driver Pickup Confirmation

Name:

```txt
Driver - Pickup Task
```

Steps:

1. Send task to driver
2. Wait for driver reply
3. If ACCEPT, update pickup status
4. If ON THE WAY, notify customer
5. If PICKED UP, update status
6. If no reply in 10 minutes, remind driver
7. If no reply in 30 minutes, notify branch manager

---

## Workflow 5: Delivery Request

Name:

```txt
AI - Delivery Request
```

Steps:

1. Ask for order number
2. Verify order in POS
3. Check order status
4. If ready, create delivery request
5. Assign driver
6. Notify customer
7. Track delivery status

---

## Workflow 6: Complaint Management

Name:

```txt
AI - Complaint Management
```

Steps:

1. Classify complaint
2. Create complaint ticket
3. Set priority
4. Assign responsible manager
5. Send apology and ticket number to customer
6. Follow up with manager
7. Update customer
8. Close ticket only after resolution

---

## Workflow 7: Branch Manager Daily Check

Name:

```txt
Manager - Daily Branch Check
```

Schedule:

```txt
Every day 10:00 AM
```

Questions:

```txt
Good morning.
Please send today's branch status:

1. Staff present:
2. Pending urgent orders:
3. Delayed orders:
4. Machine problems:
5. Chemical stock issues:
6. Packaging stock issues:
7. Customer complaints:
8. Cash amount:
```

If no reply:

* After 30 minutes: reminder
* After 1 hour: notify operations manager

---

## Workflow 8: Daily Operations Report

Name:

```txt
Report - Daily Operations Summary
```

Schedule:

```txt
Every day 11:30 PM
```

Report includes:

* Total orders
* Total revenue
* Cash
* Card
* Expenses
* Net cash
* Pickups
* Deliveries
* Complaints
* Delayed orders
* Branch issues

Send to:

* General Manager
* Operations group
* Accounting group

---

## Workflow 9: Weekly Cash Deposit Follow-up

Name:

```txt
Report - Weekly Cash Deposit
```

Schedule:

```txt
Every Monday 9:00 AM
```

Steps:

1. Calculate weekly cash
2. Subtract cash expenses
3. Send required deposit amount to branch manager
4. Ask for bank deposit receipt photo
5. Save receipt
6. Notify accounting

---

## Workflow 10: Review Request Automation

Name:

```txt
Marketing - Review Request
```

Trigger:

```txt
Order Delivered
```

Steps:

1. Wait 2 hours after delivery
2. Send polite review request
3. If positive reply, send Google Maps review link
4. If negative reply, create complaint ticket

---

# 12. Role-Based Permissions

## Customer

Allowed:

* Ask prices
* Book pickup
* Request delivery
* Track order
* Submit complaint

Not allowed:

* Internal reports
* Driver info
* Branch financial data

---

## Driver

Allowed:

* View assigned tasks
* Update pickup status
* Update delivery status
* Send delay reason
* Send location

Not allowed:

* View financial reports
* View other drivers' tasks

---

## Branch Manager

Allowed:

* View branch requests
* Assign drivers
* View complaints for branch
* Submit daily report
* Update branch issues

---

## Operations Manager

Allowed:

* View all branches
* View all complaints
* View delivery performance
* Escalate cases
* Reassign tasks

---

## General Manager

Allowed:

* Full access
* Daily report
* Monthly report
* Branch comparison
* Financial summary
* Critical alerts

---

# 13. Website Floating WhatsApp Button

Codex must update website button.

## Required Behavior

Button opens WhatsApp with pre-filled message:

```txt
Hello In & Out Laundry, I need help with laundry service.
```

URL format:

```txt
https://wa.me/971XXXXXXXXX?text=Hello%20In%20%26%20Out%20Laundry%2C%20I%20need%20help%20with%20laundry%20service.
```

## Optional Advanced Widget

Create small menu before opening WhatsApp:

* Price inquiry
* Book pickup
* Track order
* Complaint
* Branch location

Each button opens WhatsApp with different pre-filled message.

---

# 14. Customer Conversation Flows

## 14.1 Price Inquiry

Customer:

```txt
كم سعر غسيل العباية؟
```

AI:

```txt
أكيد. سعر العباية يعتمد على نوع الخدمة:
غسيل عادي، تنظيف جاف، أو عباية حساسة بزينة.
هل العباية عادية أم فيها فصوص / خرز / تطريز؟
```

---

## 14.2 Pickup

Customer:

```txt
عايز استلام ملابس
```

AI:

```txt
أكيد، نرتب لك الاستلام.
من فضلك أرسل الموقع من واتساب أو رابط Google Maps.
```

Then:

```txt
تمام. ما هو الوقت المناسب للاستلام؟
```

Then create request.

---

## 14.3 Complaint

Customer:

```txt
ملابسي اتأخرت
```

AI:

```txt
نعتذر لك عن التأخير.
من فضلك أرسل رقم الطلب حتى أتحقق لك مباشرة.
```

---

# 15. Internal Staff Commands

## Driver Commands

```txt
ACCEPT 123
ON THE WAY 123
PICKED UP 123
DELIVERED 123
FAILED 123 reason
LOCATION 123
```

Arabic supported:

```txt
قبلت 123
في الطريق 123
تم الاستلام 123
تم التوصيل 123
فشل 123 السبب
```

---

## Manager Commands

```txt
STATUS
TODAY REPORT
CASH 1500
MACHINE ISSUE washing machine 2 stopped
STOCK detergent low
COMPLAINT 256741 customer says abaya damaged
```

Arabic supported:

```txt
تقرير اليوم
الكاش 1500
عطل ماكينة رقم 2
نقص مسحوق
شكوى 256741
```

---

# 16. Escalation Rules

## Complaint Priority

Urgent if:

* Customer says garment damaged
* Lost expensive item
* VIP customer
* Angry customer
* Repeated complaint
* Negative review threat
* Police / legal threat

Escalate to:

1. Branch Manager
2. Operations Manager
3. General Manager

---

## Driver Delay

If driver does not reply:

* 10 minutes: reminder
* 30 minutes: branch manager
* 60 minutes: operations manager

---

## Pickup Delay

If pickup not accepted after 15 minutes:

* Assign another driver
* Notify manager

---

## Delivery Failed

Ask driver for reason:

* Customer not available
* Wrong location
* Payment issue
* Item not ready
* Other

Save reason.

---

# 17. AI Safety Rules

The AI must not:

* Give discounts without permission
* Admit company fault before investigation
* Promise exact delivery if not confirmed
* Share staff phone numbers with customers
* Share financial reports with non-admins
* Answer unrelated questions
* Delete records
* Close complaints without manager approval
* Invent unavailable services
* Invent prices

---

# 18. Development Tasks for Codex

## Phase 1: Backend Foundation

Tasks:

1. Create database migrations for AI tables
2. Create WhatsApp webhook endpoint
3. Create WhatsApp send message service
4. Create AI router service
5. Create conversation logging
6. Create contact role detection
7. Create intent detection
8. Create order tracking API

---

## Phase 2: Admin Dashboard

Tasks:

1. Build AI dashboard page
2. Build conversations page
3. Build pickup requests page
4. Build delivery requests page
5. Build complaints page
6. Build knowledge base page

---

## Phase 3: n8n Workflows

Tasks:

1. Build incoming WhatsApp router
2. Build pickup workflow
3. Build delivery workflow
4. Build complaint workflow
5. Build driver task workflow
6. Build branch manager daily check workflow
7. Build daily report workflow
8. Build review request workflow

---

## Phase 4: AI Agent

Tasks:

1. Add main system prompt
2. Add role prompts
3. Add intent classifier
4. Add language detector
5. Add knowledge base retrieval
6. Add POS order lookup
7. Add branch and price lookup
8. Add escalation logic

---

## Phase 5: Testing

Test cases:

1. Customer asks price
2. Customer books pickup
3. Customer tracks order
4. Customer submits complaint
5. Driver accepts pickup
6. Driver marks delivered
7. Manager sends daily report
8. AI escalates urgent complaint
9. AI refuses unrelated question
10. AI uses Arabic, English, Urdu

---

# 19. Suggested Folder Structure

```txt
/src
  /api
    /webhooks
      whatsapp.ts
    /whatsapp
      send.ts
    /ai
      router.ts
      classifyIntent.ts
      detectLanguage.ts
      generateResponse.ts
      knowledgeSearch.ts
    /pickups
      index.ts
      [id].ts
    /deliveries
      index.ts
      [id].ts
    /complaints
      index.ts
      [id].ts

  /services
    whatsappService.ts
    aiAgentService.ts
    conversationService.ts
    pickupService.ts
    deliveryService.ts
    complaintService.ts
    escalationService.ts
    orderTrackingService.ts
    knowledgeBaseService.ts

  /admin
    /ai-dashboard
    /ai-conversations
    /pickups
    /deliveries
    /complaints
    /ai-knowledge

  /prompts
    main-system-prompt.md
    customer-agent.md
    driver-agent.md
    manager-agent.md
    complaint-agent.md

  /n8n
    WA-Incoming-Message-Router.json
    AI-Pickup-Request.json
    AI-Delivery-Request.json
    AI-Complaint-Management.json
    Driver-Pickup-Task.json
    Manager-Daily-Branch-Check.json
    Report-Daily-Operations.json
    Marketing-Review-Request.json

  /database
    migrations
    seed-ai-knowledge.sql
```

---

# 20. Codex Main Instruction

Use this instruction for Codex:

```txt
You are working on the In & Out Laundry management system.

Build a production-ready AI WhatsApp Operations Agent integrated with n8n, WhatsApp Cloud API, OpenAI, and the existing POS database.

Follow the file AI_LAUNDRY_OPERATIONS_AGENT_PLAN.md exactly.

Do not remove existing POS features.

Add database migrations, backend APIs, admin dashboard pages, AI prompts, WhatsApp webhook handling, conversation logging, pickup/delivery/complaint workflows, and n8n workflow JSON templates.

The AI must only answer about In & Out Laundry and laundry-related operations.

Use environment variables for all secrets.

Every incoming and outgoing message must be saved.

Every pickup, delivery, complaint, and escalation must be trackable from the admin dashboard.

Use clean code, reusable services, error handling, validation, and role-based permissions.

After implementation, provide:
1. List of created files
2. Setup instructions
3. Required environment variables
4. Database migration command
5. n8n import instructions
6. Test checklist
```

---

# 21. Minimum Viable Product

MVP must include:

* WhatsApp webhook
* AI reply
* Conversation logging
* Price inquiry from database
* Pickup request creation
* Complaint creation
* Admin dashboard
* Driver notification
* Manager escalation

---

# 22. Future Upgrades

After MVP:

1. Voice message transcription
2. Image complaint analysis
3. Barcode order tracking
4. Customer loyalty system
5. Google Maps driver tracking
6. AI daily branch score
7. AI quality inspection
8. CCTV integration
9. Automatic Google review management
10. Predictive delivery scheduling
11. WhatsApp payment links
12. Customer portal
13. Mobile driver app
14. AI staff training assistant
15. Multi-branch performance dashboard

```
```
