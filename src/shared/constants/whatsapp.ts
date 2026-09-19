import { env } from "./env";

/**
 * The Rabbar assistant's WhatsApp number as bare digits — the form wa.me
 * wants. Differs per environment (VITE_WHATSAPP_BOT_NUMBER); "+" and spaces
 * in the variable are tolerated.
 */
export const WHATSAPP_BOT_NUMBER = (env.WHATSAPP_BOT_NUMBER ?? "").replace(
  /\D/g,
  "",
);

/**
 * Opens the chat with "Menu" already typed, so one tap on Send brings up the
 * assistant's menu. The user sends the first message, which keeps it free.
 * Null when the number isn't configured — callers hide their UI rather than
 * fall back to another environment's bot.
 */
export const WHATSAPP_BOT_LINK = WHATSAPP_BOT_NUMBER
  ? `https://wa.me/${WHATSAPP_BOT_NUMBER}?text=Menu`
  : null;

/** "2348012345678" → "+234 801 234 5678". Other shapes are returned as-is. */
export function formatPhoneDisplay(digits?: string | null): string {
  if (!digits) return "";
  const ng = digits.match(/^(234)(\d{3})(\d{3})(\d{4})$/);
  return ng ? `+${ng[1]} ${ng[2]} ${ng[3]} ${ng[4]}` : digits;
}
