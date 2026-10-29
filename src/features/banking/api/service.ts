import { axios } from "@/lib/axios";
import { buildUrlWithQueryParams } from "@/utils/build-url-query";
import type { ApiResponse } from "@/shared/interface/api";
import type {
  CreateAccountTransferPayload,
  IAccountTransfer,
  IGetAccountTransfersFilter,
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
