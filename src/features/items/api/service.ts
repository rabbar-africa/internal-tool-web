import type { Item, CreateItemPayload } from "@/shared/interface/item";
import type { IBaseFilter } from "@/shared/interface/filter";
import { buildUrlWithQueryParams } from "@/utils/build-url-query";
import { axios } from "@/lib/axios";

export const getItems = async (filter?: IBaseFilter) => {
  const baseUrl = "/items";
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
