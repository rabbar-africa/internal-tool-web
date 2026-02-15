// import SectionLoader from '@/components/common/SectionLoader';
// import SectionLoader from '@/components/common/SectionLoader';
import { RouteConstants } from "@/shared/constants/routes";
// import { getToken, removeToken } from '@/utils/persistToken';
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoutes() {
  const location = useLocation();
  // const token = getToken();

  const isAuthenticated = true;
  // const isAuthenticated = Boolean(token?.accessToken);

  // const { isLoading, isSuccess, isError } = useGetUserQuery({
  //   enabled: isAuthenticated,
  // });
  if (!isAuthenticated) {
    return (
      <Navigate
        to={RouteConstants.auth.login.path}
        state={{ from: location }}
        replace
      />
    );
  }

  // if (isLoading) {
  //   return <SectionLoader h={'100vh'} />;
  // }

  // if (isError) {
  //   removeToken();

  //   return (
  //     <Navigate
  //       to={RouteConstants.auth.login.path}
  //       state={{ from: location }}
  //       replace
  //     />
  //   );
  // }
  // // if (!isAuthenticated) {
  // //   return <Navigate to="/auth/login" state={{ from: location }} replace />;
  // // }
  // if (isSuccess) {
  //   return <Outlet />;
  // }

  // return <SectionLoader h={'100vh'} />;
  return <Outlet />;
}
