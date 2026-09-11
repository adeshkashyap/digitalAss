import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookmarkPlus,
  Loader2,
  Lock,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Tag,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { BrowserMockup } from "@/components/marketplace/browser-mockup";
import { EmptyState } from "@/components/marketplace/empty-state";
import { ProductScreenshot } from "@/components/marketplace/product-screenshot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHero } from "@/features/catalog/page-hero";
import { type CartLine, useStore } from "@/features/store/store-provider";
import { licenses } from "@/lib/catalog/licenses";
import { formatPrice } from "@/lib/catalog/service";
import type { LicenseId } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

const title = "Your cart — DevAssets";
const description =
  "Review the templates and licenses in your DevAssets cart, apply a discount code and continue to checkout.";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const store = useStore();
  const { lines, savedLines, subtotal, discount, discountCode, total, hydrated } = store;
  const [code, setCode] = useState("");
  const [discountMessage, setDiscountMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await store.applyDiscount(code);
    if (res.ok) {
      setDiscountMessage({ type: "ok", text: res.message });
      setCode("");
    } else {
      setDiscountMessage({ type: "err", text: res.message });
    }
  };

  return (
    <>
      <PageHero
        crumbs={[{ label: "Home", to: "/" }, { label: "Cart" }]}
        eyebrow="Checkout"
        title="Your cart"
        description={
          hydrated && lines.length > 0
            ? `${lines.length} ${lines.length === 1 ? "template" : "templates"} ready to license. Downloads are instant after purchase.`
            : "Add a template and its license tier here before continuing to checkout."
        }
      />

      <div className="shell py-12 lg:py-16">
        {!hydrated ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading your cart…
          </div>
        ) : lines.length === 0 && savedLines.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="h-5 w-5" />}
            title="Your cart is empty"
            description="Browse the catalog and add a template — you can change the license tier at any point before checkout."
            action={
              <Button asChild variant="hero" size="lg">
                <Link to="/templates">
                  Browse templates <ArrowRight />
                </Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.6fr_0.9fr] lg:items-start">
            <div className="min-w-0 space-y-4">
              {lines.map((line) => (
                <CartRow key={`${line.productId}-${line.license}`} line={line} />
              ))}

              {lines.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/templates">
                      <Undo2 /> Continue shopping
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      store.clearCart();
                      toast.success("Cart cleared");
                    }}
                  >
                    <Trash2 /> Clear cart
                  </Button>
                </div>
              )}

              {savedLines.length > 0 && (
                <section className="mt-8">
                  <h2 className="font-display text-lg font-semibold tracking-tight">
                    Saved for later
                  </h2>
                  <div className="mt-4 space-y-4">
                    {savedLines.map((line) => (
                      <CartRow key={`${line.productId}-${line.license}-saved`} line={line} saved />
                    ))}
                  </div>
                </section>
              )}
            </div>

            <aside className="lg:sticky lg:top-24">
              <div className="rounded-lg border border-border bg-card p-6 shadow-[var(--shadow-elevated)]">
                <h2 className="font-display text-base font-semibold tracking-tight">
                  Order summary
                </h2>

                <form onSubmit={submitCode} className="mt-5 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <label htmlFor="discount" className="sr-only">
                      Discount code
                    </label>
                    <Input
                      id="discount"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value);
                        setDiscountMessage(null);
                      }}
                      placeholder="Discount code"
                      className="h-11"
                      aria-describedby={discountMessage ? "discount-feedback" : undefined}
                    />
                    <Button type="submit" variant="subtle" className="h-11 shrink-0 touch-target">
                      <Tag /> Apply
                    </Button>
                  </div>
                  {discountMessage && (
                    <p
                      id="discount-feedback"
                      role="status"
                      aria-live="polite"
                      className={cn(
                        "text-xs",
                        discountMessage.type === "ok" ? "text-success" : "text-destructive",
                      )}
                    >
                      {discountMessage.text}
                    </p>
                  )}
                </form>

                {discountCode && (
                  <div className="mt-3 flex items-center justify-between rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-xs">
                    <span className="font-medium text-success">{discountCode} applied</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        store.removeDiscount();
                        toast.success("Discount removed");
                      }}
                      aria-label="Remove discount code"
                      className="text-muted-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}

                <dl className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd className="font-medium tabular-nums">{formatPrice(subtotal)}</dd>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Discount</dt>
                      <dd className="font-medium tabular-nums text-success">
                        −{formatPrice(discount)}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">VAT</dt>
                    <dd className="text-xs text-muted-foreground">Calculated at checkout</dd>
                  </div>
                  <div className="flex items-baseline justify-between border-t border-border pt-3">
                    <dt className="font-medium">Total</dt>
                    <dd className="font-display text-xl font-semibold tabular-nums">
                      {formatPrice(total)}
                    </dd>
                  </div>
                </dl>

                <Button asChild variant="hero" size="lg" className="mt-6 w-full">
                  <Link to="/checkout">
                    <Lock /> Continue to checkout
                  </Link>
                </Button>

                <ul className="mt-5 space-y-2.5 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-success" aria-hidden /> 14-day
                    refund if a template does not match its demo
                  </li>
                  <li className="flex items-center gap-2">
                    <RefreshCw className="h-3.5 w-3.5 shrink-0 text-brand" aria-hidden /> Free
                    version updates for every template you own
                  </li>
                  <li className="flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5 shrink-0 text-brand" aria-hidden /> Card payments
                    handled by our payment provider, never stored here
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}

