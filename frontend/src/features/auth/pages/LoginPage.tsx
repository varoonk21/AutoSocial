import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "../components/AuthLayout";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: authError } = await signIn.email({ email, password });

      if (authError) {
        setError(authError.message || "Failed to sign in");
        return;
      }

      if (data) {
        navigate("/loading");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-sm flex justify-center">
        <div className="w-full bg-background rounded-2xl border border-slate-200/70 shadow-[0_18px_64px_-14px_rgba(0,0,0,0.2)] p-8 space-y-5">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Sign in to AutoSocial</h2>
            <p className="text-sm text-slate-500 font-normal">Welcome back! Please sign in to continue</p>
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[13px] font-semibold text-slate-700 mb-1.5">Email address</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="password" className="block text-[13px] font-semibold text-slate-700">Password</label>
                <Button
                  type="button"
                  variant="link"
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs font-medium text-primary-600 p-0 h-auto hover:text-primary-700 hover:no-underline"
                >
                  Forgot password?
                </Button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="pr-16"
                  required
                  minLength={8}
                />
                <Button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  variant="ghost"
                  size="sm"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 text-xs text-slate-500"
                >
                  {showPassword ? "Hide" : "Show"}
                </Button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Sign In</span>
              )}
            </Button>
          </form>

          <div className="text-center">
            <span className="text-sm text-slate-500 font-normal">
              Don't have an account?{" "}
              <Button type="button" variant="link" onClick={() => navigate("/signup")} className="text-sm font-medium text-slate-900 p-0 h-auto">
                Sign up
              </Button>
            </span>
          </div>

        </div>
      </div>
    </AuthLayout>
  );
}
