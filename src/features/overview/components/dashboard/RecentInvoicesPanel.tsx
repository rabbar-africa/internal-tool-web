import { Box, Center, Flex, Stack, Text } from "@chakra-ui/react";
import { DashboardCard } from "./DashboardCard";
import { formatCurrency } from "@/utils/calculations";
import { prettyStatus, statusColor } from "./chart-theme";
import type { RecentInvoice } from "../../interface";

interface RecentInvoicesPanelProps {
  data: RecentInvoice[];
  currency?: string;
}

function formatDate(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function StatusPill({ status }: { status?: string }) {
  if (!status) return null;
  const color = statusColor(status);
  return (
    <Flex
      align="center"
      gap="1.5"
      px="2"
      py="0.5"
      rounded="full"
      bg={`${color}14`}
      flexShrink={0}
    >
      <Box w="6px" h="6px" rounded="full" bg={color} />
      <Text fontSize="11px" fontWeight="500" color="gray.400">
        {prettyStatus(status)}
      </Text>
    </Flex>
  );
}

export function RecentInvoicesPanel({
  data,
  currency = "NGN",
}: RecentInvoicesPanelProps) {
  const invoices = data.slice(0, 5);

  return (
    <DashboardCard title="Recent Invoices" subtitle="Latest activity">
      {invoices.length > 0 ? (
        <Stack gap="0" mt="1">
          {invoices.map((inv, i) => (
            <Flex
              key={inv.id}
              align="center"
              justify="space-between"
              gap="3"
              py="3"
              borderTopWidth={i === 0 ? "0" : "1px"}
              borderColor="gray.75"
            >
              <Box minW="0">
                <Text
                  fontSize="13px"
                  fontWeight="600"
                  color="gray.500"
                  truncate
                >
                  {inv.customerName || "—"}
                </Text>
                <Text fontSize="12px" color="gray.300">
                  {inv.invoiceNumber || "Invoice"}
                  {formatDate(inv.date) ? ` · ${formatDate(inv.date)}` : ""}
                </Text>
              </Box>
              <Flex align="center" gap="3" flexShrink={0}>
                <StatusPill status={inv.status} />
                <Text
                  fontSize="13px"
                  fontWeight="600"
                  color="gray.500"
                  minW="max-content"
                >
                  {formatCurrency(inv.total ?? 0, inv.currencyCode ?? currency)}
                </Text>
              </Flex>
            </Flex>
          ))}
        </Stack>
      ) : (
        <Center h="180px">
          <Text fontSize="13px" color="gray.300">
            No recent invoices
          </Text>
        </Center>
      )}
    </DashboardCard>
  );
}
