import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useSession } from "@/lib/auth-client";

export function HomePage() {
  const navigate = useNavigate();
  const { data: session } = useSession();

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background text-slate-900 selection:bg-primary-100 selection:text-primary-900 antialiased">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% -5%, rgba(47, 133, 135, 0.09), transparent 70%)",
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-2.5">
          <img src="/Icon.png" alt="AutoSocial" className="size-8 rounded-lg object-contain" />
          <span className="text-sm font-semibold tracking-tight text-slate-900">AutoSocial</span>
        </div>

        <nav className="flex items-center gap-2">
          {session?.user ? (
            <Button onClick={() => navigate("/dashboard", { replace: true })}>
              Open dashboard
              <ArrowRight />
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button onClick={() => navigate("/signup")}>Get started</Button>
            </>
          )}
        </nav>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-20 text-center">
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-slate-500 shadow-soft">
          <span className="size-1.5 rounded-full bg-primary" />
          AI-powered social media
        </div>

        <h1 className="max-w-2xl text-5xl font-semibold leading-[1.05] tracking-tight text-slate-900 sm:text-6xl">
          Write, schedule, and grow <span className="text-primary">in one place.</span>
        </h1>

        <p className="mt-5 max-w-md text-base leading-relaxed text-slate-500 sm:text-lg">
          Turn ideas into posts with an AI partner that understands your context, tone, and brand voice.
        </p>

        <div className="mt-9 flex items-center gap-3">
          <Button size="lg" className="h-11 px-6 text-sm" onClick={() => navigate(session?.user ? "/dashboard" : "/signup")}>
            {session?.user ? "Open dashboard" : "Get started"}
            <ArrowRight />
          </Button>
          {!session?.user && (
            <Button size="lg" variant="outline" className="h-11 px-6 text-sm" onClick={() => navigate("/login")}>
              Login
            </Button>
          )}
        </div>
      </main>

      <footer className="relative z-10 pb-6 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} AutoSocial Inc. All rights reserved.
      </footer>
    </div>
  );
}
