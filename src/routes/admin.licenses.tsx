import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { KeyRound, ShieldCheck, ShieldX, Timer } from "lucide-react";
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
import { adminCustomers } from "@/lib/admin/mock-data";
import { issuedLicensesQuery } from "@/lib/admin/queries";
import type { IssuedLicense } from "@/lib/admin/service";
import { licenses } from "@/lib/catalog/licenses";
import { productById } from "@/lib/catalog/products";

export const Route = createFileRoute("/admin/licenses")({ component: AdminLicenses });

const tone: Record<IssuedLicense["status"], Tone> = {
  active: "success",
  "updates-expired": "warning",
  revoked: "danger",
};

const label: Record<IssuedLicense["status"], string> = {
  active: "Active",
  "updates-expired": "Updates expired",
  revoked: "Revoked",
};

const customerName = (id: string) => adminCustomers.find((c) => c.id === id)?.name ?? id;
const licenseName = (id: string) => licenses.find((l) => l.id === id)?.name ?? id;

function AdminLicenses() {
  const { data, isPending, isError, refetch } = useQuery(issuedLicensesQuery());
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | IssuedLicense["status"]>("all");
  const [type, setType] = useState<string>("all");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? [])
      .filter((l) => (status === "all" ? true : l.status === status))
      .filter((l) => (type === "all" ? true : l.type === type))
      .filter((l) =>
        q
          ? [
              l.reference,
              l.orderReference,
              productById(l.productId)?.name,
              customerName(l.customerId),
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(q)
          : true,
      );
  }, [data, search, status, type]);

  const counts = {
    active: (data ?? []).filter((l) => l.status === "active").length,
    expired: (data ?? []).filter((l) => l.status === "updates-expired").length,
    revoked: (data ?? []).filter((l) => l.status === "revoked").length,
  };

  const columns: Column<IssuedLicense>[] = [
    {
      key: "reference",
      header: "License key",
      cell: (l) => (
        <div className="min-w-0">
          <p className="truncate font-mono text-xs font-medium">{l.reference}</p>
          <p className="truncate text-[11px] text-muted-foreground">{licenseName(l.type)}</p>
        </div>
      ),
    },
    {
      key: "product",
      header: "Product",
      cell: (l) => (
        <Link
          to="/admin/products/$productId"
          params={{ productId: l.productId }}
          className="text-sm transition-colors hover:text-brand"
        >
          {productById(l.productId)?.name ?? l.productId}
        </Link>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      cell: (l) => (
        <Link
          to="/admin/customers/$customerId"
          params={{ customerId: l.customerId }}
          className="text-sm transition-colors hover:text-brand"
        >
          {customerName(l.customerId)}
        </Link>
      ),
    },
    {
      key: "order",
      header: "Order",
      cell: (l) => (
        <Link
          to="/admin/orders/$orderId"
          params={{ orderId: l.orderId }}
          className="font-mono text-xs transition-colors hover:text-brand"
        >
          {l.orderReference}
        </Link>
      ),
    },
    {
      key: "version",
      header: "Version",
      cell: (l) => <span className="font-mono text-xs">v{l.version.replace(/^v/, "")}</span>,
    },
    {
      key: "updates",
      header: "Updates until",
      cell: (l) => <span className="whitespace-nowrap text-xs">{l.updatesUntil}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (l) => <StatusBadge tone={tone[l.status]}>{label[l.status]}</StatusBadge>,
    },
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow="Commerce"
        title="License administration"
        description="Every license issued from a paid order, with entitlement version and update window."
        breadcrumbs={[{ label: "Licenses" }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Issued" value={data?.length ?? 0} icon={KeyRound} />
        <AdminStatCard label="Active" value={counts.active} icon={ShieldCheck} />
        <AdminStatCard label="Updates expired" value={counts.expired} icon={Timer} />
        <AdminStatCard label="Revoked" value={counts.revoked} icon={ShieldX} />
      </div>

      <Panel className="p-4">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search by key, product, customer or order"
          label="Search licenses"
        >
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger className="w-[170px]" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="updates-expired">Updates expired</SelectItem>
              <SelectItem value="revoked">Revoked</SelectItem>
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-[170px]" aria-label="Filter by license type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All license types</SelectItem>
              {licenses.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.name}
                </SelectItem>
              ))}
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
          icon={<KeyRound className="h-5 w-5" />}
          title="No licenses match"
          description="Adjust the search or filters to find an issued license."
          action={
            <Button
              variant="subtle"
              onClick={() => {
                setSearch("");
                setStatus("all");
                setType("all");
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <Panel>
          <PanelHeader
            title="Issued licenses"
            description={`${rows.length} shown`}
            icon={KeyRound}
          />
          <DataTable
            caption="Issued licenses"
            columns={columns}
            rows={rows}
            getRowId={(l) => l.id}
            mobileRow={(l) => (
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-mono text-xs font-medium">{l.reference}</p>
                  <StatusBadge tone={tone[l.status]}>{label[l.status]}</StatusBadge>
                </div>
                <p className="text-sm">{productById(l.productId)?.name ?? l.productId}</p>
                <p className="text-xs text-muted-foreground">
                  {licenseName(l.type)} · {customerName(l.customerId)} · {l.orderReference}
                </p>
                <p className="text-xs text-muted-foreground">
                  v{l.version.replace(/^v/, "")} · updates until {l.updatesUntil}
                </p>
              </div>
            )}
          />
        </Panel>
      )}

      <DemoNote>
        Licenses are derived from the sample order ledger. Key generation, revocation and
        entitlement checks move server-side once the commerce API and auth are connected.
      </DemoNote>
    </>
  );
}
