// import SectionLoader from '@/components/common/SectionLoader';
// import SectionLoader from '@/components/common/SectionLoader';
import SectionLoader from "@/components/common/SectionLoader";
import {
  useGetCurrentSubscriptionQuery,
  useGetCurrentUserQuery,
} from "@/features/auth/api";
import { EmailVerifyGate } from "@/features/auth/components/EmailVerifyGate";
import { SubscriptionGate } from "@/features/auth/components/SubscriptionGate";
import type { SubscriptionStatus } from "@/features/auth/api/types";
import { RouteConstants } from "@/shared/constants/routes";
import { getToken, removeToken } from "@/utils/persistToken";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const BLOCKED_SUBSCRIPTION_STATUSES: SubscriptionStatus[] = [
  "CANCELLED",
  "INACTIVE",
];

export default function ProtectedRoutes() {
  const location = useLocation();
  const token = getToken();

  const isAuthenticated = Boolean(token?.accessToken);

  const {
    data: user,
    isLoading,
    isSuccess,
    isError,
  } = useGetCurrentUserQuery({
    enabled: isAuthenticated,
  });

  // Only fetch the subscription once we have a verified, authenticated user.
  const isEmailVerified = isSuccess && user?.isEmailVerified !== false;
  const {
    data: subscription,
    isLoading: isSubscriptionLoading,
    isSuccess: isSubscriptionSuccess,
  } = useGetCurrentSubscriptionQuery({
    enabled: isAuthenticated && isEmailVerified,
  });
  if (!isAuthenticated) {
    return (
      <Navigate
        to={RouteConstants.auth.login.path}
        state={{ from: location }}
        replace
      />
    );
  }

  if (isLoading) {
    return <SectionLoader h={"100vh"} />;
  }

  if (isError) {
    removeToken();

    return (
      <Navigate
        to={RouteConstants.auth.login.path}
        state={{ from: location }}
        replace
      />
    );
  }

  if (isSuccess) {
    // Gate unverified users behind the OTP screen before any protected route.
    if (user && user.isEmailVerified === false) {
      return <EmailVerifyGate email={user.email} />;
    }

    // Wait for the subscription check before rendering protected content.
    if (isSubscriptionLoading) {
      return <SectionLoader h={"100vh"} />;
    }

    // Past-due orgs keep working through the grace period and expired ones
    // fall back to the free Starter plan — both get a "Pay now" banner
    // instead of being locked out. Only a subscription the back office has
    // switched off (cancelled / inactive) still blocks the app.
    const hasActiveSubscription =
      isSubscriptionSuccess &&
      subscription != null &&
      !BLOCKED_SUBSCRIPTION_STATUSES.includes(subscription.status);

    if (!hasActiveSubscription) {
      return <SubscriptionGate />;
    }

    return <Outlet />;
  }

  return <SectionLoader h={"100vh"} />;
}
