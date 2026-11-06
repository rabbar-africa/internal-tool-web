import * as Yup from "yup";

/** Keep in step with validPhoneDigits in the API, which has the last word. */
export function isValidPhoneNumber(input: string): boolean {
  let digits = input.trim().replace(/[\s().'-]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  else if (digits.startsWith("00")) digits = digits.slice(2);
  if (!/^\d+$/.test(digits)) return false;

  if (/^2340\d{10}$/.test(digits)) digits = `234${digits.slice(4)}`;
  else if (/^0\d{9,10}$/.test(digits)) digits = `234${digits.slice(1)}`;
  else if (digits.length === 10) digits = `234${digits}`;

  // Too long to be local, and no country code starts with 0.
  if (digits.startsWith("0")) return false;
  if (digits.startsWith("234")) return /^234[789]\d{9}$/.test(digits);
  return /^\d{10,15}$/.test(digits);
}

/**
 * An optional phone field. `saved` is the number already on record: left as it
 * is, an old number from before this check doesn't stop the rest of the form
 * being saved.
 */
export const phoneField = (saved?: string | null) =>
  Yup.string().test(
    "phone",
    "Enter a valid phone number, e.g. 08012345678",
    (value) => !value?.trim() || value === saved || isValidPhoneNumber(value),
  );
