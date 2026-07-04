import { useMemo, useState } from "react";
import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { type ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { CustomTable, type TableAction } from "@/components/table";
import { SearchInput } from "@/components/input/SearchInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import { DateField } from "@/components/input/DateField";
import { PageHeader } from "@/components/common/PageHeader";
import { DownloadButton } from "@/components/common/DownloadButton";
import ConsentDialog from "@/components/common/ConsentDialog";
import { RouteConstants } from "@/shared/constants/routes";
import { formatCurrency } from "@/utils/calculations";
import { useUrlState } from "@/hooks/useUrlState";
import {
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_CATEGORY_OPTIONS,
  type Expense,
  type ExpenseCategory,
} from "@/shared/interface/expense";
import { useDeleteExpenseMutation, useGetExpensesQuery } from "../api/query";

const CATEGORY_STYLES: Record<ExpenseCategory, { bg: string; color: string }> =
  {
    PARTS: { bg: "blue.50", color: "blue.600" },
    SUBLET: { bg: "purple.50", color: "purple.600" },
    CONSUMABLES: { bg: "cyan.50", color: "cyan.600" },
    LABOR: { bg: "orange.50", color: "orange.600" },
    TOWING: { bg: "pink.50", color: "pink.600" },
    FEES: { bg: "gray.100", color: "gray.600" },
    OTHER: { bg: "gray.50", color: "gray.500" },
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
    accessorKey: "name",
    header: "Item",
    cell: ({ row }) => (
      <Stack gap="0">
        <Text textStyle="small-regular" color="gray.500" fontWeight="500">
          {row.original.name}
        </Text>
        {row.original.description && (
          <Text fontSize="12px" color="gray.300" lineClamp={1}>
            {row.original.description}
          </Text>
        )}
      </Stack>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ getValue }) => {
      const category = getValue() as ExpenseCategory;
      const styles = CATEGORY_STYLES[category] ?? CATEGORY_STYLES.OTHER;
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
            {EXPENSE_CATEGORY_LABELS[category] ?? category}
          </Text>
        </Box>
      );
    },
  },
  {
    accessorKey: "vendorName",
    header: "Vendor",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {(getValue() as string | null) || "—"}
      </Text>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {formatCurrency(getValue() as string)}
      </Text>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {moment(getValue() as string).format("DD MMM YYYY")}
      </Text>
    ),
  },
  {
    id: "jobCard",
    header: "Job Card",
    cell: ({ row }) => (
      <Text textStyle="small-regular" color="gray.500">
        {row.original.jobCard?.jobNumber ?? "—"}
      </Text>
    ),
  },
  {
    accessorKey: "isBillable",
    header: "Billable",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {(getValue() as boolean) ? "Yes" : "No"}
      </Text>
    ),
  },
];

const CSV_HEADERS = {
  expenseNumber: "Expense #",
  name: "Item",
  category: "Category",
  vendorName: "Vendor",
  amount: "Amount (₦)",
  date: "Date",
  jobNumber: "Job Card",
  isBillable: "Billable",
} as const;

const FILTER_SCHEMA = {
  page: { defaultValue: 1 },
  limit: { defaultValue: 20 },
  search: { defaultValue: "" },
  category: { defaultValue: "" },
  jobCardId: { defaultValue: "" },
  dateFrom: { defaultValue: "" },
  dateTo: { defaultValue: "" },
};

