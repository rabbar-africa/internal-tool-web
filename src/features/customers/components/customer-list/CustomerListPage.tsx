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
import { useGetCustomersQuery } from "../../api/query";
import type {
  Customer,
  CustomerStatus,
  CustomerType,
} from "@/shared/interface/customer";

const TYPE_STYLES: Record<CustomerType, { bg: string; color: string }> = {
  individual: { bg: "blue.50", color: "blue.600" },
  company: { bg: "gray.100", color: "gray.600" },
};

const STATUS_STYLES: Record<CustomerStatus, { bg: string; color: string }> = {
  active: { bg: "green.50", color: "green.600" },
  inactive: { bg: "gray.100", color: "gray.400" },
};

const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {getValue() as string}
      </Text>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {getValue() as string}
      </Text>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {getValue() as string}
      </Text>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {getValue() as string}
      </Text>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ getValue }) => {
      const type = getValue() as CustomerType;
      const styles = TYPE_STYLES[type];
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
            {type}
          </Text>
        </Box>
      );
    },
  },
  {
    accessorKey: "totalInvoices",
    header: "Invoices",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {getValue() as number}
      </Text>
    ),
  },
  {
    accessorKey: "outstandingBalance",
    header: "Outstanding",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {formatCurrency(getValue() as number)}
      </Text>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue() as CustomerStatus;
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
  code: "Code",
  name: "Name",
  email: "Email",
  phone: "Phone",
  type: "Type",
  totalInvoices: "Total Invoices",
  totalRevenue: "Total Revenue (₦)",
  outstandingBalance: "Outstanding (₦)",
  status: "Status",
} as const;

export function CustomerListPage() {
  const navigate = useNavigate();
  const { data: customers = [], isLoading } = useGetCustomersQuery();

  const csvData = customers.map((c) => ({
    code: c.code,
    name: c.name,
    email: c.email,
    phone: c.phone,
    type: c.type,
    totalInvoices: c.totalInvoices,
    totalRevenue: c.totalRevenue,
    outstandingBalance: c.outstandingBalance,
    status: c.status,
  }));

  return (
    <UserDashboardContainer py="1.5rem">
      <Stack gap="6">
        <PageHeader
          title="Customers"
          subtitle="Manage your customer database"
          action={
            <Flex gap="2">
              <DownloadButton
                data={csvData}
                filename="customers"
                headers={CSV_HEADERS}
              />
              <Button
                onClick={() => navigate(RouteConstants.customers.create.path)}
              >
                Add Customer
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
                All Customers
              </Text>
              <Text textStyle="small-regular" color="gray.300">
                Click a row to view customer details
              </Text>
            </Box>
            <SearchInput placeholder="Search by name or email" />
          </Flex>

          <Box overflowX="auto" maxW="calc(100vw - 310px)">
            <CustomTable
              data={customers}
              columns={columns}
              loading={isLoading}
              onRowClick={(row) =>
                navigate(
                  RouteConstants.customers.detail.generate({ id: row.id }),
                )
              }
              tableScrollAreaProps={{ maxW: { base: "xl", lg: "7xl" } }}
            />
          </Box>
        </Box>
      </Stack>
    </UserDashboardContainer>
  );
}
