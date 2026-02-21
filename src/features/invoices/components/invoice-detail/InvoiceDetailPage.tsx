import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Separator,
  Stack,
  Text,
} from "@chakra-ui/react";
import { type ColumnDef } from "@tanstack/react-table";
import { useNavigate, useParams } from "react-router-dom";
import { UserDashboardContainer } from "@/components/hoc";
import { CustomTable } from "@/components/table";
import { ProfitBadge } from "@/components/common/ProfitBadge";
import { RouteConstants } from "@/shared/constants/routes";
import { formatCurrency } from "@/utils/calculations";
import { useGetInvoiceByIdQuery } from "../../api/query";
import { MOCK_EXPENSES } from "@/shared/data/mock";
import type { LineItem } from "@/shared/interface/invoice";
import moment from "moment";

const lineItemColumns: ColumnDef<LineItem>[] = [
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {getValue() as string}
      </Text>
    ),
  },
  {
    accessorKey: "quantity",
    header: "Qty",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {getValue() as number}
      </Text>
    ),
  },
  {
    accessorKey: "unitPrice",
    header: "Unit Price",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {formatCurrency(getValue() as number)}
      </Text>
    ),
  },
  {
    accessorKey: "taxRate",
    header: "Tax %",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500">
        {getValue() as number}%
      </Text>
    ),
  },
  {
    accessorKey: "lineTotal",
    header: "Total",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {formatCurrency(getValue() as number)}
      </Text>
    ),
  },
];

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: invoice, isLoading } = useGetInvoiceByIdQuery(id ?? "");

  const linkedExpenses = MOCK_EXPENSES.filter((e) =>
    invoice?.linkedExpenseIds.includes(e.id),
  );

  if (isLoading) {
    return (
      <UserDashboardContainer py="1.5rem">
        <Text color="gray.400">Loading invoice...</Text>
      </UserDashboardContainer>
    );
  }

  if (!invoice) {
    return (
      <UserDashboardContainer py="1.5rem">
        <Text color="red.500">Invoice not found.</Text>
      </UserDashboardContainer>
    );
  }

  return (
    <UserDashboardContainer py="1.5rem">
      <Stack gap="6">
        {/* Page header */}
        <Flex
          justify="space-between"
          align={{ base: "flex-start", sm: "center" }}
          direction={{ base: "column", sm: "row" }}
          gap="3"
        >
          <Box>
            <Text textStyle="h3-bold" color="gray.500">
              {invoice.invoiceNumber}
            </Text>
            <Text textStyle="small-regular" color="gray.300" mt="1">
              Issued {moment(invoice.issueDate).format("DD MMM YYYY")} · Due{" "}
              {moment(invoice.dueDate).format("DD MMM YYYY")}
            </Text>
          </Box>
          <Flex gap="2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(RouteConstants.invoices.base.path)}
            >
              Back
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(RouteConstants.payments.create.path)}
            >
              Record Payment
            </Button>
          </Flex>
        </Flex>

        <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap="5">
          {/* Left column */}
          <Stack gap="5">
            {/* Customer info */}
            <Card.Root borderWidth="1px" borderColor="gray.75" shadow="none">
              <Card.Header pb="0">
                <Text fontWeight="600" color="gray.500" fontSize=".875rem">
                  Customer Information
                </Text>
              </Card.Header>
              <Card.Body>
                <Stack gap="1">
                  <Text fontWeight="600" color="gray.500">
                    {invoice.customer.name}
                  </Text>
                  <Text fontSize="13px" color="gray.300">
                    {invoice.customer.email}
                  </Text>
                  <Text fontSize="13px" color="gray.300">
                    {invoice.customer.phone}
                  </Text>
                </Stack>
              </Card.Body>
            </Card.Root>

            {/* Line items */}
            <Card.Root borderWidth="1px" borderColor="gray.75" shadow="none">
              <Card.Header pb="0">
                <Text fontWeight="600" color="gray.500" fontSize=".875rem">
                  Line Items
                </Text>
              </Card.Header>
              <Card.Body>
                <CustomTable
                  data={invoice.lineItems}
                  columns={lineItemColumns}
                  tableScrollAreaProps={{ maxW: "100%" }}
                />
              </Card.Body>
            </Card.Root>

            {/* Notes */}
            {invoice.notes && (
              <Card.Root borderWidth="1px" borderColor="gray.75" shadow="none">
                <Card.Header pb="0">
                  <Text fontWeight="600" color="gray.500" fontSize=".875rem">
                    Notes
                  </Text>
                </Card.Header>
                <Card.Body>
                  <Text fontSize="13px" color="gray.400">
                    {invoice.notes}
                  </Text>
                </Card.Body>
              </Card.Root>
            )}
          </Stack>

          {/* Right column */}
          <Stack gap="5">
            {/* Totals */}
            <Card.Root borderWidth="1px" borderColor="gray.75" shadow="none">
              <Card.Header pb="0">
                <Text fontWeight="600" color="gray.500" fontSize=".875rem">
                  Summary
                </Text>
              </Card.Header>
              <Card.Body>
                <Stack gap="3">
                  <Flex justify="space-between">
                    <Text fontSize="13px" color="gray.300">
                      Subtotal
                    </Text>
                    <Text fontSize="13px" color="gray.500">
                      {formatCurrency(invoice.subtotal)}
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontSize="13px" color="gray.300">
                      Tax
                    </Text>
                    <Text fontSize="13px" color="gray.500">
                      {formatCurrency(invoice.taxTotal)}
                    </Text>
                  </Flex>
                  <Separator />
                  <Flex justify="space-between">
                    <Text fontSize="14px" fontWeight="600" color="gray.500">
                      Total
                    </Text>
                    <Text fontSize="14px" fontWeight="600" color="gray.500">
                      {formatCurrency(invoice.totalAmount)}
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontSize="13px" color="gray.300">
                      Amount Paid
                    </Text>
                    <Text fontSize="13px" color="green.600">
                      {formatCurrency(invoice.amountPaid)}
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontSize="14px" fontWeight="600" color="gray.500">
                      Amount Due
                    </Text>
                    <Text
                      fontSize="14px"
                      fontWeight="700"
                      color={invoice.amountDue > 0 ? "red.600" : "green.600"}
                    >
                      {formatCurrency(invoice.amountDue)}
                    </Text>
                  </Flex>
                </Stack>
              </Card.Body>
            </Card.Root>

            {/* Profit */}
            <Card.Root borderWidth="1px" borderColor="gray.75" shadow="none">
              <Card.Header pb="0">
                <Text fontWeight="600" color="gray.500" fontSize=".875rem">
                  Profit Analysis
                </Text>
              </Card.Header>
              <Card.Body>
                <Stack gap="3">
                  <Flex justify="space-between" align="center">
                    <Text fontSize="13px" color="gray.300">
                      Profit Status
                    </Text>
                    <ProfitBadge
                      marginPercent={invoice.marginPercent}
                      showPercent
                    />
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontSize="13px" color="gray.300">
                      Invoice Total
                    </Text>
                    <Text fontSize="13px" color="gray.500">
                      {formatCurrency(invoice.totalAmount)}
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontSize="13px" color="gray.300">
                      Linked Expenses
                    </Text>
                    <Text fontSize="13px" color="red.500">
                      {formatCurrency(invoice.totalLinkedExpenses)}
                    </Text>
                  </Flex>
                  <Separator />
                  <Flex justify="space-between">
                    <Text fontSize="14px" fontWeight="600" color="gray.500">
                      Net Profit
                    </Text>
                    <Text
                      fontSize="14px"
                      fontWeight="700"
                      color={invoice.profit >= 0 ? "green.600" : "red.600"}
                    >
                      {formatCurrency(invoice.profit)}
                    </Text>
                  </Flex>
                  {linkedExpenses.length > 0 && (
                    <Box>
                      <Text
                        fontSize="12px"
                        color="gray.300"
                        mb="2"
                        fontWeight="500"
                      >
                        Linked Expenses
                      </Text>
                      <Stack gap="1">
                        {linkedExpenses.map((exp) => (
                          <Flex key={exp.id} justify="space-between">
                            <Text fontSize="12px" color="gray.400">
                              {exp.title}
                            </Text>
                            <Text fontSize="12px" color="gray.400">
                              {formatCurrency(exp.amount)}
                            </Text>
                          </Flex>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </Card.Body>
            </Card.Root>
          </Stack>
        </Grid>
      </Stack>
    </UserDashboardContainer>
  );
}
