import type { ReactNode } from "react";
import { ActionBar, Button, Portal } from "@chakra-ui/react";

interface SelectionActionBarProps {
  /** Rows ticked; the bar shows while there are any. */
  count: number;
  onClear: () => void;
  /** The actions, e.g. a Delete button. */
  children: ReactNode;
}

/**
 * Floats at the bottom of the screen while a table has rows ticked, with what
 * can be done to them. Pair it with `showSelectionSummary={false}` on the
 * table so the count isn't shown twice.
 */
export function SelectionActionBar({
  count,
  onClear,
  children,
}: SelectionActionBarProps) {
  return (
    <ActionBar.Root
      open={count > 0}
      // A dialog opened from the bar must not untick everything.
      closeOnInteractOutside={false}
      onOpenChange={({ open }) => !open && onClear()}
    >
      <Portal>
        <ActionBar.Positioner>
          <ActionBar.Content>
            <ActionBar.SelectionTrigger>
              {count} selected
            </ActionBar.SelectionTrigger>
            <ActionBar.Separator />
            {children}
            <ActionBar.CloseTrigger asChild>
              <Button variant="ghost" size="sm">
                Clear
              </Button>
            </ActionBar.CloseTrigger>
          </ActionBar.Content>
        </ActionBar.Positioner>
      </Portal>
    </ActionBar.Root>
  );
}
