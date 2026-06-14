import { toaster } from "@/components/ui/toaster";
import { getErrorMessage } from "@/utils/handle-error";
import { MutationCache, QueryClient } from "@tanstack/react-query";
import type {
  UseQueryOptions,
  UseMutationOptions,
  DefaultOptions,
} from "@tanstack/react-query";
import type { AxiosError } from "axios";

export type MutationMeta = {
  successMessage?: string;
  errorMessage?: string;
  /** Each inner array is one query key, e.g. [['contacts'], ['clients', id]] */
  invalidatesQueryKeys?: readonly (readonly unknown[])[];
};

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: MutationMeta;
  }
}

const defaultOptions: DefaultOptions = {
  queries: {
    refetchOnWindowFocus: false,
    retry: false,
    // retry: (failureCount: number, error: unknown) => {
    //   const status = (error as AxiosError).response?.status;
    //   if (status === 404) return false;
    //   return failureCount < 2;
    // },
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30000),
    staleTime: 300_000, // 5 minutes
    gcTime: 3_600_000, // Garbage collect after 1h
    structuralSharing: true,
  },
  mutations: {
    retry: false,
    gcTime: 0, // Immediately GC unused mutations
  },
};

export const queryClient = new QueryClient({
  defaultOptions,
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      // console.log('in global config success');

      if (mutation.meta?.successMessage) {
        toaster.create({
          description: mutation.meta?.successMessage,
          type: "success",
        });
      }
    },
    onError: (error) => {
      // console.log('in global config error');

      toaster.create({
        description: getErrorMessage(error),
        type: "error",
      });
    },
    onSettled: (_data, _error, _variables, _context, mutation) => {
      // console.log('in global config settled');
      // console.log('mutation meta is ', mutation.meta);

      /** 
       * 
       * meta: {
  successMessage: 'Profile updated!',
  invalidatesQueryKeys: [
    // simple key
    [queryKey.auth.getOnboardingStatus],
    // key with dynamic id
    [queryKey.client.getById, clientId],
    // another key
    [queryKey.users.getAllUsers],
  ],
},

      */
      if (mutation?.meta?.invalidatesQueryKeys) {
        mutation.meta.invalidatesQueryKeys.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey: queryKey as unknown[] });
        });
      }
    },
  }),
});

export type ExtractFnReturnType<Fn extends (...args: any) => any> = Awaited<
  ReturnType<Fn>
>;

export type QueryConfigType<Fn extends (...args: any) => Promise<any>> = Omit<
  UseQueryOptions<Awaited<ReturnType<Fn>>, AxiosError>,
  "queryKey" | "queryFn"
>;

export type MutationConfig<Fn extends (...args: any) => Promise<any>> = Omit<
  UseMutationOptions<Awaited<ReturnType<Fn>>, AxiosError, Parameters<Fn>[0]>,
  "mutationFn"
>;

// Export other hooks directly
export {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

// Custom useQuery wrapper that defaults to 'any' instead of 'unknown'
import {
  useQuery as useQueryOriginal,
  type UseQueryOptions as UseQueryOptionsOriginal,
  type UseQueryResult,
} from "@tanstack/react-query";

export function useQuery<
  TQueryFnData = any,
  TError = AxiosError,
  TData = TQueryFnData,
>(
  options: UseQueryOptionsOriginal<TQueryFnData, TError, TData>,
): UseQueryResult<TData, TError> {
  return useQueryOriginal(options);
}
