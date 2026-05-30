import { useCallback } from "react";
import { useCurrentUser } from "./useCurrentUser";

export type FormatMoneyOptions = {
  currencyCode?: string;
  /** When false, returns just the formatted number. Defaults to true. */
  showSymbol?: boolean;
  /** Override decimal places (default 2). */
  fractionDigits?: number;
};

const DEFAULT_CURRENCY = "NGN";

// Pure formatter — safe to call outside React (e.g. inside @react-pdf documents).
export function formatMoney(
  amount: number | string | null | undefined,
  options: FormatMoneyOptions = {},
): string {
  const currency = options.currencyCode || DEFAULT_CURRENCY;
  const showSymbol = options.showSymbol ?? true;
  const fractionDigits = options.fractionDigits ?? 2;

  const numValue =
    typeof amount === "string" ? parseFloat(amount) : (amount ?? 0);
  if (!Number.isFinite(numValue))
    return showSymbol ? symbolFor(currency) + "0.00" : "0.00";

  const formattedNumber = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(numValue);

  return `${showSymbol ? symbolFor(currency) : ""}${formattedNumber}`;
}

function symbolFor(currency: string): string {
  if (currency === "NGN") return "₦";
  const parts = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).formatToParts(1);
  return parts.find((p) => p.type === "currency")?.value || "";
}

export function useFormatMoney() {
  const { userOrganization } = useCurrentUser();
  const userCurrency = userOrganization?.currency || DEFAULT_CURRENCY;

  const boundFormatMoney = useCallback(
    (
      amount: number | string | null | undefined,
      options: FormatMoneyOptions = {},
    ) =>
      formatMoney(amount, {
        ...options,
        currencyCode: options.currencyCode || userCurrency,
      }),
    [userCurrency],
  );

  return { formatMoney: boundFormatMoney, currency: userCurrency };
}
