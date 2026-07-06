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
