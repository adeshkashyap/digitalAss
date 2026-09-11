import { Link } from "@tanstack/react-router";
import {
  ChevronDown,
  Download,
  FileArchive,
  FileCode2,
  FileText,
  Loader2,
  Palette,
  RefreshCw,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ProductThumb, StatusBadge } from "./account-ui";
import { licenseById } from "@/lib/catalog/licenses";
import { relativeTime } from "@/lib/account/service";
import type { DownloadFile, DownloadItem } from "@/lib/account/types";
import type { Product } from "@/lib/catalog/types";
import { cn } from "@/lib/utils";

const fileIcon: Record<DownloadFile["kind"], LucideIcon> = {
  source: FileCode2,
  docs: FileText,
  changelog: FileArchive,
  assets: Palette,
};

export function DownloadRow({
  item,
  product,
  onDownload,
  pendingFileId,
}: {
  item: DownloadItem;
  product: Product;
  onDownload: (item: DownloadItem, file: DownloadFile) => void;
  pendingFileId: string | null;
}) {
  const [open, setOpen] = useState(false);
  const source = item.files.find((f) => f.kind === "source") ?? item.files[0]!;

  return (
    <article className="px-4 py-4 sm:px-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="w-full shrink-0 sm:w-40">
          <ProductThumb product={product} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-sm font-semibold tracking-tight">
              <Link
                to="/templates/$slug"
                params={{ slug: product.slug }}
                className="transition-colors hover:text-brand"
              >
                {product.name}
              </Link>
            </h3>
            {item.updateAvailable ? (
              <StatusBadge tone="brand" icon={RefreshCw}>
                v{item.latestVersion} available
              </StatusBadge>
            ) : (
              <StatusBadge tone="neutral">Latest build</StatusBadge>
            )}
          </div>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-4">
            {[
              ["Version", `v${item.latestVersion}`],
              ["File", `${source.fileType} · ${source.size}`],
              ["License", licenseById(item.license).name],
              [
                "Last downloaded",
                item.lastDownloadedAt ? relativeTime(item.lastDownloadedAt) : "Never",
              ],
            ].map(([label, value]) => (
              <div key={label} className="min-w-0">
                <dt className="eyebrow text-[0.625rem]">{label}</dt>
                <dd className="mt-0.5 truncate font-medium">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="brand"
            disabled={pendingFileId === source.id}
            onClick={() => onDownload(item, source)}
          >
            {pendingFileId === source.id ? <Loader2 className="animate-spin" /> : <Download />}
            {pendingFileId === source.id ? "Preparing" : "Download"}
          </Button>
          <Button
            size="sm"
            variant="subtle"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {item.files.length} files
            <ChevronDown className={cn("transition-transform", open && "rotate-180")} />
          </Button>
        </div>
      </div>

      {open && (
        <ul className="mt-4 divide-y divide-border overflow-hidden rounded-md border border-border bg-surface-2/40">
          {item.files.map((file) => {
            const Icon = fileIcon[file.kind];
            const pending = pendingFileId === file.id;
            return (
              <li key={file.id} className="flex flex-wrap items-center gap-3 px-3 py-2.5">
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{file.label}</p>
                  <p className="truncate font-mono text-[11px] text-muted-foreground">
                    {file.fileName}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {file.fileType} · {file.size}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={pending}
                  onClick={() => onDownload(item, file)}
                >
                  {pending ? <Loader2 className="animate-spin" /> : <Download />}
                  {pending ? "Preparing" : "Get"}
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}
