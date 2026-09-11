import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Copy,
  ExternalLink,
  LayoutGrid,
  List,
  Package,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/marketplace/empty-state";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AdminPageHeader,
  AdminThumb,
  ConfirmDialog,
  DataTable,
  DemoNote,
  ErrorState,
  FilterBar,
  Panel,
  ProductCell,
  StatusBadge,
  TableSkeleton,
  productStatusLabel,
  productStatusTone,
  type Column,
} from "@/features/admin/admin-ui";
import { adminCategoriesQuery, adminProductsQuery } from "@/lib/admin/queries";
import {
  bulkProductAction,
  duplicateProduct,
  formatMoney,
  formatNumber,
} from "@/lib/admin/service";
import type { AdminProduct, ProductStatus } from "@/lib/admin/types";

export const Route = createFileRoute("/admin/products/")({ component: AdminProducts });

type SortKey = "updated" | "revenue" | "sales" | "name" | "price";

const sorters: Record<SortKey, (a: AdminProduct, b: AdminProduct) => number> = {
  updated: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
  revenue: (a, b) => b.revenue - a.revenue,
  sales: (a, b) => b.sales - a.sales,
  name: (a, b) => a.name.localeCompare(b.name),
  price: (a, b) => b.price - a.price,
};

function AdminProducts() {
  const queryClient = useQueryClient();
  const { data, isPending, isError, refetch } = useQuery(adminProductsQuery());
  const { data: categories } = useQuery(adminCategoriesQuery());

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ProductStatus | "all">("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<SortKey>("updated");
  const [view, setView] = useState<"table" | "grid">("table");
  const [selected, setSelected] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin"], exact: false });

  const bulk = useMutation({
    mutationFn: (action: Parameters<typeof bulkProductAction>[1]) =>
      bulkProductAction(selected, action),
    onSuccess: async (_data, action) => {
      await invalidate();
      toast.success(`${selected.length} product${selected.length === 1 ? "" : "s"} updated`, {
        description: `Local action: ${action}. The catalog API is not connected yet.`,
      });
      setSelected([]);
    },
  });

  const copy = useMutation({
    mutationFn: duplicateProduct,
    onSuccess: async (product) => {
      await invalidate();
      toast.success(`${product.name} created as a draft`);
    },
  });

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? [])
      .filter((p) => (status === "all" ? true : p.status === status))
      .filter((p) => (category === "all" ? true : p.categorySlug === category))
      .filter((p) =>
        q
          ? [p.name, p.slug, p.tagline, ...p.tags, ...p.tech].join(" ").toLowerCase().includes(q)
          : true,
      )
      .sort(sorters[sort]);
  }, [data, search, status, category, sort]);

  const columns: Column<AdminProduct>[] = [
    { key: "product", header: "Product", cell: (p) => <ProductCell product={p} /> },
    {
      key: "status",
      header: "Status",
      cell: (p) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge tone={productStatusTone[p.status]}>
            {productStatusLabel[p.status]}
          </StatusBadge>
          {p.featured && (
            <StatusBadge tone="brand" icon={Star}>
              Featured
            </StatusBadge>
          )}
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      cell: (p) => (
        <span className="text-sm text-muted-foreground">
          {categories?.find((c) => c.slug === p.categorySlug)?.name ?? p.categorySlug}
        </span>
      ),
    },
    {
      key: "price",
      header: "Price",
      cell: (p) => (
        <span className="font-mono text-sm tabular-nums">
          {formatMoney(p.salePrice ?? p.price)}
          {p.salePrice && (
            <span className="ml-1.5 text-xs text-muted-foreground line-through">
              {formatMoney(p.price)}
            </span>
          )}
        </span>
      ),
    },
    {
      key: "sales",
      header: "Sales",
      cell: (p) => <span className="font-mono text-sm tabular-nums">{formatNumber(p.sales)}</span>,
    },
    {
      key: "revenue",
      header: "Revenue",
      cell: (p) => <span className="font-mono text-sm tabular-nums">{formatMoney(p.revenue)}</span>,
    },
    {
      key: "version",
      header: "Version",
      cell: (p) => (
        <span className="font-mono text-xs text-muted-foreground">
          {p.version} · {p.updatedAt}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      headerClassName: "sr-only",
      cell: (p) => (
        <div className="flex items-center justify-end gap-1">
          <Button asChild variant="ghost" size="icon" aria-label={`Edit ${p.name}`}>
            <Link to="/admin/products/$productId" params={{ productId: p.id }}>
              <ArrowUpRight />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Duplicate ${p.name}`}
            onClick={() => copy.mutate(p.id)}
          >
            <Copy />
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label={`View ${p.name} on the storefront`}
          >
            <Link to="/templates/$slug" params={{ slug: p.slug }}>
              <ExternalLink />
            </Link>
          </Button>
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow="Catalog"
        title="Products"
        description="Every asset in the DevAssets catalog with pricing, licensing, delivery metadata and trading performance."
        breadcrumbs={[{ label: "Products" }]}
        actions={
          <>
            <Button asChild variant="subtle" size="sm">
              <Link to="/admin/categories">Categories</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/admin/products/new">
                <Plus /> New product
              </Link>
            </Button>
          </>
        }
      />

      <Panel className="p-4">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search by name, slug, tag or technology"
          label="Search products"
          trailing={
            <div className="flex items-center gap-1 rounded-md border border-border p-0.5">
              <Button
                variant={view === "table" ? "subtle" : "ghost"}
                size="icon"
                aria-label="Table view"
                aria-pressed={view === "table"}
                onClick={() => setView("table")}
              >
                <List />
              </Button>
              <Button
                variant={view === "grid" ? "subtle" : "ghost"}
                size="icon"
                aria-label="Grid view"
                aria-pressed={view === "grid"}
                onClick={() => setView("grid")}
              >
                <LayoutGrid />
              </Button>
            </div>
          }
        >
          <Select value={status} onValueChange={(v) => setStatus(v as ProductStatus | "all")}>
            <SelectTrigger className="w-36" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-44" aria-label="Filter by category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {(categories ?? []).map((c) => (
                <SelectItem key={c.slug} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-44" aria-label="Sort products">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">Recently updated</SelectItem>
              <SelectItem value="revenue">Highest revenue</SelectItem>
              <SelectItem value="sales">Most sales</SelectItem>
              <SelectItem value="price">Highest price</SelectItem>
              <SelectItem value="name">Name A–Z</SelectItem>
            </SelectContent>
          </Select>
        </FilterBar>
      </Panel>

      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-brand/35 bg-brand/[0.06] px-4 py-3">
          <span className="text-sm font-medium">{selected.length} selected</span>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button size="sm" variant="subtle" onClick={() => bulk.mutate("publish")}>
              Publish
            </Button>
            <Button size="sm" variant="subtle" onClick={() => bulk.mutate("draft")}>
              Move to draft
            </Button>
            <Button size="sm" variant="subtle" onClick={() => bulk.mutate("feature")}>
              <Star /> Feature
            </Button>
            <Button size="sm" variant="subtle" onClick={() => bulk.mutate("archive")}>
              Archive
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(true)}>
              <Trash2 /> Delete
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelected([])}>
              Clear
            </Button>
          </div>
        </div>
      )}

      {isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : isPending ? (
        <Panel>
          <TableSkeleton rows={8} cols={6} />
        </Panel>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<Package className="h-5 w-5" />}
          title="No products match these filters"
          description="Try a different search term, or clear the status and category filters."
          action={
            <Button
              variant="subtle"
              onClick={() => {
                setSearch("");
                setStatus("all");
                setCategory("all");
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : view === "table" ? (
        <Panel>
          <DataTable
            caption="Catalog products"
            columns={columns}
            rows={rows}
            getRowId={(p) => p.id}
            selectedIds={selected}
            onToggleRow={(id, next) =>
              setSelected((prev) => (next ? [...prev, id] : prev.filter((x) => x !== id)))
            }
            onToggleAll={(next) => setSelected(next ? rows.map((p) => p.id) : [])}
            mobileRow={(p) => (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-24 shrink-0">
                    <AdminThumb preview={p.preview} tint={p.tint} slug={p.slug} />
                  </div>
                  <div className="min-w-0">
                    <Link
                      to="/admin/products/$productId"
                      params={{ productId: p.id }}
                      className="block truncate text-sm font-medium"
                    >
                      {p.name}
                    </Link>
                    <p className="truncate font-mono text-[11px] text-muted-foreground">
                      /{p.slug} · v{p.version}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <StatusBadge tone={productStatusTone[p.status]}>
                    {productStatusLabel[p.status]}
                  </StatusBadge>
                  {p.featured && <StatusBadge tone="brand">Featured</StatusBadge>}
                  <span className="ml-auto font-mono text-sm tabular-nums">
                    {formatMoney(p.salePrice ?? p.price)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(p.sales)} sales · {formatMoney(p.revenue)} revenue
                </p>
              </div>
            )}
          />
        </Panel>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((p) => (
            <Panel key={p.id} className="overflow-hidden">
              <div className="border-b border-border bg-surface-2/30 p-4">
                <AdminThumb preview={p.preview} tint={p.tint} slug={p.slug} />
              </div>
              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      to="/admin/products/$productId"
                      params={{ productId: p.id }}
                      className="block truncate text-sm font-semibold transition-colors hover:text-brand"
                    >
                      {p.name}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">{p.tagline}</p>
                  </div>
                  <span className="shrink-0 font-mono text-sm tabular-nums">
                    {formatMoney(p.salePrice ?? p.price)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <StatusBadge tone={productStatusTone[p.status]}>
                    {productStatusLabel[p.status]}
                  </StatusBadge>
                  {p.featured && <StatusBadge tone="brand">Featured</StatusBadge>}
                  <StatusBadge>v{p.version}</StatusBadge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(p.sales)} sales · {formatMoney(p.revenue)} ·{" "}
                  {formatNumber(p.downloads)} downloads
                </p>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="subtle" className="flex-1">
                    <Link to="/admin/products/$productId" params={{ productId: p.id }}>
                      Manage
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <Link to="/templates/$slug" params={{ slug: p.slug }}>
                      <ExternalLink /> Storefront
                    </Link>
                  </Button>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}

      <DemoNote>
        Catalog edits are stored in this browser so the workspace behaves realistically. Product
        files, screenshots and publishing pipelines arrive with the production API.
      </DemoNote>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={`Delete ${selected.length} product${selected.length === 1 ? "" : "s"}?`}
        description="This removes them from the local demo workspace. Restoring the seeded catalog requires clearing this browser's stored admin data."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          bulk.mutate("delete");
          setConfirmDelete(false);
        }}
      />
    </>
  );
}
