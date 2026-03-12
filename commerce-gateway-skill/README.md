# Commerce Gateway skill example

Loop Engine and LLM Commerce Gateway integrate to let AI query live commerce data, generate recommendations, and require human approval before write operations execute.

## What is included

- `procurement.loop`: full implementation with governed approval and post-approval order placement.
- `pricing.change`: loop definition with actor stubs.
- `inventory.adjustment`: loop definition with actor stubs.

## Read/write boundary

- AI actor (`runProcurementRecommendation`) calls **read-only** Commerce Gateway endpoints:
  - `GET /inventory/:sku`
  - `GET /demand-forecast/:sku`
  - `GET /suppliers/:sku`
- Automation actor (`executeApprovedPurchaseOrder`) performs the write:
  - `POST /purchase-orders`
- Human actor is the only actor allowed to execute `approve_order` and `reject_order`.

## Usage

```ts
import { getLoopSystem, CommerceGatewayClient } from "./src/index";

const gatewayClient = new CommerceGatewayClient({
  baseUrl: process.env.COMMERCE_GATEWAY_URL,
  apiKey: process.env.COMMERCE_GATEWAY_API_KEY
});

const { engine } = await getLoopSystem();
```

## Actor implementation status

Pricing and inventory adjustment actor implementations are pending. See docs for roadmap callouts.

## Links

- https://loopengine.io/docs/examples/commerce-gateway
- https://commercegateway.io/docs
