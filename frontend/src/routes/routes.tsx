import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { ModuleLoader } from "./ModuleLoader";

const AuthRoutes = lazy(() => import("@/features/auth/routes"));
const DashboardRoutes = lazy(() => import("@/features/dashboard/routes"));
const OAuthCallbackPage = lazy(() =>
  import("@/features/dashboard/pages/OAuthCallbackPage").then((m) => ({
    default: m.OAuthCallbackPage,
  }))
);

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
        path: "integrations/social/:provider",
        element: (
          <ModuleLoader>
            <OAuthCallbackPage />
          </ModuleLoader>
        ),
      },
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
]);
