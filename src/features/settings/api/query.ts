import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getOrganizationDetails,
  updateOrganizationDetails,
  uploadOrganizationLogo,
} from "./service";
import { customQueryKey } from "@/shared/constants/query-keys";
import type { QueryConfigType } from "@/lib/react-query";

export const useGetOrganizationDetails = (
  config?: QueryConfigType<typeof getOrganizationDetails>,
) => {
  return useQuery({
    queryKey: [customQueryKey.organizations.details],
    queryFn: getOrganizationDetails,
    ...config,
  });
};

export const useUpdateOrganizationDetails = () => {
  return useMutation({
    mutationKey: [customQueryKey.organizations.details],
    mutationFn: updateOrganizationDetails,
    meta: {
      successMessage: "Organization details updated successfully",
      invalidatesQueryKeys: [[customQueryKey.organizations.details]],
    },
  });
};

export const useUploadOrganizationLogo = () => {
  return useMutation({
    mutationFn: uploadOrganizationLogo,
    meta: {
      successMessage: "Logo updated successfully",
      invalidatesQueryKeys: [[customQueryKey.organizations.details]],
    },
  });
};
