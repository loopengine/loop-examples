import { LoopBuilder } from "@loop-engine/sdk";

export const priceChangeLoop = LoopBuilder
  .create("pricing.change", "pricing")
  .version("1.0.0")
  .description("Governed AI-assisted price change workflow")
  .state("SIGNAL_DETECTED")
  .state("GATEWAY_QUERY")
  .state("AI_RECOMMENDATION")
  .state("PENDING_APPROVAL")
  .state("PRICE_UPDATED", { isTerminal: true })
  .state("REJECTED", { isTerminal: true })
  .initialState("SIGNAL_DETECTED")
  .transition({ id: "query_gateway", from: "SIGNAL_DETECTED", to: "GATEWAY_QUERY", actors: ["ai-agent", "automation"] })
  .transition({
    id: "recommend",
    from: "GATEWAY_QUERY",
    to: "AI_RECOMMENDATION",
    actors: ["ai-agent"],
    guards: [
      {
        id: "confidence_threshold" as never,
        severity: "hard",
        evaluatedBy: "external",
        description: "Recommendation confidence must be >= 0.85",
        failureMessage: "Confidence below threshold"
      }
    ]
  })
  .transition({ id: "request_approval", from: "AI_RECOMMENDATION", to: "PENDING_APPROVAL", actors: ["automation", "system"] })
  .transition({ id: "approve_price_change", from: "PENDING_APPROVAL", to: "PRICE_UPDATED", actors: ["human"] })
  .transition({ id: "reject_price_change", from: "PENDING_APPROVAL", to: "REJECTED", actors: ["human"] })
  .outcome({
    id: "price_updated",
    description: "Price change was applied",
    valueUnit: "price_update",
    measurable: true
  })
  .build();
