import { IconButton, Menu, Box, Portal } from "@chakra-ui/react";
import { type Row } from "@tanstack/react-table";
import type { ReactNode, MouseEvent } from "react";
import { useState, useCallback } from "react";
import { ThreeDotsIcon } from "@/assets/custom";

export interface TableAction<T = any> {
  label: string | ReactNode;
  value: any;
  onClick: (row: T, event?: MouseEvent) => void;
  disabled?: (row: T) => boolean;
  variant?: "default" | "destructive";
  separator?: boolean;
}

interface ActionMenuProps<T> {
  row: Row<T>;
  actions: TableAction<T>[];
}

export function ActionMenu<T>({ row, actions }: ActionMenuProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  const handleActionClick = useCallback(
    (action: TableAction<T>, event: MouseEvent) => {
      event.stopPropagation();
      setIsOpen(false);
      action.onClick(row.original, event);
    },
    [row.original],
  );

  return (
    <Menu.Root open={isOpen} onOpenChange={({ open }) => setIsOpen(open)}>
      <Menu.Trigger asChild>
        <IconButton
          variant="ghost"
          size="sm"
          onClick={(e) => e.stopPropagation()}
          aria-label="Open menu"
          border={"none !important"}
          outline={"none !important"}
          bg={"transparent !important"}
        >
          <ThreeDotsIcon color={"gray.300"} />
        </IconButton>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner boxShadow={"none"}>
          <Menu.Content>
            {actions.map((action, index) => {
              const isDisabled = action.disabled?.(row.original) || false;

              return (
                <Box key={index}>
                  {action.separator && (
                    <Menu.Separator borderColor={"gray.50"} />
                  )}
                  <Menu.Item
                    onClick={(e) => !isDisabled && handleActionClick(action, e)}
                    color={
                      action.variant === "destructive" ? "red.500" : undefined
                    }
                    _hover={{
                      bg:
                        action.variant === "destructive" ? "red.50" : "gray.50",
                    }}
                    value={action.value}
                  >
                    {action.label}
                  </Menu.Item>
                </Box>
              );
            })}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
