export type ItemType = "product" | "service";
export type ItemStatus = "active" | "inactive";

export interface Item {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: ItemType;
  unit: string;
  unitPrice: number;
  taxRate: number;
  status: ItemStatus;
  createdAt: string;
}

export interface CreateItemPayload {
  name: string;
  description?: string;
  type: ItemType;
  unit: string;
  unitPrice: number;
  taxRate: number;
}
