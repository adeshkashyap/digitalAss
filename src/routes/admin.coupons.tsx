import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BadgePercent, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/marketplace/empty-state";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  AdminPageHeader,
  AdminStatCard,
  ConfirmDialog,
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
import { couponsQuery } from "@/lib/admin/queries";
import { createCoupon, deleteCoupon, formatMoney, toggleCoupon } from "@/lib/admin/service";
import type { Coupon, CouponInput } from "@/lib/admin/types";

export const Route = createFileRoute("/admin/coupons")({ component: AdminCoupons });

const emptyDraft: CouponInput = {
  code: "",
  type: "percent",
  value: 10,
  startsAt: new Date().toISOString().slice(0, 10),
  endsAt: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10),
  usageLimit: 100,
  minOrder: 0,
  scope: "Entire catalog",
  active: true,
};

function AdminCoupons() {
  const queryClient = useQueryClient();
  const { data, isPending, isError, refetch } = useQuery(couponsQuery());
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<CouponInput>(emptyDraft);
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Coupon | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin"], exact: false });

  const toggle = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => toggleCoupon(id, active),
    onSuccess: async (_d, vars) => {
      await invalidate();
      toast.success(vars.active ? "Coupon enabled" : "Coupon paused");
    },
  });

  const rows = (data ?? []).filter((c) =>
    search.trim() ? `${c.code} ${c.scope}`.toLowerCase().includes(search.trim().toLowerCase()) : true,
  );

  const discount = (c: Coupon) => (c.type === "percent" ? `${c.value}%` : formatMoney(c.value));

  const columns: Column<Coupon>[] = [
    {
      key: "code",
      header: "Code",
      cell: (c) => (
        <div className="min-w-0">
          <p className="truncate font-mono text-sm font-medium">{c.code}</p>
          <p className="truncate text-[11px] text-muted-foreground">{c.scope}</p>
        </div>
      ),
    },
    {
      key: "discount",
      header: "Discount",
      cell: (c) => <span className="font-mono text-sm tabular-nums">{discount(c)}</span>,
    },
    {
      key: "window",
      header: "Active window",
      cell: (c) => (
        <span className="whitespace-nowrap text-xs text-muted-foreground">
          {c.startsAt} → {c.endsAt}
        </span>
      ),
    },
    {
      key: "usage",
      header: "Usage",
      cell: (c) => (
        <span className="font-mono text-sm tabular-nums">
          {c.usage}/{c.usageLimit}
        </span>
      ),
    },
    {
      key: "min",
      header: "Min order",
      cell: (c) => (
        <span className="font-mono text-sm tabular-nums">
          {c.minOrder ? formatMoney(c.minOrder) : "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (c) => (
        <div className="flex items-center gap-2">
          <StatusBadge tone={c.active ? "success" : "neutral"}>
            {c.active ? "Active" : "Paused"}
          </StatusBadge>
          <Switch
            checked={c.active}
            onCheckedChange={(next) => toggle.mutate({ id: c.id, active: next })}
            aria-label={`${c.active ? "Pause" : "Enable"} coupon ${c.code}`}
          />
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      headerClassName: "sr-only",
      className: "text-right",
      cell: (c) => (
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Delete coupon ${c.code}`}
          onClick={() => setPendingDelete(c)}
        >
          <Trash2 />
        </Button>
      ),
    },
  ];

  const activeCount = (data ?? []).filter((c) => c.active).length;
  const redemptions = (data ?? []).reduce((s, c) => s + c.usage, 0);

  return (
    <>
      <AdminPageHeader
        eyebrow="Commerce"
        title="Coupons & discounts"
        description="Promotional codes, redemption limits and eligibility windows for the storefront checkout."
        breadcrumbs={[{ label: "Coupons" }]}
        actions={
          <Button
            size="sm"
            onClick={() => {
              setDraft(emptyDraft);
              setError("");
              setCreating(true);
            }}
          >
            <Plus /> New coupon
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Coupons" value={data?.length ?? 0} icon={BadgePercent} />
        <AdminStatCard label="Active" value={activeCount} icon={BadgePercent} />
        <AdminStatCard label="Redemptions" value={redemptions} icon={BadgePercent} />
        <AdminStatCard
          label="Paused"
          value={(data?.length ?? 0) - activeCount}
          icon={BadgePercent}
        />
      </div>

      <Panel className="p-4">
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search by code or scope"
          label="Search coupons"
        />
      </Panel>

      {isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : isPending ? (
        <Panel>
          <TableSkeleton rows={6} cols={5} />
        </Panel>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<BadgePercent className="h-5 w-5" />}
          title="No coupons yet"
          description="Create a promotional code to run a campaign on the storefront."
          action={
            <Button
              onClick={() => {
                setDraft(emptyDraft);
                setCreating(true);
              }}
            >
              <Plus /> New coupon
            </Button>
          }
        />
      ) : (
        <Panel>
          <PanelHeader
            title="Promotional codes"
            description={`${rows.length} shown`}
            icon={BadgePercent}
          />
          <DataTable
            caption="Coupons"
            columns={columns}
            rows={rows}
            getRowId={(c) => c.id}
            mobileRow={(c) => (
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-mono text-sm font-medium">{c.code}</p>
                  <StatusBadge tone={c.active ? "success" : "neutral"}>
                    {c.active ? "Active" : "Paused"}
                  </StatusBadge>
                </div>
                <p className="text-xs text-muted-foreground">{c.scope}</p>
                <p className="text-xs text-muted-foreground">
                  {discount(c)} off · {c.usage}/{c.usageLimit} used · {c.startsAt} → {c.endsAt}
                </p>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={c.active}
                    onCheckedChange={(next) => toggle.mutate({ id: c.id, active: next })}
                    aria-label={`${c.active ? "Pause" : "Enable"} coupon ${c.code}`}
                  />
                  <Button variant="ghost" size="sm" onClick={() => setPendingDelete(c)}>
                    <Trash2 /> Delete
                  </Button>
                </div>
              </div>
            )}
          />
        </Panel>
      )}

      <DemoNote>
        Coupons are stored in this browser. Applying them at checkout becomes a server-side validation
        once the commerce API is connected.
      </DemoNote>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New coupon</DialogTitle>
            <DialogDescription>
              Set the discount, eligibility window and redemption limit.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={draft.code}
                onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })}
                placeholder="LAUNCH25"
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="type">Discount type</Label>
              <Select
                value={draft.type}
                onValueChange={(v) => setDraft({ ...draft, type: v as "percent" | "fixed" })}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed amount (USD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                type="number"
                min={1}
                value={draft.value}
                onChange={(e) => setDraft({ ...draft, value: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="startsAt">Starts</Label>
              <Input
                id="startsAt"
                type="date"
                value={draft.startsAt}
                onChange={(e) => setDraft({ ...draft, startsAt: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endsAt">Ends</Label>
              <Input
                id="endsAt"
                type="date"
                value={draft.endsAt}
                onChange={(e) => setDraft({ ...draft, endsAt: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="limit">Redemption limit</Label>
              <Input
                id="limit"
                type="number"
                min={1}
                value={draft.usageLimit}
                onChange={(e) => setDraft({ ...draft, usageLimit: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="minOrder">Minimum order (USD)</Label>
              <Input
                id="minOrder"
                type="number"
                min={0}
                value={draft.minOrder}
                onChange={(e) => setDraft({ ...draft, minOrder: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="scope">Scope</Label>
              <Input
                id="scope"
                value={draft.scope}
                onChange={(e) => setDraft({ ...draft, scope: e.target.value })}
                placeholder="Entire catalog"
              />
            </div>
            {error && (
              <p role="alert" className="text-xs text-destructive sm:col-span-2">
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (draft.code.trim().length < 4) {
                  setError("Use a code of at least 4 characters.");
                  return;
                }
                if (draft.value <= 0 || (draft.type === "percent" && draft.value > 90)) {
                  setError("Enter a discount above 0, and at most 90 for percentages.");
                  return;
                }
                if (draft.endsAt <= draft.startsAt) {
                  setError("The end date must be after the start date.");
                  return;
                }
                await createCoupon({ ...draft, code: draft.code.trim() });
                await invalidate();
                setCreating(false);
                toast.success(`${draft.code.trim()} created locally`);
              }}
            >
              Create coupon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={`Delete ${pendingDelete?.code ?? "coupon"}?`}
        description="The coupon is removed from this local workspace. Historical order records keep their recorded discount."
        confirmLabel="Delete coupon"
        destructive
        onConfirm={async () => {
          if (!pendingDelete) return;
          await deleteCoupon(pendingDelete.id);
          await invalidate();
          toast.success(`${pendingDelete.code} deleted`);
          setPendingDelete(null);
        }}
      />
    </>
  );
}
