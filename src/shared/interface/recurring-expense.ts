import type { IBaseFilter } from "./filter";
import type { ExpenseCategory } from "./expense";
import type { PaymentModeDto } from "./payment";
import type { IAccountRef } from "./settings";

/** DAY is Premium only (`dailyRecurringExpenses`). */
export type RecurrenceUnit = "DAY" | "WEEK" | "MONTH" | "YEAR";

export type RecurringStatus = "ACTIVE" | "PAUSED" | "FINISHED" | "STOPPED";

/** A schedule that records the same expense on each of its dates. */
export interface IRecurringExpense {
  id: string;
  name: string;
  category: ExpenseCategory;
  /** Decimal string. */
  amount: string;
  currencyCode: string;
  vendorName: string | null;
  paymentMode: PaymentModeDto | null;
  /** Null: the default each time (Cash for cash, else the primary). */
  paidThroughAccountId: string | null;
  paidThroughAccount: IAccountRef | null;
  notes: string | null;
  every: number;
  unit: RecurrenceUnit;
  startDate: string;
  /** Inclusive. */
  endDate: string | null;
  maxCount: number | null;
  /** Null once finished or stopped. */
  nextDate: string | null;
  madeCount: number;
  status: RecurringStatus;
  /** Why the system paused it, when it couldn't record one. */
  pausedReason: string | null;
  lastRunAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** "every month on the 31st". Show as it is. */
  describe: string;
  /** What it costs in an average month. */
  monthlyEquivalent: number;
}

/** GET /recurring-expenses/:id, and the answer to create and update. */
export interface IRecurringExpenseDetail extends IRecurringExpense {
  /** The next few dates it will record. */
  upcoming?: string[];
  /** Its last 12 recorded, newest first. */
  expenses?: Array<{
    id: string;
    expenseNumber: string;
    date: string;
    amount: string;
    paidThroughAccount: IAccountRef | null;
  }>;
}

export interface IGetRecurringExpenseFilter extends IBaseFilter {
  status?: string;
  category?: string;
  search?: string;
  paidThroughAccountId?: string;
}

export interface RecurringExpenseSummary {
  activeCount: number;
  monthlyEquivalent: number;
  byCategory: Array<{
    category: ExpenseCategory;
    count: number;
    monthlyEquivalent: number;
  }>;
}

export interface CreateRecurringExpensePayload {
  name: string;
  category?: ExpenseCategory;
  amount: number;
  currencyCode?: string;
  vendorName?: string | null;
  paymentMode?: PaymentModeDto | null;
  /** Null or left out: the default account each time. */
  paidThroughAccountId?: string | null;
  notes?: string | null;
  /** 1–99. */
  every?: number;
  unit: RecurrenceUnit;
  /** YYYY-MM-DD, today or later. Today records the first one at once. */
  startDate: string;
  /** Inclusive. Not with maxCount. */
  endDate?: string | null;
  /** 1–1000. Not with endDate. */
  maxCount?: number | null;
}

export type UpdateRecurringExpensePayload =
  Partial<CreateRecurringExpensePayload>;
