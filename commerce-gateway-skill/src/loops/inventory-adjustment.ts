import { LoopBuilder } from "@loop-engine/sdk";

export const inventoryAdjustmentLoop = LoopBuilder
  .create("inventory.adjustment", "inventory")
  .version("1.0.0")
  .description("Governed inventory write-down workflow")
  .state("SIGNAL_DETECTED")
  .state("GATEWAY_QUERY")
  .state("AI_RECOMMENDATION")
  .state("PENDING_APPROVAL")
  .state("ADJUSTMENT_APPLIED", { isTerminal: true })
  .state("REJECTED", { isTerminal: true })
  .initialState("SIGNAL_DETECTED")
  .transition({ id: "query_gateway", from: "SIGNAL_DETECTED", to: "GATEWAY_QUERY", actors: ["ai-agent", "automation"] })
  .transition({ id: "recommend", from: "GATEWAY_QUERY", to: "AI_RECOMMENDATION", actors: ["ai-agent"] })
  .transition({ id: "request_approval", from: "AI_RECOMMENDATION", to: "PENDING_APPROVAL", actors: ["automation", "system"] })
  .transition({ id: "approve_adjustment", from: "PENDING_APPROVAL", to: "ADJUSTMENT_APPLIED", actors: ["human"] })
  .transition({ id: "reject_adjustment", from: "PENDING_APPROVAL", to: "REJECTED", actors: ["human"] })
  .outcome({
    id: "inventory_adjusted",
    description: "Inventory adjustment posted",
    valueUnit: "adjustment",
    measurable: true
  })
  .build();
