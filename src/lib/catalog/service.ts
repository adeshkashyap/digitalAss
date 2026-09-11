/**
 * Catalog service boundary — backed by the DevAssets REST API.
 */
import { ApiError, api } from "@/lib/api/client";
import type { CatalogQuery, CatalogResult, Category, Product } from "./types";

export const effectivePrice = (p: Product) => p.salePrice ?? p.price;

export const discountPercent = (p: Product) =>
  p.salePrice ? Math.round((1 - p.salePrice / p.price) * 100) : 0;

function toParams(query: CatalogQuery = {}) {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.categories?.length) params.set("categories", query.categories.join(","));
  if (query.tech?.length) params.set("tech", query.tech.join(","));
  if (query.features?.length) params.set("features", query.features.join(","));
  if (query.minRating) params.set("minRating", String(query.minRating));
  if (typeof query.maxPrice === "number") params.set("maxPrice", String(query.maxPrice));
  if (query.sort) params.set("sort", query.sort);
  if (query.page) params.set("page", String(query.page));
  if (query.perPage) params.set("perPage", String(query.perPage));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function queryProducts(query: CatalogQuery = {}): Promise<CatalogResult> {
  return api.get<CatalogResult>(`/api/products${toParams(query)}`);
}

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  return api.get<Product[]>(`/api/products/featured?limit=${limit}`);
}

export async function getNewProducts(limit = 3): Promise<Product[]> {
  return api.get<Product[]>(`/api/products/new?limit=${limit}`);
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  try {
    return await api.get<Product>(`/api/products/${slug}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined;
    throw error;
  }
}

export async function getProductById(id: string): Promise<Product | undefined> {
  try {
    return await api.get<Product>(`/api/products/id/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined;
    throw error;
  }
}

export async function getCategories(): Promise<Category[]> {
  return api.get<Category[]>("/api/categories");
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  try {
    return await api.get<Category>(`/api/categories/${slug}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined;
    throw error;
  }
}

export async function getProductsByCategory(slug: string): Promise<Product[]> {
  return api.get<Product[]>(`/api/categories/${slug}/products`);
}

export async function getRelatedProducts(product: Product, limit = 3): Promise<Product[]> {
  return api.get<Product[]>(`/api/products/${product.slug}/related?limit=${limit}`);
}

export interface CatalogFacets {
  tech: string[];
  tags: string[];
  maxPrice: number;
}

export async function getCatalogFacets(): Promise<CatalogFacets> {
  return api.get<CatalogFacets>("/api/products/facets");
}

export async function validateCoupon(code: string, subtotal: number) {
  return api.post<{
    code: string;
    label: string;
    percent: number;
    discount: number;
    message: string;
  }>("/api/coupons/validate", { code, subtotal });
}

export async function categoryCounts(): Promise<Record<string, number>> {
  const cats = await getCategories();
  return Object.fromEntries(cats.map((c) => [c.slug, c.count]));
}

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(iso));

export const formatCompact = (value: number) =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
