import { axios } from "@/lib/axios";
import { buildUrlWithQueryParams } from "@/utils/build-url-query";
import { type ApiResponse } from "@/shared/interface/api";
import type {
  AssignTechnicianPayload,
  AttachJobCardFilePayload,
  CreateJobCardPayload,
  IGetJobCardFilter,
  JobCard,
  JobCardDetail,
  JobCardFile,
  JobCardFinancials,
  JobCardStatus,
  JobCardTechnician,
  UpdateJobCardPayload,
} from "@/shared/interface/job-card";

// ── Core CRUD ────────────────────────────────────────────────────────────────

export const getJobCards = async (filter?: IGetJobCardFilter) => {
  const apiUrl = buildUrlWithQueryParams("/job-cards", filter);
  const response = await axios.get<ApiResponse<JobCard[]>>(apiUrl);
  return response.data;
};

export const getJobCardById = async (id: string) => {
  const response = await axios.get<ApiResponse<JobCardDetail>>(
    `/job-cards/${id}`,
  );
  return response.data;
};

export const getJobCardFinancials = async (id: string) => {
  const response = await axios.get<ApiResponse<JobCardFinancials>>(
    `/job-cards/${id}/financials`,
  );
  return response.data.data;
};

export const createJobCard = async (payload: CreateJobCardPayload) => {
  const response = await axios.post<ApiResponse<JobCard>>(
    "/job-cards",
    payload,
  );
  return response.data;
};

export const updateJobCard = async (
  id: string,
  payload: UpdateJobCardPayload,
) => {
  const response = await axios.put<ApiResponse<JobCard>>(
    `/job-cards/${id}`,
    payload,
  );
  return response.data;
};

export const updateJobCardStatus = async (
  id: string,
  status: JobCardStatus,
  closedAt?: string,
) => {
  const response = await axios.patch<ApiResponse<JobCard>>(
    `/job-cards/${id}/status`,
    { status, ...(closedAt ? { closedAt } : {}) },
  );
  return response.data;
};

export const deleteJobCard = async (id: string): Promise<void> => {
  await axios.delete(`/job-cards/${id}`);
};

// ── Technician assignment ────────────────────────────────────────────────────

export const assignJobCardTechnician = async (
  jobCardId: string,
  payload: AssignTechnicianPayload,
) => {
  const response = await axios.post<ApiResponse<JobCardTechnician>>(
    `/job-cards/${jobCardId}/technicians`,
    payload,
  );
  return response.data;
};

export const unassignJobCardTechnician = async (
  jobCardId: string,
  technicianId: string,
): Promise<void> => {
  await axios.delete(`/job-cards/${jobCardId}/technicians/${technicianId}`);
};

// ── Files ────────────────────────────────────────────────────────────────────

export const attachJobCardFile = async (
  jobCardId: string,
  payload: AttachJobCardFilePayload,
) => {
  const response = await axios.post<ApiResponse<JobCardFile>>(
    `/job-cards/${jobCardId}/files`,
    payload,
  );
  return response.data;
};

export const removeJobCardFile = async (
  jobCardId: string,
  fileId: string,
): Promise<void> => {
  await axios.delete(`/job-cards/${jobCardId}/files/${fileId}`);
};

// ── Linking existing invoices / inspections ─────────────────────────────────

export const linkJobCardInvoice = async (
  jobCardId: string,
  invoiceId: string,
) => {
  const response = await axios.post(
    `/job-cards/${jobCardId}/invoices/${invoiceId}`,
  );
  return response.data;
};

export const unlinkJobCardInvoice = async (
  jobCardId: string,
  invoiceId: string,
) => {
  const response = await axios.delete(
    `/job-cards/${jobCardId}/invoices/${invoiceId}`,
  );
  return response.data;
};

export const linkJobCardInspection = async (
  jobCardId: string,
  inspectionId: string,
) => {
  const response = await axios.post(
    `/job-cards/${jobCardId}/inspections/${inspectionId}`,
  );
  return response.data;
};

export const unlinkJobCardInspection = async (
  jobCardId: string,
  inspectionId: string,
) => {
  const response = await axios.delete(
    `/job-cards/${jobCardId}/inspections/${inspectionId}`,
  );
  return response.data;
};
