import type {
  CreatePaymentPayload,
  IGetPaymentsReceivedFilter,
} from "@/shared/interface/payment";
import { axios } from "@/lib/axios";
import { buildUrlWithQueryParams } from "@/utils/build-url-query";

export const getPayments = async (filter?: IGetPaymentsReceivedFilter) => {
  const baseUrl = "/api/payments-received";
  const apiUrl = buildUrlWithQueryParams(baseUrl, filter || {});
  const response = await axios.get(apiUrl);
  return response.data;
};

export const getPaymentById = async (id: string) => {
  const response = await axios.get(`/api/payments-received/${id}`);
  return response.data;
};

export const deletePayment = async (id: string) => {
  const response = await axios.delete(`/api/payments-received/${id}`);
  return response.data;
};

export const updatePayment = async (data: {
  id: string;
  payload: CreatePaymentPayload;
}) => {
  const { id, payload } = data;
  const response = await axios.put(`/api/payments-received/${id}`, payload);
  return response.data;
};
export const createPayment = async (payload: CreatePaymentPayload) => {
  const response = await axios.post("/api/payments-received", payload);
  return response.data;
};
