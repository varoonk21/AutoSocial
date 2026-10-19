import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSession } from "@/lib/auth-client";

export function PublicRoute() {
  const { data: session, isPending } = useSession();
  const location = useLocation();

  const isPreloading = location.pathname === "/loading";

  if (isPreloading) {
    return <Outlet />;
  }

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
