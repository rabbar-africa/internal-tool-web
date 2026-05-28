import type { IBaseFilter } from "./filter";

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "paid"
  | "overdue"
  | "partial"
  | "cancelled";

export interface LineItem {
  id: string;
  itemId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  lineTotal: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  issueDate: string;
  dueDate: string;
  lineItems: LineItem[];
  subtotal: number;
  taxTotal: number;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  status: InvoiceStatus;
  linkedExpenseIds: string[];
  totalLinkedExpenses: number;
  profit: number;
  marginPercent: number;
  notes?: string;
  createdAt: string;
}

export interface CreateLineItemPayload {
  itemOrder: number;
  itemId?: string;
  name: string;
  description: string;
  rate: string;
  quantity: string;
  discount: string;
  unit?: string;
}

export type DiscountType = "entityLevel" | "itemLevel";

export interface CreateInvoicePayload {
  invoiceNumber: string;
  referenceNumber: string;
  customerId: string;
  customer: {
    name: string;
    email: string;
  };
  date: string;
  dueDate: string;
  paymentTerms: number;
  paymentTermsLabel: string;
  notes: string;
  terms: string;
  lineItems: CreateLineItemPayload[];
  isDiscountBeforeTax: boolean;
  discount: string;
  discountType: DiscountType;
  adjustment: string;
  adjustmentDescription: string;
}

export interface IGetInvoiceFilter extends IBaseFilter {
  status?: string;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
}
