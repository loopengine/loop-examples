# pagerduty-skill

`pagerduty-skill` demonstrates how Loop Engine `PENDING_HUMAN_APPROVAL` states map to PagerDuty incidents for enterprise on-call approval flows.

## What it shows

- Triggering PagerDuty incidents from governed AI actions
- Routing severity by business impact
- Resolving incidents when loops are approved or rejected

## Core adapters

- `@loop-engine/adapter-vercel-ai`
- `@loop-engine/adapter-pagerduty`

## Scenario

See [`examples/procurement-approval.md`](./examples/procurement-approval.md) for the complete purchase-order workflow from AI request to human approval and incident resolution.
