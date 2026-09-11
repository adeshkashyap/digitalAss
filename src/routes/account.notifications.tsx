import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { BellOff, CheckCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/marketplace/empty-state";
import { Button } from "@/components/ui/button";
import { AccountPageHeader, ErrorState, Panel, RowsSkeleton } from "@/features/account/account-ui";
import { NotificationItem, notificationCategoryLabel } from "@/features/account/notification-item";
import { accountKeys, notificationsQuery } from "@/lib/account/queries";
import {
  dismissNotification,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/account/service";
import type { NotificationCategory } from "@/lib/account/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — DevAssets account" },
      {
        name: "description",
        content: "Product updates, purchase confirmations and download notices.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: NotificationsPage,
});

const filters: ("all" | "unread" | NotificationCategory)[] = [
  "all",
  "unread",
  "product-updates",
  "purchases",
  "downloads",
  "account",
];

function NotificationsPage() {
  const queryClient = useQueryClient();
  const notificationsQ = useQuery(notificationsQuery());
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");

  const invalidate = () =>
    void queryClient.invalidateQueries({ queryKey: accountKeys.notifications });

  const readOne = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: invalidate,
  });
  const readAll = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      invalidate();
      toast.success("All notifications marked as read");
    },
  });
  const dismiss = useMutation({
    mutationFn: dismissNotification,
    onSuccess: () => {
      invalidate();
      toast.success("Notification dismissed");
    },
  });

  const all = notificationsQ.data ?? [];
  const unread = all.filter((n) => !n.read).length;
  const visible = all.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.category === filter;
  });

  return (
    <div className="space-y-6">
      <AccountPageHeader
        breadcrumb="Notifications"
        title="Notifications"
        description="Version releases, purchase confirmations, download activity and account changes."
        actions={
          <Button
            variant="subtle"
            disabled={unread === 0 || readAll.isPending}
            onClick={() => readAll.mutate()}
          >
            <CheckCheck /> Mark all as read
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter notifications">
        {filters.map((key) => {
          const label =
            key === "all"
              ? "All"
              : key === "unread"
                ? `Unread${unread ? ` (${unread})` : ""}`
                : notificationCategoryLabel[key];
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filter === key}
              onClick={() => setFilter(key)}
              className={cn(
                "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                filter === key
                  ? "border-brand/45 bg-brand/12 text-brand"
                  : "border-border bg-surface-2/50 text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      <Panel className="overflow-hidden">
        {notificationsQ.isPending ? (
          <RowsSkeleton rows={4} />
        ) : notificationsQ.isError ? (
          <div className="p-5">
            <ErrorState onRetry={() => void notificationsQ.refetch()} />
          </div>
        ) : visible.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<BellOff className="h-5 w-5" />}
              title={filter === "unread" ? "You're all caught up" : "No notifications here"}
              description={
                filter === "unread"
                  ? "Every notification has been read."
                  : "Update notices and purchase confirmations will show up in this list."
              }
              action={
                filter !== "all" ? (
                  <Button variant="subtle" onClick={() => setFilter("all")}>
                    Show all
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {visible.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={(id) => readOne.mutate(id)}
                onDismiss={(id) => dismiss.mutate(id)}
              />
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
