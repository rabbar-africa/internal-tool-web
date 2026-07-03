export const customQueryKey = {
  user: {
    getMe: "get-me",
    getOrganizations: "get-my-organizations",
    getMyPermissions: "get-my-permissions",
    getMyTeams: "get-my-teams",
    getAllMyTeams: "get-all-my-teams",
    getCurrentSubscription: "get-current-subscription",
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
  customers: {
    getAll: "get-all-customers",
    getById: "get-customer-by-id",
    stats: "get-customer-stats",
  },
  vehicles: {
    getAll: "get-all-vehicles",
    getByClient: "get-vehicles-by-client",
    getById: "get-vehicle-by-id",
  },
  items: {
    getAll: "get-all-items",
    getById: "get-item-by-id",
    getSimple: "get-item-list-simple",
  },
  invoices: {
    getAll: "get-all-invoices",
    getById: "get-invoice-by-id",
  },
  inspections: {
    getAll: "get-all-inspections",
    getById: "get-inspection-by-id",
  },
  business: { getAll: "get-all-businesses", getById: "get-business-by-id" },
  analytics: {
    dashboard: "get-dashboard-analytics",
  },
  organizations: {
    details: "get-organization-details",
    addresses: "get-organization-addresses",
    bankAccounts: "get-organization-bank-accounts",
    currencies: "get-organization-currencies",
    taxes: "get-organization-taxes",
    transactionSeries: "get-organization-transaction-series",
  },
};
