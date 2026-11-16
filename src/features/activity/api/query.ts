import { useInfiniteQuery } from "@tanstack/react-query";
import { customQueryKey } from "@/shared/constants/query-keys";
import type { IActivityFilter } from "@/shared/interface/activity";
import { getActivity } from "./service";

/** Newest first, a page at a time ("Load more"). Always asked afresh. */
export const useActivityQuery = (
  filter: IActivityFilter,
  options: { enabled?: boolean } = {},
) =>
  useInfiniteQuery({
    queryKey: [customQueryKey.activity.list, filter],
    queryFn: ({ pageParam }) =>
      getActivity({ ...filter, ...(pageParam ? { cursor: pageParam } : {}) }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    staleTime: 0,
    enabled: options.enabled ?? true,
  });
