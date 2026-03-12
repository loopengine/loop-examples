import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { aggregateId, transitionId } from "@loop-engine/core";
import type { LoopEngine } from "@loop-engine/runtime";
import type { CommerceGatewayClient, DemandForecast, InventoryRecord, Supplier } from "../lib/gateway-client";

export interface ProcurementSignal {
  sku: string;
  signalType: string;
  observedDemandIncreasePct?: number;
}

export interface CommerceGatewayEvidence {
  recommendedSku: string;
  recommendedQty: number;
  estimatedCost: number;
  supplierId: string;
  confidence: number;
  rationale: string;
  gatewayQueryIds: string[];
  modelUsed: "claude-sonnet-4-20250514" | "gpt-4o";
  timestamp: string;
}

type LlmProvider = "claude" | "openai";

type Recommendation = {
  recommendedQty: number;
  supplierId: string;
  confidence: number;
  rationale: string;
};

function readEnv(name: string): string | undefined {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  return env?.[name];
}

export interface CommerceGatewayActorOptions {
  gatewayClient: CommerceGatewayClient;
  llmProvider: LlmProvider;
  anthropicApiKey?: string;
  openaiApiKey?: string;
}

export async function runProcurementRecommendation(
  options: CommerceGatewayActorOptions & {
    engine: LoopEngine;
    instanceId: string;
    signal: ProcurementSignal;
    actorId: string;
  }
): Promise<CommerceGatewayEvidence> {
  const inventory = await options.gatewayClient.getInventory(options.signal.sku);
  const forecast = await options.gatewayClient.getDemandForecast(options.signal.sku);
  const suppliers = await options.gatewayClient.getSuppliers(options.signal.sku);
  const recommendation = await generateRecommendation(
    options.llmProvider,
    { inventory, forecast, suppliers, signal: options.signal },
    {
      anthropicApiKey: options.anthropicApiKey,
      openaiApiKey: options.openaiApiKey
    }
  );

  const cheapest = suppliers.find((supplier) => supplier.id === recommendation.supplierId) ?? suppliers[0];
  if (!cheapest) throw new Error(`No supplier options returned for ${options.signal.sku}`);

  const evidence: CommerceGatewayEvidence = {
    recommendedSku: options.signal.sku,
    recommendedQty: recommendation.recommendedQty,
    estimatedCost: recommendation.recommendedQty * cheapest.unitCost,
    supplierId: recommendation.supplierId,
    confidence: recommendation.confidence,
    rationale: recommendation.rationale,
    gatewayQueryIds: [inventory.requestId, forecast.requestId, ...suppliers.map((item) => item.requestId)].filter(
      (value): value is string => Boolean(value)
    ),
    modelUsed: options.llmProvider === "claude" ? "claude-sonnet-4-20250514" : "gpt-4o",
    timestamp: new Date().toISOString()
  };

  await options.engine.transition({
    aggregateId: aggregateId(options.instanceId),
    transitionId: transitionId("recommend"),
    actor: { type: "ai-agent", id: options.actorId as never },
    evidence: {
      ...evidence,
      _confidence: evidence.confidence
    }
  });

  return evidence;
}

async function generateRecommendation(
  provider: LlmProvider,
  input: { inventory: InventoryRecord; forecast: DemandForecast; suppliers: Supplier[]; signal: ProcurementSignal },
  keys: { anthropicApiKey?: string; openaiApiKey?: string }
): Promise<Recommendation> {
  if (provider === "claude") {
    const client = new Anthropic({ apiKey: keys.anthropicApiKey ?? readEnv("ANTHROPIC_API_KEY") });
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system:
        "You are a procurement analyst. Analyze inventory data and return strict JSON with keys recommendedQty, supplierId, confidence, rationale.",
      messages: [
        {
          role: "user",
          content: JSON.stringify(input)
        }
      ]
    });
    const text = response.content.find((block) => block.type === "text");
    if (!text || text.type !== "text") throw new Error("Claude returned no text output");
    return parseRecommendation(text.text);
  }

  const client = new OpenAI({ apiKey: keys.openaiApiKey ?? readEnv("OPENAI_API_KEY") });
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are a procurement analyst. Analyze inventory data and return JSON with keys recommendedQty, supplierId, confidence, rationale."
      },
      { role: "user", content: JSON.stringify(input) }
    ]
  });
  const content = response.choices[0]?.message.content;
  if (!content) throw new Error("OpenAI returned empty response");
  return parseRecommendation(content);
}

function parseRecommendation(json: string): Recommendation {
  const parsed = JSON.parse(json) as Recommendation;
  if (
    typeof parsed.recommendedQty !== "number" ||
    typeof parsed.supplierId !== "string" ||
    typeof parsed.confidence !== "number" ||
    typeof parsed.rationale !== "string"
  ) {
    throw new Error("LLM recommendation schema invalid");
  }
  return parsed;
}
