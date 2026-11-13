import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUrlState } from "@/hooks/useUrlState";
import { usePermissions } from "@/hooks/usePermissions";
import type { TableAction } from "@/components/table";
import { RouteConstants } from "@/shared/constants/routes";
import type { JobCard } from "@/shared/interface/job-card";
import { useGetJobCardsQuery } from "../../api/query";
import { toCsvRow } from "./columns";

const FILTER_SCHEMA = {
  page: { defaultValue: 1 },
  limit: { defaultValue: 20 },
  search: { defaultValue: "" },
  status: { defaultValue: "" },
  technicianId: { defaultValue: "" },
};

export function useJobCardList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useUrlState(FILTER_SCHEMA, { replace: true });
  const [searchInput, setSearchInput] = useState(filters.search);
  const [pendingDelete, setPendingDelete] = useState<JobCard | null>(null);
  const { canDelete } = usePermissions();
  const mayDelete = canDelete("job_cards");

  const { data, isLoading, isFetching } = useGetJobCardsQuery({
    page: filters.page,
    limit: filters.limit,
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.technicianId ? { technicianId: filters.technicianId } : {}),
  });

  const jobCards = useMemo(() => data?.data ?? [], [data?.data]);
  const meta = data?.meta;

  const csvData = useMemo(() => jobCards.map(toCsvRow), [jobCards]);

  const tableActions = useMemo<TableAction<JobCard>[]>(
    () => [
      {
        label: "View",
        value: "view",
        onClick: (jobCard) =>
          navigate(RouteConstants.jobCards.detail.generate({ id: jobCard.id })),
      },
      {
        label: "Edit",
        value: "edit",
        onClick: (jobCard) =>
          navigate(RouteConstants.jobCards.edit.generate({ id: jobCard.id })),
      },
      ...(mayDelete
        ? [
            {
              label: "Delete",
              value: "delete",
              variant: "destructive" as const,
              separator: true,
              onClick: (jobCard: JobCard) => setPendingDelete(jobCard),
            },
          ]
        : []),
    ],
    [navigate, mayDelete],
  );

  return {
    jobCards,
    meta,
    isLoading,
    isFetching,
    csvData,

    filters,
    setFilters,
    searchInput,
    setSearchInput,
    handleSearchCommit: (val: string) => setFilters({ search: val, page: 1 }),

    tableActions,
    navigateToDetail: (jobCard: JobCard) =>
      navigate(RouteConstants.jobCards.detail.generate({ id: jobCard.id })),

    pendingDelete,
    closeDelete: () => setPendingDelete(null),
  };
}
