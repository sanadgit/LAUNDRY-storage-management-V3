#!/bin/bash

# Laundry Storage Management V3 - Force Full Deployment Script
# This script completely cleans and rebuilds everything

set -e

echo "================================================"
echo "🔄 Force Full Rebuild & Deployment"
echo "================================================"
echo ""

PROJECT_DIR="$HOME/LAUNDRY-storage-management-V3"
PM2_APP_NAME="laundry-warehouse"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

cd "$PROJECT_DIR"
echo -e "${BLUE}[1/10]${NC} Killing any running Node processes..."
pkill -f "node" || true
pkill -f "npm start" || true
sleep 2
echo -e "${GREEN}✅ Processes killed${NC}"
echo ""

echo -e "${BLUE}[2/10]${NC} Removing PM2 process..."
pm2 delete "$PM2_APP_NAME" || true
sleep 1
echo -e "${GREEN}✅ PM2 process removed${NC}"
echo ""

echo -e "${BLUE}[3/10]${NC} Pulling latest code..."
git fetch --all
git reset --hard origin/main
echo -e "${GREEN}✅ Code updated${NC}"
echo ""

echo -e "${BLUE}[4/10]${NC} Cleaning node_modules and cache..."
rm -rf node_modules package-lock.json
npm cache clean --force
echo -e "${GREEN}✅ Cache cleaned${NC}"
echo ""

echo -e "${BLUE}[5/10]${NC} Reinstalling dependencies..."
npm install --no-optional
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

echo -e "${BLUE}[6/10]${NC} Full cleaning build..."
npm run clean
echo -e "${GREEN}✅ Old build removed${NC}"
echo ""

echo -e "${BLUE}[7/10]${NC} Building project..."
NODE_ENV=production npm run build
echo -e "${GREEN}✅ Build complete${NC}"
echo ""

echo -e "${BLUE}[8/10]${NC} Verifying build..."
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed - dist directory not found${NC}"
    exit 1
fi
if [ ! -f "dist/index.html" ]; then
    echo -e "${RED}❌ Build failed - dist/index.html not found${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build verified${NC}"
echo ""

echo -e "${BLUE}[9/10]${NC} Starting server with PM2..."
export NODE_ENV=production
pm2 start npm --name "$PM2_APP_NAME" -- start
pm2 save
sleep 3
echo -e "${GREEN}✅ Server started${NC}"
echo ""

echo -e "${BLUE}[10/10]${NC} Verifying server..."
if pm2 list | grep -q "$PM2_APP_NAME"; then
    echo -e "${GREEN}✅ Server is running${NC}"
    
    # Wait a bit for server to fully start
    sleep 2
    
    # Test the API
    if curl -s http://localhost:3001/api/stores >/dev/null 2>&1; then
        echo -e "${GREEN}✅ API is responding${NC}"
        
        # Get actual response
        echo ""
        echo "📊 Sample API Response:"
        echo "================================"
        curl -s http://localhost:3001/api/stores | head -c 200
        echo ""
        echo "================================"
    else
        echo -e "${RED}❌ API is not responding - may need more time${NC}"
    fi
else
    echo -e "${RED}❌ Server failed to start${NC}"
    pm2 logs "$PM2_APP_NAME" --lines 50
    exit 1
fi
echo ""

echo "================================================"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "================================================"
echo ""
echo "📋 Current Status:"
pm2 list
echo ""
echo "🔗 Access your app:"
echo "  • Local:  http://localhost:3001"
echo "  • Server: http://srv951589:3001"
echo ""
echo "📝 Useful Commands:"
echo "  pm2 logs $PM2_APP_NAME          # View live logs"
echo "  pm2 restart $PM2_APP_NAME       # Restart server"
echo "  pm2 stop $PM2_APP_NAME          # Stop server"
echo "  curl http://localhost:3001/api/stores  # Test API"
echo ""
