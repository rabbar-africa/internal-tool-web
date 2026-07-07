import { Box, Stack, Text } from "@chakra-ui/react";
import { type ColumnDef } from "@tanstack/react-table";
import moment from "moment";
import {
  JOB_CARD_PRIORITY_LABELS,
  JOB_CARD_PRIORITY_STYLES,
  JOB_CARD_STATUS_LABELS,
  JOB_CARD_STATUS_STYLES,
  jobCardVehicleLabel,
  jobCardVehicleShortLabel,
  type JobCard,
  type JobCardPriority,
  type JobCardStatus,
} from "@/shared/interface/job-card";
import { technicianFullName } from "@/shared/interface/technician";

export function JobCardStatusBadge({ status }: { status: JobCardStatus }) {
  const styles = JOB_CARD_STATUS_STYLES[status] ?? {
    bg: "gray.100",
    color: "gray.500",
  };
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
        {JOB_CARD_STATUS_LABELS[status] ?? status}
      </Text>
    </Box>
  );
}

export function JobCardPriorityBadge({
  priority,
}: {
  priority: JobCardPriority;
}) {
  const styles = JOB_CARD_PRIORITY_STYLES[priority] ?? {
    bg: "gray.100",
    color: "gray.500",
  };
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
        {JOB_CARD_PRIORITY_LABELS[priority] ?? priority}
      </Text>
    </Box>
  );
}

export const jobCardColumns: ColumnDef<JobCard>[] = [
  {
    accessorKey: "jobNumber",
    header: "Job #",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="600">
        {getValue() as string}
      </Text>
    ),
  },
  {
    id: "customer",
    header: "Customer",
    cell: ({ row }) => (
      <Stack gap="0">
        <Text textStyle="small-regular" color="gray.500" fontWeight="500">
          {row.original.customerName || "—"}
        </Text>
        {row.original.customerPhone && (
          <Text fontSize="12px" color="gray.300">
            {row.original.customerPhone}
          </Text>
        )}
      </Stack>
    ),
  },
  {
    id: "vehicle",
    header: "Vehicle",
    cell: ({ row }) => (
      <Text textStyle="small-regular" color="gray.500">
        {jobCardVehicleShortLabel(row.original) || "—"}
      </Text>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => (
      <JobCardStatusBadge status={getValue() as JobCardStatus} />
    ),
  },
  {
    accessorKey: "promisedDate",
    header: "Promised",
    cell: ({ getValue }) => {
      const value = getValue() as string | null;
      return (
        <Text textStyle="small-regular" color="gray.500">
          {value ? moment(value).format("DD MMM YYYY") : "—"}
        </Text>
      );
    },
  },
  {
    accessorKey: "openedAt",
    header: "Opened",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {moment(getValue() as string).format("DD MMM YYYY")}
      </Text>
    ),
  },
];

export const JOB_CARD_CSV_HEADERS = {
  jobNumber: "Job #",
  customerName: "Customer",
  customerPhone: "Phone",
  vehicle: "Vehicle",
  status: "Status",
  priority: "Priority",
  technicians: "Technicians",
  promisedDate: "Promised Date",
  openedAt: "Opened",
} as const;

export const toCsvRow = (jobCard: JobCard) => ({
  jobNumber: jobCard.jobNumber,
  customerName: jobCard.customerName ?? "",
  customerPhone: jobCard.customerPhone ?? "",
  vehicle: jobCardVehicleLabel(jobCard),
  status: JOB_CARD_STATUS_LABELS[jobCard.status] ?? jobCard.status,
  priority: JOB_CARD_PRIORITY_LABELS[jobCard.priority] ?? jobCard.priority,
  technicians: (jobCard.technicians ?? [])
    .map((a) => technicianFullName(a.technician))
    .join("; "),
  promisedDate: jobCard.promisedDate ?? "",
  openedAt: jobCard.openedAt,
});
