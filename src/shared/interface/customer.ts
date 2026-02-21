export type CustomerType = "individual" | "company";
export type CustomerStatus = "active" | "inactive";

export interface Customer {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  type: CustomerType;
  status: CustomerStatus;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  totalInvoices: number;
  totalRevenue: number;
  outstandingBalance: number;
  createdAt: string;
}

export interface CreateCustomerPayload {
  name: string;
  email: string;
  phone: string;
  type: CustomerType;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  notes?: string;
}
