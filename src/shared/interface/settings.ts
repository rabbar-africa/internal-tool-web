export type OrgAddressType = "BILLING" | "SHIPPING" | "OFFICE" | "OTHER";

export const ORG_ADDRESS_TYPES: OrgAddressType[] = [
  "BILLING",
  "SHIPPING",
  "OFFICE",
  "OTHER",
];

export interface IOrgAddress {
  id: string;
  organizationId?: string;
  label?: string | null;
  type: OrgAddressType;
  attention?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  phone?: string | null;
  isPrimary: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrgAddressPayload {
  label?: string;
  type: OrgAddressType;
  attention?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
  isPrimary?: boolean;
}

export type UpdateOrgAddressPayload = CreateOrgAddressPayload & {
  isActive?: boolean;
};

export interface IOrgBankAccount {
  id: string;
  organizationId?: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode?: string | null;
  isPrimary: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrgBankAccountPayload {
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode?: string;
  isPrimary?: boolean;
}

export interface IOrgCurrency {
  id: string;
  organizationId?: string;
  code: string;
  symbol?: string | null;
  name?: string | null;
  exchangeRate: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrgCurrencyPayload {
  code: string;
  symbol?: string;
  name?: string;
  exchangeRate?: number;
  isDefault?: boolean;
}

export type UpdateOrgCurrencyPayload = Omit<
  CreateOrgCurrencyPayload,
  "code"
> & {
  isActive?: boolean;
};

export interface IOrgTax {
  id: string;
  organizationId?: string;
  name: string;
  rate: number;
  isCompound: boolean;
  isDefault: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrgTaxPayload {
  name: string;
  rate: number;
  isCompound?: boolean;
  isDefault?: boolean;
}

export type UpdateOrgTaxPayload = CreateOrgTaxPayload & {
  isActive?: boolean;
};

export type TxnSeriesModule =
  | "INVOICE"
  | "PAYMENT_RECEIVED"
  | "PAYMENT_MADE"
  | "SALES_ORDER"
  | "PURCHASE_ORDER"
  | "ESTIMATE"
  | "RECEIPT"
  | "CREDIT_NOTE"
  | "DEBIT_NOTE"
  | "EXPENSE"
  | "JOURNAL_ENTRY"
  | "INSPECTION"
  | "CUSTOMER"
  | "ITEM"
  | "VEHICLE"
  | "PROJECT";

export const TXN_SERIES_MODULES: { value: TxnSeriesModule; label: string }[] = [
  { value: "INVOICE", label: "Invoice" },
  { value: "PAYMENT_RECEIVED", label: "Payment Received" },
  { value: "PAYMENT_MADE", label: "Payment Made" },
  { value: "SALES_ORDER", label: "Sales Order" },
  { value: "PURCHASE_ORDER", label: "Purchase Order" },
  { value: "ESTIMATE", label: "Estimate" },
  { value: "RECEIPT", label: "Receipt" },
  { value: "CREDIT_NOTE", label: "Credit Note" },
  { value: "DEBIT_NOTE", label: "Debit Note" },
  { value: "EXPENSE", label: "Expense" },
  { value: "JOURNAL_ENTRY", label: "Journal Entry" },
  { value: "INSPECTION", label: "Inspection" },
  { value: "CUSTOMER", label: "Customer" },
  { value: "ITEM", label: "Item" },
  { value: "VEHICLE", label: "Vehicle" },
  { value: "PROJECT", label: "Project" },
];

export interface IOrgTransactionSeries {
  id: string;
  organizationId?: string;
  module: TxnSeriesModule;
  prefix: string;
  suffix: string;
  separator: string;
  padding: number;
  nextNumber: number;
  autoGenerate: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type UpsertOrgTransactionSeriesPayload = {
  module: TxnSeriesModule;
  prefix: string;
  suffix: string;
  separator: string;
  padding: number;
  nextNumber: number;
  autoGenerate: boolean;
  isActive: boolean;
};

// ─── General configuration ─────────────────────────────────────────────────

export interface UpdateOrgConfigPayload {
  fiscalYearStartMonth: number;
  dateFormat: string;
  timeFormat: string;
  decimalPlaces: number;
  numberFormat: string;
  isInclusiveTaxDefault: boolean;
  isDiscountBeforeTaxDefault: boolean;
  defaultPaymentTerms: number;
  allowNegativeStock: boolean;
  requireSignatureOnInspection: boolean;
  allowedPaymentMethods: string[];
  brandPrimaryColor: string;
  brandSecondaryColor: string;
  brandFont: string | null;
  invoiceFooter: string | null;
  invoiceNotesDefault: string | null;
  invoiceTermsDefault: string | null;
}

export const FISCAL_YEAR_MONTHS: { value: number; label: string }[] = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

export const DATE_FORMAT_OPTIONS: { value: string; label: string }[] = [
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY (31/12/2026)" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY (12/31/2026)" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD (2026-12-31)" },
  { value: "DD-MM-YYYY", label: "DD-MM-YYYY (31-12-2026)" },
  { value: "DD MMM YYYY", label: "DD MMM YYYY (31 Dec 2026)" },
];

export const TIME_FORMAT_OPTIONS: { value: string; label: string }[] = [
  { value: "HH:mm", label: "24-hour (14:30)" },
  { value: "hh:mm A", label: "12-hour (02:30 PM)" },
];

export const NUMBER_FORMAT_OPTIONS: { value: string; label: string }[] = [
  { value: "1,234,567.89", label: "1,234,567.89" },
  { value: "1.234.567,89", label: "1.234.567,89" },
  { value: "1 234 567.89", label: "1 234 567.89" },
];

export const PAYMENT_METHOD_OPTIONS = [
  "CASH",
  "BANK_TRANSFER",
  "CARD",
  "CHEQUE",
  "MOBILE_MONEY",
  "POS",
] as const;
