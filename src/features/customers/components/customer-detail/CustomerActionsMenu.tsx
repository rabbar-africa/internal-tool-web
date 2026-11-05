import { useState } from "react";
import { IconButton, Menu, Portal } from "@chakra-ui/react";
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
  const { canRead } = usePermissions();
  const [workHistoryOpen, setWorkHistoryOpen] = useState(false);

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
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
      {workHistoryOpen && (
        <WorkHistoryModal
          customer={customer}
          onClose={() => setWorkHistoryOpen(false)}
        />
      )}
    </>
  );
}
