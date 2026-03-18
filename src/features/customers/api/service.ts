import type {
  CreateCustomerPayload,
  ICustomer,
} from "@/shared/interface/customer";
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

export const createCustomer = async (payload: CreateCustomerPayload) => {
  const response = await axios.post("/clients", payload);
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
  year: number;
  registrationNumber: string;
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
  year: number;
  registrationNumber: string;
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
