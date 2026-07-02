import { useQuery } from "@tanstack/react-query";
import { customQueryKey } from "@/shared/constants/query-keys";
import { getDashboardAnalytics } from "./service";

export const useGetDashboardAnalyticsQuery = () => {
  return useQuery({
    queryKey: [customQueryKey.analytics.dashboard],
    queryFn: () => getDashboardAnalytics(),
  });
};
