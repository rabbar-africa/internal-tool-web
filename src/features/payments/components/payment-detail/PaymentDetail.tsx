import { useState } from "react";
import {
  Box,
  Center,
  Flex,
  IconButton,
  Menu,
  Portal,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { CaretLeft } from "@/assets/custom/CaretLeft";
import { ThreeDotsIcon } from "@/assets/custom/ThreeDotsIcon";
import ConsentDialog from "@/components/common/ConsentDialog";
import { usePaymentDetail } from "./usePaymentDetail";
import { PaymentReceipt } from "./PaymentReceipt";

export function PaymentDetail() {
  const {
    payment,
    isLoading,
    isError,
    goBack,
    handleEdit,
    handleDownloadPdf,
    pendingDelete,
    requestDelete,
    cancelDelete,
    confirmDelete,
    isDeleting,
  } = usePaymentDetail();

  const [menuOpen, setMenuOpen] = useState(false);
  const runAndClose = (fn: () => void) => () => {
    setMenuOpen(false);
    fn();
  };

  if (isLoading) {
    return (
      <Center py="20">
        <Spinner color="primary.400" />
      </Center>
    );
  }

  if (isError || !payment) {
    return (
      <Center py="20">
        <Text color="error.300">Payment not found.</Text>
      </Center>
    );
  }

  return (
    <>
      <Flex
        justify="space-between"
        align={{ base: "flex-start", sm: "center" }}
        direction={{ base: "column", sm: "row" }}
        gap="3"
        mb="6"
      >
        <Flex align="center" gap="3">
          <Flex
            as="button"
            align="center"
            justify="center"
            boxSize="9"
            rounded="lg"
            borderWidth="1px"
            borderColor="gray.75"
            color="gray.400"
            bg="white"
            _hover={{ bg: "gray.50" }}
            cursor="pointer"
            flexShrink={0}
            onClick={goBack}
            aria-label="Back to payments"
          >
            <CaretLeft boxSize="1rem" />
          </Flex>
          <Box>
            <Text textStyle="h3-bold" color="gray.500">
              {payment.paymentNumber || "Payment"}
            </Text>
            <Text textStyle="small-regular" color="gray.300" mt="0.5">
              Payment receipt
            </Text>
          </Box>
        </Flex>

        <Menu.Root
          open={menuOpen}
          onOpenChange={({ open }) => setMenuOpen(open)}
        >
          <Menu.Trigger asChild>
            <IconButton
              variant="outline"
              size="sm"
              aria-label="Payment actions"
            >
              <ThreeDotsIcon color="gray.500" />
            </IconButton>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content minW="180px">
                <Menu.Item value="edit" onClick={runAndClose(handleEdit)}>
                  Edit
                </Menu.Item>
                <Menu.Item
                  value="download-pdf"
                  onClick={runAndClose(handleDownloadPdf)}
                >
                  Download PDF
                </Menu.Item>
                <Box>
                  <Menu.Separator borderColor="gray.50" />
                  <Menu.Item
                    value="delete"
                    color="red.500"
                    _hover={{ bg: "red.50" }}
                    onClick={runAndClose(requestDelete)}
                  >
                    Delete
                  </Menu.Item>
                </Box>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      </Flex>

      <PaymentReceipt payment={payment} />

      <ConsentDialog
        open={pendingDelete}
        onOpenChange={({ open }) => {
          if (!open) cancelDelete();
        }}
        handleSubmit={confirmDelete}
        heading="Delete payment?"
        note={`This will permanently delete payment ${
          payment.paymentNumber || ""
        }. This action cannot be undone.`}
        isLoading={isDeleting}
        confirmText="Yes, Delete"
      />
    </>
  );
}
