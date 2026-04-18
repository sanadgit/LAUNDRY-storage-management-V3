# Production Deployment Guide - Complete

## Issues Found

### 1. SPA Routing Not Working
**Error:** `No routes matched location "/index.html"`
- The Express server wasn't properly serving `index.html` for SPA routing
- Fixed: Improved the catch-all route to properly handle SPA navigation

### 2. API Endpoints Returning Unexpected Format
**Error:** `TypeError: (t.data ?? []).map is not a function`
- The API endpoints weren't consistently returning arrays
- Fixed: Added proper array validation and error handling to all GET endpoints

## Deployment Steps

### Step 1: Pull Latest Changes
```bash
cd /path/to/LAUNDRY-storage-management-V3
git pull origin main
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Build the Project
```bash
npm run build
```
This creates the `dist/` folder with the compiled frontend and backend.

### Step 4: Stop the Old Server
```bash
# If running as a service
sudo systemctl stop your-service-name

# Or kill the process
pkill -f "node.*server"

# Or stop it manually if running in background
jobs -l
kill %1  # or whatever job number
```

### Step 5: Start the New Server

**Important: Set the environment variable**
```bash
export NODE_ENV=production
npm start
```

Or if using PM2:
```bash
pm2 delete laundry-app
PM2_HOME=/home/your-user/.pm2 NODE_ENV=production pm2 start dist/server.js --name laundry-app
pm2 save
pm2 startup
```

### Step 6: Verify the Server is Running
```bash
# Check if the server is listening on port 3001
netstat -tuln | grep 3001
# Or: lsof -i :3001

# Test the API
curl http://localhost:3001/api/stores
# Should return: [] or [...]  (an array, not an error)

curl http://localhost:3001/api/logs
# Should return: [] or [...]  (an array)

# Test serving index.html
curl -I http://localhost:3001/
# Should return 200 OK with Content-Type: text/html
```

## Nginx Configuration (Important!)

Make sure your Nginx config correctly proxies to the Node.js server:

```nginx
upstream laundry_backend {
    server localhost:3001;
}

server {
    listen 80;
    server_name your-domain.com;

    # Increase request size limit for backups
    client_max_body_size 100M;

    location / {
        proxy_pass http://laundry_backend;
        proxy_http_version 1.1;
        
        # WebSocket support (if needed)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Standard proxying headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Disable buffering for better streaming
        proxy_buffering off;
    }
}
```

Then reload Nginx:
```bash
sudo nginx -t  # Test config
sudo systemctl reload nginx
```

## Troubleshooting

### Issue: "TypeError: (t.data ?? []).map is not a function"
**Causes:**
1. Server hasn't been restarted with new code
2. Build wasn't run (still using old dist/)
3. Nginx is wrapping responses incorrectly

**Solution:**
```bash
# Make sure NODE_ENV=production
echo $NODE_ENV  # Should print: production

# Check server logs for errors
pm2 logs laundry-app
# or
tail -f /var/log/laundry-app.log

# Verify API response format
curl -s http://localhost:3001/api/stores | jq .
# Should show: [] or [{ ...stores... }]
# NOT: { "data": [...] }
```

### Issue: "No routes matched location '/index.html'"
**Causes:**
1. index.html not being served by Express
2. Nginx not proxying requests correctly
3. dist/ folder doesn't exist

**Solution:**
```bash
# Check if dist/ exists and has index.html
ls -la dist/index.html

# Check if the server can access it
curl -I http://localhost:3001/
# Should return: 200 OK with text/html content-type

# Test the catch-all route
curl http://localhost:3001/some-random-path
# Should return the index.html content
```

### Issue: API responds with wrapped data
Example: `{ "data": [...] }` instead of `[...]`

**Check Nginx logs:**
```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

**Solution:** Verify Nginx isn't modifying responses. Check for compression or other modules.

## Complete Fresh Deploy Script

```bash
#!/bin/bash
set -e

cd /path/to/LAUNDRY-storage-management-V3

echo "📥 Pulling latest code..."
git pull origin main

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building project..."
npm run build

echo "⏹️  Stopping old server..."
pm2 delete laundry-app 2>/dev/null || true

echo "🚀 Starting new server..."
export NODE_ENV=production
PM2_HOME=/home/your-user/.pm2 pm2 start dist/server.js --name laundry-app
pm2 save

echo "✅ Deployment complete!"
echo "Server running at http://localhost:3001"
echo "View logs: pm2 logs laundry-app"
```

## What Changed in This Update

1. **Better SPA Routing** - Express now properly serves index.html for all non-API routes
2. **Consistent API Responses** - All endpoints validated to return arrays where expected
3. **Better Error Handling** - Added try-catch blocks and logging
4. **Improved Static File Serving** - Added cache headers for production

## Next Steps

1. Deploy the changes using the steps above
2. Monitor the server logs for any errors
3. Test the application at your domain
4. If issues persist, check the debugging section

---

**Support:** If problems continue, check the server logs with `pm2 logs laundry-app` and share the error messages.
