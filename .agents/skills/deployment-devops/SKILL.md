---
name: deployment-devops
description: Deploy and operate the In & Out Laundry project on a Hostinger VPS using Docker Compose, n8n, PostgreSQL, Redis, Nginx, SSL, environment variables, backups, health checks, PM2 when needed, staging and production separation, zero-downtime updates, log rotation, and secrets management. Use when Codex creates, reviews, or modifies deployment scripts, Docker Compose files, VPS setup, n8n hosting, database/Redis services, reverse proxy config, SSL automation, backup jobs, production rollout plans, or operational runbooks.
---

# Deployment DevOps

## Purpose

Use this skill to deploy and operate the In & Out Laundry platform safely on Hostinger VPS.
Prefer repeatable infrastructure files and runbooks over manual one-off server changes.

## Core Rule

Never deploy directly to production without backups, environment separation, health checks, rollback path, and secret validation.

## Deployment Targets

Support:

- Docker Compose for app services and dependencies
- n8n deployment
- PostgreSQL
- Redis
- Nginx reverse proxy
- SSL certificates
- environment variables
- backups
- health checks
- PM2 when Docker is not used or for legacy app process management
- staging and production
- zero-downtime or low-downtime updates
- log rotation
- secrets management

## Required Workflow

1. Identify whether this deployment uses Docker Compose, PM2, or a hybrid.
2. Separate staging and production domains, env files, databases, volumes, and n8n instances.
3. Keep secrets out of Git and shell history.
4. Validate `.env` before starting services.
5. Back up PostgreSQL, n8n data, uploaded media, and any SQLite database before updates.
6. Run migrations before or during deploy according to the release plan.
7. Start or update services with health checks.
8. Verify app, API, webhook, n8n, database, Redis, and SSL after deployment.
9. Monitor logs and rollback if health checks fail.

## Production Safety

- Do not use `docker compose down -v` on production unless explicitly approved.
- Do not overwrite production `.env`.
- Do not share PostgreSQL, Redis, or n8n volumes between staging and production.
- Do not expose PostgreSQL, Redis, or n8n editor publicly without authentication and firewall controls.
- Do not place OpenAI, WhatsApp, POS, Supabase service-role, or n8n API keys in frontend bundles.

## Existing Project Note

The project already has PM2-oriented deployment scripts such as `deploy.sh` and `deploy-force.sh`.
When editing deployment, preserve useful backup, build, health-check, and PM2 behavior unless intentionally replacing it with Docker Compose.

## Reference Files

Read [references/deployment-devops.md](references/deployment-devops.md) for Docker Compose patterns, Hostinger VPS setup, n8n deployment rules, Nginx/SSL examples, backup/restore strategy, zero-downtime rollout, PM2 fallback, log rotation, and production checklist.
