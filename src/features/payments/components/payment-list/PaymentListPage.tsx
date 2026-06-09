import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { type ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { CustomTable } from "@/components/table";
import { UserDashboardContainer } from "@/components/hoc";
import { SearchInput } from "@/components/input/SearchInput";
import { PageHeader } from "@/components/common/PageHeader";
import { DownloadButton } from "@/components/common/DownloadButton";
import { RouteConstants } from "@/shared/constants/routes";
import { formatMoney } from "@/hooks/useFormatMoney";
import { useGetPaymentsQuery } from "../../api/query";
import type { IPaymentReceived } from "@/shared/interface/payment";
import moment from "moment";

const MODE_LABELS: Record<string, string> = {
  CASH: "Cash",
  BANK_TRANSFER: "Bank Transfer",
  CARD: "Card",
  MOBILE_MONEY: "Mobile Money",
  CHEQUE: "Cheque",
  ONLINE: "Online",
  OTHER: "Other",
};

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  DRAFT: { bg: "gray.50", color: "gray.500" },
  CONFIRMED: { bg: "green.50", color: "green.600" },
  REFUNDED: { bg: "red.50", color: "red.600" },
  PARTIALLY_REFUNDED: { bg: "orange.50", color: "orange.600" },
};

const money = (value: string, currencyCode?: string) =>
  formatMoney(Number(value ?? 0) || 0, { currencyCode });

const columns: ColumnDef<IPaymentReceived>[] = [
  {
    accessorKey: "paymentNumber",
    header: "Payment #",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {(getValue() as string) || "—"}
      </Text>
    ),
  },
  {
    accessorKey: "referenceNumber",
    header: "Reference #",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {(getValue() as string) || "—"}
      </Text>
    ),
  },
  {
    accessorKey: "customerName",
    header: "Customer",
    cell: ({ row }) => (
      <Text textStyle="small-regular" color="gray.500">
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
        <Text textStyle="small-regular" color="gray.500">
          {MODE_LABELS[mode] ?? mode}
        </Text>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {money(row.original.amount, row.original.currencyCode)}
      </Text>
    ),
  },
  {
    accessorKey: "amountApplied",
    header: "Applied",
    cell: ({ row }) => (
      <Text textStyle="small-regular" color="gray.500">
        {money(row.original.amountApplied, row.original.currencyCode)}
      </Text>
    ),
  },
  {
    accessorKey: "unusedAmount",
    header: "Unused",
    cell: ({ row }) => (
      <Text textStyle="small-regular" color="gray.500">
        {money(row.original.unusedAmount, row.original.currencyCode)}
      </Text>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ getValue }) => {
      const value = getValue() as string;
      return (
        <Text textStyle="small-regular" color="gray.500">
          {value ? moment(value).format("DD MMM YYYY") : "—"}
        </Text>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = (getValue() as string) ?? "";
      const styles = STATUS_STYLES[status] ?? {
        bg: "gray.50",
        color: "gray.500",
      };
      return (
        <Box
          display="inline-flex"
          bg={styles.bg}
          px="10px"
          py="4px"
          rounded="md"
          alignItems="center"
        >
          <Text
            fontSize="12px"
            fontWeight="500"
            color={styles.color}
            textTransform="capitalize"
          >
            {status.toLowerCase().replace(/_/g, " ")}
          </Text>
        </Box>
      );
    },
  },
];

const CSV_HEADERS = {
  paymentNumber: "Payment #",
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

  const payments = (data?.data ?? []) as IPaymentReceived[];

  const csvData = payments.map((p) => ({
    paymentNumber: p.paymentNumber,
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
    <UserDashboardContainer py="1.5rem">
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
              tableScrollAreaProps={{ maxW: { base: "xl", lg: "7xl" } }}
            />
          </Box>
        </Box>
      </Stack>
    </UserDashboardContainer>
  );
}
