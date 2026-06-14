import { Box, Button, Flex, Grid, Stack, Text } from "@chakra-ui/react";
import { type ColumnDef } from "@tanstack/react-table";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { UserDashboardContainer } from "@/components/hoc";
import { CustomTable } from "@/components/table";
import { StatCard } from "@/components/common/StatCard";
import { PageHeader } from "@/components/common/PageHeader";
import { DownloadButton } from "@/components/common/DownloadButton";
import { formatCurrency } from "@/utils/calculations";
import { EXPENSE_CATEGORY_LABELS } from "@/shared/interface/expense";
import {
  MOCK_DASHBOARD_STATS,
  MOCK_MONTHLY_REVENUE_EXPENSE,
  MOCK_EXPENSES,
  MOCK_CUSTOMERS,
  MOCK_INVOICES,
  MOCK_PAYMENTS,
} from "@/shared/data/mock";

// Top customers computed from mock data
const topCustomers = MOCK_CUSTOMERS.map((c) => {
  const invoices = MOCK_INVOICES.filter((inv) => inv.customerId === c.id);
  const payments = MOCK_PAYMENTS.filter((p) => p.customerId === c.id);
  const totalInvoiced = invoices.reduce((s, inv) => s + inv.totalAmount, 0);
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  return {
    name: c.name,
    totalInvoiced,
    totalPaid,
    outstanding: c.outstandingBalance,
  };
}).sort((a, b) => b.totalInvoiced - a.totalInvoiced);

// Expense by category
const expenseByCategory = Object.entries(
  MOCK_EXPENSES.reduce(
    (acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    },
    {} as Record<string, number>,
  ),
).map(([key, value]) => ({
  category:
    EXPENSE_CATEGORY_LABELS[key as keyof typeof EXPENSE_CATEGORY_LABELS] ?? key,
  amount: value,
}));

type TopCustomer = (typeof topCustomers)[number];

const topCustomerColumns: ColumnDef<TopCustomer>[] = [
  {
    accessorKey: "name",
    header: "Customer",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {getValue() as string}
      </Text>
    ),
  },
  {
    accessorKey: "totalInvoiced",
    header: "Total Invoiced",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {formatCurrency(getValue() as number)}
      </Text>
    ),
  },
  {
    accessorKey: "totalPaid",
    header: "Total Paid",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {formatCurrency(getValue() as number)}
      </Text>
    ),
  },
  {
    accessorKey: "outstanding",
    header: "Outstanding",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="orange.600" fontWeight="500">
        {formatCurrency(getValue() as number)}
      </Text>
    ),
  },
];

const revenueExpenseOptions: ApexOptions = {
  chart: { type: "area", toolbar: { show: false }, fontFamily: "inherit" },
  colors: ["#293885", "#e53935"],
  dataLabels: { enabled: false },
  stroke: { curve: "smooth", width: 2 },
  fill: { type: "gradient", gradient: { opacityFrom: 0.35, opacityTo: 0.05 } },
  xaxis: {
    categories: MOCK_MONTHLY_REVENUE_EXPENSE.map((d) => d.month),
    labels: { style: { fontSize: "11px" } },
  },
  yaxis: {
    labels: {
      formatter: (val) => `₦${(val / 1000).toFixed(0)}k`,
      style: { fontSize: "11px" },
    },
  },
  legend: { position: "top" },
  grid: { borderColor: "#f1f1f1" },
};

const revenueSeries = [
  {
    name: "Revenue",
    data: MOCK_MONTHLY_REVENUE_EXPENSE.map((d) => d.revenue),
  },
  {
    name: "Expenses",
    data: MOCK_MONTHLY_REVENUE_EXPENSE.map((d) => d.expenses),
  },
];

const categoryDonutOptions: ApexOptions = {
  chart: { type: "donut", fontFamily: "inherit" },
  colors: [
    "#293885",
    "#e53935",
    "#2e7d32",
    "#e65100",
    "#7b1fa2",
    "#0277bd",
    "#546e7a",
  ],
  labels: expenseByCategory.map((d) => d.category),
  legend: { position: "bottom", fontSize: "12px" },
  dataLabels: {
    formatter: (val) => `${(val as number).toFixed(1)}%`,
  },
  plotOptions: { pie: { donut: { size: "65%" } } },
};

