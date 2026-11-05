import type {
  CreatePaymentPayload,
  IGetPaymentsReceivedFilter,
  IPaymentReceived,
} from "@/shared/interface/payment";
import { axios } from "@/lib/axios";
import { buildUrlWithQueryParams } from "@/utils/build-url-query";
import { type ApiResponse } from "@/shared/interface/api";

export const getPayments = async (filter?: IGetPaymentsReceivedFilter) => {
  const baseUrl = "/payments-received";
  const apiUrl = buildUrlWithQueryParams(baseUrl, filter || {});
  const response =
    await axios.get<ApiResponse<Array<IPaymentReceived>>>(apiUrl);
  return response.data;
};

/** The payment's receipt PDF, rendered by the API. */
export const getReceiptPdf = async (id: string): Promise<Blob> => {
  const response = await axios.get<Blob>(
    `/payments-received/${id}/receipt/pdf`,
    {
      responseType: "blob",
    },
  );
  return new Blob([response.data], { type: "application/pdf" });
};

export const getPaymentById = async (id: string) => {
  const response = await axios.get<ApiResponse<IPaymentReceived>>(
    `/payments-received/${id}`,
  );
  return response.data;
};

export const deletePayment = async (id: string) => {
  const response = await axios.delete(`/payments-received/${id}`);
  return response.data;
};

export const updatePayment = async (data: {
  id: string;
  payload: CreatePaymentPayload;
}) => {
  const { id, payload } = data;
  const response = await axios.put(`/payments-received/${id}`, payload);
  return response.data;
};

export const createPayment = async (payload: CreatePaymentPayload) => {
  const response = await axios.post("/payments-received", payload);
  return response.data;
};
