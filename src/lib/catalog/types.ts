/**
 * Domain types for the ApnaCodex marketplace.
 *
 * These mirror the shapes the future Node/Express + Prisma REST API will
 * return, so the mock layer can be swapped for `fetch` calls without touching
 * component code.
 */

export type Tint = "indigo" | "violet" | "cyan" | "amber" | "emerald" | "rose" | "slate";

/** Drives the CSS-composed screenshot mockups (no external images). */
export type PreviewKind =
  | "dashboard"
  | "analytics"
  | "hospitality"
  | "restaurant"
  | "education"
  | "ecommerce"
  | "corporate"
  | "landing"
  | "portfolio";

export type LicenseId = "personal" | "commercial" | "agency";

export interface License {
  id: LicenseId;
  name: string;
  blurb: string;
  /** Multiplier applied to the product base price. */
  multiplier: number;
  projects: string;
  highlights: string[];
  popular?: boolean;
}

export interface Category {
  slug: string;
  name: string;
  short: string;
  description: string;
  tint: Tint;
  preview: PreviewKind;
  count: number;
}

export interface Review {
  id: string;
  author: string;
  role: string;
  rating: number;
  date: string;
  title: string;
  body: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  description: string[];
  categorySlug: string;
  price: number;
  salePrice?: number;
  rating: number;
  reviewCount: number;
  sales: number;
  tech: string[];
  tags: string[];
  features: { title: string; body: string }[];
  included: string[];
  requirements: string[];
  pages: number;
  version: string;
  updatedAt: string;
  releasedAt: string;
  tint: Tint;
  preview: PreviewKind;
  screens: { label: string; kind: PreviewKind }[];
  featured: boolean;
  isNew?: boolean;
  bestSeller?: boolean;
  reviews: Review[];
}

export interface CartItem {
  productId: string;
  license: LicenseId;
  quantity: number;
  savedForLater?: boolean;
}

export type SortKey = "featured" | "newest" | "rating" | "price-asc" | "price-desc";

export interface CatalogQuery {
  search?: string | undefined;
  categories?: string[] | undefined;
  tech?: string[] | undefined;
  features?: string[] | undefined;
  minRating?: number | undefined;
  maxPrice?: number | undefined;
  sort?: SortKey | undefined;
  page?: number | undefined;
  perPage?: number | undefined;
}

export interface CatalogResult {
  items: Product[];
  total: number;
  page: number;
  perPage: number;
}
