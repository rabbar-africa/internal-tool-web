import { axios } from "@/lib/axios";
import { buildUrlWithQueryParams } from "@/utils/build-url-query";
import type { ApiResponse } from "@/shared/interface/api";
import type {
  IActivityFilter,
  IActivityPage,
} from "@/shared/interface/activity";

export const getActivity = async (
  filter: IActivityFilter & { cursor?: string },
) => {
  const response = await axios.get<ApiResponse<IActivityPage>>(
    buildUrlWithQueryParams("/activity", filter as Record<string, unknown>),
  );
  return response.data.data;
};
