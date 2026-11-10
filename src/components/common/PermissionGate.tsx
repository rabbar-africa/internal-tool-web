import type { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import type { PageKey, ViewRule } from "@/shared/constants/access";
import type { PermissionInput } from "@/utils/permissions";

interface PermissionGateProps {
  /** User must hold at least one of these. */
  anyOf?: readonly PermissionInput[];
  /** User must hold every one of these. */
  allOf?: readonly PermissionInput[];
  /** User must pass this view rule (VIEW_RULES), e.g. `"finance"`. */
  rule?: ViewRule;
  /** User must be allowed on this page (PAGE_ACCESS), e.g. for a link to it. */
  page?: PageKey;
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
 *   <PermissionGate rule="finance"><ProfitCard /></PermissionGate>
 *
 * Every check given must pass; with none the gate is a no-op. This only hides
 * UI; the API enforces the same rules server-side.
 */
export function PermissionGate({
  anyOf,
  allOf,
  rule,
  page,
  fallback = null,
  loading = null,
  children,
}: PermissionGateProps) {
  const { hasAny, hasAll, can, canAccess, isLoading } = usePermissions();

  if (isLoading) return <>{loading}</>;

  const pass =
    (!anyOf?.length || hasAny(anyOf)) &&
    (!allOf?.length || hasAll(allOf)) &&
    (!rule || can(rule)) &&
    (!page || canAccess(page));

  return <>{pass ? children : fallback}</>;
}
