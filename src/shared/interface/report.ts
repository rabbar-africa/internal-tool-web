/**
 * Reports (docs/frontend-reports.md). The API decides which reports exist,
 * their columns and filters; the page only draws what it is sent.
 */

export type ReportPeriodKind = "range" | "asOf";
export type ReportBasis = "accrual" | "cash";

/** A filter beyond the period, as the exports declare them. */
export interface ReportFilterDef {
  key: string;
  label: string;
  /** `enum`: one of `options`. `id`: a record's id. `date`: YYYY-MM-DD. */
  type: "enum" | "id" | "date" | "text";
  options?: string[];
}

export interface ReportCatalogEntry {
  key: string;
  name: string;
  description: string;
  period: ReportPeriodKind;
  /** The first is the default; empty when the report has none. */
  basis: ReportBasis[];
  filters: ReportFilterDef[];
  /** The plan lacks it: shown, but greyed with the plan that has it. */
  locked: boolean;
  /** A plan tier, e.g. "STANDARD". */
  upgradeTo: string | null;
}

/** A page that already exists elsewhere, listed among the reports. */
export interface ReportCatalogLink {
  key: string;
  name: string;
  description: string;
  page: "banking" | "activity_log";
}

export interface ReportSection {
  key: string;
  label: string;
  reports: ReportCatalogEntry[];
  links: ReportCatalogLink[];
}

export interface ReportCatalog {
  sections: ReportSection[];
  basisLabels?: Partial<Record<ReportBasis, string>>;
  fileFormats?: string[];
  decimalFormats?: string[];
}

export type ReportColumnType =
  | "text"
  | "money"
  | "count"
  | "number"
  | "percent"
  | "date";

export interface ReportColumn {
  key: string;
  label: string;
  type: ReportColumnType;
}

export type ReportRecordType =
  | "invoice"
  | "payment"
  | "expense"
  | "customer"
  | "job_card"
  | "credit_note"
  | "vehicle"
  | "item";

export type ReportDrill =
  | { report: string; filters?: Record<string, string> }
  | { record: { type: ReportRecordType; id: string } };

export type ReportCell = string | number | null;

export interface ReportRow {
  cells: Record<string, ReportCell>;
  drill?: ReportDrill;
  children?: ReportRow[];
  style?: "heading" | "subtotal" | "total";
}

export interface ReportResult {
  report: {
    key: string;
    name: string;
    section: string;
    description: string;
  };
  period:
    | { kind: "range"; from: string; to: string }
    | { kind: "asOf"; asOf: string };
  basis: ReportBasis | null;
  basisLabel: string | null;
  filters: Record<string, string>;
  filterLabels: string[];
  currency: string;
  columns: ReportColumn[];
  rows: ReportRow[];
  totals: Record<string, ReportCell> | null;
  notes: string[];
  truncated: boolean;
  generatedAt: string;
}

/** What a report is run with: the same for the screen, PDF and files. */
export type ReportParams = Record<string, string>;

export type ReportFileFormat = "csv" | "xls" | "xlsx";
