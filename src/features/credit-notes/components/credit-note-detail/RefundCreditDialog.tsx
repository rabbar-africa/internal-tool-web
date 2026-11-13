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
import moment from "moment";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomNumberInput } from "@/components/input/CustomNumberInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import { CustomTextArea } from "@/components/input/CustomTextArea";
import { AccountSelect } from "@/features/settings/components/account-details/AccountSelect";
import { PAYMENT_MODE_OPTIONS } from "@/features/payments/components/create-payment/hooks/useCreatePayment";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import type {
  ICreditNote,
  RefundCreditNotePayload,
} from "@/shared/interface/credit-note";
import { PaymentModeDto } from "@/shared/interface/payment";

const todayIso = () => moment().format("YYYY-MM-DD");

interface RefundCreditDialogProps {
  open: boolean;
  note: ICreditNote;
  isRefunding: boolean;
  onCancel: () => void;
  onConfirm: (payload: RefundCreditNotePayload) => void;
}

/** Money paid back to the customer, out of one of the business's accounts. */
export function RefundCreditDialog({
  open,
  note,
  isRefunding,
  onCancel,
  onConfirm,
}: RefundCreditDialogProps) {
  const { formatMoney } = useFormatMoney();
  const creditLeft = Number(note.balance);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayIso);
  const [mode, setMode] = useState<PaymentModeDto>(PaymentModeDto.CASH);
  const [accountId, setAccountId] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");

  // Each opening starts afresh, offering all the credit left.
  useEffect(() => {
    if (!open) return;
    setAmount(String(creditLeft));
    setDate(todayIso());
    setMode(PaymentModeDto.CASH);
    setAccountId("");
    setReferenceNumber("");
    setNotes("");
  }, [open, creditLeft]);

  const value = Number(amount);
  const amountError = !(value > 0)
    ? "Enter an amount above 0"
    : value > creditLeft
      ? `Only ${formatMoney(creditLeft)} is left to refund`
      : null;
  const beforeNote = Boolean(date) && date < note.date.slice(0, 10);

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
          <Dialog.Content maxW="480px">
            <Dialog.Header>
              <Dialog.Title fontSize="16px">
                Refund {note.customerName ?? "the customer"}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap="4">
                <Text fontSize="13px" color="gray.400">
                  From {note.creditNoteNumber}'s {formatMoney(creditLeft)}{" "}
                  credit. It shows on the account's statement as money out.
                </Text>
                <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="3">
                  <CustomNumberInput
                    label="Amount"
                    required
                    precision={2}
                    allowNegative={false}
                    min={0}
                    value={amount}
                    onValueChange={(next) => setAmount(next)}
                    error={amountError ?? undefined}
                  />
                  <CustomInput
                    label="Date"
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
                </Grid>
                <CustomSelect
                  label="Paid by"
                  options={PAYMENT_MODE_OPTIONS}
                  value={[mode]}
                  onChange={(opt: { value: string[] }) =>
                    setMode(
                      (opt?.value?.[0] as PaymentModeDto) ??
                        PaymentModeDto.CASH,
                    )
                  }
                />
                <AccountSelect
                  label="Paid From"
                  includeCash
                  isCash={mode === PaymentModeDto.CASH}
                  value={accountId}
                  onChange={setAccountId}
                />
                <CustomInput
                  label="Reference"
                  placeholder="Optional, e.g. transfer reference"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                />
                <CustomTextArea
                  label="Notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Flex gap="2" justify="flex-end" w="100%">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCancel}
                  disabled={isRefunding}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  loading={isRefunding}
                  disabled={Boolean(amountError) || beforeNote}
                  onClick={() =>
                    onConfirm({
                      amount: value,
                      date,
                      mode,
                      ...(accountId ? { accountId } : {}),
                      ...(referenceNumber.trim()
                        ? { referenceNumber: referenceNumber.trim() }
                        : {}),
                      ...(notes.trim() ? { notes: notes.trim() } : {}),
                    })
                  }
                >
                  Refund {value > 0 ? formatMoney(value) : ""}
                </Button>
              </Flex>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
