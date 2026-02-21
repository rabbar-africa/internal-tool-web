import type {
  Customer,
  CreateCustomerPayload,
} from "@/shared/interface/customer";
import { MOCK_CUSTOMERS } from "@/shared/data/mock";

const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

export const getCustomers = async (): Promise<Customer[]> => {
  await delay(300);
  return MOCK_CUSTOMERS;
};

export const getCustomerById = async (id: string): Promise<Customer> => {
  await delay(200);
  const customer = MOCK_CUSTOMERS.find((c) => c.id === id);
  if (!customer) throw new Error("Customer not found");
  return customer;
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
