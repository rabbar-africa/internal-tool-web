import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { Center, Text } from "@chakra-ui/react";
import { DashboardCard } from "./DashboardCard";
import { CHART, formatCompact, monthLabel } from "./chart-theme";
import type { RevenueTrendPoint } from "../../interface";

interface RevenueTrendChartProps {
  data: RevenueTrendPoint[];
  currency?: string;
}

export function RevenueTrendChart({
  data,
  currency = "NGN",
}: RevenueTrendChartProps) {
  const hasData = data.some(
    (d) => d.collected > 0 || d.invoiced > 0 || d.expenses > 0,
  );

  const options: ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      fontFamily: "inherit",
      parentHeightOffset: 0,
      animations: { speed: 400 },
    },
    colors: [CHART.collected, CHART.invoiced, CHART.expenses, CHART.profit],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.18,
        opacityTo: 0.01,
        stops: [0, 95],
      },
    },
    xaxis: {
      categories: data.map((d) => monthLabel(d.month)),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { fontSize: CHART.axisLabelSize, colors: CHART.axis },
      },
    },
    yaxis: {
      labels: {
        formatter: (val) => formatCompact(val, currency),
        style: { fontSize: CHART.axisLabelSize, colors: CHART.axis },
      },
    },
    tooltip: {
      y: { formatter: (val) => formatCompact(val, currency) },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "12px",
      markers: { size: 5 },
      itemMargin: { horizontal: 8 },
    },
    grid: {
      borderColor: CHART.grid,
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      padding: { left: 4, right: 4 },
    },
  };

  const series = [
    { name: "Collected", data: data.map((d) => d.collected) },
    { name: "Invoiced", data: data.map((d) => d.invoiced) },
    { name: "Expenses", data: data.map((d) => d.expenses) },
    { name: "Profit", data: data.map((d) => d.profit) },
  ];

  return (
    <DashboardCard
      title="Revenue Trend"
      subtitle="Collected, invoiced, expenses & profit"
    >
      {hasData ? (
        <ReactApexChart
          options={options}
          series={series}
          type="area"
          height={280}
          width="100%"
        />
      ) : (
        <Center h="280px">
          <Text fontSize="13px" color="gray.300">
            No revenue activity yet
          </Text>
        </Center>
      )}
    </DashboardCard>
  );
}
