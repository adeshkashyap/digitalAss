import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, ScrollText, XCircle } from "lucide-react";
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
import { auditLogsQuery } from "@/lib/admin/queries";
import { formatDateTime } from "@/lib/admin/service";
import type { AuditLog } from "@/lib/admin/types";

export const Route = createFileRoute("/admin/audit-logs")({ component: AdminAuditLogs });

function AdminAuditLogs() {
  const { data, isPending, isError, refetch } = useQuery(auditLogsQuery());
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | AuditLog["status"]>("all");

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? [])
      .filter((l) => (status === "all" ? true : l.status === status))
      .filter((l) =>
        q ? [l.actor, l.action, l.resource, l.context].join(" ").toLowerCase().includes(q) : true,
      );
  }, [data, search, status]);

  const failed = (data ?? []).filter((l) => l.status === "failed").length;

  const columns: Column<AuditLog>[] = [
    {
      key: "at",
      header: "When",
      cell: (l) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {formatDateTime(l.at)}
        </span>
      ),
    },
    {
      key: "actor",
      header: "Operator",
      cell: (l) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{l.actor}</p>
          <p className="truncate text-[11px] capitalize text-muted-foreground">{l.actorRole}</p>
        </div>
      ),
    },
    { key: "action", header: "Action", cell: (l) => <span className="text-sm">{l.action}</span> },
    {
      key: "resource",
      header: "Resource",
      cell: (l) => <span className="font-mono text-xs">{l.resource}</span>,
    },
    {
      key: "context",
      header: "Context",
      cell: (l) => (
        <span className="block max-w-[320px] text-xs text-muted-foreground">{l.context}</span>
      ),
    },
    {
      key: "status",
      header: "Result",
      cell: (l) => (
        <StatusBadge
          tone={l.status === "success" ? "success" : "danger"}
          icon={l.status === "success" ? CheckCircle2 : XCircle}
        >
          {l.status === "success" ? "Success" : "Failed"}
        </StatusBadge>
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader
        eyebrow="Configuration"
        title="Audit logs"
        description="A record of operator actions across the catalog, orders, customers and settings."
        breadcrumbs={[{ label: "Audit logs" }]}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <AdminStatCard label="Entries" value={data?.length ?? 0} icon={ScrollText} />
        <AdminStatCard
          label="Successful"
          value={(data?.length ?? 0) - failed}
          icon={CheckCircle2}
        />
        <AdminStatCard label="Failed" value={failed} icon={XCircle} />
      </div>

      <Panel className="p-4">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search by operator, action or resource"
          label="Search audit logs"
        >
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger className="w-[160px]" aria-label="Filter by result">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All results</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
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
          icon={<ScrollText className="h-5 w-5" />}
          title="No entries match"
          description="Adjust the search term or result filter."
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
            title="Activity trail"
            description={`${rows.length} shown`}
            icon={ScrollText}
          />
          <DataTable
            caption="Audit logs"
            columns={columns}
            rows={rows}
            getRowId={(l) => l.id}
            mobileRow={(l) => (
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium">{l.action}</p>
                  <StatusBadge tone={l.status === "success" ? "success" : "danger"}>
                    {l.status === "success" ? "Success" : "Failed"}
                  </StatusBadge>
                </div>
                <p className="font-mono text-xs text-muted-foreground">{l.resource}</p>
                <p className="text-xs text-muted-foreground">{l.context}</p>
                <p className="text-[11px] text-muted-foreground">
                  {l.actor} · {l.actorRole} · {formatDateTime(l.at)}
                </p>
              </div>
            )}
          />
        </Panel>
      )}

      <DemoNote>
        Entries are sample records held in this browser. A tamper-resistant, append-only audit trail
        arrives with the backend and authentication phase.
      </DemoNote>
    </>
  );
}
