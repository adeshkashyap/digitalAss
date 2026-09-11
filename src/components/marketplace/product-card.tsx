import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Eye, Heart, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { BrowserMockup } from "@/components/marketplace/browser-mockup";
import { PriceDisplay } from "@/components/marketplace/price-display";
import { ProductScreenshot } from "@/components/marketplace/product-screenshot";
import { RatingStars } from "@/components/marketplace/rating-stars";
import { TechBadge } from "@/components/marketplace/tech-badge";
import { Button } from "@/components/ui/button";
import { useStore } from "@/features/store/store-provider";
import { categoriesQuery } from "@/lib/catalog/queries";
import { formatCompact } from "@/lib/catalog/service";
import type { Product } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  className,
  compact = false,
}: {
  product: Product;
  className?: string;
  compact?: boolean;
}) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const { data: categories = [] } = useQuery(categoriesQuery());
  const category = categories.find((c) => c.slug === product.categorySlug);
  const saved = isWishlisted(product.id);

  return (
    <article
      className={cn(
        "card-lift group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card",
        className,
      )}
    >
      <div className="relative overflow-hidden border-b border-border bg-surface-2 p-3">
        <div className="relative aspect-[16/10] overflow-hidden rounded-md">
          <div className="h-full w-full transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] lg:group-hover:scale-[1.04]">
            <BrowserMockup compact url={`${product.slug}.devassets.io`} className="h-full">
              <div className="aspect-[16/9.2]">
                <ProductScreenshot kind={product.preview} tint={product.tint} />
              </div>
            </BrowserMockup>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex translate-y-0 items-center justify-center gap-2 p-3 opacity-100 transition-all duration-300 lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100">
            <Button asChild size="sm" variant="brand">
              <Link to="/templates/$slug" params={{ slug: product.slug }}>
                <Eye /> Quick view
              </Link>
            </Button>
            <Button
              size="sm"
              variant="subtle"
              onClick={() =>
                toast.info("Live demo opens in the next phase", {
                  description: `${product.name} demo is being prepared for public preview.`,
                })
              }
            >
              Live demo <ArrowUpRight />
            </Button>
          </div>
        </div>

        <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
          {product.bestSeller && (
            <span className="rounded-md bg-brand px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-foreground">
              Best seller
            </span>
          )}
          {product.isNew && (
            <span className="rounded-md border border-border bg-surface/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
              New
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            const nowSaved = toggleWishlist(product.id);
            toast.success(
              nowSaved
                ? `${product.name} saved to wishlist`
                : `${product.name} removed from wishlist`,
            );
          }}
          aria-pressed={saved}
          aria-label={
            saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`
          }
          className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full border border-border bg-surface/90 text-muted-foreground backdrop-blur transition-colors hover:text-brand"
        >
          <Heart className={cn("h-4 w-4", saved && "fill-brand text-brand")} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/categories/$slug"
            params={{ slug: product.categorySlug }}
            className="eyebrow transition-colors hover:text-brand"
          >
            {category?.name ?? "Template"}
          </Link>
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
          <p
            className={cn(
              "mt-1.5 text-sm leading-relaxed text-muted-foreground",
              compact ? "line-clamp-2" : "line-clamp-2",
            )}
          >
            {product.tagline}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {product.tech.slice(0, 4).map((t) => (
            <TechBadge key={t} label={t} />
          ))}
          {product.tech.length > 4 && (
            <TechBadge label={`+${product.tech.length - 4}`} tone="brand" />
          )}
        </div>

        <div className="mt-auto grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 border-t border-border pt-4">
          <div>
            <PriceDisplay price={product.price} salePrice={product.salePrice} />
            <p className="mt-1 text-[11px] text-muted-foreground">
              {formatCompact(product.sales)} sales · {product.pages} screens
            </p>
          </div>
          <Button
            size="sm"
            variant="subtle"
            onClick={() => {
              const { added } = addToCart(product.id);
              toast.success(added ? `${product.name} added to cart` : "Already in your cart", {
                description: added ? "Commercial license selected by default." : undefined,
              });
            }}
          >
            <ShoppingCart /> Add
          </Button>
        </div>
      </div>
    </article>
  );
}
