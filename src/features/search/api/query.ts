import { keepPreviousData } from "@tanstack/react-query";
import { useQuery } from "@/lib/react-query";
import { customQueryKey } from "@/shared/constants/query-keys";
import { searchService } from "./service";

/** Under this the API runs no query, so neither do we. */
export const MIN_QUERY_LENGTH = 2;

/**
 * Quick search. Keeps the last results on screen while the next ones load, so
 * the list doesn't flash empty between keystrokes.
 */
export const useQuickSearchQuery = (q: string) =>
  useQuery({
    queryKey: [customQueryKey.search.quick, q],
    queryFn: ({ signal }) => searchService.search(q, 5, signal),
    enabled: q.length >= MIN_QUERY_LENGTH,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
