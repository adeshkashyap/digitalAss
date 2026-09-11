import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Heart, Search, ShoppingCart, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/marketplace/empty-state";
import { PriceDisplay } from "@/components/marketplace/price-display";
import { RatingStars } from "@/components/marketplace/rating-stars";
import { TechBadge } from "@/components/marketplace/tech-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AccountPageHeader,
  CardsSkeleton,
  ProductThumb,
  StatusBadge,
} from "@/features/account/account-ui";
import { useStore } from "@/features/store/store-provider";
import { categoriesQuery } from "@/lib/catalog/queries";
import { useProductsByIds } from "@/lib/catalog/use-products-by-ids";

export const Route = createFileRoute("/account/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — ApnaCodex account" },
      { name: "description", content: "Templates you saved for later on ApnaCodex." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { wishlist, hydrated, toggleWishlist, addToCart } = useStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const { data: categories = [] } = useQuery(categoriesQuery());

  const { productsById } = useProductsByIds(wishlist);
  const products = useMemo(
    () => wishlist.map((id) => productsById.get(id)).filter((p): p is NonNullable<typeof p> => !!p),
    [wishlist, productsById],
  );

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((p) => {
      if (category !== "all" && p.categorySlug !== category) return false;
      if (!term) return true;
      return `${p.name} ${p.tagline} ${p.tech.join(" ")}`.toLowerCase().includes(term);
    });
  }, [products, search, category]);

  const usedCategories = categories.filter((c) => products.some((p) => p.categorySlug === c.slug));

  return (
    <div className="space-y-6">
      <AccountPageHeader
        breadcrumb="Wishlist"
        title="Wishlist"
        description="Saved templates, synced with the heart control across the marketplace in this browser."
        actions={
          <Button asChild variant="subtle">
            <Link to="/templates">
              Browse marketplace <ArrowUpRight />
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved templates"
            aria-label="Search saved templates"
            className="pl-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="sm:w-56" aria-label="Filter by category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {usedCategories.map((c) => (
              <SelectItem key={c.slug} value={c.slug}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!hydrated ? (
        <CardsSkeleton count={3} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<Heart className="h-5 w-5" />}
          title={products.length === 0 ? "Your wishlist is empty" : "Nothing matches those filters"}
          description={
            products.length === 0
              ? "Save templates while browsing and they collect here with live pricing."
              : "Clear the search or pick another category."
          }
          action={
            products.length === 0 ? (
              <Button asChild variant="brand">
                <Link to="/templates">Browse marketplace</Link>
              </Button>
            ) : (
              <Button
                variant="subtle"
                onClick={() => {
                  setSearch("");
                  setCategory("all");
                }}
              >
                Clear filters
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((product) => (
            <article
              key={product.id}
              className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-border-strong"
            >
              <div className="border-b border-border bg-surface-2 p-3">
                <div className="overflow-hidden rounded-md">
                  <div className="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]">
                    <ProductThumb product={product} />
                  </div>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="eyebrow truncate">
                    {categories.find((c) => c.slug === product.categorySlug)?.name ?? "Template"}
                  </span>
                  <RatingStars rating={product.rating} count={product.reviewCount} />
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
                <div className="flex flex-wrap gap-1.5">
                  <StatusBadge tone="success">Available now</StatusBadge>
                  {product.tech.slice(0, 2).map((t) => (
                    <TechBadge key={t} label={t} />
                  ))}
                </div>
                <div className="mt-auto space-y-3 border-t border-border pt-4">
                  <PriceDisplay price={product.price} salePrice={product.salePrice} />
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="brand"
                      onClick={() => {
                        const { added } = addToCart(product.id);
                        toast.success(
                          added ? `${product.name} added to cart` : "Already in your cart",
                          added
                            ? { description: "Commercial license selected by default." }
                            : undefined,
                        );
                      }}
                    >
                      <ShoppingCart /> Add to cart
                    </Button>
                    <Button asChild size="sm" variant="subtle">
                      <Link to="/templates/$slug" params={{ slug: product.slug }}>
                        View product
                      </Link>
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full text-muted-foreground"
                    onClick={() => {
                      toggleWishlist(product.id);
                      toast.success(`${product.name} removed from wishlist`);
                    }}
                  >
                    <Trash2 /> Remove from wishlist
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
