import type { Vehicle } from "@/features/customers/api/service";
import type { ICustomer } from "./customer";
import type { IBaseFilter } from "./filter";
import type { PaymentModeDto } from "./payment";
import type { IAccountRef } from "./settings";

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "paid"
  | "overdue"
  | "partial"
  | "cancelled";

/** Why a payment stays when its invoice is deleted, even if asked to delete it. */
export type PaymentKeptBecause = "OTHER_INVOICES" | "REFUNDED" | "HAS_CREDIT";

/** What deleting an invoice would touch: GET /invoices/:id/delete-impact. */
export interface IInvoiceDeleteImpact {
  invoice: {
    id: string;
    invoiceNumber: string;
    currencyCode?: string;
    jobCard?: { id: string; jobNumber: string } | null;
  };
  payments: Array<{
    id: string;
    paymentNumber: string;
    date: string;
    amount: number;
    appliedHere: number;
    account: string | null;
    otherInvoiceNumbers: string[];
    keptBecause: PaymentKeptBecause | null;
  }>;
  expenses: Array<{
    id: string;
    expenseNumber: string;
    name: string;
    amount: number;
    date: string;
    account: string | null;
  }>;
  /** The newer invoice this one's balance is brought forward onto. */
  carriedOnto: { id: string; invoiceNumber: string } | null;
  /** Older invoices brought forward onto this one. */
  carries: Array<{ id: string; invoiceNumber: string }>;
  /**
   * Credit notes made from this invoice (void ones left out). They stay, and
   * still name it: their credit can go on another invoice or be refunded.
   */
  creditNotes?: Array<{
    id: string;
    creditNoteNumber: string;
    date: string;
    status: string;
    total: number;
    balance: number;
  }>;
  /** Credit applied here. It goes back to its credit notes as open credit. */
  creditsApplied?: Array<{
    id: string;
    amount: number;
    date: string;
    creditNote: { id: string; creditNoteNumber: string };
  }>;
  /** What this person may also delete. */
  can: { deletePayments: boolean; deleteExpenses: boolean };
}

export interface DeleteInvoiceOptions {
  deletePayments?: boolean;
  deleteExpenses?: boolean;
}

export interface LineItem {
  id: string;
  itemId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  lineTotal: number;
}

/**
 * A prior unpaid invoice whose balance rides on a newer invoice. The newer
 * invoice's own `total` never absorbs this amount — it stays a receivable on
 * the original document and is settled first when a payment comes in.
 */
export interface CarriedInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string | null;
  total: string;
  balance: string;
  status: string;
}

/** The link row joining a newer invoice to the prior invoice it carries. */
export interface InvoiceCarry {
  id: string;
  invoiceId: string;
  carriedInvoiceId: string;
  createdAt: string;
  carriedInvoice: CarriedInvoice;
}

/** A credit note made from an invoice, as the invoice's detail lists it. */
export interface InvoiceCreditNoteRef {
  id: string;
  creditNoteNumber: string;
  date: string;
  status: "DRAFT" | "OPEN" | "CLOSED" | "VOID";
  reason?: string;
  total: string;
  balance: string;
}

/** Credit applied to an invoice, from any of the customer's credit notes. */
export interface InvoiceCreditApplication {
  id: string;
  amount: string;
  date: string;
  creditNote: { id: string; creditNoteNumber: string };
}

