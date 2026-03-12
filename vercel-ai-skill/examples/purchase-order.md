# Governed purchase-order tool execution

An AI procurement agent receives a request to submit a $9,200 PO to Acme Medical Devices.
Because the amount is consequential, the governed Vercel AI SDK tool call is suspended until
a human approver advances the loop from `PENDING_HUMAN_APPROVAL`.

## State transition sequence

1. `INITIATED` - The AI tool call starts and opens a loop instance.
2. `AI_ANALYSIS` - The agent composes vendor, amount, and line-item context.
3. `PENDING_HUMAN_APPROVAL` - `requiresApproval()` returns `true` for `$9,200`.
4. `EXECUTING` - A human approver confirms the action.
5. `EXECUTED` - The purchase order is submitted and the loop closes.

## 60-second demo script

1. Ask the model to submit a `$9,200` PO.
2. Show the tool response returning `pending_approval`.
3. Show the approval notification payload with `loop_po_0017`.
4. Approve as `human:jane.doe`.
5. Show final result `PO-0042` and closed loop state.

## What the developer sees in their streamText response

When suspended for approval, the tool returns:

```ts
{ status: "pending_approval", loopId: "loop_po_0017", message: "Awaiting human approval" }
```

## What the approver sees (wire this to PagerDuty or any notifier)

```text
Action required: AI agent requested a $9,200 PO to Acme Medical Devices.
Loop ID: loop_po_0017 · Approve at: https://app.betterdata.co/loops/loop_po_0017
Or respond YES/NO via your configured approval channel.
```

## After approval

```ts
{ orderId: "PO-0042", status: "submitted", approvedBy: "human:jane.doe" }
```

## Wiring PagerDuty approval

```ts
import { PagerDutyNotifier } from "@loop-engine/adapter-pagerduty";

const pagerduty = new PagerDutyNotifier({
  integrationKey: process.env.PAGERDUTY_INTEGRATION_KEY!,
  severity: "warning",
  serviceContext: "Loop Engine / Procurement Agent",
  approvalUrl: (loopId) => `https://app.betterdata.co/loops/${loopId}`
});

const submitPurchaseOrder = wrapTool(purchaseOrderTool, {
  loopDefinition: purchaseOrderLoop,
  engine,
  requiresApproval: ({ amount }) => amount > 5000,
  onApprovalRequired: async (loopId, input) => {
    const dedupKey = await pagerduty.notify(loopId, {
      loopId,
      loopName: "purchase-order",
      actor: { type: "ai-agent", id: "procurement-agent" as never },
      input,
      summary: `AI requested $${input.amount} PO to ${input.vendor}`
    });
    // store dedupKey alongside loopId to resolve later
  },
  actor: { type: "ai-agent", id: "procurement-agent" as never }
});
```

On-call PagerDuty incident view:

- Incident title: `AI requested $9,200 PO to Acme Medical Devices`
- Severity: `warning`
- Custom details: `loop_id`, `loop_name`, `initiated_by`, `approval_url`
- Incident link: `Approve or reject this action`

Resolve the incident after a human approves in the Loop Engine UI:

```ts
await pagerduty.resolve(dedupKey, "approved");
// PagerDuty incident auto-resolves, on-call engineer is notified
```
