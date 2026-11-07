import { useState } from "react";
import { IconButton, Menu, Portal, Stack, Text } from "@chakra-ui/react";
import ConsentDialog from "@/components/common/ConsentDialog";
import { useDeleteCustomerMutation } from "../../api/query";
import { EraseCustomerDialog } from "./EraseCustomerDialog";
import { useNavigate } from "react-router-dom";
import { ThreeDotsIcon } from "@/assets/custom";
import { RouteConstants } from "@/shared/constants/routes";
import type { ICustomer } from "@/shared/interface/customer";
import { usePermissions } from "@/hooks/usePermissions";
import { WorkHistoryModal } from "./WorkHistoryModal";

interface CustomerActionsMenuProps {
  customer: ICustomer;
}

/** Card-level actions for a customer: edit, add a reminder, work history. */
export function CustomerActionsMenu({ customer }: CustomerActionsMenuProps) {
  const navigate = useNavigate();
  const { canRead, canDelete } = usePermissions();
  const [workHistoryOpen, setWorkHistoryOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [eraseOpen, setEraseOpen] = useState(false);
  const { mutateAsync: deleteCustomer, isPending: isDeleting } =
    useDeleteCustomerMutation();

  // Either way the customer is gone, so their page is too.
  const leave = () => navigate(RouteConstants.customers.base.path);

  const handleDelete = async () => {
    await deleteCustomer(customer.id);
    setConfirmDelete(false);
    leave();
  };

  const handleEdit = () => {
    navigate(RouteConstants.customers.edit.generate({ id: customer.id }));
  };

  const handleAddReminder = () => {
    navigate(
      `${RouteConstants.reminders.create.path}?clientId=${customer.id}&type=FOLLOW_UP`,
    );
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
                value="add-reminder"
                onClick={handleAddReminder}
                _hover={{ bg: "gray.50" }}
              >
                Add reminder
              </Menu.Item>
              {canRead("invoices") && (
                <Menu.Item
                  value="work-history"
                  onClick={() => setWorkHistoryOpen(true)}
                  _hover={{ bg: "gray.50" }}
                >
                  Work history
                </Menu.Item>
              )}
              {canDelete("clients") && (
                <>
                  <Menu.Separator borderColor="gray.50" />
                  <Menu.Item
                    value="delete"
                    onClick={() => setConfirmDelete(true)}
                    _hover={{ bg: "gray.50" }}
                  >
                    <Stack gap="0" py="1">
                      <Text>Delete customer</Text>
                      <Text fontSize="12px" color="gray.300">
                        For duplicates and mistakes
                      </Text>
                    </Stack>
                  </Menu.Item>
                  <Menu.Item
                    value="erase"
                    onClick={() => setEraseOpen(true)}
                    _hover={{ bg: "gray.50" }}
                  >
                    <Stack gap="0" py="1">
                      <Text>Erase customer…</Text>
                      <Text fontSize="12px" color="gray.300">
                        They asked to be forgotten
                      </Text>
                    </Stack>
                  </Menu.Item>
                </>
              )}
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
      <ConsentDialog
        open={confirmDelete}
        onOpenChange={({ open }) => {
          if (!open && !isDeleting) setConfirmDelete(false);
        }}
        heading={`Delete ${customer.displayName}?`}
        note="For duplicates and mistakes. Their invoices, payments, job cards and vehicles stay, no longer linked, and their name stays copied on them. Their paperwork is deleted. If they asked to be forgotten, use Erase customer instead."
        handleSubmit={() => void handleDelete()}
        isLoading={isDeleting}
      />

      {eraseOpen && (
        <EraseCustomerDialog
          customerId={customer.id}
          onClose={() => setEraseOpen(false)}
          onErased={leave}
        />
      )}

      {workHistoryOpen && (
        <WorkHistoryModal
          customer={customer}
          onClose={() => setWorkHistoryOpen(false)}
        />
      )}
    </>
  );
}
