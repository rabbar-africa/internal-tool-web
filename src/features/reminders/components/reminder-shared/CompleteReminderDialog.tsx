import { useEffect, useState } from "react";
import { Button, Dialog, Flex, Portal, Stack, Text } from "@chakra-ui/react";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomTextArea } from "@/components/input/CustomTextArea";
import type {
  CompleteReminderPayload,
  Reminder,
} from "@/shared/interface/reminder";

interface CompleteReminderDialogProps {
  reminder: Reminder | null;
  isLoading: boolean;
  onCancel: () => void;
  onConfirm: (payload: CompleteReminderPayload) => void;
}

const today = () => new Date().toISOString().split("T")[0];

const isRecurring = (r: Reminder | null) =>
  Boolean(r && (r.intervalMonths || r.intervalDays));

export function CompleteReminderDialog({
  reminder,
  isLoading,
  onCancel,
  onConfirm,
}: CompleteReminderDialogProps) {
  const [completedDate, setCompletedDate] = useState(today());
  const [nextDueDate, setNextDueDate] = useState("");
  const [notes, setNotes] = useState("");

  // Reset the fields each time a new reminder is targeted.
  useEffect(() => {
    if (reminder) {
      setCompletedDate(today());
      setNextDueDate("");
      setNotes("");
    }
  }, [reminder]);

  const recurring = isRecurring(reminder);

  const handleConfirm = () => {
    onConfirm({
      completedDate: completedDate || undefined,
      nextDueDate: nextDueDate || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <Dialog.Root
      open={Boolean(reminder)}
      onOpenChange={({ open }) => {
        if (!open) onCancel();
      }}
      placement="center"
      motionPreset="slide-in-bottom"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="440px">
            <Dialog.Header borderBottomWidth="1px" borderColor="gray.75" pb="4">
              <Dialog.Title fontSize="16px" fontWeight="600" color="gray.500">
                Mark as done
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body py="5">
              <Stack gap="4">
                <Text fontSize="13px" color="gray.400">
                  Completing{" "}
                  <Text as="span" fontWeight="600" color="gray.500">
                    {reminder?.title}
                  </Text>
                  {recurring
                    ? " will schedule the next occurrence automatically."
                    : "."}
                </Text>

                <CustomInput
                  label="Completed on"
                  type="date"
                  name="completedDate"
                  value={completedDate}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCompletedDate(e.target.value)
                  }
                />

                {recurring && (
                  <CustomInput
                    label="Next due date (optional)"
                    type="date"
                    name="nextDueDate"
                    helperText="Leave blank to auto-compute from the interval."
                    value={nextDueDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNextDueDate(e.target.value)
                    }
                  />
                )}

                <CustomTextArea
                  label="Notes (optional)"
                  rows={2}
                  value={notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setNotes(e.target.value)
                  }
                  placeholder="e.g. Oil + filter replaced"
                />
              </Stack>
            </Dialog.Body>
            <Dialog.Footer borderTopWidth="1px" borderColor="gray.75" pt="4">
              <Flex gap="3" justify="flex-end" w="100%">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirm}
                  loading={isLoading}
                  loadingText="Saving..."
                >
                  Mark done
                </Button>
              </Flex>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
