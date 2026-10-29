import { Button, Menu, Portal } from "@chakra-ui/react";
import type { TransferKind } from "./TransferModal";

const ITEMS: { kind: TransferKind; label: string }[] = [
  { kind: "deposit", label: "Deposit cash to bank" },
  { kind: "withdraw", label: "Withdraw cash" },
  { kind: "transfer", label: "Transfer between accounts" },
];

/** "Record Transfer" button offering the three kinds of transfer. */
export function RecordTransferMenu({
  onSelect,
}: {
  onSelect: (kind: TransferKind) => void;
}) {
  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button>Record Transfer ▾</Button>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            {ITEMS.map((item) => (
              <Menu.Item
                key={item.kind}
                value={item.kind}
                onClick={() => onSelect(item.kind)}
              >
                {item.label}
              </Menu.Item>
            ))}
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  );
}
