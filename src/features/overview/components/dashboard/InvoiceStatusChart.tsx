import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { Box, Text } from "@chakra-ui/react";
import { MOCK_DASHBOARD_STATS } from "@/shared/data/mock";

const { paid, outstanding, overdue } =
  MOCK_DASHBOARD_STATS.invoiceStatusBreakdown;

const options: ApexOptions = {
  chart: { type: "donut", fontFamily: "inherit" },
  labels: ["Paid", "Outstanding", "Overdue"],
  colors: ["#2e7d32", "#e65100", "#c62828"],
  legend: { position: "bottom", fontSize: "12px" },
  plotOptions: {
    pie: {
      donut: {
        size: "70%",
        labels: {
          show: true,
          total: {
            show: true,
            label: "Total",
            fontSize: "13px",
            fontWeight: "600",
            formatter: () => String(paid + outstanding + overdue),
          },
        },
      },
    },
  },
  dataLabels: { enabled: false },
  stroke: { width: 0 },
  tooltip: {
    y: {
      formatter: (val) => `${val} invoice${val !== 1 ? "s" : ""}`,
    },
  },
};

const series = [paid, outstanding, overdue];

export function InvoiceStatusChart() {
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
        Invoice Status
      </Text>
      <Text fontSize="12px" color="gray.300" mb="2">
        Breakdown by status
      </Text>
      <ReactApexChart
        options={options}
        series={series}
        type="donut"
        height={280}
      />
    </Box>
  );
}
