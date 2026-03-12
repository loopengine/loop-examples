import type { LoopDefinition } from "@loop-engine/core";
import { createLoopSystem } from "@loop-engine/sdk";
import { expenseApprovalLoop } from "../loops/expense-approval";
import { replenishmentLoop } from "../loops/replenishment";

const definitions: LoopDefinition[] = [replenishmentLoop, expenseApprovalLoop];
let systemPromise: ReturnType<typeof createLoopSystem> | null = null;

export async function getLoopSystem() {
  if (!systemPromise) {
    systemPromise = createLoopSystem({
      loops: definitions
    });
  }
  return systemPromise;
}

export function getLoopDefinitions(): LoopDefinition[] {
  return definitions;
}
