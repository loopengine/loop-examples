import type { LoopInstance } from "@loop-engine/core";

export function isApprovalState(state: string): boolean {
  return /PENDING|APPROVAL/i.test(state);
}

export function formatApprovalPrompt(instance: LoopInstance): string {
  return [
    `⚠️ Approval required for ${instance.loopId} ${instance.aggregateId}`,
    `Current state: ${instance.currentState}`,
    `Reply: approve ${instance.aggregateId} or reject ${instance.aggregateId}`
  ].join("\n");
}

export function formatStatus(instance: LoopInstance): string {
  return [
    `Loop: ${instance.loopId}`,
    `Instance: ${instance.aggregateId}`,
    `State: ${instance.currentState}`,
    `Status: ${instance.status}`
  ].join("\n");
}
