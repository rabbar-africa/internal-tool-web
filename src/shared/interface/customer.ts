export type CustomerType = "individual" | "company";
export type CustomerStatus = "active" | "inactive";

export interface ICustomer {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  company: string;
  phone: string;
  stage: string;
  displayName: string;
  email: string;
  jobTitle: string | null;
  type: string | null;
  consultedBy: string | null;
  source: string | null;
  affiliate: string | null;
  lastConsultationDate: string | null;
  referralSource: string | null;
  utmSource: string | null;
  utmCampaign: string | null;
  utmMedium: string | null;
  utmContent: string | null;
  organizationId: string;
  country: string | null;
  state: string | null;
  city: string | null;
  dob: string | null;
  postalCode: string | null;
  address: string | null;
  updatedAt: string;
  createdAt: string;
  emailMarketingConsent: boolean;
  status: CustomerStatus;
}

export interface ClientStatsInvoiceRef {
  id: string;
  invoiceNumber: string;
  date: string;
  total: number;
  balance: number;
  status: string;
}

export interface ClientStatsPaymentRef {
  id: string;
  paymentNumber: string;
  date: string;
  amount: number;
}

export interface ClientStats {
  clientId: string;
  currency: string;
  /** LTV — confirmed money actually collected (excl. soft-deleted payments). */
  lifetimeValue: number;
  /** Sum of invoice totals (excl. VOID/DELETED). */
  totalInvoiced: number;
  invoiceCount: number;
  paidInvoiceCount: number;
  /** totalInvoiced / invoiceCount. */
  averageInvoiceValue: number;
  /** Unpaid balance across open invoices. */
  outstanding: number;
  /** Open invoices past their due date. */
  overdue: { amount: number; count: number };
  lastInvoice: ClientStatsInvoiceRef | null;
  lastPayment: ClientStatsPaymentRef | null;
}

export interface CreateCustomerPayload {
  email: string;
  phone: string;
  type: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  displayName: string;
  firstName: string;
  lastName: string;
  stage: string;

  notes?: string;
}

// ─── Customer statement (work history) ───────────────────────────────────────

/** `work` has no money at all; `account` has no work. */
export type CustomerStatementView = "work" | "both" | "account";
export type CustomerStatementDetail = "short" | "full";

export interface CustomerStatementParams {
  /** YYYY-MM-DD, inclusive. */
  from: string;
  to: string;
  show: CustomerStatementView;
  detail: CustomerStatementDetail;
  vehicleId?: string;
}

export interface CustomerStatement {
  title: string;
  view: CustomerStatementView;
  detail: CustomerStatementDetail;
  currencyCode: string;
  period: { from: string; to: string };
  generatedAt: string;
  customer: {
    id: string;
    name: string;
    company: string | null;
    phone: string | null;
    email: string | null;
  };
  /** The vehicle filter, if any. */
  vehicle: { id: string; label: string } | null;
  activity: {
    jobCount: number;
    vehicleCount: number;
    firstVisit: string | null;
    lastVisit: string | null;
  };
  /** Null in the work view. */
  account: null | {
    /** A negative `closingBalance` means the customer is in credit. */
    summary: {
      openingBalance: number;
      billed: number;
      paid: number;
      writtenOff: number;
      closingBalance: number;
    };
    transactions: Array<{
      kind: "INVOICE" | "PAYMENT" | "WRITE_OFF";
      date: string;
      document: string;
      details: string | null;
      billed: number;
      paid: number;
      balance: number;
    }>;
  };
  /** For whoever is sending it: these never appear on the PDF. */
  warnings: { unlinkedInvoices: number; sameNameCustomers: number };
}

// ─── Erasing a customer (they asked to be forgotten) ────────────────────────

/** `GET /clients/:id/erase-impact`: what erasing would do. */
export interface CustomerEraseImpact {
  customer: { id: string; name: string };
  /** Deleted for good. */
  erase: {
    customer: number;
    vehicles: number;
    paperwork: number;
    reminders: number;
    files: number;
  };
  /** Kept, with the customer's details removed. */
  anonymise: {
    jobCards: number;
    inspections: number;
    invoiceAddresses: number;
  };
  /** Kept as they are, because tax law requires them. */
  keep: { invoices: number; paymentsReceived: number };
  /** Records carrying the same name but not linked, so left alone. */
  warnings: {
    unlinkedSameName: {
      invoices: number;
      jobCards: number;
      inspections: number;
    };
  };
}

export interface EraseCustomerPayload {
  /** The customer's name; case and extra spaces don't matter. */
  confirmName: string;
  /** Optional; must not name the customer. */
  reason?: string;
}

/** What erasing actually did. */
export interface CustomerErasureResult {
  erasureId: string;
  erasedAt: string;
  erased: {
    customer: number;
    vehicles: number;
    paperwork: number;
    reminders: number;
  };
  anonymised: {
    jobCards: number;
    inspections: number;
    invoiceAddresses: number;
  };
  kept: { invoices: number; paymentsReceived: number };
  files: { deleted: number; notFound: number; skipped: number; failed: number };
}
