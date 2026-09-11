import { Link } from "@tanstack/react-router";
import { Bell, Check, Download, Package, ShieldCheck, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { relativeTime } from "@/lib/account/service";
import type { AccountNotification, NotificationCategory } from "@/lib/account/types";
import { productById } from "@/lib/catalog/products";
import { cn } from "@/lib/utils";

export const notificationCategoryLabel: Record<NotificationCategory, string> = {
  "product-updates": "Product updates",
  purchases: "Purchases",
  downloads: "Downloads",
  account: "Account",
};

const categoryIcon: Record<NotificationCategory, LucideIcon> = {
  "product-updates": Bell,
  purchases: Package,
  downloads: Download,
  account: ShieldCheck,
};

export function NotificationItem({
  notification,
  onRead,
  onDismiss,
}: {
  notification: AccountNotification;
  onRead: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const Icon = categoryIcon[notification.category];
  const product = notification.productId ? productById(notification.productId) : undefined;

  return (
    <article
      className={cn(
        "flex gap-4 px-4 py-4 transition-colors sm:px-5",
        notification.read ? "bg-transparent" : "bg-brand/[0.045]",
      )}
    >
      <span
        className={cn(
          "mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-md border",
          notification.read
            ? "border-border bg-surface-2 text-muted-foreground"
            : "border-brand/40 bg-brand/12 text-brand",
        )}
      >
        <Icon className="h-4 w-4" aria-hidden />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold tracking-tight">{notification.title}</h3>
          {!notification.read && (
            <span className="inline-flex items-center gap-1 rounded-md border border-brand/40 bg-brand/12 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand">
              Unread
            </span>
          )}
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{notification.body}</p>
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
          <span>{notificationCategoryLabel[notification.category]}</span>
          <span aria-hidden>·</span>
          <time dateTime={notification.at}>{relativeTime(notification.at)}</time>
          {product && (
            <Link
              to="/templates/$slug"
              params={{ slug: product.slug }}
              className="font-medium text-foreground transition-colors hover:text-brand"
            >
              View {product.name}
            </Link>
          )}
          {notification.category === "downloads" && (
            <Link
              to="/account/downloads"
              className="font-medium text-foreground transition-colors hover:text-brand"
            >
              Go to downloads
            </Link>
          )}
          {notification.orderId && (
            <Link
              to="/account/orders"
              className="font-medium text-foreground transition-colors hover:text-brand"
            >
              View orders
            </Link>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-1.5">
        {!notification.read && (
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={`Mark "${notification.title}" as read`}
            onClick={() => onRead(notification.id)}
          >
            <Check />
          </Button>
        )}
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label={`Dismiss "${notification.title}"`}
          onClick={() => onDismiss(notification.id)}
        >
          <X />
        </Button>
      </div>
    </article>
  );
}
