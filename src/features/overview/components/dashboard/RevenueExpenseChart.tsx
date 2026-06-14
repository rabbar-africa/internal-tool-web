import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { Box, Text } from "@chakra-ui/react";
import { MOCK_MONTHLY_REVENUE_EXPENSE } from "@/shared/data/mock";

const months = MOCK_MONTHLY_REVENUE_EXPENSE.map((m) => m.month);
const revenueData = MOCK_MONTHLY_REVENUE_EXPENSE.map((m) => m.revenue);
const expenseData = MOCK_MONTHLY_REVENUE_EXPENSE.map((m) => m.expenses);

const options: ApexOptions = {
  chart: {
    type: "area",
    toolbar: { show: false },
    fontFamily: "inherit",
  },
  colors: ["#293885", "#e53935"],
  dataLabels: { enabled: false },
  stroke: { curve: "smooth", width: 2 },
  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.35,
      opacityTo: 0.02,
    },
  },
  xaxis: {
    categories: months,
    labels: { style: { fontSize: "12px" } },
  },
  yaxis: {
    labels: {
      formatter: (val) => `₦${(val / 1000).toFixed(0)}k`,
      style: { fontSize: "11px" },
    },
  },
  tooltip: {
    y: { formatter: (val) => `₦${val.toLocaleString()}` },
  },
  legend: { position: "top", horizontalAlign: "right" },
  grid: { borderColor: "#F4F4F4", strokeDashArray: 4 },
};

const series = [
  { name: "Revenue", data: revenueData },
  { name: "Expenses", data: expenseData },
];

export function RevenueExpenseChart() {
  return (
    <Box
      bg="white"
      rounded="lg"
      shadow="sm"
      p="6"
      borderWidth="1px"
      borderColor="gray.75"
    >
      <Text fontSize="15px" fontWeight="600" color="gray.500" mb="1">
        Revenue vs Expenses
      </Text>
      <Text fontSize="12px" color="gray.300" mb="4">
        6-month comparison
      </Text>
      <ReactApexChart
        options={options}
        series={series}
        type="area"
        height={280}
      />
    </Box>
  );
}