export interface IInvoiceResponse {
  id: string;
  organizationId: string;
  invoiceNumber: string;
  referenceNumber: string;
  customerId: string;
  customerName: string;
  vehicleId?: string | null;
  vehicle?: Vehicle | null;
  /** Whole-job tax: the orgTaxes id, with a snapshot of its name and rate. */
  taxId?: string | null;
  taxName?: string | null;
  taxPercent?: string | number | null;
  /** The job card this invoice belongs to. */
  jobCardId?: string | null;
  /** The account printed for the customer to pay into; null → the primary. */
  bankAccountId?: string | null;
  bankAccount?: IAccountRef | null;
  /** The chosen template; null → the organization's default. */
  templateId?: string | null;
  /** How this invoice looks, already resolved by the API. Read it with normalizeInvoiceDesign. */
  design?: unknown;
  /** What was saved. The edit form sends this back; show `displayStatus`. */
  status: string;
  /** The status to show: Overdue is worked out from the due date, never saved. */
  displayStatus?: string;
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
  /**
   * Credit applied to this invoice from credit notes (any of the customer's).
   * Total − payments − credited = balance. Older APIs leave it out.
   */
  creditedAmount?: string;
  /** Credit notes made from this invoice. */
  creditNotes?: InvoiceCreditNoteRef[];
  /** Credit applied to this invoice, from any note. */
  creditApplications?: InvoiceCreditApplication[];
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
  /** Link rows for prior unpaid invoices brought forward onto this one. */
  carries?: InvoiceCarry[];
  /** `carries` flattened to the carried invoices themselves. */
  broughtForward?: CarriedInvoice[];
  /** Sum of the brought-forward balances. NOT included in `total`. */
  broughtForwardTotal?: number;
  /** `balance` + `broughtForwardTotal` — what the customer actually owes now. */
  totalDueNow?: number;
  /** The quote this invoice was made from. */
  quotation?: { id: string; quotationNumber: string; date: string } | null;
}

/**
 * Records a payment against an invoice, settling any balances brought forward
 * onto it first (oldest first) before the invoice's own balance. Omit
 * `allocations` to let the server do that split.
 */
export interface CollectInvoicePaymentPayload {
  amount: number;
  date: string;
  mode?: PaymentModeDto;
  referenceNumber?: string;
  notes?: string;
  /** Omitted → the account on the invoices paid, when they agree, else the primary. */
  depositToAccountId?: string;
  allocations?: Array<{ invoiceId: string; amountApplied: number }>;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  vehicleId?: string | null;
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
  /** The status to show: Overdue is worked out from the due date, never saved. */
  displayStatus?: string;
  linkedExpenseIds: string[];
  totalLinkedExpenses: number;
  profit: number;
  marginPercent: number;
  notes?: string;
  createdAt: string;
}

export interface CreateLineItemPayload {
  /** The saved item, when editing: its recorded costs stay with it. */
  id?: string;
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
  vehicleId?: string | null;
  /**
   * Whole-job tax — an orgTaxes id, charged once after discounts. `null`
   * clears it on update. Not allowed alongside per-line taxIds.
   */
  taxId?: string | null;
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
  /**
   * Bank account printed for the customer to pay into (never Cash). Omitted →
   * the primary; `null` on update moves it back to the primary.
   */
  bankAccountId?: string | null;
  /** The template to use; `null` moves it back to the organization's default. */
  templateId?: string | null;
}

export type UpdateInvoicePayload = Partial<CreateInvoicePayload>;

export interface IGetInvoiceFilter extends IBaseFilter {
  status?: string;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface LineItemFormRow {
  /** The saved item, when editing; new rows have none. */
  id?: string;
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
  vehicleId?: string;
  /** Whole-job tax (orgTaxes id); "" means no tax. */
  taxId: string;
  /** Account to pay into; "" means the org's primary. */
  bankAccountId: string;
  /** Template to use; "" means the organization's default. */
  templateId: string;
  customer: {
    name: string;
    email: string;
  };
  referenceNumber: string;
  date: string;
  dueDate: string;
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
// Mirrors the backend InvoiceStatus enum exactly (values are sent/received
// verbatim). Keep in sync with it.
export enum InvoiceStatusDto {
  DRAFT = "DRAFT",
  SENT = "SENT",
  PAID = "PAID",
  VOID = "VOID",
  OVERDUE = "OVERDUE",
  CLOSED = "CLOSED",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  WRITTEN_OFF = "WRITTEN_OFF",
  DELETED = "DELETED",
}
