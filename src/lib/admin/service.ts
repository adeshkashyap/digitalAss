/**
 * Admin service boundary — backed by the DevAssets REST API.
 */
import { api } from "@/lib/api/client";
import type { LicenseId } from "@/lib/catalog/types";
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

export async function getAdminUser(): Promise<AdminUser> {
  return api.get<AdminUser>("/api/admin/me");
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
  return api.get<AdminProduct[]>("/api/admin/products");
}

export async function getAdminProduct(id: string): Promise<AdminProduct | undefined> {
  try {
    return await api.get<AdminProduct>(`/api/admin/products/${id}`);
  } catch {
    return undefined;
  }
}

export async function createProduct(input: ProductDraftInput): Promise<AdminProduct> {
  return api.post<AdminProduct>("/api/admin/products", input);
}

export async function updateProduct(id: string, input: ProductDraftInput): Promise<AdminProduct> {
  return api.patch<AdminProduct>(`/api/admin/products/${id}`, input);
}

export async function setProductStatus(id: string, status: ProductStatus): Promise<void> {
  if (status === "published") await api.post(`/api/admin/products/${id}/publish`);
  else if (status === "archived") await api.post(`/api/admin/products/${id}/archive`);
  else await api.patch(`/api/admin/products/${id}`, { status });
}

export async function setProductFeatured(id: string, featured: boolean): Promise<void> {
  await api.patch(`/api/admin/products/${id}`, { featured });
}

export async function setProductCategory(id: string, categorySlug: string): Promise<void> {
  await api.patch(`/api/admin/products/${id}`, { categorySlug });
}

export async function duplicateProduct(id: string): Promise<AdminProduct> {
  return api.post<AdminProduct>(`/api/admin/products/${id}/duplicate`);
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/api/admin/products/${id}`);
}

export async function bulkProductAction(
  ids: string[],
  action: "publish" | "archive" | "draft" | "feature" | "unfeature" | "delete",
  categorySlug?: string,
): Promise<void> {
  for (const id of ids) {
    if (action === "publish") await api.post(`/api/admin/products/${id}/publish`);
    else if (action === "archive") await api.post(`/api/admin/products/${id}/archive`);
    else if (action === "draft") await api.patch(`/api/admin/products/${id}`, { status: "draft" });
    else if (action === "feature") await api.patch(`/api/admin/products/${id}`, { featured: true });
    else if (action === "unfeature") await api.patch(`/api/admin/products/${id}`, { featured: false });
    else if (action === "delete") await api.delete(`/api/admin/products/${id}`);
    if (categorySlug) await api.patch(`/api/admin/products/${id}`, { categorySlug });
  }
}

export async function getAdminCategories(): Promise<AdminCategory[]> {
  const rows = await api.get<Array<AdminCategory & { productCount?: number }>>("/api/admin/categories");
  const products = await getAdminProducts();
  return rows.map((c) => ({
    ...c,
    productCount: products.filter((p) => p.categorySlug === c.slug).length,
  }));
}

export async function getAdminTags(): Promise<AdminTag[]> {
  return api.get<AdminTag[]>("/api/admin/tags");
}

export async function createCategory(input: Omit<AdminCategory, "productCount">): Promise<void> {
  await api.post("/api/admin/categories", input);
}

export async function updateCategory(slug: string, patch: Partial<AdminCategory>): Promise<void> {
  await api.patch(`/api/admin/categories/${slug}`, patch);
}

export async function archiveCategory(slug: string): Promise<void> {
  await api.post(`/api/admin/categories/${slug}/archive`);
}

export async function getAdminOrders(): Promise<AdminOrder[]> {
  return api.get<AdminOrder[]>("/api/admin/orders");
}

export async function getAdminOrderById(id: string): Promise<AdminOrder | undefined> {
  try {
    return await api.get<AdminOrder>(`/api/admin/orders/${id}`);
  } catch {
    return undefined;
  }
}

export async function getAdminCustomers(): Promise<AdminCustomer[]> {
  return api.get<AdminCustomer[]>("/api/admin/customers");
}

export async function getAdminCustomerById(id: string): Promise<AdminCustomerDetail | undefined> {
  try {
    const data = await api.get<AdminCustomerDetail & { wishlist?: string[] }>(`/api/admin/customers/${id}`);
    return { ...data, wishlist: data.wishlist ?? [] };
  } catch {
    return undefined;
  }
}

export async function getPayments(): Promise<AdminTransaction[]> {
  return api.get<AdminTransaction[]>("/api/admin/payments");
}

export async function getCoupons(): Promise<Coupon[]> {
  return api.get<Coupon[]>("/api/admin/coupons");
}

export async function createCoupon(input: CouponInput): Promise<Coupon> {
  return api.post<Coupon>("/api/admin/coupons", input);
}

export async function updateCoupon(id: string, patch: Partial<Coupon>): Promise<void> {
  await api.patch(`/api/admin/coupons/${id}`, patch);
}

export async function toggleCoupon(id: string, active: boolean): Promise<void> {
  const coupon = (await getCoupons()).find((c) => c.id === id);
  if (coupon && coupon.active !== active) await api.post(`/api/admin/coupons/${id}/toggle`);
  else if (!coupon) await api.patch(`/api/admin/coupons/${id}`, { active });
}

export async function deleteCoupon(id: string): Promise<void> {
  await api.delete(`/api/admin/coupons/${id}`);
}

export async function getIssuedLicenses(): Promise<IssuedLicense[]> {
  return api.get<IssuedLicense[]>("/api/admin/licenses");
}

export async function getReviews(): Promise<AdminReview[]> {
  return api.get<AdminReview[]>("/api/admin/reviews");
}

export async function moderateReview(id: string, status: ReviewStatus): Promise<void> {
  await api.patch(`/api/admin/reviews/${id}`, { status });
}

export async function getAdminDownloads(): Promise<AdminDownloadEvent[]> {
  return api.get<AdminDownloadEvent[]>("/api/admin/downloads");
}

export async function getAdminReports(range: ReportRange = "30d"): Promise<AdminReports> {
  const data = await api.get<Partial<AdminReports>>(`/api/admin/reports?range=${range}`);
  const revenue = data.revenue ?? 0;
  const orders = data.orders ?? 0;
  return {
    range,
    revenue,
    orders,
    aov: orders ? Math.round(revenue / orders) : 0,
    refunds: 0,
    series: data.series ?? [],
    topProducts: data.topProducts ?? [],
    categoryPerformance: data.categoryPerformance ?? [],
    licenseMix: data.licenseMix ?? [],
  };
}

export async function getAdminDashboard(range: ReportRange = "30d"): Promise<AdminDashboard> {
  return api.get<AdminDashboard>(`/api/admin/dashboard?range=${range}`);
}

export async function getStoreSettings(): Promise<StoreSettings> {
  return api.get<StoreSettings>("/api/admin/settings");
}

export async function updateStoreSettings(patch: Partial<StoreSettings>): Promise<StoreSettings> {
  return api.patch<StoreSettings>("/api/admin/settings", patch);
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  const rows = await api.get<Array<{ id: string; at: string; actor: string; action: string; resource: string; detail: string }>>(
    "/api/admin/audit-logs",
  );
  return rows.map((r) => ({
    id: r.id,
    at: r.at,
    actor: r.actor,
    actorRole: "admin",
    action: r.action,
    resource: r.resource,
    status: "success",
    context: r.detail,
  }));
}

export const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

export const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(iso),
  );

export const formatDay = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(iso));