export function ExpenseListTemplate() {
  const navigate = useNavigate();
  const [filters, setFilters] = useUrlState(FILTER_SCHEMA, { replace: true });
  const [searchInput, setSearchInput] = useState(filters.search);
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null);

  const { data, isLoading, isFetching } = useGetExpensesQuery({
    page: filters.page,
    limit: filters.limit,
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.jobCardId ? { jobCardId: filters.jobCardId } : {}),
    ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
    ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
  });

  const { mutateAsync: deleteExpense, isPending: isDeleting } =
    useDeleteExpenseMutation();

  const expenses = useMemo(() => data?.data ?? [], [data?.data]);
  const meta = data?.meta;

  const csvData = expenses.map((expense) => ({
    expenseNumber: expense.expenseNumber,
    name: expense.name,
    category: EXPENSE_CATEGORY_LABELS[expense.category] ?? expense.category,
    vendorName: expense.vendorName ?? "",
    amount: expense.amount,
    date: expense.date,
    jobNumber: expense.jobCard?.jobNumber ?? "",
    isBillable: expense.isBillable ? "Yes" : "No",
  }));

  const tableActions: TableAction<Expense>[] = [
    {
      label: "Edit",
      value: "edit",
      onClick: (expense) =>
        navigate(RouteConstants.expenses.edit.generate({ id: expense.id })),
    },
    {
      label: "Delete",
      value: "delete",
      variant: "destructive",
      separator: true,
      onClick: (expense) => setPendingDelete(expense),
    },
  ];

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await deleteExpense(pendingDelete.id);
    setPendingDelete(null);
  };

  return (
    <>
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
          pt={{ base: "1.25rem", md: "2rem" }}
          pb={{ base: "1.25rem", md: "2rem" }}
          bg="white"
          px={{ base: "0.75rem", md: "1rem" }}
          rounded=".625rem"
          shadow="sm"
          borderWidth="1px"
          borderColor="gray.75"
        >
          <Flex
            justifyContent="space-between"
            alignItems={{ base: "flex-start", md: "center" }}
            mb="1rem"
            gap="3"
            direction={{ base: "column", md: "row" }}
          >
            <Box>
              <Text textStyle="large-bold" color="gray.500">
                All Expenses
              </Text>
              <Text textStyle="small-regular" color="gray.300">
                {meta?.totalAmount != null
                  ? `Total for current filter: ${formatCurrency(meta.totalAmount)}`
                  : "Track all your business expenses"}
              </Text>
            </Box>
          </Flex>

          <Flex
            justifyContent="flex-start"
            alignItems={{ base: "stretch", md: "center" }}
            mb="1.5rem"
            gap="3"
            direction={{ base: "column", md: "row" }}
            wrap="wrap"
          >
            <CustomSelect
              placeholder="All Categories"
              options={EXPENSE_CATEGORY_OPTIONS}
              value={filters.category ? [filters.category] : undefined}
              onChange={(opt: { value: string[] }) =>
                setFilters({ category: opt?.value?.[0] ?? "", page: 1 })
              }
              rootProps={{ size: "sm", w: { base: "100%", md: "auto" } }}
              controlProps={{ w: { base: "100%", md: "160px" } }}
            />
            <Flex
              flexWrap={{ base: "wrap", lg: "unset" }}
              gap="2"
              align="center"
              w={{ base: "100%", md: "auto" }}
            >
              <DateField
                label="From"
                value={filters.dateFrom}
                max={filters.dateTo || undefined}
                onChange={(val) => setFilters({ dateFrom: val, page: 1 })}
                containerProps={{ flex: { base: "1", lg: "unset" } }}
              />
              <DateField
                label="To"
                value={filters.dateTo}
                min={filters.dateFrom || undefined}
                onChange={(val) => setFilters({ dateTo: val, page: 1 })}
                containerProps={{ flex: { base: "1", lg: "unset" } }}
              />
            </Flex>
            <SearchInput
              placeholder="Search by expense #, item or vendor"
              value={searchInput}
              onChange={setSearchInput}
              onSearch={(val: string) => setFilters({ search: val, page: 1 })}
              debounceMs={500}
              loading={isFetching}
              width={{ base: "100%", md: "21rem" }}
            />
          </Flex>

          <Box overflowX="auto" minW={0}>
            <CustomTable
              stickyHeader
              data={expenses}
              columns={columns}
              loading={isLoading}
              enableActions
              actions={tableActions}
              onRowClick={(row) =>
                navigate(
                  RouteConstants.expenses.edit.generate({
                    id: row.original.id,
                  }),
                )
              }
              pagination={{
                pageIndex: filters.page - 1,
                pageSize: filters.limit,
              }}
              setPagination={({ pageIndex }) =>
                setFilters({ page: pageIndex + 1 })
              }
              pageCount={meta?.totalPages ?? 1}
              totalItems={meta?.total}
              hasNextPage={filters.page < (meta?.totalPages ?? 1)}
              hasPrevPage={filters.page > 1}
            />
          </Box>
        </Box>
      </Stack>

      <ConsentDialog
        open={Boolean(pendingDelete)}
        onOpenChange={({ open }) => {
          if (!open) setPendingDelete(null);
        }}
        heading={`Delete expense ${pendingDelete?.expenseNumber ?? ""}?`}
        note="The expense will no longer count against its job card's profit."
        handleSubmit={confirmDelete}
        isLoading={isDeleting}
      />
    </>
  );
}
