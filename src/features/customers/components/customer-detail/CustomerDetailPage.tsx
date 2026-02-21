import { Box, Button, Flex, Grid, Stack, Tabs, Text } from "@chakra-ui/react";
import { type ColumnDef } from "@tanstack/react-table";
import { useParams, useNavigate } from "react-router-dom";
import { CustomTable } from "@/components/table";
import { UserDashboardContainer } from "@/components/hoc";
import { StatCard } from "@/components/common/StatCard";
import { ProfitBadge } from "@/components/common/ProfitBadge";
import { RouteConstants } from "@/shared/constants/routes";
import { formatCurrency } from "@/utils/calculations";
import { useGetCustomerByIdQuery } from "../../api/query";
import { MOCK_INVOICES, MOCK_PAYMENTS } from "@/shared/data/mock";
import type { Invoice } from "@/shared/interface/invoice";
import type { Payment } from "@/shared/interface/payment";
import moment from "moment";

const invoiceColumns: ColumnDef<Invoice>[] = [
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
    accessorKey: "issueDate",
    header: "Date",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {moment(getValue() as string).format("DD MMM YYYY")}
      </Text>
    ),
  },
  {
    accessorKey: "totalAmount",
    header: "Total",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {formatCurrency(getValue() as number)}
      </Text>
    ),
  },
  {
    accessorKey: "amountDue",
    header: "Due",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {formatCurrency(getValue() as number)}
      </Text>
    ),
  },
  {
    id: "profit",
    header: "Margin",
    cell: ({ row }) => (
      <ProfitBadge marginPercent={row.original.marginPercent} showPercent />
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => (
      <Text
        textStyle="small-regular"
        color="gray.500"
        textTransform="capitalize"
      >
        {getValue() as string}
      </Text>
    ),
  },
];

