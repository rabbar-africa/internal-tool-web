// Concrete hex values mirrored from the Chakra theme (src/theme/custom/color.ts)
// so the @react-pdf receipt matches the on-screen <PaymentReceipt/>.
export const pdfColors = {
  white: "#FFFFFF",
  primary300: "#013064",
  primary500: "#001F3E",
  gray50: "#F4F4F4",
  gray75: "#e0e0e0",
  gray300: "#757575",
  gray400: "#424242",
  gray500: "#1a1a2e",
  // receipt accents
  ribbonPaid: "#1fcd6d",
  ribbonRefund: "#d32f2f",
  ribbonDraft: "#757575",
  amountBox: "#2fa346", // success.200
} as const;
