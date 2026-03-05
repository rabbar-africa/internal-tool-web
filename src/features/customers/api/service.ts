import type { CreateCustomerPayload } from "@/shared/interface/customer";
import { axios } from "@/lib/axios";
import { buildUrlWithQueryParams } from "@/utils/build-url-query";

export interface CustomerFilter {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  stage?: string;
}

export const getCustomers = async (filter?: CustomerFilter) => {
  const baseUrl = "/clients";
  const apiUrl = buildUrlWithQueryParams(baseUrl, filter);
  const response = await axios.get(apiUrl);
  return response.data;
};

export const getCustomerById = async (id: string) => {
  const baseUrl = `/clients/${id}`;
  const response = await axios.get(baseUrl);
  return response.data;
};

export const createCustomer = async (payload: CreateCustomerPayload) => {
  const response = await axios.post("/clients", payload);
  return response.data;
};

export const updateCustomer = async (
  id: string,
  payload: Partial<CreateCustomerPayload>,
) => {
  const response = await axios.put(`/clients/${id}`, payload);
  return response.data;
};
