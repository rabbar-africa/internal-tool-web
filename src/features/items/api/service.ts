import type { Item, CreateItemPayload } from "@/shared/interface/item";
import { buildUrlWithQueryParams } from "@/utils/build-url-query";
import { axios } from "@/lib/axios";

export interface ItemFilter {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const getItems = async (filter?: ItemFilter) => {
  const baseUrl = "/items";
  const apiUrl = buildUrlWithQueryParams(baseUrl, filter);
  const response = await axios.get(apiUrl);
  return response.data;
};

export const getItemListSimple = async (filter?: ItemFilter) => {
  const baseUrl = "/items/simple";
  const apiUrl = buildUrlWithQueryParams(baseUrl, filter);
  const response = await axios.get(apiUrl);
  return response.data;
};

export const createItem = async (payload: CreateItemPayload): Promise<Item> => {
  const response = await axios.post("/items", payload);
  return response.data;
};

export const getItemById = async (id: string) => {
  const baseUrl = `/items/${id}`;
  const response = await axios.get(baseUrl);
  return response.data;
};
export const updateItem = async (
  id: string,
  payload: Record<string, unknown>,
) => {
  const response = await axios.put(`/items/${id}`, payload);
  return response.data;
};
