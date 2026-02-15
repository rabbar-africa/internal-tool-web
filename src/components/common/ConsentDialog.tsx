import { Button, Dialog, Flex, Portal, Text } from "@chakra-ui/react";
import { WarningIcon } from "@/assets/custom";

interface ConsentDialogProps {
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
  handleSubmit: () => void;
  heading: string;
  note?: string;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export default function ConsentDialog({
  open,
  onOpenChange,
  handleSubmit,
  heading,
  note,
  isLoading = false,
  confirmText = "Yes, Delete",
  cancelText = "Cancel",
  variant = "danger",
}: ConsentDialogProps) {
  const variantStyles = {
    danger: {
      iconBg: "error.50",
      iconColor: "error.300",
      buttonBg: "error.300",
    },
    warning: {
      iconBg: "warning.50",
      iconColor: "warning.300",
      buttonBg: "warning.300",
    },
    info: {
      iconBg: "primary.50",
      iconColor: "primary.300",
      buttonBg: "primary.300",
    },
  };

  const styles = variantStyles[variant];

  return (
    <Dialog.Root
      placement="center"
      motionPreset="slide-in-bottom"
      open={open}
      onOpenChange={onOpenChange}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="28rem" p="2rem">
            <Dialog.Body textAlign="center" p={0}>
              <Flex
                justifyContent="center"
                alignItems="center"
                mb="1.5rem"
                w="3.5rem"
                h="3.5rem"
                bg={styles.iconBg}
                rounded="full"
                mx="auto"
              >
                <WarningIcon color={styles.iconColor} w="1.5rem" />
              </Flex>

              <Text textStyle="h5-semibold" color="gray.500" mb=".75rem">
                {heading}
              </Text>

              {note && (
                <Text textStyle="default-regular" color="gray.200" mb="2rem">
                  {note}
                </Text>
              )}
            </Dialog.Body>

            <Dialog.Footer p={0} gap=".75rem" justifyContent="center">
              <Button
                variant="outlineSecondary"
                px="2rem"
                onClick={() => onOpenChange({ open: false })}
                disabled={isLoading}
              >
                {cancelText}
              </Button>
              <Button
                bg={styles.buttonBg}
                px="2rem"
                onClick={handleSubmit}
                loading={isLoading}
                disabled={isLoading}
              >
                {confirmText}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
