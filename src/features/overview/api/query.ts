import { useQuery } from "@tanstack/react-query";
import { customQueryKey } from "@/shared/constants/query-keys";
import { getDashboardAnalytics } from "./service";
import type { DashboardAnalyticsFilter } from "../interface";

export const useGetDashboardAnalyticsQuery = (
  filter?: DashboardAnalyticsFilter,
) => {
  return useQuery({
    queryKey: [customQueryKey.analytics.dashboard, filter],
    queryFn: () => getDashboardAnalytics(filter),
  });
};
