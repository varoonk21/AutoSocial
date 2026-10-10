import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { ModuleLoader } from "./ModuleLoader";
import { NotFoundPage } from "./NotFoundPage";

const AuthRoutes = lazy(() => import("@/features/auth/routes"));
const DashboardRoutes = lazy(() => import("@/features/dashboard/routes"));

export const router = createBrowserRouter([
  {
    path: "/*",
    element: (
      <ModuleLoader>
        <AuthRoutes />
      </ModuleLoader>
    ),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "dashboard/*",
        element: (
          <ModuleLoader>
            <DashboardRoutes />
          </ModuleLoader>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
