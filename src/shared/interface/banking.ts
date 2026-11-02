import type { IBaseFilter } from "./filter";
import type { IAccountRef } from "./settings";

/**
 * Money moved between two of the org's own accounts — banking the till,
 * withdrawing cash, bank to bank. Neither income nor an expense.
 */
export interface IAccountTransfer {
  id: string;
  organizationId: string;
  date: string;
  fromAccountId: string;
  toAccountId: string;
  /** Decimal string from the API — parse with Number() before math. */
  amount: string;
  /** Deposit slip number, bank transaction id… */
  referenceNumber?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  fromAccount: IAccountRef;
  toAccount: IAccountRef;
}

export interface CreateAccountTransferPayload {
  /** YYYY-MM-DD */
  date: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  referenceNumber?: string;
  notes?: string;
}

export type UpdateAccountTransferPayload =
  Partial<CreateAccountTransferPayload>;

export interface IGetAccountTransfersFilter extends IBaseFilter {
  /** Transfers in or out of this account. */
  accountId?: string;
  dateFrom?: string;
  dateTo?: string;
}

// ─── Statements ──────────────────────────────────────────────────────────────

export type StatementEntryKind =
  | "OPENING_BALANCE"
  | "PAYMENT_RECEIVED"
  | "BANK_CHARGE"
  | "EXPENSE"
  | "TRANSFER_IN"
  | "TRANSFER_OUT";

export interface StatementLine {
  kind: StatementEntryKind;
  /** ISO date (midnight UTC) — use the first 10 characters. */
  date: string;
  /** PR-…, EXP-…, a deposit slip number. */
  reference: string | null;
  /** "Payment from Mrs Okafor", "Cash deposited"… */
  title: string;
  /** "Bank transfer · for INV-000123" */
  details: string | null;
  moneyIn: number;
  moneyOut: number;
  /** Running balance after this line. */
  balance: number;
  /** The payment, expense or transfer behind the line, for links. */
  sourceId: string | null;
}

export interface AccountStatement {
  account: IAccountRef;
  currencyCode: string;
  /** YYYY-MM-DD, both ends inclusive. */
  period: { from: string; to: string };
  generatedAt: string;
  /** Brought forward at `period.from`. */
  openingBalance: number;
  closingBalance: number;
  totals: {
    moneyIn: number;
    moneyOut: number;
    byKind: Record<StatementEntryKind, { count: number; amount: number }>;
  };
  lines: StatementLine[];
}

/** YYYY-MM-DD; omitted → this month up to today (Lagos). */
export interface StatementRange {
  from?: string;
  to?: string;
}

export interface EmailStatementPayload extends StatementRange {
  /** Omitted → the signed-in user's own email. */
  email?: string;
}

export interface EmailStatementResponse {
  sentTo: string;
}

// ─── Business statement ─────────────────────────────────────────────────────

/** One account's period, as the business statement lists it. */
export interface BusinessAccountRow {
  id: string;
  type: "BANK" | "CASH";
  label: string;
  isPrimary: boolean;
  openingBalance: number;
  moneyIn: number;
  moneyOut: number;
  closingBalance: number;
  /** The part of money in / out that was a transfer between own accounts. */
  transfersIn: number;
  transfersOut: number;
}

/**
 * The whole business for a period. The screen shows money by account; the
 * PDF adds sales, spending, profit, tax and top customers.
 */
export interface BusinessStatement {
  currencyCode: string;
  period: { from: string; to: string };
  generatedAt: string;
  accounts: {
    rows: BusinessAccountRow[];
    /** Own-account transfers are left out of money in / out (they cancel). */
    total: {
      openingBalance: number;
      moneyIn: number;
      moneyOut: number;
      closingBalance: number;
    };
    /** Payments and expenses recorded with no account (before one existed). */
    unassigned: { moneyIn: number; moneyOut: number } | null;
  };
  sales: {
    invoiceCount: number;
    invoiced: number;
    vatCharged: number;
    writtenOff: number;
    collected: number;
    paymentCount: number;
    owedAtEnd: number;
    salesBeforeTax: number;
  };
  spending: {
    byCategory: Array<{
      category: string;
      label: string;
      count: number;
      amount: number;
    }>;
    expenses: number;
    bankCharges: number;
    total: number;
  };
  profit: {
    onBilled: number;
    onCollected: number;
    salesBeforeTax: number;
    collectedBeforeTax: number;
    spent: number;
  };
  tax: {
    charged: Array<{ name: string; amount: number }>;
    totalCharged: number;
    inCollected: number;
  };
  topCustomers: Array<{ name: string; collected: number; payments: number }>;
}
