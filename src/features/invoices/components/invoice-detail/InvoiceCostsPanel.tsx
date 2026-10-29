import { Box, Button, Flex, Grid, Stack, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import { usePermissions } from "@/hooks/usePermissions";
import { RouteConstants } from "@/shared/constants/routes";
import { useGetInvoiceCostsQuery } from "@/features/expenses/api/query";

interface InvoiceCostsPanelProps {
  invoiceId: string;
}

const ROW_COLUMNS = { base: "1fr auto", md: "1fr 8rem 8rem 8rem" };

/** One line of the panel: name, then billed / spent / margin. */
function CostRow({
  name,
  billed,
  spent,
  margin,
  bold = false,
  muted = false,
}: {
  name: string;
  billed?: number;
  spent: number;
  margin?: number;
  bold?: boolean;
  muted?: boolean;
}) {
  const { formatMoney } = useFormatMoney();
  const textStyle = bold ? "small-semibold" : "small-regular";
  return (
    <Grid
      templateColumns={ROW_COLUMNS}
      gap="3"
      px={{ base: "4", md: "5" }}
      py="2.5"
      alignItems="center"
    >
      <Text textStyle={textStyle} color={muted ? "gray.400" : "gray.500"}>
        {name}
      </Text>
      <Text
        textStyle={textStyle}
        color="gray.400"
        textAlign="right"
        display={{ base: "none", md: "block" }}
      >
        {billed != null ? formatMoney(billed) : ""}
      </Text>
      <Text
        textStyle={textStyle}
        color="gray.500"
        textAlign="right"
        display={{ base: "none", md: "block" }}
      >
        {formatMoney(spent)}
      </Text>
      {/* Mobile shows only the margin (or the spend, for rows with none). */}
      <Text
        textStyle={textStyle}
        textAlign="right"
        color={
          margin == null ? "gray.500" : margin < 0 ? "error.300" : "success.300"
        }
      >
        {formatMoney(margin ?? -spent)}
      </Text>
    </Grid>
  );
}

/**
 * What the job cost against what it billed, per invoice item, from the
 * expenses recorded against this invoice. "Billed" is before tax: tax is
 * collected for the government, not earned.
 */
export function InvoiceCostsPanel({ invoiceId }: InvoiceCostsPanelProps) {
  const navigate = useNavigate();
  const { formatMoney } = useFormatMoney();
  const { canRead, canCreate } = usePermissions();
  const { data } = useGetInvoiceCostsQuery(invoiceId, {
    enabled: Boolean(invoiceId) && canRead("expenses"),
  });
  const costs = data?.data;

  if (!costs || !canRead("expenses")) return null;

  const hasCosts = costs.totals.spent > 0;
  const recordCosts = () =>
    navigate(RouteConstants.invoices.costs.generate({ id: invoiceId }));

  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="gray.75"
      rounded="lg"
      shadow="sm"
      overflow="hidden"
    >
      <Flex
        justify="space-between"
        align="center"
        gap="3"
        px={{ base: "4", md: "5" }}
        py="3"
        borderBottomWidth={hasCosts ? "1px" : "0"}
        borderColor="gray.75"
        bg="gray.25"
      >
        <Box>
          <Text textStyle="small-semibold" color="gray.500">
            Costs & Margin
          </Text>
          <Text textStyle="tiny-regular" color="gray.300">
            {hasCosts
              ? `Spent ${formatMoney(costs.totals.spent)} · margin ${formatMoney(
                  costs.totals.margin,
                )}`
              : "No costs recorded yet. Record what you spent to see the margin on each item."}
          </Text>
        </Box>
        <Flex gap="2" flexShrink={0}>
          {hasCosts && (
            <Button
              size="xs"
              variant="ghost"
              color="primary.300"
              onClick={() =>
                navigate(
                  `${RouteConstants.expenses.base.path}?invoiceId=${encodeURIComponent(invoiceId)}`,
                )
              }
            >
              View expenses
            </Button>
          )}
          {canCreate("expenses") && (
            <Button size="xs" variant="outline" onClick={recordCosts}>
              Record costs
            </Button>
          )}
        </Flex>
      </Flex>

      {hasCosts && (
        <Stack gap="0">
          <Grid
            templateColumns={ROW_COLUMNS}
            gap="3"
            px={{ base: "4", md: "5" }}
            pt="3"
            pb="1"
          >
            <Text textStyle="tiny-regular" color="gray.300">
              Item
            </Text>
            <Text
              textStyle="tiny-regular"
              color="gray.300"
              textAlign="right"
              display={{ base: "none", md: "block" }}
            >
              Billed
            </Text>
            <Text
              textStyle="tiny-regular"
              color="gray.300"
              textAlign="right"
              display={{ base: "none", md: "block" }}
            >
              Spent
            </Text>
            <Text textStyle="tiny-regular" color="gray.300" textAlign="right">
              Margin
            </Text>
          </Grid>
          {costs.lines.map((line) => (
            <CostRow
              key={line.invoiceLineItemId}
              name={line.name}
              billed={line.billed}
              spent={line.spent}
              margin={line.margin}
            />
          ))}
          {costs.other.spent > 0 && (
            <CostRow name="Other costs" spent={costs.other.spent} muted />
          )}
          <Box borderTopWidth="1px" borderColor="gray.75">
            <CostRow
              name="Total"
              billed={costs.totals.billed}
              spent={costs.totals.spent}
              margin={costs.totals.margin}
              bold
            />
          </Box>
        </Stack>
      )}
    </Box>
  );
}