function CartRow({ line, saved = false }: { line: CartLine; saved?: boolean }) {
  const store = useStore();
  const { product, license, quantity, unitPrice, lineTotal } = line;

  return (
    <article className="grid gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-[13rem_minmax(0,1fr)] sm:p-5">
      <Link
        to="/templates/$slug"
        params={{ slug: product.slug }}
        className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <BrowserMockup url={`devassets.io/${product.slug}`} compact>
          <div className="aspect-[16/10]">
            <ProductScreenshot kind={product.preview} tint={product.tint} />
          </div>
        </BrowserMockup>
      </Link>

      <div className="flex min-w-0 flex-col">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
          <div className="min-w-0">
            <Link
              to="/templates/$slug"
              params={{ slug: product.slug }}
              className="font-display text-base font-semibold tracking-tight hover:text-brand"
            >
              {product.name}
            </Link>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.tagline}</p>
          </div>
          <p className="shrink-0 font-display text-base font-semibold tabular-nums">
            {formatPrice(lineTotal)}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="min-w-[11rem]">
            <label className="sr-only" htmlFor={`license-${product.id}-${license}`}>
              License for {product.name}
            </label>
            <Select
              value={license}
              onValueChange={(v) => {
                store.setLicense(product.id, license, v as LicenseId);
                toast.success(`Switched to the ${v} license`);
              }}
            >
              <SelectTrigger id={`license-${product.id}-${license}`} className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {licenses.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.name} license
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div
            role="group"
            aria-label={`Quantity for ${product.name}`}
            className="inline-flex h-11 items-center rounded-md border border-border"
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-11 w-11 text-muted-foreground disabled:opacity-40"
              onClick={() => store.setQuantity(product.id, license, quantity - 1)}
              disabled={quantity <= 1}
              aria-label={`Decrease seats for ${product.name}`}
            >
              −
            </Button>
            <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">
              {quantity}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-11 w-11 text-muted-foreground disabled:opacity-40"
              onClick={() => store.setQuantity(product.id, license, quantity + 1)}
              disabled={quantity >= 10}
              aria-label={`Increase seats for ${product.name}`}
            >
              +
            </Button>
          </div>

          <span className="text-xs text-muted-foreground">
            {formatPrice(unitPrice)} per seat · {line.licenseName} license
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              store.toggleSaveForLater(product.id, license);
              toast.success(saved ? "Moved back to cart" : "Saved for later");
            }}
          >
            {saved ? (
              <>
                <Undo2 /> Move to cart
              </>
            ) : (
              <>
                <BookmarkPlus /> Save for later
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => {
              store.removeFromCart(product.id, license);
              toast.success(`${product.name} removed`);
            }}
          >
            <Trash2 /> Remove
          </Button>
        </div>
      </div>
    </article>
  );
}
