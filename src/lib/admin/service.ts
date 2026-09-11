/**
 * Admin service boundary.
 *
 * Each function is the local stand-in for one future REST endpoint:
 *
 *   getAdminDashboard    -> GET    /api/admin/dashboard
 *   getAdminProducts     -> GET    /api/admin/products
 *   getAdminProduct      -> GET    /api/admin/products/:id
 *   createProduct        -> POST   /api/admin/products
 *   updateProduct        -> PATCH  /api/admin/products/:id
 *   publishProduct       -> POST   /api/admin/products/:id/publish
 *   archiveProduct       -> POST   /api/admin/products/:id/archive
 *   duplicateProduct     -> POST   /api/admin/products/:id/duplicate
 *   deleteProduct        -> DELETE /api/admin/products/:id
 *   getAdminCategories   -> GET    /api/admin/categories
 *   createCategory       -> POST   /api/admin/categories
 *   updateCategory       -> PATCH  /api/admin/categories/:slug
 *   archiveCategory      -> POST   /api/admin/categories/:slug/archive
 *   getAdminOrders       -> GET    /api/admin/orders
 *   getAdminOrderById    -> GET    /api/admin/orders/:id
 *   getAdminCustomers    -> GET    /api/admin/customers
 *   getAdminCustomerById -> GET    /api/admin/customers/:id
 *   getPayments          -> GET    /api/admin/payments
 *   getCoupons           -> GET    /api/admin/coupons
 *   createCoupon         -> POST   /api/admin/coupons
 *   updateCoupon         -> PATCH  /api/admin/coupons/:id
 *   toggleCoupon         -> POST   /api/admin/coupons/:id/toggle
 *   getReviews           -> GET    /api/admin/reviews
 *   moderateReview       -> PATCH  /api/admin/reviews/:id
 *   getAdminDownloads    -> GET    /api/admin/downloads
 *   getAdminReports      -> GET    /api/admin/reports
 *   getStoreSettings     -> GET    /api/admin/settings
 *   updateStoreSettings  -> PATCH  /api/admin/settings
 *   getAuditLogs         -> GET    /api/admin/audit-logs
 *
 * Nothing here talks to a server. Mutations live in memory plus localStorage
 * for the current browser, so the UI is honest about being a demo workspace.
 */
import { licenses } from "@/lib/catalog/licenses";
import type { LicenseId } from "@/lib/catalog/types";
import {
  adminAuditLogs,
  adminCategories,
  adminCoupons,
  adminCustomers,
  adminDownloads,
  adminOrders,
  adminProducts,
  adminReviews,
  adminTags,
  adminTransactions,
  dailySeries,
  defaultStoreSettings,
  mockAdminUser,
} from "./mock-data";
import type {
  AdminCategory,
  AdminCustomer,
  AdminCustomerDetail,
  AdminDashboard,
  AdminDownloadEvent,
  AdminOrder,
  AdminProduct,
  AdminReports,
  AdminReview,
  AdminTag,
  AdminTransaction,
  AdminUser,
  AuditLog,
  Coupon,
  CouponInput,
  ProductDraftInput,
  ProductStatus,
  ReportRange,
  ReviewStatus,
  StoreSettings,
} from "./types";

const STORAGE_KEY = "devassets.admin.v1";
const LATENCY = 240;

interface PersistedState {
  productPatches?: Record<string, Partial<AdminProduct>> | undefined;
  createdProducts?: AdminProduct[] | undefined;
  deletedProductIds?: string[] | undefined;
  categoryPatches?: Record<string, Partial<AdminCategory>> | undefined;
  createdCategories?: AdminCategory[] | undefined;
  couponPatches?: Record<string, Partial<Coupon>> | undefined;
  createdCoupons?: Coupon[] | undefined;
  deletedCouponIds?: string[] | undefined;
  reviewStatuses?: Record<string, ReviewStatus> | undefined;
  settings?: Partial<StoreSettings> | undefined;
}

let persisted: PersistedState | null = null;

