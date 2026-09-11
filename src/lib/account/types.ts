/**
 * Customer account domain types.
 *
 * These mirror the shapes the future Node/Express + Prisma REST API will
 * return from `/api/me/*`, so the local mock repository can be swapped for
 * `fetch` calls without touching component code.
 */
import type { LicenseId } from "@/lib/catalog/types";

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  company?: string;
  location?: string;
  timezone: string;
  language: string;
  memberSince: string;
  avatarUrl?: string;
  preferences: {
    productUpdates: boolean;
    orderReceipts: boolean;
    downloadAlerts: boolean;
    marketing: boolean;
  };
}

export type OrderStatus = "paid" | "pending" | "failed" | "refunded" | "cancelled";

export interface OrderLine {
  productId: string;
  license: LicenseId;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  reference: string;
  placedAt: string;
  status: OrderStatus;
  lines: OrderLine[];
  subtotal: number;
  discount: number;
  discountCode?: string;
  tax: number;
  total: number;
  /** Placeholder only — no real payment instrument is stored in this phase. */
  paymentMethodLabel: string;
  invoiceNumber: string;
}

export interface Purchase {
  id: string;
  productId: string;
  orderId: string;
  license: LicenseId;
  purchasedAt: string;
  /** Version the customer downloaded most recently. */
  ownedVersion: string;
  pricePaid: number;
  lastDownloadedAt?: string;
  archived?: boolean;
}

export type DownloadFileKind = "source" | "docs" | "changelog" | "assets";

export interface DownloadFile {
  id: string;
  kind: DownloadFileKind;
  label: string;
  fileName: string;
  fileType: string;
  size: string;
  version: string;
  objectPath?: string;
}

export interface DownloadItem {
  purchaseId: string;
  productId: string;
  license: LicenseId;
  latestVersion: string;
  ownedVersion: string;
  updateAvailable: boolean;
  lastDownloadedAt?: string;
  files: DownloadFile[];
}

export interface DownloadEvent {
  id: string;
  at: string;
  productId: string;
  version: string;
  fileLabel: string;
  status: "completed" | "expired" | "failed";
  downloadUrl?: string;
}

export type LicenseStatus = "active" | "updates-expired" | "refunded";

export interface LicenseRecord {
  id: string;
  reference: string;
  productId: string;
  orderId: string;
  type: LicenseId;
  status: LicenseStatus;
  purchasedAt: string;
  updatesUntil: string;
  seats: number;
  ownedVersion: string;
}

export type NotificationCategory = "product-updates" | "purchases" | "downloads" | "account";

export interface AccountNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  at: string;
  read: boolean;
  productId?: string;
  orderId?: string;
}

export type TicketCategory = "order" | "download" | "license" | "billing" | "technical" | "other";

export interface SupportTicket {
  id: string;
  reference: string;
  category: TicketCategory;
  subject: string;
  message: string;
  productId?: string;
  orderId?: string;
  status: "open" | "awaiting-reply" | "resolved";
  createdAt: string;
}

export interface AccountStats {
  purchases: number;
  downloads: number;
  activeLicenses: number;
  wishlist: number;
}
