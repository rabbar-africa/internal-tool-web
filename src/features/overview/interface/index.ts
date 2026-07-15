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
  /** Expenses recorded in the period. */
  expenses: number;
  expenseCount: number;
  /** Revenue collected minus expenses for the period. */
  netProfit: number;
  /** Job cards not yet closed/delivered. */
  openJobCards: number;
  /** Job cards created in the period. */
  jobCardsCreated: number;
  totalCustomers: number;
  /** Clients created in the period. */
  newCustomers: number;
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

/** Chart-ready monthly bucket — fixed buckets, zero-filled by the API. */
export interface RevenueTrendPoint {
  month: string;
  collected: number;
  invoiced: number;
  expenses: number;
  profit: number;
}

export interface RecentInvoice {
  id: string;
  invoiceNumber?: string;
  customerName?: string;
  status?: string;
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
  invoiceStatusBreakdown: InvoiceStatusBreakdownItem[];
  jobCardStatusBreakdown: JobCardStatusBreakdownItem[];
  expensesByCategory: ExpenseCategoryItem[];
  topDebtors: TopDebtor[];
  trend: RevenueTrendPoint[];
  recentInvoices: RecentInvoice[];
  recentPayments: RecentPayment[];
  recentJobCards: RecentJobCard[];
}
