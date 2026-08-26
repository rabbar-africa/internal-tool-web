import { useState } from "react";
import {
  Button,
  CloseButton,
  Dialog,
  Flex,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import { isValidEmail } from "@/utils/validations";
import type { IRole } from "@/shared/interface/user";
import {
  useCreateUserInviteMutation,
  useGetRolesQuery,
} from "../../api/team.query";
import { formatRoleName } from "./roleHelpers";

/**
 * Invites someone by email. The API requires at least one role — the invitee
 * holds exactly these from the moment they accept.
 */
export function InviteMemberModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [roleIds, setRoleIds] = useState<string[]>([]);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /** Returns the problem with the current email, or null when it's usable. */
  const emailProblem = () => {
    if (!email.trim()) return "Email is required";
    if (!isValidEmail(email)) return "Enter a valid email address";
    return null;
  };

  const { data: rolesData, isLoading: rolesLoading } = useGetRolesQuery();
  const { mutateAsync: invite, isPending } = useCreateUserInviteMutation();

  const roles: IRole[] = rolesData?.data ?? rolesData ?? [];
  const roleOptions = roles.map((role) => ({
    label: formatRoleName(role.name),
    value: role.id,
  }));

  const reset = () => {
    setEmail("");
    setRoleIds([]);
    setEmailError(null);
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    const problem = emailProblem();
    setEmailError(problem);
    if (problem) return;

    if (!roleIds.length) return setError("Pick at least one role");

    setError(null);
    await invite({ email: email.trim(), roleIds });
    handleClose();
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={({ open: isOpen }) => !isOpen && handleClose()}
      placement="center"
      motionPreset="slide-in-bottom"
      closeOnInteractOutside={false}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content w="30rem" maxW="full" borderRadius="2xl" pt="2.5rem">
            <Dialog.CloseTrigger asChild>
              <CloseButton position="absolute" top="4" right="4" size="sm" />
            </Dialog.CloseTrigger>
            <Dialog.Body pb="6">
              <Stack gap="4">
                <Text fontSize="16px" fontWeight="600" color="gray.500">
                  Invite team member
                </Text>

                <CustomInput
                  label="Email address"
                  required
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    // Clear as they correct it; re-checked on blur and submit.
                    if (emailError) setEmailError(null);
                  }}
                  onBlur={() => setEmailError(emailProblem())}
                  error={emailError ?? undefined}
                />

                <CustomSelect
                  label="Roles"
                  required
                  multiple
                  placeholder="Select one or more roles..."
                  options={roleOptions}
                  loading={rolesLoading}
                  value={roleIds}
                  onChange={(opt: string[]) => {
                    setRoleIds(opt);
                  }}
                />

                <Text fontSize="11px" color="gray.300">
                  They'll get an email with a link to set their password. The
                  link expires, and you can resend or cancel it any time.
                </Text>

                {error ? (
                  <Text fontSize="12px" color="error.400">
                    {error}
                  </Text>
                ) : null}

                <Flex gap="3" justify="flex-end" pt="1">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    loading={isPending}
                    loadingText="Sending..."
                  >
                    Send invitation
                  </Button>
                </Flex>
              </Stack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
