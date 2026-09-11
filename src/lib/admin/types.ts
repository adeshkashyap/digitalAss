/**
 * Admin (back-office) domain types.
 *
 * These mirror the payloads the future Node/Express + Prisma REST API will
 * return from `/api/admin/*`, so the local mock repository can be replaced by
 * `fetch` calls without touching component code.
 */
import type { LicenseId, PreviewKind, Tint } from "@/lib/catalog/types";

/* ------------------------------------------------------------------ roles */

export type AdminRole =
  | "super-admin"
  | "admin"
  | "support"
  | "content-manager"
  | "finance"
  | "analyst";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}

export type PermissionLevel = "none" | "read" | "write";

export interface PermissionRow {
  resource: string;
  levels: Record<AdminRole, PermissionLevel>;
}

/* --------------------------------------------------------------- products */

export type ProductStatus = "published" | "draft" | "archived";

export type ProductFileGroup = "source" | "docs" | "assets";

export interface ProductFileRow {
  id: string;
  group: ProductFileGroup;
  name: string;
  type: string;
  size: string;
  /** Mock only: no artifact is stored until secure storage is connected. */
  status: "ready" | "pending" | "missing";
}

export interface ProductVersion {
  version: string;
  releasedAt: string;
  changelog: string;
  current: boolean;
}

export interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  description: string[];
  categorySlug: string;
  tags: string[];
  tech: string[];
  price: number;
  salePrice?: number | undefined;
  currency: "USD";
  status: ProductStatus;
  featured: boolean;
  version: string;
  updatedAt: string;
  createdAt: string;
  sales: number;
  downloads: number;
  revenue: number;
  rating: number;
  reviewCount: number;
  screenshots: number;
  demoUrl: string;
  docsUrl: string;
  requirements: string[];
  included: string[];
  licenseIds: LicenseId[];
  seoTitle: string;
  seoDescription: string;
  preview: PreviewKind;
  tint: Tint;
  versions: ProductVersion[];
  files: ProductFileRow[];
  /** Operational warnings surfaced in the dashboard action queue. */
  attention: string[];
}

export interface ProductDraftInput {
  name: string;
  slug: string;
  tagline: string;
  summary: string;
  description: string;
  categorySlug: string;
  tags: string[];
  tech: string[];
  price: number;
  salePrice?: number | undefined;
  status: ProductStatus;
  featured: boolean;
  version: string;
  changelog: string;
  requirements: string[];
  included: string[];
  licenseIds: LicenseId[];
  demoUrl: string;
  docsUrl: string;
  seoTitle: string;
  seoDescription: string;
}

/* ------------------------------------------------------------- categories */

export interface AdminCategory {
  slug: string;
  name: string;
  description: string;
  productCount: number;
  status: "active" | "archived";
  seoTitle: string;
  seoDescription: string;
}

export interface AdminTag {
  name: string;
  usage: number;
}

/* --------------------------------------------------------------- commerce */

export type PaymentStatus = "succeeded" | "pending" | "failed" | "refunded";
export type AdminOrderStatus = "paid" | "pending" | "failed" | "refunded" | "cancelled";

export interface AdminOrderLine {
  productId: string;
  license: LicenseId;
  version: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderEvent {
  at: string;
  label: string;
  detail: string;
}

export interface AdminOrder {
  id: string;
  reference: string;
  customerId: string;
  placedAt: string;
  status: AdminOrderStatus;
  paymentStatus: PaymentStatus;
  lines: AdminOrderLine[];
  subtotal: number;
  discount: number;
  couponCode?: string | undefined;
  tax: number;
  total: number;
  currency: "USD";
  /** Non-sensitive label only. No payment instrument data exists in this phase. */
  paymentLabel: string;
  invoiceNumber: string;
  events: OrderEvent[];
}

export interface AdminTransaction {
  id: string;
  orderId: string;
  customerId: string;
  amount: number;
  currency: "USD";
  provider: "stripe-placeholder" | "manual-record";
  status: PaymentStatus;
  at: string;
  reference: string;
}

/* -------------------------------------------------------------- customers */

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  company?: string | undefined;
  country: string;
  joinedAt: string;
  status: "active" | "suspended";
  orders: number;
  spend: number;
  downloads: number;
  lastActiveAt: string;
}

