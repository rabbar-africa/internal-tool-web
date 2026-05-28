import { Button, Dialog, Flex, Portal, Stack, Text } from "@chakra-ui/react";
import type { Invoice } from "@/shared/interface/invoice";

interface DeleteInvoiceConfirmProps {
  invoice: Invoice | null;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteInvoiceConfirm({
  invoice,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteInvoiceConfirmProps) {
  return (
    <Dialog.Root
      open={Boolean(invoice)}
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
                    {invoice?.invoiceNumber}
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
                  onClick={onConfirm}
                  loading={isDeleting}
                  loadingText="Deleting..."
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
