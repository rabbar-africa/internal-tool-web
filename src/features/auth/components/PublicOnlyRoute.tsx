import { RouteConstants } from "@/shared/constants/routes";
import { getToken } from "@/utils/persistToken";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

interface PublicOnlyRouteProps {
  children: ReactNode;
}

export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const location = useLocation();
  const token = getToken();

  const isAuthenticated = Boolean(token?.accessToken);

  if (isAuthenticated) {
    // If user is coming from a protected route, redirect back there
    const from = (location.state as any)?.from;
    // With its query string: it can carry work to finish, like a payment's
    // reference on the billing page.
    const redirectTo = from?.pathname
      ? `${from.pathname}${from.search ?? ""}`
      : RouteConstants.overview.base.path;

    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
