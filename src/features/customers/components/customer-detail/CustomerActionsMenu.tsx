import { useState } from "react";
import { IconButton, Menu, Portal, Stack, Text } from "@chakra-ui/react";
import { EraseCustomerDialog } from "./EraseCustomerDialog";
import { DeleteCustomerDialog } from "./DeleteCustomerDialog";
import { MergeCustomerDialog } from "./MergeCustomerDialog";
import { useNavigate } from "react-router-dom";
import { ThreeDotsIcon } from "@/assets/custom";
import { RouteConstants } from "@/shared/constants/routes";
import type { ICustomer } from "@/shared/interface/customer";
import { usePermissions } from "@/hooks/usePermissions";
import { WorkHistoryModal } from "./WorkHistoryModal";

interface CustomerActionsMenuProps {
  customer: ICustomer;
}

type RemoveDialog = "delete" | "merge" | "erase" | null;

/** Card-level actions for a customer: edit, add a reminder, work history. */
export function CustomerActionsMenu({ customer }: CustomerActionsMenuProps) {
  const navigate = useNavigate();
  const { canRead, canUpdate, canDelete } = usePermissions();
  const [workHistoryOpen, setWorkHistoryOpen] = useState(false);
  // One at a time: the blocked delete hands over to merge or erase.
  const [dialog, setDialog] = useState<RemoveDialog>(null);
  const close = () => setDialog(null);
  const canMerge = canUpdate("clients") && canDelete("clients");
  const name =
    customer.displayName ||
    `${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim() ||
    "this customer";

  // Deleted or erased, the customer is gone, so their page is too.
  const leave = () => navigate(RouteConstants.customers.base.path);

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
              {canMerge && (
                <>
                  <Menu.Separator borderColor="gray.50" />
                  <Menu.Item
                    value="merge"
                    onClick={() => setDialog("merge")}
                    _hover={{ bg: "gray.50" }}
                  >
                    <Stack gap="0" py="1">
                      <Text>Merge into another customer…</Text>
                      <Text fontSize="12px" color="gray.300">
                        For duplicates
                      </Text>
                    </Stack>
                  </Menu.Item>
                </>
              )}
              {canDelete("clients") && (
                <>
                  {!canMerge && <Menu.Separator borderColor="gray.50" />}
                  <Menu.Item
                    value="delete"
                    onClick={() => setDialog("delete")}
                    _hover={{ bg: "gray.50" }}
                  >
                    <Stack gap="0" py="1">
                      <Text>Delete customer…</Text>
                      <Text fontSize="12px" color="gray.300">
                        For mistakes, before any invoice
                      </Text>
                    </Stack>
                  </Menu.Item>
                  <Menu.Item
                    value="erase"
                    onClick={() => setDialog("erase")}
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
      {dialog === "delete" && (
        <DeleteCustomerDialog
          customerId={customer.id}
          customerName={name}
          onClose={close}
          onDeleted={leave}
          onMerge={() => setDialog("merge")}
          onErase={() => setDialog("erase")}
        />
      )}

      {dialog === "merge" && (
        <MergeCustomerDialog
          customerId={customer.id}
          customerName={name}
          onClose={close}
          onMerged={(keptId) =>
            navigate(RouteConstants.customers.detail.generate({ id: keptId }))
          }
        />
      )}

      {dialog === "erase" && (
        <EraseCustomerDialog
          customerId={customer.id}
          onClose={close}
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
