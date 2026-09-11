import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CreditCard, Wallet } from "lucide-react";
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
  ErrorState,
  FilterBar,
  NotConnectedBanner,
  Panel,
  PanelHeader,
  StatusBadge,
  TableSkeleton,
  paymentStatusLabel,
  paymentStatusTone,
  type Column,
} from "@/features/admin/admin-ui";
import { adminCustomers } from "@/lib/admin/mock-data";
import { paymentsQuery } from "@/lib/admin/queries";
import { formatDateTime, formatMoney, formatNumber } from "@/lib/admin/service";
import type { AdminTransaction, PaymentStatus } from "@/lib/admin/types";

export const Route = createFileRoute("/admin/payments")({ component: AdminPayments });

const customerName = (id: string) => adminCustomers.find((c) => c.id === id)?.name ?? id;

const providerLabel: Record<AdminTransaction["provider"], string> = {
  "stripe-placeholder": "Card (placeholder)",
  "manual-record": "Manual record",
};

function AdminPayments() {
  const { data, isPending, isError, refetch } = useQuery(paymentsQuery());
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PaymentStatus | "all">("all");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? [])
      .filter((t) => (status === "all" ? true : t.status === status))
      .filter((t) =>
        q
          ? [t.reference, t.orderId, customerName(t.customerId)].join(" ").toLowerCase().includes(q)
          : true,
      );
  }, [data, search, status]);

  const settled = (data ?? []).filter((t) => t.status === "succeeded");
  const volume = settled.reduce((s, t) => s + t.amount, 0);

  const columns: Column<AdminTransaction>[] = [
    {
      key: "reference",
      header: "Transaction",
      cell: (t) => (
        <div className="min-w-0">
          <p className="truncate font-mono text-xs">{t.reference}</p>
          <Link
            to="/admin/orders/$orderId"
            params={{ orderId: t.orderId }}
            className="text-[11px] text-muted-foreground transition-colors hover:text-brand"
          >
            {t.orderId}
          </Link>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      cell: (t) => (
        <Link
          to="/admin/customers/$customerId"
          params={{ customerId: t.customerId }}
          className="block truncate text-sm transition-colors hover:text-brand"
        >
          {customerName(t.customerId)}
        </Link>
      ),
    },
    {
      key: "provider",
      header: "Method",
      cell: (t) => (
        <span className="text-xs text-muted-foreground">{providerLabel[t.provider]}</span>
      ),
    },
    {
      key: "at",
      header: "Recorded",
      cell: (t) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {formatDateTime(t.at)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (t) => (
        <StatusBadge tone={paymentStatusTone[t.status]}>{paymentStatusLabel[t.status]}</StatusBadge>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      className: "text-right",
      headerClassName: "text-right",
      cell: (t) => <span className="font-mono text-sm tabular-nums">{formatMoney(t.amount)}</span>,
    },
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow="Commerce"
        title="Payments & transactions"
        description="The transaction ledger behind marketplace orders. Sample records only — no provider is connected and no card data exists."
        breadcrumbs={[{ label: "Payments" }]}
        actions={
          <Button asChild variant="subtle" size="sm">
            <Link to="/admin/settings">Payment settings</Link>
          </Button>
        }
      />

      <NotConnectedBanner title="Stripe is not connected">
        Transactions here are placeholders that mirror the order ledger. Charges, payouts, disputes
        and refunds require the payment provider and server-side keys, which arrive in the backend
        phase.
      </NotConnectedBanner>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Transactions"
          value={formatNumber(data?.length ?? 0)}
          icon={CreditCard}
        />
        <AdminStatCard label="Settled volume" value={formatMoney(volume)} icon={Wallet} />
        <AdminStatCard
          label="Failed"
          value={formatNumber((data ?? []).filter((t) => t.status === "failed").length)}
          icon={CreditCard}
        />
        <AdminStatCard
          label="Refunded"
          value={formatNumber((data ?? []).filter((t) => t.status === "refunded").length)}
          icon={CreditCard}
        />
      </div>

      <Panel className="p-4">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search by transaction reference, order or customer"
          label="Search transactions"
        >
          <Select value={status} onValueChange={(v) => setStatus(v as PaymentStatus | "all")}>
            <SelectTrigger className="w-40" aria-label="Filter by payment status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="succeeded">Succeeded</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </FilterBar>
      </Panel>

      {isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : isPending ? (
        <Panel>
          <TableSkeleton rows={10} cols={5} />
        </Panel>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="h-5 w-5" />}
          title="No transactions match these filters"
          description="Adjust the search term or reset the status filter."
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
          <PanelHeader
            title="Transaction ledger"
            description={`${rows.length} shown`}
            icon={CreditCard}
          />
          <DataTable
            caption="Payment transactions"
            columns={columns}
            rows={rows}
            getRowId={(t) => t.id}
            mobileRow={(t) => (
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 truncate font-mono text-xs">{t.reference}</p>
                  <StatusBadge tone={paymentStatusTone[t.status]}>
                    {paymentStatusLabel[t.status]}
                  </StatusBadge>
                </div>
                <p className="truncate text-sm">{customerName(t.customerId)}</p>
                <p className="text-xs text-muted-foreground">
                  {providerLabel[t.provider]} · {formatDateTime(t.at)}
                </p>
                <p className="font-mono text-sm tabular-nums">{formatMoney(t.amount)}</p>
              </div>
            )}
          />
        </Panel>
      )}
    </>
  );
}
