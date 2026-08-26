import { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Flex,
  IconButton,
  Menu,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import { ThreeDotsIcon } from "@/assets/custom";
import ConsentDialog from "@/components/common/ConsentDialog";
import SectionLoader from "@/components/common/SectionLoader";
import { usePermissions } from "@/hooks/usePermissions";
import type { IRole } from "@/shared/interface/user";
import { useDeleteRoleMutation, useGetRolesQuery } from "../../api/team.query";
import { SettingsSubPage } from "../SettingsSubPage";
import { RoleFormModal } from "./RoleFormModal";
import { formatRoleName, formatSubject } from "./roleHelpers";

/** The subjects a role touches, so the card says what it grants at a glance. */
function permissionSummary(role: IRole): string[] {
  const subjects = new Set(
    (role.rolePermissions ?? []).map((entry) => entry.permission?.subject),
  );
  return [...subjects].filter(Boolean).map(formatSubject).sort();
}

function RoleCard({
  role,
  onEdit,
  onDelete,
}: {
  role: IRole;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { canUpdate, canDelete } = usePermissions();
  const subjects = permissionSummary(role);
  const count = role.rolePermissions?.length ?? 0;

  // System roles are view-only, so "edit" needs only read access for them.
  const canOpen = role.isSystem || canUpdate("roles");
  const canRemove = !role.isSystem && canDelete("roles");

  return (
    <Box borderWidth="1px" borderColor="gray.75" rounded="lg" p="4">
      <Flex justify="space-between" align="flex-start" gap="3" wrap="wrap">
        <Box minW="0">
          <Flex align="center" gap="2" wrap="wrap">
            <Text fontSize="14px" fontWeight="600" color="gray.500">
              {formatRoleName(role.name)}
            </Text>
            {role.isSystem ? (
              <Badge size="sm" bg="gray.100" color="gray.400">
                System
              </Badge>
            ) : null}
            <Badge size="sm" bg="primary.50" color="primary.400">
              {count} {count === 1 ? "permission" : "permissions"}
            </Badge>
          </Flex>
          {role.description ? (
            <Text fontSize="12px" color="gray.300" mt="1" lineHeight="1.6">
              {role.description}
            </Text>
          ) : null}
        </Box>

        {canOpen || canRemove ? (
          <Menu.Root>
            <Menu.Trigger asChild>
              <IconButton
                variant="ghost"
                size="xs"
                aria-label={`Actions for ${role.name}`}
                flexShrink={0}
                _hover={{ bg: "gray.50" }}
              >
                <ThreeDotsIcon color="gray.300" />
              </IconButton>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content minW="160px">
                  {canOpen ? (
                    <Menu.Item
                      value="view"
                      onClick={onEdit}
                      _hover={{ bg: "gray.50" }}
                    >
                      {/* System roles open read-only, so the wording follows. */}
                      {role.isSystem ? "View permissions" : "Edit role"}
                    </Menu.Item>
                  ) : null}
                  {canRemove ? (
                    <Menu.Item
                      value="delete"
                      color="error.300"
                      onClick={onDelete}
                      _hover={{ bg: "error.50" }}
                    >
                      Delete role
                    </Menu.Item>
                  ) : null}
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        ) : null}
      </Flex>

      {subjects.length ? (
        <Flex gap="1" wrap="wrap" mt="3">
          {subjects.map((subject) => (
            <Badge key={subject} size="sm" bg="gray.50" color="gray.400">
              {subject}
            </Badge>
          ))}
        </Flex>
      ) : null}
    </Box>
  );
}

/** Roles for the organization, and the permissions each one grants. */
export function RolesAndPermissions() {
  const { canCreate } = usePermissions();
  const { data, isLoading } = useGetRolesQuery();
  const { mutateAsync: deleteRole, isPending: deleting } =
    useDeleteRoleMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<IRole | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IRole | null>(null);

  const roles: IRole[] = data?.data ?? data ?? [];

  const openCreate = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const openEdit = (role: IRole) => {
    setEditTarget(role);
    setFormOpen(true);
  };

  return (
    <>
      <SettingsSubPage
        title="Roles & Permissions"
        subtitle="Define what each role can see and do"
        action={
          canCreate("roles") ? (
            <Button size="sm" onClick={openCreate}>
              Create role
            </Button>
          ) : null
        }
      >
        {isLoading ? (
          <SectionLoader />
        ) : roles.length === 0 ? (
          <Text fontSize="13px" color="gray.300">
            No roles yet.
          </Text>
        ) : (
          <Stack gap="3">
            {roles.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                onEdit={() => openEdit(role)}
                onDelete={() => setDeleteTarget(role)}
              />
            ))}
          </Stack>
        )}
      </SettingsSubPage>

      {formOpen ? (
        <RoleFormModal
          role={editTarget}
          open={formOpen}
          onClose={() => {
            setFormOpen(false);
            setEditTarget(null);
          }}
        />
      ) : null}

      <ConsentDialog
        open={Boolean(deleteTarget)}
        onOpenChange={({ open }) => !open && setDeleteTarget(null)}
        heading="Delete this role?"
        note="Members holding it will lose the access it granted. This cannot be undone."
        confirmText="Yes, Delete"
        isLoading={deleting}
        variant="danger"
        handleSubmit={async () => {
          if (!deleteTarget) return;
          await deleteRole(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </>
  );
}
