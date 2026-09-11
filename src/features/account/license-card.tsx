import { Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, Copy, FileDown, RotateCcw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DemoNote, ProductThumb, StatusBadge } from "./account-ui";
import { licenseById, licenseMatrix } from "@/lib/catalog/licenses";
import { formatDate } from "@/lib/catalog/service";
import type { LicenseRecord, LicenseStatus } from "@/lib/account/types";
import type { Product } from "@/lib/catalog/types";

const statusMeta: Record<LicenseStatus, { label: string; tone: "success" | "warning" | "info"; icon: typeof CheckCircle2 }> = {
  active: { label: "Active", tone: "success", icon: CheckCircle2 },
  "updates-expired": { label: "Updates expired", tone: "warning", icon: Clock },
  refunded: { label: "Refunded", tone: "info", icon: RotateCcw },
};

export function copyReference(reference: string) {
  const done = () => toast.success("License reference copied", { description: reference });
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    navigator.clipboard.writeText(reference).then(done, () =>
      toast.error("Couldn't copy", { description: reference }),
    );
  } else {
    done();
  }
}

export function LicenseCard({
  record,
  product,
  onView,
}: {
  record: LicenseRecord;
  product: Product;
  onView: (record: LicenseRecord) => void;
}) {
  const license = licenseById(record.type);
  const status = statusMeta[record.status];

  return (
    <article className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-start sm:p-5">
      <div className="w-full shrink-0 sm:w-44">
        <ProductThumb product={product} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold tracking-tight">
            <Link
              to="/templates/$slug"
              params={{ slug: product.slug }}
              className="transition-colors hover:text-brand"
            >
              {product.name}
            </Link>
          </h3>
          <StatusBadge tone="brand" icon={ShieldCheck}>
            {license.name}
          </StatusBadge>
          <StatusBadge tone={status.tone} icon={status.icon}>
            {status.label}
          </StatusBadge>
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
          {[
            ["Purchased", formatDate(record.purchasedAt)],
            ["Updates until", record.updatesUntil === "Lifetime" ? "Lifetime" : formatDate(record.updatesUntil)],
            ["Seats", `${record.seats} developer${record.seats > 1 ? "s" : ""}`],
            ["Entitled build", `v${record.ownedVersion}`],
          ].map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="eyebrow text-[0.625rem]">{label}</dt>
              <dd className="mt-0.5 truncate text-xs font-medium">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-3 font-mono text-[11px] text-muted-foreground">{record.reference}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" variant="subtle" onClick={() => onView(record)}>
            View license
          </Button>
          <Button size="sm" variant="ghost" onClick={() => copyReference(record.reference)}>
            <Copy /> Copy reference
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              toast.info("License certificate is a demo action", {
                description: "A signed PDF certificate arrives with the backend phase.",
              })
            }
          >
            <FileDown /> Download license
          </Button>
        </div>
      </div>
    </article>
  );
}

export function LicenseDetailsDialog({
  record,
  product,
  open,
  onOpenChange,
}: {
  record: LicenseRecord | null;
  product: Product | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const license = record ? licenseById(record.type) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product?.name ?? "License"} — {license?.name ?? ""} license
          </DialogTitle>
          <DialogDescription>{license?.blurb}</DialogDescription>
        </DialogHeader>

        {record && (
          <div className="space-y-5">
            <dl className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-surface-2/40 p-4">
              {[
                ["License reference", record.reference],
                ["Order reference", record.orderId.replace("o-", "DA-2026-")],
                ["Purchased", formatDate(record.purchasedAt)],
                [
                  "Updates until",
                  record.updatesUntil === "Lifetime" ? "Lifetime" : formatDate(record.updatesUntil),
                ],
                ["Seats", `${record.seats}`],
                ["Projects", license?.projects ?? ""],
              ].map(([label, value]) => (
                <div key={label} className="min-w-0">
                  <dt className="eyebrow text-[0.625rem]">{label}</dt>
                  <dd className="mt-1 truncate text-sm font-medium">{value}</dd>
                </div>
              ))}
            </dl>

            <section>
              <h3 className="text-sm font-semibold">Permitted use</h3>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                {(license?.highlights ?? []).map((h) => (
                  <li key={h} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" aria-hidden />
                    {h}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-sm font-semibold">Restrictions overview</h3>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                {licenseMatrix
                  .filter((row) => row.values[record.type] === "No")
                  .map((row) => (
                    <li key={row.feature}>{row.feature}: not permitted</li>
                  ))}
                <li>Source code may not be resold or redistributed as a template.</li>
              </ul>
            </section>

            <DemoNote>
              This is product UI copy, not legal advice. The binding terms are the license document
              bundled with each purchase, which will be issued from the licensing service in a
              later phase.
            </DemoNote>

            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="subtle">
                <Link to="/account/support">Ask a license question</Link>
              </Button>
              <Button size="sm" variant="ghost" onClick={() => copyReference(record.reference)}>
                <Copy /> Copy reference
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
