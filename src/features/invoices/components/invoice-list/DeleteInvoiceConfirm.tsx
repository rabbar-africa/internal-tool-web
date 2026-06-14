import { Button, Dialog, Flex, Portal, Stack, Text } from "@chakra-ui/react";

export interface InvoiceDeleteTarget {
  /** Identity used for the actual delete operation. */
  id: string;
  /** Human-readable label shown in the confirmation copy. */
  invoiceNumber: string;
}

interface DeleteInvoiceConfirmProps {
  target: InvoiceDeleteTarget | null;
  isDeleting: boolean;
  onCancel: () => void;
  /** Receives the id so the parent can't accidentally delete by number. */
  onConfirm: (id: string) => void;
}

export function DeleteInvoiceConfirm({
  target,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteInvoiceConfirmProps) {
  return (
    <Dialog.Root
      open={Boolean(target)}
      onOpenChange={({ open }) => {
        if (!open) onCancel();
      }}
      placement="center"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="420px">
            <Dialog.Header>
              <Dialog.Title>
                <Text textStyle="large-bold" color="gray.500">
                  Delete invoice?
                </Text>
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap="2">
                <Text textStyle="small-regular" color="gray.400">
                  This will permanently delete invoice{" "}
                  <Text as="span" fontWeight="600" color="gray.500">
                    {target?.invoiceNumber}
                  </Text>
                  . This action cannot be undone.
                </Text>
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Flex gap="2" justify="flex-end" w="100%">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCancel}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  bg="red.500"
                  color="white"
                  _hover={{ bg: "red.600" }}
                  onClick={() => target && onConfirm(target.id)}
                  loading={isDeleting}
                  loadingText="Deleting..."
                  disabled={!target}
                >
                  Delete
                </Button>
              </Flex>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
