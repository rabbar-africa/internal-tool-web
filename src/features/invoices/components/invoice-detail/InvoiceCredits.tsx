import { Box, Flex, Grid, Link, Stack, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import moment from "moment";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import { usePermissions } from "@/hooks/usePermissions";
import { RouteConstants } from "@/shared/constants/routes";
import type { IInvoiceResponse } from "@/shared/interface/invoice";
import { CreditNoteStatusBadge } from "@/features/credit-notes/components/CreditNoteStatusBadge";
import { isCreditableInvoiceStatus } from "@/features/credit-notes/utils/credit-note-status";

const formatDay = (value: string) => moment(value).format("DD MMM YYYY");

interface InvoiceCreditsProps {
  invoice: IInvoiceResponse;
  /** What payments put on this invoice, for Total − Paid − Credited. */
  paid: number;
}

/**
 * Credit on an invoice: what's been applied to it (from any credit note) and
 * the credit notes made from it. Its balance is total − paid − credited.
 */
export function InvoiceCredits({ invoice, paid }: InvoiceCreditsProps) {
  const { formatMoney } = useFormatMoney();
  const { canAccess } = usePermissions();
  const canOpenNotes = canAccess("creditNotes");
  const applications = invoice.creditApplications ?? [];
  const notes = invoice.creditNotes ?? [];
  const credited = Number(invoice.creditedAmount ?? 0);

  if (applications.length === 0 && notes.length === 0) return null;

  const noteLink = (id: string, number: string) =>
    canOpenNotes ? (
      <Link asChild textStyle="small-semibold" color="primary.400">
        <RouterLink to={RouteConstants.creditNotes.detail.generate({ id })}>
          {number}
        </RouterLink>
      </Link>
    ) : (
      <Text textStyle="small-semibold" color="gray.500">
        {number}
      </Text>
    );

  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="gray.75"
      rounded="lg"
      shadow="sm"
      overflow="hidden"
    >
      <Grid
        templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
        gap="3"
        px={{ base: "4", md: "5" }}
        py="3"
        bg="gray.25"
        borderBottomWidth="1px"
        borderColor="gray.75"
      >
        {(
          [
            ["Total", invoice.total],
            ["Paid", paid],
            ["Credited", credited],
            ["Balance", invoice.balance],
          ] as [string, string | number][]
        ).map(([label, value]) => (
          <Box key={label}>
            <Text textStyle="tiny-regular" color="gray.300">
              {label}
            </Text>
            <Text textStyle="small-semibold" color="gray.500">
              {formatMoney(value)}
            </Text>
          </Box>
        ))}
      </Grid>

      {applications.length > 0 && (
        <Stack gap="0">
          <Text
            px={{ base: "4", md: "5" }}
            pt="3"
            textStyle="small-semibold"
            color="gray.500"
          >
            Credits applied ({applications.length})
          </Text>
          {applications.map((application) => (
            <Flex
              key={application.id}
              justify="space-between"
              align="center"
              gap="3"
              px={{ base: "4", md: "5" }}
              py="2.5"
            >
              <Stack gap="0.5">
                {noteLink(
                  application.creditNote.id,
                  application.creditNote.creditNoteNumber,
                )}
                <Text textStyle="tiny-regular" color="gray.300">
                  {formatDay(application.date)}
                </Text>
              </Stack>
              <Text textStyle="small-semibold" color="green.600">
                {formatMoney(application.amount)}
              </Text>
            </Flex>
          ))}
        </Stack>
      )}

      {notes.length > 0 && (
        <Stack
          gap="0"
          borderTopWidth={applications.length > 0 ? "1px" : "0"}
          borderColor="gray.50"
        >
          <Text
            px={{ base: "4", md: "5" }}
            pt="3"
            textStyle="small-semibold"
            color="gray.500"
          >
            Credit notes from this invoice ({notes.length})
          </Text>
          {notes.map((note) => (
            <Flex
              key={note.id}
              justify="space-between"
              align="center"
              gap="3"
              px={{ base: "4", md: "5" }}
              py="2.5"
            >
              <Stack gap="0.5">
                {noteLink(note.id, note.creditNoteNumber)}
                <Text textStyle="tiny-regular" color="gray.300">
                  {formatDay(note.date)}
                  {note.status === "OPEN" && Number(note.balance) > 0
                    ? ` · ${formatMoney(note.balance)} credit left`
                    : ""}
                </Text>
              </Stack>
              <Flex align="center" gap="3">
                <Text textStyle="small-semibold" color="gray.500">
                  {formatMoney(note.total)}
                </Text>
                <CreditNoteStatusBadge
                  status={note.status}
                  h="1.5rem"
                  minW="auto"
                  px="2.5"
                />
              </Flex>
            </Flex>
          ))}
        </Stack>
      )}
    </Box>
  );
}

/** "New credit note" for an issued invoice, for roles that can make one. */
export function useNewCreditNoteAction(invoice: IInvoiceResponse) {
  const { canAccess } = usePermissions();
  return (
    canAccess("creditNoteCreate") && isCreditableInvoiceStatus(invoice.status)
  );
}
