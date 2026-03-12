import { aggregateId, transitionId, type LoopDefinition, type LoopInstance } from "@loop-engine/core";
import { getLoopDefinitions, getLoopSystem } from "../lib/engine";
import { formatApprovalDecision } from "../lib/messenger";
import type { OpenClawContext } from "../types";

function findTransition(
  definition: LoopDefinition,
  instance: LoopInstance,
  mode: "approve" | "reject"
): string | null {
  const candidates = definition.transitions.filter(
    (candidate) =>
      candidate.from === instance.currentState &&
      candidate.allowedActors.includes("human")
  );
  const exact = candidates.find((candidate) =>
    mode === "approve"
      ? candidate.id.toLowerCase().includes("approve")
      : candidate.id.toLowerCase().includes("reject")
  );
  return String(exact?.id ?? candidates[0]?.id ?? "");
}

export async function handleApprove(instanceId: string, ctx: OpenClawContext): Promise<string> {
  const { engine } = await getLoopSystem();
  const instance = await engine.getState(aggregateId(instanceId));
  if (!instance) {
    return `❌ Loop instance ${instanceId} not found.`;
  }

  const definition = getLoopDefinitions().find((item) => item.id === instance.loopId);
  if (!definition) {
    return `❌ Loop definition ${instance.loopId} not found.`;
  }

  const transition = findTransition(definition, instance, "approve");
  if (!transition) {
    return `❌ No approval transition available from state: ${instance.currentState}`;
  }

  const result = await engine.transition({
    aggregateId: aggregateId(instanceId),
    transitionId: transitionId(transition),
    actor: { type: "human", id: ctx.userId },
    evidence: {
      approved: true,
      approvedAt: new Date().toISOString(),
      approvedVia: ctx.channel,
      approvedBy: ctx.userId,
      approvedRole: ctx.userRole ?? "operator"
    }
  });

  if (result.status === "executed") {
    return formatApprovalDecision(instance, true);
  }
  if (result.status === "guard_failed") {
    return `❌ Approval blocked by policy: ${result.guardFailures?.[0]?.guardId ?? "unknown_guard"}`;
  }
  return `❌ Transition failed: ${result.status}`;
}

export async function handleReject(instanceId: string, ctx: OpenClawContext): Promise<string> {
  const { engine } = await getLoopSystem();
  const instance = await engine.getState(aggregateId(instanceId));
  if (!instance) {
    return `❌ Loop instance ${instanceId} not found.`;
  }
  const definition = getLoopDefinitions().find((item) => item.id === instance.loopId);
  if (!definition) {
    return `❌ Loop definition ${instance.loopId} not found.`;
  }
  const transition = findTransition(definition, instance, "reject");
  if (!transition) {
    return `❌ No rejection transition available from state: ${instance.currentState}`;
  }

  const result = await engine.transition({
    aggregateId: aggregateId(instanceId),
    transitionId: transitionId(transition),
    actor: { type: "human", id: ctx.userId },
    evidence: {
      approved: false,
      rejectedAt: new Date().toISOString(),
      rejectedVia: ctx.channel,
      rejectedBy: ctx.userId
    }
  });

  if (result.status === "executed") {
    return formatApprovalDecision(instance, false);
  }
  return `❌ Transition failed: ${result.status}`;
}
