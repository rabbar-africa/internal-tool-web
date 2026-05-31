import { axios } from "@/lib/axios";
import { type ApiResponse } from "@/shared/interface/api";
import type { IOrganization } from "@/shared/interface/common";
import { type GetOrganizationDetailsResponse } from "@/shared/interface/response";
import type {
  CreateOrgAddressPayload,
  CreateOrgBankAccountPayload,
  CreateOrgCurrencyPayload,
  CreateOrgTaxPayload,
  IOrgAddress,
  IOrgBankAccount,
  IOrgCurrency,
  IOrgTax,
  IOrgTransactionSeries,
  TxnSeriesModule,
  UpsertOrgTransactionSeriesPayload,
} from "@/shared/interface/settings";

// ─── Organization details ────────────────────────────────────────────────────

export const getOrganizationDetails = async () => {
  const response =
    await axios.get<ApiResponse<GetOrganizationDetailsResponse>>(
      "/organizations/me",
    );
  return response.data;
};

export const updateOrganizationDetails = async (
  data: Partial<GetOrganizationDetailsResponse>,
) => {
  const response = await axios.put<ApiResponse<IOrganization>>(
    `/organizations/me`,
    data,
  );
  return response.data;
};

export const uploadOrganizationLogo = async (file: File) => {
  const formData = new FormData();
  formData.append("logo", file);
  const response = await axios.post<ApiResponse<{ logoUrl: string }>>(
    `/organizations/me/logo`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
};

// ─── Addresses ───────────────────────────────────────────────────────────────

export const getOrganizationAddresses = async () => {
  const response = await axios.get<ApiResponse<IOrgAddress[]>>(
    "/organizations/me/addresses",
  );
  return response.data;
};

export const createOrganizationAddress = async (
  payload: CreateOrgAddressPayload,
) => {
  const response = await axios.post<ApiResponse<IOrgAddress>>(
    "/organizations/me/addresses",
    payload,
  );
  return response.data;
};

export const updateOrganizationAddress = async (
  id: string,
  payload: Partial<CreateOrgAddressPayload & { isActive: boolean }>,
) => {
  const response = await axios.put<ApiResponse<IOrgAddress>>(
    `/organizations/me/addresses/${id}`,
    payload,
  );
  return response.data;
};

export const deleteOrganizationAddress = async (id: string) => {
  const response = await axios.delete<ApiResponse<null>>(
    `/organizations/me/addresses/${id}`,
  );
  return response.data;
};

export const setPrimaryOrganizationAddress = async (id: string) => {
  const response = await axios.patch<ApiResponse<IOrgAddress>>(
    `/organizations/me/addresses/${id}/primary`,
  );
  return response.data;
};

// ─── Bank accounts ───────────────────────────────────────────────────────────
// NOTE: not yet exposed in Swagger; follows the same REST convention as
// addresses so it works as soon as the backend ships these routes.

export const getOrganizationBankAccounts = async () => {
  const response = await axios.get<ApiResponse<IOrgBankAccount[]>>(
    "/organizations/me/bank-accounts",
  );
  return response.data;
};

export const createOrganizationBankAccount = async (
  payload: CreateOrgBankAccountPayload,
) => {
  const response = await axios.post<ApiResponse<IOrgBankAccount>>(
    "/organizations/me/bank-accounts",
    payload,
  );
  return response.data;
};

export const updateOrganizationBankAccount = async (
  id: string,
  payload: Partial<CreateOrgBankAccountPayload>,
) => {
  const response = await axios.put<ApiResponse<IOrgBankAccount>>(
    `/organizations/me/bank-accounts/${id}`,
    payload,
  );
  return response.data;
};

export const deleteOrganizationBankAccount = async (id: string) => {
  const response = await axios.delete<ApiResponse<null>>(
    `/organizations/me/bank-accounts/${id}`,
  );
  return response.data;
};

export const setPrimaryOrganizationBankAccount = async (id: string) => {
  const response = await axios.patch<ApiResponse<IOrgBankAccount>>(
    `/organizations/me/bank-accounts/${id}/primary`,
  );
  return response.data;
};

// ─── Currencies ──────────────────────────────────────────────────────────────

export const getOrganizationCurrencies = async () => {
  const response = await axios.get<ApiResponse<IOrgCurrency[]>>(
    "/organizations/me/currencies",
  );
  return response.data;
};

export const createOrganizationCurrency = async (
  payload: CreateOrgCurrencyPayload,
) => {
  const response = await axios.post<ApiResponse<IOrgCurrency>>(
    "/organizations/me/currencies",
    payload,
  );
  return response.data;
};

export const updateOrganizationCurrency = async (
  id: string,
  payload: Partial<
    Omit<CreateOrgCurrencyPayload, "code"> & { isActive: boolean }
  >,
) => {
  const response = await axios.put<ApiResponse<IOrgCurrency>>(
    `/organizations/me/currencies/${id}`,
    payload,
  );
  return response.data;
};

export const deleteOrganizationCurrency = async (id: string) => {
  const response = await axios.delete<ApiResponse<null>>(
    `/organizations/me/currencies/${id}`,
  );
  return response.data;
};

export const setDefaultOrganizationCurrency = async (id: string) => {
  const response = await axios.patch<ApiResponse<IOrgCurrency>>(
    `/organizations/me/currencies/${id}/default`,
  );
  return response.data;
};

// ─── Taxes ───────────────────────────────────────────────────────────────────

export const getOrganizationTaxes = async () => {
  const response = await axios.get<ApiResponse<IOrgTax[]>>(
    "/organizations/me/taxes",
  );
  return response.data;
};

export const createOrganizationTax = async (payload: CreateOrgTaxPayload) => {
  const response = await axios.post<ApiResponse<IOrgTax>>(
    "/organizations/me/taxes",
    payload,
  );
  return response.data;
};

export const updateOrganizationTax = async (
  id: string,
  payload: Partial<CreateOrgTaxPayload & { isActive: boolean }>,
) => {
  const response = await axios.put<ApiResponse<IOrgTax>>(
    `/organizations/me/taxes/${id}`,
    payload,
  );
  return response.data;
};

export const deleteOrganizationTax = async (id: string) => {
  const response = await axios.delete<ApiResponse<null>>(
    `/organizations/me/taxes/${id}`,
  );
  return response.data;
};

// ─── Transaction series ──────────────────────────────────────────────────────

export const getOrganizationTransactionSeries = async () => {
  const response = await axios.get<ApiResponse<IOrgTransactionSeries[]>>(
    "/organizations/me/transaction-series",
  );
  return response.data;
};

export const updateOrganizationTransactionSeries = async (
  module: TxnSeriesModule,
  payload: UpsertOrgTransactionSeriesPayload,
) => {
  const { module: _drop, ...body } = { ...payload, module };
  void _drop;
  const response = await axios.put<ApiResponse<IOrgTransactionSeries>>(
    `/organizations/me/transaction-series/${module}`,
    body,
  );
  return response.data;
};
