import { useState } from "react";
import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { type ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { CustomTable, type TableAction } from "@/components/table";
import { SearchInput } from "@/components/input/SearchInput";
import { PageHeader } from "@/components/common/PageHeader";
import { ExportMenu } from "@/features/exports/components";
import ConsentDialog from "@/components/common/ConsentDialog";
import { RouteConstants } from "@/shared/constants/routes";
import { formatMoney } from "@/hooks/useFormatMoney";
import {
  useGetPaymentsQuery,
  useDeletePaymentMutation,
} from "@/features/payments/api/query";
import { useReceiptPdf } from "@/features/payments/hooks/useReceiptPdf";
import {
  AccountFilterSelect,
  formatAccountLabel,
} from "@/features/settings/components/account-details/AccountSelect";
import { useUrlState } from "@/hooks/useUrlState";
import type { IPaymentReceived } from "@/shared/interface/payment";
import moment from "moment";
import {
  MODE_LABELS,
  PAYMENT_CSV_HEADERS,
  invoiceNumbersOf,
  paymentToCsvRow,
} from "@/features/payments/utils/payment-csv";
import Status from "@/components/ui/Status";

const toNum = (v: unknown) => Number(v ?? 0) || 0;
const money = (value: string, currencyCode?: string) =>
  formatMoney(toNum(value), { currencyCode });

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
    id: "depositToAccount",
    header: "Paid Into",
    cell: ({ row }) => {
      const account = row.original.depositToAccount;
      return (
        <Text textStyle="small-regular" color="gray.500">
          {account ? formatAccountLabel(account) : "—"}
        </Text>
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

const FILTER_SCHEMA = {
  depositToAccountId: { defaultValue: "" },
};

export function PaymentListTemplate() {
  const navigate = useNavigate();
  const [filters, setFilters] = useUrlState(FILTER_SCHEMA, { replace: true });
  const { data, isLoading } = useGetPaymentsQuery(
    filters.depositToAccountId
      ? { depositToAccountId: filters.depositToAccountId }
      : undefined,
  );
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

  return (
    <Stack gap="6">
      <PageHeader
        title="Payments Received"
        subtitle="Track all payments received from customers"
        action={
          <Flex gap="2">
            <ExportMenu
              data={payments.map(paymentToCsvRow)}
              filename="payments"
              headers={PAYMENT_CSV_HEADERS}
              module="payments_received"
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
        pt={{ base: ".875rem", lg: "2rem" }}
        pb={{ base: ".875rem", lg: "2rem" }}
        bg="white"
        px="1rem"
        rounded=".625rem"
        shadow="sm"
        borderWidth="1px"
        borderColor="gray.75"
      >
        <Flex
          justifyContent="space-between"
          alignItems={{ base: "unset", lg: "center" }}
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
          <Flex
            gap="3"
            direction={{ base: "column", md: "row" }}
            align={{ base: "stretch", md: "center" }}
          >
            <AccountFilterSelect
              value={filters.depositToAccountId}
              onChange={(id) => setFilters({ depositToAccountId: id })}
            />
            <SearchInput
              width={{ base: "100%", md: "21rem" }}
              placeholder="Search by payment # or customer"
            />
          </Flex>
        </Flex>

        <Box overflowX="auto" minW={0}>
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
