// import SectionLoader from '@/components/common/SectionLoader';
// import SectionLoader from '@/components/common/SectionLoader';
import SectionLoader from "@/components/common/SectionLoader";
import { useGetCurrentUserQuery } from "@/features/auth/api";
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
    return <Outlet />;
  }

  return <SectionLoader h={"100vh"} />;
}
