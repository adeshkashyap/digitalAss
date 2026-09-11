import { queryOptions } from "@tanstack/react-query";

import {
  getCurrentUser,
  getDownloadHistory,
  getDownloads,
  getLicenses,
  getNotifications,
  getOrders,
  getPurchases,
  getSupportTickets,
} from "./service";

/** Query keys mirror the future REST paths under /api/me. */
export const accountKeys = {
  me: ["me"] as const,
  purchases: ["me", "purchases"] as const,
  downloads: ["me", "downloads"] as const,
  downloadHistory: ["me", "downloads", "history"] as const,
  orders: ["me", "orders"] as const,
  licenses: ["me", "licenses"] as const,
  notifications: ["me", "notifications"] as const,
  tickets: ["support", "tickets"] as const,
};

export const userQuery = () =>
  queryOptions({ queryKey: accountKeys.me, queryFn: getCurrentUser });

export const purchasesQuery = () =>
  queryOptions({ queryKey: accountKeys.purchases, queryFn: getPurchases });

export const downloadsQuery = () =>
  queryOptions({ queryKey: accountKeys.downloads, queryFn: getDownloads });

export const downloadHistoryQuery = () =>
  queryOptions({ queryKey: accountKeys.downloadHistory, queryFn: getDownloadHistory });

export const ordersQuery = () =>
  queryOptions({ queryKey: accountKeys.orders, queryFn: getOrders });

export const licensesQuery = () =>
  queryOptions({ queryKey: accountKeys.licenses, queryFn: getLicenses });

export const notificationsQuery = () =>
  queryOptions({ queryKey: accountKeys.notifications, queryFn: getNotifications });

export const ticketsQuery = () =>
  queryOptions({ queryKey: accountKeys.tickets, queryFn: getSupportTickets });
