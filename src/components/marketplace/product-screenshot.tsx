import type { ReactElement, ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { PreviewKind, Tint } from "@/lib/catalog/types";

/**
 * CSS-composed template previews. No external image URLs, so nothing breaks
 * and every product reads as a distinct interface rather than stock art.
 */

const tintClass: Record<Tint, string> = {
  indigo: "tint-indigo",
  violet: "tint-violet",
  cyan: "tint-cyan",
  amber: "tint-amber",
  emerald: "tint-emerald",
  rose: "tint-rose",
  slate: "tint-slate",
};

const bar = "rounded-full bg-foreground/12";
const block = "rounded-md border border-border/70 bg-surface/80";
const tinted = "rounded-md";

function Chrome({ children }: { children: ReactNode }) {
  return <div className="h-full w-full p-3 sm:p-4">{children}</div>;
}

function Sparkline() {
  return (
    <svg viewBox="0 0 200 60" className="h-full w-full" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="da-spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--tint)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--tint)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 46 L24 38 L48 42 L72 26 L96 30 L120 14 L144 22 L168 8 L200 16 L200 60 L0 60 Z"
        fill="url(#da-spark)"
      />
      <path
        d="M0 46 L24 38 L48 42 L72 26 L96 30 L120 14 L144 22 L168 8 L200 16"
        fill="none"
        stroke="var(--tint)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Bars() {
  const heights = [40, 66, 52, 78, 34, 88, 60, 72];
  return (
    <div className="flex h-full items-end gap-1.5">
      {heights.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm"
          style={{
            height: `${h}%`,
            background: i % 3 === 0 ? "var(--tint)" : "var(--tint-2)",
            opacity: i % 3 === 0 ? 0.9 : 0.4,
          }}
        />
      ))}
    </div>
  );
}

function DashboardPreview() {
  return (
    <Chrome>
      <div className="flex h-full gap-3">
        <div className="hidden w-1/6 flex-col gap-2 sm:flex">
          <div className="h-2 w-3/4 rounded-full" style={{ background: "var(--tint)" }} />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={cn(bar, "h-1.5", i === 1 ? "w-full" : "w-2/3")} />
          ))}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className={cn(block, "space-y-1.5 p-2")}>
                <div className={cn(bar, "h-1 w-1/2")} />
                <div
                  className="h-2 w-2/3 rounded-full"
                  style={{ background: i === 0 ? "var(--tint)" : undefined }}
                />
                {i !== 0 && <div className={cn(bar, "h-2 w-2/3 -mt-2")} />}
              </div>
            ))}
          </div>
          <div className={cn(block, "flex-1 p-2")}>
            <div className="h-full min-h-8">
              <Sparkline />
            </div>
          </div>
          <div className={cn(block, "space-y-1.5 p-2")}>
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-sm" style={{ background: "var(--tint-2)" }} />
                <div className={cn(bar, "h-1.5 flex-1")} />
                <div className={cn(bar, "h-1.5 w-8")} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Chrome>
  );
}

function AnalyticsPreview() {
  return (
    <Chrome>
      <div className="flex h-full flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="h-2 w-24 rounded-full" style={{ background: "var(--tint)" }} />
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className={cn(bar, "h-3 w-8")} />
            ))}
          </div>
        </div>
        <div className={cn(block, "h-2/5 p-2")}>
          <Bars />
        </div>
        <div className="grid flex-1 grid-cols-3 gap-2">
          <div className={cn(block, "col-span-2 p-2")}>
            <Sparkline />
          </div>
          <div className={cn(block, "flex items-center justify-center p-2")}>
            <div
              className="aspect-square w-full max-w-14 rounded-full"
              style={{
                background:
                  "conic-gradient(var(--tint) 0 62%, var(--tint-2) 62% 84%, var(--chart-neutral) 84% 100%)",
              }}
            />
          </div>
        </div>
      </div>
    </Chrome>
  );
}

