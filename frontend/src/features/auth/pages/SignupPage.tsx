import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "../components/AuthLayout";

export function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
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
      const { data, error: authError } = await signUp.email({ name, email, password });

      if (authError) {
        setError(authError.message || "Failed to sign up");
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
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Create an account</h2>
            <p className="text-sm text-slate-500 font-normal">Enter your details to get started</p>
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-[13px] font-semibold text-slate-700 mb-1.5">Name</label>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-[13px] font-semibold text-slate-700 mb-1.5">Email address</label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center relative mb-1.5">
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Password</label>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
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
                <span>Sign Up</span>
              )}
            </Button>
          </form>

          <div className="text-center">
            <span className="text-sm text-slate-500 font-normal">
              Already have an account?{" "}
              <Button type="button" variant="link" onClick={() => navigate("/login")} className="text-sm font-medium text-slate-900 p-0 h-auto">
                Sign in
              </Button>
            </span>
          </div>

          <div className="pt-4 border-t border-slate-100 text-center">
            <span className="text-xs text-slate-400 font-normal flex items-center justify-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secured by Better Auth
            </span>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
