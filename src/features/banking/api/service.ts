import { axios } from "@/lib/axios";
import { buildUrlWithQueryParams } from "@/utils/build-url-query";
import type { ApiResponse } from "@/shared/interface/api";
import { createDownloadLink } from "@/utils/file-helper";
import type {
  AccountStatement,
  BusinessStatement,
  CreateAccountTransferPayload,
  EmailStatementPayload,
  EmailStatementResponse,
  IAccountTransfer,
  IGetAccountTransfersFilter,
  StatementRange,
  UpdateAccountTransferPayload,
} from "@/shared/interface/banking";

export const getAccountTransfers = async (
  filter?: IGetAccountTransfersFilter,
) => {
  const apiUrl = buildUrlWithQueryParams("/account-transfers", filter);
  const response = await axios.get<ApiResponse<IAccountTransfer[]>>(apiUrl);
  return response.data;
};

export const getAccountTransferById = async (id: string) => {
  const response = await axios.get<ApiResponse<IAccountTransfer>>(
    `/account-transfers/${id}`,
  );
  return response.data;
};

export const createAccountTransfer = async (
  payload: CreateAccountTransferPayload,
) => {
  const response = await axios.post<ApiResponse<IAccountTransfer>>(
    "/account-transfers",
    payload,
  );
  return response.data;
};

export const updateAccountTransfer = async (
  id: string,
  payload: UpdateAccountTransferPayload,
) => {
  const response = await axios.put<ApiResponse<IAccountTransfer>>(
    `/account-transfers/${id}`,
    payload,
  );
  return response.data;
};

/** Soft delete server-side. */
export const deleteAccountTransfer = async (id: string) => {
  const response = await axios.delete<ApiResponse<null>>(
    `/account-transfers/${id}`,
  );
  return response.data;
};

// ─── Statements ──────────────────────────────────────────────────────────────

const statementUrl = (accountId: string) =>
  `/organizations/me/bank-accounts/${accountId}/statement`;

export const getAccountStatement = async (
  accountId: string,
  range: StatementRange = {},
) => {
  const response = await axios.get<ApiResponse<AccountStatement>>(
    statementUrl(accountId),
    { params: range },
  );
  return response.data;
};

/** `attachment; filename="statement-cash-….pdf"` → the filename. */
const filenameFrom = (disposition: unknown): string | null => {
  if (typeof disposition !== "string") return null;
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
  return match ? decodeURIComponent(match[1]) : null;
};

/** Saves a statement PDF under the server's filename. */
const downloadStatementPdf = async (url: string, range: StatementRange) => {
  const response = await axios.get<Blob>(`${url}/pdf`, {
    params: range,
    responseType: "blob",
  });
  const filename =
    filenameFrom(response.headers["content-disposition"]) ??
    `statement-${range.from ?? ""}-to-${range.to ?? ""}.pdf`;
  createDownloadLink(
    new Blob([response.data], { type: "application/pdf" }),
    filename,
  );
};

export const downloadAccountStatementPdf = (
  accountId: string,
  range: StatementRange = {},
) => downloadStatementPdf(statementUrl(accountId), range);

export const emailAccountStatement = async (
  accountId: string,
  payload: EmailStatementPayload,
) => {
  const response = await axios.post<ApiResponse<EmailStatementResponse>>(
    `${statementUrl(accountId)}/email`,
    payload,
  );
  return response.data;
};

// ─── Business statement ──────────────────────────────────────────────────────

const BUSINESS_STATEMENT_URL = "/organizations/me/business-statement";

export const getBusinessStatement = async (range: StatementRange = {}) => {
  const response = await axios.get<ApiResponse<BusinessStatement>>(
    BUSINESS_STATEMENT_URL,
    { params: range },
  );
  return response.data;
};

export const downloadBusinessStatementPdf = (range: StatementRange = {}) =>
  downloadStatementPdf(BUSINESS_STATEMENT_URL, range);

export const emailBusinessStatement = async (
  payload: EmailStatementPayload,
) => {
  const response = await axios.post<ApiResponse<EmailStatementResponse>>(
    `${BUSINESS_STATEMENT_URL}/email`,
    payload,
  );
  return response.data;
};
