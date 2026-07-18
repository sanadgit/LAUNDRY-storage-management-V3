PRAGMA foreign_keys = ON;

-- Phase 2 foundation for the AI customer service agent.
-- Rollback note: these are additive tables/indexes; rollback can drop the new tables
-- in reverse dependency order after exporting any operational history that must remain.

CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_messages_wamid_unique
  ON ai_messages(whatsapp_message_id)
  WHERE whatsapp_message_id IS NOT NULL AND TRIM(whatsapp_message_id) <> '';

CREATE TABLE IF NOT EXISTS customer_channel_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contact_id INTEGER,
  pos_customer_id TEXT,
  channel TEXT NOT NULL,
  channel_user_id TEXT NOT NULL,
  normalized_phone TEXT,
  is_primary INTEGER NOT NULL DEFAULT 0,
  verification_status TEXT NOT NULL DEFAULT 'unverified',
  verified_at DATETIME,
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  created_by TEXT DEFAULT 'system',
  updated_by TEXT,
  deleted_by TEXT,
  UNIQUE(channel, channel_user_id),
  FOREIGN KEY (contact_id) REFERENCES ai_contacts(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS driver_service_areas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  driver_contact_id INTEGER,
  driver_phone TEXT,
  branch_id INTEGER,
  area_key TEXT NOT NULL,
  area_name TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 100,
  is_active INTEGER NOT NULL DEFAULT 1,
  shift_label TEXT,
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  created_by TEXT DEFAULT 'system',
  updated_by TEXT,
  deleted_by TEXT,
  FOREIGN KEY (driver_contact_id) REFERENCES ai_contacts(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS driver_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_type TEXT NOT NULL,
  pickup_request_id INTEGER,
  delivery_request_id INTEGER,
  driver_contact_id INTEGER,
  driver_phone TEXT,
  branch_id INTEGER,
  service_area TEXT,
  status TEXT NOT NULL DEFAULT 'assigned',
  ranking_score REAL,
  distance_km REAL,
  eta_minutes INTEGER,
  acceptance_deadline_at DATETIME,
  accepted_at DATETIME,
  rejected_at DATETIME,
  completed_at DATETIME,
  failure_reason TEXT,
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT DEFAULT 'ai',
  updated_by TEXT,
  FOREIGN KEY (pickup_request_id) REFERENCES pickup_requests(id) ON DELETE SET NULL,
  FOREIGN KEY (delivery_request_id) REFERENCES delivery_requests(id) ON DELETE SET NULL,
  FOREIGN KEY (driver_contact_id) REFERENCES ai_contacts(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS complaint_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  complaint_id INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  actor_type TEXT NOT NULL DEFAULT 'system',
  actor_ref TEXT,
  notes TEXT,
  media_url TEXT,
  status_from TEXT,
  status_to TEXT,
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaint_tickets(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS human_escalations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER,
  complaint_id INTEGER,
  contact_id INTEGER,
  branch_id INTEGER,
  reason TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'open',
  assigned_to_phone TEXT,
  escalated_by TEXT NOT NULL DEFAULT 'ai',
  due_at DATETIME,
  resolved_at DATETIME,
  resolution TEXT,
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE SET NULL,
  FOREIGN KEY (complaint_id) REFERENCES complaint_tickets(id) ON DELETE SET NULL,
  FOREIGN KEY (contact_id) REFERENCES ai_contacts(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS ai_tool_calls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER,
  message_id INTEGER,
  correlation_id TEXT,
  tool_call_id TEXT,
  tool_name TEXT NOT NULL,
  intent TEXT,
  status TEXT NOT NULL DEFAULT 'started',
  idempotency_key TEXT,
  request_payload TEXT,
  response_payload TEXT,
  error_code TEXT,
  error_message TEXT,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE SET NULL,
  FOREIGN KEY (message_id) REFERENCES ai_messages(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS notification_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER,
  contact_id INTEGER,
  channel TEXT NOT NULL,
  recipient_phone TEXT,
  template_name TEXT,
  message_type TEXT NOT NULL DEFAULT 'text',
  provider_message_id TEXT,
  idempotency_key TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  error_code TEXT,
  error_message TEXT,
  sent_at DATETIME,
  delivered_at DATETIME,
  read_at DATETIME,
  failed_at DATETIME,
  metadata TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE SET NULL,
  FOREIGN KEY (contact_id) REFERENCES ai_contacts(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS conversation_summaries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL,
  contact_id INTEGER,
  summary TEXT NOT NULL,
  detected_language TEXT,
  last_intent TEXT,
  active_order_id TEXT,
  open_complaint_id INTEGER,
  human_escalation_id INTEGER,
  source_message_id INTEGER,
  summary_version INTEGER NOT NULL DEFAULT 1,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  created_by TEXT DEFAULT 'ai',
  updated_by TEXT,
  deleted_by TEXT,
  FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES ai_contacts(id) ON DELETE SET NULL,
  FOREIGN KEY (open_complaint_id) REFERENCES complaint_tickets(id) ON DELETE SET NULL,
  FOREIGN KEY (human_escalation_id) REFERENCES human_escalations(id) ON DELETE SET NULL,
  FOREIGN KEY (source_message_id) REFERENCES ai_messages(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_customer_channel_links_contact
  ON customer_channel_links(contact_id);
CREATE INDEX IF NOT EXISTS idx_customer_channel_links_phone
  ON customer_channel_links(normalized_phone);
CREATE INDEX IF NOT EXISTS idx_customer_channel_links_pos_customer
  ON customer_channel_links(pos_customer_id);

CREATE INDEX IF NOT EXISTS idx_driver_service_areas_area_branch
  ON driver_service_areas(area_key, branch_id, is_active);
CREATE INDEX IF NOT EXISTS idx_driver_service_areas_driver
  ON driver_service_areas(driver_contact_id, is_active);

CREATE INDEX IF NOT EXISTS idx_driver_assignments_status_driver
  ON driver_assignments(status, driver_contact_id);
CREATE INDEX IF NOT EXISTS idx_driver_assignments_pickup
  ON driver_assignments(pickup_request_id);
CREATE INDEX IF NOT EXISTS idx_driver_assignments_delivery
  ON driver_assignments(delivery_request_id);

CREATE INDEX IF NOT EXISTS idx_complaint_events_complaint_created
  ON complaint_events(complaint_id, created_at);

CREATE INDEX IF NOT EXISTS idx_human_escalations_status_severity
  ON human_escalations(status, severity);
CREATE INDEX IF NOT EXISTS idx_human_escalations_conversation
  ON human_escalations(conversation_id);

CREATE INDEX IF NOT EXISTS idx_ai_tool_calls_conversation_created
  ON ai_tool_calls(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_tool_calls_idempotency
  ON ai_tool_calls(idempotency_key);

CREATE INDEX IF NOT EXISTS idx_notification_logs_provider_message
  ON notification_logs(provider_message_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status_created
  ON notification_logs(status, created_at);
CREATE INDEX IF NOT EXISTS idx_notification_logs_idempotency
  ON notification_logs(idempotency_key);

CREATE UNIQUE INDEX IF NOT EXISTS idx_conversation_summaries_conversation_active
  ON conversation_summaries(conversation_id)
  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_conversation_summaries_contact
  ON conversation_summaries(contact_id);
