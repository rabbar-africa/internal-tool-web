import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUrlState } from "@/hooks/useUrlState";
import { usePermissions } from "@/hooks/usePermissions";
import type { TableAction } from "@/components/table";
import { RouteConstants } from "@/shared/constants/routes";
import type { IQuotation } from "@/shared/interface/quotation";
import {
  useDeleteQuotationMutation,
  useGetQuotationsQuery,
} from "../../api/query";
import { quotationActions } from "../../utils/quotation-status";
import { useQuotationPdf } from "../../hooks/useQuotationPdf";
import { quotationToCsvRow } from "./columns";

const FILTER_SCHEMA = {
  page: { defaultValue: 1 },
  limit: { defaultValue: 20 },
  search: { defaultValue: "" },
  status: { defaultValue: "" },
  dateFrom: { defaultValue: "" },
  dateTo: { defaultValue: "" },
};

export function useQuotationList() {
  const navigate = useNavigate();
  const { has } = usePermissions();
  const canUpdate = has("update:quotations");
  const canDelete = has("delete:quotations");
  const [filters, setFilters] = useUrlState(FILTER_SCHEMA, { replace: true });
  const [searchInput, setSearchInput] = useState(filters.search);
  const [pendingDelete, setPendingDelete] = useState<IQuotation | null>(null);

  const { mutateAsync: deleteQuotation, isPending: isDeleting } =
    useDeleteQuotationMutation();
  const { download } = useQuotationPdf();

  const { data, isLoading, isFetching } = useGetQuotationsQuery({
    page: filters.page,
    limit: filters.limit,
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
    ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
  });

  const quotations = useMemo(() => data?.data ?? [], [data?.data]);
  const meta = data?.meta;
  const csvData = useMemo(
    () => quotations.map(quotationToCsvRow),
    [quotations],
  );

  const toDetail = (quote: IQuotation) =>
    navigate(RouteConstants.quotations.detail.generate({ id: quote.id }));

  const tableActions = useMemo<TableAction<IQuotation>[]>(
    () => [
      { label: "View", value: "view", onClick: toDetail },
      {
        label: "Edit",
        value: "edit",
        hidden: (quote) => !canUpdate || !quotationActions(quote).edit,
        onClick: (quote) =>
          navigate(RouteConstants.quotations.edit.generate({ id: quote.id })),
      },
      {
        label: "Download PDF",
        value: "pdf",
        onClick: (quote) => download(quote),
      },
      {
        label: "Delete",
        value: "delete",
        variant: "destructive",
        separator: true,
        hidden: (quote) => !canDelete || !quotationActions(quote).delete,
        onClick: (quote) => setPendingDelete(quote),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigate, download, canUpdate, canDelete],
  );

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await deleteQuotation(pendingDelete.id);
    setPendingDelete(null);
  };

  return {
    quotations,
    meta,
    isLoading,
    isFetching,
    csvData,
    filters,
    setFilters,
    searchInput,
    setSearchInput,
    handleSearchCommit: (value: string) =>
      setFilters({ search: value, page: 1 }),
    tableActions,
    navigateToDetail: toDetail,
    pendingDelete,
    cancelDelete: () => setPendingDelete(null),
    confirmDelete,
    isDeleting,
  };
}
