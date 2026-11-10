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

/**
 * Each section is null when the caller's roles don't cover it: the API leaves
 * it out rather than send numbers the screen must hide (revenue needs
 * `read:payments_received`, invoice figures `read:invoices`, expenses and
 * profit `read:expenses`, job cards `read:job_cards`, customers `read:clients`).
 */
export interface DashboardSummary {
  /** Confirmed payments received in the period. */
  revenueCollected: number | null;
  /** Invoice totals in the period (excludes VOID/DELETED). */
  invoiced: number | null;
  invoiceCount: number | null;
  /** Unpaid balances (SENT/OVERDUE/PARTIALLY_PAID), all-time. */
  outstandingReceivables: number | null;
  /** Past due date with a remaining balance. */
  overdue: { amount: number; count: number } | null;
  /** Expenses recorded in the period. */
  expenses: number | null;
  expenseCount: number | null;
  /** Revenue collected minus expenses for the period. */
  netProfit: number | null;
  /** Job cards not yet closed/delivered. */
  openJobCards: number | null;
  /** Job cards created in the period. */
  jobCardsCreated: number | null;
  totalCustomers: number | null;
  /** Clients created in the period. */
  newCustomers: number | null;
}

export interface InvoiceStatusBreakdownItem {
  status: string;
  count: number;
  amount: number;
}

export interface JobCardStatusBreakdownItem {
  status: string;
  count: number;
}

export interface ExpenseCategoryItem {
  category: string;
  count: number;
  amount: number;
}

export interface TopDebtor {
  customerId: string;
  customerName: string;
  amountOwed: number;
  /** Due date of their oldest unpaid invoice. Null if it has no due date. */
  oldestDueDate: string | null;
  /** Days past `oldestDueDate`, server-computed. Zero or less = not yet due. */
  daysOverdue: number;
}

/**
 * Chart-ready monthly bucket — fixed buckets, zero-filled by the API. A field
 * is null for every month when the caller can't see it (see DashboardSummary).
 */
export interface RevenueTrendPoint {
  month: string;
  collected: number | null;
  invoiced: number | null;
  expenses: number | null;
  profit: number | null;
}

export interface RecentInvoice {
  id: string;
  invoiceNumber?: string;
  customerName?: string;
  status?: string;
  displayStatus?: string;
  total?: number | string;
  balance?: number | string;
  currencyCode?: string;
  date?: string;
  dueDate?: string;
}

export interface RecentPayment {
  id: string;
  paymentNumber?: string;
  customerName?: string;
  amount?: number | string;
  mode?: string;
  status?: string;
  currencyCode?: string;
  date?: string;
}

export interface RecentJobCard {
  id: string;
  jobNumber?: string;
  customerName?: string;
  vehicleRegistrationNumber?: string;
  status?: string;
  priority?: string;
  openedAt?: string;
  createdAt?: string;
}

export interface DashboardAnalytics {
  currency: string;
  period: DashboardPeriod;
  summary: DashboardSummary;
  invoiceStatusBreakdown: InvoiceStatusBreakdownItem[] | null;
  jobCardStatusBreakdown: JobCardStatusBreakdownItem[] | null;
  expensesByCategory: ExpenseCategoryItem[] | null;
  topDebtors: TopDebtor[] | null;
  trend: RevenueTrendPoint[];
  recentInvoices: RecentInvoice[] | null;
  recentPayments: RecentPayment[] | null;
  recentJobCards: RecentJobCard[] | null;
}
