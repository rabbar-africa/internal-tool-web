import type { RouteObject } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";
import { lazyImport } from "@/utils/lazyImports";
import { guarded } from "@/routes/RequirePermission";
import { BillingSettingsRoutes } from "@/features/billing/routes";

const { Settings } = lazyImport(() => import("../pages/Settings"), "Settings");
const { DeleteBusinessPage } = lazyImport(
  () => import("../pages/DeleteBusinessPage"),
  "DeleteBusinessPage",
);
const { GeneralConfigPage } = lazyImport(
  () => import("../pages/GeneralConfigPage"),
  "GeneralConfigPage",
);
const { CompanyProfile } = lazyImport(
  () => import("../pages/CompanyProfile"),
  "CompanyProfile",
);
const { Branding } = lazyImport(() => import("../pages/Branding"), "Branding");
const { AddressesPage } = lazyImport(
  () => import("../pages/AddressesPage"),
  "AddressesPage",
);
const { CurrencyPage } = lazyImport(
  () => import("../pages/CurrencyPage"),
  "CurrencyPage",
);
const { AccountDetailsPage } = lazyImport(
  () => import("../pages/AccountDetailsPage"),
  "AccountDetailsPage",
);
const { InvoiceTemplatesPage } = lazyImport(
  () => import("../pages/InvoiceTemplatesPage"),
  "InvoiceTemplatesPage",
);
const { InvoiceTemplateEditorPage } = lazyImport(
  () => import("../pages/InvoiceTemplateEditorPage"),
  "InvoiceTemplateEditorPage",
);
const { TaxesPage } = lazyImport(
  () => import("../pages/TaxesPage"),
  "TaxesPage",
);
const { TransactionSeriesPage } = lazyImport(
  () => import("../pages/TransactionSeriesPage"),
  "TransactionSeriesPage",
);
const { TeamManagementPage } = lazyImport(
  () => import("../pages/TeamManagementPage"),
  "TeamManagementPage",
);
const { ActivityLogPage } = lazyImport(
  () => import("../pages/ActivityLogPage"),
  "ActivityLogPage",
);
const { SignInSecurityPage } = lazyImport(
  () => import("../pages/SignInSecurityPage"),
  "SignInSecurityPage",
);
const { RolesPage } = lazyImport(
  () => import("../pages/RolesPage"),
  "RolesPage",
);

const { settings } = RouteConstants;

export const SettingsRoutes: RouteObject[] = [
  {
    path: settings.base.path,
    element: <Settings />,
  },
  // Only for those who can change them (D6, revised 14 Nov 2026): every save
  // behind these pages needs `update organization`.
  guarded(
    "organizationSettings",
    { path: settings.generalConfig.path, element: <GeneralConfigPage /> },
    { path: settings.profile.path, element: <CompanyProfile /> },
    { path: settings.logo.path, element: <Branding /> },
    { path: settings.addresses.path, element: <AddressesPage /> },
    { path: settings.currency.path, element: <CurrencyPage /> },
    { path: settings.invoiceTemplates.path, element: <InvoiceTemplatesPage /> },
    {
      path: settings.transactionSeries.path,
      element: <TransactionSeriesPage />,
    },
  ),
  guarded(
    "invoiceTemplateEdit",
    {
      path: settings.createInvoiceTemplate.path,
      element: <InvoiceTemplateEditorPage />,
    },
    {
      path: settings.editInvoiceTemplate.path,
      element: <InvoiceTemplateEditorPage />,
    },
  ),
  // Bank accounts and taxes: also the accountant, who reads them.
  guarded(
    "financeSettings",
    { path: settings.accountDetails.path, element: <AccountDetailsPage /> },
    { path: settings.taxes.path, element: <TaxesPage /> },
  ),
  // Your own sessions: everyone.
  {
    path: settings.security.path,
    element: <SignInSecurityPage />,
  },
  // The page itself turns away anyone but the owner.
  {
    path: settings.deleteBusiness.path,
    element: <DeleteBusinessPage />,
  },
  // Paying and changing the plan; others are told to ask an admin.
  guarded("billing", ...BillingSettingsRoutes),
  // Team and role screens are gated: only users who can read the underlying
  // module get past the route, mirroring the API's own permission guard.
  guarded("team", {
    path: settings.teamManagement.path,
    element: <TeamManagementPage />,
  }),
  guarded("roles", {
    path: settings.roles.path,
    element: <RolesPage />,
  }),
  guarded("activityLog", {
    path: settings.activityLog.path,
    element: <ActivityLogPage />,
  }),
];
