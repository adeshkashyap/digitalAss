/**
 * Customer account service boundary — backed by the DevAssets REST API.
 */
import { api } from "@/lib/api/client";
import type {
  AccountNotification,
  CustomerUser,
  DownloadEvent,
  DownloadFile,
  DownloadItem,
  LicenseRecord,
  Order,
  Purchase,
  SupportTicket,
  TicketCategory,
} from "./types";

export async function getCurrentUser(): Promise<CustomerUser> {
  return api.get<CustomerUser>("/api/me");
}

export interface ProfileInput {
  name: string;
  email: string;
  company?: string | undefined;
  location?: string | undefined;
  timezone?: string | undefined;
  language?: string | undefined;
}

export async function updateProfile(input: ProfileInput): Promise<CustomerUser> {
  return api.patch<CustomerUser>("/api/me/profile", input);
}

export async function updatePreferences(
  preferences: Partial<CustomerUser["preferences"]>,
): Promise<CustomerUser> {
  return api.patch<CustomerUser>("/api/me/preferences", preferences);
}

export async function getPurchases(): Promise<Purchase[]> {
  return api.get<Purchase[]>("/api/me/purchases");
}

export const purchaseHasUpdate = (purchase: Purchase, latestVersion?: string) =>
  !!latestVersion && latestVersion !== purchase.ownedVersion;

export async function getDownloads(): Promise<DownloadItem[]> {
  return api.get<DownloadItem[]>("/api/me/downloads");
}

export async function getDownloadHistory(): Promise<DownloadEvent[]> {
  return api.get<DownloadEvent[]>("/api/me/downloads/history");
}

export async function recordDownload(args: {
  purchaseId: string;
  productId: string;
  file: DownloadFile;
}): Promise<DownloadEvent> {
  return api.post<DownloadEvent>(`/api/me/downloads/${args.purchaseId}`, {
    fileLabel: args.file.label,
    version: args.file.version,
  });
}

export async function getOrders(): Promise<Order[]> {
  return api.get<Order[]>("/api/me/orders");
}

export async function getOrder(orderId: string): Promise<Order | undefined> {
  try {
    return await api.get<Order>(`/api/me/orders/${orderId}`);
  } catch {
    return undefined;
  }
}

export async function getLicenses(): Promise<LicenseRecord[]> {
  return api.get<LicenseRecord[]>("/api/me/licenses");
}

export async function getNotifications(): Promise<AccountNotification[]> {
  return api.get<AccountNotification[]>("/api/me/notifications");
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.patch(`/api/me/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.post("/api/me/notifications/read-all");
}

export async function dismissNotification(id: string): Promise<void> {
  await api.delete(`/api/me/notifications/${id}`);
}

export async function getSupportTickets(): Promise<SupportTicket[]> {
  return api.get<SupportTicket[]>("/api/support/tickets");
}

export async function createSupportTicket(input: {
  category: TicketCategory;
  subject: string;
  message: string;
  productId?: string;
  orderId?: string;
}): Promise<SupportTicket> {
  return api.post<SupportTicket>("/api/support/tickets", input);
}

export const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(iso),
  );

const RECENT_KEY = "devassets.recently-viewed";

export function getRecentlyViewedSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

export function trackRecentlyViewed(slug: string) {
  if (typeof window === "undefined") return;
  const slugs = [slug, ...getRecentlyViewedSlugs().filter((s) => s !== slug)].slice(0, 8);
  window.localStorage.setItem(RECENT_KEY, JSON.stringify(slugs));
}

export const relativeTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (Math.abs(minutes) < 60) return rtf.format(-minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(-hours, "hour");
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return rtf.format(-days, "day");
  return rtf.format(-Math.round(days / 30), "month");
};
