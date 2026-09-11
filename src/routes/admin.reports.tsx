import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, Download, LineChart, Receipt, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AdminPageHeader,
  AdminStatCard,
  DemoNote,
  ErrorState,
  Panel,
  PanelHeader,
  StatsSkeleton,
  TableSkeleton,
} from "@/features/admin/admin-ui";
import { CategoryBarChart, OrdersLineChart, RevenueAreaChart } from "@/features/admin/charts";
import { reportsQuery } from "@/lib/admin/queries";
import { formatMoney, formatNumber } from "@/lib/admin/service";
import type { ReportRange } from "@/lib/admin/types";
import { productById } from "@/lib/catalog/products";

export const Route = createFileRoute("/admin/reports")({ component: AdminReports });

const ranges: { value: ReportRange; label: string }[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "year", label: "12 months" },
];

function AdminReports() {
  const [range, setRange] = useState<ReportRange>("30d");
  const { data, isPending, isError, refetch } = useQuery(reportsQuery(range));

  return (
    <>
      <AdminPageHeader
        eyebrow="Insight"
        title="Sales & reports"
        description="Revenue trend, order volume, category performance and license mix for the selected window."
        breadcrumbs={[{ label: "Reports" }]}
        actions={
          <Button
            size="sm"
            variant="subtle"
            onClick={() =>
              toast.info("Export not connected", {
                description: "CSV export needs the reporting API from the backend phase.",
              })
            }
          >
            <Download /> Export CSV
          </Button>
        }
      />

      <Tabs value={range} onValueChange={(v) => setRange(v as ReportRange)}>
        <TabsList>
          {ranges.map((r) => (
            <TabsTrigger key={r.value} value={r.value}>
              {r.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : isPending || !data ? (
        <>
          <StatsSkeleton count={4} />
          <Panel>
            <TableSkeleton rows={6} cols={4} />
          </Panel>
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AdminStatCard label="Revenue" value={formatMoney(data.revenue)} icon={LineChart} />
            <AdminStatCard label="Orders" value={formatNumber(data.orders)} icon={Receipt} />
            <AdminStatCard label="Average order" value={formatMoney(data.aov)} icon={BarChart3} />
            <AdminStatCard label="Refunds" value={formatMoney(data.refunds)} icon={RotateCcw} />
          </div>

          <Panel>
            <PanelHeader
              title="Revenue trend"
              description="Gross revenue before refunds"
              icon={LineChart}
            />
            <div className="px-3 pb-4 pt-1">
              <RevenueAreaChart series={data.series} />
            </div>
          </Panel>

          <div className="grid gap-4 xl:grid-cols-2">
            <Panel>
              <PanelHeader title="Order volume" description="Completed orders" icon={Receipt} />
              <div className="px-3 pb-4 pt-1">
                <OrdersLineChart series={data.series} />
              </div>
            </Panel>
            <Panel>
              <PanelHeader
                title="Category performance"
                description="Revenue by catalog category"
                icon={BarChart3}
              />
              <div className="px-3 pb-4 pt-1">
                <CategoryBarChart
                  data={data.categoryPerformance
                    .slice()
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 6)
                    .map((c) => ({ name: c.name, revenue: c.revenue }))}
                />
              </div>
            </Panel>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Panel>
              <PanelHeader title="Top products" description="Ranked by revenue" icon={BarChart3} />
              <ul className="divide-y divide-border">
                {data.topProducts.map((row, index) => (
                  <li key={row.productId} className="flex items-center gap-4 px-5 py-3.5">
                    <span className="w-5 shrink-0 font-mono text-xs text-muted-foreground">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link
                        to="/admin/products/$productId"
                        params={{ productId: row.productId }}
                        className="truncate text-sm font-medium transition-colors hover:text-brand"
                      >
                        {productById(row.productId)?.name ?? row.productId}
                      </Link>
                      <p className="text-[11px] text-muted-foreground">
                        {formatNumber(row.sales)} sales · {formatNumber(row.downloads)} downloads
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-sm tabular-nums">
                      {formatMoney(row.revenue)}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel>
              <PanelHeader
                title="License mix"
                description="Revenue split by license tier"
                icon={Receipt}
              />
              <ul className="divide-y divide-border">
                {data.licenseMix.map((row) => {
                  const share = data.revenue ? Math.round((row.revenue / data.revenue) * 100) : 0;
                  return (
                    <li key={row.license} className="space-y-2 px-5 py-3.5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">{row.name}</p>
                        <span className="font-mono text-sm tabular-nums">
                          {formatMoney(row.revenue)}
                        </span>
                      </div>
                      <div
                        className="h-1.5 overflow-hidden rounded-full bg-surface-2"
                        role="img"
                        aria-label={`${row.name}: ${share}% of revenue`}
                      >
                        <div
                          className="h-full rounded-full bg-brand"
                          style={{ width: `${share}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {formatNumber(row.sales)} sales · {share}% of revenue
                      </p>
                    </li>
                  );
                })}
              </ul>
            </Panel>
          </div>
        </>
      )}

      <DemoNote>
        Figures come from the sample order ledger in this browser. Connecting the reporting API
        replaces them with live aggregates and enables scheduled exports.
      </DemoNote>
    </>
  );
}
