import { useState } from "react";
import {
  Box,
  Button,
  Center,
  Dialog,
  Flex,
  IconButton,
  Portal,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import moment from "moment";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import type { CarriedInvoice } from "@/shared/interface/invoice";
import type { CarryFlushFailure } from "./hooks/useInvoiceCarryForward";

const toNum = (v: string | null | undefined) => Number(v ?? 0) || 0;
const formatDate = (v: string | null) =>
  v ? moment(v).format("DD MMM YYYY") : "—";

interface BroughtForwardSectionProps {
  carried: CarriedInvoice[];
  availableCandidates: CarriedInvoice[];
  isLoadingCandidates: boolean;
  onAdd: (invoice: CarriedInvoice) => void | Promise<void>;
  onRemove: (carriedInvoiceId: string) => void | Promise<void>;
  isMutating: boolean;
  broughtForwardTotal: number;
  /** This invoice's own total — used only to preview the total due now. */
  invoiceTotal: number;
  /** Disables the action until a customer is chosen. */
  customerId: string;
  /** Create-flow only: links that were rejected after the invoice was saved. */
  flushFailures?: CarryFlushFailure[];
}

/**
 * Lets a new invoice carry a prior unpaid invoice's balance. The balance is
 * never added as a line item — this invoice's total stays untouched and the old
 * invoice stays a live receivable, settled first when payment arrives.
 */
export function BroughtForwardSection({
  carried,
  availableCandidates,
  isLoadingCandidates,
  onAdd,
  onRemove,
  isMutating,
  broughtForwardTotal,
  invoiceTotal,
  customerId,
  flushFailures = [],
}: BroughtForwardSectionProps) {
  const { formatMoney } = useFormatMoney();
  const [pickerOpen, setPickerOpen] = useState(false);

  const failedIds = new Set(flushFailures.map((f) => f.invoice.id));

  return (
    <Box p={{ base: "4", md: "6" }}>
      <Flex
        justify="space-between"
        align={{ base: "flex-start", sm: "center" }}
        direction={{ base: "column", sm: "row" }}
        gap="3"
        mb={carried.length ? "4" : "0"}
      >
        <Box>
          <Text fontSize="13px" fontWeight="600" color="gray.500">
            Previous Balance
          </Text>
          <Text fontSize="12px" color="gray.300" mt="0.5">
            Carry an earlier unpaid invoice onto this one. It stays a separate
            invoice — this total doesn&apos;t change — and any payment settles
            the older debt first.
          </Text>
        </Box>

        <Button
          type="button"
          variant="outline"
          size="sm"
          flexShrink={0}
          disabled={!customerId || isMutating}
          onClick={() => setPickerOpen(true)}
        >
          + Bring past unpaid balance
        </Button>
      </Flex>

      {!customerId && (
        <Text fontSize="12px" color="gray.300" mt="2">
          Select a customer to see their unpaid invoices.
        </Text>
      )}

      {carried.length > 0 && (
        <Stack gap="2">
          {carried.map((inv) => {
            const failure = flushFailures.find((f) => f.invoice.id === inv.id);
            return (
              <Flex
                key={inv.id}
                align="center"
                justify="space-between"
                gap="3"
                px="3"
                py="2.5"
                rounded="md"
                borderWidth="1px"
                borderColor={failedIds.has(inv.id) ? "red.200" : "gray.75"}
                bg={failedIds.has(inv.id) ? "red.50" : "gray.25"}
              >
                <Box minW="0">
                  <Flex align="center" gap="2" wrap="wrap">
                    <Text fontSize="13px" fontWeight="600" color="gray.500">
                      {inv.invoiceNumber}
                    </Text>
                    <Text fontSize="12px" color="gray.300">
                      · Issued {formatDate(inv.date)}
                    </Text>
                  </Flex>
                  {failure && (
                    <Text fontSize="11px" color="red.500" mt="0.5">
                      {failure.message}
                    </Text>
                  )}
                </Box>

                <Flex align="center" gap="3" flexShrink={0}>
                  <Text fontSize="13px" fontWeight="600" color="gray.500">
                    {formatMoney(toNum(inv.balance))}
                  </Text>
                  <IconButton
                    type="button"
                    aria-label={`Remove ${inv.invoiceNumber}`}
                    size="xs"
                    variant="ghost"
                    color="gray.300"
                    _hover={{ color: "red.500", bg: "red.50" }}
                    disabled={isMutating}
                    onClick={() => void onRemove(inv.id)}
                  >
                    ✕
                  </IconButton>
                </Flex>
              </Flex>
            );
          })}

          <Flex
            justify="space-between"
            align="center"
            px="3"
            py="2.5"
            rounded="md"
            bg="primary.50"
          >
            <Stack gap="0">
              <Text fontSize="13px" fontWeight="700" color="gray.500">
                Total due now
              </Text>
              <Text fontSize="11px" color="gray.400">
                {formatMoney(invoiceTotal)} this invoice +{" "}
                {formatMoney(broughtForwardTotal)} brought forward
              </Text>
            </Stack>
            <Text fontSize="16px" fontWeight="700" color="primary.400">
              {formatMoney(invoiceTotal + broughtForwardTotal)}
            </Text>
          </Flex>
        </Stack>
      )}

      <BringForwardDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        candidates={availableCandidates}
        isLoading={isLoadingCandidates}
        isMutating={isMutating}
        onSelect={async (invoice) => {
          await onAdd(invoice);
          setPickerOpen(false);
        }}
      />
    </Box>
  );
}

interface BringForwardDialogProps {
  open: boolean;
  onClose: () => void;
  candidates: CarriedInvoice[];
  isLoading: boolean;
  isMutating: boolean;
  onSelect: (invoice: CarriedInvoice) => void | Promise<void>;
}

function BringForwardDialog({
  open,
  onClose,
  candidates,
  isLoading,
  isMutating,
  onSelect,
}: BringForwardDialogProps) {
  const { formatMoney } = useFormatMoney();

  return (
    <Dialog.Root
      open={open}
      onOpenChange={({ open: o }) => {
        if (!o) onClose();
      }}
      placement="center"
      motionPreset="slide-in-bottom"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="520px">
            <Dialog.Header borderBottomWidth="1px" borderColor="gray.75" pb="4">
              <Stack gap="0.5">
                <Dialog.Title fontSize="16px" fontWeight="600" color="gray.500">
                  Bring past unpaid balance
                </Dialog.Title>
                <Text fontSize="12px" color="gray.300">
                  Pick an unpaid invoice to carry onto this one.
                </Text>
              </Stack>
            </Dialog.Header>

            <Dialog.Body py="5">
              {isLoading ? (
                <Center py="8">
                  <Spinner color="primary.400" />
                </Center>
              ) : !candidates.length ? (
                <Center py="8">
                  <Text fontSize="13px" color="gray.300" textAlign="center">
                    This customer has no other unpaid invoices to bring forward.
                  </Text>
                </Center>
              ) : (
                <Stack gap="2">
                  {candidates.map((inv) => (
                    <Button
                      key={inv.id}
                      // The dialog is portaled but still sits inside the
                      // invoice form's React tree, so events bubble to it —
                      // a submit-type button here would save the invoice.
                      type="button"
                      variant="outline"
                      justifyContent="space-between"
                      gap="3"
                      w="100%"
                      h="auto"
                      textAlign="left"
                      px="3"
                      py="3"
                      rounded="md"
                      borderColor="gray.75"
                      _hover={{ borderColor: "primary.400", bg: "primary.50" }}
                      disabled={isMutating}
                      onClick={() => void onSelect(inv)}
                    >
                      <Stack gap="0.5" minW="0">
                        <Text fontSize="13px" fontWeight="600" color="gray.500">
                          {inv.invoiceNumber}
                        </Text>
                        <Text fontSize="11px" color="gray.300">
                          Issued {formatDate(inv.date)} · Due{" "}
                          {formatDate(inv.dueDate)}
                        </Text>
                      </Stack>
                      <Stack gap="0.5" align="flex-end" flexShrink={0}>
                        <Text fontSize="13px" fontWeight="600" color="gray.500">
                          {formatMoney(toNum(inv.balance))}
                        </Text>
                        <Text fontSize="11px" color="gray.300">
                          of {formatMoney(toNum(inv.total))}
                        </Text>
                      </Stack>
                    </Button>
                  ))}
                </Stack>
              )}
            </Dialog.Body>

            <Dialog.Footer borderTopWidth="1px" borderColor="gray.75" pt="4">
              <Button type="button" variant="outline" onClick={onClose}>
                Close
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
