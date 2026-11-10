import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { Center, Text } from "@chakra-ui/react";
import { DashboardCard } from "./DashboardCard";
import { CHART, formatCompact, monthLabel } from "./chart-theme";
import type { RevenueTrendPoint } from "../../interface";

type TrendKey = Exclude<keyof RevenueTrendPoint, "month">;

/** Every line the chart can draw, in legend order. */
const LINES: { key: TrendKey; name: string; color: string }[] = [
  { key: "collected", name: "Collected", color: CHART.collected },
  { key: "invoiced", name: "Invoiced", color: CHART.invoiced },
  { key: "expenses", name: "Expenses", color: CHART.expenses },
  { key: "profit", name: "Profit", color: CHART.profit },
];

interface RevenueTrendChartProps {
  data: RevenueTrendPoint[];
  /** The lines the user may see; the API also nulls the ones they can't. */
  visible: Record<TrendKey, boolean>;
  currency?: string;
}

/** Whether any line would be drawn, so the dashboard can drop the card. */
export function hasTrendLines(
  data: RevenueTrendPoint[] | null | undefined,
  visible: Record<TrendKey, boolean>,
) {
  return linesFor(data ?? [], visible).length > 0;
}

function linesFor(
  data: RevenueTrendPoint[],
  visible: Record<TrendKey, boolean>,
) {
  return LINES.filter(
    (line) =>
      visible[line.key] &&
      data.length > 0 &&
      data.every((point) => point[line.key] !== null),
  );
}

export function RevenueTrendChart({
  data,
  visible,
  currency = "NGN",
}: RevenueTrendChartProps) {
  const lines = linesFor(data, visible);
  const hasData = data.some((point) =>
    lines.some((line) => (point[line.key] ?? 0) !== 0),
  );

  const options: ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      fontFamily: "inherit",
      parentHeightOffset: 0,
      animations: { speed: 400 },
    },
    colors: lines.map((line) => line.color),
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

  const series = lines.map((line) => ({
    name: line.name,
    data: data.map((point) => point[line.key] ?? 0),
  }));

  return (
    <DashboardCard
      title="Revenue Trend"
      subtitle={listNames(lines.map((line) => line.name))}
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

/** ["Collected", "Invoiced", "Expenses"] → "Collected, invoiced & expenses". */
function listNames(names: string[]): string {
  const lower = names.map((name, i) => (i === 0 ? name : name.toLowerCase()));
  return lower.length < 2
    ? (lower[0] ?? "")
    : `${lower.slice(0, -1).join(", ")} & ${lower[lower.length - 1]}`;
}
