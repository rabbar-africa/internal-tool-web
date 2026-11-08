import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  Flex,
  Grid,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import { AccountSelect } from "@/features/settings/components/account-details/AccountSelect";
import {
  PAYMENT_TERMS_OPTIONS,
  addDays,
  termsFromDates,
} from "@/features/invoices/utils/payment-terms";
import type { ConvertQuotationPayload } from "@/shared/interface/quotation";

const todayIso = () => new Date().toISOString().split("T")[0];

interface ConvertQuotationDialogProps {
  open: boolean;
  quotationNumber: string;
  isConverting: boolean;
  onCancel: () => void;
  onConfirm: (payload: ConvertQuotationPayload) => void;
}

/**
 * The few things an invoice needs that a quote doesn't have. Everything else
 * (customer, vehicle, job card, items, prices, tax, notes) comes from the quote.
 */
export function ConvertQuotationDialog({
  open,
  quotationNumber,
  isConverting,
  onCancel,
  onConfirm,
}: ConvertQuotationDialogProps) {
  const [date, setDate] = useState(todayIso);
  const [dueDate, setDueDate] = useState(todayIso);
  const [bankAccountId, setBankAccountId] = useState("");

  // Each opening starts afresh, from today.
  useEffect(() => {
    if (!open) return;
    setDate(todayIso());
    setDueDate(todayIso());
    setBankAccountId("");
  }, [open]);

  const terms = termsFromDates(date, dueDate);

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
          <Dialog.Content maxW="460px">
            <Dialog.Header>
              <Dialog.Title fontSize="16px">
                Make an invoice from {quotationNumber}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap="4">
                <Text fontSize="13px" color="gray.400">
                  The customer, vehicle, job card, items, prices, discount and
                  tax all come from the quote.
                </Text>
                <Grid templateColumns="1fr 1fr" gap="3">
                  <CustomInput
                    label="Invoice Date"
                    type="date"
                    value={date}
                    onChange={(e) => {
                      // Keep the same payment terms when the date moves.
                      const next = addDays(e.target.value, terms.days);
                      setDate(e.target.value);
                      if (next) setDueDate(next);
                    }}
                  />
                  <CustomInput
                    label="Due Date"
                    type="date"
                    value={dueDate}
                    inputProps={{ min: date }}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </Grid>
                <CustomSelect
                  label="Payment Terms"
                  options={PAYMENT_TERMS_OPTIONS}
                  value={
                    PAYMENT_TERMS_OPTIONS.some((o) => o.value === terms.value)
                      ? [terms.value]
                      : undefined
                  }
                  placeholder={terms.label}
                  onChange={(opt: { value: string[] }) => {
                    const next = addDays(date, Number(opt?.value?.[0] ?? 0));
                    if (next) setDueDate(next);
                  }}
                />
                <AccountSelect
                  label="Customer Pays Into"
                  value={bankAccountId}
                  onChange={setBankAccountId}
                  helperText="Printed on the invoice for the customer to pay into"
                />
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Flex gap="2" justify="flex-end" w="100%">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCancel}
                  disabled={isConverting}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  loading={isConverting}
                  loadingText="Making invoice..."
                  onClick={() =>
                    onConfirm({
                      date,
                      dueDate,
                      ...(bankAccountId ? { bankAccountId } : {}),
                    })
                  }
                >
                  Make invoice
                </Button>
              </Flex>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
