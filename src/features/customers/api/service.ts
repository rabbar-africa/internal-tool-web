import type {
  Customer,
  CreateCustomerPayload,
} from "@/shared/interface/customer";
import { MOCK_CUSTOMERS } from "@/shared/data/mock";
import { axios } from "@/lib/axios";
import { buildUrlWithQueryParams } from "@/utils/build-url-query";

const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

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

export const createCustomer = async (
  payload: CreateCustomerPayload,
): Promise<Customer> => {
  await delay(500);
  return {
    id: `cust-${Date.now()}`,
    code: `C-${String(MOCK_CUSTOMERS.length + 1).padStart(3, "0")}`,
    ...payload,
    status: "active",
    totalInvoices: 0,
    totalRevenue: 0,
    outstandingBalance: 0,
    createdAt: new Date().toISOString().split("T")[0],
  };
};
