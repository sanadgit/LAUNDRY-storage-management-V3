-- Supabase schema for Blanket Storage Management
-- Run this in Supabase SQL Editor to create the application tables.

-- Needed for `gen_random_uuid()` defaults.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- The Supabase Auth system manages authentication users.
-- The app stores username/role mapping in this users table.
-- Rich profile fields such as full_name, email, phone, avatar_url, is_active,
-- and last_login_at are mirrored in auth.users.raw_user_meta_data.

CREATE TABLE IF NOT EXISTS users (
  id serial PRIMARY KEY,
  auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  username text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'cashier',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stores (
  store_name text PRIMARY KEY,
  position_x numeric NOT NULL DEFAULT 0,
  position_y numeric NOT NULL DEFAULT 0,
  position_z numeric NOT NULL DEFAULT 0,
  width numeric NOT NULL DEFAULT 5,
  depth numeric NOT NULL DEFAULT 5,
  height numeric NOT NULL DEFAULT 3,
  rows integer NOT NULL DEFAULT 10,
  columns integer NOT NULL DEFAULT 10,
  rotation_y numeric NOT NULL DEFAULT 0,
  auto_settle boolean NOT NULL DEFAULT true,
  store_type text NOT NULL DEFAULT 'grid',
  hanger_slots integer NOT NULL DEFAULT 0,
  slot_capacity integer NOT NULL DEFAULT 1,
  store_color text NOT NULL DEFAULT '#3b82f6',
  store_opacity numeric NOT NULL DEFAULT 1,
  cell_width numeric NOT NULL DEFAULT 0.5,
  cell_depth numeric NOT NULL DEFAULT 0.5
);

-- If you created the `stores` table before `slot_capacity` existed,
-- this adds the missing column without dropping data.
ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS slot_capacity integer NOT NULL DEFAULT 1;
ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS store_color text NOT NULL DEFAULT '#3b82f6';
ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS store_opacity numeric NOT NULL DEFAULT 1;
ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS cell_width numeric NOT NULL DEFAULT 0.5;
ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS cell_depth numeric NOT NULL DEFAULT 0.5;

-- Backfill cell dimensions for old rows that do not have valid values.
UPDATE stores
SET cell_width = 5.0 / GREATEST(1, columns)
WHERE cell_width IS NULL OR cell_width <= 0;

UPDATE stores
SET cell_depth = 5.0 / GREATEST(1, rows)
WHERE cell_depth IS NULL OR cell_depth <= 0;

CREATE TABLE IF NOT EXISTS blankets (
  id serial PRIMARY KEY,
  blanket_number text NOT NULL,
  store text NOT NULL REFERENCES stores(store_name) ON DELETE RESTRICT,
  row integer NOT NULL,
  "column" integer NOT NULL,
  status text NOT NULL DEFAULT 'stored',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Data integrity: allow only known status values (safe to run repeatedly).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'blankets_status_check') THEN
    ALTER TABLE blankets
      ADD CONSTRAINT blankets_status_check CHECK (status IN ('stored', 'retrieved', 'picked'));
  END IF;
END $$;

-- Slot bounds + capacity enforcement (server-independent).
-- - Validates row/column are within store dimensions.
-- - Enforces `slot_capacity` only for status='stored' (folding shelves can hold multiple).
CREATE OR REPLACE FUNCTION validate_blanket_slot_capacity()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  store_rows integer;
  store_cols integer;
  store_store_type text;
  store_slot_capacity integer;
  capacity integer;
  stored_count integer;
BEGIN
  SELECT s.rows, s.columns, s.store_type, s.slot_capacity
    INTO store_rows, store_cols, store_store_type, store_slot_capacity
  FROM stores s
  WHERE s.store_name = NEW.store;

  IF store_rows IS NULL THEN
    RAISE EXCEPTION 'Store not found: %', NEW.store USING ERRCODE = '23503';
  END IF;

  IF NEW.row < 1 OR NEW.row > store_rows THEN
    RAISE EXCEPTION 'Row out of bounds for store % (row %, allowed 1..%)', NEW.store, NEW.row, store_rows
      USING ERRCODE = '22003';
  END IF;

  IF NEW."column" < 1 OR NEW."column" > store_cols THEN
    RAISE EXCEPTION 'Column out of bounds for store % (column %, allowed 1..%)', NEW.store, NEW."column", store_cols
      USING ERRCODE = '22003';
  END IF;

  capacity := CASE
    WHEN store_store_type = 'hanger' THEN 1
    ELSE GREATEST(1, COALESCE(store_slot_capacity, 1))
  END;

  IF NEW.status = 'stored' THEN
    SELECT COUNT(*) INTO stored_count
    FROM blankets b
    WHERE b.store = NEW.store
      AND b.row = NEW.row
      AND b."column" = NEW."column"
      AND b.status = 'stored'
      AND (TG_OP <> 'UPDATE' OR b.id <> NEW.id);

    IF stored_count >= capacity THEN
      RAISE EXCEPTION 'Slot is full for store % (R%, C%) capacity %, current %', NEW.store, NEW.row, NEW."column", capacity, stored_count
        USING ERRCODE = 'P0001';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_blanket_slot_capacity ON blankets;
CREATE TRIGGER trg_validate_blanket_slot_capacity
BEFORE INSERT OR UPDATE OF store, row, "column", status
ON blankets
FOR EACH ROW
EXECUTE FUNCTION validate_blanket_slot_capacity();

CREATE TABLE IF NOT EXISTS logs (
  id serial PRIMARY KEY,
  blanket_number text NOT NULL,
  action text NOT NULL,
  "user" text NOT NULL DEFAULT 'system',
  store text,
  row integer,
  "column" integer,
  status text,
  request_id uuid NOT NULL DEFAULT gen_random_uuid(),
  device text,
  ip text,
  notes text,
  timestamp timestamptz NOT NULL DEFAULT now()
);

-- Backwards-compatible migrations (safe to run repeatedly).
ALTER TABLE logs
  ADD COLUMN IF NOT EXISTS request_id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE logs
  ADD COLUMN IF NOT EXISTS device text;
ALTER TABLE logs
  ADD COLUMN IF NOT EXISTS ip text;
ALTER TABLE logs
  ADD COLUMN IF NOT EXISTS notes text;

CREATE INDEX IF NOT EXISTS idx_blankets_store ON blankets(store);
CREATE INDEX IF NOT EXISTS idx_blankets_number ON blankets(blanket_number);
CREATE INDEX IF NOT EXISTS idx_blankets_slot_status ON blankets(store, row, "column", status);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_logs_request_id ON logs(request_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
