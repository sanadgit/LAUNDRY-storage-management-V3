CREATE TABLE IF NOT EXISTS ai_contacts (
  id BIGSERIAL PRIMARY KEY,
  phone VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(150),
  role VARCHAR(40) NOT NULL DEFAULT 'unknown',
  branch_id BIGINT,
  language VARCHAR(20) DEFAULT 'auto',
  is_vip BOOLEAN NOT NULL DEFAULT FALSE,
  is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_conversations (
  id BIGSERIAL PRIMARY KEY,
  contact_id BIGINT NOT NULL REFERENCES ai_contacts(id),
  channel VARCHAR(30) NOT NULL DEFAULT 'whatsapp',
  status VARCHAR(40) NOT NULL DEFAULT 'open',
  intent VARCHAR(100),
  priority VARCHAR(20) NOT NULL DEFAULT 'normal',
  assigned_to_phone VARCHAR(30),
  branch_id BIGINT,
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT NOT NULL REFERENCES ai_conversations(id),
  direction VARCHAR(20) NOT NULL,
  sender_phone VARCHAR(30),
  receiver_phone VARCHAR(30),
  message_type VARCHAR(30) NOT NULL DEFAULT 'text',
  message_text TEXT,
  media_url TEXT,
  whatsapp_message_id VARCHAR(255),
  ai_response BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pickup_requests (
  id BIGSERIAL PRIMARY KEY,
  customer_name VARCHAR(150),
  customer_phone VARCHAR(30),
  branch_id BIGINT,
  address TEXT,
  google_maps_url TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  preferred_time VARCHAR(100),
  status VARCHAR(40) NOT NULL DEFAULT 'new',
  assigned_driver_phone VARCHAR(30),
  notes TEXT,
  created_by VARCHAR(30) NOT NULL DEFAULT 'ai',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS delivery_requests (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT,
  customer_name VARCHAR(150),
  customer_phone VARCHAR(30),
  branch_id BIGINT,
  address TEXT,
  google_maps_url TEXT,
  status VARCHAR(40) NOT NULL DEFAULT 'new',
  assigned_driver_phone VARCHAR(30),
  payment_status VARCHAR(40) NOT NULL DEFAULT 'unknown',
  notes TEXT,
  created_by VARCHAR(30) NOT NULL DEFAULT 'ai',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS complaint_tickets (
  id BIGSERIAL PRIMARY KEY,
  customer_name VARCHAR(150),
  customer_phone VARCHAR(30),
  order_id BIGINT,
  branch_id BIGINT,
  complaint_type VARCHAR(40) NOT NULL DEFAULT 'other',
  description TEXT,
  priority VARCHAR(20) NOT NULL DEFAULT 'normal',
  status VARCHAR(40) NOT NULL DEFAULT 'new',
  assigned_to_phone VARCHAR(30),
  resolution TEXT,
  customer_satisfaction INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_knowledge_base (
  id BIGSERIAL PRIMARY KEY,
  category VARCHAR(100),
  title VARCHAR(255),
  content TEXT,
  branch_id BIGINT,
  language VARCHAR(20) DEFAULT 'en',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_contacts_phone ON ai_contacts(phone);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_contact_status ON ai_conversations(contact_id, status);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_created ON ai_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_pickup_requests_status_created ON pickup_requests(status, created_at);
CREATE INDEX IF NOT EXISTS idx_complaint_tickets_status_priority ON complaint_tickets(status, priority);
