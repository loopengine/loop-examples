import { aggregateId, transitionId } from "@loop-engine/core";
import { getLoopSystem } from "../lib/engine";
import type { OpenClawContext } from "../types";

export async function handleTransition(
  instanceId: string,
  requestedTransitionId: string,
  ctx: OpenClawContext
): Promise<string> {
  const { engine } = await getLoopSystem();
  const instance = await engine.getState(aggregateId(instanceId));
  if (!instance) {
    return `❌ Loop instance ${instanceId} not found.`;
  }

  const result = await engine.transition({
    aggregateId: aggregateId(instanceId),
    transitionId: transitionId(requestedTransitionId),
    actor: { type: "human", id: ctx.userId },
    evidence: {
      channel: ctx.channel,
      requestedBy: ctx.userId
    }
  });

  if (result.status === "executed") {
    return `✅ Transition executed. ${requestedTransitionId} -> ${result.toState}`;
  }
  if (result.status === "guard_failed") {
    return `❌ Guard blocked transition: ${result.guardFailures?.[0]?.guardId ?? "unknown_guard"}`;
  }
  if (result.status === "pending_approval") {
    return `⚠️ Human approval required for ${instanceId}.`;
  }
  return `❌ Transition rejected: ${result.rejectionReason ?? "unknown_reason"}`;
}
