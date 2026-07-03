import { axios } from "@/lib/axios";
import { QUERY_PATH } from "@/shared/constants/query-paths";
import type { ApiResponse } from "@/shared/interface/api";
import { buildUrlWithQueryParams } from "@/utils/build-url-query";
import type {
  DashboardAnalytics,
  DashboardAnalyticsFilter,
} from "../interface";

export const getDashboardAnalytics = async (
  filter?: DashboardAnalyticsFilter,
): Promise<DashboardAnalytics> => {
  const url = buildUrlWithQueryParams(QUERY_PATH.analytics.dashboard, filter);
  const response = await axios.get<ApiResponse<DashboardAnalytics>>(url);
  return response.data.data;
};
