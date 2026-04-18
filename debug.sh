#!/bin/bash

# Debug and test script for Laundry Storage Management

echo "================================================"
echo "🔍 Debugging Laundry Storage Management"
echo "================================================"
echo ""

echo "📊 1. PM2 Status:"
echo "================================"
pm2 list
echo ""

echo "📊 2. Node Process Status:"
echo "================================"
ps aux | grep node | grep -v grep || echo "No Node processes found"
echo ""

echo "📊 3. Port 3001 Status:"
echo "================================"
netstat -tuln | grep 3001 || echo "Port 3001 is not listening"
echo ""

echo "📊 4. Server Logs (last 20 lines):"
echo "================================"
pm2 logs laundry-warehouse --lines 20 --nostream 2>/dev/null || echo "No logs available"
echo ""

echo "📊 5. Testing API Endpoints:"
echo "================================"

echo ""
echo "🔹 Testing /api/stores:"
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3001/api/stores)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Status: 200 OK"
    echo "Response: $BODY" | head -c 200
else
    echo "❌ Status: $HTTP_CODE"
    echo "Response: $BODY"
fi
echo ""

echo "🔹 Testing /api/logs:"
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3001/api/logs)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Status: 200 OK"
    echo "Response type: $(echo "$BODY" | head -c 100)"
else
    echo "❌ Status: $HTTP_CODE"
    echo "Response: $BODY"
fi
echo ""

echo "🔹 Testing / (SPA routing):"
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3001/)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Status: 200 OK"
    echo "✅ Serving HTML"
else
    echo "❌ Status: $HTTP_CODE"
fi
echo ""

echo "================================================"
echo "🔧 Quick Fixes:"
echo "================================================"
echo ""
echo "If API is returning errors:"
echo "1. Kill the server: pkill -f 'npm start'"
echo "2. Clear PM2: pm2 delete laundry-warehouse"
echo "3. Run force deployment: bash deploy-force.sh"
echo ""
echo "If port 3001 is already in use:"
echo "1. Find process: lsof -i :3001"
echo "2. Kill it: kill -9 <PID>"
echo "3. Restart: pm2 start npm --name laundry-warehouse -- start"
echo ""
