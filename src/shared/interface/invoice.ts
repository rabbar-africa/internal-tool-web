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

export interface CreateInvoicePayload {
  customerId: string;
  issueDate: string;
  dueDate: string;
  lineItems: Omit<LineItem, "id" | "lineTotal">[];
  notes?: string;
}
