import { axios } from "@/lib/axios";
import { type ApiResponse } from "@/shared/interface/api";
import type { IOrganization } from "@/shared/interface/common";
import { type GetOrganizationDetailsResponse } from "@/shared/interface/response";

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
