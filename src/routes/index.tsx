import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { trackHistory } from "@/utils/history-trail";
import { RoutesList } from "./routeList";

const router = createBrowserRouter([...RoutesList]);
// So a page can go back past a record it just deleted.
trackHistory(router);
export default function AppRouter() {
  return (
    <RouterProvider router={router} fallbackElement={<p>Loading....</p>} />
  );
}
