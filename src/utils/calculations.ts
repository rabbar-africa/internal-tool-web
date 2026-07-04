/**
 * Core financial calculation utilities for Rabbar Africa internal dashboard.
 * All profit-related business logic lives here — keep UI components clean.
 */

import { addComma } from "./format-number";

export function calculateProfit(
  totalAmount: number,
  totalExpenses: number,
): number {
  return totalAmount - totalExpenses;
}

export function calculateMarginPercent(
  profit: number,
  totalAmount: number,
): number {
  if (totalAmount === 0) return 0;
  return (profit / totalAmount) * 100;
}

export type ProfitStatus = "profitable" | "low-margin" | "loss";

export function getProfitStatus(marginPercent: number): ProfitStatus {
  if (marginPercent >= 30) return "profitable";
  if (marginPercent >= 10) return "low-margin";
  return "loss";
}

export function formatCurrency(
  amount: number | string = 0,
  currency = "NGN",
): string {
  // API values are sometimes strings; addComma coerces to a number and adds
  // thousands separators (and 2 decimals only when there's a fractional part).
  const formatted = addComma(amount);
  return currency === "NGN" ? `₦${formatted}` : `${currency} ${formatted}`;
}

export function sumBy<T extends Record<string, unknown>>(
  array: T[],
  key: keyof T,
): number {
  return array.reduce((acc, item) => {
    const val = item[key];
    return acc + (typeof val === "number" ? val : 0);
  }, 0);
}

export function calculateLineTotal(
  quantity: number,
  unitPrice: number,
  taxRate: number,
): number {
  return quantity * unitPrice * (1 + taxRate / 100);
}
