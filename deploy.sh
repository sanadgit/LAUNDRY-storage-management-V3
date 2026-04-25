#!/usr/bin/env bash

# Laundry Storage Management V3 - Safe Production Deployment Script
# Usage: bash deploy.sh
# Env overrides:
#   PROJECT_DIR=/root/LAUNDRY-storage-management-V3
#   PM2_APP_NAME=laundry-warehouse
#   GIT_BRANCH=main

set -Eeuo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_DIR="${PROJECT_DIR:-$HOME/LAUNDRY-storage-management-V3}"
PM2_APP_NAME="${PM2_APP_NAME:-laundry-warehouse}"
GIT_BRANCH="${GIT_BRANCH:-main}"
DB_FILE="blanket_storage.db"
BACKUP_DIR="$HOME/backups/laundry-storage"
TIMESTAMP="$(date +%F-%H%M%S)"
DB_BACKUP_PATH=""

print_header() {
  echo "================================================"
  echo "🚀 Laundry Storage Management V3 Deployment"
  echo "================================================"
  echo ""
}

print_step() {
  echo -e "${BLUE}[$1/10]${NC} $2"
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

print_step 2 "Backing up local SQLite database (if present)..."
mkdir -p "$BACKUP_DIR"
if [[ -f "$DB_FILE" ]]; then
  DB_BACKUP_PATH="$BACKUP_DIR/${DB_FILE%.db}.$TIMESTAMP.db"
  cp "$DB_FILE" "$DB_BACKUP_PATH"
  echo -e "${GREEN}✅ Backup created: $DB_BACKUP_PATH${NC}"
else
  echo -e "${YELLOW}⚠️  $DB_FILE not found, skipping backup${NC}"
fi
echo ""

print_step 3 "Fetching latest code..."
git fetch origin "$GIT_BRANCH"
echo -e "${GREEN}✅ Fetch complete${NC}"
echo ""

print_step 4 "Hard-syncing working tree to origin/$GIT_BRANCH..."
git reset --hard "origin/$GIT_BRANCH"
echo -e "${GREEN}✅ Code synced to origin/$GIT_BRANCH${NC}"
echo ""

print_step 5 "Restoring local SQLite database..."
if [[ -n "$DB_BACKUP_PATH" && -f "$DB_BACKUP_PATH" ]]; then
  cp "$DB_BACKUP_PATH" "$DB_FILE"
  echo -e "${GREEN}✅ Local DB restored from backup${NC}"
else
  echo -e "${YELLOW}⚠️  No backup to restore${NC}"
fi
echo ""

print_step 6 "Installing root dependencies..."
npm ci
echo -e "${GREEN}✅ Root dependencies installed${NC}"
echo ""

print_step 7 "Installing customer-site dependencies..."
npm --prefix apps/customer-site ci
echo -e "${GREEN}✅ Customer-site dependencies installed${NC}"
echo ""

print_step 8 "Building both apps..."
npm run build
[[ -f "dist-smart-storage-hub/index.html" ]] || { echo -e "${RED}❌ Missing dist-smart-storage-hub/index.html${NC}"; exit 1; }
[[ -f "apps/customer-site/dist/index.html" ]] || { echo -e "${RED}❌ Missing apps/customer-site/dist/index.html${NC}"; exit 1; }
echo -e "${GREEN}✅ Build successful${NC}"
echo ""

print_step 9 "Restarting PM2 service..."
export NODE_ENV=production
if pm2 describe "$PM2_APP_NAME" >/dev/null 2>&1; then
  pm2 restart "$PM2_APP_NAME"
else
  pm2 start npm --name "$PM2_APP_NAME" -- start
fi
pm2 save
echo -e "${GREEN}✅ PM2 service active: $PM2_APP_NAME${NC}"
echo ""

print_step 10 "Verifying HTTP routes..."
sleep 2
ROOT_CODE="$(curl -o /dev/null -s -w '%{http_code}' http://127.0.0.1:3001/ || true)"
HUB_CODE="$(curl -o /dev/null -s -w '%{http_code}' http://127.0.0.1:3001/smart-storage-hub || true)"

if [[ "$ROOT_CODE" == "200" && "$HUB_CODE" == "200" ]]; then
  echo -e "${GREEN}✅ Health check passed (/, /smart-storage-hub)${NC}"
else
  echo -e "${YELLOW}⚠️  Health check status codes: / => $ROOT_CODE, /smart-storage-hub => $HUB_CODE${NC}"
  echo -e "${YELLOW}⚠️  Check logs: pm2 logs $PM2_APP_NAME --lines 80${NC}"
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
echo ""
echo "🧾 Logs:"
echo "  pm2 logs $PM2_APP_NAME --lines 100"
echo ""
