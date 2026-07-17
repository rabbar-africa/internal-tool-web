import { useMemo } from "react";
import { Text } from "@chakra-ui/react";
import { type ColumnDef } from "@tanstack/react-table";
import moment from "moment";
import Status from "@/components/ui/Status";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import type { Invoice, InvoiceStatus } from "@/shared/interface/invoice";
import { InvoiceStatusDto } from "@/shared/interface/invoice";

const toNum = (v: unknown) => Number(v ?? 0) || 0;

// Values are sent verbatim to the API, so they must be the backend enum names.
// DELETED is omitted — soft-deleted invoices aren't part of the browsable list.
export const STATUS_OPTIONS: { label: string; value: InvoiceStatusDto | "" }[] =
  [
    { label: "All", value: "" },
    { label: "Draft", value: InvoiceStatusDto.DRAFT },
    { label: "Sent", value: InvoiceStatusDto.SENT },
    { label: "Partially Paid", value: InvoiceStatusDto.PARTIALLY_PAID },
    { label: "Paid", value: InvoiceStatusDto.PAID },
    { label: "Overdue", value: InvoiceStatusDto.OVERDUE },
    { label: "Void", value: InvoiceStatusDto.VOID },
    { label: "Written Off", value: InvoiceStatusDto.WRITTEN_OFF },
    { label: "Closed", value: InvoiceStatusDto.CLOSED },
  ];

export function useInvoiceListColumns(): ColumnDef<Invoice>[] {
  const { formatMoney } = useFormatMoney();

  return useMemo<ColumnDef<Invoice>[]>(
    () => [
      {
        accessorKey: "invoiceNumber",
        header: "Invoice #",
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
        accessorKey: "customerName",
        header: "Customer",
        cell: ({ getValue }) => (
          <Text fontSize="13px" color="gray.500" fontWeight="500">
            {(getValue() as string) ?? "—"}
          </Text>
        ),
      },
      {
        accessorKey: "date",
        header: "Issue Date",
        cell: ({ getValue }) => {
          const value = getValue() as string;
          return (
            <Text fontSize="12px" color="gray.300">
              {value ? moment(value).format("DD MMM YYYY") : "—"}
            </Text>
          );
        },
      },
      {
        accessorKey: "dueDate",
        header: "Due Date",
        cell: ({ getValue, row }) => {
          const value = getValue() as string;
          const isOverdue = row.original.status === "overdue";
          return (
            <Text
              fontSize="12px"
              color={isOverdue ? "error.300" : "gray.300"}
              fontWeight={isOverdue ? "600" : "400"}
            >
              {value ? moment(value).format("DD MMM YYYY") : "—"}
            </Text>
          );
        },
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ getValue }) => (
          <Text fontSize="13px" color="gray.400">
            {formatMoney(getValue() as number | string)}
          </Text>
        ),
      },
      {
        accessorKey: "balance",
        header: "Amount Due",
        cell: ({ getValue, row }) => {
          const balance = toNum(getValue());
          const isPaid = balance <= 0;
          const isOverdue = row.original.status === "overdue";
          return (
            <Text
              fontSize="13px"
              fontWeight="700"
              color={
                isPaid ? "success.300" : isOverdue ? "error.300" : "gray.500"
              }
            >
              {isPaid ? "Paid" : formatMoney(getValue() as number | string)}
            </Text>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue() as InvoiceStatus;
          return <Status name={status} px={".25rem"} />;
        },
      },
    ],
    [formatMoney],
  );
}

export const INVOICE_CSV_HEADERS = {
  invoiceNumber: "Invoice #",
  customerName: "Customer",
  issueDate: "Issue Date",
  dueDate: "Due Date",
  totalAmount: "Total",
  amountDue: "Amount Due",
  status: "Status",
} as const;

export function toCsvRow(inv: Invoice) {
  return {
    invoiceNumber: inv.invoiceNumber,
    customerName: inv.customer?.name ?? "",
    issueDate: inv.issueDate,
    dueDate: inv.dueDate,
    totalAmount: inv.totalAmount,
    amountDue: inv.amountDue,
    status: inv.status,
  };
}
