import { Link } from "@tanstack/react-router";
import { ArrowUpRight, BadgeCheck, Download, RefreshCw } from "lucide-react";

import { TechBadge } from "@/components/marketplace/tech-badge";
import { Button } from "@/components/ui/button";
import { ProductThumb, StatusBadge } from "./account-ui";
import { categoryBySlug } from "@/lib/catalog/categories";
import { formatDate, formatPrice } from "@/lib/catalog/service";
import { licenseById } from "@/lib/catalog/licenses";
import type { Purchase } from "@/lib/account/types";
import type { Product } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

export interface LibraryEntry {
  purchase: Purchase;
  product: Product;
  updateAvailable: boolean;
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="eyebrow text-[0.625rem]">{label}</dt>
      <dd className="mt-0.5 truncate text-xs font-medium">{value}</dd>
    </div>
  );
}

/** Grid presentation of an owned product. */
export function ProductLibraryCard({
  entry,
  onDownload,
  className,
}: {
  entry: LibraryEntry;
  onDownload: (entry: LibraryEntry) => void;
  className?: string;
}) {
  const { purchase, product, updateAvailable } = entry;
  const category = categoryBySlug(product.categorySlug);

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-border-strong",
        className,
      )}
    >
      <div className="border-b border-border bg-surface-2 p-3">
        <div className="relative overflow-hidden rounded-md">
          <div className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]">
            <ProductThumb product={product} />
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="eyebrow truncate">{category?.name ?? "Template"}</span>
          <StatusBadge tone="success" icon={BadgeCheck}>
            Owned
          </StatusBadge>
        </div>

        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold tracking-tight">
            <Link
              to="/templates/$slug"
              params={{ slug: product.slug }}
              className="transition-colors hover:text-brand"
            >
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {product.tagline}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-md border border-border bg-surface-2/40 p-3">
          <MetaRow label="Purchased" value={formatDate(purchase.purchasedAt)} />
          <MetaRow label="License" value={licenseById(purchase.license).name} />
          <MetaRow label="Your version" value={`v${purchase.ownedVersion}`} />
          <MetaRow label="Paid" value={formatPrice(purchase.pricePaid)} />
        </dl>

        <div className="flex flex-wrap items-center gap-1.5">
          {updateAvailable ? (
            <StatusBadge tone="brand" icon={RefreshCw}>
              Update to v{product.version}
            </StatusBadge>
          ) : (
            <StatusBadge tone="neutral">Up to date</StatusBadge>
          )}
          {product.tech.slice(0, 2).map((t) => (
            <TechBadge key={t} label={t} />
          ))}
        </div>

        <div className="mt-auto grid grid-cols-2 gap-2 border-t border-border pt-4">
          <Button size="sm" variant="brand" onClick={() => onDownload(entry)}>
            <Download /> Download
          </Button>
          <Button asChild size="sm" variant="subtle">
            <Link to="/templates/$slug" params={{ slug: product.slug }}>
              View product <ArrowUpRight />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

/** Compact list presentation of the same entry. */
export function PurchaseRow({
  entry,
  onDownload,
}: {
  entry: LibraryEntry;
  onDownload: (entry: LibraryEntry) => void;
}) {
  const { purchase, product, updateAvailable } = entry;
  const category = categoryBySlug(product.categorySlug);

  return (
    <article className="flex flex-col gap-4 px-4 py-4 transition-colors hover:bg-surface-2/30 sm:flex-row sm:items-center sm:px-5">
      <div className="w-full shrink-0 sm:w-40">
        <ProductThumb product={product} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-sm font-semibold tracking-tight">
            <Link
              to="/templates/$slug"
              params={{ slug: product.slug }}
              className="transition-colors hover:text-brand"
            >
              {product.name}
            </Link>
          </h3>
          <StatusBadge tone="success" icon={BadgeCheck}>
            Owned
          </StatusBadge>
          {updateAvailable && (
            <StatusBadge tone="brand" icon={RefreshCw}>
              v{product.version} available
            </StatusBadge>
          )}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {category?.name ?? "Template"} · Purchased {formatDate(purchase.purchasedAt)} ·{" "}
          {licenseById(purchase.license).name} license · Your build v{purchase.ownedVersion}
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        <Button size="sm" variant="brand" onClick={() => onDownload(entry)}>
          <Download /> Download
        </Button>
        <Button asChild size="sm" variant="subtle">
          <Link to="/templates/$slug" params={{ slug: product.slug }}>
            View
          </Link>
        </Button>
      </div>
    </article>
  );
}
