import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Center,
  Dialog,
  Flex,
  Portal,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { AxiosError } from "axios";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomTextArea } from "@/components/input/CustomTextArea";
import { toaster } from "@/components/ui";
import { ExportDataButton } from "@/features/exports/components";
import type { BusinessDeletionCode } from "@/shared/interface/settings";
import {
  useRequestBusinessDeletionCodeMutation,
  useScheduleBusinessDeletionMutation,
} from "../../api/query";
import { describeCounts, formatDeletionDate, sameName } from "./copy";

// The server refuses a new code within a minute of the last.
const RESEND_AFTER_SECONDS = 60;

interface DeleteBusinessDialogProps {
  businessName: string;
  onClose: () => void;
}

/**
 * Deleting the business: an emailed code proves it's the owner, and typing
 * the business name proves they mean this one. Opening it sends the code.
 */
export function DeleteBusinessDialog({
  businessName,
  onClose,
}: DeleteBusinessDialogProps) {
  const requestCode = useRequestBusinessDeletionCodeMutation();
  const { mutateAsync: schedule, isPending: isScheduling } =
    useScheduleBusinessDeletionMutation();

  const [sent, setSent] = useState<BusinessDeletionCode | null>(null);
  const [otp, setOtp] = useState("");
  const [confirmName, setConfirmName] = useState("");
  const [reason, setReason] = useState("");
  const [resendIn, setResendIn] = useState(0);

  const sendCode = async () => {
    try {
      const result = await requestCode.mutateAsync();
      setSent(result.data);
      setOtp("");
      setResendIn(RESEND_AFTER_SECONDS);
    } catch (error) {
      // Already scheduled meanwhile: the page now shows it, so step aside.
      if ((error as AxiosError).response?.status === 409) onClose();
    }
  };

  // Once, on opening; StrictMode mounts twice, and a second code would 429.
  const requested = useRef(false);
  useEffect(() => {
    if (requested.current) return;
    requested.current = true;
    void sendCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const nameMatches = sameName(confirmName, businessName);
  const canConfirm = /^\d{6}$/.test(otp) && nameMatches && !isScheduling;

  const confirm = async () => {
    try {
      const result = await schedule({
        otp,
        confirmName,
        ...(reason.trim() ? { reason: reason.trim() } : {}),
      });
      toaster.create({
        type: "success",
        description: `Your business will be deleted on ${formatDeletionDate(
          result.data.scheduledFor,
        )}. You can cancel until then.`,
      });
      onClose();
    } catch (error) {
      // Too many wrong tries, or expired: this code is spent.
      const status = (error as AxiosError).response?.status;
      if (status === 403 || status === 410) setOtp("");
    }
  };

  return (
    <Dialog.Root
      open
      placement="center"
      motionPreset="slide-in-bottom"
      scrollBehavior="inside"
      onOpenChange={({ open }) => !open && !isScheduling && onClose()}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="30rem">
            <Dialog.Header pb="2">
              <Dialog.Title textStyle="h5-semibold" color="gray.500">
                Delete {businessName}?
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              {!sent ? (
                requestCode.isPending ? (
                  <Center py="8" flexDirection="column" gap="3">
                    <Spinner color="primary.300" />
                    <Text textStyle="small-regular" color="gray.300">
                      Sending a code to your email…
                    </Text>
                  </Center>
                ) : (
                  <Stack gap="3" py="4" align="flex-start">
                    <Text textStyle="small-regular" color="gray.400">
                      We couldn&rsquo;t send the code.
                    </Text>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void sendCode()}
                    >
                      Try again
                    </Button>
                  </Stack>
                )
              ) : (
                <Stack gap="5">
                  <Box bg="error.50" rounded="lg" px="4" py="3">
                    <Text textStyle="small-semibold" color="gray.500">
                      This will delete{" "}
                      {describeCounts(sent.willDelete) || "everything in it"}.
                    </Text>
                    <Text textStyle="tiny-regular" color="gray.400" mt="1">
                      Deleted {sent.graceDays} days after you confirm. Want a
                      copy first? <ExportDataButton fontSize="inherit" />
                    </Text>
                  </Box>

                  <Box>
                    <CustomInput
                      label="Code from your email"
                      required
                      placeholder="6-digit code"
                      helperText={`Sent to ${sent.sentTo}. It lasts ${sent.expiresInMinutes} minutes.`}
                      inputProps={{
                        value: otp,
                        inputMode: "numeric",
                        autoComplete: "one-time-code",
                        maxLength: 6,
                        onChange: (e) =>
                          setOtp(e.target.value.replace(/\D/g, "")),
                      }}
                    />
                    <Button
                      mt="1"
                      color="primary.300"
                      disabled={resendIn > 0 || requestCode.isPending}
                      onClick={() => void sendCode()}
                    >
                      {resendIn > 0
                        ? `Send a new code in ${resendIn}s`
                        : "Send a new code"}
                    </Button>
                  </Box>

                  <CustomInput
                    label={`Type "${businessName}" to confirm`}
                    required
                    placeholder={businessName}
                    error={
                      confirmName && !nameMatches
                        ? "That isn't the business name"
                        : undefined
                    }
                    inputProps={{
                      value: confirmName,
                      autoComplete: "off",
                      onChange: (e) => setConfirmName(e.target.value),
                    }}
                  />

                  <CustomTextArea
                    label="Why are you leaving? (optional)"
                    rows={2}
                    value={reason}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setReason(e.target.value.slice(0, 500))
                    }
                  />
                </Stack>
              )}
            </Dialog.Body>

            <Dialog.Footer>
              <Flex gap="2" justify="flex-end" w="full">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  disabled={isScheduling}
                >
                  Keep my business
                </Button>
                <Button
                  size="sm"
                  bg="error.300"
                  color="white"
                  _hover={{ bg: "error.400" }}
                  disabled={!sent || !canConfirm}
                  loading={isScheduling}
                  onClick={() => void confirm()}
                >
                  Delete business
                </Button>
              </Flex>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
