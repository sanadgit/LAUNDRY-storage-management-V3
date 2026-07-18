# Deployment DevOps Reference

## Target Architecture

Recommended Hostinger VPS layout:

```text
Internet
-> Nginx reverse proxy
-> app service
-> n8n service
-> PostgreSQL
-> Redis
-> backup jobs
```

Keep PostgreSQL and Redis on private Docker networks or localhost.
Expose only Nginx ports `80` and `443` publicly unless there is a deliberate reason.

## Deployment Modes

### Docker Compose Mode

Prefer Docker Compose for a clean VPS deployment when the whole stack is managed together.

Typical services:

- `app`
- `n8n`
- `postgres`
- `redis`
- `nginx`
- `backup`

Use named volumes:

- `postgres_data`
- `redis_data`
- `n8n_data`
- `app_uploads`
- `certbot_data` when using Certbot

### PM2 Mode

Use PM2 when:

- the existing Node app is already deployed with PM2
- Docker is not available or not desired
- only the app process needs management
- the project is transitioning gradually to Docker

Existing scripts such as `deploy.sh` and `deploy-force.sh` already use PM2.
Preserve PM2 health checks, backups, and build verification when extending them.

### Hybrid Mode

Acceptable transitional layout:

- app with PM2
- PostgreSQL/Redis/n8n with Docker Compose
- Nginx on host

Document the boundaries clearly so future deployments do not restart the wrong layer.

## Environment Separation

Use separate resources for staging and production:

- domains
- `.env` files
- PostgreSQL databases
- Redis databases or instances
- n8n encryption keys
- n8n webhook URLs
- volumes
- backup folders
- WhatsApp test/prod numbers when possible

Suggested files:

```text
.env.production
.env.staging
docker-compose.production.yml
docker-compose.staging.yml
nginx/sites-available/inout-production.conf
nginx/sites-available/inout-staging.conf
```

Never copy production secrets into staging unless absolutely required and approved.

## Required Environment Variables

Validate these before production deploy when relevant:

- `NODE_ENV`
- `APP_URL`
- `PORT`
- `DATABASE_URL` or `POSTGRES_URL`
- `DB_PROVIDER`
- `OPENAI_API_KEY`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_VERIFY_TOKEN`
- `N8N_API_KEY`
- `N8N_WEBHOOK_BASE_URL`
- `N8N_ENCRYPTION_KEY`
- `REDIS_URL`
- `POS_BASE_URL`
- `POS_API_USER`
- `POS_API_PASSWORD`
- `SUPABASE_SERVICE_ROLE_KEY` if used server-side

Rules:

- do not commit real `.env` files
- do not print secrets in deploy logs
- use strong random `N8N_ENCRYPTION_KEY`
- use different keys for staging and production
- use `VITE_` variables only for browser-safe values

## Docker Compose Pattern

Example skeleton:

```yaml
services:
  app:
    build: .
    restart: unless-stopped
    env_file:
      - .env.production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - app_net
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://127.0.0.1:3001/health"]
      interval: 30s
      timeout: 5s
      retries: 5

  n8n:
    image: n8nio/n8n:latest
    restart: unless-stopped
    env_file:
      - .env.n8n.production
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - app_net

  postgres:
    image: postgres:16
    restart: unless-stopped
    env_file:
      - .env.postgres.production
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app_net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER -d $$POSTGRES_DB"]
      interval: 30s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    command: ["redis-server", "--appendonly", "yes"]
    volumes:
      - redis_data:/data
    networks:
      - app_net

networks:
  app_net:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
  n8n_data:
```

Pin image versions in production when stability matters.
Avoid `latest` for critical production systems unless updates are controlled.

## n8n Deployment Rules

Set:

- `N8N_HOST`
- `N8N_PROTOCOL=https`
- `WEBHOOK_URL=https://n8n.example.com/`
- `N8N_ENCRYPTION_KEY`
- `DB_TYPE=postgresdb` for production
- `QUEUE_BULL_REDIS_HOST` when using queue mode
- `N8N_LOG_LEVEL=info` or `warn`

Protect n8n:

- require login
- use HTTPS
- do not expose editor on untrusted public URL without strong auth
- keep credentials in n8n credentials, not code nodes
- back up n8n database and `.n8n` data
- separate staging and production workflows

For production scale, consider n8n queue mode with Redis:

```text
n8n-main
n8n-worker
redis
postgres
```

## PostgreSQL

Production rules:

- use strong password
- bind only to private network or localhost
- take backups before migrations
- test migrations in staging
- monitor disk usage
- use separate DB/user for app and n8n when possible

Backup command pattern:

```bash
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_DIR/postgres-$(date +%F-%H%M%S).sql.gz"
```

Restore pattern:

```bash
gunzip -c backup.sql.gz | psql "$DATABASE_URL"
```

Do not run restore on production without explicit confirmation and a current backup.

## Redis

Use Redis for:

- queues
- retries
- n8n queue mode
- rate limiting
- temporary locks

Rules:

