# PostgreSQL Migration (Phase 1)

This phase migrates current SQLite data into PostgreSQL without changing runtime behavior.

## 1) Keep current app running on SQLite

Do not change server runtime yet. Current production stays as-is.

## 2) Add `.env` values

```env
POSTGRES_URL=postgresql://laundry_app:StrongPassword@127.0.0.1:5432/laundry_db
SQLITE_PATH=blanket_storage.db
PG_MIGRATE_BATCH_SIZE=1000
```

## 3) Run migration

```bash
npm install
npm run migrate:postgres
```

What this script does:

- Creates PostgreSQL tables (if not existing) for:
  - `users`, `stores`, `blankets`, `logs`
  - customer tables
  - sorting tables
  - sessions tables
- Adds indexes
- Copies data from SQLite in batches
- Uses `ON CONFLICT DO UPDATE` (safe re-run)
- Syncs auto-increment sequences

## 4) Validate

Compare row counts between SQLite and PostgreSQL before switching runtime.

## 5) Next phase

After validation, enable database provider switch in backend:

- Set in `.env`:
  - `DB_PROVIDER=postgres` to use PostgreSQL for local `stores/blankets/logs`
  - `DB_PROVIDER=sqlite` for immediate rollback
- restart server after changes
- run smoke tests on Search / Pick / Import / Empty Store
