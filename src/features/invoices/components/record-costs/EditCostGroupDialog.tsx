import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  Flex,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import { CustomCheckbox } from "@/components/input/CustomCheckBox";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import { useRegroupInvoiceCostsMutation } from "@/features/expenses/api/query";

export interface GroupableLine {
  id: string;
  name: string;
  billed: number;
  /** Why it can't join this group, e.g. it's in another one. */
  lockedReason?: string;
}

interface EditCostGroupDialogProps {
  invoiceId: string;
  /** The group's items as the costs list shows them. */
  groupLineIds: string[];
  /** What's been spent on the group, which stays with it. */
  spent: number;
  /** Every item on the invoice, in its order. */
  lines: GroupableLine[];
  onClose: () => void;
  /** After a save, with the items it now covers. */
  onSaved: (lineIds: string[]) => void;
}

/**
 * Fixes a "bought together" group without recording it again: untick an
 * item added by mistake, tick one left out. The money stays with the group.
 */
export function EditCostGroupDialog({
  invoiceId,
  groupLineIds,
  spent,
  lines,
  onClose,
  onSaved,
}: EditCostGroupDialogProps) {
  const { formatMoney } = useFormatMoney();
  const { mutateAsync: regroup, isPending } = useRegroupInvoiceCostsMutation();
  const [selected, setSelected] = useState<string[]>(groupLineIds);

  const toggle = (id: string, checked: boolean) =>
    setSelected((prev) =>
      checked ? [...prev, id] : prev.filter((lineId) => lineId !== id),
    );

  const unchanged =
    selected.length === groupLineIds.length &&
    selected.every((id) => groupLineIds.includes(id));
  const onlyItem =
    selected.length === 1 ? lines.find((l) => l.id === selected[0]) : null;

  const save = async () => {
    if (unchanged) return onClose();
    // In the invoice's order, whatever order they were ticked in.
    const ordered = lines
      .filter((line) => selected.includes(line.id))
      .map((line) => line.id);
    await regroup({
      invoiceId,
      payload: {
        currentLineItemIds: groupLineIds,
        invoiceLineItemIds: ordered,
      },
    });
    onSaved(ordered);
    onClose();
  };

  return (
    <Dialog.Root
      open
      placement="center"
      motionPreset="slide-in-bottom"
      scrollBehavior="inside"
      onOpenChange={({ open }) => !open && !isPending && onClose()}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="32rem">
            <Dialog.Header pb="2">
              <Box>
                <Dialog.Title textStyle="h5-semibold" color="gray.500">
                  Edit items bought together
                </Dialog.Title>
                <Text textStyle="small-regular" color="gray.300" mt="1">
                  Tick the items this price covered.{" "}
                  {spent > 0
                    ? `The ${formatMoney(spent)} already spent stays with the group.`
                    : ""}
                </Text>
              </Box>
            </Dialog.Header>

            <Dialog.Body>
              <Stack gap="0">
                {lines.map((line) => (
                  <Flex
                    key={line.id}
                    justify="space-between"
                    align="center"
                    gap="3"
                    py="2.5"
                    borderTopWidth="1px"
                    borderColor="gray.50"
                  >
                    <Box minW={0}>
                      <CustomCheckbox
                        checked={selected.includes(line.id)}
                        disabled={Boolean(line.lockedReason) || isPending}
                        onCheckedChange={({ checked }: { checked: boolean }) =>
                          toggle(line.id, checked)
                        }
                        labelProps={{
                          textStyle: "small-semibold",
                          color: "gray.500",
                        }}
                      >
                        {line.name}
                      </CustomCheckbox>
                      {line.lockedReason && (
                        <Text fontSize="12px" color="gray.300" ml="7">
                          {line.lockedReason}
                        </Text>
                      )}
                    </Box>
                    <Text
                      textStyle="tiny-regular"
                      color="gray.400"
                      flexShrink={0}
                    >
                      Billed {formatMoney(line.billed)}
                    </Text>
                  </Flex>
                ))}
              </Stack>
            </Dialog.Body>

            <Dialog.Footer
              flexDirection="column"
              alignItems="stretch"
              gap="3"
              borderTopWidth="1px"
              borderColor="gray.75"
            >
              {selected.length === 0 ? (
                <Text textStyle="tiny-regular" color="error.300">
                  Tick at least one item. To drop the cost altogether, delete
                  its expense.
                </Text>
              ) : onlyItem ? (
                <Text textStyle="tiny-regular" color="gray.400">
                  With one item left, what was spent becomes {onlyItem.name}
                  &rsquo;s own cost.
                </Text>
              ) : (
                <Text textStyle="tiny-regular" color="gray.400">
                  {selected.length} items bought together
                </Text>
              )}
              <Flex gap="2" justify="flex-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  loading={isPending}
                  disabled={selected.length === 0}
                  onClick={() => void save()}
                >
                  Save
                </Button>
              </Flex>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
