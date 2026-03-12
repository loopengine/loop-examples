import { LoopBuilder } from "@loop-engine/sdk";

export const replenishmentLoop = LoopBuilder
  .create("scm.replenishment", "scm")
  .version("1.0.0")
  .description("Triggered replenishment from demand signal")
  .state("SIGNAL_DETECTED")
  .state("AI_ANALYSIS")
  .state("PENDING_BUYER_APPROVAL")
  .state("PO_TRIGGERED", { isTerminal: true })
  .state("DEFERRED", { isTerminal: true })
  .initialState("SIGNAL_DETECTED")
  .transition({
    id: "start_analysis",
    from: "SIGNAL_DETECTED",
    to: "AI_ANALYSIS",
    actors: ["automation", "system"]
  })
  .transition({
    id: "recommend_replenishment",
    from: "AI_ANALYSIS",
    to: "PENDING_BUYER_APPROVAL",
    actors: ["ai-agent", "automation"],
    guards: [
      {
        id: "confidence_threshold" as never,
        severity: "hard",
        evaluatedBy: "external",
        description: "AI confidence must be >= 0.75",
        failureMessage: "Confidence below threshold"
      }
    ]
  })
  .transition({
    id: "approve_replenishment",
    from: "PENDING_BUYER_APPROVAL",
    to: "PO_TRIGGERED",
    actors: ["human"],
    guards: [
      {
        id: "approval_obtained" as never,
        severity: "hard",
        evaluatedBy: "runtime",
        description: "Buyer approval required",
        failureMessage: "Approval not obtained"
      }
    ]
  })
  .transition({
    id: "reject_replenishment",
    from: "PENDING_BUYER_APPROVAL",
    to: "DEFERRED",
    actors: ["human"]
  })
  .outcome({
    id: "replenishment_triggered",
    description: "Replenishment PO created",
    valueUnit: "replenishment_triggered",
    measurable: true
  })
  .build();
