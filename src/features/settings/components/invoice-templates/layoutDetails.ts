import type { InvoiceLayout } from "@/features/invoices/utils/invoice-design";

export const LAYOUT_DETAILS: Record<
  InvoiceLayout,
  { label: string; description: string }
> = {
  classic: {
    label: "Classic",
    description: "The standard design, with a dark table header.",
  },
  modern: {
    label: "Modern",
    description: "A bold colour band across the top.",
  },
  minimal: {
    label: "Minimal",
    description: "Clean lines, no filled blocks. Light on printer ink.",
  },
};
