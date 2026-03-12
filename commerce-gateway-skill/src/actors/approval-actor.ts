import { aggregateId, transitionId } from "@loop-engine/core";
import type { LoopEngine } from "@loop-engine/runtime";

export interface ApprovalEvidence {
  [key: string]: unknown;
  approved: boolean;
  approvedBy: string;
  approvedAt: string;
  approvedVia: "slack" | "email" | "openclaw" | "ui";
  notes?: string;
}

export async function submitHumanApproval(options: {
  engine: LoopEngine;
  instanceId: string;
  approverId: string;
  evidence: ApprovalEvidence;
}): Promise<void> {
  await options.engine.transition({
    aggregateId: aggregateId(options.instanceId),
    transitionId: transitionId(options.evidence.approved ? "approve_order" : "reject_order"),
    actor: {
      type: "human",
      id: options.approverId as never
    },
    evidence: options.evidence
  });
}
