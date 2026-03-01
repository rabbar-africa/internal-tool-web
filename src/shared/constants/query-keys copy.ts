export const customQueryKey = {
  user: {
    getMe: "get-me",
    getOrganizations: "get-my-organizations",
  },
  countries: {
    getAll: "get-all-countries",
  },
  dataInventoryItems: {
    base: "data-inventory-items",
    getAll: "get-all-data-inventory-items",
    getById: "get-all-data-inventory-item-by-id",
    overview: "get-all-data-inventory-item-overview",
  },
  dataInventoryDocuments: {
    base: "data-inventory-documents",
  },
  ropaTemplates: {
    base: "ropa-templates",
    getAll: "get-all-ropa-templates",
    getById: "get-all-ropa-template",
    overview: "get-all-ropa-template",
  },
  systems: {
    base: "systems",
    getAll: "get-all-systems",
    getById: "get-system-by-id",
    overview: "get-system-overview",
  },
  systemHistories: {
    base: "systems-histories",
  },
  systemTemplates: {
    getAll: "system-templates",
  },
  frameworks: {
    getAll: "system-templates",
  },
  processingActivities: {
    base: "processing-activities",
    getAll: "get-all-processing-activities",
    getOverview: "get-processing-activities-overview",
    getOverviewApproval: "get-processing-activities-overview-approval",
    getById: "get-processing-activities-by-id",
  },
  dataInventoryAssesments: {
    getAll: "get-all-data-inventory-assesments",
    getById: "get-all-data-inventory-assesments-by-id",
  },
  dataInventoryActivities: {
    getAll: "get-all-data-inventory-activities",
    getById: "get-all-data-inventory-activities-by-id",
  },
  regIntel: {
    getAll: "get-all-regintel",
    getById: "get-regintel-by-id",
    getOverview: "get-regintel-overview",
    setAlert: "set-regulatory-alert",
  },
  departments: {
    getAll: "get-all-departments",
    getById: "get-department-by-id",
  },
  mitigationControls: {
    getAll: "get-all-mitigation-controls",
    getById: "get-mitigation-control-by-id",
  },
  processingPurpose: {
    getAll: "get-all-processing-purpose",
    getById: "get-processing-purpose-by-id",
  },
  retentionBasis: {
    getAll: "get-all-retention-basis",
    getById: "get-retention-basis-by-id",
  },
  systemTypes: {
    getAll: "get-all-system-types",
    getById: "get-system-type-by-id",
  },
  legalBasis: {
    getAll: "get-all-legal-basis",
    getById: "get-legal-basis-by-id",
  },
  dataCategory: {
    getAll: "get-all-data-categories",
    getById: "get-data-category-by-id",
  },
  dataSubjectCategory: {
    getAll: "get-all-data-subject-categories",
    getById: "get-data-subject-category-by-id",
  },
  processingLocation: {
    getAll: "get-all-processing-location",
  },
  sanction: {
    getAll: "get-all-sanctions",
    getById: "get-sanction-by-id",
  },
  lawLens: {
    getAll: "get-all-law-lens",
    getById: "get-law-lens-by-id",
  },
  roles: {
    getAll: "get-all-roles",
    getById: "get-role-by-id",
    getPermissions: "get-role-permissions",
  },
  auditLogs: {
    getAll: "get-all-audit-logs",
  },
  members: {
    getAll: "get-all-members",
    getById: "get-member-by-id",
  },
  assesmentsTemplates: {
    getAll: "get-all-assesments-templates",
    getById: "get-all-assesments-templates-by-id",
  },
  riskCatalog: {
    getAll: "get-all-risk-catalog",
    getById: "get-all-risk-catalog-by-id",
  },
  inventoryAssessments: {
    getAll: "get-all-inventory-assessments",
    getById: "get-inventory-assessment-by-id",
    overview: "get-inventory-assessment-overview",
    heatMap: "get-risk-heat-map",
  },
  dataSubjectRights: {
    getAll: "get-all-data-subject-rights",
    getById: "get-data-subject-right-by-id",
    getAuditLogs: "get-data-subject-right-audit-logs",
    getAllAppeals: "get-all-data-subject-right-appeals",
    getAppealById: "get-data-subject-right-appeal-by-id",
  },
  riskComments: {
    getAll: "get-all-risk-comments",
    getById: "get-risk-comment-by-id",
    getByAssessmentId: "get-risk-comments-by-assessment-id",
  },
  tasks: {
    getAll: "get-all-tasks",
    getById: "get-task-by-id",
    createTask: "create-task",
    updateTask: "update-task",
  },
  vendors: {
    getAll: "get-all-vendors",
    getById: "get-vendor-by-id",
  },
  jurisdictionConfigurations: {
    getAll: "get-all-jurisdiction-configurations",
    getById: "get-jurisdiction-configuration-by-id",
  },
  vendorDocuments: {
    getAll: "get-all-vendor-documents",
    getById: "get-vendor-document-by-id",
    getByVendorId: "get-vendor-documents-by-vendor-id",
  },
  evidences: {
    getAll: "get-all-evidences",
    getById: "get-evidence-by-id",
  },
  evidenceRequests: {
    getAll: "get-all-evidence-requests",
    getById: "get-evidence-request-by-id",
  },
  assessments: {
    getAll: "get-all-assessments",
    getById: "get-assessment-by-id",
    getOverview: "get-assessments-overview",
    getHistory: "get-assessment-history",
  },
  requirements: {
    getAll: "get-all-requirements",
    getById: "get-requirement-by-id",
  },
  sfgStandards: {
    getAll: "get-all-sfg-standards",
    getById: "get-sfg-standard-by-id",
  },
  auditSchedules: {
    getAll: "get-all-audit-schedules",
    getById: "get-audit-schedule-by-id",
  },
  trustCenter: {
    base: "trust-center",
    categories: {
      base: "trust-center-categories",
      getAll: "get-all-trust-center-categories",
      getById: "get-trust-center-category-by-id",
    },
    documents: {
      base: "trust-center-documents",
      getAll: "get-all-trust-center-documents",
      getById: "get-trust-center-document-by-id",
      getDetails: "get-trust-center-document-details",
      search: "search-trust-center-documents",
    },
    permissions: {
      base: "trust-center-permissions",
      getByDocument: "get-document-permissions",
    },
    settings: {
      base: "trust-center-settings",
      get: "get-trust-center-settings",
    },
    users: {
      search: "search-trust-center-users",
    },
  },
  vendorOnboarding: {
    base: "vendor-onboarding",
  },
  obligations: {
    base: "obligations",
    getAll: "obligations",
    getById: "get-obligation-by-id",
    getOverview: "get-obligations-overview",
    getPriorityDistribution: "get-obligations-priority-distribution",
    getTrend: "get-obligations-trend",
    getActivityLog: "get-obligations-activity-logs",
  },
};
