import { ReactNode } from "react";

function getCurrentYear() {
  return new Date().getFullYear();
}

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full relative bg-background text-slate-900 selection:bg-primary-100 selection:text-primary-900 antialiased">
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

      <div className="relative z-10 flex min-h-screen w-full">
        <div className="hidden w-1/2 flex-col justify-between p-12 md:flex">
          <div className="flex items-start justify-center flex-col  font-bold tracking-tight text-3xl text-slate-900">
            <img src="/Icon.png" alt="AutoSocial Icon" className="w-20 h-20 object-contain rounded-lg" />
            <span>AutoSocial</span>
          </div>

          <div className="max-w-lg mb-20">
            <h1 className="mb-6 text-5xl font-semibold tracking-tight leading-tight text-slate-900">
              Unlock limitless <br />
              <span className="text-primary font-semibold">content.</span>
            </h1>
            <p className="text-lg text-slate-500 font-normal leading-relaxed">
              Turn ideas into posts with an AI partner that understands context, tone, and brand voice. The smartest way to write, schedule, and grow
              is right here.
            </p>
          </div>

          <div className="text-xs text-slate-400 font-normal">&copy; {getCurrentYear()} AutoSocial Inc. All rights reserved.</div>
        </div>

        <div className="flex w-full flex-col items-center justify-center p-4 md:w-1/2">
          <div className="md:hidden flex flex-col items-center mb-8 text-center space-y-2">
            <div className="flex items-center gap-3 font-bold tracking-tight text-3xl text-slate-900">
              <img src="/Icon.png" alt="AutoSocial Icon" className="w-20 h-20 object-contain rounded-lg" />
              <span>AutoSocial</span>
            </div>
            <p className="text-sm text-slate-500 font-normal">Turn ideas into posts with an AI partner.</p>
          </div>

          {children}

          <div className="mt-6 text-xs text-slate-400 font-normal flex items-center justify-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secured by Better Auth
          </div>

          <div className="md:hidden mt-8 text-xs text-slate-400 font-normal">&copy; {getCurrentYear()} AutoSocial Inc.</div>
        </div>
      </div>
    </div>
  );
}
