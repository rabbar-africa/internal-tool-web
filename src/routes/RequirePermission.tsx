import { Outlet, type RouteObject } from "react-router-dom";
import SectionLoader from "@/components/common/SectionLoader";
import { NoAccess } from "@/components/error/NoAccess";
import { usePermissions, type PermissionMode } from "@/hooks/usePermissions";
import type { PageKey } from "@/shared/constants/access";
import type { PermissionInput } from "@/utils/permissions";

type RequirePermissionProps =
  /** A page from PAGE_ACCESS: the usual way. */
  | { page: PageKey; permissions?: never; mode?: never }
  /** Raw permissions, for a one-off branch PAGE_ACCESS doesn't cover. */
  | {
      page?: never;
      permissions: readonly PermissionInput[];
      /** `"any"` (default): one match is enough. `"all"`: all are required. */
      mode?: PermissionMode;
    };

/**
 * Route-level guard. Wrap a protected branch of the router, usually through
 * `guarded()` below:
 *
 *   guarded("invoices", { path: "/invoices", element: <InvoicesPage /> })
 *
 * On denial it renders <NoAccess /> in place rather than redirecting, so the
 * user learns why and the URL stays shareable with an admin.
 *
 * Authentication and profile loading are handled upstream by `ProtectedRoutes`;
 * this only decides whether an already-signed-in user may see the branch.
 */
export default function RequirePermission(props: RequirePermissionProps) {
  const { check, canAccess, isLoading } = usePermissions();

  if (isLoading) return <SectionLoader h="100vh" />;

  const allowed = props.page
    ? canAccess(props.page)
    : check(props.permissions, props.mode);

  return allowed ? <Outlet /> : <NoAccess />;
}

/** Puts `routes` behind the permissions PAGE_ACCESS lists for `page`. */
export function guarded(page: PageKey, ...routes: RouteObject[]): RouteObject {
  return { element: <RequirePermission page={page} />, children: routes };
}
