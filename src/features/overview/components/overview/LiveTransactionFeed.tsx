import Status from "@/components/common/Status";
import { CustomTable } from "@/components/table";
import { Box, Text } from "@chakra-ui/react";
import { type ColumnDef } from "@tanstack/react-table";

interface Transaction {
  id: string;
  merchant: string;
  amount: string;
  status: string;
  date: string;
  customerEmail: string;
}

const data: Transaction[] = [
  {
    id: "AGS7782",
    merchant: "Momo Transfer",
    amount: "$250.00",
    status: "Completed",
    date: "2024-06-01",
    customerEmail: "john@gmail.com",
  },
  {
    id: "BGT3345",
    merchant: "Shoprite Payment",
    amount: "$1,200.00",
    status: "Pending",
    date: "2024-06-02",
    customerEmail: "jane@gmail.com",
  },
  {
    id: "CRT8891",
    merchant: "Amazon Purchase",
    amount: "$450.75",
    status: "Completed",
    date: "2024-06-03",
    customerEmail: "michael@gmail.com",
  },
  {
    id: "DFG4421",
    merchant: "Netflix Subscription",
    amount: "$15.99",
    status: "Failed",
    date: "2024-06-04",
    customerEmail: "sarah@gmail.com",
  },
  {
    id: "EKL9902",
    merchant: "Uber Ride",
    amount: "$32.50",
    status: "Completed",
    date: "2024-06-05",
    customerEmail: "david@gmail.com",
  },
  {
    id: "FMN5567",
    merchant: "Food Delivery",
    amount: "$89.25",
    status: "Pending",
    date: "2024-06-06",
    customerEmail: "emma@gmail.com",
  },
  {
    id: "GTY2234",
    merchant: "Gas Station",
    amount: "$65.00",
    status: "Completed",
    date: "2024-06-07",
    customerEmail: "oliver@gmail.com",
  },
];

const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "id",
    header: "Transaction ID",
    cell: ({ getValue }) => <Box>{getValue() as string}</Box>,
  },
  {
    accessorKey: "merchant",
    header: "Merchant",
    cell: ({ getValue }) => (
      <Text textStyle={"small-regular"} color={"gray.700"}>
        {getValue() as string}
      </Text>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ getValue }) => (
      <Text textStyle={"small-semibold"} color={"gray.900"}>
        {getValue() as string}
      </Text>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue() as string;
      const colorScheme =
        status === "Completed"
          ? "green"
          : status === "Pending"
            ? "yellow"
            : "red";
      return <Status colorScheme={colorScheme} name={status} />;
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ getValue }) => (
      <Text textStyle={"small-regular"} color={"gray.500"}>
        {getValue() as string}
      </Text>
    ),
  },
  {
    accessorKey: "customerEmail",
    header: "Customer Email",
    cell: ({ getValue }) => (
      <Text textStyle={"small-regular"} color={"gray.600"}>
        {getValue() as string}
      </Text>
    ),
  },
];

export function LiveTransactionFeed() {
  return (
    <Box bg={"white"} p={"1.5rem"} rounded={".625rem"} w={"full"} minW="0">
      <Box mb={"1.5rem"}>
        <Text textStyle={"large-bold"}>Live Transaction Feed</Text>
        <Text textStyle={"tiny-regular"} color={"gray.300"}>
          View & Filter Real-Time Transactions
        </Text>
      </Box>

      <CustomTable
        data={data}
        columns={columns}
        tableScrollAreaProps={{ maxW: "xl" }}
      />
    </Box>
  );
}
