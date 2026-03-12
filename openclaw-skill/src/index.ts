import { handleApprove, handleReject } from "./handlers/approve";
import { handleGetStatus } from "./handlers/get-status";
import { handleStartLoop } from "./handlers/start-loop";
import { handleTransition } from "./handlers/transition";
import { getLoopDefinitions } from "./lib/engine";
import type { OpenClawContext } from "./types";

export type { OpenClawContext } from "./types";

export async function handleCommand(input: string, ctx: OpenClawContext): Promise<string> {
  const command = input.trim();

  if (command.toLowerCase() === "list loops") {
    const loops = getLoopDefinitions().map((definition) => String(definition.id));
    return loops.length > 0 ? `Available loops:\n- ${loops.join("\n- ")}` : "No loops are registered.";
  }

  const startMatch = /^start loop\s+(.+)$/i.exec(command);
  if (startMatch?.[1]) {
    return handleStartLoop(startMatch[1].trim(), ctx);
  }

  const transitionMatch = /^transition\s+(\S+)\s+(\S+)$/i.exec(command);
  if (transitionMatch?.[1] && transitionMatch[2]) {
    return handleTransition(transitionMatch[1], transitionMatch[2], ctx);
  }

  const approveMatch = /^approve\s+(\S+)$/i.exec(command);
  if (approveMatch?.[1]) {
    return handleApprove(approveMatch[1], ctx);
  }

  const rejectMatch = /^reject\s+(\S+)$/i.exec(command);
  if (rejectMatch?.[1]) {
    return handleReject(rejectMatch[1], ctx);
  }

  const statusMatch = /^status\s+(\S+)$/i.exec(command);
  if (statusMatch?.[1]) {
    return handleGetStatus(statusMatch[1]);
  }

  return `Unknown command: ${input}`;
}
