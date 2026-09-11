import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutGrid, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/marketplace/empty-state";
import { ProductGrid } from "@/components/marketplace/product-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  activeFilterCount,
  defaultFilters,
  FilterPanel,
  MAX_PRICE,
  type CatalogFilters,
} from "@/features/catalog/filter-panel";
import { PageHero } from "@/features/catalog/page-hero";
import { categories } from "@/lib/catalog/categories";
import { formatPrice, queryProducts } from "@/lib/catalog/service";
import type { SortKey } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

const title = "All templates — DevAssets marketplace";
const description =
  "Browse 13 production-grade React templates across dashboards, SaaS, ecommerce, hospitality, education and corporate categories. Filter by technology, price and rating.";

export const Route = createFileRoute("/templates/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CatalogPage,
});

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Best rated" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

const PER_PAGE = 9;

function CatalogPage() {
  const [filters, setFilters] = useState<CatalogFilters>(defaultFilters);
  const [sort, setSort] = useState<SortKey>("featured");
  const [page, setPage] = useState(1);

  const result = useMemo(
    () =>
      queryProducts({
        search: filters.search,
        categories: filters.categories,
        tech: filters.tech,
        features: filters.features,
        minRating: filters.minRating,
        maxPrice: filters.maxPrice >= MAX_PRICE ? undefined : filters.maxPrice,
        sort,
        page,
        perPage: PER_PAGE,
      }),
    [filters, sort, page],
  );

  const update = (next: CatalogFilters) => {
    setFilters(next);
    setPage(1);
  };

  const reset = () => update(defaultFilters);
  const activeCount = activeFilterCount(filters);

  const pills: { key: string; label: string; clear: () => void }[] = [
    ...filters.categories.map((slug) => ({
      key: `cat-${slug}`,
      label: categories.find((c) => c.slug === slug)?.name ?? slug,
      clear: () =>
        update({ ...filters, categories: filters.categories.filter((s) => s !== slug) }),
    })),
    ...filters.tech.map((t) => ({
      key: `tech-${t}`,
      label: t,
      clear: () => update({ ...filters, tech: filters.tech.filter((s) => s !== t) }),
    })),
    ...filters.features.map((t) => ({
      key: `feat-${t}`,
      label: t,
      clear: () => update({ ...filters, features: filters.features.filter((s) => s !== t) }),
    })),
    ...(filters.minRating > 0
      ? [
          {
            key: "rating",
            label: `${filters.minRating}+ rating`,
            clear: () => update({ ...filters, minRating: 0 }),
          },
        ]
      : []),
    ...(filters.maxPrice < MAX_PRICE
      ? [
          {
            key: "price",
            label: `Under ${formatPrice(filters.maxPrice)}`,
            clear: () => update({ ...filters, maxPrice: MAX_PRICE }),
          },
        ]
      : []),
  ];

  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", to: "/" }, { label: "Templates" }]}
        eyebrow="Marketplace"
        title="All templates"
        description="Production-grade front ends with typed data layers, designed edge cases and documentation. Compare the complete catalog by stack, industry and license-ready price."
        aside={
          <div className="min-w-40 rounded-lg border border-border bg-surface/70 px-4 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand" aria-hidden />
              <p className="font-display text-2xl font-semibold">{result.total}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              {result.total === 1 ? "template matches" : "templates match"}
            </p>
          </div>
        }
      >
        <div className="mt-8 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => update({ ...filters, categories: [] })}
            aria-pressed={filters.categories.length === 0}
            className={cn(
              "rounded-full",
              filters.categories.length === 0
                ? "border-brand/50 bg-brand/10 text-brand"
                : "text-muted-foreground",
            )}
          >
            All
          </Button>
          {categories.map((c) => {
            const active = filters.categories.includes(c.slug);
            return (
              <Button
                key={c.slug}
                type="button"
                variant="outline"
                size="sm"
                aria-pressed={active}
                onClick={() =>
                  update({
                    ...filters,
                    categories: active
                      ? filters.categories.filter((s) => s !== c.slug)
                      : [...filters.categories, c.slug],
                  })
                }
                className={cn(
                  "rounded-full",
                  active
                    ? "border-brand/50 bg-brand/10 text-brand"
                    : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
                )}
              >
                {c.name}
              </Button>
            );
          })}
        </div>
      </PageHero>

      <div className="shell grid gap-10 py-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:py-14">
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-lg border border-border bg-card p-5">
            <FilterPanel filters={filters} onChange={update} onReset={reset} />
          </div>
        </aside>

        <div className="min-w-0">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="relative min-w-0">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={filters.search}
                onChange={(e) => update({ ...filters, search: e.target.value })}
                placeholder="Search by name, industry or technology"
                aria-label="Search templates"
                className="h-10 pl-9"
              />
            </div>
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 sm:flex">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <SlidersHorizontal /> Filters
                    {activeCount > 0 && (
                      <span className="ml-0.5 rounded bg-brand px-1.5 font-mono text-[10px] text-brand-foreground">
                        {activeCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[19rem] overflow-y-auto">
                  <SheetTitle className="mb-5">Filter templates</SheetTitle>
                  <FilterPanel filters={filters} onChange={update} onReset={reset} />
                </SheetContent>
              </Sheet>

              <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                <SelectTrigger className="h-10 w-[11.5rem]" aria-label="Sort templates">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {pills.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {pills.map((p) => (
                <Button
                  key={p.key}
                  type="button"
                  variant="subtle"
                  size="sm"
                  onClick={p.clear}
                  className="h-7 rounded-full px-3 text-muted-foreground"
                >
                  {p.label}
                  <X className="h-3 w-3" aria-hidden />
                  <span className="sr-only">Remove filter</span>
                </Button>
              ))}
              <Button variant="ghost" size="sm" onClick={reset}>
                Clear all
              </Button>
            </div>
          )}

          <p className="mt-6 text-xs text-muted-foreground">
            Showing {result.items.length} of {result.total} templates
          </p>

          {result.items.length > 0 ? (
            <>
              <ProductGrid products={result.items} className="mt-5" />
              {result.items.length < result.total && (
                <div className="mt-10 flex flex-col items-center gap-3">
                  <Button variant="outline" size="lg" onClick={() => setPage((p) => p + 1)}>
                    <LayoutGrid /> Load more templates
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    {result.total - result.items.length} more available
                  </p>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              className="mt-6"
              title="No templates match these filters"
              description="Try widening the price range, removing a technology filter, or searching for a broader term like “dashboard” or “booking”."
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <Button variant="brand" onClick={reset}>
                    Clear all filters
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/categories">Browse categories</Link>
                  </Button>
                </div>
              }
            />
          )}
        </div>
      </div>
    </>
  );
}
