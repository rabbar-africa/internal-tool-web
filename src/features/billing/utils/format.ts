import moment from "moment";
import { formatMoney } from "@/hooks/useFormatMoney";

/** "₦15,000" — kobo only shown when the amount actually has some. */
export function formatPrice(
  amount: number | string | null | undefined,
  currency = "NGN",
): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  const fractionDigits =
    value != null && Number.isFinite(value) && !Number.isInteger(value) ? 2 : 0;
  return formatMoney(value, { currencyCode: currency, fractionDigits });
}

/** "12 October 2026" */
export function formatLongDate(date: string | Date | null | undefined) {
  if (!date) return "";
  const m = moment(date);
  return m.isValid() ? m.format("D MMMM YYYY") : "";
}

/** "12 Oct" — for short sentences like the banner. */
export function formatShortDate(date: string | Date | null | undefined) {
  if (!date) return "";
  const m = moment(date);
  return m.isValid() ? m.format("D MMM") : "";
}

/**
 * Payments are recorded as `PAYSTACK_<channel>` (card, bank, bank_transfer,
 * ussd, …), `PROMO`, or a manual method from the back office.
 */
export function describePaymentMethod(method: string | null | undefined) {
  const value = (method ?? "").toUpperCase();
  if (!value) return "Manual";
  if (value === "PROMO") return "Promo";
  if (value.includes("CARD") || value.includes("APPLE_PAY")) return "Card";
  if (value.includes("USSD")) return "USSD";
  if (value.includes("TRANSFER") || value.includes("BANK")) {
    return "Bank transfer";
  }
  if (value.includes("CASH")) return "Cash";
  if (value.includes("QR")) return "QR code";
  if (value.includes("MOBILE_MONEY")) return "Mobile money";
  return "Manual";
}

/** "Visa" from "visa" / "VISA ". */
export function formatCardBrand(brand: string | null | undefined) {
  const value = (brand ?? "").trim();
  if (!value) return "Card";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

/** "in 3 days" / "tomorrow" / "today" for a non-negative day count. */
export function describeDaysLeft(daysLeft: number) {
  if (daysLeft <= 0) return "today";
  if (daysLeft === 1) return "tomorrow";
  return `in ${daysLeft} days`;
}
