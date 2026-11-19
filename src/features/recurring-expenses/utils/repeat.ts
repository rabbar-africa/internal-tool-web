import type { Expense } from "@/shared/interface/expense";
import type { RecurringPrefillState } from "../template/RecurringExpenseFormTemplate";
import { onePeriodOn, todayIso } from "./recurring";

type RepeatSource = Pick<
  Expense,
  | "name"
  | "categoryId"
  | "amount"
  | "vendorName"
  | "paymentMode"
  | "paidThroughAccountId"
  | "date"
  | "tax"
>;

/**
 * "Make this repeat": the recurring form, filled in from an expense and
 * starting a month after it (never in the past, which the API refuses).
 */
export function repeatStateFrom(expense: RepeatSource): RecurringPrefillState {
  const next = onePeriodOn(expense.date.slice(0, 10), "MONTH");
  const today = todayIso();
  return {
    prefill: {
      name: expense.name,
      categoryId: expense.categoryId ?? "",
      amount: String(Number(expense.amount) || ""),
      vendorName: expense.vendorName ?? "",
      paymentMode: expense.paymentMode ?? "",
      paidThroughAccountId: expense.paidThroughAccountId ?? "",
      // The same VAT each time, at the rate on the day (a tax deleted since
      // can't be carried).
      taxId: expense.tax?.id ?? "",
      vatClaimable: expense.tax?.claimable ?? true,
      every: "1",
      unit: "MONTH",
      startDate: next < today ? today : next,
    },
  };
}
