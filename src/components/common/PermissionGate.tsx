import type { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import type { PermissionInput } from "@/utils/permissions";

interface PermissionGateProps {
  /** User must hold at least one of these. */
  anyOf?: PermissionInput[];
  /** User must hold every one of these. */
  allOf?: PermissionInput[];
  /** Rendered when the check fails. Defaults to nothing. */
  fallback?: ReactNode;
  /**
   * Rendered while the user is still loading. Defaults to nothing — better a
   * brief gap than flashing a denial the user then sees replaced.
   */
  loading?: ReactNode;
  children: ReactNode;
}

/**
 * Hides part of a view behind a permission check.
 *
 *   <PermissionGate anyOf={["create:invoices"]}>
 *     <Button>New invoice</Button>
 *   </PermissionGate>
 *
 * Pass `anyOf`, `allOf`, or both — both must then pass. With neither the gate
 * is a no-op. This only hides UI; the API enforces the same rules server-side.
 */
export function PermissionGate({
  anyOf,
  allOf,
  fallback = null,
  loading = null,
  children,
}: PermissionGateProps) {
  const { hasAny, hasAll, isLoading } = usePermissions();

  if (isLoading) return <>{loading}</>;

  const anyPass = !anyOf?.length || hasAny(anyOf);
  const allPass = !allOf?.length || hasAll(allOf);

  if (!anyPass || !allPass) return <>{fallback}</>;
  return <>{children}</>;
}
