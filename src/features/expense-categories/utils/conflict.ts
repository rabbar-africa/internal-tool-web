import { isAxiosError } from "axios";
import type { ExpenseCategoryConflict } from "@/shared/interface/expense-category";

const CODES = new Set<ExpenseCategoryConflict["code"]>([
  "CATEGORY_EXISTS",
  "CATEGORY_REQUIRED",
  "DEFAULT_CATEGORY",
  "CATEGORY_IN_USE",
  "CATEGORY_MOVE_TO_SELF",
]);

/** The category routes' 409 body, or null for any other error. */
export function categoryConflictOf(
  error: unknown,
): ExpenseCategoryConflict | null {
  if (!isAxiosError(error) || error.response?.status !== 409) return null;
  const body = error.response.data as Partial<ExpenseCategoryConflict> | null;
  return body?.code && CODES.has(body.code)
    ? (body as ExpenseCategoryConflict)
    : null;
}

/** "3 expenses and 1 recurring expense". */
export function describeUsage(usage: {
  expenses: number;
  recurringExpenses: number;
}): string {
  const plural = (n: number, word: string) =>
    `${n} ${word}${n === 1 ? "" : "s"}`;
  const parts = [
    usage.expenses ? plural(usage.expenses, "expense") : null,
    usage.recurringExpenses
      ? plural(usage.recurringExpenses, "recurring expense")
      : null,
  ].filter(Boolean);
  return parts.join(" and ") || "nothing";
}
