import { customQueryKey as k } from "./query-keys";

/**
 * What a change to each kind of record makes out of date, in one place.
 *
 * Records here feed each other's numbers: an invoice's balance shows on its
 * payments, its job card, its customer and the dashboard. Each mutation lists
 * a group below in `meta.invalidatesQueryKeys` instead of picking keys by hand,
 * so one that misses a screen is fixed for every mutation at once.
 *
 * Keys are prefixes, so `[k.invoices.getById]` covers every invoice. Only
 * queries on screen refetch; the rest are just marked stale, so listing more
 * than strictly needed costs nothing until it's looked at.
 */

type QueryKeys = readonly (readonly unknown[])[];

/**
 * The invoices themselves, the expenses that point at their lines, and the
 * quotes they were made from (a deleted or voided invoice can be made again).
 */
const INVOICE_RECORDS = [
  [k.invoices.getAll],
  [k.invoices.getById],
  [k.invoices.outstanding],
  [k.expenses.getAll],
  [k.expenses.getById],
  [k.expenses.invoiceCosts],
  [k.quotations.getAll],
  [k.quotations.getById],
] as const;

/** Quotes, and the job cards and customers that list them. They hold no money. */
const QUOTATION_RECORDS = [
  [k.quotations.getAll],
  [k.quotations.getById],
  [k.quotations.summary],
  [k.jobCards.getById],
] as const;

/** Everything worked out from what's been billed and paid. */
const RECEIVABLES = [
  [k.payments.all],
  [k.jobCards.getAll],
  [k.jobCards.getById],
  [k.jobCards.financials],
  [k.customers.getAll],
  [k.customers.getById],
  [k.customers.stats],
  [k.customers.statement],
  [k.analytics.dashboard],
] as const;

/** Money in and out of the business's accounts. */
const ACCOUNTS = [
  [k.accountStatements.get],
  [k.accountStatements.business],
  [k.analytics.dashboard],
] as const;

/** Spending, and the job-card and invoice profit it comes out of. */
const COSTS = [
  [k.expenses.getAll],
  [k.expenses.getById],
  [k.expenses.invoiceCosts],
  [k.jobCards.getAll],
  [k.jobCards.getById],
  [k.jobCards.financials],
  [k.analytics.dashboard],
] as const;

/** A new document takes the next number, so the next form needs the one after. */
const NUMBER_SERIES = [[k.organizations.transactionSeries]] as const;

const JOB_CARDS = [
  [k.jobCards.getAll],
  [k.jobCards.getById],
  [k.jobCards.financials],
] as const;

const INSPECTIONS = [
  [k.inspections.getAll],
  [k.inspections.getById],
  [k.inspections.vehicleHistory],
] as const;

const join = (...groups: QueryKeys[]): QueryKeys => groups.flat();

export const invalidates = {
  /** Created, edited, written off, recalculated, deleted, or a balance carried. */
  invoice: join(INVOICE_RECORDS, RECEIVABLES),
  invoiceCreated: join(INVOICE_RECORDS, RECEIVABLES, NUMBER_SERIES),

  quotation: join(QUOTATION_RECORDS),
  quotationCreated: join(QUOTATION_RECORDS, NUMBER_SERIES),
  /** Making the invoice is a new invoice as well as a changed quote. */
  quotationConverted: join(
    QUOTATION_RECORDS,
    INVOICE_RECORDS,
    RECEIVABLES,
    NUMBER_SERIES,
  ),

  /** Payments move invoice balances and the account they were paid into. */
  payment: join(INVOICE_RECORDS, RECEIVABLES, ACCOUNTS),
  paymentCreated: join(INVOICE_RECORDS, RECEIVABLES, ACCOUNTS, NUMBER_SERIES),

  expense: join(COSTS, ACCOUNTS),
  expenseCreated: join(COSTS, ACCOUNTS, NUMBER_SERIES),

  /** A transfer moves both accounts' statements. */
  accountTransfer: join(
    [[k.accountTransfers.getAll], [k.accountTransfers.getById]],
    ACCOUNTS,
  ),

  /**
   * Job card edits show on its invoices and expenses (which follow the job
   * card), and linking an invoice moves the job card's billed figures.
   */
  jobCard: join(JOB_CARDS, INVOICE_RECORDS, RECEIVABLES),
  jobCardCreated: join(JOB_CARDS, [[k.analytics.dashboard]], NUMBER_SERIES),
  /** Files and the like, seen only on the job card. */
  jobCardDetail: JOB_CARDS,
  jobCardInspection: join(JOB_CARDS, INSPECTIONS),

  inspection: join(INSPECTIONS, JOB_CARDS),
  inspectionCreated: join(INSPECTIONS, JOB_CARDS, NUMBER_SERIES),

  /** A customer's name and details show on their invoices, job cards and payments. */
  customer: join(
    [[k.customers.getAll], [k.customers.getById], [k.customers.statement]],
    [[k.invoices.getAll], [k.invoices.getById]],
    [[k.payments.all]],
    JOB_CARDS,
  ),
  customerCreated: [[k.customers.getAll]],

  /** Vehicles show on job cards, inspections and expenses. */
  vehicle: join(
    [[k.vehicles.getAll], [k.vehicles.getByClient], [k.vehicles.getById]],
    JOB_CARDS,
    INSPECTIONS,
    [[k.expenses.getAll], [k.expenses.getById]],
  ),

  item: [[k.items.getAll], [k.items.getById], [k.items.getSimple]],

  /** Assigned technicians show on job cards. */
  technician: join(
    [[k.technicians.getAll], [k.technicians.getById]],
    JOB_CARDS,
  ),

  /** An account's name shows on every payment, expense and statement using it. */
  bankAccount: join(
    [[k.organizations.bankAccounts]],
    [[k.payments.all], [k.expenses.getAll], [k.expenses.getById]],
    [[k.accountTransfers.getAll], [k.accountTransfers.getById]],
    ACCOUNTS,
  ),
} satisfies Record<string, QueryKeys>;
