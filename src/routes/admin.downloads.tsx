import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CloudDownload, ShieldAlert, ShieldQuestion } from "lucide-react";
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
  type Column,
  type Tone,
} from "@/features/admin/admin-ui";
import { useAdminCustomerMap } from "@/lib/admin/use-admin-customers";
import { adminDownloadsQuery } from "@/lib/admin/queries";
import { formatDateTime } from "@/lib/admin/service";
import type { AdminDownloadEvent } from "@/lib/admin/types";
import { licenses } from "@/lib/catalog/licenses";
import { useProductsByIds } from "@/lib/catalog/use-products-by-ids";

export const Route = createFileRoute("/admin/downloads")({ component: AdminDownloads });

const tone: Record<AdminDownloadEvent["status"], Tone> = {
  completed: "success",
  blocked: "danger",
  review: "warning",
};

const label: Record<AdminDownloadEvent["status"], string> = {
  completed: "Completed",
  blocked: "Blocked",
  review: "Needs review",
};

const licenseName = (id: string) => licenses.find((l) => l.id === id)?.name ?? id;

function AdminDownloads() {
  const { data, isPending, isError, refetch } = useQuery(adminDownloadsQuery());
  const customerMap = useAdminCustomerMap();
  const productIds = useMemo(
    () => [...new Set((data ?? []).map((d) => d.productId))],
    [data],
  );
  const { productsById } = useProductsByIds(productIds);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | AdminDownloadEvent["status"]>("all");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? [])
      .filter((d) => (status === "all" ? true : d.status === status))
      .filter((d) =>
        q
          ? [
              d.fileLabel,
              productsById.get(d.productId)?.name,
              customerMap.get(d.customerId)?.name ?? d.customerId,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(q)
          : true,
      );
  }, [data, search, status, productsById, customerMap]);

  const counts = {
    completed: (data ?? []).filter((d) => d.status === "completed").length,
    blocked: (data ?? []).filter((d) => d.status === "blocked").length,
    review: (data ?? []).filter((d) => d.status === "review").length,
  };

  const columns: Column<AdminDownloadEvent>[] = [
    {
      key: "at",
      header: "When",
      cell: (d) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {formatDateTime(d.at)}
        </span>
      ),
    },
    {
      key: "file",
      header: "File",
      cell: (d) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{d.fileLabel}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {d.fileType} · {d.size} · v{d.version.replace(/^v/, "")}
          </p>
        </div>
      ),
    },
    {
      key: "product",
      header: "Product",
      cell: (d) => (
        <Link
          to="/admin/products/$productId"
          params={{ productId: d.productId }}
          className="text-sm transition-colors hover:text-brand"
        >
          {productsById.get(d.productId)?.name ?? d.productId}
        </Link>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      cell: (d) => (
        <Link
          to="/admin/customers/$customerId"
          params={{ customerId: d.customerId }}
          className="text-sm transition-colors hover:text-brand"
        >
          {customerMap.get(d.customerId)?.name ?? d.customerId}
        </Link>
      ),
    },
    {
      key: "license",
      header: "License",
      cell: (d) => <span className="text-xs">{licenseName(d.license)}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (d) => (
        <div className="space-y-1">
          <StatusBadge tone={tone[d.status]}>{label[d.status]}</StatusBadge>
          {d.note && <p className="max-w-[220px] text-[11px] text-muted-foreground">{d.note}</p>}
        </div>
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow="Delivery"
        title="Download monitoring"
        description="Delivery activity across licensed files, including blocked attempts that need a look."
        breadcrumbs={[{ label: "Downloads" }]}
      />

      <NotConnectedBanner title="File delivery is not connected">
        These events are sample records. Real monitoring needs private storage with signed URLs and
        per-license download quotas, which arrive with the backend phase.
      </NotConnectedBanner>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Events" value={data?.length ?? 0} icon={CloudDownload} />
        <AdminStatCard label="Completed" value={counts.completed} icon={CloudDownload} />
        <AdminStatCard label="Needs review" value={counts.review} icon={ShieldQuestion} />
        <AdminStatCard label="Blocked" value={counts.blocked} icon={ShieldAlert} />
      </div>

      <Panel className="p-4">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search by file, product or customer"
          label="Search download events"
        >
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger className="w-[170px]" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="review">Needs review</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
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
          icon={<CloudDownload className="h-5 w-5" />}
          title="No delivery events match"
          description="Try a different search term or status filter."
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
            title="Delivery activity"
            description={`${rows.length} shown`}
            icon={CloudDownload}
          />
          <DataTable
            caption="Download events"
            columns={columns}
            rows={rows}
            getRowId={(d) => d.id}
            mobileRow={(d) => (
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium">{d.fileLabel}</p>
                  <StatusBadge tone={tone[d.status]}>{label[d.status]}</StatusBadge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {productsById.get(d.productId)?.name ?? d.productId} ·{" "}
                  {customerMap.get(d.customerId)?.name ?? d.customerId}
                </p>
                <p className="text-xs text-muted-foreground">
                  {d.fileType} · {d.size} · {licenseName(d.license)} · {formatDateTime(d.at)}
                </p>
                {d.note && <p className="text-[11px] text-muted-foreground">{d.note}</p>}
              </div>
            )}
          />
        </Panel>
      )}
    </>
  );
}
