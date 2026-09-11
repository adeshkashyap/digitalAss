import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgePercent,
  CircleDollarSign,
  Download,
  Package,
  Plus,
  Receipt,
  ShieldAlert,
  Users,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RevenueAreaChart } from "@/features/admin/charts";
import {
  AdminPageHeader,
  AdminStatCard,
  DemoNote,
  ErrorState,
  Panel,
  PanelHeader,
  StatsSkeleton,
  StatusBadge,
  TableSkeleton,
  type Tone,
} from "@/features/admin/admin-ui";
import { useAdminCustomerMap } from "@/lib/admin/use-admin-customers";
import { dashboardQuery } from "@/lib/admin/queries";
import { formatDateTime, formatMoney, formatNumber } from "@/lib/admin/service";
import type { AdminOrderStatus, ReportRange } from "@/lib/admin/types";
import { useProductsByIds } from "@/lib/catalog/use-products-by-ids";

export const Route = createFileRoute("/admin/")({ component: AdminOverview });

const orderTone: Record<AdminOrderStatus, Tone> = {
  paid: "success",
  pending: "warning",
  failed: "danger",
  refunded: "info",
  cancelled: "neutral",
};

const severityTone: Record<"info" | "warning" | "danger", Tone> = {
  info: "brand",
  warning: "warning",
  danger: "danger",
};

const ranges: { value: ReportRange; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
];

