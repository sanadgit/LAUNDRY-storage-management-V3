PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS webhook_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider TEXT NOT NULL DEFAULT 'whatsapp',
  message_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'locked',
  correlation_id TEXT,
  conversation_id INTEGER,
  customer_phone TEXT,
  payload TEXT,
  locked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME,
  failed_at DATETIME,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_status_created
  ON webhook_events(status, created_at);

CREATE INDEX IF NOT EXISTS idx_webhook_events_correlation
  ON webhook_events(correlation_id);
