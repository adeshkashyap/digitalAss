import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ScrollText, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/marketplace/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AccountPageHeader,
  CardsSkeleton,
  DemoNote,
  ErrorState,
} from "@/features/account/account-ui";
import { LicenseCard, LicenseDetailsDialog } from "@/features/account/license-card";
import { licensesQuery } from "@/lib/account/queries";
import type { LicenseRecord } from "@/lib/account/types";
import { licenses } from "@/lib/catalog/licenses";
import { useProductsByIds } from "@/lib/catalog/use-products-by-ids";

export const Route = createFileRoute("/account/licenses")({
  head: () => ({
    meta: [
      { title: "Licenses — ApnaCodex account" },
      {
        name: "description",
        content: "License type, status, seats and update entitlement for every template you own.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LicensesPage,
});

function LicensesPage() {
  const licensesQ = useQuery(licensesQuery());
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [selected, setSelected] = useState<LicenseRecord | null>(null);
  const productIds = useMemo(
    () => (licensesQ.data ?? []).map((r) => r.productId),
    [licensesQ.data],
  );
  const { productsById } = useProductsByIds(productIds);

  const records = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (licensesQ.data ?? []).filter((r) => {
      if (type !== "all" && r.type !== type) return false;
      if (!term) return true;
      const name = productsById.get(r.productId)?.name ?? "";
      return `${name} ${r.reference}`.toLowerCase().includes(term);
    });
  }, [licensesQ.data, search, type, productsById]);

  return (
    <div className="space-y-6">
      <AccountPageHeader
        breadcrumb="Licenses"
        title="Licenses"
        description="What each purchase entitles you to: license type, seats, update window and reference."
        actions={
          <Button asChild variant="subtle">
            <Link to="/pricing">Compare license tiers</Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search licenses by template or reference"
            aria-label="Search licenses"
            className="pl-9"
          />
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="sm:w-56" aria-label="Filter by license type">
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
      </div>

      {licensesQ.isPending ? (
        <CardsSkeleton count={3} />
      ) : licensesQ.isError ? (
        <ErrorState onRetry={() => void licensesQ.refetch()} />
      ) : records.length === 0 ? (
        <EmptyState
          icon={<ScrollText className="h-5 w-5" />}
          title="No licenses to show"
          description="Licenses are issued with each purchase and appear here immediately."
          action={
            <Button asChild variant="brand">
              <Link to="/templates">Browse marketplace</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {records.map((record) => {
            const product = productsById.get(record.productId);
            if (!product) return null;
            return (
              <LicenseCard key={record.id} record={record} product={product} onView={setSelected} />
            );
          })}
        </div>
      )}

      <DemoNote>
        License references shown here are sample identifiers. Issued certificates and the binding
        license document arrive with the licensing service in a later phase.
      </DemoNote>

      <LicenseDetailsDialog
        record={selected}
        product={selected ? productsById.get(selected.productId) : undefined}
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      />
    </div>
  );
}
