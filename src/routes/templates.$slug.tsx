import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  Download,
  FileText,
  Heart,
  History,
  Layers,
  RefreshCw,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Breadcrumbs } from "@/components/marketplace/breadcrumbs";
import { BrowserMockup } from "@/components/marketplace/browser-mockup";
import { FAQAccordion } from "@/components/marketplace/faq-accordion";
import { LicenseComparison } from "@/components/marketplace/license-cards";
import { PriceDisplay } from "@/components/marketplace/price-display";
import { ProductCard } from "@/components/marketplace/product-card";
import { ProductScreenshot } from "@/components/marketplace/product-screenshot";
import { RatingStars } from "@/components/marketplace/rating-stars";
import { SectionHeader } from "@/components/marketplace/section-header";
import { TechBadge } from "@/components/marketplace/tech-badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/features/store/store-provider";
import { categoryBySlug } from "@/lib/catalog/categories";
import { productFaqs } from "@/lib/catalog/content";
import { licenses } from "@/lib/catalog/licenses";
import {
  effectivePrice,
  formatCompact,
  formatDate,
  formatPrice,
  getProduct,
  getRelatedProducts,
} from "@/lib/catalog/service";
import type { LicenseId } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/templates/$slug")({
  loader: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Template not found — DevAssets" }, { name: "robots", content: "noindex" }],
      };
    }
    const { product } = loaderData;
    const title = `${product.name} — ${product.tagline} | DevAssets`;
    const description = product.summary.slice(0, 155);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ProductDetail,
});