function load(): PersistedState {
  if (persisted) return persisted;
  if (typeof window === "undefined") return (persisted = {});
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    persisted = raw ? (JSON.parse(raw) as PersistedState) : {};
  } catch {
    persisted = {};
  }
  return persisted;
}

function save(next: PersistedState) {
  persisted = next;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — in-memory state still applies for this session */
  }
}

const delay = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), LATENCY));

const today = () => new Date().toISOString().slice(0, 10);

/* -------------------------------------------------------------- identity */

export async function getAdminUser(): Promise<AdminUser> {
  return delay(mockAdminUser);
}

/* -------------------------------------------------------------- products */

function allProducts(): AdminProduct[] {
  const state = load();
  const deleted = new Set(state.deletedProductIds ?? []);
  const patches = state.productPatches ?? {};
  return [...adminProducts, ...(state.createdProducts ?? [])]
    .filter((p) => !deleted.has(p.id))
    .map((p) => ({ ...p, ...patches[p.id] }));
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
  return delay(allProducts().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
}

export async function getAdminProduct(id: string): Promise<AdminProduct | undefined> {
  return delay(allProducts().find((p) => p.id === id || p.slug === id));
}

function patchProduct(id: string, patch: Partial<AdminProduct>) {
  const state = load();
  const created = state.createdProducts ?? [];
  const isCreated = created.some((p) => p.id === id);
  if (isCreated) {
    save({
      ...state,
      createdProducts: created.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });
    return;
  }
  save({
    ...state,
    productPatches: {
      ...state.productPatches,
      [id]: { ...state.productPatches?.[id], ...patch },
    },
  });
}

function fromDraft(input: ProductDraftInput, base?: AdminProduct): AdminProduct {
  const seed = base ?? allProducts()[0]!;
  const record: AdminProduct = {
    ...seed,
    id: base?.id ?? `prd-local-${Date.now()}`,
    slug: input.slug,
    name: input.name,
    tagline: input.tagline,
    summary: input.summary,
    description: input.description.split("\n\n").filter(Boolean),
    categorySlug: input.categorySlug,
    tags: input.tags,
    tech: input.tech,
    price: input.price,
    status: input.status,
    featured: input.featured,
    version: input.version,
    updatedAt: today(),
    createdAt: base?.createdAt ?? today(),
    requirements: input.requirements,
    included: input.included,
    licenseIds: input.licenseIds,
    demoUrl: input.demoUrl,
    docsUrl: input.docsUrl,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
  };
  if (input.salePrice !== undefined) record.salePrice = input.salePrice;
  else delete record.salePrice;

  if (!base) {
    record.sales = 0;
    record.downloads = 0;
    record.revenue = 0;
    record.rating = 0;
    record.reviewCount = 0;
    record.versions = [
      { version: input.version, releasedAt: today(), changelog: input.changelog, current: true },
    ];
    record.files = [];
    record.screenshots = 0;
    record.attention = ["Created locally in the demo workspace — no files uploaded"];
  } else if (input.changelog.trim()) {
    record.versions = base.versions.map((v) =>
      v.version === input.version ? { ...v, changelog: input.changelog } : v,
    );
    if (!base.versions.some((v) => v.version === input.version)) {
      record.versions = [
        { version: input.version, releasedAt: today(), changelog: input.changelog, current: true },
        ...base.versions.map((v) => ({ ...v, current: false })),
      ];
    }
  }
  return record;
}

export async function createProduct(input: ProductDraftInput): Promise<AdminProduct> {
  const record = fromDraft(input);
  const state = load();
  save({ ...state, createdProducts: [record, ...(state.createdProducts ?? [])] });
  return delay(record);
}

export async function updateProduct(id: string, input: ProductDraftInput): Promise<AdminProduct> {
  const base = allProducts().find((p) => p.id === id);
  if (!base) throw new Error("Product not found");
  const record = fromDraft(input, base);
  patchProduct(id, record);
  return delay(record);
}

export async function setProductStatus(id: string, status: ProductStatus): Promise<void> {
  patchProduct(id, { status, updatedAt: today() });
  await delay(null);
}

export async function setProductFeatured(id: string, featured: boolean): Promise<void> {
  patchProduct(id, { featured, updatedAt: today() });
  await delay(null);
}

export async function setProductCategory(id: string, categorySlug: string): Promise<void> {
  patchProduct(id, { categorySlug, updatedAt: today() });
  await delay(null);
}

export async function duplicateProduct(id: string): Promise<AdminProduct> {
  const base = allProducts().find((p) => p.id === id);
  if (!base) throw new Error("Product not found");
  const copy: AdminProduct = {
    ...base,
    id: `prd-local-${Date.now()}`,
    slug: `${base.slug}-copy`,
    name: `${base.name} (copy)`,
    status: "draft",
    featured: false,
    sales: 0,
    downloads: 0,
    revenue: 0,
    reviewCount: 0,
    rating: 0,
    updatedAt: today(),
    createdAt: today(),
    attention: ["Duplicated locally — review content before publishing"],
  };
  const state = load();
  save({ ...state, createdProducts: [copy, ...(state.createdProducts ?? [])] });
  return delay(copy);
}

export async function deleteProduct(id: string): Promise<void> {
  const state = load();
  save({
    ...state,
    deletedProductIds: [...new Set([...(state.deletedProductIds ?? []), id])],
    createdProducts: (state.createdProducts ?? []).filter((p) => p.id !== id),
  });
  await delay(null);
}

export async function bulkProductAction(
  ids: string[],
  action: "publish" | "archive" | "draft" | "feature" | "unfeature" | "delete",
  categorySlug?: string,
): Promise<void> {
  for (const id of ids) {
    if (action === "publish") patchProduct(id, { status: "published", updatedAt: today() });
    else if (action === "archive") patchProduct(id, { status: "archived", updatedAt: today() });
    else if (action === "draft") patchProduct(id, { status: "draft", updatedAt: today() });
    else if (action === "feature") patchProduct(id, { featured: true });
    else if (action === "unfeature") patchProduct(id, { featured: false });
    else if (action === "delete") await deleteProduct(id);
  }
  if (categorySlug) for (const id of ids) patchProduct(id, { categorySlug });
  await delay(null);
}

/* ------------------------------------------------------------ categories */

export async function getAdminCategories(): Promise<AdminCategory[]> {
  const state = load();
  const patches = state.categoryPatches ?? {};
  const products = allProducts();
  return delay(
    [...adminCategories, ...(state.createdCategories ?? [])].map((c) => ({
      ...c,
      productCount: products.filter((p) => p.categorySlug === c.slug).length,
      ...patches[c.slug],
    })),
  );
}

export async function getAdminTags(): Promise<AdminTag[]> {
  return delay(adminTags);
}

export async function createCategory(input: Omit<AdminCategory, "productCount">): Promise<void> {
  const state = load();
  save({
    ...state,
    createdCategories: [{ ...input, productCount: 0 }, ...(state.createdCategories ?? [])],
  });
  await delay(null);
}

export async function updateCategory(slug: string, patch: Partial<AdminCategory>): Promise<void> {
  const state = load();
  save({
    ...state,
    categoryPatches: {
      ...state.categoryPatches,
      [slug]: { ...state.categoryPatches?.[slug], ...patch },
    },
  });
  await delay(null);
}

export async function archiveCategory(slug: string): Promise<void> {
  await updateCategory(slug, { status: "archived" });
}

/* ---------------------------------------------------------------- orders */

export async function getAdminOrders(): Promise<AdminOrder[]> {
  return delay(adminOrders);
}

export async function getAdminOrderById(id: string): Promise<AdminOrder | undefined> {
  return delay(adminOrders.find((o) => o.id === id || o.reference === id));
}

/* ------------------------------------------------------------- customers */

export async function getAdminCustomers(): Promise<AdminCustomer[]> {
  return delay([...adminCustomers].sort((a, b) => b.spend - a.spend));
}

export async function getAdminCustomerById(id: string): Promise<AdminCustomerDetail | undefined> {
  const customer = adminCustomers.find((c) => c.id === id);
  if (!customer) return delay(undefined);
  const orders = adminOrders.filter((o) => o.customerId === id);
  const downloads = adminDownloads.filter((d) => d.customerId === id);
  const paidLines = orders
    .filter((o) => o.status === "paid")
    .flatMap((o) => o.lines.map((l) => ({ order: o, line: l })));
  const detail: AdminCustomerDetail = {
    customer,
    orders,
    licenses: paidLines.map(({ order, line }, i) => ({
      id: `lic-${customer.id}-${i}`,
      productId: line.productId,
      type: line.license,
      status: i % 4 === 3 ? "updates-expired" : "active",
      purchasedAt: order.placedAt.slice(0, 10),
    })),
    downloads,
    wishlist: allProducts()
      .slice(0, 3)
      .map((p) => p.id),
    tickets: orders.slice(0, 2).map((o, i) => ({
      id: `t-${customer.id}-${i}`,
      reference: `SUP-${4100 + i}`,
      subject: i === 0 ? "Question about license upgrade" : `Download issue for ${o.reference}`,
      status: i === 0 ? "resolved" : "awaiting-reply",
      createdAt: o.placedAt,
    })),
    activity: [
      ...orders.slice(0, 4).map((o) => ({
        at: o.placedAt,
        label: `Order ${o.reference}`,
        detail: `${o.lines.length} item${o.lines.length === 1 ? "" : "s"} · ${o.status}`,
      })),
      ...downloads.slice(0, 4).map((d) => ({
        at: d.at,
        label: "Download",
        detail: `${d.fileLabel} · ${d.status}`,
      })),
    ].sort((a, b) => b.at.localeCompare(a.at)),
  };
  return delay(detail);
}

/* --------------------------------------------------------------- payments */

export async function getPayments(): Promise<AdminTransaction[]> {
  return delay([...adminTransactions].sort((a, b) => b.at.localeCompare(a.at)));
}

/* ---------------------------------------------------------------- coupons */

export async function getCoupons(): Promise<Coupon[]> {
  const state = load();
  const deleted = new Set(state.deletedCouponIds ?? []);
  const patches = state.couponPatches ?? {};
  return delay(
    [...(state.createdCoupons ?? []), ...adminCoupons]
      .filter((c) => !deleted.has(c.id))
      .map((c) => ({ ...c, ...patches[c.id] })),
  );
}

export async function createCoupon(input: CouponInput): Promise<Coupon> {
  const coupon: Coupon = { id: `cpn-local-${Date.now()}`, usage: 0, ...input };
  const state = load();
  save({ ...state, createdCoupons: [coupon, ...(state.createdCoupons ?? [])] });
  return delay(coupon);
}

export async function updateCoupon(id: string, patch: Partial<Coupon>): Promise<void> {
  const state = load();
  const created = state.createdCoupons ?? [];
  if (created.some((c) => c.id === id)) {
    save({ ...state, createdCoupons: created.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  } else {
    save({
      ...state,
      couponPatches: { ...state.couponPatches, [id]: { ...state.couponPatches?.[id], ...patch } },
    });
  }
  await delay(null);
}

export async function toggleCoupon(id: string, active: boolean): Promise<void> {
  await updateCoupon(id, { active });
}

export async function deleteCoupon(id: string): Promise<void> {
  const state = load();
  save({
    ...state,
    deletedCouponIds: [...new Set([...(state.deletedCouponIds ?? []), id])],
    createdCoupons: (state.createdCoupons ?? []).filter((c) => c.id !== id),
  });
  await delay(null);
}

/* --------------------------------------------------------------- licenses */

export interface IssuedLicense {
  id: string;
  orderId: string;
  orderReference: string;
  customerId: string;
  productId: string;
  type: LicenseId;
  version: string;
  purchasedAt: string;
  updatesUntil: string;
  status: "active" | "updates-expired" | "revoked";
  reference: string;
}

/** GET /api/admin/licenses — derived from paid order lines. */
export async function getIssuedLicenses(): Promise<IssuedLicense[]> {
  const rows: IssuedLicense[] = [];
  for (const order of adminOrders) {
    if (order.status !== "paid" && order.status !== "refunded") continue;
    order.lines.forEach((line, i) => {
      const purchased = order.placedAt.slice(0, 10);
      const until = new Date(order.placedAt);
      until.setFullYear(until.getFullYear() + 1);
      const expired = until.getTime() < Date.now();
      rows.push({
        id: `${order.id}-${i}`,
        orderId: order.id,
        orderReference: order.reference,
        customerId: order.customerId,
        productId: line.productId,
        type: line.license,
        version: line.version,
        purchasedAt: purchased,
        updatesUntil: until.toISOString().slice(0, 10),
        status: order.status === "refunded" ? "revoked" : expired ? "updates-expired" : "active",
        reference: `DA-${line.license.slice(0, 3).toUpperCase()}-${order.reference.replace("ORD-", "")}-${i + 1}`,
      });
    });
  }
  return delay(rows.sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt)));
}

/* ---------------------------------------------------------------- reviews */

export async function getReviews(): Promise<AdminReview[]> {
  const overrides = load().reviewStatuses ?? {};
  return delay(
    adminReviews
      .map((r) => ({ ...r, status: overrides[r.id] ?? r.status }))
      .sort((a, b) => b.at.localeCompare(a.at)),
  );
}

export async function moderateReview(id: string, status: ReviewStatus): Promise<void> {
  const state = load();
  save({ ...state, reviewStatuses: { ...state.reviewStatuses, [id]: status } });
  await delay(null);
}

/* -------------------------------------------------------------- downloads */

export async function getAdminDownloads(): Promise<AdminDownloadEvent[]> {
  return delay(adminDownloads);
}

/* ---------------------------------------------------------------- reports */

const rangeDays: Record<ReportRange, number> = { "7d": 7, "30d": 30, "90d": 90, year: 365 };

function seriesFor(range: ReportRange) {
  const days = Math.min(rangeDays[range], 90);
  return dailySeries(days);
}

export async function getAdminReports(range: ReportRange = "30d"): Promise<AdminReports> {
  const series = seriesFor(range);
  const revenue = series.reduce((s, p) => s + p.revenue, 0);
  const orders = series.reduce((s, p) => s + p.orders, 0);
  const products = allProducts();

  const topProducts = [...products]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6)
    .map((p) => ({ productId: p.id, sales: p.sales, revenue: p.revenue, downloads: p.downloads }));

  const categoryPerformance = Object.values(
    products.reduce<Record<string, { slug: string; name: string; revenue: number; sales: number }>>(
      (acc, p) => {
        const entry = acc[p.categorySlug] ?? {
          slug: p.categorySlug,
          name: adminCategories.find((c) => c.slug === p.categorySlug)?.name ?? p.categorySlug,
          revenue: 0,
          sales: 0,
        };
        entry.revenue += p.revenue;
        entry.sales += p.sales;
        acc[p.categorySlug] = entry;
        return acc;
      },
      {},
    ),
  ).sort((a, b) => b.revenue - a.revenue);

  const licenseMix = licenses.map((l) => {
    const lines = adminOrders
      .filter((o) => o.status === "paid")
      .flatMap((o) => o.lines)
      .filter((line) => line.license === (l.id as LicenseId));
    return {
      license: l.id,
      name: l.name,
      sales: lines.length,
      revenue: lines.reduce((s, line) => s + line.unitPrice * line.quantity, 0),
    };
  });

  return delay({
    range,
    revenue,
    orders,
    aov: orders ? Math.round(revenue / orders) : 0,
    refunds: adminOrders.filter((o) => o.status === "refunded").length,
    series,
    topProducts,
    categoryPerformance,
    licenseMix,
  });
}

