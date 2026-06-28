CREATE TABLE IF NOT EXISTS ai_contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'unknown',
  branch_id INTEGER,
  language TEXT DEFAULT 'auto',
  is_vip INTEGER NOT NULL DEFAULT 0,
  is_blocked INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_id INTEGER NOT NULL,
  channel TEXT NOT NULL DEFAULT 'whatsapp',
  status TEXT NOT NULL DEFAULT 'open',
  intent TEXT,
  priority TEXT NOT NULL DEFAULT 'normal',
  assigned_to_phone TEXT,
  branch_id INTEGER,
  last_message_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (contact_id) REFERENCES ai_contacts(id)
);

CREATE TABLE IF NOT EXISTS ai_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL,
  direction TEXT NOT NULL,
  sender_phone TEXT,
  receiver_phone TEXT,
  message_type TEXT NOT NULL DEFAULT 'text',
  message_text TEXT,
  media_url TEXT,
  whatsapp_message_id TEXT,
  ai_response INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id)
);

CREATE TABLE IF NOT EXISTS pickup_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT,
  customer_phone TEXT,
  branch_id INTEGER,
  address TEXT,
  google_maps_url TEXT,
  latitude REAL,
  longitude REAL,
  preferred_time TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  assigned_driver_phone TEXT,
  notes TEXT,
  created_by TEXT NOT NULL DEFAULT 'ai',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS delivery_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER,
  customer_name TEXT,
  customer_phone TEXT,
  branch_id INTEGER,
  address TEXT,
  google_maps_url TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  assigned_driver_phone TEXT,
  payment_status TEXT NOT NULL DEFAULT 'unknown',
  notes TEXT,
  created_by TEXT NOT NULL DEFAULT 'ai',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS complaint_tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT,
  customer_phone TEXT,
  order_id INTEGER,
  branch_id INTEGER,
  complaint_type TEXT NOT NULL DEFAULT 'other',
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'new',
  assigned_to_phone TEXT,
  resolution TEXT,
  customer_satisfaction INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_knowledge_base (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT,
  title TEXT,
  content TEXT,
  branch_id INTEGER,
  language TEXT DEFAULT 'en',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_contacts_phone ON ai_contacts(phone);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_contact_status ON ai_conversations(contact_id, status);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_created ON ai_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_pickup_requests_status_created ON pickup_requests(status, created_at);
CREATE INDEX IF NOT EXISTS idx_complaint_tickets_status_priority ON complaint_tickets(status, priority);
