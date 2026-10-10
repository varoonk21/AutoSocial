import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, MapPinOff } from "lucide-react";
import { useSession } from "@/lib/auth-client";

export function NotFoundPage() {
  const navigate = useNavigate();
  const { data: session } = useSession();

  const handleGoHome = () => {
    navigate(session?.user ? "/dashboard" : "/login", { replace: true });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white px-6">
      <div className="text-center max-w-md">
        <div className="mx-auto size-16 rounded-2xl bg-teal-50 flex items-center justify-center mb-6">
          <MapPinOff className="w-8 h-8 text-teal-600" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Oops wrong turn
        </h1>
        <p className="text-slate-500 mt-3 text-base">
          This page not exits
        </p>
        <Button onClick={handleGoHome} className="mt-8" size="lg">
          <Home className="w-4 h-4" />
          Back to Home
        </Button>
      </div>
    </div>
  );
}
