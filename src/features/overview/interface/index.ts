export interface DashboardAnalyticsFilter {
  /** Start of the reporting period (ISO date). */
  from?: string;
  /** End of the reporting period (ISO date). */
  to?: string;
  /** Number of months in the revenue trend series (1–36). */
  trendMonths?: number;
}

export interface DashboardPeriod {
  from: string;
  to: string;
}

export interface DashboardSummary {
  /** Confirmed payments received in the period. */
  revenueCollected: number;
  /** Invoice totals in the period (excludes VOID/DELETED). */
  invoiced: number;
  invoiceCount: number;
  /** Unpaid balances (SENT/OVERDUE/PARTIALLY_PAID), all-time. */
  outstandingReceivables: number;
  /** Past due date with a remaining balance. */
  overdue: { amount: number; count: number };
  draftInvoices: number;
  totalCustomers: number;
  /** Clients created in the period. */
  newCustomers: number;
}

export interface InvoiceStatusBreakdownItem {
  status: string;
  count: number;
  amount: number;
}

export interface TopCustomer {
  customerId: string;
  customerName: string;
  total: number;
}

export interface TopDebtor {
  customerId: string;
  customerName: string;
  amountOwed: number;
}

/** Chart-ready monthly bucket — fixed buckets, zero-filled by the API. */
export interface RevenueTrendPoint {
  month: string;
  collected: number;
  invoiced: number;
}

export interface RecentInvoice {
  id: string;
  invoiceNumber?: string;
  customerName?: string;
  status?: string;
  total?: number;
  balance?: number;
  date?: string;
  dueDate?: string;
}

export interface RecentPayment {
  id: string;
  paymentNumber?: string;
  customerName?: string;
  amount?: number;
  date?: string;
}

export interface DashboardAnalytics {
  currency: string;
  period: DashboardPeriod;
  summary: DashboardSummary;
  invoiceStatusBreakdown: InvoiceStatusBreakdownItem[];
  topCustomers: TopCustomer[];
  topDebtors: TopDebtor[];
  revenueTrend: RevenueTrendPoint[];
  recentInvoices: RecentInvoice[];
  recentPayments: RecentPayment[];
}
