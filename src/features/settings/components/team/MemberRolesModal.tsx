import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Flex,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import { CustomSelect } from "@/components/input/CustomSelect";
import type { ITeamMember } from "@/shared/interface/team";
import type { IRole } from "@/shared/interface/user";
import {
  useAssignMemberRolesMutation,
  useGetRolesQuery,
} from "../../api/team.query";
import { formatRoleName } from "./roleHelpers";

/** Replaces a member's roles. The API takes the full set, not a delta. */
export function MemberRolesModal({
  member,
  open,
  onClose,
}: {
  member: ITeamMember;
  open: boolean;
  onClose: () => void;
}) {
  const { data: rolesData, isLoading } = useGetRolesQuery();
  const { mutateAsync: assignRoles, isPending } =
    useAssignMemberRolesMutation();

  const roles: IRole[] = rolesData?.data ?? rolesData ?? [];
  const [roleIds, setRoleIds] = useState<string[]>([]);

  useEffect(() => {
    setRoleIds((member.userRoles ?? []).map((entry) => entry.roleId));
  }, [member]);

  const handleSubmit = async () => {
    await assignRoles({ id: member.id, roleIds });
    onClose();
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={({ open: isOpen }) => !isOpen && onClose()}
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
              <Stack gap="4">
                <Box>
                  <Text fontSize="16px" fontWeight="600" color="gray.500">
                    Manage roles
                  </Text>
                  <Text fontSize="12px" color="gray.300" mt="0.5">
                    {member.email}
                  </Text>
                </Box>

                <CustomSelect
                  label="Roles"
                  multiple
                  placeholder="Select roles..."
                  options={roles.map((role) => ({
                    label: formatRoleName(role.name),
                    value: role.id,
                  }))}
                  loading={isLoading}
                  value={roleIds}
                  onChange={(opt: { value: string[] }) =>
                    setRoleIds(opt?.value ?? [])
                  }
                />

                <Text fontSize="11px" color="gray.300">
                  Removing every role leaves the member with no access beyond
                  signing in.
                </Text>

                <Flex gap="3" justify="flex-end" pt="1">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    loading={isPending}
                    loadingText="Saving..."
                  >
                    Save roles
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
