export const customQueryKey = {
  user: {
    getMe: "get-me",
    getOrganizations: "get-my-organizations",
    getMyPermissions: "get-my-permissions",
    getMyTeams: "get-my-teams",
    getAllMyTeams: "get-all-my-teams",
  },

  roles: {
    getAll: "get-all-roles",
    getById: "get-role-by-id",
    getPermissions: "get-role-permissions",
  },
  permissions: {
    getAll: "get-all-permissions",
  },
  teams: {
    getAll: "get-all-teams",
    getById: "get-team-by-id",
    createTeam: "create-team",
    addMember: "add-team-member",
    updateMember: "update-team-member",
  },
  members: {
    getAll: "get-all-members",
    getById: "get-member-by-id",
  },
  accountUsers: {
    getAll: "get-all-account-users",
    getById: "get-account-user-by-id",
  },
  adminUsers: {
    getAll: "get-all-admin-users",
    getById: "get-admin-user-by-id",
  },
  business: { getAll: "get-all-businesses", getById: "get-business-by-id" },
};
