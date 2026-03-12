import { aggregateId } from "@loop-engine/core";
import { getLoopDefinitions, getLoopSystem } from "../lib/engine";
import { formatApprovalPrompt, formatStatus, isApprovalState } from "../lib/messenger";
import type { OpenClawContext } from "../types";

export async function handleStartLoop(loopId: string, _ctx: OpenClawContext): Promise<string> {
  const definition = getLoopDefinitions().find((item) => String(item.id) === loopId);
  if (!definition) {
    return `❌ Loop definition ${loopId} not found. Use "list loops" to view available loops.`;
  }

  const instanceId = `${loopId.replace(/[^\w-]/g, "-")}-${Date.now()}`;
  const { engine } = await getLoopSystem();

  const instance = await engine.start({
    loopId,
    aggregateId: aggregateId(instanceId),
    orgId: "openclaw",
    actor: { type: "system", id: "system:openclaw" },
    metadata: { source: "openclaw-skill" }
  });

  const lines = [
    "🔄 Loop started",
    formatStatus(instance)
  ];
  if (isApprovalState(String(instance.currentState))) {
    lines.push("", formatApprovalPrompt(instance));
  }
  return lines.join("\n");
}
