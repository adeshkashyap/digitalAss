/**
 * Catalog service boundary.
 *
 * Today these functions resolve against the local mock data. When the
 * Node/Express + Prisma API lands, replace the bodies with `fetch` calls —
 * signatures and return types stay identical, so no component changes.
 */
import { categories, categoryBySlug } from "./categories";
import { productBySlug, products } from "./products";
import type { CatalogQuery, CatalogResult, Category, Product, SortKey } from "./types";

export const effectivePrice = (p: Product) => p.salePrice ?? p.price;

export const discountPercent = (p: Product) =>
  p.salePrice ? Math.round((1 - p.salePrice / p.price) * 100) : 0;

const sorters: Record<SortKey, (a: Product, b: Product) => number> = {
  featured: (a, b) =>
    Number(b.featured) - Number(a.featured) || b.sales - a.sales || b.rating - a.rating,
  newest: (a, b) => b.releasedAt.localeCompare(a.releasedAt),
  rating: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
  "price-asc": (a, b) => effectivePrice(a) - effectivePrice(b),
  "price-desc": (a, b) => effectivePrice(b) - effectivePrice(a),
};

export function queryProducts(query: CatalogQuery = {}): CatalogResult {
  const {
    search = "",
    categories: cats = [],
    tech = [],
    features = [],
    minRating = 0,
    maxPrice,
    sort = "featured",
    page = 1,
    perPage = 9,
  } = query;

  const term = search.trim().toLowerCase();

  const filtered = products.filter((p) => {
    if (cats.length && !cats.includes(p.categorySlug)) return false;
    if (tech.length && !tech.every((t) => p.tech.includes(t))) return false;
    if (features.length && !features.every((f) => p.tags.includes(f))) return false;
    if (p.rating < minRating) return false;
    if (typeof maxPrice === "number" && effectivePrice(p) > maxPrice) return false;
    if (!term) return true;
    return [p.name, p.tagline, p.summary, ...p.tags, ...p.tech]
      .join(" ")
      .toLowerCase()
      .includes(term);
  });

  const sorted = [...filtered].sort(sorters[sort]);
  const start = (page - 1) * perPage;

  return {
    items: sorted.slice(0, start + perPage),
    total: sorted.length,
    page,
    perPage,
  };
}

export const getFeaturedProducts = (limit = 6) =>
  [...products].sort(sorters.featured).slice(0, limit);

export const getNewProducts = (limit = 3) => [...products].sort(sorters.newest).slice(0, limit);

export const getProduct = (slug: string): Product | undefined => productBySlug(slug);

export const getCategories = (): Category[] => categories;

export const getCategory = (slug: string): Category | undefined => categoryBySlug(slug);

export const getProductsByCategory = (slug: string) =>
  [...products].filter((p) => p.categorySlug === slug).sort(sorters.featured);

export const getRelatedProducts = (product: Product, limit = 3) =>
  [...products]
    .filter((p) => p.id !== product.id)
    .sort((a, b) => {
      const score = (p: Product) =>
        (p.categorySlug === product.categorySlug ? 10 : 0) +
        p.tech.filter((t) => product.tech.includes(t)).length;
      return score(b) - score(a) || b.rating - a.rating;
    })
    .slice(0, limit);

export const categoryCounts = () =>
  Object.fromEntries(
    categories.map((c) => [c.slug, products.filter((p) => p.categorySlug === c.slug).length]),
  ) as Record<string, number>;

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
