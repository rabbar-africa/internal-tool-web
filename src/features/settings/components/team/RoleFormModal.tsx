import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  CloseButton,
  Dialog,
  Flex,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import SectionLoader from "@/components/common/SectionLoader";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomTextArea } from "@/components/input/CustomTextArea";
import { chakraScrollbarStyle } from "@/shared/constants/styles";
import type { IPermissionGroup } from "@/shared/interface/team";
import type { IRole } from "@/shared/interface/user";
import {
  useCreateRoleMutation,
  useGetGroupedPermissionsQuery,
  useUpdateRoleMutation,
} from "../../api/team.query";
import { formatSubject } from "./roleHelpers";

const ACTION_ORDER = ["create", "read", "update", "delete"];

/**
 * Creates or edits a role. Permissions are picked from the org's catalog as a
 * subject × action matrix, which is how the API groups them.
 */
export function RoleFormModal({
  role,
  open,
  onClose,
}: {
  /** Provided → edit mode. Omitted → create mode. */
  role?: IRole | null;
  open: boolean;
  onClose: () => void;
}) {
  const isEdit = Boolean(role);
  // System roles ship with the workspace and the API owns them — this modal
  // shows what they grant but never lets it be changed.
  const readOnly = Boolean(role?.isSystem);
  const { data: groupedData, isLoading } = useGetGroupedPermissionsQuery();
  const { mutateAsync: createRole, isPending: creating } =
    useCreateRoleMutation();
  const { mutateAsync: updateRole, isPending: updating } =
    useUpdateRoleMutation();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissionIds, setPermissionIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // The endpoint returns `[{ subject, permissions }]`, sorted here into a
  // stable action order so the matrix reads create → read → update → delete.
  const groups: IPermissionGroup[] = useMemo(() => {
    const raw = groupedData?.data ?? groupedData ?? [];
    if (!Array.isArray(raw)) return [];
    return raw.map((group: IPermissionGroup) => ({
      subject: group.subject,
      permissions: [...(group.permissions ?? [])].sort(
        (a, b) =>
          ACTION_ORDER.indexOf(a.action) - ACTION_ORDER.indexOf(b.action),
      ),
    }));
  }, [groupedData]);

  useEffect(() => {
    setName(role?.name ?? "");
    setDescription(role?.description ?? "");
    setPermissionIds(
      (role?.rolePermissions ?? []).map((entry) => entry.permissionId),
    );
    setError(null);
  }, [role, open]);

  const selected = new Set(permissionIds);

  const toggle = (id: string) => {
    if (readOnly) return;
    setPermissionIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const toggleSubject = (permissionIdsForSubject: string[]) => {
    if (readOnly) return;
    const allOn = permissionIdsForSubject.every((id) => selected.has(id));
    setPermissionIds((prev) =>
      allOn
        ? prev.filter((id) => !permissionIdsForSubject.includes(id))
        : [...new Set([...prev, ...permissionIdsForSubject])],
    );
  };

  const handleSubmit = async () => {
    if (readOnly) return;
    if (!name.trim()) return setError("Role name is required");
    setError(null);

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      permissionIds,
    };

    if (isEdit && role) await updateRole({ id: role.id, data: payload });
    else await createRole(payload);

    onClose();
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={({ open: isOpen }) => !isOpen && onClose()}
      placement="center"
      motionPreset="slide-in-bottom"
      closeOnInteractOutside={false}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content w="38rem" maxW="full" borderRadius="2xl" pt="2.5rem">
            <Dialog.CloseTrigger asChild>
              <CloseButton position="absolute" top="4" right="4" size="sm" />
            </Dialog.CloseTrigger>
            <Dialog.Body
              pb="6"
              overflow="auto"
              maxH="min(44rem, calc(100dvh - 4rem))"
              css={chakraScrollbarStyle}
            >
              <Stack gap="4">
                <Box>
                  <Text fontSize="16px" fontWeight="600" color="gray.500">
                    {readOnly
                      ? "Role details"
                      : isEdit
                        ? "Edit role"
                        : "Create role"}
                  </Text>
                  {readOnly ? (
                    <Text fontSize="12px" color="gray.300" mt="0.5">
                      This is a system role. It can be viewed but not changed.
                    </Text>
                  ) : null}
                </Box>

                <CustomInput
                  label="Role name"
                  required
                  placeholder="e.g. workshop_manager"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={readOnly}
                />

                <CustomTextArea
                  label="Description"
                  rows={2}
                  placeholder="What this role is for"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={readOnly}
                />

                <Box>
                  <Flex justify="space-between" align="baseline" mb="2">
                    <Text fontSize="12px" fontWeight="600" color="gray.400">
                      Permissions
                    </Text>
                    <Text fontSize="11px" color="gray.300">
                      {permissionIds.length} selected
                    </Text>
                  </Flex>

                  {isLoading ? (
                    <SectionLoader />
                  ) : groups.length === 0 ? (
                    <Text fontSize="13px" color="gray.300">
                      No permissions available for this organization.
                    </Text>
                  ) : (
                    groups.map((group) => {
                      const ids = group.permissions.map((p) => p.id);
                      const allOn = ids.every((id) => selected.has(id));

                      return (
                        <Box
                          key={group.subject}
                          borderWidth="1px"
                          borderColor="gray.75"
                          rounded="md"
                          px="3"
                          py="2.5"
                          mb="2"
                        >
                          <Flex justify="space-between" align="center" mb="2">
                            <Text
                              fontSize="13px"
                              fontWeight="600"
                              color="gray.500"
                            >
                              {formatSubject(group.subject)}
                            </Text>
                            {!readOnly ? (
                              <Button
                                size="2xs"
                                variant="ghost"
                                color="primary.400"
                                onClick={() => toggleSubject(ids)}
                              >
                                {allOn ? "Clear all" : "Select all"}
                              </Button>
                            ) : null}
                          </Flex>

                          <Flex gap="4" wrap="wrap">
                            {group.permissions.map((permission) => (
                              <Checkbox.Root
                                key={permission.id}
                                checked={selected.has(permission.id)}
                                onCheckedChange={() => toggle(permission.id)}
                                disabled={readOnly}
                                size="sm"
                              >
                                <Checkbox.HiddenInput />
                                <Checkbox.Control />
                                <Checkbox.Label
                                  fontSize="12px"
                                  color="gray.400"
                                  textTransform="capitalize"
                                >
                                  {permission.action}
                                </Checkbox.Label>
                              </Checkbox.Root>
                            ))}
                          </Flex>
                        </Box>
                      );
                    })
                  )}
                </Box>

                {error ? (
                  <Text fontSize="12px" color="error.400">
                    {error}
                  </Text>
                ) : null}

                <Flex gap="3" justify="flex-end">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={creating || updating}
                  >
                    {readOnly ? "Close" : "Cancel"}
                  </Button>
                  {!readOnly ? (
                    <Button
                      onClick={handleSubmit}
                      loading={creating || updating}
                      loadingText="Saving..."
                    >
                      {isEdit ? "Save changes" : "Create role"}
                    </Button>
                  ) : null}
                </Flex>
              </Stack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
