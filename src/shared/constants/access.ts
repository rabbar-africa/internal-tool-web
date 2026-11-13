import type {
  KnownPermissionSubject,
  PermissionAction,
} from "@/shared/interface/user";

/**
 * Who may see what: the one place the app's views are tied to permissions.
 * Routes, the sidebar, settings cards and buttons all read from here, so a
 * change to who sees a page is made once. See
 * docs/frontend-permission-based-views.md.
 *
 * Typed against the strict subject list, so `"read:client"` won't compile.
 */
export type AccessPermission = `${PermissionAction}:${KnownPermissionSubject}`;

/**
 * View rules: checks the backend has no single permission for, built from the
 * ones it does. Components ask for a rule by name and never test role names,
 * so custom roles follow the same logic. Each rule here was agreed with the
 * product owner (2026-11-10); add new ones the same way.
 */
export const VIEW_RULES = {
  /**
   * Profit, wherever it shows: job card financials, the invoice costs panel,
   * the dashboard's profit and expense figures. Profit is revenue minus
   * expenses, so whoever reads expenses sees it: by default workshop manager,
   * accountant and admins.
   */
  finance: ["read:expenses"],
  /**
   * The Reports page: the whole business's books. Follows banking, the
   * narrower money permission: by default accountant and admins only.
   */
  reports: ["read:banking"],
} as const satisfies Record<string, readonly AccessPermission[]>;

export type ViewRule = keyof typeof VIEW_RULES;

/**
 * What each page needs. The user must hold every permission listed (the API's
 * guard is "all of" too). An empty list means any signed-in user.
 */
export const PAGE_ACCESS = {
  // Everyone has a dashboard; its widgets gate themselves.
  overview: [],

  customers: ["read:clients"],
  customerCreate: ["create:clients"],
  customerEdit: ["update:clients"],

  invoices: ["read:invoices"],
  invoiceCreate: ["create:invoices"],
  invoiceEdit: ["update:invoices"],
  invoiceCosts: ["create:expenses"],

  quotations: ["read:quotations"],
  quotationCreate: ["create:quotations"],
  quotationEdit: ["update:quotations"],

  creditNotes: ["read:credit_notes"],
  creditNoteCreate: ["create:credit_notes"],
  creditNoteEdit: ["update:credit_notes"],
  // Actions on a credit note rather than pages: a refund is money out of an
  // account, so it needs banking as well (the API's guard is the same).
  creditNoteRefund: ["update:credit_notes", "create:banking"],
  creditNoteRefundDelete: ["update:credit_notes", "delete:banking"],

  payments: ["read:payments_received"],
  paymentCreate: ["create:payments_received"],

  items: ["read:items"],
  itemCreate: ["create:items"],

  jobCards: ["read:job_cards"],
  jobCardCreate: ["create:job_cards"],
  jobCardEdit: ["update:job_cards"],

  inspections: ["read:inspections"],
  inspectionCreate: ["create:inspections"],
  inspectionEdit: ["update:inspections"],

  technicians: ["read:technicians"],

  reminders: ["read:reminders"],
  reminderCreate: ["create:reminders"],
  reminderEdit: ["update:reminders"],

  paperwork: ["read:paperwork"],

  expenses: ["read:expenses"],
  expenseCreate: ["create:expenses"],
  expenseEdit: ["update:expenses"],

  banking: ["read:banking"],

  reports: VIEW_RULES.reports,

  // Settings pages are open to read (D6); these only edit.
  invoiceTemplateEdit: ["update:organization"],
  team: ["read:users"],
  roles: ["read:roles"],
} as const satisfies Record<string, readonly AccessPermission[]>;

export type PageKey = keyof typeof PAGE_ACCESS;
