import { useState } from "react";
import {
  Button,
  Dialog,
  Flex,
  IconButton,
  Menu,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import { ThreeDotsIcon } from "@/assets/custom";
import type { ICustomer } from "@/shared/interface/customer";
import { FollowUpBadge } from "../FollowUpBadge";
import { FollowUpModal } from "./FollowUpModal";
import { useDeleteFollowUpMutation } from "../../api/query";

interface CustomerFollowUpProps {
  customer: ICustomer;
}

export function CustomerFollowUp({ customer }: CustomerFollowUpProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const { mutateAsync: deleteFollowUp, isPending: isDeleting } =
    useDeleteFollowUpMutation(customer.id);

  const hasFollowUp = Boolean(customer.followUpDate);

  const handleDelete = async () => {
    await deleteFollowUp();
    setConfirmDeleteOpen(false);
  };

  return (
    <>
      <Stack gap="1.5" align={{ base: "flex-start", md: "flex-end" }}>
        <Flex align="center" gap="2">
          <Text
            fontSize="11px"
            color="gray.300"
            textTransform="uppercase"
            letterSpacing="0.04em"
          >
            Next follow-up
          </Text>

          <Menu.Root>
            <Menu.Trigger asChild>
              <IconButton
                variant="ghost"
                size="xs"
                aria-label="Follow-up actions"
                bg="transparent"
              >
                <ThreeDotsIcon color="gray.300" />
              </IconButton>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content minW="180px">
                  <Menu.Item
                    value="update"
                    onClick={() => setModalOpen(true)}
                    _hover={{ bg: "gray.50" }}
                  >
                    {hasFollowUp ? "Edit follow-up" : "Set follow-up"}
                  </Menu.Item>
                  {hasFollowUp && (
                    <>
                      <Menu.Separator borderColor="gray.50" />
                      <Menu.Item
                        value="delete"
                        color="red.500"
                        _hover={{ bg: "red.50" }}
                        onClick={() => setConfirmDeleteOpen(true)}
                      >
                        Delete follow-up
                      </Menu.Item>
                    </>
                  )}
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        </Flex>

        <FollowUpBadge date={customer.followUpDate} />

        {customer.followUpNote && (
          <Text fontSize="11px" color="gray.300" maxW="220px" truncate>
            {customer.followUpNote}
          </Text>
        )}
      </Stack>

      <FollowUpModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        customer={customer}
      />

      <Dialog.Root
        open={confirmDeleteOpen}
        onOpenChange={({ open }) => {
          if (!open) setConfirmDeleteOpen(false);
        }}
        placement="center"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="400px">
              <Dialog.Header>
                <Dialog.Title fontSize="16px" fontWeight="600" color="gray.500">
                  Delete follow-up?
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Text textStyle="small-regular" color="gray.400">
                  This clears the scheduled follow-up for{" "}
                  <Text as="span" fontWeight="600" color="gray.500">
                    {customer.displayName}
                  </Text>
                  . You can set a new one anytime.
                </Text>
              </Dialog.Body>
              <Dialog.Footer>
                <Flex gap="3" justify="flex-end" w="100%">
                  <Button
                    variant="outline"
                    onClick={() => setConfirmDeleteOpen(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    bg="red.500"
                    color="white"
                    _hover={{ bg: "red.600" }}
                    onClick={handleDelete}
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
    </>
  );
}
