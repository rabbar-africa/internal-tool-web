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
  email: string;
  phone: string;
  type: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  displayName: string;
  firstName: string;
  lastName: string;
  stage: string;

  notes?: string;
}
