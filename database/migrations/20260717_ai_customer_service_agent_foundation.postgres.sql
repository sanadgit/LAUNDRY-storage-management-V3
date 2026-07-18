BEGIN;

-- Phase 2 foundation for the AI customer service agent.
-- Rollback note: these are additive tables/indexes; rollback can drop the new tables
-- in reverse dependency order after exporting any operational history that must remain.

CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_messages_wamid_unique
  ON ai_messages(whatsapp_message_id)
  WHERE whatsapp_message_id IS NOT NULL AND BTRIM(whatsapp_message_id) <> '';

CREATE TABLE IF NOT EXISTS customer_channel_links (
  id BIGSERIAL PRIMARY KEY,
  contact_id BIGINT REFERENCES ai_contacts(id) ON DELETE SET NULL,
  pos_customer_id VARCHAR(120),
  channel VARCHAR(30) NOT NULL,
  channel_user_id VARCHAR(120) NOT NULL,
  normalized_phone VARCHAR(30),
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  verification_status VARCHAR(30) NOT NULL DEFAULT 'unverified',
  verified_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  created_by VARCHAR(80) DEFAULT 'system',
  updated_by VARCHAR(80),
  deleted_by VARCHAR(80),
  UNIQUE(channel, channel_user_id)
);

CREATE TABLE IF NOT EXISTS driver_service_areas (
  id BIGSERIAL PRIMARY KEY,
  driver_contact_id BIGINT REFERENCES ai_contacts(id) ON DELETE SET NULL,
  driver_phone VARCHAR(30),
  branch_id BIGINT,
  area_key VARCHAR(120) NOT NULL,
  area_name VARCHAR(150) NOT NULL,
  priority INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  shift_label VARCHAR(80),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  created_by VARCHAR(80) DEFAULT 'system',
  updated_by VARCHAR(80),
  deleted_by VARCHAR(80)
);

CREATE TABLE IF NOT EXISTS driver_assignments (
  id BIGSERIAL PRIMARY KEY,
  task_type VARCHAR(30) NOT NULL,
  pickup_request_id BIGINT REFERENCES pickup_requests(id) ON DELETE SET NULL,
  delivery_request_id BIGINT REFERENCES delivery_requests(id) ON DELETE SET NULL,
  driver_contact_id BIGINT REFERENCES ai_contacts(id) ON DELETE SET NULL,
  driver_phone VARCHAR(30),
  branch_id BIGINT,
  service_area VARCHAR(150),
  status VARCHAR(40) NOT NULL DEFAULT 'assigned',
  ranking_score NUMERIC(10,4),
  distance_km NUMERIC(10,3),
  eta_minutes INTEGER,
  acceptance_deadline_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failure_reason TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by VARCHAR(80) DEFAULT 'ai',
  updated_by VARCHAR(80)
);

CREATE TABLE IF NOT EXISTS complaint_events (
  id BIGSERIAL PRIMARY KEY,
  complaint_id BIGINT NOT NULL REFERENCES complaint_tickets(id) ON DELETE CASCADE,
  event_type VARCHAR(60) NOT NULL,
  actor_type VARCHAR(40) NOT NULL DEFAULT 'system',
  actor_ref VARCHAR(120),
  notes TEXT,
  media_url TEXT,
  status_from VARCHAR(40),
  status_to VARCHAR(40),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS human_escalations (
  id BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT REFERENCES ai_conversations(id) ON DELETE SET NULL,
  complaint_id BIGINT REFERENCES complaint_tickets(id) ON DELETE SET NULL,
  contact_id BIGINT REFERENCES ai_contacts(id) ON DELETE SET NULL,
  branch_id BIGINT,
  reason TEXT NOT NULL,
  severity VARCHAR(30) NOT NULL DEFAULT 'normal',
  status VARCHAR(40) NOT NULL DEFAULT 'open',
  assigned_to_phone VARCHAR(30),
  escalated_by VARCHAR(40) NOT NULL DEFAULT 'ai',
  due_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolution TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_tool_calls (
  id BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT REFERENCES ai_conversations(id) ON DELETE SET NULL,
  message_id BIGINT REFERENCES ai_messages(id) ON DELETE SET NULL,
  correlation_id VARCHAR(120),
  tool_call_id VARCHAR(120),
  tool_name VARCHAR(120) NOT NULL,
  intent VARCHAR(100),
  status VARCHAR(40) NOT NULL DEFAULT 'started',
  idempotency_key VARCHAR(160),
  request_payload JSONB,
  response_payload JSONB,
  error_code VARCHAR(80),
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notification_logs (
  id BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT REFERENCES ai_conversations(id) ON DELETE SET NULL,
  contact_id BIGINT REFERENCES ai_contacts(id) ON DELETE SET NULL,
  channel VARCHAR(30) NOT NULL,
  recipient_phone VARCHAR(30),
  template_name VARCHAR(120),
  message_type VARCHAR(30) NOT NULL DEFAULT 'text',
  provider_message_id VARCHAR(255),
  idempotency_key VARCHAR(160),
  status VARCHAR(40) NOT NULL DEFAULT 'queued',
  error_code VARCHAR(80),
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversation_summaries (
  id BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  contact_id BIGINT REFERENCES ai_contacts(id) ON DELETE SET NULL,
  summary TEXT NOT NULL,
  detected_language VARCHAR(20),
  last_intent VARCHAR(100),
  active_order_id VARCHAR(120),
  open_complaint_id BIGINT REFERENCES complaint_tickets(id) ON DELETE SET NULL,
  human_escalation_id BIGINT REFERENCES human_escalations(id) ON DELETE SET NULL,
  source_message_id BIGINT REFERENCES ai_messages(id) ON DELETE SET NULL,
  summary_version INTEGER NOT NULL DEFAULT 1,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  created_by VARCHAR(80) DEFAULT 'ai',
  updated_by VARCHAR(80),
  deleted_by VARCHAR(80)
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

COMMIT;
