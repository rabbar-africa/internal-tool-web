import { Box, Link, Stack, Text } from "@chakra-ui/react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";
import type { IInvoiceResponse } from "@/shared/interface/invoice";
import type { FromQuoteState } from "@/features/quotations/components/quotation-detail/useQuotationDetail";

/**
 * "Made from quote EST-…", linking back. Straight after converting, also warns
 * when a tax rate changed since the quote, so the totals differ.
 */
export function MadeFromQuote({ invoice }: { invoice: IInvoiceResponse }) {
  const location = useLocation();
  const fromQuote = (location.state as Partial<FromQuoteState> | null)
    ?.fromQuote;
  const quote = invoice.quotation;
  if (!quote) return null;

  return (
    <Stack gap="2">
      <Text fontSize="13px" color="gray.400">
        Made from quote{" "}
        <Link asChild color="primary.300" fontWeight="600">
          <RouterLink
            to={RouteConstants.quotations.detail.generate({ id: quote.id })}
          >
            {quote.quotationNumber}
          </RouterLink>
        </Link>
      </Text>
      {fromQuote?.taxChanged && (
        <Box
          bg="warning.50"
          borderWidth="1px"
          borderColor="warning.100"
          rounded="lg"
          px="4"
          py="3"
        >
          <Text fontSize="13px" color="gray.500">
            The tax rate has changed since this quote, so this invoice uses
            today's rate and its total differs from the quote's. Check the total
            before sending.
          </Text>
        </Box>
      )}
    </Stack>
  );
}
