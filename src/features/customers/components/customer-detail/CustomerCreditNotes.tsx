import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CustomTable } from "@/components/table";
import { RouteConstants } from "@/shared/constants/routes";
import { useGetCreditNotesQuery } from "@/features/credit-notes/api/query";
import { useCreditNoteListColumns } from "@/features/credit-notes/components/credit-note-list/columns";

const scrollAreaProps = { maxW: { base: "xl", lg: "7xl" } };

/**
 * The customer's credit notes. Mounted only for roles that can read them, so
 * the request never goes out otherwise.
 */
export function CustomerCreditNotes({ customerId }: { customerId: string }) {
  const navigate = useNavigate();
  const allColumns = useCreditNoteListColumns();
  // Every row is this customer's: the column would only repeat their name.
  const columns = useMemo(
    () => allColumns.filter((column) => column.id !== "customer"),
    [allColumns],
  );
  const { data, isLoading } = useGetCreditNotesQuery({
    customerId,
    limit: 100,
  });

  return (
    <CustomTable
      data={data?.data ?? []}
      columns={columns}
      loading={isLoading}
      onRowClick={(row) =>
        navigate(
          RouteConstants.creditNotes.detail.generate({ id: row.original.id }),
        )
      }
      tableScrollAreaProps={scrollAreaProps}
    />
  );
}
