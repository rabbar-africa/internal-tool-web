import { axios } from "@/lib/axios";
import type {
  CreateInvitePayload,
  CreateRolePayload,
  TeamMemberFilter,
  UpdateRolePayload,
  UpdateTeamMemberPayload,
  UserInviteStatus,
} from "@/shared/interface/team";
import { buildUrlWithQueryParams } from "@/utils/build-url-query";

// ─── Members ─────────────────────────────────────────────────────────────────

export const getTeamMembers = async (filters: TeamMemberFilter = {}) => {
  const res = await axios.get(
    buildUrlWithQueryParams("/users", filters as Record<string, unknown>),
  );
  return res.data;
};

export const getTeamMember = async (id: string) => {
  const res = await axios.get(`/users/${id}`);
  return res.data;
};

export const updateTeamMember = async (
  id: string,
  data: UpdateTeamMemberPayload,
) => {
  const res = await axios.put(`/users/${id}`, data);
  return res.data;
};

/** Replaces the member's roles wholesale. */
export const assignMemberRoles = async (id: string, roleIds: string[]) => {
  const res = await axios.put(`/users/${id}/roles`, { roleIds });
  return res.data;
};

export const deactivateTeamMember = async (id: string) => {
  const res = await axios.patch(`/users/${id}/deactivate`);
  return res.data;
};

export const activateTeamMember = async (id: string) => {
  const res = await axios.patch(`/users/${id}/activate`);
  return res.data;
};

export const deleteTeamMember = async (id: string) => {
  const res = await axios.delete(`/users/${id}`);
  return res.data;
};

// ─── Invites ─────────────────────────────────────────────────────────────────

export const getUserInvites = async (status?: UserInviteStatus) => {
  const res = await axios.get(
    buildUrlWithQueryParams("/users/invites", status ? { status } : {}),
  );
  return res.data;
};

export const createUserInvite = async (data: CreateInvitePayload) => {
  const res = await axios.post("/users/invites", data);
  return res.data;
};

/** Rotates the invite link and extends its expiry. */
export const resendUserInvite = async (id: string) => {
  const res = await axios.post(`/users/invites/${id}/resend`);
  return res.data;
};

/** Cancels a pending invite — its link stops working immediately. */
export const cancelUserInvite = async (id: string) => {
  const res = await axios.delete(`/users/invites/${id}`);
  return res.data;
};

// ─── Roles ───────────────────────────────────────────────────────────────────

export const getRoles = async () => {
  const res = await axios.get("/roles");
  return res.data;
};

export const getRoleById = async (id: string) => {
  const res = await axios.get(`/roles/${id}`);
  return res.data;
};

export const createRole = async (data: CreateRolePayload) => {
  const res = await axios.post("/roles", data);
  return res.data;
};

export const updateRole = async (id: string, data: UpdateRolePayload) => {
  const res = await axios.put(`/roles/${id}`, data);
  return res.data;
};

export const deleteRole = async (id: string) => {
  const res = await axios.delete(`/roles/${id}`);
  return res.data;
};

export const assignRolePermissions = async (
  id: string,
  permissionIds: string[],
) => {
  const res = await axios.put(`/roles/${id}/permissions`, { permissionIds });
  return res.data;
};

// ─── Permission catalog ──────────────────────────────────────────────────────

export const getPermissions = async () => {
  const res = await axios.get("/permissions");
  return res.data;
};

/** Grouped by subject — what the role editor's matrix renders from. */
export const getGroupedPermissions = async () => {
  const res = await axios.get("/permissions/grouped");
  return res.data;
};