function HospitalityPreview() {
  return (
    <Chrome>
      <div className="flex h-full flex-col gap-2">
        <div
          className={cn(tinted, "relative h-1/2 overflow-hidden")}
          style={{
            background: `linear-gradient(140deg, var(--tint) 0%, var(--tint-2) 100%)`,
          }}
        >
          <div className="absolute inset-x-3 bottom-3 space-y-1.5">
            <div className="h-2.5 w-2/3 rounded-full bg-background/70" />
            <div className="h-1.5 w-1/3 rounded-full bg-background/45" />
          </div>
          <div className="absolute right-3 top-3 h-4 w-16 rounded-full bg-background/60" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className={cn(block, "space-y-1.5 p-1.5")}>
              <div
                className="h-6 rounded-sm"
                style={{ background: "var(--tint-2)", opacity: 0.35 + i * 0.15 }}
              />
              <div className={cn(bar, "h-1.5 w-3/4")} />
              <div className={cn(bar, "h-1.5 w-1/2")} />
            </div>
          ))}
        </div>
        <div className={cn(block, "flex items-center gap-2 p-2")}>
          <div className={cn(bar, "h-2 flex-1")} />
          <div className="h-4 w-12 rounded-sm" style={{ background: "var(--tint)" }} />
        </div>
      </div>
    </Chrome>
  );
}

function RestaurantPreview() {
  return (
    <Chrome>
      <div className="flex h-full gap-2">
        <div
          className={cn(tinted, "w-2/5")}
          style={{ background: `linear-gradient(180deg, var(--tint) 0%, var(--tint-2) 100%)` }}
        />
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-2.5 w-2/3 rounded-full" style={{ background: "var(--tint)" }} />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-baseline gap-2">
              <div className={cn(bar, i % 2 ? "h-1.5 w-1/2" : "h-1.5 w-2/3")} />
              <div className="h-px flex-1 bg-border" />
              <div className={cn(bar, "h-1.5 w-6")} />
            </div>
          ))}
          <div className="mt-auto flex gap-2">
            <div className="h-4 flex-1 rounded-sm" style={{ background: "var(--tint)" }} />
            <div className={cn(bar, "h-4 flex-1")} />
          </div>
        </div>
      </div>
    </Chrome>
  );
}

function EducationPreview() {
  return (
    <Chrome>
      <div className="flex h-full flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-sm" style={{ background: "var(--tint)" }} />
          <div className={cn(bar, "h-1.5 w-20")} />
          <div className="ml-auto flex gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className={cn(bar, "h-1.5 w-8")} />
            ))}
          </div>
        </div>
        <div
          className={cn(tinted, "relative h-1/3 overflow-hidden")}
          style={{ background: `linear-gradient(120deg, var(--tint) 0%, var(--tint-2) 100%)` }}
        >
          <div className="absolute inset-x-3 bottom-2 h-2 w-1/2 rounded-full bg-background/70" />
        </div>
        <div className="grid flex-1 grid-cols-2 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={cn(block, "space-y-1.5 p-2")}>
              <div
                className="h-1.5 w-1/3 rounded-full"
                style={{ background: i % 2 ? "var(--tint-2)" : "var(--tint)" }}
              />
              <div className={cn(bar, "h-1.5 w-full")} />
              <div className={cn(bar, "h-1.5 w-2/3")} />
            </div>
          ))}
        </div>
      </div>
    </Chrome>
  );
}

function EcommercePreview() {
  return (
    <Chrome>
      <div className="flex h-full gap-2">
        <div className="hidden w-1/5 flex-col gap-1.5 sm:flex">
          <div className="h-1.5 w-2/3 rounded-full" style={{ background: "var(--tint)" }} />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={cn(bar, "h-1.5", i === 0 ? "w-full" : "w-3/4")} />
          ))}
          <div className="mt-2 h-1 w-full rounded-full bg-border" />
          <div className={cn(bar, "h-1.5 w-1/2")} />
        </div>
        <div className="grid flex-1 grid-cols-3 grid-rows-2 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={cn(block, "flex flex-col gap-1 p-1.5")}>
              <div
                className="flex-1 rounded-sm"
                style={{
                  background: i % 2 ? "var(--tint-2)" : "var(--tint)",
                  opacity: 0.25 + (i % 3) * 0.2,
                }}
              />
              <div className={cn(bar, "h-1 w-3/4")} />
              <div className={cn(bar, "h-1 w-1/3")} />
            </div>
          ))}
        </div>
      </div>
    </Chrome>
  );
}

