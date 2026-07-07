import type { IBaseFilter } from "./filter";
import { PaymentModeDto } from "./payment";

export type ExpenseCategory =
  | "PARTS"
  | "SUBLET"
  | "CONSUMABLES"
  | "LABOR"
  | "TOWING"
  | "FEES"
  | "OTHER";

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
}

export interface CreateExpensePayload {
  date: string;
  name: string;
  description?: string;
  category?: ExpenseCategory;
  jobCardId?: string;
  vendorName?: string;
  itemId?: string;
  quantity?: number;
  unitCost?: number;
  amount?: number;
  paymentMode?: PaymentModeDto;
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
