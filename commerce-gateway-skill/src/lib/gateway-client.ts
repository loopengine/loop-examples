export interface InventoryRecord {
  sku: string;
  currentStock: number;
  reorderPoint: number;
  leadTimeDays?: number;
  requestId?: string;
}

export interface DemandForecast {
  sku: string;
  forecastedDemand: number;
  confidence: number;
  horizonDays?: number;
  requestId?: string;
}

export interface Supplier {
  id: string;
  sku: string;
  unitCost: number;
  leadTimeDays: number;
  requestId?: string;
}

export interface PORequest {
  sku: string;
  qty: number;
  supplierId: string;
  expectedUnitCost?: number;
}

export interface PORecord {
  id: string;
  sku: string;
  qty: number;
  supplierId: string;
  status: string;
  requestId?: string;
}

export class CommerceGatewayClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;

  constructor(options?: { baseUrl?: string; apiKey?: string }) {
    const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
    this.baseUrl = options?.baseUrl ?? env?.COMMERCE_GATEWAY_URL ?? "https://commercegateway.io/api";
    this.apiKey = options?.apiKey ?? env?.COMMERCE_GATEWAY_API_KEY;
  }

  // Read endpoints used by AI actor.
  async getInventory(sku: string): Promise<InventoryRecord> {
    return this.request<InventoryRecord>(`/inventory/${encodeURIComponent(sku)}`, { method: "GET" });
  }

  async getDemandForecast(sku: string): Promise<DemandForecast> {
    return this.request<DemandForecast>(`/demand-forecast/${encodeURIComponent(sku)}`, { method: "GET" });
  }

  async getSuppliers(sku: string): Promise<Supplier[]> {
    return this.request<Supplier[]>(`/suppliers/${encodeURIComponent(sku)}`, { method: "GET" });
  }

  // Write endpoint called only by post-approval automation actor.
  async createPurchaseOrder(order: PORequest): Promise<PORecord> {
    return this.request<PORecord>("/purchase-orders", {
      method: "POST",
      body: JSON.stringify(order)
    });
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const url = `${this.baseUrl.replace(/\/$/, "")}${path}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (this.apiKey) headers.Authorization = `Bearer ${this.apiKey}`;
    const response = await fetch(url, {
      ...init,
      headers: {
        ...headers,
        ...(init.headers as Record<string, string> | undefined)
      }
    });
    if (!response.ok) {
      throw new Error(`Commerce Gateway request failed: ${response.status} ${response.statusText}`);
    }
    const payload = (await response.json()) as T;
    const requestId = response.headers.get("x-request-id");
    if (requestId && payload && typeof payload === "object") {
      (payload as Record<string, unknown>).requestId = requestId;
    }
    return payload;
  }
}
