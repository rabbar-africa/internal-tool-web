import { Box, Text } from "@chakra-ui/react";
import { type ColumnDef } from "@tanstack/react-table";
import type { IPaperwork } from "@/shared/interface/paperwork";
import {
  formatDate,
  formatDaysUntil,
  formatDocumentType,
} from "../utils/paperwork";
import { PaperworkStatusBadge } from "./PaperworkStatusBadge";

export const paperworkColumns: ColumnDef<IPaperwork>[] = [
  {
    accessorKey: "documentType",
    header: "Document",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {formatDocumentType(getValue() as string)}
      </Text>
    ),
  },
  {
    id: "customer",
    header: "Customer",
    cell: ({ row }) => (
      <Text textStyle="small-regular" color="gray.500">
        {row.original.client?.displayName ?? "—"}
      </Text>
    ),
  },
  {
    id: "vehicle",
    header: "Vehicle",
    cell: ({ row }) => {
      const v = row.original.vehicle;
      return (
        <Text textStyle="small-regular" color="gray.500">
          {v?.registrationNumber ??
            (v ? `${v.make ?? ""} ${v.model ?? ""}`.trim() : "—")}
        </Text>
      );
    },
  },
  {
    accessorKey: "expiryDate",
    header: "Expiry",
    cell: ({ row }) => {
      const { expiryDate, daysUntilExpiry, status } = row.original;
      if (!expiryDate) {
        return (
          <Text textStyle="small-regular" color="gray.300">
            No expiry
          </Text>
        );
      }
      const overdue = (daysUntilExpiry ?? 0) < 0;
      const soon = status === "EXPIRING_SOON";
      return (
        <Box>
          <Text textStyle="small-regular" color="gray.500">
            {formatDate(expiryDate)}
          </Text>
          <Text
            fontSize="11px"
            color={overdue ? "red.500" : soon ? "orange.500" : "gray.300"}
          >
            {formatDaysUntil(daysUntilExpiry)}
          </Text>
        </Box>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <PaperworkStatusBadge status={row.original.status} />,
  },
];
