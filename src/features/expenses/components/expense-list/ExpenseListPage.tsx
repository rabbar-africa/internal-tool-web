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
import { useGetExpensesQuery } from "../../api/query";
import type {
  Expense,
  ExpenseCategory,
  ExpenseStatus,
} from "@/shared/interface/expense";
import { EXPENSE_CATEGORY_LABELS } from "@/shared/interface/expense";
import moment from "moment";

const CATEGORY_STYLES: Record<ExpenseCategory, { bg: string; color: string }> =
  {
    parts: { bg: "blue.50", color: "blue.600" },
    labour: { bg: "purple.50", color: "purple.600" },
    overhead: { bg: "gray.100", color: "gray.600" },
    utilities: { bg: "cyan.50", color: "cyan.600" },
    marketing: { bg: "pink.50", color: "pink.600" },
    transport: { bg: "orange.50", color: "orange.600" },
    other: { bg: "gray.50", color: "gray.500" },
  };

const STATUS_STYLES: Record<ExpenseStatus, { bg: string; color: string }> = {
  pending: { bg: "orange.50", color: "orange.600" },
  approved: { bg: "green.50", color: "green.600" },
  rejected: { bg: "red.50", color: "red.600" },
};

const columns: ColumnDef<Expense>[] = [
  {
    accessorKey: "expenseNumber",
    header: "Expense #",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {getValue() as string}
      </Text>
    ),
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {getValue() as string}
      </Text>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ getValue }) => {
      const category = getValue() as ExpenseCategory;
      const styles = CATEGORY_STYLES[category];
      return (
        <Box
          display="inline-flex"
          bg={styles.bg}
          px="10px"
          py="4px"
          rounded="md"
          alignItems="center"
        >
          <Text fontSize="12px" fontWeight="500" color={styles.color}>
            {EXPENSE_CATEGORY_LABELS[category]}
          </Text>
        </Box>
      );
    },
  },
  {
    accessorKey: "vendor",
    header: "Vendor",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {(getValue() as string) || "—"}
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
    accessorKey: "expenseDate",
    header: "Date",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {moment(getValue() as string).format("DD MMM YYYY")}
      </Text>
    ),
  },
  {
    accessorKey: "linkedInvoiceNumber",
    header: "Linked Invoice",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {(getValue() as string | undefined) ?? "—"}
      </Text>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue() as ExpenseStatus;
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
  expenseNumber: "Expense #",
  title: "Title",
  category: "Category",
  vendor: "Vendor",
  amount: "Amount (₦)",
  expenseDate: "Date",
  linkedInvoiceNumber: "Linked Invoice",
  status: "Status",
} as const;

export function ExpenseListPage() {
  const navigate = useNavigate();
  const { data: expenses = [], isLoading } = useGetExpensesQuery();

  const csvData = expenses.map((exp) => ({
    expenseNumber: exp.expenseNumber,
    title: exp.title,
    category: EXPENSE_CATEGORY_LABELS[exp.category],
    vendor: exp.vendor ?? "",
    amount: exp.amount,
    expenseDate: exp.expenseDate,
    linkedInvoiceNumber: exp.linkedInvoiceNumber ?? "",
    status: exp.status,
  }));

  return (
    <UserDashboardContainer py="1.5rem">
      <Stack gap="6">
        <PageHeader
          title="Expense Tracking"
          subtitle="Record and monitor all business expenses"
          action={
            <Flex gap="2">
              <DownloadButton
                data={csvData}
                filename="expenses"
                headers={CSV_HEADERS}
              />
              <Button
                onClick={() => navigate(RouteConstants.expenses.create.path)}
              >
                Add Expense
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
                All Expenses
              </Text>
              <Text textStyle="small-regular" color="gray.300">
                Track all your business expenses
              </Text>
            </Box>
            <SearchInput placeholder="Search by title or vendor" />
          </Flex>

          <Box overflowX="auto" maxW="calc(100vw - 310px)">
            <CustomTable
              data={expenses}
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
