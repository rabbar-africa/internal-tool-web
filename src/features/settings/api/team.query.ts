import { useMutation, useQuery, type QueryConfigType } from "@/lib/react-query";
import { customQueryKey } from "@/shared/constants/query-keys";
import type {
  CreateInvitePayload,
  CreateRolePayload,
  TeamMemberFilter,
  UpdateRolePayload,
  UpdateTeamMemberPayload,
  UserInviteStatus,
} from "@/shared/interface/team";
import {
  activateTeamMember,
  assignMemberRoles,
  assignRolePermissions,
  cancelUserInvite,
  createRole,
  createUserInvite,
  deactivateTeamMember,
  deleteRole,
  deleteTeamMember,
  getGroupedPermissions,
  getPermissions,
  getRoleById,
  getRoles,
  getTeamMember,
  getTeamMembers,
  getUserInvites,
  resendUserInvite,
  updateRole,
  updateTeamMember,
} from "./team.service";

const MEMBER_KEYS = [
  [customQueryKey.team.members],
  [customQueryKey.team.member],
];
const INVITE_KEYS = [[customQueryKey.team.invites]];
const ROLE_KEYS = [
  [customQueryKey.roles.getAll],
  [customQueryKey.roles.getById],
];

// ─── Members ─────────────────────────────────────────────────────────────────

export const useGetTeamMembersQuery = (
  filters: TeamMemberFilter = {},
  config?: QueryConfigType<typeof getTeamMembers>,
) =>
  useQuery({
    queryKey: [customQueryKey.team.members, filters],
    queryFn: () => getTeamMembers(filters),
    ...config,
  });

export const useGetTeamMemberQuery = (
  id: string,
  config?: QueryConfigType<typeof getTeamMember>,
) =>
  useQuery({
    queryKey: [customQueryKey.team.member, id],
    queryFn: () => getTeamMember(id),
    enabled: !!id,
    ...config,
  });

export const useUpdateTeamMemberMutation = () =>
  useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamMemberPayload }) =>
      updateTeamMember(id, data),
    meta: {
      successMessage: "Member updated",
      invalidatesQueryKeys: MEMBER_KEYS,
    },
  });

export const useAssignMemberRolesMutation = () =>
  useMutation({
    mutationFn: ({ id, roleIds }: { id: string; roleIds: string[] }) =>
      assignMemberRoles(id, roleIds),
    meta: {
      successMessage: "Roles updated",
      invalidatesQueryKeys: MEMBER_KEYS,
    },
  });

export const useDeactivateTeamMemberMutation = () =>
  useMutation({
    mutationFn: (id: string) => deactivateTeamMember(id),
    meta: {
      successMessage: "Member deactivated",
      invalidatesQueryKeys: MEMBER_KEYS,
    },
  });

export const useActivateTeamMemberMutation = () =>
  useMutation({
    mutationFn: (id: string) => activateTeamMember(id),
    meta: {
      successMessage: "Member reactivated",
      invalidatesQueryKeys: MEMBER_KEYS,
    },
  });

export const useDeleteTeamMemberMutation = () =>
  useMutation({
    mutationFn: (id: string) => deleteTeamMember(id),
    meta: {
      successMessage: "Member removed",
      invalidatesQueryKeys: MEMBER_KEYS,
    },
  });

// ─── Invites ─────────────────────────────────────────────────────────────────

export const useGetUserInvitesQuery = (
  status?: UserInviteStatus,
  config?: QueryConfigType<typeof getUserInvites>,
) =>
  useQuery({
    queryKey: [customQueryKey.team.invites, status ?? "all"],
    queryFn: () => getUserInvites(status),
    ...config,
  });

export const useCreateUserInviteMutation = () =>
  useMutation({
    mutationFn: (data: CreateInvitePayload) => createUserInvite(data),
    meta: {
      successMessage: "Invitation sent",
      invalidatesQueryKeys: INVITE_KEYS,
    },
  });

export const useResendUserInviteMutation = () =>
  useMutation({
    mutationFn: (id: string) => resendUserInvite(id),
    meta: {
      successMessage: "Invitation resent",
      invalidatesQueryKeys: INVITE_KEYS,
    },
  });

export const useCancelUserInviteMutation = () =>
  useMutation({
    mutationFn: (id: string) => cancelUserInvite(id),
    meta: {
      successMessage: "Invitation cancelled",
      invalidatesQueryKeys: INVITE_KEYS,
    },
  });

// ─── Roles ───────────────────────────────────────────────────────────────────

export const useGetRolesQuery = (config?: QueryConfigType<typeof getRoles>) =>
  useQuery({
    queryKey: [customQueryKey.roles.getAll],
    queryFn: getRoles,
    ...config,
  });

export const useGetRoleByIdQuery = (
  id: string,
  config?: QueryConfigType<typeof getRoleById>,
) =>
  useQuery({
    queryKey: [customQueryKey.roles.getById, id],
    queryFn: () => getRoleById(id),
    enabled: !!id,
    ...config,
  });

export const useCreateRoleMutation = () =>
  useMutation({
    mutationFn: (data: CreateRolePayload) => createRole(data),
    meta: { successMessage: "Role created", invalidatesQueryKeys: ROLE_KEYS },
  });

export const useUpdateRoleMutation = () =>
  useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRolePayload }) =>
      updateRole(id, data),
    meta: { successMessage: "Role updated", invalidatesQueryKeys: ROLE_KEYS },
  });

export const useDeleteRoleMutation = () =>
  useMutation({
    mutationFn: (id: string) => deleteRole(id),
    meta: { successMessage: "Role deleted", invalidatesQueryKeys: ROLE_KEYS },
  });

export const useAssignRolePermissionsMutation = () =>
  useMutation({
    mutationFn: ({
      id,
      permissionIds,
    }: {
      id: string;
      permissionIds: string[];
    }) => assignRolePermissions(id, permissionIds),
    meta: {
      successMessage: "Permissions updated",
      invalidatesQueryKeys: ROLE_KEYS,
    },
  });

// ─── Permission catalog ──────────────────────────────────────────────────────

export const useGetPermissionsQuery = (
  config?: QueryConfigType<typeof getPermissions>,
) =>
  useQuery({
    queryKey: [customQueryKey.permissions.getAll],
    queryFn: getPermissions,
    ...config,
  });

export const useGetGroupedPermissionsQuery = (
  config?: QueryConfigType<typeof getGroupedPermissions>,
) =>
  useQuery({
    queryKey: [customQueryKey.permissions.grouped],
    queryFn: getGroupedPermissions,
    ...config,
  });
