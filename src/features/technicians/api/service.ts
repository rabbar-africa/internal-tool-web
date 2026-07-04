import { axios } from "@/lib/axios";
import { buildUrlWithQueryParams } from "@/utils/build-url-query";
import { type ApiResponse } from "@/shared/interface/api";
import type {
  CreateTechnicianPayload,
  IGetTechnicianFilter,
  Technician,
  UpdateTechnicianPayload,
} from "@/shared/interface/technician";

export const getTechnicians = async (filter?: IGetTechnicianFilter) => {
  const apiUrl = buildUrlWithQueryParams("/technicians", filter);
  const response = await axios.get<ApiResponse<Technician[]>>(apiUrl);
  return response.data;
};

export const getTechnicianById = async (id: string) => {
  const response = await axios.get<ApiResponse<Technician>>(
    `/technicians/${id}`,
  );
  return response.data;
};

export const createTechnician = async (payload: CreateTechnicianPayload) => {
  const response = await axios.post<ApiResponse<Technician>>(
    "/technicians",
    payload,
  );
  return response.data;
};

export const updateTechnician = async (
  id: string,
  payload: UpdateTechnicianPayload,
) => {
  const response = await axios.put<ApiResponse<Technician>>(
    `/technicians/${id}`,
    payload,
  );
  return response.data;
};

export const deleteTechnician = async (id: string): Promise<void> => {
  await axios.delete(`/technicians/${id}`);
};
