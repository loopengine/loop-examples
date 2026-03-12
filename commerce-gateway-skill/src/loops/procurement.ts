import { LoopBuilder } from "@loop-engine/sdk";

export const procurementLoop = LoopBuilder
  .create("procurement.loop", "procurement")
  .version("1.0.0")
  .description("Governed procurement loop using Commerce Gateway data")
  .state("SIGNAL_DETECTED")
  .state("GATEWAY_QUERY")
  .state("AI_RECOMMENDATION")
  .state("PENDING_APPROVAL")
  .state("ORDER_PLACED", { isTerminal: true })
  .state("REJECTED", { isTerminal: true })
  .initialState("SIGNAL_DETECTED")
  .transition({
    id: "query_gateway",
    from: "SIGNAL_DETECTED",
    to: "GATEWAY_QUERY",
    actors: ["ai-agent", "automation"]
  })
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
        description: "Recommendation confidence must be >= 0.80",
        failureMessage: "Confidence below threshold"
      }
    ]
  })
  .transition({
    id: "request_approval",
    from: "AI_RECOMMENDATION",
    to: "PENDING_APPROVAL",
    actors: ["automation", "system"]
  })
  .transition({
    id: "approve_order",
    from: "PENDING_APPROVAL",
    to: "PENDING_APPROVAL",
    actors: ["human"],
    guards: [
      {
        id: "approval_obtained" as never,
        severity: "hard",
        evaluatedBy: "runtime",
        description: "A human approver must explicitly approve",
        failureMessage: "Approval is required"
      }
    ]
  })
  .transition({
    id: "place_order",
    from: "PENDING_APPROVAL",
    to: "ORDER_PLACED",
    actors: ["automation"],
    guards: [
      {
        id: "order_value_within_limit" as never,
        severity: "hard",
        evaluatedBy: "runtime",
        description: "Order value must stay within configured budget limit",
        failureMessage: "Order value exceeds configured limit"
      }
    ]
  })
  .transition({
    id: "reject_order",
    from: "PENDING_APPROVAL",
    to: "REJECTED",
    actors: ["human"]
  })
  .outcome({
    id: "po_created",
    description: "Purchase order created after governed approval",
    valueUnit: "purchase_order",
    measurable: true
  })
  .build();
