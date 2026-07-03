import { useState } from "react";
import {
  Button,
  Dialog,
  Flex,
  IconButton,
  Menu,
  Portal,
  Text,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { ThreeDotsIcon } from "@/assets/custom";
import { RouteConstants } from "@/shared/constants/routes";
import type { ICustomer } from "@/shared/interface/customer";
import { FollowUpModal } from "./FollowUpModal";
import { useDeleteFollowUpMutation } from "../../api/query";

interface CustomerActionsMenuProps {
  customer: ICustomer;
}

/**
 * Card-level actions for a customer: edit the record, and manage the follow-up
 * reminder. General customer actions live here (not follow-up specific).
 */
export function CustomerActionsMenu({ customer }: CustomerActionsMenuProps) {
  const navigate = useNavigate();
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const { mutateAsync: deleteFollowUp, isPending: isDeleting } =
    useDeleteFollowUpMutation(customer.id);

  const hasFollowUp = Boolean(customer.followUpDate);

  const handleEdit = () => {
    navigate(RouteConstants.customers.edit.generate({ id: customer.id }));
  };

  const handleDelete = async () => {
    await deleteFollowUp();
    setConfirmDeleteOpen(false);
  };

  return (
    <>
      <Menu.Root>
        <Menu.Trigger asChild>
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="Customer actions"
            bg="white"
            border="1px solid"
            borderColor="gray.75"
            _hover={{ bg: "gray.50" }}
          >
            <ThreeDotsIcon color="gray.400" />
          </IconButton>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content minW="190px">
              <Menu.Item
                value="edit"
                onClick={handleEdit}
                _hover={{ bg: "gray.50" }}
              >
                Edit customer
              </Menu.Item>
              <Menu.Separator borderColor="gray.50" />
              <Menu.Item
                value="follow-up"
                onClick={() => setFollowUpOpen(true)}
                _hover={{ bg: "gray.50" }}
              >
                {hasFollowUp ? "Update follow-up" : "Set follow-up"}
              </Menu.Item>
              {hasFollowUp && (
                <Menu.Item
                  value="delete-follow-up"
                  color="red.500"
                  _hover={{ bg: "red.50" }}
                  onClick={() => setConfirmDeleteOpen(true)}
                >
                  Delete follow-up
                </Menu.Item>
              )}
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>

      <FollowUpModal
        open={followUpOpen}
        onClose={() => setFollowUpOpen(false)}
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