const paymentColumns: ColumnDef<Payment>[] = [
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
    accessorKey: "amount",
    header: "Amount",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {formatCurrency(getValue() as number)}
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
    cell: ({ getValue }) => (
      <Text
        textStyle="small-regular"
        color="gray.500"
        textTransform="capitalize"
      >
        {getValue() as string}
      </Text>
    ),
  },
];

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: customer, isLoading } = useGetCustomerByIdQuery(id ?? "");

  const customerInvoices = MOCK_INVOICES.filter((inv) => inv.customerId === id);
  const customerPayments = MOCK_PAYMENTS.filter((p) => p.customerId === id);
  const totalPaid = customerPayments.reduce((s, p) => s + p.amount, 0);

  if (isLoading) {
    return (
      <UserDashboardContainer py="1.5rem">
        <Text>Loading customer...</Text>
      </UserDashboardContainer>
    );
  }

  if (!customer) {
    return (
      <UserDashboardContainer py="1.5rem">
        <Text>Customer not found.</Text>
      </UserDashboardContainer>
    );
  }

  return (
    <UserDashboardContainer py="1.5rem">
      <Stack gap="6">
        {/* Header */}
        <Flex
          justify="space-between"
          align={{ base: "flex-start", sm: "center" }}
          direction={{ base: "column", sm: "row" }}
          gap="3"
        >
          <Box>
            <Text textStyle="h3-bold" color="gray.500">
              {customer.name}
            </Text>
            <Text textStyle="small-regular" color="gray.300">
              {customer.code}
            </Text>
          </Box>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(RouteConstants.customers.base.path)}
          >
            Back to Customers
          </Button>
        </Flex>

        {/* Info Card */}
        <Box
          bg="white"
          p="6"
          rounded=".625rem"
          shadow="sm"
          borderWidth="1px"
          borderColor="gray.75"
        >
          <Grid
            templateColumns={{ base: "1fr", md: "1fr 1fr", lg: "1fr 1fr 1fr" }}
            gap="4"
          >
            <Box>
              <Text fontSize="11px" color="gray.300" mb="1">
                Email
              </Text>
              <Text fontSize="14px" color="gray.500">
                {customer.email}
              </Text>
            </Box>
            <Box>
              <Text fontSize="11px" color="gray.300" mb="1">
                Phone
              </Text>
              <Text fontSize="14px" color="gray.500">
                {customer.phone}
              </Text>
            </Box>
            <Box>
              <Text fontSize="11px" color="gray.300" mb="1">
                Type
              </Text>
              <Box
                display="inline-flex"
                bg={customer.type === "company" ? "gray.100" : "blue.50"}
                px="10px"
                py="4px"
                rounded="md"
              >
                <Text
                  fontSize="12px"
                  fontWeight="500"
                  color={customer.type === "company" ? "gray.600" : "blue.600"}
                  textTransform="capitalize"
                >
                  {customer.type}
                </Text>
              </Box>
            </Box>
            {customer.address && (
              <Box>
                <Text fontSize="11px" color="gray.300" mb="1">
                  Address
                </Text>
                <Text fontSize="14px" color="gray.500">
                  {[
                    customer.address,
                    customer.city,
                    customer.state,
                    customer.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </Text>
              </Box>
            )}
            <Box>
              <Text fontSize="11px" color="gray.300" mb="1">
                Status
              </Text>
              <Box
                display="inline-flex"
                bg={customer.status === "active" ? "green.50" : "gray.100"}
                px="10px"
                py="4px"
                rounded="md"
              >
                <Text
                  fontSize="12px"
                  fontWeight="500"
                  color={
                    customer.status === "active" ? "green.600" : "gray.400"
                  }
                  textTransform="capitalize"
                >
                  {customer.status}
                </Text>
              </Box>
            </Box>
            <Box>
              <Text fontSize="11px" color="gray.300" mb="1">
                Customer Since
              </Text>
              <Text fontSize="14px" color="gray.500">
                {moment(customer.createdAt).format("DD MMM YYYY")}
              </Text>
            </Box>
          </Grid>
        </Box>

        {/* Overview Stats */}
        <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr 1fr" }} gap="4">
          <StatCard
            label="Total Paid"
            value={formatCurrency(totalPaid)}
            iconBg="green.50"
            icon={
              <Text fontSize="18px" fontWeight="700" color="green.500">
                ₦
              </Text>
            }
          />
          <StatCard
            label="Outstanding Balance"
            value={formatCurrency(customer.outstandingBalance)}
            iconBg="orange.50"
            icon={
              <Text fontSize="18px" fontWeight="700" color="orange.500">
                !
              </Text>
            }
          />
          <StatCard
            label="Total Invoices"
            value={String(customer.totalInvoices)}
            iconBg="blue.50"
            icon={
              <Text fontSize="18px" fontWeight="700" color="blue.500">
                #
              </Text>
            }
          />
        </Grid>

        {/* Tabs */}
        <Box
          bg="white"
          rounded=".625rem"
          shadow="sm"
          borderWidth="1px"
          borderColor="gray.75"
        >
          <Tabs.Root defaultValue="invoices">
            <Tabs.List px="4" pt="4">
              <Tabs.Trigger value="invoices">
                Invoices ({customerInvoices.length})
              </Tabs.Trigger>
              <Tabs.Trigger value="payments">
                Payments ({customerPayments.length})
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="invoices" px="4" pb="4">
              <CustomTable
                data={customerInvoices}
                columns={invoiceColumns}
                loading={false}
                tableScrollAreaProps={{ maxW: { base: "xl", lg: "7xl" } }}
              />
            </Tabs.Content>

            <Tabs.Content value="payments" px="4" pb="4">
              <CustomTable
                data={customerPayments}
                columns={paymentColumns}
                loading={false}
                tableScrollAreaProps={{ maxW: { base: "xl", lg: "7xl" } }}
              />
            </Tabs.Content>
          </Tabs.Root>
        </Box>
      </Stack>
    </UserDashboardContainer>
  );
}
