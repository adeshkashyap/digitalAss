import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Flag, MessageSquare, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/marketplace/empty-state";
import { RatingStars } from "@/components/marketplace/rating-stars";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AdminPageHeader,
  AdminStatCard,
  DemoNote,
  ErrorState,
  FilterBar,
  Panel,
  PanelHeader,
  StatusBadge,
  TableSkeleton,
  type Tone,
} from "@/features/admin/admin-ui";
import { adminCustomers } from "@/lib/admin/mock-data";
import { reviewsQuery } from "@/lib/admin/queries";
import { formatDateTime, moderateReview } from "@/lib/admin/service";
import type { ReviewStatus } from "@/lib/admin/types";
import { productById } from "@/lib/catalog/products";

export const Route = createFileRoute("/admin/reviews")({ component: AdminReviews });

const statusTone: Record<ReviewStatus, Tone> = {
  pending: "warning",
  approved: "success",
  rejected: "neutral",
};

const statusLabel: Record<ReviewStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const author = (id: string) => adminCustomers.find((c) => c.id === id);

function AdminReviews() {
  const queryClient = useQueryClient();
  const { data, isPending, isError, refetch } = useQuery(reviewsQuery());
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<ReviewStatus | "all" | "reported">("pending");

  const moderate = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ReviewStatus }) => moderateReview(id, status),
    onSuccess: async (_d, vars) => {
      await queryClient.invalidateQueries({ queryKey: ["admin"], exact: false });
      toast.success(`Review ${vars.status}`, {
        description: "Moderation is stored in this browser until the API is connected.",
      });
    },
  });

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data ?? [])
      .filter((r) =>
        tab === "all"
          ? true
          : tab === "reported"
            ? r.reported
            : r.status === tab,
      )
      .filter((r) =>
        q
          ? [r.title, r.body, productById(r.productId)?.name, author(r.customerId)?.name]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(q)
          : true,
      );
  }, [data, search, tab]);

  const counts = {
    pending: (data ?? []).filter((r) => r.status === "pending").length,
    approved: (data ?? []).filter((r) => r.status === "approved").length,
    rejected: (data ?? []).filter((r) => r.status === "rejected").length,
    reported: (data ?? []).filter((r) => r.reported).length,
  };

  return (
    <>
      <AdminPageHeader
        eyebrow="Catalog"
        title="Reviews & moderation"
        description="Customer feedback awaiting a decision, plus reported content that needs a second look."
        breadcrumbs={[{ label: "Reviews" }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Pending" value={counts.pending} icon={MessageSquare} />
        <AdminStatCard label="Approved" value={counts.approved} icon={Check} />
        <AdminStatCard label="Rejected" value={counts.rejected} icon={X} />
        <AdminStatCard label="Reported" value={counts.reported} icon={Flag} />
      </div>

      <Panel className="space-y-4 p-4">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="reported">Reported</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
        <FilterBar
          search={search}
          onSearchChange={setSearch}
          placeholder="Search reviews by product, author or text"
          label="Search reviews"
        />
      </Panel>

      {isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : isPending ? (
        <Panel>
          <TableSkeleton rows={6} cols={3} />
        </Panel>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="h-5 w-5" />}
          title="Nothing in this queue"
          description="No reviews match the current tab and search. Try another tab."
          action={
            <Button variant="subtle" onClick={() => setTab("all")}>
              Show all reviews
            </Button>
          }
        />
      ) : (
        <Panel>
          <PanelHeader
            title="Moderation queue"
            description={`${rows.length} shown`}
            icon={MessageSquare}
          />
          <ul className="divide-y divide-border">
            {rows.map((review) => {
              const product = productById(review.productId);
              const customer = author(review.customerId);
              return (
                <li key={review.id} className="space-y-3 px-5 py-5">
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold">{review.title}</p>
                        <StatusBadge tone={statusTone[review.status]}>
                          {statusLabel[review.status]}
                        </StatusBadge>
                        {review.reported && (
                          <StatusBadge tone="danger" icon={Flag}>
                            Reported
                          </StatusBadge>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {customer?.name ?? review.customerId} on{" "}
                        <Link
                          to="/admin/products/$productId"
                          params={{ productId: review.productId }}
                          className="transition-colors hover:text-brand"
                        >
                          {product?.name ?? review.productId}
                        </Link>{" "}
                        · {formatDateTime(review.at)}
                      </p>
                    </div>
                    <RatingStars rating={review.rating} />
                  </div>
                  <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                    {review.body}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="subtle"
                      disabled={review.status === "approved"}
                      onClick={() => moderate.mutate({ id: review.id, status: "approved" })}
                    >
                      <Check /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={review.status === "rejected"}
                      onClick={() => moderate.mutate({ id: review.id, status: "rejected" })}
                    >
                      <X /> Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={review.status === "pending"}
                      onClick={() => moderate.mutate({ id: review.id, status: "pending" })}
                    >
                      Return to queue
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}

      <DemoNote>
        Reviews are seeded from the catalog. Notifying customers about moderation outcomes needs email
        delivery, which is a later phase.
      </DemoNote>
    </>
  );
}
