import { aggregateId, transitionId } from "@loop-engine/core";
import type { LoopEngine } from "@loop-engine/runtime";
import type { CommerceGatewayClient, PORecord } from "../lib/gateway-client";

export async function executeApprovedPurchaseOrder(options: {
  engine: LoopEngine;
  instanceId: string;
  automationActorId: string;
  gatewayClient: CommerceGatewayClient;
  order: { sku: string; qty: number; supplierId: string; expectedUnitCost?: number };
}): Promise<PORecord> {
  const po = await options.gatewayClient.createPurchaseOrder(options.order);
  await options.engine.transition({
    aggregateId: aggregateId(options.instanceId),
    transitionId: transitionId("place_order"),
    actor: { type: "automation", id: options.automationActorId as never },
    evidence: {
      poId: po.id,
      supplierId: po.supplierId,
      qty: po.qty,
      sku: po.sku,
      status: po.status,
      gatewayRequestId: po.requestId
    }
  });
  return po;
}
