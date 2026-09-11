import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Receipt } from "lucide-react";
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
  type Tone,
} from "@/features/admin/admin-ui";
import { useAdminCustomerMap } from "@/lib/admin/use-admin-customers";
import { adminOrdersQuery } from "@/lib/admin/queries";
import { formatDateTime, formatMoney, formatNumber } from "@/lib/admin/service";
import type { AdminOrder, AdminOrderStatus } from "@/lib/admin/types";

export const Route = createFileRoute("/admin/orders/")({ component: AdminOrders });

const orderTone: Record<AdminOrderStatus, Tone> = {
  paid: "success",
  pending: "warning",
  failed: "danger",
  refunded: "info",
  cancelled: "neutral",
};

const label = (value: string) => value[0]!.toUpperCase() + value.slice(1);

function AdminOrders() {
  const { data, isPending, isError, refetch } = useQuery(adminOrdersQuery());
  const customerMap = useAdminCustomerMap();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<AdminOrderStatus | "all">("all");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? [])
      .filter((o) => (status === "all" ? true : o.status === status))
      .filter((o) => {
        if (!q) return true;
        const c = customerMap.get(o.customerId);
        return [o.reference, o.invoiceNumber, c?.name, c?.email, o.couponCode]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);
      });
  }, [data, search, status, customerMap]);

  const paid = (data ?? []).filter((o) => o.status === "paid");
  const gross = paid.reduce((s, o) => s + o.total, 0);

  const columns: Column<AdminOrder>[] = [
    {
      key: "reference",
      header: "Order",
      cell: (o) => (
        <div className="min-w-0">
          <Link
            to="/admin/orders/$orderId"
            params={{ orderId: o.id }}
            className="block truncate font-mono text-xs transition-colors hover:text-brand"
          >
            {o.reference}
          </Link>
          <p className="truncate text-[11px] text-muted-foreground">{o.invoiceNumber}</p>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      cell: (o) => {
        const c = customerMap.get(o.customerId);
        return (
          <div className="min-w-0">
            <Link
              to="/admin/customers/$customerId"
              params={{ customerId: o.customerId }}
              className="block truncate text-sm transition-colors hover:text-brand"
            >
              {c?.name ?? o.customerId}
            </Link>
            <p className="truncate text-[11px] text-muted-foreground">{c?.email}</p>
          </div>
        );
      },
    },
    {
      key: "placed",
      header: "Placed",
      cell: (o) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {formatDateTime(o.placedAt)}
        </span>
      ),
    },
    {
      key: "items",
      header: "Items",
      cell: (o) => <span className="font-mono text-sm tabular-nums">{o.lines.length}</span>,
    },
    {
      key: "status",
      header: "Order",
      cell: (o) => <StatusBadge tone={orderTone[o.status]}>{label(o.status)}</StatusBadge>,
    },
    {
      key: "payment",
      header: "Payment",
      cell: (o) => <span className="text-xs text-muted-foreground">{o.paymentLabel}</span>,
    },
    {
      key: "total",
      header: "Total",
      className: "text-right",
      headerClassName: "text-right",
      cell: (o) => <span className="font-mono text-sm tabular-nums">{formatMoney(o.total)}</span>,
    },
    {
      key: "actions",
      header: "",
      headerClassName: "sr-only",
      className: "text-right",
      cell: (o) => (
        <Button asChild variant="ghost" size="sm">
          <Link to="/admin/orders/$orderId" params={{ orderId: o.id }}>
            Details
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow="Commerce"
        title="Orders"
        description="Every order record with licensing, totals and payment state. Sample history only — no charge was ever processed."
        breadcrumbs={[{ label: "Orders" }]}
        actions={
          <Button asChild variant="subtle" size="sm">
            <Link to="/admin/payments">Payments</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Orders" value={formatNumber(data?.length ?? 0)} icon={Receipt} />
        <AdminStatCard label="Paid" value={formatNumber(paid.length)} icon={Receipt} />
        <AdminStatCard label="Gross value" value={formatMoney(gross)} icon={Receipt} />
        <AdminStatCard
          label="Refunded"
          value={formatNumber((data ?? []).filter((o) => o.status === "refunded").length)}
          icon={Receipt}
        />
      </div>

      <Panel className="p-4">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search by order reference, invoice, customer or coupon"
          label="Search orders"
        >
          <Select value={status} onValueChange={(v) => setStatus(v as AdminOrderStatus | "all")}>
            <SelectTrigger className="w-40" aria-label="Filter by order status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </FilterBar>
      </Panel>

      {isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : isPending ? (
        <Panel>
          <TableSkeleton rows={10} cols={6} />
        </Panel>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-5 w-5" />}
          title="No orders match these filters"
          description="Adjust the search term or choose a different status."
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
          <PanelHeader title="Order records" description={`${rows.length} shown`} icon={Receipt} />
          <DataTable
            caption="Marketplace orders"
            columns={columns}
            rows={rows}
            getRowId={(o) => o.id}
            mobileRow={(o) => (
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    to="/admin/orders/$orderId"
                    params={{ orderId: o.id }}
                    className="font-mono text-xs"
                  >
                    {o.reference}
                  </Link>
                  <StatusBadge tone={orderTone[o.status]}>{label(o.status)}</StatusBadge>
                </div>
                <p className="truncate text-sm">{customerMap.get(o.customerId)?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(o.placedAt)} · {o.lines.length} item
                  {o.lines.length === 1 ? "" : "s"}
                </p>
                <p className="font-mono text-sm tabular-nums">{formatMoney(o.total)}</p>
              </div>
            )}
          />
        </Panel>
      )}

      <DemoNote>
        Orders are seeded sample records. Refunds, invoices and receipts become real actions once
        the payment provider and email delivery are connected.
      </DemoNote>
    </>
  );
}
