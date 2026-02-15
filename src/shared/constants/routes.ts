import { defineRoute } from "@/utils/route";

// const riskManagementRoutes = {
//    base: defineRoute('/risk-management' as const),
//   riskCatalogue: defineRoute('/risk-management/catalogue' as const),
//   assesmentsTemplates: defineRoute(
//     '/risk-management/assesments-template' as const
//   ),
//   templateDetails: defineRoute(
//     '/risk-management/assesments-template/:id' as const
//   ),
//   editAssessment: defineRoute('/risk-management/edit-assesments/:id' as const),
//   createAssesmentsTemplate: defineRoute(
//     '/risk-management/assesments-template/create' as const
//   ),
//   createRiskAssesments: defineRoute(
//     '/risk-management/create-assesments' as const
//   ),
//   catalogueDetails: defineRoute('/risk-management/catalogue/:id' as const),
//   assessmentsDetails: defineRoute('/risk-management/assessments/:id' as const),
//   advanceSetup: defineRoute('/data-inventory/advance-setup' as const),
//   importRopa: defineRoute('/data-inventory/ropa-import' as const),
//   ropaDetails: defineRoute('/ropa-details/:id' as const),
// } as const;

const auth = {
  login: defineRoute("/auth/login" as const),
  signup: defineRoute("/auth/signup" as const),
  forgotPassword: defineRoute("/auth/forgot-password" as const),
  resetPassword: defineRoute("/auth/reset-password" as const),
} as const;

const overview = {
  base: defineRoute("/" as const),
} as const;

const inspection = {
  base: defineRoute("/inspection" as const),
  inspectionDetails: defineRoute("/inspection/:id" as const),
  createInspection: defineRoute("/inspection/create" as const),
} as const;
const user = {
  base: defineRoute("/user" as const),
  userDetails: defineRoute("/user/:id" as const),
  createUser: defineRoute("/user/create" as const),
} as const;

const transactionLedger = {
  base: defineRoute("/transaction-ledger" as const),
  transactionDetails: defineRoute("/transaction-ledger/:id" as const),
} as const;

const wallet = {
  base: defineRoute("/wallet" as const),
  walletDetails: defineRoute("/wallet/:id" as const),
} as const;

const systemConfiguration = {
  base: defineRoute("/system-configuration" as const),
  rolesAndPermissions: defineRoute("/system-configuration/roles" as const),
  createRole: defineRoute("/system-configuration/roles/create" as const),
  editRole: defineRoute("/system-configuration/roles/:id/edit" as const),
} as const;

const securityAndCompliance = {
  base: defineRoute("/security-and-compliance" as const),
  auditLogs: defineRoute("/security-and-compliance/audit-logs" as const),
} as const;

const apiAndIntegrations = {
  base: defineRoute("/api-and-integrations" as const),
  apiKeys: defineRoute("/api-and-integrations/api-keys" as const),
  createApiKey: defineRoute("/api-and-integrations/api-keys/create" as const),
} as const;

const notifications = {
  base: defineRoute("/notifications" as const),
  emailTemplates: defineRoute("/notifications/email-templates" as const),
  createEmailTemplate: defineRoute(
    "/notifications/email-templates/create" as const,
  ),
} as const;

const reports = {
  base: defineRoute("/reports" as const),
  transactionReports: defineRoute("/reports/transactions" as const),
} as const;

const support = {
  base: defineRoute("/support" as const),
  tickets: defineRoute("/support/tickets" as const),
  ticketDetails: defineRoute("/support/tickets/:id" as const),
} as const;

const systemLogs = {
  base: defineRoute("/system-logs" as const),
} as const;

const settings = {
  base: defineRoute("/settings" as const),
  profileSettings: defineRoute("/settings/profile" as const),
  accountSettings: defineRoute("/settings/account" as const),
  teamManagement: defineRoute("/settings/team-management" as const),
  createTeamMember: defineRoute("/settings/team-management/create" as const),
  editTeamMember: defineRoute("/settings/team-management/:id/edit" as const),
} as const;

export const RouteConstants = {
  auth,
  overview,
  inspection,
  transactionLedger,
  wallet,
  systemConfiguration,
  securityAndCompliance,
  apiAndIntegrations,
  notifications,
  reports,
  support,
  systemLogs,
  settings,
  user,
} as const;
