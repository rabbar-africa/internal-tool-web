/**
 * The backend's data export (`GET /exports/modules`, `POST /exports`). The
 * advanced export form is built from the catalog, so a module added on the
 * backend shows up without a frontend change.
 */

/** The modules the backend can export. */
export type ExportModuleKey =
  | "customers"
  | "invoices"
  | "payments_received"
  | "expenses"
  | "job_cards"
  | "vehicles"
  | "items";

export type ExportFileFormat = "csv" | "xls" | "xlsx";

export interface ExportColumn {
  key: string;
  header: string;
  type:
    | "text"
    | "money"
    | "number"
    | "integer"
    | "date"
    | "datetime"
    | "boolean";
  /** Only in the file when "Include sensitive personal information" is ticked. */
  pii: boolean;
}

export interface ExportFilter {
  key: string;
  label: string;
  /** `enum`: one of `options`. `id`: a record's id. `text`: free text. */
  type: "enum" | "id" | "text";
  options?: string[];
}

/** One shape of a module's export, e.g. one row per invoice or per invoice line. */
export interface ExportVariant {
  key: string;
  label: string;
  description: string | null;
  columns: ExportColumn[];
}

export interface ExportModule {
  key: string;
  label: string;
  /** Null when the module can't be narrowed to a period. */
  period: { label: string } | null;
  filters: ExportFilter[];
  /** The first is the default. */
  variants: ExportVariant[];
}

export interface ExportCatalog {
  /** Only the modules this user may view. */
  modules: ExportModule[];
  decimalFormats: string[];
  defaultDecimalFormat: string;
  fileFormats: Array<{
    key: ExportFileFormat;
    label: string;
    /** `zip`: the file comes inside a password-protected ZIP. */
    passwordProtection: "zip" | "native";
  }>;
  maxRows: number;
  passwordRule: string;
}

export interface CreateExportPayload {
  module: string;
  variant?: string;
  /** Both or neither, YYYY-MM-DD, inclusive. */
  from?: string;
  to?: string;
  filters?: Record<string, string>;
  decimalFormat?: string;
  fileFormat: ExportFileFormat;
  includePii: boolean;
  password?: string;
}

export interface ExportResult {
  filename: string;
  rows: number;
  /** More matched than the row cap, so only the first `rows` were written. */
  truncated: boolean;
}

/**
 * Narrows an advanced export to what the page is about, such as one customer.
 * Filters are per module because the same thing goes by different keys:
 * a customer is `customerId` on invoices but `clientId` on job cards.
 */
export interface ExportScope {
  /** Who or what it narrows to, e.g. the customer's name. */
  label: string;
  filters: Partial<Record<ExportModuleKey, Record<string, string>>>;
}
