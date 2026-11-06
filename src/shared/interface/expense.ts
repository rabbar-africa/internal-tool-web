import type { IBaseFilter } from "./filter";
import { PaymentModeDto } from "./payment";
import type { IAccountRef } from "./settings";

export type ExpenseCategory =
  | "PARTS"
  | "SUBLET"
  | "CONSUMABLES"
  | "LABOR"
  | "TOWING"
  | "FEES"
  | "OTHER";

/**
 * The vehicle an expense was for. It comes from what the expense is linked to,
 * the invoice first, then the job card, so any field can be missing.
 */
export interface ExpenseVehicle {
  /** Null when only the job card's copy of the details is left. */
  id: string | null;
  make: string | null;
  model: string | null;
  year: number | null;
  registrationNumber: string | null;
  vin: string | null;
  color: string | null;
  source: "INVOICE" | "JOB_CARD";
}

export interface Expense {
  id: string;
  organizationId: string;
  expenseNumber: string;
  jobCardId: string | null;
  date: string;
  category: ExpenseCategory;
  name: string;
  description?: string | null;
  vendorName?: string | null;
  itemId?: string | null;
  /** Decimal strings from the API — parse with Number() before math. */
  quantity: string;
  unitCost: string;
  amount: string;
  paymentMode?: PaymentModeDto | null;
  /** The org account the money left; null only if the org had none. */
  paidThroughAccountId?: string | null;
  paidThroughAccount?: IAccountRef | null;
  currencyCode: string;
  fileUrl?: string | null;
  fileName?: string | null;
  fileType?: string | null;
  fileSize?: number | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  jobCard?: { id: string; jobNumber: string } | null;
  item?: { id: string; name: string } | null;
  /** What it was spent for; the job card then follows the invoice's. */
  invoiceId?: string | null;
  invoiceLineItemId?: string | null;
  invoice?: { id: string; invoiceNumber: string } | null;
  invoiceLineItem?: { id: string; name: string } | null;
  /** Set when it covers several items bought for one price; then `invoiceLineItem` is null. */
  sharedLines?: Array<{ id: string; name: string }>;
  vehicle?: ExpenseVehicle | null;
}

export interface CreateExpensePayload {
  date: string;
  name: string;
  description?: string;
  category?: ExpenseCategory;
  jobCardId?: string;
  /**
   * The invoice it was spent for. The expense takes that invoice's job card
   * (sending a different one is a 400). `null` on update unlinks it.
   */
  invoiceId?: string | null;
  /** One line of that invoice (implies `invoiceId`). */
  invoiceLineItemId?: string | null;
  /**
   * Every line it was spent for, replacing what it covered: two or more were
   * bought together for one price, one is the same as `invoiceLineItemId`,
   * none leaves it on the invoice for no item. Not with `invoiceLineItemId`.
   */
  invoiceLineItemIds?: string[];
  vendorName?: string;
  itemId?: string;
  quantity?: number;
  unitCost?: number;
  amount?: number;
  paymentMode?: PaymentModeDto;
  /**
   * Omitted → Cash for cash, else the org's primary. On update, `null` moves
   * it back to that default.
   */
  paidThroughAccountId?: string | null;
  currencyCode?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  notes?: string;
  expenseNumber?: string;
}

export type UpdateExpensePayload = Partial<CreateExpensePayload>;

export interface IGetExpenseFilter extends IBaseFilter {
  jobCardId?: string;
  category?: string;
  paidThroughAccountId?: string;
  invoiceId?: string;
}

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  PARTS: "Parts",
  SUBLET: "Sublet Work",
  CONSUMABLES: "Consumables",
  LABOR: "Labor",
  TOWING: "Towing",
  FEES: "Fees",
  OTHER: "Other",
};

export const EXPENSE_CATEGORY_OPTIONS = (
  Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[]
).map((value) => ({ label: EXPENSE_CATEGORY_LABELS[value], value }));

export const PAYMENT_MODE_LABELS: Record<PaymentModeDto, string> = {
  [PaymentModeDto.CASH]: "Cash",
  [PaymentModeDto.BANK_TRANSFER]: "Bank Transfer",
  [PaymentModeDto.CARD]: "Card",
  [PaymentModeDto.MOBILE_MONEY]: "Mobile Money",
  [PaymentModeDto.CHEQUE]: "Cheque",
  [PaymentModeDto.ONLINE]: "Online",
  [PaymentModeDto.OTHER]: "Other",
};

export const PAYMENT_MODE_OPTIONS = (
  Object.keys(PAYMENT_MODE_LABELS) as PaymentModeDto[]
).map((value) => ({ label: PAYMENT_MODE_LABELS[value], value }));

// ─── Invoice costs ───────────────────────────────────────────────────────────

/** An expense as the invoice-costs view lists it (amount already a number). */
export interface InvoiceCostExpense {
  id: string;
  expenseNumber: string;
  date: string;
  name: string;
  category: ExpenseCategory;
  vendorName: string | null;
  amount: number;
  invoiceLineItemId: string | null;
}

/** What an invoice cost against what it billed, line by line. */
export interface InvoiceCosts {
  invoiceId: string;
  invoiceNumber: string;
  jobCardId: string | null;
  invoiceTotal: number;
  lines: Array<{
    invoiceLineItemId: string;
    name: string;
    /** The line before tax. */
    billed: number;
    spent: number;
    margin: number;
    expenses: InvoiceCostExpense[];
  }>;
  /**
   * Items bought together for one price. There's no spent or margin per item,
   * and these items are not in `lines` as well.
   */
  shared?: Array<{
    lines: Array<{ invoiceLineItemId: string; name: string; billed: number }>;
    billed: number;
    spent: number;
    margin: number;
    expenses: InvoiceCostExpense[];
  }>;
  /** Costs not tied to a current line: other costs, or removed items. */
  other: { spent: number; expenses: InvoiceCostExpense[] };
  totals: { billed: number; spent: number; margin: number };
}

/**
 * Costs spent on an invoice, recorded together. Additive: each save adds
 * expenses and never replaces earlier ones. Top-level fields apply to every
 * expense unless a line overrides them.
 */
export interface RecordInvoiceCostsPayload {
  date: string;
  paymentMode?: PaymentModeDto;
  /** Omitted → Cash for cash, else the primary. */
  paidThroughAccountId?: string;
  vendorName?: string;
  notes?: string;
  /** Blank / 0 lines are skipped server-side. */
  lines?: Array<{
    invoiceLineItemId: string;
    amount: number;
    category?: ExpenseCategory;
    vendorName?: string;
  }>;
  other?: Array<{ name: string; amount: number; category?: ExpenseCategory }>;
  /** Items bought together: one expense for all of them, never split. */
  shared?: Array<{ invoiceLineItemIds: string[]; amount: number }>;
}

/**
 * Changes the items a "bought together" group covers. The money already
 * recorded stays with the group; one item left makes it that item's cost.
 */
export interface RegroupInvoiceCostsPayload {
  /** The group as the costs list shows it. */
  currentLineItemIds: string[];
  /** What it should cover: at least one. */
  invoiceLineItemIds: string[];
}

export interface RecordInvoiceCostsResponse {
  created: Expense[];
  costs: InvoiceCosts;
}
