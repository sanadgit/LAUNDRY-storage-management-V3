#!/bin/bash

# Laundry Storage Management V3 - Production Deployment Script
# Usage: bash deploy.sh

set -e  # Exit on any error

echo "================================================"
echo "🚀 Laundry Storage Management V3 Deployment"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="$HOME/LAUNDRY-storage-management-V3"
PM2_APP_NAME="laundry-warehouse"

# Step 1: Navigate to project directory
echo -e "${BLUE}[1/8]${NC} Navigating to project directory..."
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ Project directory not found: $PROJECT_DIR${NC}"
    echo "Please clone the repository first:"
    echo "git clone https://github.com/sanadgit/LAUNDRY-storage-management-V3.git"
    exit 1
fi
cd "$PROJECT_DIR"
echo -e "${GREEN}✅ Switched to: $(pwd)${NC}"
echo ""

# Step 2: Pull latest code
echo -e "${BLUE}[2/8]${NC} Pulling latest code from GitHub..."
git fetch origin
git pull origin main
echo -e "${GREEN}✅ Code updated${NC}"
echo ""

# Step 3: Install dependencies
echo -e "${BLUE}[3/8]${NC} Installing dependencies..."
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 4: Clean old build
echo -e "${BLUE}[4/8]${NC} Cleaning old build..."
npm run clean
echo -e "${GREEN}✅ Old build removed${NC}"
echo ""

# Step 5: Build frontend
echo -e "${BLUE}[5/8]${NC} Building frontend and backend..."
npm run build
echo -e "${GREEN}✅ Build complete${NC}"
echo ""

# Step 6: Stop old server
echo -e "${BLUE}[6/8]${NC} Stopping old server..."
if pm2 list | grep -q "$PM2_APP_NAME"; then
    pm2 stop "$PM2_APP_NAME"
    pm2 delete "$PM2_APP_NAME"
    echo -e "${GREEN}✅ Old server stopped${NC}"
else
    echo -e "${YELLOW}⚠️  No existing PM2 process found${NC}"
fi
echo ""

# Step 7: Start new server with PM2
echo -e "${BLUE}[7/8]${NC} Starting server with PM2..."
export NODE_ENV=production
pm2 start npm --name "$PM2_APP_NAME" -- start
pm2 save
pm2 startup
echo -e "${GREEN}✅ Server started${NC}"
echo ""

# Step 8: Verify deployment
echo -e "${BLUE}[8/8]${NC} Verifying deployment..."
sleep 3  # Wait for server to start

# Check if server is running
if pm2 list | grep -q "$PM2_APP_NAME"; then
    echo -e "${GREEN}✅ PM2 process is running${NC}"
    
    # Try to connect to the server
    if curl -s http://localhost:3001/ > /dev/null; then
        echo -e "${GREEN}✅ Server is responding on port 3001${NC}"
    else
        echo -e "${YELLOW}⚠️  Server may take a moment to start${NC}"
    fi
else
    echo -e "${RED}❌ PM2 process failed to start${NC}"
    pm2 logs "$PM2_APP_NAME"
    exit 1
fi
echo ""

# Print final status
echo "================================================"
echo -e "${GREEN}✅ Deployment Successful!${NC}"
echo "================================================"
echo ""
echo "📊 Server Status:"
pm2 list
echo ""
echo "📋 Useful Commands:"
echo "  • View logs:        pm2 logs $PM2_APP_NAME"
echo "  • Restart:          pm2 restart $PM2_APP_NAME"
echo "  • Stop:             pm2 stop $PM2_APP_NAME"
echo "  • View all PM2 apps: pm2 list"
echo ""
echo "🌐 Access your application:"
echo "  • Local: http://localhost:3001"
echo "  • Remote: http://srv951589:3001"
echo ""
echo "📝 Next steps:"
echo "  1. Configure Nginx to proxy to http://localhost:3001"
echo "  2. Test API endpoints: curl http://localhost:3001/api/stores"
echo "  3. Check logs if needed: pm2 logs $PM2_APP_NAME"
echo ""
