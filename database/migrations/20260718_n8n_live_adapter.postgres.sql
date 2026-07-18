CREATE TABLE IF NOT EXISTS webhook_events (
  id BIGSERIAL PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'whatsapp',
  message_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'locked',
  correlation_id TEXT,
  conversation_id BIGINT REFERENCES ai_conversations(id) ON DELETE SET NULL,
  customer_phone TEXT,
  payload JSONB,
  locked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_status_created
  ON webhook_events(status, created_at);

CREATE INDEX IF NOT EXISTS idx_webhook_events_correlation
  ON webhook_events(correlation_id);
