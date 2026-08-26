import type { RouteObject } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";
import { lazyImport } from "@/utils/lazyImports";
import RequirePermission from "@/routes/RequirePermission";

const { Settings } = lazyImport(() => import("../pages/Settings"), "Settings");
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
  {
    path: settings.generalConfig.path,
    element: <GeneralConfigPage />,
  },
  {
    path: settings.profile.path,
    element: <CompanyProfile />,
  },
  {
    path: settings.logo.path,
    element: <Branding />,
  },
  {
    path: settings.addresses.path,
    element: <AddressesPage />,
  },
  {
    path: settings.currency.path,
    element: <CurrencyPage />,
  },
  {
    path: settings.accountDetails.path,
    element: <AccountDetailsPage />,
  },
  {
    path: settings.taxes.path,
    element: <TaxesPage />,
  },
  {
    path: settings.transactionSeries.path,
    element: <TransactionSeriesPage />,
  },
  // Team and role screens are gated: only users who can read the underlying
  // module get past the route, mirroring the API's own permission guard.
  {
    element: <RequirePermission permissions={["read:users"]} />,
    children: [
      {
        path: settings.teamManagement.path,
        element: <TeamManagementPage />,
      },
    ],
  },
  {
    element: <RequirePermission permissions={["read:roles"]} />,
    children: [
      {
        path: settings.roles.path,
        element: <RolesPage />,
      },
    ],
  },
];
