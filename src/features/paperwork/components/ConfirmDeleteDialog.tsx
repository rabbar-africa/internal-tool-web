import { Button, Dialog, Flex, Portal, Text } from "@chakra-ui/react";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  title?: string;
  message?: string;
}

export function ConfirmDeleteDialog({
  open,
  onClose,
  onConfirm,
  loading,
  title = "Delete document",
  message = "This will permanently delete the document and its renewal history. This action cannot be undone.",
}: ConfirmDeleteDialogProps) {
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
          <Dialog.Content maxW="420px">
            <Dialog.Header pb="3">
              <Dialog.Title fontSize="16px" fontWeight="600" color="gray.500">
                {title}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body py="2">
              <Text fontSize="13px" color="gray.400" lineHeight="1.5">
                {message}
              </Text>
            </Dialog.Body>
            <Dialog.Footer pt="4">
              <Flex gap="3" justify="flex-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  bg="error.400"
                  _hover={{ bg: "error.500" }}
                  onClick={onConfirm}
                  loading={loading}
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
