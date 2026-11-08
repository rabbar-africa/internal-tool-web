import type { Vehicle } from "@/features/customers/api/service";
import type { IBaseFilter } from "./filter";
import type { CreateInvoicePayload } from "./invoice";

/** What is saved. Show `displayStatus` instead. */
export type QuotationStatus =
  | "DRAFT"
  | "SENT"
  | "ACCEPTED"
  | "DECLINED"
  | "INVOICED"
  | "VOID";

/** What to show: EXPIRED is worked out from the expiry date, never saved. */
export type QuotationDisplayStatus = QuotationStatus | "EXPIRED";

/** The invoice a quote was made into. */
export interface QuotationInvoiceRef {
  id: string;
  invoiceNumber: string;
  /** The invoice's own status; DELETED or VOID means the quote can be invoiced again. */
  status: string;
  total: string;
  date: string;
}

export interface QuotationLineItem {
  id: string;
  quotationId: string;
  itemOrder: number;
  itemId: string | null;
  name: string;
  description: string | null;
  unit: string | null;
  quantity: string;
  rate: string;
  discount: string | null;
  discountAmount: string;
  taxId: string | null;
  taxName: string | null;
  taxPercent: string;
  taxAmount: string;
  total: string;
}

export interface IQuotation {
  id: string;
  organizationId: string;
  quotationNumber: string;
  referenceNumber: string | null;
  customerId: string | null;
  customerName: string | null;
  vehicleId: string | null;
  jobCardId: string | null;
  status: QuotationStatus;
  displayStatus: QuotationDisplayStatus;
  date: string;
  /** "Valid until". Null: the quote never expires. */
  expiryDate: string | null;
  currencyCode: string;
  isInclusiveTax: boolean;
  isDiscountBeforeTax: boolean;
  discountType: string;
  discount: string;
  discountPercent: string;
  taxId: string | null;
  taxName: string | null;
  taxPercent: string;
  subTotal: string;
  taxAmount: string;
  shippingCharge: string;
  adjustment: string;
  adjustmentDescription: string | null;
  roundOff: string;
  total: string;
  notes: string | null;
  terms: string | null;
  subject: string | null;
  templateId: string | null;
  sentAt: string | null;
  acceptedAt: string | null;
  declinedAt: string | null;
  declineReason: string | null;
  invoiceId: string | null;
  convertedAt: string | null;
  source: string | null;
  createdAt: string;
  updatedAt: string;
  lineItems: QuotationLineItem[];
  client: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    displayName: string;
    company: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  vehicle: Vehicle | null;
  jobCard: { id: string; jobNumber: string; status: string } | null;
  invoice: QuotationInvoiceRef | null;
}

export interface IGetQuotationFilter extends IBaseFilter {
  search?: string;
  /** Any display status, EXPIRED included. */
  status?: string;
  customerId?: string;
  vehicleId?: string;
  jobCardId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface QuotationSummary {
  byStatus: Array<{
    status: QuotationDisplayStatus;
    count: number;
    amount: number;
  }>;
}

/**
 * The invoice body, less what a quote can't have: payment terms, a due date,
 * a bank account, a status or old balances.
 */
export type CreateQuotationPayload = Omit<
  CreateInvoicePayload,
  | "invoiceNumber"
  | "dueDate"
  | "paymentTerms"
  | "paymentTermsLabel"
  | "bankAccountId"
  | "status"
> & {
  quotationNumber: string;
  /** Left out on create: 30 days after `date`. Null: never expires. */
  expiryDate?: string | null;
};

export type UpdateQuotationPayload = Partial<CreateQuotationPayload>;

export interface ConvertQuotationPayload {
  date?: string;
  dueDate?: string;
  bankAccountId?: string;
}

export interface ConvertQuotationResult {
  invoice: { id: string; invoiceNumber: string };
  quotation: IQuotation;
  /** A tax rate changed since the quote: the invoice uses today's rate. */
  taxChanged: boolean;
}
