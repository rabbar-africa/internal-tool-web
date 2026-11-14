/**
 * Which signup field a refusal from the API is about, and what to say under
 * it (QA 14 Nov 2026, bug #4). The phone and email fields sit far above the
 * button, so a toast alone was easy to miss: the form shows the reason on the
 * field and again beside "Create account". The API's messages are matched,
 * since a 409 carries no field of its own.
 */
export type SignupErrorField = "phone" | "email" | "name" | "promoCode";

export function signupError(
  message: string | undefined,
  { hasPromo }: { hasPromo: boolean },
): { field: SignupErrorField | null; message: string } {
  const text = message ?? "Something went wrong. Please try again.";
  if (/phone number is already linked/i.test(text)) {
    return {
      field: "phone",
      message:
        "This phone number already has a Rabbar account. Sign in instead, or use another number.",
    };
  }
  if (/user with email .* already exists/i.test(text)) {
    return {
      field: "email",
      message:
        "This email already has a Rabbar account. Sign in instead, or use another email.",
    };
  }
  if (/slug .* already taken/i.test(text)) {
    return {
      field: "name",
      message: "A business with this name already exists. Try another name.",
    };
  }
  if (hasPromo && /promo|code/i.test(text)) {
    return { field: "promoCode", message: text };
  }
  return { field: null, message: text };
}
