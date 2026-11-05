/**
 * What a user can change about how an invoice looks, stored as JSON on a
 * template (`orgTemplates.customizations`).
 *
 * Kept as two copies of this one file, which must not drift apart:
 *   internal-web-tool/src/features/invoices/utils/invoice-design.ts
 *   internal-tool-backend/src/invoices/pdf/invoice-design.ts
 *
 * The defaults reproduce the invoice as it was before templates existed, so an
 * organization with no template sees no change. There is deliberately no switch
 * for the invoice number, customer, invoice date, line items, tax or totals:
 * those are always printed. Plan rules (Rabbar branding, invoice terms) are not
 * here either, so a template can't override them.
 */

export const INVOICE_DESIGN_VERSION = 1;

export const INVOICE_LAYOUTS = ["classic", "modern", "minimal"] as const;
export type InvoiceLayout = (typeof INVOICE_LAYOUTS)[number];

export const INVOICE_FONTS = ["Poppins", "Helvetica", "Times-Roman"] as const;
export type InvoiceFont = (typeof INVOICE_FONTS)[number];

export interface InvoiceDesign {
  version: number;
  layout: InvoiceLayout;
  style: {
    /** Headings, dates, quantities and rates. */
    primaryColor: string;
    /** The table header, and the header band on the modern layout. */
    headerColor: string;
    font: InvoiceFont;
  };
  show: {
    logo: boolean;
    rcNumber: boolean;
    orgAddress: boolean;
    orgContact: boolean;
    billingAddress: boolean;
    paymentTerms: boolean;
    dueDate: boolean;
    itemDescription: boolean;
    vehicle: boolean;
    bankDetails: boolean;
    notes: boolean;
    terms: boolean;
  };
  labels: {
    title: string;
    billTo: string;
    invoiceDate: string;
    paymentTerms: string;
    dueDate: string;
    balanceDue: string;
    items: string;
    quantity: string;
    rate: string;
    amount: string;
    vehicle: string;
    bank: string;
    notes: string;
    terms: string;
  };
}

export const DEFAULT_INVOICE_DESIGN: InvoiceDesign = {
  version: INVOICE_DESIGN_VERSION,
  layout: "classic",
  style: {
    primaryColor: "#012751",
    headerColor: "#1a1a2e",
    font: "Poppins",
  },
  show: {
    logo: true,
    rcNumber: true,
    orgAddress: true,
    orgContact: true,
    billingAddress: true,
    paymentTerms: true,
    dueDate: true,
    itemDescription: true,
    vehicle: true,
    bankDetails: true,
    notes: true,
    terms: true,
  },
  labels: {
    title: "Invoice",
    billTo: "Bill To",
    invoiceDate: "Invoice Date",
    paymentTerms: "Terms",
    dueDate: "Due Date",
    balanceDue: "Balance Due",
    items: "Item & Description",
    quantity: "Qty",
    rate: "Rate",
    amount: "Amount",
    vehicle: "Vehicle Information",
    bank: "Account Details",
    notes: "Notes",
    terms: "Terms & Conditions",
  },
};

export const MAX_INVOICE_LABEL_LENGTH = 40;

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const includes = <T extends string>(
  list: readonly T[],
  value: unknown,
): value is T => list.includes(value as T);

/**
 * Any stored value → a design that is safe to render. Forgiving on purpose:
 * whatever is missing or invalid falls back to its default, so old or damaged
 * data can never stop an invoice from printing.
 */
export function normalizeInvoiceDesign(raw: unknown): InvoiceDesign {
  const source = isRecord(raw) ? raw : {};
  const style = isRecord(source.style) ? source.style : {};
  const show = isRecord(source.show) ? source.show : {};
  const labels = isRecord(source.labels) ? source.labels : {};
  const defaults = DEFAULT_INVOICE_DESIGN;

  const color = (value: unknown, fallback: string) =>
    typeof value === "string" && HEX_COLOR.test(value) ? value : fallback;

  const showing = {} as InvoiceDesign["show"];
  for (const key of Object.keys(
    defaults.show,
  ) as (keyof InvoiceDesign["show"])[]) {
    const value = show[key];
    showing[key] = typeof value === "boolean" ? value : defaults.show[key];
  }

  const naming = {} as InvoiceDesign["labels"];
  for (const key of Object.keys(
    defaults.labels,
  ) as (keyof InvoiceDesign["labels"])[]) {
    const value = labels[key];
    const text = typeof value === "string" ? value.trim() : "";
    naming[key] =
      text && text.length <= MAX_INVOICE_LABEL_LENGTH
        ? text
        : defaults.labels[key];
  }

  return {
    version: INVOICE_DESIGN_VERSION,
    layout: includes(INVOICE_LAYOUTS, source.layout)
      ? source.layout
      : defaults.layout,
    style: {
      primaryColor: color(style.primaryColor, defaults.style.primaryColor),
      headerColor: color(style.headerColor, defaults.style.headerColor),
      font: includes(INVOICE_FONTS, style.font)
        ? style.font
        : defaults.style.font,
    },
    show: showing,
    labels: naming,
  };
}

