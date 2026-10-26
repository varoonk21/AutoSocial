import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authClient } from "../../../lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "../components/AuthLayout";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState("");
  const [tokenMissing, setTokenMissing] = useState(false);

  useEffect(() => {
    // Better Auth passes the token in the URL search params as `token`
    const searchParams = new URLSearchParams(location.search);
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setToken(urlToken);
    } else {
      setTokenMissing(true);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Missing reset token");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: authError } = await authClient.resetPassword({
        newPassword: password,
        token: token,
      });

      if (authError) {
        setError(authError.message || "Failed to reset password");
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-sm">
        <div className="w-full bg-background rounded-2xl border border-slate-200/70 shadow-[0_18px_64px_-14px_rgba(0,0,0,0.2)] p-8 space-y-5">
          <div className="text-center space-y-1 mb-6">
            <div className="flex justify-center mb-4">
              <img src="/Icon.png" alt="AutoSocial Icon" className="w-20 h-20 object-contain rounded-lg shadow-sm" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Set New Password</h2>
            <p className="text-sm text-slate-500 font-normal">
              Enter your new password below to regain access to your account.
            </p>
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}
          
          {success ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-accent border border-primary-200 rounded-xl text-sm text-primary-700">
                Your password has been successfully reset.
              </div>
              <Button type="button" className="w-full" onClick={() => navigate("/login")}>
                Go to Login
              </Button>
            </div>
          ) : tokenMissing ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                This reset link is invalid or has expired. Please request a new one.
              </div>
              <Button type="button" className="w-full" onClick={() => navigate("/forgot-password")}>
                Request new link
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="new-password" className="block text-[13px] font-semibold text-slate-700 mb-1.5">New Password</label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
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

              <div className="space-y-1">
                <label htmlFor="confirm-password" className="block text-[13px] font-semibold text-slate-700 mb-1.5">Confirm Password</label>
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>

              <Button type="submit" disabled={loading || !password || !confirmPassword} className="w-full mt-2">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Reset Password</span>
                )}
              </Button>
            </form>
          )}

          <div className="pt-4 border-t border-slate-100 text-center">
            <Button type="button" variant="link" onClick={() => navigate("/login")} className="text-sm font-medium text-slate-900 p-0 h-auto">
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