function CorporatePreview() {
  return (
    <Chrome>
      <div className="flex h-full flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="h-2 w-16 rounded-full" style={{ background: "var(--tint)" }} />
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={cn(bar, "h-1.5 w-7")} />
            ))}
          </div>
        </div>
        <div className="flex flex-1 gap-2">
          <div className="flex w-1/2 flex-col justify-center gap-1.5">
            <div className="h-3 w-full rounded-full bg-foreground/20" />
            <div className="h-3 w-4/5 rounded-full bg-foreground/20" />
            <div className={cn(bar, "mt-1 h-1.5 w-full")} />
            <div className={cn(bar, "h-1.5 w-3/4")} />
            <div className="mt-1 h-4 w-16 rounded-sm" style={{ background: "var(--tint)" }} />
          </div>
          <div
            className={cn(tinted, "flex-1")}
            style={{ background: `linear-gradient(135deg, var(--tint) 0%, var(--tint-2) 100%)` }}
          />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={cn(block, "space-y-1 p-1.5")}>
              <div className={cn(bar, "h-1 w-1/2")} />
              <div className={cn(bar, "h-1.5 w-full")} />
            </div>
          ))}
        </div>
      </div>
    </Chrome>
  );
}

function LandingPreview() {
  return (
    <Chrome>
      <div className="flex h-full flex-col items-center gap-2 text-center">
        <div className="flex w-full items-center justify-between">
          <div className="h-2 w-12 rounded-full" style={{ background: "var(--tint)" }} />
          <div className={cn(bar, "h-3 w-12")} />
        </div>
        <div className="mt-2 h-1.5 w-20 rounded-full" style={{ background: "var(--tint-2)" }} />
        <div className="h-3.5 w-4/5 rounded-full bg-foreground/22" />
        <div className="h-3.5 w-3/5 rounded-full bg-foreground/22" />
        <div className={cn(bar, "h-1.5 w-2/3")} />
        <div className="flex gap-2">
          <div className="h-4 w-16 rounded-sm" style={{ background: "var(--tint)" }} />
          <div className={cn(bar, "h-4 w-14")} />
        </div>
        <div
          className={cn(tinted, "mt-1 w-full flex-1 border border-border")}
          style={{
            background: `linear-gradient(160deg, var(--tint) 0%, transparent 70%)`,
          }}
        />
      </div>
    </Chrome>
  );
}

function PortfolioPreview() {
  return (
    <Chrome>
      <div className="flex h-full flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <div className="h-3 w-24 rounded-full bg-foreground/25" />
          <div className={cn(bar, "h-1.5 w-10")} />
        </div>
        <div className="grid flex-1 grid-cols-3 gap-2">
          <div
            className={cn(tinted, "col-span-2 row-span-2")}
            style={{ background: `linear-gradient(140deg, var(--tint) 0%, var(--tint-2) 100%)` }}
          />
          <div className={cn(tinted, "bg-foreground/10")} />
          <div className={cn(tinted)} style={{ background: "var(--tint-2)", opacity: 0.5 }} />
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(bar, "h-1.5 w-1/3")} />
          <div className="h-px flex-1 bg-border" />
          <div className={cn(bar, "h-1.5 w-10")} />
        </div>
      </div>
    </Chrome>
  );
}

const previews: Record<PreviewKind, () => ReactElement> = {
  dashboard: DashboardPreview,
  analytics: AnalyticsPreview,
  hospitality: HospitalityPreview,
  restaurant: RestaurantPreview,
  education: EducationPreview,
  ecommerce: EcommercePreview,
  corporate: CorporatePreview,
  landing: LandingPreview,
  portfolio: PortfolioPreview,
};

export function ProductScreenshot({
  kind,
  tint,
  className,
}: {
  kind: PreviewKind;
  tint: Tint;
  className?: string;
}) {
  const Preview = previews[kind] ?? DashboardPreview;
  return (
    <div
      className={cn(
        tintClass[tint],
        "relative h-full w-full overflow-hidden bg-surface-2",
        className,
      )}
      aria-hidden
    >
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(120% 100% at 100% 0%, var(--tint-2) 0%, transparent 55%), radial-gradient(80% 80% at 0% 100%, var(--tint) 0%, transparent 60%)",
          opacity: 0.14,
        }}
      />
      <div className="relative h-full w-full">
        <Preview />
      </div>
    </div>
  );
}
