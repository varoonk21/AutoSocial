import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authClient } from "../../../lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: authError } = await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });

      if (authError) {
        setError(authError.message || "Failed to send reset email");
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
    <div className="min-h-screen w-full relative bg-background text-slate-900 selection:bg-primary-100 selection:text-primary-900 antialiased flex items-center justify-center p-4">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(45deg, transparent 49%, var(--border) 49%, var(--border) 51%, transparent 51%),
            linear-gradient(-45deg, transparent 49%, var(--border) 49%, var(--border) 51%, transparent 51%)
          `,
          backgroundSize: "50px 50px",
          WebkitMaskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 80%)",
          maskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 80%)",
        }}
      />

      <div className="w-full max-w-sm relative z-10">
        <div className="w-full bg-background rounded-2xl border border-slate-200/70 shadow-[0_18px_64px_-14px_rgba(0,0,0,0.2)] p-8 space-y-5">
          <div className="text-center space-y-1 mb-6">
            <div className="flex justify-center mb-4">
              <img src="/Icon.png" alt="AutoSocial Icon" className="w-20 h-20 object-contain rounded-lg shadow-sm" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Forgot Password</h2>
            <p className="text-sm text-slate-500 font-normal">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>}
          
          {success ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-accent border border-primary-200 rounded-xl text-sm text-primary-700">
                Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.
              </div>
              <Button type="button" variant="outline" className="w-full" onClick={() => navigate("/login")}>
                Return to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="email" className="block text-[13px] font-semibold text-slate-700 mb-1.5">Email</label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>

              <Button type="submit" disabled={loading || !email} className="w-full mt-2">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Send Reset Link</span>
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
    </div>
  );
}
