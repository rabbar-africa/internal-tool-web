import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { type ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { CustomTable } from "@/components/table";
import { UserDashboardContainer } from "@/components/hoc";
import { SearchInput } from "@/components/input/SearchInput";
import { PageHeader } from "@/components/common/PageHeader";
import { DownloadButton } from "@/components/common/DownloadButton";
import { RouteConstants } from "@/shared/constants/routes";
import { formatCurrency } from "@/utils/calculations";
import { useGetPaymentsQuery } from "../../api/query";
import type { Payment, PaymentStatus } from "@/shared/interface/payment";
import { PAYMENT_METHOD_LABELS } from "@/shared/interface/payment";
import moment from "moment";

const STATUS_STYLES: Record<PaymentStatus, { bg: string; color: string }> = {
  completed: { bg: "green.50", color: "green.600" },
  pending: { bg: "orange.50", color: "orange.600" },
  failed: { bg: "red.50", color: "red.600" },
};

const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "paymentNumber",
    header: "Payment #",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {getValue() as string}
      </Text>
    ),
  },
  {
    accessorKey: "invoiceNumber",
    header: "Invoice #",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {getValue() as string}
      </Text>
    ),
  },
  {
    accessorKey: "customer.name",
    header: "Customer",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {getValue() as string}
      </Text>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {formatCurrency(getValue() as number)}
      </Text>
    ),
  },
  {
    accessorKey: "paymentMethod",
    header: "Method",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {PAYMENT_METHOD_LABELS[getValue() as Payment["paymentMethod"]]}
      </Text>
    ),
  },
  {
    accessorKey: "paymentDate",
    header: "Date",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {moment(getValue() as string).format("DD MMM YYYY")}
      </Text>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue() as PaymentStatus;
      const styles = STATUS_STYLES[status];
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
            {status}
          </Text>
        </Box>
      );
    },
  },
];

const CSV_HEADERS = {
  paymentNumber: "Payment #",
  invoiceNumber: "Invoice #",
  "customer.name": "Customer",
  amount: "Amount (₦)",
  paymentMethod: "Method",
  paymentDate: "Date",
  status: "Status",
} as const;

export function PaymentListPage() {
  const navigate = useNavigate();
  const { data: payments = [], isLoading } = useGetPaymentsQuery();

  const csvData = payments.map((p) => ({
    paymentNumber: p.paymentNumber,
    invoiceNumber: p.invoiceNumber,
    "customer.name": p.customer.name,
    amount: p.amount,
    paymentMethod: PAYMENT_METHOD_LABELS[p.paymentMethod],
    paymentDate: p.paymentDate,
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
