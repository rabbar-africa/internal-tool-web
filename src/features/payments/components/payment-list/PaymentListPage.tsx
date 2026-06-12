import { useState } from "react";
import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { type ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { CustomTable, type TableAction } from "@/components/table";
import { SearchInput } from "@/components/input/SearchInput";
import { PageHeader } from "@/components/common/PageHeader";
import { DownloadButton } from "@/components/common/DownloadButton";
import ConsentDialog from "@/components/common/ConsentDialog";
import { RouteConstants } from "@/shared/constants/routes";
import { formatMoney } from "@/hooks/useFormatMoney";
import { useGetPaymentsQuery, useDeletePaymentMutation } from "../../api/query";
import { useReceiptPdf } from "../../hooks/useReceiptPdf";
import type { IPaymentReceived } from "@/shared/interface/payment";
import moment from "moment";
import Status from "@/components/ui/Status";

const MODE_LABELS: Record<string, string> = {
  CASH: "Cash",
  BANK_TRANSFER: "Bank Transfer",
  CARD: "Card",
  MOBILE_MONEY: "Mobile Money",
  CHEQUE: "Cheque",
  ONLINE: "Online",
  OTHER: "Other",
};

const toNum = (v: unknown) => Number(v ?? 0) || 0;
const money = (value: string, currencyCode?: string) =>
  formatMoney(toNum(value), { currencyCode });

const invoiceNumbersOf = (payment: IPaymentReceived): string[] =>
  (payment.allocations ?? [])
    .map((a) => a.invoice?.invoiceNumber)
    .filter(Boolean) as string[];

const columns: ColumnDef<IPaymentReceived>[] = [
  {
    accessorKey: "paymentNumber",
    header: "Payment #",
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
    id: "invoiceNumbers",
    header: "Invoice #",
    cell: ({ row }) => {
      const numbers = invoiceNumbersOf(row.original);
      if (!numbers.length)
        return (
          <Text fontSize="12px" color="gray.300">
            —
          </Text>
        );
      const [first, ...rest] = numbers;
      return (
        <Text fontSize="12px" color="gray.400" fontWeight="500">
          {first}
          {rest.length ? ` +${rest.length}` : ""}
        </Text>
      );
    },
  },
  {
    accessorKey: "customerName",
    header: "Customer",
    cell: ({ row }) => (
      <Text fontSize="13px" color="gray.500" fontWeight="500">
        {row.original.customerName || row.original.client?.displayName || "—"}
      </Text>
    ),
  },
  {
    accessorKey: "mode",
    header: "Mode",
    cell: ({ getValue }) => {
      const mode = getValue() as string;
      return (
        <Box display="inline-flex" bg="gray.50" px="8px" py="3px" rounded="md">
          <Text fontSize="11px" fontWeight="500" color="gray.400">
            {MODE_LABELS[mode] ?? mode}
          </Text>
        </Box>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <Text fontSize="13px" color="gray.500" fontWeight="700">
        {money(row.original.amount, row.original.currencyCode)}
      </Text>
    ),
  },
  {
    accessorKey: "amountApplied",
    header: "Applied",
    cell: ({ row }) => (
      <Text fontSize="13px" color="success.300" fontWeight="500">
        {money(row.original.amountApplied, row.original.currencyCode)}
      </Text>
    ),
  },
  // {
  //   accessorKey: "unusedAmount",
  //   header: "Unused",
  //   cell: ({ row }) => {
  //     const unused = toNum(row.original.unusedAmount);
  //     return (
  //       <Text
  //         fontSize="13px"
  //         color={unused > 0 ? "warning.600" : "gray.300"}
  //         fontWeight={unused > 0 ? "600" : "400"}
  //       >
  //         {money(row.original.unusedAmount, row.original.currencyCode)}
  //       </Text>
  //     );
  //   },
  // },
  {
    accessorKey: "date",
    header: "Date",
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
    accessorKey: "status",
    header: "Status",
    cell: (props) => {
      const status = props.row.original.status;
      return <Status name={status} />;
    },
  },
];

const CSV_HEADERS = {
  paymentNumber: "Payment #",
  invoiceNumbers: "Invoice #",
  referenceNumber: "Reference #",
  customerName: "Customer",
  mode: "Mode",
  amount: "Amount",
  amountApplied: "Applied",
  unusedAmount: "Unused",
  date: "Date",
  status: "Status",
} as const;

export function PaymentListPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useGetPaymentsQuery();
  const { mutateAsync: deletePayment, isPending: isDeleting } =
    useDeletePaymentMutation();
  const { download: downloadReceipt } = useReceiptPdf();
  const [pendingDelete, setPendingDelete] = useState<IPaymentReceived | null>(
    null,
  );

  const payments = (data?.data ?? []) as IPaymentReceived[];

  const actions: TableAction<IPaymentReceived>[] = [
    {
      label: "Edit",
      value: "edit",
      onClick: (row) =>
        navigate(`${RouteConstants.payments.create.path}?paymentId=${row.id}`),
    },
    {
      label: "Download PDF",
      value: "download-pdf",
      onClick: (row) => void downloadReceipt(row),
    },
    {
      label: "Delete",
      value: "delete",
      variant: "destructive",
      separator: true,
      onClick: (row) => setPendingDelete(row),
    },
  ];

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await deletePayment(pendingDelete.id);
    setPendingDelete(null);
  };

  const csvData = payments.map((p) => ({
    paymentNumber: p.paymentNumber,
    invoiceNumbers: invoiceNumbersOf(p).join(", "),
    referenceNumber: p.referenceNumber,
    customerName: p.customerName || p.client?.displayName || "",
    mode: MODE_LABELS[p.mode] ?? p.mode,
    amount: p.amount,
    amountApplied: p.amountApplied,
    unusedAmount: p.unusedAmount,
    date: p.date,
    status: p.status,
  }));

  return (
    <Stack gap="6">
      <PageHeader
        title="Payments Received"
        subtitle="Track all payments received from customers"
        action={
          <Flex gap="2">
            <DownloadButton
              data={csvData}
              filename="payments"
              headers={CSV_HEADERS}
            />
            <Button
              onClick={() => navigate(RouteConstants.payments.create.path)}
            >
              Record Payment
            </Button>
          </Flex>
        }
      />

      <Box
        pt="2rem"
        pb="2rem"
        bg="white"
        px="1rem"
        rounded=".625rem"
        shadow="sm"
        borderWidth="1px"
        borderColor="gray.75"
      >
        <Flex
          justifyContent="space-between"
          alignItems="center"
          mb="1.5rem"
          gap="3"
          direction={{ base: "column", md: "row" }}
        >
          <Box>
            <Text textStyle="large-bold" color="gray.500">
              All Payments
            </Text>
            <Text textStyle="small-regular" color="gray.300">
              Payments received from customers
            </Text>
          </Box>
          <SearchInput placeholder="Search by payment # or customer" />
        </Flex>

        <Box overflowX="auto" maxW="calc(100vw - 310px)">
          <CustomTable
            data={payments}
            columns={columns}
            loading={isLoading}
            actions={actions}
            enableActions
            onRowClick={(row) =>
              navigate(
                RouteConstants.payments.detail.generate({
                  id: row.original.id,
                }),
              )
            }
            tableScrollAreaProps={{ maxW: { base: "xl", lg: "7xl" } }}
          />
        </Box>
      </Box>

      <ConsentDialog
        open={Boolean(pendingDelete)}
        onOpenChange={({ open }) => {
          if (!open) setPendingDelete(null);
        }}
        handleSubmit={confirmDelete}
        heading="Delete payment?"
        note={`This will permanently delete payment ${
          pendingDelete?.paymentNumber || ""
        }. This action cannot be undone.`}
        isLoading={isDeleting}
        confirmText="Yes, Delete"
      />
    </Stack>
  );
}
