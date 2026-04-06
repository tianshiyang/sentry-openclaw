# Sentry Alert Rules

## Alert Rule Configuration

This document tracks the Sentry alert rules configured for this project.

### Test Alert Rules

| Rule Name | Event ID | Purpose | Last Test |
|-----------|----------|---------|-----------|
| alert-rule-test-final | alert-rule-test-final | Verify webhook integration | 2026-04-07 00:21 |

### Active Alert Rules

(TODO: Add production alert rules here)

## Webhook Integration

The Sentry webhook is configured to:
1. Receive error-level events
2. Trigger automated analysis and fix workflow
3. Send notifications to Feishu

### Testing the Webhook

To test the Sentry webhook:
1. Go to Sentry project → Alerts → Rules
2. Create or select an alert rule
3. Set action to send webhook to the configured endpoint
4. Trigger the alert to verify delivery

**Last successful test:** 2026-04-07 00:21 UTC - alert-rule-test-final confirmed working.
