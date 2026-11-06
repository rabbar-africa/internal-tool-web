/**
 * The invoice summary's arithmetic, mirroring the backend's `calcInvoiceTotals`
 * for one whole-job tax, including where it rounds: the form has to show the
 * total that will be saved, to the kobo.
 */

// `+ 0` turns -0 into 0.
const round2 = (n: number) => Math.round(n * 100) / 100 + 0;
const toKobo = (n: number) => Math.round(n * 100);

export interface InvoiceSummaryInput {
  subtotal: number;
  discount: number;
  /** A percentage: 7.5 for 7.5%. */
  taxRate: number;
  adjustment: number;
  /** A discount before tax also shrinks what is taxed. */
  isDiscountBeforeTax: boolean;
}

export function calcInvoiceSummary({
  subtotal,
  discount,
  taxRate,
  adjustment,
  isDiscountBeforeTax,
}: InvoiceSummaryInput) {
  const taxable = subtotal - (isDiscountBeforeTax ? discount : 0);
  const taxVal = taxable > 0 ? round2(taxable * (taxRate / 100)) : 0;
  return { taxVal, total: round2(subtotal - discount + taxVal + adjustment) };
}

/** Shown wherever a negative total stops an invoice from saving. */
export const NEGATIVE_TOTAL_MESSAGE =
  "The total can't be negative. Lower the discount or the adjustment.";

export type AmountToPayResult =
  | { ok: true; discount: number; adjustment: number }
  /** `limit` is the nearest amount that can be reached. */
  | { ok: false; reason: "above-total" | "below-minimum"; limit: number };

/**
 * The discount that makes an invoice total exactly `amount`. It replaces any
 * discount already there, rather than adding to it.
 *
 * Tax is rounded to the kobo, so a kobo of discount can move the total by two
 * and some totals can't be reached by discount alone. For those the adjustment
 * takes up the odd kobo, because a total a kobo above what was asked for would
 * leave the invoice part-paid when the customer pays exactly that.
 */
export function discountForAmountToPay(
  amount: number,
  input: Omit<InvoiceSummaryInput, "discount">,
): AmountToPayResult {
  const { subtotal, taxRate, adjustment, isDiscountBeforeTax } = input;
  const totalWith = (discount: number, adjusted = adjustment) =>
    calcInvoiceSummary({ ...input, discount, adjustment: adjusted }).total;

  const noDiscountTotal = totalWith(0);
  if (toKobo(amount) > toKobo(noDiscountTotal)) {
    return { ok: false, reason: "above-total", limit: noDiscountTotal };
  }

  // A discount can't go past the subtotal, nor take the total to nothing.
  const lowest = Math.max(totalWith(round2(subtotal)), 0.01);
  if (toKobo(amount) < toKobo(lowest)) {
    return { ok: false, reason: "below-minimum", limit: lowest };
  }

  const estimate = isDiscountBeforeTax
    ? subtotal - (amount - adjustment) / (1 + taxRate / 100)
    : noDiscountTotal - amount;

  // The estimate can land a kobo or two out once tax is rounded, so try the
  // discounts around it, touching the adjustment only when none of them work.
  for (const kobo of [0, 1, -1, 2, -2, 3, -3]) {
    const adjusted = round2(adjustment + kobo / 100);
    for (const step of [0, 1, -1, 2, -2, 3, -3]) {
      const discount = round2(estimate + step / 100);
      if (discount < 0 || discount > round2(subtotal)) continue;
      if (toKobo(totalWith(discount, adjusted)) === toKobo(amount)) {
        return { ok: true, discount, adjustment: adjusted };
      }
    }
  }
  return { ok: false, reason: "below-minimum", limit: lowest };
}
