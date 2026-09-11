import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, Download, History, Search, ShieldCheck, XCircle } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/marketplace/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AccountPageHeader,
  DemoNote,
  ErrorState,
  Panel,
  PanelHeader,
  RowsSkeleton,
  StatusBadge,
} from "@/features/account/account-ui";
import { DownloadRow } from "@/features/account/download-row";
import { useDownloadAction } from "@/features/account/use-download";
import { downloadHistoryQuery, downloadsQuery } from "@/lib/account/queries";
import { formatDateTime } from "@/lib/account/service";
import type { DownloadEvent } from "@/lib/account/types";
import { useProductsByIds } from "@/lib/catalog/use-products-by-ids";

export const Route = createFileRoute("/account/downloads")({
  head: () => ({
    meta: [
      { title: "Downloads — DevAssets account" },
      {
        name: "description",
        content: "Source builds, documentation and release notes for every template you own.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DownloadsPage,
});

const historyStatus: Record<
  DownloadEvent["status"],
  { label: string; tone: "success" | "warning" | "danger"; icon: typeof CheckCircle2 }
> = {
  completed: { label: "Completed", tone: "success", icon: CheckCircle2 },
  expired: { label: "Link expired", tone: "warning", icon: Clock },
  failed: { label: "Failed", tone: "danger", icon: XCircle },
};

function DownloadsPage() {
  const downloadsQ = useQuery(downloadsQuery());
  const historyQ = useQuery(downloadHistoryQuery());
  const { download, pendingFileId } = useDownloadAction();
  const [search, setSearch] = useState("");
  const productIds = useMemo(() => {
    const ids = new Set<string>();
    for (const item of downloadsQ.data ?? []) ids.add(item.productId);
    for (const event of historyQ.data ?? []) ids.add(event.productId);
    return [...ids];
  }, [downloadsQ.data, historyQ.data]);
  const { productsById } = useProductsByIds(productIds);

  const items = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (downloadsQ.data ?? []).filter((item) => {
      if (!term) return true;
      const product = productsById.get(item.productId);
      return `${product?.name ?? ""} ${product?.tech.join(" ") ?? ""}`.toLowerCase().includes(term);
    });
  }, [downloadsQ.data, search, productsById]);

  const readyCount = items.reduce((n, i) => n + i.files.length, 0);
  const updates = items.filter((i) => i.updateAvailable);

  return (
    <div className="space-y-6">
      <AccountPageHeader
        breadcrumb="Downloads"
        title="Downloads"
        description="Every file attached to your purchases: source archives, documentation, release notes and design sources where included."
        actions={
          <Button asChild variant="subtle">
            <Link to="/account/purchases">View purchases</Link>
          </Button>
        }
      />

      {/* Ready to download */}
      <section className="relative overflow-hidden rounded-lg border border-border bg-card p-5 sm:p-6">
        <div className="hero-glow pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="eyebrow">Ready to download</p>
            <p className="mt-2 font-display text-xl font-semibold tracking-tight">
              {downloadsQ.isPending
                ? "Checking your library…"
                : `${readyCount} files across ${items.length} templates`}
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {updates.length > 0
                ? `${updates.length} template${updates.length > 1 ? "s have" : " has"} a newer build than your last download.`
                : "You already have the latest build of everything you own."}
            </p>
          </div>
          <div className="relative w-full shrink-0 lg:w-72">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search downloads"
              aria-label="Search downloads"
              className="pl-9"
            />
          </div>
        </div>
      </section>

      <DemoNote>
        Downloads run in demo mode: the action is recorded and confirmed, but no archive is
        transferred yet because file storage is not connected. In production every file is served
        through a short-lived, authorized link tied to your license.
      </DemoNote>

      {/* Download library */}
      <Panel className="overflow-hidden">
        <PanelHeader
          title="Your download library"
          description="Product, version, file type, size, license and last download."
          icon={Download}
        />
        {downloadsQ.isPending ? (
          <RowsSkeleton rows={4} />
        ) : downloadsQ.isError ? (
          <div className="p-5">
            <ErrorState onRetry={() => void downloadsQ.refetch()} />
          </div>
        ) : items.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<Download className="h-5 w-5" />}
              title={search ? "No downloads match that search" : "Nothing to download yet"}
              description={
                search
                  ? "Try a different template name or technology."
                  : "Buy a template and its source files appear here immediately."
              }
              action={
                search ? (
                  <Button variant="subtle" onClick={() => setSearch("")}>
                    Clear search
                  </Button>
                ) : (
                  <Button asChild variant="brand">
                    <Link to="/templates">Browse marketplace</Link>
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {items.map((item) => {
              const product = productsById.get(item.productId);
              if (!product) return null;
              return (
                <DownloadRow
                  key={item.purchaseId}
                  item={item}
                  product={product}
                  pendingFileId={pendingFileId}
                  onDownload={(i, file) => download(i.purchaseId, i.productId, file)}
                />
              );
            })}
          </div>
        )}
      </Panel>

      {/* History */}
      <Panel className="overflow-hidden">
        <PanelHeader
          title="Download history"
          description="Recent download activity on this account."
          icon={History}
        />
        {historyQ.isPending ? (
          <RowsSkeleton rows={3} />
        ) : (historyQ.data ?? []).length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            No downloads recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  {["Date", "Template", "Version", "File", "Status"].map((h) => (
                    <th key={h} scope="col" className="eyebrow px-5 py-2.5 text-[0.625rem]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(historyQ.data ?? []).map((event) => {
                  const product = productsById.get(event.productId);
                  const meta = historyStatus[event.status];
                  return (
                    <tr key={event.id} className="transition-colors hover:bg-surface-2/30">
                      <td className="whitespace-nowrap px-5 py-3 text-xs text-muted-foreground">
                        {formatDateTime(event.at)}
                      </td>
                      <td className="px-5 py-3">
                        {product ? (
                          <Link
                            to="/templates/$slug"
                            params={{ slug: product.slug }}
                            className="text-xs font-medium transition-colors hover:text-brand"
                          >
                            {product.name}
                          </Link>
                        ) : (
                          <span className="text-xs">Template</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 font-mono text-xs">
                        v{event.version}
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">{event.fileLabel}</td>
                      <td className="px-5 py-3">
                        <StatusBadge tone={meta.tone} icon={meta.icon}>
                          {meta.label}
                        </StatusBadge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel className="p-5">
        <div className="flex gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-border bg-surface-2 text-muted-foreground">
            <ShieldCheck className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <h2 className="text-sm font-semibold">How downloads will be secured</h2>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Production downloads will be authorized per request against your license, issued as
              expiring links, and logged in this history with the device and version. Nothing is
              stored or served publicly.
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
