import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, FileText, LifeBuoy, Receipt, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AccountPageHeader,
  DemoNote,
  ErrorState,
  Panel,
  PanelHeader,
  ProductThumb,
  RowsSkeleton,
  StatusBadge,
  orderStatusLabel,
  orderStatusTone,
} from "@/features/account/account-ui";
import { ordersQuery } from "@/lib/account/queries";
import type { Order, OrderStatus } from "@/lib/account/types";
import { licenseById } from "@/lib/catalog/licenses";
import { useProductsByIds } from "@/lib/catalog/use-products-by-ids";
import { formatDate, formatPrice } from "@/lib/catalog/service";

export const Route = createFileRoute("/account/orders")({
  head: () => ({
    meta: [
      { title: "Orders & billing — DevAssets account" },
      { name: "description", content: "Order history, invoices and license summaries." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: OrdersPage,
});

const statusFilters: (OrderStatus | "all")[] = [
  "all",
  "paid",
  "pending",
  "failed",
  "refunded",
  "cancelled",
];

function OrderDetails({ order }: { order: Order }) {
  const productIds = useMemo(() => order.lines.map((l) => l.productId), [order.lines]);
  const { productsById } = useProductsByIds(productIds);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge tone={orderStatusTone[order.status]}>
          {orderStatusLabel[order.status]}
        </StatusBadge>
        <span className="text-xs text-muted-foreground">
          Placed {formatDate(order.placedAt)} · Invoice {order.invoiceNumber}
        </span>
      </div>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Products</h3>
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
          {order.lines.map((line) => {
            const product = productsById.get(line.productId);
            return (
              <li key={`${line.productId}-${line.license}`} className="flex gap-3 p-3">
                <div className="w-24 shrink-0">{product && <ProductThumb product={product} />}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {product ? (
                      <Link
                        to="/templates/$slug"
                        params={{ slug: product.slug }}
                        className="transition-colors hover:text-brand"
                      >
                        {product.name}
                      </Link>
                    ) : (
                      "Template"
                    )}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {licenseById(line.license).name} license · Qty {line.quantity}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-medium tabular-nums">
                  {formatPrice(line.unitPrice * line.quantity)}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-lg border border-border bg-surface-2/40 p-4">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="tabular-nums">{formatPrice(order.subtotal)}</dd>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                Discount{order.discountCode ? ` (${order.discountCode})` : ""}
              </dt>
              <dd className="tabular-nums text-success">−{formatPrice(order.discount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Tax</dt>
            <dd className="tabular-nums">{formatPrice(order.tax)}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatPrice(order.total)}</dd>
          </div>
        </dl>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Payment</h3>
        <p className="text-sm text-muted-foreground">{order.paymentMethodLabel}</p>
        <DemoNote>
          No payment instrument is stored or charged in this phase. Card details, receipts and
          refunds will be handled by the payment provider once it is connected.
        </DemoNote>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant="subtle">
          <Link to="/account/downloads">
            <Download /> Go to downloads
          </Link>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() =>
            toast.info("Invoice download is a demo action", {
              description: `${order.invoiceNumber} will be generated by the billing service later.`,
            })
          }
        >
          <FileText /> Invoice / receipt
        </Button>
        <Button asChild size="sm" variant="ghost">
          <Link to="/account/support">
            <LifeBuoy /> Request support
          </Link>
        </Button>
      </div>
    </div>
  );
}

function OrdersPage() {
  const ordersQ = useQuery(ordersQuery());
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const productIds = useMemo(
    () => [...new Set((ordersQ.data ?? []).flatMap((o) => o.lines.map((l) => l.productId)))],
    [ordersQ.data],
  );
  const { productsById } = useProductsByIds(productIds);

  const orders = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (ordersQ.data ?? []).filter((o) => {
      if (status !== "all" && o.status !== status) return false;
      if (!term) return true;
      const names = o.lines
        .map((l) => productsById.get(l.productId)?.name ?? "")
        .join(" ")
        .toLowerCase();
      return `${o.reference} ${o.invoiceNumber} ${names}`.toLowerCase().includes(term);
    });
  }, [ordersQ.data, search, status, productsById]);

  const selected = (ordersQ.data ?? []).find((o) => o.id === openId) ?? null;

  return (
    <div className="space-y-6">
      <AccountPageHeader
        breadcrumb="Orders"
        title="Orders & billing"
        description="Your order records with license summaries, totals and invoice references. Sample history until billing is connected."
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
            placeholder="Search by order, invoice or template"
            aria-label="Search orders"
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus | "all")}>
          <SelectTrigger className="sm:w-48" aria-label="Filter by payment status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusFilters.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "all" ? "All statuses" : orderStatusLabel[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Panel className="overflow-hidden">
        <PanelHeader
          title="Order history"
          description={`${orders.length} order${orders.length === 1 ? "" : "s"}`}
          icon={Receipt}
        />
        {ordersQ.isPending ? (
          <RowsSkeleton rows={5} />
        ) : ordersQ.isError ? (
          <div className="p-5">
            <ErrorState onRetry={() => void ordersQ.refetch()} />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<Receipt className="h-5 w-5" />}
              title="No orders match"
              description="Try another search term or reset the status filter."
              action={
                <Button
                  variant="subtle"
                  onClick={() => {
                    setSearch("");
                    setStatus("all");
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    {["Order", "Date", "Items", "Licenses", "Status", "Total", ""].map((h, i) => (
                      <th key={h || i} scope="col" className="eyebrow px-5 py-2.5 text-[0.625rem]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((order) => (
                    <tr key={order.id} className="transition-colors hover:bg-surface-2/30">
                      <td className="whitespace-nowrap px-5 py-3 font-mono text-xs">
                        {order.reference}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-xs text-muted-foreground">
                        {formatDate(order.placedAt)}
                      </td>
                      <td className="px-5 py-3 text-xs">
                        {order.lines
                          .map((l) => productsById.get(l.productId)?.name ?? "Template")
                          .join(", ")}
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {[...new Set(order.lines.map((l) => licenseById(l.license).name))].join(
                          ", ",
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge tone={orderStatusTone[order.status]}>
                          {orderStatusLabel[order.status]}
                        </StatusBadge>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-sm font-medium tabular-nums">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Button size="sm" variant="subtle" onClick={() => setOpenId(order.id)}>
                          View details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="divide-y divide-border lg:hidden">
              {orders.map((order) => (
                <li key={order.id} className="space-y-3 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs">{order.reference}</span>
                    <StatusBadge tone={orderStatusTone[order.status]}>
                      {orderStatusLabel[order.status]}
                    </StatusBadge>
                  </div>
                  <p className="text-sm">
                    {order.lines
                      .map((l) => productsById.get(l.productId)?.name ?? "Template")
                      .join(", ")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(order.placedAt)} ·{" "}
                    {[...new Set(order.lines.map((l) => licenseById(l.license).name))].join(", ")}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold tabular-nums">
                      {formatPrice(order.total)}
                    </span>
                    <Button size="sm" variant="subtle" onClick={() => setOpenId(order.id)}>
                      View details
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Panel>

      <Sheet open={!!openId} onOpenChange={(open) => !open && setOpenId(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Order {selected?.reference ?? ""}</SheetTitle>
            <SheetDescription>
              Order summary, licenses and totals for this purchase record.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-8 sm:px-6">{selected && <OrderDetails order={selected} />}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
