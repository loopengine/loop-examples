import { createLoopSystem } from "@loop-engine/sdk";
import { inventoryAdjustmentLoop } from "../loops/inventory-adjustment";
import { priceChangeLoop } from "../loops/price-change";
import { procurementLoop } from "../loops/procurement";

let systemPromise: ReturnType<typeof createLoopSystem> | null = null;

export async function getLoopSystem() {
  if (!systemPromise) {
    systemPromise = createLoopSystem({
      loops: [procurementLoop, priceChangeLoop, inventoryAdjustmentLoop]
    });
  }
  return systemPromise;
}
