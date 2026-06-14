import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { Box, Text } from "@chakra-ui/react";
import { MOCK_MONTHLY_PROFIT } from "@/shared/data/mock";

const months = MOCK_MONTHLY_PROFIT.map((m) => m.month);
const profits = MOCK_MONTHLY_PROFIT.map((m) => m.profit);
const barColors = profits.map((p) => (p >= 0 ? "#2e7d32" : "#c62828"));

const options: ApexOptions = {
  chart: {
    type: "bar",
    toolbar: { show: false },
    fontFamily: "inherit",
  },
  colors: barColors,
  plotOptions: {
    bar: {
      borderRadius: 4,
      columnWidth: "50%",
      distributed: true,
    },
  },
  dataLabels: { enabled: false },
  legend: { show: false },
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
  grid: { borderColor: "#F4F4F4", strokeDashArray: 4 },
};

const series = [{ name: "Profit", data: profits }];

export function MonthlyProfitChart() {
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
        Monthly Profit
      </Text>
      <Text fontSize="12px" color="gray.300" mb="4">
        Green = profitable month · Red = loss
      </Text>
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={280}
      />
    </Box>
  );
}
