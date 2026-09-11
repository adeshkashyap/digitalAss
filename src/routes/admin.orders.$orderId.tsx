import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CreditCard,
  Download,
  FileText,
  LifeBuoy,
  Receipt,
  RotateCcw,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/marketplace/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AdminPageHeader,
  DemoNote,
  DetailRow,
  ErrorState,
  NotConnectedBanner,
  Panel,
  PanelHeader,
  StatusBadge,
  paymentStatusLabel,
  paymentStatusTone,
  type Tone,
} from "@/features/admin/admin-ui";
import { adminCustomers } from "@/lib/admin/mock-data";
import { adminOrderQuery } from "@/lib/admin/queries";
import { formatDateTime, formatMoney } from "@/lib/admin/service";
import type { AdminOrderStatus } from "@/lib/admin/types";
import { licenseById } from "@/lib/catalog/licenses";
import { productById } from "@/lib/catalog/products";

export const Route = createFileRoute("/admin/orders/$orderId")({ component: AdminOrderDetail });

const orderTone: Record<AdminOrderStatus, Tone> = {
  paid: "success",
  pending: "warning",
  failed: "danger",
  refunded: "info",
  cancelled: "neutral",
};

function AdminOrderDetail() {
  const { orderId } = Route.useParams();
  const { data: order, isPending, isError, refetch } = useQuery(adminOrderQuery(orderId));

  if (isError) {
    return (
      <>
        <AdminPageHeader
          eyebrow="Commerce"
          title="Order"
          description="Order record detail."
          breadcrumbs={[{ label: "Orders", to: "/admin/orders" }, { label: "Order" }]}
        />
        <ErrorState onRetry={() => void refetch()} />
      </>
    );
  }

  if (isPending) {
    return (
      <>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-72 w-full" />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <AdminPageHeader
          eyebrow="Commerce"
          title="Order not found"
          description="No order in the workspace matches this reference."
          breadcrumbs={[{ label: "Orders", to: "/admin/orders" }, { label: "Not found" }]}
        />
        <EmptyState
          icon={<Receipt className="h-5 w-5" />}
          title="Unknown order reference"
          description="Return to the order list and choose an existing record."
          action={
            <Button asChild>
              <Link to="/admin/orders">Back to orders</Link>
            </Button>
          }
        />
      </>
    );
  }

  const customer = adminCustomers.find((c) => c.id === order.customerId);

  return (
    <>
      <AdminPageHeader
        eyebrow="Commerce"
        title={order.reference}
        description={`Placed ${formatDateTime(order.placedAt)} · invoice ${order.invoiceNumber}`}
        breadcrumbs={[{ label: "Orders", to: "/admin/orders" }, { label: order.reference }]}
        actions={
          <>
            <Button
              variant="subtle"
              size="sm"
              onClick={() =>
                toast.info("Invoice PDF is a demo action", {
                  description: "Document generation and email delivery arrive with the backend phase.",
                })
              }
            >
              <FileText /> Invoice
            </Button>
            <Button
              variant="subtle"
              size="sm"
              onClick={() =>
                toast.info("Refunds are not available yet", {
                  description: "This workspace has no payment provider connected, so nothing can be refunded.",
                })
              }
            >
              <RotateCcw /> Refund
            </Button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-6">
          <Panel>
            <PanelHeader
              title="Purchased items"
              description="Licence and version entitlement per line."
              icon={Receipt}
            />
            <ul className="divide-y divide-border">
              {order.lines.map((line, i) => {
                const product = productById(line.productId);
                return (
                  <li key={`${line.productId}-${i}`} className="flex flex-wrap items-center gap-3 px-5 py-4">
                    <div className="min-w-0 flex-1">
                      <Link
                        to="/admin/products/$productId"
                        params={{ productId: line.productId }}
                        className="block truncate text-sm font-medium transition-colors hover:text-brand"
                      >
                        {product?.name ?? line.productId}
                      </Link>
                      <p className="font-mono text-[11px] text-muted-foreground">
                        v{line.version} · {licenseById(line.license)?.name ?? line.license} license ·
                        qty {line.quantity}
                      </p>
                    </div>
                    <span className="font-mono text-sm tabular-nums">
                      {formatMoney(line.unitPrice * line.quantity)}
                    </span>
                  </li>
                );
              })}
            </ul>
            <dl className="space-y-0 border-t border-border px-5 py-4">
              <DetailRow label="Subtotal">
                <span className="font-mono tabular-nums">{formatMoney(order.subtotal)}</span>
              </DetailRow>
              <DetailRow label={order.couponCode ? `Discount (${order.couponCode})` : "Discount"}>
                <span className="font-mono tabular-nums">-{formatMoney(order.discount)}</span>
              </DetailRow>
              <DetailRow label="Tax">
                <span className="font-mono tabular-nums">{formatMoney(order.tax)}</span>
              </DetailRow>
              <DetailRow label="Total">
                <span className="font-mono text-base font-semibold tabular-nums">
                  {formatMoney(order.total)}
                </span>
              </DetailRow>
            </dl>
          </Panel>

          <Panel>
            <PanelHeader title="Order timeline" description="Recorded state changes." icon={Receipt} />
            <ol className="divide-y divide-border">
              {order.events.map((event, i) => (
                <li key={`${event.at}-${i}`} className="px-5 py-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{event.label}</p>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {formatDateTime(event.at)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{event.detail}</p>
                </li>
              ))}
            </ol>
          </Panel>

          <NotConnectedBanner title="Payment provider not connected">
            Payment instrument details are never stored in this phase. Only the non-sensitive label
            “{order.paymentLabel}” exists on this record.
          </NotConnectedBanner>
        </div>

        <aside className="space-y-6">
          <Panel>
            <PanelHeader title="Status" icon={CreditCard} />
            <div className="space-y-4 p-5">
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone={orderTone[order.status]}>
                  Order: {order.status[0]!.toUpperCase() + order.status.slice(1)}
                </StatusBadge>
                <StatusBadge tone={paymentStatusTone[order.paymentStatus]}>
                  Payment: {paymentStatusLabel[order.paymentStatus]}
                </StatusBadge>
              </div>
              <dl>
                <DetailRow label="Placed">{formatDateTime(order.placedAt)}</DetailRow>
                <DetailRow label="Invoice">
                  <span className="font-mono text-xs">{order.invoiceNumber}</span>
                </DetailRow>
                <DetailRow label="Method">{order.paymentLabel}</DetailRow>
                <DetailRow label="Currency">{order.currency}</DetailRow>
              </dl>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Customer" icon={User} />
            <div className="space-y-4 p-5">
              <div>
                <Link
                  to="/admin/customers/$customerId"
                  params={{ customerId: order.customerId }}
                  className="text-sm font-medium transition-colors hover:text-brand"
                >
                  {customer?.name ?? order.customerId}
                </Link>
                <p className="truncate text-xs text-muted-foreground">{customer?.email}</p>
              </div>
              <dl>
                <DetailRow label="Company">{customer?.company ?? "—"}</DetailRow>
                <DetailRow label="Country">{customer?.country ?? "—"}</DetailRow>
                <DetailRow label="Lifetime spend">
                  <span className="font-mono tabular-nums">{formatMoney(customer?.spend ?? 0)}</span>
                </DetailRow>
              </dl>
              <div className="grid gap-2">
                <Button asChild variant="subtle" size="sm" className="justify-start">
                  <Link to="/admin/downloads">
                    <Download /> Delivery activity
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  onClick={() =>
                    toast.info("Support handoff is a demo action", {
                      description: "Ticketing connects in the backend phase.",
                    })
                  }
                >
                  <LifeBuoy /> Open support thread
                </Button>
              </div>
            </div>
          </Panel>

          <DemoNote>
            This order is seeded sample data used to exercise the operations UI.
          </DemoNote>
        </aside>
      </div>
    </>
  );
}
