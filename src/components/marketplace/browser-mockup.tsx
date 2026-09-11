import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Mac-style browser frame used as the visual anchor for template previews. */
export function BrowserMockup({
  url = "apnacodex.com/demo",
  children,
  className,
  compact = false,
}: {
  url?: string;
  children: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border-strong bg-surface shadow-[var(--shadow-elevated)]",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 border-b border-border bg-surface-2/90 px-3",
          compact ? "h-7" : "h-9",
        )}
      >
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-2 w-2 rounded-full bg-destructive/60" />
          <span className="h-2 w-2 rounded-full bg-warning/60" />
          <span className="h-2 w-2 rounded-full bg-success/60" />
        </div>
        <div className="mx-auto hidden max-w-[60%] truncate rounded-md bg-background/70 px-3 py-0.5 font-mono text-[10px] text-muted-foreground sm:block">
          {url}
        </div>
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
