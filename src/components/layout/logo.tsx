import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn("group flex shrink-0 items-center gap-2.5", className)}
      aria-label="ApnaCodex home"
    >
      <span className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-lg bg-brand-gradient">
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
          <path
            d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z"
            fill="none"
            stroke="var(--brand-foreground)"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M12 12v9M12 12 4 7.5M12 12l8-4.5"
            fill="none"
            stroke="var(--brand-foreground)"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="font-display text-[1.0625rem] font-semibold tracking-tight">
        Apna<span className="text-brand">Codex</span>
      </span>
    </Link>
  );
}
