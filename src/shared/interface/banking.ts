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
