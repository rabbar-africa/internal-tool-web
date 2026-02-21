import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { type ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { CustomTable } from "@/components/table";
import { UserDashboardContainer } from "@/components/hoc";
import { SearchInput } from "@/components/input/SearchInput";
import { PageHeader } from "@/components/common/PageHeader";
import { ProfitBadge } from "@/components/common/ProfitBadge";
import { DownloadButton } from "@/components/common/DownloadButton";
import { RouteConstants } from "@/shared/constants/routes";
import { formatCurrency } from "@/utils/calculations";
import { useGetInvoicesQuery } from "../../api/query";
import type { Invoice, InvoiceStatus } from "@/shared/interface/invoice";
import moment from "moment";

const STATUS_STYLES: Record<InvoiceStatus, { bg: string; color: string }> = {
  draft: { bg: "gray.100", color: "gray.500" },
  sent: { bg: "blue.50", color: "blue.600" },
  paid: { bg: "green.50", color: "green.600" },
  overdue: { bg: "red.50", color: "red.600" },
  partial: { bg: "orange.50", color: "orange.600" },
  cancelled: { bg: "gray.100", color: "gray.400" },
};

const columns: ColumnDef<Invoice>[] = [
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
    accessorKey: "customer.name",
    header: "Customer",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {getValue() as string}
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
    accessorKey: "dueDate",
    header: "Due Date",
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
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {formatCurrency(getValue() as number)}
      </Text>
    ),
  },
  {
    accessorKey: "amountDue",
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
  {
    id: "profit",
    header: "Profit Margin",
    cell: ({ row }) => (
      <ProfitBadge marginPercent={row.original.marginPercent} showPercent />
    ),
  },
];

const CSV_HEADERS = {
  invoiceNumber: "Invoice #",
  "customer.name": "Customer",
  issueDate: "Issue Date",
  dueDate: "Due Date",
  totalAmount: "Total (₦)",
  amountDue: "Amount Due (₦)",
  status: "Status",
  marginPercent: "Margin %",
} as const;

export function InvoiceListPage() {
  const navigate = useNavigate();
  const { data: invoices = [], isLoading } = useGetInvoicesQuery();

  const csvData = invoices.map((inv) => ({
    invoiceNumber: inv.invoiceNumber,
    "customer.name": inv.customer.name,
    issueDate: inv.issueDate,
    dueDate: inv.dueDate,
    totalAmount: inv.totalAmount,
    amountDue: inv.amountDue,
    status: inv.status,
    marginPercent: `${inv.marginPercent.toFixed(1)}%`,
  }));

  return (
    <UserDashboardContainer py="1.5rem">
      <Stack gap="6">
        <PageHeader
          title="Invoices"
          subtitle="Manage and track all your invoices"
          action={
            <Flex gap="2">
              <DownloadButton
                data={csvData}
                filename="invoices"
                headers={CSV_HEADERS}
              />
              <Button
                onClick={() => navigate(RouteConstants.invoices.create.path)}
              >
                New Invoice
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
                All Invoices
              </Text>
              <Text textStyle="small-regular" color="gray.300">
                Click a row to view invoice details
              </Text>
            </Box>
            <SearchInput placeholder="Search by invoice # or customer" />
          </Flex>

          <Box overflowX="auto" maxW="calc(100vw - 310px)">
            <CustomTable
              data={invoices}
              columns={columns}
              loading={isLoading}
              onRowClick={(row) =>
                navigate(
                  RouteConstants.invoices.detail.generate({
                    id: row.original?.id,
                  }),
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
