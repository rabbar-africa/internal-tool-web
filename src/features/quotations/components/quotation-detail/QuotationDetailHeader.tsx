import { useState } from "react";
import {
  Box,
  Button,
  Flex,
  IconButton,
  Link,
  Menu,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import moment from "moment";
import { CustomBreadCrumb } from "@/components/elements/custom-breadcrumb";
import { ThreeDotsIcon } from "@/assets/custom/ThreeDotsIcon";
import { RouteConstants } from "@/shared/constants/routes";
import type { IQuotation } from "@/shared/interface/quotation";
import { QuotationStatusBadge } from "../QuotationStatusBadge";
import type { useQuotationDetail } from "./useQuotationDetail";

type Detail = ReturnType<typeof useQuotationDetail>;

const formatDay = (v: string) => moment(v).format("DD MMM YYYY");

/** "Sent 3 Nov · Accepted 5 Nov": what has happened to the quote so far. */
function timeline(quote: IQuotation) {
  return [
    quote.sentAt && `Sent ${formatDay(quote.sentAt)}`,
    quote.acceptedAt && `Accepted ${formatDay(quote.acceptedAt)}`,
    quote.declinedAt &&
      `Declined ${formatDay(quote.declinedAt)}${
        quote.declineReason ? `: “${quote.declineReason}”` : ""
      }`,
    quote.convertedAt && `Invoiced ${formatDay(quote.convertedAt)}`,
  ].filter(Boolean) as string[];
}

export function QuotationDetailHeader({
  quote,
  detail,
}: {
  quote: IQuotation;
  detail: Detail;
}) {
  const { can } = detail;
  const [menuOpen, setMenuOpen] = useState(false);
  const events = timeline(quote);
  const invoiceGone =
    !!quote.invoice &&
    ["DELETED", "VOID"].includes(quote.invoice.status?.toUpperCase());

  const runAndClose = (handler: () => unknown) => async () => {
    try {
      await handler();
    } finally {
      setMenuOpen(false);
    }
  };

  return (
    <Stack gap="3">
      <Flex
        justify="space-between"
        align={{ base: "flex-start", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap="3"
      >
        <Stack gap="1">
          <CustomBreadCrumb
            items={[
              { label: "Quotes", to: RouteConstants.quotations.base.path },
              { label: quote.quotationNumber, isCurrent: true },
            ]}
          />
          <Text textStyle="small-regular" color="gray.300">
            {formatDay(quote.date)} ·{" "}
            {quote.expiryDate
              ? `Valid until ${formatDay(quote.expiryDate)}`
              : "No expiry"}
          </Text>
        </Stack>

        <Flex align="center" gap="2" wrap="wrap">
          <QuotationStatusBadge status={quote.displayStatus} />

          {can.send && (
            <Button
              size="sm"
              variant="outline"
              loading={detail.isChangingStatus}
              onClick={detail.markSent}
            >
              Mark as sent
            </Button>
          )}
          {can.accept && (
            <Button
              size="sm"
              variant="outline"
              loading={detail.isChangingStatus}
              onClick={detail.accept}
            >
              Accepted
            </Button>
          )}
          {can.decline && (
            <Button
              size="sm"
              variant="outline"
              disabled={detail.isChangingStatus}
              onClick={detail.requestDecline}
            >
              Declined
            </Button>
          )}
          {can.convert && (
            <Button size="sm" onClick={detail.requestConvert}>
              Make invoice
            </Button>
          )}

          <Menu.Root
            open={menuOpen}
            onOpenChange={({ open }) => setMenuOpen(open)}
          >
            <Menu.Trigger asChild>
              <IconButton
                variant="outline"
                size="sm"
                aria-label="Quote actions"
              >
                <ThreeDotsIcon color="gray.500" />
              </IconButton>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content minW="180px">
                  {can.edit && (
                    <Menu.Item value="edit" onClick={detail.edit}>
                      Edit
                    </Menu.Item>
                  )}
                  {detail.canShare && (
                    <Menu.Item
                      value="share-pdf"
                      closeOnSelect={false}
                      disabled={detail.isPdfBusy}
                      onSelect={() => void runAndClose(detail.sharePdf)()}
                    >
                      {detail.isPdfBusy ? "Preparing…" : "Send PDF"}
                    </Menu.Item>
                  )}
                  <Menu.Item
                    value="download-pdf"
                    closeOnSelect={false}
                    disabled={detail.isPdfBusy}
                    onSelect={() => void runAndClose(detail.downloadPdf)()}
                  >
                    {detail.isPdfBusy ? "Downloading…" : "Download PDF"}
                  </Menu.Item>
                  {(can.void || can.delete) && (
                    <Box>
                      <Menu.Separator borderColor="gray.50" />
                      {can.void && (
                        <Menu.Item value="void" onClick={detail.requestVoid}>
                          Void
                        </Menu.Item>
                      )}
                      {can.delete && (
                        <Menu.Item
                          value="delete"
                          color="red.500"
                          _hover={{ bg: "red.50" }}
                          onClick={detail.requestDelete}
                        >
                          Delete
                        </Menu.Item>
                      )}
                    </Box>
                  )}
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        </Flex>
      </Flex>

      {(events.length > 0 || quote.jobCard || quote.invoice) && (
        <Flex gap="4" wrap="wrap" fontSize="12px" color="gray.400">
          {events.length > 0 && <Text>{events.join(" · ")}</Text>}
          {quote.jobCard && (
            <Link asChild color="primary.300">
              <RouterLink
                to={RouteConstants.jobCards.detail.generate({
                  id: quote.jobCard.id,
                })}
              >
                Job card {quote.jobCard.jobNumber}
              </RouterLink>
            </Link>
          )}
          {quote.invoice && (
            <Link asChild color="primary.300">
              <RouterLink
                to={RouteConstants.invoices.detail.generate({
                  id: quote.invoice.id,
                })}
              >
                Invoice {quote.invoice.invoiceNumber}
                {invoiceGone ? ` (${quote.invoice.status.toLowerCase()})` : ""}
              </RouterLink>
            </Link>
          )}
        </Flex>
      )}
    </Stack>
  );
}
