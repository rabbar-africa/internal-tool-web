export type ItemType = "product" | "service";
export type ItemStatus = "active" | "inactive";

export interface Item {
  id: string;
  code: string;
  name: string;
  rate?: string;
  description?: string;
  type: ItemType;
  unit: string;
  unitPrice: number;
  taxRate: number;
  status: ItemStatus;
  createdAt: string;
}

export type ProductTypeDto = "PRODUCT" | "SERVICE";
export type ItemStatusDto = "ACTIVE" | "INACTIVE";

export interface CreateItemPayload {
  name: string;
  description?: string;
  rate?: number;
  purchaseRate?: number;
  productType?: ProductTypeDto;
  unit?: string;
  status?: ItemStatusDto;
  sellable?: boolean;
  purchasable?: boolean;
  trackInventory?: boolean;
  source?: string;
  externalId?: string;
}
