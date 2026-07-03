import { Box, Flex, Grid, Link, Skeleton, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import moment from "moment";
import { formatCurrency } from "@/utils/calculations";
import { RouteConstants } from "@/shared/constants/routes";
import type { ClientStats } from "@/shared/interface/customer";

interface CustomerStatsProps {
  stats?: ClientStats;
  isLoading?: boolean;
}

export function CustomerStats({ stats, isLoading }: CustomerStatsProps) {
  if (isLoading || !stats) {
    return (
      <Grid
        templateColumns={{ base: "1fr", sm: "1fr 1fr", lg: "repeat(3, 1fr)" }}
        gap="4"
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} height="72px" rounded="xl" />
        ))}
      </Grid>
    );
  }

  const currency = stats.currency ?? "NGN";
  const money = (v: number) => formatCurrency(v, currency);

  const tiles = [
    {
      label: "Lifetime Value",
      value: money(stats.lifetimeValue),
      caption: "Collected to date",
      accent: "#4F9D77",
    },
    {
      label: "Total Invoiced",
      value: money(stats.totalInvoiced),
      caption: `${stats.invoiceCount} invoice${stats.invoiceCount === 1 ? "" : "s"}`,
      accent: "#293885",
    },
    {
      label: "Avg. Invoice",
      value: money(stats.averageInvoiceValue),
      caption: "Per invoice",
      accent: "#6478C0",
    },
    {
      label: "Outstanding",
      value: money(stats.outstanding),
      caption: "Unpaid balance",
      accent: "#B08430",
    },
    {
      label: "Overdue",
      value: money(stats.overdue.amount),
      caption: `${stats.overdue.count} past due`,
      accent: "#C1665A",
    },
    {
      label: "Paid Invoices",
      value: String(stats.paidInvoiceCount),
      caption: `of ${stats.invoiceCount}`,
      accent: "#4F9D77",
    },
  ];

  return (
    <Box>
      <Grid
        templateColumns={{ base: "1fr", sm: "1fr 1fr", lg: "repeat(3, 1fr)" }}
        gap="4"
      >
        {tiles.map((tile) => (
          <Box
            key={tile.label}
            bg="white"
            rounded="xl"
            px="5"
            py="4"
            borderWidth="1px"
            borderColor="gray.75"
            boxShadow="0 1px 2px rgba(16, 24, 40, 0.04)"
          >
            <Flex align="center" gap="3">
              <Box w="2" h="9" bg={tile.accent} rounded="full" flexShrink={0} />
              <Box minW="0">
                <Text fontSize="11px" color="gray.300" fontWeight="500">
                  {tile.label}
                </Text>
                <Text
                  fontSize="1.05rem"
                  fontWeight="700"
                  color="gray.600"
                  lineHeight="1.2"
                  truncate
                >
                  {tile.value}
                </Text>
                <Text fontSize="11px" color="gray.300">
                  {tile.caption}
                </Text>
              </Box>
            </Flex>
          </Box>
        ))}
      </Grid>

      {(stats.lastInvoice || stats.lastPayment) && (
        <Flex
          mt="3"
          gap={{ base: "2", sm: "6" }}
          direction={{ base: "column", sm: "row" }}
          px="1"
        >
          {stats.lastInvoice && (
            <Text fontSize="12px" color="gray.400">
              Last invoice:{" "}
              <Link
                asChild
                fontWeight="600"
                color="primary.400"
                textDecoration="underline"
                textUnderlineOffset="2px"
              >
                <RouterLink
                  to={RouteConstants.invoices.detail.generate({
                    id: stats.lastInvoice.id,
                  })}
                >
                  {stats.lastInvoice.invoiceNumber}
                </RouterLink>
              </Link>{" "}
              · {money(stats.lastInvoice.total)}
              {stats.lastInvoice.date
                ? ` · ${moment(stats.lastInvoice.date).format("DD MMM YYYY")}`
                : ""}
            </Text>
          )}
          {stats.lastPayment && (
            <Text fontSize="12px" color="gray.400">
              Last payment:{" "}
              <Link
                asChild
                fontWeight="600"
                color="primary.400"
                textDecoration="underline"
                textUnderlineOffset="2px"
              >
                <RouterLink
                  to={RouteConstants.payments.detail.generate({
                    id: stats.lastPayment.id,
                  })}
                >
                  {stats.lastPayment.paymentNumber}
                </RouterLink>
              </Link>{" "}
              · {money(stats.lastPayment.amount)}
              {stats.lastPayment.date
                ? ` · ${moment(stats.lastPayment.date).format("DD MMM YYYY")}`
                : ""}
            </Text>
          )}
        </Flex>
      )}
    </Box>
  );
}
