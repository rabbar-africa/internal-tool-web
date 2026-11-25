import { axios } from "@/lib/axios";
import type { ApiResponse } from "@/shared/interface/api";
import type { SearchResponse } from "./types";

export const searchService = {
  /** A few of each kind of record; under 2 letters the API finds nothing. */
  search: async (q: string, limit = 5, signal?: AbortSignal) => {
    const response = await axios.get<ApiResponse<SearchResponse>>("/search", {
      params: { q, limit },
      signal,
    });
    return response.data.data;
  },
};
