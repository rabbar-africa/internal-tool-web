import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUrlState } from "@/hooks/useUrlState";
import type { TableAction } from "@/components/table";
import { RouteConstants } from "@/shared/constants/routes";
import type { JobCard } from "@/shared/interface/job-card";
import { useDeleteJobCardMutation, useGetJobCardsQuery } from "../../api/query";
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

  const { mutateAsync: deleteJobCard, isPending: isDeleting } =
    useDeleteJobCardMutation();

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
      {
        label: "Delete",
        value: "delete",
        variant: "destructive",
        separator: true,
        onClick: (jobCard) => setPendingDelete(jobCard),
      },
    ],
    [navigate],
  );

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await deleteJobCard(pendingDelete.id);
    setPendingDelete(null);
  };

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
    confirmDelete,
    cancelDelete: () => setPendingDelete(null),
    isDeleting,
  };
}
