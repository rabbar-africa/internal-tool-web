import { Box, Grid, Text } from "@chakra-ui/react";
import { formatCurrency } from "@/utils/calculations";

function Tile({
  label,
  amount,
  currencyCode,
  color = "gray.500",
}: {
  label: string;
  amount: number;
  currencyCode: string;
  color?: string;
}) {
  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="gray.75"
      rounded=".625rem"
      shadow="sm"
      p={{ base: "3", md: "4" }}
    >
      <Text textStyle="tiny-regular" color="gray.300" mb="1">
        {label}
      </Text>
      <Text
        fontSize={{ base: "16px", md: "20px" }}
        fontWeight="700"
        color={color}
        wordBreak="break-word"
      >
        {formatCurrency(amount, currencyCode)}
      </Text>
    </Box>
  );
}

export interface StatementFigures {
  currencyCode: string;
  openingBalance: number;
  moneyIn: number;
  moneyOut: number;
  closingBalance: number;
}

/** Opening, money in, money out and closing — a period at a glance. */
export function StatementSummary({
  currencyCode,
  openingBalance,
  moneyIn,
  moneyOut,
  closingBalance,
}: StatementFigures) {
  return (
    <Grid templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }} gap="3">
      <Tile
        label="Opening balance"
        amount={openingBalance}
        currencyCode={currencyCode}
        color={openingBalance < 0 ? "error.300" : undefined}
      />
      <Tile
        label="Money in"
        amount={moneyIn}
        currencyCode={currencyCode}
        color="success.300"
      />
      <Tile
        label="Money out"
        amount={moneyOut}
        currencyCode={currencyCode}
        color="error.300"
      />
      <Tile
        label="Closing balance"
        amount={closingBalance}
        currencyCode={currencyCode}
        color={closingBalance < 0 ? "error.300" : undefined}
      />
    </Grid>
  );
}
