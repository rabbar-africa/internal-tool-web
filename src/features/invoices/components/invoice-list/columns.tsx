import { Text } from "@chakra-ui/react";
import { type ColumnDef } from "@tanstack/react-table";
import moment from "moment";
// import { ProfitBadge } from "@/components/common/ProfitBadge";
import { formatCurrency } from "@/utils/calculations";
import type { Invoice, InvoiceStatus } from "@/shared/interface/invoice";
import Status from "@/components/ui/Status";

export const STATUS_STYLES: Record<
  InvoiceStatus,
  { bg: string; color: string }
> = {
  draft: { bg: "gray.100", color: "gray.500" },
  sent: { bg: "blue.50", color: "blue.600" },
  paid: { bg: "green.50", color: "green.600" },
  overdue: { bg: "red.50", color: "red.600" },
  partial: { bg: "orange.50", color: "orange.600" },
  cancelled: { bg: "gray.100", color: "gray.400" },
};

export const STATUS_OPTIONS: { label: string; value: InvoiceStatus | "" }[] = [
  { label: "All", value: "" },
  { label: "Draft", value: "draft" },
  { label: "Sent", value: "sent" },
  { label: "Paid", value: "paid" },
  { label: "Overdue", value: "overdue" },
  { label: "Partial", value: "partial" },
  { label: "Cancelled", value: "cancelled" },
];

export const INVOICE_COLUMNS: ColumnDef<Invoice>[] = [
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
        {formatCurrency(getValue() as number)}
      </Text>
    ),
  },
  {
    accessorKey: "balance",
    header: "Amount Due",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {formatCurrency(getValue() as number)}
      </Text>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue() as InvoiceStatus;
      // const styles = STATUS_STYLES[status];
      return <Status name={status} />;
    },
  },
  // {
  //   id: "profit",
  //   header: "Profit Margin",
  //   cell: ({ row }) => (
  //     <ProfitBadge marginPercent={row.original.marginPercent} showPercent />
  //   ),
  // },
];

export const INVOICE_CSV_HEADERS = {
  invoiceNumber: "Invoice #",
  customerName: "Customer",
  issueDate: "Issue Date",
  dueDate: "Due Date",
  totalAmount: "Total (₦)",
  amountDue: "Amount Due (₦)",
  status: "Status",
  marginPercent: "Margin %",
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
    // marginPercent: `${inv?.marginPercent?.toFixed(1) ?? "0.0"}%`,
  };
}
