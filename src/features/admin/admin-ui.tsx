import { Link } from "@tanstack/react-router";
import { AlertTriangle, PlugZap, RotateCcw, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { BrowserMockup } from "@/components/marketplace/browser-mockup";
import { ProductScreenshot } from "@/components/marketplace/product-screenshot";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminProduct, PaymentStatus, ProductStatus } from "@/lib/admin/types";
import type { PreviewKind, Tint } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";
import type { AdminPath } from "./nav";

/* ------------------------------------------------------------ page header */

export function AdminBreadcrumbs({
  items,
}: {
  items: { label: string; to?: AdminPath | undefined }[];
}) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <li>
          <Link to="/admin" className="transition-colors hover:text-foreground">
            Back office
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-1.5">
            <span aria-hidden>/</span>
            {item.to ? (
              <Link to={item.to} className="transition-colors hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function AdminPageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  eyebrow,
}: {
  title: string;
  description: string;
  breadcrumbs: { label: string; to?: AdminPath | undefined }[];
  actions?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <header className="border-b border-border pb-5">
      <AdminBreadcrumbs items={breadcrumbs} />
      <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
          <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
    </header>
  );
}

/* --------------------------------------------------------------- surfaces */

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

export function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/70 py-2 last:border-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

/* ------------------------------------------------------------- stat cards */

export function AdminStatCard({
  label,
  value,
  hint,
  icon: Icon,
  delta,
  to,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  delta?: number | undefined;
  to?: AdminPath | undefined;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between">
        <span className="eyebrow">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
      </div>
      <p className="mt-4 font-display text-[1.75rem] font-semibold leading-none tracking-tight tabular-nums">
        {value}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {typeof delta === "number" && (
          <span
            className={cn(
              "rounded border px-1.5 py-0.5 font-mono text-[10px]",
              delta >= 0
                ? "border-success/35 bg-success/10 text-success"
                : "border-warning/40 bg-warning/10 text-warning",
            )}
          >
            {delta >= 0 ? "+" : ""}
            {delta}% vs prior
          </span>
        )}
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
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

/* ----------------------------------------------------------- status badge */

export type Tone = "success" | "warning" | "danger" | "neutral" | "brand" | "info";

const toneClass: Record<Tone, string> = {
  success: "border-success/35 bg-success/12 text-success",
  warning: "border-warning/40 bg-warning/12 text-warning",
  danger: "border-destructive/40 bg-destructive/12 text-destructive",
  neutral: "border-border-strong bg-surface-2 text-muted-foreground",
  brand: "border-brand/40 bg-brand/12 text-brand",
  info: "border-cyan/40 bg-cyan/12 text-cyan",
};

/** Status is carried by text (plus optional glyph), never colour alone. */
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
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-[11px] font-medium",
        toneClass[tone],
        className,
      )}
    >
      {Icon && <Icon className="h-3 w-3" aria-hidden />}
      {children}
    </span>
  );
}

export const productStatusTone: Record<ProductStatus, Tone> = {
  published: "success",
  draft: "warning",
  archived: "neutral",
};

export const productStatusLabel: Record<ProductStatus, string> = {
  published: "Published",
  draft: "Draft",
  archived: "Archived",
};

export const paymentStatusTone: Record<PaymentStatus, Tone> = {
  succeeded: "success",
  pending: "warning",
  failed: "danger",
  refunded: "info",
};

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  succeeded: "Succeeded",
  pending: "Pending",
  failed: "Failed",
  refunded: "Refunded",
};

/* --------------------------------------------------------------- filter bar */

export function FilterBar({
  search,
  onSearchChange,
  placeholder,
  label,
  children,
  trailing,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  placeholder: string;
  label: string;
  children?: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          aria-label={label}
          className="pl-9"
        />
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
      {trailing && <div className="flex shrink-0 items-center gap-2 lg:ml-auto">{trailing}</div>}
    </div>
  );
}

