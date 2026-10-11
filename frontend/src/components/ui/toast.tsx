import { Check, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastKind = "success" | "error" | "info";

/**
 * The single app-wide toast convention: top-right dark pill, auto-dismissed
 * by the caller. Replaces the ad-hoc bottom-positioned variants.
 */
export function Toast({
  kind,
  message,
  className,
}: {
  kind: ToastKind;
  message: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed top-6 right-6 z-50 bg-slate-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-200",
        className
      )}
    >
      {kind === "success" && <Check className="w-4 h-4 text-primary-300 shrink-0" strokeWidth={2.5} />}
      {kind === "error" && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" strokeWidth={2.5} />}
      {kind === "info" && <Info className="w-4 h-4 text-primary-300 shrink-0" strokeWidth={2.5} />}
      <span>{message}</span>
    </div>
  );
}