function ProductDetail() {
  const { product } = Route.useLoaderData();
  const category = categoryBySlug(product.categorySlug);
  const related = getRelatedProducts(product, 3);
  const { addToCart, toggleWishlist, isWishlisted } = useStore();

  const [license, setLicense] = useState<LicenseId>("commercial");
  const [activeScreen, setActiveScreen] = useState(0);
  const saved = isWishlisted(product.id);

  const selected = licenses.find((l) => l.id === license) ?? licenses[0];
  if (!selected) return null;
  const licensePrice = Math.round(effectivePrice(product) * selected.multiplier);
  const listPrice = Math.round(product.price * selected.multiplier);
  const screen = product.screens[activeScreen] ?? product.screens[0];
  if (!screen) return null;

  const add = (buyNow = false) => {
    const { added } = addToCart(product.id, license);
    toast.success(added ? `${product.name} added to cart` : "Already in your cart", {
      description: `${selected.name} license · ${formatPrice(licensePrice)}`,
      action: buyNow
        ? undefined
        : { label: "View cart", onClick: () => (window.location.href = "/cart") },
    });
  };

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Could not copy the link", { description: url });
    }
  };

  return (
    <>
      <div className="border-b border-border">
        <div className="shell py-6">
          <Breadcrumbs
            items={[
              { label: "Home", to: "/" },
              { label: "Templates", to: "/templates" },
              {
                label: category?.name ?? "Category",
                to: "/categories/$slug",
                params: { slug: product.categorySlug },
              },
              { label: product.name },
            ]}
          />
        </div>
      </div>

      <div className="shell grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:py-14 xl:gap-14">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/categories/$slug"
              params={{ slug: product.categorySlug }}
              className="eyebrow transition-colors hover:text-brand"
            >
              {category?.name}
            </Link>
            {product.bestSeller && (
              <span className="rounded-md bg-brand px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-foreground">
                Best seller
              </span>
            )}
            {product.isNew && (
              <span className="rounded-md border border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                New
              </span>
            )}
          </div>

          <h1 className="mt-3 font-display text-display-lg font-semibold">{product.name}</h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {product.tagline}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <RatingStars rating={product.rating} count={product.reviewCount} size="md" />
            <span>{formatCompact(product.sales)} purchases</span>
            <span>{product.pages} screens</span>
            <span>Updated {formatDate(product.updatedAt)}</span>
          </div>

          <div className="mt-8">
            <BrowserMockup
              url={`${product.slug}.devassets.io${activeScreen === 0 ? "" : `/${screen.label.toLowerCase()}`}`}
              className="shadow-[var(--shadow-lift)]"
            >
              <div className="aspect-[16/10]">
                <ProductScreenshot kind={screen.kind} tint={product.tint} />
              </div>
            </BrowserMockup>

            <div className="mt-4 flex snap-x gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-4 sm:overflow-visible sm:pb-0">
              {product.screens.map((s, i) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setActiveScreen(i)}
                  aria-pressed={i === activeScreen}
                  aria-label={`View ${s.label} screen`}
                  className={cn(
                    "relative w-32 shrink-0 snap-start overflow-hidden rounded-md border text-left transition-colors sm:w-auto",
                    i === activeScreen
                      ? "border-brand shadow-[var(--shadow-glow)] ring-1 ring-brand/40"
                      : "border-border hover:border-border-strong",
                  )}
                >
                  {i === activeScreen && (
                    <span
                      className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-brand text-brand-foreground"
                      aria-hidden
                    >
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                  <span className="block aspect-[16/10]">
                    <ProductScreenshot kind={s.kind} tint={product.tint} />
                  </span>
                  <span
                    className={cn(
                      "block truncate border-t border-border px-2 py-1.5 text-[11px]",
                      i === activeScreen ? "font-medium text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {s.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-12">
            <Tabs defaultValue="overview">
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="included">What's included</TabsTrigger>
                <TabsTrigger value="tech">Tech & requirements</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({product.reviewCount})</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="pt-8">
                <div className="max-w-3xl space-y-4">
                  {product.description.map((para) => (
                    <p
                      key={para.slice(0, 24)}
                      className="text-sm leading-relaxed text-muted-foreground"
                    >
                      {para}
                    </p>
                  ))}
                </div>
                <h2 className="mt-10 font-display text-lg font-semibold tracking-tight">
                  Key features
                </h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {product.features.map((f) => (
                    <div key={f.title} className="rounded-lg border border-border bg-card p-5">
                      <div className="flex items-center gap-2.5">
                        <Zap className="h-4 w-4 shrink-0 text-brand" aria-hidden />
                        <h3 className="text-sm font-semibold">{f.title}</h3>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="included" className="pt-8">
                <ul className="grid max-w-3xl gap-3 sm:grid-cols-2">
                  {product.included.map((i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                      <span className="text-muted-foreground">{i}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {[
                    { Icon: History, label: "Version", value: product.version },
                    {
                      Icon: RefreshCw,
                      label: "Last updated",
                      value: formatDate(product.updatedAt),
                    },
                    {
                      Icon: Layers,
                      label: "First released",
                      value: formatDate(product.releasedAt),
                    },
                  ].map(({ Icon, label, value }) => (
                    <div key={label} className="rounded-lg border border-border bg-card p-4">
                      <p className="eyebrow flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5" aria-hidden />
                        {label}
                      </p>
                      <p className="mt-2 text-sm font-medium">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info("Changelog opens with the documentation portal")}
                  >
                    <FileText /> View changelog
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info("Documentation portal launches in the next phase")}
                  >
                    <BookOpen /> Documentation
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="tech" className="pt-8">
                <h2 className="font-display text-lg font-semibold tracking-tight">Tech stack</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.tech.map((t) => (
                    <TechBadge key={t} label={t} tone="brand" className="px-2.5 py-1 text-[11px]" />
                  ))}
                </div>
                <h2 className="mt-10 font-display text-lg font-semibold tracking-tight">
                  Requirements
                </h2>
                <ul className="mt-4 max-w-xl space-y-2.5">
                  {product.requirements.map((r) => (
                    <li key={r} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                      {r}
                    </li>
                  ))}
                </ul>
                <h2 className="mt-10 font-display text-lg font-semibold tracking-tight">
                  License comparison
                </h2>
                <LicenseComparison className="mt-4" />
              </TabsContent>

              <TabsContent value="reviews" className="pt-8">
                <div className="flex flex-wrap items-center gap-6 rounded-lg border border-border bg-card p-6">
                  <div>
                    <p className="font-display text-4xl font-semibold tracking-tight">
                      {product.rating.toFixed(1)}
                    </p>
                    <RatingStars rating={product.rating} className="mt-2" />
                    <p className="mt-1 text-xs text-muted-foreground">
                      {product.reviewCount} verified reviews
                    </p>
                  </div>
                  <div className="min-w-[12rem] flex-1 space-y-1.5">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const pct =
                        star === 5 ? 78 : star === 4 ? 17 : star === 3 ? 3 : star === 2 ? 1 : 1;
                      return (
                        <div key={star} className="flex items-center gap-3 text-xs">
                          <span className="w-3 text-muted-foreground">{star}</span>
                          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                            <span
                              className="block h-full rounded-full bg-warning"
                              style={{ width: `${pct}%` }}
                            />
                          </span>
                          <span className="w-8 text-right text-muted-foreground">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {product.reviews.map((r) => (
                    <article key={r.id} className="rounded-lg border border-border bg-card p-5">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold">{r.title}</h3>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {r.author} · {r.role}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <RatingStars rating={r.rating} />
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            {formatDate(r.date)}
                          </p>
                        </div>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
                    </article>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="mt-14 border-t border-border pt-10">
            <h2 className="font-display text-lg font-semibold tracking-tight">Frequently asked</h2>
            <FAQAccordion items={productFaqs} idPrefix={`pdp-${product.slug}`} className="mt-2" />
          </div>
        </div>

        <aside className="lg:relative">
          <div className="lg:sticky lg:top-24">
            <div className="rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-elevated)]">
              <PriceDisplay
                price={listPrice}
                salePrice={product.salePrice ? licensePrice : undefined}
                size="lg"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                One-time payment · {selected.projects}
              </p>

              <fieldset className="mt-6">
                <legend className="eyebrow mb-3">Select license</legend>
                <div className="space-y-2">
                  {licenses.map((l) => {
                    const price = Math.round(effectivePrice(product) * l.multiplier);
                    const active = l.id === license;
                    return (
                      <Button
                        key={l.id}
                        type="button"
                        variant="outline"
                        onClick={() => setLicense(l.id)}
                        aria-pressed={active}
                        className={cn(
                          "grid h-auto w-full grid-cols-[minmax(0,1fr)_auto] items-center justify-stretch gap-3 px-4 py-3 text-left",
                          active
                            ? "border-brand bg-brand/5"
                            : "border-border hover:border-border-strong",
                        )}
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{l.name}</span>
                          <span className="block truncate text-[11px] text-muted-foreground">
                            {l.projects}
                          </span>
                        </span>
                        <span className="shrink-0 text-sm font-semibold">{formatPrice(price)}</span>
                      </Button>
                    );
                  })}
                </div>
              </fieldset>

              <div className="mt-6 space-y-2.5">
                <Button variant="hero" size="lg" className="w-full" onClick={() => add()}>
                  <ShoppingCart /> Add to cart
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full">
                  <Link to="/checkout" onClick={() => add(true)}>
                    Buy now
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full"
                  onClick={() =>
                    toast.info("Live demo opens in the next phase", {
                      description: `${product.name} demo is being prepared for public preview.`,
                    })
                  }
                >
                  <ArrowUpRight /> Live demo
                </Button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={() => {
                    const nowSaved = toggleWishlist(product.id);
                    toast.success(nowSaved ? "Saved to wishlist" : "Removed from wishlist");
                  }}
                >
                  <Heart className={cn(saved && "fill-brand text-brand")} />
                  {saved ? "Saved" : "Wishlist"}
                </Button>
                <Button variant="subtle" size="sm" onClick={share}>
                  <Share2 /> Share
                </Button>
              </div>

              <ul className="mt-6 space-y-2.5 border-t border-border pt-5 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Download className="h-3.5 w-3.5 shrink-0 text-success" aria-hidden />
                  Instant download after purchase
                </li>
                <li className="flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 shrink-0 text-success" aria-hidden />
                  {selected.highlights.find((h) => h.includes("updates")) ?? "Free updates"}
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-success" aria-hidden />
                  14-day refund if it doesn't match the demo
                </li>
              </ul>
            </div>

            <div className="mt-4 rounded-lg border border-border bg-surface/50 p-5">
              <p className="eyebrow">Tech stack</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {product.tech.map((t) => (
                  <TechBadge key={t} label={t} />
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <section className="border-t border-border bg-surface/30 py-16 pb-28 lg:pb-16">
        <div className="shell">
          <SectionHeader
            eyebrow="Related templates"
            title="Others in this space"
            action={
              <Button asChild variant="ghost">
                <Link to="/templates">Browse all</Link>
              </Button>
            }
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} compact className="w-full" />
            ))}
          </div>
        </div>
      </section>

      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden"
        role="region"
        aria-label="Purchase options"
      >
        <div className="shell flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <PriceDisplay
              price={listPrice}
              salePrice={product.salePrice ? licensePrice : undefined}
              size="sm"
            />
            <p className="truncate text-[11px] text-muted-foreground">{selected.name} license</p>
          </div>
          <Button variant="hero" size="lg" className="shrink-0" onClick={() => add()}>
            <ShoppingCart /> Add to cart
          </Button>
        </div>
      </div>
    </>
  );
}
