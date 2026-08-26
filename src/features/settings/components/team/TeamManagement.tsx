import { useMemo, useState } from "react";
import { Box, Button, Tabs } from "@chakra-ui/react";
import ConsentDialog from "@/components/common/ConsentDialog";
import { SearchInput } from "@/components/input/SearchInput";
import { CustomTable, type TableAction } from "@/components/table";
import { usePermissions } from "@/hooks/usePermissions";
import { SUPER_ADMIN_ROLE } from "@/shared/interface/user";
import type { ITeamMember, IUserInvite } from "@/shared/interface/team";
import {
  useActivateTeamMemberMutation,
  useCancelUserInviteMutation,
  useDeactivateTeamMemberMutation,
  useGetTeamMembersQuery,
  useGetUserInvitesQuery,
  useResendUserInviteMutation,
} from "../../api/team.query";
import { SettingsSubPage } from "../SettingsSubPage";
import { InviteMemberModal } from "./InviteMemberModal";
import { MemberRolesModal } from "./MemberRolesModal";
import { inviteColumns, memberColumns } from "./teamColumns";

/**
 * Super admins are untouchable from here — the API would refuse anyway, and
 * offering the action invites someone to lock the workspace out of itself.
 */
const isSuperAdmin = (member: ITeamMember) =>
  (member.userRoles ?? []).some(
    (entry) => entry.role?.name === SUPER_ADMIN_ROLE,
  );

/** Members and pending invitations for the organization. */
export function TeamManagement() {
  const { canCreate, canUpdate, canDelete } = usePermissions();
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [rolesTarget, setRolesTarget] = useState<ITeamMember | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<ITeamMember | null>(
    null,
  );
  const [cancelTarget, setCancelTarget] = useState<IUserInvite | null>(null);

  const { data: membersData, isLoading } = useGetTeamMembersQuery({
    limit: 100,
    ...(search ? { search } : {}),
  });
  const { data: invitesData, isLoading: invitesLoading } =
    useGetUserInvitesQuery();

  const { mutateAsync: deactivate, isPending: deactivating } =
    useDeactivateTeamMemberMutation();
  const { mutateAsync: activate } = useActivateTeamMemberMutation();
  const { mutateAsync: resend } = useResendUserInviteMutation();
  const { mutateAsync: cancel, isPending: cancelling } =
    useCancelUserInviteMutation();

  const members: ITeamMember[] = membersData?.data ?? membersData ?? [];
  const invites: IUserInvite[] = invitesData?.data ?? invitesData ?? [];
  const pendingInvites = invites.filter((i) => i.status === "PENDING");

  const memberActions = useMemo<TableAction<ITeamMember>[]>(
    () => [
      {
        label: "Manage roles",
        value: "roles",
        hidden: (member) => !canUpdate("users") || isSuperAdmin(member),
        onClick: (member) => setRolesTarget(member),
      },
      {
        label: "Deactivate",
        value: "deactivate",
        variant: "destructive",
        hidden: (member) =>
          !canUpdate("users") || isSuperAdmin(member) || !member.isActive,
        onClick: (member) => setDeactivateTarget(member),
      },
      {
        label: "Reactivate",
        value: "activate",
        hidden: (member) =>
          !canUpdate("users") || isSuperAdmin(member) || member.isActive,
        onClick: (member) => void activate(member.id),
      },
    ],
    [canUpdate, activate],
  );

  const inviteActions = useMemo<TableAction<IUserInvite>[]>(
    () => [
      {
        label: "Resend invitation",
        value: "resend",
        hidden: (invite) => invite.status !== "PENDING" || !canCreate("users"),
        onClick: (invite) => void resend(invite.id),
      },
      {
        label: "Cancel invitation",
        value: "cancel",
        variant: "destructive",
        hidden: (invite) => invite.status !== "PENDING" || !canDelete("users"),
        onClick: (invite) => setCancelTarget(invite),
      },
    ],
    [canCreate, canDelete, resend],
  );

  return (
    <>
      <SettingsSubPage
        title="Team Management"
        subtitle="Invite people and control what they can do"
        action={
          canCreate("users") ? (
            <Button size="sm" onClick={() => setInviteOpen(true)}>
              Invite member
            </Button>
          ) : null
        }
      >
        <Tabs.Root defaultValue="members" variant="line">
          <Tabs.List borderColor="gray.75">
            <Tabs.Trigger value="members">
              Members ({members.length})
            </Tabs.Trigger>
            <Tabs.Trigger value="invites">
              Invitations ({pendingInvites.length})
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="members" pt="4">
            <Box mb="3" maxW="22rem">
              <SearchInput
                placeholder="Search by name or email"
                value={search}
                onChange={setSearch}
                onSearch={setSearch}
                debounceMs={400}
                loading={isLoading}
              />
            </Box>

            <Box overflowX="auto" minW={0}>
              <CustomTable
                data={members}
                columns={memberColumns}
                loading={isLoading}
                enableActions
                actions={memberActions}
                NoDataText="No team members found."
              />
            </Box>
          </Tabs.Content>

          <Tabs.Content value="invites" pt="4">
            <Box overflowX="auto" minW={0}>
              <CustomTable
                data={invites}
                columns={inviteColumns}
                loading={invitesLoading}
                enableActions
                actions={inviteActions}
                NoDataText="No invitations yet."
              />
            </Box>
          </Tabs.Content>
        </Tabs.Root>
      </SettingsSubPage>

      <InviteMemberModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />

      {rolesTarget ? (
        <MemberRolesModal
          member={rolesTarget}
          open={Boolean(rolesTarget)}
          onClose={() => setRolesTarget(null)}
        />
      ) : null}

      <ConsentDialog
        open={Boolean(deactivateTarget)}
        onOpenChange={({ open }) => !open && setDeactivateTarget(null)}
        heading="Deactivate this member?"
        note="They will be signed out and won't be able to log in until reactivated."
        confirmText="Yes, Deactivate"
        isLoading={deactivating}
        variant="danger"
        handleSubmit={async () => {
          if (!deactivateTarget) return;
          await deactivate(deactivateTarget.id);
          setDeactivateTarget(null);
        }}
      />

      <ConsentDialog
        open={Boolean(cancelTarget)}
        onOpenChange={({ open }) => !open && setCancelTarget(null)}
        heading="Cancel this invitation?"
        note="The invite link stops working immediately. You can always send a new one."
        confirmText="Yes, Cancel It"
        isLoading={cancelling}
        variant="danger"
        handleSubmit={async () => {
          if (!cancelTarget) return;
          await cancel(cancelTarget.id);
          setCancelTarget(null);
        }}
      />
    </>
  );
}
