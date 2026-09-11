import { z } from "zod";

import { MAX_PRICE, defaultFilters, type CatalogFilters } from "@/features/catalog/filter-panel";
import type { SortKey } from "@/lib/catalog/types";

const sortKeys = ["featured", "newest", "rating", "price-asc", "price-desc"] as const;

export const catalogSearchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  tech: z.string().optional(),
  features: z.string().optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  maxPrice: z.coerce.number().min(0).max(MAX_PRICE).optional(),
  sort: z.enum(sortKeys).optional(),
  page: z.coerce.number().min(1).optional(),
});

export type CatalogSearch = z.infer<typeof catalogSearchSchema>;

function splitCsv(value?: string) {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function searchToCatalogState(search: CatalogSearch) {
  const filters: CatalogFilters = {
    search: search.q ?? defaultFilters.search,
    categories: splitCsv(search.category),
    tech: splitCsv(search.tech),
    features: splitCsv(search.features),
    minRating: search.rating ?? defaultFilters.minRating,
    maxPrice: search.maxPrice ?? defaultFilters.maxPrice,
  };
  const sort: SortKey = search.sort ?? "featured";
  const page = search.page ?? 1;
  return { filters, sort, page };
}

export function catalogStateToSearch(
  filters: CatalogFilters,
  sort: SortKey,
  page: number,
): CatalogSearch {
  const search: CatalogSearch = {};
  if (filters.search.trim()) search.q = filters.search.trim();
  if (filters.categories.length) search.category = filters.categories.join(",");
  if (filters.tech.length) search.tech = filters.tech.join(",");
  if (filters.features.length) search.features = filters.features.join(",");
  if (filters.minRating > 0) search.rating = filters.minRating;
  if (filters.maxPrice < MAX_PRICE) search.maxPrice = filters.maxPrice;
  if (sort !== "featured") search.sort = sort;
  if (page > 1) search.page = page;
  return search;
}