- do not expose Redis publicly
- enable append-only persistence when queue recovery matters
- monitor memory
- set eviction policy intentionally
- separate staging and production Redis

## Nginx Reverse Proxy

Use Nginx for:

- TLS termination
- routing app and n8n domains
- request size limits
- proxy timeouts
- gzip/brotli when configured
- security headers

Example:

```nginx
server {
  listen 80;
  server_name app.example.com;
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl http2;
  server_name app.example.com;

  ssl_certificate /etc/letsencrypt/live/app.example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/app.example.com/privkey.pem;

  client_max_body_size 25m;

  location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```

For n8n, make sure webhook and editor URLs match the public HTTPS domain.

## SSL

Use Let's Encrypt or Hostinger-managed SSL.

Checklist:

- redirect HTTP to HTTPS
- renew certificates automatically
- test renewal before expiry
- reload Nginx after renewal
- monitor certificate expiry

Certbot pattern:

```bash
certbot --nginx -d app.example.com -d n8n.example.com
certbot renew --dry-run
```

## Backups

Back up:

- PostgreSQL database
- n8n workflows/credentials database
- n8n data volume
- uploaded media
- `.env` files through secure secret backup, not public Git
- SQLite DB if still used

Backup rules:

- automate daily backups
- keep at least 7 daily and 4 weekly backups if storage allows
- encrypt off-server backups
- test restore regularly
- alert on backup failure

Suggested layout:

```text
/opt/inout/backups/postgres
/opt/inout/backups/n8n
/opt/inout/backups/uploads
/opt/inout/backups/sqlite
```

## Health Checks

Check:

- app `/health`
- app API smoke endpoint
- PostgreSQL connectivity
- Redis ping
- n8n health or editor availability
- WhatsApp webhook verification endpoint
- OpenAI configured fallback or lightweight dependency check
- POS safe read-only endpoint if available
- disk usage
- memory usage
- SSL certificate expiry

Deployment should fail or rollback if critical health checks fail.

## Zero-Downtime Or Low-Downtime Updates

For PM2:

```bash
pm2 reload laundry-warehouse --update-env
```

Use `restart` only when reload is not safe.

For Docker Compose:

```bash
docker compose pull
docker compose build app
docker compose up -d --no-deps app
docker compose ps
```

For database changes:

- prefer backward-compatible migrations
- deploy additive schema before code that uses it
- avoid dropping columns in the same release
- test rollback or forward-fix plan

## Log Rotation

For PM2:

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 20M
pm2 set pm2-logrotate:retain 14
pm2 set pm2-logrotate:compress true
```

For Docker:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "20m",
    "max-file": "10"
  }
}
```

For Nginx:

- use system logrotate
- keep access and error logs
- avoid logging secrets in query strings

## Secrets Management

Rules:

- keep secrets in `.env` files with `chmod 600`
- prefer Docker secrets or VPS secret manager where available
- do not paste secrets into shell history
- do not commit real secrets
- rotate secrets after exposure
- use separate secrets for staging and production

Protect:

- OpenAI keys
- WhatsApp tokens
- POS credentials
- n8n encryption key
- PostgreSQL password
- Redis password if used
- Supabase service role key
- Telegram bot token

## Firewall And Access

Recommended:

- allow SSH only from trusted IPs when possible
- expose only `80` and `443`
- block public PostgreSQL and Redis
- use SSH keys, disable password login when comfortable
- keep system packages updated
- create a non-root deploy user when possible

## Rollback Plan

Before every production update:

- record current git SHA or image tag
- create database backup
- create n8n backup
- keep previous `.env`
- know the previous working PM2 process/image
- document rollback command

Rollback examples:

```bash
git reset --hard <previous_sha>
npm ci
npm run build
pm2 reload laundry-warehouse --update-env
```

Docker:

```bash
docker compose up -d app@previous_image
```

Use database rollback only when safe.
For risky migrations, prefer forward-fix after restoring from backup in staging first.

## Deployment Checklist

Before deploy:

- staging tested
- tests/build/lint passed
- secrets present and not printed
- backup completed
- migrations reviewed
- disk space sufficient
- health check endpoint available
- rollback plan ready

During deploy:

- pull exact version or tag
- install/build consistently
- run migrations safely
- restart/reload services
- run health checks
- check logs

After deploy:

- verify app domain
- verify n8n webhook URL
- verify WhatsApp webhook verification
- verify PostgreSQL and Redis
- verify SSL
- verify background workers
- monitor error logs and queue depth

## Hostinger VPS Notes

Hostinger VPS usually behaves like a standard Linux VPS.
Codex should not assume managed platform features unless confirmed.

Prefer:

- `/opt/inout` or `/var/www/inout` for deployment
- `/opt/inout/backups` for backups
- Nginx site files under `/etc/nginx/sites-available`
- systemd timers or cron for backups
- Docker Compose plugin where available

When unsure, inspect the VPS before changing services:

```bash
docker --version
docker compose version
nginx -v
pm2 -v
node -v
df -h
free -m
```

Do not run destructive cleanup commands on production without explicit approval.
