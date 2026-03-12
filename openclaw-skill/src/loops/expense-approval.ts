import { LoopBuilder } from "@loop-engine/sdk";

export const expenseApprovalLoop = LoopBuilder
  .create("expense.approval", "finance")
  .version("1.0.0")
  .description("Expense approval loop")
  .state("SUBMITTED")
  .state("UNDER_REVIEW")
  .state("APPROVED", { isTerminal: true })
  .state("REJECTED", { isTerminal: true })
  .initialState("SUBMITTED")
  .transition({
    id: "start_review",
    from: "SUBMITTED",
    to: "UNDER_REVIEW",
    actors: ["automation"]
  })
  .transition({
    id: "approve",
    from: "UNDER_REVIEW",
    to: "APPROVED",
    actors: ["human"],
    guards: [
      {
        id: "approval_obtained" as never,
        severity: "hard",
        evaluatedBy: "runtime",
        description: "Manager approval required",
        failureMessage: "Approval not obtained"
      }
    ]
  })
  .transition({
    id: "reject",
    from: "UNDER_REVIEW",
    to: "REJECTED",
    actors: ["human"]
  })
  .outcome({
    id: "expense_approved",
    description: "Expense approved",
    valueUnit: "expense_approved",
    measurable: true
  })
  .build();
