import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutGrid, List, Package, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/marketplace/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AccountPageHeader, CardsSkeleton, ErrorState, Panel } from "@/features/account/account-ui";
import { ProductLibraryCard, PurchaseRow } from "@/features/account/library-card";
import type { LibraryEntry } from "@/features/account/library-card";
import { useDownloadAction } from "@/features/account/use-download";
import { purchasesQuery } from "@/lib/account/queries";
import { purchaseHasUpdate } from "@/lib/account/service";
import { useProductsByIds } from "@/lib/catalog/use-products-by-ids";
import { licenseById } from "@/lib/catalog/licenses";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account/purchases")({
  head: () => ({
    meta: [
      { title: "My purchases — ApnaCodex account" },
      {
        name: "description",
        content: "Every template you own, with license, version and download details.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PurchasesPage,
});

type TabKey = "all" | "recent" | "updated" | "archived";
type SortKey = "purchased" | "name" | "updated";

const tabs: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "recent", label: "Recent" },
  { key: "updated", label: "Updates available" },
  { key: "archived", label: "Archived" },
];

function PurchasesPage() {
  const purchasesQ = useQuery(purchasesQuery());
  const { download, pendingFileId } = useDownloadAction();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<TabKey>("all");
  const [sort, setSort] = useState<SortKey>("purchased");
  const [view, setView] = useState<"grid" | "list">("grid");

  const productIds = useMemo(
    () => (purchasesQ.data ?? []).map((p) => p.productId),
    [purchasesQ.data],
  );
  const { productsById } = useProductsByIds(productIds);

  const entries = useMemo<LibraryEntry[]>(
    () =>
      (purchasesQ.data ?? [])
        .map((purchase) => {
          const product = productsById.get(purchase.productId);
          return product
            ? { purchase, product, updateAvailable: purchaseHasUpdate(purchase) }
            : null;
        })
        .filter((e): e is LibraryEntry => e !== null),
    [purchasesQ.data, productsById],
  );

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    const cutoff = Date.now() - 1000 * 60 * 60 * 24 * 120;

    const filtered = entries.filter((e) => {
      if (tab === "archived" ? !e.purchase.archived : !!e.purchase.archived) return false;
      if (tab === "recent" && new Date(e.purchase.purchasedAt).getTime() < cutoff) return false;
      if (tab === "updated" && !e.updateAvailable) return false;
      if (!term) return true;
      return [
        e.product.name,
        e.product.tagline,
        licenseById(e.purchase.license).name,
        ...e.product.tech,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });

    return filtered.sort((a, b) => {
      if (sort === "name") return a.product.name.localeCompare(b.product.name);
      if (sort === "updated") return b.product.updatedAt.localeCompare(a.product.updatedAt);
      return b.purchase.purchasedAt.localeCompare(a.purchase.purchasedAt);
    });
  }, [entries, search, sort, tab]);

  const onDownload = ({ purchase, product }: LibraryEntry) =>
    download(purchase.id, purchase.productId, {
      id: `${product.slug}-source-${product.version}`,
      kind: "source",
      label: "Source code",
      fileName: `${product.slug}-v${product.version}-source.zip`,
      fileType: "ZIP",
      size: "18.0 MB",
      version: product.version,
    });

  return (
    <div className="space-y-6">
      <AccountPageHeader
        breadcrumb="Purchases"
        title="My purchases"
        description="Your owned templates with license, purchase date and version entitlement. Search and filters run against your library."
        actions={
          <Button asChild variant="subtle">
            <Link to="/account/downloads">Go to downloads</Link>
          </Button>
        }
      />

      {/* Controls */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your purchases"
            aria-label="Search your purchases"
            className="pl-9 pr-9"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-[11.5rem]" aria-label="Sort purchases">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="purchased">Purchase date</SelectItem>
              <SelectItem value="name">Name A–Z</SelectItem>
              <SelectItem value="updated">Recently updated</SelectItem>
            </SelectContent>
          </Select>

          <div
            role="group"
            aria-label="Layout"
            className="flex items-center gap-1 rounded-md border border-border bg-surface-2/60 p-0.5"
          >
            {(
              [
                ["grid", LayoutGrid, "Grid view"],
                ["list", List, "List view"],
              ] as const
            ).map(([key, Icon, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setView(key)}
                aria-pressed={view === key}
                aria-label={label}
                className={cn(
                  "grid h-7 w-7 place-items-center rounded transition-colors",
                  view === key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
              tab === t.key
                ? "border-brand/45 bg-brand/12 text-brand"
                : "border-border bg-surface-2/50 text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
        <p className="ml-auto self-center text-xs text-muted-foreground">
          {purchasesQ.isPending
            ? "Loading library…"
            : `${visible.length} of ${entries.length} template${entries.length === 1 ? "" : "s"}`}
        </p>
      </div>

      {purchasesQ.isPending ? (
        <CardsSkeleton count={6} />
      ) : purchasesQ.isError ? (
        <ErrorState onRetry={() => void purchasesQ.refetch()} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<Package className="h-5 w-5" />}
          title={entries.length === 0 ? "No purchases yet" : "No purchases match these filters"}
          description={
            entries.length === 0
              ? "Templates you buy appear here with license details and downloadable files."
              : "Try a different search term, or switch back to the All tab."
          }
          action={
            entries.length === 0 ? (
              <Button asChild variant="brand">
                <Link to="/templates">Browse marketplace</Link>
              </Button>
            ) : (
              <Button
                variant="subtle"
                onClick={() => {
                  setSearch("");
                  setTab("all");
                }}
              >
                Clear filters
              </Button>
            )
          }
        />
      ) : view === "grid" ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((entry) => (
            <ProductLibraryCard key={entry.purchase.id} entry={entry} onDownload={onDownload} />
          ))}
        </div>
      ) : (
        <Panel className="overflow-hidden">
          <div className="divide-y divide-border">
            {visible.map((entry) => (
              <PurchaseRow key={entry.purchase.id} entry={entry} onDownload={onDownload} />
            ))}
          </div>
        </Panel>
      )}

      {pendingFileId && (
        <p className="sr-only" role="status">
          Preparing download
        </p>
      )}
    </div>
  );
}
