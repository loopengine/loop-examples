# Procurement approval with PagerDuty

This scenario wires Loop Engine approval gates to PagerDuty so the on-call engineer approves
or rejects consequential AI procurement actions from existing incident workflows.

## End-to-end flow

1. AI procurement tool requests a `$9,200` PO for Acme Medical Devices.
2. `requiresApproval()` gates the action and the loop transitions to `PENDING_HUMAN_APPROVAL`.
3. `PagerDutyNotifier.notify()` triggers an incident with loop details and an approval URL.
4. On-call engineer opens the incident, reviews context, and approves in the Loop Engine UI.
5. Loop advances to `EXECUTING`, the tool submits PO `PO-0042`, then transitions to `EXECUTED`.
6. `PagerDutyNotifier.resolve()` closes the incident with `approved` resolution context.

## What makes this partner-ready

- No custom approval console is required for the ops team.
- Existing PagerDuty routing and escalation policy remains unchanged.
- Loop Engine enforces structural approval before execution, not prompt conventions.
- Incident and loop records stay correlated via `dedup_key`.

## Trigger payload snapshot

```json
{
  "routing_key": "pd_integration_key",
  "event_action": "trigger",
  "dedup_key": "loop-engine-loop_po_0017",
  "payload": {
    "summary": "AI requested $9,200 PO to Acme Medical Devices",
    "severity": "warning",
    "source": "Loop Engine / Procurement Agent",
    "custom_details": {
      "loop_id": "loop_po_0017",
      "loop_name": "purchase-order",
      "initiated_by": "ai-agent:procurement-agent",
      "approval_url": "https://app.betterdata.co/loops/loop_po_0017"
    }
  }
}
```

## Resolve call

```ts
await pagerduty.resolve("loop-engine-loop_po_0017", "approved");
```
