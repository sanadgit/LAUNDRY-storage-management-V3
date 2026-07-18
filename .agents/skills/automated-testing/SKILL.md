---
name: automated-testing
description: Require and design automated tests for the In & Out Laundry AI, n8n, POS, WhatsApp, dispatch, complaint, API, and permission workflows. Covers unit tests, API integration tests, webhook tests, n8n workflow tests, prompt tests, tool-calling tests, mock POS server, duplicate message tests, driver assignment tests, permission tests, Arabic conversation tests, failure/retry tests, and critical customer scenarios. Use when Codex builds, changes, reviews, or claims completion for customer agent, POS integration, webhooks, n8n workflows, API routes, database logic, driver dispatch, complaints, permissions, or OpenAI tool calls.
---

# Automated Testing

## Purpose

Use this skill to prevent Codex from building In & Out Laundry systems without tests.
Any feature that touches customers, WhatsApp, POS, n8n, drivers, complaints, permissions, or OpenAI tools needs an automated test plan and, when code is changed, relevant automated tests.

## Core Rule

Do not claim a feature is complete with only manual reasoning.
Add or update automated tests, or clearly state why tests could not be added and what verification was performed instead.

## Required Test Types

Choose the relevant tests for the change:

- unit tests
- API integration tests
- webhook tests
- n8n workflow tests
- prompt tests
- OpenAI tool-calling tests
- mock POS server tests
- duplicate WhatsApp message tests
- driver assignment tests
- permission and branch-scope tests
- Arabic conversation tests
- failure and retry tests

## Project Note

The current root project has `lint` and build scripts, but no obvious dedicated test script.
When implementing new testable logic, add or propose an appropriate test runner such as Vitest/Jest/Playwright/Supertest/MSW-style mocks depending on the codebase shape.
Do not treat `tsc --noEmit` as a replacement for behavior tests.

## Minimum Scenarios

Cover these scenarios when they are relevant:

- existing customer with an active order
- existing customer with no orders
- new customer
- invalid phone number
- order belongs to another phone
- primary driver unavailable
- branch does not respond
- duplicate WhatsApp message
- OpenAI API unavailable
- POS unavailable
- lost item complaint
- customer sends voice message

## Test Design Rules

1. Mock external systems by default: POS, WhatsApp, OpenAI, n8n, Telegram, Google Maps.
2. Use real request/response shapes from the project where available.
3. Test both success and failure paths.
4. Test idempotency for webhooks and write actions.
5. Test authorization before testing happy-path data return.
6. Test Arabic and mixed Arabic/English messages for customer-facing agents.
7. Test retries without creating duplicate POS writes or duplicate notifications.
8. Keep tests deterministic and independent of production services.

## Reference Files

Read [references/automated-testing.md](references/automated-testing.md) for detailed test matrix, mock POS patterns, webhook payload cases, n8n testing approach, prompt/tool-call evaluation rules, and scenario checklists.
