import { queryOptions } from "@tanstack/react-query";

import {
  getAdminCategories,
  getAdminCustomerById,
  getAdminCustomers,
  getAdminDashboard,
  getAdminDownloads,
  getAdminOrderById,
  getAdminOrders,
  getAdminProduct,
  getAdminProducts,
  getAdminReports,
  getAdminTags,
  getAdminUser,
  getAuditLogs,
  getCoupons,
  getIssuedLicenses,
  getPayments,
  getReviews,
  getStoreSettings,
} from "./service";
import type { ReportRange } from "./types";

/** Query keys mirror the future REST paths under /api/admin. */
export const adminKeys = {
  me: ["admin", "me"] as const,
  dashboard: (range: ReportRange) => ["admin", "dashboard", range] as const,
  products: ["admin", "products"] as const,
  product: (id: string) => ["admin", "products", id] as const,
  categories: ["admin", "categories"] as const,
  tags: ["admin", "tags"] as const,
  orders: ["admin", "orders"] as const,
  order: (id: string) => ["admin", "orders", id] as const,
  customers: ["admin", "customers"] as const,
  customer: (id: string) => ["admin", "customers", id] as const,
  payments: ["admin", "payments"] as const,
  coupons: ["admin", "coupons"] as const,
  licenses: ["admin", "licenses"] as const,
  reviews: ["admin", "reviews"] as const,
  downloads: ["admin", "downloads"] as const,
  reports: (range: ReportRange) => ["admin", "reports", range] as const,
  settings: ["admin", "settings"] as const,
  auditLogs: ["admin", "audit-logs"] as const,
};

export const adminUserQuery = () => queryOptions({ queryKey: adminKeys.me, queryFn: getAdminUser });

export const dashboardQuery = (range: ReportRange) =>
  queryOptions({ queryKey: adminKeys.dashboard(range), queryFn: () => getAdminDashboard(range) });

export const adminProductsQuery = () =>
  queryOptions({ queryKey: adminKeys.products, queryFn: getAdminProducts });

export const adminProductQuery = (id: string) =>
  queryOptions({ queryKey: adminKeys.product(id), queryFn: () => getAdminProduct(id) });

export const adminCategoriesQuery = () =>
  queryOptions({ queryKey: adminKeys.categories, queryFn: getAdminCategories });

export const adminTagsQuery = () =>
  queryOptions({ queryKey: adminKeys.tags, queryFn: getAdminTags });

export const adminOrdersQuery = () =>
  queryOptions({ queryKey: adminKeys.orders, queryFn: getAdminOrders });

export const adminOrderQuery = (id: string) =>
  queryOptions({ queryKey: adminKeys.order(id), queryFn: () => getAdminOrderById(id) });

export const adminCustomersQuery = () =>
  queryOptions({ queryKey: adminKeys.customers, queryFn: getAdminCustomers });

export const adminCustomerQuery = (id: string) =>
  queryOptions({ queryKey: adminKeys.customer(id), queryFn: () => getAdminCustomerById(id) });

export const paymentsQuery = () =>
  queryOptions({ queryKey: adminKeys.payments, queryFn: getPayments });

export const couponsQuery = () =>
  queryOptions({ queryKey: adminKeys.coupons, queryFn: getCoupons });

export const issuedLicensesQuery = () =>
  queryOptions({ queryKey: adminKeys.licenses, queryFn: getIssuedLicenses });

export const reviewsQuery = () =>
  queryOptions({ queryKey: adminKeys.reviews, queryFn: getReviews });

export const adminDownloadsQuery = () =>
  queryOptions({ queryKey: adminKeys.downloads, queryFn: getAdminDownloads });

export const reportsQuery = (range: ReportRange) =>
  queryOptions({ queryKey: adminKeys.reports(range), queryFn: () => getAdminReports(range) });

export const storeSettingsQuery = () =>
  queryOptions({ queryKey: adminKeys.settings, queryFn: getStoreSettings });

export const auditLogsQuery = () =>
  queryOptions({ queryKey: adminKeys.auditLogs, queryFn: getAuditLogs });
