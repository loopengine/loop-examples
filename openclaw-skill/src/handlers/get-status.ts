import { aggregateId } from "@loop-engine/core";
import { getLoopSystem } from "../lib/engine";
import { formatStatus } from "../lib/messenger";

export async function handleGetStatus(instanceId: string): Promise<string> {
  const { engine } = await getLoopSystem();
  const instance = await engine.getState(aggregateId(instanceId));
  if (!instance) {
    return `❌ Loop instance ${instanceId} not found.`;
  }

  const history = await engine.getHistory(aggregateId(instanceId));
  const last = history[history.length - 1];
  const lines = [formatStatus(instance)];
  if (last) {
    lines.push(`Last transition: ${last.transitionId} (${last.fromState} -> ${last.toState})`);
  }
  return lines.join("\n");
}
