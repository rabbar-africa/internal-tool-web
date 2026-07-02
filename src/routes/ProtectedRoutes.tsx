// import SectionLoader from '@/components/common/SectionLoader';
// import SectionLoader from '@/components/common/SectionLoader';
import SectionLoader from "@/components/common/SectionLoader";
import {
  useGetCurrentSubscriptionQuery,
  useGetCurrentUserQuery,
} from "@/features/auth/api";
import { EmailVerifyGate } from "@/features/auth/components/EmailVerifyGate";
import { SubscriptionGate } from "@/features/auth/components/SubscriptionGate";
import { RouteConstants } from "@/shared/constants/routes";
import { getToken, removeToken } from "@/utils/persistToken";
import { Navigate, Outlet, useLocation } from "react-router-dom";

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

    // Gate users without an active subscription (none on file or expired).
    // TEMPORARY — remove once the real subscription flow is finalized.
    const hasActiveSubscription =
      isSubscriptionSuccess &&
      subscription != null &&
      subscription.status === "ACTIVE" &&
      !subscription.isExpired;

    if (!hasActiveSubscription) {
      return <SubscriptionGate />;
    }

    return <Outlet />;
  }

  return <SectionLoader h={"100vh"} />;
}
