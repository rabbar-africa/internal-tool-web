import type { ICustomer } from "./customer";
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

export interface IInvoiceResponse {
  id: string;
  organizationId: string;
  invoiceNumber: string;
  referenceNumber: string;
  customerId: string;
  customerName: string;
  status: string;
  date: string;
  dueDate: string;
  paymentTerms: number;
  paymentTermsLabel: string;
  currencyCode: string;
  exchangeRate: string;
  isInclusiveTax: boolean;
  isDiscountBeforeTax: boolean;
  discountType: string;
  discount: string;
  discountPercent: string;
  subTotal: string;
  taxAmount: string;
  shippingCharge: string;
  adjustment: string;
  roundOff: string;
  total: string;
  balance: string;
  adjustmentDescription: string;
  notes: string;
  terms: string;
  subject: string | null;
  allowPartialPayments: boolean;
  billingAddress: string | null;
  shippingAddress: string | null;
  salesPerson: string | null;
  pricebookId: string | null;
  projectId: string | null;
  expectedPaymentDate: string | null;
  lastPaymentDate: string | null;
  source: string | null;
  externalId: string | null;
  linkedExpenseIds: Array<any>;
  createdAt: string;
  updatedAt: string;
  lineItems: Array<{
    id: string;
    invoiceId: string;
    organizationId: string;
    itemOrder: number;
    itemId: string | null;
    name: string;
    description: string;
    unit: number | null;
    quantity: string;
    rate: string;
    discount: string;
    discountAmount: string;
    taxId: string;
    taxName: string | null;
    taxPercent: string;
    taxAmount: string;
    total: string;
  }>;
  client: ICustomer;
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
  status: InvoiceStatusDto;
  /** Links the invoice to a job card at creation time. */
  jobCardId?: string;
}

export type UpdateInvoicePayload = Partial<CreateInvoicePayload>;

export interface IGetInvoiceFilter extends IBaseFilter {
  status?: string;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface LineItemFormRow {
  itemId: string;
  name: string;
  description: string;
  quantity: string;
  rate: string;
  discount: string;
  unit: string;
}

export interface CreateInvoiceFormValues {
  invoiceNumber: string;
  customerId: string;
  customer: {
    name: string;
    email: string;
  };
  referenceNumber: string;
  date: string;
  dueDate: string;
  paymentTerms: string;
  paymentTermsLabel: string;
  notes: string;
  terms: string;
  discount: string;
  discountType: "entityLevel" | "itemLevel";
  adjustment: string;
  adjustmentDescription: string;
  isDiscountBeforeTax: boolean;
  lineItems: LineItemFormRow[];
  status: InvoiceStatusDto;
}
export enum InvoiceStatusDto {
  DRAFT = "DRAFT",
  SENT = "SENT",
  PAID = "PAID",
  VOID = "VOID",
  OVERDUE = "OVERDUE",
  CLOSED = "CLOSED",
  PARTIALLY_PAID = "PARTIALLY_PAID",
}
