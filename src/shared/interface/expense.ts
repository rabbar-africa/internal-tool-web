import type { IBaseFilter } from "./filter";
import { PaymentModeDto } from "./payment";
import type { IAccountRef } from "./settings";
import type { ExpenseCategoryRef } from "./expense-category";

/**
 * The category fields a record carries. Each business keeps its own list, so
 * show `expenseCategory.name`; `category` is the old string (a default's key,
 * else the name), kept only for older responses.
 */
export interface WithExpenseCategory {
  categoryId?: string;
  expenseCategory?: ExpenseCategoryRef | null;
  /** Legacy: a default's key (`PARTS`) or the category's name. */
  category?: string | null;
}

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

export interface Expense extends WithExpenseCategory {
  id: string;
  organizationId: string;
  expenseNumber: string;
  jobCardId: string | null;
  date: string;
  categoryId: string;
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
  /** The schedule that recorded it; null for one recorded by hand. */
  recurringExpense?: { id: string; name: string } | null;
  /** "RECURRING" when a schedule recorded it. */
  source?: string | null;
  /**
   * VAT paid on it (docs/frontend-vat.md): `amount` stays what was paid, VAT
   * included; this is the VAT inside it. `id` is null when the tax was
   * deleted since (its name and rate are kept).
   */
  tax?: ExpenseTax | null;
  /** What it cost the business: the amount less VAT it can reclaim. */
  netAmount?: number;
}

export interface ExpenseTax {
  id: string | null;
  name: string;
  percent: number;
  amount: number;
  /** The supplier's VAT invoice is held, so the VAT can be reclaimed. */
  claimable: boolean;
}

/** The VAT fields an expense can be saved with, only when VAT-registered. */
export interface ExpenseVatFields {
  /** The org's tax; `null` on update removes it. */
  taxId?: string | null;
  /** As the receipt shows it; left out (`null` on update) = from the rate. */
  taxAmount?: number | null;
  /** Default on. */
  vatClaimable?: boolean;
}

export interface CreateExpensePayload extends ExpenseVatFields {
  date: string;
  name: string;
  description?: string;
  /** Left out → Parts. A hidden one is accepted (the edit form sends it back). */
  categoryId?: string;
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
  categoryId?: string;
  paidThroughAccountId?: string;
  invoiceId?: string;
  /** Only the expenses one schedule recorded. */
  recurringExpenseId?: string;
}

/**
 * Legacy: what the old fixed categories were called. Only a fallback for a
 * record that arrives without `expenseCategory`; the business's own names
 * come from the API.
 */
export const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  PARTS: "Parts",
  SUBLET: "Sublet",
  CONSUMABLES: "Consumables",
  LABOR: "Labour",
  TOWING: "Towing",
  FEES: "Fees",
  RENT: "Rent",
  SALARIES: "Salaries",
  UTILITIES: "Utilities",
  OTHER: "Other",
};

/** The category's name to show, from whatever the record carries. */
export const expenseCategoryLabel = (
  record: WithExpenseCategory,
  /** The business's list, to name a record that only has `categoryId`. */
  byId?: ReadonlyMap<string, { name: string }>,
): string => {
  if (record.expenseCategory?.name) return record.expenseCategory.name;
  const known = record.categoryId ? byId?.get(record.categoryId) : undefined;
  if (known) return known.name;
  if (record.category) {
    return EXPENSE_CATEGORY_LABELS[record.category] ?? record.category;
  }
  return "—";
};

/** A POS terminal takes a card, so POS is Card (QA bug #15), not a mode of its own. */
export const PAYMENT_MODE_LABELS: Record<PaymentModeDto, string> = {
  [PaymentModeDto.CASH]: "Cash",
  [PaymentModeDto.BANK_TRANSFER]: "Bank Transfer",
  [PaymentModeDto.CARD]: "Card / POS",
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
export interface InvoiceCostExpense extends WithExpenseCategory {
  id: string;
  expenseNumber: string;
  date: string;
  name: string;
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
  /** VAT on every expense recorded here, worked out from each amount. */
  taxId?: string;
  /** Default on. */
  vatClaimable?: boolean;
  /** Blank / 0 lines are skipped server-side. */
  lines?: Array<{
    invoiceLineItemId: string;
    amount: number;
    /** Left out → Labour for a service item, else Parts. */
    categoryId?: string;
    vendorName?: string;
  }>;
  /** Left out → Other. */
  other?: Array<{ name: string; amount: number; categoryId?: string }>;
  /** Items bought together: one expense for all of them, never split. */
  shared?: Array<{
    invoiceLineItemIds: string[];
    amount: number;
    categoryId?: string;
  }>;
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

/** An amount and how many expenses make it up. */
export interface ExpenseStatsTotal {
  amount: number;
  count: number;
}

/** A total over a date range (inclusive, `YYYY-MM-DD`). */
export interface ExpenseStatsPeriod extends ExpenseStatsTotal {
  from: string;
  to: string;
}

/**
 * `GET /expenses/stats` (docs/frontend-expense-stats.md). Amounts are what
 * was paid, VAT included; deleted expenses are left out.
 */
export interface ExpenseStats {
  currency: string;
  asOf: string;
  thisMonth: ExpenseStatsPeriod;
  /** The whole of last month. */
  lastMonth: ExpenseStatsPeriod;
  thisYear: ExpenseStatsPeriod;
  /** This month, split into cost of sales and everything else. */
  thisMonthSplit: {
    onJobs: ExpenseStatsTotal;
    overheads: ExpenseStatsTotal;
  };
  /** This month's biggest category by amount; null with no expenses. */
  topCategoryThisMonth:
    | (ExpenseStatsTotal & { id: string; name: string })
    | null;
  /** Show only when `vatRegistered`. */
  claimableVatThisMonth: { amount: number; vatRegistered: boolean };
  /** Every expense the active schedules will record up to `through`. */
  recurringNext30Days: {
    count: number;
    amount: number;
    schedules: number;
    through: string;
  };
}
