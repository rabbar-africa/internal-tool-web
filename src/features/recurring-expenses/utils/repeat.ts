import type { Expense } from "@/shared/interface/expense";
import type { RecurringPrefillState } from "../template/RecurringExpenseFormTemplate";
import { onePeriodOn, todayIso } from "./recurring";

type RepeatSource = Pick<
  Expense,
  | "name"
  | "category"
  | "amount"
  | "vendorName"
  | "paymentMode"
  | "paidThroughAccountId"
  | "date"
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
      category: expense.category,
      amount: String(Number(expense.amount) || ""),
      vendorName: expense.vendorName ?? "",
      paymentMode: expense.paymentMode ?? "",
      paidThroughAccountId: expense.paidThroughAccountId ?? "",
      every: "1",
      unit: "MONTH",
      startDate: next < today ? today : next,
    },
  };
}
