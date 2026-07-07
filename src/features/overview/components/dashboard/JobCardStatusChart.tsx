import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import { Center, Text } from "@chakra-ui/react";
import { DashboardCard } from "./DashboardCard";
import { jobCardStatusColor, prettyStatus } from "./chart-theme";
import type { JobCardStatusBreakdownItem } from "../../interface";

interface JobCardStatusChartProps {
  data: JobCardStatusBreakdownItem[];
}

export function JobCardStatusChart({ data }: JobCardStatusChartProps) {
  const items = data.filter((d) => d.count > 0);
  const total = items.reduce((acc, d) => acc + d.count, 0);

  const options: ApexOptions = {
    chart: { type: "donut", fontFamily: "inherit" },
    labels: items.map((d) => prettyStatus(d.status)),
    colors: items.map((d, i) => jobCardStatusColor(d.status, i)),
    legend: {
      position: "bottom",
      fontSize: "12px",
      markers: { size: 5 },
      itemMargin: { horizontal: 6, vertical: 2 },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
          labels: {
            show: true,
            value: {
              fontSize: "22px",
              fontWeight: "700",
              color: "#3B3F46",
            },
            total: {
              show: true,
              label: "Job Cards",
              fontSize: "12px",
              fontWeight: "500",
              color: "#9AA1AD",
              formatter: () => String(total),
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    stroke: { width: 2, colors: ["#fff"] },
    tooltip: {
      y: {
        formatter: (val) => `${val} job card${val === 1 ? "" : "s"}`,
      },
    },
  };

  const series = items.map((d) => d.count);

  return (
    <DashboardCard title="Job Card Status" subtitle="Breakdown by status">
      {total > 0 ? (
        <ReactApexChart
          options={options}
          series={series}
          type="donut"
          height={280}
          width="100%"
        />
      ) : (
        <Center h="280px">
          <Text fontSize="13px" color="gray.300">
            No job cards yet
          </Text>
        </Center>
      )}
    </DashboardCard>
  );
}
