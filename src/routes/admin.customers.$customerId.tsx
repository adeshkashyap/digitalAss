import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Ban, Download, Heart, KeyRound, LifeBuoy, Mail, Receipt, Users } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/marketplace/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AdminPageHeader,
  AdminStatCard,
  DemoNote,
  DetailRow,
  ErrorState,
  Panel,
  PanelHeader,
  StatusBadge,
  type Tone,
} from "@/features/admin/admin-ui";
import { adminCustomerQuery } from "@/lib/admin/queries";
import { formatDateTime, formatMoney, formatNumber } from "@/lib/admin/service";
import type { AdminOrderStatus } from "@/lib/admin/types";
import { licenseById } from "@/lib/catalog/licenses";
import { productById } from "@/lib/catalog/products";

export const Route = createFileRoute("/admin/customers/$customerId")({
  component: AdminCustomerDetailPage,
});

const orderTone: Record<AdminOrderStatus, Tone> = {
  paid: "success",
  pending: "warning",
  failed: "danger",
  refunded: "info",
  cancelled: "neutral",
};

const demo = (label: string) => () =>
  toast.info(`${label} is a demo action`, {
    description: "Account administration needs real authentication, which is a later phase.",
  });

function AdminCustomerDetailPage() {
  const { customerId } = Route.useParams();
  const { data, isPending, isError, refetch } = useQuery(adminCustomerQuery(customerId));

  if (isError) {
    return (
      <>
        <AdminPageHeader
          eyebrow="People"
          title="Customer"
          description="Account detail."
          breadcrumbs={[{ label: "Customers", to: "/admin/customers" }, { label: "Customer" }]}
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

  if (!data) {
    return (
      <>
        <AdminPageHeader
          eyebrow="People"
          title="Customer not found"
          description="No account in the workspace matches this reference."
          breadcrumbs={[{ label: "Customers", to: "/admin/customers" }, { label: "Not found" }]}
        />
        <EmptyState
          icon={<Users className="h-5 w-5" />}
          title="Unknown customer reference"
          description="Return to the customer list and choose an existing account."
          action={
            <Button asChild>
              <Link to="/admin/customers">Back to customers</Link>
            </Button>
          }
        />
      </>
    );
  }

  const { customer, orders, licenses, downloads, wishlist, tickets, activity } = data;

  return (
    <>
      <AdminPageHeader
        eyebrow="People"
        title={customer.name}
        description={`${customer.email} · ${customer.company ?? customer.country} · joined ${customer.joinedAt}`}
        breadcrumbs={[{ label: "Customers", to: "/admin/customers" }, { label: customer.name }]}
        actions={
          <>
            <Button variant="subtle" size="sm" onClick={demo("Emailing the customer")}>
              <Mail /> Email
            </Button>
            <Button variant="subtle" size="sm" onClick={demo("Password reset")}>
              <KeyRound /> Reset access
            </Button>
            <Button variant="ghost" size="sm" onClick={demo("Suspending the account")}>
              <Ban /> Suspend
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Orders" value={formatNumber(customer.orders)} icon={Receipt} />
        <AdminStatCard label="Lifetime spend" value={formatMoney(customer.spend)} icon={Receipt} />
        <AdminStatCard label="Licenses" value={formatNumber(licenses.length)} icon={KeyRound} />
        <AdminStatCard label="Downloads" value={formatNumber(customer.downloads)} icon={Download} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-6">
          <Tabs defaultValue="orders">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="licenses">Licenses</TabsTrigger>
              <TabsTrigger value="downloads">Downloads</TabsTrigger>
              <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
              <TabsTrigger value="support">Support</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="mt-6">
              <Panel>
                <PanelHeader title="Order history" description={`${orders.length} records`} icon={Receipt} />
                {orders.length === 0 ? (
                  <p className="px-5 py-8 text-sm text-muted-foreground">No orders yet.</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {orders.map((order) => (
                      <li key={order.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                        <div className="min-w-0 flex-1">
                          <Link
                            to="/admin/orders/$orderId"
                            params={{ orderId: order.id }}
                            className="block font-mono text-xs transition-colors hover:text-brand"
                          >
                            {order.reference}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(order.placedAt)} · {order.lines.length} item
                            {order.lines.length === 1 ? "" : "s"}
                          </p>
                        </div>
                        <StatusBadge tone={orderTone[order.status]}>
                          {order.status[0]!.toUpperCase() + order.status.slice(1)}
                        </StatusBadge>
                        <span className="font-mono text-sm tabular-nums">
                          {formatMoney(order.total)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </TabsContent>

            <TabsContent value="licenses" className="mt-6">
              <Panel>
                <PanelHeader
                  title="Licenses held"
                  description="Derived from paid order lines."
                  icon={KeyRound}
                />
                {licenses.length === 0 ? (
                  <p className="px-5 py-8 text-sm text-muted-foreground">No licenses yet.</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {licenses.map((license) => (
                      <li key={license.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                        <div className="min-w-0 flex-1">
                          <Link
                            to="/admin/products/$productId"
                            params={{ productId: license.productId }}
                            className="block truncate text-sm font-medium transition-colors hover:text-brand"
                          >
                            {productById(license.productId)?.name ?? license.productId}
                          </Link>
                          <p className="font-mono text-[11px] text-muted-foreground">
                            {license.id} · purchased {license.purchasedAt}
                          </p>
                        </div>
                        <StatusBadge>{licenseById(license.type)?.name ?? license.type}</StatusBadge>
                        <StatusBadge tone={license.status === "active" ? "success" : "warning"}>
                          {license.status === "active" ? "Active" : "Updates expired"}
                        </StatusBadge>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </TabsContent>

            <TabsContent value="downloads" className="mt-6">
              <Panel>
                <PanelHeader
                  title="Delivery activity"
                  description="Recorded download attempts."
                  icon={Download}
                />
                {downloads.length === 0 ? (
                  <p className="px-5 py-8 text-sm text-muted-foreground">
                    No download activity recorded.
                  </p>
                ) : (
                  <ul className="divide-y divide-border">
                    {downloads.map((event) => (
                      <li key={event.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm">
                            {productById(event.productId)?.name ?? event.productId}
                          </p>
                          <p className="font-mono text-[11px] text-muted-foreground">
                            {event.fileLabel} · v{event.version} · {formatDateTime(event.at)}
                          </p>
                        </div>
                        <StatusBadge
                          tone={
                            event.status === "completed"
                              ? "success"
                              : event.status === "blocked"
                                ? "danger"
                                : "warning"
                          }
                        >
                          {event.status === "completed"
                            ? "Completed"
                            : event.status === "blocked"
                              ? "Blocked"
                              : "Review"}
                        </StatusBadge>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </TabsContent>

            <TabsContent value="wishlist" className="mt-6">
              <Panel>
                <PanelHeader title="Saved items" description="Sample wishlist entries." icon={Heart} />
                <ul className="divide-y divide-border">
                  {wishlist.map((id) => (
                    <li key={id} className="flex items-center gap-3 px-5 py-3.5">
                      <Link
                        to="/admin/products/$productId"
                        params={{ productId: id }}
                        className="min-w-0 flex-1 truncate text-sm transition-colors hover:text-brand"
                      >
                        {productById(id)?.name ?? id}
                      </Link>
                      <span className="font-mono text-sm tabular-nums">
                        {formatMoney(productById(id)?.salePrice ?? productById(id)?.price ?? 0)}
                      </span>
                    </li>
                  ))}
                </ul>
              </Panel>
            </TabsContent>

            <TabsContent value="support" className="mt-6">
              <Panel>
                <PanelHeader
                  title="Support threads"
                  description="Sample tickets attached to this account."
                  icon={LifeBuoy}
                />
                <ul className="divide-y divide-border">
                  {tickets.map((ticket) => (
                    <li key={ticket.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{ticket.subject}</p>
                        <p className="font-mono text-[11px] text-muted-foreground">
                          {ticket.reference} · {formatDateTime(ticket.createdAt)}
                        </p>
                      </div>
                      <StatusBadge tone={ticket.status === "resolved" ? "success" : "warning"}>
                        {ticket.status === "resolved" ? "Resolved" : "Awaiting reply"}
                      </StatusBadge>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-border p-5">
                  <DemoNote>
                    Replying to customers requires the ticketing backend and email delivery.
                  </DemoNote>
                </div>
              </Panel>
            </TabsContent>
          </Tabs>
        </div>

        <aside className="space-y-6">
          <Panel>
            <PanelHeader title="Account" icon={Users} />
            <div className="p-5">
              <dl>
                <DetailRow label="Status">
                  <StatusBadge tone={customer.status === "active" ? "success" : "warning"}>
                    {customer.status === "active" ? "Active" : "Suspended"}
                  </StatusBadge>
                </DetailRow>
                <DetailRow label="Email">
                  <span className="break-all text-xs">{customer.email}</span>
                </DetailRow>
                <DetailRow label="Company">{customer.company ?? "—"}</DetailRow>
                <DetailRow label="Country">{customer.country}</DetailRow>
                <DetailRow label="Joined">{customer.joinedAt}</DetailRow>
                <DetailRow label="Last active">{customer.lastActiveAt.slice(0, 10)}</DetailRow>
              </dl>
            </div>
          </Panel>

          <Panel>
            <PanelHeader title="Recent activity" />
            <ol className="divide-y divide-border">
              {activity.slice(0, 6).map((item, i) => (
                <li key={`${item.at}-${i}`} className="px-5 py-3">
                  <p className="text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                    {formatDateTime(item.at)}
                  </p>
                </li>
              ))}
            </ol>
          </Panel>
        </aside>
      </div>
    </>
  );
}
