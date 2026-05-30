import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { RowSelectionState } from "@tanstack/react-table";
import { useUrlState } from "@/hooks/useUrlState";
import type { TableAction } from "@/components/table";
import { RouteConstants } from "@/shared/constants/routes";
import type { Invoice } from "@/shared/interface/invoice";
import { downloadInvoicePdf } from "../../api/service";
import {
  useDeleteInvoiceMutation,
  useGetAllInvoicesQuery,
} from "../../api/query";
import { toCsvRow } from "./columns";

const FILTER_SCHEMA = {
  page: { defaultValue: 1 },
  limit: { defaultValue: 20 },
  search: { defaultValue: "" },
  status: { defaultValue: "" },
  dueDateFrom: { defaultValue: "" },
  dueDateTo: { defaultValue: "" },
};

export function useInvoiceList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useUrlState(FILTER_SCHEMA, { replace: true });
  const [searchInput, setSearchInput] = useState(filters.search);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pendingDelete, setPendingDelete] = useState<Invoice | null>(null);

  const { mutateAsync: deleteInvoice, isPending: isDeleting } =
    useDeleteInvoiceMutation();

  const { data, isLoading, isFetching } = useGetAllInvoicesQuery({
    page: filters.page,
    limit: filters.limit,
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.dueDateFrom ? { dateFrom: filters.dueDateFrom } : {}),
    ...(filters.dueDateTo ? { dateTo: filters.dueDateTo } : {}),
  });

  const invoices = useMemo(() => data?.data ?? [], [data?.data]);
  const meta = data?.meta;

  const selectedInvoices = useMemo(
    () => invoices.filter((inv) => rowSelection[inv.id]),
    [invoices, rowSelection],
  );

  const csvData = useMemo(
    () =>
      (selectedInvoices.length > 0 ? selectedInvoices : invoices).map(toCsvRow),
    [invoices, selectedInvoices],
  );

  const tableActions = useMemo<TableAction<Invoice>[]>(
    () => [
      {
        label: "View",
        value: "view",
        onClick: (invoice) =>
          navigate(RouteConstants.invoices.detail.generate({ id: invoice.id })),
      },
      {
        label: "Edit",
        value: "edit",
        onClick: (invoice) =>
          navigate(RouteConstants.invoices.detail.generate({ id: invoice.id })),
      },
      {
        label: "Download PDF",
        value: "pdf",
        onClick: (invoice) =>
          downloadInvoicePdf(invoice.id, invoice.invoiceNumber),
      },
      {
        label: "Delete",
        value: "delete",
        variant: "destructive",
        separator: true,
        onClick: (invoice) => setPendingDelete(invoice),
      },
    ],
    [navigate],
  );

  const confirmDelete = async (id: string) => {
    await deleteInvoice(id);
    setPendingDelete(null);
    setRowSelection((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const cancelDelete = () => setPendingDelete(null);

  const handleSearchCommit = (val: string) =>
    setFilters({ search: val, page: 1 });

  return {
    // data
    invoices,
    meta,
    isLoading,
    isFetching,
    csvData,
    selectedInvoices,

    // filters
    filters,
    setFilters,
    searchInput,
    setSearchInput,
    handleSearchCommit,

    // selection
    rowSelection,
    setRowSelection,

    // actions
    tableActions,
    navigateToDetail: (invoice: Invoice) =>
      navigate(RouteConstants.invoices.detail.generate({ id: invoice.id })),

    // delete
    pendingDelete,
    confirmDelete,
    cancelDelete,
    isDeleting,
  };
}
