import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface PopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "start" | "end" | "center";
  className?: string;
  panelClassName?: string;
}

/**
 * Portal-based popover for the Create Post cards.
 *
 * The composer cards use `overflow-hidden`, which would clip a normal
 * absolutely-positioned dropdown. This popover renders its panel through a
 * portal to document.body and pins it with fixed coordinates measured from
 * the trigger, so it is never clipped.
 */
export function Popover({
  open,
  onOpenChange,
  trigger,
  children,
  align = "start",
  className,
  panelClassName,
}: PopoverProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number; minWidth: number } | null>(
    null,
  );

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  const position = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const panelWidth = panelRef.current?.offsetWidth || rect.width;
    let left = rect.left;
    if (align === "end") left = rect.right - panelWidth;
    else if (align === "center") left = rect.left + rect.width / 2 - panelWidth / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - panelWidth - 8));
    const panelHeight = panelRef.current?.offsetHeight || 0;
    const top =
      rect.bottom + panelHeight + 8 > window.innerHeight
        ? rect.top - panelHeight - 6
        : rect.bottom + 6;
    setCoords({ top, left, minWidth: Math.max(rect.width, panelWidth) });
  }, [align]);

  useLayoutEffect(() => {
    if (open) position();
  }, [open, position]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onScrollOrResize = () => position();

    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);

    let pointerDownHandler: ((e: MouseEvent) => void) | null = null;
    const timer = window.setTimeout(() => {
      pointerDownHandler = (e: MouseEvent) => {
        const target = e.target as Node;
        if (triggerRef.current?.contains(target)) return;
        if (panelRef.current?.contains(target)) return;
        close();
      };
      document.addEventListener("mousedown", pointerDownHandler);
    }, 0);

    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.clearTimeout(timer);
      if (pointerDownHandler) document.removeEventListener("mousedown", pointerDownHandler);
    };
  }, [open, close, position]);

  return (
    <div ref={triggerRef} className={cn("relative inline-flex", className)}>
      {trigger}
      {open &&
        createPortal(
          <div
            ref={panelRef}
            style={{
              position: "fixed",
              top: coords ? `${coords.top}px` : "-9999px",
              left: coords ? `${coords.left}px` : "-9999px",
              minWidth: coords ? `${coords.minWidth}px` : undefined,
            }}
            className={cn(
              "z-[60] rounded-2xl border border-gray-200 bg-white p-1.5 shadow-xl shadow-black/10",
              panelClassName,
            )}
          >
            {children}
          </div>,
          document.body,
        )}
    </div>
  );
}
