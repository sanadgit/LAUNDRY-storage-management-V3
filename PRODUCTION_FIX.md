# Production Deployment Fix Guide

## Problem
When deploying to production with Nginx and running `npm run build`, the application was returning errors:
```
TypeError: (t.data ?? []).map is not a function
TypeError: i.filter is not a function
TypeError: (n.data ?? []).sort is not a function
```

## Root Cause
The API endpoints (`/api/stores`, `/api/logs`, `/api/blankets`, `/api/supabase/stores`, etc.) were not properly validating that the returned data was always an array. In some cases, the response could be:
1. `null` or `undefined`
2. An object instead of an array
3. Improperly wrapped by nginx

## Solution Implemented
Updated all GET endpoints to:
1. **Validate response data is an array** using `Array.isArray()`
2. **Add comprehensive error handling** with try-catch blocks
3. **Return consistent JSON responses** ensuring arrays are never null
4. **Log errors** for debugging in production

### Example Fix:
```typescript
// BEFORE (causing errors)
app.get('/api/stores', (_req, res) => {
  const stores = db.prepare('SELECT * FROM stores').all();
  res.json(stores);
});

// AFTER (safe)
app.get('/api/stores', (_req, res) => {
  try {
    const stores = db.prepare('SELECT * FROM stores').all();
    const storesArray = Array.isArray(stores) ? stores : [];
    res.json(storesArray);
  } catch (error: any) {
    console.error('Error fetching stores from SQLite:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch stores' });
  }
});
```

## Fixed Endpoints
✅ `/api/stores` - SQLite
✅ `/api/logs` - SQLite  
✅ `/api/blankets` - SQLite
✅ `/api/supabase/stores` - Supabase proxy
✅ `/api/supabase/blankets` - Supabase proxy
✅ `/api/supabase/logs` - Supabase proxy

## Nginx Configuration Recommendations
If using Nginx, ensure your reverse proxy configuration:

```nginx
location /api/ {
    proxy_pass http://localhost:3000;
    proxy_set_header Content-Type application/json;
    proxy_set_header Connection "";
    proxy_http_version 1.1;
    # Prevent nginx from buffering response
    proxy_buffering off;
    # Allow large responses
    proxy_buffer_size 128k;
    proxy_buffers 4 256k;
}
```

## Deployment Steps
1. **Build the project:**
   ```bash
   npm install
   npm run build
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Check that API endpoints return arrays:**
   ```bash
   curl http://localhost:3000/api/stores
   # Should return: [] or [{ store data }]
   
   curl http://localhost:3000/api/logs
   # Should return: [] or [{ log data }]
   ```

4. **If using Supabase, test proxy endpoints:**
   ```bash
   curl http://localhost:3000/api/supabase/stores
   # Should return: [] or [{ store data }]
   ```

## Debugging
If you still see errors:

1. **Check server logs** for `Error fetching` messages
2. **Verify Supabase configuration** is set correctly
3. **Test API endpoints directly** with curl to verify format
4. **Check nginx logs** at `/var/log/nginx/error.log`
5. **Verify database connection** and permissions

---

**Fixed on:** April 18, 2026
