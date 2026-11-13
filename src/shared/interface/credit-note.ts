import type { IBaseFilter } from "./filter";
import type { PaymentModeDto } from "./payment";

/**
 * Credit notes: "you owe us less than this invoice said", always made from
 * one invoice, which itself never changes. The credit is then applied to the
 * customer's invoices, refunded, or kept. See the backend's
 * docs/frontend-credit-notes.md.
 *
 * Saved records carry money as decimal strings ("10750"), like invoices; the
 * form's draft and preview carry plain numbers.
 */

export type CreditNoteStatus = "DRAFT" | "OPEN" | "CLOSED" | "VOID";

export type CreditNoteReason =
  | "RETURNED"
  | "NOT_FITTED"
  | "OVERCHARGED"
  | "DISCOUNT"
  | "CANCELLED"
  | "WARRANTY"
  | "OTHER";

export const CREDIT_NOTE_REASON_LABELS: Record<CreditNoteReason, string> = {
  RETURNED: "Returned",
  NOT_FITTED: "Not fitted",
  OVERCHARGED: "Overcharged",
  DISCOUNT: "Discount given",
  CANCELLED: "Job cancelled",
  WARRANTY: "Warranty",
  OTHER: "Other",
};

// ─── The form: GET /invoices/:id/credit-note-draft ─────────────────────────

export interface CreditNoteDraftInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  status: string;
  customerId: string | null;
  customerName: string | null;
  total: number;
  balance: number;
  currencyCode: string;
  shippingCharge: number;
  adjustment: number;
  adjustmentDescription: string | null;
}

export interface CreditNoteDraftLine {
  invoiceLineItemId: string;
  name: string;
  description: string | null;
  quantity: number;
  rate: number;
  amount: number;
  /** Already credited by other credit notes, drafts included. */
  creditedQuantity: number;
  creditedAmount: number;
  /** What is left to credit. 0: credited in full, shown greyed out. */
  creditableQuantity: number;
  creditableAmount: number;
}

export interface CreditNoteDraftNoteRef {
  id: string;
  creditNoteNumber: string;
  date: string;
  status: CreditNoteStatus;
  total: number;
}

export interface CreditNoteDraft {
  invoice: CreditNoteDraftInvoice;
  /** A sentence when the invoice can't be credited: show it, disable Save. */
  refusal: string | null;
  creditNotes: CreditNoteDraftNoteRef[];
  lines: CreditNoteDraftLine[];
  /** Shipping left to credit. */
  shippingCharge: number;
  /** Adjustment left to credit, same sign as the invoice's. */
  adjustment: number;
  /** The invoice total not yet credited. */
  total: number;
  /** Already credited by other notes. */
  credited: number;
}

// ─── Create, preview, edit ─────────────────────────────────────────────────

export interface CreditNoteLineInput {
  invoiceLineItemId: string;
  quantity: number;
  /** Optional: defaults to the invoice's rate. Lower credits part of a price. */
  rate?: number;
}

/** What create, preview and edit share. */
export interface CreditNoteFields {
  date?: string;
  reason?: CreditNoteReason;
  reasonNote?: string | null;
  notes?: string | null;
  terms?: string | null;
  referenceNumber?: string;
  templateId?: string | null;
  lines?: CreditNoteLineInput[];
  shippingCharge?: number;
  adjustment?: number;
}

export interface CreateCreditNotePayload extends CreditNoteFields {
  invoiceId: string;
  /** Default true: applied to its invoice, as much as it still owes. */
  applyToInvoice?: boolean;
  /** DRAFT saves it unissued. Default OPEN. */
  status?: "DRAFT" | "OPEN";
  /** Only when the series isn't automatic. */
  creditNoteNumber?: string;
}

export type UpdateCreditNotePayload = CreditNoteFields;

/** The form's totals: create's body, plus the note being edited, if any. */
export interface PreviewCreditNotePayload extends CreateCreditNotePayload {
  creditNoteId?: string;
}

/** POST /credit-notes/preview: the money exactly as it will be saved. */
export interface CreditNotePreviewLine {
  invoiceLineItemId: string;
  name: string;
  quantity: number;
  rate: number;
  discount: number | string | null;
  discountAmount: number;
  taxName: string | null;
  taxPercent: number;
  taxAmount: number;
  total: number;
}

