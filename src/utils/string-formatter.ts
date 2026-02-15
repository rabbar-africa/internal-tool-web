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