function AdminOverview() {
  const [range, setRange] = useState<ReportRange>("30d");
  const { data, isPending, isError, refetch } = useQuery(dashboardQuery(range));
  const customerMap = useAdminCustomerMap();
  const productIds = useMemo(
    () => [...new Set((data?.topProducts ?? []).map((row) => row.productId))],
    [data?.topProducts],
  );
  const { productsById } = useProductsByIds(productIds);

  return (
    <>
      <AdminPageHeader
        eyebrow="Operations"
        title="Marketplace overview"
        description="Trading performance, catalog health and the queues that need an operator today."
        breadcrumbs={[{ label: "Overview" }]}
        actions={
          <>
            <Button asChild variant="subtle" size="sm">
              <Link to="/admin/reports">
                Full reports <ArrowUpRight />
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/admin/products/new">
                <Plus /> New product
              </Link>
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={range} onValueChange={(v) => setRange(v as ReportRange)}>
          <TabsList>
            {ranges.map((r) => (
              <TabsTrigger key={r.value} value={r.value}>
                {r.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <DemoNote className="flex-1 lg:max-w-xl">
          All figures below are generated sample data. Nothing is billed, delivered or emailed until
          the production backend is connected.
        </DemoNote>
      </div>

      {isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : isPending || !data ? (
        <>
          <StatsSkeleton />
          <Panel>
            <PanelHeader title="Revenue" />
            <TableSkeleton rows={5} cols={3} />
          </Panel>
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <AdminStatCard
              label="Revenue"
              value={formatMoney(data.kpis.revenue)}
              icon={CircleDollarSign}
              delta={data.kpis.revenueDelta}
              to="/admin/reports"
            />
            <AdminStatCard
              label="Orders"
              value={formatNumber(data.kpis.orders)}
              icon={Receipt}
              delta={data.kpis.ordersDelta}
              to="/admin/orders"
            />
            <AdminStatCard
              label="Customers"
              value={formatNumber(data.kpis.customers)}
              icon={Users}
              delta={data.kpis.customersDelta}
              to="/admin/customers"
            />
            <AdminStatCard
              label="Live products"
              value={formatNumber(data.productHealth.published)}
              hint={`${data.productHealth.draft} drafts`}
              icon={Package}
              to="/admin/products"
            />
            <AdminStatCard
              label="Downloads"
              value={formatNumber(data.kpis.downloads)}
              icon={Download}
              delta={data.kpis.downloadsDelta}
              to="/admin/downloads"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <Panel>
              <PanelHeader
                title="Revenue trend"
                description={`Daily gross revenue over the last ${range === "7d" ? "7" : range === "30d" ? "30" : "90"} days.`}
                icon={CircleDollarSign}
              />
              <div className="p-4">
                <RevenueAreaChart series={data.series} />
              </div>
            </Panel>

            <Panel>
              <PanelHeader
                title="Needs attention"
                description="Queues an operator should clear."
                icon={ShieldAlert}
              />
              <ul className="divide-y divide-border">
                {data.alerts.length === 0 && (
                  <li className="px-5 py-6 text-sm text-muted-foreground">
                    Nothing is waiting. Catalog, payments and moderation queues are clear.
                  </li>
                )}
                {data.alerts.map((alert) => (
                  <li key={alert.id} className="flex items-start gap-3 px-5 py-4">
                    <AlertTriangle
                      className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium">{alert.title}</p>
                        <StatusBadge tone={severityTone[alert.severity]}>
                          {alert.severity === "danger"
                            ? "Urgent"
                            : alert.severity === "warning"
                              ? "Review"
                              : "Info"}
                        </StatusBadge>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {alert.detail}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Panel>
              <PanelHeader
                title="Top products by revenue"
                description="Lifetime performance from the sample ledger."
                icon={Package}
                action={
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/admin/products">All products</Link>
                  </Button>
                }
              />
              <ul className="divide-y divide-border">
                {data.topProducts.map((row, i) => {
                  const product = productsById.get(row.productId);
                  return (
                    <li key={row.productId} className="flex items-center gap-4 px-5 py-3.5">
                      <span className="font-mono text-xs text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <Link
                          to="/admin/products/$productId"
                          params={{ productId: row.productId }}
                          className="block truncate text-sm font-medium transition-colors hover:text-brand"
                        >
                          {product?.name ?? row.productId}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {formatNumber(row.sales)} sales · {formatNumber(row.downloads)} downloads
                        </p>
                      </div>
                      <span className="shrink-0 font-mono text-sm tabular-nums">
                        {formatMoney(row.revenue)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </Panel>

            <Panel>
              <PanelHeader
                title="Recent orders"
                description="Latest sample order records."
                icon={Receipt}
                action={
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/admin/orders">All orders</Link>
                  </Button>
                }
              />
              <ul className="divide-y divide-border">
                {data.recentOrders.map((order) => (
                  <li key={order.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="min-w-0 flex-1">
                      <Link
                        to="/admin/orders/$orderId"
                        params={{ orderId: order.id }}
                        className="block truncate font-mono text-xs transition-colors hover:text-brand"
                      >
                        {order.reference}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">
                        {customerMap.get(order.customerId)?.name ?? "Customer"} ·{" "}
                        {formatDateTime(order.placedAt)}
                      </p>
                    </div>
                    <StatusBadge tone={orderTone[order.status]}>
                      {order.status[0]!.toUpperCase() + order.status.slice(1)}
                    </StatusBadge>
                    <span className="shrink-0 font-mono text-sm tabular-nums">
                      {formatMoney(order.total)}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <Panel>
              <PanelHeader title="Catalog health" icon={Package} />
              <dl className="space-y-3 p-5 text-sm">
                {[
                  ["Published", data.productHealth.published],
                  ["Drafts", data.productHealth.draft],
                  ["Archived", data.productHealth.archived],
                  ["With warnings", data.productHealth.attention],
                ].map(([label, value]) => (
                  <div key={String(label)} className="flex items-center justify-between">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="font-mono tabular-nums">{value}</dd>
                  </div>
                ))}
              </dl>
            </Panel>

            <Panel>
              <PanelHeader title="Delivery activity" icon={Download} />
              <dl className="space-y-3 p-5 text-sm">
                {[
                  ["Completed", data.downloadActivity.completed],
                  ["Blocked", data.downloadActivity.blocked],
                  ["Flagged for review", data.downloadActivity.review],
                ].map(([label, value]) => (
                  <div key={String(label)} className="flex items-center justify-between">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="font-mono tabular-nums">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="border-t border-border p-4">
                <Button asChild variant="subtle" size="sm" className="w-full justify-between">
                  <Link to="/admin/downloads">
                    Download monitoring <ArrowUpRight />
                  </Link>
                </Button>
              </div>
            </Panel>

            <Panel>
              <PanelHeader title="Newest customers" icon={Users} />
              <ul className="divide-y divide-border">
                {data.recentCustomers.map((customer) => (
                  <li key={customer.id} className="px-5 py-3">
                    <Link
                      to="/admin/customers/$customerId"
                      params={{ customerId: customer.id }}
                      className="block truncate text-sm font-medium transition-colors hover:text-brand"
                    >
                      {customer.name}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      {customer.company ?? customer.country} · joined {customer.joinedAt}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="border-t border-border p-4">
                <Button asChild variant="subtle" size="sm" className="w-full justify-between">
                  <Link to="/admin/coupons">
                    Manage coupons <BadgePercent />
                  </Link>
                </Button>
              </div>
            </Panel>
          </div>
        </>
      )}
    </>
  );
}