const categorySeries = expenseByCategory.map((d) => d.amount);

const csvData = MOCK_MONTHLY_REVENUE_EXPENSE.map((d) => ({
  month: d.month,
  revenue: d.revenue,
  expenses: d.expenses,
  profit: d.revenue - d.expenses,
}));

const CSV_HEADERS = {
  month: "Month",
  revenue: "Revenue (₦)",
  expenses: "Expenses (₦)",
  profit: "Profit (₦)",
} as const;

export function ReportsDashboardPage() {
  return (
    <UserDashboardContainer py="1.5rem">
      <Stack gap="6">
        <PageHeader
          title="Reports"
          subtitle="Financial overview and performance analysis"
          action={
            <Flex gap="2">
              <DownloadButton
                data={csvData}
                filename="financial-report"
                headers={CSV_HEADERS}
              />
            </Flex>
          }
        />

        {/* Date Range Filter (UI only) */}
        <Box
          bg="white"
          p="4"
          rounded=".625rem"
          shadow="sm"
          borderWidth="1px"
          borderColor="gray.75"
        >
          <Flex gap="3" align="flex-end" wrap="wrap">
            <Box>
              <Text fontSize="12px" color="gray.300" mb="1">
                From
              </Text>
              <input
                type="date"
                defaultValue="2025-01-01"
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  padding: "6px 10px",
                  fontSize: "13px",
                  color: "#4a5568",
                }}
              />
            </Box>
            <Box>
              <Text fontSize="12px" color="gray.300" mb="1">
                To
              </Text>
              <input
                type="date"
                defaultValue="2025-06-30"
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  padding: "6px 10px",
                  fontSize: "13px",
                  color: "#4a5568",
                }}
              />
            </Box>
            <Button size="sm" variant="outline">
              Apply Filter
            </Button>
          </Flex>
        </Box>

        {/* Summary Stats */}
        <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
          <StatCard
            label="Total Revenue"
            value={formatCurrency(MOCK_DASHBOARD_STATS.totalRevenue)}
            iconBg="blue.50"
            icon={
              <Text fontSize="18px" fontWeight="700" color="blue.500">
                ₦
              </Text>
            }
          />
          <StatCard
            label="Total Expenses"
            value={formatCurrency(MOCK_DASHBOARD_STATS.totalExpenses)}
            iconBg="red.50"
            icon={
              <Text fontSize="18px" fontWeight="700" color="red.500">
                ₦
              </Text>
            }
          />
        </Grid>

        {/* Revenue vs Expenses Chart */}
        <Box
          bg="white"
          p="6"
          rounded=".625rem"
          shadow="sm"
          borderWidth="1px"
          borderColor="gray.75"
        >
          <Text textStyle="large-bold" color="gray.500" mb="4">
            Revenue vs Expenses (6 Months)
          </Text>
          <ReactApexChart
            type="area"
            options={revenueExpenseOptions}
            series={revenueSeries}
            height={300}
          />
        </Box>

        {/* Expense by Category + Top Customers */}
        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap="6">
          <Box
            bg="white"
            p="6"
            rounded=".625rem"
            shadow="sm"
            borderWidth="1px"
            borderColor="gray.75"
          >
            <Text textStyle="large-bold" color="gray.500" mb="4">
              Expenses by Category
            </Text>
            <ReactApexChart
              type="donut"
              options={categoryDonutOptions}
              series={categorySeries}
              height={300}
            />
          </Box>

          <Box
            bg="white"
            p="6"
            rounded=".625rem"
            shadow="sm"
            borderWidth="1px"
            borderColor="gray.75"
          >
            <Text textStyle="large-bold" color="gray.500" mb="4">
              Top Customers by Revenue
            </Text>
            <CustomTable
              data={topCustomers}
              columns={topCustomerColumns}
              loading={false}
              tableScrollAreaProps={{ maxW: "full" }}
            />
          </Box>
        </Grid>
      </Stack>
    </UserDashboardContainer>
  );
}
