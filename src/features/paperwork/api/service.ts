import { axios } from "@/lib/axios";
import { buildUrlWithQueryParams } from "@/utils/build-url-query";
import { type ApiResponse } from "@/shared/interface/api";
import type {
  CreatePaperworkPayload,
  IPaperwork,
  PaperworkFileInput,
  RenewPaperworkPayload,
  UpdatePaperworkPayload,
} from "@/shared/interface/paperwork";

export interface PaperworkFilter {
  page?: number;
  limit?: number;
  search?: string;
  clientId?: string;
  vehicleId?: string;
  documentType?: string;
  status?: string;
}

export interface ExpiringPaperworkFilter {
  limit?: number;
  withinDays?: number;
  includeExpired?: boolean;
}

// ── Shared file upload ──────────────────────────────────────────────────────
// Reuses the platform's Cloudinary-backed POST /files/upload (images + PDFs,
// ≤10MB). The controller returns file fields already shaped for our payloads;
// the standard ApiResponse envelope is added by the response interceptor.

export interface FileUploadResponse {
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  folder: string;
  publicId: string;
  format: string;
  resourceType: string;
  width?: number;
  height?: number;
}

/** Uploads one scan and returns it in the shape the `files` payloads expect. */
export const uploadFile = async (
  file: File,
  folder?: string,
): Promise<PaperworkFileInput> => {
  const formData = new FormData();
  formData.append("file", file);
  if (folder) formData.append("folder", folder);

  const response = await axios.post<ApiResponse<FileUploadResponse>>(
    "/files/upload",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  const result = response.data.data;

  return {
    fileUrl: result.fileUrl,
    fileName: result.fileName ?? file.name,
    fileType: result.fileType ?? file.type,
    fileSize: result.fileSize ?? file.size,
  };
};

// ── Paperwork CRUD ──────────────────────────────────────────────────────────

export const getPaperworkList = async (filter?: PaperworkFilter) => {
  const apiUrl = buildUrlWithQueryParams("/paperwork", filter);
  const response = await axios.get<ApiResponse<IPaperwork[]>>(apiUrl);
  return response.data;
};

export const getExpiringPaperwork = async (
  filter?: ExpiringPaperworkFilter,
) => {
  const apiUrl = buildUrlWithQueryParams("/paperwork/expiring", filter);
  const response = await axios.get<ApiResponse<IPaperwork[]>>(apiUrl);
  return response.data;
};

export const getPaperworkById = async (id: string) => {
  const response = await axios.get<ApiResponse<IPaperwork>>(`/paperwork/${id}`);
  return response.data;
};

export const createPaperwork = async (payload: CreatePaperworkPayload) => {
  const response = await axios.post<ApiResponse<IPaperwork>>(
    "/paperwork",
    payload,
  );
  return response.data;
};

export const updatePaperwork = async (
  id: string,
  payload: UpdatePaperworkPayload,
) => {
  const response = await axios.put<ApiResponse<IPaperwork>>(
    `/paperwork/${id}`,
    payload,
  );
  return response.data;
};

export const renewPaperwork = async (
  id: string,
  payload: RenewPaperworkPayload,
) => {
  const response = await axios.post<ApiResponse<IPaperwork>>(
    `/paperwork/${id}/renew`,
    payload,
  );
  return response.data;
};

/** Attach one or more scans to an existing document. */
export const addPaperworkFiles = async (
  id: string,
  files: PaperworkFileInput[],
) => {
  const response = await axios.post<ApiResponse<IPaperwork>>(
    `/paperwork/${id}/files`,
    { files },
  );
  return response.data;
};

export const deletePaperworkFile = async (id: string, fileId: string) => {
  const response = await axios.delete(`/paperwork/${id}/files/${fileId}`);
  return response.data;
};

export const deletePaperwork = async (id: string) => {
  const response = await axios.delete(`/paperwork/${id}`);
  return response.data;
};
