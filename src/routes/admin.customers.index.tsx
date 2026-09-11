import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/marketplace/empty-state";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AdminPageHeader,
  AdminStatCard,
  DataTable,
  DemoNote,
  ErrorState,
  FilterBar,
  Panel,
  PanelHeader,
  StatusBadge,
  TableSkeleton,
  type Column,
} from "@/features/admin/admin-ui";
import { adminCustomersQuery } from "@/lib/admin/queries";
import { formatMoney, formatNumber } from "@/lib/admin/service";
import type { AdminCustomer } from "@/lib/admin/types";

export const Route = createFileRoute("/admin/customers/")({ component: AdminCustomersPage });

type SortKey = "spend" | "orders" | "recent" | "name";

function AdminCustomersPage() {
  const { data, isPending, isError, refetch } = useQuery(adminCustomersQuery());
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "suspended">("all");
  const [sort, setSort] = useState<SortKey>("spend");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const sorters: Record<SortKey, (a: AdminCustomer, b: AdminCustomer) => number> = {
      spend: (a, b) => b.spend - a.spend,
      orders: (a, b) => b.orders - a.orders,
      recent: (a, b) => b.lastActiveAt.localeCompare(a.lastActiveAt),
      name: (a, b) => a.name.localeCompare(b.name),
    };
    return (data ?? [])
      .filter((c) => (status === "all" ? true : c.status === status))
      .filter((c) =>
        q ? [c.name, c.email, c.company, c.country].filter(Boolean).join(" ").toLowerCase().includes(q) : true,
      )
      .sort(sorters[sort]);
  }, [data, search, status, sort]);

  const totalSpend = (data ?? []).reduce((s, c) => s + c.spend, 0);

  const columns: Column<AdminCustomer>[] = [
    {
      key: "name",
      header: "Customer",
      cell: (c) => (
        <div className="min-w-0">
          <Link
            to="/admin/customers/$customerId"
            params={{ customerId: c.id }}
            className="block truncate text-sm font-medium transition-colors hover:text-brand"
          >
            {c.name}
          </Link>
          <p className="truncate text-[11px] text-muted-foreground">{c.email}</p>
        </div>
      ),
    },
    {
      key: "company",
      header: "Company",
      cell: (c) => <span className="text-sm text-muted-foreground">{c.company ?? "—"}</span>,
    },
    {
      key: "country",
      header: "Country",
      cell: (c) => <span className="text-sm text-muted-foreground">{c.country}</span>,
    },
    {
      key: "orders",
      header: "Orders",
      cell: (c) => <span className="font-mono text-sm tabular-nums">{c.orders}</span>,
    },
    {
      key: "spend",
      header: "Spend",
      cell: (c) => <span className="font-mono text-sm tabular-nums">{formatMoney(c.spend)}</span>,
    },
    {
      key: "downloads",
      header: "Downloads",
      cell: (c) => <span className="font-mono text-sm tabular-nums">{c.downloads}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (c) => (
        <StatusBadge tone={c.status === "active" ? "success" : "warning"}>
          {c.status === "active" ? "Active" : "Suspended"}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "",
      headerClassName: "sr-only",
      className: "text-right",
      cell: (c) => (
        <Button asChild variant="ghost" size="sm">
          <Link to="/admin/customers/$customerId" params={{ customerId: c.id }}>
            Profile
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow="People"
        title="Customers"
        description="Accounts that bought from the marketplace, with order volume, lifetime value and delivery activity."
        breadcrumbs={[{ label: "Customers" }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Customers" value={formatNumber(data?.length ?? 0)} icon={Users} />
        <AdminStatCard
          label="Active"
          value={formatNumber((data ?? []).filter((c) => c.status === "active").length)}
          icon={Users}
        />
        <AdminStatCard label="Lifetime value" value={formatMoney(totalSpend)} icon={Users} />
        <AdminStatCard
          label="Average spend"
          value={formatMoney(data?.length ? Math.round(totalSpend / data.length) : 0)}
          icon={Users}
        />
      </div>

      <Panel className="p-4">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search by name, email, company or country"
          label="Search customers"
        >
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger className="w-36" aria-label="Filter by account status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All accounts</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="w-44" aria-label="Sort customers">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spend">Highest spend</SelectItem>
              <SelectItem value="orders">Most orders</SelectItem>
              <SelectItem value="recent">Recently active</SelectItem>
              <SelectItem value="name">Name A–Z</SelectItem>
            </SelectContent>
          </Select>
        </FilterBar>
      </Panel>

      {isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : isPending ? (
        <Panel>
          <TableSkeleton rows={8} cols={6} />
        </Panel>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<Users className="h-5 w-5" />}
          title="No customers match these filters"
          description="Try a different search term or reset the account status filter."
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
      ) : (
        <Panel>
          <PanelHeader title="Customer accounts" description={`${rows.length} shown`} icon={Users} />
          <DataTable
            caption="Marketplace customers"
            columns={columns}
            rows={rows}
            getRowId={(c) => c.id}
            mobileRow={(c) => (
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    to="/admin/customers/$customerId"
                    params={{ customerId: c.id }}
                    className="min-w-0 truncate text-sm font-medium"
                  >
                    {c.name}
                  </Link>
                  <StatusBadge tone={c.status === "active" ? "success" : "warning"}>
                    {c.status === "active" ? "Active" : "Suspended"}
                  </StatusBadge>
                </div>
                <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                <p className="text-xs text-muted-foreground">
                  {c.orders} orders · {formatMoney(c.spend)} · {c.country}
                </p>
              </div>
            )}
          />
        </Panel>
      )}

      <DemoNote>
        Customer records are sample data. Suspending accounts, resetting access and messaging require
        real authentication and email, which arrive in a later phase.
      </DemoNote>
    </>
  );
}
