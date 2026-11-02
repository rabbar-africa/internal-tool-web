// import SectionLoader from '@/components/common/SectionLoader';
// import SectionLoader from '@/components/common/SectionLoader';
import SectionLoader from "@/components/common/SectionLoader";
import {
  useGetCurrentSubscriptionQuery,
  useGetCurrentUserQuery,
} from "@/features/auth/api";
import { EmailVerifyGate } from "@/features/auth/components/EmailVerifyGate";
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
  const { isLoading: isSubscriptionLoading } = useGetCurrentSubscriptionQuery({
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

    // Wait for the plan, so locks don't flash open while it loads. Nobody is
    // locked out over a subscription: an expired, cancelled or inactive one
    // falls back to the free Starter plan, whose limits the API enforces.
    if (isSubscriptionLoading) {
      return <SectionLoader h={"100vh"} />;
    }

    return <Outlet />;
  }

  return <SectionLoader h={"100vh"} />;
}
