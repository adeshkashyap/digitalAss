import { Link } from "@tanstack/react-router";
import { AlertTriangle, RotateCcw } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Breadcrumbs } from "@/components/marketplace/breadcrumbs";
import { BrowserMockup } from "@/components/marketplace/browser-mockup";
import { ProductScreenshot } from "@/components/marketplace/product-screenshot";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrderStatus } from "@/lib/account/types";
import type { Product } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------ page header */

export function AccountPageHeader({
  title,
  description,
  breadcrumb,
  actions,
  eyebrow,
}: {
  title: string;
  description: string;
  breadcrumb: string;
  actions?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <header className="border-b border-border pb-6">
      <Breadcrumbs items={[{ label: "Account", to: "/account" }, { label: breadcrumb }]} />
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
    </header>
  );
}

/* -------------------------------------------------------------- surfaces */

export function Panel({
  children,
  className,
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article";
}) {
  return <Tag className={cn("rounded-lg border border-border bg-card", className)}>{children}</Tag>;
}

export function PanelHeader({
  title,
  description,
  action,
  icon: Icon,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border bg-surface-2 text-muted-foreground">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          {description && (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

/* ------------------------------------------------------------- stat card */

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  to,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: LucideIcon;
  to?: AccountLinkTo;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between">
        <span className="eyebrow">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
      </div>
      <p className="mt-4 font-display text-3xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-border-strong hover:bg-surface-2/40"
      >
        {body}
      </Link>
    );
  }
  return <div className="rounded-lg border border-border bg-card p-5">{body}</div>;
}

type AccountLinkTo =
  | "/account"
  | "/account/purchases"
  | "/account/downloads"
  | "/account/wishlist"
  | "/account/orders"
  | "/account/licenses"
  | "/account/profile"
  | "/account/notifications"
  | "/account/support";

/* ----------------------------------------------------------- status badge */

type Tone = "success" | "warning" | "danger" | "neutral" | "brand" | "info";

const toneClass: Record<Tone, string> = {
  success: "border-success/35 bg-success/12 text-success",
  warning: "border-warning/40 bg-warning/12 text-warning",
  danger: "border-destructive/40 bg-destructive/12 text-destructive",
  neutral: "border-border-strong bg-surface-2 text-muted-foreground",
  brand: "border-brand/40 bg-brand/12 text-brand",
  info: "border-cyan/40 bg-cyan/12 text-cyan",
};

/** Status is carried by an icon glyph plus text, never colour alone. */
export function StatusBadge({
  tone = "neutral",
  children,
  icon: Icon,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium",
        toneClass[tone],
        className,
      )}
    >
      {Icon && <Icon className="h-3 w-3" aria-hidden />}
      {children}
    </span>
  );
}

export const orderStatusTone: Record<OrderStatus, Tone> = {
  paid: "success",
  pending: "warning",
  failed: "danger",
  refunded: "info",
  cancelled: "neutral",
};

export const orderStatusLabel: Record<OrderStatus, string> = {
  paid: "Paid",
  pending: "Pending",
  failed: "Failed",
  refunded: "Refunded",
  cancelled: "Cancelled",
};

/* --------------------------------------------------------- product thumb */

export function ProductThumb({
  product,
  className,
  frame = true,
}: {
  product: Product;
  className?: string;
  frame?: boolean;
}) {
  const screenshot = <ProductScreenshot kind={product.preview} tint={product.tint} />;
  if (!frame) {
    return (
      <div className={cn("overflow-hidden rounded-md border border-border", className)}>
        {screenshot}
      </div>
    );
  }
  return (
    <BrowserMockup compact url={`${product.slug}.devassets.io`} className={cn("h-full", className)}>
      <div className="aspect-[16/9.2]">{screenshot}</div>
    </BrowserMockup>
  );
}

/* --------------------------------------------------------- states: error */

export function ErrorState({
  title = "We couldn't load this",
  description = "Sample account data failed to load in this browser session. Try again.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-lg border border-dashed border-destructive/40 bg-destructive/5 px-6 py-14 text-center"
    >
      <span className="grid h-11 w-11 place-items-center rounded-xl border border-destructive/30 bg-surface text-destructive">
        <AlertTriangle className="h-5 w-5" aria-hidden />
      </span>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      <Button variant="subtle" size="sm" className="mt-5" onClick={onRetry}>
        <RotateCcw /> Retry
      </Button>
    </div>
  );
}

/* ------------------------------------------------------- states: loading */

export function RowsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <Skeleton className="h-12 w-20 shrink-0 rounded-md" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-24 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function CardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-3">
          <Skeleton className="aspect-[16/10] w-full rounded-md" />
          <div className="space-y-2 p-2 pt-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-5 h-8 w-16" />
          <Skeleton className="mt-2 h-3 w-28" />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------ demo notice */

export function DemoNote(_props: { children: ReactNode; className?: string }) {
  return null;
}
