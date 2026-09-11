import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BookOpen,
  Clock,
  Download,
  Heart,
  LifeBuoy,
  Package,
  Receipt,
  ScrollText,
  Sparkles,
} from "lucide-react";

import { EmptyState } from "@/components/marketplace/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DemoNote,
  ErrorState,
  Panel,
  PanelHeader,
  ProductThumb,
  StatCard,
  StatsSkeleton,
  StatusBadge,
  orderStatusLabel,
  orderStatusTone,
} from "@/features/account/account-ui";
import { PurchaseRow } from "@/features/account/library-card";
import { useDownloadAction } from "@/features/account/use-download";
import { useStore } from "@/features/store/store-provider";
import { downloadsQuery, ordersQuery, purchasesQuery, userQuery } from "@/lib/account/queries";
import { getRecentlyViewedSlugs, purchaseHasUpdate } from "@/lib/account/service";
import { productById, productBySlug } from "@/lib/catalog/products";
import { formatDate, formatPrice } from "@/lib/catalog/service";
import { licenseById } from "@/lib/catalog/licenses";

export const Route = createFileRoute("/account/")({
  head: () => ({
    meta: [
      { title: "Account overview — DevAssets" },
      {
        name: "description",
        content: "Your DevAssets library at a glance: purchases, downloads and licenses.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AccountOverview,
});

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function AccountOverview() {
  const userQ = useQuery(userQuery());
  const purchasesQ = useQuery(purchasesQuery());
  const downloadsQ = useQuery(downloadsQuery());
  const ordersQ = useQuery(ordersQuery());
  const { wishlist, hydrated } = useStore();
  const { download, pendingFileId } = useDownloadAction();

  const purchases = purchasesQ.data ?? [];
  const active = purchases.filter((p) => !p.archived);
  const entries = active
    .map((purchase) => {
      const product = productById(purchase.productId);
      return product ? { purchase, product, updateAvailable: purchaseHasUpdate(purchase) } : null;
    })
    .filter((e): e is NonNullable<typeof e> => e !== null);

  const firstName = userQ.data?.name.split(" ")[0] ?? "there";
  const wishlistProducts = wishlist
    .map((id) => productById(id))
    .filter((p): p is NonNullable<typeof p> => !!p)
    .slice(0, 3);
  const recentlyViewed = getRecentlyViewedSlugs()
    .map((slug) => productBySlug(slug))
    .filter((p): p is NonNullable<typeof p> => !!p)
    .slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <section className="relative overflow-hidden rounded-lg border border-border bg-card p-6 sm:p-8">
        <div className="hero-glow pointer-events-none absolute inset-0 opacity-70" aria-hidden />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="eyebrow">Your library</p>
            {userQ.isPending ? (
              <Skeleton className="mt-3 h-8 w-64" />
            ) : (
              <h1 className="mt-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                {greeting()}, {firstName}
              </h1>
            )}
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Everything you own lives here — source builds, documentation, licenses and order
              records. Update notices appear the moment a template ships a new version.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button asChild variant="hero" size="lg">
              <Link to="/templates">
                Browse marketplace <ArrowUpRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/account/downloads">
                <Download /> View downloads
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      {purchasesQ.isPending || !hydrated ? (
        <StatsSkeleton />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total purchases"
            value={purchases.length}
            hint={`${active.length} active in your library`}
            icon={Package}
            to="/account/purchases"
          />
          <StatCard
            label="Available downloads"
            value={downloadsQ.data?.reduce((n, d) => n + d.files.length, 0) ?? 0}
            hint={`${downloadsQ.data?.filter((d) => d.updateAvailable).length ?? 0} with a newer build`}
            icon={Download}
            to="/account/downloads"
          />
          <StatCard
            label="Active licenses"
            value={active.length}
            hint="Personal, commercial and agency"
            icon={ScrollText}
            to="/account/licenses"
          />
          <StatCard
            label="Wishlist items"
            value={wishlist.length}
            hint="Saved for later"
            icon={Heart}
            to="/account/wishlist"
          />
        </div>
      )}
      <DemoNote>
        Account figures are sample values stored in this browser. They will come from your real
        purchase records once the backend is connected.
      </DemoNote>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          {/* Recently purchased */}
          <Panel>
            <PanelHeader
              title="Recently purchased"
              description="Your newest templates, ready to download."
              icon={Package}
              action={
                <Button asChild size="sm" variant="ghost">
                  <Link to="/account/purchases">
                    All purchases <ArrowUpRight />
                  </Link>
                </Button>
              }
            />
            {purchasesQ.isPending ? (
              <div className="space-y-4 p-5">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : purchasesQ.isError ? (
              <div className="p-5">
                <ErrorState onRetry={() => void purchasesQ.refetch()} />
              </div>
            ) : entries.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  icon={<Package className="h-5 w-5" />}
                  title="No purchases yet"
                  description="Templates you buy appear here with their license and download files."
                  action={
                    <Button asChild variant="brand">
                      <Link to="/templates">Browse marketplace</Link>
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="divide-y divide-border">
                {entries.slice(0, 3).map((entry) => (
                  <PurchaseRow
                    key={entry.purchase.id}
                    entry={entry}
                    onDownload={({ purchase, product }) =>
                      download(purchase.id, purchase.productId, {
                        id: `${product.slug}-source-${product.version}`,
                        kind: "source",
                        label: "Source code",
                        fileName: `${product.slug}-v${product.version}-source.zip`,
                        fileType: "ZIP",
                        size: "18.0 MB",
                        version: product.version,
                      })
                    }
                  />
                ))}
              </div>
            )}
          </Panel>

          {/* Recently viewed */}
          <Panel>
            <PanelHeader
              title="Continue where you left off"
              description="Templates you recently viewed in the marketplace."
              icon={Clock}
            />
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              {recentlyViewed.map((product) => (
                <Link
                  key={product.id}
                  to="/templates/$slug"
                  params={{ slug: product.slug }}
                  className="group flex gap-3 rounded-md border border-border bg-surface-2/40 p-3 transition-colors hover:border-border-strong"
                >
                  <div className="w-24 shrink-0">
                    <ProductThumb product={product} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium transition-colors group-hover:text-brand">
                      {product.name}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {product.tagline}
                    </p>
                    <p className="mt-1.5 text-xs font-medium">
                      {formatPrice(product.salePrice ?? product.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </Panel>

          {/* Order activity */}
          <Panel>
            <PanelHeader
              title="Recent activity"
              description="Order and billing events on your account."
              icon={Receipt}
              action={
                <Button asChild size="sm" variant="ghost">
                  <Link to="/account/orders">
                    Orders &amp; billing <ArrowUpRight />
                  </Link>
                </Button>
              }
            />
            {ordersQ.isPending ? (
              <div className="space-y-3 p-5">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <ol className="divide-y divide-border">
                {(ordersQ.data ?? []).slice(0, 4).map((order) => (
                  <li
                    key={order.id}
                    className="flex flex-wrap items-center gap-x-3 gap-y-2 px-5 py-3.5"
                  >
                    <span className="font-mono text-xs">{order.reference}</span>
                    <StatusBadge tone={orderStatusTone[order.status]}>
                      {orderStatusLabel[order.status]}
                    </StatusBadge>
                    <span className="text-xs text-muted-foreground">
                      {order.lines.length} item{order.lines.length > 1 ? "s" : ""} ·{" "}
                      {formatDate(order.placedAt)}
                    </span>
                    <span className="ml-auto text-sm font-medium tabular-nums">
                      {formatPrice(order.total)}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          {/* Quick downloads */}
          <Panel>
            <PanelHeader
              title="Quick download"
              description="Latest source build for your newest purchases."
              icon={Download}
            />
            {downloadsQ.isPending ? (
              <div className="space-y-3 p-5">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : downloadsQ.isError ? (
              <div className="p-5">
                <ErrorState onRetry={() => void downloadsQ.refetch()} />
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {(downloadsQ.data ?? []).slice(0, 4).map((item) => {
                  const product = productById(item.productId);
                  const file = item.files[0]!;
                  if (!product) return null;
                  return (
                    <li key={item.purchaseId} className="flex items-center gap-3 px-5 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          v{item.latestVersion} · {file.fileType} · {file.size}
                        </p>
                      </div>
                      <Button
                        size="icon-sm"
                        variant="subtle"
                        aria-label={`Download ${product.name} source code`}
                        disabled={pendingFileId === file.id}
                        onClick={() => download(item.purchaseId, item.productId, file)}
                      >
                        <Download />
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          {/* Wishlist preview */}
          <Panel>
            <PanelHeader
              title="Wishlist"
              description="Saved templates you have not purchased."
              icon={Heart}
              action={
                <Button asChild size="sm" variant="ghost">
                  <Link to="/account/wishlist">Open</Link>
                </Button>
              }
            />
            {!hydrated ? (
              <div className="space-y-3 p-5">
                {[0, 1].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : wishlistProducts.length === 0 ? (
              <div className="p-5 text-sm text-muted-foreground">
                Nothing saved yet. Tap the heart on any template to keep it here.
                <div className="mt-3">
                  <Button asChild size="sm" variant="subtle">
                    <Link to="/templates">
                      Browse marketplace <ArrowUpRight />
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {wishlistProducts.map((product) => (
                  <li key={product.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-16 shrink-0">
                      <ProductThumb product={product} frame={false} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        to="/templates/$slug"
                        params={{ slug: product.slug }}
                        className="block truncate text-sm font-medium transition-colors hover:text-brand"
                      >
                        {product.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(product.salePrice ?? product.price)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {/* Help */}
          <Panel>
            <PanelHeader
              title="Account health"
              description="Everything checks out on this sample account."
              icon={Sparkles}
            />
            <div className="space-y-3 p-5 text-sm">
              <p className="flex items-center gap-2 text-muted-foreground">
                <ScrollText className="h-4 w-4" aria-hidden />
                {active.length} licenses in good standing ·{" "}
                {active.filter((p) => licenseById(p.license).id === "agency").length} agency
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button asChild size="sm" variant="subtle">
                  <Link to="/account/support">
                    <LifeBuoy /> Get help
                  </Link>
                </Button>
                <Button asChild size="sm" variant="ghost">
                  <Link to="/pricing">
                    <BookOpen /> Licensing guide
                  </Link>
                </Button>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
