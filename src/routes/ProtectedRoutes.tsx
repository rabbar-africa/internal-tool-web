// import SectionLoader from '@/components/common/SectionLoader';
// import SectionLoader from '@/components/common/SectionLoader';
import { RouteConstants } from "@/shared/constants/routes";
import { getToken } from "@/utils/persistToken";
import storage from "@/utils/storage";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoutes() {
  const location = useLocation();
  const token = getToken();
  const user = storage.getValue<{ roles?: string[] }>("auth_user");
  const isSuperAdmin = Boolean(user?.roles?.includes("super_admin"));
  const isAuthenticated = Boolean(token?.accessToken && isSuperAdmin);

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
