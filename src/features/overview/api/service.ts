import { axios } from "@/lib/axios";
import { QUERY_PATH } from "@/shared/constants/query-paths";
import type { ApiResponse } from "@/shared/interface/api";
import type { DashboardAnalytics } from "../interface";

export const getDashboardAnalytics = async (): Promise<DashboardAnalytics> => {
  const response = await axios.get<ApiResponse<DashboardAnalytics>>(
    QUERY_PATH.analytics.dashboard,
  );
  return response.data.data;
};
