import { useQuery, useMutation, type QueryConfigType } from "@/lib/react-query";
import {
  createAccountTransfer,
  deleteAccountTransfer,
  downloadAccountStatementPdf,
  downloadBusinessStatementPdf,
  emailAccountStatement,
  emailBusinessStatement,
  getAccountStatement,
  getBusinessStatement,
  getAccountTransferById,
  getAccountTransfers,
  updateAccountTransfer,
} from "./service";
import type {
  CreateAccountTransferPayload,
  EmailStatementPayload,
  IGetAccountTransfersFilter,
  StatementRange,
  UpdateAccountTransferPayload,
} from "@/shared/interface/banking";
import { customQueryKey } from "@/shared/constants/query-keys";

const transferKeys = customQueryKey.accountTransfers;

// A transfer moves both accounts' statements.
const transferInvalidations = [
  [transferKeys.getAll],
  [transferKeys.getById],
  [customQueryKey.accountStatements.get],
  [customQueryKey.accountStatements.business],
];

export const useGetAccountTransfersQuery = (
  filter?: IGetAccountTransfersFilter,
  config?: QueryConfigType<typeof getAccountTransfers>,
) =>
  useQuery({
    queryKey: [transferKeys.getAll, filter],
    queryFn: () => getAccountTransfers(filter),
    ...config,
  });

export const useGetAccountTransferByIdQuery = (id: string) =>
  useQuery({
    queryKey: [transferKeys.getById, id],
    queryFn: () => getAccountTransferById(id),
    enabled: Boolean(id),
  });

export const useCreateAccountTransferMutation = () =>
  useMutation({
    mutationFn: (payload: CreateAccountTransferPayload) =>
      createAccountTransfer(payload),
    meta: {
      successMessage: "Transfer recorded",
      invalidatesQueryKeys: transferInvalidations,
    },
  });

export const useUpdateAccountTransferMutation = () =>
  useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateAccountTransferPayload;
    }) => updateAccountTransfer(id, payload),
    meta: {
      successMessage: "Transfer updated",
      invalidatesQueryKeys: transferInvalidations,
    },
  });

export const useDeleteAccountTransferMutation = () =>
  useMutation({
    mutationFn: (id: string) => deleteAccountTransfer(id),
    meta: {
      successMessage: "Transfer deleted",
      invalidatesQueryKeys: transferInvalidations,
    },
  });

// ─── Statements ──────────────────────────────────────────────────────────────

export const useGetAccountStatementQuery = (
  accountId: string,
  range: StatementRange,
  config?: QueryConfigType<typeof getAccountStatement>,
) =>
  useQuery({
    queryKey: [customQueryKey.accountStatements.get, accountId, range],
    queryFn: () => getAccountStatement(accountId, range),
    enabled: Boolean(accountId),
    // Money moves all the time; a statement should never be five minutes old.
    staleTime: 0,
    ...config,
  });

export const useDownloadStatementPdfMutation = () =>
  useMutation({
    mutationFn: ({
      accountId,
      range,
    }: {
      accountId: string;
      range: StatementRange;
    }) => downloadAccountStatementPdf(accountId, range),
  });

/** Emails one account's statement, or the business statement without `accountId`. */
export const useEmailStatementMutation = () =>
  useMutation({
    mutationFn: ({
      accountId,
      payload,
    }: {
      accountId?: string;
      payload: EmailStatementPayload;
    }) =>
      accountId
        ? emailAccountStatement(accountId, payload)
        : emailBusinessStatement(payload),
  });

// ─── Business statement ──────────────────────────────────────────────────────

export const useGetBusinessStatementQuery = (
  range: StatementRange,
  config?: QueryConfigType<typeof getBusinessStatement>,
) =>
  useQuery({
    queryKey: [customQueryKey.accountStatements.business, range],
    queryFn: () => getBusinessStatement(range),
    staleTime: 0,
    ...config,
  });

export const useDownloadBusinessStatementPdfMutation = () =>
  useMutation({
    mutationFn: (range: StatementRange) => downloadBusinessStatementPdf(range),
  });
