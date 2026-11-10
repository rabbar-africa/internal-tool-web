import { toaster } from "@/components/ui/toaster";
import {
  getErrorMessage,
  getPlanLock,
  isPermissionDenied,
  PERMISSION_DENIED_MESSAGE,
} from "@/utils/handle-error";
import { getToken } from "@/utils/persistToken";
import { customQueryKey } from "@/shared/constants/query-keys";
import { RouteConstants } from "@/shared/constants/routes";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
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

/**
 * A permission refusal means the screen was drawn from stale permissions (an
 * admin changed the user's role), so fetch them again and let the UI redraw.
 * At most every 10s: a page firing several refused requests at once needs
 * one refresh, not several racing ones.
 */
let lastPermissionRefresh = 0;
function refreshPermissions() {
  const now = Date.now();
  if (now - lastPermissionRefresh < 10_000) return;
  lastPermissionRefresh = now;
  queryClient.invalidateQueries({ queryKey: [customQueryKey.user.getMe] });
}

export const queryClient = new QueryClient({
  defaultOptions,
  // Reads stay quiet on a refusal (the page shows its own empty or error
  // state); they only refresh the permissions behind it.
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (
        isPermissionDenied(error) &&
        query.queryKey[0] !== customQueryKey.user.getMe
      ) {
        refreshPermissions();
      }
    },
  }),
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

      // Refused by the role: say so plainly, and redraw from fresh permissions.
      const denied = isPermissionDenied(error);
      if (denied) refreshPermissions();

      // Refused by the plan: say why, and offer the way out if there is one.
      const planLock = getPlanLock(error);
      toaster.create({
        description: denied
          ? PERMISSION_DENIED_MESSAGE
          : (planLock?.message ?? getErrorMessage(error)),
        type: "error",
        ...(planLock?.canUpgrade
          ? {
              duration: 10_000,
              action: {
                label: "Upgrade",
                onClick: () =>
                  window.location.assign(RouteConstants.settings.billing.path),
              },
            }
          : {}),
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
      // Anything saved or deleted can change what's used of the plan's limits,
      // and a refusal means the screen's numbers were stale. Doing it here
      // means no create or delete can forget to.
      if (getToken()?.accessToken) {
        queryClient.invalidateQueries({
          queryKey: [customQueryKey.user.getCurrentSubscription],
        });
      }

      // Groups overlap, and invalidating a key twice cancels the first
      // refetch to start another, so each key goes once.
      const seen = new Set<string>();
      mutation?.meta?.invalidatesQueryKeys?.forEach((queryKey) => {
        const id = JSON.stringify(queryKey);
        if (seen.has(id)) return;
        seen.add(id);
        queryClient.invalidateQueries({ queryKey: queryKey as unknown[] });
      });
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
