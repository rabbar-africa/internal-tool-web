import type { Item, CreateItemPayload } from "@/shared/interface/item";
import { MOCK_ITEMS } from "@/shared/data/mock";

const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

export const getItems = async (): Promise<Item[]> => {
  await delay(300);
  return MOCK_ITEMS;
};

export const createItem = async (payload: CreateItemPayload): Promise<Item> => {
  await delay(500);
  return {
    id: `item-${Date.now()}`,
    code: `ITM-${String(MOCK_ITEMS.length + 1).padStart(3, "0")}`,
    ...payload,
    status: "active",
    createdAt: new Date().toISOString().split("T")[0],
  };
};
