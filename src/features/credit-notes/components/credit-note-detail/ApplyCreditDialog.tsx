import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  Flex,
  Portal,
  Separator,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import moment from "moment";
import { CustomCheckbox } from "@/components/input/CustomCheckBox";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomNumberInput } from "@/components/input/CustomNumberInput";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import { useGetAllInvoicesQuery } from "@/features/invoices/api/query";
import type { ICreditNote } from "@/shared/interface/credit-note";
import type { IInvoiceResponse } from "@/shared/interface/invoice";

/** What the list endpoint really sends (see InvoicePicker). */
type InvoiceRow = Pick<
  IInvoiceResponse,
  "id" | "invoiceNumber" | "status" | "date" | "dueDate" | "balance"
>;

/** Invoices credit can go on: issued and still owing. */
const OWING = ["SENT", "PARTIALLY_PAID", "OVERDUE"];

const round2 = (n: number) => Math.round(n * 100) / 100;
const todayIso = () => moment().format("YYYY-MM-DD");

interface ApplyCreditDialogProps {
  open: boolean;
  note: ICreditNote;
  isApplying: boolean;
  onCancel: () => void;
  onConfirm: (payload: {
    applications: { invoiceId: string; amount: number; date?: string }[];
  }) => void;
}

/**
 * Puts the note's credit on the customer's invoices. All of it goes on or
 * none (the API's rule), and together it can't be more than is left.
 */
export function ApplyCreditDialog({
  open,
  note,
  isApplying,
  onCancel,
  onConfirm,
}: ApplyCreditDialogProps) {
  const { formatMoney } = useFormatMoney();
  const creditLeft = Number(note.balance);
  const { data, isLoading } = useGetAllInvoicesQuery(
    { customerId: note.customerId ?? undefined, limit: 100 },
    { enabled: open && Boolean(note.customerId) },
  );

  const invoices = useMemo(
    () =>
      ((data?.data ?? []) as unknown as InvoiceRow[])
        .filter(
          (invoice) =>
            OWING.includes(invoice.status?.toUpperCase()) &&
            Number(invoice.balance) > 0,
        )
        // Oldest first: that's usually what gets paid off first.
        .sort((a, b) => a.date.localeCompare(b.date)),
    [data?.data],
  );

  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [date, setDate] = useState(todayIso);

  // Each opening starts afresh.
  useEffect(() => {
    if (!open) return;
    setAmounts({});
    setDate(todayIso());
  }, [open]);

  const ticked = Object.keys(amounts);
  const total = round2(
    ticked.reduce((sum, id) => sum + (Number(amounts[id]) || 0), 0),
  );

  const toggle = (invoice: InvoiceRow, checked: boolean) =>
    setAmounts((prev) => {
      const next = { ...prev };
      if (!checked) {
        delete next[invoice.id];
        return next;
      }
      // The lower of what it owes and what's still unallocated.
      const unallocated = Math.max(0, round2(creditLeft - total));
      next[invoice.id] = String(Math.min(Number(invoice.balance), unallocated));
      return next;
    });

  const errorFor = (invoice: InvoiceRow) => {
    if (!(invoice.id in amounts)) return null;
    const amount = Number(amounts[invoice.id]);
    if (!(amount > 0)) return "Enter an amount above 0";
    if (amount > Number(invoice.balance)) {
      return `It only owes ${formatMoney(invoice.balance)}`;
    }
    return null;
  };
  const rowErrors = invoices.map(errorFor).filter(Boolean);
  const overCredit = total > creditLeft;
  const beforeNote = Boolean(date) && date < note.date.slice(0, 10);
  const canSave =
    ticked.length > 0 && rowErrors.length === 0 && !overCredit && !beforeNote;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={({ open: next }) => {
        if (!next) onCancel();
      }}
      placement="center"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner px="4">
          <Dialog.Content maxW="520px">
            <Dialog.Header>
              <Dialog.Title fontSize="16px">
                Apply {note.creditNoteNumber} to invoices
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap="4">
                <Text fontSize="13px" color="gray.400">
                  {formatMoney(creditLeft)} credit left to use on{" "}
                  {note.customerName ?? "this customer"}'s invoices.
                </Text>

                {isLoading ? (
                  <Flex justify="center" py="6">
                    <Spinner color="primary.400" />
                  </Flex>
                ) : invoices.length === 0 ? (
                  <Text fontSize="13px" color="gray.300" py="2">
                    {note.customerName ?? "This customer"} has no invoices that
                    still owe money. Refund the credit instead, or keep it for
                    later.
                  </Text>
                ) : (
                  <Stack
                    gap="0"
                    borderWidth="1px"
                    borderColor="gray.75"
                    rounded="md"
                    separator={<Separator borderColor="gray.75" />}
                  >
                    {invoices.map((invoice) => {
                      const isTicked = invoice.id in amounts;
                      const error = errorFor(invoice);
                      return (
                        <Flex
                          key={invoice.id}
                          gap="3"
                          px="3"
                          py="2.5"
                          align={{ base: "stretch", sm: "center" }}
                          direction={{ base: "column", sm: "row" }}
                        >
                          <Box flex="1" minW={0}>
                            <CustomCheckbox
                              checked={isTicked}
                              onCheckedChange={({ checked }) =>
                                toggle(invoice, Boolean(checked))
                              }
                              label={invoice.invoiceNumber}
                            />
                            <Text fontSize="11px" color="gray.300" pl="6">
                              Owes {formatMoney(invoice.balance)}
                              {invoice.dueDate &&
                                ` · due ${moment(invoice.dueDate).format("DD MMM YYYY")}`}
                            </Text>
                            {error && (
                              <Text fontSize="11px" color="error.300" pl="6">
                                {error}
                              </Text>
                            )}
                          </Box>
                          {isTicked && (
                            <Box w={{ base: "100%", sm: "9rem" }}>
                              <CustomNumberInput
                                precision={2}
                                allowNegative={false}
                                min={0}
                                value={amounts[invoice.id]}
                                onValueChange={(value) =>
                                  setAmounts((prev) => ({
                                    ...prev,
                                    [invoice.id]: value,
                                  }))
                                }
                              />
                            </Box>
                          )}
                        </Flex>
                      );
                    })}
                  </Stack>
                )}

                {invoices.length > 0 && (
                  <>
                    <CustomInput
                      label="Date applied"
                      type="date"
                      value={date}
                      inputProps={{ min: note.date.slice(0, 10) }}
                      onChange={(e) => setDate(e.target.value)}
                      error={
                        beforeNote
                          ? "Can't be before the credit note's date"
                          : undefined
                      }
                    />
                    <Flex
                      justify="space-between"
                      fontSize="13px"
                      fontWeight="600"
                      color={overCredit ? "error.300" : "gray.500"}
                    >
                      <Text>Applying</Text>
                      <Text>
                        {formatMoney(total)} of {formatMoney(creditLeft)}
                      </Text>
                    </Flex>
                    {overCredit && (
                      <Text fontSize="12px" color="error.300" mt="-2">
                        That's more than the credit left.
                      </Text>
                    )}
                  </>
                )}
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Flex gap="2" justify="flex-end" w="100%">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCancel}
                  disabled={isApplying}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  loading={isApplying}
                  disabled={!canSave}
                  onClick={() =>
                    onConfirm({
                      applications: ticked.map((invoiceId) => ({
                        invoiceId,
                        amount: Number(amounts[invoiceId]),
                        date,
                      })),
                    })
                  }
                >
                  Apply {total > 0 ? formatMoney(total) : "credit"}
                </Button>
              </Flex>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
