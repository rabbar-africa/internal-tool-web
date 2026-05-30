import { useMemo } from "react";
import { Text } from "@chakra-ui/react";
import { type ColumnDef } from "@tanstack/react-table";
import moment from "moment";
import Status from "@/components/ui/Status";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import type { Invoice, InvoiceStatus } from "@/shared/interface/invoice";

export const STATUS_OPTIONS: { label: string; value: InvoiceStatus | "" }[] = [
  { label: "All", value: "" },
  { label: "Draft", value: "draft" },
  { label: "Sent", value: "sent" },
  { label: "Paid", value: "paid" },
  { label: "Overdue", value: "overdue" },
  { label: "Partial", value: "partial" },
  { label: "Cancelled", value: "cancelled" },
];

export function useInvoiceListColumns(): ColumnDef<Invoice>[] {
  const { formatMoney } = useFormatMoney();

  return useMemo<ColumnDef<Invoice>[]>(
    () => [
      {
        accessorKey: "invoiceNumber",
        header: "Invoice #",
        cell: ({ getValue }) => (
          <Text textStyle="small-regular" color="gray.500" fontWeight="500">
            {getValue() as string}
          </Text>
        ),
      },
      {
        accessorKey: "customerName",
        header: "Customer",
        cell: ({ getValue }) => (
          <Text textStyle="small-regular" color="gray.500">
            {(getValue() as string) ?? "—"}
          </Text>
        ),
      },
      {
        accessorKey: "issueDate",
        header: "Issue Date",
        cell: ({ getValue }) => (
          <Text textStyle="small-regular" color="gray.500">
            {moment(getValue() as string).format("DD MMM YYYY")}
          </Text>
        ),
      },
      {
        accessorKey: "date",
        header: "Due Date",
        cell: ({ getValue }) => (
          <Text textStyle="small-regular" color="gray.500">
            {moment(getValue() as string).format("DD MMM YYYY")}
          </Text>
        ),
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ getValue }) => (
          <Text textStyle="small-regular" color="gray.500" fontWeight="500">
            {formatMoney(getValue() as number | string)}
          </Text>
        ),
      },
      {
        accessorKey: "balance",
        header: "Amount Due",
        cell: ({ getValue }) => (
          <Text textStyle="small-regular" color="gray.500">
            {formatMoney(getValue() as number | string)}
          </Text>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue() as InvoiceStatus;
          return <Status name={status} />;
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