/* -------------------------------------------------------------- data table */

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  selectedIds,
  onToggleRow,
  onToggleAll,
  mobileRow,
  caption,
}: {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  selectedIds?: string[] | undefined;
  onToggleRow?: ((id: string, next: boolean) => void) | undefined;
  onToggleAll?: ((next: boolean) => void) | undefined;
  mobileRow?: ((row: T) => ReactNode) | undefined;
  caption?: string;
}) {
  const selectable = !!selectedIds && !!onToggleRow;
  const allSelected =
    selectable && rows.length > 0 && rows.every((r) => selectedIds!.includes(getRowId(r)));

  return (
    <>
      <div className={cn("overflow-x-auto", mobileRow && "hidden lg:block")}>
        <table className="w-full min-w-full text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead>
            <tr className="border-b border-border text-left">
              {selectable && (
                <th scope="col" className="w-10 px-4 py-2.5">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={(v) => onToggleAll?.(v === true)}
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn("eyebrow px-4 py-2.5 text-[0.625rem]", col.headerClassName)}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => {
              const id = getRowId(row);
              const checked = selectable && selectedIds!.includes(id);
              return (
                <tr
                  key={id}
                  className={cn(
                    "transition-colors hover:bg-surface-2/30",
                    checked && "bg-brand/[0.06]",
                  )}
                >
                  {selectable && (
                    <td className="px-4 py-3 align-middle">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => onToggleRow?.(id, v === true)}
                        aria-label={`Select row ${id}`}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-4 py-3 align-middle", col.className)}>
                      {col.cell(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {mobileRow && (
        <ul className="divide-y divide-border lg:hidden">
          {rows.map((row) => (
            <li key={getRowId(row)} className="p-4">
              {mobileRow(row)}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/* ------------------------------------------------------------ confirm dialog */

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  destructive,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={destructive ? "bg-destructive text-destructive-foreground" : undefined}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* ------------------------------------------------------------- thumbnails */

export function AdminThumb({
  preview,
  tint,
  slug,
  className,
}: {
  preview: PreviewKind;
  tint: Tint;
  slug: string;
  className?: string;
}) {
  return (
    <BrowserMockup compact url={`${slug}.devassets.io`} className={cn("h-full", className)}>
      <div className="aspect-[16/9.2]">
        <ProductScreenshot kind={preview} tint={tint} />
      </div>
    </BrowserMockup>
  );
}

export function ProductCell({ product }: { product: AdminProduct }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="hidden w-24 shrink-0 xl:block">
        <AdminThumb preview={product.preview} tint={product.tint} slug={product.slug} />
      </div>
      <div className="min-w-0">
        <Link
          to="/admin/products/$productId"
          params={{ productId: product.id }}
          className="block truncate text-sm font-medium transition-colors hover:text-brand"
        >
          {product.name}
        </Link>
        <p className="truncate font-mono text-[11px] text-muted-foreground">/{product.slug}</p>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- notices */

export function NotConnectedBanner({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div
      role="note"
      className="flex flex-wrap items-start gap-3 rounded-lg border border-warning/35 bg-warning/[0.07] px-4 py-3"
    >
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md border border-warning/40 bg-warning/10 text-warning">
        <PlugZap className="h-3.5 w-3.5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}

export function DemoNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "rounded-md border border-border bg-surface-2/50 px-3 py-2 text-xs leading-relaxed text-muted-foreground",
        className,
      )}
    >
      {children}
    </p>
  );
}

/* ----------------------------------------------------------------- states */

export function ErrorState({
  title = "We couldn't load this",
  description = "Demo workspace data failed to load in this browser session. Try again.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-lg border border-dashed border-destructive/40 bg-destructive/5 px-6 py-12 text-center"
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

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 py-3.5">
          {Array.from({ length: cols }).map((__, c) => (
            <Skeleton key={c} className={cn("h-3.5", c === 0 ? "w-1/3" : "flex-1")} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-5 h-7 w-16" />
          <Skeleton className="mt-3 h-3 w-24" />
        </div>
      ))}
    </div>
  );
}