/** What's wrong with a design someone is trying to save; empty when it's fine. */
export function invoiceDesignErrors(raw: unknown): string[] {
  if (!isRecord(raw)) return ["The design must be an object"];
  const errors: string[] = [];
  const style = isRecord(raw.style) ? raw.style : {};
  const labels = isRecord(raw.labels) ? raw.labels : {};

  if (raw.layout !== undefined && !includes(INVOICE_LAYOUTS, raw.layout)) {
    errors.push(`Layout must be one of: ${INVOICE_LAYOUTS.join(", ")}`);
  }
  if (style.font !== undefined && !includes(INVOICE_FONTS, style.font)) {
    errors.push(`Font must be one of: ${INVOICE_FONTS.join(", ")}`);
  }
  for (const key of ["primaryColor", "headerColor"]) {
    const value = style[key];
    if (
      value !== undefined &&
      !(typeof value === "string" && HEX_COLOR.test(value))
    ) {
      errors.push(`${key} must be a colour like #012751`);
    }
  }
  for (const [key, value] of Object.entries(labels)) {
    if (
      typeof value === "string" &&
      value.trim().length > MAX_INVOICE_LABEL_LENGTH
    ) {
      errors.push(
        `The ${key} label can't be over ${MAX_INVOICE_LABEL_LENGTH} characters`,
      );
    }
  }
  return errors;
}

/** `#012751` at `amount` (0–1) over white: a soft tint for backgrounds. */
export const tint = (hex: string, amount: number): string => {
  const channel = (start: number) => {
    const value = parseInt(hex.slice(start, start + 2), 16);
    return Math.round(255 - (255 - value) * amount)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${channel(1)}${channel(3)}${channel(5)}`;
};

type StyleOverrides = Record<string, Record<string, string | number>>;

/** How a design changes the PDF's stylesheet, keyed by style name. */
export function invoicePdfStyleOverrides(
  design: InvoiceDesign,
): StyleOverrides {
  const { primaryColor: primary, headerColor: header, font } = design.style;
  const isDefaultPrimary =
    primary === DEFAULT_INVOICE_DESIGN.style.primaryColor;

  const base: StyleOverrides = {
    page: { fontFamily: font },
    logoFallback: { backgroundColor: isDefaultPrimary ? "#001F3E" : primary },
    metaValue: { color: primary },
    tableHead: { backgroundColor: header },
    cellAccent: { color: primary },
    sectionTitle: { color: primary },
  };

  if (design.layout === "modern") {
    return {
      ...base,
      // A band across the full page: the negative margins cancel the page's own
      // 36pt padding.
      headerRow: {
        backgroundColor: header,
        marginTop: -36,
        marginHorizontal: -36,
        paddingHorizontal: 36,
        paddingVertical: 22,
        marginBottom: 18,
      },
      logo: { backgroundColor: "#FFFFFF", padding: 4, borderRadius: 3 },
      logoFallback: { backgroundColor: "#FFFFFF" },
      logoFallbackText: { color: header },
      orgName: { color: "#FFFFFF" },
      orgLine: { color: "#FFFFFF" },
      invoiceTitle: { color: "#FFFFFF" },
      invoiceNumber: { color: "#FFFFFF" },
      balanceLabel: { color: "#FFFFFF" },
      balanceValue: { color: "#FFFFFF" },
      tableHead: { backgroundColor: primary },
      balanceBox: { backgroundColor: tint(primary, 0.1) },
    };
  }

  if (design.layout === "minimal") {
    return {
      ...base,
      invoiceTitle: { fontSize: 18, fontWeight: 500, color: header },
      tableHead: {
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1.5,
        borderBottomColor: header,
        paddingHorizontal: 0,
      },
      th: { color: header, fontWeight: 600 },
      row: { paddingHorizontal: 0 },
      totalRow: { paddingHorizontal: 0 },
      carryTitle: { paddingHorizontal: 0 },
      balanceBox: {
        backgroundColor: "#FFFFFF",
        borderTopWidth: 1.5,
        borderTopColor: header,
        borderRadius: 0,
        paddingHorizontal: 0,
      },
    };
  }

  return base;
}

/** The stylesheet with a design's changes applied. */
export function applyStyleOverrides<T extends Record<string, object>>(
  styles: T,
  overrides: StyleOverrides,
): T {
  const merged: Record<string, object> = { ...styles };
  for (const [name, override] of Object.entries(overrides)) {
    merged[name] = { ...merged[name], ...override };
  }
  return merged as T;
}
