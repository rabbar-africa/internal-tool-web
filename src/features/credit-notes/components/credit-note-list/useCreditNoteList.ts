import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUrlState } from "@/hooks/useUrlState";
import { usePermissions } from "@/hooks/usePermissions";
import type { TableAction } from "@/components/table";
import { RouteConstants } from "@/shared/constants/routes";
import type {
  CreditNoteStatus,
  ICreditNote,
} from "@/shared/interface/credit-note";
import {
  useDeleteCreditNoteMutation,
  useGetCreditNotesQuery,
} from "../../api/query";
import { creditNoteActions } from "../../utils/credit-note-status";
import { useCreditNotePdf } from "../../hooks/useCreditNotePdf";
import { creditNoteToCsvRow } from "./columns";

const FILTER_SCHEMA = {
  page: { defaultValue: 1 },
  limit: { defaultValue: 20 },
  search: { defaultValue: "" },
  status: { defaultValue: "" },
  dateFrom: { defaultValue: "" },
  dateTo: { defaultValue: "" },
};

export function useCreditNoteList() {
  const navigate = useNavigate();
  const { has } = usePermissions();
  const canUpdate = has("update:credit_notes");
  const canDelete = has("delete:credit_notes");
  const [filters, setFilters] = useUrlState(FILTER_SCHEMA, { replace: true });
  const [searchInput, setSearchInput] = useState(filters.search);
  const [pendingDelete, setPendingDelete] = useState<ICreditNote | null>(null);

  const { mutateAsync: deleteNote, isPending: isDeleting } =
    useDeleteCreditNoteMutation();
  const { download } = useCreditNotePdf();

  const { data, isLoading, isFetching } = useGetCreditNotesQuery({
    page: filters.page,
    limit: filters.limit,
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.status ? { status: filters.status as CreditNoteStatus } : {}),
    ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
    ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
  });

  const creditNotes = useMemo(() => data?.data ?? [], [data?.data]);
  const meta = data?.meta;
  const csvData = useMemo(
    () => creditNotes.map(creditNoteToCsvRow),
    [creditNotes],
  );

  const toDetail = (note: ICreditNote) =>
    navigate(RouteConstants.creditNotes.detail.generate({ id: note.id }));

  const tableActions = useMemo<TableAction<ICreditNote>[]>(
    () => [
      { label: "View", value: "view", onClick: toDetail },
      {
        label: "Edit",
        value: "edit",
        hidden: (note) => !canUpdate || !creditNoteActions(note).edit,
        onClick: (note) =>
          navigate(RouteConstants.creditNotes.edit.generate({ id: note.id })),
      },
      {
        label: "Download PDF",
        value: "pdf",
        onClick: (note) => download(note),
      },
      {
        label: "Delete",
        value: "delete",
        variant: "destructive",
        separator: true,
        hidden: (note) => !canDelete || !creditNoteActions(note).delete,
        onClick: (note) => setPendingDelete(note),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigate, download, canUpdate, canDelete],
  );

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await deleteNote(pendingDelete.id);
    setPendingDelete(null);
  };

  return {
    creditNotes,
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
