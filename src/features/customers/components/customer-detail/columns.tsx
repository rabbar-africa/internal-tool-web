import { Box, Text } from "@chakra-ui/react";
import { type ColumnDef } from "@tanstack/react-table";
import moment from "moment";
import { formatCurrency } from "@/utils/calculations";
import type { Vehicle } from "../../api/service";
import type { IPaymentReceived } from "@/shared/interface/payment";

export const paymentColumns: ColumnDef<IPaymentReceived>[] = [
  {
    accessorKey: "paymentNumber",
    header: "Payment #",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {getValue() as string}
      </Text>
    ),
  },
  {
    accessorKey: "mode",
    header: "Mode",
    cell: ({ getValue }) => (
      <Text
        textStyle="small-regular"
        color="gray.400"
        textTransform="capitalize"
      >
        {((getValue() as string) ?? "").replace(/_/g, " ").toLowerCase() || "—"}
      </Text>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {formatCurrency(Number(getValue() as string) || 0)}
      </Text>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.400">
        {moment(getValue() as string).format("DD MMM YYYY")}
      </Text>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => (
      <Box
        display="inline-flex"
        bg="green.50"
        px="10px"
        py="3px"
        rounded="full"
      >
        <Text
          fontSize="11px"
          fontWeight="500"
          color="green.600"
          textTransform="capitalize"
        >
          {((getValue() as string) ?? "").toLowerCase()}
        </Text>
      </Box>
    ),
  },
];

export const vehicleColumns: ColumnDef<Vehicle>[] = [
  {
    id: "vehicle",
    header: "Vehicle",
    cell: ({ row }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="600">
        {row.original.year} {row.original.make} {row.original.model}
      </Text>
    ),
  },
  {
    accessorKey: "registrationNumber",
    header: "Reg. No.",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {getValue() as string}
      </Text>
    ),
  },
  {
    accessorKey: "color",
    header: "Color",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.400">
        {(getValue() as string | null) ?? "—"}
      </Text>
    ),
  },
  {
    accessorKey: "vin",
    header: "VIN",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.400" fontFamily="mono">
        {(getValue() as string | null) ?? "—"}
      </Text>
    ),
  },
];
