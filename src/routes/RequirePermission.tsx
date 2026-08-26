import { Navigate, Outlet, useLocation } from "react-router-dom";
import SectionLoader from "@/components/common/SectionLoader";
import { usePermissions, type PermissionMode } from "@/hooks/usePermissions";
import { RouteConstants } from "@/shared/constants/routes";
import type { PermissionInput } from "@/utils/permissions";

interface RequirePermissionProps {
  permissions: PermissionInput[];
  /** `"any"` (default): one match is enough. `"all"`: all are required. */
  mode?: PermissionMode;
  /** Where to send the user on denial. Defaults to the overview page. */
  redirectTo?: string;
}

/**
 * Route-level guard. Wrap a protected branch of the router:
 *
 *   <Route element={<RequirePermission permissions={["read:invoices"]} />}>
 *     <Route path="/invoices" element={<InvoicesPage />} />
 *   </Route>
 *
 * Authentication and profile loading are handled upstream by `ProtectedRoutes`;
 * this only decides whether an already-signed-in user may see the branch.
 */
export default function RequirePermission({
  permissions,
  mode = "any",
  redirectTo = RouteConstants.overview.base.path,
}: RequirePermissionProps) {
  const location = useLocation();
  const { check, isLoading } = usePermissions();

  if (isLoading) return <SectionLoader h="100vh" />;

  if (!check(permissions, mode)) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <Outlet />;
}
