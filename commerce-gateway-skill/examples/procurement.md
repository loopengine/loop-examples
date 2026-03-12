# Procurement workflow example

## 1) Signal detected

```ts
await engine.start({
  loopId: loopId("procurement.loop"),
  aggregateId: aggregateId("rpl-dc-east-001"),
  orgId: "lumebonde",
  actor: { type: "system", id: actorId("system:detector") },
  metadata: { signalType: "DEMAND_SPIKE", sku: "LMB-BRS-001", demandIncreasePct: 89 }
});
```

State: `SIGNAL_DETECTED` -> `GATEWAY_QUERY`

## 2) Commerce Gateway reads

```text
GET /inventory/LMB-BRS-001           -> { currentStock: 142, reorderPoint: 280 }
GET /demand-forecast/LMB-BRS-001     -> { forecastedDemand: 527, confidence: 0.91 }
GET /suppliers/LMB-BRS-001           -> [{ id: "sup-001", unitCost: 18.40, leadTimeDays: 14 }]
```

## 3) AI recommendation and confidence guard

```json
{
  "recommendedQty": 500,
  "estimatedCost": 9200,
  "supplierId": "sup-001",
  "confidence": 0.87
}
```

Guard evaluation: `confidence_threshold` 0.87 >= 0.80 -> pass  
State: `AI_RECOMMENDATION` -> `PENDING_APPROVAL`

## 4) Human approval

```text
⚠️ Approval required: rpl-dc-east-001
Approve this $9,200 PO for 500 units of LMB-BRS-001?
Reply: approve rpl-dc-east-001 or reject rpl-dc-east-001
```

```ts
await submitHumanApproval({
  engine,
  instanceId: "rpl-dc-east-001",
  approverId: "buyer:dc-east",
  evidence: {
    approved: true,
    approvedBy: "buyer:dc-east",
    approvedAt: new Date().toISOString(),
    approvedVia: "openclaw"
  }
});
```

## 5) Automation places order (write, post-approval only)

```ts
await executeApprovedPurchaseOrder({
  engine,
  instanceId: "rpl-dc-east-001",
  automationActorId: "automation:po-bot",
  gatewayClient,
  order: {
    sku: "LMB-BRS-001",
    qty: 500,
    supplierId: "sup-001"
  }
});
```
