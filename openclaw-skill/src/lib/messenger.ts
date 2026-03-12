import type { LoopInstance } from "@loop-engine/core";

export function isApprovalState(state: string): boolean {
  return /PENDING|APPROVAL/i.test(state);
}

export function formatApprovalPrompt(instance: LoopInstance): string {
  if (String(instance.loopId) === "scm.replenishment") {
    return [
      "Approval required: Restock 200 units of SKU-4821 (Ibuprofen 200mg) from MedSupply Co.",
      `Estimated cost: $3,400 · Requested by: inventory-agent · Loop ID: ${instance.aggregateId}`,
      "Reply YES to approve or NO to reject."
    ].join("\n");
  }

  if (String(instance.loopId) === "expense.approval") {
    return [
      "Approval required: Purchase Order $9,200 — Vendor: Acme Medical Devices",
      `Requested by: procurement-agent · Loop ID: ${instance.aggregateId}`,
      "Reply YES to approve or NO to reject."
    ].join("\n");
  }

  return `Approval required for ${instance.loopId} (${instance.aggregateId}). Reply YES to approve or NO to reject.`;
}

export function formatStatus(instance: LoopInstance): string {
  return [
    `Loop: ${instance.loopId}`,
    `Instance: ${instance.aggregateId}`,
    `State: ${instance.currentState}`,
    `Status: ${instance.status}`
  ].join("\n");
}

export function formatApprovalDecision(instance: LoopInstance, approved: boolean): string {
  if (String(instance.loopId) === "scm.replenishment") {
    return approved
      ? `✓ Approved. Replenishment order submitted. Loop ID: ${instance.aggregateId} is now EXECUTED.`
      : `✗ Rejected. Replenishment order cancelled. Loop ID: ${instance.aggregateId} is now REJECTED.`;
  }

  if (String(instance.loopId) === "expense.approval") {
    return approved
      ? `✓ Approved. PO submitted to vendor. Loop ID: ${instance.aggregateId} is now EXECUTED.`
      : `✗ Rejected. PO cancelled. Loop ID: ${instance.aggregateId} is now REJECTED.`;
  }

  return approved
    ? `✓ Approved. Loop ID: ${instance.aggregateId} is now EXECUTED.`
    : `✗ Rejected. Loop ID: ${instance.aggregateId} is now REJECTED.`;
}
