import { useState } from "react";
import {
  Button,
  Dialog,
  Flex,
  Portal,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";

interface WriteOffInvoiceConfirmProps {
  open: boolean;
  invoiceNumber?: string;
  /** Outstanding balance being written off, preformatted for display. */
  balanceLabel?: string;
  isWritingOff: boolean;
  onCancel: () => void;
  onConfirm: (reason?: string) => void;
}

export function WriteOffInvoiceConfirm({
  open,
  invoiceNumber,
  balanceLabel,
  isWritingOff,
  onCancel,
  onConfirm,
}: WriteOffInvoiceConfirmProps) {
  const [reason, setReason] = useState("");

  const handleCancel = () => {
    setReason("");
    onCancel();
  };

  const handleConfirm = () => {
    onConfirm(reason.trim() || undefined);
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={({ open }) => {
        if (!open) handleCancel();
      }}
      placement="center"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="440px">
            <Dialog.Header>
              <Dialog.Title>
                <Text textStyle="large-bold" color="gray.500">
                  Write off invoice?
                </Text>
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap="4">
                <Text textStyle="small-regular" color="gray.400">
                  This writes off the outstanding balance
                  {balanceLabel ? (
                    <>
                      {" "}
                      <Text as="span" fontWeight="600" color="gray.500">
                        {balanceLabel}
                      </Text>
                    </>
                  ) : null}{" "}
                  on invoice{" "}
                  <Text as="span" fontWeight="600" color="gray.500">
                    {invoiceNumber}
                  </Text>
                  , marking it as settled without payment.
                </Text>

                <Stack gap="1.5">
                  <Text textStyle="tiny-semibold" color="gray.300">
                    Reason (optional)
                  </Text>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Bad debt, goodwill adjustment…"
                    rows={3}
                    resize="none"
                    borderColor="gray.100"
                    color="gray.500"
                  />
                </Stack>
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Flex gap="2" justify="flex-end" w="100%">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isWritingOff}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirm}
                  loading={isWritingOff}
                  loadingText="Writing off..."
                >
                  Write off
                </Button>
              </Flex>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
