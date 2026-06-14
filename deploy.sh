#!/usr/bin/env bash

# Laundry Storage Management V3 - Safe Production Deployment Script (SQLite + PostgreSQL aware)
#
# Usage:
#   bash deploy.sh
#
# Optional env overrides:
#   PROJECT_DIR=/root/LAUNDRY-storage-management-V3
#   PM2_APP_NAME=laundry-warehouse
#   GIT_BRANCH=main
#   DB_PROVIDER=sqlite|postgres
#   MIGRATE_POSTGRES_ON_DEPLOY=true|false   (default: true)
#
# Notes:
# - SQLite mode keeps local DB backup/restore behavior.
# - PostgreSQL mode validates connection and can run migration automatically.

set -Eeuo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_DIR="${PROJECT_DIR:-$HOME/LAUNDRY-storage-management-V3}"
PM2_APP_NAME="${PM2_APP_NAME:-laundry-warehouse}"
GIT_BRANCH="${GIT_BRANCH:-main}"
DB_FILE="${DB_FILE:-blanket_storage.db}"
BACKUP_DIR="${BACKUP_DIR:-$HOME/backups/laundry-storage}"
ENV_FILE="${ENV_FILE:-.env}"
TIMESTAMP="$(date +%F-%H%M%S)"
MIGRATE_POSTGRES_ON_DEPLOY="${MIGRATE_POSTGRES_ON_DEPLOY:-true}"
DB_BACKUP_PATH=""
DEPLOY_STEPS=12

print_header() {
  echo "================================================"
  echo "🚀 Laundry Storage Management V3 Deployment"
  echo "================================================"
  echo ""
}

print_step() {
  echo -e "${BLUE}[$1/$DEPLOY_STEPS]${NC} $2"
}

is_true() {
  local v="${1:-}"
  [[ "$v" == "1" || "$v" == "true" || "$v" == "TRUE" || "$v" == "yes" || "$v" == "YES" ]]
}

