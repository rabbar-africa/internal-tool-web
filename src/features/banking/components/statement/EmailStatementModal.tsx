import { useEffect, useState } from "react";
import {
  Button,
  CloseButton,
  Dialog,
  Flex,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import { isAxiosError } from "axios";
import { CustomInput } from "@/components/input/CustomInput";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { StatementRange } from "@/shared/interface/banking";
import { useEmailStatementMutation } from "../../api";

interface EmailStatementModalProps {
  open: boolean;
  onClose: () => void;
  /** Omitted → the business statement. */
  accountId?: string;
  range: StatementRange;
}

/**
 * Emails the statement PDF. The recipient starts as the user's own address
 * and can be changed (e.g. to their accountant). A 400 names the problem in
 * the error toast; a 502 means the email didn't go out, so offer a retry.
 */
export function EmailStatementModal({
  open,
  onClose,
  accountId,
  range,
}: EmailStatementModalProps) {
  const { userData } = useCurrentUser();
  const { mutateAsync, isPending } = useEmailStatementMutation();

  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!open) return;
    setEmail(userData?.email ?? "");
    setSentTo(null);
    setFailed(false);
  }, [open, userData?.email]);

  const send = async () => {
    setFailed(false);
    try {
      const response = await mutateAsync({
        accountId,
        payload: { ...range, ...(email.trim() ? { email: email.trim() } : {}) },
      });
      setSentTo(response.data.sentTo);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 502) {
        setFailed(true);
      }
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={({ open: o }) => {
        if (!o) onClose();
      }}
      placement="center"
      motionPreset="slide-in-bottom"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content w="28rem" maxW="full" borderRadius="2xl" pt="2.5rem">
            <Dialog.CloseTrigger asChild>
              <CloseButton position="absolute" top="4" right="4" size="sm" />
            </Dialog.CloseTrigger>
            <Dialog.Body pb="6">
              {sentTo ? (
                <Stack gap="4">
                  <Text fontSize="16px" fontWeight="600" color="gray.500">
                    Statement sent
                  </Text>
                  <Text fontSize="14px" color="gray.400">
                    Sent to {sentTo}
                  </Text>
                  <Flex justify="flex-end">
                    <Button onClick={onClose}>Done</Button>
                  </Flex>
                </Stack>
              ) : (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void send();
                  }}
                >
                  <Stack gap="5">
                    <Stack gap="1">
                      <Text fontSize="16px" fontWeight="600" color="gray.500">
                        {accountId
                          ? "Email statement"
                          : "Email business statement"}
                      </Text>
                      <Text fontSize="13px" color="gray.300">
                        The PDF is sent as an attachment.
                      </Text>
                    </Stack>
                    <CustomInput
                      label="Send to"
                      type="email"
                      name="email"
                      value={email}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        setEmail(event.target.value)
                      }
                      placeholder="you@example.com"
                    />
                    {failed && (
                      <Text fontSize="13px" color="error.300">
                        The email didn't go out. Please try again.
                      </Text>
                    )}
                    <Flex gap="3" justify="flex-end">
                      <Button variant="outline" type="button" onClick={onClose}>
                        Cancel
                      </Button>
                      <Button type="submit" loading={isPending}>
                        {failed ? "Try again" : "Send"}
                      </Button>
                    </Flex>
                  </Stack>
                </form>
              )}
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