export interface CreditNotePreview {
  lines: CreditNotePreviewLine[];
  subTotal: number;
  discount: number;
  taxAmount: number;
  shippingCharge: number;
  adjustment: number;
  roundOff: number;
  total: number;
  /** This note takes exactly what the invoice has left. */
  completesInvoice: boolean;
}

// ─── The credit note: GET /credit-notes/:id ────────────────────────────────

export interface CreditNoteLineItem {
  id: string;
  invoiceLineItemId: string | null;
  name: string;
  description: string | null;
  quantity: string;
  rate: string;
  discount: string | null;
  discountAmount: string;
  taxName: string | null;
  taxPercent: string;
  taxAmount: string;
  total: string;
}

export interface CreditNoteInvoiceRef {
  id: string;
  invoiceNumber: string;
  date?: string;
  status?: string;
  total?: string;
  balance?: string;
}

export interface CreditNoteClient {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  displayName: string | null;
  company: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface CreditApplication {
  id: string;
  amount: string;
  date: string;
  createdAt?: string;
  invoice: {
    id: string;
    invoiceNumber: string;
    status: string;
    balance: string;
  };
}

export interface CreditRefundAccount {
  id: string;
  name?: string | null;
  bankName?: string | null;
  accountName?: string | null;
  accountNumber?: string | null;
  type?: string | null;
}

export interface CreditRefund {
  id: string;
  date: string;
  amount: string;
  mode: PaymentModeDto;
  referenceNumber: string | null;
  notes: string | null;
  createdAt?: string;
  account: CreditRefundAccount | null;
}

export interface ICreditNote {
  id: string;
  creditNoteNumber: string;
  referenceNumber: string | null;
  status: CreditNoteStatus;
  date: string;
  reason: CreditNoteReason;
  reasonNote: string | null;
  invoiceId: string;
  customerId: string | null;
  customerName: string | null;
  vehicleId: string | null;
  jobCardId: string | null;
  currencyCode: string;
  isInclusiveTax?: boolean;
  taxName?: string | null;
  taxPercent?: string | null;
  subTotal: string;
  discount: string;
  taxAmount: string;
  shippingCharge: string;
  adjustment: string;
  roundOff: string;
  total: string;
  amountApplied: string;
  amountRefunded: string;
  /** Credit left to apply or refund. */
  balance: string;
  notes: string | null;
  terms: string | null;
  templateId: string | null;
  voidedAt: string | null;
  createdAt: string;
  /** Detail only. */
  lineItems?: CreditNoteLineItem[];
  invoice?: CreditNoteInvoiceRef;
  client?: CreditNoteClient | null;
  jobCard?: { id: string; jobNumber: string; status: string } | null;
  applications?: CreditApplication[];
  refunds?: CreditRefund[];
}

// ─── Using the credit ──────────────────────────────────────────────────────

export interface ApplyCreditPayload {
  /** All applied or none. */
  applications: { invoiceId: string; amount: number; date?: string }[];
}

export interface RefundCreditNotePayload {
  amount: number;
  date?: string;
  /** Default CASH. */
  mode?: PaymentModeDto;
  /** The account the money left from. Left out: Cash for cash, else primary. */
  accountId?: string;
  referenceNumber?: string;
  notes?: string;
}

// ─── The list: GET /credit-notes ───────────────────────────────────────────

export interface IGetCreditNoteFilter extends IBaseFilter {
  status?: CreditNoteStatus;
  customerId?: string;
  invoiceId?: string;
}

// ─── A customer's open credit: GET /clients/:id/credit ─────────────────────

export interface CustomerCredit {
  creditNotes: {
    id: string;
    creditNoteNumber: string;
    date: string;
    total: string;
    balance: string;
    invoice: { id: string; invoiceNumber: string };
  }[];
  payments: {
    id: string;
    paymentNumber: string;
    date: string;
    amount: string;
    unusedAmount: string;
  }[];
  creditNotesTotal: number;
  paymentsTotal: number;
  total: number;
}