/* -------------------------------------------------------------- dashboard */

export async function getAdminDashboard(range: ReportRange = "30d"): Promise<AdminDashboard> {
  const series = seriesFor(range);
  const products = allProducts();
  const revenue = series.reduce((s, p) => s + p.revenue, 0);
  const orders = series.reduce((s, p) => s + p.orders, 0);
  const reviews = await getReviews();

  const half = Math.max(1, Math.floor(series.length / 2));
  const firstHalf = series.slice(0, half).reduce((s, p) => s + p.revenue, 0) || 1;
  const secondHalf = series.slice(half).reduce((s, p) => s + p.revenue, 0);
  const revenueDelta = Math.round(((secondHalf - firstHalf) / firstHalf) * 100);

  const attention = products.filter((p) => p.attention.length > 0).length;
  const pendingReviews = reviews.filter((r) => r.status === "pending").length;
  const reported = reviews.filter((r) => r.reported).length;
  const failedPayments = adminOrders.filter((o) => o.paymentStatus === "failed").length;
  const blocked = adminDownloads.filter((d) => d.status === "blocked").length;
  const needsReview = adminDownloads.filter((d) => d.status === "review").length;

  const alerts: AdminDashboard["alerts"] = [];
  const thinGallery = products.filter((p) => p.screenshots < 4);
  if (thinGallery.length) {
    alerts.push({
      id: "alert-screens",
      kind: "product",
      title: `${thinGallery.length} products have a thin gallery`,
      detail: "Fewer than four screenshots reduces conversion on the product page.",
      severity: "warning",
    });
  }
  const drafts = products.filter((p) => p.status === "draft");
  if (drafts.length) {
    alerts.push({
      id: "alert-drafts",
      kind: "product",
      title: `${drafts.length} drafts waiting to publish`,
      detail: drafts.map((p) => p.name).join(", "),
      severity: "info",
    });
  }
  if (failedPayments) {
    alerts.push({
      id: "alert-payments",
      kind: "payment",
      title: `${failedPayments} failed payment records`,
      detail: "Sample records only — the payment provider is not connected.",
      severity: "danger",
    });
  }
  if (pendingReviews || reported) {
    alerts.push({
      id: "alert-moderation",
      kind: "moderation",
      title: `${pendingReviews} reviews pending, ${reported} reported`,
      detail: "Open the moderation queue to approve, reject or hide submissions.",
      severity: "warning",
    });
  }
  if (blocked || needsReview) {
    alerts.push({
      id: "alert-downloads",
      kind: "download",
      title: `${blocked} blocked and ${needsReview} flagged downloads`,
      detail: "Entitlement failures and unusual volume in the last 30 days.",
      severity: "warning",
    });
  }

  return delay({
    range,
    kpis: {
      revenue,
      revenueDelta,
      orders,
      ordersDelta: Math.round(revenueDelta * 0.7),
      customers: adminCustomers.length,
      customersDelta: 8,
      products: products.length,
      downloads: products.reduce((s, p) => s + p.downloads, 0),
      downloadsDelta: 12,
    },
    series,
    topProducts: [...products]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((p) => ({
        productId: p.id,
        sales: p.sales,
        revenue: p.revenue,
        downloads: p.downloads,
      })),
    recentOrders: adminOrders.slice(0, 6),
    recentCustomers: [...adminCustomers]
      .sort((a, b) => b.joinedAt.localeCompare(a.joinedAt))
      .slice(0, 5),
    productHealth: {
      published: products.filter((p) => p.status === "published").length,
      draft: drafts.length,
      archived: products.filter((p) => p.status === "archived").length,
      attention,
    },
    downloadActivity: {
      completed: adminDownloads.filter((d) => d.status === "completed").length,
      blocked,
      review: needsReview,
    },
    alerts,
  });
}

/* --------------------------------------------------------------- settings */

export async function getStoreSettings(): Promise<StoreSettings> {
  const stored = load().settings;
  return delay({
    ...defaultStoreSettings,
    ...stored,
    legal: { ...defaultStoreSettings.legal, ...stored?.legal },
    notifications: { ...defaultStoreSettings.notifications, ...stored?.notifications },
    integrations: defaultStoreSettings.integrations,
  });
}

export async function updateStoreSettings(patch: Partial<StoreSettings>): Promise<StoreSettings> {
  const state = load();
  save({ ...state, settings: { ...state.settings, ...patch } });
  return getStoreSettings();
}

/* ------------------------------------------------------------- audit logs */

export async function getAuditLogs(): Promise<AuditLog[]> {
  return delay(adminAuditLogs);
}

/* ---------------------------------------------------------------- helpers */

export const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

export const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value);

export const formatDay = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(iso));

export const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(iso),
  );