load_env_file() {
  if [[ -f "$ENV_FILE" ]]; then
    local line key val line_no
    line_no=0
    while IFS= read -r line || [[ -n "$line" ]]; do
      line_no=$((line_no + 1))
      # Trim leading/trailing spaces
      line="${line#"${line%%[![:space:]]*}"}"
      line="${line%"${line##*[![:space:]]}"}"
      # Skip comments / empty lines
      [[ -z "$line" || "${line:0:1}" == "#" ]] && continue
      # Accept only KEY=VALUE lines
      if [[ ! "$line" =~ ^[A-Za-z_][A-Za-z0-9_]*= ]]; then
        echo -e "${YELLOW}⚠️  Skipping invalid .env line ${line_no}: ${line}${NC}"
        continue
      fi
      key="${line%%=*}"
      val="${line#*=}"
      # Strip optional wrapping quotes
      if [[ "${val:0:1}" == '"' && "${val: -1}" == '"' ]]; then
        val="${val:1:${#val}-2}"
      elif [[ "${val:0:1}" == "'" && "${val: -1}" == "'" ]]; then
        val="${val:1:${#val}-2}"
      fi
      export "${key}=${val}"
    done < "$ENV_FILE"
    return 0
  fi
  return 1
}

postgres_ping() {
  node - <<'NODE'
const url = process.env.POSTGRES_URL;
if (!url) {
  console.error('POSTGRES_URL is missing.');
  process.exit(2);
}
let Client;
try {
  ({ Client } = require('pg'));
} catch (e) {
  console.error('Cannot load pg package:', e?.message || e);
  process.exit(3);
}
const client = new Client({ connectionString: url });
client.connect()
  .then(() => client.query('SELECT version() AS version'))
  .then((res) => {
    const v = res?.rows?.[0]?.version || 'unknown';
    console.log(`PostgreSQL OK: ${v}`);
  })
  .then(() => client.end())
  .catch(async (err) => {
    try { await client.end(); } catch {}
    console.error('PostgreSQL connect failed:', err?.message || err);
    process.exit(4);
  });
NODE
}

print_header

print_step 1 "Navigating to project directory..."
if [[ ! -d "$PROJECT_DIR" ]]; then
  echo -e "${RED}❌ Project directory not found: $PROJECT_DIR${NC}"
  echo "Clone first:"
  echo "git clone https://github.com/sanadgit/LAUNDRY-storage-management-V3.git $PROJECT_DIR"
  exit 1
fi
cd "$PROJECT_DIR"
echo -e "${GREEN}✅ Switched to: $(pwd)${NC}"
echo ""

print_step 2 "Loading environment file (if present)..."
if load_env_file; then
  echo -e "${GREEN}✅ Loaded env from $ENV_FILE${NC}"
else
  echo -e "${YELLOW}⚠️  $ENV_FILE not found, continuing with process env only${NC}"
fi
DB_PROVIDER="${DB_PROVIDER:-sqlite}"
echo -e "${BLUE}ℹ️  DB_PROVIDER=${DB_PROVIDER}${NC}"
echo ""

print_step 3 "Backing up local SQLite database (if present)..."
mkdir -p "$BACKUP_DIR"
if [[ -f "$DB_FILE" ]]; then
  DB_BACKUP_PATH="$BACKUP_DIR/${DB_FILE%.db}.$TIMESTAMP.db"
  cp "$DB_FILE" "$DB_BACKUP_PATH"
  echo -e "${GREEN}✅ Backup created: $DB_BACKUP_PATH${NC}"
else
  echo -e "${YELLOW}⚠️  $DB_FILE not found, skipping backup${NC}"
fi
echo ""

print_step 4 "Fetching latest code..."
git fetch origin "$GIT_BRANCH"
echo -e "${GREEN}✅ Fetch complete${NC}"
echo ""

print_step 5 "Hard-syncing working tree to origin/$GIT_BRANCH..."
git reset --hard "origin/$GIT_BRANCH"
echo -e "${GREEN}✅ Code synced to origin/$GIT_BRANCH${NC}"
echo ""

print_step 6 "Restoring local SQLite database backup..."
if [[ -n "$DB_BACKUP_PATH" && -f "$DB_BACKUP_PATH" ]]; then
  cp "$DB_BACKUP_PATH" "$DB_FILE"
  echo -e "${GREEN}✅ Local SQLite restored from backup${NC}"
else
  echo -e "${YELLOW}⚠️  No SQLite backup to restore${NC}"
fi
echo ""

print_step 7 "Installing root dependencies..."
npm ci
echo -e "${GREEN}✅ Root dependencies installed${NC}"
echo ""

print_step 8 "Installing customer-site dependencies..."
npm --prefix apps/customer-site ci
echo -e "${GREEN}✅ Customer-site dependencies installed${NC}"
echo ""

print_step 9 "Building both apps..."
npm run build
[[ -f "dist-smart-storage-hub/index.html" ]] || { echo -e "${RED}❌ Missing dist-smart-storage-hub/index.html${NC}"; exit 1; }
[[ -f "apps/customer-site/dist/index.html" ]] || { echo -e "${RED}❌ Missing apps/customer-site/dist/index.html${NC}"; exit 1; }
echo -e "${GREEN}✅ Build successful${NC}"
echo ""

print_step 10 "Preparing database provider..."
if [[ "$DB_PROVIDER" == "postgres" ]]; then
  if [[ -z "${POSTGRES_URL:-}" ]]; then
    echo -e "${RED}❌ DB_PROVIDER=postgres but POSTGRES_URL is empty${NC}"
    exit 1
  fi

  echo -e "${BLUE}ℹ️  Checking PostgreSQL connectivity...${NC}"
  postgres_ping
  echo -e "${GREEN}✅ PostgreSQL reachable${NC}"

  if is_true "$MIGRATE_POSTGRES_ON_DEPLOY"; then
    echo -e "${BLUE}ℹ️  Running SQLite -> PostgreSQL migration...${NC}"
    npm run migrate:postgres
    echo -e "${GREEN}✅ Migration completed${NC}"
  else
    echo -e "${YELLOW}⚠️  MIGRATE_POSTGRES_ON_DEPLOY=false, skipping migration${NC}"
  fi
else
  echo -e "${GREEN}✅ SQLite mode active (no PostgreSQL migration step)${NC}"
fi
echo ""

print_step 11 "Restarting PM2 service..."
export NODE_ENV=production
if pm2 describe "$PM2_APP_NAME" >/dev/null 2>&1; then
  pm2 restart "$PM2_APP_NAME"
else
  pm2 start npm --name "$PM2_APP_NAME" -- start
fi
pm2 save
echo -e "${GREEN}✅ PM2 service active: $PM2_APP_NAME${NC}"
echo ""

print_step 12 "Verifying HTTP routes..."
sleep 2
ROOT_CODE="$(curl -o /dev/null -s -w '%{http_code}' http://127.0.0.1:3001/ || true)"
HUB_CODE="$(curl -o /dev/null -s -w '%{http_code}' http://127.0.0.1:3001/smart-storage-hub || true)"

if [[ "$ROOT_CODE" == "200" && "$HUB_CODE" == "200" ]]; then
  echo -e "${GREEN}✅ Health check passed (/, /smart-storage-hub)${NC}"
else
  echo -e "${YELLOW}⚠️  Health check status: / => $ROOT_CODE, /smart-storage-hub => $HUB_CODE${NC}"
  echo -e "${YELLOW}⚠️  Check logs: pm2 logs $PM2_APP_NAME --lines 120${NC}"
fi
echo ""

echo "================================================"
echo -e "${GREEN}✅ Deployment Completed${NC}"
echo "================================================"
echo ""
echo "📊 PM2:"
pm2 list
echo ""
echo "🧪 Quick checks:"
echo "  curl -I http://127.0.0.1:3001/"
echo "  curl -I http://127.0.0.1:3001/smart-storage-hub"
if [[ "$DB_PROVIDER" == "postgres" ]]; then
  echo "  DB_PROVIDER=postgres (active)"
else
  echo "  DB_PROVIDER=sqlite (active)"
fi
echo ""
echo "🧾 Logs:"
echo "  pm2 logs $PM2_APP_NAME --lines 120"
echo ""
