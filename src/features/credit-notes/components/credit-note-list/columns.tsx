import { useMemo } from "react";
import { Link, Text } from "@chakra-ui/react";
import { type ColumnDef } from "@tanstack/react-table";
import { Link as RouterLink } from "react-router-dom";
import moment from "moment";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import { RouteConstants } from "@/shared/constants/routes";
import type { ICreditNote } from "@/shared/interface/credit-note";
import { CreditNoteStatusBadge } from "../CreditNoteStatusBadge";
import {
  CREDIT_NOTE_STATUS_LABELS,
  reasonLabel,
} from "../../utils/credit-note-status";

const formatDay = (value?: string | null) =>
  value ? moment(value).format("DD MMM YYYY") : "—";

/** The note's customer, however it was saved. */
export const creditNoteCustomer = (note: ICreditNote) =>
  note.customerName ?? note.client?.displayName ?? note.client?.company ?? "—";

export function useCreditNoteListColumns(): ColumnDef<ICreditNote>[] {
  const { formatMoney } = useFormatMoney();

  return useMemo<ColumnDef<ICreditNote>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ getValue }) => (
          <Text fontSize="12px" color="gray.300">
            {formatDay(getValue() as string)}
          </Text>
        ),
      },
      {
        accessorKey: "creditNoteNumber",
        header: "Credit Note #",
        cell: ({ getValue }) => (
          <Text
            fontSize="13px"
            color="primary.300"
            fontWeight="700"
            letterSpacing="0.3px"
          >
            {(getValue() as string) || "—"}
          </Text>
        ),
      },
      {
        id: "customer",
        header: "Customer",
        cell: ({ row }) => (
          <Text fontSize="13px" color="gray.500" fontWeight="500">
            {creditNoteCustomer(row.original)}
          </Text>
        ),
      },
      {
        id: "invoice",
        header: "Invoice",
        cell: ({ row }) => {
          const invoice = row.original.invoice;
          if (!invoice) return <Text fontSize="12px">—</Text>;
          return (
            <Link
              asChild
              fontSize="12px"
              color="primary.300"
              fontWeight="600"
              onClick={(e) => e.stopPropagation()}
            >
              <RouterLink
                to={RouteConstants.invoices.detail.generate({ id: invoice.id })}
              >
                {invoice.invoiceNumber}
              </RouterLink>
            </Link>
          );
        },
      },
      {
        accessorKey: "reason",
        header: "Reason",
        cell: ({ getValue }) => (
          <Text fontSize="12px" color="gray.400">
            {reasonLabel(getValue() as string)}
          </Text>
        ),
      },
      {
        accessorKey: "total",
        header: "Amount",
        cell: ({ getValue }) => (
          <Text fontSize="13px" color="gray.500" fontWeight="600">
            {formatMoney(getValue() as string)}
          </Text>
        ),
      },
      {
        accessorKey: "balance",
        header: "Credit Left",
        cell: ({ row }) => {
          const { balance, status } = row.original;
          const left = status === "VOID" ? 0 : Number(balance);
          return (
            <Text
              fontSize="13px"
              color={left > 0 ? "blue.700" : "gray.300"}
              fontWeight={left > 0 ? "600" : "400"}
            >
              {formatMoney(left)}
            </Text>
          );
        },
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <CreditNoteStatusBadge status={row.original.status} />
        ),
      },
    ],
    [formatMoney],
  );
}

export const CREDIT_NOTE_CSV_HEADERS = {
  date: "Date",
  creditNoteNumber: "Credit Note #",
  customer: "Customer",
  invoiceNumber: "Invoice #",
  reason: "Reason",
  total: "Amount",
  balance: "Credit Left",
  status: "Status",
} as const;

export function creditNoteToCsvRow(note: ICreditNote) {
  return {
    date: note.date?.split("T")[0] ?? "",
    creditNoteNumber: note.creditNoteNumber,
    customer: creditNoteCustomer(note),
    invoiceNumber: note.invoice?.invoiceNumber ?? "",
    reason: reasonLabel(note.reason),
    total: note.total,
    balance: note.status === "VOID" ? "0" : note.balance,
    status: CREDIT_NOTE_STATUS_LABELS[note.status] ?? note.status,
  };
}
