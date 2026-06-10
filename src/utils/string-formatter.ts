export function arrayToCommaString(arr?: string[] | null): string {
  if (!Array.isArray(arr)) return "";

  return arr
    .map((item) => item?.trim())
    .filter((item) => item)
    .join(", ");
}

export function commaStringToArray(input?: string | null): string[] {
  if (typeof input !== "string") return [];

  return input
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item);
}

interface AddressParts {
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
}

/** Joins the populated parts of an address into a single comma-separated line. */
export function formatAddress(address?: AddressParts | null): string {
  if (!address) return "";

  return arrayToCommaString(
    [
      address.addressLine1,
      address.addressLine2,
      address.city,
      address.state,
      address.country,
      address.postalCode,
    ].filter((part): part is string => Boolean(part)),
  );
}

interface TransactionSeriesParts {
  prefix?: string;
  suffix?: string;
  separator?: string;
  padding?: number;
  number: number;
}

/**
 * Builds a sample transaction number from a series config, e.g.
 * { prefix: "INV", separator: "-", padding: 6, number: 1 } -> "INV-000001".
 */
export function formatTransactionSeries({
  prefix = "",
  suffix = "",
  separator = "",
  padding = 0,
  number,
}: TransactionSeriesParts): string {
  const padded = String(Math.max(0, number)).padStart(padding, "0");

  return [prefix, padded, suffix]
    .filter((part) => part !== "" && part != null)
    .join(separator);
}

export function pascalToCapitalized(str?: string | null): string {
  if (!str || typeof str !== "string") return "";

  // First, replace underscores with spaces
  const result = str.replace(/_/g, " ");

  // Add space at word boundaries:
  // - Betwe`en lowercase and uppercase letters
  // - Before the last capital in a sequence of capitals followed by lowercase
  const withSpaces = result
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
    .trim();

  // Capitalize first letter of each word
  return withSpaces
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
