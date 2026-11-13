import type {
  ClientStats,
  CreateCustomerPayload,
  CustomerStatement,
  CustomerStatementParams,
  ICustomer,
  CustomerEraseImpact,
  CustomerErasureResult,
  EraseCustomerPayload,
  CustomerDeleteImpact,
  CustomerMergePreview,
  CustomerMergeResult,
} from "@/shared/interface/customer";
import { downloadPdf } from "@/utils/download-pdf";
import { axios } from "@/lib/axios";
import { buildUrlWithQueryParams } from "@/utils/build-url-query";
import { type ApiResponse } from "@/shared/interface/api";

export interface CustomerFilter {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  stage?: string;
}

export const getCustomers = async (filter?: CustomerFilter) => {
  const baseUrl = "/clients";
  const apiUrl = buildUrlWithQueryParams(baseUrl, filter);
  const response = await axios.get<ApiResponse<Array<ICustomer>>>(apiUrl);
  return response.data;
};

export const getCustomerById = async (id: string) => {
  const baseUrl = `/clients/${id}`;
  const response = await axios.get(baseUrl);
  return response.data;
};

export const getClientStats = async (id: string): Promise<ClientStats> => {
  const response = await axios.get<ApiResponse<ClientStats>>(
    `/clients/${id}/stats`,
  );
  return response.data.data;
};

export const createCustomer = async (payload: CreateCustomerPayload) => {
  const response = await axios.post<ApiResponse<ICustomer>>(
    "/clients",
    payload,
  );
  return response.data;
};

export const updateCustomer = async (
  id: string,
  payload: Partial<CreateCustomerPayload>,
) => {
  const response = await axios.put(`/clients/${id}`, payload);
  return response.data;
};

// ── Vehicles ──────────────────────────────────────────────────────────────────

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number | null;
  registrationNumber: string | null;
  vin?: string | null;
  color?: string | null;
  clientId: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehiclePayload {
  make: string;
  model: string;
  /** Optional. `null` on update clears it. */
  year?: number | null;
  /** Optional — a car may be logged before its plate is known. */
  registrationNumber?: string | null;
  vin?: string;
  color?: string;
  clientId: string;
}

export const getVehiclesByClient = async (clientId: string) => {
  const response = await axios.get(`/vehicles/by-client/${clientId}`);
  return response.data;
};

export const createVehicle = async (
  payload: CreateVehiclePayload,
): Promise<Vehicle> => {
  const response = await axios.post("/vehicles", payload);
  return response.data;
};

export const updateVehicle = async (
  id: string,
  payload: Partial<Omit<CreateVehiclePayload, "clientId">>,
): Promise<Vehicle> => {
  const response = await axios.put(`/vehicles/${id}`, payload);
  return response.data;
};

export const deleteVehicle = async (id: string): Promise<void> => {
  await axios.delete(`/vehicles/${id}`);
};

export const getCustomerStatement = async (
  clientId: string,
  params: CustomerStatementParams,
) => {
  const response = await axios.get<ApiResponse<CustomerStatement>>(
    `/clients/${clientId}/statement`,
    { params },
  );
  return response.data;
};

/** Called with the same query as the preview, so the two always match. */
export const downloadCustomerStatementPdf = (
  clientId: string,
  params: CustomerStatementParams,
) =>
  downloadPdf(
    `/clients/${clientId}/statement/pdf`,
    params,
    `work-history-${params.from}-to-${params.to}.pdf`,
  );

/** What deleting the customer would touch, and whether it's allowed at all. */
export const getCustomerDeleteImpact = async (id: string) => {
  const response = await axios.get<ApiResponse<CustomerDeleteImpact>>(
    `/clients/${id}/delete-impact`,
  );
  return response.data;
};

/** For duplicates and mistakes: their records stay, unlinked, with the name copied on them. */
export const deleteCustomer = async (
  id: string,
  options: { deleteVehicles?: boolean } = {},
) => {
  const response = await axios.delete(`/clients/${id}`, {
    params: options.deleteVehicles ? { deleteVehicles: true } : {},
  });
  return response.data;
};

/** What merging `id` into `intoId` would move and fill in. */
export const getCustomerMergePreview = async (id: string, intoId: string) => {
  const response = await axios.get<ApiResponse<CustomerMergePreview>>(
    `/clients/${id}/merge-preview`,
    { params: { intoId } },
  );
  return response.data;
};

/** Everything of `id` moves to `intoId`, and `id` is deleted. */
export const mergeCustomer = async (id: string, intoId: string) => {
  const response = await axios.post<ApiResponse<CustomerMergeResult>>(
    `/clients/${id}/merge`,
    { intoId },
  );
  return response.data;
};

/** What erasing the customer would delete, strip of their details, and keep. */
export const getCustomerEraseImpact = async (id: string) => {
  const response = await axios.get<ApiResponse<CustomerEraseImpact>>(
    `/clients/${id}/erase-impact`,
  );
  return response.data;
};

/** For a customer who asked to be forgotten. Can't be undone. */
export const eraseCustomer = async (
  id: string,
  payload: EraseCustomerPayload,
) => {
  const response = await axios.post<ApiResponse<CustomerErasureResult>>(
    `/clients/${id}/erase`,
    payload,
  );
  return response.data;
};
