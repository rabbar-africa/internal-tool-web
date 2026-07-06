import { IconButton, Menu, Portal } from "@chakra-ui/react";
import { ThreeDotsIcon } from "@/assets/custom/ThreeDotsIcon";
import type { Reminder } from "@/shared/interface/reminder";
import type { ReminderActionHandlers } from "./useReminderActions";

interface ReminderRowActionsProps {
  reminder: Reminder;
  handlers: ReminderActionHandlers;
}

/** Compact 3-dot menu of reminder actions — used inside panel rows. */
export function ReminderRowActions({
  reminder,
  handlers,
}: ReminderRowActionsProps) {
  const isPending = reminder.status === "PENDING";

  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <IconButton
          variant="ghost"
          size="xs"
          aria-label="Reminder actions"
          onClick={(e) => e.stopPropagation()}
        >
          <ThreeDotsIcon color="gray.500" />
        </IconButton>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content minW="170px">
            {isPending && (
              <>
                <Menu.Item
                  value="complete"
                  onClick={() => handlers.complete(reminder)}
                >
                  Mark done
                </Menu.Item>
                <Menu.Item
                  value="reminded"
                  onClick={() => handlers.markReminded(reminder)}
                >
                  Mark reminded
                </Menu.Item>
                <Menu.Item
                  value="dismiss"
                  onClick={() => handlers.dismiss(reminder)}
                >
                  Dismiss
                </Menu.Item>
              </>
            )}
            <Menu.Item value="edit" onClick={() => handlers.edit(reminder)}>
              Edit
            </Menu.Item>
            <Menu.Item
              value="delete"
              color="red.500"
              _hover={{ bg: "red.50" }}
              onClick={() => handlers.remove(reminder)}
            >
              Delete
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