export interface CustomerActivity {
  at: string;
  label: string;
  detail: string;
}

export interface AdminCustomerDetail {
  customer: AdminCustomer;
  orders: AdminOrder[];
  licenses: {
    id: string;
    productId: string;
    type: LicenseId;
    status: "active" | "updates-expired";
    purchasedAt: string;
  }[];
  downloads: AdminDownloadEvent[];
  wishlist: string[];
  tickets: { id: string; reference: string; subject: string; status: string; createdAt: string }[];
  activity: CustomerActivity[];
}

/* ---------------------------------------------------------------- coupons */

export interface Coupon {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  startsAt: string;
  endsAt: string;
  usage: number;
  usageLimit: number;
  minOrder: number;
  scope: string;
  active: boolean;
}

export interface CouponInput {
  code: string;
  type: "percent" | "fixed";
  value: number;
  startsAt: string;
  endsAt: string;
  usageLimit: number;
  minOrder: number;
  scope: string;
  active: boolean;
}

/* ---------------------------------------------------------------- reviews */

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface AdminReview {
  id: string;
  productId: string;
  customerId: string;
  rating: number;
  title: string;
  body: string;
  at: string;
  status: ReviewStatus;
  reported: boolean;
}

/* -------------------------------------------------------------- downloads */

export interface AdminDownloadEvent {
  id: string;
  at: string;
  productId: string;
  customerId: string;
  fileLabel: string;
  fileType: string;
  size: string;
  version: string;
  license: LicenseId;
  status: "completed" | "blocked" | "review";
  note?: string | undefined;
}

/* ---------------------------------------------------------------- reports */

export interface SeriesPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface AdminReports {
  range: ReportRange;
  revenue: number;
  orders: number;
  aov: number;
  refunds: number;
  series: SeriesPoint[];
  topProducts: { productId: string; sales: number; revenue: number; downloads: number }[];
  categoryPerformance: { slug: string; name: string; revenue: number; sales: number }[];
  licenseMix: { license: LicenseId; name: string; sales: number; revenue: number }[];
}

export type ReportRange = "7d" | "30d" | "90d" | "year";

/* -------------------------------------------------------------- dashboard */

export interface AdminDashboard {
  range: ReportRange;
  kpis: {
    revenue: number;
    revenueDelta: number;
    orders: number;
    ordersDelta: number;
    customers: number;
    customersDelta: number;
    products: number;
    downloads: number;
    downloadsDelta: number;
  };
  series: SeriesPoint[];
  topProducts: { productId: string; sales: number; revenue: number; downloads: number }[];
  recentOrders: AdminOrder[];
  recentCustomers: AdminCustomer[];
  productHealth: { published: number; draft: number; archived: number; attention: number };
  downloadActivity: { completed: number; blocked: number; review: number };
  alerts: {
    id: string;
    kind: "product" | "payment" | "moderation" | "download";
    title: string;
    detail: string;
    severity: "info" | "warning" | "danger";
  }[];
}

/* --------------------------------------------------------------- settings */

export interface StoreSettings {
  storeName: string;
  tagline: string;
  supportEmail: string;
  description: string;
  currency: "USD";
  taxNote: string;
  brandAccent: "indigo" | "violet" | "cyan";
  legal: { termsUrl: string; privacyUrl: string; refundUrl: string; licenseUrl: string };
  notifications: {
    orderReceipts: boolean;
    productUpdates: boolean;
    moderationAlerts: boolean;
    weeklyDigest: boolean;
  };
  integrations: {
    id: "stripe" | "storage" | "email" | "analytics" | "webhooks";
    name: string;
    purpose: string;
    connected: boolean;
    note: string;
  }[];
}

/* ------------------------------------------------------------- audit logs */

export interface AuditLog {
  id: string;
  at: string;
  actor: string;
  actorRole: AdminRole;
  action: string;
  resource: string;
  status: "success" | "failed";
  context: string;
}
